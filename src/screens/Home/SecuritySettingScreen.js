import React from 'react';
import {Image, View, BackHandler, TouchableOpacity, ImageBackground, Linking} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';
import Images from '../../themes/Images';
import {ScrollView} from 'react-native-gesture-handler';
import LanguageModal from '../../components/LanguageModal';
import {DrawerActions} from 'react-navigation-drawer';
import {SafeAreaView} from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import SecuritySettingInfoItem from '../../components/SecuritySettingInfoItem';
import translang, {setLocale} from '../../utils/language.utils';
import Color from '../../constants/color';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import {Col} from 'native-base';
import {removeUser} from "../../utils/DBManager";
import AlertWithImageOfflineModal from "../../components/AlertWithImageOfflineModal";
import AlertWith2ButtonsModal from "../../components/AlertWith2ButtonsModal";
import {Text} from "react-native-svg";
import ProgressHud from '../../components/ProgressHud';

export default class SecuritySettingScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showLanguageModal: false,
      userInfo: {},
      emailVerify: false,
      phoneVerify: false,
      lineConnect: false,
      userEmail: '',
      phoneNumber: '',
      showModal: false,
      modalText: '',
      isLoading: false,
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  showModal = (modalText) => {
    this.setState({showModal: true, modalText: modalText});
  }

  init = async () => {

    const user = await Storage.getUserInfo();
    this.setState({userInfo: user});

    let emailVerify = false;
    let phoneVerify = false;
    let lineConnect = false;
    let email = '';
    let phoneNumber = '';

    let res = await ApiManager.checkVerify(user.SchoolID, user.ID, 'email');
    let {result} = res;

    if (result.code === 100) {
      emailVerify = true;
    } else {
      emailVerify = false;
    }

    res = await ApiManager.checkVerify(user.SchoolID, user.ID, 'phone');
    result = res.result;
    if (result.code === 100) {
      phoneVerify = true;
    } else {
      phoneVerify = false;
    }

    res = await ApiManager.checkVerify(user.SchoolID, user.ID, 'line');
    result = res.result;
    if (result.code === 100) {
      lineConnect = true;
    }


    this.setState({
      phoneVerify: phoneVerify,
      lineConnect: lineConnect,
      emailVerify: emailVerify,
      userEmail: result.email,
      phoneNumber: result.phoneNumber
    });

    await Storage.setVerifyInfo({emailVerify, phoneVerify, email: result.email, phone: result.phoneNumber, lineConnect});

  };


  async componentDidMount() {
    const {navigation} = this.props;
    this.focusListener = navigation.addListener("didFocus", async () => {
      if (this.backhandler) {
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
      this.init();
    });
  }


  componentWillUnmount = () => {
    if(this.focusListener){
      this.focusListener.remove();
    }
    if (this.backhandler) {
      this.backhandler.remove();
    }
  };

  back = () => {
    // this.props.navigation.navigate('App');
    if (this.backhandler) {
      this.backhandler.remove();
    }

    const parentRoute = this.props.navigation.getParam('parent') ?? 'App';
    this.props.navigation.navigate(parentRoute);
  };

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
  };

  onClickItem = (key) => {
    console.log("key:", key);
    const isStudent = this.state.userInfo.StudentId !== null;
    if (key == 'manageaccount') {
      this.props.navigation.navigate('SettingManageAccount', {userInfo: this.state.userInfo});
    } else if (key == 'profile') {
      if (isStudent) {
        this.props.navigation.navigate('ProfileStudent', {parent: "Setting", userInfo: this.state.userInfo});
      } else {
        this.props.navigation.navigate('ProfileTeacher', {parent: "Setting", userInfo: this.state.userInfo});
      }
    } else if (key == 'change_pin') {
      this.setState({isLoading: true});
      ApiManager.checkChangePinStatus(this.state.userInfo.ID).then(res => {
        console.log("checkChangePinStatus:", res);
        this.setState({isLoading: false});
        if(res.resCode != "200"){
          this.props.navigation.navigate('ShopSetPincode', {parent: 'App', userInfo: this.state.userInfo});
        }else{
          this.props.navigation.navigate('SettingChangePincode', {
            parent: 'SecuritySetting',
            userInfo: this.state.userInfo
          });
        }
      }).catch(error => {
        console.log(error);
      });

    } else if (key == 'language') {
      this.props.navigation.navigate('SettingLanguage');
    } else if (key == 'notification') {
      this.props.navigation.navigate('SettingNotification');
    } else if (key == 'about') {
      this.props.navigation.navigate('SettingAbout');
    } else if (key == 'change_password') {
      this.props.navigation.navigate('SettingUpdatePass', {parent: 'SecuritySetting'});
    } else if (key == 'add_email') {
      this.props.navigation.navigate('VerifyEmailInput', {
        parent: 'SecuritySetting',
        email: this.state.Email,
        type: 1
      });
    } else if (key == 'edit_phone_number') {
      console.log("this.state.PhoneNumber:,", this.state.phoneNumber);
      this.props.navigation.navigate('VerifyPhoneInput', {
        parent: 'SecuritySetting',
        phone: this.state.phoneNumber,
        type: 1
      });
    } else if (key == 'line_connect') {
      if(this.state.lineConnect){
        this.props.navigation.navigate('LineDisConnect', {parent: 'SecuritySetting', type: 1});
      }else{
        this.props.navigation.navigate('VerifyLineConnect', {parent: 'SecuritySetting', type: 1});
      }

    } else if (key == 'your_devices') {
      this.props.navigation.navigate('YourDevice', {parent: 'SecuritySetting'});
    } else if (key == 'verify') {
      this.props.navigation.navigate('VerifyEmailSuccess', {parent: 'App'});
    } else if (key == 'userguid') {
      if (isStudent) {
        Linking.openURL("https://www.youtube.com/playlist?list=PLE9B4Gj8Dm0mtTLuNLj3MKlfPYlJ_m7L9");
      } else {
        Linking.openURL("https://www.youtube.com/playlist?list=PLE9B4Gj8Dm0mUowPFSLXekYoAMKAlkRxt");
      }

    }
  };

  render() {
    const {emailVerify, phoneVerify, lineConnect} = this.state;
    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('SETTING_Security')}
          onMenuTap={() => this.back()}
        />
        <View style={styles.container}>
          <ScrollView style={styles.menuContainer} indicatorStyle={'black'}>
            <View style={styles.boxStyle}>
              <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => {
                this.onClickItem('change_password')
              }}>
                <SecuritySettingInfoItem
                  icon_mark={Images.n_ic_setting_profile}
                  label={translang.t('CHANGE_PASSWORD')}
                  topTextStyle={styles.optionText}
                  tmarginleft={2}
                  secondText={''}
                  image_visible={true}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => {
                this.onClickItem('change_pin')
              }}>
                <SecuritySettingInfoItem
                  icon_mark={Images.n_ic_setting_profile}
                  label={translang.t('SETTING_changepin')}
                  topTextStyle={styles.optionText}
                  tmarginleft={2}
                  secondText={''}
                  image_visible={true}
                />
              </TouchableOpacity>
              {emailVerify &&
              <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => {
                this.onClickItem('add_email')
              }}>
                <SecuritySettingInfoItem
                  icon_mark={Images.n_ic_setting_profile}
                  label={translang.t('Email') + " :"}
                  topTextStyle={styles.optionText}
                  tmarginleft={2}
                  secondText={translang.t('Verified')}
                  image_visible={true}
                  secondTextStyle={styles.verifiedColor}
                /></TouchableOpacity>}
              {!emailVerify &&
              <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => {
                this.onClickItem('add_email')
              }}>
                <SecuritySettingInfoItem
                  icon_mark={Images.n_ic_setting_profile}
                  label={translang.t('SETTING_addEmail') + " :"}
                  topTextStyle={styles.optionText}
                  tmarginleft={2}
                  secondText={translang.t('Unverified')}
                  image_visible={true}
                  type={1}
                  arrowCallback={() => {
                    this.onClickItem('add_email');
                  }}
                />
              </TouchableOpacity>
              }
              {!phoneVerify &&
              <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => {
                this.onClickItem('edit_phone_number')
              }}>
                <SecuritySettingInfoItem
                  icon_mark={Images.n_ic_setting_profile}
                  label={translang.t('SETTING_EditPhoneNumber') + " :"}
                  topTextStyle={styles.optionText}
                  tmarginleft={2}
                  secondText={translang.t('Unverified')}
                  image_visible={true}
                  type={1}
                />
              </TouchableOpacity>
              }
              {phoneVerify &&
              <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => {
                this.onClickItem('edit_phone_number')
              }}>
                <SecuritySettingInfoItem
                  icon_mark={Images.n_ic_setting_profile}
                  label={translang.t('PHONE_NUMBER') + " :"}
                  topTextStyle={styles.optionText}
                  tmarginleft={2}
                  secondText={translang.t('Verified')}
                  image_visible={true}
                  secondTextStyle={styles.verifiedColor}
                />
              </TouchableOpacity>
              }

              <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => {
                this.onClickItem('line_connect')
              }}>
                <SecuritySettingInfoItem
                  icon_mark={Images.n_ic_setting_profile}
                  label={translang.t('SETTING_Line')}
                  topTextStyle={styles.optionText}
                  tmarginleft={2}
                  secondText={lineConnect ? translang.t('Linked') : translang.t('Not_yet_connected')}
                  secondTextStyle={lineConnect ? styles.verifiedColor : {}}
                  image_visible={true}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => {
                this.onClickItem('your_devices')
              }}>
                <SecuritySettingInfoItem
                  icon_mark={Images.n_ic_setting_profile}
                  label={translang.t('Your_devices')}
                  topTextStyle={styles.optionText}
                  tmarginleft={2}
                  secondText={''}
                  image_visible={true}
                />
              </TouchableOpacity>

            </View>
          </ScrollView>
        </View>

        <AlertWith2ButtonsModal
          isVisible={this.state.showModal}
          image={Images.n_ic_warning}
          message={this.state.modalText}
          onClose={() => {
            this.setState({showModal: false})
          }}
          onConfirm={() => {
            this.setState({showModal: false})
          }}
        />
        <ProgressHud isVisible={this.state.isLoading} />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  menuContainer: {},
  boxStyle: {
    margin: 15,
    borderRadius: 25,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    paddingVertical: 10,
    // borderColor: 'red',
    // borderWidth:2,
    elevation: 4,
  },


  menuEachStyle: {
    marginHorizontal: 0,
    borderRadius: 15,
    backgroundColor: 'white',
    marginVertical: 0,
    paddingHorizontal: 20,
  },

  optionText: {
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    fontWeight: 'bold',
    color: Color.n_default_gray
  },
  verifiedColor: {
    color: 'green',
  }
});
