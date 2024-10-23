import React, { useState } from 'react';
import { Image, View, BackHandler, Dimensions, } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import CalendarModal from '../../components/CalendarModal';
import ProgressHud from '../../components/ProgressHud';
import BackNavigationBar from '../../components/BackNavigationBar';

import ReportExecutiveAttendanceStudentTab from './ReportExecutiveAttendanceStudentTab';
import ReportExecutiveAttendancePersonalTab from './ReportExecutiveAttendancePersonalTab';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import moment from 'moment';

export default class ReportExecutiveAttendanceScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      showCalendarModal: false,
      userInfo: {},
      selectedTabIndex: 0,
      tabRoutes: [],
      selectedDate: '',
      studentReportList: {},
      personalReportList: {},
    };
  }

  handleBackButton = () => {
    if(this.state.showCalendarModal){
      this.setState({showCalendarModal: false});
      return true;
    }
    this.back();
    return true;
  };

  async componentDidMount() {
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

    const userInfo = await Storage.getUserInfo();

    const routes = [
      {
        key: 'student',
        title: translang.t('STUDENT').toUpperCase()
      },
      {
        key: 'personal',
        title: translang.t('PERSONAL').toUpperCase()
      },
    ];

    const today = moment().format('YYYY-MM-DD');
    this.setState({ userInfo: userInfo, selectedDate: today, selectedTabIndex: 0, tabRoutes: routes }, () => {
      this.loadData();
    })
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

  loadData = () => {
    this.setState({ isLoading: true });

    const userInfo = this.state.userInfo;
    const date = this.state.selectedDate;

    ApiManager.getAttendanceSchoolReportGraph(userInfo.SchoolID, date).then(list => {
      let studentList = {};
      let personalList = {};

      if ((list.student ??[]).length > 0) {
        studentList = list.student[0];
      }
      if ((list.employees ??[]).length > 0) {
        personalList = list.employees[0];
      }
      
      this.setState({ studentReportList: studentList, personalReportList: personalList, isLoading: false });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  }

  onDateSelected = (date) => {
    if (date === null) {
      this.setState({ showCalendarModal: false });
    } else {
      const _date = moment(date).format('YYYY-MM-DD');
      this.setState({ showCalendarModal: false, selectedDate: _date }, () => {
        this.loadData();
      });
    }

    
  }

  renderTabBar = (props) => {
    return (
      <TabBar
        {...props}
        style={{ ...styles.tabBar }}
        indicatorStyle={{ height: 50, backgroundColor: Color.n_default_brown, borderRadius: 20, }}
        inactiveColor={Color.n_default_orange}
        activeColor={Color.white}
        labelStyle={{fontWeight: 'bold', fontSize: 17, fontFamily: 'THSarabunNew', marginTop: 'auto', marginBottom: 'auto', textTransform: 'none', }}
      />
    );
  };

  renderStudentTab = () => (
    <ReportExecutiveAttendanceStudentTab navigation={this.props.navigation} reportList={this.state.studentReportList} date={this.state.selectedDate} isSelected={this.state.selectedTabIndex === 0} />
  );

  renderPersonalTab = () => (
    <ReportExecutiveAttendancePersonalTab navigation={this.props.navigation} reportList={this.state.personalReportList} date={this.state.selectedDate} isSelected={this.state.selectedTabIndex === 1} />
  );

  render() {
    const initialLayout = { width: Dimensions.get('window').width };

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_reportattendance')}
          onMenuTap={() => this.back()}
          is_calendar="1"
          onCalendarTap={() => this.setState({showCalendarModal: true})}
        />

        <View style={styles.container}>
          <TabView
            style={styles.tabView}
            navigationState={{ index: this.state.selectedTabIndex, routes: this.state.tabRoutes }}
            renderTabBar={this.renderTabBar}
            renderScene={({ route }) => {
              switch (route.key) {
                case 'student':
                  return this.renderStudentTab();
                case 'personal':
                  return this.renderPersonalTab();
              }
            }}
            onIndexChange={(index) => this.setState({ selectedTabIndex: index })}
            initialLayout={initialLayout}
            swipeEnabled={false}
          />
        </View>
        <CalendarModal
          isVisible={this.state.showCalendarModal}
          type={'single'}
          onDateSelect={result => this.onDateSelected(result)} />
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
  tabBar: {
    width: '90%',
    height: 50,
    borderRadius: 20,    
    
    marginVertical: 20,
    marginLeft: 'auto',
    marginRight: 'auto',

    backgroundColor: Color.white,
    shadowColor: 'black', 
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  tabView: {
    flex: 1,
  },
});
