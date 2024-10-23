import React from 'react';
import {BackHandler, View,} from 'react-native';

import {ScaledSheet} from "react-native-size-matters";
import ValidationComponent from 'react-native-form-validator';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import translang from '../../utils/language.utils';
import {SafeAreaView} from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import ApiManager from "../../managers/ApiManager";

import StorageManager from '../../managers/StorageManager';
import {WebView} from "react-native-webview";

export default class LineAgreeScreen extends ValidationComponent {
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
      type: 0,
      url: 'https://notify-bot.line.me/oauth/authorize?response_type=code&client_id=G3bkbxqFfiRHr1UWy1idpE&redirect_uri=https://system.schoolbright.co/Modules/UserVerify/LineCallback.aspx&scope=notify&state=11\n',
      allVerify: false,
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

      const {type, url} = this.props.navigation.state.params;
      console.log("url", url);
      const logininfo = await StorageManager.getUser();
      console.log("loginfo:", logininfo); ///{"Desc": "Login Success !!", "ID": 888408, "SchoolId": 849, "Type": "1", "Value": "1", "image": null, "lastname": "verify 7", "name": "verify 7", "sex": "0", }

      this.setState({logininfo: logininfo, type: type, url: url});
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

  checkVerification = async (schoolId, userId) => {
    let emailVerify = false;
    let phoneVerify = false;
    let lineConnect = false;

    const res0 = await ApiManager.checkVerify(schoolId, userId, 'email', 'compromise');
    const result0 = res0.result;
    if (result0.code === 100) {
      return;
    }
    const res = await ApiManager.checkVerify(schoolId, userId, 'email');
    const {result} = res;
    if (result.code === 100) {
      emailVerify = true;
    }

    const res1 = await ApiManager.checkVerify(schoolId, userId, 'phone');
    console.log("res1:", res1);
    const result1 = res1.result;
    if (result1.code === 100) {
      phoneVerify = true;
    }

    const res2 = await ApiManager.checkVerify(schoolId, userId, 'line');
    console.log("res2:", res2);
    const result2 = res2.result;
    if (result2.code === 100) {
      lineConnect = true;
    }

    await StorageManager.setVerifyInfo({phoneVerify, emailVerify, lineConnect, email: result1.email, phone: result1.phoneNumber});
    const verifyFlag = await StorageManager.getVerifyFlag() ?? false;

    console.log("emailVerify: ", emailVerify);
    console.log("phoneVerify: ", phoneVerify);
    console.log("LineConnect: ", lineConnect);
    console.log("verifyFlag: ", verifyFlag);

    return  emailVerify && phoneVerify && lineConnect;

  }

  confirm = async () => {
    const { type, logininfo } = this.state;
    const allVerify = await this.checkVerification(logininfo.SchoolId, logininfo.ID);
    console.log("allVerify:", allVerify);
    if(type == 0){
      if(allVerify){
        this.props.navigation.navigate('App');
      }else{
        this.props.navigation.navigate('VerifyWarning', {parent:'VerifyLineConnect'});
      }
    }
    else{//setting page
      this.props.navigation.navigate('SecuritySetting', {parent: 'Setting'});
    }
  };


  onNavigationStateChange = async (webViewState) => {
    console.log(webViewState);
    const closeUrl = "https://system.schoolbright.co/closepage.html";
    const currentUrl = webViewState.url;

    if(currentUrl == closeUrl){
      await this.confirm();
    }
  };


  render() {

    const { url, type } = this.state;

    console.log("url:", url);

    return (
      <SafeAreaView style={styles.container}>
        <BackNavigationBar
          title={''}
          onMenuTap={() => this._back()}
        />

        <View style={[styles.container, {backgroundColor: 'white', borderRadius: 5, margin: 5,}]}>
          <WebView
            // onLoad={() => this.setState({isLoading: false})}
            onError={(event)=>{console.log("AAA ERROR")}}
            source={{uri: url}}
            onNavigationStateChange={this.onNavigationStateChange}
            javaScriptEnabled={true}
          />
        </View>
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
  lineLogo: {
    flex: 1,
    width: '100%',
  },
  appimage: {
    marginTop:  0,
    width: '100%',
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
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0
  },

  loginBtnContainer: {
    width: '100%',
    height: 70,
    marginTop: 25,
    paddingHorizontal: 50,
  },

  agreeBtn: {
    borderRadius: 0
  }

});
