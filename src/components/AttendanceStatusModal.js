import React, { Component } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity } from 'react-native';
import Color from '../constants/color';
import LinearGradient from 'react-native-linear-gradient';
import { AttendanceStatusValueArray, AttendanceStatusMap, AttendanceStatusMapOneColor } from '../constants/constants';
import translang, { getCurrentLocale } from '../utils/language.utils';

class AttendanceStatusModal extends Component
{
  constructor(props) {
    super(props);

  }

  async componentDidMount() {
    
  }

  onSelected = (index) => {
    const onSelect = this.props.onSelect ?? (() => {});
    // const value = AttendanceStatusValueArray[index];
    // onSelect(value);
    
    onSelect(index);
  }

  onCanceled = ()=>{
    const onCan = this.props.onCan ?? (() => {});
    onCan();
  }

  renderStatusItem = (index) => {
    // const value = AttendanceStatusValueArray[index];
    const AttendanceStatusTitle = {
      '0': {title: translang.t('ATTENDANCE_STATUS_on_time')},
      '1': {title: translang.t('ATTENDANCE_STATUS_late')},
      '3': {title: translang.t('ATTENDANCE_STATUS_absence')},
      '99': {title: translang.t('ATTENDANCE_STATUS_undefined')},
      '-1': {title: translang.t('ATTENDANCE_STATUS_undefined')},
      '10': {title: translang.t('ATTENDANCE_STATUS_personal_leave')},
      '11': {title: translang.t('ATTENDANCE_STATUS_sick_leave'),},
      '12': {title: translang.t('ATTENDANCE_STATUS_event'),},
      '6': {title: translang.t('ATTENDANCE_STATUS_holiday')},
      '8': {title: translang.t('ATTENDANCE_STATUS_holiday')},
      '9': {title: translang.t('ATTENDANCE_STATUS_holiday')},
    };

    const colors = AttendanceStatusMapOneColor[index].color;
    const title = AttendanceStatusTitle[index].title;

    return (
      <TouchableOpacity style={styles.statusItemContainer} activeOpacity={0.7} onPress={() => this.onSelected(index) }>
        <View style={{...styles.statusItem, backgroundColor: colors}}>
          <Text style={styles.statusTitle}>{title}</Text>
        </View>
{/* 
        <LinearGradient
          style={styles.statusItem}
          start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }}
          colors={colors}>
          <Text style={styles.statusTitle}>{title}</Text>
        </LinearGradient> */}
      </TouchableOpacity>
    )
  };

  render() {
    const { isVisible } = this.props;

    return (
      <Modal
        animationType='fade'
        transparent={true}
        key="modal"
        visible={isVisible}>
        <TouchableOpacity  style={styles.centeredView}  onPress={()=>this.onCanceled()}>
          <View>
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
              {
                this.renderStatusItem(0)
              }
              {
                this.renderStatusItem(1)
              }
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
              {
                this.renderStatusItem(3)
              }
              {
                this.renderStatusItem(10)
              }
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
              {
                this.renderStatusItem(11)
              }
              {
                this.renderStatusItem(12)
              }
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
              {
                this.renderStatusItem(99)
              }
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000A0',
  },
  statusItemContainer: {
    marginVertical: 10,
    marginHorizontal: 15,
  },
  statusItem: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '400',
    color: Color.white,
    textAlign: 'center',
  }
});

export default AttendanceStatusModal;