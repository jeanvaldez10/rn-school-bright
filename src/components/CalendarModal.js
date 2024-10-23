import React from 'react';
import { useState, useEffect } from "react";
import { StyleSheet, View, Modal, TouchableOpacity, Text, BackHandler } from 'react-native';
import GradientButton from './GradientButton';
import Color from '../constants/color';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import moment from 'moment';
import translang, {getCurrentLocale} from '../utils/language.utils';


export default function CalendarModal({
  isVisible,
  onDateSelect,
  onStartingDateSelect,
  type, // single, period
  minDate,
  maxDate,
  selectedDate,
  startDate,
  endDate,
  selectColor,
  todayColor,
}) {


  LocaleConfig.locales['th'] = {
    monthNames: ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'],
    monthNamesShort: ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'],
    dayNames: ['อา.', 'จ.','อ.','พ.','พฤ.','ศ.','ส.'],
    dayNamesShort: ['อา.', 'จ.','อ.','พ.','พฤ.','ศ.','ส.']
  };

  LocaleConfig.locales['en'] = {
    monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    monthNamesShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    dayNames: ['Sun', 'Mon','Tue', 'Wed','Thu','Fri','Sat'],
    dayNamesShort: ['Sun', 'Mon','Tue', 'Wed','Thu','Fri','Sat'],
  };

  if (getCurrentLocale() == 'th'){
    LocaleConfig.defaultLocale = 'th';
  }else{
    LocaleConfig.defaultLocale = 'en';
  }


  const [selected, setSelected] = useState(selectedDate ? moment(selectedDate).format('YYYY-MM-DD') : '');
  const [_startDate, setStartDate] = useState(startDate ? moment(startDate).format('YYYY-MM-DD') : '');
  const [_endDate, setEndDate] = useState(endDate ? moment(endDate).format('YYYY-MM-DD') : '');
  const _selectColor = selectColor ?? Color.n_default_brown;
  const _todayColor = todayColor ?? Color.n_default_green_dark;
  const _onDateSelect = onDateSelect !== undefined ? onDateSelect : () => {};

  const _minDate = minDate !== undefined ? moment(minDate).format('YYYY-MM-DD') : null;
  const _maxDate = maxDate !== undefined ? moment(maxDate).format('YYYY-MM-DD') : null;

  let markedDates = {};

  if (type === 'period') {
    if (_startDate !== '' && _endDate !== '') {
      const _start = moment(_startDate);
      const _end = moment(_endDate);
      const current = _start.clone().add(1, 'days');

      let startKey = _start.format('YYYY-MM-DD');
      let endKey = _end.format('YYYY-MM-DD');
      if (startKey === endKey) {
        markedDates[startKey] = {
          startingDay: true,
          endingDay: true,
          color : _selectColor,
          textColor: 'white'
        };
      } else {
        markedDates[startKey] = {
          startingDay: true,
          endingDay: false,
          color : _selectColor,
          textColor: 'white'
        };
        markedDates[endKey] = {
          startingDay: false,
          endingDay: true,
          color : _selectColor,
          textColor: 'white'
        };
      }

      while (current.isBefore(_end, 'days')) {
        const key = current.format('YYYY-MM-DD');
        markedDates[key] = {
          color : _selectColor,
          textColor: 'white'
        };
        current.add(1, 'days');
      }
    }
  } else {
    if (selected !== '') {
      const key = moment(selected).format('YYYY-MM-DD');
      markedDates[key] = {
        selected: true,
        disableTouchEvent: true,
        color: _selectColor,
        selectedColor : _selectColor,
        textColor: 'white'
      };
    }
  }

  const onDayPress = day => {
    const dateString = day.dateString;
    if (type === 'period') {
      if (_startDate === '' || _startDate !== _endDate) {
        setStartDate(dateString);
        setEndDate(dateString);
      } else if (moment(_startDate).isSameOrBefore(moment(dateString))) {
        setEndDate(dateString);
      } else {
        setStartDate(dateString);
        setEndDate(dateString);
      }
    } else {
      setSelected(dateString);
    }
  };

  const onOk = () => {
    if (type === 'period') {
      if(_startDate != "" && _endDate != ""){
        _onDateSelect({start: _startDate, end: _endDate});
      }
    } else {
      if(selected != ""){
        _onDateSelect(selected);
      }
    }
  };

  return (
    <Modal
      animationType='none'
      transparent={true}
      key="modal"
      visible={isVisible}
      onRequestClose={() => _onDateSelect(null)}>

      <TouchableOpacity style={[styles.centeredView]} activeOpacity={1}
        onPressOut={() => { _onDateSelect(null) }}>
        <TouchableOpacity style={[styles.dialogStyle]} activeOpacity={1}>
          <View>
            <Text style={{color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold'}}>{translang.t('Select_Date')}</Text>
            <View style={{width: '100%', height: 1, backgroundColor: Color.n_default_orange}}/>
          </View>
          <Calendar
            style={styles.calendar}
            onDayPress={onDayPress}
            monthFormat={'MMMM yyyy'}
            markedDates={markedDates}
            markingType={type=='period'?type:'custom'}
            hideExtraDays={false}
            disableAllTouchEventsForDisabledDays={false}

            minDate={_minDate}
            maxDate={_maxDate}

            theme={{
              textDayFontSize: 13,
              dayTextColor: Color.n_default_gray,
              // todayBackgroundColor: _todayColor,
              todayTextColor: 'white',
              textSectionTitleColor: Color.n_default_gray,
              arrowColor: Color.n_default_gray,

              'stylesheet.calendar.header': {
                monthText: {
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: Color.n_default_gray,
                },
                week: {
                  marginTop: 35,
                  marginHorizontal: 12,
                  flexDirection: 'row',
                  justifyContent: 'space-between'
                },

              },

              'stylesheet.day.period': {
                today: {
                  fontFamily: 'THSarabunNew',
                  backgroundColor: Color.n_default_green_dark,
                  borderRadius: 16,
                }
              },
              'stylesheet.day.basic': {
                today: {
                  fontFamily: 'THSarabunNew',
                  backgroundColor: Color.n_default_green_dark,
                  borderRadius: 16,
                }
              },
            }}
          />
          <View style={{ justifyContent: 'center', alignItems: 'center', width: '100%'}}>
            <GradientButton
              label={translang.t('Select')}
              containerStyle={styles.containerButtonStyle}
              buttonStyle={styles.buttonStyle}
              colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
              isVerticalGradient={false}
              _onPress={() => onOk()} />
          </View>


        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000090',
  },
  dialogStyle: {
    width: '90%',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 15,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  calendar: {
    marginHorizontal: 0,
    marginVertical: 30,
    borderRadius: 20,
    paddingTop: 10,
    paddingBottom: 20,
    shadowColor: 'black',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    elevation: 2,
  },

  containerButtonStyle: {
    width: 116,
    height: 44,
    marginTop: 20,
    borderRadius: 22,
    shadowColor: 'black',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    elevation: 4
  },

  buttonStyle: {
    width: '100%',
    height: '100%',

  }
});
