import React from 'react';
import { useState, useEffect } from "react";
import { StyleSheet, View, Text, Image, Modal, TouchableOpacity } from 'react-native';
import Color from '../constants/color';
import GradientButton from './GradientButton';
import translang, { getCurrentLocale } from '../utils/language.utils';
import ProgressHud from "./ProgressHud";

export default function LogoutModal({
  image,
  message,
  onClose,
  onConfirm,
  ...props
}) {
  const { isVisible, messageStyle, showCancelButton, loading } = props;

  let confirmButtonText = props.confirmButtonText ?? translang.t('COMMON_confirm');

  const close = () => {
    if (onClose !== undefined && onClose !== null) {
      onClose();
    }
  }

  const confirm = () => {
    if (onConfirm !== undefined && onConfirm !== null) {
      onConfirm();
    }
  }

  return (
    <Modal
      animationType='fade'
      transparent={true}
      key="modal"
      visible={isVisible}>
      <TouchableOpacity
        style={styles.centeredView}
        activeOpacity={1}
        onPressOut={() => { }}>
        <View style={styles.dialogStyle}>
          {image &&
            <Image source={image} style={styles.image} />
          }
          <Text style={[styles.text, messageStyle]}>
            {message}
          </Text>

          <View style={{ flexDirection: 'row', justifyContent:'space-between', margin: 15 }}>
            <GradientButton
              label={confirmButtonText}
              containerStyle={{flex: 1}}
              buttonStyle={{height: 50, borderRadius: 25 }}
              colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
              isVerticalGradient={false}
              _onPress={() => confirm()} />
            {showCancelButton &&
            <GradientButton
              label={translang.t('COMMON_cancel')}
              containerStyle={{ flex: 1, marginLeft: 20,}}
              buttonStyle={{height: 50, borderRadius: 25 }}
              colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
              isVerticalGradient={false}
              _onPress={() => close()} />
            }

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
    width: '75%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
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
  },
  image: {
    height: 50,
    marginVertical: 20,
    resizeMode: 'contain',
  },
  text: {
    textAlign: 'center',
    fontSize: 30,
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray
  },
});
