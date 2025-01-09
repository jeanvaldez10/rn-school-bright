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
import SchoolModal from '../../components/SchoolModal';
import ApiManager from "../../managers/ApiManager";
import CustomPassInput from '../../components/CustomPassInput';
import CustomEmailInput from '../../components/CustomEmailInput';

import {StepProgressBar} from 'react-native-step-progress-bar/src';
import Storage from '../../managers/StorageManager';
import ProgressHud from "../../components/ProgressHud";


export default class VerifyEmailInputScreen extends ValidationComponent {
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
      type: 0,
      userInfo: {},
      isLoading: false,
      verifyInfo: {},
      confirmEdit: false,
      setting_type: 0
    };
  }
  handleBackButton = () => {
    console.log("back clicked", this.backhandler);
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

    const parentRoute = this.props.navigation.getParam('parent') ?? 'VerifyStart';
    this.props.navigation.navigate(parentRoute, {setting_type: this.state.setting_type});

  };

  async componentDidMount() {
    const { navigation } = this.props;
    const type = this.props.navigation.getParam('type') ?? 0;
    const setting_type = this.props.navigation.getParam('setting_type') ?? 0;
    this.setState({type: type, setting_type: setting_type});
    this.focusListener = navigation.addListener("didFocus", async () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      let user;
      if(type == 2){
        user = await Storage.getRecoveryUserInfo();
      }else{
        user = await Storage.getUserInfo();
      }

      if(type == 2){
        this.setState({type: type, userInfo: user, currentEmail:'', verifyInfo: {"email": "", "emailVerify": false, "lineConnect": false, "phone": "", "phoneVerify": false}});
      }else{
        const verifyInfo = await Storage.getVerifyInfo();
        this.setState({type: type, userInfo: user, currentEmail:verifyInfo.email?? '', verifyInfo: verifyInfo});
      }
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

  validate(text) {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    return reg.test(text)
  }

  getCode = async () => {
    const {currentEmail, userInfo, type , verifyInfo, confirmEdit} = this.state;
    console.log("validate:", this.validate(currentEmail));
    if (verifyInfo.emailVerify && type !==2 && !confirmEdit) {
      this.setState({confirmEdit: true});
      return;
    }

    if (!this.validate(currentEmail)) {
      this.setState({ showModal: true, modalBody: translang.t('INPUT_VALID_EMAIL') });
      return;
    }

    this.setState({isLoading:true});
    let res;
    if(this.state.type == 2){
      res = await  ApiManager.recoveryRequestOTP(userInfo.SchoolID, userInfo.ID, currentEmail);
    }else{
      res = await  ApiManager.requestOTP(userInfo.SchoolID, userInfo.ID, 'email', currentEmail);
    }

    this.setState({isLoading:false});
    console.log("requestOTP:", res);
    if(this.state.type == 2){
      if(res.resCode == 200){
        this.props.navigation.navigate('VerifyEmailCode', {parent:'VerifyEmailInput', type: type, requestCode: res.requestCode, email:currentEmail});
      }else if(res.resCode == 103){
        this.setState({ showModal: true, modalBody: translang.t('Token_exist'),isLoading:false });
      }else{
        this.setState({ showModal: true, modalBody: translang.t('INPUT_VALID_EMAIL'),isLoading:false });
      }
    }else{
      if(res.statusCode == 200){
        if(res.result.code == 100){
          this.props.navigation.navigate('VerifyEmailCode', {parent:'VerifyEmailInput', type: type, requestCode: res.result.requestCode, email:currentEmail});
        }
        else if(res.result.code == 103){
          this.setState({ showModal: true, modalBody: translang.t('Token_exist'),isLoading:false });
        }
        else if(res.result.code == 107){
          this.setState({ showModal: true, modalBody: translang.t('Email_verified_already'),isLoading:false });
        }
        else{
          this.setState({ showModal: true, modalBody: translang.t('INPUT_VALID_EMAIL'),isLoading:false });
        }
      }
    }


  };

  skip = () => {
    this.props.navigation.navigate('VerifyPhoneInput', {parent:'VerifyEmailInput', type: this.state.type});
  };

  _onChangeSchool = () => {
    this.setState({
      showSchoolModal: true,
    });
  };

  onSchoolSelect = (item) => {
    if (item == null) {
      this.setState({ showSchoolModal: false })
    } else {
      this.setState({ showSchoolModal: false, selectedSchool: item })
    }
  };


  _onChangecurrentEmail = (text) => {
    this.setState({ currentEmail: text });
  };

  render() {

    const { type, verifyInfo, confirmEdit } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        {type == 0 &&
        <BackNavigationBar
          style={{elevation: 0}}
          title={translang.t('Step') + "  1"}
          is_skip={true}
          onPressSkip={()=>{this.skip();}}
          onMenuTap={() => this._back()}
        />
        }
        {type == 1 &&
        <BackNavigationBar
          title={translang.t('Verify_email')}
          onMenuTap={() => this._back()}
        />
        }

        {type == 2 &&
        <BackNavigationBar
          style={{elevation: 0}}
          title={translang.t('Step') + "  1"}
          is_skip={false}
          onPressSkip={()=>{this.skip();}}
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
                labelTextStyle={{fontFamily: 'THSarabunNew', color: 'darkgrey', fontSize: 16}}
                renderStep={({index}) => {
                  if (index === 0) {
                    return (
                      <View
                        style={styles.stepImage}>
                        <Image
                          style={{width: '100%', height: '100%'}}
                          source={verifyInfo.emailVerify ? Images.ic_verified_email : Images.ic_active_email}
                        />
                      </View>
                    );
                  } else if (index === 1) {
                    return (
                      <View
                        style={styles.stepImage}>
                        <Image
                          style={{width: '100%', height: '100%'}}
                          source={verifyInfo.phoneVerify ? Images.ic_verified_phone : Images.ic_grey_phone}
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
            <Text style={styles.bigText}>{translang.t('Enter_Email')}</Text>
          </View>

          <CustomEmailInput
            inputStyle={{
              borderWidth: 0,
              borderBottomWidth: 0,
              borderColor: Color.n_default_brown,
              fontSize: 27,
            }}
            inputWrapperStyle={{
              marginVertical: 30,
              marginHorizontal: 40,
            }}
            value={this.state.currentEmail}
            placeholder={translang.t('Email_input_placeholder')}
            placeholderTextColor={Color.n_text_placeholder_gray}
            // secureTextEntry={true}
            onChangeText={this._onChangecurrentEmail}
            iconPress={this.changePwdType}
            editable={(verifyInfo.emailVerify && type !==2 && !confirmEdit ) ? false : true}
          />
          {!confirmEdit &&
            <GradientButton
              containerStyle={styles.loginBtn}
              label={(verifyInfo.emailVerify && type !==2 ) ? translang.t('EDIT') : translang.t('Get_Verification_Code')}
              _onPress={() => this.getCode()}
            />}
          {confirmEdit &&
          <GradientButton
              containerStyle={styles.loginBtn}
              label={translang.t('Confirm_Edit')}
              _onPress={() => this.getCode()}
          />}

        </KeyboardAwareScrollView>

        <ProgressHud isVisible={this.state.isLoading} />

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={this.state.modalImage}
          title={this.state.modalHeader}
          message={this.state.modalBody}
          buttonColors={[Color.green_button_color]}
          isVerticalGradient={false}
          buttonTitle={translang.t('HOME_close')}
          onClose={() => { this.modalButtonClick()}}
        />
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
    fontSize: 20  ,
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

  }

});
