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
import storage from '../../utils/storage';

export default class ReportTeacherStudentLeaveListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      reportList: [],
      isLoading: false,
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    const userInfo = await storage.getUserInfo();
    
    this.setState({userInfo: userInfo}, ()=>{
      this.loadData()
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
    const parentRoute = this.props.navigation.getParam('parent') ?? 'Report';
    this.props.navigation.navigate(parentRoute);
  };

  loadData = (date) => {
    this.setState({ isLoading: true });
    const userInfo = this.state.userInfo;
    ApiManager.getLeaveReportList(userInfo.ID, userInfo.SchoolID).then(list => {
      this.setState({ reportList: list, isLoading: false}, () => {
        
      })
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  }

  onSelectItem = (item, index) => {
    const params = {
      letterId: item.letterId, 
      from: 'ReportLeave', 
      userInfo: this.state.userInfo,
      type: "teacherstudent",
    }

    this.props.navigation.navigate('LeaveRequestDetail', params);
  }

  renderItem = (item, index) => {
    const date = moment(item.Date).format('DD MMM YYYY');
    const type = item.type;
    const status = item.status;

    let local_imgcolor = '#4072b1';
    let local_bgcolor = '#fff';
    let statusText = '';
    
    if (status === '1') {
        local_imgcolor = Color.n_button_gradient_green_end;
        statusText = translang.t('LEAVE_approve');
    } else if (status === '0') {
        local_imgcolor = Color.n_default_orange;
        statusText = translang.t('LEAVE_reject');
    } else if (status === '4') {
        local_imgcolor = Color.n_scorpion;
        statusText = translang.t('CANCEL');
    } else {
        local_imgcolor = Color.n_default_brown;
        statusText = translang.t('LEAVE_pending');
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

  render() {
    let totalLeave = 0;
    if (this.state.reportList.length > 0) {
      totalLeave = this.state.reportList[0].totalLeaveDay
    }

    let title = "";
    let totalUnit = "";
    title = translang.t('DRAWER_leave');
    totalUnit = translang.t('TIMES');
    
    let markedDates = {};
    this.state.reportList.forEach(item => {
      const status = item.StatusIN;
      const color = this.getStatusColor(status);
      const day = moment(item.dScan).format('DD MMMM YYYY');
      const statusOut = item.StatusOut;
      markedDates[day] = { selected: true, selectedColor: color, textColor: 'white' };
    });
    
    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={title}
          onMenuTap={() => this.back()}
        />

        <View style={styles.container}>
          <FlatList
            style={{flex: 1, marginHorizontal: 10, marginVertical: 5}}
            data={this.state.reportList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => this.renderItem(item, index)} />

          <View style={styles.bottomStyle}>
            <Text style={styles.bottomTxt}>{translang.t('TOTAL_LEAVE')}</Text>
            <Text style={styles.bottomTxt}>{`${totalLeave} ${totalUnit}`}</Text>
          </View>
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
  itemContainer: {
    height: 100,
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
