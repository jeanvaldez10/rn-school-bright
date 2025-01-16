/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import Index from './Index';
import { StatusBar, Text, TextInput, StyleSheet, LogBox } from 'react-native';
import { omit } from 'lodash';
import KeepAwake from 'react-native-keep-awake';
import getFontFamily from './utils/getFontFamily';
import { Provider } from 'react-redux';
import { store } from './redux/store';

import * as Sentry from '@sentry/react-native';
import Geolocation from '@react-native-community/geolocation';

Geolocation.setRNConfiguration({
  skipPermissionRequests: false,
  authorizationLevel: 'always',
});

Sentry.init({
  dsn: 'https://2e3ab4d70535da995d476cf44ddff91a@o4506920728723456.ingest.us.sentry.io/4507603684818944',
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0,
  _experiments: {
    // profilesSampleRate is relative to tracesSampleRate.
    // Here, we'll capture profiles for 100% of transactions.
    profilesSampleRate: 1.0,
  },
  ignoreErrors: ['Object captured as exception'],
  beforeSend: (event, hint) => {
    if (
      typeof hint.originalException === 'object' &&
      hint.originalException !== null &&
      'key' in hint.originalException
    ) {
      event.extra = {
        ...event.extra,
        ...hint.originalException,
      };
    }

    return event;
  },
});

LogBox.ignoreLogs(['EventEmitter.removeListener']);
StatusBar.setBarStyle('dark-content');
const setCustomText = (customProps) => {
  const TextRender = Text.render;
  const initialDefaultProps = Text.defaultProps;
  Text.defaultProps = {
    ...initialDefaultProps,
    ...customProps,
  };
  Text.render = function render(props) {
    const oldProps = props;
    const style = StyleSheet.flatten([customProps.style, props.style]);
    props = {
      ...props,
      style:
        style.fontFamily === 'THSarabunNew' || !style.fontFamily
          ? [
              omit(style, 'fontWeight', 'fontStyle'),
              {
                fontFamily: getFontFamily('THSarabunNew', style),
              },
            ]
          : style,
    };
    try {
      return TextRender.apply(this, arguments);
    } finally {
      props = oldProps;
    }
  };

  const TextInputRender = TextInput.render;
  const textInputDefaultProps = TextInput.defaultProps;
  TextInput.defaultProps = {
    ...textInputDefaultProps,
    ...customProps,
  };
  TextInput.render = function render(props) {
    const oldProps = props;
    const style = StyleSheet.flatten([customProps.style, props.style]);
    props = {
      ...props,
      style:
        style.fontFamily === 'THSarabunNew' || !style.fontFamily
          ? [
              omit(style, 'fontWeight', 'fontStyle'),
              {
                fontFamily: getFontFamily('THSarabunNew', style),
              },
            ]
          : style,
    };
    try {
      return TextInputRender.apply(this, arguments);
    } finally {
      props = oldProps;
    }
  };
};

setCustomText({});

const App = () => {
  return (
    <Provider store={store}>
      <Index />
      <KeepAwake />
    </Provider>
  );
};

export default Sentry.wrap(App);
