import React, { useState } from 'react';
import { Image, View, BackHandler, TouchableOpacity, FlatList, } from 'react-native';
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
import moment from 'moment';

import NavigationBar from '../../components/NavigationBar';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import BackNavigationBar from '../../components/BackNavigationBar';
import { AttendanceStatusValueArray, AttendanceStatusMap, AttendanceStatusMapOneColor } from '../../constants/constants';

export default class ReportAttendanceSubjectStatusListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      userInfo: {},
      classLevel: {},
      classRoom: {},
      isLoading: false,
      statusList: [],
      date: '',
      categoryIndex: 0,
      schedule: {},
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    const { navigation } = this.props;
    console.log("check in subject report: list");
    this.focusListener = navigation.addListener("didFocus", () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const userInfo = this.props.navigation.getParam('userInfo');
      const classLevel = this.props.navigation.getParam('classLevel');
      const classRoom = this.props.navigation.getParam('classRoom');
      const date = this.props.navigation.getParam('date');
      const schedule = this.props.navigation.getParam('schedule');

      console.log('classroom:', classRoom);
      console.log('date:', date);

      this.setState({ userInfo: userInfo, classLevel: classLevel, classRoom: classRoom, date: date, schedule: schedule}, () => {
        this.loadData(date);
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

    const {userInfo, classRoom, schedule} = this.state;
    ApiManager.getTeacherReportAttendanceSubjectStatusList(userInfo.SchoolID, classRoom.ID, date, schedule.ScheduleId).then(res => {
      this.setState({ statusList: res.ScheduleScan4Level2 ?? [], isLoading: false});
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };

  back = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }

    const parentRoute = this.props.navigation.getParam('parent') ?? 'App';
    this.props.navigation.navigate(parentRoute);
  };

  renderItem = (item, index) => {
    const student = item;

    const enableState = student.Student_State == '0'?true:false;

    let status = -1;
    if (student.status && student.status !== "") {
      status = student.status;
    }
    if (!AttendanceStatusValueArray.includes(parseInt(status))) {
      status = -1;
    }

    let name = student.studentname;

    if(getCurrentLocale() == 'en' && student.studentnameEN && student.studentnameEN.trim() != ""){
      name = student.studentnameEN;
    }
    const nameArray = name.split(' ');
    let firstName = '';
    let lastName = '';
    if (nameArray.length > 0) {
      firstName = nameArray[0];
    }
    if (nameArray.length > 1) {
      lastName = nameArray[nameArray.length - 1];
    }
    // status = status.trim();

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
    const stateColors = AttendanceStatusMapOneColor[status].color;
    const stateTitle = AttendanceStatusTitle[status].title;

    let profileImage = student.sex === '0' ? Images.man_user : Images.women_user;
    if (student.pic) {
      profileImage = {uri: student.pic};
    }

    const AttendanceStateTitle = {
      '0': {title: translang.t('STUDY')},
      '1': {title: translang.t('DISPUTE')},
      '2': {title: translang.t('RESIGNED')},
      '3': {title: translang.t('DROPPED')},
      '4': {title: translang.t('GRADUATED')},
      '5': {title: translang.t('LOSE_CONTACT_WITH')},
      '6': {title: translang.t('RETIRED'),},
      '7': {title: translang.t('EXCHANGE_STUDENT')},
      '-1': {title: translang.t('UNDEFINED')},
    };
    const stateLabel = AttendanceStateTitle[student.Student_State].title;


    if(enableState){
      return (
        <View style={styles.listItem}>
          <Text style={{...styles.itemText}}>{index + 1}.</Text>
          <Image source={profileImage} style={styles.itemAvatar}></Image>
          <View style={{flexDirection: 'column', flex: 1, height: '100%', justifyContent: 'space-around', marginLeft: 15,}}>
          <Text style={styles.itemText}>{student.studentid}</Text>
            <Text style={styles.itemText}>{firstName}</Text>
            <Text style={styles.itemText}>{lastName}</Text>
          </View>
          <View style={{...styles.statusCircle, backgroundColor: stateColors}}>
            <Text style={styles.statusText}>{stateTitle}</Text>
          </View>
        </View>
      );
    }else{
      return (
        <View style={{...styles.listItem, backgroundColor: Color.n_default_gray_light}} key={index}>
          <Text style={{...styles.itemText}}>{index + 1}.</Text>
          <Image source={profileImage} style={styles.itemAvatar}></Image>
          <View style={{flexDirection: 'column', flex: 1, height: '100%', justifyContent: 'space-around', marginLeft: 15,}}>
          <Text style={styles.itemText}>{student.studentid}</Text>
            <Text style={styles.itemText}>{firstName}</Text>
            <Text style={styles.itemText}>{lastName}</Text>
          </View>
          <View style={{...styles.statusCircle, backgroundColor: Color.n_scorpion}}>
            <Text style={styles.statusText}>{stateLabel}</Text>
          </View>
        </View>
      );
    }


  };

  renderCategoryItem = (index, value) => {
    const isSelected = this.state.categoryIndex === index;
    let image = Images.clock_white;
    let selImage = Images.clock_white;
    let color = Color.white;
    let text = '';

    switch(index) {
      case 0:
        image = Images.n_ic_setting_account;
        selImage = Images.n_ic_users_white
        color = isSelected ? Color.white : Color.n_default_orange;
        text = translang.t('ALL');
        break;
      case 1:
        image = Images.n_ic_clock_ontime;
        selImage = Images.n_ic_clock_select;
        color = isSelected ? Color.white : Color.n_button_gradient_green_end;
        text = translang.t('ON_TIME');
        break;
      case 2:
        image = Images.n_ic_clock_late;
        selImage = Images.n_ic_clock_select;
        color = isSelected ? Color.white : Color.n_default_brown;
        text = translang.t('LATE');
        break;
      case 3:
        image = Images.n_ic_clock_absence;
        selImage = Images.n_ic_clock_select;
        color = isSelected ? Color.white : Color.n_default_orange;
        text = translang.t('ABSENCE');
        break;
      case 4:
        image = Images.n_ic_clock_event;
        selImage = Images.n_ic_clock_select;
        color = isSelected ? Color.white : Color.n_science_blue;
        text = translang.t('EVENT');
        break;
      case 5:
        image = Images.n_ic_clock_sickleave;
        selImage = Images.n_ic_clock_select;
        color = isSelected ? Color.white : Color.n_electric_violet;
        text = translang.t('SICK_LEAVE');
        break;
      case 6:
        image = Images.n_ic_clock_personleave;
        selImage = Images.n_ic_clock_select;
        color = isSelected ? Color.white : Color.n_seance;
        text = translang.t('PERSONAL_LEAVE');
        break;
      case 7:
        image = Images.n_ic_clock_undifine;
        selImage = Images.clock_white;
        color = isSelected ? Color.white : Color.n_scorpion;
        text = translang.t('UNDEFINED');
        break;
    }


    return (
      <TouchableOpacity
        key={index}
        style={[index === 0 ? styles.allCategory : styles.categoryItemContainer]}
        onPress={() => this.setState({categoryIndex: index})}>
        <LinearGradient
          style={{height: '100%', width: '100%', borderRadius: 15,}}
          start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }}
          colors={isSelected?[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]:[Color.white, Color.white]}>
          <View style={{flex:2, marginTop: 10, justifyContent: 'center', alignItems: 'center'}}>
            <Image source={isSelected ? selImage : image} style={{width: '30%', flex: 1, resizeMode: 'contain'}} />
          </View>
          <View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={[styles.categoryName, {color: color}]}>{text}</Text>
          </View>
          <View style={{flex:1, marginBottom: 10, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={[styles.categoryValue, {color: color}]}>{`${value} ${translang.t('PEOPLE')}`}</Text>
          </View>

        </LinearGradient>
      </TouchableOpacity>
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

    if(this.state.statusList.length > 0){
      this.state.statusList.forEach(status => {
        if(status.Student_State != 0){
          other++;
        }else{
          if (status.status === '0' || status.status === '7') {
            onTime++;
          } else if (status.status === '1') {
            late++;
          } else if (status.status === '3') {
            absence++;
          } else if (status.status === '4' || status.status === '10') {
            personalLeave++;
          } else if (status.status === '5' || status.status === '11') {
            sickLeave++;
          } else if (status.status === '6' || status.status === '12') {
            event++;
          } else if(status.status === '99' || status.status === '-1' || status.status === '' || status.status === '8' || status.status === '9'){
            other++;
          }
        }
      })
    }

    const total = onTime + late + absence + sickLeave + personalLeave + event + other;
    const date = moment(this.state.date).format('DD MMM YYYY');
    const time = `${this.state.schedule.TimeIn} - ${this.state.schedule.TimeOut}`;
    let statusList_filtered = []
    if(this.state.statusList.length > 0){
      statusList_filtered = this.state.statusList.filter(item => {
        if (this.state.categoryIndex === 0) {
          return true;
        } else if (this.state.categoryIndex === 1) {
          return (item.status === '0' || item.status === '7') && item.Student_State == '0';
        } else if (this.state.categoryIndex === 2) {
          return (item.status === '1') && item.Student_State == '0';
        } else if (this.state.categoryIndex === 3) {
          return (item.status === '3') && item.Student_State == '0';
        } else if (this.state.categoryIndex === 4) {
          return (item.status === '6' || item.status === '12') && item.Student_State == '0';
        } else if (this.state.categoryIndex === 5) {
          return (item.status === '5' || item.status === '11') && item.Student_State == '0';
        } else if (this.state.categoryIndex === 6) {
          return (item.status === '4' || item.status === '10') && item.Student_State == '0';
        } else if (this.state.categoryIndex === 7) {
          return item.status === '99' || item.status === '-1' || item.status === '' || item.status === '8' || item.status === '9' || item.Student_State != '0';
        }
        // } else if (this.state.categoryIndex === 7) {
        //   return item.status === '99' || item.status === '-1' || item.status === '';
        // }
      })
    }

    let className = "";
    if(this.state.schedule.ClassNameTH){
      className = this.state.schedule.ClassNameTH;
      if(getCurrentLocale() == 'en' && this.state.schedule.ClassNameEN && this.state.schedule.ClassNameEN != ""){
        className = this.state.schedule.ClassNameEN;
      }
    }

    let subjectName = "";
    if(this.state.schedule.ScheduleName){
      subjectName = this.state.schedule.ScheduleName;
    }

    let courseName = "";
    if(this.state.schedule.CourseCodeTH && this.state.schedule.CourseCodeTH != ""){
      courseName = this.state.schedule.CourseCodeTH;
      if(getCurrentLocale() == "en" && this.state.schedule.CourseCodeEN && this.state.schedule.CourseCodeEN != ""){
        courseName = this.state.schedule.CourseCodeEN;
      }
    }

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('CHECKIN_SUBJECT_REPORT')}
          onMenuTap={this.back}
        />

        <View style={styles.container}>
          <View style={{marginTop: 15}}>
            <Text style={{...styles.date, marginRight: 5,}}>{`${subjectName} ${courseName}`}</Text>
            <Text style={{...styles.date, marginRight: 5,}}>{`${date} ${time}`}</Text>
          </View>
          <Text style={styles.total}>{translang.t('CLASS_HAVE_PEOPLE', {classroom: className , count: total})}</Text>

          <View style={styles.categoryContainer}>
            {this.renderCategoryItem(0, total)}
            <View
              style={{
              flex: 1,
              backgroundColor: Color.white,
              marginRight: 5,
              borderRadius: 15,
              shadowColor: '#000',
              shadowOffset: {
                  width: 0,
                  height: 2,
              },
              shadowOpacity: 0.15,
              elevation: 5,
              }}>
              <ScrollView horizontal >
                {this.renderCategoryItem(1, onTime)}
                {this.renderCategoryItem(2, late)}
                {this.renderCategoryItem(3, absence)}
                {this.renderCategoryItem(4, event)}
                {this.renderCategoryItem(5, sickLeave)}
                {this.renderCategoryItem(6, personalLeave)}
                {this.renderCategoryItem(7, other)}
              </ScrollView>
            </View>

          </View>
          { statusList_filtered.length > 0 &&
            <FlatList
              style={styles.list}
              data={statusList_filtered}
              renderItem={({item, index}) => this.renderItem(item, index)}
              keyExtractor={(item, index) => {`${index}`}}
            />
          }
          { statusList_filtered.length === 0 &&
            <View style={{width: '100%', height: '70%', justifyContent: 'center', alignItems: 'center'}}>
              <Text style={styles.emptyText}>{translang.t('NOT_FOUND_STUDENT')}</Text>
            </View>
          }
          <ProgressHud isVisible={this.state.isLoading} />
        </View>
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({

  container: {
    flex: 1,
    backgroundColor: Color.n_background_white
  },
  date: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    color: Color.n_default_orange,
    marginTop: 0,
    marginHorizontal: 25,
  },
  total: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    color: Color.n_default_orange,
    marginHorizontal: 25,
    marginTop: 0
  },
  categoryContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 100,
    marginVertical: 15,
    marginHorizontal: 10,
  },
  allCategory: {
    width: 80,
    backgroundColor: Color.white,
    marginRight: 5,
    borderRadius: 15,

    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.15,
    elevation: 5,
  },
  categoryItemContainer: {
    width: 80,
    backgroundColor: Color.white,
    borderRadius: 15,
  },
  categoryImage: {
    marginTop: 10,
  },
  categoryName: {
    fontFamily: 'THSarabunNew',
    fontSize: 16,
    fontWeight: 'bold',
    color: Color.white,
    textAlign: 'center',
  },
  categoryValue: {
    fontFamily: 'THSarabunNew',
    fontSize: 16,
    fontWeight: 'bold',
    color: Color.white,
    textAlign: 'center',
  },
  list: {
    marginTop: 5,
  },
  listItem: {
    minHeight: 100,
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
    marginVertical: 10,
    marginHorizontal: 15,
    paddingLeft: 10,
  },
  itemText: {
    fontSize: 24,
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray
  },
  itemAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 8,
  },
  statusCircle: {
    width: 85,
    height: '100%',
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontFamily: 'THSarabunNew',
    fontSize: 18,
    fontWeight: 'bold',
    color: Color.white,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray,
  }
});
