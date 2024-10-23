import Tts from 'react-native-tts';
import AsyncStorage from '@react-native-community/async-storage';
import {AsyncStorageKey} from '../constants/TextConstants';
import {usersService} from '../services/UsersService';
import {httpUtils} from './HttpUtils';
import moment from 'moment';
import Sound from 'react-native-sound';

async function isAvailableInTTsLanguages(language) {
  const voices = await Tts.voices();
  const availableVoices = voices.filter(
    (v) => !v.networkConnectionRequired && !v.notInstalled,
  );
  const selectedVoice = availableVoices.find(
    (v) => language === v.language.split('-')[0],
  );
  return Boolean(selectedVoice);
}

export async function speak(text, langCode, callback) {
  const speakFunc = callback || Tts.speak;

  if (!langCode) {
    const language = await AsyncStorage.getItem(AsyncStorageKey.language);
    if (language) {
      langCode = language.split('-')[0];
    } else {
      langCode = global.deviceLocale.split('-')[0];
    }
  }

  if (langCode === 'en') {
    Tts.setDefaultLanguage('en');
    speakFunc(text);
  } else {
    if (await isAvailableInTTsLanguages(langCode)) {
      const res = await usersService.translate(langCode, text);
      const [check, translatedText] = res.split('|');
      if (check === 'OK') {
        Tts.setDefaultLanguage(langCode);
        speakFunc(translatedText);
      } else {
        Tts.setDefaultLanguage('en');
        speakFunc(translatedText);
      }
    } else {
      const params = await httpUtils.getTranslationAPIParams(text);
      const url =
        httpUtils.translate() +
        '&user=' +
        params.email +
        '&lang=' +
        langCode +
        '&device_id=' +
        params.device_id +
        '&input_text=' +
        params.input_text +
        '&user_id=' +
        params.user_id +
        '&fair_use_count=' +
        params.fair_use_count +
        '&info=tts_mp3&output_file=' +
        `${params.user_id}.${moment().format('YYYYMMDDHHmmss')}.mp3`;
      const sound = new Sound(url, '', (err) => {
        if (err) {
          console.log(err);
          Tts.setDefaultLanguage('en');
          speakFunc(text);
        } else {
          sound.play((err2) => {
            if (err2) {
              console.log(err2);
            }
            sound.release();
            if (callback) {
              callback();
            }
          });
        }
      });
    }
  }
}
