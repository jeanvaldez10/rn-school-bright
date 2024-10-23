import React, { useState } from 'react';
import { Image, View, BackHandler, TouchableOpacity, ImageBackground, } from 'react-native';
import { Col, Text } from 'native-base';
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

import BackNavigationBar from '../../components/BackNavigationBar';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';

import NetInfo from "@react-native-community/netinfo";
import AlertOfflineModal from '../../components/AlertWithImageModal';

import {SchoolCalendarColor } from '../../constants/constants';

const SubMenuItem = (props) => {
  const {date, label, onPressMenu, color } = props;
  return (
    <View style={styles.subMenuItemContainer}>
      <TouchableOpacity style={styles.subMenuItem} onPress={onPressMenu}>
        <View style={{...styles.attendanceItemMarkImage, backgroundColor: SchoolCalendarColor[color].color}}></View>
        <View style={{flex: 1}}>
          <Text style={styles.menuItemText}>
            {moment(date).format("DD MMMM YYYY")}
          </Text>
          <Text style={styles.menuItemText} multiline={true}>
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default class SchoolCalendarScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      showModalOffline: false,
      modalBody: '',
      selected: '2021-06-06',
      isOpenCalendar: true,
      selectedDate: null,
      userInfo: {},
      isLoading: false,
      calendarDateList: [],
      selectedDateDataList: [],
      selectedDateData: null,
    };

  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  unsubscribe = null;

  async componentDidMount() {
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

    // this.unsubscribe = NetInfo.addEventListener(state => {
    //   console.log("N");
    //   if(!state.isConnected){
    //     this.setState({showModalOffline: true, modalBody: translang.t('ALERT_OFFLINE') });
    //   }
    // });

    const today = new Date();
    const userInfo = await Storage.getUserInfo();
    this.setState({ selectedDate: today, selected: moment(today).format("YYYY-MM-DD"), userInfo: userInfo }, () => {
      this.loadData(today);
    });
  }

  componentWillUnmount = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }
    if(this.focusListener){
      this.focusListener.remove();
    }
    // this.unsubscribe();
  };

  loadData = (date) => {
    this.setState({ isLoading: true });

    const userInfo = this.state.userInfo;

    ApiManager.getSchoolCalendarDates(userInfo.ID, date, userInfo.SchoolID).then(list => {
      this.setState({ calendarDateList: list, isLoading: false}, () => {
        const date = moment();
        this.selectDate(date);
      })
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };

  loadDateData = (date) => {
    this.setState({ isLoading: true });

    const userInfo = this.state.userInfo;

    ApiManager.getSchoolCalendarOnDate(userInfo.ID, date, userInfo.SchoolID).then(list => {
      this.setState({ selectedDateDataList: list, isLoading: false})
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };

  selectDate = (date) => {
    const _selDate = moment(date).format('YYYY-MM-DD');
    this.setState({ selected: _selDate, selectedDate: date }, () => {
      this.loadDateData(this.state.selectedDate);
    });
  };

  back = () => {
    this.props.navigation.goBack();
  };

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
  };

  renderDateDataItem = (data, seldate, index) => {
    return (
      <SubMenuItem
        key={index.toString()}
        label={data.title}
        date={seldate}
        color={data.color}
        onPressMenu={() => {
          this.setState({ selectedDateData: data, showModal: true });
        }}
      />
    );
  };

  render() {
    const markedDateArray = this.state.calendarDateList.map(data => {
      const date = moment(data.date).format('YYYY-MM-DD');
      return {
        [date]: {selected: true, selectedColor: SchoolCalendarColor[data.color].color},
      }
    });
    const markedDates = Object.assign({}, ...markedDateArray);

    console.log("makeDates:", markedDates);

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_schcalendar')}
          onMenuTap={() => this.back()}
        />

        <View style={styles.container}>
          <ScrollView indicatorStyle={'white'}>
            {/* {this.state.isOpenCalendar &&  */}
            <Calendar
              style={styles.calendar}
              onDayPress={(day) => {
                const date = moment(day.timestamp);
                this.selectDate(date);
              }}
              onMonthChange={(month) => {
                const date = moment(month.timestamp);
                this.loadData(date);
              }}
              monthFormat={'MMMM yyyy'}
              markedDates={{
                ...markedDates,
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
                todayTextColor: 'white',
                textSectionTitleColor: Color.n_default_gray,
                arrowColor: Color.n_default_gray,

                arrowColor: 'black',
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
            {/* } */}

            <View style={ styles.menuContainer}>
              <Text style={styles.labelSelectDate}>{moment(this.state.selected).format('DD MMMM YYYY')}</Text>
            </View>

            {!this.state.isOpenDate &&
            <View>
              {this.state.selectedDateDataList.map((value, index) => {
                return this.renderDateDataItem(value, this.state.selected, index);
              })}
            </View>}


            {/* <MenuItem
              label={this.state.selected}
              // show_caret="1"
              flag_open={!this.state.isOpenCalendar}
              onPressMenu={() => {
                // this.setState({ isOpenDate: !this.state.isOpenDate });
                // this.setState({ isOpenCalendar: !this.state.isOpenCalendar });
              }}
              onPressCaret={() => {
                this.setState({ isOpenCalendar: !this.state.isOpenCalendar });
              }}
            />
            {!this.state.isOpenDate &&
            <View>
              {this.state.selectedDateDataList.map((value, index) => {
                return this.renderDateDataItem(value);
              })}
            </View>} */}

            <AlertWithImageModal
              isVisible={this.state.showModal}
              image={Images.ic_calendar}
              message={this.state.selectedDateData?.title ?? " "}
              buttonColors={[Color.green_button_next_color1, Color.green_button_next_color2]}
              isVerticalGradient={false}
              onClose={() => { this.setState({ showModal: false }) }}
            />

            <AlertOfflineModal
              isVisible={this.state.showModalOffline}
              image={Images.n_ic_warning}
              message={this.state.modalBody}
              buttonColors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
              isVerticalGradient={false}
              onClose={() => { this.setState({ showModal: false }) }}
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
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: 20,
  },

  menuItemText:{
    fontFamily: 'THSarabunNew',
    fontSize: 25,
    marginVertical: 2,
    marginHorizontal: 10,
    color: Color.dark,
  },

  subMenuItemContainer: {
    minHeight: 100,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 25,
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: 'black',
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5.0,
  },

  subMenuItem: {
    flexDirection: 'row',
    width: '100%',
    marginVertical: 6,
    alignItems: 'center',
  },

});
