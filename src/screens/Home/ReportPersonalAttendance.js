import React, { useState } from 'react';
import { Image, View, BackHandler, TouchableOpacity, Dimensions, } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

import ProgressHud from '../../components/ProgressHud';
import BackNavigationBar from '../../components/BackNavigationBar';
import FilterModal from '../../components/FilterModal';
import ReportPersonalAttendanceCalendarTab from './ReportPersonalAttendanceCalendarTab';
import ReportPersonalAttendanceListTab from './ReportPersonalAttendanceListTab';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import moment from 'moment';

export default class ReportPersonalAttendanceScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      userInfo: {},
      selectedTabIndex: 0,
      tabRoutes: [],
      status: -1,
      startDate: '',
      endDate: '',
      yearTermList: [],
      reportList: [],
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

    const userInfo = await Storage.getUserInfo();

    const routes = [
      {
        key: 'calendar',
        title: translang.t('REPORT_calendar')
      },
      {
        key: 'list',
        title: translang.t('REPORT_list')
      },
    ];

    const today = moment();
    const start = moment(today).add(-1, 'M').startOf('month').format('YYYY-MM-DD');
    const end = moment(today).endOf('month').format('YYYY-MM-DD');
    this.setState({ userInfo: userInfo, startDate: start, endDate: end, selectedTabIndex: 0, tabRoutes: routes }, () => {
      this.loadYearTermData();
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
    // this.props.navigation.goBack();
    const parentRoute = this.props.navigation.getParam('parent') ?? 'Report';
    this.props.navigation.navigate(parentRoute);
  };

  loadData = () => {
    this.setState({ isLoading: true });

    const userInfo = this.state.userInfo;
    ApiManager.getCome2School(userInfo.ID, userInfo.SchoolID, this.state.startDate, this.state.endDate, this.state.status).then(list => {
      this.setState({ reportList: list, isLoading: false });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  }

  loadYearTermData = () => {
    const userInfo = this.state.userInfo;

    ApiManager.getYearTermData(userInfo.ID, userInfo.SchoolID).then(list => {
      this.setState({yearTermList: list});
    }).catch(error => {
      console.log(error);
    });
  }

  renderTabBar = (props) => {
    return (
      <TabBar
        {...props}
        style={{ ...styles.tabBar }}
        indicatorStyle={{ height: 50, backgroundColor: Color.n_default_brown, borderRadius: 20, }}
        inactiveColor={Color.n_default_orange}
        activeColor={Color.white}
        labelStyle={{fontWeight: 'bold', fontSize: 24, fontFamily: 'THSarabunNew', marginTop: 'auto', marginBottom: 'auto', textTransform: 'none', }}
      />
    );
  };

  renderCalendarTab = () => (
    <ReportPersonalAttendanceCalendarTab navigation={this.props.navigation} startDate={this.state.startDate} endDate={this.state.endDate} reportList={this.state.reportList} isSelected={this.state.selectedTabIndex === 0} />
  );

  renderListTab = () => (
    <ReportPersonalAttendanceListTab reportList={this.state.reportList} isSelected={this.state.selectedTabIndex === 1} />
  );

  render() {
    const initialLayout = { width: Dimensions.get('window').width };

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_reportattendance')}
          onMenuTap={() => this.back()}
        />

        <View style={styles.container}>
          <TabView
            style={styles.tabView}
            navigationState={{ index: this.state.selectedTabIndex, routes: this.state.tabRoutes }}
            renderTabBar={this.renderTabBar}
            renderScene={({ route }) => {
              switch (route.key) {
                case 'calendar':
                  return this.renderCalendarTab();
                case 'list':
                  return this.renderListTab();
              }
            }}
            onIndexChange={(index) => this.setState({ selectedTabIndex: index })}
            initialLayout={initialLayout}
            swipeEnabled={false}
            
          />
        </View>
        <ProgressHud isVisible={this.state.isLoading} />

        <FilterModal
          isVisible={this.state.showModal}
          yearTermData={this.state.yearTermList}
          onClose={() => { this.setState({ showModal: false }) }}
          onOK={(startDate, endDate, status) => {
            this.setState({startDate: startDate, endDate: endDate, status: status, showModal: false}, () => {
              this.loadData();
            });
          }}
        />
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
    width: '80%',
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
