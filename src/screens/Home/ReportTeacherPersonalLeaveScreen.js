import React, { useState } from 'react';
import {View, BackHandler, TouchableOpacity, FlatList, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment';
import BackNavigationBar from '../../components/BackNavigationBar';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import ProgressHud from '../../components/ProgressHud';
import { Calendar } from 'react-native-calendars';
import { ScrollView } from 'react-native-gesture-handler';
import StartCalendarModal from '../../components/CalendarModal';
import EndCalendarModal from '../../components/CalendarModal';

export default class ReportTeacherPersonalLeaveScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      reportList: [],
      isLoading: false,
      startDate: moment(),
      endDate: moment(),
      showStartCalendar: false,
      showEndCalendar: false,

      type: "",
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
      const type = this.props.navigation.getParam('type');

      this.setState({userInfo: userInfo, type: type}, ()=>{
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
    ApiManager.getLeaveReportListWithDate(userInfo.ID, this.state.startDate, this.state.endDate).then(list => {
      this.setState({ reportList: list, isLoading: false});
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  }

  onSelectItem = (item, index) => {
    const params = {
      letterId: item.letterId,
      // from: 'ReportLeave',
      userInfo: this.state.userInfo,
      type: this.state.type,
      from: 'ReportTeacherPersonalLeave',
    }

    this.props.navigation.navigate('LeaveRequestDetail', params);
  }

  renderItem = (item, index) => {
    const date = moment(item.letterSubmitDate).format('DD MMM YYYY');
    const type = getCurrentLocale() == 'th' ? item.letterType : item.letterTypeEN;
    let status = "-1";
    if(item.ApprovedStatus){
      status = item.ApprovedStatus.StatusCode;
    }

    let local_imgcolor = '#4072b1';
    let local_bgcolor = '#fff';
    let statusText = '';

    if (status == '0') {
      local_imgcolor = Color.n_default_brown;
      statusText = translang.t('LEAVE_pending');
    } else if (status == '1') {
      local_imgcolor = Color.n_button_gradient_green_end;
      statusText = translang.t('LEAVE_approved');
    } else if (status == '2') {
      local_imgcolor = Color.n_default_orange;
      statusText = translang.t('LEAVE_rejected');
    } else if (status == '3') {
      local_imgcolor = Color.n_scorpion;
      statusText = translang.t('DELETED');
    } else if (status == '4') {
      local_imgcolor = Color.n_scorpion;
      statusText = translang.t('CANCELED');
    } else if (status == '5') {
      local_imgcolor = Color.n_default_brown;
      statusText = translang.t('REQUEST_CANCELED');
    }

    return (
      <TouchableOpacity style={[styles.itemContainer]} onPress={() => this.onSelectItem(item, index)}>
        <View style={styles.itemInfoContainer}>
          <Text style={styles.userInfoTitle}>{date}</Text>
          <Text style={{...styles.userInfoTitle, fontWeight: 'bold'}}>{type}</Text>
        </View>
        <View style={{...styles.itemStatusContainer, backgroundColor: local_imgcolor}}>
          <Text style={styles.labelStatus}>{statusText}</Text>
        </View>
      </TouchableOpacity>
    )
  };

  onStartDateSelected = (date) => {
    if(date == null){
      this.setState({showStartCalendar: false});
    }else{
      this.setState({ showStartCalendar: false, startDate: date }, ()=>{
        this.loadData();
      });
    }

  }

  onEndDateSelected = (date) => {
    if(date == null){
      this.setState({showEndCalendar: false});
    }else{
      this.setState({ showEndCalendar: false, endDate: date }, ()=>{
        this.loadData();
      });
    }

  }

  render() {
    let totalLeave = 0;
    if (this.state.reportList.length > 0) {
      totalLeave = this.state.reportList.length;
    }

    let title = "";
    let totalUnit = "";
    title = translang.t('DRAWER_reportleave');
    totalUnit = translang.t('TIMES');

    let mindate = moment().subtract(6, 'M');
    mindate = moment(mindate).startOf('month');

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={title}
          onMenuTap={() => this.back()}
        />

        <View style={styles.container}>

          <View style={styles.topRangeContainer}>
            <View style={{flexDirection: 'row'}}>
              <Text style={{flex: 1, textAlign: 'center', color: Color.n_default_orange, fontFamily: 'THSarabunNew', fontSize: 15, fontWeight: 'bold'}}>{translang.t('SEARCH_STARTDATE')}</Text>
              <Text style={{flex: 1, textAlign: 'center', color: Color.n_default_orange, fontFamily: 'THSarabunNew', fontSize: 15, fontWeight: 'bold'}}>{translang.t('SEARCH_ENDDATE')}</Text>
            </View>
            <View style={styles.rangeContainer}>
              <TouchableOpacity style={{flex: 1}}  onPress={() => {this.setState({showStartCalendar: true});}}>
                <Text style={{textAlign: 'center', color: Color.white, fontFamily: 'THSarabunNew', fontSize: 18, fontWeight: 'bold'}}>{moment(this.state.startDate).format('DD MMMM YYYY')}</Text>
              </TouchableOpacity>
              <View style={{height: '80%', width: 1, backgroundColor: Color.white}} />
              <TouchableOpacity style={{flex: 1}}  onPress={() => {this.setState({showEndCalendar: true});}}>
                <Text style={{textAlign: 'center', color: Color.white, fontFamily: 'THSarabunNew', fontSize: 18, fontWeight: 'bold'}}>{moment(this.state.endDate).format('DD MMMM YYYY')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            style={{flex: 1, marginHorizontal: 10, marginVertical: 5}}
            data={this.state.reportList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => this.renderItem(item, index)} />

        </View>

        <View style={styles.bottomStyle}>
          <Text style={styles.bottomTxt}>{translang.t('TOTAL_LEAVE')}</Text>
          <Text style={styles.bottomTxt}>{`${totalLeave} ${totalUnit}`}</Text>
        </View>

        <StartCalendarModal
          isVisible={this.state.showStartCalendar}
          type={'single'}
          // maxDate={moment()}
          minDate={mindate}
          onDateSelect={ result => this.onStartDateSelected(result)} />
        <EndCalendarModal
          isVisible={this.state.showEndCalendar}
          type={'single'}
          // maxDate={moment()}
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
  itemContainer: {
    minHeight: 100,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: Color.white,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    marginHorizontal: 5,
    marginVertical: 8,
  },
  mark: {
    height: 20,
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10
  },
  date: {
    flex: 1.5,
    fontSize: 25,
    fontFamily: 'THSarabunNew',
    fontWeight: 'bold',
    marginLeft: 20,
    marginRight: 5,
  },
  type: {
    flex: 1,
    fontSize: 25,
    fontFamily: 'THSarabunNew',
    fontWeight: 'bold',
    marginRight: 5,
    textAlign: 'center',
  },
  status: {
    flex: 1,
    fontSize: 25,
    fontFamily: 'THSarabunNew',
    textAlign: 'center',
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

  topRangeContainer:{
    shadowColor: Color.black,
    backgroundColor: 'white',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,

    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,

    paddingVertical: 10,
    marginBottom: 5,
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

    marginVertical: 10,
    marginHorizontal: 20,
  },

  itemInfoContainer:{
    flex: 1,
    paddingLeft: 15,
    paddingVertical: 10,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfoTitle:{
    flex: 1,
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    color: Color.n_default_gray
  },
  userInfoContent:{
    flex: 1,
    fontFamily: 'THSarabunNew',
    fontSize: 18,
    color: Color.n_default_gray,
    marginLeft: 5,
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
});
