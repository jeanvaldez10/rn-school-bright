import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, FlatList, ScrollView, Modal} from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import NextButton from '../../components/NextButton';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import Images from '../../themes/Images';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import CalendarModal from '../../components/CalendarModal';
import TimerPickerModal from '../../components/TimerPickerModal';
import CustomRadioButton from '../../components/CustomRadioButton';
import moment from 'moment';
import _ from 'lodash';
import SelectHeadTopicListModal from '../../components/SelectHeadTopicListModal';
import ScoreInputModal from '../../components/TopupAmountModal';
import DeliveryFormatModal from '../../components/SelectListModal';
import CustomRadioButtonItem from '../../components/CustomRadioButtonItem';

import ApiManager from '../../managers/ApiManager';

export default class OnlineTeacherEditHomeworkScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      selSubject: {},
      selLesson: {},
      type: '',
      assignment: '',
      material: '',
      description: '',
      attachlink: '',
      attachedFiles: [],
      attachedImages: [],
      showAttachImages: [],
      addedAttachFiles: [],
      addedAttachImages: [],

      topicList: [],
      selectedTopic: null,
      showTopicModal: false,

      showScoreModal: false,
      score: 0,

      selectedIndividual: {},
      showIndividualModal: false,

      classlevelList: [],
      studentList: [],

      tmpclasslevelList: [],
      tmpstudentList: [],

      showSelectStudentModal: false,

      showScheduleCalender: false,
      dateschedule: '',

      deliveryTimeType: -1,
      deliveryDate: '',
      deliveryTime: '',
      showDatePicker: false,
      showTimePicker: false,

      showModal: false,
      modalBody: '',
      homeworkid: '',
    };
  }

  handleBackButton = () => {
    if(this.state.dateschedule){
      this.setState({dateschedule: false});
      return true;
    }

    if(this.state.showDatePicker){
      this.setState({showDatePicker: false});
      return true;
    }

    this.back();
    return true;
  };

  async componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", () => {
      if(this.backhandler){
        this.backhandler.remove();
      }

      console.log("OnlineTeacherEditHomeworkScreen");
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const userInfo = this.props.navigation.getParam('userInfo');
      const selSubject = this.props.navigation.getParam('selSubject');
      const selLesson = this.props.navigation.getParam('selLesson');

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
      const tmpclasslevelList = this.props.navigation.getParam('classlevelList');
      const tmpstudentList = this.props.navigation.getParam('studentList');
      const dateschedule = this.props.navigation.getParam('dateschedule');
      const deliveryTimeType = this.props.navigation.getParam('deliveryTimeType');
      const deliveryDate = this.props.navigation.getParam('deliveryDate');
      const deliveryTime = this.props.navigation.getParam('deliveryTime');

      const homeworkid = this.props.navigation.getParam('homeworkid');
      const forceRefresh = this.props.navigation.getParam('forceRefresh') ?? true;

      if(forceRefresh){
        this.setState({homeworkid, type, assignment, material, description, attachlink, attachedFiles, attachedImages, addedAttachFiles, addedAttachImages, userInfo, selSubject, selLesson, showAttachImages, selectedTopic, score, selectedIndividual, tmpclasslevelList, tmpstudentList, dateschedule, deliveryTimeType, deliveryDate, deliveryTime}, ()=>{
          this.loadGroupList();
          this.loadListData();
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

    this.props.navigation.navigate("OnlineEditLesson", {forceRefresh: false});
  };

  loadGroupList = (isRefresh) => {
    const schoolID = this.state.userInfo.SchoolID;
    const teacherID = this.state.userInfo.ID;
    const termID = this.state.selSubject.TermID;
    const planeID = this.state.selSubject.PlaneID;
    const levelID = this.state.selSubject.LevelID;

    ApiManager.getOnlineGroupList(schoolID, teacherID, termID, planeID,levelID).then(data => {
      this.setState({topicList: data});
    }).catch(error => {
      console.error("loadLessonData: ", error);
    });
  };

  loadListData = () => {
    schoolID = this.state.userInfo.SchoolID;
    GroupID = this.state.selLesson.Id;

    ApiManager.getClassOnlie(schoolID, GroupID).then(data => {
      const roomlist = data.data.RoomList;
      const studentlist = data.data.StudentList;

      const {tmpclasslevelList, tmpstudentList} = this.state;
      roomlist.forEach((item, index)=>{
        const tmp = tmpclasslevelList.find(obj=>{
          return obj.RoomID == item.RoomID;
        })
        if(tmp && tmp != undefined){
          item.select = true
        }else{
          item.select = false
        }
      })
      studentlist.forEach((item, index)=>{
        const tmp = tmpstudentList.find(obj=>{
          return obj.Id == item.Id;
        })
        if(tmp && tmp != undefined){
          item.select = true
        }else{
          item.select = false
        }
      })

      this.setState({classlevelList: roomlist, studentList: studentlist});

    }).catch(error => {
      console.error("GetLessonListError: ", error);
      this.setState({ isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN') });
    });
  }

  onTopicSelect = (item, index) => {
    this.setState({selectedTopic: item, showTopicModal: false})
  }

  onChangeScore = (score) => {
    this.setState({score: score, showScoreModal: false});
  }

  onDeliveryFormatSelect = (item) => {
    if (item == null) {
      this.setState({ showIndividualModal: false })
    } else {
      this.setState({ showIndividualModal: false, selectedIndividual: item }, ()=>{
        if(item.value == 1){
          const tmp = this.state.classlevelList.filter(item=>item.selct);
          if(!tmp || tmp.length == 0){
            const tmp1= this.state.classlevelList
            tmp1.forEach(ci=>{
              ci.select = true
            });
            this.setState({classlevelList: tmp1});
          }
        }
      })
    }
  };

  __next = async () => {
    // if(!this.state.selectedTopic){
    //   this.setState({showModal: true, modalBody: translang.t('INPUT_HEADTOPIC')});
    //   return;
    // }

    if(this.state.type == "homework"){
      if(this.state.score == '0' || this.state.score == ''){
        this.setState({showModal: true, modalBody: translang.t('INPUT_SCORE')});
        return;
      }
    }

    if(!this.state.selectedIndividual.title){
      this.setState({showModal: true, modalBody: translang.t('INPUT_DELIVERY_FORMAT')});
      return;
    }

    if(this.state.selectedIndividual.value == 1){
      const temp = this.state.classlevelList.filter(item=>item.select);
      if(temp.length == 0){
        this.setState({showModal: true, modalBody: translang.t('INPUT_ROOMS')});
        return;
      }
    }else if(this.state.selectedIndividual.value == 2){
      const temp = this.state.studentList.filter(item=>item.select);
      if(temp.length == 0){
        this.setState({showModal: true, modalBody: translang.t('INPUT_STUDENT')});
        return;
      }
    }
    if(this.state.type == "homework"){
      if(this.state.dateschedule == ''){
        this.setState({showModal: true, modalBody: translang.t('INPUT_DEADLINE_DATE')});
        return;
      }
    }

    if(this.state.deliveryTimeType == '2'){
      if(this.state.deliveryDate == ''){
        this.setState({showModal: true, modalBody: translang.t('INPUT_SCHE_DATE')});
        return;
      }
    }

    const params = {
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
      // selectedTopic: this.state.selectedTopic,
      selectedTopic: this.state.selLesson,
      score: this.state.score,
      selectedIndividual: this.state.selectedIndividual,
      classlevelList: this.state.classlevelList,
      studentList: this.state.studentList,
      dateschedule: this.state.dateschedule,
      deliveryTimeType: this.state.deliveryTimeType,
      deliveryDate: this.state.deliveryDate,
      deliveryTime: this.state.deliveryTime,
      userInfo: this.state.userInfo,
      selSubject: this.state.selSubject,
      selLesson: this.state.selLesson,
      homeworkid: this.state.homeworkid,
      parent: "OnlineEditHomework",
    }
    this.props.navigation.navigate('OnlineAddHomeworkSubmit', params);
  };

  onDatePicked = (date) => {
    if (date === null || date === '') {
      this.setState({showDatePicker: false});
      return;
    };

    const formattedDate = moment(date).format('YYYY-MM-DD');
    this.setState({ deliveryDate: formattedDate, showDatePicker: false });
  };

  onTimePicked = (date) => {
    if (date === null) {
      this.setState({showTimePicker: false});
      return;
    }

    const formattedTime = moment(date).format('YYYY-MM-DDTHH:mm');
    this.setState({deliveryTime: formattedTime, showTimePicker: false});
  }

  renderClassItems() {
    var res = []
    const list = this.state.classlevelList;
    if(list.length > 0){
      for(let i = 0; i < list.length; i++){
        let item = list[i];
        if(item.select){
          let className = item.Name;
          if(getCurrentLocale() == 'en' && item.NameEn && item.NameEn != "" ){
            className = item.NameEn;
          }
          res.push(
            <View style={{borderRadius: 18, backgroundColor: Color.n_default_orange, paddingLeft: 15, paddingRight: 5, flexDirection: 'row', alignSelf: 'flex-start', height: 35, margin: 3,}} key={i}>
              <Text style={{color: Color.white, fontFamily: 'THSarabunNew', fontSize: 25, backgroundColor: Color.n_default_orange}}>{className}</Text>
              <TouchableOpacity
                style={{width: 30, hegith: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: 10 }}
                onPressOut={() => this.removeClassroomItem(item)}>
                <Image source={Images.n_ic_close_circle_white} style={{width: 20, height: 20, resizeMode: 'contain'}}/>
              </TouchableOpacity>
            </View>
          );
        }
      }
    }
    return res;
  }
  removeClassroomItem = (selitem)=>{
    const temp = this.state.classlevelList;
    const index = temp.findIndex((item)=> item==selitem);
    if(index >= 0){
      temp[index].select = false
      this.setState({classlevelList: temp});
    }
  }

  renderStudentItems() {
    var res = []
    const list = this.state.studentList;
    if(list.length > 0){
      for(let i = 0; i < list.length; i++){
        let item = list[i];
        if(item.select){
          let studentName = item.Name;
          if(getCurrentLocale() == 'en' && item.NameEn && item.NameEn != ""){
            studentName = item.NameEn;
          }
          res.push(
            <View style={{borderRadius: 18, backgroundColor: Color.n_default_orange, paddingLeft: 15, paddingRight: 5, flexDirection: 'row', alignSelf: 'flex-start', minHeight: 35, margin: 3,}} key={i}>
              <Text style={{color: Color.white, fontFamily: 'THSarabunNew', fontSize: 25, backgroundColor: Color.n_default_orange}}>{studentName}</Text>
              <TouchableOpacity
                style={{width: 30, hegith: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: 10 }}
                onPressOut={() => this.removeStudentItem(item)}>
                <Image source={Images.n_ic_close_circle_white} style={{width: 20, height: 20, resizeMode: 'contain'}}/>
              </TouchableOpacity>
            </View>
          );
        }
      }
    }
    return res;
  }
  removeStudentItem = (selitem)=>{
    const temp = this.state.studentList;
    const index = temp.findIndex((item)=> item==selitem);
    if(index >= 0){
      temp[index].select = false
      this.setState({studentList: temp});
    }
  }

  renderStudentItemOnDlg = (item, index)=>{
    const itemInfo = item;
    let name = itemInfo.Name;
    if(getCurrentLocale() == 'en' && itemInfo.NameEn && itemInfo.NameEn != ""){
      name = itemInfo.NameEn;
    }
    let profileImage = Images.man_user;

    const isSelected = item.select;

    // let profileImage = itemInfo.sex === '0' ? Images.man_user : Images.women_user;
    // if (itemInfo.profileImg) {
    //   profileImage = {uri: itemInfo.profileImg};
    // }

    return (
      <TouchableOpacity style={styles.listItemStudent} onPress={() => this.onSelectStudentItemOnDlg(item)}>
        <Text style={styles.itemText}>{index + 1}.</Text>
        <Image source={profileImage} style={styles.itemAvatar}></Image>
        <View style={{flexDirection: 'column', flex: 1, height: '100%', justifyContent: 'space-around'}}>
          <Text style={styles.itemText}>{name}</Text>
        </View>
        <CustomRadioButtonItem
          isSelected={isSelected}
          selectedColor={Color.n_button_gradient_green_start}
          disabled={true}
          radioSize={30} />
      </TouchableOpacity>
    );
  }
  onSelectStudentItemOnDlg = (selitem) => {
    const temp = this.state.studentList;
    const index = temp.findIndex((item)=> item==selitem);
    if(index >= 0){
      temp[index].select = !temp[index].select
      this.setState({studentList: temp});
    }
  }
  clickSelectDlg = () => {
    this.setState({showSelectStudentModal: false});
  }
  onDatePickedSchedule = (date) => {
    console.d
    if (date === null || date === '') {
      this.setState({showScheduleCalender: false});
      return;
    };
    const formattedDate = moment(date).format('YYYY-MM-DD');
    this.setState({ dateschedule: formattedDate, showScheduleCalender: false });
  };

  render() {
    let isHomework = false;
    if(this.state.type == "homework"){
      isHomework = true;
    }

    const deliveryFormatArray = [
      {title: translang.t('HOMEWORK_classlevel'), value: 1},
      {title: translang.t('INDIVIDUAL'), value: 2}
    ];

    let isClassLevel = '0';
    if(this.state.selectedIndividual.value == 1){
      isClassLevel = '1'
    }else if(this.state.selectedIndividual.value == 2){
      isClassLevel = '2'
    }
    const deliveryDate = this.state.deliveryDate == '' ? 'Day/Month/Year' : moment(this.state.deliveryDate).format('DD/MM/YYYY');
    const deliveryTime = this.state.deliveryTime == '' ? 'Time' : moment(this.state.deliveryTime).format('HH:mm');
    const _deliveryTime = this.state.deliveryTime == '' ? moment() : this.state.deliveryTime;
    var radio_props = [
      { text: translang.t('BROADCAST_send_now'), key: 1 },
      { text: translang.t('BROADCAST_set_time'), key: 2 }
    ];

    // let topicName = "";
    // if(this.state.selectedTopic != null){
    //   topicName = this.state.selectedTopic.Text;
    // }

    let topicName = "";
    if(this.state.selLesson != null){
      topicName = this.state.selLesson.Text;
    }


    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={isHomework?translang.t('HOMEWORK'):translang.t('MATERIAL')}
          onMenuTap={() => this.back()}
        />
        <ScrollView style={styles.list} contentContainerStyle={{flexGrow: 1}}>
          <TouchableOpacity
            style={{marginTop: 10}}
            onPress={() => this.setState({showTopicModal: true})}>
            <View style={{flex: 1, borderBottomColor: Color.n_scorpion, borderBottomWidth: 1, flexDirection: 'row', paddingVertical: 10}}>
              <Text style={styles.itemDateTimeTitleText}>{translang.t('HEAD_TOPIC')}</Text>
              <Text style={styles.itemDateTimeText}>{topicName ?? ""}</Text>
            </View>
          </TouchableOpacity>

          {isHomework &&
          <TouchableOpacity
            style={{marginTop: 10}}
            onPress={() => this.setState({showScoreModal: true})}>
            <View style={{flex: 1, borderBottomColor: Color.n_scorpion, borderBottomWidth: 1, flexDirection: 'row', paddingVertical: 10}}>
              <Text style={styles.itemDateTimeTitleText}>{translang.t('FULL_SCORE')}</Text>
              <Text style={styles.itemDateTimeText}>{this.state.score? this.state.score:translang.t('SCORE')}</Text>
            </View>
          </TouchableOpacity>}

          <TouchableOpacity
            style={{marginTop: 10}}
            onPress={() => this.setState({showIndividualModal: true})}>
            <View style={{flex: 1, borderBottomColor: Color.n_scorpion, borderBottomWidth: 1, flexDirection: 'row', paddingVertical: 10}}>
              <Text style={styles.itemDateTimeTitleText}>{translang.t('BROADCAST_deliveryformat')}</Text>
              <Text style={styles.itemDateTimeText}>{this.state.selectedIndividual.title? this.state.selectedIndividual.title:translang.t('BROADCAST_deliveryformat')}</Text>
            </View>
          </TouchableOpacity>

          {isClassLevel=='1' &&
          <View style={{borderBottomColor: Color.n_scorpion, borderBottomWidth: 1, paddingVertical: 10, marginTop: 10}}>
            <Text style={styles.itemDateTimeTitleText}>{translang.t('BEHAVIOR_class')}</Text>
            <View>{this.renderClassItems()}</View>
          </View>
          }

          {isClassLevel=='2' &&
          <TouchableOpacity
            style={{marginTop: 10}}
            onPress={() => this.setState({showSelectStudentModal: true})}>
            <View style={{flex: 1, borderBottomColor: Color.n_scorpion, borderBottomWidth: 1, paddingVertical: 10}}>
              <View style = {{ flexDirection: 'row'}}>
                <Text style={styles.itemDateTimeTitleText}>{translang.t('LIST')}</Text>
                <Text style={styles.itemDateTimeText}>{translang.t('Select')}</Text>
              </View>
              <View style={{flexWrap: 'wrap', flexDirection: 'row'}}>{this.renderStudentItems()}</View>
            </View>
          </TouchableOpacity>}

          {isHomework &&
          <TouchableOpacity
            style={{marginTop: 10}}
            onPress={() => this.setState({showScheduleCalender: true})}>
            <View style={{flex: 1, borderBottomColor: Color.n_scorpion, borderBottomWidth: 1, flexDirection: 'row', paddingVertical: 10}}>
              <Text style={styles.itemDateTimeTitleText}>{translang.t('DEADLINE_DATE')}</Text>
              <Text style={styles.itemDateTimeText}>{this.state.dateschedule!=''? this.state.dateschedule:translang.t('DEADLINE_DATE')}</Text>
            </View>
          </TouchableOpacity>}

          <View style={{ marginTop: 20, marginBottom: 10}}>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.itemDateTimeTitleText}>{translang.t('DISPLAY_Date')}:</Text>
            </View>
            <CustomRadioButton
              PROP={radio_props}
              isVertically={true}
              radioColor={Color.n_button_gradient_green_start}
              radioSize={25}
              itemTextStyle={{fontSize: 24}}
              selVal={this.state.deliveryTimeType}
              onPress={(value) => { this.setState({ deliveryTimeType: value }) }} />
          </View>
          { this.state.deliveryTimeType == "2" &&
          <View style={{flexDirection: 'row',width: '100%'}}>
            <View style={{marginRight: 30, flex: 1}}>
              <TouchableOpacity
                style={styles.itemDateTimeInput}
                onPress={() => this.setState({showDatePicker: true})}>
                <Text style={styles.itemDateTimeText}>{deliveryDate}</Text>
              </TouchableOpacity>
            </View>
            <View style={{flex: 1}}>
              <TouchableOpacity
                style={styles.itemDateTimeInput}
                onPress={() => this.setState({showTimePicker: true})}>
                <Text style={styles.itemDateTimeText}>{deliveryTime}</Text>
              </TouchableOpacity>
            </View>
          </View>}

          <NextButton
            label={translang.t('COMMON_next')}
            containerStyle={{ width: 290, marginLeft: 'auto', marginRight: 'auto', marginVertical:15}}
            buttonStyle={{ borderRadius: 38, height: 75 }}
            colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
            isVerticalGradient={false}
            _onPress={() => this.__next()} />
        </ScrollView>


        <CalendarModal
          isVisible={this.state.showScheduleCalender}
          selectedDate={this.state.dateschedule}
          type={'single'}
          onDateSelect={result => this.onDatePickedSchedule(result)} />

        <CalendarModal
          isVisible={this.state.showDatePicker}
          selectedDate={this.state.deliveryDate}
          type={'single'}
          onDateSelect={result => this.onDatePicked(result)} />

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.n_ic_warning}
          message={this.state.modalBody}
          buttonColors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
          isVerticalGradient={false}
          onClose={() => { this.setState({ showModal: false }) }}
        />

        <TimerPickerModal
          isVisible={this.state.showTimePicker}
          selectedTime={_deliveryTime}
          onTimeSelect={result => this.onTimePicked(result)} />
        <SelectHeadTopicListModal
          isVisible={this.state.showTopicModal}
          onListSelect={this.onTopicSelect}
          listData={this.state.topicList}
          dialogTtitle = {translang.t('HEAD_TOPIC')}
        />
        <ScoreInputModal
          title = {translang.t("INPUT_SCORE")}
          isVisible={this.state.showScoreModal}
          onClose={() => { this.setState({ showScoreModal: false }) }}
          onOK={(amount) => { this.onChangeScore(amount) }}
          onError={() => { }}
        />
         <DeliveryFormatModal
          isVisible={this.state.showIndividualModal}
          onListSelect={this.onDeliveryFormatSelect}
          listData={deliveryFormatArray}
          dialogTtitle={translang.t('BROADCAST_deliveryformat')}
        />
        {this.state.showSelectStudentModal &&
        <Modal
          animationType='fade'
          transparent={true}
          key="modal">
          <View style={styles.centeredView} >
            <View style={{...styles.dialogStyle, width: "90%"}}>
            <NextButton
              label={translang.t('Select')}
              containerStyle={{ width: 100, alignSelf: 'flex-end'}}
              textStyle = {{fontSize: 20, fontWeight: 'bold'}}
              buttonStyle={{ borderRadius: 20, height: 40 }}
              colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
              isVerticalGradient={false}
              _onPress={() => this.clickSelectDlg()} />
              <FlatList style={{...styles.list}}
                data={this.state.studentList}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => this.renderStudentItemOnDlg(item, index)}
              />
            </View>
          </View>
        </Modal>}
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white
  },

  list: {
    flex: 1,
    padding: 20,
    marginBottom: 20,
  },

  itemDateTimeInput: {
    flex: 1,
    borderBottomColor: Color.n_scorpion,
    borderBottomWidth: 1,
    height: 30,
    marginVertical: 0,
    justifyContent: 'center'
  },
  itemDateTimeTitleText: {
    fontFamily: 'THSarabunNew',
    fontSize: 25,
    textAlign: 'left',
    fontWeight: 'bold',
    color: Color.n_default_orange,
    flex: 1,
  },
  itemDateTimeText: {
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    textAlign: 'right',
    color: Color.n_scorpion,
    flex: 1
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

  centeredView: {
    height: '60%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000070',
  },
  listItemStudent: {
    minHeight: 100,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    marginVertical: 5,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  itemText: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    color: Color.n_default_gray,
  },
  itemAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 8,
  },
  dialogStyle: {
    width: '90%',
    height: '80%',
    padding: 20,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 5,
    },
    shadowOpacity: 0.25,
    elevation: 5,
    backgroundColor: 'white',
  },
});
