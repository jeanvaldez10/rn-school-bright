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
import { StudentAttendanceValueArray, StudentAttendanceColor } from '../../constants/constants';
import { stat } from 'react-native-fs';

export default class ReportAttendanceStatusListScreen_TEMP extends React.Component {
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
      subject: {},
      type: 'class',
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
      const date = this.props.navigation.getParam('date');
      const subject = this.props.navigation.getParam('subject');
      const type = this.props.navigation.getParam('type');

      this.setState({ userInfo: userInfo, classLevel: classLevel, classRoom: classRoom, date: date, subject: subject, type: type, subject: subject, type: type}, () => {
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

    const {type, userInfo} = this.state;

    if(type == "class"){
      ApiManager.getHistoryStudentStatusList(userInfo.SchoolID, this.state.classRoom.ID, date).then(list => {
        this.setState({ statusList: list, isLoading: false})
      }).catch(error => {
        console.log(error);
        this.setState({ isLoading: false });
      });
    }else if(type == "subject"){
      ApiManager.getTeacherReportAttendanceSubjectStatusList(userInfo.SchoolID, this.state.classRoom.ID, date, this.state.subject.scheduleId).then(list => {
        this.setState({ statusList: list, isLoading: false});
      }).catch(error => {
        console.log(error);
        this.setState({ isLoading: false });
      });
    }
  };

  back = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }

    const parentRoute = this.props.navigation.getParam('parent') ?? 'UserInfo';
    this.props.navigation.navigate(parentRoute);
  };

  onSelectItem = (item) => {
    const classLevel = this.state.classLevel;
    const classRoom = this.state.classRoom;
    const student = item;
    const date = this.state.date;
    const userInfo = this.state.userInfo;

    const subject = this.state.subject;
    const type = this.state.type;
    this.props.navigation.navigate('ReportAttendanceStudentStatusHistory', {classLevel, classRoom, student, date, userInfo, subject, type});
  };

  renderItem = (item, index) => {
    const student = item;

    let name = student.studentnameEN.trim();
    let status = -1;
    if ('Student_State' in student && student.Student_State !== "") {
      status = student.Student_State;
    }

    if (!StudentAttendanceValueArray.includes(parseInt(status))) {
      status = -1;
    }

    if (name === '') {
      name = student.studentname.trim();
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

    const AttendanceStatusTitle = {
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

    const stateColors = StudentAttendanceColor[status].color;
    const stateTitle = AttendanceStatusTitle[status].title;

    let profileImage = student.sex === '0' ? Images.man_user : Images.women_user;
    if (student.pic) {
      profileImage = {uri: student.pic};
    }

    return (
      <TouchableOpacity style={styles.listItem} onPress={() => this.onSelectItem(item)}>
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
        text = translang.t('STUDY');
        break;
      case 2:
        image = Images.n_ic_clock_late;
        selImage = Images.n_ic_clock_select;
        color = isSelected ? Color.white : Color.n_default_brown;
        text = translang.t('DISPUTE');
        break;
      case 3:
        image = Images.n_ic_clock_absence;
        selImage = Images.n_ic_clock_select;
        color = isSelected ? Color.white : Color.n_default_orange;
        text = translang.t('RESIGNED');
        break;
      case 4:
        image = Images.n_ic_clock_event;
        selImage = Images.n_ic_clock_select;
        color = isSelected ? Color.white : Color.n_science_blue;
        text = translang.t('DROPPED');
        break;
      case 5:
        image = Images.n_ic_clock_sickleave;
        selImage = Images.n_ic_clock_select;
        color = isSelected ? Color.white : Color.n_electric_violet;
        text = translang.t('GRADUATED');
        break;
      case 6:
        image = Images.n_ic_clock_personleave;
        selImage = Images.n_ic_clock_select;
        color = isSelected ? Color.white : Color.n_seance;
        text = translang.t('LOSE_CONTACT_WITH');
        break;
      case 7:
        image = Images.n_ic_clock_undifine;
        selImage = Images.clock_white;
        color = isSelected ? Color.white : Color.n_scorpion;
        text = translang.t('RETIRED');
        break;
      case 8:
        image = Images.n_ic_clock_undifine;
        selImage = Images.clock_white;
        color = isSelected ? Color.white : Color.n_scorpion;
        text = translang.t('EXCHANGE_STUDENT');
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

    let onStudy = 0;
    let onDispute = 0;
    let onResigned = 0;
    let onDropped = 0;
    let onGraduated = 0;
    let onLose = 0;
    let onRetired = 0;
    let onExchange = 0;

    if(this.state.statusList.length > 0){
      this.state.statusList.forEach(status => {
        if (status.Student_State == '0') {
          onStudy++;
        } else if (status.Student_State == '1') {
          onDispute++;
        } else if (status.Student_State == '2') {
          onResigned++;
        } else if (status.Student_State == '3') {
          onDropped++;
        } else if (status.Student_State == '4') {
          onGraduated++;
        } else if (status.Student_State == '5') {
          onLose++;
        } else if (status.Student_State == '6') {
          onRetired++;
        } else if (status.Student_State == '7') {
          onExchange++;
        }
      })
    }


    const total = onStudy + onDispute + onResigned + onDropped + onGraduated + onLose + onRetired + onExchange;
    const date = moment(this.state.date).format('DD MMM YYYY');
    let statusList = []
    if(this.state.statusList.length > 0){
      statusList = this.state.statusList.filter(item => {
        if (this.state.categoryIndex === 0) {
          return true;
        } else if (this.state.categoryIndex == 1) {
          return item.Student_State == '0';
        } else if (this.state.categoryIndex == 2) {
          return item.Student_State == '1';
        } else if (this.state.categoryIndex == 3) {
          return item.Student_State == '2';
        } else if (this.state.categoryIndex == 4) {
          return item.Student_State == '3';
        } else if (this.state.categoryIndex == 5) {
          return item.Student_State == '4';
        } else if (this.state.categoryIndex == 6) {
          return item.Student_State == '5';
        } else if (this.state.categoryIndex == 7) {
          return item.Student_State == '6';
        } else if (this.state.categoryIndex == 7) {
          return item.Student_State == '7';
        }
      })
    }


    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={this.state.type=="class" ? translang.t('CHECK_IN_REPORT') : translang.t('CHECKIN_SUBJECT_REPORT')}
          onMenuTap={this.back}
        />

        <View style={styles.container}>
          <View style={{flexDirection: 'row'}}>
            {this.state.type=="subject" &&
            <Text style={{...styles.date, marginRight: 5, flex: 1,}}>{this.state.subject.scheduleName}</Text>}
            <Text style={{...styles.date, marginRight: 5, flex: 1}}>{date}</Text>
          </View>
          <Text style={styles.total}>{translang.t('CLASS_HAVE_PEOPLE', {classroom: this.state.classRoom.NameEN, count: total})}</Text>
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
                {this.renderCategoryItem(1, onStudy)}
                {this.renderCategoryItem(2, onDispute)}
                {this.renderCategoryItem(3, onResigned)}
                {this.renderCategoryItem(4, onDropped)}
                {this.renderCategoryItem(5, onGraduated)}
                {this.renderCategoryItem(6, onLose)}
                {this.renderCategoryItem(7, onRetired)}
                {this.renderCategoryItem(8, onExchange)}
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
    marginTop: 20,
    marginVertical: 7,
    marginHorizontal: 25,
  },
  total: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    color: Color.n_default_orange,
    marginHorizontal: 25,
    marginVertical: 7,
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
    width: 85,
    height: '100%',
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
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
