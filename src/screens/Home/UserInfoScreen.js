import React from "react";
import {
  View,
  Dimensions,
  Image,
  TouchableOpacity,
  Text,
  Icon,
  RefreshControl,
  ScrollView,
  Modal,
  BackHandler,
  Linking,
  AppState,
} from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import Color from "../../constants/color";
import { DrawerActions } from "react-navigation-drawer";
import { SafeAreaView } from "react-native-safe-area-context";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import UserInfoTab from "./UserInfoTab";
import HealthTab from "./HealthTab";
import AttendanceTab from "./AttendanceTab";
import { withNavigationFocus } from "react-navigation";
import ProgressHud from "../../components/ProgressHud";
import Storage from "../../managers/StorageManager";
import StorageManager from "../../managers/StorageManager";
import ApiManager from "../../managers/ApiManager";
import Images from "../../themes/Images";
import AdvertiseModal from "../../components/AdvertiseModal";
import Constant from "../../constants/constants";
import {
  getDBConnection,
  createUserTable,
  getAllUserInfo,
} from "../../utils/DBManager";
import LinearGradient from "react-native-linear-gradient";
import translang, {
  getCurrentLocale,
  setLocale,
} from "../../utils/language.utils";
import GradientSmallButton from "../../components/GradientSmallButton";
import PermissionModal from "../../components/LogoutModal";
import AppUpdateModal from "../../components/LogoutModal";
import { checkVersion } from "react-native-check-version";

import AlertWithImageOfflineModal from "../../components/AlertWithImageOfflineModal";
import RNExitApp from "react-native-exit-app";
import CheckVerification from "../../components/CheckVerification";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { setDEV } from "../../redux/actions";

class UserInfoScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTabIndex: 0,
      tabRoutes: [],
      isLoading: false,
      userInfo: {},
      deviceInfo: {},
      loginInfo: {},
      unreadCount: 0,
      isFetching: false,
      showBanner: false,
      showAdvertiseModal: false,
      ADId: "",
      rememberVal: false,
      dlgImg: null,
      bannerImages: [],
      serverInfo: { StatusCode: 200 },
      authInfo: { resCode: 200, resDesc: "" },
      showAppUpdateModal: false,
      versionInfo: {},
      showModalOffline: false,
      appState: AppState.currentState,
    };
  }

  tabIndicatorLeft = 0;
  widthItemOne = 0;

  handleBackButton = () => {
    return true;
  };

  async componentDidMount() {
    this.backhandler = BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackButton
    );

    // important : Update host if it is old
    const dev = this.props.devReducer.dev;

    if (dev == null) {
      Storage.getUrlsInfo().then((data) => {
        if (data.dev) {
          this.props.setDEV(data.dev);
        } else {
          this.props.setDEV(false);
        }
      });
    }

    console.log("server checking");
    const serverInfo = await Storage.getServerStatus();
    const user = await Storage.getUserInfo();
    const deviceInfo = await Storage.getDeviceInfo();
    const loginInfo = await Storage.getUser();

    await checkVersion()
      .then((result) => {
        this.setState({ versionInfo: result }, () => {
          console.log("version check:", result);
          if (result.needsUpdate == true) {
            this.setState({ showAppUpdateModal: true });
          }
        });
      })
      .catch((err) => console.error(err));

    this.getNewsAnnouncementData(user.ID, user.SchoolID);

    if (!Constant.isRunning) {
      //getAllUsers from Local DB
      await getAllUserInfo();
    }

    this.CheckPrivacyStatus(user.ID, user.SchoolID, user.token);
    let routes = [
      {
        key: "userInfo",
        title: "",
        icon_def: Images.n_ic_userinfo_default,
        icon_sel: Images.n_ic_userinfo_select,
      },
      {
        key: "attendance",
        title: "",
        icon_def: Images.n_ic_attend_default,
        icon_sel: Images.n_ic_attend_select,
      },
    ];
    const isStudent = (user.StudentId ?? "") !== "";
    if (isStudent) {
      this.calcTabIndicatorLeft(3);
      routes.push({
        key: "health",
        title: "",
        icon_def: Images.n_ic_health_default,
        icon_sel: Images.n_ic_health_select,
      });
    } else {
      this.calcTabIndicatorLeft(2);
    }
    this.setState({
      selectedTabIndex: 0,
      tabRoutes: routes,
      serverInfo: serverInfo,
      deviceInfo: deviceInfo,
      loginInfo: loginInfo,
    });

    let db = null;
    db = await getDBConnection();
    await createUserTable(db);
    AppState.addEventListener("change", this._handleAppStateChange);

    this.willFocusSubscription = this.props.navigation.addListener(
      "willFocus",
      () => {
        this.getNewsAnnouncementData(user.ID, user.SchoolID);
      }
    );
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.isFocused !== this.props.isFocused &&
      this.props.isFocused === true
    ) {
      this.loadUserInfo();
    }
  }

  componentWillUnmount = () => {
    if (this.backhandler) {
      this.backhandler.remove();
    }

    if (this.unsubscribe) {
      this.unsubscribe && this.unsubscribe();
      this.willFocusSubscription();
    }
    AppState.removeEventListener("change", this._handleAppStateChange);
  };

  _handleAppStateChange = (nextAppState) => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      console.log("App has come to the foreground!");
      Constant.isRunning = false;
      this.loadUserInfo();
      this.getNewsAnnouncementData(
        this.state.userInfo.ID,
        this.state.userInfo.SchoolID
      );
    }
    this.setState({ appState: nextAppState });
  };

  closeApp = () => {
    if (Platform.OS === "ios") {
      RNExitApp.exitApp();
    } else {
      BackHandler.exitApp();
    }
  };

  onRefresh() {
    this.setState({ isFetching: true }, () => {
      this.loadUserInfo();
      this.getNewsAnnouncementData(
        this.state.userInfo.ID,
        this.state.userInfo.SchoolID
      );
    });
  }

  calcTabIndicatorLeft(cnt) {
    const screenWidth = Dimensions.get("window").width;

    this.widthItemOne = screenWidth / (2 + cnt);

    // const realTabWidth = screenWidth - (48*2) - (22*2) + (3*2) // 25: padding of Topbar,  48: width of Navbar icon and notification icon, 3: margin of topbar
    const realTabWidth = this.widthItemOne * cnt;
    const itemWidth = realTabWidth / cnt;
    const itemCentwerWidth = itemWidth / 2;
    this.tabIndicatorLeft = itemCentwerWidth - 15; //50 is Width of Indicator
  }

  getUnreadCountForAddedProfile = () => {
    for (let j = 0; j < Constant.AddProfiles.length; ++j) {
      ApiManager.getHomeTotalUnreadCount(Constant.AddProfiles[j].userid)
        .then((count) => {
          Constant.AddProfiles[j].unreadcnt = count;
        })
        .catch((error) => {
          console.log("getUnreadCountForAddedProfile", error);
        });
    }
  };

  checkAuthStatus = (userid, token, deviceToken) => {
    ApiManager.checkAuthStatus(userid, token, deviceToken)
      .then((res) => {
        this.setState({ authInfo: res });
        if (res.resCode == "500") {
          this.props.navigation.navigate("SystemError", {
            thText: res.resDescTH,
            enText: res.resDesc,
          });
        }
      })
      .catch((error) => {
        console.log("checkAuthStatus", error);
      });
  };

  CheckPrivacyStatus = (userId, schoolId, token) => {
    console.log("CheckPrivacyStatus:", userId);
    ApiManager.CheckPrivacyStatus(userId)
      .then(async (data) => {
        if (data.Status) {
          const result = await CheckVerification.checkVerification(
            schoolId,
            userId
          );
          if (result.verifyNeed) {
            this.props.navigation.navigate("VerifyStart");
          } else {
            const result1 = await CheckVerification.checkVerificationDevice(
              token,
              userId,
              schoolId
            );
            if (!result1) {
              this.logOut();
              this.props.navigation.navigate("Auth");
            } else {
              const loginInfo = await Storage.getUser();
              if (loginInfo.forceResetPassword) {
                this.props.navigation.navigate("UpdatePassword", {
                  parent: "Login",
                });
              } else {
                this.loadUserInfo();
              }
            }
          }
        } else {
          const param = {
            userID: userId,
            schoolID: schoolId,
            content: data.PolicyMessage,
            parent: "App",
          };
          this.props.navigation.navigate("PrivacyPolicy", param);
        }
      })
      .catch((error) => {
        console.log("CheckPrivacyStatus", error);
      });
  };

  loadUserInfo = () => {
    this.setState({ isLoading: true });
    Storage.getUser()
      .then((user) => {
        const userId = user.ID;
        const schoolId = user.SchoolId;
        const token = user.token;
        const deviceToken = this.state.deviceInfo.fcmtoken;

        this.checkAuthStatus(userId, token, deviceToken);
        this.getUnreadCountForAddedProfile();

        return ApiManager.getUserInfo(userId, schoolId);
      })
      .then((userInfo) => {
        this.setState({ userInfo: userInfo, isLoading: false });
        this.loadUnreadMessageCount(userInfo.ID);
      })
      .catch((error) => {
        this.setState({ isLoading: false });
      });
    this.setState({ isFetching: false });
  };

  refreshUserInfo = () => {
    this.setState({ isLoading: true });
    Storage.getUser()
      .then((user) => {
        const userId = user.ID;
        const token = user.token;
        const deviceToken = this.state.deviceInfo.fcmtoken;
        this.checkAuthStatus(userId, token, deviceToken);
        this.getUnreadCountForAddedProfile();
        this.setState({ isLoading: false });
        this.loadUnreadMessageCount(user.ID);
        this.CheckPrivacyStatus(user.ID, user.SchoolID, user.token);
      })
      .catch((error) => {
        console.log("refreshUserInfo", error);
        this.setState({ isLoading: false });
      });
    this.setState({ isFetching: false });
  };

  getNewsAnnouncementData = async (userId, schoolId) => {
    ApiManager.getAnnouncementInfo(userId, schoolId)
      .then((res) => {
        if (res.data) {
          const dlgImg = res.data.popupAttach;
          const bannerImgs = res.data.bannerAttach;
          let adID = "";
          if (res.data.id && res.data.id.length > 0) {
            adID = res.data.id[0];
          }
          this.setState({ bannerImages: bannerImgs });
          if (!Constant.isRunning) {
            Storage.getAnnouncementState().then((announcementState) => {
              let showADDlg = false;
              if (announcementState) {
                if (announcementState.length > 0) {
                  const idx = announcementState.findIndex(
                    (item) => item.userID == userId
                  );
                  if (idx >= 0) {
                    if (announcementState[idx].ID != adID) {
                      showADDlg = true;
                    }

                    if (announcementState[idx].showDlg) {
                      showADDlg = true;
                    }
                  } else {
                    showADDlg = true;
                  }
                } else {
                  showADDlg = true;
                }
              } else {
                showADDlg = true;
              }

              if (dlgImg.length <= 0) {
                showADDlg = false;
              }

              this.setState({
                bannerImages: bannerImgs,
                dlgImg: dlgImg,
                ADId: adID,
                showAdvertiseModal: showADDlg,
              });
            });
            Constant.isRunning = true;
          }
        } else {
          Storage.setAnnouncementState(null);
        }
      })
      .catch((error) => {
        console.log("getNewsAnnouncementData", error);
      });
  };

  loadUnreadMessageCount = (userId) => {
    ApiManager.getHomeTotalUnreadCount(userId)
      .then((count) => {
        this.setState({ unreadCount: count });
      })
      .catch((error) => {
        console.log("loadUnreadMessageCount", error);
      });
  };

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
  };

  logOut = async () => {
    StorageManager.setVerifyFlag(false);

    const { loginInfo, deviceInfo } = this.state;

    try {
      await CheckVerification.logoutUser(loginInfo, deviceInfo);
      this.props.navigation.navigate("Auth");
    } catch (error) {
      console.error(error);
      this.setState({
        isLoading: false,
        showModal: true,
        modalBody: translang.t("ERROR_OCCURED_TRY_AGAIN"),
      });
    }
  };

  clickAuthStatus = () => {
    const { authInfo } = this.state;
    console.log("clickAuthStatus", authInfo.resCode);

    if (authInfo.resCode == "301") {
      this.logOut();
    } else if (authInfo.resCode == "300") {
      this.props.navigation.navigate("UpdatePassword", { parent: "App" });
    } else if (authInfo.resCode == "401") {
      this.logOut();
    } else if (authInfo.resCode == "402") {
      this.logOut();
    }
  };

  clickAppUpdate = () => {
    this.setState({ showAppUpdateModal: false }, () => {
      if (this.state.versionInfo.url) {
        Linking.openURL(this.state.versionInfo.url);
      }
    });
  };

  renderTabBar = (props) => {
    return (
      <View>
        <View style={{ ...styles.navContainer }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              width: this.widthItemOne,
            }}
          >
            <TouchableOpacity
              onPress={() => this.toggleDrawer()}
              style={styles.iconContainer}
            >
              <Image source={Images.n_ic_nav} style={styles.iconimg} />
            </TouchableOpacity>
          </View>

          <TabBar
            {...props}
            style={{ ...styles.tabBar }}
            renderIcon={({ route, focused, color }) => (
              <Image
                source={focused ? route.icon_sel : route.icon_def}
                style={styles.iconimg}
              />
            )}
            indicatorStyle={{
              ...styles.tabBarIndicator,
              left: this.tabIndicatorLeft,
            }}
            // indicatorStyle={{...styles.tabBarIndicator}}
            indicatorContainerStyle={{
              flexDirection: "row",
              justifyContent: "center",
            }}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              width: this.widthItemOne,
            }}
          >
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate("Notification")}
              style={styles.iconContainer}
            >
              <Image source={Images.n_ic_bell} style={styles.iconimg} />
              {this.state.unreadCount > 0 && (
                <View style={styles.notificntContainer}>
                  <Text style={styles.notificount}>
                    {this.state.unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{ width: "100%", height: 2, backgroundColor: "#EFEFEF" }}
        ></View>
      </View>
    );
  };

  renderUserInfoTab = () => (
    <UserInfoTab
      navigation={this.props.navigation}
      isSelected={this.state.selectedTabIndex === 0}
      onRefresh={() => {
        this.onRefresh();
      }}
      bannerImages={this.state.bannerImages}
      userInfo={this.state.userInfo}
    />
  );

  renderAttendanceTab = () => (
    <AttendanceTab isSelected={this.state.selectedTabIndex === 1} />
  );

  renderHealthTab = () => (
    <HealthTab
      navigation={this.props.navigation}
      isSelected={this.state.selectedTabIndex === 2}
    />
  );

  clickRemember = (val) => {
    this.setState({ rememberVal: val });
  };
  closeAnnouncement = async () => {
    let currentADStatus = await Storage.getAnnouncementState();
    this.setState({ showAdvertiseModal: false }, () => {
      const addata = {
        ID: this.state.ADId,
        showDlg: !this.state.rememberVal,
        userID: this.state.userInfo.ID,
      };
      if (currentADStatus && currentADStatus.length > 0) {
        const idx = currentADStatus.findIndex(
          (item) => item.userID == this.state.userInfo.ID
        );
        if (idx >= 0) {
          currentADStatus[idx] = addata;
        } else {
          currentADStatus.push(addata);
        }
      } else {
        currentADStatus = [addata];
      }

      Storage.setAnnouncementState(currentADStatus);
    });
  };

  render() {
    const initialLayout = { width: Dimensions.get("window").width };

    const isAuthDlg = this.state.authInfo.resCode == 200 ? false : true;

    return (
      <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
        <View style={{ flex: 1 }}>
          <TabView
            style={styles.tabView}
            navigationState={{
              index: this.state.selectedTabIndex,
              routes: this.state.tabRoutes,
            }}
            renderTabBar={this.renderTabBar}
            renderScene={({ route }) => {
              switch (route.key) {
                case "userInfo":
                  return this.renderUserInfoTab();
                case "attendance":
                  return this.renderAttendanceTab();
                case "health":
                  return this.renderHealthTab();
              }
            }}
            onIndexChange={(index) =>
              this.setState({ selectedTabIndex: index })
            }
            initialLayout={initialLayout}
            swipeEnabled={false}
          />
        </View>
        <ProgressHud isVisible={this.state.isLoading} />

        <AdvertiseModal
          isVisible={this.state.showAdvertiseModal}
          images={this.state.dlgImg}
          buttonColors={[
            Color.n_button_gradient_green_start,
            Color.n_button_gradient_green_end,
          ]}
          isVerticalGradient={false}
          rememberVal={this.state.rememberVal}
          onRemember={(value) => this.clickRemember(value)}
          onClose={() => {
            this.closeAnnouncement();
          }}
        />

        <PermissionModal
          isVisible={isAuthDlg}
          image={Images.n_ic_warning}
          showCancelButton={false}
          message={
            getCurrentLocale() == "en"
              ? this.state.authInfo.resDesc
              : this.state.authInfo.resDescTH
          }
          onClose={() => {
            this.setState({ isAuthDlg: false });
          }}
          onConfirm={() => {
            this.clickAuthStatus();
          }}
        />

        <AppUpdateModal
          isVisible={this.state.showAppUpdateModal}
          image={Images.n_ic_warning}
          showCancelButton={true}
          message={translang.t("NEED_UPDATE_APP")}
          onClose={() => {
            this.setState({ showAppUpdateModal: false });
          }}
          onConfirm={() => {
            this.clickAppUpdate();
          }}
        />

        <AlertWithImageOfflineModal
          isVisible={this.state.showModalOffline}
          image={Images.n_ic_warning}
          message={translang.t("ALERT_OFFLINE")}
          buttonColors={[
            Color.n_button_gradient_orange_start,
            Color.n_button_gradient_orange_end,
          ]}
          isVerticalGradient={false}
          onClose={() => {
            this.setState({ showModalOffline: false }, () => {
              this.closeApp();
            });
          }}
        />

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
                  <Text
                    style={{
                      fontFamily: "THSarabunNew",
                      fontSize: 18,
                      color: "white",
                      textAlign: "center",
                      marginTop: 10,
                    }}
                  >
                    {translang.t("NOTIFY_TITLE")}
                  </Text>
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
                    {this.state.serverInfo.Message ??
                      translang.t("SERVER_NOTIFY")}
                  </Text>
                  {/* <Text style={{color: 'white', fontSize: 18,}}>{translang.t('SERVER_NOTIFY')}</Text> */}
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

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
  menuContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  menuItem: {
    flexDirection: "row",
    marginVertical: 6,
  },
  tabBar: {
    backgroundColor: Color.white,
    flex: 1,
    height: 50,
    shadowColor: Color.transparent,
    // shadowColor: Color.transparent,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.0,
    elevation: 0,
  },
  tabBarIndicator: {
    backgroundColor: Color.n_default_orange,
    height: 4,
    width: 30,
  },

  tabView: {
    flex: 1,
  },
  iconimg: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
  notificntContainer: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Color.n_default_orange,
    position: "absolute",
    top: 12,
    right: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  notificount: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "bold",
    color: Color.white,
  },
  iconContainer: {
    width: 48,
    height: 60,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  navContainer: {
    padding: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 68,
    marginTop: -3,
    marginHorizontal: -3,

    // shadowColor: 'black',
    // shadowOffset: {
    //   width: 0,
    //   height: 3,
    // },
    // shadowOpacity: 0.3,
    // elevation: 3,
    borderBottomRightRadius: 0,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "red",
  },
  dialogStyle: {
    width: "100%",
    height: "100%",
    // height: dimension.px180,
    flexDirection: "column",
    borderRadius: 20,
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(UserInfoScreen));
