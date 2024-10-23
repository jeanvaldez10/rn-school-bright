import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import Color from '../constants/color';

const IconInfoItemNoImg = ({...props}) => {
    const { label, value_txt, right_text } = props;
    const { topTextStyle, bottomTextStyle, rightTextStyle } = props;



    return (
      <View style={styles.menuItem} >
        <View style={{ flexDirection: 'column' }}>
          <Text style={[styles.topText, topTextStyle]}>{label}</Text>
          <Text style={[styles.bottomText, bottomTextStyle]}>{value_txt}</Text>
        </View>
        <Text style={rightTextStyle}>{right_text}</Text>
      </View>
    );
};

const styles = StyleSheet.create({
  menuItem: {
    paddingLeft: 15,
    marginTop: 'auto',
    marginBottom: 'auto',
    paddingTop: 10,
    paddingBottom: 10,

    flexDirection: 'row', 
    justifyContent: 'space-between',
  },
  topText: {
    fontSize: 24, 
    color: Color.n_default_gray 
  },
});

export default IconInfoItemNoImg;