import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, FlatList, ScrollView, Modal, TextInput } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import NextButton from '../../components/NextButton';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import Images from '../../themes/Images';
import translang from '../../utils/language.utils';
import CustomTextInput from '../../components/CustomTextInput';
import _ from 'lodash';
import DocumentPicker from 'react-native-document-picker';
import * as ImagePicker from 'react-native-image-picker';
import ApiManager from '../../managers/ApiManager';
import moment from 'moment';
import ProgressHud from '../../components/ProgressHud';

export default class OnlineStudentAddHomeworkScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showModal: false,
      modalBody: "",

      type: '',
      userInfo: {},
      homeworkID: "",
      
      remark: '',
      attachlink: '',
      attachedFiles: [],
      attachedImages: [],
      showAttachImages: [],

      messageList: [],
      showMessageModal: false,
      sendMessage: "",

      homeworkData: {},
      isNotify: false
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
      const userInfo = this.props.navigation.getParam('userInfo');
      const homeworkID = this.props.navigation.getParam('homeworkID');
      const homeworkData = this.props.navigation.getParam('homeworkData');
      const isNotify = this.props.navigation.getParam('isNotify');

      const forceRefresh = this.props.navigation.getParam('forceRefresh') ?? false;

      if (forceRefresh){
        this.setState({
          type: type, 
          userInfo: userInfo, 
          homeworkID: homeworkID, 
          homeworkData: homeworkData, 
          remark: '',
          attachlink: '',
          attachedFiles: [],
          attachedImages: [],
          showAttachImages: [],
          isNotify: isNotify,
        }, ()=>{
          this.loadStudentWork();
        });
      }
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
    if(this.state.isNotify){
      this.props.navigation.navigate('OnlineStudentHomeworkDetailForNotification');
    }else{
      this.props.navigation.navigate('OnlineStudentHomeworkDetail');
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

  loadStudentWork = () => {
    const schoolid = this.state.userInfo.SchoolID;
    const studentid = this.state.userInfo.ID;
    const workId = this.state.homeworkID;

    this.setState({isLoading: true})
    ApiManager.getOnlineStudentWorks(schoolid, studentid, workId).then(data => {
      const remark = data.Remark ?? "";
      const linkurl = data.LinkUrl ?? "";
      let attachedFiles = [];
      let attachedImages = [];
      let showAttachImages = [];

      if(data.Attach.length > 0){
        const tmp_Files = data.Attach.filter(item=>!item.ContentType.includes('image'));
        const tmp_Images = data.Attach.filter(item=>item.TitleFilee.endsWith('.doc'));

        data.Attach.forEach(item=>{
          console.log(item)
          if(item.TitleFile.endsWith('jpg') || item.TitleFile.endsWith('png') || item.TitleFile.endsWith('jpeg')){
            attachedImages.push({FileType: item.ContentType ?? "", FileURL: item.LinkFile});
            showAttachImages.push({uri: item.LinkFile});
          }else{
            attachedFiles.push({FileType: item.ContentType ?? "", FileURL: item.LinkFile});
          }
        });
      }
      this.setState({remark: remark, attachlink: linkurl, attachedFiles: attachedFiles, attachedImages: attachedImages, showAttachImages: showAttachImages, isLoading: false});
    }).catch(error => {
      console.error("getOnlineStudentWorksError: ", error);
      this.setState({ isLoading: false});
    });
  }

  __next = async () => {
    if(this.state.remark == ""){
      this.setState({showModal: true, modalBody: translang.t('INPUT_DESCRIPTION')});
      return;
    }

    const params = {
      type: this.state.type,
      description: this.state.remark,
      homeworkData: this.state.homeworkData,
      attachlink: this.state.attachlink,
      attachedFiles: this.state.attachedFiles,
      attachedImages: this.state.attachedImages,
      showAttachImages: this.state.showAttachImages,
      userInfo: this.state.userInfo,
      homeworkID: this.state.homeworkID,
      isNotify: this.state.isNotify,
    }
    this.props.navigation.navigate('OnlineStudentHomeworkSubmit', params);
  };

  onChooseFile = async () => {
    try {
      const results = await DocumentPicker.pickMultiple({
        type: [DocumentPicker.types.doc, DocumentPicker.types.docx, DocumentPicker.types.xls, DocumentPicker.types.xlsx, DocumentPicker.types.pdf]
      });
      let requestCnt = 0;
      let uris = this.state.attachedFiles;
      if(uris.length + results.length > 10){
        this.setState({ showModal: true, modalBody: translang.t('CANTSELECT_LIMIT') });
        return;
      }
      this.setState({isLoading: true});
      results.forEach(item=>{
        if(item.size > 25000000){
          this.setState({ showModal: true, modalBody: translang.t('OVERSIZE_ALERT'), isLoading: false });
          return;
        }
        ApiManager.uploadFile("onlineclassroom", this.state.userInfo.SchoolID, item).then(data => {
          uris.push({FileName: data[0].FileName, FileType: data[0].FileType, FileURL: data[0].FileURL});
          requestCnt = requestCnt + 1;
          if(requestCnt == results.length){
            this.setState({isLoading: false, attachedFiles: uris});
          }
        }).catch(error => {
          console.log("uploadFile", error);
          this.setState({isLoading: false});
        });
      });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {

      } else {

      }
    }
  }

  onChooseImage = () => {
    const options = {
      mediaType: 'photo',
      selectionLimit: 0,
    }

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.assets) {
        let requestCnt = 0;
        let uris = this.state.attachedImages;
        let showUris = this.state.showAttachImages;
        
        if(uris.length + response.assets.length > 10){
          this.setState({ showModal: true, modalBody: translang.t('CANTSELECT_LIMIT') });
          return;
        }
        this.setState({isLoading: true});
        response.assets.forEach(item=>{
          if(item.fileSize > 25000000){
            this.setState({ showModal: true, modalBody: translang.t('OVERSIZE_ALERT'), isLoading: false });
            return;
          }
          
          ApiManager.uploadImage("onlineclassroom", this.state.userInfo.SchoolID, item).then(data => {
            uris.push({FileName: data[0].FileName, FileType: data[0].FileType, FileURL: data[0].FileURL});
            showUris.push({uri: data[0].FileURL});
            requestCnt = requestCnt + 1;
            if(requestCnt == response.assets.length){
              this.setState({isLoading: false, attachedImages: uris, showAttachImages: showUris});
            }
          }).catch(error => {
            console.log("uploadImage", error);
            this.setState({isLoading: false});
          });
        });
      }
    });
  }

  renderAttachFile = (item, index) => {
    let image = Images.icon_pdf;
    if (item.FileURL.endsWith('.pdf')) {
      image = Images.icon_pdf;
    } else if (item.FileURL.endsWith('.doc') || item.FileURL.endsWith('.docx')) {
      image = Images.icon_word;
    } else if (item.FileURL.endsWith('.xls') || item.FileURL.endsWith('.xlsx')) {
      image = Images.icon_excel;
    }  else if (item.FileURL.endsWith('.ppt') || item.FileURL.endsWith('.pptx')) {
      image = Images.icon_ppt;
    }else{
      image = Images.icon_pdf;
    }

    return (
      <View style={{position: 'relative', marginVertical: 10, marginRight: 10}}>
        <Image style={{width: 50, height: 50}} source={image} />
        <TouchableOpacity style={{position: 'absolute', top: -10, right: -10}} onPress={()=> this.setState({attachedFiles: this.state.attachedFiles.filter((item, idex)=> idex != index)})} >
          <Image source={Images.n_close_circle} style={{width: 20, height: 20, resizeMode: 'contain'}}/>
        </TouchableOpacity>
      </View>
    )
  }

  renderAttachImages = (item, index) => {
    return (
      <TouchableOpacity style={{position: 'relative', marginVertical: 10, marginRight: 10}} key={index} onPress={()=>this.setState({showImageView: true, selImageIndex: index})} >
        <Image style={{width: 50, height: 70}} source={item} />
        <TouchableOpacity style={{position: 'absolute', top: -10, right: -10}} onPress={()=> this.setState({attachedImages: this.state.attachedImages.filter((item, idex)=> idex != index), showAttachImages: this.state.showAttachImages.filter((item, idex)=> idex != index)})} >
          <Image source={Images.n_close_circle} style={{width: 20, height: 20, resizeMode: 'contain'}}/>
        </TouchableOpacity>
      </TouchableOpacity>

      
    )
  }

  render() {
    let isHomework = false
    if(this.state.type == 0)
      isHomework = true;

    let profileImage = Images.student_01;
    let userName = (this.state.userInfo.sName ?? '') + ' ' + (this.state.userInfo.sLastname ?? '');

    if (this.state.userInfo !== {}) {
      if (this.state.userInfo.image !== null && this.state.userInfo.image !== '') {
        profileImage = {uri: this.state.userInfo.image};
      }
    }
    
    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={isHomework ? translang.t('HOMEWORK'):translang.t('MATERIAL')}
          onMenuTap={() => this.back()}
          // isMessage="1"
          // msgCount={10}
          // onMessageTap={() => this.clickMessageIcon()}
        />
        <ScrollView style={styles.list}>
          <View style={styles.dispcontainer}>
            <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('HOMEWORK_DETAILS')}</Text>
            <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_gray, fontSize: 24, marginBottom: 5}}>{this.state.homeworkData.Description ?? ''}</Text>
          </View>
          
          <View style={{...styles.listItem, flexDirection: 'column', alignItems: 'flex-start'}}>
            <View style={{flex: 1, flexDirection: 'row'}}>
              <Text style={styles.itemTitle}>{translang.t('HOMEWORK_description1')}</Text>
            </View>
            <CustomTextInput
              inputStyle={{
                borderWidth: 0,
                borderColor: Color.n_default_brown,
                borderBottomWidth: 1,
                fontSize: 20,
              }}
              inputWrapperStyle={{
                marginBottom: 10,
                marginTop: 10,
                width: '100%',
              }}
              value={this.state.remark}
              placeholder={translang.t('HOMEWORK_fill_in_the_detail')}
              placeholderTextColor={Color.n_text_placeholder_gray}
              onChangeText={text => this.setState({ remark: text })}
            />
          </View>

          <View style={{...styles.listItem, flexDirection: 'column', alignItems: 'flex-start'}}>
            <View style={{flex: 1, flexDirection: 'row'}}>
              <Text style={styles.itemTitle}>{translang.t('ATTACH_LINK')}</Text>
            </View>
            <CustomTextInput
              inputStyle={{
                borderWidth: 0,
                borderColor: Color.n_default_brown,
                borderBottomWidth: 1,
                fontSize: 20,
              }}
              inputWrapperStyle={{
                marginBottom: 10,
                marginTop: 10,
                width: '100%',
              }}
              value={this.state.attachlink}
              placeholder={translang.t('ATTACH_LINK')}
              placeholderTextColor={Color.n_text_placeholder_gray}
              onChangeText={text => this.setState({ attachlink: text })}
            />
          </View>
          
          <View style={{...styles.listItem, flexDirection: 'column', alignItems: 'flex-start'}}>
            <View style={{flex: 1, flexDirection: 'row'}}>
              <Text style={styles.itemTitle}>{translang.t('HOMEWORK_attachfile')}</Text>
            </View>
            <TouchableOpacity style={styles.chooseFileContainer} onPress={() => this.onChooseFile()}>
              <Text style={styles.chooseFile}>{translang.t('CHOOSE_FILE')}</Text>
            </TouchableOpacity>
            <FlatList 
              data={this.state.attachedFiles}
              keyExtractor={(item, index) => index.toString()}
              ItemSeparatorComponent={this.ItemSeparatorView}
              renderItem={({item, index}) => this.renderAttachFile(item, index)}
              horizontal
            />
            <Text style={{color: Color.n_default_orange, fontFamily: 'THSarabunNew', fontSize: 18, fontWeight: 'bold',}}>{translang.t("FileSizeDes")}</Text>
          </View>

          <View style={{...styles.listItem, flexDirection: 'column', alignItems: 'flex-start'}}>
            <View style={{flex: 1, flexDirection: 'row'}}>
              <Text style={styles.itemTitle}>{translang.t('HOMEWORK_attachimg')}</Text>
            </View>
            <TouchableOpacity style={styles.chooseImageContainer} onPress={() => this.onChooseImage()}>
              <Text style={styles.chooseImage}>{translang.t('CHOOSE_IMAGE')}</Text>
            </TouchableOpacity>

            <FlatList 
              data={this.state.showAttachImages}
              keyExtractor={(item, index) => index.toString()}
              ItemSeparatorComponent={this.ItemSeparatorView}
              renderItem={({item, index}) => this.renderAttachImages(item, index)}
              horizontal
            />
            <Text style={{color: Color.n_default_orange, fontFamily: 'THSarabunNew', fontSize: 18, fontWeight: 'bold',}}>{translang.t("FileSizeDes")}</Text>
          </View>

          <NextButton
            label={translang.t('COMMON_next')}
            containerStyle={{ width: 290, marginLeft: 'auto', marginRight: 'auto', marginBottom: 25, marginTop: 20}}
            buttonStyle={{ borderRadius: 38, height: 75 }}
            colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
            isVerticalGradient={false}
            _onPress={() => this.__next()} />
        </ScrollView>
        
        <Modal
          animationType='fade'
          transparent={true}
          key="modal"
          visible={this.state.showMessageModal}>
          <View style={styles.centeredViewDlg}>
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
          image={Images.n_ic_warning}
          message={this.state.modalBody}
          buttonColors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
          isVerticalGradient={false}
          onClose={() => { this.setState({ showModal: false }) }}
        />

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
  title: {
    fontSize: 16,
    fontWeight: '300',
  },
  list: {
    flex: 1,
    padding: 20,
  },
  listItem: {
    marginVertical: 4,
  },
  itemTitle: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    color: Color.n_default_orange
  },

  buttonStyle: {
    width: '100%',
    height: 60,
    borderRadius: 5,
    backgroundColor: Color.green_button_next_color1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  chooseFile: {
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    fontWeight: 'bold',
    color: Color.white,
    textAlign: 'center',
    alignSelf: 'center',
  },
  chooseFileContainer: {
    width: 140, 
    height: 45, 
    borderRadius: 23,
    backgroundColor: Color.n_default_brown, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginVertical: 10
  },
  chooseImage: {
    fontSize: 13,
    fontWeight: '600',
    color: Color.white,
    textAlign: 'center',
    alignSelf: 'center',
  },
  chooseImageContainer: {
    width: 140, 
    height: 45, 
    borderRadius: 23,
    backgroundColor: Color.n_default_orange, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginVertical: 10
  },

  dispcontainer: {
    marginVertical: 20,
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
