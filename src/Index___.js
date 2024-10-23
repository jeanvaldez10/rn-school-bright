import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Modal,
  PermissionsAndroid,
  Image,
  ScrollView,
  LogBox,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import _ from 'lodash';
import I18n from 'react-native-i18n';
import { getUniqueId } from 'react-native-device-info';
import Sound from 'react-native-sound';
import SplashScreen from 'react-native-splash-screen';
import LoginScreen from './screens/Auth/LoginScreen';
import RegisterScreen from './screens/Auth/RegisterScreen';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createDrawerNavigator } from 'react-navigation-drawer';
import Storage from './managers/StorageManager';
import AsyncStorage from '@react-native-community/async-storage';
import ForgotPassScreen from './screens/Auth/ForgotPassScreen';

import ProfileScreen from './screens/Home/ProfileScreen';
import TimeTableScreen from './screens/Home/TimeTableScreen';
import UserInfoScreen from './screens/Home/UserInfoScreen';
import AcademicResultScreen from './screens/Home/AcademicResultScreen';
import HomeworkScreen from './screens/Home/HomeworkScreen';
import HomeworkHistory from './screens/Home/HomeworkHistory';
import HomeworkHistoryAttach from './screens/Home/HomeworkHistoryAttach';
import AcademicOutput from './screens/Home/AcademicOutput';
import AcademicHelp from './screens/Home/AcademicHelp';
import FulldayLeaveScreen from './screens/Home/FulldayLeaveScreen';
import LeaveInputScreen from './screens/Home/LeaveInputScreen';
import LeaveHistory from './screens/Home/LeaveHistory';
import HalfdayLeaveScreen from './screens/Home/HalfdayLeaveScreen';
import PickupScreen from './screens/Home/PickupScreen';
import SchoolCalendarScreen from './screens/Home/SchoolCalendarScreen';
import TopupScreen from './screens/Home/TopupScreen';
import TopupDetails from './screens/Home/TopupDetails';
import ShopInput from './screens/Home/ShopInput';
import ShopCart from './screens/Home/ShopCart';
import ShopPincode from './screens/Home/ShopPincode';
import ShopScreen from './screens/Home/ShopScreen';
import MessageScreen from './screens/Home/MessageScreen';
import MessageHistory from './screens/Home/MessageHistory';
import TuitionScreen from './screens/Home/TuitionScreen';
import TuitionOutput from './screens/Home/TuitionOutput';
import ReportScreen from './screens/Home/ReportScreen';
import ReportForTeacherScreen from './screens/Home/ReportForTeacherScreen';
import ReportAttendance from './screens/Home/ReportAttendance';
import ReportAttendanceCalendarScreen from './screens/Home/ReportAttendanceCalendarScreen';
import ReportAttendanceStatusListScreen from './screens/Home/ReportAttendanceStatusListScreen';
import ReportAttendanceStudentStatusHistoryScreen from './screens/Home/ReportAttendanceStudentStatusHistoryScreen';
import ReportLeave from './screens/Home/ReportLeave';
import ReportLeaveApproved from './screens/Home/ReportLeaveApproved';
import ReportLeaveWaiting from './screens/Home/ReportLeaveWaiting';
import ReportTopup from './screens/Home/ReportTopup';
import ReportExecutiveTopupScreen from './screens/Home/ReportExecutiveTopup';
import ReportOrderList from './screens/Home/ReportOrderList';
import ReportOrderDetailScreen from './screens/Home/ReportOrderDetail';
import ReportBehaviorScore from './screens/Home/ReportBehaviorScore';
import ReportBehaviorScoreCalendarScreen from './screens/Home/ReportBehaviorScoreCalendar';
import ReportBehaviorScoreDetailScreen from './screens/Home/ReportBehaviorScoreDetail';
import ReportHomeworkScreen from './screens/Home/ReportHomework';
import ReportHomeworkDetailScreen from './screens/Home/ReportHomeworkDetail';
import ReportBroadcastScreen from './screens/Home/ReportBroadcast';
import ReportBroadcastDetailScreen from './screens/Home/ReportBroadcastDetail';
import ReportUncheckNameScreen from './screens/Home/ReportUncheckName';
import ReportPersonalAttendanceScreen from './screens/Home/ReportPersonalAttendance';
import ReportExecutiveAttendanceScreen from './screens/Home/ReportExecutiveAttendance';
import ReportExecutiveClassListScreen from './screens/Home/ReportExecutiveClassList';
import ReportExecutiveDepartmentListScreen from './screens/Home/ReportExecutiveDepartmentList';
import ReportExecAttendanceClassDetailScreen from './screens/Home/ReportExecAttendanceClassDetail';
import ReportExecAttendanceDepartmentDetailScreen from './screens/Home/ReportExecAttendanceDepartmentDetail';
import ReportPurchaseScreen from './screens/Home/ReportPurchase';
import SettingScreen from './screens/Home/SettingScreen';
import SettingManageAccount from './screens/Home/SettingManageAccount';
import SettingAddAccount from './screens/Home/SettingAddAccount';
import SettingChangePincode from './screens/Home/SettingChangePincode';
import SettingAbout from './screens/Home/SettingAbout';
import CheckTemperature from './screens/Home/CheckTemperature';

import Drawer from './components/Drawer';
import GeneralStatusBarColor from './components/GeneralStatusBarColor';
import GradientSmallButton from './components/GradientSmallButton';
import Color from './constants/color';
import dimension from './constants/dimension';
import Validate from './screens/Auth/Validate';
import messaging from '@react-native-firebase/messaging';
import Images from './themes/Images';
import HTML from 'react-native-render-html';
import { httpUtils } from './utils/HttpUtils';
import { menuservice } from './services/MenuService';
import { speak } from './utils/tts';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AttendanceCheckInScreen from './screens/Home/AttendanceCheckInScreen';
import AttendanceEditCheckin from './screens/Home/AttendanceEditCheckinScreen';
import AttendanceCheckOutScreen from './screens/Home/AttendanceCheckOutScreen';
import AttendanceCheckInListScreen from './screens/Home/AttendanceCheckInListScreen';
import AttendanceCheckInSummaryScreen from './screens/Home/AttendanceCheckInSummaryScreen';
import ClassAttendTakeScreen from './screens/Home/ClassAttendTakeScreen';
import ClassAttendStudentListScreen from './screens/Home/ClassAttendStudentListScreen';
import ClassAttendSummaryScreen from './screens/Home/ClassAttendSummaryScreen';
import ClassAttendEditScreen from './screens/Home/ClassAttendEditScreen';
import AttendanceCheckQRCodeScreen from './screens/Home/AttendanceCheckQRCodeScreen';
import AttendanceCheckStudentIDScreen from './screens/Home/AttendanceCheckStudentIDScreen';

import BehaviorAddScreen from './screens/Home/BehaviorAddScreen';
import BehaviorAddOutput from './screens/Home/BehaivorAddOutput';
import BehaviorReduceScreen from './screens/Home/BehaviorReduceScreen';
import BehaviorUserListScreen from './screens/Home/BehaviorUserListScreen';
import BehaviorEditScreen from './screens/Home/BehaviorEditScreen';
import BehaviorSubmitScreen from './screens/Home/BehaviorSubmitScreen';
import BehaviorQRCodeScreen from './screens/Home/BehaviorQRCodeScreen';
import BehaviorStudentIDScreen from './screens/Home/BehaviorStudentIDScreen';
import SendIndividualScreen from './screens/Home/SendIndividualScreen';
import SendGroupScreen from './screens/Home/SendGroupScreen';
import SendIndividualUserListScreen from './screens/Home/SendIndividualUserListScreen';
import HomeworkFillInfoScreen from './screens/Home/HomeworkFillInfoScreen';
import HomeworkSummarizeScreen from './screens/Home/HomeworkSummarizeScreen';
import BroadcastScreen from './screens/Home/BroadcastScreen';
import BroadcastFillInfoScreen from './screens/Home/BroadcastFillInfoScreen';
import BroadcastSubmitScreen from './screens/Home/BroadcastSubmitScreen';
import BroadcastOutput from './screens/Home/BroadcastOutput';
import LeaveRequestScreen from './screens/Home/LeaveRequestScreen';
import LeaveRequestDetailScreen from './screens/Home/LeaveRequestDetailScreen';
import LeaveRequestWaiting from './screens/Home/LeaveRequestWaiting';
import LeaveRequestApproved from './screens/Home/LeaveRequestApproved';
import NotificationScreen from './screens/Home/NotificationScreen';
import AttendanceEditCheckinScreen from './screens/Home/AttendanceEditCheckinScreen';
import { AppContainer } from './routes/routes';

const screenWidth = Dimensions.get('window').width;
const drawerWidth = screenWidth * 0.9;

//console.disableYellowBox = true;
LogBox.ignoreAllLogs(true); //Ignore all log notifications

const MainAppRouteConfigs = {
  UserInfo: {
    screen: UserInfoScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  AttendanceCheckQRCode: {
    screen: AttendanceCheckQRCodeScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  AttendanceCheckStudentID: {
    screen: AttendanceCheckStudentIDScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  HomeworkHistory: {
    screen: HomeworkHistory,
    navigationOptions: {
      headerShown: false,
    },
  },
  HomeworkHistoryAttach: {
    screen: HomeworkHistoryAttach,
    navigationOptions: {
      headerShown: false,
    },
  },
  AcademicHelp: {
    screen: AcademicHelp,
    navigationOptions: {
      headerShown: false,
    },
  },
  AcademicOutput: {
    screen: AcademicOutput,
    navigationOptions: {
      headerShown: false,
    },
  },
  LeaveInput: {
    screen: LeaveInputScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  LeaveHistory: {
    screen: LeaveHistory,
    navigationOptions: {
      headerShown: false,
    },
  },
  TopupDetails: {
    screen: TopupDetails,
    navigationOptions: {
      headerShown: false,
    },
  },
  ShopInput: {
    screen: ShopInput,
    navigationOptions: {
      headerShown: false,
    },
  },
  ShopCart: {
    screen: ShopCart,
    navigationOptions: {
      headerShown: false,
    },
  },
  ShopPincode: {
    screen: ShopPincode,
    navigationOptions: {
      headerShown: false,
    },
  },
  MessageHistory: {
    screen: MessageHistory,
    navigationOptions: {
      headerShown: false,
    },
  },
  TuitionOutput: {
    screen: TuitionOutput,
    navigationOptions: {
      headerShown: false,
    },
  },
  ReportAttendance: {
    screen: ReportAttendance,
    navigationOptions: {
      headerShown: false,
    }
  },
  ReportAttendanceCalendar: {
    screen: ReportAttendanceCalendarScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  ReportAttendanceStatusList: {
    screen: ReportAttendanceStatusListScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  ReportAttendanceStudentStatusHistory: {
    screen: ReportAttendanceStudentStatusHistoryScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  ReportLeave: {
    screen: ReportLeave,
    navigationOptions: {
      headerShown: false,
    }
  },
  ReportLeaveApproved: {
    screen: ReportLeaveApproved,
    navigationOptions: {
      headerShown: false,
    }
  },
  ReportLeaveWaiting: {
    screen: ReportLeaveWaiting,
    navigationOptions: {
      headerShown: false,
    }
  },
  ReportTopup: {
    screen: ReportTopup,
    navigationOptions: {
      headerShown: false,
    }
  },
  ReportExecutiveTopup: {
    screen: ReportExecutiveTopupScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  ReportOrderList: {
    screen: ReportOrderList,
    navigationOptions: {
      headerShown: false,
    }
  },
  ReportBehavior: {
    screen: ReportBehaviorScore,
    navigationOptions: {
      headerShown: false,
    }
  },
  ReportBehaviorScoreCalendar: {
    screen: ReportBehaviorScoreCalendarScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  ReportBehaviorScoreDetail: {
    screen: ReportBehaviorScoreDetailScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  ReportHomework: {
    screen: ReportHomeworkScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  ReportHomeworkDetail: {
    screen: ReportHomeworkDetailScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  ReportBroadcast: {
    screen: ReportBroadcastScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  ReportBroadcastDetail: {
    screen: ReportBroadcastDetailScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  ReportUncheckName: {
    screen: ReportUncheckNameScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  ReportOrderDetail: {
    screen: ReportOrderDetailScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  ReportPersonalAttendance: {
    screen: ReportPersonalAttendanceScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  ReportExecutiveAttendance: {
    screen: ReportExecutiveAttendanceScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  ReportExecutiveClassList: {
    screen: ReportExecutiveClassListScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  ReportExecutiveDepartmentList: {
    screen: ReportExecutiveDepartmentListScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  ReportExecAttendanceClassDetail: {
    screen: ReportExecAttendanceClassDetailScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  ReportExecAttendanceDepartmentDetail: {
    screen: ReportExecAttendanceDepartmentDetailScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  ReportPurchase: {
    screen: ReportPurchaseScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  SettingManageAccount: {
    screen: SettingManageAccount,
    navigationOptions: {
      headerShown: false,
    }
  },
  SettingAddAccount: {
    screen: SettingAddAccount,
    navigationOptions: {
      headerShown: false,
    }
  },
  SettingChangePincode: {
    screen: SettingChangePincode,
    navigationOptions: {
      headerShown: false,
    }
  },
  SettingAbout: {
    screen: SettingAbout,
    navigationOptions: {
      headerShown: false,
    }
  },
  CheckTemperature: {
    screen: CheckTemperature,
    navigationOptions: {
      headerShown: false,
    }
  },
  BehaviorAddOutput: {
    screen: BehaviorAddOutput,
    navigationOptions: {
      headerShown: false,
    }
  },
  BehaviorUserList: {
    screen: BehaviorUserListScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  BehaviorEdit: {
    screen: BehaviorEditScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  BehaviorSubmit: {
    screen: BehaviorSubmitScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  BehaviorQRCode: {
    screen: BehaviorQRCodeScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  BehaviorStudentID: {
    screen: BehaviorStudentIDScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  SendIndividualUserList: {
    screen: SendIndividualUserListScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  HomeworkFillInfo: {
    screen: HomeworkFillInfoScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  HomeworkSummarize: {
    screen: HomeworkSummarizeScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  BroadcastFillInfo: {
    screen: BroadcastFillInfoScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  BroadcastSubmit: {
    screen: BroadcastSubmitScreen,
    navigationOptions: {
      headerShown: false
    },
  },
  BroadcastOutput: {
    screen: BroadcastOutput,
    navigationOptions: {
      headerShown: false,
    }
  },
  LeaveRequestWaiting: {
    screen: LeaveRequestWaiting,
    navigationOptions: {
      headerShown: false,
    }
  },
  LeaveRequestApproved: {
    screen: LeaveRequestApproved,
    navigationOptions: {
      headerShown: false,
    }
  },
  LeaveRequestDetail: {
    screen: LeaveRequestDetailScreen,
    navigationOptions: {
      headerShown: false,
    }
  }
};

const MainAppNavigatorConfigs = {
  initialRouteName: 'UserInfo',
};

const MainAppNavigator = createStackNavigator(
  MainAppRouteConfigs,
  MainAppNavigatorConfigs,
);
const MainAppContainer = createAppContainer(MainAppNavigator);

const AuthRouteConfigs = {
  Login: {
    screen: LoginScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  Register: {
    screen: RegisterScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  Forgotpass: {
    screen: ForgotPassScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  Validate: {
    screen: Validate,
    navigationOptions: {
      headerShown: false,
    },
  },
  MainScreen: {
    screen: MainAppContainer,
    navigationOptions: {
      headerShown: false,
    },
  },
};

const AuthStackNavigatorConfig = {
  initialRouteName: 'Login',
};

const AuthNavigator = createStackNavigator(
  AuthRouteConfigs,
  AuthStackNavigatorConfig,
);
const AuthContainer = createAppContainer(AuthNavigator);
const DrawerRouteConfigs = {
  UserInfo: {
    screen: UserInfoScreen,
  },
  Profile: {
    screen: ProfileScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  Timetable: {
    screen: TimeTableScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  Homework: {
    screen: HomeworkScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  Academic: {
    screen: AcademicResultScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  FulldayLeave: {
    screen: FulldayLeaveScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  HalfdayLeave: {
    screen: HalfdayLeaveScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  Pickup: {
    screen: PickupScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  SchoolCalendar: {
    screen: SchoolCalendarScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  Topup: {
    screen: TopupScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  Shop: {
    screen: ShopScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  Message: {
    screen: MessageScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  Tuition: {
    screen: TuitionScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  Report: {
    screen: ReportScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  Setting: {
    screen: SettingScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  Notification: {
    screen: NotificationScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  AttendanceCheckIn: {
    screen: AttendanceCheckInScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  AttendanceEditCheckin: {
    screen: AttendanceEditCheckinScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  AttendanceCheckOut: {
    screen: AttendanceCheckOutScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  AttendanceCheckInList: {
    screen: AttendanceCheckInListScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  AttendanceCheckInSummary: {
    screen: AttendanceCheckInSummaryScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  ClassAttendTake: {
    screen: ClassAttendTakeScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  ClassAttendEdit: {
    screen: ClassAttendEditScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  ClassAttendStudentList: {
    screen: ClassAttendStudentListScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  ClassAttendSummary: {
    screen: ClassAttendSummaryScreen,
    navigationOptions: {
      headerShown: false,
    }
  },
  BehaviorAdd: {
    screen: BehaviorAddScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  BehaviorReduce: {
    screen: BehaviorReduceScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  SendIndividual: {
    screen: SendIndividualScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  SendGroup: {
    screen: SendGroupScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  Broadcast: {
    screen: BroadcastScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  ReportForTeacher: {
    screen: ReportForTeacherScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  LeaveRequest: {
    screen: LeaveRequestScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
};

const DrawerNavigatorConfigs = {
  drawerWidth: drawerWidth,
  contentComponent: Drawer,
};

const DrawerNavigator = createDrawerNavigator(
  DrawerRouteConfigs,
  DrawerNavigatorConfigs,
);
const DrawerContainer = createAppContainer(DrawerNavigator);
class AuthLoadingScreen extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
    this._bootstrapAsync();
  }

  _bootstrapAsync = async () => {
    const user = await Storage.getUser();
    this.props.navigation.navigate(!_.isEmpty(user) ? 'App' : 'Auth');
  };

  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }
}

const AppSwitchRouteConfigs = {
  AuthLoading: AuthLoadingScreen,
  Auth: AuthContainer,
  App: MainAppContainer,
  Drawer: DrawerContainer,
};

const AppSwitchNavigatorConfigs = {
  initialRouteName: 'AuthLoading',
};

const AppSwitchNavigator = createSwitchNavigator(
  AppSwitchRouteConfigs,
  AppSwitchNavigatorConfigs,
);
const AppSwitchContainer = createAppContainer(AppSwitchNavigator);

const soundAlarm = new Sound(require('./assets/sounds/alarm.mp3'), (err) => {
  if (err) {
    console.log(err);
  }
  soundAlarm.setNumberOfLoops(-1);
});

export default class Index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  async componentDidMount() {
    SplashScreen.hide()

    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      ]);
      console.log(granted);
    } catch (err) {
      console.warn(err);
    }

    global.deviceLocale = I18n.currentLocale();

    const firebaseMessaging = messaging();
    const authStatus = await firebaseMessaging.requestPermission();
    if (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    ) {
      firebaseMessaging.onMessage((msg) => {
        this.notificationId = msg.data.id;
        if (msg.data.type === 'noisy') {
          soundAlarm.play();
        }
        this.displayNotification(msg);
      });

      // firebaseMessaging.onNotificationOpenedApp(async (msg) => {
      //   if (msg.data && msg.data.id) {
      //     this.displayNotification(msg);
      //   }
      // });

      const msg = await firebaseMessaging.getInitialNotification();
      if (
        msg &&
        msg.data &&
        msg.data.id &&
        msg.data.id !== (await AsyncStorage.getItem('INITIAL_NOTIFICATION_ID'))
      ) {
        this.displayNotification(msg);
        await AsyncStorage.setItem('INITIAL_NOTIFICATION_ID', msg.data.id);
      }
    }
  }

  displayNotification = (msg) => {
    this.setState(
      {
        notification: msg.data.message,
      },
      () => {
        this.readNotification(msg.data.id);
        setTimeout(() => this.setState({ notification: null }), 5000);
      },
    );
  };

  readNotification = async (id) => {
    const params = await httpUtils.getHTTPParams();
    params.notif_id = id;
    menuservice.readNotification(params);
  };

  confirmNotification = async () => {
    soundAlarm.pause();
    this.setState({
      notification: null,
    });
    this.readNotification(this.notificationId);
    this.notificationId = null;
  };

  render() {
    global.deviceLocale = I18n.currentLocale();
    global.deviceSerial = getUniqueId();
    
    return (
      <SafeAreaProvider style={styles.container}>
        {/* <GeneralStatusBarColor
          backgroundColor={Color.primaryDarkColor}
          barStyle="light-content"
        /> */}
        <AppContainer ref={(ref) => (this._navigator = ref)} />
        {/* <AppSwitchContainer ref={(ref) => (this._navigator = ref)} /> */}
        {this.state.notification && (
          <Modal animationType="slide" transparent={true} key="modal">
            <View style={styles.centeredView}>
              <View style={styles.dialogStyle}>
                <View style={{ width: '100%', marginLeft: dimension.px20 }}>
                  <Image
                    source={Images.gallery_icon}
                    style={styles.modalLogo}
                  />
                </View>
                <ScrollView style={{ height: 100, padding: 40 }}>
                  <HTML
                    baseFontStyle={{ fontSize: 18 }}
                    html={`<div>${this.state.notification}</div>`}
                  />
                </ScrollView>
                <GradientSmallButton
                  label="OK"
                  opacity={1}
                  _onPress={this.confirmNotification}
                />
              </View>
            </View>
          </Modal>
        )}
      </SafeAreaProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.backgroundColor,
  },
  draweritemText: {
    marginLeft: 20,
    fontSize: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.backgroundColor,
  },
  dialogStyle: {
    width: 450,
    height: dimension.px140,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalLogo: {
    width: 72,
    height: 30,
  },
});
