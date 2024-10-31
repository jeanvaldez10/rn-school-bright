import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import GradientButton from '../../components/GradientButton';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import CustomTextInput from '../../components/CustomTextInput';
import CustomPassInput from '../../components/CustomPassInput';
import ValidationComponent from 'react-native-form-validator';
import Images from '../../themes/Images';
import _ from 'lodash';
import Color from '../../constants/color';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import AlertWithImageOfflineModal from '../../components/AlertWithImageOfflineModal';
import translang from '../../utils/language.utils';
import SchoolModal from '../../components/SchoolModal';
import ApiManager from "../../managers/ApiManager";
import {SafeAreaView} from 'react-native-safe-area-context';
import StorageManager from '../../managers/StorageManager';
import BackNavigationBar from '../../components/BackNavigationBar';
import {
  TABLE_USERNAME,
  COL_USERID,
  getDBConnection,
  checkExist,
  insertUser,
  getAllUserInfo,
} from '../../utils/DBManager';
import Constant from '../../constants/constants';
import RNExitApp from 'react-native-exit-app';
import {getUniqueId} from "react-native-device-info";
import CheckVerification from "../../components/CheckVerification";
import {bindActionCreators} from "redux";
import {setDEV, setIsEditStatus, setLoginInfo, setTabIndex, setUserInfo} from "../../redux/actions";
import {connect} from "react-redux";
import {withNavigationFocus} from "react-navigation";

class SettingAddAccount extends ValidationComponent {
  constructor(props) {
    super(props);

    this.state = {
      selectedSchool: null,
      userName: '',
      password: '',
      isLoggingIn: false,
      showModal: false,
      modalBody: '',
      showSchoolModal: false,
      showModalOffline: false,
      publicIP: '',
      imei: getUniqueId()
    };
    //this.backhandler = null;
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      if (this.backhandler) {
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      this.setState({ismount: true});
    });
  }

  componentWillUnmount() {
    if (this.backhandler) {
      this.backhandler.remove();
    }
    if (this.focusListener) {
      this.backhandler.remove();
    }
  }

  closeApp = () => {
    if (Platform.OS === 'ios') {
      RNExitApp.exitApp();
    } else {
      BackHandler.exitApp();
    }
  }

  _onChangeSchool = () => {
    this.setState({
      showSchoolModal: true,
    });
  };

  _onChangeUserName = (userName) => {
    this.setState({userName: userName});
  };

  _onChangePassword = (text) => {
    this.setState({password: text});
  };

  _login = async () => {
    const {selectedSchool, userName, password, imei, publicIP} = this.state;

    if (selectedSchool == null) {
      this.setState({showModal: true, modalBody: translang.t('HOME_msg_selectschool')});
      return;
    } else if (_.isEmpty(userName)) {
      this.setState({showModal: true, modalBody: translang.t('HOME_msg_username')});
      return;
    } else if (_.isEmpty(password)) {
      this.setState({showModal: true, modalBody: translang.t('HOME_msg_password')});
      return;
    }

    this.setState({isLoggingIn: true});


    ApiManager.signinForAdd(userName, password, selectedSchool.SchoolID, imei, publicIP)
      .then(async success => {
        console.log("success:", success);
        if (!success) {
          const msg = translang.t('INCORRECT_USERNAME_PWD') + '\n' + translang.t('CONTACT_YOUER_SCHOOL_ADMIN');
          this.setState({showModal: true, modalBody: msg});
          return Promise.reject(msg);
        }

        const user = await StorageManager.getTempUser();
        const userMain = await StorageManager.getUser();
        const userMainInfo = await StorageManager.getUserInfo();
        await StorageManager.setPrevUser(userMain);
        await StorageManager.setPrevUserInfo(userMainInfo);
        this.props.setTabIndex(0);

        const isExist = await checkExist(user.ID);
        if (!isExist) {
          const resInsert = await insertUser(user.ID, userName, password, user.SchoolId, user.Type, user.Value,
              user.name, user.lastname, user.sex, user.token, user.image, "", "", userMain.ID, user.nameEN, user.lastnameEN);
          if (resInsert) {
            const db = await getDBConnection();
            try {
              Constant.AddProfiles = [];
              await getAllUserInfo();
              this.gotoAddedProfile(userName, password, selectedSchool.SchoolID, imei, publicIP);
            } catch (error) {
              console.log(error);
              throw Error('Failed to get getAllUserInfo');
            }
          } else {
            console.log("Add Failed");
          }
        } else {
          const msg = translang.t('DUBPLICATE_USR');
          this.setState({showModal: true, modalBody: msg});
        }
      })
      .then(() => {
        this.setState({isLoggingIn: false});
      })
      .catch(err => {
        console.log("err:", err);
        const msg = translang.t('INCORRECT_USERNAME_PWD') + '\n' + translang.t('CONTACT_YOUER_SCHOOL_ADMIN');
        this.setState({showModal: true, modalBody: msg});
        this.setState({isLoggingIn: false});
      });
  };

  gotoAddedProfile(loginid, userpassword, schoolId, imei, publicIP) {
    ApiManager.signin(loginid, userpassword, schoolId, imei, publicIP)
      .then(async success => {
        if (!success) {
          const msg = translang.t('INCORRECT_USERNAME_PWD') + '\n' + translang.t('CONTACT_YOUER_SCHOOL_ADMIN');
          return Promise.reject(msg);
        } else {
          const user = await StorageManager.getUser();
          const userId = user.ID;
          const schoolId = user.SchoolId;
          await StorageManager.setVerifyFlag(false);
          return ApiManager.getUserInfo(userId, schoolId);
        }
      })
      .then(async () => {
        const user = await StorageManager.getUser();
        await StorageManager.setVerifyType("sub");
        this.setState({isLoggingIn: true});

        const privacy_status = await ApiManager.CheckPrivacyStatus(user.ID);
        if(privacy_status.Status) {
          const result = await CheckVerification.checkVerification(user.SchoolId, user.ID);
          const device_verified = await CheckVerification.checkVerificationDevice('token', user.ID, user.SchoolId);
          this.setState({isLoggingIn: false});

          if (result.verifyNeed) {
            this.props.navigation.navigate('VerifyStart');
          } else {
            if (device_verified) {
              this.props.navigation.navigate('AuthLoading');
            } else {
              this.props.navigation.navigate('VerifyDevice', {parent: 'SettingAddAccount'});
            }
          }
        } else{
          const param = {
            userID: user.ID,
            schoolID: user.SchoolId,
            content: privacy_status.PolicyMessage,
            parent: 'SettingAddAccount'
          };
          this.props.navigation.navigate('PrivacyPolicy', param);
        }

      })
      .catch(err => {
        console.log("gotoAddedProfile", err);
      });
  }

  onSchoolSelect = (item) => {
    if (item == null) {
      this.setState({showSchoolModal: false})
    } else {
      this.setState({showSchoolModal: false, selectedSchool: item})
    }
  };

  componentDidUpdate(prevProps, prevState) {
    // if (!prevState.showModal && this.state.showModal) {
    //   speak(this.state.modalBody);
    //   setTimeout(() => this.setState({showModal: false}), 3000);
    // }
  }

  back = () => {
    if (this.backhandler) {
      this.backhandler.remove();
    }
    if (this.focusListener) {
      this.backhandler.remove();
    }

    const parentRoute = this.props.navigation.getParam('parent') ?? 'Setting';
    this.props.navigation.navigate(parentRoute);
  };

  _forgot = () => {
    this.props.navigation.navigate('Forgotpass', {type: 1});
  };

  render() {
    const {selectedSchool, userName, password, isLoggingIn} = this.state;
    let schoolname = '';
    if (selectedSchool != null) {
      schoolname = selectedSchool.name;
    }

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_addaccount')}
          onMenuTap={() => this.back()}
        />

        <KeyboardAwareScrollView style={styles.container}>
          <View style={styles.appimage}>
            <Image source={Images.n_applogo_logo} style={styles.appLogo} resizeMode='contain'/>
          </View>
          <View style={styles.mainLoginContainer}>
            <View style={styles.subLoginContainer}>
              <TouchableOpacity style={{marginTop: 10,}} onPress={this._onChangeSchool}>
                <CustomTextInput
                  inputStyle={{
                    borderWidth: 0,
                    borderBottomWidth: 1,
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
              <CustomTextInput
                inputStyle={{
                  borderWidth: 0,
                  borderBottomWidth: 1,
                  borderColor: Color.n_default_brown,
                  fontSize: 27,
                }}
                inputWrapperStyle={{
                  marginBottom: 25,
                  marginHorizontal: 35,
                  borderColor: Color.n_default_brown,
                  borderBottomWidth: 1,
                }}
                value={userName}
                placeholder={translang.t('LOGIN_STUDENTID')}
                placeholderTextColor={Color.n_text_placeholder_gray}
                disableMultiline={true}
                onChangeText={this._onChangeUserName}
              />


              <CustomPassInput
                inputStyle={{
                  borderWidth: 0,
                  borderBottomWidth: 1,
                  borderColor: Color.n_default_brown,
                  fontSize: 27,
                }}
                inputWrapperStyle={{
                  marginBottom: 25,
                  marginHorizontal: 35,
                }}
                value={password}
                placeholder={translang.t('PASSWORD')}
                placeholderTextColor={Color.n_text_placeholder_gray}
                secureTextEntry={this.state.showpassword}
                onChangeText={this._onChangePassword}
                iconPress={this.changePwdType}
              />
            </View>

            <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginHorizontal: 35}}>
              <TouchableOpacity style={{width: 'auto'}} onPress={this._forgot}>
                <Text style={styles.forgotText}>{translang.t('HOME_forgot')}</Text>
              </TouchableOpacity>
            </View>


            <View style={styles.actionContainer}>
              {isLoggingIn ? (
                <View style={styles.loginBtn}>
                  <LinearGradient
                    colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
                    style={styles.loginBtnBackground}>
                    <ActivityIndicator color={Color.white}/>
                  </LinearGradient>
                </View>
              ) : (
                <GradientButton
                  containerStyle={styles.loginBtn}
                  label={translang.t('HOME_login')}
                  _onPress={() => this._login()}
                />
              )}
            </View>

            <SchoolModal
              isVisible={this.state.showSchoolModal}
              header={translang.t('HOME_searchschool')}
              positiveText={translang.t('HOME_close')}
              onSchoolSelect={this.onSchoolSelect}
            />

            <AlertWithImageModal
              isVisible={this.state.showModal}
              image={Images.alert_inbox}
              title=' '
              message={this.state.modalBody}
              buttonColors={[Color.red_orange, Color.soft_red]}
              isVerticalGradient={false}
              onClose={() => {
                this.setState({showModal: false})
              }}
            />

            <AlertWithImageOfflineModal
              isVisible={this.state.showModalOffline}
              image={Images.alert_inbox}
              title=' '
              message={translang.t('ALERT_OFFLINE')}
              buttonColors={[Color.red_orange, Color.soft_red]}
              isVerticalGradient={false}
              onClose={() => {
                this.setState({showModalOffline: false}, () => {
                  this.closeApp();
                })
              }}
            />
          </View>
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
  mainLoginContainer: {
    flex: 1,
    marginTop: 40,
  },
  subLoginContainer: {
    flex: 1,
    margin: 0,
  },
  actionContainer: {
    flex: 1,
    alignItems: 'center',
  },
  loginBtn: {
    width: '100%',
    height: 70,
    marginTop: 45,
    paddingHorizontal: 35,
  },
  loginBtnBackground: {
    flex: 1,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langText: {
    color: '#707070',
    fontSize: 30,
    marginTop: 10,
    marginRight: 20,
    alignSelf: 'flex-end',
  },
  schoolTextWrapper: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: '#A0A0A0',
    borderRadius: 5,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginTop: 5,
  },
  schoolText: {
    fontSize: 16,
    paddingHorizontal: 15,
    paddingVertical: 8,
    padding: Platform.select({
      android: 0,
    }),
    color: '#707070',
    fontWeight: '400',
    fontFamily: 'THSarabunNew',
  },
  forgotText: {
    color: Color.n_default_orange,
    fontSize: 20,
    fontWeight: 'bold',
  },
});


const mapStateToProps = (state) => {
  const {devReducer} = state;
  return {devReducer}
};

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    setDEV,
    setIsEditStatus,
    setTabIndex,
    setUserInfo,
    setLoginInfo
  }, dispatch)
);


export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(SettingAddAccount));

