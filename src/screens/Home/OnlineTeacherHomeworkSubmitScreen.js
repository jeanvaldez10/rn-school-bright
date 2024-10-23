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
import RNFS from 'react-native-fs';
import ImageView from "react-native-image-viewing";
import MyImageView from "../../components/MyImageView";


export default class OnlineTeacherHomeworkSubmitScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalBody: '',
      isLoading: false,
      type: '',
      assignment: '',
      material: '',
      description: '',
      attachlink: '',
      attachedFiles: [],
      attachedImages: [],
      showAttachImages:[],
      addedAttachFiles: [],
      addedAttachImages: [],

      selectedTopic: {},
      score: 0,
      selectedIndividual: {},
      classlevelList: [],
      studentList: [],
      dateschedule: '',
      deliveryTimeType: {},
      deliveryDate: '',
      deliveryTime: '',
      userInfo: {},
      selSubject: {},
      selLesson: {},

      showImageView: false,
      selImageIndex: 0,

      homeworkid: "",
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

      console.log("OnlineTeacherHomeworkSubmitScreen");
      const type = this.props.navigation.getParam('type');
      const assignment = this.props.navigation.getParam('assignment');
      const material = this.props.navigation.getParam('material');
      const description = this.props.navigation.getParam('description');
      const attachlink = this.props.navigation.getParam('attachlink');
      const attachedFiles = this.props.navigation.getParam('attachedFiles');
      const attachedImages = this.props.navigation.getParam('attachedImages');
      const addedAttachFiles = this.props.navigation.getParam('addedAttachFiles');
      const addedAttachImages = this.props.navigation.getParam('addedAttachImages');
      const showAttachImages = this.props.navigation.getParam('showAttachImages');
      const selectedTopic = this.props.navigation.getParam('selectedTopic');
      const score = this.props.navigation.getParam('score');
      const selectedIndividual = this.props.navigation.getParam('selectedIndividual');
      const classlevelList = this.props.navigation.getParam('classlevelList');
      const studentList = this.props.navigation.getParam('studentList');
      const dateschedule = this.props.navigation.getParam('dateschedule');
      const deliveryTimeType = this.props.navigation.getParam('deliveryTimeType');
      const deliveryDate = this.props.navigation.getParam('deliveryDate');
      const deliveryTime = this.props.navigation.getParam('deliveryTime');
      const userInfo = this.props.navigation.getParam('userInfo');
      const selSubject = this.props.navigation.getParam('selSubject');
      const selLesson = this.props.navigation.getParam('selLesson');

      const homeworkid = this.props.navigation.getParam('homeworkid');

      this.setState({ homeworkid, type, assignment, material, description, attachlink, attachedFiles, attachedImages, showAttachImages, addedAttachFiles, addedAttachImages, selectedTopic, score, selectedIndividual, classlevelList, studentList, dateschedule, deliveryTimeType, deliveryDate, deliveryTime, userInfo, selSubject, selLesson });
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

    this.props.navigation.navigate(this.props.navigation.getParam('parent') ?? 'App', {forceRefresh: false});
    // this.props.navigation.navigate('OnlineAddHomework');
  };

  onSubmit = () => {
    if(this.state.type == "homework"){
      const GroupID = this.state.selectedTopic.Id;
      const HomeworkID = this.state.homeworkid;
      const PlaneID = this.state.selSubject.PlaneID;
      const TitleName = this.state.assignment;
      const Detail = this.state.description;
      const Link = this.state.attachlink;
      const DeadlineDate = this.state.dateschedule;
      const MaxScore = this.state.score;
      const TeacherID = this.state.userInfo.ID;
      const SchoolID = this.state.userInfo.SchoolID;
      const AssignType = this.state.selectedIndividual.value;
      const DisplayType = this.state.deliveryTimeType;
      const DisplayDate = DisplayType=="1" ? moment().format('YYYY-MM-DD') + "T" + moment().format('HH:mm') : moment(this.state.deliveryDate).format('YYYY-MM-DD') + "T" + moment(this.state.deliveryTime).format('HH:mm');
      let SelectedRoom = [];
      let SelectedStudent = [];


      const tempClass = this.state.classlevelList.filter(item=>item.select);
      tempClass.forEach((item, index)=>{
        if(item.Id.nTermSubLevel2){
          SelectedRoom.push(item.Id.nTermSubLevel2);
        }
      })
      const tempStudents = this.state.studentList.filter(item=>item.select);
      tempStudents.forEach((item, index)=>{
        SelectedStudent.push(item.Id);
      })

      let AttachFile = [];
      // this.state.addedAttachFiles.forEach(item=>{
      //   AttachFile.push(item);
      // });
      // this.state.addedAttachImages.forEach(item=>{
      //   AttachFile.push(item);
      // });

      this.state.attachedFiles.forEach(item=>{
        AttachFile.push(item);
      });
      this.state.attachedImages.forEach(item=>{
        AttachFile.push(item);
      });


      const promise = ApiManager.createOnlineHomework(GroupID, HomeworkID, PlaneID, TitleName, Detail, Link, DeadlineDate, MaxScore, TeacherID, SchoolID, SelectedRoom, SelectedStudent, DisplayType, AssignType, DisplayDate, AttachFile);
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
    }else if(this.state.type == "material"){

      const GroupID = this.state.selectedTopic.Id;
      const LessonID = this.state.homeworkid;
      const PlaneID = this.state.selSubject.PlaneID;
      const TitleName = this.state.material;
      const Detail = this.state.description;
      const Link = this.state.attachlink;
      const TeacherID = this.state.userInfo.ID;
      const SchoolID = this.state.userInfo.SchoolID;
      const DisplayType = this.state.deliveryTimeType;
      const AssignType = this.state.selectedIndividual.value;
      const DisplayDate = DisplayType=="1" ? moment().format('YYYY-MM-DD') + "T" + moment().format('HH:mm') : moment(this.state.deliveryDate).format('YYYY-MM-DD') + "T" + moment(this.state.deliveryTime).format('HH:mm');
      let SelectedRoom = [];
      let SelectedStudent = [];
      const tempClass = this.state.classlevelList.filter(item=>item.select);
      tempClass.forEach((item, index)=>{
        if(item.Id.nTermSubLevel2){
          SelectedRoom.push(item.Id.nTermSubLevel2);
        }
      })
      const tempStudents = this.state.studentList.filter(item=>item.select);
      tempStudents.forEach((item, index)=>{
        SelectedStudent.push(item.Id);
      })

      let AttachFile = [];
      this.state.attachedFiles.forEach(item=>{
        AttachFile.push(item);
      });
      this.state.attachedImages.forEach(item=>{
        AttachFile.push(item);
      });

      const promise = ApiManager.createOnlineLesson(GroupID, LessonID, PlaneID, TitleName, Detail, Link, TeacherID, SchoolID, SelectedRoom, SelectedStudent, DisplayType, AssignType, DisplayDate, AttachFile);
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
    }
  };

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
    }

    return (
      <View style={{marginHorizontal: 4}}>
        <Image style={{width: 80, height: 80}} source={image} />
      </View>
    )
  }

  renderAttachImages = (item, index) => {
    return (
      <TouchableOpacity style={{marginRight: 5}} key={index} onPress={()=>this.setState({showImageView: true, selImageIndex: index})} >
        <Image style={{width: 80, height: 100}} source={{uri: item.uri}} />
      </TouchableOpacity>
    )
  }

  renderClassLevel = () => {
    const classlevelList = this.state.classlevelList.filter(item=>item.select===true);
    let res = []
    if(classlevelList.length>0){
      classlevelList.forEach((item, index)=>{
        let className = item.Name;
        if(getCurrentLocale() == 'en' && item.NameEn && item.NameEn != ""){
          className = item.NameEn;
        }
        res.push(
          <Text style={{fontFamily: 'THSarabunNew', fontSize: 24, color: Color.n_default_gray}} key={index}>{className}</Text>
        );
      })
    }
    return res
  }

  renderStudentList = () => {
    const studentList = this.state.studentList.filter(item=>item.select===true);
    let res = []
    if(studentList.length>0){
      studentList.forEach((item, index)=>{
        let studentName = item.Name;
        if(getCurrentLocale() == 'en' && item.NameEn && item.NameEn != ""){
          studentName = item.NameEn;
        }
        res.push(
          <Text style={{fontFamily: 'THSarabunNew', fontSize: 24, color: Color.n_default_gray}} key={index}>{studentName}</Text>
        );
      })
    }
    return res
  }

  render() {
    let isHomework = false
    if(this.state.type == "homework"){
      isHomework = true
    }

    const headtopic = this.state.selectedTopic ? this.state.selectedTopic.Text : '';
    const deliveryformat = this.state.selectedIndividual ? this.state.selectedIndividual.title : '_';

    let subject = this.state.selSubject ? this.state.selSubject.PlaneName : "";
    if(getCurrentLocale() == 'en' && this.state.selSubject && this.state.selSubject.PlaneNameEn && this.state.selSubject.PlaneNameEn != ""){
      subject = this.state.selSubject.PlaneNameEn;
    }

    let sendername = (this.state.userInfo.sName ?? '') + ' ' + (this.state.userInfo.sLastname ?? '');
    if(getCurrentLocale() == 'en' && this.state.userInfo && this.state.userInfo.NameEn && this.state.userInfo.NameEn != ""){
      sendername = this.state.userInfo.NameEn + " " + this.state.userInfo.LastNameEN;
    }


    let isClassLevel = false
    if(this.state.selectedIndividual.value == 1){
      isClassLevel = true
    }

    const dateschedule = moment(this.state.dateschedule).format('DD/MM/YYYY');

    let dispalyDate = "";
    if(this.state.deliveryTimeType == 2){
      dispalyDate = moment(this.state.deliveryDate).format('DD/MM/YYYY') + " " + moment(this.state.deliveryTime).format('HH:mm');
    }else{
      dispalyDate = translang.t('BROADCAST_send_now');
    }

    const description = this.state.description;
    const attachLink = this.state.attachlink;

    const alertImage = this.state.modalBody === translang.t('COMMON_success') ? Images.checked : Images.alert_inbox;
    const alertButtonColor = this.state.modalBody === translang.t('COMMON_success') ? [Color.n_button_gradient_green_start, Color.n_button_gradient_green_end] : [Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end];

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={isHomework? translang.t('HOMEWORK'):  translang.t('MATERIAL')}
          onMenuTap={() => this.back()}
        />
        <View style={styles.dispcontainer}>
          <ScrollView>
            <CardInfoItem
              title = {translang.t('HEAD_TOPIC')}
              value_txt = {headtopic}
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
              value_txt = {sendername}
              titleColor = {Color.n_default_orange}
              infoColor = {Color.n_default_gray}
              style={{marginVertical: 5}}
              titleFontSize={24}
              infoFontSize={24}
            />
            <CardInfoItem
              title = {translang.t('REPORT_delivery_format')}
              value_txt = {deliveryformat}
              titleColor = {Color.n_default_orange}
              infoColor = {Color.n_default_gray}
              style={{marginVertical: 5}}
              titleFontSize={24}
              infoFontSize={24}
            />

            {isClassLevel && <View style={{flexDirection: 'row', marginVertical: 5}}>
              <Text style={{flex: 1, fontFamily: 'THSarabunNew', fontSize: 24, fontWeight: 'bold', color: Color.n_default_orange}}>{translang.t('BEHAVIOR_class')}</Text>
              <View style={{flex: 1,}}>{this.renderClassLevel()}</View>
            </View>}
            {!isClassLevel && <View style={{flexDirection: 'row', marginVertical: 5}}>
              <Text style={{flex: 1, fontFamily: 'THSarabunNew', fontSize: 24, fontWeight: 'bold', color: Color.n_default_orange}}>{translang.t('LIST')}</Text>
              <View style={{flex: 1,}}>{this.renderStudentList()}</View>
            </View>}
            {isHomework &&
            <CardInfoItem
              title = {translang.t('DEADLINE_DATE')}
              value_txt = {dateschedule}
              titleColor = {Color.n_default_orange}
              infoColor = {Color.n_default_gray}
              style={{marginVertical: 5}}
              titleFontSize={24}
              infoFontSize={24}
            />}

            <CardInfoItem
              title = {translang.t('HOMEWORK_DISPLAY_DATE')}
              value_txt = {dispalyDate}
              titleColor = {Color.n_default_orange}
              infoColor = {Color.n_default_gray}
              style={{marginVertical: 5}}
              titleFontSize={24}
              infoFontSize={24}
            />

            <View style={{marginVertical: 5}}>
              <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('HOMEWORK_description')}</Text>
              <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_gray, fontSize: 24, marginBottom: 5}}>{description}</Text>
            </View>

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
              <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_gray, fontSize: 24, marginBottom: 5}}>{attachLink}</Text>
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

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={alertImage}
          message={this.state.modalBody}
          buttonColors={alertButtonColor}
          isVerticalGradient={false}
          onClose={() => {
            if (this.state.modalBody === translang.t('COMMON_success')) {
              this.setState({ showModal: false }, ()=>{
                // this.props.navigation.navigate('App');
                this.props.navigation.navigate('OnlineTopicList');
              });
            } else {
              this.setState({ showModal: false });
            }
          }}
        />

        <MyImageView
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
  }
});
