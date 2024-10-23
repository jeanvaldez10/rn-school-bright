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
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import SchoolModal from '../../components/SchoolModal';
import ApiManager from "../../managers/ApiManager";
import CustomPassInput from '../../components/CustomPassInput';
import StorageManager from '../../managers/StorageManager';
import Storage from '../../managers/StorageManager';
import {removeUser} from "../../utils/DBManager";
import Constant from "../../constants/constants";


export default class UpdatePassScreen extends ValidationComponent {
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
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
      loginInfo: {},
    };
    this.backhandler = null;
  }

  modalButtonClick = () => {
    if(this.state.modalBody == translang.t('PASSWORD_CHANGED_LOGIN_AGAIN')){
      this.setState({showModal: false}, ()=>{
        this.props.navigation.navigate('Login');
      });
    }else{
      this.setState({showModal: false});
    }

  };

  _back = async () => {
    // this.props.navigation.navigate('App');
    const parentRoute = this.props.navigation.getParam('parent') ?? 'App';
    const prevUser = await Storage.getPrevUser();
    const prevUserInfo = await Storage.getPrevUserInfo();
    if(prevUser && prevUserInfo){
      const userId = this.state.loginInfo.ID;
      removeUser(userId).then();    //have some problem, we have to userid from the response of this api
      await Storage.removeUser().then();
      await Storage.removeUserInfo().then();
      await Storage.setUser(prevUser);
      await Storage.setUserInfo(prevUserInfo);
      Constant.AddProfiles = Constant.AddProfiles.filter(item => item.userid != userId);
      this.props.navigation.navigate('SettingAddAccount');
    }else{
      this.props.navigation.navigate(parentRoute);
    }

  };

  async componentDidMount() {
    console.log(" change password");
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return true;
    });

    const loginInfo = await StorageManager.getUser();
    this.setState({loginInfo: loginInfo});
  }
  componentDidUpdate(prevProps, prevState) {

  }

  resetPassword = async () => {
    const {confirmPassword, newPassword} = this.state;

    if (newPassword == null || newPassword == "") {
      this.setState({ showModal: true, modalBody: translang.t('HOME_msg_password') });
      return;
    }
    if (newPassword != confirmPassword) {
      this.setState({ showModal: true, modalBody: translang.t('Password_not_match') });
      return;
    }

    this.setState({ isSetPassword: true });
    ApiManager.resetPassword(this.state.loginInfo.ID, this.state.loginInfo.token, newPassword).then(data => {
      if(data.resCode == 200){
        this.setState({isSetPassword: false, showModal: true, modalBody: translang.t('PASSWORD_CHANGED_LOGIN_AGAIN'), modalImage: Images.n_img_complete_green, modalButtonStyle: 'green' });
      }else{
        this.setState({ showModal: true, modalBody: data.resDesc, isSetPassword: false });
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

  _onChangeUserName = (userName) => {
    this.setState({ userName: userName });
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

          <Text style={{fontSize: 25, fontWeight: 'bold', color: Color.n_default_gray, marginLeft: 40, marginTop: 50,}}>{translang.t('NEW_PASSWORD')}</Text>
          <CustomPassInput
            inputStyle={{
              borderWidth: 0,
              borderBottomWidth: 0,
              borderColor: Color.n_default_brown,
              fontSize: 27,
            }}
            inputWrapperStyle={{
              marginBottom: 25,
              marginHorizontal: 35,
            }}
            value={this.state.newPassword}
            placeholder={translang.t('HOME_msg_password')}
            placeholderTextColor={Color.n_text_placeholder_gray}
            secureTextEntry={false}
            onChangeText={this._onChangePassword}
            iconPress={this.changePwdType}
          />
          <Text style={{fontSize: 25, fontWeight: 'bold', color: Color.n_default_gray, marginLeft: 40, marginTop: 30,}}>{translang.t('RETYPE_NEW_PASSWORD')}</Text>
          <CustomPassInput
            inputStyle={{
              borderWidth: 0,
              borderBottomWidth: 0,
              borderColor: Color.n_default_brown,
              fontSize: 27,
            }}
            inputWrapperStyle={{
              marginBottom: 25,
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
