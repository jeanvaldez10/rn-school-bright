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




export default class ForgotPassScreen_TEMP extends ValidationComponent {
  constructor(props) {
    super(props);
    this.state = {
      emailAddress: '',
      emailVerificationCode: '',
      serverEmailVerificationCode: '',
      newPassword: '',
      reTypedNewPassword: '',
      remindMeButtonClicked: false,
      resetPasswordButtonClicked: false,
      onForgotPasswordScreen: true,
      onResetPasswordScreen: false,
      showModal: false,
      modalBody: '',
      modalHeader: 'SchoolBright',
      modalButton: `${translang.t('COMMON_ok')}`,
      resendButtonDisable: true,
      remainingTime: '',
    };
    this.backhandler = null;
  }

  modalButtonClick = () => {
    this.setState({showModal: false});
    if (this.state.remindMeButtonClicked) {
      this.state.onForgotPasswordScreen = false;
      this.state.remindMeButtonClicked = false;
      this.state.onResetPasswordScreen = true;
    } else if (this.state.resetPasswordButtonClicked) {
      this.state.resetPasswordButtonClicked = false;
      this.props.navigation.navigate('Login');
    }
  };

  validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  validatePassword = (value) => {
    const reg = /(?=^.{8,255}$)((?=.*\d)(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[^A-Za-z0-9])(?=.*[a-z])|(?=.*[^A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]))^.*/;
    return reg.test(value);
  };

  _back = () => {
    this.props.navigation.goBack(null);
  };

  componentDidMount() {
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', () => {
      this.props.navigation.navigate('Forgot');
      return true;
    });
  }
  componentWillUnmount() {
    this.stopTimer();
    if(this.backhandler){
      this.backhandler.remove();
    }
    if(this.focusListener){
      this.focusListener.remove();
    }
  }

  startTimer = () => {
    let count = 300;
    this.setState({resendButtonDisable: true});
    this.myTimer = setInterval(() => {
      count--;
      this.setState({remainingTime: formatter.secondsToMinutes(count)});
      if (count <= 0) {
        this.stopTimer();
      }
      return;
    }, 1000);
  };

  stopTimer = () => {
    clearInterval(this.myTimer);
    this.setState({resendButtonDisable: false});
  };

  onRemindMeButtonClicked = async () => {
    this.setState({remindMeButtonClicked: true});

    if (!this.validateEmail(this.state.emailAddress)) {
      return this.setState({
        remindMeButtonClicked: false,
        modalBody: translang.t('INPUT_VALID_EMAIL'),
        showModal: true,
      });
    }

    const params = {
      email: this.state.emailAddress,
      device_id: global.deviceSerial,
      send_email_code: 'yes',
    };

    usersService.forgot(
      params,
      async (response) => {
        const result = response.split('|');
        const check = result[0];
        if (check === 'OK') {
          this.setState({
            onForgotPasswordScreen: false,
            remindMeButtonClicked: false,
            onResetPasswordScreen: true,
            serverEmailVerificationCode: result[1],
          });
          this.startTimer();
        } else {
          this.setState({
            showModal: true,
            modalHeader: translang.t('ERROR_UPPER'),
            modalBody: `${result[1]}`,
          });
          this.setState({remindMeButtonClicked: false});
        }
      },
      (error) => {
        console.log(error);
      },
    );
  };

  onResetPasswordButtonClicked = async () => {
    const {
      emailAddress,
      newPassword,
      reTypedNewPassword,
      emailVerificationCode,
      serverEmailVerificationCode,
    } = this.state;

    if (emailVerificationCode !== serverEmailVerificationCode) {
      this.setState({
        modalHeader: translang.t('ERROR_UPPER'),
        modalBody: translang.t('WRONG_VERIFY_CODE'),
        modalButton: translang.t('COMMON_ok'),
        showModal: true,
      });
      return;
    }

    if (newPassword !== reTypedNewPassword) {
      this.setState({
        modalHeader: translang.t('ERROR_UPPER'),
        modalBody: translang.t('PASSWORD_DISMATCH'),
        modalButton: translang.t('COMMON_ok'),
        showModal: true,
      });
      return;
    }

    if (!this.validatePassword(newPassword)) {
      this.setState({
        modalHeader: translang.t('ERROR_UPPER'),
        modalBody: translang.t('PASSWORD_INVALID'),
        modalButton: translang.t('COMMON_ok'),
        showModal: true,
      });
      return;
    }

    this.setState({resetPasswordButtonClicked: true});
    const params = {
      email: emailAddress,
      device_id: global.deviceSerial,
      pass: newPassword,
      info: 'password_changed',
    };

    usersService.forgot(
      params,
      async (response) => {
        const result = response.split('|');
        if (result[0] === 'OK') {
          this.setState({
            modalHeader: translang.t('COMMON_success'),
            modalBody: translang.t('PASSWORD_SUCCESS'),
            modalButton: translang.t('COMMON_ok'),
            showModal: true,
          });
        } else if (result[0] === 'NOK') {
          this.setState({
            modalHeader: translang.t('ERROR_UPPER'),
            modalBody: `${result[1]}`,
            modalButton: translang.t('COMMON_ok'),
            showModal: true,
            resetPasswordButtonClicked: false,
          });
        }
      },
      (error) => {
        console.log(error);
      },
    );
  };

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.showModal && this.state.showModal) {
      speak(this.state.modalBody);
      setTimeout(() => this.setState({showModal: false}), 5000);
    }
  }

  render() {
    const {
      remindMeButtonClicked,
      resetPasswordButtonClicked,
      onForgotPasswordScreen,
      onResetPasswordScreen,
    } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        <BackNavigationBar
          title={translang.t('HOME_forgot')}
          onMenuTap={() => this.back()}
        />

        <KeyboardAwareScrollView style={styles.container}>
          <View style={styles.appimage}>
            <Image source={Images.n_applogo_logo} style={styles.appLogo} resizeMode='contain' />
          </View>

          <TouchableOpacity style={{ marginTop: 10, }} onPress={this._onChangeSchool}>
            <CustomTextInput
              inputStyle={{
                borderWidth: 0,
                borderBottomWidth: 1,
                borderColor: Color.n_default_brown,
                fontSize: 27
              }}
              inputWrapperStyle={{
                marginBottom: 25,
                marginHorizontal: 35,
                borderColor: Color.n_default_brown,
                borderBottomWidth: 2,
              }}
              notouch="true"
              value={schoolname}
              placeholder={translang.t('HOME_school')}
              placeholderTextColor={Color.n_text_placeholder_gray}
            />
          </TouchableOpacity>
          <CustomTextInput
            inputStyle={{
              borderWidth: 0,
              borderBottomWidth: 1,
              borderColor: Color.n_default_brown,
              fontSize: 27
            }}
            inputWrapperStyle={{
              marginBottom: 25,
              marginHorizontal: 35,
              borderColor: Color.n_default_brown,
              borderBottomWidth: 2,
            }}
            value={userName}
            placeholder={translang.t('HOME_stdid_pn_email')}
            placeholderTextColor={Color.n_text_placeholder_gray}
            onChangeText={this._onChangeUserName}
          />
              

          <View style={styles.registerForm}>
            <Text style={styles.registerLabel}>
              {onForgotPasswordScreen ? translang.t('HOME_forgot') : translang.t('RESET_PASSWORD')}
            </Text>

            {onForgotPasswordScreen && (
              <View style={{marginTop: 30}}>
                <CustomTextInput
                  inputStyle={{
                    borderWidth: 0,
                    borderColor: Color.n_default_brown,
                  }}
                  inputWrapperStyle={{
                    marginBottom: 25,
                    marginHorizontal: 40,
                    borderColor: Color.n_default_brown,
                    borderBottomWidth: 1,
                  }}
                  placeholder={translang.t('PROFILE_email')}
                  placeholderTextColor={Color.n_default_gray}
                  onChangeText={(email) => {
                    this.state.emailAddress = email;
                  }}
                />
              {remindMeButtonClicked ? (
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
                    containerStyle={styles.loginBtn}
                    label={translang.t('REMIND_ME')}
                    _onPress={() => this.onRemindMeButtonClicked()}
                  />
                )}
              </View>
            )}

            {onResetPasswordScreen && (
              <View>
                <View style={{flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 40, marginTop: 30}}>
                  <CustomTextInput
                    inputStyle={{
                      borderWidth: 0,
                      borderColor: Color.n_default_brown,
                      fontSize: 27 
                    }}
                    inputWrapperStyle={{
                      marginBottom: 25,
                      flex: 1,
                      borderColor: Color.n_default_brown,
                      borderBottomWidth: 1,
                    }}
                    placeholder={translang.t('VERIFICATION_CODE')}
                    placeholderTextColor={Color.n_text_placeholder_gray}
                    onChangeText={(code) =>
                      (this.state.emailVerificationCode = code)
                    }
                  />

                  <View>
                    <Text 
                      style={this.state.resendButtonDisable? styles.TextStyle : styles.TextStyleEnabled}
                      onPress={() => {
                        if (!this.state.resendButtonDisable) {
                          this.onRemindMeButtonClicked();
                        }
                      }}>
                      {translang.t('RESEND_EMAIL')}
                    </Text>
                    <Text style={styles.TimerTextStyle}>
                      {this.state.remainingTime}
                    </Text>
                  </View>
                </View>

                <CustomTextInput
                  inputStyle={{
                    borderWidth: 0,
                    borderColor: Color.n_default_brown,
                    fontSize: 27
                  }}
                  inputWrapperStyle={{
                    marginTop: 30,
                    marginBottom: 25,
                    marginHorizontal: 40,
                    flex: 1,
                    borderColor: Color.n_default_brown,
                    borderBottomWidth: 1,
                  }}
                  placeholder={translang.t('NEW_PASSWORD')}
                  placeholderTextColor={Color.n_default_gray}
                  onChangeText={(password) => (this.state.newPassword = password)}
                />

                <CustomTextInput
                  inputStyle={{
                    borderWidth: 0,
                    borderColor: Color.n_default_brown,
                    fontSize: 27
                  }}
                  inputWrapperStyle={{
                    marginBottom: 25,
                    marginHorizontal: 40,
                    flex: 1,
                    borderColor: Color.n_default_brown,
                    borderBottomWidth: 1,
                  }}
                  placeholder={translang.t('RETYPE_NEW_PASSWORD')}
                  placeholderTextColor={Color.n_default_gray}
                  onChangeText={(rePassword) =>
                    (this.state.reTypedNewPassword = rePassword)
                  }
                />
                {resetPasswordButtonClicked ? (
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
                    containerStyle={styles.loginBtn}
                    label={translang.t('RESET_PASSWORD')}
                    _onPress={this.onResetPasswordButtonClicked}
                  />
                )}
              </View>
            )}

            <GradientButton
              containerStyle={{...styles.loginBtn, marginHorizontal: 0}}
              label={translang.t('Home')}
              _onPress={() => this._back()}
            />
          </View>

          <AlertWithImageModal
            isVisible={this.state.showModal}
            image={Images.alert_inbox}
            title={this.state.modalHeader}
            message={this.state.modalBody}
            buttonColors={[Color.red_orange, Color.soft_red]}
            isVerticalGradient={false}
            onClose={() => { this.modalButtonClick()}}
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

  loginBtn: {
    width: '100%',
    height: 70,
    marginTop: 25,
    paddingHorizontal: 50,
  },

  TextStyle: {
    textAlign: 'center',
    fontSize: 15,
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    color: Color.n_default_gray,
  },
  TextStyleEnabled: {
    textAlign: 'center',
    fontSize: 15,
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    color: Color.n_default_orange
  },
  registerLabel: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#707070',
    marginVertical: 15,
    alignSelf: 'center',
  },

  TimerTextStyle: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
    color: Color.n_default_gray,
    marginBottom: 10,
  },
});
