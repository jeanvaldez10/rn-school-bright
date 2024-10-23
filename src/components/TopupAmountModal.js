import React from 'react';
import {useState, useEffect} from "react";
import {StyleSheet, View, Text, Image, Modal, TouchableOpacity} from 'react-native';
import Color from '../constants/color';
import GradientButton from './GradientButton';
import CustomTextInput from './CustomTextInput';

import translang, {getCurrentLocale} from '../utils/language.utils';

export default function TopupAmountModal({
                                           onClose,
                                           onOK,
                                           onError,
                                           ...props
                                         }) {
  const {isVisible, title, description} = props;

  const [topup_amount, setTopupAmount] = useState('');
  const [topup_amount_error, setTopupAmountError] = useState(false);

  const close = () => {
    if (onClose !== undefined && onClose !== null) {
      onClose();
    }
  }
  const clickok = () => {
    if (topup_amount == '') {
      onError();
      return;
    }

    if (onOK !== undefined && onOK !== null) {
      if (topup_amount > 50000) {
        setTopupAmountError(true);
        return;
      }
      onOK(topup_amount);
    }
  }

  const _onChangeTopupAmount = (amount) => {
    setTopupAmount(amount);
    if (amount < 50000) {
      setTopupAmountError(false);
    }
  };

  return (
    <>
      {isVisible &&
      <TouchableOpacity
        style={{...styles.centeredView}}
        activeOpacity={1}>
        <View style={styles.dialogStyle}>
          <Text style={[styles.text, {marginTop: 30}]}>
            {title ?? translang.t('TOPUP_msg_inputamount')}
          </Text>
          {description && description != "" &&
          <Text style={{...styles.text, fontSize: 16, marginTop: 0}}>{description}</Text>
          }
          <View style={{textAlign: 'left', width: '80%'}}>
            <CustomTextInput
              inputStyle={{
                borderWidth: 0,
                borderBottomWidth: 2,
                borderColor: Color.n_default_orange,
              }}
              inputWrapperStyle={{
                marginTop: 40,
                marginBottom: 1,
              }}
              isNum={true}
              value={topup_amount}
              onChangeText={_onChangeTopupAmount}
            />
            {topup_amount_error &&
            <Text style={{textAlign: 'left', color: 'red', fontSize: 16}}>{translang.t('TOPUP_AMOUNT_ERROR')}</Text>
            }
          </View>
          <View style={{flexDirection: 'row', marginVertical: 30, justifyContent: 'space-around'}}>
            <GradientButton
              label={translang.t('COMMON_close')}
              containerStyle={{...styles.buttonStyle, marginRight: 20}}
              buttonStyle={{borderRadius: 22, height: 44,}}
              colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
              isVerticalGradient={false}
              _onPress={() => close()}/>
            <GradientButton
              label={translang.t('COMMON_ok')}
              containerStyle={styles.buttonStyle}
              buttonStyle={{borderRadius: 22, height: 44,}}
              colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
              isVerticalGradient={false}
              _onPress={() => clickok()}/>
          </View>
        </View>
      </TouchableOpacity>
      }</>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000090',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,

  },
  dialogStyle: {
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: Color.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  text: {
    marginTop: 28,
    textAlign: 'center',
    fontSize: 28,
    color: Color.n_default_gray,
    fontWeight: 'bold',
    fontFamily: 'THSarabunNew',
  },

  buttonStyle: {
    width: 116,
    shadowColor: 'transparent',
    shadowOpacity: 0,
  },
});
