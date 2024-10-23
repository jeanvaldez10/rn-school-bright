import React, { useState } from 'react';
import { Image, View, BackHandler, TouchableOpacity, ImageBackground, FlatList, } from 'react-native';
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


export default class ReportUncheckNameScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      selected: '2021-06-06',
      isOpenCalendar: true,
      userInfo: {},
      reportList: [],
      selectedDateList: [],
      isLoading: false,
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", async () => {
      console.log("ReportUncheckNameScreen Created1");

      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
      console.log("Created2");

      const today = new Date();
      const userInfo = await Storage.getUserInfo();

      this.setState({ selected: moment(today).format("YYYY-MM-DD"), userInfo: userInfo }, () => {
        this.loadDateList(moment(today));
        this.loadData(moment(today));
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

  back = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }
    console.log("BBBBACK");
    const parentRoute = this.props.navigation.getParam('parent') ?? 'Report';
    this.props.navigation.navigate(parentRoute);
  };

  loadData = (date) => {
    const day = date.format('YYYY-MM-DD');
    this.setState({ isLoading: true, selected: day });

    const userInfo = this.state.userInfo;
    ApiManager.getUncheckNameList(userInfo.SchoolID, date).then(list => {
      this.setState({ reportList: list, isLoading: false}, () => {

      })
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };

  loadDateList = (date) => {
    this.setState({ isLoading: true });

    const userInfo = this.state.userInfo;
    const startDate = date.startOf('month').format('YYYY-MM-DD');
    ApiManager.getUncheckNameDates(userInfo.SchoolID, startDate).then(list => {
      const dates = list.map(item => item.DateReport);
      this.setState({ selectedDateList: dates, isLoading: false}, () => {

      })
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  }

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
  };

  __next = () => {
    const classLevel = this.state.classLevel;
    const classRoom = this.state.classRoom;
    const selectedDate = this.state.selected;
    const studentStatusList = this.state.studentStatusList;

    this.props.navigation.navigate('ReportAttendanceStatusList', {classLevel, classRoom, date: selectedDate, statusList: studentStatusList});
  }

  renderItem = (item, index) => {
    let teacherName = item.FirstNameTH + " " + item.LastNameTH;
    if(getCurrentLocale() == "en" && item.FirstNameEN && item.FirstNameEN.trim() != ""){
      teacherName = item.FirstNameEN + " " + item.LastNameEN;
    }

    let class_name = item.class_name;
    if(getCurrentLocale() == "en" && item.class_nameEN && item.class_nameEN.trim() != ""){
      class_name = item.class_nameEN;
    }

    if(getCurrentLocale() == "en"){
      if(teacherName == 'ไม่ระบุ ไม่ระบุ'){
        teacherName = "Anonymous"
      }
    }


    return (
      <TouchableOpacity style={styles.infoContainer}>
        <Text style={styles.infoText1}>{`${translang.t('CLASSROOM')} : ${class_name}`}</Text>
        <Text style={styles.infoText2}>{`${translang.t('TEACHER')}   :   ${teacherName}`}</Text>
      </TouchableOpacity>
    )
  };

  render() {
    let markDates = {};
    this.state.selectedDateList.forEach(date => {
      const day = moment(date).format('YYYY-MM-DD');
      if (!markDates[day]) {
        markDates[day] = {
          selected: true,
          selectedColor: Color.downy,
          selectedTextColor: 'white'
        };
      }
    });

    if (markDates[this.state.selected]) {
      markDates[this.state.selected] = {
        selected: true,
        disableTouchEvent: true,
        selectedColor: Color.jungle_green,
        selectedTextColor: 'white'
      };
    } else {
      markDates[this.state.selected] = {
        selected: true,
        disableTouchEvent: true,
        selectedColor: '#ff7a62',
        selectedTextColor: 'white'
      };
    }

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('UNCHECKNAME_REPORT')}
          onMenuTap={this.back}
        />

        <View style={styles.container}>
          <ScrollView indicatorStyle={'white'}>
            <Calendar
              style={styles.calendar}
              onDayPress={(day) => {
                const date = moment(day.timestamp);
                this.loadData(date);
              }}
              onMonthChange={(month) => {
                const date = moment(month.timestamp);
                this.loadDateList(date);
              }}
              monthFormat={'MMMM yyyy'}
              markedDates={markDates}
              disabledDaysIndexes={[0, 6]}
              hideExtraDays={false}
              disableAllTouchEventsForDisabledDays={false}
              theme={{
                todayTextColor:'white',
                textDayFontSize: 13,
                dayTextColor: Color.n_default_gray,
                textSectionTitleColor: Color.n_default_gray,
                arrowColor: Color.n_default_gray,
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
                    backgroundColor: Color.picton_blue,
                    borderRadius: 16,
                  }
                },

              }}
            />

            <View style={ styles.menuContainer}>
              <Text style={styles.labelSelectDate}>{moment(this.state.selected).format("DD MMMM YYYY")}</Text>
            </View>
            <FlatList
              data={this.state.reportList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item, index}) => this.renderItem(item, index)}
            />
          </ScrollView>
          <ProgressHud isVisible={this.state.isLoading} />
        </View>
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
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
    elevation: 2,
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






  attendanceItemMarkImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: 20,
    marginVertical: 10,
  },

  infoContainer: {
    height: 100,
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 15,
    backgroundColor: Color.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    paddingVertical: 10,
    paddingHorizontal: 20,

    justifyContent: 'center',

  },
  infoText1: {
    fontSize: 30,
    fontFamily: 'THSarabunNew',
    fontWeight: 'bold',
    color: Color.n_default_gray_dark,
  },

  infoText2: {
    fontSize: 24,
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray_dark,
  }
});
