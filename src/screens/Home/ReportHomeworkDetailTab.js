import React from 'react';
import {
  Image,
  View,
  TouchableOpacity,
  BackHandler,
  ScrollView,
} from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import IconInfoItemSmall from '../../components/IconInfoItemSmall';
import AttachInfoItem from '../../components/AttachInfoItem';
import NextButton from '../../components/NextButton';
import ApiManager from '../../managers/ApiManager';
import Storage from '../../managers/StorageManager';
import ProgressHud from '../../components/ProgressHud';
import moment from 'moment';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import CardInfoItem from '../../components/CardInfoItem';

export default class ReportHomeworkDetailTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      homework: {},
      homeworkDetail: {},
      userInfo: {},
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

      homework = this.props.homework;
      userinfo = this.props.userInfo;

      this.setState({homework: homework, userInfo: userinfo}, () => {
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

  back = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }

    this.props.navigation.goBack();
  };

  loadData = () => {
    this.setState({ isLoading: true });

    const userInfo = this.state.userInfo;
    const homework = this.state.homework;
    

    ApiManager.getHomeworkReportDetail(userInfo.SchoolID, homework.homework_id).then(detail => {
      this.setState({ homeworkDetail: detail[0], isLoading: false})
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  }

  render() {
    const homework = this.state.homeworkDetail;
    const day = moment(homework.daynoti).format('MMM DD, YYYY');
    const time = moment(homework.daynoti).format('HH:mm');

    return (
      <View style={styles.content}>
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
