import AsyncStorage from '@react-native-community/async-storage';
import {AsyncStorageKey} from '../constants/TextConstants';
import {Mode} from '../constants/TextConstants';

export const BASE_URL = 'https://api.schoolbright.co/api';

class HttpUtils {
  getSchools() {
    return BASE_URL + '/school';
  }

  signin() {
    return BASE_URL + '/login';
  }

  signup() {
    return BASE_URL + '?cmd=OG-signup';
  }

  barcodeRead() {
    return BASE_URL + '?cmd=OG-read';
  }

  validate() {
    return BASE_URL + '?cmd=OG-validate';
  }

  logout() {
    return BASE_URL + '?cmd=OG-exit';
  }

  forgot() {
    return BASE_URL + '?cmd=OG-forgot';
  }
  
  appLogger() {
    return BASE_URL + 'app_logger.php?app=OutlookGuide&cmd=';
  }

  notify() {
    return BASE_URL + '?cmd=OG-notify';
  }

  translate() {
    return BASE_URL + '?cmd=OG-translate';
  }

  read() {
    return BASE_URL + 'guide';
  }

  subscription() {
    return BASE_URL + '?cmd=OG-subscribed&version=1.9';
  }

  addAuth(url, params) {
    url +=
      '&user=' +
      params.email +
      '&user_id=' +
      params.user_id +
      '&lang=' +
      params.lang +
      '&device_id=' +
      params.device_id;
    switch (params.mode) {
      case Mode.PassMode:
        return url + '&pass=' + params.password;
      case Mode.GoogleLogin:
        return url + '&google_id=' + params.google_id;
      case Mode.FacebookLogin:
        return url + '&facebook_id=' + params.facebook_id;
      case Mode.FingerPrint:
        return url + '&user_id=' + params.user_id;
      default:
        return url;
    }
  }

  getHeaders() {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
  }

  async getHTTPParams() {
    const [emailAddress, password, mode, user_id] = await Promise.all([
      AsyncStorage.getItem(AsyncStorageKey.email),
      AsyncStorage.getItem(AsyncStorageKey.password),
      AsyncStorage.getItem(AsyncStorageKey.mode),
      AsyncStorage.getItem(AsyncStorageKey.user_id),
    ]);
    const fair_use_count = await AsyncStorage.getItem(
      emailAddress.concat(AsyncStorageKey.fair_use_count),
    );
    switch (parseInt(mode)) {
      case Mode.PassMode:
        return {
          email: emailAddress,
          user_id,
          password: password,
          device_id: global.deviceSerial,
          lang: global.deviceLocale,
          mode: 0,
          fair_use_count,
        };
      case Mode.GoogleLogin:
        return {
          email: emailAddress,
          user_id,
          google_id: password,
          device_id: global.deviceSerial,
          lang: global.deviceLocale,
          mode: 1,
          fair_use_count,
        };
      case Mode.FacebookLogin:
        return {
          email: emailAddress,
          user_id,
          facebook_id: password,
          device_id: global.deviceSerial,
          lang: global.deviceLocale,
          mode: 2,
          fair_use_count,
        };
      case Mode.FingerPrint:
        return {
          email: emailAddress,
          user_id: user_id,
          device_id: global.deviceSerial,
          lang: global.deviceLocale,
          mode: 3,
          fair_use_count,
        };
    }
    return null;
  }

  async getTranslationAPIParams(inputText) {
    const emailAddress = await AsyncStorage.getItem(AsyncStorageKey.email);
    const user_id = await AsyncStorage.getItem(AsyncStorageKey.user_id);
    const fair_use_count = await AsyncStorage.getItem(
      emailAddress.concat(AsyncStorageKey.fair_use_count),
    );

    return {
      email: emailAddress,
      device_id: global.deviceSerial,
      input_text: encodeURIComponent(inputText),
      user_id: user_id,
      fair_use_count,
    };
  }
}

export const httpUtils = new HttpUtils();
