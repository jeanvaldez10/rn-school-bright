import React, {Component} from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Color from '../constants/color';

export default class NextButton extends Component {
  render() {
    const {
      label,
      _onPress,
      containerStyle,
      buttonStyle,
      textStyle,
      colors,
      disableColors,
      isVerticalGradient,
      touchCustomStyle
    } = this.props;
    let {enabled} = this.props;
    if (enabled === undefined) {
      enabled = true;
    }

    let colorGradient = [Color.primaryButtonColor, Color.secondButtonColor]; //color.lightblack

    if (colors !== undefined && colors !== null && colors.length > 0) {
      if (colors.length > 1) {
        colorGradient = [colors[0], colors[1]];
      } else {
        colorGradient = [colors[0], colors[0]];
      }
    }

    if (enabled === false) {
      colorGradient = [Color.gray200, Color.lightBlack];
      if (disableColors !== undefined && disableColors !== null && disableColors.length > 0) {
        if (colors.length > 1) {
          colorGradient = [disableColors[0], disableColors[1]];
        } else {
          colorGradient = [disableColors[0], disableColors[0]];
        }
      }
    }

    const _isVerticalGradient = isVerticalGradient ?? true;
    let gradientStart = {x: 0, y: 0}
    let gradientEnd = {x: 0, y: 1}
    if (_isVerticalGradient) {
      gradientStart = {x: 0, y: 0}
      gradientEnd = {x: 0, y: 1}
    } else {
      gradientStart = {x: 0, y: 0}
      gradientEnd = {x: 1, y: 0}
    }
    const touchStyle = touchCustomStyle ? styles.gradientBtnAutoWidth : styles.gradientBtn;

    return (
      <View style={[styles.gradientBtnWrapper, containerStyle]}>
        <TouchableOpacity
          onPress={_onPress}
          disabled={!enabled}
          activeOpacity={0.8}
          style={touchStyle}>
          <LinearGradient
            style={[styles.gradientBtnBackground, buttonStyle]}
            start={gradientStart}
            end={gradientEnd}
            colors={colorGradient}>
            <Text style={[styles.gradientBtnLabel, textStyle]}>{label}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  gradientBtnWrapper: {
    alignItems: 'center',
    shadowColor: '#00000020',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowRadius: 2,
    elevation: 5,
    shadowOpacity: 1,
    borderRadius: 40,
    paddingHorizontal: 5,
  },
  gradientBtn: {
    width: '100%'
  },
  gradientBtnAutoWidth: {
    // width: '100%'
  },
  gradientBtnBackground: {
    height: 80,
    marginHorizontal: 0,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientBtnLabel: {
    fontSize: 30,
    fontWeight: 'bold',
    letterSpacing: 0,
    color: Color.white,
    textAlign: 'center',
  },
});
