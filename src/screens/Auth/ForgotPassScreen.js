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
import CustomRadioButtonObj from "../../components/CustomRadioButtonObj";
import StorageManager from "../../managers/StorageManager";

export default class ForgotpassScreen extends ValidationComponent {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalBody: '',
      modalHeader: 'SchoolBright',
      modalButton: `${translang.t('COMMON_ok')}`,
      isSetPassword: false,

      selectedSchool: null,
      userName: "",
      showSchoolModal: false,
      isSentSuccess: false,
      type: 0,
    };
    this.backhandler = null;
  }

  modalButtonClick = () => {
    this.setState({showModal: false}, ()=>{
      if(this.state.isSentSuccess){
        const parentRoute = this.state.type ? 'App': 'Login';
        this.props.navigation.navigate(parentRoute);
      }
    });
  };

  _back = () => {
    const parentRoute = this.state.type ? 'App': 'Login';
    this.props.navigation.navigate(parentRoute);
  };

  componentDidMount() {
    const type = this.props.navigation.getParam('type') ?? 0;
    this.setState({type: type});
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', () => {
      this.props.navigation.navigate('Forgot');
      return true;
    });
  }
  componentDidUpdate(prevProps, prevState) {

  }

  resetPassword = async () => {
    const {selectedSchool, userName} = this.state;

    if (selectedSchool == null) {
      this.setState({ showModal: true, modalBody: translang.t('HOME_msg_selectschool') });
      return;
    } else if (userName == "" || userName == null ) {
      this.setState({ showModal: true, modalBody: translang.t('HOME_msg_username') });
      return;
    }

    this.setState({ isSetPassword: true });
    ApiManager.forgotPassword(selectedSchool.SchoolID, userName).then(data => {
      console.log("forgot password:", data);
      if(data.resCode == 200){
        let resObj = data.resObj;
        resObj = {...resObj, schoolID:selectedSchool.SchoolID};
        StorageManager.setRecoveryUserInfo({SchoolID:selectedSchool.SchoolID, ID:resObj.UserID});  //userInfo.SchoolID, userInfo.ID
        this.setState({isSetPassword: false});
        this.props.navigation.navigate('ForgotpassLink', {type: this.state.type, resObj: resObj});
      }else{
        const msg = (getCurrentLocale() == 'en') ? data.resDescEN : data.resDescTH;
        this.setState({ showModal: true, modalBody: msg, isSetPassword: false, isSentSuccess: false });
      }
    }).catch(error => {
      console.log(error);
      const msg = translang.t('INCORRECT_USERNAME_PWD') + '\n' + translang.t('CONTACT_YOUER_SCHOOL_ADMIN');
      this.setState({ showModal: true, modalBody: msg, isSetPassword: false, isSentSuccess: false, });
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

  render() {

    const { selectedSchool, userName } = this.state;
    let schoolname = '';
    if (selectedSchool != null) {
      schoolname = selectedSchool.name;
    }

    return (
      <SafeAreaView style={styles.container}>
        <BackNavigationBar
          title={translang.t('HOME_forgot')}
          onMenuTap={() => this._back()}
        />

        <KeyboardAwareScrollView style={styles.container}>
          <View style={styles.appimage}>
            <Image source={Images.n_applogo_logo} style={styles.appLogo} resizeMode='contain' />
          </View>

          <Text style={{fontSize: 25, fontWeight: 'bold', color: Color.n_default_gray, marginLeft: 40, marginTop: 50,}}>{translang.t('HOME_school')}</Text>
          <TouchableOpacity style={{  }} onPress={this._onChangeSchool}>
            <CustomTextInput
              inputStyle={{
                borderWidth: 0,
                borderBottomWidth: 0,
                borderColor: Color.n_default_brown,
                fontSize: 27
              }}
              inputWrapperStyle={{
                marginBottom: 25,
                marginHorizontal: 35,
                borderColor: Color.n_default_brown,
                borderBottomWidth: 1,
              }}
              notouch="true"
              value={schoolname}
              placeholder={translang.t('HOME_school')}
              placeholderTextColor={Color.n_text_placeholder_gray}
            />
          </TouchableOpacity>
          <Text style={{fontSize: 25, fontWeight: 'bold', color: Color.n_default_gray, marginLeft: 40, marginTop: 30,}}>{translang.t('HOME_USER_NAME')}</Text>
          <CustomTextInput
            inputStyle={{
              borderWidth: 0,
              borderBottomWidth: 0,
              borderColor: Color.n_default_brown,
              fontSize: 27
            }}
            inputWrapperStyle={{
              marginBottom: 25,
              marginHorizontal: 35,
              borderColor: Color.n_default_brown,
              borderBottomWidth: 1,
            }}
            disableMultiline={true}
            value={userName}
            placeholder={translang.t('LOGIN_STUDENTID')}
            placeholderTextColor={Color.n_text_placeholder_gray}
            onChangeText={this._onChangeUserName}
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
            image={Images.alert_inbox}
            title={this.state.modalHeader}
            message={this.state.modalBody}
            buttonColors={[Color.red_orange, Color.soft_red]}
            isVerticalGradient={false}
            onClose={() => { this.modalButtonClick()}}
          />
          <SchoolModal
            isVisible={this.state.showSchoolModal}
            header={translang.t('HOME_searchschool')}
            positiveText={translang.t('HOME_close')}
            onSchoolSelect={this.onSchoolSelect}
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
