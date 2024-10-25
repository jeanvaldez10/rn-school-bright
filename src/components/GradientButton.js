import React, {Component} from 'react';
import { View, Text, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Color from '../constants/color';
import { ScaledSheet } from 'react-native-size-matters';


export default class GradientButton extends Component {
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
      borderColor,
    } = this.props;
    let {enabled} = this.props;
    if (enabled === undefined) {
      enabled = true;
    }
    let {activeOpacity} = this.props;
    if (activeOpacity === undefined) {
      activeOpacity = 0.7;
    }

    let colorGradient = [Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]; //color.lightblack

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
        if (disableColors.length > 1) {
          colorGradient = [disableColors[0], disableColors[1]];
        } else {
          colorGradient = [disableColors[0], disableColors[0]];
        }
      }
    }

    const _isVerticalGradient = isVerticalGradient ?? true;
    let gradientStart = {x: 0, y: 1}
    let gradientEnd = {x: 1, y: 0}
    // if (_isVerticalGradient) {
    //   gradientStart = {x: 0, y: 0}
    //   gradientEnd = {x: 0, y: 1}
    // } else {
    //   gradientStart = {x: 0, y: 0}
    //   gradientEnd = {x: 1, y: 0}
    // }

    return (
      <View style={[styles.gradientBtnWrapper, containerStyle]}>
        <TouchableOpacity
          onPress={_onPress}
          disabled={!enabled}
          style={styles.gradientBtn}
          activeOpacity={activeOpacity}>
          <LinearGradient
            style={[styles.gradientBtnBackground, buttonStyle, borderColor? {borderColor: borderColor, borderWidth: 2} : {borderWidth: 0} ]}
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

const styles = ScaledSheet.create({
  gradientBtnWrapper: {
    alignItems: 'center',
    // marginTop: 45,
    // paddingHorizontal: 35,

    shadowColor: '#1C191966',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 6,
    shadowOpacity: 1,
    elevation: 12,

  },
  gradientBtn: {
    width: '100%',
  },
  gradientBtnBackground: {
    width: "100%",
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',

  },
  gradientBtnLabel: {
    fontSize: "24@ms",
    fontWeight: 'bold',
    letterSpacing: 0,
    color: Color.white,
  },
});
