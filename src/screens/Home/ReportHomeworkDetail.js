import React, { useState } from 'react';
import { Image, View, BackHandler, TouchableOpacity, FlatList, ScrollView, Text,} from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressHud from '../../components/ProgressHud';
import BackNavigationBar from '../../components/BackNavigationBar';
import ApiManager from '../../managers/ApiManager';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import CustomSwitcher from '../../components/CustomSwitcher';
import moment from 'moment';
import CardInfoItem from '../../components/CardInfoItem';

export default class ReportHomeworkDetailScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      homework: {},
      homeworkDetail: {},
      recipients: [],
      userInfo: {},
      tabIndex: 0,
      status: '',
      currentPage: 0,
    };

  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", () => {  
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const userInfo = this.props.navigation.getParam('userInfo');
      const homework = this.props.navigation.getParam('homework');
  
      this.setState({ tabIndex: 0, homework: homework, userInfo: userInfo }, () => {
        this.loadData();
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

  loadData = () => {
    this.setState({ isLoading: true });
    const userInfo = this.state.userInfo;
    const homework = this.state.homework;

    ApiManager.getHomeworkReportDetail(userInfo.SchoolID, homework.homework_id).then(detail => {
      this.setState({ homeworkDetail: detail[0], isLoading: false}, ()=>{
        this.loadDataForReceipt();
      })
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  }

  loadDataForReceipt = (isRefresh) => {
    this.setState({ isLoading: true });

    const userInfo = this.state.userInfo;
    const homework = this.state.homework;
    const page = isRefresh ? 0 : this.state.currentPage;

    ApiManager.getHomeworkReportRecieverList(userInfo.SchoolID, homework.homework_id, page + 1, this.state.status).then(list => {
      if (isRefresh) {
        this.setState({ recipients: list, currentPage: page + 1, isLoading: false });
      } else {
        let userList = this.state.recipients;
        userList = userList.concat(list);
        this.setState({ recipients: userList, currentPage: page + 1, isLoading: false });
      }
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };

  back = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }

    const parentRoute = this.props.navigation.getParam('parent') ?? 'ReportHomework';
    this.props.navigation.navigate(parentRoute);
  };

  onChangeSwitcher = (index) => {
    this.setState({tabIndex: index, isEdit: false})
  }

  renderItem = (index) => {
    const user = this.state.recipients[index];

    let profileImage = user.sex === '0' ? Images.man_user : Images.women_user;
    if (user.picture) {
      profileImage = {uri: user.picture};
    }

    let name = (user.student_name ?? '').trim();
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
    const homework = this.state.homeworkDetail;
    const day = moment(homework.daynoti).format('MMM DD, YYYY');
    const time = moment(homework.daynoti).format('HH:mm');

    const options = [
      { title: translang.t('DETAIL')},
      { title: translang.t('RECIPIENT')}
    ];
    return (
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('ONLINE_CLASSROOM_REPORT')}
          onMenuTap={() => this.back()}
        />

        <View style={styles.container}>
          <CustomSwitcher
            dataList={options}
            selectedIndex={this.state.tabIndex ?? 0}
            onChangedSwitch={(index)=>this.onChangeSwitcher(index)}
            containerStyle = {{marginHorizontal: 15, height: 50, marginTop: 20, marginBottom: 20}}
            radius = {15}
            textSize = {20}
          />
          {this.state.tabIndex == 0 && <View style={styles.content}>
            <ScrollView style={{padding: 20}}>
              <CardInfoItem
                title = {translang.t('SUBJECT')}
                value_txt = {homework.plane_name}
                titleColor = {Color.n_default_orange}
                infoColor = {Color.n_default_gray}
                style={{marginVertical: 5}}
                titleFontSize={24}
                infoFontSize={24}
              />

              <CardInfoItem
                title = {translang.t('SENDER')}
                value_txt = {homework.theacher_name}
                titleColor = {Color.n_default_orange}
                infoColor = {Color.n_default_gray}
                style={{marginVertical: 5}}
                titleFontSize={24}
                infoFontSize={24}
              />

              <CardInfoItem
                title = {translang.t('NUMBER_OF_RECIPIENT')}
                value_txt = {(homework.user_all) + ' ' + translang.t('PEOPLE')}
                titleColor = {Color.n_default_orange}
                infoColor = {Color.n_default_gray}
                style={{marginVertical: 5}}
                titleFontSize={24}
                infoFontSize={24}
              />

              <CardInfoItem
                title = {translang.t('READ')}
                value_txt = {(homework.user_read) + ' ' + translang.t('PEOPLE')}
                titleColor = {Color.n_default_orange}
                infoColor = {Color.n_default_gray}
                style={{marginVertical: 5}}
                titleFontSize={24}
                infoFontSize={24}
              />

              <CardInfoItem
                title = {translang.t('UNREAD')}
                value_txt = {(homework.user_unread) + ' ' + translang.t('PEOPLE')}
                titleColor = {Color.n_default_orange}
                infoColor = {Color.n_default_gray}
                style={{marginVertical: 5}}
                titleFontSize={24}
                infoFontSize={24}
              />

              <View style={{marginVertical: 5}}>
                <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('DATE_SEND')}</Text>
                <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_gray, fontSize: 24, width: '100%'}}>{day + " " + time}</Text>
              </View>

              <View style={{marginVertical: 5}}>
                <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('DETAIL')}</Text>
                <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_gray, fontSize: 24, width: '100%'}}>{homework.message}</Text>
              </View>

              <View style={{marginVertical: 5}}>
                <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('HOMEWORK_attachimg')}</Text>
                <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_gray, fontSize: 24, width: '100%'}}>-</Text>
              </View>

              <View style={{marginVertical: 5}}>
                <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('HOMEWORK_attachfile')}</Text>
                <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_gray, fontSize: 24, width: '100%'}}>-</Text>
              </View>

              <View style={{marginVertical: 5}}>
                <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('ATTACH_LINK')}</Text>
                <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_gray, fontSize: 24, width: '100%'}}>-</Text>
              </View>
            </ScrollView>
          </View>}
          {this.state.tabIndex == 1 && <View>
            <FlatList 
            style={styles.menuContainer}
            data={this.state.recipients}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => this.renderItem(index)}
            onEndReachedThreshold={0.01}
            onEndReached={ () => {
              if (this.state.recipients.length === 0) {

              } else {
                this.loadDataForReceipt(false)
              }
            }}
          />
          </View>}

          
        </View>
        <ProgressHud isVisible={this.state.isLoading} />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white
  },
  content: {
    flex: 1,
    margin: 15,
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
    overflow: 'visible',
  },
  menuContainer: {
    height: '100%',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  menuEachStyle: {
    borderRadius: 5,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  menuTitle: {
    fontSize: 28, 
    fontWeight: 'normal'
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