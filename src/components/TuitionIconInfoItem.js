import { Col, Right } from 'native-base';
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Color from '../constants/color';
import Images from '../themes/Images';
import translang, { getCurrentLocale } from '../utils/language.utils';
import NumberFormat from 'react-number-format';
import { types } from '@babel/core';
const TuitionIconInfoItem = ({ ...props }) => {
    const { value_txt, dateText, status_flag, valYear, valTerm, valAmount, balance} = props;
    const { topTextStyle, middleTextStyle, bottomTextStyle, } = props;

    var typeStr = "";
    var barColor = Color.white;
    var valueStr = "";
    if(status_flag == 0){
      typeStr = `(${translang.t('PENDING')})`;
      barColor = Color.n_default_brown;
      valueStr = `(${translang.t('PAYMENT_WITHIN')}${value_txt})`
    }else if(status_flag == 1){
      typeStr = `(${translang.t('TUITION_PAID')})`;
      barColor = Color.n_button_gradient_green_start;
    }else if(status_flag == 2){
      typeStr = `(${translang.t('OVERDUE')})`;
      barColor = Color.n_default_orange;
      valueStr = `(${translang.t('OVERDUE_SINCE')}${value_txt})`
    }

    return (
      <View style={styles.menuItem} >
        <View style={[styles.statusImage, {backgroundColor: barColor}]}></View>
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <Text style={styles.dateText}>{dateText}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={[styles.topText, topTextStyle]}> {translang.t('Tuition_Notification')}</Text>
            <Text style={{...styles.statusText, color: barColor}}> {typeStr} </Text>
          </View>
          <Text style={[styles.middleText, middleTextStyle]}>{`${translang.t('ACADEMIC_year')} ${valYear} ${translang.t('ACADEMIC_semester')} ${valTerm}`}</Text>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <Text style={[styles.middleText, middleTextStyle]}>{translang.t('AMOUNT_PAYMENT')}</Text>
            <NumberFormat
              value={valAmount}
              displayType={'text'}
              thousandSeparator={true}
              renderText={value => (<Text style={[styles.middleText, middleTextStyle]}>{value}</Text>)}/>
          </View>
            <View style={{flex: 1, flexDirection: 'row'}}>
                <Text style={[styles.middleText, middleTextStyle]}>{translang.t('TUITION_List_balance')}</Text>
                <NumberFormat
                    value={balance}
                    displayType={'text'}
                    thousandSeparator={true}
                    renderText={value => (<Text style={[styles.middleText, middleTextStyle]}>{value}</Text>)}/>
            </View>
          {status_flag != 1 && <Text style={[styles.bottomText, bottomTextStyle]}>{valueStr}</Text>}
        </View>
        <View style={styles.dateRow}>
        </View>
      </View>
    );
};

const styles = StyleSheet.create({
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusImage: {
      height: '80%',
      width: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'red',
      marginRight: 8,
      marginLeft: -14,
      borderRadius: 4,
    },
    topText: {
      fontFamily: 'THSarabunNew',
      fontSize: 24,
      color: 'black',
      fontWeight: 'bold',
      marginLeft: 15,
    },
    middleText: {
      fontFamily: 'THSarabunNew',
      color: Color.n_default_gray,
      fontSize: 20,
      marginLeft: 15,
    },
    bottomText: {
      fontFamily: 'THSarabunNew',
      color: Color.n_default_gray,
      fontSize: 20,
      marginLeft: 15,
    },
    statusText: {
      fontFamily: 'THSarabunNew',
      color: Color.n_default_gray,
      fontSize: 20,
      marginLeft: 15,
    },
    dateText: {
      fontFamily: 'THSarabunNew',
      color: '#00000040',
      fontSize: 20,
      fontWeight: 'bold',
      width: "100%",
      textAlign: 'right',

    },
});

export default TuitionIconInfoItem;
