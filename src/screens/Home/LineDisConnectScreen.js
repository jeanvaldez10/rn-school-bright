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
import AlertWith2ButtonsModal from '../../components/AlertWith2ButtonsModal';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import translang from '../../utils/language.utils';
import {SafeAreaView} from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import ApiManager from "../../managers/ApiManager";

import Storage from '../../managers/StorageManager';
import {StepProgressBar} from 'react-native-step-progress-bar/src';


export default class LineDisConnectScreen extends ValidationComponent {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      showResultModal: false,
      modalBody: `${translang.t('Line_Disconnect_Modal')}`,
      resultModalBody: `${translang.t('Line_disconnect_success')}`,
      modalHeader: null,
      modalImage: Images.n_ic_warning,
      modalButton: `${translang.t('COMMON_ok')}`,
      isSetPassword: false,

      selectedSchool: null,
      userName: "",
      currentEmail: "",
      newPassword: "",
      confirmPassword: "",
      userInfo: {},
      code: '',
      verifyInfo: '',
      showConfirm: true,
      type: 0,
    };
  }

  handleBackButton = () => {
    this._back();
    return true;
  };

  modalButtonClick = async () => {
    const {userInfo} = this.state;
    this.setState({showModal: false});
    const res = await ApiManager.LineDisconnect(userInfo.SchoolID, userInfo.ID);
    console.log("res:", res);
    if (res.statusCode == 200) {
      if (res.result.code == 100 || res.result.code == 102) {
        this.setState({showResultModal: true});
      }else{
        this.setState({showResultModal: true, resultModalBody: res.result.message});
      }
    }


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

  next = async () => {
    this.setState({showModal: true, showConfirm: true});
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
                <View style={styles.appimage}>
                  <Image source={Images.line_logo} style={styles.lineLogo} resizeMode='contain'/>
                </View>
              </View>
            </View>

            <GradientButton
                containerStyle={styles.loginBtn}
                label={translang.t('Line_Disconnect')}
                colors={[Color.n_default_orange, Color.orange_indicator]}
                _onPress={() => this.next()}
            />

            <AlertWith2ButtonsModal
                isVisible={this.state.showModal}
                image={this.state.modalImage}
                message={this.state.modalBody}
                confirmButtonTxt={translang.t('COMMON_confirm')}
                cancelButtonTxt={translang.t('CANCEL')}
                showConfirm={this.state.showConfirm}
                onClose={() => {
                  this.setState({showModal: false})
                }}
                onConfirm={() => {
                  this.modalButtonClick();
                }}
            />

            <AlertWithImageModal
                isVisible={this.state.showResultModal}
                image={Images.n_img_complete_green}
                title={this.state.modalHeader}
                message={this.state.resultModalBody}
                buttonColors={[Color.green_button_color]}
                isVerticalGradient={false}
                buttonTitle={translang.t('Closed')}
                onClose={() => {
                  this.setState({showResultModal: false});
                  this.props.navigation.navigate('SecuritySetting');
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
