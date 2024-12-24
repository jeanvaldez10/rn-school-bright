import React from 'react';
import {
  View,
  Image,
  BackHandler,
  Linking
} from 'react-native';

import {ScaledSheet} from "react-native-size-matters";

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import GradientButton from '../../components/GradientButton';
import ValidationComponent from 'react-native-form-validator';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import translang from '../../utils/language.utils';
import {SafeAreaView} from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import ApiManager from "../../managers/ApiManager";

import Storage from '../../managers/StorageManager';
import {StepProgressBar} from 'react-native-step-progress-bar/src';
import NavigationService from "../../NavigationService";


export default class VerifyLineConnectScreen extends ValidationComponent {
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
      userInfo: {},
      code: '',
      verifyInfo: '',
      type: 0,
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
    const type = this.props.navigation.getParam('type') ?? 1;
    console.log("Line connect type:", type);
    this.setState({type:type});
    this.focusListener = navigation.addListener("didFocus", async () => {
      if (this.backhandler) {
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const verifyInfo = await Storage.getVerifyInfo();
      const user = await Storage.getUserInfo();
      const type = this.props.navigation.getParam('type') ?? 0;
      this.setState({userInfo: user, type:type, verifyInfo: verifyInfo});

      const _this = this;

      this.linkhander = Linking.addEventListener('url', e => {
        _this._handleDeeplink(e.url)
      });

    });

  }


  _handleDeeplink(url) {
    console.log("deep link:", url);
    if (url.includes('sbapp://drawers/linesuccess/')) {
      this.props.navigation.navigate('VerifyLineSuccess');
    }
    else if (url.includes('sbapp://main/app/')) {
      this.props.navigation.navigate('Timetable');
    }
  }

  componentWillUnmount = () => {
    if (this.backhandler) {
      this.backhandler.remove();
    }
    if (this.focusListener) {
      this.focusListener.remove();
    }

    if (this.linkhander) {
      this.linkhander.remove();
    }
  };

  next = async () => {
    const {userInfo} = this.state;
    const res = await ApiManager.GetLineConnectUrl(userInfo.SchoolID, userInfo.ID);
    if (res.statusCode == 200) {
      if (res.result.code == 100 || res.result.code == 107) {
        // this.props.navigation.navigate('LineAgree', {parent: 'VerifyLineConnect', type: type, url: res.result.url});
        Storage.setLineConnectionType(this.state.type);
        await Linking.openURL(res.result.url);
      }
    }
  };

  skip = () => {
    this.props.navigation.navigate('VerifyWarning', {parent: 'VerifyLineConnect'});
  };

  render() {

    const {verifyInfo, type} = this.state;
    return (
      <SafeAreaView style={styles.container}>
        {type == 0 &&
        <BackNavigationBar
          style={{elevation: 0}}
          title={translang.t('Step') + "  5"}
          is_skip={true}
          onPressSkip={() => {
            this.skip();
          }}
          onMenuTap={() => this._back()}
        />
        }
        {type == 1 &&
        <BackNavigationBar
          title={''}
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
                          source={verifyInfo.lineConnect ? Images.ic_verified_line : Images.ic_active_line}
                        />
                      </View>
                    );
                  }
                }}
              />
              }
              <View style={styles.appimage}>
                <Image source={Images.line_logo} style={styles.lineLogo} resizeMode='contain'/>
              </View>
            </View>
          </View>

          <GradientButton
            containerStyle={styles.loginBtn}
            label={translang.t('Line_Connect')}
            colors={[Color.green_button_color]}
            _onPress={() => this.next()}
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
    width: '100@vs',
    height: '100@vs',
  },
  appimage: {
    marginVertical: '50@vs',
    width: '100%',
    alignItems: 'center',
  },

});
