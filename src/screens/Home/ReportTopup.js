import React, { useState } from 'react';
import { Image, View, BackHandler, TouchableOpacity, ImageBackground, FlatList, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import Caretdown from 'react-native-vector-icons/AntDesign';
import moment from 'moment';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import BackNavigationBar from '../../components/BackNavigationBar';
import CustomSwitcher from '../../components/CustomSwitcher';
import _ from 'lodash';
import NumberFormat from 'react-number-format';
import StartCalendarModal from '../../components/CalendarModal';
import EndCalendarModal from '../../components/CalendarModal';


const MenuItem = (props) => {
  const { label, show_caret, flag_open, onPressMenu, onPressCaret } = props;
  return (
    <View style={styles.menuCont}>
      <TouchableOpacity style={styles.menuItem} onPress={() => { onPressMenu() }}>
        <Text
          style={{ fontFamily: 'THSarabunNew', fontSize: 25, marginVertical: 2, marginHorizontal: 10, color: Color.white }}>
          {label}
        </Text>
      </TouchableOpacity>

      {show_caret &&
      <TouchableOpacity style={{ position: 'absolute', marginVertical: 10, right: 25, alignItems: 'center' }}
        onPress={onPressCaret}>

        {flag_open && <Caretdown name="caretup" size={20} color='#fff' style={{ marginTop: 5 }} />}
        {!flag_open && <Caretdown name="caretdown" size={20} color='#fff' style={{ marginTop: 0 }} />}

      </TouchableOpacity>}

    </View>
  );
};

export default class ReportTopupScreen extends React.Component {
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
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const today = new Date();
      const userInfo = await Storage.getUserInfo();

      this.setState({ selected: moment(today).format("YYYY-MM-DD"), userInfo: userInfo, historyStartDate: moment(), historyEndDate: moment() }, () => {
        this.loadData(moment(today));
        this.loadHistoryData();
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

  loadData = (date) => {
    const day = date.format('YYYY-MM-DD');
    this.setState({ isLoading: true, selected: day});
    const userInfo = this.state.userInfo;
    const startDate = day;
    const enddate = day;

    ApiManager.getTopupHistoryList(userInfo.SchoolID, startDate, enddate, userInfo.ID).then(list => {
      if(list.length > 0){
        this.setState({reportList: list[0].DATA, isLoading: false});
      }else{
        this.setState({reportList: [], isLoading: false});
      }
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };



  loadHistoryData = ()=>{
    this.setState({ isLoading: true});

    const userInfo = this.state.userInfo;
    const startDate = this.state.historyStartDate;
    const enddate = this.state.historyEndDate;

    // const startDate = "03/01/2022";
    // const enddate = "03/30/2022";

    ApiManager.getTopupHistoryList(userInfo.SchoolID, startDate, enddate, userInfo.ID).then(list => {
      this.setState({historyList: list, isLoading: false});
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  }

  loadDateList = (date) => {
    this.setState({ isLoading: true });

    const userInfo = this.state.userInfo;
    const startDate = date.startOf('month').format('YYYY-MM-DD');
    ApiManager.getTopupReportDateList(userInfo.ID, userInfo.SchoolID, startDate).then(list => {

    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  }

  onStartDateSelected = (date) => {
    if(date == null){
      this.setState({showStartCalendar: false});
    }else{
      this.setState({ showStartCalendar: false, historyStartDate: date }, ()=>{
        this.loadHistoryData();
      });
    }
  }

  onEndDateSelected = (date) => {
    if(date == null){
      this.setState({showEndCalendar: false});
    }else{
      this.setState({ showEndCalendar: false, historyEndDate: date }, ()=>{
        this.loadHistoryData();
      });
    }
  }

  onSelectItem = (item) => {

  }

  renderItem = (item, index) => {
    return (
      <TouchableOpacity style={styles.itemContainer} onPress={() => this.onSelectItem(item)}>
        <Text style={styles.infodateText}>{moment(item.TOPUPTIME).format('DD MMMM YYYY')}</Text>
        <View style={{flexDirection: 'row'}}>
          <Text style={styles.infodateText}>{translang.t('HOMEWORK_time')}</Text>
          <Text style={{...styles.infodateText, color: Color.black, marginLeft: 20}}>{moment(item.TOPUPTIME).format('HH:mm')}</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.infodateText}>{translang.t('BY')}</Text>
            <Text style={{...styles.infodateText, color: Color.n_button_gradient_green_start, marginLeft: 20}}>{item.EMPLOYEESNAME}</Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.infodateText}>{translang.t('DRAWER_topup')}</Text>
            <NumberFormat
              value={item.TOPUPMONEY}
              displayType={'text'}
              thousandSeparator={true}
              renderText={value => (<Text style={{...styles.infodateText, color: Color.n_button_gradient_green_start, marginLeft: 20}}>{value}</Text>)}/>

          </View>
        </View>
      </TouchableOpacity>
    )
  };

  renderHistoryItem = (item, index) => {

    let topup = 0;
    let balance = "";
    let employee = "";

    if(item.DATA.length > 0){
      balance = item.DATA[0].BALANCEMONEY;
      employee = item.DATA[0].EMPLOYEESNAME;
      item.DATA.forEach(itemData=>{
        topup = topup + itemData.TOPUPMONEY;
      })
    }

    return (
      <TouchableOpacity style={styles.itemContainer} onPress={() => this.onSelectItem(item)}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={styles.infodateText}>{moment(item.TOPUPDATE).format('DD MMMM YYYY')}</Text>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.infodateText}>{translang.t('HOMEWORK_time')}</Text>
            <Text style={{...styles.infodateText, color: Color.black, marginLeft: 20}}>{moment(item.DATA[0].TOPUPTIME).format('HH:mm')}</Text>
          </View>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.infodateText}>{translang.t('DRAWER_topup')}</Text>
            <NumberFormat
              value={topup}
              displayType={'text'}
              thousandSeparator={true}
              renderText={value => (<Text style={{...styles.infodateText, color: Color.n_button_gradient_green_start, marginLeft: 20}}>{value}</Text>)}/>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.infodateText}>{translang.t('USERINFO_balance')}</Text>
            <NumberFormat
              value={balance}
              displayType={'text'}
              thousandSeparator={true}
              renderText={value => (<Text style={{...styles.infodateText, color: Color.n_button_gradient_green_start, marginLeft: 20}}>{value}</Text>)}/>

          </View>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.infodateText}>{translang.t('BY')}</Text>
            <Text style={{...styles.infodateText, color: Color.n_button_gradient_green_start, marginLeft: 20}}>{employee}</Text>
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

    /// total calculated by getting number between `จำนวน` and `บาท`
    // let total = 0;
    // this.state.reportList.forEach(payment => {
    //   payment.items.forEach(item => {
    //     const price = item.Price * item.Amount;
    //     total += price;
    //   })
    // });

    const options = [
      { title: translang.t('REPORT_calendar')},
      { title: translang.t('REPORT_list')},
    ];

    let startMonth = moment(this.state.historyStartDate).format('DD MMMM YYYY');
    let endMonth = moment(this.state.historyEndDate).format('DD MMMM YYYY');

    let totalVal = 0;
    if(this.state.reportList.length > 0){
      this.state.reportList.forEach(item=>{
        totalVal = totalVal + item.TOPUPMONEY;
      })
    }

    let mindate = moment().subtract(6, 'M');
    mindate = moment(mindate).startOf('month');

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('TOPUP_REPORT')}
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
            {this.state.isOpenCalendar &&
            <Calendar
              style={styles.calendar}
              onDayPress={(day) => {
                const date = moment(day.timestamp);
                this.loadData(date);
              }}
              onMonthChange={(month) => {
                const date = moment(month.timestamp);
                // this.loadDateList(date);
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
            />}

            <MenuItem
              label={selectedDate}
              flag_open={!this.state.isOpenCalendar}
              onPressMenu={() => {
                // this.setState({ isOpenDate: !this.state.isOpenDate });
                // this.setState({ isOpenCalendar: !this.state.isOpenCalendar });
              }}
              onPressCaret={() => {
                // this.setState({ isOpenCalendar: !this.state.isOpenCalendar });
              }}
            />
            <FlatList
              data={this.state.reportList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item, index}) => this.renderItem(item, index)}
            />
          </ScrollView>

          <View style={styles.bottomStyle}>
            <Text style={styles.bottomTxt}>{translang.t('ALL_TOPUP')}</Text>
            <NumberFormat
              value={totalVal}
              displayType={'text'}
              thousandSeparator={true}
              renderText={value => (<Text style={styles.bottomTxt}>{`${value}`}</Text>)}/>
          </View>
          </>}

          {this.state.tabIndex == 1 &&
          <View style={{height: '100%'}}>
            <View style={{width: '80%', marginRight: 'auto', marginLeft: 'auto', marginTop: 10}}>
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
              data={this.state.historyList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item, index}) => this.renderHistoryItem(item, index)}
            />
          </View>}

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
  menuContainer: {
    marginTop: 10,
    paddingHorizontal: 0,
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
    minHeight: 100,
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
  infodateText:{
    fontSize: 18,
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray
  },
  infoTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray
  },
  infoText: {
    marginLeft: 10,
    flex: 1,
    fontSize: 20,
    fontFamily: 'THSarabunNew',
    color: Color.n_button_gradient_green_start,
    marginRight: 20,
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
});
