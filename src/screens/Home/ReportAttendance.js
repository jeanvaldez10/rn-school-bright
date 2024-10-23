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
import ReportAttendanceCheckInTab from './ReportAttendanceCheckInTab';
import ReportAttendanceSubjectTab from './ReportAttendanceSubjectTab';

import translang, { getCurrentLocale } from '../../utils/language.utils';

export default class ReportAttendance extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      selectedTabIndex: 0,
      tabRoutes: [],
    };

  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  componentDidMount() {
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

    const routes = [
      {
        key: 'check_in',
        title: translang.t('CHECK_IN')
      },
      {
        key: 'subject',
        title: translang.t('SUBJECT')
      },
    ];
    this.setState({ selectedTabIndex: 0, tabRoutes: routes })
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

  renderCalendarTab = () => (
    <ReportAttendanceCheckInTab navigation={this.props.navigation} isSelected={this.state.selectedTabIndex === 0} />
  );

  renderListTab = () => (
    <ReportAttendanceSubjectTab navigation={this.props.navigation} isSelected={this.state.selectedTabIndex === 1} />
  );

  render() {
    const initialLayout = { width: Dimensions.get('window').width };

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('CHECK_IN_REPORT')}
          onMenuTap={() => this.back()}
        />

        <View style={styles.container}>
          <TabView
            style={styles.tabView}
            navigationState={{ index: this.state.selectedTabIndex, routes: this.state.tabRoutes }}
            renderTabBar={this.renderTabBar}
            renderScene={({ route }) => {
              switch (route.key) {
                case 'check_in':
                  return this.renderCalendarTab();
                case 'subject':
                  return this.renderListTab();
              }
            }}
            onIndexChange={(index) => this.setState({ selectedTabIndex: index })}
            initialLayout={initialLayout}
            swipeEnabled={false}
          />
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
