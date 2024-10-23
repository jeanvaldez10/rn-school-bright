import React from 'react';
import { useState, useEffect } from "react";
import { StyleSheet, View, Modal, Text, TouchableOpacity } from 'react-native';
import GradientButton from './GradientButton';
import Color from '../constants/color';
import { Calendar } from 'react-native-calendars';
import Picker from '@gregfrench/react-native-wheel-picker';
import moment from 'moment';
import translang from '../utils/language.utils';

export default function TimerPickerModal({
  isVisible,
  onTimeSelect,
  selectedTime,
}) {
  const [selected, setSelected] = useState(selectedTime ? moment(selectedTime).format('YYYY-MM-DDTHH:mm') : moment().format('YYYY-MM-DDTHH:mm'));
  const _onTimeSelect = onTimeSelect !== undefined ? onTimeSelect : () => {};

  const onOk = () => {
    _onTimeSelect(selected);
  };

  const onCancel = () => {
    _onTimeSelect(null);
  };

  let hours = [];
  let minutes = [];
  for (i = 0; i < 24; i++) {
    hours.push(i);
  }
  for (i = 0; i < 60; i++) {
    minutes.push(i);
  }

  onHourChanged = (index) => {
    const dateTime = moment(selected);
    dateTime.set({h: index});
    setSelected(dateTime.format('YYYY-MM-DDTHH:mm'));
  };

  onMinuteChanged = (index) => {
    const dateTime = moment(selected);
    dateTime.set({m: index});
    setSelected(dateTime.format('YYYY-MM-DDTHH:mm'));
  };

  return (
    <Modal
      animationType='none'
      transparent={true}
      key="modal"
      visible={isVisible}>
      <TouchableOpacity
       style={[styles.centeredView]} 
       activeOpacity={1}
       onPress={() => onCancel()}>
       <TouchableOpacity 
        style={[styles.dialogStyle]} 
        activeOpacity={1}>
          
        <View>
          <Text style={{color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold'}}>{translang.t('HOMEWORK_time')}</Text>
          <View style={{width: '100%', height: 1, backgroundColor: Color.n_default_orange}}/>
        </View>
        <View style={{flexDirection: 'row', height: 200, justifyContent: 'center', alignItems: 'center'}}>
          <Picker 
            style={{flex: 1, height: '90%'}} 
            itemStyle={{color:Color.n_scorpion, fontSize:54, fontFamily: 'THSarabunNew', fontWeight: 'bold'}} 
            selectedValue={moment(selected).hour()} 
            onValueChange={(index) => onHourChanged(index)}>
            {hours.map((value, i) => (
              <Picker.Item label={`${value}`} value={value} key={"hours"+value} />
            ))}
          </Picker>
          <Text style={{marginHorizontal: 5, color:Color.n_scorpion, fontSize:54, fontFamily: 'THSarabunNew', fontWeight: 'bold'}}>:</Text>
          <Picker 
            style={{flex: 1, height: '90%'}} 
            itemStyle={{color:Color.n_scorpion, fontSize:54, fontFamily: 'THSarabunNew', fontWeight: 'bold'}} 
            selectedValue={moment(selected).minute()} 
            onValueChange={(index) => onMinuteChanged(index)}>
            {minutes.map((value, i) => (
              <Picker.Item label={`${value}`} value={value} key={"minutes"+value} />
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
            
        </TouchableOpacity>
      </TouchableOpacity>
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
