import moment from 'moment';
import React from 'react';

import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Color from '../../../../constants/color';

import images from '../../../../themes/Images';
import translang from '../../../../utils/language.utils';

const ReportItem1 = ({ item }) => {
  // can't be in constants as language switch is affected.
  let BusStatusColorMap = {
    1: {
      title: translang.t('BUS_CHECK_IN_STATUS_CHECKED_IN'),
      color: Color.n_button_gradient_green_end,
    },
    2: {
      title: translang.t('BUS_CHECK_IN_STATUS_CHECKED_IN_LATE'),
      color: Color.n_default_brown,
    },
    3: {
      title: translang.t('BUS_CHECK_IN_STATUS_CHECKED_OUT'),
      color: Color.n_button_gradient_green_end,
    },
    '-1': {
      title: translang.t('BUS_CHECK_IN_STATUS_NOT_BOARD'),
      color: Color.n_default_orange,
    },
    '-2': {
      title: translang.t('BUS_CHECK_IN_STATUS_PERSONNAL_LEAVE'),
      color: Color.n_seance,
    },
    '-3': {
      title: translang.t('BUS_CHECK_IN_STATUS_SICK_LEAVE'),
      color: Color.n_electric_violet,
    },
    0: {
      title: translang.t('BUS_CHECK_IN_STATUS_UNSPECIFIED'),
      color: Color.n_scorpion,
    },
  };

  const {
    sStudentName,
    sStudentPhoto,
    sCheckInTime,
    sCheckOutTime,
    nCheckInStatus,
    nCheckOutStatus,
  } = item;

  const morningCheckInColor = BusStatusColorMap[nCheckInStatus]?.color;
  const morningCheckInLabel = BusStatusColorMap[nCheckInStatus]?.title;
  const morningCheckOutColor = BusStatusColorMap[nCheckOutStatus]?.color;
  const morningCheckoutLabel =
    BusStatusColorMap[nCheckOutStatus === 1 ? 3 : nCheckOutStatus]?.title;

  return (
    <View style={styles.itemContainer}>
      <View style={styles.group1}>
        <Image
          source={sStudentPhoto ? { uri: sStudentPhoto } : images.man_user}
          style={styles.itemAvatar}
        />
        <Text style={styles.text1}>{sStudentName}</Text>
      </View>

      <View style={styles.group2}>
        <Text style={styles.text2}>
          {translang.t('CHECK_IN')} : <Text style={styles.text3}>{sCheckInTime}</Text>
        </Text>

        <Pressable style={[styles.buttons, { backgroundColor: morningCheckInColor }]}>
          <Text style={styles.buttonText}>{morningCheckInLabel}</Text>
        </Pressable>
      </View>
      <View style={styles.group2}>
        <Text style={styles.text2}>
          {translang.t('CHECK_OUT')} : <Text style={styles.text3}>{sCheckOutTime}</Text>
        </Text>

        <Pressable style={[styles.buttons, { backgroundColor: morningCheckOutColor }]}>
          <Text style={styles.buttonText}>{morningCheckoutLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'column',
    borderRadius: 15,
    backgroundColor: Color.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    marginHorizontal: 5,
    marginVertical: 8,
    padding: 12,
  },
  group1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemAvatar: {
    width: 24,
    height: 24,
    borderRadius: 30,
    marginRight: 8,
  },
  text1: {
    flex: 1,
    color: Color.n_default_gray_dark,
    fontSize: 20,
    fontFamily: 'THSarabunNew',
    fontWeight: 'bold',
  },
  group2: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text2: {
    color: Color.n_default_gray_dark,
    fontSize: 20,
    fontWeight: 'bold',
  },
  text3: {
    color: Color.n_default_gray_dark,
    fontSize: 20,
  },
  buttons: {
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    marginLeft: 8,
    shadowColor: '#1C191966',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 6,
    shadowOpacity: 1,
    elevation: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0,
    color: Color.white,
  },
});

export default ReportItem1;
