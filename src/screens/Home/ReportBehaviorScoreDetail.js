import React from 'react';
import {Image, View, BackHandler, TouchableOpacity, ScrollView, FlatList,} from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import NextButton from '../../components/NextButton';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import Images from '../../themes/Images';
import translang, {getCurrentLocale} from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import ApiManager from '../../managers/ApiManager';
import Storage from '../../managers/StorageManager';
import _, { transform } from 'lodash';
import moment from 'moment';
import CardInfoItem from '../../components/CardInfoItem';
import MyImageView from "../../components/MyImageView";

export default class ReportBehaviorScoreDetailScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showModal: false,
      modalBody: '',
      behavior: {},
      ImageIndex: 0,
      showImageView: false,
      ImageData: [],
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
      const behavior = this.props.navigation.getParam('behavior');

      console.log("ReportBehaviorScoreDetailScreen");

      let imagesData = behavior.fileUploads.map((item) => {
        return {uri: item.filename}
      });


      this.setState({ImageData: imagesData, userInfo: userInfo, behavior: behavior });
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

    // this.props.navigation.pop(1);
    this.props.navigation.navigate('ReportStudentBehaviorScoreList');
    // this.props.navigation.replace('BehaviorUserList');
  };

  __next = async () => {

  };

  clickImage = (item, index) => {
    this.setState({ImageIndex: index, showImageView: true});
  }

  renderAttachImages = (item, index) => {
    return (
        <TouchableOpacity style={{position: 'relative', marginVertical: 10, marginRight: 10}} key={index}
                          onPress={() => {
                            this.clickImage(item, index)
                          }}>
          <Image style={{width: 100, height: 80, borderRadius: 4,}} source={{uri: item.filename}}/>
        </TouchableOpacity>
    )

  }

  render() {
    const behavior = this.state.behavior;
    const date = moment(behavior.Day).format('DD/MM/YYYY');
    const time = moment(behavior.Day).format('HH:mm');

    let score = '';
    let color = Color.n_button_gradient_green_start;
    if (behavior.BehaviorsType === '1') {
      score = `-${behavior.Score}`;
      color = Color.n_default_orange;
    } else {
      score = `+${behavior.Score}`;
      color = Color.n_button_gradient_green_start;
    }
    // if (behavior.LastScore < 0) {
    //   score = `-${behavior.LastScore}`;
    //   color = Color.n_default_orange;
    // } else {
    //   score = `+${behavior.LastScore}`;
    //   color = Color.n_button_gradient_green_start;
    // }

    let studentName = behavior.StudentName ?? '';

    return (
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_reportbehavior')}
          onMenuTap={() => this.back()}
        />

        <View style={styles.content}>
          <View style={{...styles.topTitleContainer, backgroundColor: color}}>
            <Text style={{...styles.title, fontSize: 29}}>{score}</Text>
            <Text style={styles.title} numberOfLines={1}>{getCurrentLocale() === 'th' ? behavior.BehaviorsName : behavior.BehaviorsNameEN ?? behavior.BehaviorsName}</Text>
          </View>
          <ScrollView style={styles.list}>
            <CardInfoItem
              title = {translang.t('REPORT_date')}
              value_txt = {date}
              titleColor = {Color.n_default_orange}
              infoColor = {Color.n_default_gray}
              style={{marginVertical: 5}}
              titleFontSize={24}
              infoFontSize={24}/>
            <CardInfoItem
              title = {translang.t('HOMEWORK_time')}
              value_txt = {time}
              titleColor = {Color.n_default_orange}
              infoColor = {Color.n_default_gray}
              style={{marginVertical: 5}}
              titleFontSize={24}
              infoFontSize={24}/>

            <View style={{marginVertical: 5}}>
              <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('DETAIL')}</Text>
              <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_gray, fontSize: 24, width: '100%'}}>
                {getCurrentLocale() === 'th' ? behavior.BehaviorsName : behavior.BehaviorsNameEN ?? behavior.BehaviorsName}
              </Text>
            </View>

            <View style={{width: '100%', height: 1, backgroundColor: Color.n_default_brown, marginVertical: 20,}} />

            <CardInfoItem
              title = {translang.t('RECORDER')}
              value_txt = {getCurrentLocale() == 'th' ? behavior.TheacherName : behavior.TheacherNameEN ?? behavior.TheacherName}
              titleColor = {Color.n_default_orange}
              infoColor = {Color.n_default_gray}
              style={{marginVertical: 5}}
              titleFontSize={24}
              infoFontSize={24}
            />

            <CardInfoItem
              title = {translang.t('REMARK')}
              value_txt = {behavior.Note ?? ''}
              titleColor = {Color.n_default_orange}
              infoColor = {Color.n_default_gray}
              style={{marginVertical: 5}}
              titleFontSize={24}
              infoFontSize={24}
            />

            <View style={{flexDirection: 'row'}}>
              <FlatList
                  style={{flex: 1}}
                  data={this.state.behavior.fileUploads}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item, index}) => this.renderAttachImages(item, index)}
                  horizontal
              />
            </View>
          </ScrollView>
          <MyImageView
              images={this.state.ImageData}
              imageIndex={this.state.ImageIndex}
              presentationStyle={'formSheet'}
              visible={this.state.showImageView}
              onRequestClose={() => {
                this.setState({showImageView: false});
              }}/>
        </View>
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
    margin: 10,
    backgroundColor: Color.white,
    flex: 1,
    borderRadius: 15,
    marginTop: 80,
    marginBottom: 30,
    marginHorizontal: 15,

    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,

    zIndex: 0,

    paddingHorizontal: 25,
  },

  topTitleContainer: {
    width: '60%',
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: Color.white,
    marginTop: -40,
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingHorizontal: 20,

    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,

    zIndex: 99,

    flexDirection: 'column',
    justifyContent: 'center'
  },

  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'THSarabunNew',
    color: Color.white
  },












  itemContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    alignItems: 'center',
  },
  itemIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  itemValue: {
    fontSize: 25,
    fontFamily: 'THSarabunNew',
    marginHorizontal: 10,
  },
  itemTitle: {
    flex: 1,
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'THSarabunNew',
    marginHorizontal: 10,
  },
  list: {
    flex: 1,
  },
});
