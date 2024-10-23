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
import translang, {getCurrentLocale} from '../../utils/language.utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import SchoolModal from '../../components/SchoolModal';
import ApiManager from "../../managers/ApiManager";
import CustomPassInput from '../../components/CustomPassInput';
import StorageManager from '../../managers/StorageManager';

export default class SettingUpdatePassScreen extends ValidationComponent {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalBody: '',
      modalHeader: 'SchoolBright',
      modalButton: `${translang.t('COMMON_ok')}`,
      modalImage: Images.alert_inbox,
      modalButtonStyle: 'alert',
      isSetPassword: false,

      selectedSchool: null,
      userName: "",
      showSchoolModal: false,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      logininfo: {},
      devInfo: {},
    };
  }
  handleBackButton = () => {
    this._back();
    return true;
  };

  modalButtonClick = () => {
    if(this.state.modalBody == translang.t('PASSWORD_CHANGED_LOGIN_AGAIN')){
      this.setState({showModal: false}, ()=>{
        this.props.navigation.navigate('Login');
      });
    }else{
      this.setState({showModal: false});
    }
    // this.props.navigation.navigate('Login');
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
    console.log(" setting change password");
    this.focusListener = navigation.addListener("didFocus", async () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const logininfo = await StorageManager.getUser();
      const devInfo = await StorageManager.getDeviceInfo();
      console.log(devInfo);
      this.setState({logininfo: logininfo, devInfo: devInfo});
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

  resetPassword = async () => {
    const {confirmPassword, newPassword, currentPassword} = this.state;

    if (currentPassword == null || currentPassword == "") {
      this.setState({ showModal: true, modalBody: translang.t('HOME_msg_password') });
      return;
    }

    if (newPassword == null || newPassword == "") {
      this.setState({ showModal: true, modalBody: translang.t('HOME_msg_password') });
      return;
    }
    if (newPassword != confirmPassword) {
      this.setState({ showModal: true, modalBody: translang.t('Password_not_match') });
      return;
    }

    this.setState({ isSetPassword: true });
    ApiManager.resetPasswordWithOld(this.state.logininfo.ID, this.state.logininfo.token, newPassword, currentPassword).then(data => {
      console.log("data:", data);
      if(data.resCode == 200){
        this.setState({isSetPassword: false, showModal: true, modalBody: translang.t('PASSWORD_CHANGED_LOGIN_AGAIN'), modalImage: Images.n_img_complete_green, modalButtonStyle: 'green'});
      }else{
        this.setState({ showModal: true, modalBody: (getCurrentLocale() == 'en') ? data.resDescEN : data.resDescTH, isSetPassword: false });
      }
    }).catch(error => {
      console.log(error);
      const msg = translang.t('CONTACT_YOUER_SCHOOL_ADMIN');
      this.setState({ showModal: true, modalBody: msg, isSetPassword: false });
    });
  };

  _onChangeSchool = () => {
    this.setState({
      showSchoolModal: true,
    });
  };
  onSchoolSelect = (item) => {
    if (item == null) {
      this.setState({ showSchoolModal: false })
    } else {
      this.setState({ showSchoolModal: false, selectedSchool: item })
    }
  };


  _onChangeCurrentPassword = (text) => {
    this.setState({ currentPassword: text });
  };
  _onChangePassword = (text) => {
    this.setState({ newPassword: text });
  };
  _onChangeConfrimPassword = (text) => {
    this.setState({ confirmPassword: text });
  };
  render() {

    const { selectedSchool, userName } = this.state;
    let schoolname = '';
    if (selectedSchool != null) {
      schoolname = selectedSchool.name;
    }

    return (
      <SafeAreaView style={styles.container}>
        <BackNavigationBar
          title={translang.t('CHANGE_PASSWORD')}
          onMenuTap={() => this._back()}
        />

        <KeyboardAwareScrollView style={styles.container}>
          <View style={styles.appimage}>
            <Image source={Images.n_applogo_logo} style={styles.appLogo} resizeMode='contain' />
          </View>

          <Text style={{fontSize: 25, fontWeight: 'bold', color: Color.n_default_gray, marginLeft: 40, marginTop: 40,}}>{translang.t('CURRENT_PASSWORD')}</Text>
          <CustomPassInput
            inputStyle={{
              borderWidth: 0,
              borderBottomWidth: 0,
              borderColor: Color.n_default_brown,
              fontSize: 27,
            }}
            inputWrapperStyle={{
              marginBottom: 15,
              marginHorizontal: 35,
            }}
            value={this.state.currentPassword}
            placeholder={translang.t('HOME_msg_password')}
            placeholderTextColor={Color.n_text_placeholder_gray}
            secureTextEntry={false}
            onChangeText={this._onChangeCurrentPassword}
            iconPress={this.changePwdType}
          />

          <Text style={{fontSize: 25, fontWeight: 'bold', color: Color.n_default_gray, marginLeft: 40, marginTop: 10,}}>{translang.t('NEW_PASSWORD')}</Text>
          <CustomPassInput
            inputStyle={{
              borderWidth: 0,
              borderBottomWidth: 0,
              borderColor: Color.n_default_brown,
              fontSize: 27,
            }}
            inputWrapperStyle={{
              marginBottom: 15,
              marginHorizontal: 35,
            }}
            value={this.state.newPassword}
            placeholder={translang.t('HOME_msg_password')}
            placeholderTextColor={Color.n_text_placeholder_gray}
            secureTextEntry={false}
            onChangeText={this._onChangePassword}
            iconPress={this.changePwdType}
          />
          <Text style={{fontSize: 25, fontWeight: 'bold', color: Color.n_default_gray, marginLeft: 40, marginTop: 10,}}>{translang.t('RETYPE_NEW_PASSWORD')}</Text>
          <CustomPassInput
            inputStyle={{
              borderWidth: 0,
              borderBottomWidth: 0,
              borderColor: Color.n_default_brown,
              fontSize: 27,
            }}
            inputWrapperStyle={{
              marginBottom: 15,
              marginHorizontal: 35,
            }}
            value={this.state.confirmPassword}
            placeholder={translang.t('HOME_msg_password')}
            placeholderTextColor={Color.n_text_placeholder_gray}
            secureTextEntry={false}
            onChangeText={this._onChangeConfrimPassword}
            iconPress={this.changePwdType}
          />

          {this.state.isSetPassword ? (
          <View style={styles.BtnContainer}>
            <LinearGradient
              colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
              start={{x: 0, y: 1}}
              end={{x: 1, y: 0}}
              style={styles.loginBtnBackground}>
              <ActivityIndicator color={Color.white} />
            </LinearGradient>
          </View>
        ) : (
            <GradientButton
              containerStyle={styles.loginBtn}
              label={translang.t('COMMON_confirm')}
              _onPress={() => this.resetPassword()}
            />
          )}
          <AlertWithImageModal
            isVisible={this.state.showModal}
            image={this.state.modalImage}
            title={this.state.modalHeader}
            message={this.state.modalBody}
            buttonColors={this.state.modalButtonStyle == 'green' ? [Color.green_button_next_color1, Color.green_button_next_color2] : [Color.red_orange, Color.soft_red]}
            isVerticalGradient={false}
            onClose={() => { this.modalButtonClick()}}
          />


        </KeyboardAwareScrollView>
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

});
