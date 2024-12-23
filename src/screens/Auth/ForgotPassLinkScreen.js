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
import translang, {getCurrentLocale} from '../../utils/language.utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import SchoolModal from '../../components/SchoolModal';
import ApiManager from "../../managers/ApiManager";
import CustomRadioButtonObj from "../../components/CustomRadioButtonObj";
import StorageManager from "../../managers/StorageManager";

export default class ForgotPassLinkScreen extends ValidationComponent {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalBody: `${translang.t('Recovery_Notification')}`,
      modalHeader: `${translang.t('DRAWER_notification')}`,
      modalButton: `${translang.t('COMMON_next')}`,
      isSetPassword: false,

      selectedSchool: null,
      userName: "",
      showSchoolModal: false,
      isSentSuccess: false,
      verifyOptions: [
        {text: 'Email   ', key: 0, value: 1, disabled: true,},
        {text: 'SMS     ', key: 1, value: 2, disabled: true,},
        // {text: 'Line     ', key: 2, value: 3,  disabled: true,}
      ],
      selectedOption: null,
      resObj: null,
      isRecovery: false,
      type: 0,
    };
    this.backhandler = null;
  }

  modalButtonClick = () => {
    this.setState({showModal: false}, ()=>{
      if(this.state.isRecovery){
        this.go_recovery();
      }
      else{
        if(this.state.isSentSuccess){
          const parentRoute = this.state.type ? 'SettingAddAccount': 'Login';
          if(this.state.type == 2){
            this.props.navigation.navigate('App', {type: this.state.type});
          }else{
            this.props.navigation.navigate(parentRoute, {type: this.state.type});
          }

        }
      }
    });
  };

  _back = () => {
    this.props.navigation.navigate('Forgotpass');
  };

  componentDidMount() {
    const resObj = this.props.navigation.getParam('resObj') ?? false;
    const type = this.props.navigation.getParam('type') ?? 0;

    if(resObj){
      let verifyOptions = [{key: 0, value: 1, text: `Email   ${resObj.MessageChanel.email.Label}`, disabled: !resObj.MessageChanel.email.Status},
        {key: 1, value: 2, text: `SMS     ${resObj.MessageChanel.phone.Label}`, disabled: !resObj.MessageChanel.phone.Status},
        // {key: 2, value: 3, text: `Line     ${resObj.MessageChanel.line.Label}`, disabled: !resObj.MessageChanel.line.Status},
      ];
      this.setState({resObj: resObj, verifyOptions:verifyOptions, type: type});
    }

    this.backhandler = BackHandler.addEventListener('hardwareBackPress', () => {
      this.props.navigation.navigate('Forgotpass');
      return true;
    });
  }
  componentDidUpdate(prevProps, prevState) {
  }

  getChannel = (i) =>{
    const channels = ['email', 'phone'];
    return channels[i-1]
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

  getSuccessMessage = () => {
    if(getCurrentLocale() == 'en'){
      return `The system has successfully sent the password reset procedure via ${this.getChannel(this.state.selectedOption)} ${this.getLabel(this.state.selectedOption)}`
    }
    else{
      if(this.state.selectedOption == 1){
        return `ระบบได้ส่งขั้นตอนการรีเซ็ตรหัสผ่าน ไปยังอีเมล ${this.getLabel(this.state.selectedOption)} เรียบร้อยแล้ว`
      }else if(this.state.selectedOption == 2){
        return `ระบบได้ส่ง SMS ขั้นตอนการรีเซ็ตรหัสผ่าน ไปยังเบอร์โทรศัพท์ ${this.getLabel(this.state.selectedOption)} เรียบร้อยแล้ว`
      }else if(this.state.selectedOption == 3){
        return `ระบบได้ส่งขั้นตอนการรีเซ็ตรหัสผ่าน ไปยังบัญชีไลน์ของคุณ เรียบร้อยแล้ว`
      }
    }
  };



  sendLink = async () => {
    this.setState({ isSetPassword: true });
    ApiManager.sendMessagePasswordReset(this.state.resObj.UserID, this.state.resObj.schoolID, this.state.selectedOption).then(data => {
      if(data.resCode == 200){
        this.setState({ showModal: true, modalBody: this.getSuccessMessage(),
          modalHeader: `${translang.t('LEAVE_success')}`,
          modalButton: `${translang.t('HOME_close')}`,isSetPassword: false, isSentSuccess: true, isRecovery: false, });
      }else if(data.resCode == 103){
        this.setState({ showModal: true, modalBody: `${translang.t("Link_Not_Expired")}`, modalHeader: ' ', modalButton: `${translang.t('HOME_close')}`, isSetPassword: false, isSentSuccess: false, isRecovery: false, });
      }else{
        const msg = data.resDesc;
        this.setState({ showModal: true, modalBody: msg, modalHeader: 'Error', isSetPassword: false, isSentSuccess: false, isRecovery: false, });
      }
    }).catch(error => {
      console.log(error);
      const msg = translang.t('INCORRECT_USERNAME_PWD') + '\n' + translang.t('CONTACT_YOUER_SCHOOL_ADMIN');
      this.setState({ showModal: true, modalBody: msg, isSetPassword: false, isSentSuccess: false, isRecovery: false, });
    });
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

  _onChangeUserName = (userName) => {
    this.setState({ userName: userName });
  };

  go_recovery = () => {
    StorageManager.setRecoveryType(this.state.type);
    const parentRoute = this.state.type ? 'SettingAddAccount': 'Login';
    this.props.navigation.navigate('VerifyEmailInput', {parent: parentRoute, type: 2, setting_type: this.state.type});
  };

  showRecoveryModal = () => {
    this.setState({
      showModal: true,
      modalBody: `${translang.t('Recovery_Notification')}`,
      modalHeader: `${translang.t('DRAWER_notification')}`,
      modalButton: `${translang.t('COMMON_next')}`,
      isRecovery: true,
    })
  };

  render() {

    return (
      <SafeAreaView style={styles.container}>
        <BackNavigationBar
          title={translang.t('HOME_forgot')}
          onMenuTap={() => this._back()}
        />

        <KeyboardAwareScrollView style={styles.container}>
          <View style={styles.appimage}>
            <Image source={Images.n_applogo_logo} style={styles.appLogo} resizeMode='contain' />
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.bigText}>{translang.t('Forgot_Password_Link_Comment')}</Text>
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


          {this.state.isSetPassword ? (
          <View style={styles.BtnContainer}>
            <LinearGradient
              colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
              start={{x: 0, y: 1}}
              end={{x: 1, y: 0}}
              style={styles.loginBtnBackground}>
              <ActivityIndicator color={Color.white} />
            </LinearGradient>
          </View>
        ) : (
            <GradientButton
              enabled={(this.state.selectedOption !== null)}
              disableColors={[Color.n_disable_green, Color.n_disable_green1]}
              containerStyle={styles.loginBtn}
              label={translang.t('COMMON_confirm')}
              _onPress={() => this.sendLink()}
            />
          )}

          <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginHorizontal: 50, marginVertical:30}}>
            <TouchableOpacity style={{width: 'auto'}} onPress={() => {this.showRecoveryModal();}}>
              <Text style={styles.forgotText}>{translang.t('Account_Recovery')}</Text>
            </TouchableOpacity>
          </View>

          <AlertWithImageModal
            isVisible={this.state.showModal}
            title={this.state.modalHeader}
            titleStyle={{color: Color.select_type_text, fontSize:28, fontWeight: 'bold', marginTop: 24}}
            message={this.state.modalBody}
            buttonColors={[Color.green_button_next_color1, Color.green_button_next_color2]}
            isVerticalGradient={false}
            buttonTitle={this.state.modalButton}
            onClose={() => { this.modalButtonClick() }}
          />

        </KeyboardAwareScrollView>
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
  bigText: {
    width: '100%',
    fontSize: 22,
    textAlign: 'center',
    fontWeight: 'bold',
    color: Color.text_grey
  },


  loginBtn: {
    width: '100%',
    height: 70,
    marginTop: 25,
    paddingHorizontal: 50,
  },
  optionContainer: {
    paddingVertical: 10,
    paddingHorizontal: 40,
  },
  titleContainer: {
    paddingVertical: 10,
    paddingHorizontal: 40,
  },

  forgotText: {
    color: Color.n_default_orange,
    fontSize: 22,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: Color.n_default_orange,
  },

});
