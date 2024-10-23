import I18n from 'react-native-i18n'; 
import en from '../config/language/en';
import th from '../config/language/th';
import moment from 'moment';
import 'moment/locale/th';
import Storage from '../managers/StorageManager';

 I18n.fallbacks = true; // If an English translation is not available in en.js, it will look inside th.js
 I18n.missingBehaviour = 'guess'; // It will convert HOME_noteTitle to "HOME note title" if the value of HOME_noteTitle doesn't exist in any of the translation files.
 I18n.defaultLocale = 'th'; // If the current locale in device is not en or th
 I18n.locale = 'th'; // If we do not want the framework to use the phone's locale by default

 I18n.translations = {
   th,
   en
 };

 export const setLocale =  (locale) => { 
  Storage.setLanguage(locale);

  I18n.locale = locale;
  moment.locale(locale)
 };

 export const getCurrentLocale = () => I18n.locale; // It will be used to define intial language state in reducer.

 /* translateHeaderText:
  screenProps => coming from react-navigation 
  langKey => will be passed from the routes file depending on the screen. 
 */
 export const translateHeaderText = (langKey) => ({screenProps}) => {
   const title = I18n.translate(langKey, screenProps.language);
   return {title};
 };

 export default I18n;