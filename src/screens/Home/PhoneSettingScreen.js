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
import CustomEmailInput from '../../components/CustomEmailInput';

import StorageManager from '../../managers/StorageManager';

export default class PhoneSettingScreen extends ValidationComponent {
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
    this.focusListener = navigation.addListener("didFocus", async () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const logininfo = await StorageManager.getUser();
      this.setState({logininfo: logininfo});
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

  changeEmail = async () => {
    const {currentEmail} = this.state;
    //
    // if (currentEmail == null || currentEmail == "") {
    //   this.setState({ showModal: true, modalBody: translang.t('INPUT_VALID_EMAIL') });
    //   return;
    // }
    this.setState({showModal: true, modalBody: translang.t('Information_Updated'), modalImage: Images.n_img_complete_green });

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


  _onChangecurrentEmail = (text) => {
    this.setState({ currentEmail: text });
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
          title={translang.t('Phone_Setting')}
          onMenuTap={() => this._back()}
        />

        <KeyboardAwareScrollView style={styles.container}>
          <View style={styles.appimage}>
            <Image source={Images.n_applogo_logo} style={styles.appLogo} resizeMode='contain' />
          </View>

          <Text style={{fontSize: 25, fontWeight: 'bold', color: Color.n_default_gray, marginLeft: 40, marginTop: 40,}}>{translang.t('Current_Phone')}</Text>
          <CustomEmailInput
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
            value={this.state.currentEmail}
            placeholder={'091-234-5678'}
            placeholderTextColor={Color.n_text_placeholder_gray}
            // secureTextEntry={true}
            onChangeText={this._onChangecurrentEmail}
            iconPress={this.changePwdType}
          />

          <View style={{height:100}}/>

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
              _onPress={() => this.changeEmail()}
            />
          )}
          <AlertWithImageModal
            isVisible={this.state.showModal}
            image={this.state.modalImage}
            title={this.state.modalHeader}
            message={this.state.modalBody}
            buttonColors={[Color.green_button_color]}
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
