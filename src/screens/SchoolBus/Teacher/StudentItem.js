import React from 'react';
import { Image, Pressable, StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native';
import Color from '../../../constants/color';
// import { BusStatusColorMap } from '../../../constants/constants';
import images from '../../../themes/Images';
import translang from '../../../utils/language.utils';

const StudentItem = ({
  item,
  index,
  onPressStudent,
  onPressCheckIn,
  onPressCheckout,
  reordering = false,
  toggleRowActive,
}) => {
  const {
    sFirstName = 'ตรีมนต์',
    sLastName = 'รันการ',
    sPhoto,
    nCheckInStatus,
    nCheckOutStatus,
  } = item;
  // can't be in constants as language switch is affected.
  let BusStatusColorMap = {
    1: {
      value: 1,
      title: translang.t('BUS_CHECK_IN_STATUS_CHECKED_IN'),
      color: Color.n_button_gradient_green_end,
    },
    2: {
      value: 2,
      title: translang.t('BUS_CHECK_IN_STATUS_CHECKED_IN_LATE'),
      color: Color.n_default_brown,
    },
    3: {
      value: 1,
      title: translang.t('BUS_CHECK_IN_STATUS_CHECKED_OUT'),
      color: Color.n_button_gradient_green_end,
    },
    '-1': {
      value: 2,
      title: translang.t('BUS_CHECK_IN_STATUS_NOT_BOARD'),
      color: Color.n_default_orange,
    },
    '-2': {
      value: 3,
      title: translang.t('BUS_CHECK_IN_STATUS_PERSONNAL_LEAVE'),
      color: Color.n_seance,
    },
    '-3': {
      value: 4,
      title: translang.t('BUS_CHECK_IN_STATUS_SICK_LEAVE'),
      color: Color.n_electric_violet,
    },
    0: {
      value: 0,
      title: translang.t('BUS_CHECK_IN_STATUS_UNSPECIFIED'),
      color: Color.n_scorpion,
    },
  };

  const checkInColor = BusStatusColorMap[nCheckInStatus]?.color || Color.n_password_grey;
  const checkInLabel =
    BusStatusColorMap[nCheckInStatus]?.title || translang.t('BUS_CHECK_IN_STATUS_UNSPECIFIED');
  const checkoutColor = BusStatusColorMap[nCheckOutStatus]?.color || Color.n_password_grey;
  const checkoutLabel =
    BusStatusColorMap[nCheckOutStatus === 1 ? 3 : nCheckOutStatus]?.title ||
    translang.t('BUS_CHECK_IN_STATUS_UNSPECIFIED');

  return (
    <TouchableOpacity style={styles.listItem} onPress={onPressStudent(item)}>
      {reordering ? (
        <TouchableOpacity style={styles.dragIconContainer} onLongPress={toggleRowActive}>
          <Image source={images.ic_three_line} style={styles.orderIcon} resizeMode="cover" />
        </TouchableOpacity>
      ) : null}

      <Text style={styles.itemText}>{index + 1}.</Text>
      <Image source={sPhoto ? { uri: sPhoto } : images.women_user} style={styles.itemAvatar} />
      <View style={styles.studentTextWrapper}>
        <Text style={styles.itemText} numberOfLines={1}>
          {sFirstName}
        </Text>
        <Text style={styles.itemText} numberOfLines={1}>
          {sLastName}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.buttons, { backgroundColor: checkInColor }]}
          onPress={onPressCheckIn(item)}
        >
          <Text style={styles.buttonText}>{checkInLabel}</Text>
        </Pressable>
        <Pressable
          style={[styles.buttons, { backgroundColor: checkoutColor }]}
          onPress={onPressCheckout(item)}
        >
          <Text style={styles.buttonText}>{checkoutLabel}</Text>
        </Pressable>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemAvatar: {
    borderRadius: 30,
    height: 46,
    marginHorizontal: 8,
    width: 46,
    backgroundColor: Color.n_default_gray,
  },
  dragIconContainer: {
    paddingVertical: 8,
  },
  orderIcon: {
    width: 16,
    height: 12,
    resizeMode: 'cover',
    marginRight: 4,
  },
  itemText: {
    color: Color.n_default_gray,
    fontSize: 24,
  },
  listItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Color.white,
    borderRadius: 15,
    elevation: 2,
    flexDirection: 'row',
    marginVertical: 5,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  studentTextWrapper: {
    flex: 1,
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-evenly',
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  buttons: {
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    borderRadius: 25,
    height: 40,
    marginLeft: 8,
    shadowColor: '#1C191966',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 6,
    shadowOpacity: 1,
    elevation: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0,
    color: Color.white,
  },
});

export default StudentItem;
