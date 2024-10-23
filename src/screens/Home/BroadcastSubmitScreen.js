import React from 'react';
import {
  Image,
  View,
  TouchableOpacity,
  BackHandler,
  ScrollView,
  FlatList,
} from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import NextButton from '../../components/NextButton';
import moment from 'moment';
import ApiManager from '../../managers/ApiManager';
import Storage from '../../managers/StorageManager';
import ProgressHud from '../../components/ProgressHud';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import CardInfoItem from '../../components/CardInfoItem';
import ImageView from "react-native-image-viewing";
export default class BroadcastSubmitScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalBody: '',
      isLoading: false,
      userInfo: {},
      deliveryFormat: {},
      recipient: {},
      deliveryTimeType: '',
      deliveryDate: '',
      deliveryTime: '',
      topic: '',
      reply: {},
      description: '',
      individualIds: [],
      level2id: [],
      attachedFiles: [],
      attachedImages: [],
      showAttachImages: [],
      showImageView: false,
      selImageIndex: 0,
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
      console.log("BroadcastSubmitScreen");
      const deliveryFormat = this.props.navigation.getParam('deliveryFormat');
      const recipient = this.props.navigation.getParam('recipient');
      const deliveryTimeType = this.props.navigation.getParam('deliveryTimeType');
      const deliveryDate = this.props.navigation.getParam('deliveryDate');
      const deliveryTime = moment(this.props.navigation.getParam('deliveryTime')).format("HH:mm");
      const description = this.props.navigation.getParam('description');
      const topic = this.props.navigation.getParam('topic');
      const reply = this.props.navigation.getParam('reply');
      console.log("reply:", reply);
      const individualIds = this.props.navigation.getParam('individualIds') ?? [];
      const level2id = this.props.navigation.getParam('level2id') ?? [];
      const attachedFiles = this.props.navigation.getParam('attachedFiles') ?? [];
      const attachedImages = this.props.navigation.getParam('attachedImages') ?? [];
      const showAttachImages = this.props.navigation.getParam('showAttachImages') ?? [];
      const userInfo = this.props.navigation.getParam('userInfo');

      this.setState({ userInfo: userInfo, deliveryFormat: deliveryFormat, recipient: recipient, deliveryTimeType: deliveryTimeType, deliveryDate: deliveryDate, deliveryTime: deliveryTime, description: description, topic: topic, reply: reply, individualIds: individualIds, level2id: level2id, attachedFiles: attachedFiles, attachedImages: attachedImages, showAttachImages: showAttachImages });
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
    // this.props.navigation.pop();
    if(this.backhandler){
      this.backhandler.remove();
    }

    this.props.navigation.navigate('BroadcastFillInfo');
  };

  onSubmit = () => {
    let level2id = [];
    let employeesid = [];
    let studentid = [];

    if (this.state.deliveryFormat.value === 0) {
      if (this.state.recipient.smsGroupType == "all-student-level" && this.state.level2id.length > 0) {
        this.state.level2id.forEach(item=>{
          level2id.push(item.level2id);
        });
      }
    } else {
      if (this.state.recipient == 2) {
        studentid = this.state.individualIds
      } else {
        employeesid = this.state.individualIds;
      }
    }

    const schoolId = this.state.userInfo.SchoolID;
    const sendTimeType = this.state.deliveryTimeType;
    const sendType = this.state.deliveryFormat.value;
    const sendGroup = this.state.recipient.value;
    const description = this.state.description;
    const studentId = studentid;
    const employeesId = employeesid;
    const scheduleDate = this.state.deliveryDate+"T"+this.state.deliveryTime;
    const userId = this.state.userInfo.ID;
    const newsheader = this.state.topic;

    let files = [];
    this.state.attachedFiles.forEach(item=>{
      files.push(item);
    });
    this.state.attachedImages.forEach(item=>{
      files.push(item);
    });

    const reply = this.state.reply.value;


    const promise = ApiManager.sendBroadcast(schoolId, sendTimeType, sendType, sendGroup, description, level2id, studentId, employeesId, scheduleDate, userId, newsheader, files, reply);

    this.setState({ isLoading: true });
    promise.then(result => {
      if (result) {
        this.setState({ isLoading: false, showModal: true, modalBody: translang.t('COMMON_success') });
      } else {
        this.setState({ isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN') });
      }
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN') });
    })
  };

  renderAttachFile = (item, index) => {
    let image = Images.icon_word;

    if (item.FileURL.endsWith('.pdf')) {
      image = Images.icon_pdf;
    } else if (item.FileURL.endsWith('.doc') || item.FileURL.endsWith('.docx')) {
      image = Images.icon_word;
    } else if (item.FileURL.endsWith('.xls') || item.FileURL.endsWith('.xlsx')) {
      image = Images.icon_excel;
    }

    return (
      <View style={{marginHorizontal: 4}}>
        <Image style={{width: 80, height: 80}} source={image} />
      </View>
    )
  }

  renderAttachImages = (item, index) => {
    return (
      <TouchableOpacity style={{position: 'relative', marginVertical: 10, marginRight: 10}} key={index} onPress={()=>this.setState({showImageView: true, selImageIndex: index})} >
        <Image style={{width: 80, height: 100}} source={{uri: item.uri}} />
      </TouchableOpacity>
    )
  }

  render() {
    console.log("userinfo:", this.state.userInfo);
    let senderName = '';
    if ( getCurrentLocale() == 'th') {
      senderName =  (this.state.userInfo.sName ?? '') + ' ' + (this.state.userInfo.sLastname ?? '') ;
    } else {
      senderName =  (this.state.userInfo.NameEn ?? '') + ' ' + (this.state.userInfo.LastNameEN ?? '') ;
      if (!senderName){
        senderName =  (this.state.userInfo.sName ?? '') + ' ' + (this.state.userInfo.sLastname ?? '') ;
      }
    }

    const sendDate = this.state.deliveryTimeType === 0 ? moment().format('DD/MM/YYYY') : moment(this.state.deliveryDate).format('DD/MM/YYYY') + ' ' + this.state.deliveryTime;

    const alertImage = this.state.modalBody === translang.t('COMMON_success') ? Images.checked : Images.alert_inbox;
    const alertButtonColor = this.state.modalBody === translang.t('COMMON_success') ? [Color.green_button_next_color1, Color.green_button_next_color2] : [Color.red_orange, Color.soft_red];

    let receiptTitle = this.state.recipient.title ?? '';
    if(this.state.recipient.smsGroupType == "all-student-level" && this.state.level2id.length > 0){
      let roomList = "";
      this.state.level2id.forEach(item=>{
        let roomname = item.NameTH;
        if(getCurrentLocale() == 'en' && item.NameEN && item.NameEN != ""){
          roomname = item.NameEN;
        }
        roomList = roomList + `${roomname}, `;
      });
      receiptTitle = receiptTitle + `\n${roomList}`;
    }

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_broadcast')}
          onMenuTap={() => this.back()}
        />
        <View style={styles.container}>
          <View style={styles.dispcontainer}>
            <ScrollView>
              <CardInfoItem
                title = {translang.t('BROADCAST_sender')}
                value_txt = {senderName}
                titleColor = {Color.n_default_orange}
                infoColor = {Color.n_default_gray}
                style={{marginVertical: 5}}
                titleFontSize={24}
                infoFontSize={24}
              />

              <CardInfoItem
                title = {translang.t('BROADCAST_send_format')}
                value_txt = {this.state.deliveryTimeType === 0 ? translang.t('SEND_NOW') : translang.t('SEND_TIME')}
                titleColor = {Color.n_default_orange}
                infoColor = {Color.n_default_gray}
                style={{marginVertical: 5}}
                titleFontSize={24}
                infoFontSize={24}
              />

              <CardInfoItem
                title = {translang.t('HOMEWORK_recipient')}
                value_txt = {receiptTitle}
                titleColor = {Color.n_default_orange}
                infoColor = {Color.n_default_gray}
                style={{marginVertical: 5}}
                titleFontSize={24}
                infoFontSize={24}
              />

              <CardInfoItem
                title = {translang.t('HEAD_TOPIC')}
                value_txt = {this.state.topic ?? ''}
                titleColor = {Color.n_default_orange}
                infoColor = {Color.n_default_gray}
                style={{marginVertical: 5}}
                titleFontSize={24}
                infoFontSize={24}
              />

              <CardInfoItem
                title = {translang.t('REPLY')}
                value_txt = {this.state.reply.title ?? ''}
                titleColor = {Color.n_default_orange}
                infoColor = {Color.n_default_gray}
                style={{marginVertical: 5}}
                titleFontSize={24}
                infoFontSize={24}
              />
              <CardInfoItem
                title = {translang.t('BROADCAST_send_date')}
                value_txt = {sendDate}
                titleColor = {Color.n_default_orange}
                infoColor = {Color.n_default_gray}
                style={{marginVertical: 5}}
                titleFontSize={24}
                infoFontSize={24}
              />

              <View style={{marginVertical: 5}}>
                <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('HOMEWORK_description')}</Text>
                <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_gray, fontSize: 24, marginBottom: 5}}>{this.state.description}</Text>
              </View>
              { this.state.showAttachImages.length === 0 &&
              <View style={{marginVertical: 5}}>
                <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('HOMEWORK_attachimg')}</Text>
                <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_gray, fontSize: 24, marginBottom: 5}}>-</Text>
              </View>}
              {this.state.showAttachImages.length > 0 &&
                <View>
                  <View style={{marginVertical: 5}}>
                    <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('HOMEWORK_attachimg')}</Text>
                  </View>
                  <FlatList
                    style={{height: 100, marginHorizontal: 20}}
                    data={this.state.showAttachImages}
                    keyExtractor={(item, index) => index.toString()}
                    ItemSeparatorComponent={this.ItemSeparatorView}
                    renderItem={({item, index}) => this.renderAttachImages(item, index)}
                    horizontal
                  />
                </View>
              }
              { this.state.attachedFiles.length === 0 &&
              <View style={{marginVertical: 5}}>
                <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('HOMEWORK_attachfile')}</Text>
                <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_gray, fontSize: 24, marginBottom: 5}}>-</Text>
              </View>}
              { this.state.attachedFiles.length > 0 &&
                <View>
                <View style={{marginVertical: 5}}>
                  <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('HOMEWORK_attachfile')}</Text>
                </View>
                  <FlatList
                    style={{height: 80, marginHorizontal: 20}}
                    data={this.state.attachedFiles}
                    keyExtractor={(item, index) => index.toString()}
                    ItemSeparatorComponent={this.ItemSeparatorView}
                    renderItem={({item, index}) => this.renderAttachFile(item, index)}
                    horizontal
                  />
                </View>
              }
            </ScrollView>
          </View>


          <NextButton
            label={translang.t('COMMON_submit')}
            containerStyle={{width: 290, marginLeft: 'auto', marginRight: 'auto', marginBottom: 15,}}
            buttonStyle={{ borderRadius: 38, height: 75 }}
            colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
            isVerticalGradient={false}
            _onPress={() => this.onSubmit()} />
        </View>
        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={alertImage}
          message={this.state.modalBody}
          buttonColors={alertButtonColor}
          isVerticalGradient={false}
          onClose={() => {
            if (this.state.modalBody === translang.t('COMMON_success')) {
              this.setState({ showModal: false });
              // this.props.navigation.navigate('Broadcast');
              this.props.navigation.navigate('App');
            } else {
              this.setState({ showModal: false });
            }
          }}
        />

        <ImageView
          images={this.state.showAttachImages}
          imageIndex={this.state.selImageIndex}
          visible={this.state.showImageView}
          onRequestClose={() => this.setState({showImageView: false, selImageIndex: 0})}
        />

        <ProgressHud isVisible={this.state.isLoading} />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000025',
  },
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white
  },
  dispcontainer: {
    flex: 1,
    margin: 20,
    backgroundColor: Color.white,
    borderRadius: 15,
    padding: 15,
    paddingRight: 0,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    elevation: 2,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  itemIcon: {
    width: '25@ms',
    height: '25@ms',
  },
  uperCardChild: {
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 5,
    paddingVertical: 15,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  itemText: {
    marginLeft: '20@ms',
    color: '#000',
    fontSize: '14@ms',
    paddingRight: 100,
  },
  itemActions: {
    position: 'absolute',
    right: 1,
    alignItems: 'center',
  },
  options1Text: {
    color: 'blueviolet',
    fontSize: '18@ms0.3',
  },
  options1Row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: '38%',
  },
  home: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  title2: {
    fontFamily: 'THSarabunNew',
    fontSize: 25,
    fontWeight: 'bold'
  },
  value2: {
    fontFamily: 'THSarabunNew',
    fontSize: 25,
  },
  attach2: {
    width: 100,
    height: 100,
  }
});
