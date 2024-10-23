import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    ActivityIndicator,
    LogBox,
    Dimensions,
} from 'react-native';
import {Platform} from 'react-native';
import _ from 'lodash';
import I18n from 'react-native-i18n';
import {getUniqueId, getModel} from 'react-native-device-info';
import Storage from './managers/StorageManager';
import translang, {setLocale} from './utils/language.utils';
import ApiManager from '../src/managers/ApiManager';
import analytics, {firebase} from '@react-native-firebase/analytics';
import VersionCheck from 'react-native-version-check';
import {getOneUserInfo, removeUser, updatePassword} from './utils/DBManager';
import {getCurrentLocale} from './utils/language.utils';
import messaging from '@react-native-firebase/messaging';
import PushNotification from "react-native-push-notification";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import Constant from './constants/constants';
import crashlytics from '@react-native-firebase/crashlytics';


import {connect} from 'react-redux';
import {bindActionCreators} from "redux";
import {setGoVerifyLineSuccess} from "./redux/actions";
import CheckVerification from "./components/CheckVerification";
import Color from "./constants/color";


const screenWidth = Dimensions.get('window').width;
const drawerWidth = 0;

//console.disableYellowBox = true;
LogBox.ignoreAllLogs(true); //Ignore all log notifications

class AuthLoadingScreen extends Component {
    isMounted = false;

    constructor() {
        super();
    }

    componentDidMount() {
        this._bootstrapAsync();
    }

    componentWillUnmount() {
    }


    _bootstrapAsync = async () => {
        Constant.isRunning = false;

        const dLang = await Storage.getLanguage();

        //DEVICE INFO
        const currentDeviceInfo = await Storage.getDeviceInfo();
        const imei = getUniqueId();
        const model = getModel();

        const system = Platform.OS;
        const version = VersionCheck.getCurrentVersion();


        if (dLang != "th" && dLang != "en") {
            setLocale(I18n.currentLocale());
        } else {
            setLocale(dLang);
        }

        // ApiManager.checkServerStatus()
        //     .then(res => {
        //         if (res) {
        //             Storage.setServerStatus(res);
        //         }
        //     })
        //     .catch(error => {
        //         console.log("CheckServer", error);
        //         Storage.setServerStatus({Message: translang.t('ALERT_OFFLINE'), StatusCode: 0});
        //     });

        const user = await Storage.getUser();
        const isFirstRun = await Storage.getFirstRunState();
        if (isFirstRun == null || !isFirstRun || isFirstRun == undefined) {
            this.props.navigation.navigate('Helper');
        } else {
            if (!_.isEmpty(user)) {
                // const device_verified = await CheckVerification.checkVerificationDevice('token', user.ID, user.SchoolId);
                // const result = await CheckVerification.checkVerification(user.SchoolId, user.ID);

                const deviceInfo = await Storage.getDeviceInfo();
                const verification_status = await ApiManager.getVerification(deviceInfo.fcmtoken, user.ID, user.SchoolId, imei);
                const {authentication, verify, policy} = verification_status;
                const {user:user_verify, device} = verify;

                const verifyNeed = (user_verify.email.result.code != 100) && (user_verify.phone.result.code != 100) && (user_verify.line.result.code != 100);


                if ((device.StatusCode != "200") || verifyNeed) {
                    this.logOut();
                } else {
                    if (this.props.devReducer.goVerifyLineSuccess) {
                        this.props.setGoVerifyLineSuccess(false);
                        this.props.navigation.navigate('VerifyLineSuccess');
                    } else if (currentDeviceInfo && currentDeviceInfo.version != version) {
                        this.props.navigation.navigate('App');
                    } else {
                        this.props.navigation.navigate(!_.isEmpty(user) ? 'App' : 'Auth');
                    }
                }
            } else {
                this.props.navigation.navigate('Auth');
            }
        }

        let token = "";

//for huawei
        try {
//Google Anyalstic
            await firebase.analytics().setAnalyticsCollectionEnabled(true);
            const appInstanceId = await analytics().getAppInstanceId();

//FIREBASE
            const authStatus = await messaging().requestPermission();
            if (authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL) {
                token = await messaging().getToken();
                console.log("fcm token:", token);
                token = await messaging().getToken();
                console.log("fcm token:", token);
                const self = this;

                PushNotification.configure({
                    onRegister: function (token) {
                        console.log("TOKEN:", token);
                    },
                    onNotification: async function (notification) {
                        if (notification.userInteraction) {
                            self.clickedPushNotifcation(notification);
                        } else {
                            if (Platform.OS == 'android') {
                                PushNotification.localNotification({
                                    title: notification.title, // (optional)
                                    message: notification.message, // (required)
                                    data: notification.data,
                                    channelId: "MY_CHANNEL_ID", // (required)
                                    smallIcon: '@mipmap/school_bright_icon_data'
                                });
                            }

                            if (notification.data.push_mtype == 401) {
                                const user = await Storage.getUser();
                                if (!_.isEmpty(user)) {
                                    await Storage.setUser({...user, isDeviceVerified: true});
                                }
                                self.props.navigation.navigate("App");
                            } else if (notification.data.push_mtype == 402) {
                                self.logOut();
                            }
                        }
                        notification.finish(PushNotificationIOS.FetchResult.NoData);
                    },
                    onRegistrationError: function (err) {
                        console.error("onRegistrationError", err.message, err);
                    },
                    permissions: {
                        alert: true,
                        badge: true,
                        sound: true,
                    },
                    popInitialNotification: true,
                    requestPermissions: true,
                });

                if (!Constant.isRunning) {
                    messaging().onMessage((msg) => {
                        const notification = msg.notification;
                        if (Platform.OS == 'ios') {
                            console.log("NOTIFICATION FOR IOS: ", notification);
                            PushNotificationIOS.addNotificationRequest({
                                id: msg.messageId,
                                title: notification.title,
                                body: notification.body,
                                userInfo: msg.data,
                            });
                        }
                    });

                    messaging().setBackgroundMessageHandler(async notification => {
                        if (notification.data.push_mtype == 401) {
                            console.log("device trust");
                            const user = await Storage.getUser();
                            if (!_.isEmpty(user)) {
                                await Storage.setUser({...user, isDeviceVerified: true});
                            }
                            self.props.navigation.navigate("App");
                        } else if (notification.data.push_mtype == 402) {
                            console.log("device not trust");
                            self.logOut();
                        }
                    });
                }
            }

        } catch (e) {
            token = 'aaaa';
        }

        const deviceInfo = {
            fcmtoken: token,
            imei: imei,
            system: system,
            version: version,
            model: model,
        }

        Storage.setDeviceInfo(deviceInfo);

        if (!_.isEmpty(user)) {
            ApiManager.saveDeviceInfo(token, user.ID, user.SchoolId, imei, system, version, model)
                .then(result => {
                    // console.log("Saved DeviceInfo", result);
                }).catch(error => {
                console.log("SaveDeviceInfoError", error);
            })
        }

//SETUP Crashlytics
        let userID = "001";
        if (!_.isEmpty(user)) {
            userID = user.ID
        }

        // await CheckVerification.logoutUser(user, deviceInfo);
        // this.props.navigation.navigate("Login");

        try {
            await crashlytics().setUserId(userID.toString());
        } catch (err) {
            console.log("FirebaseCrash: Setuser", err);
        }
    };

    clickedPushNotifcation = async (msg) => {
        const user = await Storage.getUser();
        if (!_.isEmpty(user)) {
            let messageid = "";
            let schoolID = "";
            let userID = "";
            let messageType = "";

            if (msg.data) {
                messageid = msg.data.push_mid;
                schoolID = msg.data.push_schoolid;
                userID = msg.data.push_userid;
                messageType = msg.data.push_mtype;

                this.checkPushNotification(messageid, schoolID, user, messageType);
            }
        }
    };

    checkPushNotification = (messageid, schoolID, user, messageType) => {
        const userid = user.ID;
        const school_id = schoolID;

        ApiManager.checkPushnotificationUrl(messageid, userid, school_id)
            .then(res => {
                if (res != user.ID) {
                    this.gotoProfile(res, messageid, schoolID);
                } else {
                    this.openMessage(userid, messageid, school_id);
                }
            }).catch(error => {
            console.log("checkPushnotificationUrl", error);
        });
    }

    gotoProfile = async (userid, messageid, schoolID) => {
        const item = await getOneUserInfo(userid);
        if (item != undefined) {
            ApiManager.signin(item.userloginid, item.userpassword, item.schoolID, getUniqueId(), '1.1.1.1')
                .then(async success => {
                    if (!success) {
                        const msg = translang.t('INCORRECT_USERNAME_PWD') + '\n' + translang.t('CONTACT_YOUER_SCHOOL_ADMIN');
                        return Promise.reject(msg);
                    } else {
                        const user = await Storage.getUser();
                        const userId = user.ID;
                        const schoolId = user.SchoolId;
                        return ApiManager.getUserInfo(userId, schoolId);
                    }
                })
                .then(() => {
                    this.openMessage(userid, messageid, schoolID);
                })
                .catch(err => {
                    console.log("gotoProfile", err);
                });
        } else {
            console.log("No Profile Info");
        }
    }

    openMessage = async (userid, messageid, schoolid) => {

        const lang = getCurrentLocale();
        const userInfo = await Storage.getUserInfo();

        ApiManager.readNewsMessage(userid, messageid, '', lang).then(detail => {
            if (detail.nType == 8 || detail.nType == -8) {
                console.log("Open Message1");
                this.props.navigation.navigate('LeaveRequestDetail', {
                    letterId: detail.nMessageID,
                    userInfo: userInfo,
                    from: 'App',
                    type: 'notification'
                });
            } else if (detail.nType == 7) {
                this.props.navigation.navigate('ReportExecutiveAttendance', {
                    parent: 'App',
                    date: detail.dSend,
                    userInfo: userInfo
                });
            } else if (detail.nType == 6) {
                this.props.navigation.navigate('OnlineStudentHomeworkDetailForNotification', {
                    parent: 'App',
                    homeworkID: detail.homework_id
                });
            } else {
                this.props.navigation.navigate('MessageHistoryForNotification', {userid: userid, detail: detail});
            }
        }).catch(error => {
            console.log("openMessage", error);
        });
    };

    logOut = async () => {
        const deviceInfo = await Storage.getDeviceInfo();
        const loginInfo = await Storage.getUser();
        const verifyType = await Storage.getVerifyType();

        const userId = loginInfo.ID;
        removeUser(userId).then();
        Constant.AddProfiles = Constant.AddProfiles.filter(item => item.userid != userId);

        if (verifyType == 'sub') {
            await Storage.removeUser().then();
            await Storage.removeUserInfo().then();
            const prevUser = await Storage.getPrevUser();
            const prevUserInfo = await Storage.getPrevUserInfo();
            await Storage.setUser(prevUser);
            await Storage.setUserInfo(prevUserInfo);
            this.props.navigation.navigate('App');
        } else {
            try {
                await CheckVerification.logoutUser(loginInfo, deviceInfo);
                this.props.navigation.navigate('Login');
            } catch (error) {
                console.error(error);
                this.setState({isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN')});
            }
        }
    }

    render() {
        return (

            <View style={styles.container}>
                <ActivityIndicator/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.backgroundColor,
    }
})

const mapStateToProps = (state) => {
    const {devReducer} = state;
    return {devReducer}
};

const mapDispatchToProps = dispatch => (
    bindActionCreators({
        setGoVerifyLineSuccess
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(AuthLoadingScreen);
