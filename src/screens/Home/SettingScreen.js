import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, ImageBackground, Linking, Text} from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import { ScrollView } from 'react-native-gesture-handler';
import LanguageModal from '../../components/LanguageModal';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import SettingIconInfoItem from '../../components/SettingIconInfoItem';
import translang, { setLocale } from '../../utils/language.utils';
import Color from '../../constants/color';
import Storage from '../../managers/StorageManager';
import { Col } from 'native-base';
import LogoutModal from "../../components/LogoutModal";
import ProgressHud from "../../components/ProgressHud";
import Constant from "../../constants/constants";
import CheckVerification from "../../components/CheckVerification";

export default class SettingScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showLanguageModal: false,
      showLogoutModal: false,
      userInfo: {},
      isLoading: false,
      loginInfo: {},
      deviceInfo: {},
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    if(this.backhandler){
      this.backhandler.remove();
    }
    if(this.focusListener){
      this.focusListener.remove();
    }
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

    const user = await Storage.getUserInfo();
    const loginInfo = await Storage.getUser();
    const deviceInfo = await Storage.getDeviceInfo();

    this.setState({userInfo: user, loginInfo, deviceInfo})
  }

  componentWillUnmount = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }

  };

  back = () => {
    this.props.navigation.navigate("UserInfo");
    // this.props.navigation.goBack();
  };

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
  };

  onClickItem = (key) => {
    const isStudent = this.state.userInfo.StudentId !== null
    if(key == 'feedback')
    {
      this.props.navigation.navigate('Feedback');
    }
    else if(key == 'manageaccount')
    {
      this.props.navigation.navigate('SettingManageAccount', {userInfo: this.state.userInfo});
    }
    else if(key == 'profile'){
      if(isStudent){
        this.props.navigation.navigate('ProfileStudent', {parent: "Setting", userInfo: this.state.userInfo});
      }else{
        this.props.navigation.navigate('ProfileTeacher', {parent: "Setting", userInfo: this.state.userInfo});
      }
    }
    else if(key == 'changepin')
    {
      this.props.navigation.navigate('SettingChangePincode', {parent: 'Setting', userInfo: this.state.userInfo});
    }
    else if(key == 'language')
    {
      this.props.navigation.navigate('SettingLanguage');
    }
    else if(key == 'notification')
    {
      this.props.navigation.navigate('SettingNotification');
    }
    else if(key == 'about')
    {
      this.props.navigation.navigate('SettingAbout');
    }
    else if(key == 'changepassword')
    {
      this.props.navigation.navigate('SettingUpdatePass', {parent: 'Setting'});
    }
    else if(key == 'security_setting')
    {
      this.props.navigation.navigate('SecuritySetting', {parent: 'Setting'});
    }
    else if(key == 'userguid')
    {
      if(isStudent){
        Linking.openURL("https://www.youtube.com/playlist?list=PLE9B4Gj8Dm0mtTLuNLj3MKlfPYlJ_m7L9");
      }else{
        Linking.openURL("https://www.youtube.com/playlist?list=PLE9B4Gj8Dm0mUowPFSLXekYoAMKAlkRxt");
      }

    }
  };

  logOut = async () => {
    // const token = this.state.loginInfo.token;
    this.setState({isLoading: true});
    let requestCnt = 0;
    let totalRequestCnt = Constant.AddProfiles.length;
    Storage.setVerifyFlag(false);

    const {loginInfo, deviceInfo} = this.state;

    try {
      await CheckVerification.logoutUser(loginInfo, deviceInfo);
      this.props.navigation.navigate('Login');
    } catch (error) {
      console.error(error);
      this.setState({ isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN') });
    }

  }

  onLanguageSelect = (item) => {
    if (item == null) {
      this.setState({ showLanguageModal: false })
    } else {
      if (item.Language === 'English') {
        setLocale('en');
      } else {
        setLocale('th');
      }
      this.setState({ showLanguageModal: false, selectedLanguage: item })
    }
  };

  render() {
    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_setting')}
          onMenuTap={() => this.back()}
        />

        <View style={styles.container}>

          <ScrollView style={styles.menuContainer} indicatorStyle={'black'}>
          <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => {this.onClickItem('profile')}} >
              <SettingIconInfoItem
                icon_mark={Images.n_ic_setting_profile}
                label={translang.t('DRAWER_profile')}
                topTextStyle={styles.optionText}
                tmarginleft = {2}
                imageSize={30}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('manageaccount') }} >
              <SettingIconInfoItem
                icon_mark={Images.n_ic_setting_account1}
                label={translang.t('SETTING_manageaccount')}
                topTextStyle={styles.optionText}
                imageSize={22}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('language') }} >
              <SettingIconInfoItem
                icon_mark={Images.n_ic_setting_lang}
                label={translang.t('SETTING_language')}
                topTextStyle={styles.optionText}
                imageSize={22}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('security_setting') }} >
              <SettingIconInfoItem
                icon_mark={Images.n_ic_setting_PIN}
                label={translang.t('SETTING_Security')}
                topTextStyle={styles.optionText}
                imageSize={22}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('userguid') }} >
              <SettingIconInfoItem
                icon_mark={Images.n_ic_book_orange}
                label={translang.t('USER_GUIDE')}
                topTextStyle={styles.optionText}
                imageSize={22}
              />
            </TouchableOpacity>


            <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('about') }} >
              <SettingIconInfoItem
                icon_mark={Images.n_ic_setting_About}
                label={translang.t('SETTING_about')}
                topTextStyle={styles.optionText}
                imageSize={23}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('feedback') }} >
              <SettingIconInfoItem
                icon_mark={Images.ic_feedback}
                label={translang.t('DRAWER_feedback')}
                topTextStyle={styles.optionText}
                imageSize={23}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {this.setState({showLogoutModal: true});}} style={{width: '100%', alignItems: 'center', paddingVertical: 16, marginBottom: 40,}}>
              <Text style={styles.optionText}>{translang.t('DRAWER_logout')}</Text>
            </TouchableOpacity>



          </ScrollView>
        </View>

        <LanguageModal
          isVisible={this.state.showLanguageModal}
          onLanguageSelect={this.onLanguageSelect}
        />
        <LogoutModal
          isVisible={this.state.showLogoutModal}
          image={Images.n_ic_warning}
          showCancelButton={true}
          message={translang.t('COMMON_msg_logout')}
          loading={this.state.isLoading}
          onClose={() => {
            this.setState({showLogoutModal: false})
          }}
          onConfirm={() => {
            this.logOut();
          }}
        />
        <ProgressHud isVisible={this.state.isLoading}/>

      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({

  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
  menuContainer: {
    marginTop: 15,
  },
  menuEachStyle: {
    marginHorizontal: 15,
    borderRadius: 15,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 4,
    marginVertical: 7,
    paddingHorizontal: 20,
  },

  optionText:{
    fontFamily: '',
    fontSize: 24,
    fontWeight: 'bold',
    color: Color.n_default_gray
  }
});
