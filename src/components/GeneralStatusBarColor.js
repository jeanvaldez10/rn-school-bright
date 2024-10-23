import React from 'react';
import {View, StatusBar, StyleSheet, Platform} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight;

const GeneralStatusBarColor = ({backgroundColor, ...props}) => {
  const insets = useSafeAreaInsets();
  let height = insets.top;

  if (props.height != undefined) {
    height = props.height;
  }

  return (
    <View style={[styles.statusBar, {backgroundColor, height}]}>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </View>
  );
};

const styles = StyleSheet.create({
  statusBar: {
    height: STATUSBAR_HEIGHT,
  },
});

export default GeneralStatusBarColor;
