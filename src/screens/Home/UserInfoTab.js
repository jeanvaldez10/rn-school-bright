import React from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    Dimensions,
    TouchableOpacity,
    RefreshControl
} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';
import Color from '../../constants/color';
import IconInfoItem from '../../components/IconInfoItem';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import AlertWithImageOfflineModal from '../../components/AlertWithImageModal';
import ProfileModal from '../../components/ProfileModal';
import Images from '../../themes/Images';
import translang, {getCurrentLocale} from '../../utils/language.utils';

import Storage from '../../managers/StorageManager';
import SelectAttendanceModal from '../../components/SelectListModalNoTitle';
import NumberFormat from 'react-number-format';
import QRCode from 'react-native-qrcode-generator';
import moment from 'moment';
import {Colors} from 'react-native/Libraries/NewAppScreen';

import {SliderBox} from "react-native-image-slider-box";
import ApiManager from '../../managers/ApiManager';
import {Col} from 'native-base';
import PermissionModal from '../../components/LogoutModal';
import NetInfo from "@react-native-community/netinfo";
import {removeAllUser, removeUser} from '../../utils/DBManager';
import Constant from '../../constants/constants';
import {BASE_URL_DEV_MOBILE} from "../../constants/ApiUrls";
import CheckVerification from "../../components/CheckVerification";
// import { WebView } from 'react-native-webview';
import { LongPressGestureHandler, State } from 'react-native-gesture-handler';
import { Platform, ActionSheetIOS, ActionSheetAndroid } from 'react-native';


export default class UserInfoTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showScoreModal: false,
            showUserCardModal: false,
            showModal: false,
            showWarningModal: false,
            showAttendanceSelectModal: false,
            authInfo: {resCode: 200, resDesc: ""},
            logininfo: {},
            deviceInfo: {},


            // bannerImages: ["https://source.unsplash.com/1024x768/?nature"]
            // bannerImages: [
            //   "https://source.unsplash.com/1024x768/?nature",
            //   "https://source.unsplash.com/1024x768/?water",
            //   "https://source.unsplash.com/1024x768/?girl",
            //   "https://source.unsplash.com/1024x768/?tree"]
        };
    }

    async componentDidMount() {
        // const userInfo = await Storage.getUserInfo();

        const user = await Storage.getUser();
        if (user) {
            // await Storage.setUser({...user, token:''})
        }

        // this.props.navigation.navigate("UpdatePassword");

        const deviceInfo = await Storage.getDeviceInfo();
        const {userInfo} = this.props;
        const { StudentId, department } = userInfo;
        console.log("userInfo:", userInfo);
        const showWarningModal = (StudentId == null || StudentId === '') && department === '' ;
        this.setState({logininfo: user, deviceInfo: deviceInfo, showWarningModal: showWarningModal});

    }

    async componentDidUpdate(prevProps) {

        if (prevProps.isSelected !== this.props.isSelected && this.props.isSelected === true) {
            const userInfo = await Storage.getUserInfo();
            this.setState({userInfo});
        }
    }

    onQRCode = () => {
        this.setState({showUserCardModal: true});
    };

    onBehaviorScore = () => {
        // this.setState({ showScoreModal: true });
    };

    onAttendance = () => {
        this.setState({showAttendanceSelectModal: true});
    };


    gotoPageAfterAuth = (menuGroupID, subMenuID, pageName, params) => {
        ApiManager.checkAuthStatus(this.state.logininfo.ID, this.state.logininfo.token, this.state.deviceInfo.fcmtoken)
            .then(res => {
                this.setState({authInfo: res}, () => {
                    if (res.resCode == 200) {
                        if (res.permission.length > 0) {
                            const idxGroup = res.permission.findIndex((item) => item.menuGroup_Id == menuGroupID);
                            if (idxGroup >= 0) {
                                if (menuGroupID == 13) {
                                    this.props.navigation.navigate(pageName, params);
                                } else {
                                    if (res.permission[idxGroup].subMenus.length > 0) {
                                        const idxSub = res.permission[idxGroup].subMenus.findIndex((item) => item.menu_Id == subMenuID);
                                        if (idxSub >= 0) {
                                            this.props.navigation.navigate(pageName, params);
                                        } else {
                                            this.setState({
                                                showModal: true,
                                                modalBody: translang.t('CONTACT_YOUER_SCHOOL_ADMIN')
                                            });
                                        }
                                    } else {
                                        this.setState({
                                            showModal: true,
                                            modalBody: translang.t('CONTACT_YOUER_SCHOOL_ADMIN')
                                        });
                                    }
                                }
                            } else {
                                this.setState({showModal: true, modalBody: translang.t('CONTACT_YOUER_SCHOOL_ADMIN')});
                            }
                        } else {
                            this.setState({showModal: true, modalBody: translang.t('CONTACT_YOUER_SCHOOL_ADMIN')});
                        }
                    }
                });
            }).catch(error => {
            console.log("UserInfo gotoPageAfterAuth", error);
        });
    }

    logOut = async () => {
        StorageManager.setVerifyFlag(false);

        const {loginInfo, deviceInfo} = this.state;

        try {
            await CheckVerification.logoutUser(loginInfo, deviceInfo);
            this.props.navigation.navigate('Auth');
        } catch (error) {
            console.error(error);
            this.setState({isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN')});
        }

    }

    clickAuthStatus = () => {
        const {authInfo} = this.state;
        if (authInfo.resCode == '301') {
            this.logOut();
        } else if (authInfo.resCode == '300') {
            this.props.navigation.navigate('UpdatePassword', {parent: 'App'});
        } else if (authInfo.resCode == '401') {
            this.logOut();
        } else if (authInfo.resCode == '402') {
            this.logOut();
        }
    }

    onRefreshUser = () => {
        this.props.onRefresh();
    }

    render() {
        const {navigation, bannerImages} = this.props;

        const isAuthDlg = this.state.authInfo.resCode == 200 ? false : true;

        const screenWidth = Dimensions.get('window').width;
        const bottomButtonHeight = (screenWidth - 10 - 6) / 3;
        const profileImgSize = screenWidth * (5 / 13);
        const profilImgRadius = profileImgSize / 2;


        const sliderHeight = screenWidth * 2667 / 10001;
        const imageHeight = screenWidth * 5 / 12;


        // const bottomButtonHeight = 140;

        const user = this.props.userInfo;


        let studentId = user.StudentId ?? '';
        //const isStudent = studentId !== '';
        const isStudent = studentId !== '';
        let schoolImage = Images.school;

        let profileImage = isStudent ? Images.student_01 : Images.teacher_02;
        let qrcode = null;
        let behaviorScore = user.Score ?? 0.0;
        let emotionImage = null;

        if (user !== {}) {
            if (user.school_image !== null && user.school_image !== '') {
                schoolImage = {uri: user.school_image};
            }
            if (user.image !== null && user.image !== '') {
                profileImage = {uri: user.image};
            }

            const username = user.sPhone;
            const userId = user.ID;
            const date = moment().format('DD-MM-yyyy');
            const time = moment().format('HH:mm:ss');
            qrcode = `${username}@${userId}@${date}:${time}`;
            // if (user.qrcode !== '') {
            //   qrcode = {uri: `data:image/PanGestureHandler;base64,${user.qrcode}`}
            // }
        }

        if (behaviorScore <= 0) {
            emotionImage = Images.crying_new;
        } else {
            emotionImage = Images.happy_new;
        }

        let isShowBanner = false;
        if (bannerImages.length > 0) {
            isShowBanner = true
        }

        let userMName = (user.sName ?? '') + ' ' + (user.sLastname ?? '');
        if (getCurrentLocale() == 'en' && user.NameEn != '' && user.NameEn != null) {
            userMName = (user.NameEn ?? '') + ' ' + (user.LastNameEN ?? '');
        }

        return (
            <ScrollView style={styles.container}
                        refreshControl={
                            <RefreshControl
                                onRefresh={() => this.onRefreshUser()}
                                refreshing={false}
                                tintColor={Color.transparent}
                            />}
            >
                {isShowBanner &&
                <SliderBox
                    style={{...styles.bannerSlider, height: sliderHeight}}
                    autoplay
                    circleLoop
                    images={bannerImages}/>
                }

                {/*<WebView source={{ uri: 'https://ketoswitch.lifeswitcher.com/pl/' }} nestedScrollEnabled setSupportMultipleWindows={false} containerStyle={{...styles.webContainer}}/>*/}

                <Image
                    source={schoolImage}
                    style={{...styles.imageBackground, height: imageHeight}}/>
                <View style={{
                    ...styles.avatarContainer,
                    height: profileImgSize,
                    width: profileImgSize,
                    borderRadius: profilImgRadius,
                    marginTop: profilImgRadius * -1,
                    marginBottom: profilImgRadius * -1
                }}>
                    <Image
                        source={profileImage}
                        style={{...styles.avatar, height: profileImgSize, width: profileImgSize, }}/>
                </View>

                <View style={{...styles.infoBlock, paddingTop: profilImgRadius + 10}}>
                    <Text style={styles.value1}>{userMName}</Text>

                    {isStudent &&
                    <>
                        <Text
                            style={styles.value2}>{translang.t('PROFILE_studentid')}: {` ${user.StudentId ?? ''}`}</Text>
                        <Text
                            style={styles.value2}>{translang.t('PROFILE_class')}: {` ${getCurrentLocale() == 'th' ? user.StudentClass ?? '' : user.StudentClassEN ?? ''}`}</Text>

                    </>
                    }
                    {!isStudent &&
                    <>
                        <Text style={styles.value2}>{` ${user.job_name ?? ''}`}</Text>
                        <Text style={styles.value2}> {user.department ?? ''}</Text>
                    </>

                        // <View style={{flex: 2, justifyContent: 'space-around'}}>
                        //   <IconInfoItem
                        //     style={{marginVertical: 10}}
                        //     icon_mark={Images.ic_chair_blue}
                        //     label={translang.t('USERINFO_position')}
                        //     value_txt={user.job_name ?? '-'}
                        //     topTextStyle={styles.title2}
                        //     bottomTextStyle={styles.value2}
                        //     imageSize={50}
                        //   />
                        //   <IconInfoItem
                        //     style={{marginVertical: 10}}
                        //     icon_mark={Images.ic_card_blue}
                        //     label={translang.t('USERINFO_department')}
                        //     value_txt={user.department ?? '-'}
                        //     topTextStyle={styles.title2}
                        //     bottomTextStyle={styles.value2}
                        //     imageSize={50}
                        //   />
                        // </View>
                    }
                    <TouchableOpacity
                        style={styles.qrcodeContainer}
                        onPress={() => this.onQRCode()}>
                        {/* <QRCode value={qrcode} size={110} /> */}
                        <Image
                            source={Images.n_ic_qrcode}
                            style={styles.qrcode}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.balanceContainer}>
                    <View style={{flex: 1}}>
                        <Text style={{
                            ...styles.title3,
                            fontWeight: 'bold',
                            textAlign: 'center',
                            color: Color.n_default_gray
                        }}>{translang.t('USERINFO_balance')}</Text>
                        <NumberFormat
                            value={user.nMoney}
                            displayType={'text'}
                            thousandSeparator={true}
                            renderText={(value) => {
                                return (
                                    <Text
                                        style={{...styles.balanceValueText, color: Color.n_default_gray}}>{value}</Text>
                                )
                            }}/>
                    </View>
                    {isStudent &&
                    <>
                        <View style={{width: 2, height: '55%', backgroundColor: Color.n_default_brown}}/>
                        <TouchableOpacity style={{flexDirection: 'row', width: 110, justifyContent: 'space-between'}}
                                          activeOpacity={1} onPress={() => {
                            this.onBehaviorScore()
                        }}>
                            <View style={{flex: 1}}>
                                <Text style={{
                                    ...styles.title2,
                                    fontSize: 24,
                                    textAlign: 'center',
                                    color: Color.n_default_gray
                                }}>{translang.t('DISCIPLINE')}</Text>
                                <Text style={{
                                    ...styles.balanceValueText,
                                    color: Color.n_default_gray
                                }}>{behaviorScore}</Text>
                            </View>

                        </TouchableOpacity>
                    </>}
                </View>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%',
                    height: bottomButtonHeight,
                    paddingHorizontal: 35
                }}>
                    <TouchableOpacity style={{...styles.bottomButton, backgroundColor: Color.n_default_orange}}
                                      onPress={() => {
                                          navigation.navigate('Timetable')
                                      }}>
                        <Image
                            source={Images.calendar_menu}
                            style={styles.bottomButtonIcon}
                        />
                        <Text style={{
                            ...styles.bottomButtonText,
                            color: Color.white
                        }}>{isStudent ? translang.t('DRAWER_STUDENT_TIMETABLE') : translang.t('DRAWER_timetable')}</Text>
                    </TouchableOpacity>
                    {isStudent &&
                    <TouchableOpacity style={{...styles.bottomButton, backgroundColor: Color.white}} onPress={() => {
                        navigation.navigate('OnlineStudent')
                    }}>
                        <Image
                            source={Images.n_ic_homework}
                            style={styles.bottomButtonIcon}
                        />
                        <Text style={{
                            ...styles.bottomButtonText,
                            color: Color.n_default_gray,
                            fontSize: 18
                        }}>{translang.t('DRAWER_onlineclassroom')}</Text>
                    </TouchableOpacity>
                    }
                    {!isStudent &&
                    <TouchableOpacity style={{...styles.bottomButton, backgroundColor: Color.white}}
                                      onPress={() => this.onAttendance()}>
                        <Image
                            source={Images.n_ic_edit_pencil}
                            style={styles.bottomButtonIcon}
                        />
                        <Text style={{
                            ...styles.bottomButtonText,
                            color: Color.n_default_gray
                        }}>{translang.t('Attendance_s')}</Text>
                    </TouchableOpacity>
                    }
                    <TouchableOpacity style={{...styles.bottomButton, backgroundColor: Color.n_default_brown}}
                                      onPress={() => {
                                          navigation.navigate('Shop')
                                      }}>
                        <Image
                            source={Images.n_ic_cart}
                            style={styles.bottomButtonIcon}
                        />
                        <Text
                            style={{...styles.bottomButtonText, color: Color.white}}>{translang.t('DRAWER_shop')}</Text>
                    </TouchableOpacity>
                </View>

                <ProfileModal
                    isVisible={this.state.showUserCardModal}
                    onPositivePress={() => {
                        this.setState({showUserCardModal: false})
                    }}
                    user={this.props.userInfo}
                />
                <PermissionModal
                    isVisible={isAuthDlg}
                    image={Images.n_ic_warning}
                    showCancelButton={false}
                    message={this.state.authInfo.resDesc}
                    onClose={() => {
                        console.log("Click Close")
                    }}
                    onConfirm={() => {
                        this.clickAuthStatus();
                    }}
                />

                <AlertWithImageModal
                    isVisible={this.state.showScoreModal}
                    image={emotionImage}
                    title={translang.t('USERINFO_behaviorscore')}
                    message={"aaa"}
                    buttonColors={[Color.salmon, Color.macaroni_and_cheese]}
                    isVerticalGradient={false}
                    onClose={() => {
                        console.log("Click Close")
                    }}
                />

                <AlertWithImageOfflineModal
                    isVisible={this.state.showModal}
                    image={Images.n_ic_warning}
                    message={this.state.modalBody}
                    buttonColors={[Color.salmon, Color.macaroni_and_cheese]}
                    isVerticalGradient={false}
                    onClose={() => {
                        this.setState({showModal: false})
                    }}
                />

                <AlertWithImageOfflineModal
                    isVisible={this.state.showWarningModal}
                    image={Images.n_ic_warning}
                    message={translang.t("WARNING_NO_DEPARTMENT")}
                    buttonColors={[Color.green_button_next_color1, Color.green_button_next_color2]}
                    isVerticalGradient={false}
                    onClose={() => {
                        this.setState({showWarningModal: false})
                    }}
                />


                <AlertWithImageOfflineModal
                    isVisible={this.state.showModal}
                    image={Images.n_ic_warning}
                    message={this.state.modalBody}
                    buttonColors={[Color.salmon, Color.macaroni_and_cheese]}
                    isVerticalGradient={false}
                    onClose={() => {
                        this.setState({showModal: false})
                    }}
                />

                <SelectAttendanceModal
                    isVisible={this.state.showAttendanceSelectModal}
                    onListSelect={this.onAttendanceOptionSelect}
                    listData={[{title: translang.t('CHECKIN_ATTENDANCE')}, {title: translang.t('TAKE_CLASS_ATTENDANCE')}, {title: translang.t('CHECKOUT_ATTENDANCE')}]}
                />
            </ScrollView>
        );
    }
}

const styles = ScaledSheet.create({
    webContainer: {
        width: '100%',
        height: 600
    },
    container: {
        flex: 1,
        position: 'relative',
        backgroundColor: Color.white
    },
    imageBackground: {
        position: 'relative',
        height: '150@vs',
        width: '100%',
        opacity: 1.0,
    },
    bannerSlider: {
        height: "100@vs",
    },
    imgBackgroundOverlay: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'black',
        opacity: 0.4
    },
    avatarContainer: {
        marginLeft: 'auto',
        marginRight: 'auto',
        borderColor: Color.white,
        borderWidth: 10,
        zIndex: 2,
        backgroundColor: 'white',
        overflow: 'hidden',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatar: {
        resizeMode: 'stretch',
        backgroundColor: Color.white,
    },
    infoBlock: {
        zIndex: 1,
        width: '100%',

        paddingBottom: 73,

        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        backgroundColor: Color.n_default_brown_light,
    },

    title1: {
        width: 120,
        marginVertical: 0,
        color: Color.white,
        fontSize: 28,
        fontFamily: 'THSarabunNew',
        fontWeight: 'bold',
        textAlign: 'right',
    },
    value1: {
        width: '100%',
        color: Color.n_default_gray,
        fontSize: "24@ms",
        fontFamily: 'THSarabunNew',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    title2: {
        fontFamily: 'THSarabunNew',
        fontSize: "28@ms",
        fontWeight: 'bold'
    },
    title3: {
        fontFamily: 'THSarabunNew',
        fontSize: "24@ms",
        fontWeight: 'bold'
    },
    value2: {
        width: '100%',
        color: Color.n_default_gray,
        fontFamily: 'THSarabunNew',
        fontSize: "20@ms",
        textAlign: 'center',
    },
    qrcodeContainer: {
        width: '70@ms',
        height: '70@ms',
        position: 'absolute',
        right: 30,
        top: 125
    },
    qrcode: {
        width: "100%",
        height: "100%",
        resizeMode: 'contain'
    },
    balanceContainer: {
        minHeight: '100@ms',
        marginTop: '-40@ms',
        flexDirection: 'row',
        marginHorizontal: "35@ms",
        marginBottom: 25,
        paddingHorizontal: 15,
        alignItems: 'center',
        borderRadius: "45@ms",
        backgroundColor: 'white',
        shadowColor: 'black',
        shadowOffset: {
            width: 2,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 2.0,

        zIndex: 2,
    },
    balanceValueText: {
        fontFamily: 'THSarabunNew',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: "31@ms"
    },
    bottomButton: {
        width: "96@ms",
        height: "96@ms",
        borderRadius: "48@ms",
        justifyContent: 'center',
        alignItems: 'center',

        shadowColor: 'black',
        shadowOffset: {
            width: 2,
            height: 2,
        },
        shadowOpacity: 0.3,
        elevation: 2.0,
        // elevation: 8
    },
    bottomButtonIcon: {
        width: "30@ms",
        height: "30@ms",
        resizeMode: 'contain',
        backgroundColor: 'transparent'
    },
    bottomButtonText: {
        fontSize: "17@ms",
        fontFamily: '',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10
    }
});
