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

export default class VerifyDeviceSuccessScreen extends ValidationComponent {
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
      const type = this.props.navigation.getParam('type') ?? 0;

      const user = await Storage.getUserInfo();
      await CheckVerification.checkVerification(user.SchoolID, user.ID);
      await this.setState({type: type});
      await this.setState({verifyInfo: await Storage.getVerifyInfo()});
      console.log("verification Info:", this.state.verifyInfo);
      if (this.backhandler) {
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
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
      this.props.navigation.navigate('App');
   };

  render() {

    const {type, verifyInfo} = this.state;

    return (
      <SafeAreaView style={styles.container}>
        <View style={{...styles.container}}>
          <View style={{alignItems: 'center', flex: 1, height:'100%', justifyContent: 'center', alignContent: 'center'}}>
            <View style={{paddingVertical: 50, width: 360}}>
              <View style={styles.appimage}>
                <Image source={Images.n_img_complete_green} style={styles.lineLogo} resizeMode='contain'/>
              </View>

              <View style={styles.titleContainer}>
                <Text style={styles.bigText}>{translang.t('Confirm_Success')}</Text>
              </View>
            </View>
            <GradientButton
              containerStyle={styles.loginBtn}
              label={translang.t('HOME_close')}
              colors={[Color.green_button_color]}
              _onPress={() => this.confirm()}
            />
          </View>



        </View>
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
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
    width: 300,
    height: 70,
    marginBottom: 100
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
    width: '100%',
    alignItems: 'center',
  },

});
