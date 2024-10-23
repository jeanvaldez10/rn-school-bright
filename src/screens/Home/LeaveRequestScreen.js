import React from 'react';
import { View, BackHandler, TouchableOpacity, FlatList, ColorPropType, Text } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import LeaveRequestIconInfoItem from '../../components/LeaveRequestIconInfoItem';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import moment from 'moment';
import Color from '../../constants/color';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { size } from 'lodash';
import NetInfo from "@react-native-community/netinfo";
import AlertWithImageModal from '../../components/AlertWithImageModal';
import Images from '../../themes/Images';

export default class LeaveRequestScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalBody: '',
      leaveRequestList: [],
      messageList: [],
      userInfo: {},
      currentPage: 0,
      isLoading: false,

      todayList: [],
      otherList: [],

      filterOption: 0,     // 0: all, 1: approved, 2: pending, 3: rejected
      isFetching: false,
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  unsubscribe = null;

  async componentDidMount() {
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

    // this.unsubscribe = NetInfo.addEventListener(state => {
    //   console.log("F");
    //   if(!state.isConnected){
    //     this.setState({showModal: true, modalBody: translang.t('ALERT_OFFLINE') });
    //   }
    // });

    const userInfo = await Storage.getUserInfo();
    this.setState({ userInfo: userInfo }, () => {
      this.loadData(true);
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

  loadData = (isRefresh) => {
    this.setState({ isLoading: true });
    const userInfo = this.state.userInfo;
    const page = isRefresh ? 0 : this.state.currentPage;

    ApiManager.getLeaveRequestList(userInfo.ID, page + 1).then(list => {
      if (isRefresh) {
        this.setState({ messageList: list, currentPage: page + 1, isLoading: false, isFetching: false, filterOption: 0 }, () => {
          this.doFilter();
        });
      } else {
        let messageList = this.state.messageList;
        messageList = messageList.concat(list);
        this.setState({ messageList: messageList, currentPage: page + 1, isLoading: false, isFetching: false }, () => {
          this.doFilter();
        });
      }
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false, isFetching: false });
    });
  };

  doFilter = () => {   //ALL, Approved, Pending, Reject
    const option = this.state.filterOption;
    const messages = this.state.messageList;
    let filteredMessageList = messages;

    if (option == 0) {     //ALL
      filteredMessageList = messages;
    } else if (option == 1) {    //Approved
      const approvedMessages = messages.filter(value => {
        return value.ApprovedStatus.StatusCode == '1';
      });
      filteredMessageList = approvedMessages;
    } else if (option == 2) {    //Pending
      const pendingMessages = messages.filter(value => {
        return value.ApprovedStatus.StatusCode == '0' || value.ApprovedStatus.StatusCode == '5';
      });
      filteredMessageList = pendingMessages;
    }  else if (option == 3){      //Rejected
      const rejectMessages = messages.filter(value => {
        return value.ApprovedStatus.StatusCode == '2';
      });
      filteredMessageList = rejectMessages;
    }



    const today = moment().format('DD MMM YYYY');
    if(filteredMessageList.length > 0){
      let tempTodayList = [];
      let tempOtherList = [];
      let resultList = [];
      filteredMessageList.forEach(item => {
        const date = moment(item.letterSubmitDate ?? '').format('DD MMM YYYY');
        if(date == today){
          tempTodayList.push(item);
        }else{
          tempOtherList.push(item);
        }
      });

      if(tempTodayList.length > 0){
        let tempItem = {status: '98', letterSubmitDate: '', senderName: '', letterType: ''}
        resultList.push(tempItem);
        resultList.push(...tempTodayList);

        let tempItem1 = {status: '99', letterSubmitDate: '', senderName: '', letterType: ''}
        resultList.push(tempItem1)
        resultList.push(...tempOtherList);
      }else{
        // tempItem.status = "99"; //Past
        // resultList.push(tempItem)
        resultList.push(...tempOtherList);
      }
      this.setState({ leaveRequestList: resultList, todayList: tempTodayList, otherList: tempOtherList});
    }else{
      this.setState({ leaveRequestList: filteredMessageList});
    }
  };

  onAllSelect = () => {
    this.setState({filterOption: 0}, ()=>{
      this.doFilter();
    })
  }
  onApprovedSelect = () => {
    this.setState({filterOption: 1}, ()=>{
      this.doFilter();
    })
  }
  onPendingSelect = () => {
    this.setState({filterOption: 2}, ()=>{
      this.doFilter();
    })
  }
  onRejectSelect = () => {
    this.setState({filterOption: 3}, ()=>{
      this.doFilter();
    })
  }

  back = () => {
    this.props.navigation.navigate('App');
  };

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
  };

  onClickLeaveRequest = (index) => {
    const leaveRequest = this.state.leaveRequestList[index];
    const letterId = leaveRequest.letterId;
    const type = "teacherleaverequest"
    this.props.navigation.navigate('LeaveRequestDetail', { letterId:letterId, userInfo: this.state.userInfo, from: 'LeaveRequest', type: type  });
  };

  renderItem = (index) => {
    const leaveRequest = this.state.leaveRequestList[index];
    const date = moment(leaveRequest.letterSubmitDate ?? '').format('DD MMM YYYY HH:mm:ss');
    const sender = getCurrentLocale() == 'th' ? leaveRequest.senderName ?? '' : leaveRequest.senderNameEN ?? leaveRequest.senderName ?? '';
    const letterType = getCurrentLocale() == 'th' ? leaveRequest.letterType ?? '' :  leaveRequest.letterTypeEN;
    let status = '-1';
    if(leaveRequest.ApprovedStatus){
      status = leaveRequest.ApprovedStatus.StatusCode
    }
    if(leaveRequest.status == "98"){
      return (<Text style={styles.timeintervalStyle}>{translang.t('TODAY')}</Text>);
    }else if(leaveRequest.status == "99"){
      return (<Text style={styles.timeintervalStyle}>{translang.t('USERINFO_weekly')}</Text>);
    }else{
      return (
        <TouchableOpacity
          style={styles.itemContainer}
          activeOpacity={0.7}
          onPress={() => { this.onClickLeaveRequest(index) }} >
          <LeaveRequestIconInfoItem
            label={sender}
            value_txt={letterType}
            dateText={date}
            status={status}
          />
        </TouchableOpacity>
      );
    }
  };

  onRefresh = ()=>{
    this.setState({isFetching: true}, ()=>{this.loadData(true)});
  }

  render() {
    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_leaverequest')}
          is_more="1"
          onMenuTap={() => this.back()}
          actions={[translang.t('NOTIFICATION_all'), translang.t('LEAVE_approve'), translang.t('LEAVE_pending'), translang.t('LEAVE_reject')]}
          onMoreTap={(value, index) => {
            if (index === 0)
              this.onAllSelect()
            else if (index === 1)
              this.onApprovedSelect()
            else if (index === 2)
              this.onPendingSelect()
            else if (index === 3)
              this.onRejectSelect()
          }}
        />

        <View style={styles.container}>
          <FlatList
            style={styles.menuContainer}
            data={this.state.leaveRequestList}
            onRefresh={() => this.onRefresh()}
            refreshing={this.state.isFetching}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => this.renderItem(index)}
            onEndReachedThreshold={0.01}
            onEndReached={ () => {
              if (this.state.leaveRequestList.length <= 10) {

              } else {
                this.loadData(false)
              }
            }}
          />
        </View>

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.n_ic_warning}
          message={this.state.modalBody}
          buttonColors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
          isVerticalGradient={false}
          onClose={() => { this.setState({ showModal: false }) }}
        />

        <ProgressHud isVisible={this.state.isLoading} />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  itemContainer: {
    minHeight: 100,
    borderRadius: 15,
    backgroundColor: Color.white,
    marginHorizontal: 10,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },

  personImage: {
    width: 150,
    height: 150,
    margin: 2,
  },
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
  },
  menuContainer: {
    marginTop: 5,
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
