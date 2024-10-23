import React from 'react';
import {
    View,
    Text,
    Image,
    Dimensions,
    TouchableOpacity,
    RefreshControl,
    ImageBackground,
    ScrollView,
    StyleSheet,
    FlatList, NativeModules
} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';
import Color from '../../constants/color';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import AlertWithImageOfflineModal from '../../components/AlertWithImageModal';
import ProfileModal from '../../components/ProfileModal';
import Images from '../../themes/Images';
import translang, {getCurrentLocale} from '../../utils/language.utils';
import Storage from '../../managers/StorageManager';
import SelectAttendanceModal from '../../components/SelectListModalNoTitleMenu';
import ApiManager from '../../managers/ApiManager';
import PermissionModal from '../../components/LogoutModal';
import CheckVerification from "../../components/CheckVerification";
import LinearGradient from "react-native-linear-gradient";
import FastImage from "react-native-fast-image";
import Carousel, {ParallaxImage, Pagination} from 'react-native-snap-carousel'
import {navigateMenu, quickMenuStyles} from "../../constants/functions";
import CustomModal from "../../components/CustomModal";
import FastImageBackground from "../../components/FastImageBackground";
import {bindActionCreators} from "redux";
import {setIsEditStatus} from "../../redux/actions";
import {connect} from "react-redux";
import {withNavigationFocus} from "react-navigation";
import Intl from 'intl';
import 'intl/locale-data/jsonp/en-US'
import ProgressHud from "../../components/ProgressHud";
import AsyncStorage from '@react-native-async-storage/async-storage'

const { FastImageView } = NativeModules;
const {width: screenWidth} = Dimensions.get('window');
const isTablet = screenWidth >= 600;
const bannerItemWidth = screenWidth - (isTablet ? 60 : 32);
const bannerHeight = bannerItemWidth * 2561 / 9600;

const serviceContainerPadding = screenWidth >= 600 ? 26 : 14;
const serviceItemMargin = isTablet ? 4 : 2;
const serviceItemWidth = screenWidth / 2 - serviceContainerPadding - serviceItemMargin * 2;


class UserInfoTab1 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showScoreModal: false,
            showUserCardModal: false,
            showModal: false,
            showWarningModal: false,
            showAttendanceSelectModal: false,
            authInfo: {resCode: 200, resDesc: ""},
            loginInfo: {},
            deviceInfo: {},
            userInfo: {},
            showInformation: false,
            activeSlide: 0,
            unreadCount: 0,
            services: [
                {
                    'key': 's_score',
                    'image': Images.s_score,
                    'active': true,
                    'show': false,
                    'button_text': 'view_score',
                    'amount': '1000',
                    'teacher_visible': false,
                },
                {
                    'key': 's_balance',
                    'active': true,
                    'image': Images.s_balance,
                    'show': false,
                    'button_text': 'view_balance',
                    'amount': '1000',
                    'teacher_visible': true,
                },
                {
                    'key': 's_saving',
                    'image': Images.s_saving,
                    'active': false,
                    'show': false,
                    'button_text': 'view_balance',
                    'amount': translang.t('coming_soon'),
                    'teacher_visible': false,
                },
                {
                    'key': 's_recycle',
                    'image': Images.s_recycle,
                    'active': false,
                    'show': false,
                    'button_text': 'view_score',
                    'amount': translang.t('coming_soon'),
                    'teacher_visible': true,
                },
            ],
            showMenuModal: false,
            subMenuList: [],
            showComingSoonModal: false,
            isLoading: false,
        };
    }

    async componentDidMount() {

        const deviceInfo = await Storage.getDeviceInfo();
        const userInfo = await Storage.getUserInfo();
        const loginInfo = await Storage.getUser();
        const {StudentId, department, nMoney, Score} = userInfo;
        // const showWarningModal = (StudentId == null || StudentId === '') && department === '';
        const showWarningModal = false;

        this.loadUnreadMessageCount(userInfo.ID);
        this.setState({deviceInfo, showWarningModal, isLoading: false, loginInfo, userInfo});
        this.updateServiceItem(this.state.services[1], 'amount', this.numberWithCommas(nMoney));
        if (StudentId) {
            this.updateServiceItem(this.state.services[0], 'amount', this.numberWithCommas(Score));
        }

        this.focusListener = this.props.navigation.addListener("didFocus", () => {
            if (this.backhandler) {
                this.backhandler.remove();
            }
        });

    }

    numberWithCommas = (number) => {
        return new Intl.NumberFormat('en-US').format(number);
    };

    componentWillUnmount() {
        if (this.focusListener) {
            this.focusListener.remove();
        }
        if (this.backhandler) {
            this.backhandler.remove();
        }
    }


    loadUnreadMessageCount = (userId) => {
        ApiManager.getHomeTotalUnreadCount(userId)
            .then(count => {
                this.setState({unreadCount: count});
            }).catch(error => {
            console.log("loadUnreadMessageCount", error);
        });
    }

    onQRCode = () => {
        this.setState({showUserCardModal: true});
    };

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

    renderUserInfoView = (schoolImage, profileImage, userMName, user, isStudent, isUserSchoolImage) => {
        return (
            <View>
                <FastImageBackground
                    source={schoolImage}
                    isImageVisible={isUserSchoolImage}
                    style={{...styles.imageBackground}}>
                    <View style={styles.userInfoContainer}>
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.navigate(isStudent ? 'ProfileStudent' : 'ProfileTeacher', {
                                parent: 'App',
                                userInfo: this.state.userInfo
                            })
                        }}>
                            <FastImage
                                source={profileImage}
                                style={styles.avatar}
                                resizeMode={FastImage.resizeMode.cover}
                            />
                        </TouchableOpacity>

                        <View style={{flexDirection: 'row'}}>
                            <TouchableOpacity
                                style={styles.qrcodeContainer}
                                onPress={() => this.onQRCode()}>
                                <Image
                                    source={Images.qr_code}
                                    style={styles.qrcode}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{...styles.qrcodeContainer, backgroundColor: Color.bellIcon}}
                                onPress={() => this.props.navigation.navigate('Notification')}>
                                <Image
                                    source={Images.bell_icon}
                                    style={styles.bellIcon}
                                />

                                {this.state.unreadCount > 0 &&
                                <View style={styles.notificationCountsBox}>
                                    <Text style={styles.notificationCounts}>{this.state.unreadCount}</Text>
                                </View>
                                }

                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.informationBox}>
                        <View style={styles.informationTextNameBox}>
                            <Text
                                style={styles.informationTextName}>{translang.t(isStudent ? 'hello_student' : 'hello')}{userMName}{' '}
                            </Text>
                            <Image
                                source={Images.face_icon} style={styles.emoji}/>
                        </View>
                        <Text
                            style={styles.informationText}>{translang.t(isStudent ? 'student_id' : 'employee_id')} : {isStudent ? user.StudentId : user.StaffID} </Text>
                    </View>

                </FastImageBackground>

                <View style={styles.marker}/>
            </View>
        )
    }

    onPressMenu = (item) => {
        navigateMenu(item, this);
    }

    renderSectionMenu(sectionMenus) {
        let res = [];

        sectionMenus.map((item, i) => {
            const title = translang.t(item.key);
            const titles = title.split('\n');
            res.push(
                <View style={quickMenuStyles.accountItemContainer} key={i}>
                    <TouchableOpacity onPress={() => this.onPressMenu(item)}
                                      style={quickMenuStyles.addAccountBox}>
                        <Image source={item.image} style={quickMenuStyles.addAccountImage}/>
                    </TouchableOpacity>
                    <Text style={quickMenuStyles.appTitle}>{titles[0]}</Text>
                    {titles.length == 2 &&
                    <Text style={[quickMenuStyles.appTitle, quickMenuStyles.appTitle1]}>{titles[1]}</Text>}
                </View>
            )
        });

        for (let i = sectionMenus.length; i < 8; i++) {
            res.push(
                <View style={quickMenuStyles.accountItemContainer} key={i}>
                    <TouchableOpacity onPress={() => {
                        this.props.setIsEditStatus(true);
                        this.props.jumpTo('services');
                    }}
                                      style={quickMenuStyles.addAccountBox}>
                        <Image source={Images.m_more_menu} style={quickMenuStyles.addAccountImage}/>
                    </TouchableOpacity>

                    <Text style={quickMenuStyles.appTitle}>{translang.t('add_menu')}</Text>
                </View>
            )
        }

        return res;
    }

    renderQuickMenu = () => {
        return (
            <View style={styles.quickMenuSection}>
                <View style={styles.quickMenuSectionIn}>
                    {this.renderSectionMenu(this.props.devReducer.quickMenu)}
                </View>
            </View>
        )
    }

    _renderItem({item, index}, parallaxProps) {
        return (
            <View style={styles.item}>
                <FastImage
                    source={item}
                    containerStyle={styles.imageContainer}
                    style={styles.image}
                    parallaxFactor={0}
                    {...parallaxProps}
                />
            </View>
        );
    }

    _renderItem1(item) {
        return (
            <View style={styles.item}>

            </View>
        );
    }


    get pagination() {
        const {activeSlide} = this.state;
        return (
            <Pagination
                dotsLength={this.props.bannerImages.length}
                activeDotIndex={activeSlide}
                containerStyle={{marginTop: -30, paddingVertical: 10}}
                dotStyle={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    marginHorizontal: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.92)'
                }}
                inactiveDotStyle={{
                    // Define styles for inactive dots here
                    backgroundColor: Color.pager_orange_bg
                }}
                inactiveDotOpacity={0.4}
                inactiveDotScale={0.6}
            />
        );
    }

    updateServiceItem = (service, key, value) => {
        const {services} = this.state;
        const updated_service = services.map((item) => {
            if (item.key == service.key) {
                item[key] = value
            }
            return item;
        })
        this.setState({services: [...updated_service]});
    }

    renderServiceItem = (item, index) => {
        const isLast = index == (this.state.services.length - 1);
        return (
            <View style={[styles.serviceItemContainer, isLast ? styles.serviceItemContainerLast : []]}>
                <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 4}}>
                    <View style={[styles.serviceItemImageBox, item.active && styles.serviceItemImageBoxActive]}>
                        <Image source={item.image} style={styles.serviceItemImage}/>
                    </View>
                    <Text style={[styles.serviceItemTitle, item.active && styles.serviceItemTitleActive]}>
                        {translang.t(item.key)}
                    </Text>
                </View>

                <TouchableOpacity onPress={() => {
                    this.setState({isLoading: true});
                    ApiManager.getUserInfo(this.state.userInfo.ID, this.state.userInfo.SchoolID).then((data) => {
                        this.setState({isLoading: false});
                        this.updateServiceItem(item, 'show', !item.show);
                        let amount = item.amount;
                        if (item.key == 's_score') {
                            amount = this.numberWithCommas(data.Score);
                        } else if (item.key == 's_balance') {
                            amount = this.numberWithCommas(data.nMoney);
                        }

                        this.updateServiceItem(item, 'amount', amount);

                    });

                }}>
                    <LinearGradient colors={item.active ? ['#ff822c', '#ffa6a4'] : [Color.text_grey, Color.text_grey]}
                                    style={styles.serviceItemBtn}
                                    start={{x: 0, y: 0}}
                                    end={{x: 1, y: 0}}>
                        <Text
                            style={styles.serviceItemBtnText}>{item.show ? item.amount : translang.t(item.button_text)}</Text>
                        {!item.show && <Image source={Images.i_eye} style={styles.serviceItemBtnEyeIcon}/>}
                    </LinearGradient>
                </TouchableOpacity>

            </View>
        )
    }

    onPressSubMenu = (item) => {
        this.setState({showMenuModal: false});
        if (item === null) return;
        navigateMenu(item, this);
    };

    render() {
        const {bannerImages} = this.props;
        const {userInfo: user} = this.state;
        let bannerImages1 = bannerImages.map(item => ({uri: item}));
        if (bannerImages.length > 1) {
            bannerImages1 = [...bannerImages1, ...bannerImages1, ...bannerImages1, ...bannerImages1, ...bannerImages1, ...bannerImages1, ...bannerImages1,
                ...bannerImages1, ...bannerImages1, ...bannerImages1, ...bannerImages1, ...bannerImages1, ...bannerImages1, ...bannerImages1];
        }

        const isAuthDlg = this.state.authInfo.resCode !== 200;

        const {StudentId, school_image: userSchoolImage, image: userImage, NameEn, sName} = user;
        const isStudent = !!StudentId;
        const isUserSchoolImage = !!userSchoolImage;
        const schoolImage = userSchoolImage ? {uri: userSchoolImage} : Images.school;

        const profileImage = sName ? (userImage ? {uri: userImage} : (isStudent ? Images.student_01 : Images.teacher_02)) : '';

        const userMName = (getCurrentLocale() === 'en' && NameEn !== '' && NameEn != null) ? NameEn : sName;

        const behaviorScore = user.Score ?? 0.0;
        const emotionImage = behaviorScore <= 0 ? Images.crying_new : Images.happy_new;
        const isShowBanner = bannerImages.length > 0;

        const PAGE_WIDTH = screenWidth;
        const baseOptions = {
            vertical: false,
            width: PAGE_WIDTH,
            height: PAGE_WIDTH * 0.6,
        };

        return (

            <ScrollView style={styles.container}
                        refreshControl={
                            <RefreshControl
                                onRefresh={() => this.onRefreshUser()}
                                refreshing={false}
                                tintColor={Color.transparent}
                            />}
            >

                <View>
                    {this.renderUserInfoView(schoolImage, profileImage, userMName, user, isStudent, isUserSchoolImage)}
                    {isShowBanner &&
                    <Carousel
                        sliderWidth={screenWidth}
                        sliderHeight={bannerHeight}
                        itemWidth={bannerItemWidth}
                        data={bannerImages1}
                        renderItem={this._renderItem}
                        hasParallaxImages={false}
                        autoplay={true}
                        inactiveSlideScale={0.96}
                        loop={true}
                        activeSlideOffset={10}
                        swipeThreshold={3}
                        onSnapToItem={(index) => this.setState({activeSlide: index})}
                        lockScrollWhileSnapping={true}
                        enableMomentum={false}
                        containerCustomStyle={styles.slider}
                        contentContainerCustomStyle={styles.sliderContentContainer}
                        decelerationRate={0.25}
                    />
                    }

                    {isShowBanner && this.pagination}

                    {this.renderQuickMenu()}

                    <FlatList data={this.state.services.filter(item => isStudent ? true : item.teacher_visible)}
                              renderItem={(item, index) => this.renderServiceItem(item.item, item.index)}
                              horizontal={true} style={styles.servicesContainer}
                              showsHorizontalScrollIndicator={false}
                              bounces={false}
                              keyExtractor={(item, index) => index.toString()}/>
                </View>

                <ProfileModal
                    isVisible={this.state.showUserCardModal}
                    onPositivePress={() => {
                        this.setState({showUserCardModal: false})
                    }}
                    user={this.state.userInfo}
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
                    isVisible={this.state.showMenuModal}
                    onListSelect={(item) => {
                        this.onPressSubMenu(item)
                    }}
                    listData={this.state.subMenuList}
                />

                <CustomModal isVisible={this.state.showComingSoonModal} positiveText={'Close'}
                             onPositivePress={() => {
                                 this.setState({showComingSoonModal: false})
                             }} body={'Coming Soon'}
                             negativeText={''} positiveBtnType={'green'}/>

                <ProgressHud isVisible={this.state.isLoading}/>
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
        width: '100%',
        opacity: 1.0,
        paddingBottom: '48@ms',
        backgroundColor: 'black'
    },

    userInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: '16@ms',
        paddingHorizontal: 21,
    },

    informationBox: {
        paddingHorizontal: 24,
        marginLeft: 10,
    },

    informationTextNameBox: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    informationTextName: {
        color: 'white',
        fontSize: '28@ms0.8',
        fontWeight: '700',
        fontFamily: 'THSarabunNew',
    },

    informationText: {
        color: 'white',
        fontSize: '22@ms0.8',
        fontWeight: '700',
        fontFamily: 'THSarabunNew',
    },

    qrcodeContainer: {
        width: '30@ms0.8',
        height: '30@ms0.8',
        borderRadius: '15@ms0.8',
        marginLeft: '10@ms0.8',
        elevation: 10,
        backgroundColor: Color.qr_code_bg,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Color.white,

    },
    qrcode: {
        width: '18@ms0.8',
        height: '18@ms0.8',
        resizeMode: 'stretch'
    },
    bellIcon: {
        width: '18@ms0.8',
        height: '20@ms0.8',
        resizeMode: 'stretch'
    },

    bannerSlider: {
        // height: "100@vs",
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
        height: '60@ms0.7',
        width: '60@ms0.7',
        borderRadius: '40@ms0.7',
        elevation: 10,
        backgroundColor: Color.white,
        borderWidth: 3,
        borderColor: Color.white,
    },
    infoBlock: {
        zIndex: 1,
        width: '100%',
        paddingBottom: 73,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        backgroundColor: Color.n_default_brown_light,
    },

    item: {
        width: bannerItemWidth,
        height: bannerHeight,
    },
    imageContainer: {
        flex: 1,
        marginBottom: Platform.select({ios: 0, android: 1}), // Prevent a random Android rendering issue
        backgroundColor: 'white',
        borderRadius: '12@ms0.7',
    },
    image: {
        ...StyleSheet.absoluteFill,
        borderRadius: '12@ms0.7',
        resizeMode: 'cover',
    },

    notificationCountsBox: {
        backgroundColor: Color.white,
        width: '14@ms0.7',
        height: '14@ms0.7',
        borderRadius: '10@ms0.7',
        justifyContent: 'center',
        alignItems: 'center',
        top: '-4@ms0.7',
        right: '-4@ms0.7',
        position: 'absolute'
    },

    notificationCounts: {
        color: Color.bellIcon,
        fontSize: '10@ms0.7',
        fontWeight: 'bold'
    },

    emoji: {
        width: '24@ms',
        height: '24@ms',
        resizeMode: 'stretch',
    },
    quickMenuSection: {
        paddingTop: '4@ms',
        paddingHorizontal: '6@ms0.7',
    },
    quickMenuSectionIn: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: '16@ms'
    },
    serviceItemContainer: {
        width: serviceItemWidth,
        borderRadius: '8@ms0.7',
        paddingVertical: '12@ms0.7',
        paddingHorizontal: '4@ms0.7',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 2,
        marginVertical: '8@ms',
        marginHorizontal: serviceItemMargin,
        backgroundColor: Color.white,
    },
    serviceItemContainerLast: {
        marginRight: 2 * serviceContainerPadding,
    },
    serviceItemImageBox: {
        width: '28@ms0.7',
        height: '28@ms0.7',
        borderWidth: 1,
        borderRadius: '16@ms0.7',
        borderColor: Color.text_grey,
        justifyContent: 'center',
        alignItems: 'center'
    },
    serviceItemImageBoxActive: {
        borderColor: Color.text_service_title,
    },
    serviceItemImage: {
        width: '20@ms0.7',
        height: '20@ms0.7',
        resizeMode: 'stretch',
    },
    serviceItemTitle: {
        fontSize: '17@ms0.7',
        color: Color.text_black,
        fontWeight: 'bold',
        marginLeft: '4@ms0.7'
    },
    serviceItemTitleActive: {
        color: Color.text_service_title,
    },
    serviceItemBtn: {
        borderRadius: '20@ms0.7',
        flex: 1,
        backgroundColor: Color.n_default_orange,
        paddingVertical: '6@ms',
        marginTop: '12@ms',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    serviceItemBtnEyeIcon: {
        width: '18@ms0.7',
        height: '18@ms0.7',
        resizeMode: 'contain',
        marginLeft: '4@ms0.7',
    },
    serviceItemBtnText: {
        fontSize: '20@ms',
        color: Color.white,
        fontWeight: 'bold',
    },
    servicesContainer: {
        paddingHorizontal: serviceContainerPadding,
        marginBottom: '40@ms0.7',
    },
    marker: {
        flex: 1,
        backgroundColor: 'white',
        borderTopRightRadius: '24@ms',
        borderTopLeftRadius: '24@ms',
        height: '24@ms',
        marginTop: '-24@ms',
        zIndex: 2,
    },
    slider: {
        marginTop: -2,
        overflow: 'visible', // for custom animations
        shadowOpacity: 0,
        backgroundColor: 'white'
    },
    sliderContentContainer: {
        paddingVertical: 0, // for custom animation
        borderTopWidth: 0,
        borderTopColor: 'white',
        shadowOpacity: 0,
    },

});

const mapStateToProps = (state) => {
    const {devReducer} = state;
    return {devReducer}
};

const mapDispatchToProps = dispatch => (
    bindActionCreators({
        setIsEditStatus,
    }, dispatch)
);


export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(UserInfoTab1));

