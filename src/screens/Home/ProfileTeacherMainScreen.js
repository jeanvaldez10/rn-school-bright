import React, { useState } from 'react';
import { View, BackHandler, Dimensions, } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView, TabBar } from 'react-native-tab-view';
import BackNavigationBar from '../../components/BackNavigationBar';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import moment from 'moment';

import ProfileTeacherBasicTabScreen from './ProfileTeacherBasicTabScreen';
import ProfileTeacherEducationTabScreen from './ProfileTeacherEducationTabScreen';

export default class ProfileTeacherMainScreen extends React.Component {

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
        key: 'basic',
        title: translang.t('BASIC_INFORMATION')
      },
      {
        key: 'educational',
        title: translang.t('EDUCATIONAL_INFORMATION')
      },
      {
        key: 'jobposition',
        title: translang.t('JOB_POSITION_INFORMATION')+translang.t('TEACHING_INFORMATION')
      },
      {
        key: 'occupation',
        title: translang.t('OCCUPATIONAL_LICENSE')
      },
    ];

    const today = moment();
    const start = moment(today).add(-1, 'M').startOf('month').format('YYYY-MM-DD');
    const end = moment(today).endOf('month').format('YYYY-MM-DD');
    this.setState({ userInfo: userInfo, startDate: start, endDate: end, selectedTabIndex: 0, tabRoutes: routes }, () => {
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

  renderTabBar = (props) => {
    return (
      <TabBar
        {...props}
        style={{ ...styles.tabBar }}
        indicatorStyle={{ height: 50, backgroundColor: Color.n_default_brown, borderRadius: 20, }}
        inactiveColor={Color.n_default_orange}
        activeColor={Color.white}
        labelStyle={{fontWeight: 'bold', fontSize: 10, fontFamily: 'THSarabunNew', textAlign: 'center', padding: 0, margin: 0, color: Color.n_default_orange}}
      />
    );
  };

  renderBasicTab = () => (
    <ProfileTeacherBasicTabScreen navigation={this.props.navigation} isSelected={this.state.selectedTabIndex === 0} />
  );
  renderEducationTab = () => (
    <ProfileTeacherEducationTabScreen isSelected={this.state.selectedTabIndex === 1} />
  );
  renderJobTab = () => (
    <ProfileTeacherBasicTabScreen isSelected={this.state.selectedTabIndex === 2} />
  );
  renderOccupationTab = () => (
    <ProfileTeacherBasicTabScreen isSelected={this.state.selectedTabIndex === 3} />
  );

  render() {
    const initialLayout = { width: Dimensions.get('window').width };

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_profile')}
          onMenuTap={() => this.back()}
        />

        <View style={styles.container}>
          <TabView
            style={styles.tabView}
            navigationState={{ index: this.state.selectedTabIndex, routes: this.state.tabRoutes }}
            renderTabBar={this.renderTabBar}
            renderScene={({ route }) => {
              switch (route.key) {
                case 'basic':
                  return this.renderBasicTab();
                case 'educational':
                  return this.renderEducationTab();
                case 'jobposition':
                  return this.renderJobTab();
                case 'occupation':
                  return this.renderOccupationTab();
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

