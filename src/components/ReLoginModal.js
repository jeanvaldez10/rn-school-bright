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

export default function ReLoginModal({
                                       image,
                                       message,
                                       passwordText,
                                       password,
                                       onClose,
                                       onConfirm,
                                       onForgot,
                                       onChangePassword,
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
          <View style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', width: '100%', marginTop: 8,}}>
            {showCancelButton &&
            <TouchableOpacity onPressOut={() => close()}>
              <Image source={Images.n_close_circle} style={{width: 32, height: 32}}/>
            </TouchableOpacity>
            }

          </View>
          <Text style={[styles.text, messageStyle, {fontSize: getCurrentLocale()=='en' ? 28 : 32}]}>
            {message}
          </Text>

          <Text style={styles.text1}>
            {passwordText}
          </Text>

          <View
            style={{width: '40%', height: 2, borderRadius: 1, marginTop: 8, backgroundColor: Color.n_default_orange}}/>

          <Text style={[styles.nameText, messageStyle]}>
            {userName}
          </Text>
          <View style={{flexDirection: 'row', marginHorizontal: 16, marginTop: 8}}>
            <CustomPassInput
              inputStyle={{
                borderWidth: 0,
                borderBottomWidth: 0,
                borderColor: Color.n_default_brown,
                fontSize: 24,
              }}
              inputWrapperStyle={{
                marginHorizontal: 32,
                paddingHorizontal: 12,
                borderWidth: 2,
                borderBottomWidth: 2,
                width: '100%',
                borderRadius: 12,
                borderColor: Color.n_default_orange,
              }}
              value={password}
              placeholder={translang.t('PASSWORD')}
              placeholderTextColor={Color.n_text_placeholder_gray}
              secureTextEntry={false}
              onChangeText={(text) => _onChangePassword(text)}
            />
          </View>

          <View style={{flexDirection: 'row', width: '100%', paddingHorizontal: 24, justifyContent: 'space-between',}}>
            <Text style={[styles.errorText]}>{passwordError}</Text>
            <TouchableOpacity onPress={() => goForgot()}>
              <Text style={[styles.linkText]}>{translang.t('HOME_forgot')}</Text>
            </TouchableOpacity>

          </View>

          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <View style={{height: 64}}>
              <GradientButton
                label={translang.t('COMMON_confirm')}
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
    width: '90%',
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
    marginVertical: 20,
    resizeMode: 'contain',
  },
  text: {
    textAlign: 'center',
    fontSize: 32 ,
    fontWeight: "600",
    fontFamily: 'THSarabunNew',
    color: Color.primaryButtonColor
  },
  text1: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: "600",
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray
  },
  nameText: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: "600",
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray,
    marginTop: 4,
  },
  errorText: {
    textAlign: 'left',
    fontSize: 20,
    fontWeight: "600",
    fontFamily: 'THSarabunNew',
    color: Color.primaryColor
  },
  linkText: {
    textAlign: 'left',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'THSarabunNew',
    color: Color.n_default_orange
  },
});
