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
import UserInfoTab1 from "./UserInfoTab1";
import HealthTab from "./HealthTab";
import ServicesTab from "./ServicesTab";
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
import { gotoPageAfterAuth } from "../../constants/functions";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  setDEV,
  setIsEditStatus,
  setTabIndex,
  setUserInfo,
  setLoginInfo,
} from "../../redux/actions";
import SelectAttendanceModal from "../../components/SelectListModalNoTitle";
import moment from "moment";
import arrayWithHoles from "@babel/runtime/helpers/esm/arrayWithHoles";
import { getUniqueId } from "react-native-device-info";
import TravelUpdater from "../SchoolBus/Teacher/TravelUpdater";

class UserInfoScreen1 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTabIndex: 0,
      tabRoutes: [
        {
          key: "userInfo",
          title: translang.t("HOME"),
          icon_def: Images.n_ic_userinfo_default,
          icon_sel: Images.n_ic_userinfo_select,
        },
        {
          key: "statistics",
          title: translang.t("statistics"),
          icon_def: Images.n_ic_attend_default,
          icon_sel: Images.n_ic_attend_select,
        },
        {
          key: "services",
          title: translang.t("services"),
          icon_def: Images.n_services_def,
          icon_sel: Images.n_services_sel,
        },
        {
          key: "setting",
          title: translang.t("DRAWER_setting"),
          icon_def: Images.n_setting_sel,
          icon_sel: Images.n_setting_sel,
        },
      ],
      isLoading: false,
      isLoadingModal: false,
      isFirstLoading: false,
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
      isStudent: false,
      showAttendanceSelectModal: false,
    };
    this.mounted = false;
  }

  tabIndicatorLeft = 0;
  widthItemOne = 0;

  handleBackButton = () => {
    return true;
  };

  async componentDidMount() {
    this.mounted = true;
    if (this.mounted) {
      this.setState({ isFirstLoading: true });
    }

    this.backhandler = BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackButton
    );

    const user = await Storage.getUserInfo();
    const deviceInfo = await Storage.getDeviceInfo();
    const loginInfo = await Storage.getUser();

    if (!Constant.isRunning) {
      //getAllUsers from Local DB
      await getAllUserInfo();
    }

    await this.initializeDev();
    await this.checkServerStatus(user.ID, user.SchoolID);
    await this.loadUserData(user, deviceInfo, loginInfo);
    await this.checkAppVersion();
    await this.getNewsAnnouncementData(user.ID, user.SchoolID);
    await this.CheckPrivacyStatus(user.ID, user.SchoolID, user.token);

    let db = await getDBConnection();
    await createUserTable(db);
    AppState.addEventListener("change", this._handleAppStateChange);

    this.setState({ isFirstLoading: false });

    this.willFocusSubscription = this.props.navigation.addListener(
      "willFocus",
      () => {
        this.getNewsAnnouncementData(user.ID, user.SchoolID);
      }
    );
  }

  getUrls = async (dev) => {
    try {
      let urlsInfo = {};
      urlsInfo["dev"] = dev;
      let res = await ApiManager.GetAPIUrls("Payment API");
      if (res.length) {
        urlsInfo["payment"] = res[0];
      }
      res = await ApiManager.GetAPIUrls("Schoolbright API");
      console.log("payment api response: ", res);
      if (res.length) {
        urlsInfo["schoolbright"] = res[0];
      }
      StorageManager.setUrlsInfo(urlsInfo);
    } catch (e) {
      console.log(e);
    }
  };

  componentDidUpdate(prevProps) {
    if (
      prevProps.isFocused !== this.props.isFocused &&
      this.props.isFocused === true
    ) {
      this.loadUserInfo();
    }
  }

  componentWillUnmount = () => {
    this.mounted = false;
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

  initializeDev = async () => {
    try {
      const dev = this.props.devReducer?.dev;
      let data = await Storage.getUrlsInfo();
      console.log("data:", data);
      if (data && data.schoolbright) {
        const { schoolbright } = data;

        if (
          !schoolbright.ProdURL ||
          schoolbright.ProdURL === "https://api.schoolbright.co/" ||
          schoolbright.ProdURL === "https://api.schoolbright.co"
        ) {
          this.getUrls(data.dev || false);
        }
      } else {
        this.getUrls((data && data.dev) || false);
      }

      if (dev == null) {
        if (this.mounted) {
          this.props.setDEV(data.dev || false);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  checkServerStatus = async (userId, schoolId) => {
    try {
      const res = await ApiManager.checkServerStatus();
      if (this.mounted) {
        this.setState({ serverInfo: res });
        Storage.setServerStatus(res);
      }
    } catch (error) {
      console.log("CheckServer", error);
      if (this.mounted) {
        const offlineStatus = {
          Message: translang.t("ALERT_OFFLINE"),
          StatusCode: 0,
        };
        this.setState({ serverInfo: offlineStatus });
        Storage.setServerStatus(offlineStatus);
      }
    }
  };

  loadUserData = async (user, deviceInfo, loginInfo) => {
    if (this.mounted) {
      this.props.setUserInfo(user);
      this.props.setLoginInfo(loginInfo);
      this.setState({
        selectedTabIndex: 0,
        deviceInfo,
        loginInfo,
        isStudent: (user.StudentId ?? "") !== "",
      });
    }
  };

  checkAppVersion = async () => {
    try {
      const result = await checkVersion();
      this.setState({ versionInfo: result }, () => {
        if (result.needsUpdate && this.mounted) {
          this.setState({ showAppUpdateModal: true });
        }
      });
    } catch (err) {
      console.error(err);
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
        if (this.mounted) {
          this.setState({ authInfo: res, isLoadingModal: false });
        }

        if (res.resCode == "400") {
          this.props.navigation.navigate("SystemError", {
            thText: res.resDescTH,
            enText: res.resDesc,
          });
        }
      })
      .catch((error) => {
        if (this.mounted) {
          this.setState({ isLoadingModal: false });
        }

        console.log("checkAuthStatus", error);
      });
  };

  CheckPrivacyStatus = async (userId, schoolId, token) => {
    try {
      const deviceInfo = await StorageManager.getDeviceInfo();
      const imei = getUniqueId();
      const verification_status = await ApiManager.getVerification(
        deviceInfo.fcmtoken,
        userId,
        schoolId,
        imei
      );
      const { authentication, verify, policy } = verification_status;

      console.log("authenticaion:", authentication);
      console.log("verify:", verify);
      console.log("policy.Status:", policy.Status);
      this.setState({ authInfo: authentication, isLoadingModal: false });
      if (authentication.resCode == "400") {
        this.props.navigation.navigate("SystemError", {
          thText: authentication.resDescTH,
          enText: authentication.resDesc,
        });
        return;
      }

      if (policy.Status) {
        await this.handleLoginInfo();
      } else {
        this.navigateToPrivacyPolicy(userId, schoolId, policy.PolicyMessage);
      }
    } catch (error) {
      console.log("error:", error);
      const offlineStatus = {
        Message: translang.t("ALERT_OFFLINE"),
        StatusCode: 0,
      };
      this.setState({ serverInfo: offlineStatus, isLoadingModal: false });
      Storage.setServerStatus(offlineStatus);
    }
  };

  handleVerification = async (schoolId, userId, token, verify) => {
    const { user, device } = verify;
    console.log("user:", user);
    const verifyNeed =
      user.email.result.code != 100 &&
      user.phone.result.code != 100 &&
      user.line.result.code != 100;
    if (verifyNeed) {
      this.props.navigation.navigate("VerifyStart");
    } else {
      await this.handleDeviceVerification(token, userId, schoolId, device);
    }
  };

  handleDeviceVerification = async (token, userId, schoolId, device) => {
    if (device.StatusCode != "200") {
      this.logOut();
      this.props.navigation.navigate("Auth");
    } else {
      await this.handleLoginInfo();
    }
  };

  handleLoginInfo = async () => {
    const loginInfo = await Storage.getUser();
    console.log("loginInfo.forceResetPassword:", loginInfo.forceResetPassword);
    if (loginInfo.forceResetPassword) {
      this.props.navigation.navigate("UpdatePassword", { parent: "Login" });
    } else {
      this.loadUserInfo();
    }
  };

  navigateToPrivacyPolicy = (userId, schoolId, policyMessage) => {
    const param = {
      userID: userId,
      schoolID: schoolId,
      content: policyMessage,
      parent: "App",
    };
    this.props.navigation.navigate("PrivacyPolicy", param);
  };

  loadUserInfo = () => {
    if (this.mounted) {
      this.setState({ isLoading: true });
    }

    Storage.getUser()
      .then((user) => {
        const userId = user.ID;
        const schoolId = user.SchoolId;
        const token = user.token;
        const deviceToken = this.state.deviceInfo.fcmtoken;
        // this.checkAuthStatus(userId, token, deviceToken);
        this.getUnreadCountForAddedProfile();
        return ApiManager.getUserInfo(userId, schoolId);
      })
      .then((userInfo) => {
        if (this.mounted) {
          this.setState({ userInfo: userInfo, isLoading: false });
        }

        // this.loadUnreadMessageCount(userInfo.ID);
      })
      .catch((error) => {
        if (this.mounted) {
          this.setState({ isLoading: false });
        }
      });
    if (this.mounted) {
      this.setState({ isFetching: false });
    }
  };

  refreshUserInfo = async () => {
    this.setState({ isLoading: true });
    try {
      const user = Storage.getUser();
      const userId = user.ID;
      const token = user.token;
      const deviceToken = this.state.deviceInfo.fcmtoken;
      // this.checkAuthStatus(userId, token, deviceToken);
      this.getUnreadCountForAddedProfile();
      this.setState({ isLoading: false });
      this.loadUnreadMessageCount(user.ID);
      this.CheckPrivacyStatus(user.ID, user.SchoolID, user.token);
    } catch (error) {
      console.log("refreshUserInfo", error);
      this.setState({ isLoading: false });
    }
    this.setState({ isFetching: false });
  };

  getNewsAnnouncementData = async (userId, schoolId) => {
    try {
      const res = await ApiManager.getAnnouncementInfo(userId, schoolId);
      if (res.data) {
        this.handleAnnouncementData(res.data, userId);
      } else {
        Storage.setAnnouncementState(null);
      }
    } catch (error) {
      console.log("getNewsAnnouncementData", error);
    }
  };

  handleAnnouncementData = async (data, userId) => {
    const dlgImg = data.popupAttach;
    const bannerImgs = data.bannerAttach;
    const adID = data.id && data.id.length > 0 ? data.id[0] : "";

    if (this.mounted) {
      this.setState({ bannerImages: bannerImgs });
    }

    if (!Constant.isRunning) {
      const announcementState = await Storage.getAnnouncementState();
      const showADDlg = this.shouldShowAdDialog(
        announcementState,
        userId,
        adID,
        dlgImg
      );

      if (this.mounted) {
        this.setState({
          bannerImages: bannerImgs,
          dlgImg: dlgImg,
          ADId: adID,
          showAdvertiseModal: showADDlg,
        });
      }

      Constant.isRunning = true;
    }
  };

  shouldShowAdDialog = (announcementState, userId, adID, dlgImg) => {
    let showADDlg = false;

    if (announcementState) {
      if (announcementState.length > 0) {
        const idx = announcementState.findIndex(
          (item) => item.userID === userId
        );
        if (idx >= 0) {
          if (
            announcementState[idx].ID !== adID ||
            announcementState[idx].showDlg
          ) {
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

    return showADDlg;
  };

  loadUnreadMessageCount = (userId) => {
    ApiManager.getHomeTotalUnreadCount(userId)
      .then((count) => {
        if (this.mounted) {
          this.setState({ unreadCount: count });
        }
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

  onAttendanceOptionSelect = (item) => {
    this.setState({ showAttendanceSelectModal: false });
    if (item === null) return;
    if (item.title === translang.t("CHECKIN_ATTENDANCE")) {
      gotoPageAfterAuth(1, 3, "AttendanceCheckIn", {}, this);
    } else if (item.title === translang.t("TAKE_CLASS_ATTENDANCE")) {
      gotoPageAfterAuth(2, 9, "ClassAttendTake", {}, this);
    } else if (item.title === translang.t("CHECKOUT_ATTENDANCE")) {
      gotoPageAfterAuth(1, 34, "AttendanceCheckOut", {}, this);
    } else if (item.title === translang.t("EDIT_ATTENDANCE")) {
      gotoPageAfterAuth(1, 10, "AttendanceEditCheckin", {}, this);
    }
  };

  clickAuthStatus = () => {
    const { authInfo, loginInfo, deviceInfo } = this.state;

    if (authInfo.resCode == "301") {
      this.logOut();
    } else if (authInfo.resCode == "302") {
      this.logOut();
    } else if (authInfo.resCode == "300") {
      this.props.navigation.navigate("UpdatePassword", { parent: "App" });
    } else if (authInfo.resCode == "402") {
      this.logOut();
    } else if ((authInfo.resCdoe = "500")) {
      this.setState(
        { isLoadingModal: true, authInfo: { resCode: "200" } },
        () => {
          this.checkAuthStatus(
            loginInfo.ID,
            loginInfo.token,
            deviceInfo.fcmtoken
          );
        }
      );
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
    const renderTab = (route, i) => {
      const selected = this.props.devReducer.tabIndex === i;
      return (
        <View
          style={{ flexDirection: "row", justifyContent: "center" }}
          key={i}
        >
          <TouchableOpacity
            onPress={() => {
              if (i === 3) {
                this.props.navigation.navigate("Setting");
              } else {
                this.props.setIsEditStatus(false);
                this.props.setTabIndex(i);
              }
            }}
            style={styles.iconContainer}
          >
            <Image
              source={selected ? route.icon_sel : route.icon_def}
              style={styles.iconImg}
            />
            <Text style={[styles.tabTitle, selected && styles.tabBarIndicator]}>
              {route.title}
            </Text>
          </TouchableOpacity>
        </View>
      );
    };
    const { isStudent } = this.state;
    return (
      <View style={{ ...styles.navContainer }}>
        {props.navigationState.routes.map((route, i) => {
          return i < 2 && renderTab(route, i);
        })}
        <TouchableOpacity
          onPress={() => {
            isStudent
              ? this.props.navigation.navigate("Topup")
              : this.setState({ showAttendanceSelectModal: true });
          }}
        >
          <LinearGradient
            colors={["#ff822c", "#ffa6a4"]}
            style={styles.centerTab}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Image
              source={isStudent ? Images.i_top_up : Images.edit_pencil}
              style={isStudent ? styles.iconImgTopUp : styles.iconImg}
            />
            <Text style={styles.centerTabText}>
              {isStudent ? translang.t("topUp") : translang.t("check_in_out")}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        {props.navigationState.routes.map((route, i) => {
          return i > 1 && renderTab(route, i);
        })}
      </View>
    );
  };

  renderUserInfoTab = (jumpTo) => (
    <UserInfoTab1
      navigation={this.props.navigation}
      isSelected={this.props.devReducer.tabIndex === 0}
      onRefresh={() => {
        this.onRefresh();
      }}
      bannerImages={this.state.bannerImages}
      jumpTo={jumpTo}
    />
  );

  renderAttendanceTab = (jumpTo) => (
    <AttendanceTab
      isSelected={this.props.devReducer.tabIndex === 1}
      jumpTo={jumpTo}
    />
  );

  renderServicesTab = (jumpTo) => (
    <ServicesTab
      navigation={this.props.navigation}
      isSelected={this.props.devReducer.tabIndex === 2}
      jumpTo={jumpTo}
      isEditStatus={false}
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

    const isAuthDlg =
      this.state.authInfo.resCode == 200 || this.state.authInfo.resCode == 400
        ? false
        : true;

    return (
      <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
        <TravelUpdater />
        <View style={{ flex: 1 }}>
          <TabView
            style={styles.tabView}
            navigationState={{
              index: this.props.devReducer.tabIndex,
              routes: this.state.tabRoutes,
            }}
            renderTabBar={this.renderTabBar}
            tabBarPosition={"bottom"}
            renderScene={({ route, jumpTo }) => {
              switch (route.key) {
                case "userInfo":
                  return this.renderUserInfoTab(jumpTo);
                case "statistics":
                  return this.renderAttendanceTab(jumpTo);
                case "services":
                  return this.renderServicesTab(jumpTo);
                case "setting":
                  return;
              }
            }}
            onIndexChange={(index) => {
              this.props.setTabIndex(index);
            }}
            initialLayout={initialLayout}
            swipeEnabled={false}
          />
        </View>

        <ProgressHud
          isVisible={
            this.state.isLoading ||
            this.state.isLoadingModal ||
            this.state.isFirstLoading
          }
        />

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
          confirmButtonText={
            this.state.authInfo.resCode == 500
              ? translang.t("TRY_AGAIN")
              : translang.t("COMMON_confirm")
          }
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

        <SelectAttendanceModal
          isVisible={this.state.showAttendanceSelectModal}
          onListSelect={this.onAttendanceOptionSelect}
          listData={[
            { title: translang.t("CHECKIN_ATTENDANCE") },
            { title: translang.t("TAKE_CLASS_ATTENDANCE") },
            { title: translang.t("CHECKOUT_ATTENDANCE") },
          ]}
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

  tabBarIndicator: {
    borderBottomColor: Color.n_default_orange,
    borderBottomWidth: 2,
  },
  tabTitle: {
    fontWeight: "bold",
    fontSize: "16@ms0.7",
    marginTop: "2@ms0.8",
    color: Color.text_black,
  },

  tabView: {
    flex: 1,
  },
  iconImg: {
    width: "24@s",
    height: "24@s",
    resizeMode: "contain",
  },
  iconImgTopUp: {
    width: "26@s",
    height: "29@s",
    resizeMode: "contain",
  },
  iconContainer: {
    width: "60@s",
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  navContainer: {
    padding: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: "70@ms0.8",
    paddingHorizontal: "20@ms0.8",
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 30,
    zIndex: 3,
    borderRadius: "16@ms0.7",
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    backgroundColor: Color.white,
    marginTop: -10,
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

  centerTab: {
    width: "84@ms0.8",
    height: "84@ms0.8",
    borderRadius: "70@s",
    marginTop: "-30@ms0.8",
    justifyContent: "center",
    alignItems: "center",
  },
  centerTabText: {
    color: "white",
    fontSize: "16@ms0.7",
    marginTop: "3@ms0.8",
    fontWeight: "bold",
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
      setIsEditStatus,
      setTabIndex,
      setUserInfo,
      setLoginInfo,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(UserInfoScreen1));
