import React from 'react';
import {StyleSheet, View, Text, Image, Modal} from 'react-native';
import dimension from '../constants/dimension';
import Images from '../themes/Images';
import GradientSmallButton from './GradientSmallButton';
import Color from "../constants/color";
import {ScaledSheet} from 'react-native-size-matters';

export default function CustomModal({
                                      isVisible,
                                      header,
                                      body,
                                      positiveText,
                                      negativeText,
                                      onPositivePress,
                                      onNegativePress,
                                      headerVisible,
                                      logoVisible,
                                      positiveBtnType,
                                      negativeBtnType
                                    }) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      key="modal"
      visible={isVisible}>
      <View style={styles.centeredView}>
        <View style={styles.dialogStyle}>
          <View
            style={{
              width: '100%',
              marginLeft: dimension.px20,
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 20,
            }}>
            {logoVisible &&
            <Image source={Images.gallery_icon} style={styles.modalLogo}/>
            }
            {headerVisible &&
            <Text
              style={{
                textAlign: 'center',
                fontSize: 20,
                paddingHorizontal: 15,
                fontWeight: 'bold',
              }}>
              {header}
            </Text>
            }
          </View>
          <Text
            style={styles.textStyle}>
            {body}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginHorizontal: 10,
              marginVertical: 15,
            }}>
            {negativeText !== '' && (
              <GradientSmallButton
                label={negativeText}
                opacity={1}
                type={negativeBtnType ?? 'orange'}
                _onPress={onNegativePress}
              />
            )}
            <GradientSmallButton
              label={positiveText}
              opacity={1}
              type={positiveBtnType ?? 'orange'}
              _onPress={onPositivePress}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = ScaledSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000050',
  },
  dialogStyle: {
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '20@s',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalLogo: {
    width: 72,
    height: 30,
  },

  textStyle: {
    textAlign: 'center',
    fontSize: '24@s',
    marginVertical: '20@s',
    paddingHorizontal: '20@s',
    fontWeight: 'bold',
    color: Color.text_black,
  }
});
