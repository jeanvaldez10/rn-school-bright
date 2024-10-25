import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import RNExitApp from "react-native-exit-app";
import LinearGradient from "react-native-linear-gradient";
import GradientButton from "../../components/GradientButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CustomTextInput from "../../components/CustomTextInput";
import CustomPassInput from "../../components/CustomPassInput";
import ValidationComponent from "react-native-form-validator";
import Images from "../../themes/Images";
import Orientation from "react-native-orientation-locker";
import _ from "lodash";
import Color from "../../constants/color";
import AlertWithImageModal from "../../components/AlertWithImageModal";
import translang, {
  getCurrentLocale,
  setLocale,
} from "../../utils/language.utils";
import SchoolModal from "../../components/SchoolModal";
import ApiManager from "../../managers/ApiManager";
import { SafeAreaView } from "react-native-safe-area-context";
import StorageManager from "../../managers/StorageManager";
import {
  getDBConnection,
  createUserTable,
  checkExist,
  insertUser,
  getAllUserInfo,
  removeUser,
  removeAllUser,
} from "../../utils/DBManager";
import Constant from "../../constants/constants";
import GradientSmallButton from "../../components/GradientSmallButton";
import CheckVerification from "../../components/CheckVerification";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { setDEV } from "../../redux/actions";
import {
  getUniqueId,
  getVersion,
  getBuildNumber,
} from "react-native-device-info";

class LoginScreen extends ValidationComponent {
  constructor(props) {
    super(props);

    this.state = {
      selectedSchool: null,
      userName: "",
      password: "",
      isLoggingIn: false,
      showModal: false,
      modalBody: "",
      language: "en",
      showSchoolModal: false,

      serverInfo: { StatusCode: 200 },
      logoClickedCounts: 0,
      publicIp: null,
      version: getVersion(),
      buildNumber: getBuildNumber(),
    };
    //this.backhandler = null;
  }

  async componentDidMount() {
    if (Platform.OS === "android") {
      try {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
      } catch (error) {}
    }

    this.focusListener = this.props.navigation.addListener("didFocus", () => {
      this.setState({ ismount: true });
      Orientation.lockToPortrait();
    });

    db = await getDBConnection();
    await createUserTable(db);

    ApiManager.checkServerStatus()
      .then((res) => {
        if (res) {
          this.setState({ serverInfo: res });
          StorageManager.setServerStatus(res);
        }
      })
      .catch((error) => {
        console.log("CheckServer", error);
        this.setState({
          serverInfo: { Message: translang.t("ALERT_OFFLINE"), StatusCode: 0 },
        });
        StorageManager.setServerStatus({
          Message: translang.t("ALERT_OFFLINE"),
          StatusCode: 0,
        });
      });

    const dlang = await StorageManager.getLanguage();
    this.setState({ language: dlang });

    await StorageManager.setVerifyFlag(false);

    const dev = this.props.devReducer.dev;
    if (dev !== null) {
      await this.getUrls(dev);
      this.props.setDEV(dev);
    }
  }

  componentWillUnmount() {
    // this.focusListener.remove();
    this.mounted = false;
    // if(this.unsubscribe){
    //   console.log("AAAA Unsubscribe Login")
    //   this.unsubscribe();
    // }
  }

  _setlang = () => {
    if (this.state.language == "en") {
      setLocale("th");
      this.setState({ language: "th" });
    } else {
      setLocale("en");
      this.setState({ language: "en" });
    }
  };
  _forgot = () => {
    this.props.navigation.navigate("Forgotpass");
  };

  _register = () => {
    this.props.navigation.navigate("SignUpMain");
  };

  _onChangeSchool = () => {
    this.setState({
      showSchoolModal: true,
    });
  };

  _onChangeUserName = (userName) => {
    this.setState({ userName: userName });
  };

  _onChangePassword = (text) => {
    this.setState({ password: text });
  };

  _login = async () => {
    const { selectedSchool, userName, password, publicIP } = this.state;

    if (selectedSchool == null) {
      this.setState({
        showModal: true,
        modalBody: translang.t("HOME_msg_selectschool"),
      });
      return;
    } else if (_.isEmpty(userName)) {
      this.setState({
        showModal: true,
        modalBody: translang.t("HOME_msg_username"),
      });
      return;
    } else if (_.isEmpty(password)) {
      this.setState({
        showModal: true,
        modalBody: translang.t("HOME_msg_password"),
      });
      return;
    }

    this.setState({ isLoggingIn: true });
    Constant.isRunning = false;

    ApiManager.signin(
      userName,
      password,
      selectedSchool.SchoolID,
      getUniqueId(),
      publicIP
    )
      .then(async (success) => {
        this.setState({ isLoggingIn: false });
        if (!success) {
          const msg =
            translang.t("INCORRECT_USERNAME_PWD") +
            "\n" +
            translang.t("CONTACT_YOUER_SCHOOL_ADMIN");
          this.setState({ showModal: true, modalBody: msg });
          return Promise.reject(msg);
        } else {
          const user = await StorageManager.getUser();
          const userId = user.ID;
          const schoolId = user.SchoolId;

          const deviceinfo = await StorageManager.getDeviceInfo();
          await StorageManager.setVerifyType("main");
          const token = deviceinfo.fcmtoken;
          const imei = deviceinfo.imei;
          const system = deviceinfo.system;
          const version = deviceinfo.version;
          const model = deviceinfo.model;

          //SAVE DEVICE INFO
          ApiManager.saveDeviceInfo(
            token,
            userId,
            schoolId,
            imei,
            system,
            version,
            model
          )
            .then((result) => {})
            .catch((error) => {
              console.log("SaveDeviceInfoError", error);
            });

          const data = {
            Token: deviceinfo.fcmtoken,
            UserID: userId,
            SchoolID: schoolId,
            Imei: deviceinfo.imei,
            System: deviceinfo.system,
            appVersion: deviceinfo.version,
            model: deviceinfo.model,
            IPAddress: "11.1.1.1",
            Location: "",
          };
          ApiManager.updateLanguage(getCurrentLocale(), data).then(() => {});

          const isExist = await checkExist(user.ID);
          if (isExist) {
            await removeUser(user.ID);
          } else {
            await removeAllUser();
            await StorageManager.setPrevUser(null);
            await StorageManager.setPrevUserInfo(null);
          }

          const resInsert = await insertUser(
            user.ID,
            userName,
            password,
            user.SchoolId,
            user.Type,
            user.Value,
            user.name,
            user.lastname,
            user.sex,
            user.token,
            user.image,
            "",
            "",
            user.ID,
            user.nameEN,
            user.lastnameEN
          );
          if (resInsert) {
            await getAllUserInfo();
          } else {
            console.log("Add Failed");
          }

          return ApiManager.getUserInfo(userId, schoolId);
        }
      })
      .then(async () => {
        const user = await StorageManager.getUser();
        const userId = user.ID;
        const schoolId = user.SchoolId;

        this.CheckPrivacyStatus(userId, schoolId, user.token);
      })
      .catch((err) => {
        console.log("ERROR", err);
        const msg =
          translang.t("INCORRECT_USERNAME_PWD") +
          "\n" +
          translang.t("CONTACT_YOUER_SCHOOL_ADMIN");
        this.setState({ showModal: true, modalBody: msg });
        this.setState({ isLoggingIn: false });
      });
  };

  CheckPrivacyStatus = (userId, schoolId, token) => {
    ApiManager.CheckPrivacyStatus(userId)
      .then(async (data) => {
        if (data.Status) {
          this.setState({ isLoggingIn: true });
          const result = await CheckVerification.checkVerification(
            schoolId,
            userId
          );
          const device_verified =
            await CheckVerification.checkVerificationDevice(
              token,
              userId,
              schoolId
            );
          this.setState({ isLoggingIn: false });
          if (result.verifyNeed) {
            this.props.navigation.navigate("VerifyStart");
          } else {
            if (device_verified) {
              this.props.navigation.navigate("App");
            } else {
              this.props.navigation.navigate("VerifyDevice", {
                parent: "Login",
              });
            }
          }
        } else {
          const param = {
            userID: userId,
            schoolID: schoolId,
            content: data.PolicyMessage,
            parent: "Login",
          };
          this.props.navigation.navigate("PrivacyPolicy", param);
        }
      })
      .catch((error) => {
        console.log("CheckPrivacyStatus", error);
      });
  };

  onSchoolSelect = (item) => {
    if (item == null) {
      this.setState({ showSchoolModal: false });
    } else {
      this.setState({ showSchoolModal: false, selectedSchool: item });
    }
  };

  _onClickLogo = async () => {
    const logoClickedCounts = this.state.logoClickedCounts;
    this.setState({ logoClickedCounts: logoClickedCounts + 1 });
    if (logoClickedCounts > 7) {
      this.setState({ logoClickedCounts: 0 });
      const dev = !this.props.devReducer.dev;
      this.setState({
        showModal: true,
        modalBody: dev ? "Dev mode" : "Production mode",
      });
      const urlsInfo = await StorageManager.getUrlsInfo();
      StorageManager.setUrlsInfo({ ...urlsInfo, dev: dev });
      this.props.setDEV(dev);
    }
  };

  getUrls = async (dev) => {
    let urlsInfo = {};
    urlsInfo["dev"] = dev;
    let res = await ApiManager.GetAPIUrls("Payment API");
    console.log("data:", res);
    if (res.length) {
      urlsInfo["payment"] = res[0];
    }

    res = await ApiManager.GetAPIUrls("Schoolbright API");

    console.log("payment api response: ", res);
    if (res.length) {
      urlsInfo["schoolbright"] = res[0];
    }

    StorageManager.setUrlsInfo(urlsInfo);
    this.props.setDEV(dev);
  };

  componentDidUpdate(prevProps, prevState) {
    // if (!prevState.showModal && this.state.showModal) {
    //   speak(this.state.modalBody);
    //   setTimeout(() => this.setState({showModal: false}), 3000);
    // }
  }

  closeApp = () => {
    if (Platform.OS === "ios") {
      RNExitApp.exitApp();
    } else {
      RNExitApp.exitApp();
    }
  };

  render() {
    const { selectedSchool, userName, password, isLoggingIn } = this.state;
    let schoolname = "";
    if (selectedSchool != null) {
      schoolname = selectedSchool.name;
    }

    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView style={styles.container}>
          <TouchableOpacity onPress={this._setlang}>
            <Text style={styles.langText}>{translang.t("HOME_lang")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.appimage} onPress={this._onClickLogo}>
            <Image
              source={Images.n_applogo_logo}
              style={styles.appLogo}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={styles.mainLoginContainer}>
            <View style={styles.subLoginContainer}>
              <TouchableOpacity
                style={{ marginTop: 10 }}
                onPress={this._onChangeSchool}
              >
                <CustomTextInput
                  inputStyle={{
                    borderWidth: 0,
                    borderBottomWidth: 0,
                    borderColor: Color.n_default_brown,
                    fontSize: 27,
                  }}
                  inputWrapperStyle={{
                    marginBottom: 25,
                    marginHorizontal: 35,
                    borderColor: Color.n_default_brown,
                    borderBottomWidth: 1,
                  }}
                  notouch="true"
                  value={schoolname}
                  placeholder={translang.t("HOME_school")}
                  placeholderTextColor={Color.n_text_placeholder_gray}
                />
              </TouchableOpacity>
              <CustomTextInput
                inputStyle={{
                  borderWidth: 0,
                  borderBottomWidth: 0,
                  borderColor: Color.n_default_brown,
                  fontSize: 27,
                }}
                inputWrapperStyle={{
                  marginBottom: 25,
                  marginHorizontal: 35,
                  borderColor: Color.n_default_brown,
                  borderBottomWidth: 1,
                }}
                disableMultiline={true}
                value={userName}
                placeholder={translang.t("LOGIN_STUDENTID")}
                placeholderTextColor={Color.n_text_placeholder_gray}
                onChangeText={this._onChangeUserName}
              />
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
                value={password}
                placeholder={translang.t("PASSWORD")}
                placeholderTextColor={Color.n_text_placeholder_gray}
                onChangeText={this._onChangePassword}
                iconPress={this.changePwdType}
              />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginHorizontal: 35,
                }}
              >
                <TouchableOpacity
                  style={{ width: "auto" }}
                  onPress={this._forgot}
                >
                  <Text style={styles.forgotText}>
                    {translang.t("HOME_forgot")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.actionContainer}>
              {isLoggingIn ? (
                <View style={styles.loginBtn}>
                  <LinearGradient
                    colors={[
                      Color.n_button_gradient_orange_start,
                      Color.n_button_gradient_orange_end,
                    ]}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.loginBtnBackground}
                  >
                    <ActivityIndicator color={Color.white} />
                  </LinearGradient>
                </View>
              ) : (
                <GradientButton
                  containerStyle={styles.loginBtn}
                  label={translang.t("HOME_login")}
                  _onPress={() => this._login()}
                />
              )}
            </View>
            <View style={{ marginTop: 80 }}>
              <Text style={{ fontSize: 24, textAlign: "center" }}>
                Version {this.state.version} Build {this.state.buildNumber}
              </Text>
            </View>

            <SchoolModal
              isVisible={this.state.showSchoolModal}
              header={translang.t("HOME_searchschool")}
              positiveText={translang.t("HOME_close")}
              onSchoolSelect={this.onSchoolSelect}
            />

            <AlertWithImageModal
              isVisible={this.state.showModal}
              image={Images.alert_inbox}
              message={this.state.modalBody}
              buttonColors={[Color.red_orange, Color.soft_red]}
              isVerticalGradient={false}
              onClose={() => {
                this.setState({ showModal: false });
              }}
            />
          </View>
        </KeyboardAwareScrollView>

        {this.state.serverInfo && this.state.serverInfo.StatusCode != 200 && (
          <Modal animationType="slide" transparent={true} key="modal">
            <View style={styles.centeredView}>
              <LinearGradient
                style={styles.dialogStyle}
                colors={[
                  Color.n_button_gradient_orange_start,
                  Color.n_button_gradient_orange_end,
                ]}
              >
                <View
                  style={{
                    flexDirection: "column",
                    justifyContent: "center",
                    marginTop: 30,
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={Images.n_applogo_logo_only}
                    style={styles.modalLogo}
                  />
                  {/*<Text style={{*/}
                  {/*  fontFamily: 'THSarabunNew',*/}
                  {/*  fontSize: 18,*/}
                  {/*  color: 'white',*/}
                  {/*  textAlign: 'center',*/}
                  {/*  marginTop: 10,*/}
                  {/*}}>{translang.t('NOTIFY_TITLE')}</Text>*/}
                </View>
                <ScrollView
                  style={{ flex: 1, marginHorizontal: 20, marginVertical: 15 }}
                  contentContainerStyle={{ flexGrow: 1 }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 20,
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    {this.state.serverInfo.Message}
                  </Text>
                </ScrollView>
                <GradientSmallButton
                  label={translang.t("HOME_close")}
                  opacity={1}
                  width={150}
                  height={50}
                  borderRadius={25}
                  containerStyle={{ marginBottom: 20 }}
                  _onPress={() => this.closeApp()}
                />
              </LinearGradient>
            </View>
          </Modal>
        )}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
  },
  appLogo: {
    width: "100%",
    height: "100%",
  },
  appimage: {
    marginTop: 20,
    width: "100%",
    height: 130,
    alignItems: "center",
  },
  // appimage_title: {
  //   marginTop: 5,
  //   marginBottom: 55,
  //   width: '100%',
  //   height: 35,
  //   alignItems: 'center',
  // },

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
    alignItems: "center",
  },
  loginBtn: {
    width: "100%",
    height: 70,
    marginTop: 45,
    paddingHorizontal: 35,
  },
  loginBtnBackground: {
    flex: 1,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  langText: {
    color: "#707070",
    fontSize: 30,
    marginTop: 10,
    marginRight: 20,
    alignSelf: "flex-end",
  },
  forgotText: {
    color: Color.n_default_orange,
    fontSize: 20,
    fontWeight: "bold",
  },
  schoolTextWrapper: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: "#A0A0A0",
    borderRadius: 5,
    overflow: "hidden",
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
    color: "#707070",
    fontWeight: "400",
    fontFamily: "THSarabunNew",
  },

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000090",
  },
  dialogStyle: {
    width: "100%",
    height: "100%",
    // height: dimension.px180,
    flexDirection: "column",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    paddingVertical: 40,
  },
  modalLogo: {
    width: 90,
    height: 90,
  },
});

const mapStateToProps = (state) => {
  const { devReducer } = state;
  return { devReducer };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setDEV,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);
