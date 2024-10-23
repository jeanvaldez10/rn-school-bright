import React, { Component } from 'react';
import { Image, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { DrawerActions } from 'react-navigation-drawer';

import styles from './TimeTableStyle';
import WeekDays from '../../components/weekDays';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import Images from '../../themes/Images';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const monthNamesTH = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  "กันยายน",
  "ตุลาคม",
  'พฤศจิกายน',
  'ธันวาคม',
];

const MenuItem = (props) => {
  const { icon_mark, label, sub_text, onPressMenu } = props;

  let _label = '-';
  let _subText = '';

  if (label && label !== '') {
    _label = label;
  }

  if (sub_text !== undefined && sub_text !== null) {
    if (sub_text !== '') {
      _subText = `:  ${sub_text}`;
    } else {
      _subText = ':  -';
    }
  } else {
    _subText = '';
  }

  return (
    <View style={{ width: '100%', paddingHorizontal: 0, paddingBottom: 0 }}>
      <View style={styles.menuItem} onPress={onPressMenu}>
        <Image source={icon_mark} style={{ height: 32, width: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16 }}></Image>
        <Text
          style={{ flex: 1, fontSize: 22, fontWeight: 'bold', marginVertical: 10, marginHorizontal: 10, color: Color.dark}}>
          {_label}
        </Text>
        {_subText !== '' &&
          <Text style={{ flex: 1, fontSize: 22, fontWeight: 'bold', marginVertical: 10, marginHorizontal: 10, color: Color.dark }}>
            {_subText}
          </Text>
        }
      </View>
    </View>
  );
};

export default class TimeTableScreen extends Component {
  state = {
    selectedDate: null,
    userInfo: {},
    scheduleList: [],
    selectedScheduleDetail: null,
    expandedIndex: -1,
    isLoading: false,
  }

  async componentDidMount() {
    const today = new Date();
    const userInfo = await Storage.getUserInfo();
    this.setState({ selectedDate: today, userInfo: userInfo });
    this.loadData(today);
  }

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
  };

  loadData = (date) => {
    this.setState({ isLoading: true });

    const userInfo = this.state.userInfo;
    const isStudent = (userInfo.StudentId ?? '') !== ''
  
    ApiManager.getTimeTableList(userInfo.ID, userInfo.SchoolID, !isStudent, date).then(list => {
      this.setState({ scheduleList: list, expandedIndex: -1, isLoading: false });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };

  loadScheduleDetail = (index) => {
    this.setState({ isLoading: true });

    const userInfo = this.state.userInfo;
    const schedule = this.state.scheduleList[index];
    const isStudent = (userInfo.StudentId ?? '') !== ''

    ApiManager.getTimeTableDetail(userInfo.ID, schedule.ScheduleId, !isStudent, this.state.selectedDate).then(detail => {
      this.setState({ expandedIndex: index, selectedScheduleDetail: detail, isLoading: false });
    }).catch(error => {
      console.log(error);
      this.setState({ selectedScheduleDetail: null, isLoading: false });
    });
  }

  onDateSelected = (date) => {
    this.setState({selectedDate: date});
    this.loadData(date);
  }

  onExpandItem = (index) => {
    if (this.state.expandedIndex === index) {
      this.setState({expandedIndex: -1, selectedScheduleDetail: null});
    } else {
      this.loadScheduleDetail(index);
    }
  };

  renderScheduleItem = (index) => {
    const schedule = this.state.scheduleList[index];
    const scheduleDetail = this.state.selectedScheduleDetail;
    const isExpanded = (this.state.expandedIndex === index) && (scheduleDetail !== null);
    
    //{scheduleDetail !== null ? scheduleDetail.ScheduleName ?? '-' : '-'}
    return (
      <TouchableOpacity style={styles.card}>
        <View style={styles.cardheader}>
          <View style={styles.cardheaderitems}>
            <Text style={{...styles.cardheaderitemstext, fontWeight: 'bold',}}>{schedule.ScheduleName}</Text>
          </View>
          <View style={styles.cardheaderitems}>
            <Text style={{...styles.cardheaderitemstext, textAlign: 'center'}}>{schedule.TimeIn} - {schedule.TimeOut}</Text>
            <Text style={{...styles.cardheaderitemstext, fontWeight: 'bold', fontSize: 24, textAlign: 'center'}}>{schedule.CourseCode}</Text>
          </View>
        </View>
        <View style={styles.cardbody}>
          <View style={styles.cardbodytextcontaienr}>
            <Text style={{...styles.cardbodytext, width: 120, fontWeight: 'bold'}}>{translang.t('TIMETABLE_classlevel')} : </Text>
            <Text style={{...styles.cardbodytext, flex: 1 }}>{scheduleDetail !== null ? scheduleDetail.classname ?? '-' : '-'}</Text>
          </View>
          <View style={styles.cardbodytextcontaienr}>
            <Text style={{...styles.cardbodytext, width: 120, fontWeight: 'bold'}}>{translang.t('TIMETABLE_room')} : </Text>
            <Text style={{...styles.cardbodytext, flex: 1 }}>{scheduleDetail !== null ? scheduleDetail.Room ?? '-' : '-'}</Text>
          </View>
          <View style={styles.cardbodytextcontaienr}>
            <Text style={{...styles.cardbodytext, width: 120, fontWeight: 'bold'}}>{translang.t('TIMETABLE_teacher')} : </Text>
            <Text style={{...styles.cardbodytext, flex: 1 }}>{scheduleDetail !== null ? scheduleDetail.TeacherName ?? '-' : '-'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    const today = new Date();
    return (
      <SafeAreaView style={styles.container} edges={['right', 'bottom','top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_timetable')}
          onMenuTap={() => {this.props.navigation.goBack();}}
        />
        <View style={styles.calendarContainer}>
          <Text style={styles.monthLable}>
            {getCurrentLocale() == 'en' ? monthNames[new Date().getMonth()] : monthNamesTH[new Date().getMonth()]}
          </Text>
          <WeekDays 
            currentDate={today} 
            selectedDate={this.state.selectedDate}
            onSelectDate={ date => this.onDateSelected(date) } />
          {this.state.scheduleList.map((value, index) => {
            return this.renderScheduleItem(index);
          })}
        </View>

        <ScrollView style={styles.constainer} indicatorStyle={'black'}>
          {this.state.scheduleList.length === 0 && 
          <View style={{height: '100%', justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{ fontSize: 25, marginVertical: 5, marginHorizontal: 10, color: Color.dark}}>
              {translang.t('NOT_FOUND_DATA')}
            </Text>
          </View>
          }
        </ScrollView>
        <ProgressHud isVisible={this.state.isLoading} />
      </SafeAreaView>
    );
  }
}
