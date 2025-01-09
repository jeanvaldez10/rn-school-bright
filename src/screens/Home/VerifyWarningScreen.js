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

import {ScaledSheet} from "react-native-size-matters";

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
import ApiManager from "../../managers/ApiManager";

import StorageManager from '../../managers/StorageManager';
import {StepProgressBar} from 'react-native-step-progress-bar/src';
import Constant from "../../constants/constants";
import {removeUser} from "../../utils/DBManager";
import CheckVerification from "../../components/CheckVerification";


export default class VerifyWarningScreen extends ValidationComponent {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalBody: '',
      modalHeader: null,
      modalImage: Images.alert_inbox,
      modalButton: `${translang.t('COMMON_ok')}`,
      isSetPassword: false,

      selectedSchool: null,
      userName: "",
      showSchoolModal: false,
      currentEmail: "",
      newPassword: "",
      confirmPassword: "",
      logininfo: {},
      code: '',
      verifyInfo: '',

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

    const parentRoute = this.props.navigation.getParam('parent') ?? 'App';
    this.props.navigation.navigate(parentRoute);
  };

  async componentDidMount() {
    const {navigation} = this.props;
    const verifyInfo = await StorageManager.getVerifyInfo();
    this.setState({verifyInfo: verifyInfo});
    this.focusListener = navigation.addListener("didFocus", async () => {
      if (this.backhandler) {
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
      const verifyInfo = await StorageManager.getVerifyInfo();
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

  confirm = async () => {
    await StorageManager.setVerifyFlag(true);
    const user = await StorageManager.getUser();
    const device_verified = await CheckVerification.checkVerificationDevice('token', user.ID, user.SchoolId);
    if(device_verified){
      this.props.navigation.navigate('App');
    }else{
      this.props.navigation.navigate('VerifyDevice', {parent: 'Login'});
    }

  };


  render() {

    const {verifyInfo} = this.state;
    const emailVerify = verifyInfo.emailVerify ?? false;
    const phoneVerify = verifyInfo.phoneVerify ?? false;
    const lineConnect = verifyInfo.lineConnect ?? false;
    const confirmShow = emailVerify || phoneVerify; // || lineConnect;

    return (
      <SafeAreaView style={styles.container}>
        <BackNavigationBar
          backHidden={true}
          style={{elevation: 0}}
          title={translang.t('Warning')}
        />

        <KeyboardAwareScrollView style={styles.container}>
          <View style={{alignItems: 'center', flex: 1}}>
            <View style={{paddingVertical: 20, width: 360}}>
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
                          source={verifyInfo.emailVerify ? Images.ic_verified_email : Images.ic_red_email}
                        />
                      </View>
                    );
                  } else if (index === 1) {
                    return (
                      <View
                        style={styles.stepImage}>
                        <Image
                          style={{width: '100%', height: '100%'}}
                          source={verifyInfo.phoneVerify ? Images.ic_verified_phone : Images.ic_red_phone}
                        />
                      </View>
                    );
                  } else if (index === 2) {
                    return (
                      <View
                        style={styles.stepImage}>
                        <Image
                          style={{width: '100%', height: '100%'}}
                          source={verifyInfo.lineConnect ? Images.ic_verified_line : Images.ic_red_line}
                        />
                      </View>
                    );
                  }
                }}
              />
              <View style={styles.appimage}>
                <Image source={Images.ic_warning} style={styles.lineLogo} resizeMode='contain'/>
              </View>
            </View>
          </View>

          <View style={{paddingHorizontal: 32}}>
            <View style={styles.itemContainer}>
              <Image source={verifyInfo.emailVerify ? Images.n_img_complete_green : Images.ic_close_red } style={styles.itemImage} resizeMode='contain'/>
              <Text style={styles.itemText}>{verifyInfo.emailVerify ? translang.t("Email_verification_successful") : translang.t("Email_verification_fail")}</Text>
            </View>
            <View style={styles.itemContainer}>
              <Image source={verifyInfo.phoneVerify ? Images.n_img_complete_green : Images.ic_close_red} style={styles.itemImage} resizeMode='contain'/>
              <Text style={styles.itemText}>{verifyInfo.phoneVerify ? translang.t("Phone_verified_successfully") : translang.t("Not_verified_phone")}</Text>
            </View>

            {/* <View style={styles.itemContainer}>
              <Image source={verifyInfo.lineConnect ? Images.n_img_complete_green : Images.ic_close_red} style={styles.itemImage} resizeMode='contain'/>
              <Text style={styles.itemText}>{verifyInfo.lineConnect ? translang.t("Line_Connection_Succeeded") : translang.t("Not_connected_line")}</Text>
            </View> */}
          </View>


          {confirmShow &&
          <GradientButton
            containerStyle={styles.loginBtn}
            label={translang.t('Ready')}
            colors={[Color.green_button_color]}
            _onPress={() => this.confirm()}
          />
          }

          <GradientButton
            containerStyle={styles.loginBtn}
            label={translang.t('Back')}
            // colors={[Color.green_button_color]}
            _onPress={() => this._back()}
          />

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

        </KeyboardAwareScrollView>
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white
  },
  appLogo: {
    width: '100%',
    height: '100%',
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
    marginTop: 24,
    width: '100%',
    height: 70,
    paddingHorizontal: 50,
  },

  bigText: {
    width: '100%',
    fontSize: 28,
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
    // backgroundColor: ,
  },
  textButton: {
    fontSize: 28,
    borderBottomColor: "#fc8668",
    borderBottomWidth: 1,
    marginTop: 30,
  },
  textButtonContainer: {
    // borderBottomColor: "#fc8668",
    // borderBottomWidth: 1,
    // width: '100%',
  },
  lineLogo: {
    width: '80@vs',
    height: '80@vs',
  },
  appimage: {
    marginVertical: '20@vs',
    width: '100%',
    alignItems: 'center',
  },
  itemImage: {
    width: 24,
    height: 24
  },
  itemContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems:'center',
    paddingVertical: 10,
  },
  itemText: {
    fontSize: 28,
    marginLeft: 8
  }


});
