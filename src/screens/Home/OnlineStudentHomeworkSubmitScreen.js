import React from 'react';
import {
  Image,
  View,
  TouchableOpacity,
  BackHandler,
  ScrollView,
  FlatList,
  Modal,
  TextInput
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
import RNFS from 'react-native-fs';
import ImageView from "react-native-image-viewing";
import Hyperlink from 'react-native-hyperlink'
import {Linking} from 'react-native'
import FileViewer from "react-native-file-viewer";


export default class OnlineStudentHomeworkSubmitScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalBody: '',
      isLoading: false,
      showImages: false,

      type: '',
      description: "",
      attachlink: '',
      homeworkData: {},
      attachedFiles: [],
      attachedImages: [],
      showAttachImages: [],

      userInfo: {},
      homeworkID: "",

      messageList: [],
      showMessageModal: false,
      sendMessage: "",
      isNotify: false,
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

      const type = this.props.navigation.getParam('type');
      const description = this.props.navigation.getParam('description');
      const homeworkData = this.props.navigation.getParam('homeworkData');
      const attachlink = this.props.navigation.getParam('attachlink');
      const attachedFiles = this.props.navigation.getParam('attachedFiles');
      const attachedImages = this.props.navigation.getParam('attachedImages');
      const showAttachImages = this.props.navigation.getParam('showAttachImages');
      const userInfo = this.props.navigation.getParam('userInfo');
      const homeworkID = this.props.navigation.getParam('homeworkID');
      const isNotify = this.props.navigation.getParam('isNotify');

      this.setState({ type, description, homeworkData, attachlink, attachedFiles, attachedImages, showAttachImages, userInfo, homeworkID, isNotify});
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

  clickMessageIcon = () =>{
    this.setState({showMessageModal: true}, ()=>{
      this.loadMessage();
    })
  }
  onChangeSendMessage = (text) => {
    this.setState({sendMessage: text});
  }
  onSendMessage = () => {
    const SchoolID = this.state.userInfo.SchoolID;
    const HomeWorkID = this.state.homeworkID;
    const StudentID = this.state.userInfo.ID;
    const TeacherID = this.state.homeworkData.TeacherId;
    const Comment = this.state.sendMessage;

    const promise = ApiManager.sendMessageStudent(SchoolID, HomeWorkID, StudentID, TeacherID, Comment);
    promise.then(result => {
      if(result.statusCode == "200"){
        this.setState({sendMessage: ''}, ()=>{
          this.loadMessage();
        })
      }
    }).catch(error => {
      console.log(error);
      this.setState({showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN') });
    })
  }

  loadMessage = () => {
    const schoolid = this.state.userInfo.SchoolID;
    // const schoolid = "849";
    const studentid = this.state.userInfo.ID;
    // const studentid = "519703";
    const workId = this.state.homeworkID;
    // const workId = "83247";


    ApiManager.getMessageForOnlineStudent(schoolid, studentid, workId).then(data => {
      this.setState({messageList: data});
    }).catch(error => {
      console.error("getMessageForOnlineStudentError: ", error);
    });
  }
  renderMessageAttachFiles = (item, index) => {
    return (
      <View style={{marginHorizontal: 4}}>
        <Image style={{width: 30, height: 30}} source={Images.icon_pdf} />
      </View>
    )
  }

  renderMessageItem = (item, index) => {
    let ismine = false;
    if(item.Type == 1){
      ismine = true
    }

    let datetime = "";
    if(item.Date != null){
      datetime = moment(item.Date).format('HH:mm');
    }
    return (
      <View style={{marginHorizontal: 20, marginVertical: 10}}>
        <Text style={{textAlign: 'center', fontFamily: 'THSarabunNew', fontSize: 20, color: Color.n_default_orange}}>{datetime}</Text>
        <View>
          {ismine && <View style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end'}}>
            <View style={{backgroundColor: Color.n_default_orange, borderColor: Color.n_default_orange, borderWidth: 1, padding: 10, borderTopLeftRadius: 15, borderTopRightRadius: 15, borderBottomLeftRadius: 15}}>
              <Text style={{color: 'white', fontFamily: 'THSarabunNew', fontSize: 23,}}  multiline>{item.Comment}</Text>
              {item != null && item.Files.length > 0 &&
                <FlatList
                  style={{marginHorizontal: 20}}
                  data={item.Files}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item, index}) => this.renderMessageAttachFiles(item, index)}
                  horizontal
                />
              }
            </View>
          </View>}
          {!ismine && <View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-end'}}>
            <Image source={Images.man_user} style={{width: 30, height: 30, borderRadius: 15}}></Image>
            <View style={{backgroundColor: Color.white, borderColor: Color.n_default_orange, borderWidth: 1, padding: 10, borderTopLeftRadius: 15, borderTopRightRadius: 15, borderBottomRightRadius: 15, marginLeft: 10}}>
              <Text style={{color: Color.n_default_orange, fontFamily: 'THSarabunNew', fontSize: 23,}}  multiline>{item.Comment}</Text>
              {item != null && item.Files.length > 0 &&
                <FlatList
                  style={{marginHorizontal: 20}}
                  data={item.Files}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item, index}) => this.renderMessageAttachFiles(item, index)}
                  horizontal
                />
              }
            </View>
          </View>}
        </View>
      </View>
    )
  }

  back = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }
    this.props.navigation.navigate('OnlineStudentAddHomework', {forceRefresh: false});
  };

  onSubmit = () => {
    const SchoolID = this.state.userInfo.SchoolID;
    const HomeWorkID = this.state.homeworkID;
    const StudentID = this.state.userInfo.ID;
    const Link = this.state.attachlink;
    const Remark = this.state.description;
    let AttachFile = [];
    this.state.attachedFiles.forEach(item=>{
      AttachFile.push(item);
    });
    this.state.attachedImages.forEach(item=>{
      AttachFile.push(item);
    });
    const DeleteFile = [];

    console.log("HOMEWORKID: ", HomeWorkID);
    const promise = ApiManager.saveWorkForStudent(SchoolID, HomeWorkID, StudentID, Link, Remark, AttachFile, DeleteFile);
    promise.then(result => {
      if(result.statusCode == '200'){
        this.setState({ isLoading: false, showModal: true, modalBody: translang.t('COMMON_success') });
      }else{
        this.setState({ isLoading: false, showModal: true, modalBody: result.message ?? "" });
      }
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN') });
    })

    // this.props.navigation.navigate('OnlineStudent');

  };

  openFile = (item) => {
    let date = new Date();
    const url = item.FileURL;
    const fileName = "online_" + Math.floor(date.getTime() + date.getSeconds() / 2);
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

  renderAttachFile = (item, index) => {
    let image = Images.icon_pdf;

    if (item.FileName.endsWith('.pdf')) {
      image = Images.icon_pdf;
    } else if (item.FileName.endsWith('.doc') || item.FileName.endsWith('.docx')) {
      image = Images.icon_word;
    } else if (item.FileName.endsWith('.xls') || item.FileName.endsWith('.xlsx')) {
      image = Images.icon_excel;
    } else if (item.FileName.endsWith('.jpg') || item.FileName.endsWith('.png') || item.FileName.endsWith('.jpeg')) {
      image = {uri: item.FileURL};
    } else{
      image = Images.icon_pdf;
    }

    return (
      <TouchableOpacity style={{marginVertical: 10, marginRight: 10}} key={index} onPress={()=>{this.openFile(item)}} >
        <Image style={{width: 80, height: 100, resizeMode: 'contain'}} source={image} />
      </TouchableOpacity>
    )
  }

  renderAttachImages = (item, index) => {
    return (
      <TouchableOpacity style={{marginVertical: 10, marginRight: 10}} key={index} onPress={()=>{this.setState({showImages: [item], showImageView: true});}} >
        <Image style={{width: 80, height: 100, resizeMode:'contain'}} source={item} />
      </TouchableOpacity>
    )
  }

  render() {
    const {userInfo, type, homeworkData} = this.state;

    let isHomework = false
    if(type == 0){
      isHomework = true
    }

    let subject = "";
    if(homeworkData){
      subject = homeworkData.Subject;
      if(getCurrentLocale() =='en' && homeworkData.SubjectEn && homeworkData.SubjectEn.trim() != ""){
        subject = homeworkData.SubjectEn;
      }
    }

    let teacherName = "";
    if(homeworkData){
      teacherName = homeworkData.Teacher;
      if(getCurrentLocale() =='en' && homeworkData.TeacherEn && homeworkData.TeacherEn.trim() != ""){
        teacherName = homeworkData.TeacherEn;
      }
    }

    let dateschedule = "";
    if(homeworkData.DeadlineDate){
      dateschedule = moment(homeworkData.DeadlineDate).format('DD MMMM YYYY');
    }

    let profileImage = Images.student_01;
    let userName = (userInfo.sName ?? '') + ' ' + (userInfo.sLastname ?? '');

    if (userInfo !== {}) {
      if (userInfo.image !== null && userInfo.image !== '') {
        profileImage = {uri: userInfo.image};
      }
    }

    const alertImage = this.state.modalBody === translang.t('COMMON_success') ? Images.checked : Images.alert_inbox;
    const alertButtonColor = this.state.modalBody === translang.t('COMMON_success') ? [Color.n_button_gradient_green_start, Color.n_button_gradient_green_end] : [Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end];



    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={isHomework? translang.t('HOMEWORK'):  translang.t('MATERIAL')}
          onMenuTap={() => this.back()}
          // isMessage="1"
          // msgCount={10}
          // onMessageTap={() => this.clickMessageIcon()}
        />
        <View style={styles.dispcontainer}>
          <ScrollView>
          <CardInfoItem
              title = {translang.t('HEAD_TOPIC')}
              value_txt = {homeworkData.Title ?? ""}
              titleColor = {Color.n_default_orange}
              infoColor = {Color.n_default_gray}
              style={{marginVertical: 5}}
              titleFontSize={24}
              infoFontSize={24}
            />

            <CardInfoItem
              title = {translang.t('TIMETABLE_subject')}
              value_txt = {subject}
              titleColor = {Color.n_default_orange}
              infoColor = {Color.n_default_gray}
              style={{marginVertical: 5}}
              titleFontSize={24}
              infoFontSize={24}
            />
            <CardInfoItem
              title = {translang.t('BROADCAST_sender')}
              value_txt = {teacherName}
              titleColor = {Color.n_default_orange}
              infoColor = {Color.n_default_gray}
              style={{marginVertical: 5}}
              titleFontSize={24}
              infoFontSize={24}
            />

            {isHomework && <>
              <CardInfoItem
                title = {translang.t('DEADLINE_DATE')}
                value_txt = {dateschedule}
                titleColor = {Color.n_default_orange}
                infoColor = {Color.n_default_gray}
                style={{marginVertical: 5}}
                titleFontSize={24}
                infoFontSize={24}
              />
            </>}
            <View style={{marginVertical: 5}}>
              <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('HOMEWORK_description')}</Text>
              <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_gray, fontSize: 24, marginBottom: 5}}>{this.state.description ?? ''}</Text>
            </View>

            { this.state.attachedFiles.length > 0 &&
              <View>
              <View style={{marginVertical: 5}}>
                <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('HOMEWORK_attachfile')}</Text>
              </View>
                <FlatList
                  data={this.state.attachedFiles}
                  keyExtractor={(item, index) => index.toString()}
                  ItemSeparatorComponent={this.ItemSeparatorView}
                  renderItem={({item, index}) => this.renderAttachFile(item, index)}
                  horizontal
                />
              </View>
            }

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

            <View style={{marginVertical: 5}}>
              <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('ATTACH_LINK')}</Text>
              <Hyperlink  onPress={url => {
                    Linking.openURL(url)
                  }} linkDefault={false} linkStyle={ { color: "blue" } }>
                <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_gray, fontSize: 24, marginBottom: 5}}>{this.state.attachlink ?? ''}</Text>
              </Hyperlink>
            </View>

          </ScrollView>
        </View>
        <NextButton
          label={translang.t('COMMON_submit')}
          containerStyle={{width: 290, marginLeft: 'auto', marginRight: 'auto', marginBottom: 15,}}
          buttonStyle={{ borderRadius: 38, height: 75 }}
          colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
          isVerticalGradient={false}
          _onPress={() => this.onSubmit()} />
        <Modal
          animationType='fade'
          transparent={true}
          key="modal"
          visible={this.state.showMessageModal}>
          <View
            style={styles.centeredViewDlg}
            >
            <View style={styles.dialogStyle}>
              <View style={{width: '100%', height: 70, borderRadius: 20, backgroundColor: Color.n_default_brown, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity
                  style = {{justifyContent: 'center', alignItems: 'center', marginLeft: 15}}
                  onPressOut={() => { this.setState({showMessageModal: false})}}>
                  <Image source={Images.n_ic_arrow_left_white} style={{resizeMode: 'contain', width: 30, height: 20,}}/>
                </TouchableOpacity>
                <View style={{flexDirection: 'row', alignItems: 'center', alignSelf: 'center'}}>
                  <Image source={profileImage} style={styles.itemAvatar}></Image>
                  <Text style={{fontFamily: 'THSarabunNew', fontSize: 24, marginLeft: 20}}>{userName}</Text>
                </View>
                <View style = {{width: 50, height: 30}}/>
              </View>

              <FlatList
                data={this.state.messageList}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => this.renderMessageItem(item, index)}/>

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
                  onPressOut={() => this.onSendMessage()}>
                  <Image source={Images.n_ic_send_orange} style={{resizeMode: 'contain', width: 30, height: 20,}}/>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={alertImage}
          message={this.state.modalBody}
          buttonColors={alertButtonColor}
          isVerticalGradient={false}
          onClose={() => {
            if (this.state.modalBody === translang.t('COMMON_success')) {
              this.setState({ showModal: false }, ()=>{
                if(this.backhandler){
                  this.backhandler.remove();
                }
                if(this.state.isNotify){
                  this.props.navigation.navigate("App");
                }else{
                  this.props.navigation.navigate("OnlineStudentTopicList");
                }
                const parentRoute = this.props.navigation.getParam('parent') ?? 'App';


                // this.props.navigation.navigate('OnlineStudentTopicList');
              });

            } else {
              this.setState({ showModal: false });
            }
          }}
        />

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
  centeredViewDlg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
