import React from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Color from '../../../constants/color';
import translang from '../../../utils/language.utils';
import images from '../../../themes/Images';

const StudentItem = ({
  item,
  index,
  onPressStudent,
  onPressCheckIn,
  onPressCheckout,
  reordering = false,
}) => {
  const { firstName = 'ตรีมนต์', lastName = 'รันการ', checkInStatus, checkoutStatus } = item;

  return (
    <TouchableOpacity style={styles.listItem} onPress={onPressStudent(item)}>
      {reordering ? (
        <Image source={images.ic_three_line} style={styles.orderIcon} resizeMode="cover" />
      ) : null}

      <Text style={styles.itemText}>{index + 1}.</Text>
      <Image source={images.women_user} style={styles.itemAvatar} />
      <View style={styles.studentTextWrapper}>
        <Text style={styles.itemText} numberOfLines={1}>
          {firstName}
        </Text>
        <Text style={styles.itemText} numberOfLines={1}>
          {lastName}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.buttons, { backgroundColor: Color.n_password_grey }]}
          onPress={onPressCheckIn(item)}
        >
          <Text style={styles.buttonText}>{translang.t('UNDEFINED')}</Text>
        </Pressable>
        <Pressable
          style={[styles.buttons, { backgroundColor: Color.n_password_grey }]}
          onPress={onPressCheckout(item)}
        >
          <Text style={styles.buttonText}>{translang.t('UNDEFINED')}</Text>
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
    flexDirection: 'row',
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
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0,
    color: Color.white,
  },
});

export default StudentItem;
