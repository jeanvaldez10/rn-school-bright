import React from 'react';
import { BackHandler, Dimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import { TabBar, TabView } from 'react-native-tab-view';
import BackNavigationBar from '../../../../components/BackNavigationBar';
import CalendarModal from '../../../../components/CalendarModal';
import ProgressHud from '../../../../components/ProgressHud';
import Color from '../../../../constants/color';

import moment from 'moment';
import ApiManager from '../../../../managers/ApiManager';
import Storage from '../../../../managers/StorageManager';
import translang from '../../../../utils/language.utils';
import MorningAlightingReportTab from './MorningAlightingReportTab';
import EveningAlightingReportTab from './EveningAlightingReportTab';

export default class TeacherAlightingReport extends React.Component {
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
    if (this.state.showCalendarModal) {
      this.setState({ showCalendarModal: false });
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
        key: 'morning',
        title: translang.t('BUS_MORNING_SESSION').toUpperCase(),
      },
      {
        key: 'evening',
        title: translang.t('BUS_EVENING_SESSION').toUpperCase(),
      },
    ];

    const today = moment().format('YYYY-MM-DD');
    this.setState(
      { userInfo: userInfo, selectedDate: today, selectedTabIndex: 0, tabRoutes: routes },
      () => {
        this.loadData();
      },
    );
  }

  componentWillUnmount = () => {
    if (this.backhandler) {
      this.backhandler.remove();
    }
    if (this.focusListener) {
      this.focusListener.remove();
    }
  };

  back = () => {
    this.props.navigation.navigate('ReportForTeacher');
  };

  loadData = () => {
    this.setState({ isLoading: true });

    const userInfo = this.state.userInfo;
    const date = this.state.selectedDate;

    ApiManager.getAttendanceSchoolReportGraph(userInfo.SchoolID, date)
      .then((list) => {
        let studentList = {};
        let personalList = {};

        if ((list.student ?? []).length > 0) {
          studentList = list.student[0];
        }
        if ((list.employees ?? []).length > 0) {
          personalList = list.employees[0];
        }

        this.setState({
          studentReportList: studentList,
          personalReportList: personalList,
          isLoading: false,
        });
      })
      .catch((error) => {
        console.log(error);
        this.setState({ isLoading: false });
      });
  };

  onDateSelected = (date) => {
    if (date === null) {
      this.setState({ showCalendarModal: false });
    } else {
      const _date = moment(date).format('YYYY-MM-DD');
      this.setState({ showCalendarModal: false, selectedDate: _date }, () => {
        this.loadData();
      });
    }
  };

  renderTabBar = (props) => {
    return (
      <TabBar
        {...props}
        style={{ ...styles.tabBar }}
        indicatorStyle={{ height: 50, backgroundColor: Color.n_default_brown, borderRadius: 20 }}
        inactiveColor={Color.n_default_orange}
        activeColor={Color.white}
        labelStyle={{
          fontWeight: 'bold',
          fontSize: 17,
          fontFamily: 'THSarabunNew',
          marginTop: 'auto',
          marginBottom: 'auto',
          textTransform: 'none',
        }}
      />
    );
  };

  renderMoringTab = () => (
    <MorningAlightingReportTab
      navigation={this.props.navigation}
      reportList={this.state.studentReportList}
      date={this.state.selectedDate}
      isSelected={this.state.selectedTabIndex === 0}
    />
  );

  renderEveningTab = () => (
    <EveningAlightingReportTab
      navigation={this.props.navigation}
      reportList={this.state.personalReportList}
      date={this.state.selectedDate}
      isSelected={this.state.selectedTabIndex === 1}
    />
  );

  render() {
    const initialLayout = { width: Dimensions.get('window').width };

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('BUS_ALIGHTING_REPORT')}
          onMenuTap={() => this.back()}
          is_calendar="1"
          onCalendarTap={() => this.setState({ showCalendarModal: true })}
        />

        <View style={styles.container}>
          <TabView
            style={styles.tabView}
            navigationState={{ index: this.state.selectedTabIndex, routes: this.state.tabRoutes }}
            renderTabBar={this.renderTabBar}
            renderScene={({ route }) => {
              switch (route.key) {
                case 'morning':
                  return this.renderMoringTab();
                case 'evening':
                  return this.renderEveningTab();
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
          onDateSelect={(result) => this.onDateSelected(result)}
        />
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
