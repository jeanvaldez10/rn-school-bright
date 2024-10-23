import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  BackHandler,
  ActivityIndicator,
  Modal,
} from 'react-native';
import CustomTextInput from '../../components/CustomTextInput';
import CustomPassInput from '../../components/CustomPassInput';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import GradientButton from '../../components/GradientButton';
import ValidationComponent from 'react-native-form-validator';
import LinearGradient from 'react-native-linear-gradient';
import {usersService} from '../../services/UsersService';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import _ from 'lodash';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-community/async-storage';
import messaging from '@react-native-firebase/messaging';
import {AsyncStorageKey} from '../../constants/TextConstants';
import dimension from '../../constants/dimension';
import GradientSmallButton from '../../components/GradientSmallButton';
import {speak} from '../../utils/tts';

export default class RegisterScreen extends ValidationComponent {
  constructor(props) {
    super(props);
    this.state = {
      isChecked: false,
      emailAddress: '',
      password: '',
      passwordConfirm: '',
      passwordValid: null,
      repasswordValid: null,
      showpassword: true,
      showconfirmpassword: true,
      isSignUp: false,
      showModal: false,
      modalHeader: 'Invalid input',
      modalBody: 'All fields must be populated',
      modalButton: 'OK',
      modalButtonNegative: 'Back',
      goNext: false,
    };
    this.backhandler = null;
  }

  _validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  _onChangeEmail = (email) => {
    this.setState({emailAddress: email}, () => {
      const isValid = this.validate({
        emailAddress: {email: true},
      });
      this.setState({isValid});
    });
  };

  _onChangePasswordConfirm = (text) => {
    this.setState({passwordConfirm: text});
    this.handleReValidation(text);
  };

  _onChangePassword = (text) => {
    this.setState({password: text});
    this.handleValidation(text);
  };

  handleValidation = (value) => {
    const reg = /(?=^.{8,255}$)((?=.*\d)(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[^A-Za-z0-9])(?=.*[a-z])|(?=.*[^A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]))^.*/;
    if (reg.test(value)) {
      this.setState({passwordValid: true});
    } else {
      this.setState({passwordValid: false});
    }
  };

  handleReValidation = (value) => {
    const reg = /(?=^.{8,255}$)((?=.*\d)(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[^A-Za-z0-9])(?=.*[a-z])|(?=.*[^A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]))^.*/;
    if (reg.test(value)) {
      this.setState({repasswordValid: true});
    } else {
      this.setState({repasswordValid: false});
    }
  };

  _back = () => {
    this.props.navigation.goBack(null);
  };

  _register = async () => {
    const {
      emailAddress,
      password,
      passwordConfirm,
      passwordValid,
      repasswordValid,
    } = this.state;
    if (
      _.isEmpty(emailAddress) ||
      _.isEmpty(password) ||
      _.isEmpty(passwordConfirm)
    ) {
      this.setState({
        showModal: true,
        modalHeader: 'Invalid input',
        modalBody: 'All fields must be populated',
        modalButton: 'OK',
        modalButtonNegative: '',
      });
      return;
    }

    if (!this._validateEmail(emailAddress)) {
      this.setState({
        showModal: true,
        modalHeader: 'ERROR',
        modalBody: 'Invalid Email Address',
        modalButton: 'OK',
        modalButtonNegative: '',
      });
      return;
    }

    if (password !== passwordConfirm) {
      this.setState({
        showModal: true,
        modalHeader: 'Invalid input',
        modalBody: 'Password mismatch detected',
        modalButton: 'OK',
        modalButtonNegative: '',
      });
      return;
    }

    if (!passwordValid || !repasswordValid) {
      this.setState({
        modalHeader: 'ERROR',
        modalBody:
          'Passwords must comprise of at least eight characters, an upper case character, a lower case character and a number.',
        modalButton: 'OK',
        modalButtonNegative: '',
        showModal: true,
      });
      return;
    }

    this.setState({isSignUp: true});
    const params = {
      email: emailAddress,
      password: encodeURIComponent(password),
      device_id: global.deviceSerial,
      lang: global.deviceLocale,
      token: '',
    };

    const firebaseMessaging = messaging();
    const authStatus = await firebaseMessaging.requestPermission();
    if (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    ) {
      params.token = await firebaseMessaging.getToken();
    }

    usersService.signup(
      params,
      async (res) => {
        if (res === '') {
          Toast.show('This email is already used by someone else.');
          this.setState({
            emailAddress: '',
            password: '',
            passwordConfirm: '',
            isSignUp: false,
          });
          return;
        }

        const result = res.split('|');
        if (result[0] === 'OK') {
          global.token = result[1];
          global.emailAddress = emailAddress;
          global.password = encodeURIComponent(password);
          Toast.show('Registration succeeded');
          await AsyncStorage.setItem(AsyncStorageKey.email, emailAddress);
          await AsyncStorage.setItem(AsyncStorageKey.password, password);
          await AsyncStorage.setItem(AsyncStorageKey.mode, '0');
          this.setState({
            showModal: true,
            modalHeader: 'SchoolBright',
            modalBody: `An email validation code has been sent to you at ${emailAddress}. Please enter it on the next screen.`,
            modalButton: 'OK',
            modalButtonNegative: 'Back',
            goNext: true,
          });
        } else if (result[0] === 'NOK') {
          this.setState({
            showModal: true,
            modalHeader: 'Invalid input',
            modalBody: result[1],
            modalButton: 'OK',
            modalButtonNegative: '',
          });
          this.setState({
            emailAddress: '',
            password: '',
            passwordConfirm: '',
            isSignUp: false,
          });
        }
      },
      (error) => {
        console.log(error);
      },
    );
  };

  componentDidMount() {
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', () => {
      this.props.navigation.navigate('Register');
      return true;
    });
  }

  componentWillUnmount() {
    if(this.backhandler){
      this.backhandler.remove();
    }
    if(this.focusListener){
      this.focusListener.remove();
    }
  }

  changePwdType = () => {
    this.setState((state) => ({showpassword: !state.showpassword}));
  };

  changePwdConfirmType = () => {
    this.setState((state) => ({
      showconfirmpassword: !state.showconfirmpassword,
    }));
  };

  modalButtonClick = () => {
    if (this.state.goNext) {
      setTimeout(() => {
        this.setState(
          {
            emailAddress: '',
            password: '',
            passwordConfirm: '',
            isSignUp: false,
          },
          () => {
            this.props.navigation.navigate('Validate', {
              emailAddress: global.emailAddress,
              token: global.token,
            });
          },
        );
      }, 800);
    }
    this.setState({showModal: false});
  };

  modalButtonNegativeClick = () => {
    this.setState({showModal: false});
  };

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.showModal && this.state.showModal) {
      speak(this.state.modalBody);
      if (!this.state.modalButtonNegative) {
        setTimeout(() => this.setState({showModal: false}), 5500);
      }
    }
  }

  render() {
    const {emailAddress, password, passwordConfirm, isSignUp} = this.state;
    return (
      <KeyboardAwareScrollView style={styles.container}>
        {/*<Image source={Images.applogo_} style={styles.appLogo} />*/}

        <View style={styles.registerForm}>
          <Text style={styles.registerLabel}>SignUp</Text>
          <CustomTextInput
            inputWrapperStyle={{
              marginBottom: 5,
              marginHorizontal: 50,
            }}
            value={emailAddress}
            placeholder="Email"
            placeholderTextColor="#707070"
            onChangeText={this._onChangeEmail}
          />
          <CustomPassInput
            inputWrapperStyle={{
              marginBottom: 5,
            }}
            value={password}
            placeholder="Password"
            placeholderTextColor="#707070"
            secureTextEntry={this.state.showpassword}
            onChangeText={this._onChangePassword}
            iconPress={this.changePwdType}
          />
          <CustomPassInput
            inputWrapperStyle={{
              marginBottom: 20,
            }}
            value={passwordConfirm}
            placeholder="Re-enter password"
            placeholderTextColor="#707070"
            secureTextEntry={this.state.showconfirmpassword}
            onChangeText={this._onChangePasswordConfirm}
            iconPress={this.changePwdConfirmType}
          />
          {isSignUp ? (
            <View style={{alignItems: 'center'}}>
              <View style={styles.loginBtn}>
                <LinearGradient
                  colors={[Color.primaryColor, Color.lightBlack]}
                  style={styles.loginBtnBackground}>
                  <ActivityIndicator color={Color.white} />
                </LinearGradient>
              </View>
            </View>
          ) : (
            <GradientButton label="Sign up" _onPress={this._register} />
          )}
          <GradientButton label="Home" _onPress={this._back} />
          <Modal
            animationType="slide"
            transparent={true}
            key="modal"
            visible={this.state.showModal}>
            <View style={styles.centeredView}>
              <View style={styles.dialogStyle}>
                <View
                  style={{
                    width: '100%',
                    marginLeft: dimension.px20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 20,
                  }}>
                  <Image
                    source={Images.gallery_icon}
                    style={styles.modalLogo}
                  />
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: 20,
                      paddingHorizontal: 15,
                      fontWeight: 'bold',
                    }}>
                    {this.state.modalHeader}
                  </Text>
                </View>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 16,
                    marginVertical: 10,
                    paddingHorizontal: 15,
                  }}>
                  {this.state.modalBody}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginHorizontal: 10,
                    marginBottom: 15,
                  }}>
                  {this.state.modalButtonNegative !== '' && (
                    <GradientSmallButton
                      label={this.state.modalButtonNegative}
                      opacity={1}
                      _onPress={() => this.modalButtonNegativeClick()}
                    />
                  )}
                  <GradientSmallButton
                    label={this.state.modalButton}
                    opacity={1}
                    _onPress={() => this.modalButtonClick()}
                  />
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalLogo: {
    width: 72,
    height: 30,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000025',
  },
  dialogStyle: {
    width: 350,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  applogo: {
    position: 'absolute',
    left: 10,
    top: 3,
    width: 10,
    height: 10,
  },
  registerForm: {
    marginTop: 150,
  },
  registerLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#707070',
    marginVertical: 15,
    alignSelf: 'center',
  },
  loginBtn: {
    marginTop: 10,
    width: 280,
    height: 55,
  },
  loginBtnBackground: {
    flex: 1,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
