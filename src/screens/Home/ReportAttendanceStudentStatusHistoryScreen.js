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

export default class ReportAttendanceStudentStatusHistoryScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      userInfo: {},
      classLevel: {},
      classRoom: {},
      isLoading: false,
      student: {},
      statusList: [],
      date: '',
      categoryIndex: 0,
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

      const userInfo = this.props.navigation.getParam('userInfo');
      const classLevel = this.props.navigation.getParam('classLevel');
      const classRoom = this.props.navigation.getParam('classRoom');
      const student = this.props.navigation.getParam('student');
      const date = this.props.navigation.getParam('date');

      this.setState({ userInfo: userInfo, classLevel: classLevel, classRoom: classRoom, student: student, date: date }, () => {
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

    const userInfo = this.state.userInfo;
    const studentId = this.state.student.studentid;

    ApiManager.getPersonalFlagHistory(userInfo.SchoolID, studentId, date).then(list => {
      this.setState({ statusList: list, isLoading: false})
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });  
  };

  back = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }

    this.props.navigation.navigate('ReportAttendanceStatusList');
  };

  onSelectItem = () => {

  };

  renderItem = (item, index) => {
    const status = item;
    
    let scanStatus = -1;
    if (status.LogStatus && status.LogStatus !== "") {
      scanStatus = status.LogStatus;
    }
    if (!AttendanceStatusValueArray.includes(parseInt(scanStatus))) {
      scanStatus = -1;
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

    const date = moment(status.LogDate).format('DD MMM YYYY');
    const time = translang.t('RECORD_TIME_AT') + ' ' + status.LogTime;
    const stateColors = AttendanceStatusMapOneColor[scanStatus].color;
    const stateTitle = AttendanceStatusTitle[scanStatus].title;

    return (
      <TouchableOpacity style={styles.listItem} onPress={() => this.onSelectItem(index)}>
        <View style={{flexDirection: 'column', flex: 1, height: '100%', justifyContent: 'center'}}>
          <Text style={styles.itemText}>{date}</Text>
          <Text style={styles.itemText}>{time}</Text>
        </View>
        <View style={{...styles.statusCircle, backgroundColor: stateColors}}>
          <Text style={styles.statusText}>{stateTitle}</Text>
        </View>
      </TouchableOpacity>
    );
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
            <Text style={[styles.categoryName, {color: isSelected ? Color.white : color}]}>{text}</Text>
          </View>
          <View style={{flex:1, marginBottom: 10, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={[styles.categoryValue, {color: isSelected ? Color.white : color}]}>{`${value} ${translang.t('DAYS')}`}</Text>
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
    let holiday = 0;
    let termEnd = 0;

    this.state.statusList.forEach(status => {
      if (status.LogStatus === '0' || status.LogStatus === '7') {
        onTime++;
      } else if (status.LogStatus === '1') {
        late++;
      } else if (status.LogStatus === '3') {
        absence++;
      } else if (status.LogStatus === '4' || status.LogStatus === '10') {
        personalLeave++;
      } else if (status.LogStatus === '5' || status.LogStatus === '11') {
        sickLeave++;
      } else if (status.LogStatus === '6' || status.LogStatus === '12') {
        event++;
      } else if(status.LogStatus === '99' || status.LogStatus === '-1' || status.LogStatus === '' || status.LogStatus === '8' || status.LogStatus === '9'){
        other++;
      }
    })


    const total = onTime + late + absence + sickLeave + personalLeave + event + other;
    const date = moment(this.state.date).format('DD MMM YYYY');

    const statusList = this.state.statusList.filter(item => {
      if (this.state.categoryIndex === 0) {
        return true;
      } else if (this.state.categoryIndex === 1) {
        return item.LogStatus === '0' || item.LogStatus === '7';
      } else if (this.state.categoryIndex === 2) {
        return item.LogStatus === '1';
      } else if (this.state.categoryIndex === 3) {
        return item.LogStatus === '3';
      } else if (this.state.categoryIndex === 4) {
        return item.LogStatus === '6' || item.LogStatus === '12';
      } else if (this.state.categoryIndex === 5) {
        return item.LogStatus === '5' || item.LogStatus === '11';
      } else if (this.state.categoryIndex === 6) {
        return item.LogStatus === '4' || item.LogStatus === '10';
      } else if (this.state.categoryIndex === 7) {
        return item.LogStatus === '99' || item.LogStatus === '-1' || item.LogStatus === '' || item.LogStatus === '8' || item.LogStatus === '9';
      }  
    })

   
    const student = this.state.student;
    let profileImage = student.sex === '0' ? Images.man_user : Images.women_user;
    if (student.pic) {
      profileImage = {uri: student.pic};
    }

    let name = '';
    if (student.studentnameEN) {
      name = student.studentnameEN.trim();
    }
    if (name === '' && student.studentname) {
      name = student.studentname.trim();
    }

    const classRoom = this.state.classRoom;
    let strclassroom = "";
    if(getCurrentLocale() == 'en')
      strclassroom = classRoom.NameEN;
    if(getCurrentLocale() == 'th')
      strclassroom = classRoom.NameTH;
        
    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar 
          title={translang.t('CHECK_IN_REPORT')}
          onMenuTap={this.back}
        />

        <View style={styles.container}>
          <View style={{flexDirection: 'row', alignItems: 'center', backgroundColor: Color.n_background_white, marginHorizontal: 30,}}>
            <Image source={profileImage} style={styles.avatar}></Image>
            <View style={{ justifyContent: 'center', alignItems: 'center', marginLeft: 20,}}>
              <Text style={styles.studentName}>{name}</Text>
              <Text style={styles.studentName}>{strclassroom}</Text>
            </View>
          </View>
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
              <ScrollView horizontal>
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
          { statusList.length > 0 &&
            <FlatList 
              style={styles.list}
              data={statusList}
              renderItem={({item, index}) => this.renderItem(item, index)}
              keyExtractor={(item, index) => {`${index}`}}
            />
          }
          { statusList.length === 0 &&
            <View style={{width: '100%', height: '70%', justifyContent: 'center', alignItems: 'center'}}>
              <Text style={styles.emptyText}>{translang.t('NOT_FOUND_DATA')}</Text>
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
  avatar: {
    width: 70, 
    height: 70, 
    borderRadius: 30,
    marginHorizontal: 8,
    marginVertical: 10,
  },
  studentName: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'THSarabunNew',
    textAlign: 'center',
    color: Color.n_default_orange
  },
  date: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    marginLeft: 10,
  },
  total: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 10,
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
    textAlign: 'center'
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
    color: Color.n_default_gray_dark,
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
