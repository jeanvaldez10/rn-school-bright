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

import CustomTextInput from '../../components/CustomTextInput';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import GradientButton from '../../components/GradientButton';
import GradientSmallButton from '../../components/GradientSmallButton';
import ValidationComponent from 'react-native-form-validator';
import {usersService} from '../../services/UsersService';
import LinearGradient from 'react-native-linear-gradient';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import {formatter} from '../../utils/Formatter';
import {speak} from '../../utils/tts';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import translang from '../../utils/language.utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import ApiManager from "../../managers/ApiManager";

import SmoothPinCodeInput from "rn-smooth-pincode-input";

import {StepProgressBar} from 'react-native-step-progress-bar/src';
import ProgressHud from "../../components/ProgressHud";
import Storage from '../../managers/StorageManager';
import CountDown from "react-native-countdown-component";

export default class VerifyPhoneCodeScreen extends ValidationComponent {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalBody: '',
      modalHeader: null,
      modalImage: Images.alert_inbox,
      modalButton: `${translang.t('HOME_close')}`,
      isSetPassword: false,

      selectedSchool: null,
      userName: "",
      showSchoolModal: false,
      phone: "",
      newPassword: "",
      confirmPassword: "",

      userInfo: {},
      code: '',
      type: 0,
      requestCode: 0,
      isLoading: false,

      resendEnable: false,
      verifyInfo: {},

    };
  }
  handleBackButton = () => {
    this._back();
    return true;
  };

  modalButtonClick = () => {
      this.setState({showModal: false});
  };

  _back = () => {
    // this.props.navigation.navigate('App');
    if(this.backhandler){
      this.backhandler.remove();
    }

    const parentRoute = this.props.navigation.getParam('parent') ?? 'App';
    this.props.navigation.navigate(parentRoute);
  };

  async componentDidMount() {
    const { navigation } = this.props;
    const type = this.props.navigation.getParam('type') ?? 0;
    this.setState({type: type});

    this.focusListener = navigation.addListener("didFocus", async () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const type = this.props.navigation.getParam('type') ?? 0;
      const requestCode = this.props.navigation.getParam('requestCode') ?? 0;
      const phone = this.props.navigation.getParam('phone') ?? '';
      const user = await Storage.getUserInfo();
      await this.setState({resendEnable: true});
      await this.setState({type: type, code: '', requestCode: requestCode, userInfo: user, phone: phone, resendEnable:false, verifyInfo: await Storage.getVerifyInfo()});
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

  confirm = async () => {
    const {code, userInfo, requestCode, type, verifyInfo } = this.state;
    this.setState({isLoading:true});
    const res = await ApiManager.verifyOTP(userInfo.SchoolID, userInfo.ID, 'phone', requestCode, code);
    this.setState({isLoading:false});
    if(res.statusCode = 200){
      if (res.result.code === 100) {
        await Storage.setVerifyInfo({emailVerify: verifyInfo.emailVerify, phoneVerify: true, email:verifyInfo.email, phone:verifyInfo.phone, lineConnect: verifyInfo.lineConnect});
        this.props.navigation.navigate('VerifyPhoneSuccess', {parent: 'SecuritySetting', type: type});
      }else{
        this.setState({ showModal: true, modalBody: translang.t('Invalid_OTP_Code'), isLoading:false });
      }
    }
  };

  resend = async () => {
    const {userInfo, phone } = this.state;
    this.setState({isLoading:true});
    const res = await ApiManager.requestOTP(userInfo.SchoolID, userInfo.ID, 'phone',phone, phone);
    if(res.statusCode = 200){
      if (res.result.code === 100) {
        this.setState({requestCode: res.result.requestCode, resendEnable: false});
      }
    }
    this.setState({isLoading:false});
  };


  skip = () => {
    this.props.navigation.navigate('VerifyWarning', {parent: 'VerifyPhoneCode'});
  };

  render() {

    const { code, type, resendEnable, verifyInfo } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        {type == 0 &&
        <BackNavigationBar
          style={{elevation: 0}}
          title={translang.t('Step') + "  4"}
          is_skip={true}
          onPressSkip={() => {
            this.skip();
          }}
          onMenuTap={() => this._back()}
        />
        }
        {type == 1 &&
        <BackNavigationBar
          title={translang.t('Verify_phone_number')}
          onMenuTap={() => this._back()}
        />
        }
        <KeyboardAwareScrollView style={styles.container}>
          <View style={{ alignItems: 'center', flex:1}}>
            <View style={{ paddingVertical: 20, width: 360}}>
              {type == 0 &&
              <StepProgressBar
                style={{margin: 'auto', borderWidth: 2, borderColor: 'red'}}
                orientation={'horizondal'}
                stepColor="lightgreen"
                activeStep={1}
                completedBarColor={'lightgrey'}
                stepWidth={50}
                stepHeight={50}
                showLabel={true}
                barLength={130}
                barThickeness={2}
                data={[
                  {label: translang.t('SETTING_addEmail')},
                  {label: translang.t('SETTING_EditPhoneNumber')},
                  // {label: translang.t('SETTING_Line')},
                ]}
                barColor={'lightgrey'}
                labelTextStyle={{fontFamily: 'THSarabunNew', color: 'darkgrey', fontSize: 20}}
                renderStep={({index}) => {
                  if (index === 0) {
                    return (
                      <View
                        style={styles.stepImage}>
                        <Image
                          style={{width: '100%', height: '100%'}}
                          source={verifyInfo.emailVerify? Images.ic_verified_email : Images.ic_grey_email}
                        />
                      </View>
                    );
                  } else if (index === 1) {
                    return (
                      <View
                        style={styles.stepImage}>
                        <Image
                          style={{width: '100%', height: '100%'}}
                          source={verifyInfo.phoneVerify? Images.ic_verified_phone : Images.ic_active_phone}
                        />
                      </View>
                    );
                  } else if (index === 2) {
                    return (
                      <View
                        style={styles.stepImage}>
                        <Image
                          style={{width: '100%', height: '100%'}}
                          source={verifyInfo.lineConnect ? Images.ic_verified_line : Images.ic_grey_line}
                        />
                      </View>
                    );
                  }
                }}
              />
              }
            </View>
          </View>
          <View style={styles.appimage}>
            <Image source={Images.n_applogo_logo} style={styles.appLogo} resizeMode='contain' />
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.bigText}>{translang.t('Enter_phone_code')}</Text>
          </View>

          <View style={{ alignItems: 'center', flex:1}}>
            <SmoothPinCodeInput
              cellStyle={{
                borderBottomWidth: 1,
                borderColor: '#fc8668',
              }}
              cellStyleFocused={{
                borderColor: 'red',
              }}
              value={code}
              autoFocus = {true}
              codeLength={6}
              cellSize={40}
              cellSpacing={15}
              textStyle={{fontSize: 36, fontWeight:'bold', color:'gray'}}
              onTextChange={code => this.setState({ 'code': code })}
            />
          </View>

          <View style={{ alignItems: 'center', flex:1}}>
            {resendEnable &&
            <TouchableOpacity style={styles.textButtonContainer} onPress={() => {
              this.resend()
            }}>
              <Text style={styles.textButton}>{translang.t("Resend_Code")}</Text>
            </TouchableOpacity>
            }
            {!resendEnable &&
            <CountDown
              size={24}
              until={180}
              onFinish={() => this.setState({resendEnable: true})}
              digitStyle={{backgroundColor: '#FFF', borderWidth: 0, borderColor: '#1CC625'}}
              digitTxtStyle={{color: 'black'}}
              timeLabelStyle={{color: 'red'}}
              separatorStyle={{color: 'black'}}
              timeToShow={['M', 'S']}
              timeLabels={{m: null, s: null}}
              showSeparator
            />
            }

          </View>
          <GradientButton
            containerStyle={styles.loginBtn}
            label={translang.t('COMMON_confirm')}
            _onPress={() => this.confirm()}
          />

        </KeyboardAwareScrollView>

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={this.state.modalImage}
          title={this.state.modalHeader}
          message={this.state.modalBody}
          buttonColors={[Color.green_button_color]}
          buttonTitle={this.state.modalButton}
          isVerticalGradient={false}
          onClose={() => { this.modalButtonClick()}}
        />

        <ProgressHud isVisible={this.state.isLoading} />

      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white
  },
  appLogo: {
    width: '100%',
    height: '100%',
  },
  appimage: {
    marginTop: 40,
    width: '100%',
    height: 130,
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
    width: '100%',
    height: 70,
    marginTop: 25,
    paddingHorizontal: 50,
  },

  bigText: {
    width: '100%',
    fontSize: 20,
    textAlign: 'center',
  },

  titleContainer: {
    paddingVertical: 40,
    paddingHorizontal: 40,
  },
  stepImage: {
    width: 50,
    height: 50,
    borderRadius: 25,

  },
  textButton: {
    fontSize: 24,
    borderBottomColor: "#fc8668",
    borderBottomWidth: 1,
    marginTop: 30,
  },
  textButtonContainer: {
    // borderBottomColor: "#fc8668",
    // borderBottomWidth: 1,
    // width: '100%',
  }

});
