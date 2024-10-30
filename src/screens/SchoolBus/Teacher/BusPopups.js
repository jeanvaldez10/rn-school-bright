import React, { useCallback, useState } from 'react';
import { Alert, Image, Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import GradientButton from '../../../components/GradientButton';
import Color from '../../../constants/color';
import translang from '../../../utils/language.utils';

export default function BusPopup({ isVisible, onClose }) {
  const openDialPad = (phoneNumber) => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url).catch((err) => Alert.alert('Failed to open dial pad', err.message));
  };

  const onPressCallMother = () => {
    openDialPad('081-234-5678');
    onClose();
  };

 

  console;
  return (
    <Modal animationType="none" transparent={true} key="modal" visible={isVisible}>
      <View style={styles.centeredView}>
        <View style={styles.dialogStyle}>
          <Text style={styles.header}>{translang.t('DOT_MENU_BUS_DETAILS')}</Text>

          <View style={styles.divider} />
          <View style={styles.wrapper1}>
            <View style={styles.item1}>
              <Text style={styles.subTitle}>{translang.t('VEHICLE_REGISTRATION')} : </Text>
              <Text style={styles.details}>อบ 1212 กรุงเทพมหานคร ddddddddddd</Text>
            </View>
            <View style={styles.item1} onPress={onPressCallMother}>
              <Text style={styles.subTitle}>{translang.t('BUS_MODEL')} : </Text>
              <Text style={styles.details}>Toyota Commuter</Text>
            </View>

            <View style={styles.item1} onPress={onPressCallMother}>
              <Text style={styles.subTitle}>{translang.t('DRIVER_NAME')} : </Text>
              <Text style={styles.details}>ชื่อคนขับ</Text>
            </View>
            <View style={styles.item1} onPress={onPressCallMother}>
              <Text style={styles.subTitle}>{translang.t('DRIVER_PHONE_NUMBER')} : </Text>
              <Text style={styles.details}>081-111-1111</Text>
            </View>
          </View>

          <GradientButton
            label={translang.t('COMMON_close')}
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.buttonStyle}
            colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
            isVerticalGradient={false}
            _onPress={() => onClose()}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000090',
  },
  dialogStyle: {
    width: '80%',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
    borderRadius: 15,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    color: Color.n_default_orange,
    fontSize: 24,
    marginBottom: 8,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  subTitle: {
    fontSize: 22,
    color: '#707070',
  },
  details: {
    flex: 1,
    fontSize: 22,
    color: '#45494D',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Color.n_default_yellow,
    marginBottom: 8,
  },
  item1: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  wrapper1: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonContainer: {
    width: 116,
    alignSelf: 'center',
  },
  buttonStyle: {
    borderRadius: 22,
    height: 44,
  },
});
