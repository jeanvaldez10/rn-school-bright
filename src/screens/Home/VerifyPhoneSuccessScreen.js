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
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import ApiManager from "../../managers/ApiManager";

import Storage from '../../managers/StorageManager';
import {StepProgressBar} from 'react-native-step-progress-bar/src';
import CheckVerification from "../../components/CheckVerification";


export default class VerifyPhoneSuccessScreen extends ValidationComponent {
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
      type: 0,
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

      const user = await Storage.getUserInfo();
      await CheckVerification.checkVerification(user.SchoolID, user.ID);

      this.setState({verifyInfo: await Storage.getVerifyInfo()});
      console.log("here: ", this.state.verifyInfo);
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
    if(this.state.type == 0){
      this.props.navigation.navigate('VerifyWarning', {parent: 'VerifyPhoneInput'});
    }else{
      this.props.navigation.navigate('SecuritySetting', {parent: 'Setting'});
    }
  };

  render() {

    const { type, verifyInfo } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        {type == 0 &&
        <BackNavigationBar
          style={{elevation: 0}}
          title={translang.t('Step') + "  4"}
          backHidden={true}
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
                barLength={70}
                barThickeness={2}
                data={[
                  {label: translang.t('SETTING_addEmail')},
                  {label: translang.t('SETTING_EditPhoneNumber')},
                  {label: translang.t('SETTING_Line')},
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
                          source={Images.ic_verified_phone}
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
              <View style={styles.appimage}>
                <Image source={Images.n_img_complete_green} style={styles.lineLogo} resizeMode='contain'/>
              </View>

              <View style={styles.titleContainer}>
                <Text style={styles.bigText}>{translang.t('Phone_verified_successfully')}</Text>
              </View>
            </View>
          </View>

          <GradientButton
            containerStyle={styles.loginBtn}
            label={type == 0 ? translang.t('COMMON_next'): translang.t('Closed')}
            colors={[Color.green_button_color]}
            _onPress={() => this.confirm()}
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
    width: '100%',
    height: 70,
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
  },
  lineLogo: {
    width: '80@vs',
    height: '80@vs',
  },
  appimage: {
    marginTop: '50@vs',
    width: '100%',
    alignItems: 'center',
  },

});
