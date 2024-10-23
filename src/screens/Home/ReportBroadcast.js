import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, FlatList, Text } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import { ScrollView } from 'react-native-gesture-handler';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import moment from 'moment';

export default class ReportBroadcastScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      reportList: [],
      userInfo: {},
      currentPage: 0,
      isLoading: false,

      todayList: [],
      weekList: [],
      historyList: [],
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    console.log("ReportBroadCast");
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", async () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const userInfo = await Storage.getUserInfo();
      this.setState({ userInfo: userInfo }, () => {
        this.loadData(true);
      });
    });
  }

  componentWillUnmount = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }
    if(this.focusListener){
      this.focusListener.remove();
    }
  };

  back = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }

    const parentRoute = this.props.navigation.getParam('parent') ?? 'Report';
    this.props.navigation.navigate(parentRoute);
  };
  loadData_TEMP = (isRefresh) => {
    const userInfo = this.state.userInfo;
    const page = isRefresh ? 0 : this.state.currentPage;
    const schoolID = userInfo.SchoolID;


    this.setState({isLoading: true});
    ApiManager.getBroadcastReportListAll(page + 1, schoolID).then(list => {
      let res = []
      if(isRefresh){
        res = list
      }else{
        res = this.state.reportList;
        res = res.concat(list);
      }
      this.doFilter(res, page);
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });

  }

  doFilter_TEMP = (data, page) => {
    let resultList = [];
    let todayList = [];
    let pastList = [];
    data = data.filter(item=>item.status != '98');
    data = data.filter(item=>item.status != '99');

    todayList = data.filter(item => moment(item.day_send).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD'));
    pastList = data.filter(item => moment(item.day_send).format('YYYY-MM-DD') != moment().format('YYYY-MM-DD'));

    if(todayList.length > 0){
      let tempItem = {status: '98', day_send: '', news_header: '', news_id: '', news_message: ''};
      resultList.push(tempItem);
      resultList.push(...todayList);

      let tempItem1 = {status: '99', day_send: '', news_header: '', news_id: '', news_message: ''};
      resultList.push(tempItem1)
      resultList.push(...pastList);
    }else{
      let tempItem = {status: '99', day_send: '', news_header: '', news_id: '', news_message: ''};
      resultList.push(tempItem)
      resultList.push(...pastList);
    }

    this.setState({ reportList: resultList, currentPage: page + 1, isLoading: false });
  }

  loadData = (isRefresh) => {
    this.setState({isLoading: true}, ()=>{
      this.loadDataToday(isRefresh)
    });
  }

  loadDataToday = (isRefresh) => {
    const userInfo = this.state.userInfo;

    const userid = userInfo.ID;
    const datetype = "today";
    const page = isRefresh ? 0 : this.state.currentPage;

    ApiManager.getBroadcastReportList(datetype, page+1, userid).then(list => {
      let todayList = this.state.todayList;
      if (isRefresh) {
        todayList = list
      } else {
        todayList = todayList.concat(list);
      }
      this.setState({todayList}, ()=>{
        this.loadDataWeek(isRefresh);
      });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };

  loadDataWeek = (isRefresh) => {
    const userInfo = this.state.userInfo;

    const userid = userInfo.ID;
    const datetype = "week";
    const page = isRefresh ? 0 : this.state.currentPage;

    ApiManager.getBroadcastReportList(datetype, page+1, userid).then(list => {
      let weekList = this.state.weekList;
      if (isRefresh) {
        weekList = list
      } else {
        weekList = weekList.concat(list);
      }
      this.setState({weekList}, ()=>{
        this.loadDataHistory(isRefresh);
      });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };

  loadDataHistory = (isRefresh) => {
    const userInfo = this.state.userInfo;

    const userid = userInfo.ID;
    const datetype = "history";
    const page = isRefresh ? 0 : this.state.currentPage;

    ApiManager.getBroadcastReportList(datetype, page+1, userid).then(list => {
      let historyList = this.state.historyList;
      if (isRefresh) {
        historyList = list
      } else {
        historyList = historyList.concat(list);
      }
      this.setState({historyList}, ()=>{
        this.doFilter(page);
      });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };

  doFilter = (page) => {
    let resultList = [];
    if(this.state.todayList.length > 0){
      let tempItem = {status: '97', day_send: '', news_header: '', news_id: '', news_message: ''};
      resultList.push(tempItem);
      resultList.push(...this.state.todayList);
    }

    if(this.state.weekList.length > 0){
      let tempItem1 = {status: '98', day_send: '', news_header: '', news_id: '', news_message: ''};
      resultList.push(tempItem1);
      resultList.push(...this.state.weekList);
    }

    if(this.state.weekList.length > 0){
      let tempItem2 = {status: '99', day_send: '', news_header: '', news_id: '', news_message: ''};
      resultList.push(tempItem2);
      resultList.push(...this.state.historyList);
    }

    this.setState({ reportList: resultList, currentPage: page + 1, isLoading: false });
  }


  onSelectItem = (index) => {
    const broadcast = this.state.reportList[index];
    const userInfo = this.state.userInfo;
    console.log("broadcast: ", broadcast);
    this.props.navigation.navigate('ReportBroadcastDetail', {broadcast: broadcast, userInfo: userInfo, from: 'ReportBroadcast'});
  };

  renderItem = (index) => {
    const broadcast = this.state.reportList[index];
    const date = moment(broadcast.day_send).format('HH:mm DD MMM YYYY');
    const status = broadcast.status ?? "";
    let profileImage = Images.man_user;
    if (broadcast.picture) {
      profileImage = {uri: broadcast.picture};
    }

    if(status == "97"){
      return (<Text style={styles.timeintervalStyle}>{translang.t('TODAY')}</Text>);
    }else if(status == "98"){
      return (<Text style={styles.timeintervalStyle}>{translang.t('WEEK')}</Text>);
    }else if(status == "99"){
      return (<Text style={styles.timeintervalStyle}>{translang.t('OLDER')}</Text>);
    }else{
      return (
        <TouchableOpacity style={styles.listItem} onPress={() => this.onSelectItem(index)}>
        <Text style={styles.dateText}>{date}</Text>
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center',}}>
          <Image source={profileImage} style={styles.itemAvatar}></Image>
          <View style={{flexDirection: 'column', flex: 1, justifyContent: 'center', marginLeft: 20,}}>
            <Text style={styles.topText}>{broadcast.news_header}</Text>
            <Text style={styles.bottomText} numberOfLines={1}>{broadcast.news_message}</Text>
          </View>
        </View>
      </TouchableOpacity>
      );
    }
  };

  render() {
    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('BROADCAST_REPORT')}
          onMenuTap={() => this.back()}
        />

        <View style={styles.container}>
          <FlatList
            style={styles.menuContainer}
            data={this.state.reportList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => this.renderItem(index)}
            onEndReachedThreshold={0.01}
            onEndReached={ () => {
              if (this.state.reportList.length === 0) {

              } else {
                this.loadData(false)
              }
            }}
          />
        </View>
        <ProgressHud isVisible={this.state.isLoading} />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
  },
  menuContainer: {
    marginTop: 10,
  },
  listItem: {
    flex: 1,
    minHeight: 110,
    alignItems: 'center',
    paddingVertical: 5,
    paddingLeft: 30,
    paddingRight: 15,

    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,

    marginVertical: 8,
    marginHorizontal: 20,
  },
  dateText: {
    width: '100%',
    textAlign: 'right',
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray,
    fontSize: 16,
    fontWeight: 'bold',
  },
  topText: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    color: Color.n_default_gray
  },
  bottomText: {
    fontFamily: 'THSarabunNew',
    fontSize: 18,
    fontWeight: 'bold',
    color: Color.n_default_gray
  },
  itemAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
