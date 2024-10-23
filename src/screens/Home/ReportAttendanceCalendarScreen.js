import React, { useState } from 'react';
import { Image, View, BackHandler, TouchableOpacity, ImageBackground, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import { ScrollView } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import { Icon } from 'native-base';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import Caretdown from 'react-native-vector-icons/AntDesign';
import moment from 'moment';

import NavigationBar from '../../components/NavigationBar';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import BackNavigationBar from '../../components/BackNavigationBar';

const MenuItem = (props) => {
  const { label, show_caret, flag_open, onPressMenu, onPressCaret } = props;
  return (
    <View style={styles.menuCont}>
      <Text style={{ fontFamily: 'THSarabunNew', fontSize: 25, fontWeight: 'bold', marginVertical: 2, marginHorizontal: 10, color: Color.white }}>
        {label}
      </Text>
    </View>
  );
};

export default class ReportAttendanceCalendarScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: '',
      isOpenCalendar: true,
      selectedDate: null,
      userInfo: {},
      classLevel: {},
      classRoom: {},
      terminfo: {},
      isLoading: false,
      studentStatusList: [],
      selectedDateData: null,
      planID: "",
    };

  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      let today = moment();

      const selectedYear = this.props.navigation.getParam('year');
      const userInfo = this.props.navigation.getParam('userInfo');
      const terminfo = this.props.navigation.getParam('terminfo');
      const classLevel = this.props.navigation.getParam('classLevel');
      const classRoom = this.props.navigation.getParam('classRoom');

      const initDate = terminfo.dStart;

      console.log("Init Date:", terminfo);
      const current = moment();
      let _selDate = moment(initDate);

      if(current.isAfter(terminfo.dStart) && current.isBefore(terminfo.dEnd)){
        _selDate = current;
      }

      // this.setState({ studentStatusList: list, selectedDate: date, selected: _selDate, isLoading: false});

      this.setState({ selectedDate: _selDate, selected: initDate, userInfo: userInfo, classLevel: classLevel, classRoom: classRoom, terminfo: terminfo }, () => {
        this.loadData(_selDate);
      });
    });
  }

  componentWillUnmount = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }
    if(this.focusListener){
      this.focusListener.remove();
    }
  };

  loadData = (date) => {
    this.setState({ isLoading: true });

    const {userInfo, classRoom} = this.state;

    ApiManager.getHistoryStudentStatusList(userInfo.SchoolID, classRoom.ID, date).then(list => {
      const _selDate = moment(date).format('YYYY-MM-DD');
      this.setState({ studentStatusList: list, selectedDate: date, selected: _selDate, isLoading: false});
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };

  back = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }
    this.props.navigation.navigate("ReportAttendance");
  };

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
  };

  __next = () => {
    const classLevel = this.state.classLevel;
    const classRoom = this.state.classRoom;
    const selectedDate = this.state.selected;
    const studentStatusList = this.state.studentStatusList;

    const params = {
      classLevel: classLevel,
      classRoom: classRoom,
      date: selectedDate,
      statusList: studentStatusList,
      userInfo: this.state.userInfo,
      parent: 'ReportAttendanceCalendar',
    };

    this.props.navigation.navigate('ReportAttendanceStatusList', params);
  }

  renderAttendanceItem = (itemColor, title, percentage) => {
    return (
      <View style={styles.attendanceItem}>
				<View
					style={{...styles.attendanceItemMarkImage, backgroundColor: itemColor}}
				/>
        <Text style={{ ...styles.attendanceItemLabel, flex: 1, marginHorizontal: 20 }}>{title}</Text>
        <Text style={{ ...styles.attendanceItemLabel, flex: 1, marginHorizontal: 20 }}>{percentage} {translang.t('PEOPLE')}</Text>
      </View>
    )
  };

  render() {
    let onTime = 0;
    let late = 0;
    let absence = 0;
    let sickLeave = 0;
    let personalLeave = 0;
    let event = 0;
    let other = 0;
    if(this.state.studentStatusList.length > 0){
      this.state.studentStatusList.forEach(status => {
        if(status.Student_State !=0 ){
          other++;
        }else{
          if (status.status == '0' || status.status == '7') {
            onTime++;
          } else if (status.status == '1') {
            late++;
          } else if (status.status == '3') {
            absence++;
          } else if (status.status == '4' || status.status == '10') {
            personalLeave++;
          } else if (status.status == '5' || status.status == '11') {
            sickLeave++;
          } else if (status.status == '6' || status.status == '12') {
            event++;
          } else if(status.status == '99' || status.status == '-1' || status.status == '' || status.status == '8' || status.status == '9'){
            other++;
          }
        }
      })
    }

    // const total = onStudy + onDispute + onResigned + onDropped + onGraduated + onLose + onRetired + onExchange;
    const total = onTime + late + absence + sickLeave + personalLeave + event + other;
    const selectedDate = moment(this.state.selectedDate).format('DD MMM YYYY');

    let className = "";
    if(this.state.classRoom.NameTH){
      className = this.state.classRoom.NameTH;
      if(getCurrentLocale() == 'en' && this.state.classRoom.NameEN != ""){
        className = this.state.classRoom.NameEN;
      }
    }

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('CHECK_IN_REPORT')}
          onMenuTap={this.back}
        />
        <ScrollView style={styles.menuContainer} indicatorStyle={'black'}>
          <Calendar
            initialDate={this.state.selected ? this.state.selected : '2021-02-02'}
            style={styles.calendar}
            onDayPress={(day) => {
              this.loadData(moment(day.dateString));
            }}
            onMonthChange={(month) => {
              // const date = moment(month.timestamp);
              // this.loadData(date);
            }}
            monthFormat={'MMMM yyyy'}
            markedDates={{
              [this.state.selected]: {
                selected: true,
                disableTouchEvent: true,
                selectedColor: Color.n_default_orange,
                selectedTextColor: 'white'
              }
            }}

            disabledDaysIndexes={[0, 6]}
            hideExtraDays={false}
            disableAllTouchEventsForDisabledDays={false}

            theme={{
              todayTextColor:'white',
              textDayFontSize: 13,
              dayTextColor: Color.n_default_gray,
              textSectionTitleColor: Color.n_default_gray,
              arrowColor: Color.n_default_gray,

              // arrowColor: 'black',
              'stylesheet.calendar.header': {
                monthText: {
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: Color.n_default_gray,
                },
                week: {
                  marginTop: 5,
                  marginHorizontal: 12,
                  flexDirection: 'row',
                  justifyContent: 'space-between'
                },
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

          <MenuItem label={selectedDate} />

          <TouchableOpacity style={styles.infoContainer} onPress={this.__next}>
            <View style={{minHeight: 35, backgroundColor: Color.n_default_orange, borderTopRightRadius: 15, borderTopLeftRadius: 15,}}>
              <Text style={{...styles.infoTotal, color: Color.white, textAlign: 'center' }}>{translang.t('CLASS_HAVE_PEOPLE', {classroom: className, count: total})}</Text>
            </View>
            {this.renderAttendanceItem(Color.n_button_gradient_green_end, translang.t('ON_TIME'), onTime)}
            {this.renderAttendanceItem(Color.n_default_brown, translang.t('LATE'), late)}
            {this.renderAttendanceItem(Color.n_default_orange, translang.t('ABSENCE'), absence)}
            {this.renderAttendanceItem(Color.n_electric_violet, translang.t('SICK_LEAVE'), sickLeave)}
            {this.renderAttendanceItem(Color.n_seance, translang.t('PERSONAL_LEAVE'), personalLeave)}
            {this.renderAttendanceItem(Color.n_science_blue, translang.t('EVENT'), event)}
            {this.renderAttendanceItem(Color.n_scorpion, translang.t('UNDEFINED'), other)}
          </TouchableOpacity>
        </ScrollView>
        <ProgressHud isVisible={this.state.isLoading} />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white
  },

  menuCont: {
    height: 60,
    marginBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: Color.n_default_brown,
    shadowColor: 'black',
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2.0,
    paddingHorizontal: 30,
    paddingLeft: 30,
  },

  calendar: {
    marginHorizontal: 20,
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

  attendanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginVertical: 0,
  },
  attendanceItemMarkImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  attendanceItemLabel: {
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    textAlign: 'left',
    color: 'black'
  },


  menuContainer: {
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  attendanceItemMarkImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: 20,
    marginVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    width: '100%',
    marginVertical: 6,
    alignItems: 'center'
  },
  infoContainer: {
    borderRadius: 15,
    backgroundColor: Color.white,
    shadowColor: Color.black,
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    margin: 25,
    paddingBottom: 20,
  },
  infoTotal: {
    fontSize: 24,
    fontFamily: 'THSarabunNew',
    marginVertical: 5,
    marginHorizontal: 10,
  },
  infoItem: {
    flexDirection: 'row',
    marginHorizontal: 25,
    marginVertical: 5,
  },
  infoTitle: {
    flex: 1,
    fontSize: 24,
    fontFamily: 'THSarabunNew',
    fontWeight: 'bold',
  },
  infoColon: {
    marginHorizontal: 10,
    fontSize: 24,
    fontFamily: 'THSarabunNew',
    fontWeight: 'bold',
  },
  infoValue: {
    flex: 1,
    fontSize: 24,
    fontFamily: 'THSarabunNew',
    fontWeight: 'bold',
    textAlign: 'right',
  }
});
