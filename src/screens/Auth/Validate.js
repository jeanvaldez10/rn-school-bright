/* eslint-disable react/no-did-mount-set-state */

import AsyncStorage from '@react-native-community/async-storage';
import {AsYouType, parsePhoneNumberFromString} from 'libphonenumber-js';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  Alert,
} from 'react-native';
import CountryPicker, {
  CountryCodeList,
} from 'react-native-country-picker-modal';
import ValidationComponent from 'react-native-form-validator';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-simple-toast';
import messaging from '@react-native-firebase/messaging';
import CustomTextInput from '../../components/CustomTextInput';
import GradientButton from '../../components/GradientButton';
import GradientSmallButton from '../../components/GradientSmallButton';
import Loader from '../../components/Loader';
import Color from '../../constants/color';
import {AsyncStorageKey} from '../../constants/TextConstants';
import {usersService} from '../../services/UsersService';
import {menuservice} from '../../services/MenuService';
import {formatter} from '../../utils/Formatter';
import Images from '../../themes/Images';
import dimension from '../../constants/dimension';
import {httpUtils} from '../../utils/HttpUtils';
import {speak} from '../../utils/tts';

const maxLength = 8;

export default class Validate extends ValidationComponent {
  constructor(props) {
    super(props);
    const {getParam} = props.navigation;
    const phoneValidated = getParam('phoneValidated', false);
    const emailValidated = getParam('emailValidated', false);
    const emailAddress = getParam('emailAddress', '');
    this.email_verification_code = getParam('token', '');

    this.VERIFICATION_TYPES = {
      EMAIL: 'Email',
      PHONE: 'Phone',
    };

    this.state = {
      emailAddress,
      telno: '',
      telValid: false,
      emailValidated: emailValidated,
      phoneValidated: phoneValidated,
      isSendingCode: false,
      countryCode: 'GB',
      country: null,
      enabledEmailCodeButton: false,
      enabledSmsCodeButton: false,
      showIndicator: false,
      remainingTime: 0,
      resendButtonDisable: true,
      telenoVerifcationPage: false,
      sentEmailCode: true,
      sentSmsCode: false,
      showModal: false,
      modalHeader: 'SchoolBright',
      modalButton: 'OK',
    };
  }

  componentWillUnmount() {
    clearInterval(this.myTimer);
  }

  componentDidMount = async () => {
    if (this.state.emailValidated === false) {
      this.startTimer(0);
    }

    try {
      const {country_code} = await fetch(
        'http://api.ipstack.com/check?access_key=c5a0c13ec5f2c0ad45e19f9b200c41e0',
      ).then((res) => res.json());
      if (CountryCodeList.includes(country_code)) {
        this.setState({
          countryCode: country_code,
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

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

  async requestVerificationCode(type) {
    const params = await httpUtils.getHTTPParams();
    this.stopTimer();
    this.startTimer();

    if (type === this.VERIFICATION_TYPES.EMAIL) {
      params.send_email_code = 'yes';
    } else if (type === this.VERIFICATION_TYPES.PHONE) {
      const phoneNumber =
        (this.state.country ? this.state.country.callingCode[0] : '44') +
        '-' +
        this.state.telno;
      params.telno = phoneNumber;
      params.send_telno_code = 'yes';
    }

    usersService.validate(
      params,
      async (response) => {
        const array = response.split('|');
        const check = array[0];
        if (check === 'OK') {
          if (type === this.VERIFICATION_TYPES.EMAIL) {
            this.setState({sentEmailCode: true});
            this.email_verification_code = array[2];
          } else if (type === this.VERIFICATION_TYPES.PHONE) {
            this.setState({sentSmsCode: true});

            if (!this.state.telenoVerifcationPage) {
              this.state.modalBody =
                'An SMS has been sent to your phone. Please enter your validation code in the next screen';
              this.setState({showModal: true, telenoVerifcationPage: true});
            }
            this.serverSmsCode = array[3];
          }
        } else {
          this.setState({
            showModal: true,
            modalHeader: 'ERROR',
            modalBody: `${array[1]}`,
          });
          this.setState({isSendingCode: false});
        }
      },
      (error) => {
        console.log(error);
      },
    );
  }

  async validateVerificationCode(type) {
    if (
      type === this.VERIFICATION_TYPES.EMAIL &&
      this.email_verification_code !== this.emailCode.toUpperCase()
    ) {
      this.state.modalBody = 'Wrong Email Verfication Code Provided.';
      this.setState({showModal: true});
      return;
    } else if (
      type === this.VERIFICATION_TYPES.PHONE &&
      this.serverSmsCode !== this.smsCode.toUpperCase()
    ) {
      this.state.modalBody = 'Wrong Phone Number Verfication Code Provided.';
      this.setState({showModal: true});
      return;
    }

    const params = await httpUtils.getHTTPParams();

    if (type === this.VERIFICATION_TYPES.EMAIL) {
      this.state.modalBody =
        'Email validation complete. Please validate your mobile number';
      this.setState({showModal: true});
      this.setState({emailValidated: true});
      params.info = 'email_validated';
    } else if (type === this.VERIFICATION_TYPES.PHONE) {
      this.setState({phoneValidated: true});
      const phoneNumber =
        (this.state.country ? this.state.country.callingCode[0] : '44') +
        '-' +
        this.state.telno;
      params.telno = phoneNumber;
      params.info = 'telno_validated';
    }

    this.stopTimer();

    usersService.validate(params, async (response) => {
      console.log('Shanto Server Validation Response: ', response);
      this.userId = response.split('|')[2];
      const check = response.split('|')[0];

      if (type === this.VERIFICATION_TYPES.PHONE && check === 'OK') {
        const signInParams = {
          user: params.email,
          user_id: this.userId,
          device_id: params.device_id,
          lang: params.lang,
          token: '',
        };

        const firebaseMessaging = messaging();
        const authStatus = await firebaseMessaging.requestPermission();
        if (
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL
        ) {
          signInParams.token = await firebaseMessaging.getToken();
        }

        usersService.signInAfterRegistration(
          signInParams,
          async (res) => {
            const result = res.split('|');
            if (result[0] === 'OK') {
              const fairArray = result[3].split('/');
              await AsyncStorage.setItem(
                AsyncStorageKey.email,
                params.email.trim(),
              );
              if (parseFloat(fairArray[0]) > params.fair_use_count) {
                await AsyncStorage.setItem(
                  params.email.concat(AsyncStorageKey.fair_use_count),
                  `${fairArray[0]}`,
                );
              }
              await AsyncStorage.setItem(
                AsyncStorageKey.fairUseMaxCount,
                `${fairArray[1]}`,
              );
              await AsyncStorage.setItem(
                AsyncStorageKey.user_id,
                `${result[4]}`,
              );
              await AsyncStorage.setItem(
                AsyncStorageKey.user_status,
                `${result[5]}`,
              );

              await AsyncStorage.setItem(AsyncStorageKey.sessionId, result[1]);
              await AsyncStorage.setItem(
                AsyncStorageKey.language,
                `${global.deviceLocale.split('-')[0]}`,
              );

              menuservice.subscription(
                async (res2) => {
                  const subresult = res2.split('|');

                  /*Don't touch, even if subresult[1]==='NOK' I have to pass user to login page*/
                  const fairArray2 = subresult[2].split('/');
                  const fairMax = parseFloat(fairArray2[1]);
                  await AsyncStorage.setItem(
                    AsyncStorageKey.isSubscribed,
                    `${subresult[0] === 'OK'}`,
                  );
                  await AsyncStorage.setItem(
                    AsyncStorageKey.subscribeDate,
                    JSON.stringify(subresult[1]),
                  );
                  await AsyncStorage.setItem(
                    params.email.concat(AsyncStorageKey.fair_use_count),
                    `${fairArray2[0]}`,
                  );
                  await AsyncStorage.setItem(
                    AsyncStorageKey.fairUseMaxCount,
                    `${fairArray2[1]}`,
                  );

                  if (fairMax === -1) {
                    Toast.show(
                      'The SchoolBright Server has denied the app access',
                    );
                    this.logout();
                    return;
                  }

                  Toast.show('Login succeeded');
                  setTimeout(() => {
                    this.props.navigation.navigate('App');
                  }, 600);
                },
                (error) => {
                  console.log(error);
                },
              );
            } else if (result[0] === 'NOK') {
              Alert.alert(global.__APP_NAME__, result[1]);
            }
          },
          (error) => {
            console.log(error);
          },
        );
      }
    });
  }

  _onChangeEmailCode = (emailCode) => {
    this.emailCode = emailCode;
    this.setState({
      enabledEmailCodeButton: emailCode && emailCode.length === maxLength,
    });
  };

  _onChangeSmsCode = (smsCode) => {
    this.smsCode = smsCode;
    this.setState({
      enabledSmsCodeButton: smsCode && smsCode.length === maxLength,
    });
  };

  _onChangeTelno = (telno) => {
    if (this.state.telno?.length > telno?.length) {
      this.setState({telno, telValid: false});
      return;
    }
    if (this.state.telValid && this.state.telno?.length < telno?.length) {
      return;
    }

    const {countryCode} = this.state;
    const typePhone = new AsYouType(countryCode).input(telno);
    const phoneNumber = parsePhoneNumberFromString(telno, countryCode);
    let isPhoneNoValid = false;
    if (phoneNumber) {
      isPhoneNoValid = phoneNumber.isValid();
    }
    if (typePhone) {
      this.setState({telno: typePhone, telValid: isPhoneNoValid});
    }
  };

  onSelect = (country) => {
    this.setState({countryCode: country.cca2, country});
  };

  modalButtonClick = () => {
    this.setState({showModal: false});
  };

  renderTimerWithSubmit = (resendTitle, placeHolderText, type) => {
    return (
      <View>
        <Text
          style={
            this.state.resendButtonDisable
              ? styles.TextStyle
              : styles.TextStyleEnabled
          }
          onPress={() => {
            if (!this.state.resendButtonDisable) {
              this.requestVerificationCode(type);
            }
          }}>
          {resendTitle}
        </Text>
        <Text style={styles.TimerTextStyle}>{this.state.remainingTime}</Text>

        <CustomTextInput
          style={{
            width: '100%',
          }}
          inputWrapperStyle={{
            marginBottom: 5,
            marginVertical: 25,
          }}
          placeholder={placeHolderText}
          placeholderTextColor="#707070"
          maxLength={maxLength}
          onChangeText={
            type === this.VERIFICATION_TYPES.EMAIL
              ? this._onChangeEmailCode
              : this._onChangeSmsCode
          }
          editable={true}
        />
        <View style={{marginTop: 20}}>
          <GradientButton
            label="submit"
            enabled={
              type === this.VERIFICATION_TYPES.EMAIL
                ? this.state.enabledEmailCodeButton
                : this.state.enabledSmsCodeButton
            }
            _onPress={() => {
              this.validateVerificationCode(type);
              this.stopTimer();
            }}
          />
          <Text
            style={{
              textAlign: 'center',
              marginVertical: 10,
              fontStyle: 'italic',
            }}>
            Button will be enabled once a valid{'\n'}code is entered
          </Text>
        </View>
      </View>
    );
  };

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.showModal && this.state.showModal) {
      speak(this.state.modalBody);
      setTimeout(() => this.setState({showModal: false}), 5500);
    }
  }

  render() {
    const {emailAddress, isSendingCode} = this.state;
    return (
      <KeyboardAwareScrollView style={styles.container}>
        <Loader loading={this.state.showIndicator} />
        <Image source={Images.applogo1} style={styles.applogo} />
        <View style={styles.registerForm}>
          <Text style={styles.validateLabel}>Validate</Text>
          <Text style={styles.validateLabelEmail}>{emailAddress}</Text>
          {!this.state.emailValidated &&
            this.renderTimerWithSubmit(
              'Resend Email Code',
              'Enter Email Code',
              this.VERIFICATION_TYPES.EMAIL,
            )}
          {this.state.emailValidated && !this.state.telenoVerifcationPage && (
            <View
              style={{
                marginHorizontal: 60,
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  marginVertical: 15,
                  fontStyle: 'italic',
                }}>
                Please enter your mobile telephone number without your country
                code
              </Text>
              <View style={styles.CountryPicker}>
                <CountryPicker
                  countryCode={this.state.countryCode}
                  withFilter
                  withFlag
                  withCountryNameButton
                  withAlphaFilter
                  withCallingCode
                  withEmoj={false}
                  onSelect={this.onSelect}
                />
                <TextInput
                  inputWrapperStyle={{
                    marginBottom: 5,
                  }}
                  value={this.state.telno}
                  placeholder="Phone Number"
                  placeholderTextColor="#707070"
                  onChangeText={this._onChangeTelno}
                  keyboardType="numeric"
                  returnKeyType="next"
                  style={styles.textInput}
                />
              </View>

              {isSendingCode ? (
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
                <View>
                  <GradientButton
                    label="get telno code"
                    opacity={1}
                    fontSize={12}
                    enabled={this.state.telValid}
                    width={90}
                    _onPress={() => {
                      this.requestVerificationCode(
                        this.VERIFICATION_TYPES.PHONE,
                      );
                      this.setState({isSendingCode: true});
                    }}
                  />
                  <Text
                    style={{
                      textAlign: 'center',
                      marginVertical: 10,
                      fontStyle: 'italic',
                    }}>
                    Button will be enabled once a valid{'\n'}telno is entered
                  </Text>
                </View>
              )}
            </View>
          )}

          {this.state.emailValidated &&
            this.state.telenoVerifcationPage &&
            this.renderTimerWithSubmit(
              'Resend Telno Code',
              'Enter Telno Code',
              this.VERIFICATION_TYPES.PHONE,
            )}

          <View style={{marginTop: 20}}>
            <GradientButton
              label="back"
              _onPress={() => {
                this.state.emailValidated
                  ? this.props.navigation.navigate('Login')
                  : this.props.navigation.goBack(null);
              }}
            />
          </View>
        </View>
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
                <Image source={Images.gallery_icon} style={styles.modalLogo} />
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
                <GradientSmallButton
                  label={this.state.modalButton}
                  opacity={1}
                  _onPress={() => this.modalButtonClick()}
                />
              </View>
            </View>
          </View>
        </Modal>
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
  },
  registerForm: {
    marginTop: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  validateLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 10,
  },
  validateLabelEmail: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#707070',
    marginBottom: 15,
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
  TextStyle: {
    textAlign: 'center',
    fontSize: 15,
    textDecorationLine: 'underline',
    marginTop: 30,
    fontWeight: 'bold',
    color: '#707070',
  },
  TextStyleEnabled: {
    textAlign: 'center',
    fontSize: 15,
    textDecorationLine: 'underline',
    marginTop: 30,
    fontWeight: 'bold',
  },
  TimerTextStyle: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
    color: '#707070',
  },
  CountryPicker: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderWidth: 1,
    paddingStart: 8,
    borderColor: '#A0A0A0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 5,
  },
  textInput: {
    fontSize: 16,
    color: '#000',
    fontWeight: '400',
    width: 150,
  },
});
