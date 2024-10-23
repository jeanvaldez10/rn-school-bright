import React, { useState } from 'react';
import { Image, View, BackHandler, TouchableOpacity, Dimensions, } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { DrawerActions } from 'react-navigation-drawer';
import AttendanceCheckoutQRCodeTab from './AttendanceCheckoutQRCodeTab';
import AttendanceCheckoutStudentIDTab from './AttendanceCheckoutStudentIDTab';
import ProgressHud from '../../components/ProgressHud';
import BackNavigationBar from '../../components/BackNavigationBar';

import translang, { getCurrentLocale } from '../../utils/language.utils';

export default class AttendanceCheckOutScreen extends React.Component {
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
        key: 'qrcode',
        title: translang.t('QR_CODE')
      },
      {
        key: 'studentid',
        title: translang.t('STUDENT_ID')
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
    // this.props.navigation.goBack();
    this.props.navigation.navigate('App');
  };

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
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

  renderQRCodeTab = () => (
    <AttendanceCheckoutQRCodeTab navigation={this.props.navigation} isSelected={this.state.selectedTabIndex === 0}/>
  );

  renderStudentIDTab = () => (
    <AttendanceCheckoutStudentIDTab navigation={this.props.navigation} isSelected={this.state.selectedTabIndex === 1}/>
  );

  render() {
    const initialLayout = { width: Dimensions.get('window').width };

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_checkout')}
          onMenuTap={() => this.back()}
        />

        <View style={styles.container}>
          <TabView
            style={styles.tabView}
            navigationState={{ index: this.state.selectedTabIndex, routes: this.state.tabRoutes }}
            renderTabBar={this.renderTabBar}
            renderScene={({ route }) => {
              switch (route.key) {
                case 'qrcode':
                  return this.renderQRCodeTab();
                case 'studentid':
                  return this.renderStudentIDTab();
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
    backgroundColor: Color.n_background_white,
  },
  tabBar: {
    width: '90%',
    height: 50,
    borderRadius: 20,    
    
    marginVertical: 10,
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
