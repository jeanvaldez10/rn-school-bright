import React from 'react';
import { useState, useEffect } from "react";
import { StyleSheet, View, Text, Image, Modal, TouchableOpacity } from 'react-native';
import Color from '../constants/color';
import GradientButton from './GradientButton';
import CustomPassInput from './CustomPassInput';

import translang, { getCurrentLocale } from '../utils/language.utils';

export default function PasswordInputModal({
  onClose,
  onOK,
  onError,
  ...props
}) {
  const { isVisible, } = props;

  const [password, setPassword] = useState('');

  const close = () => {
    if (onClose !== undefined && onClose !== null) {
      onClose();
    }
  }

  const clickok = () => {
    if (password == '') {
      onError();
      return;
    }

    if (onOK !== undefined && onOK !== null) {
      onOK(password);
    }
  }

  const _onChangeTopupAmount = (strPassword) => {
    setPassword(strPassword);
  };

  return (
    <Modal
      animationType='fade'
      transparent={true}
      key="modal"
      visible={isVisible}>
      <TouchableOpacity
        style={styles.centeredView}
        activeOpacity={1}
        onPressOut={() => { close() }}>
        <View style={styles.dialogStyle}>
          <Text style={[styles.text, { marginTop: 30 }]}>
            {translang.t('HOME_msg_password')}
          </Text>

          <CustomPassInput
            inputStyle={{
              borderWidth: 0,
              borderColor: Color.n_default_orange,
            }}
            inputWrapperStyle={{
              marginTop: 40,
              marginBottom: 1,
              width: '80%',
            }}
            value={password}
            onChangeText={_onChangeTopupAmount}
            placeholder={translang.t('HOME_msg_password')}
            placeholderTextColor={Color.n_text_placeholder_gray}
          />
          
          <View style={{ flexDirection: 'row', marginVertical: 15, justifyContent: 'space-around' }}>
            <GradientButton
              label={translang.t('COMMON_ok')}
              containerStyle={styles.buttonStyle}
              buttonStyle={{ borderRadius: 22, height: 44, }}
              colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
              isVerticalGradient={false}
              _onPress={() => clickok()} />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000090',
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

  buttonStyle:{
    width: '80%', 
    shadowColor: 'transparent', 
    shadowOpacity: 0, 
  },
});