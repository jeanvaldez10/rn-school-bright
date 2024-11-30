import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import GradientButton from '../../../components/GradientButton';
import Color from '../../../constants/color';
import translang from '../../../utils/language.utils';

export default function ReportPopup({ isVisible, onClose, incidentDetails }) {
  const { sDate, sTime, infoSender, sMessage } = incidentDetails || {};
  const { sName: senderName } = infoSender || {};

  return (
    <Modal animationType="none" transparent={true} key="modal" visible={isVisible}>
      <View style={styles.centeredView}>
        <View style={styles.dialogStyle}>
          <View style={styles.wrapper1}>
            <View style={styles.item1}>
              <Text style={styles.subTitle}>{translang.t('REPORT_SENDER')} : </Text>
              <Text style={styles.details}>{senderName}</Text>
            </View>

            <View style={styles.item1}>
              <Text style={styles.subTitle}>
                {sDate} {sTime}{' '}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />
          <View style={styles.wrapper1}>
            <Text style={styles.header}>{translang.t('INCIDENT_REPORT')}</Text>
            <Text style={styles.text1}>{sMessage}</Text>
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
    color: Color.text_black,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subTitle: {
    fontSize: 22,
    color: Color.text_black,
    fontWeight: 'bold',
  },
  details: {
    flex: 1,
    fontSize: 22,
    color: Color.text_black,
    fontWeight: 'bold',
  },
  text1: {
    marginTop: 2,
    fontSize: 24,
    color: '#707070',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Color.n_default_yellow,
    marginBottom: 8,
  },
  item1: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  wrapper1: {
    width: '100%',
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 8,
    width: 116,
    alignSelf: 'center',
  },
  buttonStyle: {
    borderRadius: 22,
    height: 44,
  },
});
