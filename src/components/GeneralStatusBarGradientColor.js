import React from 'react';
import {StatusBar, StyleSheet, Platform} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Color from '../constants/color';
import LinearGradient from 'react-native-linear-gradient';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight;

const GeneralStatusBarGradientColor = ({backgroundColor, ...props}) => {
  const insets = useSafeAreaInsets();
  let height = insets.top;

  if (props.height != undefined) {
    height = props.height;
  }

  return (
    <LinearGradient
      style={[styles.statusBar, {backgroundColor, height}]}
      start={{x: 0, y: 0}} end={{x: 1, y: 0}}
      colors={[Color.barTransparent, Color.barSecond]}>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  statusBar: {
    height: STATUSBAR_HEIGHT,
  },
});

export default GeneralStatusBarGradientColor;
