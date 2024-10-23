import React from 'react';
import { useState, useEffect } from "react";
import { StyleSheet, View, Text, Image, Modal, TouchableOpacity } from 'react-native';
import Color from '../constants/color';
import GradientButton from './GradientButton';
import translang, { getCurrentLocale } from '../utils/language.utils';

export default function AlertWith2ButtonsModal({
  image,
  message,
  onClose,
  onConfirm,
  ...props
}) {
  const { isVisible, messageStyle } = props;
  const showConfirm = props.showConfirm ?? true;
  const confirmButtonTxt = props.confirmButtonTxt ?? translang.t('COMMON_ok');
  const cancelButtonTxt = props.cancelButtonTxt ?? translang.t('COMMON_cancel');

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
        onPressOut={() => { close() }}>
        <View style={styles.dialogStyle}>
          {image &&
            <Image source={image} style={styles.image} />
          }
          <Text style={[styles.text, messageStyle]}>
            {message}
          </Text>

          <View style={{ flexDirection: 'row',}}>
            <GradientButton
              label={cancelButtonTxt}
              containerStyle={{ width: '50%', marginTop: 30, paddingHorizontal: 10, shadowColor: 'transparent', shadowOpacity: 0 }}
              buttonStyle={styles.button}
              colors={[Color.barTransparent, Color.barSecond]}
              isVerticalGradient={false}
              _onPress={() => close()} />
            {showConfirm &&
            <GradientButton
                label={confirmButtonTxt}
                containerStyle={{ width: '50%', marginTop: 30, paddingHorizontal: 10, shadowColor: 'transparent', shadowOpacity: 0 }}
                buttonStyle={styles.button}
                colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
                isVerticalGradient={false}
                _onPress={() => confirm()} />}


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
    backgroundColor: '#00000070',
  },
  dialogStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderRadius: 15,
    width: '75%',
    padding: 20,
  },
  image: {
    height: 80,
    marginVertical: 20,
    resizeMode: 'contain',
  },
  text: {
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 8,
    fontSize: 24,
    fontFamily: 'THSarabunNew',
  },
  button: {
    borderRadius: 25,
    height: 50,
  }
});
