import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {DrawerActions} from 'react-navigation-drawer';
import Caretdown from 'react-native-vector-icons/AntDesign';
import LogoutModal from './LogoutModal';
import ReLoginModal from './ReLoginModal';
import PermissionModal from './LogoutModal';
import Color from '../constants/color';
import Images from '../themes/Images';
import Storage from '../managers/StorageManager';
import translang, {getCurrentLocale} from '../utils/language.utils';
import Constant from '../constants/constants';
import ApiManager from "../managers/ApiManager";
import {updatePassword} from '../utils/DBManager';
import AlertWithImageModal from '../components/AlertWithImageModal';
import {getUniqueId} from "react-native-device-info";
import ProgressHud from "./ProgressHud";
import CheckVerification from '../components/CheckVerification'

const MenuItem = (props) => {
  const {height, icon_mark, label, show_bottom, show_caret, flag_open, onPressMenu, onPressCaret, textFontSize, textColor} = props;

  return (
    <View style={{paddingHorizontal: 10, paddingBottom: 0, backgroundColor: Color.white, height: height}}>
      <View style={styles.menuItem}>
        <TouchableOpacity style={styles.menuItem} onPress={() => {
          show_caret ? onPressCaret() : onPressMenu()
        }}>
          <Image source={icon_mark} style={{
            height: 20,
            width: 20,
            marginLeft: 20,
            marginRight: 20,
            alignItems: 'center',
            justifyContent: 'center',
            resizeMode: 'contain'
          }}></Image>
          <Text
            style={{
              width: '100%',
              fontSize: textFontSize ?? 22,
              fontWeight: 'bold',
              marginVertical: 0,
              marginHorizontal: 10,
              color: textColor ?? Color.black
            }}>
            {label}
          </Text>
        </TouchableOpacity>
        {show_caret &&
        <TouchableOpacity style={{position: 'absolute', marginVertical: 0, right: 5, alignItems: 'center'}}
                          onPress={onPressCaret}>

          {flag_open && <Caretdown name="caretup" size={16} color={Color.n_default_orange} style={{marginTop: 5}}/>}
          {!flag_open && <Caretdown name="caretdown" size={16} color={Color.n_default_orange} style={{marginTop: 5}}/>}

        </TouchableOpacity>}
      </View>

      {show_bottom &&
      <View style={{height: 1, width: '100%', backgroundColor: Color.n_default_brown, marginLeft: 65}}/>}

    </View>
  );
};

const AddMenuItem = (props) => {
  const {height, icon_mark, label, textFontSize, textColor, onPressMenu} = props;

  return (
    <View style={{paddingHorizontal: 10, paddingBottom: 0, backgroundColor: Color.white, height: height}}>
      <View style={styles.menuItem}>
        <TouchableOpacity style={styles.menuItem} onPress={() => {
          onPressMenu()
        }}>
          <View style={styles.addProfileImg}>
            <Image source={icon_mark}
                   style={{width: 36, height: 36, borderRadius: 22, borderWidth: 3, borderColor: 'white'}}></Image>
          </View>
          <Text
            style={{
              fontSize: textFontSize ?? 25,
              fontWeight: 'bold',
              marginVertical: 0,
              marginHorizontal: 10,
              color: textColor ?? Color.black
            }}>
            {label}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const SubMenuItem = (props) => {
  const {label, onPressMenu} = props;
  return (
    <View style={{paddingHorizontal: 0, paddingVertical: 0, backgroundColor: Color.n_background_white}}>
      <TouchableOpacity style={styles.menuItem} onPress={onPressMenu}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            marginLeft: 100,
            marginVertical: 5,
            marginHorizontal: 10,
            color: Color.n_default_orange
          }}>
          {label}
        </Text>

      </TouchableOpacity>
    </View>
  );
};

export default class Drawer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: {},
      loginInfo: {},
      deviceInfo: {},

      isAddAccount: false,
      isOpenLeave: false,
      isCheckInOut: false,
      isClassAttend: false,
      isBehaviorSc: false,
      isHomework: false,

      showLogoutModal: false,

      authInfo: {resCode: 200, resDesc: ""},
      leavePermisionInfo: {},

      showModal: false,
      showReLoginModal: false,
      modalBody: '',
      publicIP: null,
      imei: getUniqueId(),
      isLoading: false,
      reLoginUser: '',
      password: '',
      selectedItem: null,
      passwordError: '',
    };
  }

  async componentDidMount() {
    const _user = await Storage.getUserInfo();
    const loginInfo = await Storage.getUser();
    const deviceInfo = await Storage.getDeviceInfo();
    this.setState({user: _user, loginInfo: loginInfo, deviceInfo: deviceInfo});
  }

  exit = async () => {
    this.setState({showLogoutModal: true});
    return true;
  };

  logOut = async () => {
    // const token = this.state.loginInfo.token;
    this.setState({isLoading: true});
    let requestCnt = 0;
    let totalRequestCnt = Constant.AddProfiles.length;
    Storage.setVerifyFlag(false);

    const {loginInfo, deviceInfo} = this.state;

    try {
      await CheckVerification.logoutUser(loginInfo, deviceInfo);
      this.props.navigation.navigate('Login');
    } catch (error) {
      console.error(error);
      this.setState({ isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN') });
    }

    // Constant.AddProfiles.forEach(item => {
    //   const token = this.state.deviceInfo.fcmtoken;
    //   const userId = item.userid;
    //   const schoolId = item.schoolID;
    //   const imei = this.state.deviceInfo.imei;
    //   const system = this.state.deviceInfo.system;
    //   const appversion = this.state.deviceInfo.version;
    //
    //   const promise = ApiManager.removeNotification(token, userId, schoolId, imei, system, appversion);
    //
    //   promise.then(result => {
    //     if (result.StatusCode == "200") {
    //       requestCnt++;
    //       removeUser(userId).then();    //have some problem, we have to userid from the response of this api
    //
    //       if (requestCnt == totalRequestCnt) {
    //         Storage.removeUser().then();
    //         Storage.removeUserInfo().then();
    //         this.props.navigation.navigate('Auth');
    //       }
    //     }
    //   }).catch(error => {
    //     console.log(error);
    //     this.setState({isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN')});
    //   })
    // })
  }

  gotoAddedProfile(item) {
    // NetInfo.fetch().then(state => {
    //   console.log("NETWORK STATUS", state);
    //   if(!state.isConnected){
    //     this.setState({showModal: true, modalBody: translang.t('ALERT_OFFLINE') });
    //     return;
    //   }
    // });
    console.log("item:", item);
    const {publicIP, imei} = this.state;
    this.setState({isLoading: true, selectedItem: item});
    ApiManager.signin(item.userloginid, item.userpassword, item.schoolID, imei, publicIP)
      .then(async success => {
        this.setState({isLoading: false});
        if (!success) {
          const msg = translang.t('INCORRECT_USERNAME_PWD') + '\n' + translang.t('CONTACT_YOUER_SCHOOL_ADMIN');
          return Promise.reject(msg);
        } else {
          const user = await Storage.getUser();
          const userId = user.ID;
          const schoolId = user.SchoolId;
          console.log("user switch");
          await Storage.setVerifyFlag(false);
          return ApiManager.getUserInfo(userId, schoolId);
        }
      })
      .then(() => {
        this.props.navigation.navigate('AuthLoading');
      })
      .catch(err => {
        console.log("Drawer", err);
        if (err == "Failed to login") {
          this.setState({showReLoginModal: true, isLoading:false, modalBody: translang.t('CANT_LOGIN_USER'), reLoginUser: item.name + " " + item.lastname, password: ''});
        } else {
          this.setState({
            isLoading:false,
            showModal: true,
            modalBody: translang.t('INCORRECT_USERNAME_PWD') + '\n' + translang.t('CONTACT_YOUER_SCHOOL_ADMIN')
          });
        }
      });
  }

  reLogin() {
    const {publicIP, imei, selectedItem:item, password} = this.state;
    this.setState({isLoading: true});
    ApiManager.signin(item.userloginid, password, item.schoolID, imei, publicIP)
      .then(async success => {
        this.setState({isLoading: false});
        if (!success) {
          this.setState({passwordError: translang.t('WRONG_PASSWORD')});
          return Promise.reject(msg);
        } else {
          const user = await Storage.getUser();
          const userId = user.ID;
          const schoolId = user.SchoolId;
          console.log("user switch");
          await updatePassword(userId, password);
          await Storage.setVerifyFlag(false);
          return ApiManager.getUserInfo(userId, schoolId);
        }
      })
      .then(() => {
        this.props.navigation.navigate('AuthLoading');
      })
      .catch(err => {
        console.log("Drawer", err);
        this.setState({passwordError: translang.t('WRONG_PASSWORD'), isLoading: false});
      });
  }

  gotoPageAfterAuth = async (menuGroupID, subMenuID, pageName, params) => {
    ApiManager.checkAuthStatus(this.state.loginInfo.ID, this.state.loginInfo.token, this.state.deviceInfo.fcmtoken)
      .then(res => {
        this.setState({authInfo: res}, () => {
          if (res.resCode == 200) {
            if (res.permission.length > 0) {
              const idxGroup = res.permission.findIndex((item) => item.menuGroup_Id == menuGroupID);
              if (idxGroup >= 0) {
                if (menuGroupID == 13) {
                  this.props.navigation.navigate(pageName, params);
                } else {
                  if (res.permission[idxGroup].subMenus.length > 0) {
                    const idxSub = res.permission[idxGroup].subMenus.findIndex((item) => item.menu_Id == subMenuID);
                    if (idxSub >= 0) {
                      this.props.navigation.navigate(pageName, params);
                    } else {
                      this.setState({showModal: true, modalBody: translang.t('CONTACT_YOUER_SCHOOL_ADMIN')});
                    }
                  } else {
                    this.setState({showModal: true, modalBody: translang.t('CONTACT_YOUER_SCHOOL_ADMIN')});
                  }
                }
              } else {
                this.setState({showModal: true, modalBody: translang.t('CONTACT_YOUER_SCHOOL_ADMIN')});
              }
            } else {
              this.setState({showModal: true, modalBody: translang.t('CONTACT_YOUER_SCHOOL_ADMIN')});
            }
          }
        });
      }).catch(e => {
      console.log(e);
      this.setState({showModal: true, modalBody: translang.t('ALERT_OFFLINE')});
    });
  }

  clickAuthStatus = () => {
    const {authInfo} = this.state;
    if (authInfo.resCode == '301') {
      this.logOut();
    } else if (authInfo.resCode == '300') {
      this.props.navigation.navigate('UpdatePassword', {parent: 'App'});
    } else if (authInfo.resCode == '401') {
      this.logOut();
    } else if (authInfo.resCode == '402') {
      this.logOut();
    }
  }

  gotoPageAfterLeavePermision = (pageName, params) => {
    ApiManager.checkLeavePermisionStatus(this.state.loginInfo.ID, getCurrentLocale())
      .then(res => {
        if (res == "SUCCESS") {
          this.props.navigation.navigate(pageName, params);
        } else {
          this.setState({showModal: true, modalBody: res});
        }
      }).catch(error => {
      console.log(error);
      this.setState({showModal: true, modalBody: translang.t('ALERT_OFFLINE')});
    });
  }

  render() {
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;
    const menuWidth = screenWidth * 0.8;
    const menuHeight = screenHeight;

    const isStudent = this.state.user.StudentId !== ''
      && this.state.user.StudentId !== null
      && this.state.user.StudentId !== undefined; //user.isstudent or isteacher?
    let schoolImage = require('../assets/images/school.jpeg');
    let profileImage = isStudent ? require('../assets/images/student.jpg') : require('../assets/images/teacher.jpg');
    let userName = (this.state.user.sName ?? '') + ' ' + (this.state.user.sLastname ?? '');
    let userName_first = this.state.user.sName;
    let userName_last = this.state.user.sLastname;

    const isAuthDlg = this.state.authInfo.resCode == 200 ? false : true;
    const alertImage = Images.n_ic_warning;
    const alertButtonColor = [Color.n_button_gradient_green_start, Color.n_button_gradient_green_end];

    if (this.state.user !== undefined && this.state.user !== null) {
      if (this.state.user.school_image !== null && this.state.user.school_image !== '') {
        schoolImage = {uri: this.state.user.school_image};
      }

      if (this.state.user.image !== null && this.state.user.image !== '') {
        profileImage = {uri: this.state.user.image};
      }

      if (getCurrentLocale() == 'en' && this.state.user.NameEn != '' && this.state.user.NameEn != null) {
        userName = (this.state.user.NameEn ?? '') + ' ' + (this.state.user.LastNameEN ?? '');
        userName_first = this.state.user.NameEn;
        userName_last = this.state.user.LastNameEN;
      }
    }

    return (
      <View style={{...styles.container, height: menuHeight}}>
        {isStudent &&
        <SafeAreaView edges={['top', 'left']} style={{flexDirection: 'column', height: '100%'}}>
          {!this.state.isAddAccount &&
          <>
            <View
              style={{backgroundColor: Color.white, flex: 1, width: '95%', marginVertical: -20, paddingVertical: 20}}>
              <ScrollView style={styles.menuContainer} indicatorStyle={'black'} bounces={false}>
                <MenuItem
                  icon_mark={Images.n_ic_nav_userinfo}
                  label={translang.t('DRAWER_userinfo')}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.props.navigation.navigate('UserInfo');
                  }}
                />
                <View style={{height: 5, width: '100%', backgroundColor: Color.transparent}}/>

                <MenuItem
                  icon_mark={Images.n_ic_nav_timetable_yellow}
                  label={translang.t('DRAWER_STUDENT_TIMETABLE')}
                  show_bottom={true}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.props.navigation.navigate('Timetable');
                  }}
                />

                <MenuItem
                  icon_mark={Images.n_ic_nav_onlineclass_yello}
                  label={translang.t('DRAWER_onlineclassroom')}
                  show_bottom={true}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.props.navigation.navigate('OnlineStudent');
                  }}
                />

                <MenuItem
                  icon_mark={Images.n_ic_nav_academic}
                  label={translang.t('DRAWER_acadresult')}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.props.navigation.navigate('Academic');
                  }}
                />
                <View style={{height: 5, width: '100%', backgroundColor: Color.transparent}}/>
                <MenuItem
                  icon_mark={Images.n_ic_nav_leave}
                  label={translang.t('DRAWER_leave')}
                  show_caret="1"
                  flag_open={this.state.isOpenLeave}
                  show_bottom={true}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    //this.props.navigation.navigate('Leave', { param: 'subscribe' });
                  }}
                  onPressCaret={() => {
                    this.setState({isOpenLeave: !this.state.isOpenLeave});
                  }}
                />

                {this.state.isOpenLeave && <SubMenuItem
                  label={translang.t('DRAWER_fullday')}
                  show_bottom={true}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.gotoPageAfterLeavePermision('FulldayLeave', {});
                    // this.props.navigation.navigate('FulldayLeave');
                  }}
                />}
                {this.state.isOpenLeave && <SubMenuItem
                  label={translang.t('DRAWER_halfday')}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.gotoPageAfterLeavePermision('HalfdayLeave', {});
                    // this.props.navigation.navigate('HalfdayLeave');
                  }}
                />}
                <MenuItem
                  icon_mark={Images.n_ic_nav_pickup}
                  label={translang.t('DRAWER_pickup')}
                  show_bottom={true}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.props.navigation.navigate('Pickup', {param: 'subscribe'});
                  }}
                />

                <MenuItem
                  icon_mark={Images.n_ic_nav_schoolcalendar}
                  label={translang.t('DRAWER_schcalendar')}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.props.navigation.navigate('SchoolCalendar');
                  }}
                />
                <View style={{height: 5, width: '100%', backgroundColor: Color.transparent}}/>

                <MenuItem
                  icon_mark={Images.n_ic_nav_message}
                  label={translang.t('SDQ_HOMEVISIT')}
                  show_bottom={false}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.props.navigation.navigate('VisitHomeDetailStudent');
                  }}
                />

                <View style={{height: 5, width: '100%', backgroundColor: Color.transparent}}/>

                <MenuItem
                  icon_mark={Images.n_ic_nav_topup}
                  label={translang.t('DRAWER_topup')}
                  show_bottom={true}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.props.navigation.navigate('Topup');
                  }}
                />

                <MenuItem
                  icon_mark={Images.n_ic_nav_shop}
                  label={translang.t('DRAWER_shop')}
                  show_bottom={true}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.props.navigation.navigate('Shop');
                  }}
                />

                <MenuItem
                  icon_mark={Images.n_ic_nav_tuition}
                  label={translang.t('DRAWER_tuition')}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.props.navigation.navigate('Tuition');
                  }}
                />
                <View style={{height: 5, width: '100%', backgroundColor: Color.transparent}}/>
                <MenuItem
                  icon_mark={Images.n_ic_nav_report}
                  label={translang.t('DRAWER_report')}
                  show_bottom={true}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.props.navigation.navigate('Report');
                  }}
                />

                <MenuItem
                  icon_mark={Images.n_ic_nav_message}
                  label={translang.t('DRAWER_message')}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.props.navigation.navigate('Message');
                  }}
                />
                <View style={{height: 5, width: '100%', backgroundColor: Color.transparent}}/>
                <MenuItem
                  icon_mark={Images.n_ic_nav_setting}
                  label={translang.t('DRAWER_setting')}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.props.navigation.navigate('Setting');
                  }}
                />
                <View style={{height: 5, width: '100%', backgroundColor: Color.transparent}}/>

                <MenuItem
                  height={80}
                  icon_mark={Images.n_ic_nav_logout}
                  label={translang.t('DRAWER_logout')}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    this.exit();
                    //this.props.navigation.navigate('App', { param: 'exit' });
                  }}
                />

                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#3CD693',
                    borderTopRightRadius: 15,
                    marginTop: -15,
                    paddingLeft: 25,
                    paddingRight: 10,
                    height: 70
                  }}
                  activeOpacity={1}
                  onPress={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.props.navigation.navigate('Feedback');
                  }}>
                  <Image source={Images.ic_feedback} style={{height: 29, width: 29, backgroundColor: '#3CD693'}}/>
                  <Text style={{fontSize: 20, fontWeight: 'bold', color: '#fff', flex: 1, marginLeft: 25}}
                        multiline={true}>
                    {translang.t('DRAWER_feedback')}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

          </>}
        </SafeAreaView>}

        {!isStudent &&
        <SafeAreaView edges={['left', 'top']} style={{flexDirection: 'column', height: '100%'}}>
           {!this.state.isAddAccount &&
          <>
            <View
              style={{backgroundColor: Color.white, flex: 1, width: '95%', marginVertical: -20, paddingVertical: 20}}>
              <ScrollView style={{...styles.menuContainer}} indicatorStyle={'black'} bounces={false}>
                <MenuItem
                  icon_mark={Images.n_ic_nav_userinfo}
                  label={translang.t('DRAWER_userinfo')}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.props.navigation.navigate('UserInfo');
                  }}
                />
                <View style={{height: 5, width: '100%', backgroundColor: Color.transparent}}/>

                <MenuItem
                  icon_mark={Images.n_ic_nav_checkin}
                  label={translang.t('DRAWER_checkinout')}
                  show_caret="1"
                  flag_open={this.state.isCheckInOut}
                  show_bottom={true}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    //this.props.navigation.navigate('', { param: 'subscribe' });
                  }}
                  onPressCaret={() => {
                    this.setState({isCheckInOut: !this.state.isCheckInOut});
                  }}
                />

                {this.state.isCheckInOut &&
                <SubMenuItem
                  label={translang.t('DRAWER_checkin')}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged();
                    }
                    this.gotoPageAfterAuth(1, 3, 'AttendanceCheckIn', {param: 'subscribe'});
                    // this.props.navigation.navigate('AttendanceCheckIn', { param: 'subscribe' });
                  }}
                />}
                {this.state.isCheckInOut &&
                <SubMenuItem
                  label={translang.t('DRAWER_edit_checkin')}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.gotoPageAfterAuth(1, 10, 'AttendanceEditCheckin', {param: 'subscribe'});
                    // this.props.navigation.navigate('AttendanceEditCheckin', { param: 'subscribe' });
                  }}
                />}
                {this.state.isCheckInOut &&
                <SubMenuItem
                  label={translang.t('DRAWER_checkout')}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.gotoPageAfterAuth(1, 34, 'AttendanceCheckOut', {param: 'subscribe'});
                    // this.props.navigation.navigate('AttendanceCheckOut', { param: 'subscribe' });
                  }}
                />}

                <MenuItem
                  icon_mark={Images.n_ic_nav_checkin}
                  label={translang.t('DRAWER_classattend')}
                  show_caret="1"
                  flag_open={this.state.isClassAttend}
                  show_bottom={true}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    //this.props.navigation.navigate('', { param: 'subscribe' });
                  }}
                  onPressCaret={() => {
                    this.setState({isClassAttend: !this.state.isClassAttend});
                  }}
                />

                {this.state.isClassAttend && <SubMenuItem
                  label={translang.t('DRAWER_take_classattend')}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.gotoPageAfterAuth(2, 9, 'ClassAttendTake', {param: 'subscribe'});
                    // this.props.navigation.navigate('ClassAttendTake', { param: 'subscribe' });
                  }}
                />}
                {this.state.isClassAttend && <SubMenuItem
                  label={translang.t('DRAWER_edit_classattend')}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.gotoPageAfterAuth(2, 11, 'ClassAttendEdit', {param: 'subscribe'});
                    // this.props.navigation.navigate('ClassAttendEdit', { param: 'subscribe' });
                  }}
                />}

                <MenuItem
                  icon_mark={Images.n_ic_nav_behavior}
                  label={translang.t('DRAWER_behaviorscore')}
                  show_caret="1"
                  flag_open={this.state.isBehaviorSc}
                  show_bottom={true}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    //this.props.navigation.navigate('', { param: 'subscribe' });
                  }}
                  onPressCaret={() => {
                    this.setState({isBehaviorSc: !this.state.isBehaviorSc});
                  }}
                />

                {this.state.isBehaviorSc && <SubMenuItem
                  label={translang.t('DRAWER_add_behavior')}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.gotoPageAfterAuth(4, 6, 'BehaviorAdd', {param: 'subscribe'});
                    // this.props.navigation.navigate('BehaviorAdd', { param: 'subscribe' });
                  }}
                />}
                {this.state.isBehaviorSc && <SubMenuItem
                  label={translang.t('DRAWER_reduce_behavior')}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.gotoPageAfterAuth(4, 12, 'BehaviorReduce', {param: 'subscribe'});
                    // this.props.navigation.navigate('BehaviorReduce', { param: 'subscribe' });
                  }}
                />}

                <MenuItem
                  icon_mark={Images.n_ic_nav_onlineclass_yello}
                  label={translang.t('DRAWER_onlineclassroom')}
                  show_bottom={true}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    // this.gotoPageAfterAuth('OnlineTeacher', {});
                    this.props.navigation.navigate('OnlineTeacher');
                  }}
                />

                <MenuItem
                  icon_mark={Images.n_ic_nav_broadcast}
                  label={translang.t('DRAWER_broadcast')}
                  show_bottom={true}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.gotoPageAfterAuth(13, 10, 'Broadcast', {});
                    // this.props.navigation.navigate('Broadcast');
                  }}
                />

                <MenuItem
                  icon_mark={Images.n_ic_nav_leave}
                  label={translang.t('DRAWER_leave')}
                  show_caret="1"
                  show_bottom={false}
                  flag_open={this.state.isOpenLeave}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    //this.props.navigation.navigate('Leave', { param: 'subscribe' });
                  }}
                  onPressCaret={() => {
                    this.setState({isOpenLeave: !this.state.isOpenLeave});
                  }}
                />

                {this.state.isOpenLeave && <SubMenuItem
                  label={translang.t('DRAWER_fullday')}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.gotoPageAfterLeavePermision('FulldayLeave', {});
                    // this.props.navigation.navigate('FulldayLeave');
                  }}
                />}
                {this.state.isOpenLeave && <SubMenuItem
                  label={translang.t('DRAWER_halfday')}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.gotoPageAfterLeavePermision('HalfdayLeave', {});
                    // this.props.navigation.navigate('HalfdayLeave');
                  }}
                />}

                <View style={{height: 5, width: '100%', backgroundColor: Color.transparent}}/>
                <MenuItem
                  icon_mark={Images.n_ic_nav_topup}
                  label={translang.t('DRAWER_topup')}
                  show_bottom={true}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.props.navigation.navigate('Topup');
                  }}
                />

                <MenuItem
                  icon_mark={Images.n_ic_nav_shop}
                  label={translang.t('DRAWER_shop')}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.props.navigation.navigate('Shop', {param: 'subscribe'});
                  }}
                />
                <View style={{height: 5, width: '100%', backgroundColor: Color.transparent}}/>
                <MenuItem
                  icon_mark={Images.n_ic_nav_timetable_yellow}
                  label={translang.t('DRAWER_timetable')}
                  show_bottom={true}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.props.navigation.navigate('Timetable');
                  }}
                />

                <MenuItem
                  icon_mark={Images.n_ic_nav_schoolcalendar}
                  label={translang.t('DRAWER_schcalendar')}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.props.navigation.navigate('SchoolCalendar');
                  }}
                />

                <View style={{height: 5, width: '100%', backgroundColor: Color.transparent}}/>

                <MenuItem
                  icon_mark={Images.n_ic_nav_message}
                  label={translang.t('SDQ_HOMEVISIT')}
                  show_bottom={false}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.props.navigation.navigate('VisitHome');
                  }}
                />

                <View style={{height: 5, width: '100%', backgroundColor: Color.transparent}}/>

                <MenuItem
                  icon_mark={Images.n_ic_nav_report}
                  label={translang.t('DRAWER_report')}
                  show_bottom={true}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    // this.gotoPageAfterAuth('ReportForTeacher', {});
                    this.props.navigation.navigate('ReportForTeacher');
                  }}
                />

                <MenuItem
                  icon_mark={Images.n_ic_nav_leaverequest}
                  label={translang.t('DRAWER_leaverequest')}
                  show_bottom={true}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.props.navigation.navigate('LeaveRequest');
                  }}
                />

                <MenuItem
                  icon_mark={Images.n_ic_nav_message}
                  label={translang.t('DRAWER_message')}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.props.navigation.navigate('Message', {param: 'subscribe'});
                  }}
                />
                <View style={{height: 5, width: '100%', backgroundColor: Color.transparent}}/>
                <MenuItem
                  icon_mark={Images.n_ic_nav_setting}
                  label={translang.t('DRAWER_setting')}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.props.navigation.navigate('Setting', {param: 'subscribe'});
                  }}
                />
                <View style={{height: 5, width: '100%', backgroundColor: Color.transparent}}/>

                <MenuItem
                  height={80}
                  icon_mark={Images.n_ic_nav_logout}
                  label={translang.t('DRAWER_logout')}
                  onPressMenu={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    this.exit();
                    //this.props.navigation.navigate('App', { param: 'exit' });
                  }}
                />
                <TouchableOpacity
                  activeOpacity={1}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#3CD693',
                    borderTopRightRadius: 15,
                    marginTop: -15,
                    paddingLeft: 25,
                    paddingRight: 10,
                    height: 70
                  }}
                  onPress={() => {
                    this.props.navigation.dispatch(DrawerActions.closeDrawer());
                    if (global.onDrawerChanged) {
                      global.onDrawerChanged()
                    }
                    this.props.navigation.navigate('Feedback');
                  }}
                >
                  <Image source={Images.ic_feedback} style={{height: 29, width: 29, backgroundColor: '#3CD693'}}/>
                  <Text style={{fontSize: 20, fontWeight: 'bold', color: '#fff', flex: 1, marginLeft: 25}}>
                    {translang.t('DRAWER_feedback')}
                  </Text>
                </TouchableOpacity>
              </ScrollView>

            </View>

          </>}
        </SafeAreaView>}


        <LogoutModal
          isVisible={this.state.showLogoutModal}
          image={Images.n_ic_warning}
          showCancelButton={true}
          message={translang.t('COMMON_msg_logout')}
          loading={this.state.isLoading}
          onClose={() => {
            this.setState({showLogoutModal: false})
          }}
          onConfirm={() => {
            this.logOut();
            // BackHandler.exitApp();
          }}
        />

        <ReLoginModal
            isVisible={this.state.showReLoginModal}
            image={Images.n_ic_warning}
            showCancelButton={true}
            message={this.state.modalBody}
            loading={this.state.isLoading}
            userName={this.state.reLoginUser}
            onClose={() => {
              this.setState({showReLoginModal: false})
            }}
            onConfirm={() => {
              this.reLogin();
            }}
            password={this.state.password}
            onChangePassword={(password)=>{
              this.setState({password: password, passwordError: ''});
            }}
            passwordError={this.state.passwordError}
        />

        <PermissionModal
          isVisible={isAuthDlg}
          image={Images.n_ic_warning}
          showCancelButton={false}
          message={this.state.authInfo.resDesc}
          onClose={() => {
            console.log("Click Close")
          }}
          onConfirm={() => {
            this.clickAuthStatus();
          }}/>

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={alertImage}
          message={this.state.modalBody}
          buttonColors={alertButtonColor}
          isVerticalGradient={false}
          onClose={() => {
            this.setState({showModal: false});
          }}/>

        <ProgressHud isVisible={this.state.isLoading}/>

      </View>


    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuContainer: {
    backgroundColor: Color.n_default_brown,
  },
  menuItem: {
    flexDirection: 'row',
    width: '100%',
    marginVertical: 6,
    alignItems: 'center',

  },

  addProfileImg: {
    borderRadius: 18,
    marginHorizontal: 13,

    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
});
