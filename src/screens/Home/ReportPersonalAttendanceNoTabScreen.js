import React, { useState } from 'react';
import { Image, View, BackHandler, TouchableOpacity, Dimensions, ScrollView, Text, FlatList} from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressHud from '../../components/ProgressHud';
import BackNavigationBar from '../../components/BackNavigationBar';
import ReportPersonalAttendanceListTab from './ReportPersonalAttendanceListTab';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import moment from 'moment';
import CustomSwitcher from '../../components/CustomSwitcher';
import { Calendar, CalendarList } from 'react-native-calendars';
import {AttendanceStatusValueArray, AttendanceStatusMapOneColor } from '../../constants/constants';
import StartCalendarModal from '../../components/CalendarModal';
import EndCalendarModal from '../../components/CalendarModal';

export default class ReportPersonalAttendanceNoTabScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      userInfo: {},
      tabIndex: 0,

      status: -1,
      
      reportList: [],
      selData: null,

      selectedDate: null,
      selected: null,

      startDate: '',
      endDate: '',
      showStartCalendar: false,
      showEndCalendar: false,
    };
  }

  handleBackButton = () => {
    if(this.state.showStartCalendar){
      this.setState({showStartCalendar: false});
      return true;
    }

    if(this.state.showEndCalendar){
      this.setState({showEndCalendar: false});
      return true;
    }
    
    this.back();
    return true;
  };

  async componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", async () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const userInfo = await Storage.getUserInfo();
      const today = moment();
      this.setState({ userInfo: userInfo, startDate: today, endDate: today, tabIndex: 0, selectedDate: moment(today).format('YYYY-MM-DD'),  selected: moment(today).format('DD MMMM YYYY') }, () => {
        this.loadData();
        this.loadDataRange();
      })
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

  back = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }
    
    const parentRoute = this.props.navigation.getParam('parent') ?? 'Report';
    this.props.navigation.navigate(parentRoute);
  };

  loadData = () => {
    this.setState({ isLoading: true });
    const userInfo = this.state.userInfo;
    ApiManager.getCome2School(userInfo.ID, userInfo.SchoolID, this.state.selectedDate, this.state.selectedDate, this.state.status).then(list => {
      if(list.length > 0){
        this.setState({ selData: list[0], isLoading: false });
      }else{
        this.setState({ selData: null, isLoading: false });
      }
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  }

  loadDataRange = () => {
    this.setState({ isLoading: true });
    const userInfo = this.state.userInfo;
    ApiManager.getCome2School(userInfo.ID, userInfo.SchoolID, this.state.startDate, this.state.endDate, this.state.status).then(list => {
      this.setState({ reportList: list, isLoading: false });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  }

  selectDate = (date) => {
    const _selDate = moment(date).format('DD MMMM YYYY');
    this.setState({ selected: _selDate, selectedDate: moment(date).format('YYYY-MM-DD') }, ()=>{
      this.loadData();
    });
  };

  onChangeSwitcher = (index) => {
    this.setState({tabIndex: index, isEdit: false});
  }

  renderItem_list = (item, index) => {
    const day = moment(item.dScan).format('DD MMMM YYYY');
    let timeIn = moment(item.TimeIn).format('HH:mm:ss');
    let timeOut = moment(item.TimeOut).format('HH:mm:ss');
    let statusIn = item.StatusIN;
    let statusOut = Math.abs(parseInt(item.StatusOut));

    if (!AttendanceStatusValueArray.includes(parseInt(statusIn))) {
      statusIn = -1;
    }

    if (!AttendanceStatusValueArray.includes(parseInt(statusOut))) {
      statusOut = -1;
    }
    const AttendanceStatusTitle = {
      '0': {title: translang.t('ATTENDANCE_STATUS_on_time')},
      '1': {title: translang.t('ATTENDANCE_STATUS_late')},
      '3': {title: translang.t('ATTENDANCE_STATUS_absence')},
      '4': {title: translang.t('ATTENDANCE_STATUS_personal_leave')},
      '10': {title: translang.t('ATTENDANCE_STATUS_personal_leave')},
      '5': {title: translang.t('ATTENDANCE_STATUS_sick_leave')},
      '11': {title: translang.t('ATTENDANCE_STATUS_sick_leave'),},
      '6': {title: translang.t('ATTENDANCE_STATUS_event')},
      '12': {title: translang.t('ATTENDANCE_STATUS_event'),},
      '8': {title: translang.t('ATTENDANCE_STATUS_holiday')},
      '9': {title: translang.t('ATTENDANCE_STATUS_holiday')},
      '21': {title: translang.t('MANTERNITY_LEAVE')},
      '22': {title: translang.t('VACATION_LEAVE')},
      '23': {title: translang.t('ORDINATION_LEAVE')},
      '24': {title: translang.t('MILITARY_SERVICE_LEAVE')},
      '25': {title: translang.t('STUDY_LEAVE')},
      '26': {title: translang.t('GOVERNMENT_SERVICE_LEAVE')},
      '-1': {title: translang.t('ATTENDANCE_STATUS_undefined')},
      '99': {title: translang.t('ATTENDANCE_STATUS_undefined')}
    };

    const statusInText = AttendanceStatusTitle[statusIn].title;
    const statusInColor = AttendanceStatusMapOneColor[statusIn].color;

    const statusOutText = AttendanceStatusTitle[statusOut].title;
    const statusOutColor = AttendanceStatusMapOneColor[statusOut].color;

    return (
      <View style={ styles.itemContainer_list}>
        <Text style={{...styles.userInfoTitle, textAlign: 'right', flex: 0}}>{day}</Text>
        <View style={{flexDirection: 'row'}}>
          <Text style={styles.userInfoTitle}>{translang.t('TIME_IN')}</Text>
          <Text style={styles.userInfoContent}>{timeIn}</Text>
          <View style={{...styles.statusContainer, backgroundColor: statusInColor}}>
            <Text style={styles.statusText}>{statusInText}</Text>
          </View>
        </View>
        <View style={{flexDirection: 'row', marginTop: 5}}>
          <Text style={styles.userInfoTitle}>{translang.t('TIME_OUT')}</Text>
          <Text style={styles.userInfoContent}>{timeOut}</Text>
          <View style={{...styles.statusContainer, backgroundColor: statusOutColor}}>
            <Text style={{...styles.statusText}}>{statusOutText}</Text>
          </View>
        </View>            
      </View>
    )
  };
  
  onStartDateSelected = (date) => {
    if(date != null){
      this.setState({ showStartCalendar: false, startDate: moment(date) }, ()=>{
        this.loadDataRange();
      });
    }else{
      this.setState({showStartCalendar: false});
    }
  }

  onEndDateSelected = (date) => {
    if(date != null){
      this.setState({ showEndCalendar: false, endDate: moment(date) }, ()=>{
        this.loadDataRange();
      });
    }else{
      this.setState({showEndCalendar: false});
    }
  }



  render() {
    const options = [
      { title: translang.t('REPORT_calendar')},
      { title: translang.t('REPORT_list')},
    ];

    
    
    const startDate = this.state.startDate;
    const endDate = this.state.endDate;

    const reportList = this.state.reportList;
    const monthDiff = moment(endDate).diff(moment(startDate), 'months');

    let markedDates = {};
    reportList.forEach(item => {
      const status = item.StatusIN;
  
      // const color = AttendanceStatusMapOneColor[status].color;
      const day = moment(item.dScan).format('DD MMMM YYYY');
      const statusOut = item.StatusOut;
      markedDates[day] = { selected: true, selectedColor: Color.n_default_brown, textColor: 'white' };
    });
    
    let statusColor = Color.white;
    let statusText = "";
    if(this.state.selData != null){
      let status = this.state.selData.StatusIN;
      if (!AttendanceStatusValueArray.includes(parseInt(status))) {
        status = -1;
      }

      const AttendanceStatusTitle = {
        '0': {title: translang.t('ATTENDANCE_STATUS_on_time')},
        '1': {title: translang.t('ATTENDANCE_STATUS_late')},
        '3': {title: translang.t('ATTENDANCE_STATUS_absence')},
        '4': {title: translang.t('ATTENDANCE_STATUS_personal_leave')},
        '10': {title: translang.t('ATTENDANCE_STATUS_personal_leave')},
        '5': {title: translang.t('ATTENDANCE_STATUS_sick_leave')},
        '11': {title: translang.t('ATTENDANCE_STATUS_sick_leave'),},
        '6': {title: translang.t('ATTENDANCE_STATUS_event')},
        '12': {title: translang.t('ATTENDANCE_STATUS_event'),},
        '8': {title: translang.t('ATTENDANCE_STATUS_holiday')},
        '9': {title: translang.t('ATTENDANCE_STATUS_holiday')},
        '21': {title: translang.t('MANTERNITY_LEAVE')},
        '22': {title: translang.t('VACATION_LEAVE')},
        '23': {title: translang.t('ORDINATION_LEAVE')},
        '24': {title: translang.t('MILITARY_SERVICE_LEAVE')},
        '25': {title: translang.t('STUDY_LEAVE')},
        '26': {title: translang.t('GOVERNMENT_SERVICE_LEAVE')},
        '-1': {title: translang.t('ATTENDANCE_STATUS_undefined')},
        '99': {title: translang.t('ATTENDANCE_STATUS_undefined')}
      };

      statusColor = AttendanceStatusMapOneColor[status].color;
      statusText = AttendanceStatusTitle[status].title;
    }

    let startMonth = moment(this.state.startDate).format('DD MMMM YYYY');
    let endMonth = moment(this.state.endDate).format('DD MMMM YYYY');

    let mindate = moment().subtract(6, 'M');
    mindate = moment(mindate).startOf('month');

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_reportattendance')}
          onMenuTap={() => this.back()}
        />

        <View style={styles.container}>
          <CustomSwitcher
            dataList={options}
            selectedIndex={this.state.tabIndex ?? 0}
            onChangedSwitch={(index)=>this.onChangeSwitcher(index)}
            containerStyle = {{marginHorizontal: 15, height: 50, marginTop: 20, marginBottom: 20}}
            radius = {15}
            textSize = {23}
          />
          {this.state.tabIndex == 0 && <View style={{flex: 1}}>
            <ScrollView style={{...styles.container}}>
              <Calendar
                style={styles.calendar}
                onDayPress={(day) => {
                  const date = moment(day.timestamp);
                  this.selectDate(date);
                }}
                onMonthChange={(month) => {
                  // const date = moment(month.timestamp);
                  // this.loadData(date);
                }}
                monthFormat={'MMMM yyyy'}
                // markedDates={markedDates}
                markedDates={{
                  [this.state.selectedDate]: {
                    selected: true,
                    disableTouchEvent: true,
                    selectedColor: Color.n_default_orange,
                    selectedTextColor: 'white'
                  }
                }}
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

              <View style={ styles.menuContainer}>
                <Text style={styles.labelSelectDate}>{this.state.selected}</Text>
              </View>

              {this.state.selData != null &&
              <View style={ styles.itemContainer}>
                <View style={styles.itemInfoContainer}>
                  <Text style={styles.userInfoTitle}>{moment(this.state.selData.dScan).format('DD MMMM YYYY')}</Text>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={styles.userInfoTitle}>{translang.t('TIME_IN')}</Text>
                    <Text style={styles.userInfoContent}>{moment(this.state.selData.TimeIn).format('HH:mm')}</Text>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={styles.userInfoTitle}>{translang.t('TIME_OUT')}</Text>
                    <Text style={styles.userInfoContent}>{moment(this.state.selData.TimeOut).format('HH:mm')}</Text>
                  </View>
                </View>
                <View style={{...styles.itemStatusContainer, backgroundColor: statusColor}}>
                  <Text style={styles.labelStatus}>{statusText}</Text>
                </View>
              </View>}
            </ScrollView>
          </View>}

          {this.state.tabIndex == 1 && 
          <View style={{flex: 1}}>
            <View style={{width: '80%', marginRight: 'auto', marginLeft: 'auto', marginTop: 10, height: 100,}}>
              <View style={{flexDirection: 'row'}}>
                <Text style={{flex: 1, textAlign: 'center', color: Color.n_default_orange, fontFamily: 'THSarabunNew', fontSize: 15, fontWeight: 'bold'}}>{translang.t('SEARCH_STARTDATE')}</Text>
                <Text style={{flex: 1, textAlign: 'center', color: Color.n_default_orange, fontFamily: 'THSarabunNew', fontSize: 15, fontWeight: 'bold'}}>{translang.t('SEARCH_ENDDATE')}</Text>
              </View>
              <View style={styles.rangeContainer}>
                <TouchableOpacity style={{flex: 1}}  onPress={() => {this.setState({showStartCalendar: true});}}>
                  <Text style={{textAlign: 'center', color: Color.white, fontFamily: 'THSarabunNew', fontSize: 18, fontWeight: 'bold'}}>{startMonth}</Text>
                </TouchableOpacity>
                <View style={{height: '80%', width: 1, backgroundColor: Color.white}} />
                <TouchableOpacity style={{flex: 1}}  onPress={() => {this.setState({showEndCalendar: true});}}>
                  <Text style={{textAlign: 'center', color: Color.white, fontFamily: 'THSarabunNew', fontSize: 18, fontWeight: 'bold'}}>{endMonth}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{height: 2, backgroundColor: Color.n_default_brown, marginVertical: 10, marginHorizontal: 20}} />

            <FlatList
              style={{paddingBottom: 20}}
              data={this.state.reportList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item, index}) => this.renderItem_list(item, index)}
            />
          </View>}
        </View>
       
        <StartCalendarModal
          isVisible={this.state.showStartCalendar} 
          type={'single'}
          maxDate={moment()}
          minDate={mindate}
          onDateSelect={ result => this.onStartDateSelected(result)} />
        <EndCalendarModal
          isVisible={this.state.showEndCalendar} 
          type={'single'}
          maxDate={moment()}
          minDate={mindate}
          onDateSelect={ result => this.onEndDateSelected(result)} />


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
  content: {
    flex: 1,
    margin: 10,
    borderRadius: 5,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowColor: 'black',
    shadowRadius: 3,
    shadowOpacity: 0.4,
    paddingBottom: 30,
  },
  calendar: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 20,
    paddingTop: 10,
    paddingBottom: 20,
    shadowColor: 'black', 
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    elevation: 3,
  },
  menuContainer: {
    height: 60,
    marginBottom: 20,
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
  },
  labelSelectDate:{
    fontFamily: 'THSarabunNew',
    color: Color.white,
    fontSize: 25,
    fontWeight: 'bold',
    marginLeft: 50,
  },
  itemContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginTop: 20,
    minHeight: 100,
    borderRadius: 15,
    backgroundColor: Color.white,
    shadowColor: 'black', 
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2.0,
  },
  itemInfoContainer:{
    flex: 1,
    paddingLeft: 15,
    paddingVertical: 10,
  },
  itemStatusContainer:{
    width: '30%', 
    height: '100%', 
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    flexDirection:'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelStatus:{
    fontFamily: 'THSarabunNew',
    color: Color.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfoTitle:{
    flex: 1,
    fontFamily: 'THSarabunNew',
    fontSize: 18,
    fontWeight: 'bold',
    color: Color.n_default_gray
  },
  userInfoContent:{
    flex: 1,
    fontFamily: 'THSarabunNew',
    fontSize: 18,
    color: Color.n_default_gray,
    marginLeft: 5,
  },
  rowContainer: {
    backgroundColor: Color.white,
    borderRadius: 5,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowColor: 'black',
    shadowRadius: 3,
    shadowOpacity: 0.4,
    marginVertical: 5,
    marginHorizontal: 5,
    paddingHorizontal: 5,
    paddingBottom: 10,
  },
  infoItemContainer_: {
    marginVertical: 5,
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItemText: {
    flex: 1,
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
  dateText: {
    color: '#000',
    fontSize: 25,
    fontFamily: 'THSarabunNew',
  },
  dateRow: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  attendanceItemMarkImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },

  statusContainer:{
    width: 60,
    height: 25,
    borderRadius: 13,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  statusText:{
    fontFamily: 'THSarabunNew',
    fontSize: 10,
    fontWeight: 'bold',
    marginHorizontal: 5,
    color: Color.white
  },

  itemContainer_list:{
    flexDirection: 'column',
    justifyContent: 'center',

    minHeight: 100,
    borderRadius: 15,

    marginVertical: 7,
    marginHorizontal: 15,
    
    paddingHorizontal: 15,
    paddingVertical: 5,

    backgroundColor: Color.white,
    shadowColor: 'black', 
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2.0,
  },
  rangeContainer: {
    height: 40,
    borderRadius: 15,
    backgroundColor: Color.n_default_brown,
    shadowColor: Color.black,
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
