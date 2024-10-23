import React from 'react';
import {
    Image,
    View,
    TouchableOpacity,
    BackHandler,
    ScrollView,
} from 'react-native';
import {Text} from 'native-base';
import {ScaledSheet, moderateScale} from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import {SafeAreaView} from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import SettingIconInfoItem from '../../components/SettingIconInfoItem';
import translang, {getCurrentLocale} from '../../utils/language.utils';
import Constant from '../../constants/constants';
import {removeUser} from '../../utils/DBManager';
import ConfirmModal from '../../components/LogoutModal';
import Storage from '../../managers/StorageManager';
import ApiManager from "../../managers/ApiManager";

export default class SettingManageAccount extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            user: {},
            refresh: false,
            addUsers: [],
            showconfirmmodal: false,
            selectedItem: null,
            deviceInfo: {},
        };
    }

    handleBackButton = () => {
        this.back();
        return true;
    };

    async componentDidMount() {
        const {navigation} = this.props;
        this.focusListener = navigation.addListener("didFocus", async () => {
            if (this.backhandler) {
                this.backhandler.remove();
            }
            this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

            const deviceInfo = await Storage.getDeviceInfo();
            const _user = this.props.navigation.getParam('userInfo');
            this.setState({user: _user, addUsers: Constant.AddProfiles, deviceInfo: deviceInfo});
            console.log("users:", this.state.addUsers);
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
    back = () => {
        if (this.backhandler) {
            this.backhandler.remove();
        }

        this.props.navigation.navigate('Setting');
    };

    onRemovePress = () => {
        const {selectedItem} = this.state;

        const token = this.state.deviceInfo.fcmtoken;
        const userId = selectedItem.userid;
        const schoolId = selectedItem.schoolID;
        const imei = this.state.deviceInfo.imei;
        const system = this.state.deviceInfo.system;
        const appversion = this.state.deviceInfo.version;

        const promise = ApiManager.removeNotification(token, userId, schoolId, imei, system, appversion);

        promise.then(result => {
            if (result.StatusCode == "200") {
                let resRemove = removeUser(selectedItem.userid);
                if (resRemove) {
                    Constant.AddProfiles = Constant.AddProfiles.filter(item => item != selectedItem);
                    this.setState({addUsers: Constant.AddProfiles, showconfirmmodal: false, isLoading: false});
                } else {
                    console.log("Remove Fails");
                    this.setState({
                        isLoading: false,
                        showconfirmmodal: false,
                        showModal: true,
                        modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN')
                    });
                }
            }
        }).catch(error => {
            console.log(error);
            this.setState({
                isLoading: false,
                showconfirmmodal: false,
                showModal: true,
                modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN')
            });
        })
    };

    renderAddedProfileMenuItem() {
        const {addUsers} = this.state
        const res = []

        if (addUsers.length > 0) {
            console.log("stu id", addUsers);
            const isStudent = this.state.user.StudentId !== ''
            for (let i = 0; i < addUsers.length; i++) {
                let item = addUsers[i];
                let profileImage = item.type == '0' ? Images.student_01 : Images.teacher_02;
                if (item.imguser !== "null") {
                    profileImage = {uri: item.imguser};
                }

                var isRemoval = true;
                if (this.state.user.ID == item.userid) {
                    isRemoval = false;
                }

                let name = item.name;
                let lastname = item.lastname;

                if (getCurrentLocale() == 'en' && item.nameen !== undefined && item.nameen !== '' && item.nameen !== '') {
                    name = item.nameen;
                    lastname = item.lastnameen;
                }

                res.push(
                    <View style={styles.buttonStyle} key={i}>
                        <View style={styles.menuItem}>
                            <View style={styles.imageView}>
                                <Image source={profileImage} style={styles.image}></Image>
                            </View>
                            <View style={{
                                flexDirection: 'column',
                                marginVertical: 10,
                                justifyContent: 'center',
                                flex: 1
                            }}>
                                <Text style={styles.topText}>{item.userloginid}</Text>
                                <Text style={styles.topText}>{name}</Text>
                                <Text style={styles.topText}>{lastname}</Text>
                            </View>
                            {isRemoval &&
                            <TouchableOpacity
                                onPress={() => {
                                    this.setState({selectedItem: item, showconfirmmodal: true})
                                }}>
                                <Image source={Images.n_ic_remove_ornage} style={{height: 29, width: 29}}/>
                            </TouchableOpacity>
                            }
                        </View>
                    </View>
                );
            }
        }

        return res;
    }

    onAddAccount = () => {
        this.props.navigation.navigate('SettingAddAccount', {parent: "SettingManageAccount"});
    };

    render() {
        const {addUsers} = this.state
        return (
            <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
                <BackNavigationBar
                    title={translang.t('DRAWER_manageaccount')}
                    onMenuTap={() => this.back()}
                />

                <ScrollView style={{marginTop: 10}}>
                    <View>
                        {this.renderAddedProfileMenuItem()}
                    </View>
                    <TouchableOpacity style={styles.buttonStyle} activeOpacity={0.9}
                                      onPress={() => this.onAddAccount()}>
                        <SettingIconInfoItem
                            icon_mark={Images.n_ic_nav_addaccount}
                            label={translang.t('DRAWER_addaccount')}
                            topTextStyle={styles.optionText}
                            imageSize={25}
                        />
                    </TouchableOpacity>

                </ScrollView>
                <ConfirmModal
                    isVisible={this.state.showconfirmmodal}
                    image={Images.n_ic_warning}
                    showCancelButton={true}
                    message={translang.t('COMMON_msg_confirm_remove')}
                    onClose={() => {
                        this.setState({showconfirmmodal: false})
                    }}
                    onConfirm={() => {
                        this.onRemovePress()
                    }}
                />
            </SafeAreaView>
        );
    }
}

const styles = ScaledSheet.create({
    container: {
        height: '100%',
        backgroundColor: Color.n_background_white,
    },
    dispcontainer: {
        flex: 1,
        marginHorizontal: 5,
        marginVertical: 5,
        borderRadius: 5,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    itemIcon: {
        width: '25@ms',
        height: '25@ms',
    },
    uperCardChild: {
        flexDirection: 'row',
        marginHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: 'transparent',
        alignItems: 'center',
    },
    itemText: {
        color: '#000',
        fontSize: '14@ms',
    },
    itemActions: {
        position: 'absolute',
        right: 1,
        alignItems: 'center',
    },
    title2: {
        fontFamily: 'THSarabunNew',
        fontSize: 16,
        fontWeight: 'bold'
    },
    value2: {
        fontFamily: 'THSarabunNew',
        fontSize: 16,
    },
    buttonStyle: {
        marginHorizontal: 15,
        borderRadius: 15,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 4,
        marginVertical: 7,
        paddingHorizontal: 20,
    },

    optionText: {
        fontFamily: 'THSarabunNew',
        fontSize: 24,
        fontWeight: 'bold',
        color: Color.n_default_gray
    },

    backbutton: {
        color: Color.white,
        textAlign: 'center',
        fontSize: 18,
    },

    menuItem: {
        flexDirection: 'row',
        marginVertical: 6,
        alignItems: 'center',
    },
    image: {
        height: 70,
        width: 70,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },

    imageView: {
        borderRadius: 35,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
            width: 2,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 2,
        marginRight: 15,
    },

    topText: {
        fontFamily: 'THSarabunNew',
        fontSize: 24,
        fontWeight: 'bold',
        color: Color.dark
    },
});
