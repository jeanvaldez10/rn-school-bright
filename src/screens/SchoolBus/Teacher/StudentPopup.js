import React from 'react';
import { Alert, Image, Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import GradientButton from '../../../components/GradientButton';
import Color from '../../../constants/color';
import images from '../../../themes/Images';
import translang from '../../../utils/language.utils';

export default function StudentPopup({
  isVisible,
  onClose,
  navigation,
  student,
  nTravelID,
  userInfo,
}) {
  const { sFatherPhone, sMotherPhone } = student || {};

  const openDialPad = (phoneNumber) => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url).catch((err) => Alert.alert('Failed to open dial pad', err.message));
  };

  const onPressCallFather = () => {
    openDialPad(sFatherPhone);
    onClose();
  };

  const onPressCallMother = () => {
    openDialPad(sMotherPhone);
    onClose();
  };

  const onPressReportIncident = () => {
    let params = {
      student,
      nTravelID,
      userInfo,
    };

    navigation.navigate('StudentBusIncidentReport', params);
    onClose();
  };

  return (
    <Modal animationType="none" transparent={true} key="modal" visible={isVisible}>
      <View style={styles.centeredView}>
        <View style={styles.dialogStyle}>
          <Text style={styles.header}>{translang.t('SELECT_ITEM')}</Text>
          {!!sFatherPhone || !!sMotherPhone ? (
            <>
              <Text style={styles.text1}>{translang.t('CALL_PARENT')}</Text>

              <View style={styles.divider} />
              <View style={styles.wrapper1}>
                <Pressable style={styles.item1} onPress={onPressCallFather}>
                  <Image source={images.ic_call_yellow} style={styles.image}></Image>
                  <View style={styles.group1}>
                    <Text style={styles.number}>
                      {translang.t('FATHER')}: {sFatherPhone}
                    </Text>
                  </View>
                </Pressable>
                <Pressable style={styles.item1} onPress={onPressCallMother}>
                  <Image source={images.ic_call_yellow} style={styles.image}></Image>
                  <View style={styles.group1}>
                    <Text style={styles.number}>
                      {translang.t('MOTHER')}: {sMotherPhone}
                    </Text>
                  </View>
                </Pressable>
              </View>
            </>
          ) : null}

          <Text style={styles.text1}>{translang.t('REPORT_INCIDENT')}</Text>

          <View style={styles.divider} />
          <View style={styles.wrapper1}>
            <Pressable style={styles.item1} onPress={onPressReportIncident}>
              <Image source={images.ic_warning_yellow} style={styles.image}></Image>
              <View style={styles.group1}>
                <Text style={styles.number}>{translang.t('INCIDENT_REPORT')}</Text>
              </View>
            </Pressable>
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
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  text1: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  number: {
    fontSize: 24,
    color: '#3D3D3D',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Color.n_scorpion,
    marginBottom: 8,
  },
  item1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  wrapper1: {
    marginBottom: 8,
  },
  group1: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
