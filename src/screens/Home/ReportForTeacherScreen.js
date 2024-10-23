import React from 'react';
import { Image, View, BackHandler, Dimensions } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Color from '../../constants/color';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import translang from '../../utils/language.utils';
import ReportForTeacherStudentTab from './ReportForTeacherStudentTab';
import ReportForTeacherExecutiveTab from './ReportForTeacherExecutiveTab';
import ReportForTeacherPersonalTab from './ReportForTeacherPersonalTab';

export default class ReportForTeacherScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      showModal: false,
      tabRoutes: [],
      selectedTabIndex: 0,
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  componentDidMount() {
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

    let routes = [
      {
        key: 'student_report',
        title: translang.t('REPORT_student_report')
      },
      {
        key: 'executive_report',
        title: translang.t('REPORT_executive_report')
      },
      {
        key: 'personal_report',
        title: translang.t('REPORT_personal_report')
      }
    ];

    this.setState({ selectedTabIndex: 0, tabRoutes: routes });
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
    this.props.navigation.goBack();
  };

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
  };

  renderTabBar = (props) => {
    return (
      <TabBar 
        {...props}
        style={{...styles.tabBar}}
        indicatorStyle={{ height: 50, backgroundColor: Color.n_default_brown, borderRadius: 20, }}
        inactiveColor={Color.n_default_orange}
        activeColor={Color.white}
        labelStyle={{fontWeight: 'bold', fontSize: 17, fontFamily: 'THSarabunNew', lineHeight: 17, textAlign: 'center' }}
      />
    );
  };

  renderStudentReportTab = () => (
    <ReportForTeacherStudentTab navigation={this.props.navigation} />
  );

  renderExecutiveReportTab = () => (
    <ReportForTeacherExecutiveTab navigation={this.props.navigation} />
  );

  renderPersonalReportTab = () => (
    <ReportForTeacherPersonalTab navigation={this.props.navigation} />
  );

  render() {
    const initialLayout = { width: Dimensions.get('window').width };

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_report')}
          onMenuTap={() => this.back()}
        />
        <View style={styles.container}>
          <TabView
            style={styles.tabView}
            navigationState={{index: this.state.selectedTabIndex, routes: this.state.tabRoutes}}
            renderTabBar={this.renderTabBar}
            renderScene={ ({ route }) => {
              switch (route.key) {
                case 'student_report':
                  return this.renderStudentReportTab();
                case 'executive_report':
                  return this.renderExecutiveReportTab();
                case 'personal_report':
                  return this.renderPersonalReportTab();
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
  menuContainer: {
    marginTop: 10,
    paddingHorizontal: 0,
  },
  menuEachStyle: {
    borderRadius: 5,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  tabBar: {
    width: '90%',
    height: 50,
    borderRadius: 20,    
    
    marginTop: 20,
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
