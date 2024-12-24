import React from 'react';
import {
  View,
  Text,
  Image,
  BackHandler,
} from 'react-native';

import {ScaledSheet} from "react-native-size-matters";

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import GradientButton from '../../components/GradientButton';
import ValidationComponent from 'react-native-form-validator';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import translang from '../../utils/language.utils';
import {SafeAreaView} from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import {StepProgressBar} from 'react-native-step-progress-bar/src';
import Storage from '../../managers/StorageManager';
import CheckVerification from "../../components/CheckVerification";
import arrayWithHoles from "@babel/runtime/helpers/esm/arrayWithHoles";

export default class VerifyEmailSuccessScreen extends ValidationComponent {
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
    if (this.backhandler) {
      this.backhandler.remove();
    }

    const parentRoute = this.props.navigation.getParam('parent') ?? 'App';
    this.props.navigation.navigate(parentRoute);
  };

  async componentDidMount() {
    const {navigation} = this.props;
    const type = this.props.navigation.getParam('type') ?? 0;
    this.setState({type: type});

    this.focusListener = navigation.addListener("didFocus", async () => {
      const user = await Storage.getUserInfo();
      if(type !== 2){
        await CheckVerification.checkVerification(user.SchoolID, user.ID);
      }

      await this.setState({verifyInfo: await Storage.getVerifyInfo()});
      console.log("verification Info:", this.state.verifyInfo);
      if (this.backhandler) {
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    });

    // this.willFocusSubscription = this.props.navigation.addListener(
    //   'willFocus',
    //   async () => {
    //     const type = this.props.navigation.getParam('type') ?? 0;
    //     await this.setState({type: type});
    //     await this.setState({verifyInfo: await Storage.getVerifyInfo()});
    //     console.log("verification Info:", this.state.verifyInfo);
    //   }
    // );


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
    if (this.state.type == 0) {
      this.props.navigation.navigate('VerifyPhoneInput', {parent: 'VerifyEmailInput', type: 0});
    } else if (this.state.type == 2) {
      this.props.navigation.navigate('VerifyIdentify', {parent: 'VerifyEmailInput', type: 2});
    } else {
      this.props.navigation.navigate('SecuritySetting', {parent: 'Setting'});
    }
  };


  render() {

    const {type, verifyInfo} = this.state;

    return (
      <SafeAreaView style={styles.container}>
        {type == 0 &&
        <BackNavigationBar
          style={{elevation: 0}}
          title={translang.t('Step') + "  2"}
          onMenuTap={() => this._back()}
          backHidden={true}
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
                barLength={70}
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
                          source={Images.ic_verified_email}
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
              <View style={styles.appimage}>
                <Image source={Images.n_img_complete_green} style={styles.lineLogo} resizeMode='contain'/>
              </View>

              <View style={styles.titleContainer}>
                <Text
                  style={styles.bigText}>{type === 2 ? translang.t('Confirm_Success') : translang.t('Email_verification_successful')}</Text>
              </View>
            </View>
          </View>

          <GradientButton
            containerStyle={styles.loginBtn}
            label={(type == 0 || type == 2) ? translang.t('COMMON_next') : translang.t('Closed')}
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
