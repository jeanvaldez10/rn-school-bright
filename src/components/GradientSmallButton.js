import React, {Component} from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Color from '../constants/color';

export default class GradientSmallButton extends Component {
  render() {
    const {label, _onPress, containerStyle, type} = this.props;
    let {enabled} = this.props;
    if (enabled === undefined) {
      enabled = true;
    }
    let colorGradient = [];
    if(type == 'green'){
      colorGradient = [Color.n_button_gradient_green_start, Color.n_button_gradient_green_end];
    }else{
      colorGradient = [Color.n_default_orange, Color.n_default_orange];
    }

    if (enabled === false) {
      colorGradient = [Color.gray200, Color.lightBlack];
    }
    return (
      <View style={[styles.gradientBtnWrapper, containerStyle]}>
        <TouchableOpacity
          onPress={_onPress}
          disabled={!enabled}
          style={styles.gradientBtn}>
          <LinearGradient
            style={[
              styles.gradientBtnBackground,
              {opacity: this.props.opacity ? this.props.opacity : 0.55},
              {width: this.props.width ? this.props.width : 120},
            ]}
            colors={colorGradient}>
            <Text
              style={[
                styles.gradientBtnLabel,
                {fontSize: this.props.fontSize ? this.props.fontSize : 24},
              ]}>
              {label}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  gradientBtnWrapper: {
    alignItems: 'center',
  },
  gradientBtn: {
    shadowColor: '#1C191966',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 6,
    shadowOpacity: 1,
    elevation: 12,
  },
  gradientBtnBackground: {
    height: 40,
    borderRadius: 20,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientBtnLabel: {
    fontSize: 18,
    letterSpacing: 0,
    color: Color.white,
    fontWeight: 'bold'
  },
});
