import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, FlatList, Text } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import { ScrollView } from 'react-native-gesture-handler';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import MessageIconInfoItem from '../../components/MessageIconInfoItem';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import moment from 'moment';
import SwitchSelector from 'react-native-switch-selector';
import CustomSwitcher from '../../components/CustomSwitcher';
import NetInfo from "@react-native-community/netinfo";
import AlertWithImageModal from '../../components/AlertWithImageModal';

export default class MessageScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalBody: '',

      messageList: [],
      userInfo: {},
      tabIndex: 0,

      currentPageGeneral: 0,
      currentPageAccepted: 0,
      currentPageSystem: 0,

      isLoading: false,
      isLoadingAccept: false,
      isLoadingSystem: false,
      filterIndex: 0,   //0: All, 1: Read, 2: Unread

      todayGeneralList: [],
      weekGeneralList: [],
      historyGeneralList: [],
      GeneralList: [],

      todayAcceptedList: [],
      weekAcceptedList: [],
      historyAcceptedList: [],
      AcceptedList: [],

      todaySystemList: [],
      weekSystemList: [],
      historySystemList: [],
      SystemList: [],

      totalGeneralUnreadCnt: 0,
      totalAcceptUnreadCnt: 0,
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

    console.log("MessageScreen");

    const userInfo = await Storage.getUserInfo();
    this.setState({ userInfo: userInfo, tabIndex: 0 }, () => {
      this.loadDataGeneral(true);
      this.loadDataAccepted(true);
      this.loadDataSystem(true);

      this.loadUnreadGeneralMessageCount();
      this.loadUnreadAcceptMessageCount();
      this.loadUnreadSystemMessageCount();
    });
  }

  componentWillUnmount = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }
    if(this.focusListener){
      this.focusListener.remove();
    }
    // this.unsubscribe();
  };

  loadUnreadGeneralMessageCount = () => {
    ApiManager.getCountUnreadGeneralMessage(this.state.userInfo.ID)
      .then(count => {
        this.setState({ totalGeneralUnreadCnt: count });
      }).catch(error => {
        console.log("loadUnreadGeneralMessageCount", error);
      });
  }

  loadUnreadAcceptMessageCount = () => {
    ApiManager.getCountUnreadAcceptMessage(this.state.userInfo.ID)
      .then(count => {
        this.setState({ totalAcceptUnreadCnt: count });
      }).catch(error => {
        console.log("loadUnreadAcceptMessageCount", error);
      });
  }

  loadUnreadSystemMessageCount = () => {
    ApiManager.getCountUnreadSystemMessage(this.state.userInfo.ID)
      .then(count => {
        this.setState({ totalSystemUnreadCnt: count });
      }).catch(error => {
        console.log("loadUnreadSystemMessageCount", error);
      });
  }


  loadDataGeneral = (isRefresh) => {
    this.setState({ isLoading: true}, ()=>{
      this.loadDataGeneralToday(isRefresh);
    });
  };
  loadDataGeneralToday = (isRefresh) => {
    const userInfo = this.state.userInfo;
    const page = isRefresh ? 0 : this.state.currentPageGeneral;

    ApiManager.getMessageListTodayGeneral(userInfo.ID, page + 1).then(list => {

      let messageList = this.state.todayGeneralList;
      if(!isRefresh){
        messageList = messageList.concat(list);
      }else{
        messageList = list;
      }
      this.setState({todayGeneralList: messageList}, ()=>{
        this.loadDataGeneralWeek(isRefresh);
      });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };
  loadDataGeneralWeek = (isRefresh) => {
    const userInfo = this.state.userInfo;
    const page = isRefresh ? 0 : this.state.currentPageGeneral;

    ApiManager.getMessageListWeekGeneral(userInfo.ID, page + 1).then(list => {
      let messageList = this.state.weekGeneralList;
      if(!isRefresh){
        messageList = messageList.concat(list);
      }else{
        messageList = list;
      }

      this.setState({weekGeneralList: messageList}, ()=>{
        this.loadDataGeneralHistory(isRefresh);
      });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };
  loadDataGeneralHistory = (isRefresh) => {
    const userInfo = this.state.userInfo;
    const page = isRefresh ? 0 : this.state.currentPageGeneral;

    ApiManager.getMessageListHistoryGeneral(userInfo.ID, page + 1).then(list => {
      let messageList = this.state.historyGeneralList;
      if(!isRefresh){
        messageList = messageList.concat(list);
      }else{
        messageList = list;
      }

      this.setState({historyGeneralList: messageList, currentPageGeneral: page + 1, isLoading: false}, ()=>{
        this.makeFilter(0);
      });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };
  loadDataAccepted = (isRefresh) => {
    this.setState({ isLoadingAccept: true}, ()=>{
      this.loadDataAcceptedToday(isRefresh);
    });
  };
  loadDataAcceptedToday = (isRefresh) => {
    const userInfo = this.state.userInfo;
    const page = isRefresh ? 0 : this.state.currentPageAccepted;

    ApiManager.getMessageListTodayAccepted(userInfo.ID, page + 1).then(list => {
      let messageList = this.state.todayAcceptedList;
      if(!isRefresh){
        messageList = messageList.concat(list);
      }else{
        messageList = list;
      }
      this.setState({todayAcceptedList: messageList}, ()=>{
        this.loadDataAcceptedWeek(isRefresh);
      });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoadingAccept: false });
    });
  };
  loadDataAcceptedWeek = (isRefresh) => {
    const userInfo = this.state.userInfo;
    const page = isRefresh ? 0 : this.state.currentPageAccepted;

    ApiManager.getMessageListWeekAccepted(userInfo.ID, page + 1).then(list => {
      let messageList = this.state.weekAcceptedList;
      if(!isRefresh){
        messageList = messageList.concat(list);
      }else{
        messageList = list;
      }

      this.setState({weekAcceptedList: messageList}, ()=>{
        this.loadDataAcceptedHistory(isRefresh);
      });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoadingAccept: false });
    });
  };
  loadDataAcceptedHistory = (isRefresh) => {
    const userInfo = this.state.userInfo;
    const page = isRefresh ? 0 : this.state.currentPageAccepted;

    ApiManager.getMessageListHistoryAccepted(userInfo.ID, page + 1).then(list => {
      let messageList = this.state.historyAcceptedList;
      if(!isRefresh){
        messageList = messageList.concat(list);
      }else{
        messageList = list;
      }

      this.setState({historyAcceptedList: messageList, currentPageAccepted: page + 1, isLoadingAccept: false}, ()=>{
        this.makeFilter(1);
      });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoadingAccept: false });
    });
  };
  loadDataSystem = (isRefresh) => {
    this.setState({ isLoadingSystem: true}, ()=>{
      this.loadDataSystemToday(isRefresh);
    });
  };
  loadDataSystemToday = (isRefresh) => {
    const userInfo = this.state.userInfo;
    const page = isRefresh ? 0 : this.state.currentPageSystem;

    ApiManager.getMessageListTodaySystem(userInfo.ID, page + 1).then(list => {
      let messageList = this.state.todaySystemList;
      if(!isRefresh){
        messageList = messageList.concat(list);
      }else{
        messageList = list;
      }
      this.setState({todaySystemList: messageList}, ()=>{
        this.loadDataSystemWeek(isRefresh);
      });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoadingSystem: false });
    });
  };
  loadDataSystemWeek = (isRefresh) => {
    const userInfo = this.state.userInfo;
    const page = isRefresh ? 0 : this.state.currentPageSystem;

    ApiManager.getMessageListWeekSystem(userInfo.ID, page + 1).then(list => {
      let messageList = this.state.weekSystemList;
      if(!isRefresh){
        messageList = messageList.concat(list);
      }else{
        messageList = list;
      }

      this.setState({weekSystemList: messageList}, ()=>{
        this.loadDataSystemHistory(isRefresh);
      });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoadingSystem: false });
    });
  };
  loadDataSystemHistory = (isRefresh) => {
    const userInfo = this.state.userInfo;
    const page = isRefresh ? 0 : this.state.currentPageSystem;

    ApiManager.getMessageListHistorySystem(userInfo.ID, page + 1).then(list => {
      let messageList = this.state.historySystemList;
      if(!isRefresh){
        messageList = messageList.concat(list);
      }else{
        messageList = list;
      }

      this.setState({historySystemList: messageList, currentPageSystem: page + 1, isLoadingSystem: false}, ()=>{
        this.makeFilter(2);
      });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoadingSystem: false });
    });
  };
  makeFilter = (type) => {
    let result = [];
    // 97: Today, 98: Week, 99: History
    if(type == 0){
      let todayGeneral = [];
      let weekGeneral = [];
      let historyGeneral = [];

      if(this.state.filterIndex == 0){
        todayGeneral = this.state.todayGeneralList;
        weekGeneral = this.state.weekGeneralList;
        historyGeneral = this.state.historyGeneralList;
      }else if(this.state.filterIndex == 1){
        todayGeneral = this.state.todayGeneralList.filter(item => item.message_read == 1)
        weekGeneral = this.state.weekGeneralList.filter(item => item.message_read == 1);
        historyGeneral = this.state.historyGeneralList.filter(item => item.message_read == 1);
      }else if(this.state.filterIndex == 2){
        todayGeneral = this.state.todayGeneralList.filter(item => item.message_read == 0)
        weekGeneral = this.state.weekGeneralList.filter(item => item.message_read == 0);
        historyGeneral = this.state.historyGeneralList.filter(item => item.message_read == 0);
      }

      if(todayGeneral.length > 0){
        let tempItem = {status: '97', nMessageID: '', dSend: '', SMSTitle: '', message_read: 1, SMSDesp: ''};
        result.push(tempItem);
        result.push(...todayGeneral);
      }
      if(weekGeneral.length > 0){
        let tempItem = {status: '98', nMessageID: '', dSend: '', SMSTitle: '', message_read: 1, SMSDesp: ''};
        result.push(tempItem);
        result.push(...weekGeneral);
      }
      if(historyGeneral.length > 0){
        let tempItem = {status: '99', nMessageID: '', dSend: '', SMSTitle: '', message_read: 1, SMSDesp: ''};
        result.push(tempItem);
        result.push(...historyGeneral);
      }

      this.setState({GeneralList: result});

    }else if(type == 1){
      let todayList = [];
      let weekList = [];
      let historyList = [];

      if(this.state.filterIndex == 0){
        todayList = this.state.todayAcceptedList;
        weekList = this.state.weekAcceptedList;
        historyList = this.state.historyAcceptedList;
      }else if(this.state.filterIndex == 1){
        todayList = this.state.todayAcceptedList.filter(item => item.message_read == 1)
        weekList = this.state.weekAcceptedList.filter(item => item.message_read == 1);
        historyList = this.state.historyAcceptedList.filter(item => item.message_read == 1);
      }else if(this.state.filterIndex == 2){
        todayList = this.state.todayAcceptedList.filter(item => item.message_read == 0)
        weekList = this.state.weekAcceptedList.filter(item => item.message_read == 0);
        historyList = this.state.historyAcceptedList.filter(item => item.message_read == 0);
      }

      if(todayList.length > 0){
        let tempItem = {status: '97', nMessageID: '', dSend: '', SMSTitle: '', message_read: 1, SMSDesp: ''};
        result.push(tempItem);
        result.push(...todayList);
      }
      if(weekList.length > 0){
        let tempItem = {status: '98', nMessageID: '', dSend: '', SMSTitle: '', message_read: 1, SMSDesp: ''};
        result.push(tempItem);
        result.push(...weekList);
      }
      if(historyList.length > 0){
        let tempItem = {status: '99', nMessageID: '', dSend: '', SMSTitle: '', message_read: 1, SMSDesp: ''};
        result.push(tempItem);
        result.push(...historyList);
      }
      this.setState({AcceptedList: result});
    }else if(type == 2){
      let todayList = [];
      let weekList = [];
      let historyList = [];

      if(this.state.filterIndex == 0){
        todayList = this.state.todaySystemList;
        weekList = this.state.weekSystemList;
        historyList = this.state.historySystemList;
      }else if(this.state.filterIndex == 1){
        todayList = this.state.todaySystemList.filter(item => item.message_read == 1)
        weekList = this.state.weekSystemList.filter(item => item.message_read == 1);
        historyList = this.state.historySystemList.filter(item => item.message_read == 1);
      }else if(this.state.filterIndex == 2){
        todayList = this.state.todaySystemList.filter(item => item.message_read == 0)
        weekList = this.state.weekSystemList.filter(item => item.message_read == 0);
        historyList = this.state.historySystemList.filter(item => item.message_read == 0);
      }

      if(todayList.length > 0){
        let tempItem = {status: '97', nMessageID: '', dSend: '', SMSTitle: '', message_read: 1, SMSDesp: ''};
        result.push(tempItem);
        result.push(...todayList);
      }
      if(weekList.length > 0){
        let tempItem = {status: '98', nMessageID: '', dSend: '', SMSTitle: '', message_read: 1, SMSDesp: ''};
        result.push(tempItem);
        result.push(...weekList);
      }
      if(historyList.length > 0){
        let tempItem = {status: '99', nMessageID: '', dSend: '', SMSTitle: '', message_read: 1, SMSDesp: ''};
        result.push(tempItem);
        result.push(...historyList);
      }
      this.setState({SystemList: result});
    }
  }

  back = () => {
    this.props.navigation.navigate('App');
  };
  onAllSelect = () => {
    this.setState({filterIndex: 0}, ()=>{
      this.makeFilter(this.state.tabIndex);
    });
  }
  onReadSelect = () => {
    this.setState({filterIndex: 1}, ()=>{
      this.makeFilter(this.state.tabIndex);
    });
  }
  onUnreadSelect = () => {
    this.setState({filterIndex: 2}, ()=>{
      this.makeFilter(this.state.tabIndex);
    });
  }
  onReadAllSelect = () => {
    ApiManager.readAllMessage(this.state.userInfo.ID).then(
        (data) => {
          this.loadDataGeneral(true);
          this.loadDataAccepted(true);
          this.loadDataSystem(true);

          this.loadUnreadAcceptMessageCount();
          this.loadUnreadGeneralMessageCount();
          this.loadUnreadSystemMessageCount();
        }
    );


  }

  onChangeSwitcher = (index) => {
    if(this.state.tabIndex == index){
      return;
    }

    this.setState({tabIndex: index}, ()=>{
      // if(this.state.tabIndex == 0){
      //   this.loadDataGeneral(true);
      // }else if(this.state.tabIndex == 1){
      //   this.loadDataAccepted(true);
      // }else if(this.state.tabIndex == 2){
      //   this.loadDataSystem(true);
      // }
    });

  }

  onClickMessage = (item) => {
    const userInfo = this.state.userInfo;
    const lang = getCurrentLocale();


    if(this.state.tabIndex == 2){
      this.setState({isLoadingSystem: true});
      ApiManager.readSystemMessage(userInfo.ID, item.nMessageID).then(detail => {
        detail.NewsCreatedBy = translang.t('SCHOOL_BRIGHT_SYSTEM');
        const temp = this.state.SystemList;
        const ind = this.state.SystemList.findIndex((it)=>it==item)
        temp[ind].message_read = 1;
        this.loadUnreadSystemMessageCount();
        this.setState({isLoadingSystem: false, SystemList: temp});
        this.props.navigation.navigate('MessageHistory', {userInfo: this.state.userInfo, detail: detail, type: this.state.tabIndex });
      }).catch(error => {
        console.log(error);
        this.setState({ isLoadingSystem: false });
      });
    }else{
      if(this.state.tabIndex == 0){
        this.setState({isLoading: true});
      }else if(this.state.tabIndex == 1){
        this.setState({isLoadingAccept: true});
      }
      ApiManager.readNewsMessage(userInfo.ID, item.nMessageID, '', lang).then(detail => {
        if(this.state.tabIndex == 0){
          const temp = this.state.GeneralList;
          const ind = this.state.GeneralList.findIndex((it)=>it==item)
          temp[ind].message_read = 1;
          this.loadUnreadGeneralMessageCount();
          this.setState({isLoading: false, GeneralList: temp});
        }else if(this.state.tabIndex == 1){
          const tempacc = this.state.AcceptedList;
          const indacc = this.state.AcceptedList.findIndex((it)=>it==item)
          tempacc[indacc].message_read = 1;
          this.loadUnreadAcceptMessageCount();
          this.setState({isLoadingAccept: false, AcceptedList: tempacc});
        }
        this.props.navigation.navigate('MessageHistory', {userInfo: this.state.userInfo, detail: detail, type: this.state.tabIndex});
      }).catch(error => {
        console.log(error);
        this.setState({ isLoading: false });
      });
    }
  };
  renderItem = (item) => {
    const date = moment(item.dSend).format('MMMM DD, YYYY HH:mm');
    let logo = Images.n_ic_message_message;
    const status = item.status ?? ""

    //1: Homework 2: Shop, 3: Topup 5: News, 8: Leave
    if (item.nType === 8) {
      logo = Images.n_ic_notification_default
    } else if (item.nType === 5) {
      if(item.message_read === 1){
        logo = Images.n_ic_notification_system_orange;
      }else{
        logo = Images.n_ic_notification_system_white;
      }
    } else if (item.nType === 1) {
      logo = Images.n_ic_notification_homework
    } else if (item.nType === 2) {
      if(item.message_read === 1){
        logo = Images.n_ic_notification_shop_read;
      }else{
        logo = Images.n_ic_notification_shop_white;
      }
    } else if (item.nType === 3) {
      if(item.message_read === 1){
        logo = Images.n_ic_notification_shop_read;
      }else{
        logo = Images.n_ic_notification_shop_white;
      }
    }else{
      if(item.message_read === 1){
        logo = Images.n_ic_message_message;
      }else{
        logo = Images.n_ic_message_message;
      }
    }

    if(status == '97'){
      return (<Text style={styles.timeintervalStyle}>{translang.t('TODAY')}</Text>);
    }else if(status == '98'){
      return (<Text style={styles.timeintervalStyle}>{translang.t('WEEK')}</Text>);
    }else if(status == '99'){
      return (<Text style={styles.timeintervalStyle}>{translang.t('OLDER')}</Text>);
    }else{
      return (
        <View style={styles.listItem}>
          <TouchableOpacity activeOpacity={0.5} onPress={() => { this.onClickMessage(item) }} >
            <MessageIconInfoItem
              icon={logo}
              label={item.SMSTitle}
              value_txt={item.SMSDesp}
              dateText={date}
              isRead={item.message_read == 0}
            />
          </TouchableOpacity>
        </View>
      );
    }
  };

  render() {
    const moreActions = [
      translang.t('NOTIFICATION_all'),
      translang.t('NOTIFICATION_read'),
      translang.t('NOTIFICATION_unread'),
      translang.t('NOTIFICATION_readall')
    ];


    const options = [
      { title: translang.t('MESSAGE_General'), unreadCnt: this.state.totalGeneralUnreadCnt},
      { title: translang.t('MESSAGE_Response'), unreadCnt: this.state.totalAcceptUnreadCnt},
      { title: translang.t('MESSAGE_System'), unreadCnt: this.state.totalSystemUnreadCnt},
    ];

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_message')}
          onMenuTap={() => this.back()}
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
        />

        <View style={styles.container}>
          <CustomSwitcher
            dataList={options}
            selectedIndex={this.state.tabIndex ?? 0}
            onChangedSwitch={(index)=>this.onChangeSwitcher(index)}
            containerStyle = {{width: '90%', height: 50, marginTop: 40, marginBottom: 20}}
            radius = {18}
            showUnreadCnt = {true}
          />


          {this.state.tabIndex == 0 &&
          <FlatList
            style={styles.menuContainer}
            data={this.state.GeneralList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => this.renderItem(item)}
            onEndReachedThreshold={0.01}
            onEndReached={ () => {
              if(this.state.GeneralList.length > 0){
                this.loadDataGeneral(false)
              }
            }}
          />}

          {this.state.tabIndex == 1 &&
          <FlatList
            style={styles.menuContainer}
            data={this.state.AcceptedList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => this.renderItem(item)}
            onEndReachedThreshold={0.01}
            onEndReached={ () => {
              if(this.state.GeneralList.length > 0){
                this.loadDataAccepted(false)
              }
            }}
          />}

          {this.state.tabIndex == 2 &&
          <FlatList
            style={styles.menuContainer}
            data={this.state.SystemList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => this.renderItem(item)}
            onEndReachedThreshold={0.01}
            onEndReached={ () => {
              if(this.state.GeneralList.length > 0){
                this.loadDataSystem(false)
              }
            }}
          />}
        </View>

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.n_ic_warning}
          message={this.state.modalBody}
          buttonColors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
          isVerticalGradient={false}
          onClose={() => { this.setState({ showModal: false }) }}
        />

        <ProgressHud isVisible={this.state.isLoading || this.state.isLoadingSystem || this.state.isLoadingAccept} />
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

  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
  },

  switchContainer: {
    marginHorizontal: 30,
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
    borderRadius: 25,
  },
  menuContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },

  menuItem: {
    flexDirection: 'row',
    marginVertical: 6,
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
