import React from 'react';
import { useState, useEffect } from "react";
import { StyleSheet, View, Modal, Text, TouchableOpacity } from 'react-native';
import GradientButton from './GradientButton';
import Color from '../constants/color';
import { Calendar } from 'react-native-calendars';
import Picker from '@gregfrench/react-native-wheel-picker';
import moment from 'moment';
import translang from '../utils/language.utils';

export default function YearRangePickerModal({
  isVisible,
  onRangeelect,
  selectedStart,
  selectedEnd,
}) {
  const [_selectedStart, setSelectedStart] = useState(selectedStart ? selectedStart : 2000);
  const [_selectedEnd, setSelectedEnd] = useState(selectedEnd ? selectedEnd : 2000);
  const _onRangeelect = onRangeelect !== undefined ? onRangeelect : () => {};

  const onOk = () => {
    _onRangeelect({start: _selectedStart, end: _selectedEnd});
  };

  let startYearList = [];
  let endYearList = [];
  for (i = 2000; i < 3100; i++) {
    startYearList.push(i);
    endYearList.push(i);
  }
  
  onStartChanged = (value) => {
    setSelectedStart(value);
  };

  onEndChanged = (value) => {
    setSelectedEnd(value);
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
            <Text style={{color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold'}}>{translang.t('PROFILE_PERIOD')}</Text>
            <View style={{width: '100%', height: 1, backgroundColor: Color.n_default_orange}}/>
          </View>
          <View style={{flexDirection: 'row', height: 200, justifyContent: 'center', alignItems: 'center'}}>
            <Picker 
              style={{flex: 1, height: '90%'}} 
              itemStyle={{color:Color.n_scorpion, fontSize:54, fontFamily: 'THSarabunNew', fontWeight: 'bold'}} 
              selectedValue={_selectedStart} 
              onValueChange={(index) => onStartChanged(index)}>
              {startYearList.map((value, i) => (
                <Picker.Item label={`${value}`} value={value} key={value} />
              ))}
            </Picker>
            <Text style={{marginHorizontal: 5, color:Color.n_scorpion, fontSize:54, fontFamily: 'THSarabunNew', fontWeight: 'bold'}}>:</Text>
            <Picker 
              style={{flex: 1, height: '90%'}} 
              itemStyle={{color:Color.n_scorpion, fontSize:54, fontFamily: 'THSarabunNew', fontWeight: 'bold'}} 
              selectedValue={_selectedEnd} 
              onValueChange={(index) => onEndChanged(index)}>
              {endYearList.map((value, i) => (
                <Picker.Item label={`${value}`} value={value} key={value} />
              ))}
            </Picker>
          </View>

          
          <GradientButton
            label={translang.t('Select')}
            containerStyle={{ width: 116, marginLeft: 'auto', marginRight: 'auto' }}
            buttonStyle={{ borderRadius: 22, height: 44 }}
            colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
            isVerticalGradient={false}
            _onPress={() => onOk()} />
          
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
