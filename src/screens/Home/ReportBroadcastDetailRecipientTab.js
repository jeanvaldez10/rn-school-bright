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

export default class ReportBroadcastDetailRecipientTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      userInfo: {},
      news: {},
      userList: {},
      currentPage: 0,
      isLoading: false,
      status: '',
    };

  }

  handleBackButton = () => {
    return true;
  };

  async componentDidMount() {
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

    const userInfo = await Storage.getUserInfo();
    const news = this.props.broadcast;

    this.setState({ userInfo: userInfo, news: news }, () => {
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
  };

  loadData = (isRefresh) => {
    this.setState({ isLoading: true });

    const userInfo = this.state.userInfo;
    const news = this.state.news;
    const page = isRefresh ? 0 : this.state.currentPage;

    ApiManager.getBroadcastReportRecieverList(userInfo.SchoolID, news.news_id, page + 1, this.state.status).then(list => {
      if (isRefresh) {
        this.setState({ userList: list, currentPage: page + 1, isLoading: false });
      } else {
        let userList = this.state.userList;
        userList = userList.concat(list);
        this.setState({ userList: userList, currentPage: page + 1, isLoading: false });
      }
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };

  renderItem = (index) => {
    const user = this.state.userList[index];

    let profileImage = user.sex === '0' ? Images.man_user : Images.women_user;
    if (user.picture) {
      profileImage = {uri: user.picture};
    }

    let name = (user.user_name ?? '').trim();
    const nameArray = name.split(' ');
    let firstName = '';
    let lastName = '';
    if (nameArray.length > 0) {
      firstName = nameArray[0];
    }
    if (nameArray.length > 1) {
      lastName = nameArray[nameArray.length - 1];
    }

    let status = user.read_status ? translang.t('READ') : translang.t('UNREAD');
    let statusColor = user.read_status ? Color.n_button_gradient_green_start : Color.n_default_orange;

    return (
      <TouchableOpacity style={styles.listItem}>
        <Image source={profileImage} style={styles.itemAvatar}></Image>
        <View style={{flexDirection: 'column', flex: 1, height: '100%', marginHorizontal: 10, justifyContent: 'center',}}>
          <Text style={styles.itemText}>{firstName}</Text>
          <Text style={styles.itemText}>{lastName}</Text>
        </View>
        <Text style={{...styles.itemText, color: statusColor, fontWeight: 'bold'}}>{status}</Text>
      </TouchableOpacity>
    );
  };

  render() {
    return (
      <View style={styles.container} edges={['right', 'bottom', 'top', 'left']}>
        <View style={styles.container}>
          <FlatList 
            style={styles.menuContainer}
            data={this.state.userList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => this.renderItem(index)}
            onEndReachedThreshold={0.01}
            onEndReached={ () => {
              if (this.state.userList.length === 0) {

              } else {
                this.loadData(false)
              }
            }}
          />
        </View>
        <ProgressHud isVisible={this.state.isLoading} />
      </View>
    );
  }
}

const styles = ScaledSheet.create({

  container: {
    flex: 1,
    backgroundColor: Color.n_background_white
  },
  menuContainer: {
    marginTop: 10,
  },
  listItem: {
    height: 100,
    flexDirection: 'row', 
    alignItems: 'center', 
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
    
    paddingLeft: 10,
    paddingRight: 30,
  },
  itemText: {
    fontSize: 24,
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray,
  },
  itemAvatar: {
    width: 60, 
    height: 60, 
    borderRadius: 30,
  },
});