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
import {StepProgressBar} from "react-native-step-progress-bar/src/StepProgressBar";

export default class EmailSettingScreen extends ValidationComponent {
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

      const email = this.props.navigation.getParam('email');
      if(email){
        this.setState({CurrentEmail: email})
      }
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

    if (currentEmail == null || currentEmail == "") {
      this.setState({ showModal: true, modalBody: translang.t('INPUT_VALID_EMAIL') });
      return;
    }
    // this.setState({showModal: true, modalBody: translang.t('Information_Updated'), modalImage: Images.n_img_complete_green });

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
          title={translang.t('Verify_email')}
          onMenuTap={() => this._back()}
        />

        <KeyboardAwareScrollView style={styles.container}>
          <View style={{ alignItems: 'center', flex:1}}>
            <View style={{ paddingVertical: 20, width: 360}}>
            </View>
          </View>
          <View style={styles.appimage}>
            <Image source={Images.n_applogo_logo} style={styles.appLogo} resizeMode='contain' />
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.bigText}>{translang.t('Enter_Email')}</Text>
          </View>

          <CustomEmailInput
            inputStyle={{
              borderWidth: 0,
              borderBottomWidth: 0,
              borderColor: Color.n_default_brown,
              fontSize: 27,
            }}
            inputWrapperStyle={{
              marginVertical: 30,
              marginHorizontal: 40,
            }}
            value={this.state.currentEmail}
            placeholder={translang.t('Email_input_placeholder')}
            placeholderTextColor={Color.n_text_placeholder_gray}
            // secureTextEntry={true}
            onChangeText={this._onChangecurrentEmail}
            iconPress={this.changePwdType}
          />

          <GradientButton
            containerStyle={styles.loginBtn}
            label={translang.t('Get_Verification_Code')}
            _onPress={() => this.changeEmail()}
          />

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

  bigText: {
    width: '100%',
    fontSize: 20  ,
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

  }

});
