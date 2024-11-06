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
  Text,
  Linking,
  Alert,
} from 'react-native';
import { Platform, AppState } from 'react-native';
import _ from 'lodash';
import I18n from 'react-native-i18n';
import {
  getUniqueId,
  getBrand,
  getDeviceId,
  getModel,
  getApiLevel,
  getAndroidId,
} from 'react-native-device-info';
import Sound from 'react-native-sound';
import SplashScreen from 'react-native-splash-screen';
import LoginScreen from './screens/Auth/LoginScreen';
import RegisterScreen from './screens/Auth/RegisterScreen';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createDrawerNavigator } from 'react-navigation-drawer';
import Storage from './managers/StorageManager';
import translang, { setLocale } from './utils/language.utils';
import ApiManager from '../src/managers/ApiManager';
import analytics, { firebase } from '@react-native-firebase/analytics';
import VersionCheck from 'react-native-version-check';
import { getOneUserInfo, removeUser, updatePassword } from './utils/DBManager';
import { getCurrentLocale } from './utils/language.utils';
import TokenErrorModal from './components/TokenErrorModal';
import ReLoginModal from './components/ReLoginModal';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

import ForgotPassScreen from './screens/Auth/ForgotPassScreen';
import ForgotPassLinkScreen from './screens/Auth/ForgotPassLinkScreen';

import TimeTableScreen from './screens/Home/TimeTableScreen';
import UserInfoScreen1 from './screens/Home/UserInfoScreen1';
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
import ReportAttendanceCalendarScreen from './screens/Home/ReportAttendanceCalendarScreen';
import ReportAttendanceStatusListScreen from './screens/Home/ReportAttendanceStatusListScreen';
import ReportAttendanceStudentStatusHistoryScreen from './screens/Home/ReportAttendanceStudentStatusHistoryScreen';
import ReportLeaveApproved from './screens/Home/ReportLeaveApproved';
import ReportLeaveWaiting from './screens/Home/ReportLeaveWaiting';
import ReportTopup from './screens/Home/ReportTopup';
import ReportOrderList from './screens/Home/ReportOrderList';
import ReportOrderDetailScreen from './screens/Home/ReportOrderDetail';
import ReportBehaviorScoreMain from './screens/Home/ReportBehaviorScoreMain';
import ReportBehaviorScoreDetailScreen from './screens/Home/ReportBehaviorScoreDetail';
import ReportHomeworkScreen from './screens/Home/ReportHomework';
import ReportHomeworkDetailScreen from './screens/Home/ReportHomeworkDetail';
import ReportBroadcastScreen from './screens/Home/ReportBroadcast';
import ReportUncheckNameScreen from './screens/Home/ReportUncheckName';
import ReportExecutiveClassListScreen from './screens/Home/ReportExecutiveClassList';
import ReportExecutiveDepartmentListScreen from './screens/Home/ReportExecutiveDepartmentList';
import ReportExecAttendanceClassDetailScreen from './screens/Home/ReportExecAttendanceClassDetail';
import ReportExecAttendanceDepartmentDetailScreen from './screens/Home/ReportExecAttendanceDepartmentDetail';
import SettingScreen from './screens/Home/SettingScreen';
import SecuritySettingScreen from './screens/Home/SecuritySettingScreen';
import SettingManageAccount from './screens/Home/SettingManageAccount';
import SettingAddAccount from './screens/Home/SettingAddAccount';
import SettingChangePincode from './screens/Home/SettingChangePincode';
import SettingAbout from './screens/Home/SettingAbout';
import SettingManageLanguage from './screens/Home/SettingManageLanguage';
import CheckTemperature from './screens/Home/CheckTemperature';
import SystemErrorScreen from './screens/Home/SystemErrorScreen';

import Drawer from './components/Drawer';

import GradientSmallButton from './components/GradientSmallButton';
import Color from './constants/color';
import Validate from './screens/Auth/Validate';
import messaging from '@react-native-firebase/messaging';
import Images from './themes/Images';
import RenderHtml from 'react-native-render-html';
import { httpUtils } from './utils/HttpUtils';
import { menuservice } from './services/MenuService';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AttendanceCheckInScreen from './screens/Home/AttendanceCheckInScreen';

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
import BroadcastIndiviDualScreen from './screens/Home/BroadcastIndiviDualScreen';
import BroadcastSubmitScreen from './screens/Home/BroadcastSubmitScreen';
import BroadcastOutput from './screens/Home/BroadcastOutput';
import LeaveRequestScreen from './screens/Home/LeaveRequestScreen';
import LeaveRequestDetailScreen from './screens/Home/LeaveRequestDetailScreen';
import LeaveRequestWaiting from './screens/Home/LeaveRequestWaiting';
import LeaveRequestApproved from './screens/Home/LeaveRequestApproved';
import NotificationScreen from './screens/Home/NotificationScreen';
import AttendanceEditCheckinScreen from './screens/Home/AttendanceEditCheckinScreen';
import SettingChangePincodeEdit from './screens/Home/SettingChangePincodeEdit';
import SettingChangePincodeConfirm from './screens/Home/SettingChangePincodeConfirm';
import FirstRunScreenOne from './screens/Home/FirstRunScreenOne';
import FirstRunScreenThree from './screens/Home/FirstRunScreenThree';
import FirstRunScreenTwo from './screens/Home/FirstRunScreenTwo';
import LinearGradient from 'react-native-linear-gradient';
import SettingNotification from './screens/Home/SettingNotification';
import ShopPaymentDone from './screens/Home/ShopPaymentDone';
import SignUpMainScreen from './screens/Auth/SignUpMainScreen';
import SignUpStepOneScreen from './screens/Auth/SignUpStepOneScreen';
import OnlineTeacherScreen from './screens/Home/OnlineTeacherScreen';
import OnlineTeacherSubjectListScreen from './screens/Home/OnlineTeacherSubjectListScreen';
import OnlineTeacherLessonListScreen from './screens/Home/OnlineTeacherLessonListScreen';
import OnlineTeacherTopicListScreen from './screens/Home/OnlineTeacherTopicListScreen';
import OnlineTeacherAddLessonScreen from './screens/Home/OnlineTeacherAddLessonScreen';
import OnlineTeacherAddHomeworkScreen from './screens/Home/OnlineTeacherAddHomeworkScreen';
import OnlineTopicMainScreen from './screens/Home/OnlineTopicMainScreen';
import OnlineTeacherScoreSubmitScreen from './screens/Home/OnlineTeacherScoreSubmitScreen';
import OnlineTeacherHomeworkSubmitScreen from './screens/Home/OnlineTeacherHomeworkSubmitScreen';
import ReportTeacherStudentLeaveScreen from './screens/Home/ReportTeacherStudentLeaveScreen';
import ReportTeacherStudentLeaveStudentListScreen from './screens/Home/ReportTeacherStudentLeaveStudentListScreen';
import ReportBehaviorScoreStudentListScreen from './screens/Home/ReportBehaviorScoreStudentListScreen';
import ReportBehaviorScoreDetailsScreen from './screens/Home/ReportBehaviorScoreDetailsScreen';
import ReportExecutiveTopupScreen from './screens/Home/ReportExecutiveTopupScreen';
import ReportPurchaseScreen from './screens/Home/ReportPurchase';
import ReportExecutivePurchaseDetailListScreen from './screens/Home/ReportExecutivePurchaseDetailListScreen';
import ReportTeacherExcutableTuitionScreen from './screens/Home/ReportTeacherExcutableTuitionScreen';
import ReportTeacherExcutableTuitionDetailScreen from './screens/Home/ReportTeacherExcutableTuitionDetailScreen';
import ReportTeacherPersonalLeaveScreen from './screens/Home/ReportTeacherPersonalLeaveScreen';
import ReportTeacherPersonalOnlineScreen from './screens/Home/ReportTeacherPersonalOnlineScreen';
import ProfileTeacherMainNoTabScreen from './screens/Home/ProfileTeacherMainNoTabScreen';
import ProfileStudentMainNoTabScreen from './screens/Home/ProfileStudentMainNoTabScreen';
import EditingHistory from './screens/Home/EditingHistory';
import AttendanceCheckOutNoTabScreen from './screens/Home/AttendanceCheckOutNoTabScreen';
import ClassAttendTakeAddSummaryScreen from './screens/Home/ClassAttendTakeAddSummaryScreen';
import ReportForTeacherNoTabScreen from './screens/Home/ReportForTeacherNoTabScreen';
import ReportAttendanceNoTabScreen from './screens/Home/ReportAttendanceNoTabScreen';
import ReportStudentLeaveScreen from './screens/Home/ReportStudentLeaveScreen';
import ReportTeacherStudentLeaveListScreen from './screens/Home/ReportTeacherStudentLeaveListScreen';
import ReportExecutiveAttendanceNoTabScreen from './screens/Home/ReportExecutiveAttendanceNoTabScreen';
import ReportBroadcastDetailNoTabScreen from './screens/Home/ReportBroadcastDetailNoTabScreen';
import ReportPersonalAttendanceNoTabScreen from './screens/Home/ReportPersonalAttendanceNoTabScreen';
import OnlineStudentSubjectListScreen from './screens/Home/OnlineStudentSubjectListScreen';
import OnlineStudentLessonListScreen from './screens/Home/OnlineStudentLessonListScreen';
import OnlineStudentTopicListScreen from './screens/Home/OnlineStudentTopicListScreen';
import OnlineStudentHomeworkDetailScreen from './screens/Home/OnlineStudentHomeworkDetailScreen';
import OnlineStudentAddHomeworkScreen from './screens/Home/OnlineStudentAddHomeworkScreen';
import OnlineStudentHomeworkSubmitScreen from './screens/Home/OnlineStudentHomeworkSubmitScreen';
import PrivacyPolicyScreen from './screens/Auth/PrivacyPolicyScreen';
import MessagePurchaseHistoryScreen from './screens/Home/MessagePurchaseHistoryScreen';
import FeedbackScreen from './screens/Home/FeedbackScreen';
import TuitionPaymentScreen from './screens/Home/TuitionPaymentScreen';
import ReportExcuteBroadcastScreen from './screens/Home/ReportExcuteBroadcastScreen';
import OnlineStudentScreen from './screens/Home/OnlineStudentScreen';
import OnlineTeacherLessonDetailScreen from './screens/Home/OnlineTeacherLessonDetailScreen';
import ReportStudentBehaviorScoreListScreen from './screens/Home/ReportStudentBehaviorScoreListScreen';
import UpdatePassScreen from './screens/Home/UpdatePassScreen';
import ShopSetPincodeScreen from './screens/Home/ShopSetPincodeScreen';
import ShopSetPincodeConfirmScreen from './screens/Home/ShopSetPincodeConfirmScreen';
import MessageHistoryForNotificationScreen from './screens/Home/MessageHistoryForNotificationScreen';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import Constant from './constants/constants';
import VisitHomeScreen from './screens/Home/VisitHomeScreen';
import VisitHomeDetailScreen from './screens/Home/VisitHomeDetailScreen';
import OnlineTeacherEditLessonScreen from './screens/Home/OnlineTeacherEditLessonScreen';
import OnlineTeacherEditHomeworkScreen from './screens/Home/OnlineTeacherEditHomeworkScreen';
import crashlytics from '@react-native-firebase/crashlytics';
import PrivacyPolicyNoActionScreen from './screens/Home/PrivacyPolicyNoActionScreen';
import SettingUpdatePassScreen from './screens/Home/SettingUpdatePassScreen';
import EmailSettingScreen from './screens/Home/EmailSettingScreen';
import PhoneSettingScreen from './screens/Home/PhoneSettingScreen';
import LineConnectScreen from './screens/Home/LineConnectScreen';
import LineDisConnectScreen from './screens/Home/LineDisConnectScreen';
import LineAgreeScreen from './screens/Home/LineAgreeScreen';
import LineConnectSuccessScreen from './screens/Home/LineConnectSuccessScreen';
import VerifyStartScreen from './screens/Home/VerifyStartScreen';

import NetInfo from '@react-native-community/netinfo';
import { BASE_URL } from './constants/ApiUrls';

import AlertWithImageOfflineModal from './components/AlertWithImageOfflineModal';
import RNExitApp from 'react-native-exit-app';
import ReportAttendanceSubjectCalendarScreen from './screens/Home/ReportAttendanceSubjectCalendarScreen';
import ReportAttendanceSubjectStatusListScreen from './screens/Home/ReportAttendanceSubjectStatusListScreen';
import ReportAttendanceStudentSubjectStatusHistoryScreen from './screens/Home/ReportAttendanceStudentSubjectStatusHistoryScreen';
import BroadcastSelectClassScreen from './screens/Home/BroadcastSelectClassScreen';
import BroadcastGroupSelectClassScreen from './screens/Home/BroadcastGroupSelectClassScreen';
import VisitHomeDetailStudentScreen from './screens/Home/VisitHomeDetailStudentScreen';
import OnlineStudentHomeworkDetailForNotificationScreen from './screens/Home/OnlineStudentHomeworkDetailForNotificationScreen';
import VerifyEmailInputScreen from './screens/Home/VerifyEmailInputScreen';
import VerifyEmailCodeScreen from './screens/Home/VerifyEmailCodeScreen';
import VerifyEmailSuccessScreen from './screens/Home/VerifyEmailSuccessScreen';
import VerifyPhoneInputScreen from './screens/Home/VerifyPhoneInputScreen';
import VerifyPhoneCodeScreen from './screens/Home/VerifyPhoneCodeScreen';
import VerifyPhoneSuccessScreen from './screens/Home/VerifyPhoneSuccessScreen';
import VerifyLineConnectScreen from './screens/Home/VerifyLineConnectScreen';
import VerifyLineSuccessScreen from './screens/Home/VerifyLineSuccessScreen';
import VerifyWarningScreen from './screens/Home/VerifyWarningScreen';
import NavigationService from './NavigationService';
import YourDevicesScreen from './screens/Home/YourDevicesScreen';
import VerifyIdentifyIDScreen from './screens/Auth/VerifyIdentifyIDScreen';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setDEV, setTabIndex, setShowTokenError, setGoVerifyLineSuccess } from './redux/actions';
import VerifyDeviceScreen from './screens/Home/VerifyDeviceScreen';
import VerifyDeviceSuccessScreen from './screens/Home/VerifyDeviceSuccessScreen';
import VerifyIdentifyID1Screen from './screens/Auth/VerifyIdentifyID1Screen';
import VerifyIdentifyID2Screen from './screens/Auth/VerifyIdentifyID2Screen';
import VerifyIdentifyID3Screen from './screens/Auth/VerifyIdentifyID3Screen';
import CheckVerification from './components/CheckVerification';
import VerifyIdentifyIDSuccessScreen from './screens/Auth/VerifyIdentifyIDSuccessScreen';
import AuthLoadingScreen from './AuthLoadingScreen';
import BusListScreen from './screens/SchoolBus/Teacher/BusListScreen';
import BusDetailScreen from './screens/SchoolBus/Teacher/BusDetailScreen';
import IncidentReport from './screens/SchoolBus/Teacher/IncidentReport';
import GroupIncidentReport from './screens/SchoolBus/Teacher/GroupIncidentReport';
import IncidentReportingReport from './screens/SchoolBus/Teacher/IncidentReportingReport';
import TeacherBusAlightingReport from './screens/SchoolBus/Teacher/TeacherBusAlightingReport';
import TeacherStudentAlightingReport from './screens/SchoolBus/Teacher/alighting-report/TeacherStudentAlightingReport';

const screenWidth = Dimensions.get('window').width;
const drawerWidth = 0;

//console.disableYellowBox = true;
LogBox.ignoreAllLogs(true); //Ignore all log notifications

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
  SignUpMain: {
    screen: SignUpMainScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  SignUpStepOne: {
    screen: SignUpStepOneScreen,
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
  ForgotpassLink: {
    screen: ForgotPassLinkScreen,
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
  PrivacyPolicy: {
    screen: PrivacyPolicyScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
};
const AuthStackNavigatorConfig = {
  initialRouteName: 'Login',
};
const AuthNavigator = createStackNavigator(AuthRouteConfigs, AuthStackNavigatorConfig);
const AuthContainer = createAppContainer(AuthNavigator);

const MainAppRouteConfigs = {
  UserInfo: {
    screen: UserInfoScreen1,
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
  SchoolCalendar: {
    screen: SchoolCalendarScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  SettingLanguage: {
    screen: SettingManageLanguage,
    navigationOptions: {
      headerShown: false,
    },
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
  ReportLeaveApproved: {
    screen: ReportLeaveApproved,
    navigationOptions: {
      headerShown: false,
    },
  },
  ReportLeaveWaiting: {
    screen: ReportLeaveWaiting,
    navigationOptions: {
      headerShown: false,
    },
  },
  CheckTemperature: {
    screen: CheckTemperature,
    navigationOptions: {
      headerShown: false,
    },
  },
  SystemError: {
    screen: SystemErrorScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  BehaviorAddOutput: {
    screen: BehaviorAddOutput,
    navigationOptions: {
      headerShown: false,
    },
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
    },
  },
  HomeworkSummarize: {
    screen: HomeworkSummarizeScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  BroadcastOutput: {
    screen: BroadcastOutput,
    navigationOptions: {
      headerShown: false,
    },
  },
  LeaveRequestWaiting: {
    screen: LeaveRequestWaiting,
    navigationOptions: {
      headerShown: false,
    },
  },
  LeaveRequestApproved: {
    screen: LeaveRequestApproved,
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
  UpdatePassword: {
    screen: UpdatePassScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  BusListScreen: {
    screen: BusListScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  BusDetailScreen: {
    screen: BusDetailScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  IncidentReport: {
    screen: IncidentReport,
    navigationOptions: {
      headerShown: false,
    },
  },
  GroupIncidentReport: {
    screen: GroupIncidentReport,
    navigationOptions: {
      headerShown: false,
    },
  },
  IncidentReportingReport: {
    screen: IncidentReportingReport,
    navigationOptions: {
      headerShown: false,
    },
  },
  TeacherBusAlightingReport: {
    screen: TeacherBusAlightingReport,
    navigationOptions: {
      headerShown: false,
    },
  },
  TeacherStudentAlightingReport: {
    screen: TeacherStudentAlightingReport,
    navigationOptions: {
      headerShown: false,
    },
  },
};
const MainAppNavigatorConfigs = {
  initialRouteName: 'UserInfo',
};
const MainAppNavigator = createStackNavigator(MainAppRouteConfigs, MainAppNavigatorConfigs);
const MainAppContainer = createAppContainer(MainAppNavigator);

const DrawerRouteConfigs = {
  UserInfo: {
    screen: UserInfoScreen1,
    navigationOptions: {
      headerShown: false,
    },
  },
  ProfileStudent: {
    screen: ProfileStudentMainNoTabScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  EditingHistory: {
    screen: EditingHistory,
    navigationOptions: {
      headerShown: false,
    },
  },
  ProfileTeacher: {
    screen: ProfileTeacherMainNoTabScreen,
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
  OnlineTeacher: {
    screen: OnlineTeacherScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  OnlineStudent: {
    screen: OnlineStudentScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  OnlineStudentSubjectList: {
    screen: OnlineStudentSubjectListScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  OnlineTeacherSubjectList: {
    screen: OnlineTeacherSubjectListScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  OnlineTeacherLessonList: {
    screen: OnlineTeacherLessonListScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  OnlineStudentLessonList: {
    screen: OnlineStudentLessonListScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  OnlineTopicList: {
    screen: OnlineTeacherTopicListScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  OnlineStudentTopicList: {
    screen: OnlineStudentTopicListScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  OnlineAddLesson: {
    screen: OnlineTeacherAddLessonScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  OnlineEditLesson: {
    screen: OnlineTeacherEditLessonScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  OnlineAddHomework: {
    screen: OnlineTeacherAddHomeworkScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  OnlineEditHomework: {
    screen: OnlineTeacherEditHomeworkScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  OnlineAddHomeworkSubmit: {
    screen: OnlineTeacherHomeworkSubmitScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  OnlineTopicMain: {
    screen: OnlineTopicMainScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  OnlineScoreSubmit: {
    screen: OnlineTeacherScoreSubmitScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  OnlineTeacherLessonDetail: {
    screen: OnlineTeacherLessonDetailScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  OnlineStudentHomeworkDetail: {
    screen: OnlineStudentHomeworkDetailScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  OnlineStudentHomeworkDetailForNotification: {
    screen: OnlineStudentHomeworkDetailForNotificationScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  OnlineStudentAddHomework: {
    screen: OnlineStudentAddHomeworkScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  OnlineStudentHomeworkSubmit: {
    screen: OnlineStudentHomeworkSubmitScreen,
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

  Topup: {
    screen: TopupScreen,
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
  Feedback: {
    screen: FeedbackScreen,
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
  ShopSetPincode: {
    screen: ShopSetPincodeScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  ShopSetPincodeConfirm: {
    screen: ShopSetPincodeConfirmScreen,
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
  ShopPaymentDone: {
    screen: ShopPaymentDone,
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

  Message: {
    screen: MessageScreen,
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
  MessageHistoryForNotification: {
    screen: MessageHistoryForNotificationScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  MessagePurchaseHistory: {
    screen: MessagePurchaseHistoryScreen,
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

  SecuritySetting: {
    screen: SecuritySettingScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  SettingManageAccount: {
    screen: SettingManageAccount,
    navigationOptions: {
      headerShown: false,
    },
  },
  SettingAddAccount: {
    screen: SettingAddAccount,
    navigationOptions: {
      headerShown: false,
    },
  },
  SettingChangePincode: {
    screen: SettingChangePincode,
    navigationOptions: {
      headerShown: false,
    },
  },
  SettingUpdatePass: {
    screen: SettingUpdatePassScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  EmailSetting: {
    screen: EmailSettingScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  PhoneSetting: {
    screen: PhoneSettingScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  LineConnect: {
    screen: LineConnectScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  LineAgree: {
    screen: LineAgreeScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  LineConnectSuccess: {
    screen: LineConnectSuccessScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  SettingChangePincodeEdit: {
    screen: SettingChangePincodeEdit,
    navigationOptions: {
      headerShown: false,
    },
  },
  SettingChangePincodeConfirm: {
    screen: SettingChangePincodeConfirm,
    navigationOptions: {
      headerShown: false,
    },
  },
  SettingNotification: {
    screen: SettingNotification,
    navigationOptions: {
      headerShown: false,
    },
  },

  SettingAbout: {
    screen: SettingAbout,
    navigationOptions: {
      headerShown: false,
    },
  },

  SettingPrivacy: {
    screen: PrivacyPolicyNoActionScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  ReportForTeacher: {
    screen: ReportForTeacherNoTabScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  ReportAttendance: {
    screen: ReportAttendanceNoTabScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  ReportAttendanceCalendar: {
    screen: ReportAttendanceCalendarScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  ReportAttendanceSubjectCalendar: {
    screen: ReportAttendanceSubjectCalendarScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  ReportBehavior: {
    screen: ReportBehaviorScoreMain,
    navigationOptions: {
      headerShown: false,
    },
  },

  ReportBehaviorStudentList: {
    screen: ReportBehaviorScoreStudentListScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  ReportBehaviorScoreDetail: {
    screen: ReportBehaviorScoreDetailsScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  ReportStudentBehaviorScoreDetail: {
    screen: ReportBehaviorScoreDetailScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  ReportStudentBehaviorScoreList: {
    screen: ReportStudentBehaviorScoreListScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  ReportExecutiveAttendance: {
    screen: ReportExecutiveAttendanceNoTabScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  ReportUncheckName: {
    screen: ReportUncheckNameScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  ReportExcuteBroadcast: {
    screen: ReportExcuteBroadcastScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  ReportBroadcast: {
    screen: ReportBroadcastScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  ReportPersonalAttendance: {
    screen: ReportPersonalAttendanceNoTabScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  ReportTeacherStudentLeave: {
    screen: ReportTeacherStudentLeaveScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  ReportTeacherStudentLeaveStudentList: {
    screen: ReportTeacherStudentLeaveStudentListScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  ReportLeaveForStudent: {
    screen: ReportStudentLeaveScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  ReportTeacherStudentLeaveList: {
    screen: ReportTeacherStudentLeaveListScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  ReportLeave: {
    screen: ReportTeacherPersonalLeaveScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  LeaveRequestDetail: {
    screen: LeaveRequestDetailScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  ReportTopup: {
    screen: ReportTopup,
    navigationOptions: {
      headerShown: false,
    },
  },
  ReportOrderList: {
    screen: ReportOrderList,
    navigationOptions: {
      headerShown: false,
    },
  },

  ReportOrderDetail: {
    screen: ReportOrderDetailScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  ReportAttendanceStatusList: {
    screen: ReportAttendanceStatusListScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  ReportAttendanceSubjectStatusList: {
    screen: ReportAttendanceSubjectStatusListScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  ReportAttendanceStudentStatusHistory: {
    screen: ReportAttendanceStudentStatusHistoryScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  ReportAttendanceStudentSubjectStatusHistory: {
    screen: ReportAttendanceStudentSubjectStatusHistoryScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  ReportExecutiveClassList: {
    screen: ReportExecutiveClassListScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  ReportExecAttendanceClassDetail: {
    screen: ReportExecAttendanceClassDetailScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  ReportExecutiveDepartmentList: {
    screen: ReportExecutiveDepartmentListScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  ReportExecAttendanceDepartmentDetail: {
    screen: ReportExecAttendanceDepartmentDetailScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  ReportHomework: {
    screen: ReportHomeworkScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  ReportHomeworkDetail: {
    screen: ReportHomeworkDetailScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  ReportBroadcastDetail: {
    screen: ReportBroadcastDetailNoTabScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  ReportExecutiveTopup: {
    screen: ReportExecutiveTopupScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  ReportPurchase: {
    screen: ReportPurchaseScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  ReportExecutivePurchaseList: {
    screen: ReportExecutivePurchaseDetailListScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  ReportTeacherExcutableTuition: {
    screen: ReportTeacherExcutableTuitionScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  ReportTeacherExcutableTuitionDetail: {
    screen: ReportTeacherExcutableTuitionDetailScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  ReportTeacherPersonalLeave: {
    screen: ReportTeacherPersonalLeaveScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  ReportTeacherPersonalOnline: {
    screen: ReportTeacherPersonalOnlineScreen,
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

  AcademicOutput: {
    screen: AcademicOutput,
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
  Tuition: {
    screen: TuitionScreen,
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

  TuitionPayment: {
    screen: TuitionPaymentScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  VisitHome: {
    screen: VisitHomeScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  VisitHomeDetail: {
    screen: VisitHomeDetailScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  VisitHomeDetailStudent: {
    screen: VisitHomeDetailStudentScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  AttendanceCheckIn: {
    screen: AttendanceCheckInScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  AttendanceCheckInList: {
    screen: AttendanceCheckInListScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  AttendanceCheckInSummary: {
    screen: AttendanceCheckInSummaryScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  AttendanceEditCheckin: {
    screen: AttendanceEditCheckinScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  BehaviorEdit: {
    screen: BehaviorEditScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  BehaviorQRCode: {
    screen: BehaviorQRCodeScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  BehaviorStudentID: {
    screen: BehaviorStudentIDScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  AttendanceCheckQRCode: {
    screen: AttendanceCheckQRCodeScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  AttendanceCheckStudentID: {
    screen: AttendanceCheckStudentIDScreen,
    navigationOptions: {
      headerShown: false,
    },
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
  BehaviorUserList: {
    screen: BehaviorUserListScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  BehaviorSubmit: {
    screen: BehaviorSubmitScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  AttendanceCheckOut: {
    screen: AttendanceCheckOutNoTabScreen,
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

  Notification: {
    screen: NotificationScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  ClassAttendTake: {
    screen: ClassAttendTakeScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  ClassAttendEdit: {
    screen: ClassAttendEditScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  ClassAttendStudentList: {
    screen: ClassAttendStudentListScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  ClassAttendAddSummary: {
    screen: ClassAttendTakeAddSummaryScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  ClassAttendSummary: {
    screen: ClassAttendSummaryScreen,
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
  BroadcastSelectClass: {
    screen: BroadcastSelectClassScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  BroadcastGroupSelectClass: {
    screen: BroadcastGroupSelectClassScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  BroadcastIndiviDual: {
    screen: BroadcastIndiviDualScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  BroadcastFillInfo: {
    screen: BroadcastFillInfoScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  BroadcastSubmit: {
    screen: BroadcastSubmitScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  YourDevice: {
    screen: YourDevicesScreen,
    navigationOptions: {
      headerShown: true,
    },
  },
};

const DrawerNavigatorConfigs = {
  drawerWidth: drawerWidth,
  drawerBackgroundColor: Color.transparent,
  contentComponent: Drawer,
};

const DrawerNavigator = createDrawerNavigator(DrawerRouteConfigs, DrawerNavigatorConfigs);
const DrawerContainer = createAppContainer(DrawerNavigator);

const VerifyRouteConfigs = {
  VerifyStart: {
    screen: VerifyStartScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  VerifyEmailCode: {
    screen: VerifyEmailCodeScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  VerifyEmailSuccess: {
    screen: VerifyEmailSuccessScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  VerifyPhoneCode: {
    screen: VerifyPhoneCodeScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  VerifyPhoneSuccess: {
    screen: VerifyPhoneSuccessScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  VerifyLineConnect: {
    screen: VerifyLineConnectScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  LineDisConnect: {
    screen: LineDisConnectScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  VerifyLineSuccess: {
    screen: VerifyLineSuccessScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  VerifyWarning: {
    screen: VerifyWarningScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  VerifyEmailInput: {
    screen: VerifyEmailInputScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  VerifyPhoneInput: {
    screen: VerifyPhoneInputScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  VerifyDevice: {
    screen: VerifyDeviceScreen,
    navigationOptions: {
      headerShown: false,
      gestureEnabled: false,
    },
  },

  VerifyDeviceSuccess: {
    screen: VerifyDeviceSuccessScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

  VerifyIdentify: {
    screen: VerifyIdentifyIDScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  VerifyIdentify1: {
    screen: VerifyIdentifyID1Screen,
    navigationOptions: {
      headerShown: false,
    },
  },
  VerifyIdentify2: {
    screen: VerifyIdentifyID2Screen,
    navigationOptions: {
      headerShown: false,
    },
  },
  VerifyIdentify3: {
    screen: VerifyIdentifyID3Screen,
    navigationOptions: {
      headerShown: false,
    },
  },
  VerifyIdentifySuccess: {
    screen: VerifyIdentifyIDSuccessScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
};

const VerifyNavigatorConfigs = {
  initialRouteName: 'VerifyStart',
  navigationOptions: {
    gestureEnabled: false,
  },
};

const VerifyNavigator = createStackNavigator(VerifyRouteConfigs, VerifyNavigatorConfigs);
const VerifyContainer = createAppContainer(VerifyNavigator);

const HelperRouteConfigs = {
  FirstRunFirst: {
    screen: FirstRunScreenOne,
    navigationOptions: {
      headerShown: false,
    },
  },

  FirstRunSecond: {
    screen: FirstRunScreenTwo,
    navigationOptions: {
      headerShown: false,
    },
  },

  FirstRunThird: {
    screen: FirstRunScreenThree,
    navigationOptions: {
      headerShown: false,
    },
  },
};

const HelperNavigatorConfigs = {
  initialRouteName: 'FirstRunFirst',
};

const HelperNavigator = createStackNavigator(HelperRouteConfigs, HelperNavigatorConfigs);
const HelperContainer = createAppContainer(HelperNavigator);

const AppSwitchRouteConfigs = {
  AuthLoading: AuthLoadingScreen,
  Helper: HelperContainer,
  Auth: AuthContainer,
  App: MainAppContainer,
  Verify: {
    screen: VerifyContainer,
  },
  Drawer: DrawerContainer,
};

const AppSwitchNavigatorConfigs = {
  initialRouteName: 'AuthLoading',
};

const AppSwitchNavigator = createSwitchNavigator(AppSwitchRouteConfigs, AppSwitchNavigatorConfigs);
const AppSwitchContainer = createAppContainer(AppSwitchNavigator);

const soundAlarm = new Sound(require('./assets/sounds/alarm.mp3'), (err) => {
  if (err) {
    console.log(err);
  }
  soundAlarm.setNumberOfLoops(-1);
});

class Index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      notification: null,
      serverStatus: true,
      serverStatusMsg: '',
      showModalOffline: false,
      showReLoginModal: false,
      dev: false,
      reLoginUser: '',
      userInfo: null,
      password: '',
      selectedItem: null,
      passwordError: '',
    };
  }

  unsubscribe = null;

  async componentDidMount() {
    console.log('------------------Mount-----------------');

    await Storage.setVerifyFlag(false);

    // await Storage.removeUser();
    const urlsInfo = await Storage.getUrlsInfo();
    if (urlsInfo) {
      if (urlsInfo.dev === true) {
        this.props.setDEV(urlsInfo.dev);
      }
    }

    NetInfo.configure({
      reachabilityUrl: BASE_URL,
      reachabilityLongTimeout: 5 * 1000,
      reachabilityShortTimeout: 5 * 1000,
      reachabilityRequestTimeout: 15 * 1000,
    });

    this.unsubscribe = NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        this.setState({ showModalOffline: true });
      } else {
        this.setState({ showModalOffline: false });
      }
    });

    SplashScreen.hide();

    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        const result = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
        // Handling the result of the permit request
        if (result === RESULTS.GRANTED) {
          console.log('Permissions granted');
        } else {
          console.log('Permissions not granted');
        }
      } else {
        const granted1 = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          // PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        ]);
        const result = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
      }
    } catch (err) {
      console.warn(err);
    }
    global.deviceLocale = I18n.currentLocale();

    const _this = this;

    Linking.addEventListener('url', (e) => {
      _this._handleDeeplink(e.url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) {
        if (url.includes('sbapp://drawers/linesuccess/')) {
          this.props.setGoVerifyLineSuccess(true);
        }
      }
    });
  }

  componentWillUnmount() {}

  _handleDeeplink(url) {
    if (url.includes('sbapp://drawers/linesuccess/')) {
      NavigationService.navigate('VerifyLineSuccess');
    } else if (url.includes('sbapp://main/app/')) {
      NavigationService.navigate('Timetable');
    }
  }

  displayNotification = async (msg) => {
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

  reLogin() {
    const { userInfo, password } = this.state;
    const imei = getUniqueId();
    this.setState({ isLoading: true });
    ApiManager.signin(userInfo.UserName, password, userInfo.SchoolID, imei, '')
      .then(async (success) => {
        this.setState({ isLoading: false });
        if (!success) {
          this.setState({ passwordError: translang.t('WRONG_PASSWORD') });
          return Promise.reject('error');
        } else {
          const user = await Storage.getUser();
          const userId = user.ID;
          const schoolId = user.SchoolId;
          await updatePassword(userId, password);
          return ApiManager.getUserInfo(userId, schoolId);
        }
      })
      .then(() => {
        this.props.setShowTokenError(false);
        this.setState({
          showReLoginModal: false,
          password: '',
          passwordError: null,
          reLoginUser: '',
        });
        NavigationService.navigate('AuthLoading');
      })
      .catch((err) => {
        console.log('Drawer', err);
        this.setState({
          passwordError: translang.t('WRONG_PASSWORD'),
          isLoading: false,
        });
      });
  }

  render() {
    global.deviceLocale = I18n.currentLocale();
    global.deviceSerial = getUniqueId();

    const prefix = 'sbapp://';

    const dev = this.props.devReducer.dev;

    return (
      <SafeAreaProvider style={styles.container}>
        {dev && (
          <SafeAreaView>
            <Text style={{ fontSize: 24, textAlign: 'center' }}>Development Mode</Text>
          </SafeAreaView>
        )}
        <AppSwitchContainer
          ref={(ref) => {
            this._navigator = ref;
            NavigationService.setTopLevelNavigator(ref);
          }}
          uriPrefix={prefix}
          enableURLHandling={true}
        />
        {this.state.notification && (
          <Modal animationType="slide" transparent={true} key="modal">
            <View style={styles.centeredView}>
              <LinearGradient
                style={styles.dialogStyle}
                colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
              >
                <View
                  style={{
                    flexDirection: 'column',
                    justifyContent: 'center',
                    marginTop: 30,
                    alignItems: 'center',
                  }}
                >
                  <Image source={Images.n_applogo_logo_only} style={styles.modalLogo} />
                </View>
                <ScrollView
                  style={{ flex: 1, marginHorizontal: 20, marginVertical: 15 }}
                  contentContainerStyle={{ flexGrow: 1 }}
                >
                  <RenderHtml
                    baseFontStyle={{ fontSize: 18, color: 'white' }}
                    html={`<div>${this.state.notification}</div>`}
                  />
                </ScrollView>
                <GradientSmallButton
                  label={translang.t('HOME_close')}
                  opacity={1}
                  containerStyle={{ marginBottom: 20 }}
                  _onPress={this.confirmNotification}
                />
              </LinearGradient>
            </View>
          </Modal>
        )}

        <AlertWithImageOfflineModal
          isVisible={this.state.showModalOffline}
          image={Images.n_ic_warning}
          message={translang.t('ALERT_OFFLINE')}
          buttonColors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
          isVerticalGradient={false}
          onClose={() => {
            this.setState({ showModalOffline: false }, () => {
              setTimeout(() => {
                NetInfo.refresh().then((state) => {
                  if (!state.isConnected) {
                    this.setState({ showModalOffline: true });
                  } else {
                    this.setState({ showModalOffline: false });
                  }
                });
              }, 100);
            });
          }}
        />

        <TokenErrorModal
          isVisible={this.props.devReducer.showTokenError && !this.state.showReLoginModal}
          onConfirm={async () => {
            const userInfo = await Storage.getUserInfo();
            let name = userInfo.sName + ' ' + userInfo.sLastname;
            if (getCurrentLocale() == 'en' && userInfo.NameEn) {
              name = userInfo.NameEn + ' ' + userInfo.LastNameEN;
            }
            this.props.setShowTokenError(false);
            this.setState({
              showReLoginModal: true,
              reLoginUser: name,
              userInfo,
            });
          }}
        />
        <ReLoginModal
          isVisible={this.state.showReLoginModal}
          showCancelButton={false}
          message={translang.t('FOR_YOUR_SAFETY')}
          passwordText={translang.t('CONFIRM_PASS_AGAIN')}
          loading={this.state.isLoading}
          userName={this.state.reLoginUser}
          onConfirm={() => {
            this.reLogin();
          }}
          onForgot={() => {
            this.setState({ showReLoginModal: false });
            NavigationService.navigate('Forgotpass', { type: 2 });
          }}
          password={this.state.password}
          onChangePassword={(password) => {
            this.setState({ password: password, passwordError: '' });
          }}
          passwordError={this.state.passwordError}
        />
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
    backgroundColor: '#00000090',
  },
  dialogStyle: {
    width: '90%',
    height: '90%',
    // height: dimension.px180,
    flexDirection: 'column',
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
    width: 70,
    height: 70,
  },
});

const mapStateToProps = (state) => {
  const { devReducer } = state;
  return { devReducer };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setDEV,
      setTabIndex,
      setShowTokenError,
      setGoVerifyLineSuccess,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Index);
