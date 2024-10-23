import React from 'react';
import {Image, View, BackHandler, TouchableOpacity, FlatList, Modal, RefreshControl} from 'react-native';
import {Text} from 'native-base';
import {ScaledSheet} from 'react-native-size-matters';
import Images from '../../themes/Images';
import {DrawerActions} from 'react-navigation-drawer';
import {SafeAreaView} from 'react-native-safe-area-context';
import NavigationBar from '../../components/NavigationBar';
import NotificationIconInfoItem from '../../components/NotificationIconInfoItem';
import translang, {getCurrentLocale} from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import moment from 'moment';
import NotificationDetailModal from '../../components/NotificationDetailModal';
import NotificationSystemDetailModal from '../../components/NotificationDetailModal';
import BackNavigationBar from '../../components/BackNavigationBar';
import SwitchSelector from 'react-native-switch-selector';
import Color from '../../constants/color';
import GradientButton from '../../components/GradientButton';
import {ScrollView} from 'react-native-gesture-handler';
import CustomSwitcher from '../../components/CustomSwitcher';
import RNFS, {stat} from "react-native-fs";
import FileViewer from "react-native-file-viewer";
import ImageView from "react-native-image-viewing";
import NetInfo from "@react-native-community/netinfo";
import AlertWithImageModal from '../../components/AlertWithImageModal';
import NextButton from "../../components/NextButton";

export default class NotificationScreen1 extends React.Component {
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
    this.setState({userInfo: userInfo}, () => {
      this.loadNotificationData(true);
      this.loadSystemMessageData();
      this.loadUnreadMessageCount();
      this.loadUnreadSystemMessageCount();
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

  loadSystemMessageData = (isRefresh) => {
    this.setState({isLoading: true});

    const userInfo = this.state.userInfo;
    const page = isRefresh ? 0 : this.state.currentPageSystem;

    ApiManager.getNotificationSystem(userInfo.ID, page + 1).then(list => {
      let messageList = this.state.systemList;
      if (!isRefresh) {
        messageList = messageList.concat(list);
      } else {
        messageList = list;
      }
      this.setState({systemList: messageList, isLoading: false, currentPageSystem: page + 1, isFetching: false}, () => {
        this.doFilter();
      });
    }).catch(error => {
      console.log("loadSystemMessageData", error);
      this.setState({isLoading: false});
    });
  };

  loadUnreadMessageCount = () => {
    ApiManager.getCountUnreadMessage(this.state.userInfo.ID)
      .then(count => {

        this.setState({totalGeneralUnreadCnt: count});
      }).catch(error => {
      console.log("GetUnreadCount", error);
    });
  }

  loadUnreadSystemMessageCount = () => {
    ApiManager.getCountUnreadSystemMessage(this.state.userInfo.ID)
      .then(count => {
        this.setState({totalSystemUnreadCnt: count});
      }).catch(error => {
      console.log("loadUnreadSystemMessageCount", error);
    });
  }

  loadNotificationData = (isRefresh) => {
    this.setState({isLoading: true});

    const userInfo = this.state.userInfo;
    const page = isRefresh ? 0 : this.state.currentPageMessage;
    const lang = getCurrentLocale();

    ApiManager.getNotificationMessageListToday(userInfo.ID, page + 1, lang).then(list => {
      let messageList = this.state.todayList;
      if (!isRefresh) {
        messageList = messageList.concat(list);
      } else {
        messageList = list;
      }
      this.setState({todayList: messageList}, () => {
        this.loadNotificationDataWeek(isRefresh);
      });
    }).catch(error => {
      console.log("loadNotificationData", error);
      this.setState({isLoading: false});
    });
  };

  loadNotificationDataWeek = (isRefresh) => {
    this.setState({isLoading: true});
    const userInfo = this.state.userInfo;
    const page = isRefresh ? 0 : this.state.currentPageMessage;
    const lang = getCurrentLocale();
    ApiManager.getNotificationMessageListWeek(userInfo.ID, page + 1, lang).then(list => {
      let messageList = this.state.otherList;
      if (!isRefresh) {
        messageList = messageList.concat(list);
      } else {
        messageList = list;
      }

      this.setState({otherList: messageList, isLoading: false, currentPageMessage: page + 1}, () => {
        this.doFilter()
      });
    }).catch(error => {
      console.log("loadNotificationDataWeek", error);
      this.setState({isLoading: false});
    });
  };

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
    this.props.navigation.goBack();
  };

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
  };


  renderItem = (item, index) => {
    const status = item.status;
    const date = item.dSend;
    let image = null;

//1: Homework 2: Shop, 3: Topup 5: News, 8: Leave  7: excutive report
    if (item.nType === 8) {
      image = Images.n_ic_notification_default
    } else if (item.nType === 5) {
      if (item.nStatus === 1) {
        image = Images.n_ic_notification_system_orange;
      } else {
        image = Images.n_ic_notification_system_white;
      }
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
      return (<View key={index}/>);
    } else if (status == "99") {
      return (<View key={index}/>);
    } else {
      return (
        <View style={styles.listItem} key={index}>
          <TouchableOpacity activeOpacity={0.5} onPress={() => {
            this.onClickMessage(item)
          }}>
            <NotificationIconInfoItem
              style={{minHeight: 50, paddingVertical:10,}}
              icon={image}
              label={item.sTitle}
              value_txt={item.sMessage}
              dateText={date}
              isRead={item.nStatus === 1}
              topTextStyle={{fontSize: 12, lineHeight: 14}}
              bottomTextStyle={{fontSize: 10}}
              imageContainerStyle={{width: 40, height: 40, marginLeft: 12}}
              dateTextStyle={{fontSize: 12}}
            />
          </TouchableOpacity>
        </View>
      );
    }
  };

  renderItemSystem = (item, index) => {
    return (
      <View style={styles.listItem} key={index}>
        <TouchableOpacity activeOpacity={0.5} onPress={() => {
          this.onClickMessageSystem(item)
        }}>
          <NotificationIconInfoItem
            style={{minHeight: 50, paddingVertical:10,}}
            icon={Images.n_ic_notification_system_white}
            label={item.SMSTitle}
            value_txt={item.SMSDesp}
            dateText={item.dSend}
            isRead={item.message_read === 1}
            topTextStyle={{fontSize: 12, lineHeight: 14}}
            bottomTextStyle={{fontSize: 10}}
            imageContainerStyle={{width: 40, height: 40, marginLeft: 12}}
            dateTextStyle={{fontSize: 12}}
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
    console.log(item);
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
        console.log("OPEN");
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

  renderMessageListView = (data, type) => {
    let res = [];
    data.map((item, index) => {
        if(type == 0) {
          res.push(this.renderItem(item, index.toString()));
        }else{
          res.push(this.renderItemSystem(item, index.toString()));
        }

      }
    )
    return res;
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
        <View style={styles.container}>
          <CustomSwitcher
            dataList={options}
            selectedIndex={this.state.switcherIndex ?? 0}
            onChangedSwitch={(index) => this.onChangeSwitcher(index)}
            containerStyle={{width: '90%', height: 40, marginTop: 10, marginBottom: 10}}
            radius={18}
            showUnreadCnt={true}
            textSize={18}
          />

          <View style={{borderTopWidth: 2, borderColor: Color.n_default_orange, marginHorizontal: 20}}>
            <NextButton
              label={translang.t('view_all')}
              containerStyle={{width: 100, marginLeft: 'auto', marginRight: 0, marginTop: 10}}
              buttonStyle={{borderRadius: 20, height: 32}}
              colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_start]}
              isVerticalGradient={false}
              textStyle={{fontSize: 18}}
              _onPress={() => {
                this.props.navigation.navigate('Notification')
              }}/>
          </View>


          {this.state.switcherIndex == 0 && this.state.filteredMessageList.length > 0 &&

          <View style={styles.menuContainer}>
            {this.renderMessageListView(this.state.filteredMessageList.slice(0, 6), 0)}
          </View>
          }

          {this.state.switcherIndex == 1 && this.state.filteredSystemMessageList.length > 0 &&
          <View style={styles.menuContainer}>
            {this.renderMessageListView(this.state.filteredSystemMessageList.slice(0, 6), 1)}
          </View>
          }
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
        </View>
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
