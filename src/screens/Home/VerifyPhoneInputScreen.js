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
import {SafeAreaView} from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import SchoolModal from '../../components/SchoolModal';
import ApiManager from "../../managers/ApiManager";
import CustomPassInput from '../../components/CustomPassInput';
import CustomEmailInput from '../../components/CustomEmailInput';

import {StepProgressBar} from 'react-native-step-progress-bar/src';
import ProgressHud from "../../components/ProgressHud";
import Storage from '../../managers/StorageManager';
import moment from 'moment';
import {constructStyles} from "react-native-render-html";

export default class VerifyPhoneInputScreen extends ValidationComponent {
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
      phoneNumber: "",
      newPassword: "",
      confirmPassword: "",
      type: 0,
      userInfo: {},
      isLoading: false,
      verifyInfo: {},
      confirmEdit: false,
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
    if (this.backhandler) {
      this.backhandler.remove();
    }
    const parentRoute = this.props.navigation.getParam('parent') ?? 'VerifyStart';
    this.props.navigation.navigate(parentRoute);
  };

  async componentDidMount() {
    const {navigation} = this.props;
    const type = this.props.navigation.getParam('type') ?? 0;
    this.setState({type: type});

    this.focusListener = navigation.addListener("didFocus", async () => {
      console.log("VerifyPhoneInput");
      if (this.backhandler) {
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const type = this.props.navigation.getParam('type') ?? 0;
      this.setState({type: type});
      const user = await Storage.getUserInfo();
      this.setState({userInfo: user});
      const verifyInfo = await Storage.getVerifyInfo();
      this.setState({phoneNumber: verifyInfo.phone ?? ''});
      this.setState({verifyInfo: verifyInfo});
    });

  }

  componentWillUnmount = () => {
    if (this.backhandler) {
      this.backhandler.remove();
    }
    if (this.focusListener) {
      this.focusListener.remove();
    }
  };

  getCode = async () => {
    const {phoneNumber, userInfo, type, verifyInfo,confirmEdit} = this.state;

    if (verifyInfo.phoneVerify && type !==2 && !confirmEdit) {
      this.setState({confirmEdit: true});
      return;
    }


    if (!phoneNumber || phoneNumber == '') {
      this.setState({showModal: true, modalBody: translang.t('Input_Valid_Phone')});
      return;
    }

    this.setState({isLoading: true});
    const res = await ApiManager.requestOTP(userInfo.SchoolID, userInfo.ID, 'phone', phoneNumber, phoneNumber);
    this.setState({isLoading: false});
    if (res.statusCode == 200) {
      if (res.result.code == 100) {
        this.props.navigation.navigate('VerifyPhoneCode', {
          parent: 'VerifyPhoneInput',
          type: type,
          requestCode: res.result.requestCode,
          phone: phoneNumber
        });
      } else if (res.result.code == 103) {
        this.setState({showModal: true, modalBody: translang.t('Token_exist_phone'), isLoading: false});
      } else if (res.result.code == 108) {
        this.setState({showModal: true, modalBody: translang.t('Phone_verified_already'), isLoading: false});
      } else {
        this.setState({showModal: true, modalBody: translang.t('Input_Valid_Phone'), isLoading: false});
      }
    }
  };

  skip = () => {
    this.props.navigation.navigate('VerifyWarning', {parent: 'VerifyPhoneInput'});
  };

  _onChangephoneNumber = (text) => {
    this.setState({phoneNumber: text});
  };

  render() {
    const {type, verifyInfo, phoneNumber, confirmEdit} = this.state;
    let phoneNumberEnable = true;
    if (isNaN(phoneNumber)) {
      phoneNumberEnable = false;
    } else {
      if (phoneNumber.length == 10) {
        phoneNumberEnable = true;
      }
      else{
        phoneNumberEnable = false;
      }
    }

    return (
      <SafeAreaView style={styles.container}>
        {type == 0 &&
        <BackNavigationBar
          style={{elevation: 0}}
          title={translang.t('Step') + "  3"}
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
          <View style={{alignItems: 'center', flex: 1}}>
            <View style={{paddingVertical: 20, width: 360}}>
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
                          source={verifyInfo.emailVerify ? Images.ic_verified_email : Images.ic_grey_email}
                        />
                      </View>
                    );
                  } else if (index === 1) {
                    return (
                      <View
                        style={styles.stepImage}>
                        <Image
                          style={{width: '100%', height: '100%'}}
                          source={verifyInfo.phoneVerify ? Images.ic_verified_phone : Images.ic_active_phone}
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
            <Image source={Images.n_applogo_logo} style={styles.appLogo} resizeMode='contain'/>
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.bigText}>{translang.t('Enter_phone')}</Text>
          </View>

          <CustomEmailInput
            inputStyle={{
              borderWidth: 0,
              borderBottomWidth: 0,
              borderColor: Color.n_default_brown,
              fontSize: 27,
            }}
            inputWrapperStyle={{
              marginTop: 30,
              marginVertical: 0,
              marginHorizontal: 40,
            }}
            value={this.state.phoneNumber}
            placeholder={translang.t('Phone_input_placeholder')}
            placeholderTextColor={Color.n_text_placeholder_gray}
            onChangeText={this._onChangephoneNumber}
            iconPress={this.changePwdType}
            editable={(verifyInfo.phoneVerify && type !==2 && !confirmEdit ) ? false : true}
          />
          <Text style={{marginHorizontal: 40, fontSize: 22, color:Color.custom_highlight_red}}>{translang.t("Example")} 091xxxxxxx</Text>

          {!confirmEdit &&
          <GradientButton
              enabled={phoneNumberEnable}
              disableColors={[Color.n_disable_button, Color.n_disable_button]}
              containerStyle={styles.loginBtn}
              label={verifyInfo.phoneVerify ? translang.t('EDIT') : translang.t('Get_Verification_Code')}
              _onPress={() => this.getCode()}
          />
          }
          {confirmEdit &&
          <GradientButton
              enabled={phoneNumberEnable}
              disableColors={[Color.n_disable_button, Color.n_disable_button]}
              containerStyle={styles.loginBtn}
              label={translang.t('Confirm_Edit')}
              _onPress={() => this.getCode()}
          />
          }


        </KeyboardAwareScrollView>
        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={this.state.modalImage}
          title={this.state.modalHeader}
          message={this.state.modalBody}
          buttonColors={[Color.green_button_color]}
          isVerticalGradient={false}
          buttonTitle={translang.t("HOME_close")}
          onClose={() => {
            this.modalButtonClick()
          }}
        />
        <ProgressHud isVisible={this.state.isLoading}/>

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

  }

});
