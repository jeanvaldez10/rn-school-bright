import React from 'react';
import {View, BackHandler, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import translang from '../../utils/language.utils';
import CustomSwitcher from '../../components/CustomSwitcher';
import Storage from '../../managers/StorageManager';
import ReportIconInfoItem from '../../components/IconInfoItem_OneLine';
import moment from 'moment';
import ApiManager from '../../managers/ApiManager';
import PermissionModal from '../../components/LogoutModal';
import ProgressHud from '../../components/ProgressHud';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import NetInfo from "@react-native-community/netinfo";
import {removeAllUser, removeUser} from '../../utils/DBManager';
import Constant from '../../constants/constants';
import CheckVerification from "../../components/CheckVerification";
export default class ReportForTeacherNoTabScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabIndex: 0,
      userInfo: {},
      loginInfo: {},
      deviceInfo: {},
      authInfo: {resCode: 200, resDesc: ""},
      isLoading: false,

      showModal: false,
      modalBody: '',
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  unsubscribe = null;

  async componentDidMount() {
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

    const userInfo = await Storage.getUserInfo();
    const loginInfo = await Storage.getUser();
    const deviceInfo = await Storage.getDeviceInfo();

    this.setState({ tabIndex: 0, userInfo: userInfo, loginInfo: loginInfo, deviceInfo: deviceInfo});
  }

  componentWillUnmount = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }
    if(this.focusListener){
      this.focusListener.remove();
    }
    // this.unsubscribe();
  };

  back = () => {
    this.props.navigation.navigate('UserInfo');
  };

  onChangeSwitcher = (index) => {
    this.setState({tabIndex: index, isEdit: false})
  }

  onClickItem = (key) => {
    if (key == 'student_attendance')
      this.props.navigation.navigate('ReportAttendance', {parent: 'ReportForTeacher'});
    else if (key == 'student_leave')
      this.props.navigation.navigate('ReportTeacherStudentLeave', {parent: 'ReportForTeacher'});
    else if(key === 'alighting_report')
      this.props.navigation.navigate('TeacherStudentAlightingReport', {parent: 'ReportForTeacher'});
    else if (key == 'student_behavior')
      this.props.navigation.navigate('ReportBehavior', {parent: 'ReportForTeacher'});
    else if (key == 'excute_attendance')
      this.gotoPageAfterAuth(23, 26, 'ReportExecutiveAttendance', {parent: 'ReportForTeacher', date: moment(), userInfo: this.state.userInfo});
      // this.props.navigation.navigate('ReportExecutiveAttendance', {parent: 'ReportForTeacher', date: moment(), userInfo: this.state.userInfo});
    else if (key == 'excute_uncheckName')
      this.gotoPageAfterAuth(23, 32, 'ReportUncheckName', {parent: 'ReportForTeacher'});
      // this.props.navigation.navigate('ReportUncheckName', {parent: 'ReportForTeacher'});
    else if (key == 'excute_topup')
      this.gotoPageAfterAuth(23, 27, 'ReportExecutiveTopup', {parent: 'ReportForTeacher'});
      // this.props.navigation.navigate('ReportExecutiveTopup', {parent: 'ReportForTeacher'});
    else if (key == 'excute_sales')
      this.gotoPageAfterAuth(23, 28, 'ReportPurchase', {parent: 'ReportForTeacher'});
      // this.props.navigation.navigate('ReportPurchase', {parent: 'ReportForTeacher'});
    else if (key == 'excute_tuition')
      this.gotoPageAfterAuth(23, 29, 'ReportTeacherExcutableTuition', {parent: 'ReportForTeacher'});
      // this.props.navigation.navigate('ReportTeacherExcutableTuition', {parent: 'ReportForTeacher'});
    else if (key == 'excute_homework')
      // this.gotoPageAfterAuth('ReportHomework', {parent: 'ReportForTeacher'});
      this.props.navigation.navigate('ReportHomework', {parent: 'ReportForTeacher'});
    else if (key == 'excute_broadcast')
      this.gotoPageAfterAuth(23, 33, 'ReportExcuteBroadcast', {parent: 'ReportForTeacher'});
      // this.props.navigation.navigate('ReportExcuteBroadcast', {parent: 'ReportForTeacher'});
    else if (key == 'person_attendance')
      this.props.navigation.navigate('ReportPersonalAttendance', {parent: 'ReportForTeacher'});
    else if (key == 'person_leave')
      this.props.navigation.navigate('ReportTeacherPersonalLeave', {parent: 'ReportForTeacher', type: 'reportteacher'});
    else if (key == 'person_topup')
      this.props.navigation.navigate('ReportTopup', {parent: 'ReportForTeacher'});
    else if (key == 'person_purchase')
      this.props.navigation.navigate('ReportOrderList', {parent: 'ReportForTeacher'});
    else if (key == 'person_homework')
      this.props.navigation.navigate('ReportTeacherPersonalOnline', {parent: 'ReportForTeacher'});
    else if (key == 'person_broadcast')
      this.props.navigation.navigate('ReportBroadcast', {parent: 'ReportForTeacher'});
  };

  logOut = async () => {
    StorageManager.setVerifyFlag(false);

    const {loginInfo, deviceInfo} = this.state;

    try {
      await CheckVerification.logoutUser(loginInfo, deviceInfo);
      this.props.navigation.navigate('Auth');
    } catch (error) {
      console.error(error);
      this.setState({ isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN') });
    }

  }

  clickAuthStatus = ()=>{
    const {authInfo} = this.state;
    if(authInfo.resCode == '301'){
      this.logOut();
    }else if(authInfo.resCode == '300'){
      this.props.navigation.navigate('UpdatePassword', {parent: 'ReportForTeacher'});
    }else if(authInfo.resCode == '401'){
      this.logOut();
    }else if(authInfo.resCode == '402'){
      this.logOut();
    }
  }
  gotoPageAfterAuth = (menuGroupID, subMenuID, pageName, params)=>{
    this.setState({isLoading: true})
    ApiManager.checkAuthStatus(this.state.loginInfo.ID, this.state.loginInfo.token, this.state.deviceInfo.fcmtoken)
    .then(res => {
      this.setState({authInfo: res, isLoading: false}, ()=>{
        if(res.resCode == 200){
          if(res.permission.length > 0){
            const idxGroup = res.permission.findIndex((item)=> item.menuGroup_Id == menuGroupID);
            if(idxGroup >= 0){
              if(res.permission[idxGroup].subMenus.length > 0){
                const idxSub = res.permission[idxGroup].subMenus.findIndex((item)=> item.menu_Id == subMenuID);
                if(idxSub >= 0){
                  this.props.navigation.navigate(pageName, params);
                }else{
                  this.setState({showModal: true, modalBody: translang.t('CONTACT_YOUER_SCHOOL_ADMIN') });
                }
              }else{
                this.setState({showModal: true, modalBody: translang.t('CONTACT_YOUER_SCHOOL_ADMIN') });
              }
            }else{
              this.setState({showModal: true, modalBody: translang.t('CONTACT_YOUER_SCHOOL_ADMIN') });
            }
          }else{
            this.setState({showModal: true, modalBody: translang.t('CONTACT_YOUER_SCHOOL_ADMIN') });
          }
        }
      });
    }).catch(error => {
      console.log(error);
      this.setState({showModal: true, modalBody: translang.t('ALERT_OFFLINE'), isLoading: false });
    });
  }
  render() {
    const options = [
      { title: translang.t('REPORT_student_report')},
      { title: translang.t('REPORT_executive_report')},
      { title: translang.t('REPORT_personal_report')},
    ];

    const isAuthDlg = this.state.authInfo.resCode==200?false:true;
    const alertImage = Images.n_ic_warning;
    const alertButtonColor = [Color.n_button_gradient_green_start, Color.n_button_gradient_green_end];

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_report')}
          onMenuTap={() => this.back()}
        />
        <View style={styles.container}>
          <CustomSwitcher
            dataList={options}
            selectedIndex={this.state.tabIndex ?? 0}
            onChangedSwitch={(index)=>this.onChangeSwitcher(index)}
            containerStyle = {{marginHorizontal: 15, height: 60, marginTop: 20}}
            radius = {20}
            textSize = {20}
          />
          <ScrollView style={styles.menuContainer} contentContainerStyle={styles.menuContainer}>
            {this.state.tabIndex == 0 && <View>
              <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('student_attendance') }} >
                <ReportIconInfoItem
                  imageSize={50}
                  topTextStyle={styles.menuTitle}
                  icon_mark={Images.n_ic_report_attendance}
                  label={translang.t('REPORT_attendance')}
                />
              </TouchableOpacity>

              {/* <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('student_leave') }} >
                <ReportIconInfoItem
                  imageSize={50}
                  topTextStyle={styles.menuTitle}
                  icon_mark={Images.n_ic_report_leave}
                  label={translang.t('REPORT_leave')}
                />
              </TouchableOpacity> */}

              <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('student_behavior') }} >
                <ReportIconInfoItem
                  imageSize={50}
                  topTextStyle={styles.menuTitle}
                  icon_mark={Images.n_ic_report_behavior}
                  label={translang.t('REPORT_behaviorscore')}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('alighting_report') }} >
                <ReportIconInfoItem
                  imageSize={50}
                  topTextStyle={styles.menuTitle}
                  icon_mark={Images.ic_school_bus_blue}
                  label={translang.t('BUS_ALIGHTING_REPORT')}
                />
              </TouchableOpacity>
            </View>}
            {this.state.tabIndex == 1 && <View>
              <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('excute_attendance') }} >
                <ReportIconInfoItem
                  imageSize={50}
                  topTextStyle={styles.menuTitle}
                  icon_mark={Images.n_ic_report_attendance}
                  label={translang.t('REPORT_attendance')}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('excute_uncheckName') }} >
                <ReportIconInfoItem
                  imageSize={50}
                  topTextStyle={styles.menuTitle}
                  icon_mark={Images.n_ic_report_uncheck}
                  label={translang.t('REPORT_uncheck_name')}
                />
              </TouchableOpacity>

              {/* <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('excute_homework') }} >
                <ReportIconInfoItem
                  imageSize={50}
                  topTextStyle={styles.menuTitle}
                  icon_mark={Images.n_ic_report_online}
                  label={translang.t('DRAWER_onlineclassroom')}
                />
              </TouchableOpacity> */}

              <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('excute_broadcast') }} >
                <ReportIconInfoItem
                  imageSize={50}
                  topTextStyle={styles.menuTitle}
                  icon_mark={Images.n_ic_report_broadcast}
                  label={translang.t('REPORT_broadcast')}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('excute_topup') }} >
                <ReportIconInfoItem
                  imageSize={50}
                  topTextStyle={styles.menuTitle}
                  icon_mark={Images.n_ic_report_topup}
                  label={translang.t('REPORT_topup')}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('excute_sales') }} >
                <ReportIconInfoItem
                  imageSize={50}
                  topTextStyle={styles.menuTitle}
                  icon_mark={Images.n_ic_report_purchase}
                  label={translang.t('REPORT_sales')}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('excute_tuition') }} >
                <ReportIconInfoItem
                  imageSize={50}
                  topTextStyle={styles.menuTitle}
                  icon_mark={Images.n_ic_report_tuition}
                  label={translang.t('REPORT_tuition')}
                />
              </TouchableOpacity>
            </View>}
            {this.state.tabIndex == 2 && <View>
              <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('person_attendance') }} >
                <ReportIconInfoItem
                  imageSize={50}
                  topTextStyle={styles.menuTitle}
                  icon_mark={Images.n_ic_report_attendance}
                  label={translang.t('REPORT_attendance')}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('person_leave') }} >
                <ReportIconInfoItem
                  imageSize={50}
                  topTextStyle={styles.menuTitle}
                  icon_mark={Images.n_ic_report_leave}
                  label={translang.t('REPORT_leave')}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('person_topup') }} >
                <ReportIconInfoItem
                  imageSize={50}
                  topTextStyle={styles.menuTitle}
                  icon_mark={Images.n_ic_report_topup}
                  label={translang.t('REPORT_topup')}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('person_purchase') }} >
                <ReportIconInfoItem
                  imageSize={50}
                  topTextStyle={styles.menuTitle}
                  icon_mark={Images.n_ic_report_purchase}
                  label={translang.t('REPORT_purchase')}
                />
              </TouchableOpacity>

              {/* <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('person_homework') }} >
                <ReportIconInfoItem
                  imageSize={50}
                  topTextStyle={styles.menuTitle}
                  icon_mark={Images.n_ic_report_online}
                  label={translang.t('DRAWER_onlineclassroom')}
                />
              </TouchableOpacity> */}
              <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('person_broadcast') }} >
                <ReportIconInfoItem
                  imageSize={50}
                  topTextStyle={styles.menuTitle}
                  icon_mark={Images.n_ic_report_broadcast}
                  label={translang.t('REPORT_broadcast')}
                />
              </TouchableOpacity>
            </View>}
          </ScrollView>
        </View>

        <PermissionModal
          isVisible={isAuthDlg}
          image={Images.n_ic_warning}
          showCancelButton={false}
          message = {this.state.authInfo.resDesc}
          onClose={() => { console.log("Click Close")}}
          onConfirm={() => {this.clickAuthStatus();}}
        />
        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={alertImage}
          message={this.state.modalBody}
          buttonColors={alertButtonColor}
          isVerticalGradient={false}
          onClose={() => {
            this.setState({ showModal: false });
          }}
        />
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
  menuContainer: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  menuEachStyle: {
    height: 100,
    borderRadius: 15,
    marginHorizontal: 25,
    marginTop: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 10,
    elevation: 2,
    paddingHorizontal: 10,
  },
  menuTitle: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    color: Color.n_default_orange
  },
});
