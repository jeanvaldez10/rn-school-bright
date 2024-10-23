import React, {useState} from 'react';
import {View, BackHandler, TouchableOpacity, FlatList, ActivityIndicator, Image,} from 'react-native';
import {Text} from 'native-base';
import {ScaledSheet} from 'react-native-size-matters';
import Color from '../../constants/color';
import {SafeAreaView} from 'react-native-safe-area-context';
import moment from 'moment';
import BackNavigationBar from '../../components/BackNavigationBar';
import translang, {getCurrentLocale} from '../../utils/language.utils';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import ProgressHud from '../../components/ProgressHud';
import LinearGradient from "react-native-linear-gradient";
import GradientButton from "../../components/GradientButton";
import Images from "../../themes/Images";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import CheckVerification from "../../components/CheckVerification";
import Constant from "../../constants/constants";
import {removeUser} from "../../utils/DBManager"
import CustomModal from "../../components/CustomModal";

export default class YourDevicesScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            type: 'student',
            userInfo: {},
            devInfo: {},
            deviceList: [],
            isLoading: false,
            removeItem: null,
            pageStatus: 0,
            showModal: false,
        };

    }

    handleBackButton = () => {
        this.back();
        return true;
    };

    componentDidMount() {
        const {navigation} = this.props;
        this.load();
        this.focusListener = navigation.addListener("didFocus", () => {
            if (this.backhandler) {
                this.backhandler.remove();
            }
            this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        });

    }

    logOut = async () => {
        console.log("log out");

        const deviceInfo = await Storage.getDeviceInfo();
        const loginInfo = await Storage.getUser();
        const userId = loginInfo.ID;
        removeUser(userId).then();
        Constant.AddProfiles = Constant.AddProfiles.filter(item => item.userid != userId);
        try {
            await CheckVerification.logoutUser(loginInfo, deviceInfo);
            this.props.navigation.navigate('Auth');
        } catch (error) {
            console.error(error);
            this.setState({isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN')});
        }
    }

    load = async () => {
        await this.setState({isLoading: true});
        const userInfo = await Storage.getUser();
        const devInfo = await Storage.getDeviceInfo();
        const result1 = await CheckVerification.checkVerificationDevice(devInfo.fcmtoken, userInfo.ID, userInfo.SchoolId);
        if (!result1) {
            this.logOut();
        }

        const deviceList = await ApiManager.getVerifiedDevices(devInfo.fcmtoken, userInfo.ID, userInfo.SchoolId, devInfo.imei);

        this.setState({userInfo, devInfo, deviceList, isLoading: false});

    }

    componentWillUnmount = () => {
        if (this.backhandler) {
            this.backhandler.remove();
        }
        if (this.focusListener) {
            this.focusListener.remove();
        }
    };

    back = () => {
        if (this.backhandler) {
            this.backhandler.remove();
        }

        const parentRoute = this.props.navigation.getParam('parent') ?? 'Report';
        this.props.navigation.navigate(parentRoute);
    };

    removeDevice = async (item) => {
        const {devInfo} = this.state;
        if (devInfo.imei == item.Imei && (devInfo.fcmtoken == item.Token)) {
            this.setState({showModal: true});
            return;
        }
        this.setState({removeItem: item, pageStatus: 1})
    }

    cancel = () => {
        this.setState({removeItem: null, pageStatus: 0})
    }

    home = () => {
        this.load();
        this.setState({removeItem: null, pageStatus: 0})
    }


    confirmRemove = async () => {
        const item = this.state.removeItem;
        const res = await ApiManager.removeDevice(item.Token, item.UserID, item.SchoolID, item.Imei);
        if (res.StatusCode == 200) {
            this.setState({removeItem: null, pageStatus: 2});
        }
    }

    renderItem = (item, index) => {
        if (!item.Imei && !item.verifiyStatus == 2) {
            return ''
        }
        return (
            <View style={index === 0 ? styles.itemContainer0 : styles.itemContainer}>
                <Text style={styles.titleText}>{item.model}</Text>
                <View style={{marginVertical: 10}}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <Text style={styles.infoText}>{translang.t("First_Login")}: </Text>
                        <Text style={styles.infoText}>{item.firstlogindt}</Text>
                    </View>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <Text style={styles.infoText}>{translang.t("Recent_Activity")}: </Text>
                        <Text style={styles.infoText}>{item.lastlogindt}</Text>
                    </View>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <Text style={styles.infoText}>{translang.t("Device")}: </Text>
                        <Text style={styles.infoText}>{item.System}</Text>
                    </View>

                    <GradientButton
                        containerStyle={styles.loginBtn}
                        buttonStyle={{height: 40}}
                        textStyle={{fontSize: 22}}
                        label={translang.t('Remove_Device')}
                        _onPress={() => this.removeDevice(item)}
                    />

                </View>
            </View>
        )
    };

    render() {
        const {pageStatus} = this.state;
        return (
            <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
                {pageStatus == 0 &&
                <BackNavigationBar
                    title={translang.t("Your_devices")}
                    onMenuTap={() => this.back()}
                />
                }
                {pageStatus == 0 &&
                <View style={styles.container}>
                    <View style={styles.boxStyle}>
                        <FlatList
                            data={this.state.deviceList}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({item, index}) => this.renderItem(item, index)}/>
                    </View>
                </View>
                }
                {pageStatus == 1 &&
                <View style={styles.container}>
                    <View style={styles.appimage}>
                        <Image source={Images.n_ic_warning} style={styles.appLogo} resizeMode='contain'/>
                    </View>

                    <View style={styles.titleContainer}>
                        <Text style={styles.bigText}>{translang.t('Remove_Device_Comment')}</Text>
                    </View>
                    <View style={{paddingHorizontal: 20, flexDirection: 'row'}}>

                        <GradientButton
                            containerStyle={styles.loginBtn2}
                            label={translang.t('COMMON_cancel')}
                            _onPress={() => this.cancel()}
                        />

                        <GradientButton
                            containerStyle={styles.loginBtn2}
                            colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
                            label={translang.t('COMMON_confirm')}
                            _onPress={() => this.confirmRemove()}
                        />

                    </View>

                </View>
                }
                {pageStatus == 2 &&
                <View style={styles.container}>
                    <View style={styles.appimage}>
                        <Image source={Images.n_img_complete_green} style={styles.appLogo} resizeMode='contain'/>
                    </View>

                    <View style={styles.titleContainer}>
                        <Text style={styles.bigText}>{translang.t('Remove_Device_Success')}</Text>
                    </View>
                    <View style={{paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'center'}}>

                        <GradientButton
                            containerStyle={styles.closeBtn}
                            colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
                            label={translang.t('HOME_close')}
                            _onPress={() => this.home()}
                        />

                    </View>

                </View>
                }
                <ProgressHud isVisible={this.state.isLoading}/>
                <CustomModal isVisible={this.state.showModal} headerVisible={false} logoVisible={false}
                             body={translang.t("Not_Remove_Device")}
                             negativeText={''} positiveText={translang.t("COMMON_ok")} onPositivePress={() => {
                    this.setState({showModal: false})
                }}/>
            </SafeAreaView>
        );
    }
}

const styles = ScaledSheet.create({

    container: {
        flex: 1,
        backgroundColor: Color.n_background_white,
    },
    boxStyle: {
        margin: 24,
        paddingVertical: 32,
        paddingHorizontal: 24,
        borderRadius: 25,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 4,
    },
    titleText: {
        fontFamily: 'THSarabunNew',
        color: Color.dark,
        fontSize: 24,
        borderBottomWidth: 1,
        marginRight: 0,
        borderBottomColor: Color.gray200,
    },
    itemContainer: {
        borderTopWidth: 1,
        borderTopColor: Color.gray200,
        paddingHorizontal: 12,
        paddingVertical: 18,
    },
    itemContainer0: {
        paddingHorizontal: 12,
        paddingVertical: 18,
    },
    infoText: {
        fontFamily: 'THSarabunNew',
        color: Color.dark,
        fontSize: 20,
    },
    loginBtn: {
        width: '100%',
        height: 40,
        marginTop: 24,
    },
    closeBtn: {
        width: '100%',
        height: 40,
        marginTop: 24,
        maxWidth: 300,
    },

    titleContainer: {
        paddingVertical: 40,
        paddingHorizontal: 40,
    },


    loginBtn2: {
        width: '50%',
        height: 70,
        marginTop: 25,
        paddingHorizontal: 20,
    },

    bigText: {
        fontFamily: 'THSarabunNew',
        width: '100%',
        fontSize: 28,
        textAlign: 'center',
        color: Color.list_header_text,
        fontWeight: 'normal'
    },

    appLogo: {
        width: '100%',
        height: '100%',
    },
    appimage: {
        marginTop: 100,
        width: '100%',
        height: 100,
        alignItems: 'center',
    },
});
