import React, { useState } from 'react';
import { Image, View, BackHandler, TouchableOpacity, FlatList, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import { ScrollView } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import BackNavigationBar from '../../components/BackNavigationBar';
import { AttendanceStatusValueArray, AttendanceStatusMapOneColor } from '../../constants/constants';

export default class ReportExecAttendanceDepartmentDetailScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      userInfo: {},
      report: {},
      date: '',
      isLoading: false,
      statusList: [],
      classIndex: 0,
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
      console.log("ReportExecAttendanceDepartmentDetailScreen");
      const userInfo = this.props.navigation.getParam('userInfo');
      const report = this.props.navigation.getParam('report');
      const date = this.props.navigation.getParam('date');

      this.setState({ userInfo: userInfo, report: report, date: date }, () => {
        this.loadData();
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

  loadData = () => {
    this.setState({ isLoading: true });

    const userInfo = this.state.userInfo;
    const date = this.state.date;
    const report = this.state.report;

    ApiManager.getAttendanceSchoolDetailEmployee(userInfo.SchoolID, date, report.department_Id, getCurrentLocale()).then(list => {
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

    this.props.navigation.navigate('ReportExecutiveDepartmentList');
  };

  onSelectItem = (item) => {

  };

  renderItem = (item, index) => {
    const student = item;
    let name = student.name ?? "";
    let scanStatus = -1;
    if (student.status && student.status !== "") {
      scanStatus = student.status;
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
    const stateColors = AttendanceStatusMapOneColor[scanStatus].color;
    const stateTitle = AttendanceStatusTitle[scanStatus].title;

    let profileImage = Images.man_user;
    if (student.pictuer) {
      profileImage = {uri: student.pictuer};
    }

    let logTime, logTimes;

    if (item.LogTime) {
      logTimes = item.LogTime.split(':');
      logTime = logTimes[0] + ':' + logTimes[1]
    } else {
      logTime = null;
    }

    return (
      // <TouchableOpacity style={styles.listItem} onPress={() => this.onSelectItem(item)}>
        <View style={styles.listItem}>
        <Text style={styles.itemText}>{index + 1}.</Text>
        <Image source={profileImage} style={styles.itemAvatar}></Image>
        <View style={{flexDirection: 'column', flex: 1, height: '100%', justifyContent: 'space-around'}}>
          <Text style={styles.itemText}>{name}</Text>
        </View>
        <View style={{...styles.statusCircle, backgroundColor: stateColors, flexDirection: 'column'}}>
          <Text style={styles.statusText}>{stateTitle}</Text>
          {logTime &&
          <Text style={styles.statusText}>{logTime}</Text>
          }
        </View>
      </View>
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
        image = Images.n_ic_clock_personleave;
        selImage = Images.n_ic_clock_select;
        color = isSelected ? Color.white : Color.n_seance;
        text = translang.t('PERSONAL_LEAVE');
        break;
      case 5:
        image = Images.n_ic_clock_sickleave;
        selImage = Images.n_ic_clock_select;
        color = isSelected ? Color.white : Color.n_electric_violet;
        text = translang.t('SICK_LEAVE');
        break;
      case 6:
        image = Images.n_ic_clock_undifine;
        selImage = Images.clock_white;
        color = isSelected ? Color.white : Color.n_scorpion;
        text = translang.t('OTHER_LEAVE');
        break;
      case 7:
        image = Images.n_ic_clock_undifine;
        selImage = Images.clock_white;
        color = isSelected ? Color.white : Color.n_scorpion;
        text = translang.t('HOLIDAY');
        break;
    }

    return (
      <TouchableOpacity
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

    let statusList = this.state.statusList ?? [];
    let cntPeople = statusList.length;

    let onTime = 0;
    let late = 0;
    let absence = 0;
    let sickLeave = 0;
    let personalLeave = 0;
    let holiday = 0;
    let event = 0;
    let other = 0;

    statusList.forEach(status => {
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
      } else if (status.status === '8' || status.status === '9') {
        holiday++;
      } else{
        other++;
      }
    })

    const total = onTime + late + absence + sickLeave + personalLeave + event + holiday + other;
    const date = moment(this.state.date).format('DD MMM YYYY');

    statusList = statusList.filter(item => {
      if (this.state.categoryIndex === 0) {
        return true;
      } else if (this.state.categoryIndex === 1) {
        return item.status === '0' || item.status === '7';
      } else if (this.state.categoryIndex === 2) {
        return item.status === '1';
      } else if (this.state.categoryIndex === 3) {
        return item.status === '3';
      } else if (this.state.categoryIndex === 4) {
        return item.status === '4' || item.status === '10';
      } else if (this.state.categoryIndex === 5) {
        return item.status === '5' || item.status === '11';
      } else if (this.state.categoryIndex === 7) {
        return item.status === '8' || item.status === '9';
      }else if (this.state.categoryIndex === 6) {
        return item.status === '99' || item.status === '-1' || item.status === '21' || item.status === '22' || item.status === '23' || item.status === '24' || item.status === '25' || item.status === '26';
      }
    });


    return (
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_reportattendance')}
          onMenuTap={this.back}
        />

        <View style={styles.container}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 40, marginTop: 30,}}>
            <Text style={{...styles.total, fontWeight: 'bold', flex: 1}}>{getCurrentLocale() === 'en' ? this.state.report.department_NameEN ?? this.state.report.department_Name : this.state.report.department_Name}</Text>
            <Text style={styles.date} numberOfLines={1}>{date}</Text>
          </View>
          <Text style={{...styles.total, marginHorizontal: 40, marginBottom: 20,}}>{`${translang.t("TOTAL_PERSONAL")} : ${cntPeople}`}</Text>

          <View style={styles.categoryContainer}>
            {this.renderCategoryItem(0, total)}
            <View
              style={{
                flex: 1,
                backgroundColor: Color.white,
                marginRight: 5,
                borderTopLeftRadius: 15,
                borderBottomLeftRadius: 15,
                shadowColor: '#000',
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.3,
                elevation: 5,}}>
              <ScrollView horizontal>
                {this.renderCategoryItem(1, onTime)}
                {this.renderCategoryItem(2, late)}
                {this.renderCategoryItem(3, absence)}
                {this.renderCategoryItem(4, personalLeave)}
                {this.renderCategoryItem(5, sickLeave)}
                {this.renderCategoryItem(6, other)}
                {this.renderCategoryItem(7, holiday)}

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
              <Text style={styles.emptyText}>{translang.t('NOT_FOUND_EMPLOYEE')}</Text>
            </View>
          }
        </View>
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
  date: {
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    color: Color.n_default_orange,
  },
  total: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    color: Color.n_default_orange,
  },
  categoryContainer: {
    flexDirection: 'row',
    height: 80,
    paddingStart: 10,
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
    shadowOpacity: 0.3,
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
    fontSize: 15,
    fontWeight: 'bold',
    color: Color.white,
  },
  categoryValue: {
    fontFamily: 'THSarabunNew',
    fontSize: 15,
    fontWeight: 'bold',
    color: Color.white,
  },
  list: {
    marginTop: 5,
  },
  listItem: {
    height: 100,
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
    width: 90,
    height: '100%',
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '300',
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
