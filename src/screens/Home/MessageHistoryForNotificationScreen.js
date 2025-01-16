import React from 'react';
import {
  Image,
  View,
  TouchableOpacity,
  FlatList,
  BackHandler,
  ScrollView,
} from 'react-native';
import { Col, Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import moment from 'moment';
import GradientButton from '../../components/GradientButton';
import RNFS from "react-native-fs";
import FileViewer from "react-native-file-viewer";
import ProgressHud from '../../components/ProgressHud';
import ApiManager from '../../managers/ApiManager';
import ImageView from "react-native-image-viewing";
import Hyperlink from 'react-native-hyperlink'
import {Linking} from 'react-native'

export default class MessageHistoryForNotificationScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      messageDetail: {},
      isSentReply: false,
      showImageView: false,
      showImages: [],
      userid: "",
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

      const userid = this.props.navigation.getParam('userid');
      const messageDetail = this.props.navigation.getParam('detail');

      let replyStatus = false;
      if(messageDetail.replyStatus){
        replyStatus = true;
      }

      this.setState({ userid: userid, messageDetail: messageDetail, isSentReply: replyStatus});
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

    this.props.navigation.navigate('App');
  };

  openFile = (item) => {
    let date = new Date();
    const url = item.filename;
    const fileName = "message_" + Math.floor(date.getTime() + date.getSeconds() / 2);
    const extension = this.getUrlExtension(url, item.filetype);
    const localFile = `${RNFS.DocumentDirectoryPath}/${fileName}.${extension}`;
    options = { fromUrl: url, toFile: localFile};
    this.setState({isLoading: true});
    RNFS.downloadFile(options)
    .promise.then(() => FileViewer.open(localFile))
    .then(() => {
      this.setState({isLoading: false});
    })
    .catch((error) => {
      this.setState({isLoading: false});
      console.log("OpenFilesError", error);
    });
  }

  getUrlExtension = (url, filetype) => {
    let res = url.split(/[#?]/)[0].split(".").pop().trim();
    if(res.length > 4){
      res = filetype.split('/').pop().trim();
    }
    return res;
  }

  renderAttachImages = (item, index) => {
    let image = Images.icon_pdf;

    if(item.filetype.toLowerCase().includes('pdf')){
      image = Images.icon_pdf;
    }else if(item.filetype.toLowerCase().includes('word')){
      image = Images.icon_word;
    }else if(item.filetype.toLowerCase().includes('excel') || item.filetype.toLowerCase().includes('sheet')){
      image = Images.icon_excel;
    }else if(item.filetype.toLowerCase().includes('powerpoint') || item.filetype.toLowerCase().includes('presentation')){
      image = Images.icon_ppt;
    }else if(item.filetype.toLowerCase().includes('image')){
      image = {uri: item.filename};
    }else{
      image = Images.icon_word;
    }

    return (
      <TouchableOpacity style={{position: 'relative', marginVertical: 10, marginRight: 10}} key={index} onPress={()=>{this.openFile(item)}} >
        <Image style={{width: 30, height: 50}} source={image} />
      </TouchableOpacity>
    )
  }

  clickAcceptBtn = (item)=>{
    const userid = this.state.userid
    const messageid = this.state.messageDetail.nMessageID;
    const replycode = item.ReplyCode;
    this.setState({isLoading: true})
    ApiManager.MessageReply(userid, messageid, replycode).then(res => {
      if(res.statusCode == '200'){
        this.setState({isSentReply: true}, ()=>{
          this.props.navigation.navigate('Message');
        });
      }
      this.setState({isLoading: false});
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  }

  renderButtons(buttons) {
    var res = [];
    if(this.state.isSentReply){
        res.push(
          <GradientButton
            label={this.state.messageDetail.replyResult}
            containerStyle={styles.buttonStyle}
            buttonStyle={{ borderRadius: 22, height: 44, }}
            colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
            isVerticalGradient={false}
            disableColors={[Color.n_default_gray_dark, Color.n_default_gray_dark]}
            enabled={false}
            _onPress={() => console.log("")} />
        );
    }else{
      for(let i = 0; i < buttons.length; i++){
        let item = buttons[i];
        res.push(
          <GradientButton
            key={i}
            label={item.MessageButton}
            containerStyle={styles.buttonStyle}
            buttonStyle={{ borderRadius: 22, height: 44, }}
            colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
            isVerticalGradient={false}
            disableColors={[Color.n_default_gray_dark, Color.n_default_gray_dark]}
            _onPress={() => this.clickAcceptBtn(item)} />
        );
      }
    }
    return res;
  }

  render() {
    const {messageDetail} = this.state;
    let time = "";
    let title = "";
    let content = "";

    let attachFiles = [];
    let buttonGroup = [];

    time = moment(messageDetail.dSend).format('DD MMMM YYYY HH:mm');
    title = messageDetail.sTitle;
    content = messageDetail.sMessage;
    if(messageDetail.fileUploads){
      attachFiles = messageDetail.fileUploads;
    }
    if(messageDetail.replyButtons){
      buttonGroup = messageDetail.replyButtons;
    }

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_message')}
          onMenuTap={() => this.back()}
        />
        <View style={styles.container}>
          <View style={styles.dispcontainer}>
            <View>
              <Text style={[styles.title2, {marginHorizontal: 20, marginTop: 10, color: Color.n_default_gray_dark}]}>{time}</Text>
              <Text style={[styles.title2, {marginHorizontal: 20, marginBottom: 10, color: Color.n_default_gray_dark}]}>{`${translang.t('BROADCAST_sender')} : ${messageDetail.NewsCreatedBy}`}</Text>
              <View style={{height: 1, marginHorizontal: 20, backgroundColor: Color.n_default_orange, marginVertical: 5}} />
            </View>
            <ScrollView>
              <Text style={[styles.title1, {marginHorizontal: 20, marginBottom: 20,}]}>{title}</Text>
              {/* <Text style={[styles.title2, {marginHorizontal: 20, fontSize: 18, fontWeight: 'normal'}]}>{content}</Text> */}
              <Hyperlink  onPress={url => {
                    Linking.openURL(url)
                  }} linkDefault={false} linkStyle={ { color: "blue" } }>
                <Text style={[styles.title2, {marginHorizontal: 20, fontSize: 18, fontWeight: 'normal'}]}>{content}</Text>
              </Hyperlink>
              {/* <Autolink style={[styles.title2, {marginHorizontal: 20, fontSize: 18, fontWeight: 'normal'}]} linkStyle={{color: 'blue'}} text={content} email={false} /> */}
              {attachFiles.length > 0 &&
                <FlatList
                  style={{flex: 0, marginHorizontal: 20}}
                  data={attachFiles}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item, index}) => this.renderAttachImages(item, index)}
                  horizontal
                />
              }
              {buttonGroup.length > 0 &&
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginHorizontal: 30, marginTop: 20, width: '90%', flexWrap: 'wrap'}}>
                  {this.renderButtons(buttonGroup)}
                </View>
              }
            </ScrollView>
          </View>
        </View>
        <ImageView
          images={this.state.showImages}
          imageIndex={0}
          visible={this.state.showImageView}
          onRequestClose={() => this.setState({showImageView: false, selImageIndex: 0})}/>

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
  dispcontainer: {
    margin: 25,
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 3,
    shadowOpacity: 0.3,
    elevation: 5,
  },

  title1: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    color: Color.n_default_gray
  },
  title2: {
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    fontWeight: 'bold',
    color: Color.n_default_gray
  },


  buttonStyle:{
    width: 116,
    marginHorizontal: 3,
    marginVertical: 5,
  }
});
