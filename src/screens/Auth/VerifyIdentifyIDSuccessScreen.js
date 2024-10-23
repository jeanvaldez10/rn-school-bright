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
      modalButton: `${translang.t('HOME_close')}`,
      isSetPassword: false,

      selectedSchool: null,
      userName: "",
      showSchoolModal: false,
      currentEmail: "",
      newPassword: "",
      confirmPassword: "",
      logininfo: {},
      code: '',
      type: 1,
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

    this.focusListener = navigation.addListener("didFocus", async () => {
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
    const type = await Storage.getRecoveryType();
    const parentRoute = type ? 'SettingAddAccount': 'Login';
    this.props.navigation.navigate(parentRoute);
  };

  render() {
    const {type, verifyInfo} = this.state;

    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView style={styles.container}>
          <View style={{alignItems: 'center', flex: 1}}>
            <View style={{paddingVertical: 20, width: 360}}>
              <View style={styles.appimage}>
                <Image source={Images.n_img_complete_green} style={styles.lineLogo} resizeMode='contain'/>
              </View>

              <View style={styles.titleContainer}>
                <Text
                  style={styles.bigText}>{ translang.t('Verify_ID_Success_Message')}</Text>
              </View>
            </View>
          </View>

          <GradientButton
            containerStyle={styles.loginBtn}
            label={translang.t('HOME_close')}
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
