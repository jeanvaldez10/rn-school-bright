/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import PushNotification from "react-native-push-notification";

global.__APP_NAME__ = 'SchoolBright';

// Register background handler
// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('Message handled in the background!', remoteMessage);
// });

// messaging().onMessage(async remoteMessage => {
//   console.log('A new FCM message arrived!', remoteMessage);
// });

PushNotification.createChannel(
{
  channelId: "MY_CHANNEL_ID", // (required)
  channelName: "My channel", // (required)
});



AppRegistry.registerComponent(appName, () => App);
