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
import CustomSwitcher from '../../components/CustomSwitcher';
import NumberFormat from 'react-number-format';

import StartCalendarModal from '../../components/CalendarModal';
import EndCalendarModal from '../../components/CalendarModal';

const MenuItem = (props) => {
  const { label, show_caret, flag_open, onPressMenu, onPressCaret } = props;
  return (
    <View style={styles.menuCont}>

      <TouchableOpacity style={styles.menuItem} onPress={() => { onPressMenu() }}>
        <Text
          style={{ fontFamily: 'THSarabunNew', fontSize: 25, fontWeight: 'bold', marginVertical: 2, marginHorizontal: 10, color: Color.white }}>
          {label}
        </Text>
      </TouchableOpacity>

      {show_caret && <TouchableOpacity style={{ position: 'absolute', marginVertical: 10, right: 25, alignItems: 'center' }}
        onPress={onPressCaret}>

        {flag_open && <Caretdown name="caretup" size={20} color='#fff' style={{ marginTop: 5 }} />}
        {!flag_open && <Caretdown name="caretdown" size={20} color='#fff' style={{ marginTop: 0 }} />}

      </TouchableOpacity>}

    </View>
  );
};

export default class ReportOrderListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      selected: '',
      isOpenCalendar: true,
      userInfo: {},
      reportList: [],
      selectedDateList: [],
      isLoading: false,
      tabIndex: 0,

      historyList: [],
      historyStartDate: "",
      historyEndDate: "",
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
      console.log("ReportOrderListScreen");
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const today = new Date();
      const userInfo = await Storage.getUserInfo();

      this.setState({ selected: moment(today).format("YYYY-MM-DD"), userInfo: userInfo, historyStartDate: moment(), historyEndDate: moment() }, () => {
        this.loadDateList(moment(today));
        this.loadDataRange();
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
    const parentRoute = this.props.navigation.getParam('parent') ?? 'Report';
    this.props.navigation.navigate(parentRoute);
  };

  loadData = () => {
    this.setState({ isLoading: true});

    const userInfo = this.state.userInfo;
    ApiManager.getPurchaseReportItemList(userInfo.ID, userInfo.SchoolID, this.state.selected).then(list => {
      if(list.length > 0){
        this.setState({ reportList: list[0].Payments, isLoading: false});
      }else{
        this.setState({ reportList: [], isLoading: false});
      }

    }).catch(error => {
      console.log("loadData", error);
      this.setState({ isLoading: false });
    });
  };

  loadDataRange = () => {
    this.setState({isLoading: true});
    const userInfo = this.state.userInfo;
    ApiManager.getPurchaseReportHistory(userInfo.ID, userInfo.SchoolID, this.state.historyStartDate, this.state.historyEndDate).then(list => {
      let temp = [];
      if(list.length > 0){
        list.forEach(itemA => {
          if(itemA.Payments.length > 0){
            itemA.Payments.forEach(itemB => {
              temp.push(itemB);
            });
          }
        });
      }
      this.setState({ historyList: temp, isLoading: false});
    }).catch(error => {
      console.log("loadDataRange", error);
      this.setState({ isLoading: false });
    });
  };

  loadDateList = (date) => {
    this.setState({ isLoading: true });

    const userInfo = this.state.userInfo;
    const startDate = date.startOf('month').format('YYYY-MM-DD');
    ApiManager.getPurchaseReportDateList(userInfo.ID, startDate).then(list => {
      const dates = list.map(item => item.daybuy);
      this.setState({ selectedDateList: dates, isLoading: false}, () => {
        this.loadData();
      })
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  }

  onSelectItem = (item) => {
    this.props.navigation.navigate('ReportOrderDetail', {buyItem: item, userInfo: this.state.userInfo});
  }

  onStartDateSelected = (date) => {
    if(date==null){
      this.setState({showStartCalendar: false});
    }else{
      this.setState({ showStartCalendar: false, historyStartDate: date }, ()=>{
        this.loadDataRange();
      });
    }
  }

  onEndDateSelected = (date) => {
    if(date== null){
      this.setState({EndCalendarModal: false});
    }else{
      this.setState({ showEndCalendar: false, historyEndDate: date }, ()=>{
        this.loadDataRange();
      });
    }
  }

  renderItem = (item, index) => {
    const date = moment(item.PAYMENTTIME).format('DD MMMM YYYY');
    const time = moment(item.PAYMENTTIME).format('HH:mm:ss');
    let totalPrice = item.TOTALMONEY;

    return (
      <TouchableOpacity style={styles.itemContainer} onPress={() => this.onSelectItem(item)}>
        <View style={{flex: 1}}>
          <Text style={styles.infoText} numberOfLines={1}>{date}</Text>
          <View style={{height: 2, backgroundColor: Color.n_default_gray_light, marginVertical: 3}}/>
          <Text style={styles.itemName} numberOfLines={1}>{item.SHOPNAME}</Text>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={styles.infoText}>{time}</Text>
            <NumberFormat
              value={totalPrice}
              displayType={'text'}
              thousandSeparator={true}
              renderText={value => (<Text style={styles.infoText}>{`${translang.t('PURCHASE')} ${value}`}</Text>)}/>
          </View>
        </View>
      </TouchableOpacity>
    )
  };




  onChangeSwitcher = (index) => {
    this.setState({tabIndex: index, isEdit: false})
  }

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

    // const today = moment().format('YYYY-MM-DD');
    // markDates[today] = {
    //   selected: true,
    //   disableTouchEvent: true,
    //   selectedColor: Color.picton_blue,
    //   selectedTextColor: 'white'
    // };

    const selectedDate = moment(this.state.selected).format('DD MMM YYYY');
    const options = [
      { title: translang.t('REPORT_calendar')},
      { title: translang.t('REPORT_list')},
    ];
    let totalVal = 0;
    if(this.state.reportList.length > 0){
      this.state.reportList.forEach(item=>{
        totalVal = totalVal + item.TOTALMONEY;
      })
    }
    let mindate = moment().subtract(6, 'M');
    mindate = moment(mindate).startOf('month');

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('ORDER_LIST')}
          onMenuTap={this.back}
        />
        <CustomSwitcher
          dataList={options}
          selectedIndex={this.state.tabIndex ?? 0}
          onChangedSwitch={(index)=>this.onChangeSwitcher(index)}
          containerStyle = {{marginHorizontal: 15, height: 50, marginTop: 20, marginBottom: 10}}
          radius = {15}
          textSize = {20}
        />
        <View style={styles.container}>
          {this.state.tabIndex == 0 && <>
          <ScrollView style={styles.menuContainer} indicatorStyle={'black'}>
            {this.state.isOpenCalendar && <Calendar
              style={styles.calendar}
              onDayPress={(day) => {
                this.setState({selected: day.dateString}, ()=>{
                  this.loadData();
                })
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
                    backgroundColor: Color.picton_blue,
                    borderRadius: 16,
                  }
                },

              }}
            />}

            <MenuItem
              label={selectedDate}
              flag_open={!this.state.isOpenCalendar}
              onPressMenu={() => {
                // this.setState({ isOpenDate: !this.state.isOpenDate });
                // this.setState({ isOpenCalendar: !this.state.isOpenCalendar });
              }}
            />
            {this.state.reportList.length > 0 &&
            <FlatList
              data={this.state.reportList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item, index}) => this.renderItem(item, index)}
            />}
          </ScrollView>

          <View style={styles.bottomStyle}>
            <Text style={styles.bottomTxt}>{translang.t('ALL_EXPENSES')}</Text>
            <NumberFormat
              value={totalVal}
              displayType={'text'}
              thousandSeparator={true}
              renderText={value => (<Text style={styles.bottomTxt}>{`${value}`}</Text>)}/>
          </View>
          </>}
          {this.state.tabIndex == 1 && <View style={{height: '100%'}}>
            <View style={{width: '80%', marginRight: 'auto', marginLeft: 'auto', marginTop: 10}}>
              <View style={{flexDirection: 'row'}}>
                <Text style={{flex: 1, textAlign: 'center', color: Color.n_default_orange, fontFamily: 'THSarabunNew', fontSize: 15, fontWeight: 'bold'}}>{translang.t('SEARCH_STARTDATE')}</Text>
                <Text style={{flex: 1, textAlign: 'center', color: Color.n_default_orange, fontFamily: 'THSarabunNew', fontSize: 15, fontWeight: 'bold'}}>{translang.t('SEARCH_ENDDATE')}</Text>
              </View>
              <View style={styles.rangeContainer}>
                <TouchableOpacity style={{flex: 1}}  onPress={() => {this.setState({showStartCalendar: true});}}>
                  <Text style={{textAlign: 'center', color: Color.white, fontFamily: 'THSarabunNew', fontSize: 18, fontWeight: 'bold'}}>{moment(this.state.historyStartDate).format('DD MMMM YYYY')}</Text>
                </TouchableOpacity>
                <View style={{height: '80%', width: 1, backgroundColor: Color.white}} />
                <TouchableOpacity style={{flex: 1}}  onPress={() => {this.setState({showEndCalendar: true});}}>
                  <Text style={{textAlign: 'center', color: Color.white, fontFamily: 'THSarabunNew', fontSize: 18, fontWeight: 'bold'}}>{moment(this.state.historyEndDate).format('DD MMMM YYYY')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{height: 2, backgroundColor: Color.n_default_brown, marginVertical: 10, marginHorizontal: 20}} />
            {this.state.historyList.length > 0 &&
            <FlatList
              data={this.state.historyList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item, index}) => this.renderItem(item, index)}
            />}
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

  menuCont: {
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
    paddingHorizontal: 30,
    paddingLeft: 30,
  },

  menuContainer: {
    marginTop: 10,
    paddingHorizontal: 0,
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
  itemContainer: {
    margin: 15,
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
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  mark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  itemName: {
    fontSize: 25,
    fontFamily: 'THSarabunNew',
    fontWeight: 'bold',
    color: Color.n_default_gray_dark
  },
  infoText: {
    fontSize: 20,
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray_dark
  },
  totalContainer: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: Color.jungle_green,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  totalText: {
    fontSize: 28,
    fontFamily: 'THSarabunNew',
    fontWeight: 'bold',
    color: Color.white,
  },
  bottomStyle: {
    width: '100%',
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'space-between',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: Color.white,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  bottomTxt: {
    color: Color.n_default_orange,
    textAlign: 'center',
    fontSize: 26,
    fontFamily: 'THSarabunNew',
    fontWeight: 'bold',
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
