import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import Color from '../constants/color';

const AttachInfoItemNoIcon = ({...props}) => {
    const {label, icon_attach, show_bottom } = props;
    return (
      <View style={[props.style]}>
        <View style={styles.menuItem} >
          <View style={{ flexDirection: 'column' }}>
            <Text style={[styles.topText]}>{label}</Text>
            <Image source={icon_attach} style={[styles.bottomImage]}></Image>
          </View>
        </View>
        {show_bottom && <View style={{ height: 1, width: '100%', backgroundColor: '#E8E8E8', marginLeft: 50 }} />}
      </View>
    );
};

const styles = StyleSheet.create({
    menuItem: {
        flexDirection: 'row',
    },
    topText: {
        fontSize: 24, 
        fontWeight: 'bold',
        color: Color.n_default_orange,
    },
    bottomImage: { 
      width: 100,
      height: 100,
      resizeMode: 'contain',
      marginVertical: 5, 
      marginHorizontal: 10,  
    }
});

export default AttachInfoItemNoIcon;