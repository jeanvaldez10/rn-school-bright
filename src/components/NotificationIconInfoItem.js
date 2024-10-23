import React, {useState, useEffect} from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import Color from '../constants/color';
import Images from '../themes/Images';
import moment from 'moment';

const NotificationIconInfoItem = ({...props}) => {
  const {icon, label, value_txt, value_txt2, dateText, isRead, moreAction, threeDot, Item, menuList, selectMenuItem} = props;
  const {topTextStyle, bottomTextStyle, imageStyle, imageContainerStyle, dateTextStyle} = props;

  let value_txt_check = false;
  if (value_txt && value_txt !== '') {
    value_txt_check = true;
  }

  let value_txt_check2 = false;
  if (value_txt2 && value_txt2 !== '') {
    value_txt_check2 = true;
  }

  // const [showDropdownChild, setShowDropdownChild] = useState(false);

  const backgroundColor = isRead ? Color.n_background_white : Color.n_default_orange_light;

  let dateString = "";
  let timeString = "";
  if (dateText) {
    dateString = moment(dateText).format('DD/MM/YYYY');
    timeString = moment(dateText).format('HH:mm');
  }

  const clickMore = () => {
    if (moreAction !== undefined && moreAction !== null) {
      moreAction();
    }
  }

  const onClickMenuItem = (index) => {
    selectMenuItem(index);
  }

  const renderMenuItem = () => {
    var res = []
    if (menuList.length > 0) {
      for (let i = 0; i < menuList.length; i++) {
        let item = menuList[i];
        res.push(
          <TouchableOpacity activeOpacity={0.7} onPress={() => onClickMenuItem(i)} key={i}>
            <Text style={styles.menuTextStyle}>{item.name}</Text>
          </TouchableOpacity>
        );
      }
    }
    return res;
  }

  return (
    <View style={[styles.menuContainer, props.style, {backgroundColor: backgroundColor}]}>
      <Text style={[styles.dateText, dateTextStyle]}>{`${timeString}   ${dateString}`}</Text>
      <View style={styles.menuItem}>
        <View style={[styles.imageContainer, imageContainerStyle]}>
          <Image source={icon} style={[styles.image, imageStyle]}></Image>
        </View>
        <View style={{flex: 1, marginLeft: 20, marginRight: 10, marginTop: 20}}>
          <Text style={[styles.topText, topTextStyle]}>{label}</Text>
          {value_txt_check &&
          <Text numberOfLines={1}
                style={[styles.bottomText, bottomTextStyle, isRead ? {color: Color.n_default_gray} : {color: '#000'}]}>{value_txt}</Text>}
          {value_txt_check2 &&
          <Text numberOfLines={1}
                style={[styles.bottomText, bottomTextStyle, isRead ? {color: Color.n_default_gray} : {color: '#000'}]}>{value_txt2}</Text>}
        </View>
        {threeDot &&
        <View>
          <TouchableOpacity activeOpacity={0.7} onPress={() => {
            clickMore()
          }}>
            <Image source={Images.n_ic_more} style={[styles.imageMore, imageStyle]}></Image>
          </TouchableOpacity>
          {Item.showDropdown && <View style={styles.menuDlgContainer}>
            {renderMenuItem()}
          </View>}
        </View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    position: 'relative',
    minHeight: 110,
    margin: 0,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Color.white,
    marginLeft: 30,

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    height: 50,
    width: 50,
    borderRadius: 25,
    resizeMode: 'contain',
  },

  imageMore: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain',
  },

  topText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    lineHeight: 24
  },
  bottomText: {
    fontSize: 17,
    fontWeight: 'bold',
  },

  dateText: {
    position: 'absolute',
    right: 30,
    top: 3,
    color: '#00000040',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },

  menuDlgContainer: {
    width: 140,
    padding: 10,
    backgroundColor: Color.white,
    position: 'absolute',
    bottom: '-30%',
    right: 30,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
    borderRadius: 15,
  },

  menuTextStyle: {
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray,
    fontSize: 23,
  }

});

export default NotificationIconInfoItem;
