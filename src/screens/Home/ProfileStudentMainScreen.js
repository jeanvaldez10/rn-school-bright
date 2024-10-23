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

import ProfileStudentTabScreen from './ProfileStudentTabScreen';

export default class ProfileStudentMainScreen extends React.Component {

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
    console.log("ProfileStudentMainScreen");
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

    const userInfo = await Storage.getUserInfo();

    const routes = [
      {
        key: 'student',
        title: translang.t('PROFILE_studentinfo')
      },
      {
        key: 'parent',
        title: translang.t('PROFILE_parentinfo')
      },
      {
        key: 'education',
        title: translang.t('PROFILE_educationinfo')
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
    const parentRoute = this.props.navigation.getParam('parent') ?? 'App';
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
        labelStyle={{fontWeight: 'bold', fontSize: 17, fontFamily: 'THSarabunNew', marginTop: 'auto', marginBottom: 'auto', textTransform: 'none', }}
      />
    );
  };

  renderStudentTab = () => (
    <ProfileStudentTabScreen navigation={this.props.navigation} isSelected={this.state.selectedTabIndex === 0} />
  );

  renderParentTab = () => (
    <ProfileStudentTabScreen isSelected={this.state.selectedTabIndex === 1} />
  );

  renderEducationTab = () => (
    <ProfileStudentTabScreen isSelected={this.state.selectedTabIndex === 2} />
  );

  render() {
    const initialLayout = { width: Dimensions.get('window').width };

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_profile')}
          onMenuTap={() => this.back()}
          is_filter="1"
          onFilterTap={() => this.setState({showModal: true})}
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
                case 'parent':
                  return this.renderParentTab();
                case 'education':
                  return this.renderEducationTab();
              }
            }}
            onIndexChange={(index) => this.setState({ selectedTabIndex: index })}
            initialLayout={initialLayout}
            swipeEnabled={false}

          />
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
