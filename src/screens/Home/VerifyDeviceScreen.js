import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  BackHandler,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import GradientButton from '../../components/GradientButton';
import ValidationComponent from 'react-native-form-validator';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import {SafeAreaView} from 'react-native-safe-area-context';
import ApiManager from "../../managers/ApiManager";
import Storage from '../../managers/StorageManager';
import StorageManager from '../../managers/StorageManager';
import CustomRadioButtonObj from "../../components/CustomRadioButtonObj";
import ProgressHud from '../../components/ProgressHud';
import Constant from "../../constants/constants";
import {removeUser} from "../../utils/DBManager";

import CheckVerification from "../../components/CheckVerification";


export default class VerifyDeviceScreen extends ValidationComponent {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalBody: '',
      modalHeader: null,
      modalImage: Images.n_ic_warning,
      modalButton: `${translang.t('COMMON_ok')}`,
      isSetPassword: false,

      selectedSchool: null,
      userName: "",
      showSchoolModal: false,
      currentEmail: "",
      newPassword: "",
      confirmPassword: "",
      loginInfo: {},
      verifyOptions: [
        {text: 'Email', key: 0, value: 1, disabled: true},
        {text: 'SMS', key: 1, value: 2, disabled: true},
        {text: 'Line', key: 2, value: 3, disabled: true}
      ],
      selectedOption: null,
      deviceInfo: {},
      verifyWaiting: false,
      confirmWaiting: false,
      resObj: null,
      ipAddress: '',
      publicIp: null,
      isLoading: false,
      verifyType: 'main',
    };
  }

  handleBackButton = () => {
    console.log("back close");
    return true;
  };

  modalButtonClick = () => {
    this.setState({showModal: false});
    if(!this.state.confirmWaiting){
      this.logOut();
    }
  };

  _back = async () => {
    // this.props.navigation.navigate('App');
    await StorageManager.setVerifyFlag(true);
    if (this.backhandler) {
      this.backhandler.remove();
    }

    const parentRoute = this.props.navigation.getParam('parent') ?? 'App';
    this.props.navigation.navigate(parentRoute);
  };

  async componentDidMount() {
    const {navigation} = this.props;

    this.focusListener = navigation.addListener("didFocus", async () => {
      console.log("did focus");
      if (this.backhandler) {
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
      const loginInfo = await StorageManager.getUser();
      const deviceInfo = await StorageManager.getDeviceInfo();
      const verifyType = await StorageManager.getVerifyType();

      this.setState({loginInfo: loginInfo, deviceInfo: deviceInfo, isLoading: true, verifyType: verifyType});

      const res = await ApiManager.verifyDeviceCheck(deviceInfo.fcmtoken, loginInfo.ID, loginInfo.SchoolId, deviceInfo.imei);
      const res_ip = '';
      // const ipAddress =
      console.log("rs:", res.resObj.MessageChanel.email);
      if(res.StatusCode == 401 ){
        const resObj = res.resObj;
        const verifyOptions = [{key: 0, value: 1, text: `Email   ${resObj.MessageChanel.email.Label}`, disabled: !resObj.MessageChanel.email.Status},
          {key: 1, value: 2, text: `SMS     ${resObj.MessageChanel.phone.Label}`, disabled: !resObj.MessageChanel.phone.Status},
          {key: 2, value: 3, text: `Line     ${resObj.MessageChanel.line.Label}`, disabled: !resObj.MessageChanel.line.Status},
        ];
        this.setState({resObj: resObj, verifyOptions: verifyOptions, publicIP: res_ip, isLoading: false})
      }
      else if(res.StatusCode == 402){
        this.setState({verifyWaiting: true, isLoading: false, showModal: true, confirmWaiting: true, modalBody: this.getAlertText(this.getChannel(4), res.dSend),});
      }
      else if(res.StatusCode == 200){
        this.props.navigation.navigate('App');
      }else{
        this.setState({showModal: true, modalBody: res.Status, isLoading: false, confirmWaiting: true})
      }
    });

  }

  componentWillUnmount = () => {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    if (this.focusListener) {
      this.focusListener.remove();
    }
    console.log("unMount");
  };

  initWaiting = () => {
    this.setState({verifyWaiting: true, isLoading: false});
  };

  confirmVerify = () => {
    this.setState({isLoading: true});
    const {selectedOption, loginInfo, deviceInfo, publicIP } = this.state;
    ApiManager.verifyDevice(selectedOption, deviceInfo.fcmtoken, loginInfo.ID, loginInfo.SchoolId, deviceInfo.imei, publicIP, deviceInfo.model, deviceInfo.system)
      .then(data => {
        console.log("device verify:", data);
        this.initWaiting();
      }).catch(error => {
      this.setState({isLoading: false});
      console.log("device verify error:", error);
    });
  };

  cancel = ()=> {
    const parentRoute = this.props.navigation.getParam('parent') ?? 'Login';
    if (parentRoute == 'SettingAddAccount'){
      this.logOut_Prev();
    }else{
      if(this.state.verifyType == 'sub'){
        this.logOut_Prev();
      }else{
        this.logOut();
      }
    }
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


  logOut_Prev = () => {

    const token = this.state.deviceInfo.fcmtoken;
    const imei = this.state.deviceInfo.imei;
    const system = this.state.deviceInfo.system;
    const appversion = this.state.deviceInfo.version;

    const userId = this.state.loginInfo.ID;
    const schoolId = this.state.loginInfo.SchoolId;

    const promise = ApiManager.removeNotification(token, userId, schoolId, imei, system, appversion);
    promise.then(async result => {
      if (result.StatusCode == "200") {
        removeUser(userId).then();    //have some problem, we have to userid from the response of this api
        await Storage.removeUser().then();
        await Storage.removeUserInfo().then();
        const prevUser = await Storage.getPrevUser();
        const prevUserInfo = await Storage.getPrevUserInfo();
        await Storage.setUser(prevUser);
        await Storage.setUserInfo(prevUserInfo);
        Constant.AddProfiles = Constant.AddProfiles.filter(item => item.userid != userId);
        this.props.navigation.navigate('SettingAddAccount');
      }
    }).catch(error => {
      console.log(error);
      this.setState({isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN')});
    })


  }

  checkStatus = async () => {
    const { deviceInfo, loginInfo, selectedOption } = this.state;
    this.setState({isLoading: true});
    const res = await ApiManager.verifyDeviceCheck(deviceInfo.fcmtoken, loginInfo.ID, loginInfo.SchoolId, deviceInfo.imei);
    if (res.StatusCode == 200){
      this.props.navigation.navigate('App');
    }else if (res.StatusCode == 402){
      this.setState({isLoading: false, showModal: true, confirmWaiting: true, modalBody: this.getAlertText(this.getChannel(selectedOption), res.dSend), });
    }
    else{
      this.setState({isLoading: false, showModal: true, confirmWaiting: false, modalBody: this.getAlertText(this.getChannel(selectedOption), res.dSend), });
    }
  }


  getChannel = (i) =>{
    const channels = ['email', 'phone', 'line'];
    if(i > 3){
      return "SMS, Email or Line"
    }else{
      return channels[i-1];
    }
  }

  getLabel = (i) =>{
    const resObj = this.state.resObj;
    switch (i) {
      case 1:
        return resObj.MessageChanel.email.Label;
      case 2:
        return resObj.MessageChanel.phone.Label;
      case 3:
        return resObj.MessageChanel.line.Label;
    }
  }

  getAlertText = (channel, date) => {
    const engText = `Sorry, your device has not yet been verified. A device verification link is sent to the user's 2FA channel (${channel}) at (${date}). If you do not receive the link please try again after 3 mins`
    const thaiText = `ขออภัย อุปกรณ์ของคุณยังไม่ได้รับการยืนยัน ลิงก์การตรวจสอบอุปกรณ์ถูกส่งไปยังช่องทาง 2FA ของผู้ใช้ (${channel}) (${date}) หากไม่ได้รับลิงก์ กรุณาลองใหม่อีกครั้งภายหลัง 3 นาที`

    if(getCurrentLocale() == 'en'){
      return engText;
    }else{
      return thaiText;
    }
  }



  render() {
    const {verifyWaiting, isLoading} = this.state;
    return (
      <SafeAreaView style={styles.container}>

        {!verifyWaiting && <KeyboardAwareScrollView style={styles.container}>
          <View style={styles.appimage}>
            <Image source={Images.n_trust_device} style={styles.appLogo} resizeMode='contain'/>
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.bigText}>{translang.t('Verify_Device_Comment')}</Text>
          </View>

          <View style={styles.optionContainer}>

            <CustomRadioButtonObj
              PROP={this.state.verifyOptions}
              isVertically={true}
              selVal={this.state.selectedOption}
              onPress={(value) => {
                this.setState({selectedOption: value})
              }}/>

          </View>


          <View style={{paddingHorizontal: 20, flexDirection: 'row'}}>

            <GradientButton
              containerStyle={styles.loginBtn}
              label={translang.t('COMMON_cancel')}
              _onPress={() => this.cancel()}
            />

            <GradientButton
              enabled={(this.state.selectedOption !== null)}
              disableColors={[Color.n_disable_green, Color.n_disable_green1]}
              containerStyle={styles.loginBtn}
              colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
              label={translang.t('COMMON_ok')}
              _onPress={() => this.confirmVerify()}
            />

          </View>

        </KeyboardAwareScrollView>}
        {verifyWaiting && <KeyboardAwareScrollView style={styles.container}>
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>{translang.t('Verify_Device_Waiting')}</Text>
          </View>
          <View style={{paddingHorizontal: 20,  marginTop:100}}>

            <GradientButton
              containerStyle={styles.loginBtn_full_Width}
              label={translang.t('Check_Status')}
              _onPress={() => this.checkStatus()}
            />

          </View>
        </KeyboardAwareScrollView>}
        <ProgressHud isVisible={isLoading}></ProgressHud>
        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={this.state.modalImage}
          title={this.state.modalHeader}
          message={this.state.modalBody}
          buttonColors={[Color.green_button_color]}
          isVerticalGradient={false}
          onClose={() => {
            this.modalButtonClick()
          }}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
  },
  appLogo: {
    width: '100%',
    height: '100%',
  },
  appimage: {
    marginTop: 100,
    width: '100%',
    height: 250,
    alignItems: 'center',
  },
  BtnContainer: {
    width: '100%',
    height: 70,
    marginTop: 25,
    paddingHorizontal: 50,
  },

  loginBtnBackground: {
    flex: 1,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loginBtn: {
    width: '50%',
    height: 70,
    marginTop: 25,
    paddingHorizontal: 20,
  },
  loginBtn_full_Width: {
    width: '100%',
    height: 70,
    marginTop: 25,
    paddingHorizontal: 20,
  },

  bigText: {
    width: '100%',
    fontSize: 22,
    textAlign: 'center',
  },

  titleContainer: {
    paddingVertical: 40,
    paddingHorizontal: 40,
  },

  optionContainer: {
    paddingVertical: 10,
    paddingHorizontal: 40,
  },
  waitingContainer: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 32,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    marginTop: '50%',
  },
  waitingText: {
    width: '100%',
    fontSize: 32,
    textAlign: 'center',
    color: Color.primaryButtonColor
  }
});
