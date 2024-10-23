import React from 'react';
import {
  Image,
  View,
  TouchableOpacity,
  BackHandler,
  ScrollView,
  FlatList,
  Modal,
  TextInput,
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
import ScoreInputModal from '../../components/TopupAmountModal';
import MyImageView from "../../components/MyImageView";

import RNFS from "react-native-fs";
import FileViewer from "react-native-file-viewer";
import Hyperlink from 'react-native-hyperlink'
import {Linking} from 'react-native'

export default class OnlineTeacherScoreSubmitScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalBody: '',
      isLoading: false,

      selStudent: {},
      selTopic: {},
      userInfo: {},

      classLevel: "",

      selScore: "",
      homeworkInfo: {},

      attachedImages: [],
      attachedFiles: [],

      showScoreModal: false,
      showMessageModal: false,
      messageList: [
        {time: '15:00', type: 'send', content: 'ช่วยเตือนเพื่อนที่ยัง \n ไม่ได้ส่งการบ้านด้วยนะคะ', img: ''},
        {time: '15:10', type: 'receive', content: 'ได้ครับคุณครู', img: ''},
      ],
      sendMessage: "",

      showImageView: false,
      showImages: [],
      showImageIndex: 0,
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

      console.log("OnlineTeacherScoreSubmitScreen");
      const selStudent = this.props.navigation.getParam('selStudent');
      const selTopic = this.props.navigation.getParam('selTopic');
      const userInfo = this.props.navigation.getParam('userInfo');
      const classLevel = this.props.navigation.getParam('classLevel');

      this.setState({ selStudent: selStudent, selTopic: selTopic, userInfo: userInfo, classLevel: classLevel, isLoading: false}, ()=>{
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

    this.props.navigation.navigate('OnlineTopicMain');
  };

  loadData(){
    this.setState({isLoading: true});
    const schoolID = this.state.userInfo.SchoolID;
    const homeworkID = this.state.selTopic.ID;
    const studentID = this.state.selStudent.StudentId;
    ApiManager.getStudentHomeWork(schoolID, homeworkID, studentID)
    .then(res => {
      this.setState({homeworkInfo: res.data, selScore: res.data.Score, attachedFiles: res.data.AttachFile, isLoading: false}, this.initImages);
    }).catch(error => {
      console.log(error);
      this.setState({isLoading: false});
    });
  }

  onSubmit = () => {
    const SchoolID = this.state.userInfo.SchoolID;
    const HomeWorkID = this.state.selTopic.ID;
    const TeacherID = this.state.userInfo.ID;
    const StudentID = this.state.selStudent.StudentId;
    const Score = this.state.selScore;

    const promise = ApiManager.saveHomeWorkScore(SchoolID, HomeWorkID, TeacherID, StudentID, Score);
    this.setState({ isLoading: true });
    promise.then(result => {
      if (result.statusCode == "200") {
        this.setState({ isLoading: false, showModal: true, modalBody: translang.t('COMMON_success') });
      } else {
        this.setState({ isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN') });
      }
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN') });
    })
  };

  getCurrentImageIndex = (item1) => {
    this.state.showImages.forEach((item) => {
      if(item1.File == item.uri){
        this.setState({showImageIndex: item.id});
      }
    })
  }

  openFile = (item) => {
    if (item.ContentType.toLowerCase().includes('image')) {
      this.getCurrentImageIndex(item);
      this.setState({showImageView: true});
      return;
    }

    let date = new Date();
    const url = item.File;
    const fileName = "online_" + Math.floor(date.getTime() + date.getSeconds() / 2);
    const extension = this.getUrlExtension(url, item.filetype);
    const localFile = `${RNFS.DownloadDirectoryPath}/${fileName}.${extension}`;
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

  renderAttachFile = (item, index) => {
    let image = Images.icon_word;
    if(item.ContentType.toLowerCase().includes('pdf')){
      image = Images.icon_pdf;
    }else if(item.ContentType.toLowerCase().includes('word')){
      image = Images.icon_word;
    }else if(item.ContentType.toLowerCase().includes('excel') || item.ContentType.toLowerCase().includes('sheet')){
      image = Images.icon_excel;
    }else if(item.ContentType.toLowerCase().includes('powerpoint') || item.ContentType.toLowerCase().includes('presentation')){
      image = Images.icon_ppt;
    }else if(item.ContentType.toLowerCase().includes('image')){
      image = {uri: item.File};
    }else{
      image = Images.icon_word;
    }

    return (
      <TouchableOpacity style={{position: 'relative', marginVertical: 10, marginRight: 10}} key={index} onPress={()=>{this.openFile(item)}} >
        <Image style={{width: 30, height: 50}} source={image} />
      </TouchableOpacity>
    )
  }

  renderAttachImages = (item, index) => {
    return (
      <View style={{marginHorizontal: 4}}>
        <Image style={{width: 80, height: 100}} source={{uri: item}} />
      </View>
    )
  }

  clickMessageIcon = () =>{
    this.setState({showMessageModal: true})
  }


  onChangeScore = (score) => {
    console.log("Score", parseFloat(score));
    console.log("Max Score", parseFloat(this.state.homeworkInfo.MaxScore));
    if(parseFloat(score) > parseFloat(this.state.homeworkInfo.MaxScore)){
      this.setState({showModal: true, modalBody: translang.t('OVERSCORE_ALERT') });
      return;
    }

    this.setState({selScore: score, showScoreModal: false});
  }

  renderMessageItem = (item, index) => {
    let ismine = false;
    if(item.type == 'send'){
      ismine = true
    }
    return (
      <View style={{marginHorizontal: 20, marginVertical: 10}}>
        <Text style={{textAlign: 'center', fontFamily: 'THSarabunNew', fontSize: 20, color: Color.n_default_orange}}>{item.time??""}</Text>
        <View>
          {ismine && <View style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end'}}>
            <View style={{backgroundColor: Color.n_default_orange, borderColor: Color.n_default_orange, borderWidth: 1, padding: 10, borderTopLeftRadius: 15, borderTopRightRadius: 15, borderBottomLeftRadius: 15}}>
              <Text style={{color: 'white', fontFamily: 'THSarabunNew', fontSize: 23,}}  multiline>{item.content}</Text>
            </View>
          </View>}
          {!ismine && <View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-end'}}>
            <Image source={Images.man_user} style={{width: 30, height: 30, borderRadius: 15}}></Image>
            <View style={{backgroundColor: Color.white, borderColor: Color.n_default_orange, borderWidth: 1, padding: 10, borderTopLeftRadius: 15, borderTopRightRadius: 15, borderBottomRightRadius: 15, marginLeft: 10}}>
            <Text style={{color: Color.n_default_orange, fontFamily: 'THSarabunNew', fontSize: 23,}}  multiline>{item.content}</Text>
            </View>
          </View>}
        </View>
      </View>
    )
  }

  initImages = () => {
    const {attachedFiles} = this.state;
    let ImagesData = [];

    let idx = 0;
    attachedFiles.forEach((item1) => {
      if (item1.ContentType.toLowerCase().includes('image')) {
        ImagesData[idx] = {
          id: idx,
          uri: item1.File,
        };
        idx++;
      }
    });
    this.setState({showImages: ImagesData, showImageView: false})
  }



  onChangeSendMessage = (text) => {
    this.setState({sendMessage: text});
  }
  render() {
    const alertImage = this.state.modalBody === translang.t('COMMON_success') ? Images.checked : Images.alert_inbox;
    const alertButtonColor = this.state.modalBody === translang.t('COMMON_success') ? [Color.n_button_gradient_green_start, Color.n_button_gradient_green_end] : [Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end];

    const {selTopic, selScore, selStudent, homeworkInfo, attachedFiles} = this.state;

    let topicName = "";
    if(selTopic.Title != null && selTopic.Title != ""){
      topicName = selTopic.Title;
    }
    let topicGroupName = "";
    if(selTopic.GroupTitle != null && selTopic.GroupTitle != ""){
      topicGroupName = selTopic.GroupTitle;
    }

    let classLevel = this.state.classLevel;
    let studentName = "";
    if(selStudent.FullName != "" && selStudent.FullName != null){
      studentName = selStudent.FullName;
      if(getCurrentLocale() == 'en' && selStudent.FullNameEn && selStudent.FullNameEn.trim() != ''){
        studentName = selStudent.FullNameEn;
      }
    }

    let scheduleDate = "";
    if(selTopic.DisplayDate != null){
      scheduleDate = moment(selTopic.DisplayDate).format('DD MMMM YYYY');
    }

    let description = "";
    if(homeworkInfo.Description){
      description = homeworkInfo.Description
    }

    let attachLink = "";
    if(homeworkInfo.Link){
      attachLink = homeworkInfo.Link
    }

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('CHECKING_HOMEWORK')}
          onMenuTap={() => this.back()}
          // isMessage="1"
          // msgCount={10}
          // onMessageTap={() => this.clickMessageIcon()}
        />
        <View style={styles.container}>
          <View style={{flexDirection: 'row', marginTop: 20, marginHorizontal: 30, justifyContent: 'flex-start', alignItems: 'center'}}>
            <Text style={{flex: 1, fontFamily: 'THSarabunNew', fontSize: 30, fontWeight: 'bold', color: Color.n_default_orange}}>{translang.t('SCORE')}</Text>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}}>
              <TouchableOpacity
                style={{width: 60, height: 40, borderRadius: 6, borderWidth: 1, borderColor: Color.n_default_orange, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}}
                onPress={() => this.setState({showScoreModal: true})}>
                <Text style = {{fontFamily: 'THSarabunNew', fontSize: 30, fontWeight: 'bold', color: Color.n_default_orange, marginRight: 4}}>{this.state.selScore ?? "0"}</Text>
              </TouchableOpacity>
              <Text style = {{fontFamily: 'THSarabunNew', fontSize: 40, fontWeight: 'bold', color: Color.n_default_orange}}>{" / "}</Text>
              <Text style = {{fontFamily: 'THSarabunNew', fontSize: 35, fontWeight: 'bold', color: Color.n_default_orange}}>{homeworkInfo.MaxScore ?? '0'}</Text>
            </View>
          </View>

          <View style={styles.dispcontainer}>
            <ScrollView>
              <View style={{flexDirection: 'column', marginVertical: 5}}>
                <Text style={{flex: 1, fontFamily: 'THSarabunNew', fontSize: 24, fontWeight: 'bold', color: Color.n_default_orange}}>{topicName}</Text>
                <Text style={{flex: 1,fontFamily: 'THSarabunNew', fontSize: 24, color: Color.n_default_orange}}>{topicGroupName}</Text>
              </View>

              <CardInfoItem
                title = {translang.t('TIMETABLE_classlevel')}
                value_txt = {classLevel}
                titleColor = {Color.n_default_orange}
                infoColor = {Color.n_default_gray}
                style={{marginVertical: 5}}
                titleFontSize={24}
                infoFontSize={24}
              />

              <CardInfoItem
                title = {translang.t('STUDENT')}
                value_txt = {studentName}
                titleColor = {Color.n_default_orange}
                infoColor = {Color.n_default_gray}
                style={{marginVertical: 5}}
                titleFontSize={24}
                infoFontSize={24}
              />

              <CardInfoItem
                title = {translang.t('DEADLINE_DATE')}
                value_txt = {scheduleDate}
                titleColor = {Color.n_default_orange}
                infoColor = {Color.n_default_gray}
                style={{marginVertical: 5}}
                titleFontSize={24}
                infoFontSize={24}
              />
              <CardInfoItem
                title = {translang.t('LEAVE_detail')}
                value_txt = {description}
                titleColor = {Color.n_default_orange}
                infoColor = {Color.n_default_gray}
                style={{marginVertical: 5}}
                titleFontSize={24}
                infoFontSize={24}
              />

              {this.state.attachedFiles.length > 0 &&
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
              </View>}

              <View style={{marginVertical: 5}}>
                <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('ATTACH_LINK')}</Text>
                <Hyperlink  onPress={url => {
                    Linking.openURL(url)
                  }} linkDefault={false} linkStyle={ { color: "blue" } }>
                  <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_gray, fontSize: 24, marginBottom: 5}}>{attachLink}</Text>
                </Hyperlink>
              </View>

            </ScrollView>
          </View>
        </View>


        <NextButton
          label={translang.t('COMMON_submit')}
          containerStyle={{width: 290, marginLeft: 'auto', marginRight: 'auto', marginBottom: 15,}}
          buttonStyle={{ borderRadius: 38, height: 75 }}
          colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
          isVerticalGradient={false}
          _onPress={() => this.onSubmit()} />

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={alertImage}
          message={this.state.modalBody}
          buttonColors={alertButtonColor}
          isVerticalGradient={false}
          onClose={() => {
            if (this.state.modalBody === translang.t('COMMON_success')) {
              // this.setState({ showModal: false });
              this.setState({ showModal: false }, ()=>{
                this.props.navigation.navigate('OnlineTopicMain');
              });
            } else {
              this.setState({ showModal: false });
            }
          }}
        />

        <MyImageView
          images={this.state.showImages}
          visible={this.state.showImageView}
          imageIndex={this.state.showImageIndex}
          onRequestClose={() => this.setState({showImageView: false, selImageIndex: 0})}
        />

        <ProgressHud isVisible={this.state.isLoading} />

        <ScoreInputModal
          isVisible={this.state.showScoreModal}
          title = {translang.t('INPUT_SCORE')}
          onClose={() => { this.setState({ showScoreModal: false }) }}
          onOK={(amount) => { this.onChangeScore(amount) }}
          onError={() => { }}
        />

        <Modal
          animationType='fade'
          transparent={true}
          key="modal"
          visible={this.state.showMessageModal}>
          <TouchableOpacity
            style={styles.centeredView}
            activeOpacity={1}
            onPressOut={() => { this.setState({showMessageModal: false})}}>
            <View style={styles.dialogStyle}>
              <TouchableOpacity
                activeOpacity={1}
                style={{flexDirection: 'column', flex: 1,}}
                onPressOut={() => { }}>
                <View style={{width: '100%', height: 70, borderRadius: 20, backgroundColor: Color.n_default_brown, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <TouchableOpacity
                  style = {{justifyContent: 'center', alignItems: 'center', marginLeft: 15}}
                  onPressOut={() => { this.setState({showMessageModal: false})}}>
                  <Image source={Images.n_ic_arrow_left_white} style={{resizeMode: 'contain', width: 30, height: 20,}}/>

                  </TouchableOpacity>

                  <View style={{flexDirection: 'row', alignItems: 'center', alignSelf: 'center'}}>
                    <Image source={Images.man_user} style={styles.itemAvatar}></Image>
                    <Text style={{fontFamily: 'THSarabunNew', fontSize: 24, marginLeft: 20}}>Titmon Runkarn</Text>
                  </View>

                  <View style = {{width: 50, height: 30}}/>

                </View>
                <FlatList
                  style={{flex: 1}}
                  data={this.state.messageList}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item, index}) => this.renderMessageItem(item, index)}
                />

                <View style={{width: '100%', height: 70, backgroundColor: Color.n_default_brown, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems:'center'}}>
                  <View style={styles.createTopicViewContainer}>
                    <TextInput
                      style={{backgroundColor: Color.transparent, fontSize:20, fontFamily: 'THSarabunNew', color: Color.n_default_gray, width: '100%' }}
                      placeholder={translang.t('HEAD_TOPIC')}
                      multiline={true}
                      onChangeText={text => this.onChangeSendMessage(text)}>{this.state.sendMessage}</TextInput>
                  </View>

                  <TouchableOpacity
                    style = {{justifyContent: 'center', alignItems: 'center', marginHorizontal: 25}}
                    onPressOut={() => { this.setState({showMessageModal: false})}}>
                    <Image source={Images.n_ic_send_orange} style={{resizeMode: 'contain', width: 30, height: 20,}}/>
                  </TouchableOpacity>

                </View>

              </TouchableOpacity>

            </View>
          </TouchableOpacity>
        </Modal>
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
    flex: 1,
    margin: 20,
    backgroundColor: Color.white,
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    elevation: 2,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'visible',
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
  },

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000090',
  },
  dialogStyle: {
    width: '90%',
    height: '80%',


    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Color.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  itemAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  createTopicViewContainer: {
    height: 50,
    borderColor: Color.n_default_orange,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    padding: 3,
    paddingLeft: 10,
    marginLeft: 20,

  },
});
