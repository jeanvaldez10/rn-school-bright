import React from 'react';
import {
  View,
  BackHandler,
  ScrollView,
  Text,
} from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import IconInfoItemSmall from '../../components/IconInfoItemSmall';
import ApiManager from '../../managers/ApiManager';
import Storage from '../../managers/StorageManager';
import moment from 'moment';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import CardInfoItem from '../../components/CardInfoItem';

export default class ReportBroadcastDetailTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      news: {},
      newsDetail: {},
      userInfo: {},
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    console.log("ReportBroadcastDetailTab");
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

    const userInfo = await Storage.getUserInfo();
    news = this.props.broadcast;

    this.setState({userInfo: userInfo, news: news}, () => {
      this.loadData();
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
    this.props.navigation.goBack();
  };

  loadData = () => {
    this.setState({ isLoading: true });

    const userInfo = this.state.userInfo;
    const news = this.state.news;
  
    ApiManager.getBroadcastReportDetail(userInfo.SchoolID, news.news_id).then(detail => {
      this.setState({ newsDetail: detail, isLoading: false})
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  }

  render() {
    const news = this.state.newsDetail;
    const day = moment(news.daysend).format('MMM DD, YYYY');
    const time = moment(news.daysend).format('HH:mm');
    const type = news.send_type === '0' ? translang.t('SEND_NOW') : translang.t('SET_TIME');


    return (
      <View style={styles.content}>
        <ScrollView style={{padding: 20}}>
          <CardInfoItem
            title = {translang.t('SEND_TYPE')}
            value_txt = {type}
            titleColor = {Color.n_default_orange}
            infoColor = {Color.n_default_gray}
            style={{marginVertical: 5}}
            titleFontSize={24}
            infoFontSize={24}
          />

          <CardInfoItem
            title = {translang.t('NUMBER_OF_RECIPIENT')}
            value_txt = {(news.user_all) + ' ' + translang.t('PEOPLE')}
            titleColor = {Color.n_default_orange}
            infoColor = {Color.n_default_gray}
            style={{marginVertical: 5}}
            titleFontSize={24}
            infoFontSize={24}
          />

          <CardInfoItem
            title = {translang.t('READ')}
            value_txt = {(news.user_read) + ' ' + translang.t('PEOPLE')}
            titleColor = {Color.n_default_orange}
            infoColor = {Color.n_default_gray}
            style={{marginVertical: 5}}
            titleFontSize={24}
            infoFontSize={24}
          />
          
          <CardInfoItem
            title = {translang.t('UNREAD')}
            value_txt = {(news.user_unread) + ' ' + translang.t('PEOPLE')}
            titleColor = {Color.n_default_orange}
            infoColor = {Color.n_default_gray}
            style={{marginVertical: 5}}
            titleFontSize={24}
            infoFontSize={24}
          />
          
          <View style={{marginVertical: 5}}>
            <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('DATE_SEND')}</Text>
            <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_gray, fontSize: 24, width: '100%'}}>{day}</Text>
          </View>

          <View style={{marginVertical: 5}}>
            <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('DETAIL')}</Text>
            <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_gray, fontSize: 24, width: '100%'}}>{news.message}</Text>
          </View>

          <View style={{marginVertical: 5}}>
            <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('HOMEWORK_attachimg')}</Text>
            <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_gray, fontSize: 24, width: '100%'}}>-</Text>
          </View>

          <View style={{marginVertical: 5}}>
            <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('HOMEWORK_attachfile')}</Text>
            <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_gray, fontSize: 24, width: '100%'}}>-</Text>
          </View>
        </ScrollView>
      </View>
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
  }
});
