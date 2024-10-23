import React from 'react';
import {Image, View, BackHandler, TouchableOpacity, FlatList, Modal, RefreshControl} from 'react-native';
import {Text} from 'native-base';
import {ScaledSheet} from 'react-native-size-matters';
import Images from '../../themes/Images';
import {SafeAreaView} from 'react-native-safe-area-context';
import NotificationIconInfoItem from '../../components/NotificationIconInfoItem';
import translang, {getCurrentLocale} from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import NotificationDetailModal from '../../components/NotificationDetailModal';
import NotificationSystemDetailModal from '../../components/NotificationDetailModal';
import BackNavigationBar from '../../components/BackNavigationBar';
import Color from '../../constants/color';
import GradientButton from '../../components/GradientButton';
import CustomSwitcher from '../../components/CustomSwitcher';
import RNFS from "react-native-fs";
import FileViewer from "react-native-file-viewer";
import ImageView from "react-native-image-viewing";
import AlertWithImageModal from '../../components/AlertWithImageModal';


export default class NotificationScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            showModalSystem: false,
            showModalOffline: false,
            modalBody: '',
            showHelp: false,
            filteredMessageList: [],
            filteredSystemMessageList: [],
            userInfo: {},
            isLoading: false,
            isFirstLoading: false,
            selMessage: {},
            selMessageSys: {},
            filterOption: 0,     // 0: all, 1: read, 2: unread

            isFetching: false,

            currentPageMessage: 0,
            todayList: [],
            otherList: [],


            currentPageSystem: 0,
            systemList: [],

            switcherIndex: 0,
            showImageView: false,
            showImages: [],

            totalGeneralUnreadCnt: 0,
            totalSystemUnreadCnt: 0,
        };
    }

    handleBackButton = () => {
        this.back();
        return true;
    };

    unsubscribe = null;

    async componentDidMount() {
        this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        const userInfo = await Storage.getUserInfo();
        this.setState({userInfo: userInfo, isFirstLoading: true}, async () => {
            await this.loadNotificationData(true);
            await this.loadSystemMessageData();
            await this.loadUnreadMessageCount();
            await this.loadUnreadSystemMessageCount();
            this.setState({isFirstLoading: false});
        });
    }

    componentWillUnmount = () => {
        if (this.backhandler) {
            this.backhandler.remove();
        }
        if (this.focusListener) {
            this.focusListener.remove();
        }
        // this.unsubscribe();
    };

    onRefreshMessage() {
        this.setState({isFetching: true,}, () => {
            this.loadNotificationData(true);
        });
    }

    onRefreshSystem() {
        this.setState({isFetching: true,}, () => {
            this.loadSystemMessageData(true);
        });
    }

    loadSystemMessageData = async (isRefresh) => {
        try {
            this.setState({isLoading: true});

            const userInfo = this.state.userInfo;
            const page = isRefresh ? 0 : this.state.currentPageSystem;

            const list = await ApiManager.getNotificationSystem(userInfo.ID, page + 1);
            this.updateSystemList(isRefresh, list, page);
            this.setState({isLoading: false});
        } catch (error) {
            console.log("loadSystemMessageData", error);
            this.setState({isLoading: false});
        }
    }

    updateSystemList = (isRefresh, list, page) => {
        const messageList = isRefresh ? list : this.state.systemList.concat(list);
        this.setState({
            systemList: messageList,
            isLoading: false,
            currentPageSystem: page + 1,
            isFetching: false
        }, this.doFilter);
    }


    loadUnreadMessageCount = async () => {
        try {
            const count = await ApiManager.getCountUnreadMessage(this.state.userInfo.ID);
            this.setState({totalGeneralUnreadCnt: count});
        } catch (error) {
            console.log("GetUnreadCount", error);
        }
    }


    loadUnreadSystemMessageCount = async () => {
        try {
            const count = await ApiManager.getCountUnreadSystemMessage(this.state.userInfo.ID);
            this.setState({totalSystemUnreadCnt: count});
        } catch (error) {
            console.log("loadUnreadSystemMessageCount", error);
        }
    }

    loadNotificationData = async (isRefresh) => {
        try {
            this.setState({isLoading: true});
            const userInfo = this.state.userInfo;
            const page = isRefresh ? 0 : this.state.currentPageMessage;
            const lang = getCurrentLocale();
            const list = await ApiManager.getNotificationMessageListToday(userInfo.ID, page + 1, lang);
            const messageList = isRefresh ? list : this.state.todayList.concat(list);
            this.setState({todayList: messageList});
            await this.loadNotificationDataWeek(isRefresh);
            this.setState({isLoading: false});
        } catch (error) {
            console.log("loadNotificationData", error);
            this.setState({isLoading: false});
        }
    };

    loadNotificationDataWeek = async (isRefresh) => {
        try {
            this.setState({isLoading: true});
            const userInfo = this.state.userInfo;
            const page = isRefresh ? 0 : this.state.currentPageMessage;
            const lang = getCurrentLocale();
            const list = await ApiManager.getNotificationMessageListWeek(userInfo.ID, page + 1, lang);
            this.updateMessageList(isRefresh, list, page);
        } catch (error) {
            console.log("loadNotificationDataWeek", error);
            this.setState({isLoading: false});
        }
    }

    updateMessageList = (isRefresh, list, page) => {
        let messageList = isRefresh ? list : this.state.otherList.concat(list);

        this.setState({
            otherList: messageList,
            isLoading: false,
            currentPageMessage: page + 1
        }, this.doFilter);

    }

    doFilter = () => {
        let result = [];
        let res_system = [];
        let todayGeneral = [];
        let weekGeneral = [];
        if (this.state.filterOption == "0") {
            todayGeneral = this.state.todayList;
            weekGeneral = this.state.otherList;
            res_system = this.state.systemList;
        } else if (this.state.filterOption == "1") {
            todayGeneral = this.state.todayList.filter(item => item.nStatus == 1)
            weekGeneral = this.state.otherList.filter(item => item.nStatus == 1);
            res_system = this.state.systemList.filter(item => item.message_read == 1);
        } else if (this.state.filterOption == "2") {
            todayGeneral = this.state.todayList.filter(item => item.nStatus == 0)
            weekGeneral = this.state.otherList.filter(item => item.nStatus == 0);
            res_system = this.state.systemList.filter(item => item.message_read == 0);
        }

        if (todayGeneral.length > 0) {
            let tempItem = {status: '98', nMessageID: '', dSend: '', SMSTitle: '', message_read: '', SMSDesp: ''};
            result.push(tempItem);
            result.push(...todayGeneral);
        }
        if (weekGeneral.length > 0) {
            let tempItem = {status: '99', nMessageID: '', dSend: '', SMSTitle: '', message_read: '', SMSDesp: ''};
            result.push(tempItem);
            result.push(...weekGeneral);
        }

        this.setState({filteredMessageList: result, filteredSystemMessageList: res_system, isFetching: false});
    };

    back = () => {
        this.props.navigation.navigate('App');
    };

    onAllSelect = () => {
        this.setState({filterOption: '0'}, () => {
            this.doFilter();
        });
    }

    onReadSelect = () => {
        this.setState({filterOption: '1'}, () => {
            this.doFilter();
        });
    }
    onUnreadSelect = () => {
        this.setState({filterOption: '2'}, () => {
            this.doFilter();
        });
    }
    onReadAllSelect = () => {
        const userInfo = this.state.userInfo;
        ApiManager.readAllMessage(userInfo.ID).then(
            () => {
                this.loadNotificationData(true);
                this.loadSystemMessageData(true);
                this.loadUnreadMessageCount();
                this.loadUnreadSystemMessageCount();
            }
        );


    }

    renderItem = (item, index) => {
        const status = item.status;
        const date = item.dSend;
        let image = null;

//1: Homework 2: Shop, 3: Topup 5: News, 8: Leave  7: excutive report
        if (item.nType === 14) {
            if (item.nStatus === 1) {
                image = Images.i_car_read;
            } else {
                image = Images.i_car;
            }

        } else if (item.nType === 10) {
            image = Images.n_ic_message_homework
        } else if (item.nType === 9) {
            image = Images.n_ic_nav_behaivor
        } else if (item.nType === 8) {
            image = Images.n_ic_notification_default
        } else if (item.nType === 5) {
            image = item.logo ? {uri: item.logo} : Images.n_ic_notification_system_orange;
        } else if (item.nType === 1) {
            image = Images.n_ic_notification_homework
        } else if (item.nType === 2) {
            if (item.nStatus === 1) {
                image = Images.n_ic_notification_shop_read;
            } else {
                image = Images.n_ic_notification_shop_white;
            }
        } else if (item.nType === 3) {
            if (item.nStatus === 1) {
                image = Images.n_ic_notification_shop_read;
            } else {
                image = Images.n_ic_notification_shop_white;
            }
        } else {
            if (item.nStatus === 1) {
                image = Images.n_ic_notification_system_orange;
            } else {
                image = Images.n_ic_notification_system_white;
            }
        }
        if (status == "98") {
            return (<Text style={styles.timeintervalStyle}>{translang.t('TODAY')}</Text>);
        } else if (status == "99") {
            return (<Text style={styles.timeintervalStyle}>{translang.t('SEVEN_DAYS_BACK')}</Text>);
        } else {
            return (
                <View style={styles.listItem}>
                    <TouchableOpacity activeOpacity={0.5} onPress={() => {
                        this.onClickMessage(item)
                    }}>
                        <NotificationIconInfoItem
                            icon={image}
                            label={item.sTitle}
                            value_txt={item.sMessage}
                            dateText={date}
                            isRead={item.nStatus === 1}
                        />
                    </TouchableOpacity>
                </View>
            );
        }
    };

    renderItemSystem = (item, index) => {
        return (
            <View style={styles.listItem}>
                <TouchableOpacity activeOpacity={0.5} onPress={() => {
                    this.onClickMessageSystem(item)
                }}>
                    <NotificationIconInfoItem
                        icon={Images.n_ic_notification_system_white}
                        label={item.SMSTitle}
                        value_txt={item.SMSDesp}
                        dateText={item.dSend}
                        isRead={item.message_read === 1}
                    />
                </TouchableOpacity>
            </View>
        );
    };

    onClickMessage = (item) => {
        const userInfo = this.state.userInfo;
        const lang = getCurrentLocale();

        this.setState({isLoading: true});
        ApiManager.readNewsMessage(userInfo.ID, item.nMessageID, '', lang).then(detail => {
            const temp = this.state.filteredMessageList;
            const ind = this.state.filteredMessageList.findIndex((it) => it == item)
            temp[ind].nStatus = 1;

            this.loadUnreadMessageCount();
            if (detail.nType == 8 || detail.nType == -8) {
                this.setState({isLoading: false, filteredMessageList: temp});
                this.props.navigation.navigate('LeaveRequestDetail', {
                    letterId: detail.nMessageID,
                    userInfo: this.state.userInfo,
                    from: 'Notification',
                    type: 'notification'
                });
            } else if (detail.nType == 7) {
                this.setState({isLoading: false, filteredMessageList: temp});
                this.props.navigation.navigate('ReportExecutiveAttendance', {
                    parent: 'Notification',
                    date: detail.dSend,
                    userInfo: this.state.userInfo
                });
            } else if (detail.nType == 6) {
                this.setState({isLoading: false, filteredMessageList: temp});
                this.props.navigation.navigate('OnlineStudentHomeworkDetailForNotification', {
                    parent: 'Notification',
                    homeworkID: detail.homework_id ?? ""
                });
            } else {
                this.setState({selMessage: detail, showModal: true, isLoading: false, filteredMessageList: temp});
            }
        }).catch(error => {
            console.log(error);
            this.setState({isLoading: false});
        });
    };

    onClickMessageSystem = (item) => {
        const userInfo = this.state.userInfo;
        this.setState({isLoading: true});
        ApiManager.readSystemMessage(userInfo.ID, item.nMessageID).then(detail => {
            const temp = this.state.systemList;
            const ind = this.state.systemList.findIndex((it) => it == item)
            temp[ind].message_read = 1;

            this.loadUnreadSystemMessageCount();

            this.setState({selMessageSys: detail, showModalSystem: true, isLoading: false, systemList: temp});
        }).catch(error => {
            console.log(error);
            this.setState({isLoading: false});
        });
    };

    onClickHelpNavButton = () => {
        this.setState({showHelp: true})
    };

    openFile = (item) => {
        let date = new Date();
        const url = item.filename;
        const fileName = "notification_" + Math.floor(date.getTime() + date.getSeconds() / 2);
        const extension = this.getUrlExtension(url, item.filetype);
        const localFile = `${RNFS.DocumentDirectoryPath}/${fileName}.${extension}`;
        const options = {fromUrl: url, toFile: localFile};
        this.setState({isLoading: true});
        RNFS.downloadFile(options)
            .promise.then(() => {
            FileViewer.open(localFile)
                .then(() => {
                    console.log("success open")
                })
                .catch((error) => {
                    console.log("open error", error);
                    this.setState({showModalOffline: true, modalBody: translang.t('PDF_VIEWER_ERROR')})
                })
        })
            .then(() => {
                this.setState({isLoading: false});
            })
            .catch((error) => {
                this.setState({isLoading: false});
                console.log("OpenFilesError", error);
            });
    }
    getUrlExtension = (url, filetype) => {
        let res = url.split(/[#?]/)[0].split(".").pop().trim();
        if (res.length > 4) {
            res = filetype.split('/').pop().trim();
        }
        return res;
    }

    onClickReplyBtn = (item) => {
        const userid = this.state.userInfo.ID
        const messageid = this.state.selMessage.nMessageID;
        const replycode = item.ReplyCode;
        ApiManager.MessageReply(userid, messageid, replycode).then(res => {
            if (res.statusCode == '200') {
                this.setState({showModal: false});
            }
        }).catch(error => {
            console.log(error);
        });
    }

    onChangeSwitcher = (index) => {
        this.setState({switcherIndex: index});
    }

    render() {
        let message = this.state.selMessage;
        let messageSys = this.state.selMessageSys;

        if (message.fileUploads == null || message.fileUploads == undefined) {
            message.fileUploads = [];
        }

        if (message.replyButtons == null || message.replyButtons == undefined) {
            message.replyButtons = [];
        }


        if (messageSys.fileUploads == null || messageSys.fileUploads == undefined) {
            messageSys.fileUploads = [];
        }

        const options = [
            {title: translang.t('MyMessage'), unreadCnt: this.state.totalGeneralUnreadCnt},
            {title: translang.t('SystemMessage'), unreadCnt: this.state.totalSystemUnreadCnt},
        ];

        const moreActions = [
            translang.t('NOTIFICATION_all'),
            translang.t('NOTIFICATION_read'),
            translang.t('NOTIFICATION_unread'),
            translang.t('NOTIFICATION_readall')
        ];

        return (
            <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
                <BackNavigationBar
                    title={translang.t('DRAWER_notification')}
                    onMenuTap={() => this.back()}
                    is_help={true}
                    onHelpTap={() => this.onClickHelpNavButton()}
                    is_more='1'
                    actions={moreActions}
                    onMoreTap={(value, index) => {
                        if (index === 0)
                            this.onAllSelect()
                        else if (index === 1)
                            this.onReadSelect()
                        else if (index === 2)
                            this.onUnreadSelect()
                        else if (index === 3)
                            this.onReadAllSelect()
                    }}
                    // is_notification="1"

                />
                <View style={styles.container}>
                    <CustomSwitcher
                        dataList={options}
                        selectedIndex={this.state.switcherIndex ?? 0}
                        onChangedSwitch={(index) => this.onChangeSwitcher(index)}
                        containerStyle={{width: '90%', height: 50, marginTop: 40, marginBottom: 20}}
                        radius={18}
                        showUnreadCnt={true}
                    />
                    {this.state.switcherIndex == 0 && this.state.filteredMessageList.length > 0 &&

                    <FlatList
                        style={styles.menuContainer}
                        data={this.state.filteredMessageList}
                        onRefresh={() => this.onRefreshMessage()}
                        refreshing={this.state.isFetching}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item, index}) => this.renderItem(item, index)}
                        onEndReachedThreshold={0.01}
                        onEndReached={() => {
                            if (this.state.filteredMessageList.length <= 10) {
                            } else {
                                this.loadNotificationData(false)
                            }
                        }}
                    />}


                    {this.state.switcherIndex == 1 && this.state.filteredSystemMessageList.length > 0 &&
                    <FlatList
                        style={styles.menuContainer}
                        data={this.state.filteredSystemMessageList}
                        onRefresh={() => this.onRefreshSystem()}
                        refreshing={this.state.isFetching}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item, index}) => this.renderItemSystem(item, index)}
                        onEndReachedThreshold={0.01}
                        onEndReached={() => {
                            if (this.state.filteredSystemMessageList.length <= 10) {

                            } else {
                                this.loadSystemMessageData(false)
                            }
                        }}
                    />
                    }
                </View>

                <NotificationDetailModal
                    isVisible={this.state.showModal}
                    msgDetail={message}
                    message={message.sMessage}
                    title={message.sTitle}
                    date={message.dSend}
                    attachedFiles={message.fileUploads}
                    buttonList={message.replyButtons}
                    sender={message.NewsCreatedBy ?? translang.t('SCHOOL_BRIGHT_SYSTEM')}
                    clickFiles={(item) => this.openFile(item)}
                    onClose={() => {
                        this.setState({showModal: false})
                    }}
                    onClickReply={(item) => this.onClickReplyBtn(item)}/>

                <NotificationSystemDetailModal
                    isVisible={this.state.showModalSystem}
                    msgDetail={messageSys}
                    message={messageSys.MessageDetail}
                    title={messageSys.MessageType}
                    date={messageSys.dSend}
                    attachedFiles={messageSys.fileUploads}
                    buttonList={[]}
                    sender={translang.t('SCHOOL_BRIGHT_SYSTEM')}
                    clickFiles={(item) => this.openFile(item)}
                    onClose={() => {
                        this.setState({showModalSystem: false})
                    }}
                    onClickReply={(item) => this.onClickReplyBtn(item)}/>

                <ProgressHud isVisible={this.state.isLoading || this.state.isFirstLoading}/>

                <AlertWithImageModal
                    isVisible={this.state.showModalOffline}
                    image={Images.n_ic_warning}
                    message={this.state.modalBody}
                    buttonColors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
                    isVerticalGradient={false}
                    onClose={() => {
                        this.setState({showModalOffline: false})
                    }}
                />

                {this.state.showHelp &&
                <Modal
                    animationType='fade'
                    transparent={true}
                    key="modal">
                    <View style={styles.centeredView}>
                        <View style={{...styles.dialogStyle, width: "90%"}}>
                            <Image source={Images.n_applogo_logo} style={styles.alertImage}/>
                            <Text style={[styles.text]}>{translang.t('NOTIFICATION_ALERT')}</Text>

                            <GradientButton
                                label={translang.t('COMMON_close')}
                                containerStyle={styles.buttonContainer}
                                buttonStyle={{borderRadius: 0}}
                                colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                                textStyle={{fontSize: 24, fontWeight: 'bold'}}
                                isVerticalGradient={false}
                                _onPress={() => {
                                    this.setState({showHelp: false})
                                }}/>
                        </View>
                    </View>
                </Modal>}

                <ImageView
                    images={this.state.showImages}
                    imageIndex={0}
                    visible={this.state.showImageView}
                    swipeToCloseEnabled={false}
                    onRequestClose={() => this.setState({showImageView: false, selImageIndex: 0})}/>
            </SafeAreaView>
        );
    }
}

const styles = ScaledSheet.create({

    listItem: {
        backgroundColor: Color.white,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 2,
        marginVertical: 5,
        marginHorizontal: 10,
    },

    switchContainer: {
        marginHorizontal: 30,
        marginTop: 20,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 2,
        borderRadius: 25,


    },

    container: {
        flex: 1,
        backgroundColor: Color.n_background_white,
    },
    menuContainer: {
        marginTop: 10,
        paddingHorizontal: 10,
    },
    alarmText: {
        fontFamily: 'THSarabunNew',
        color: 'black',
        fontSize: 20,
    },

    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000070',
    },
    dialogStyle: {
        width: '90%',
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 40,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.25,
        elevation: 5,
        overflow: 'hidden',
        backgroundColor: 'white',
    },

    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: Color.n_default_gray,

    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'THSarabunNew',
        color: Color.n_default_gray,
        marginBottom: 20,
    },

    buttonContainer: {
        width: 126,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center'
    },

    alertImage: {
        height: 60,
        width: 100,
        resizeMode: 'contain',
        marginBottom: 20,
    },

    timeintervalStyle: {
        fontFamily: 'THSarabunNew',
        fontWeight: 'bold',
        fontSize: 24,
        color: Color.n_default_gray,
        marginTop: 15,
        marginLeft: 20,

    },
});
