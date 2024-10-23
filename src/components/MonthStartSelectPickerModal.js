import React from 'react';
import { useState, useEffect } from "react";
import { StyleSheet, View, Modal, Text, TouchableOpacity } from 'react-native';
import GradientButton from './GradientButton';
import Color from '../constants/color';
import { Calendar } from 'react-native-calendars';
import Picker from '@gregfrench/react-native-wheel-picker';
import moment from 'moment';
import translang from '../utils/language.utils';

export default function MonthStartSelectPickerModal({
  isVisible,
  onok,
  oncancel,
}) {
  const [_selectedMonth, setSelectedMonth] = useState(0);
  const [_selectedYear, setSelectedYear] = useState(0);

  useEffect(() => {
    
  });

  const _onOk = () => {
    let resDate = {};
    let month = "";
    if(_selectedMonth > 8){
      month = `${_selectedMonth + 1}`;
    }else{
      month = `0${_selectedMonth + 1}`;
    }
    let temp = `${yearList[_selectedYear]}-${month}-01`;
    let starDate = moment(temp);
    let endDate = moment(temp).endOf('month');
    resDate = {start: starDate, end: endDate}
    
    onok(resDate);
  };

  const _onCancel = () => {
    oncancel();
  };
  
  const monthList = [translang.t('JAN'), translang.t('FEB'), translang.t('MAR'), translang.t('APR'), translang.t('MAY'), translang.t('JUN'), translang.t('JUL'), translang.t('AUG'), translang.t('SEP'), translang.t('OCT'), translang.t('DEC'), translang.t('NOV')];
  let yearList = [];
  for (i = 2010; i < 2050; i++) {
    yearList.push(i);
  }
  
  onMonthChanged = (value) => {
    setSelectedMonth(value);
  };

  onYearChanged = (value) => {
    setSelectedYear(value);
  };

  return (
    <Modal
      animationType='none'
      transparent={true}
      key="modal"
      visible={isVisible}>

      <View style={[styles.centeredView]}>
        <View style={[styles.dialogStyle]}>
          <View>
            <Text style={{color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold'}}>{translang.t('SELECT_MONTH')}</Text>
            <View style={{width: '100%', height: 1, backgroundColor: Color.n_default_orange}}/>
          </View>
          <View style={{flexDirection: 'row', height: 200, justifyContent: 'center', alignItems: 'center'}}>
            <Picker 
              style={{flex: 1, height: '90%'}} 
              itemStyle={{color:Color.n_scorpion, fontSize:54, fontFamily: 'THSarabunNew', fontWeight: 'bold'}} 
              selectedValue={_selectedMonth} 
              onValueChange={(index) => this.onMonthChanged(index)}>
              {monthList.map((value, i) => (
                <Picker.Item label={`${value}`} value={i} key={value} />
              ))}
            </Picker>
            <Text style={{marginHorizontal: 5, color:Color.n_scorpion, fontSize:54, fontFamily: 'THSarabunNew', fontWeight: 'bold'}}> </Text>
            <Picker 
              style={{flex: 1, height: '90%'}} 
              itemStyle={{color:Color.n_scorpion, fontSize:54, fontFamily: 'THSarabunNew', fontWeight: 'bold'}} 
              selectedValue={_selectedYear} 
              onValueChange={(index) => this.onYearChanged(index)}>
              {yearList.map((value, i) => (
                <Picker.Item label={`${value}`} value={i} key={value} />
              ))}
            </Picker>
          </View>
          
          <View style={{marginLeft: 'auto', marginRight: 'auto', flexDirection: 'row'}}>
            <GradientButton
              label={translang.t('COMMON_cancel')}
              containerStyle={{ width: 116, marginRight: 20 }}
              buttonStyle={{ borderRadius: 22, height: 44 }}
              colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
              isVerticalGradient={false}
              _onPress={() => _onCancel()} />
            <GradientButton
              label={translang.t('Select')}
              containerStyle={{ width: 116}}
              buttonStyle={{ borderRadius: 22, height: 44 }}
              colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
              isVerticalGradient={false}
              _onPress={() => _onOk()} />
          </View>
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
    paddingTop: 30,
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
});
