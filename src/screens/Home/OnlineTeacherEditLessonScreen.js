import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, FlatList, ScrollView, } from 'react-native';
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
import ImageView from "react-native-image-viewing";
import ProgressHud from '../../components/ProgressHud';
import ApiManager from '../../managers/ApiManager';
import moment from 'moment';

export default class OnlineTeacherEditLessonScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      forceRefresh: true,

      type: '',   //material    homework
      selId: "",
      userInfo: {},
      selSubject: {},
      selLesson: {},

      assignment: '',
      material: '',
      description: '',
      attachlink: '',

      selectedTopic: {},
      score : "",
      selectedIndividual: {},
      classlevelList: [],
      studentList: [],
      dateschedule: "",
      deliveryTimeType: "1",
      deliveryDate: "",
      deliveryTime: "",

      attachedFiles: [],
      attachedImages: [],
      showAttachImages: [],

      addedAttachFiles: [],
      addedAttachImages: [],

      showModal: false,
      modalBody: "",

      showImageView: false,
      selImageIndex: 0,

      isLoading: false,
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

      console.log("OnlineTeacherEditLessonScreen");
      const userInfo = this.props.navigation.getParam('userInfo');
      const selSubject = this.props.navigation.getParam('selSubject');
      const selLesson = this.props.navigation.getParam('selLesson');
      const type = this.props.navigation.getParam('type');
      const selId = this.props.navigation.getParam('ID');
      const forceRefresh = this.props.navigation.getParam('forceRefresh') ?? true;

      if(forceRefresh){
        this.setState({ userInfo: userInfo, forceRefresh: forceRefresh, selSubject: selSubject, selLesson: selLesson, type: type, selId: selId}, ()=>{
          if(type == "homework"){
            this.loadHomework();
          }else if(type == "material"){
            this.loadMaterial();
          }
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

    this.props.navigation.navigate("OnlineTopicList");
  };

  loadHomework = ()=>{
    this.setState({isLoading: true});
    const schoolID = this.state.userInfo.SchoolID;
    const homeworkId = this.state.selId;
    ApiManager.OnlineGetHomework(schoolID, homeworkId).then(data => {
      const res = data.data;

      const assignment = res.TitleName ?? "";
      const material = "";
      const description = res.Detail;
      const attachlink = res.Link;
      let attachedFiles = [];
      let attachedImages = [];
      let showAttachImages = [];
      if(res.AttachFile.length > 0){
        const tmp_Files = res.AttachFile.filter(item=>!item.ContentType.includes('image'));
        const tmp_Images = res.AttachFile.filter(item=>item.ContentType.includes('image'));

        if(tmp_Files && tmp_Files.length > 0){
          attachedFiles = tmp_Files.map(item=>{
            return {FileType: item.ContentType, FileURL: item.File}
          });
        }

        if(tmp_Images && tmp_Images.length > 0){
          attachedImages = tmp_Images.map(item=>{
            return {FileType: item.ContentType, FileURL: item.File}
          });

          showAttachImages = tmp_Images.map(item=>{
            return {uri: item.File}
          });
        }
      }
      const selectedTopic = {Id: res.Group.Id ?? "", Text: res.Group.Name ?? ""};
      const score = res.MaxScore ?? "";

      let selectedIndividual = {};
      if(res.AssignType == "1"){
        selectedIndividual = {title: translang.t('HOMEWORK_classlevel'), value: 1};
      }else if(res.AssignType == "2"){
        selectedIndividual = {title: translang.t('INDIVIDUAL'), value: 2};
      }

      let classlevelList = [];
      let studentList = [];
      if(res.SelectedRoom.length > 0){
        classlevelList = res.SelectedRoom.map(item=>{
          return {RoomID: item.Id, Name: item.Name, NameEn: item.NameEn}
        })
      }
      if(res.SelectedStudent.length > 0){
        studentList = res.SelectedStudent;
      }

      const dateschedule = moment(res.DeadlineDate).format('YYYY-MM-DD');
      let deliveryTimeType = res.DisplayType;
      const deliveryDate = moment(res.DisplayDate).format('YYYY-MM-DD');
      const deliveryTime = moment(res.DisplayDate).format('YYYY-MM-DDTHH:mm');

      this.setState({
        assignment: assignment,
        material: material,
        description: description,
        attachlink: attachlink,
        attachedFiles: attachedFiles,
        attachedImages: attachedImages,
        showAttachImages: showAttachImages,
        selectedTopic: selectedTopic,
        score: score,
        selectedIndividual: selectedIndividual,
        classlevelList: classlevelList,
        studentList: studentList,
        dateschedule: dateschedule,
        deliveryTimeType: deliveryTimeType,
        deliveryDate: deliveryDate,
        deliveryTime: deliveryTime,
        isLoading: false,
      });
    }).catch(error => {
      console.error("OnlineHomeworkList: ", error);
      this.setState({ isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN') });
    });
  }

  loadMaterial = ()=>{
    this.setState({isLoading: true});

    const schoolID = this.state.userInfo.SchoolID;
    const lessonID = this.state.selId;
    ApiManager.getLessonDetail(schoolID, lessonID).then(data => {
      const res = data.data;

      const assignment = "";
      const material = res.TitleName ?? "";
      const description = res.Detail;
      const attachlink = res.Link;
      let attachedFiles = [];
      let attachedImages = [];
      let showAttachImages = [];
      if(res.AttachFile.length > 0){
        const tmp_Files = res.AttachFile.filter(item=>!item.ContentType.includes('image'));
        const tmp_Images = res.AttachFile.filter(item=>item.ContentType.includes('image'));

        if(tmp_Files && tmp_Files.length > 0){
          attachedFiles = tmp_Files.map(item=>{
            return {FileType: item.ContentType, FileURL: item.File}
          });
        }

        if(tmp_Images && tmp_Images.length > 0){
          attachedImages = tmp_Images.map(item=>{
            return {FileType: item.ContentType, FileURL: item.File}
          });

          showAttachImages = tmp_Images.map(item=>{
            return {uri: item.File}
          });
        }
      }
      const selectedTopic = {Id: res.Group.Id ?? "", Text: res.Group.Name ?? ""};
      const score = res.MaxScore ?? "";

      let selectedIndividual = {};
      if(res.AssignType == "1"){
        selectedIndividual = {title: translang.t('HOMEWORK_classlevel'), value: 1};
      }else if(res.AssignType == "2"){
        selectedIndividual = {title: translang.t('INDIVIDUAL'), value: 2};
      }

      let classlevelList = [];
      let studentList = [];
      if(res.SelectedRoom.length > 0){
        classlevelList = res.SelectedRoom.map(item=>{
          return {RoomID: item.Id, Name: item.Name, NameEn: item.NameEn}
        })
      }
      if(res.SelectedStudent.length > 0){
        studentList = res.SelectedStudent;
      }

      const dateschedule = moment(res.DeadlineDate).format('YYYY-MM-DD');
      let deliveryTimeType = res.DisplayType;
      const deliveryDate = moment(res.DisplayDate).format('YYYY-MM-DD');
      const deliveryTime = moment(res.DisplayDate).format('YYYY-MM-DDTHH:mm');

      this.setState({
        assignment: assignment,
        material: material,
        description: description,
        attachlink: attachlink,
        attachedFiles: attachedFiles,
        attachedImages: attachedImages,
        showAttachImages: showAttachImages,
        selectedTopic: selectedTopic,
        score: score,
        selectedIndividual: selectedIndividual,
        classlevelList: classlevelList,
        studentList: studentList,
        dateschedule: dateschedule,
        deliveryTimeType: deliveryTimeType,
        deliveryDate: deliveryDate,
        deliveryTime: deliveryTime,
        isLoading: false,
      });
    }).catch(error => {
      console.error("OnlineMaterialList: ", error);
      this.setState({ isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN') });
    });
  }

  __next = async () => {
    if(this.state.type == "homework"){
      if(this.state.assignment == ""){
        this.setState({showModal: true, modalBody: translang.t('INPUT_ASSIGNMENT')});
        return;
      }
    }else if(this.state.type == "material"){
      if(this.state.material == ""){
        this.setState({showModal: true, modalBody: translang.t('INPUT_MATERIAL')});
        return;
      }
    }

    if(this.state.description == ""){
      this.setState({showModal: true, modalBody: translang.t('INPUT_DESCRIPTION')});
      return;
    }

    const params = {
      userInfo: this.state.userInfo,
      selSubject: this.state.selSubject,
      selLesson: this.state.selLesson,
      type: this.state.type,
      assignment: this.state.assignment,
      material: this.state.material,
      description: this.state.description,
      attachlink: this.state.attachlink,
      attachedFiles: this.state.attachedFiles,
      attachedImages: this.state.attachedImages,
      addedAttachFiles: this.state.addedAttachFiles,
      addedAttachImages: this.state.addedAttachImages,

      showAttachImages: this.state.showAttachImages,
      selectedTopic: this.state.selectedTopic,
      score: this.state.score,
      selectedIndividual: this.state.selectedIndividual,
      classlevelList: this.state.classlevelList,
      studentList: this.state.studentList,
      dateschedule: this.state.dateschedule,
      deliveryTimeType: this.state.deliveryTimeType,
      deliveryDate: this.state.deliveryDate,
      deliveryTime: this.state.deliveryTime,
      forceRefresh: this.state.forceRefresh,
      homeworkid: this.state.selId
    }

    this.props.navigation.navigate('OnlineEditHomework', params);

  };

  onChooseFile = async () => {
    try {
      const results = await DocumentPicker.pickMultiple({
        type: [DocumentPicker.types.doc, DocumentPicker.types.docx, DocumentPicker.types.xls, DocumentPicker.types.xlsx, DocumentPicker.types.pdf]
      })
      let requestCnt = 0;
      let uris = this.state.attachedFiles;
      let aUris = [];

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
          uris.push({FileType: data[0].FileType, FileURL: data[0].FileURL});
          aUris.push({FileType: data[0].FileType, FileURL: data[0].FileURL});
          requestCnt = requestCnt + 1;
          if(requestCnt == results.length){
            this.setState({isLoading: false, attachedFiles: uris, addedAttachFiles: aUris});
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

        let aUris = [];

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
            uris.push({FileType: data[0].FileType, FileURL: data[0].FileURL});
            aUris.push({FileType: data[0].FileType, FileURL: data[0].FileURL});
            showUris.push({uri: data[0].FileURL});
            requestCnt = requestCnt + 1;
            if(requestCnt == response.assets.length){
              this.setState({isLoading: false, attachedImages: uris, showAttachImages: showUris, addedAttachImages: aUris});
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
    } else if (item.FileURL.endsWith('.ppt') || item.FileURL.endsWith('.pptx')) {
      image = Images.icon_ppt;
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
        <Image style={{width: 50, height: 70}} source={{uri: item.uri}} />
        <TouchableOpacity style={{position: 'absolute', top: -10, right: -10}} onPress={()=> this.setState({attachedImages: this.state.attachedImages.filter((item, idex)=> idex != index), showAttachImages: this.state.showAttachImages.filter((item, idex)=> idex != index)})} >
          <Image source={Images.n_close_circle} style={{width: 20, height: 20, resizeMode: 'contain'}}/>
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }


  render() {
    let isHomework = false
    if(this.state.type == "homework")
      isHomework = true;

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={isHomework ? translang.t('HOMEWORK'):translang.t('MATERIAL')}
          onMenuTap={() => this.back()}
        />
        <ScrollView style={styles.list}>

          {isHomework &&
          <View style={{...styles.listItem, flexDirection: 'column', alignItems: 'flex-start'}}>
            <View style={{flex: 1, flexDirection: 'row'}}>
              <Text style={styles.itemTitle}>{translang.t('ASSIGNMENT')}</Text>
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
              value={this.state.assignment}
              placeholder={translang.t('ASSIGNMENT')}
              placeholderTextColor={Color.n_text_placeholder_gray}
              onChangeText={text => this.setState({ assignment: text })}
            />
          </View>}

          {!isHomework &&
          <View style={{...styles.listItem, flexDirection: 'column', alignItems: 'flex-start'}}>
            <View style={{flex: 1, flexDirection: 'row'}}>
              <Text style={styles.itemTitle}>{translang.t('MATERIAL')}</Text>
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
              value={this.state.material}
              placeholder={translang.t('LESSON_LIB')}
              placeholderTextColor={Color.n_text_placeholder_gray}
              onChangeText={text => this.setState({ material: text })}
            />
          </View>}

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
              value={this.state.description}
              placeholder={translang.t('HOMEWORK_fill_in_the_detail')}
              placeholderTextColor={Color.n_text_placeholder_gray}
              onChangeText={text => this.setState({ description: text })}
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
              disableMultiline
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
            containerStyle={{ width: 290, marginLeft: 'auto', marginRight: 'auto', marginBottom: 25}}
            buttonStyle={{ borderRadius: 38, height: 75 }}
            colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
            isVerticalGradient={false}
            _onPress={() => this.__next()} />

          </ScrollView>


        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.n_ic_warning}
          message={this.state.modalBody}
          buttonColors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
          isVerticalGradient={false}
          onClose={() => { this.setState({ showModal: false }) }}
        />

        <ImageView
          images={this.state.showAttachImages}
          imageIndex={this.state.selImageIndex}
          visible={this.state.showImageView}
          onRequestClose={() => this.setState({showImageView: false, selImageIndex: 0})}
        />

      <ProgressHud isVisible={this.state.isLoading}/>

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
    marginBottom: 20
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
});
