import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Color from '../constants/color';
import Images from '../themes/Images';

const MessageIconInfoItem = ({ ...props }) => {
    const { icon, label, value_txt, dateText, isRead } = props;
    const { topTextStyle, bottomTextStyle, } = props;

    const backgroundColor = !isRead ? Color.n_background_white : Color.n_default_orange_light;

    return (
      <View style={[{backgroundColor: backgroundColor}, styles.menuContainer, props.style]}>
        <Text style={styles.dateText}>{dateText}</Text>
        <View style={styles.menuItem} >
          <View style={styles.imageContainer}>
            <Image source={icon ?? Images.school_bright_icon_data} style={[styles.image]}></Image>    
          </View>
          <View style={{ flex: 1, marginLeft: 25, marginRight: 10}}>
            <Text style={[styles.topText, topTextStyle]}>{label}</Text>
            <Text numberOfLines={1} style={[styles.bottomText, bottomTextStyle]}>{value_txt}</Text>
          </View>                
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
    marginTop: 30,
    marginBottom: 10,
    flexDirection: 'row',
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotimg: {
    width: 15, 
    height: 15, 
    borderRadius: 7.5,  
  },
  image: {
    height: '100%',
    width: '100%',
    
    resizeMode: 'contain',
  },
  imageContainer:{
    width: 50,
    height: 50, 
    borderRadius: 25,
    backgroundColor: Color.white,
    marginLeft: 15,
  },
  topText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Color.n_default_orange,
  },
  bottomText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  dateText: {
    position: 'absolute',
    right: 30,
    top: 10,
    color: '#00000040',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  dateRow: {
      marginTop: 1,
      marginVertical: 5,
  },
});

export default MessageIconInfoItem;