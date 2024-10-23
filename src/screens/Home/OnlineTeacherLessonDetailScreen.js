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
import translang from '../../utils/language.utils';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import CardInfoItem from '../../components/CardInfoItem';
import ScoreInputModal from '../../components/TopupAmountModal';

import RNFS from "react-native-fs";
import FileViewer from "react-native-file-viewer";

export default class OnlineTeacherLessonDetailScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalBody: '',
      isLoading: false,

      selLesson: {},
      userInfo: {},
      lessonInfo: {},
      attachedImages: [],
      attachedFiles: [],
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

      const selLesson = this.props.navigation.getParam('selLesson');
      const userInfo = this.props.navigation.getParam('userInfo');

      this.setState({ selLesson, userInfo}, ()=>{
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

    this.props.navigation.navigate('OnlineTopicList');
  };

  loadData(){
    this.setState({isLoading: true});
    const schoolID = this.state.userInfo.SchoolID;
    const lessonID = this.state.selLesson.ID;
    ApiManager.getLessonDetail(schoolID, lessonID)
    .then(res => {
      this.setState({lessonInfo: res.data, attachedFiles: res.data.AttachFile, isLoading: false});
    }).catch(error => {
      console.log(error);
      this.setState({isLoading: false});
    });
  }

  openFile = (item) => {
    let date = new Date();
    const url = item.File;
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

  renderClassLevel = (list) => {
    const classlevelList = list;
    let res = []
    if(classlevelList.length>0){
      classlevelList.forEach((item, index)=>{
        res.push(
          <Text style={{fontFamily: 'THSarabunNew', fontSize: 24, color: Color.n_default_gray}} key={index}>{item.Name}</Text>
        );
      })
    }
    return res
  }

  renderStudentList = (list) => {
    const studentList = list;
    let res = []
    if(studentList.length>0){
      studentList.forEach((item, index)=>{
        res.push(
          <Text style={{fontFamily: 'THSarabunNew', fontSize: 24, color: Color.n_default_gray}}>{item.Name}</Text>
        );
      })
    }
    return res
  }

  render() {
    const alertImage = this.state.modalBody === translang.t('COMMON_success') ? Images.checked : Images.alert_inbox;
    const alertButtonColor = this.state.modalBody === translang.t('COMMON_success') ? [Color.n_button_gradient_green_start, Color.n_button_gradient_green_end] : [Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end];

    const {selLesson, userInfo, lessonInfo} = this.state;


    let topicName = "";
    if(selLesson.TitleName != null){
      topicName = selLesson.TitleName;
    }
    let topicGroupName = "";
    if(selLesson.GroupTitle != null && selLesson.GroupTitle != ""){
      topicGroupName = selLesson.GroupTitle;
    }
    let description = "";
    if(selLesson.Detail != null && selLesson.Detail != ""){
      description = selLesson.Detail;
    }

    let classlist = selLesson.SelectedRoom;
    let studentlist = selLesson.SelectedStudent;

    let scheduleDate = "";
    // if(selTopic.DisplayDate != null){
    //   scheduleDate = moment(selTopic.DisplayDate).format('DD MMMM YYYY');
    // }

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('CHECKING_HOMEWORK')}
          onMenuTap={() => this.back()}/>

        <View style={styles.dispcontainer}>
          <ScrollView>
            <View style={{flexDirection: 'column', marginVertical: 5}}>
              <Text style={{flex: 1, fontFamily: 'THSarabunNew', fontSize: 30, fontWeight: 'bold', color: Color.n_default_orange}}>{topicName}</Text>
              <Text style={{flex: 1,fontFamily: 'THSarabunNew', fontSize: 24, color: Color.n_default_orange}}>{topicGroupName}</Text>
            </View>

            {selLesson.AssignType == "1" &&
            <View style={{flexDirection: 'row', marginVertical: 5}}>
              <Text style={{flex: 1, fontFamily: 'THSarabunNew', fontSize: 24, fontWeight: 'bold', color: Color.n_default_orange}}>{translang.t('BEHAVIOR_class')}</Text>
              <View style={{flex: 1,}}>{this.renderClassLevel(classlist)}</View>
            </View>}
            {selLesson.AssignType == "2" &&
            <View style={{flexDirection: 'row', marginVertical: 5}}>
              <Text style={{flex: 1, fontFamily: 'THSarabunNew', fontSize: 24, fontWeight: 'bold', color: Color.n_default_orange}}>{translang.t('LIST')}</Text>
              <View style={{flex: 1,}}>{this.renderStudentList(studentlist)}</View>
            </View>}

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
          </ScrollView>
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
              // this.props.navigation.navigate('OnlineTeacher');
            } else {
              this.setState({ showModal: false });
            }
          }}
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
