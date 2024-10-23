import React from 'react';
import {useState, useEffect} from "react";
import {StyleSheet, View, Text, Image, Modal, TouchableOpacity} from 'react-native';
import Color from '../constants/color';
import GradientButton from './GradientButton';
import translang, {getCurrentLocale} from '../utils/language.utils';
import ProgressHud from "./ProgressHud";
import CustomPassInput from "./CustomPassInput";
import Images from '../themes/Images';
import classStaticPrivateFieldDestructureSet from "@babel/runtime/helpers/esm/classStaticPrivateFieldDestructureSet";

export default function TokenErrorModal({
                                       onConfirm,
                                       ...props
                                     }) {
  const {isVisible, messageStyle, showCancelButton, loading, userName, passwordError} = props;

  const close = () => {
    if (onClose !== undefined && onClose !== null) {
      onClose();
    }
  }

  const goForgot = () => {
    if (onForgot !== undefined && onForgot !== null) {
      onForgot();
    }
  }


  const confirm = () => {
    if (onConfirm !== undefined && onConfirm !== null) {
      onConfirm();
    }
  }

  const _onChangePassword = (text) => {
    onChangePassword(text);
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
        onPressOut={() => {
        }}>
        <View style={styles.dialogStyle}>
          <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%',}}>
            <Image source={Images.n_ic_warning} style={styles.image}/>
          </View>
          <Text style={[styles.text, messageStyle]}>
            {translang.t('TOKEN_ERROR_TEXT')}
          </Text>

          <Text style={styles.text1}>
            {translang.t("CONFIRM_PASS_AGAIN")}
          </Text>

          <Text style={styles.text2}>(Error 401)</Text>

          <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 8}}>
            <View style={{height: 64}}>
              <GradientButton
                label={translang.t('COMMON_ok')}
                containerStyle={{flex: 1, marginVertical: 4}}
                buttonStyle={{height: 50, borderRadius: 25, width: 140}}
                colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                isVerticalGradient={false}
                _onPress={() => confirm()}/>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      <ProgressHud isVisible={loading}/>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000070',
  },
  dialogStyle: {
    width: '85%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 8,
  },
  image: {
    height: 50,
    marginTop: 20,
    resizeMode: 'contain',
  },
  text: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: "600",
    fontFamily: 'THSarabunNew',
    color: Color.primaryButtonColor
  },
  text1: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: "600",
    fontFamily: 'THSarabunNew',
    color: Color.primaryButtonColor
  },
  text2: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: "600",
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray
  },
});
