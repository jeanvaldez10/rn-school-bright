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
import ReportBroadcastDetailTab from './ReportBroadcastDetailTab';
import ReportBroadcastDetailRecipientTab from './ReportBroadcastDetailRecipientTab';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import translang, { getCurrentLocale } from '../../utils/language.utils';

export default class ReportBroadcastDetailScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      selectedTabIndex: 0,
      tabRoutes: [],
      broadcast: {},
      recipients: [],
      userInfo: {},
    };

  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    console.log("ReportBroadCastDetail");
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

    const routes = [
      {
        key: 'detail',
        title: translang.t('DETAIL').toUpperCase()
      },
      {
        key: 'recipient',
        title: translang.t('RECIPIENT').toUpperCase()
      },
    ];

    const userInfo = await Storage.getUserInfo();
    const broadcast = this.props.navigation.getParam('broadcast');

    this.setState({ selectedTabIndex: 0, tabRoutes: routes, broadcast: broadcast, userInfo: userInfo }, () => {

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
    this.props.navigation.navigate('ReportBroadcast');
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

  renderDetailTab = () => (
    <ReportBroadcastDetailTab navigation={this.props.navigation} broadcast={this.state.broadcast} isSelected={this.state.selectedTabIndex === 0} />
  );

  renderListTab = () => (
    <ReportBroadcastDetailRecipientTab isSelected={this.state.selectedTabIndex === 1} broadcast={this.state.broadcast} />
  );

  render() {
    const initialLayout = { width: Dimensions.get('window').width };

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('BROADCAST_REPORT')}
          onMenuTap={() => this.back()}
        />

        <View style={styles.container}>
          <TabView
            style={styles.tabView}
            navigationState={{ index: this.state.selectedTabIndex, routes: this.state.tabRoutes }}
            renderTabBar={this.renderTabBar}
            renderScene={({ route }) => {
              switch (route.key) {
                case 'detail':
                  return this.renderDetailTab();
                case 'recipient':
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
