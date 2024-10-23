import React from 'react';
import {
    View,
    Text,
    Image,
    BackHandler,
} from 'react-native';

import {ScaledSheet} from "react-native-size-matters";

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import GradientButton from '../../components/GradientButton';
import ValidationComponent from 'react-native-form-validator';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import translang from '../../utils/language.utils';
import {SafeAreaView} from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import ApiManager from "../../managers/ApiManager";
import StorageManager from '../../managers/StorageManager';
import {StepProgressBar} from 'react-native-step-progress-bar/src';
import CheckVerification from '../../components/CheckVerification'
import ProgressHud from "../../components/ProgressHud";


export default class VerifyLineSuccessScreen extends ValidationComponent {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            showModal: false,
            modalBody: '',
            modalHeader: null,
            modalImage: Images.alert_inbox,
            modalButton: `${translang.t('COMMON_ok')}`,
            isSetPassword: false,

            selectedSchool: null,
            userName: "",
            showSchoolModal: false,
            currentEmail: "",
            newPassword: "",
            confirmPassword: "",
            logininfo: {},
            code: '',
            verifyInfo: '',
            type: 1,
        };
    }

    handleBackButton = () => {
        this._back();
        return true;
    };

    modalButtonClick = () => {

        this.setState({showModal: false});

    };

    _back = () => {
        if (this.backhandler) {
            this.backhandler.remove();
        }

        const parentRoute = this.props.navigation.getParam('parent') ?? 'App';
        this.props.navigation.navigate(parentRoute);
    };

    async componentDidMount() {
        const {navigation} = this.props;
        this.setState({isLoading: true});
        const type = await StorageManager.getLineConnectionType();
        this.setState({type: type});
        const userInfo = await StorageManager.getUserInfo();
        const result = await CheckVerification.checkVerification(userInfo.SchoolID, userInfo.ID);

        this.setState({verifyInfo: result.verifyInfo, isLoading: false});

        this.focusListener = navigation.addListener("didFocus", async () => {
            if (this.backhandler) {
                this.backhandler.remove();
            }
            this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

        });

    }

    componentWillUnmount = () => {
        if (this.backhandler) {
            this.backhandler.remove();
        }
        if (this.focusListener) {
            this.focusListener.remove();
        }
    };

    confirm = async () => {
        const {verifyInfo, type} = this.state;
        if (type == 0) {
            if (verifyInfo.emailVerify && verifyInfo.phoneVerify && verifyInfo.lineConnect) {
                this.props.navigation.navigate('VerifyDevice', {parent: 'Login'});
            } else {
                this.props.navigation.navigate('VerifyWarning', {parent: 'VerifyLineConnect'});
            }

        } else {
            this.props.navigation.navigate('SecuritySetting');
        }

    };

    render() {

        const {verifyInfo, type} = this.state;

        return (
            <SafeAreaView style={styles.container}>
                {type == 0 &&
                <BackNavigationBar
                    style={{elevation: 0}}
                    title={translang.t('Step') + "  5"}
                    is_skip={true}
                    onPressSkip={() => {
                    }}
                    backHidden={true}
                    onMenuTap={() => this._back()}
                />}

                <KeyboardAwareScrollView style={styles.container}>
                    <View style={{alignItems: 'center', flex: 1}}>
                        <View style={{paddingVertical: 20, width: 360}}>
                            {type == 0 &&
                            <StepProgressBar
                                style={{margin: 'auto', borderWidth: 2, borderColor: 'red'}}
                                orientation={'horizondal'}
                                stepColor="lightgreen"
                                activeStep={1}
                                completedBarColor={'lightgrey'}
                                stepWidth={50}
                                stepHeight={50}
                                showLabel={true}
                                barLength={70}
                                barThickeness={2}
                                data={[
                                    {label: translang.t('SETTING_addEmail')},
                                    {label: translang.t('SETTING_EditPhoneNumber')},
                                    {label: translang.t('SETTING_Line')},
                                ]}
                                barColor={'lightgrey'}
                                labelTextStyle={{fontFamily: 'THSarabunNew', color: 'darkgrey', fontSize: 20}}
                                renderStep={({index}) => {
                                    if (index === 0) {
                                        return (
                                            <View
                                                style={styles.stepImage}>
                                                <Image
                                                    style={{width: '100%', height: '100%'}}
                                                    source={verifyInfo.emailVerify ? Images.ic_verified_email : Images.ic_grey_email}
                                                />
                                            </View>
                                        );
                                    } else if (index === 1) {
                                        return (
                                            <View
                                                style={styles.stepImage}>
                                                <Image
                                                    style={{width: '100%', height: '100%'}}
                                                    source={verifyInfo.phoneVerify ? Images.ic_verified_phone : Images.ic_grey_phone}
                                                />
                                            </View>
                                        );
                                    } else if (index === 2) {
                                        return (
                                            <View
                                                style={styles.stepImage}>
                                                <Image
                                                    style={{width: '100%', height: '100%'}}
                                                    source={verifyInfo.lineConnect ? Images.ic_verified_line : Images.ic_grey_line}
                                                />
                                            </View>
                                        );
                                    }
                                }}
                            />
                            }

                            <View>
                                < View style={styles.appimage}>
                                    <Image
                                        source={verifyInfo.lineConnect ? Images.n_img_complete_green : Images.ic_close}
                                        style={styles.lineLogo} resizeMode='contain'/>
                                </View>

                                <View style={styles.titleContainer}>
                                    <Text
                                        style={styles.bigText}>{verifyInfo.lineConnect ? translang.t('Line_Connection_Succeeded') : translang.t('Not_connected_line')}</Text>
                                </View>
                            </View>

                        </View>
                    </View>

                    <GradientButton
                        containerStyle={styles.loginBtn}
                        label={translang.t('COMMON_confirm')}
                        colors={[Color.green_button_color]}
                        _onPress={() => this.confirm()}
                    />

                    <AlertWithImageModal
                        isVisible={this.state.showModal}
                        image={this.state.modalImage}
                        title={this.state.modalHeader}
                        message={this.state.modalBody}
                        buttonColors={[Color.green_button_color]}
                        isVerticalGradient={false}
                        onClose={() => {
                            this.modalButtonClick()
                        }}
                    />

                </KeyboardAwareScrollView>
                <ProgressHud isVisible={this.state.isLoading}/>
            </SafeAreaView>
        );
    }
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.n_background_white
    },
    appLogo: {
        width: '100%',
        height: '100%',
    },
    BtnContainer: {
        width: '100%',
        height: 70,
        marginTop: 25,
        paddingHorizontal: 50,
    },

    loginBtnBackground: {
        flex: 1,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },

    loginBtn: {
        width: '100%',
        height: 70,
        paddingHorizontal: 50,
    },

    bigText: {
        width: '100%',
        fontSize: 28,
        textAlign: 'center',
    },

    titleContainer: {
        paddingVertical: 40,
        paddingHorizontal: 40,
    },
    stepImage: {
        width: 50,
        height: 50,
        borderRadius: 25,

    },
    textButton: {
        fontSize: 24,
        borderBottomColor: "#fc8668",
        borderBottomWidth: 1,
        marginTop: 30,
    },
    textButtonContainer: {
        // borderBottomColor: "#fc8668",
        // borderBottomWidth: 1,
        // width: '100%',
    },
    lineLogo: {
        width: '80@vs',
        height: '80@vs',
    },
    appimage: {
        marginTop: '50@vs',
        width: '100%',
        alignItems: 'center',
    },

});
