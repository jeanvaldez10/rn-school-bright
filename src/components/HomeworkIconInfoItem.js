import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Color from '../constants/color';
import Images from '../themes/Images';

const HomeworkIconInfoItem = ({ ...props }) => {
    const { label, value_txt, dateText } = props;
    const { topTextStyle, bottomTextStyle, } = props;
    const { isRead, hasAttachment } = props;

    const backgroundColor = isRead ? Color.n_background_white : Color.n_default_orange_light;
    const imgBackgroudColor = isRead ? Color.n_default_orange_light : Color.n_background_white;
    return (
      <View style={[styles.menuContainer, props.style, {backgroundColor: backgroundColor}]}>
        <Text style={styles.dateText}>{dateText}</Text>
        <View style={styles.menuItem} >
          <View style={{...styles.imageContainer, backgroundColor: imgBackgroudColor}}>
            <Image source={Images.n_ic_homework_blue} style={styles.image}></Image>
          </View>
          <View style={{ flex: 1, flexDirection: 'column' }}>
            <Text numberOfLines={1} style={[styles.topText, topTextStyle]}>{label}</Text>
            <Text numberOfLines={1} style={[styles.bottomText, bottomTextStyle]}>{value_txt}</Text>
          </View>
          {hasAttachment && 
          <Image source={Images.paperclip} style={[{ height: 30, width: 30, borderRadius: 15, marginRight: 10}]}></Image>
          }
        </View>
      </View>
    );
};

const styles = StyleSheet.create({
    menuContainer: {
      height: 110,
      borderRadius: 15,
      shadowColor: '#000',
      shadowOffset: {
          width: 0,
          height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      marginVertical: 8,
      marginHorizontal: 10,

      justifyContent: 'center',
      alignItems: 'center',
    },
    menuItem: {
      width: '100%',
      height: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dotimage: {
      width: 15, 
      height: 15, 
      borderRadius: 8,
      marginHorizontal: 8,
    },
    imageContainer:{
      height: 50,
      width: 50,
      borderRadius: 25,
      marginLeft: 15,
      marginRight: 20,
      justifyContent: 'center',
      alignItems: 'center'
    },

    image: {
      width: 30,
      height: 30,
      resizeMode: 'contain'
    },
    topText: {
      fontSize: 22,
      fontWeight: 'bold',
      marginRight: 10,
      color: 'black'
    },
    bottomText: {
      fontSize: 20,
      color: 'black',
      marginRight: 10,
    },
    dateText: {
      color: Color.n_default_gray,
      fontSize: 16,
      position: 'absolute',
      right: 15,
      top: 10,
    },
    dateRow: {
        position: 'absolute',
        right: 1,
    },
});

export default HomeworkIconInfoItem;