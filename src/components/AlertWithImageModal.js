import React from 'react';
import {useState, useEffect} from "react";
import {StyleSheet, View, Text, Image, Modal, TouchableOpacity, ScrollView} from 'react-native';
import Color from '../constants/color';
import GradientButton from './GradientButton';
import translang, { getCurrentLocale } from '../utils/language.utils';

export default function AlertWithImageModal({
  image,
  title,
  message,
  buttonTitle,
  onClose,
  ...props
}) {
    const { isVisible, titleStyle, messageStyle } = props;
    const { buttonColors, isVerticalGradient } = props;

    const close = () => {
      if (onClose !== undefined && onClose !== null) {
        onClose();
      }
    }
    return (
        <Modal
            animationType='fade'
            transparent={true}
            key="modal"
            visible={isVisible}
            activeOpacity={0.7}>
            <View style={styles.centeredView} >
              <View style={styles.dialogStyle}>
                { image &&
                  <Image source={image} style={styles.image} />
                }
                { title && title !== '' &&
                  <Text style={[styles.text, titleStyle]}>
                    {title}
                  </Text>
                }
                { message && message !== '' &&
                  <ScrollView style={{maxHeight: 400}}>
                    <Text style={[styles.text, messageStyle]}>
                      {message}
                    </Text>
                  </ScrollView>
                }
                <GradientButton
                  label={buttonTitle ?? translang.t('COMMON_close') }
                  containerStyle={styles.buttonStyle}
                  buttonStyle={{borderRadius: 20, height: 40,}}
                  colors={buttonColors}
                  isVerticalGradient={isVerticalGradient}
                  _onPress={() => close()} />
              </View>

            </View>
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
    paddingHorizontal: 10,
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
  },
  image: {
    height: 40,
    marginVertical: 20,
    resizeMode: 'contain',
  },
  text: {
    textAlign: 'center',
    paddingHorizontal: 8,
    fontSize: 24,
    color: Color.n_default_gray,
    fontWeight: 'normal',
    fontFamily: 'THSarabunNew',
  },

  buttonStyle:{
    width: 130,
    marginBottom: 20,
    marginVertical:20,
    marginLeft: 'auto',
    marginRight: 'auto',
  }
});
