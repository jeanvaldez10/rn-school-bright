import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, FlatList, Modal, TextInput} from 'react-native';
import {Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import { SafeAreaView } from 'react-native-safe-area-context';
import NotificationIconInfoItem from '../../components/NotificationIconInfoItem';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import BackNavigationBar from '../../components/BackNavigationBar';
import Color from '../../constants/color';
import GradientButton from '../../components/GradientButton';
import CheckBox from 'react-native-checkbox-heaven';
import CustomRadioButtonItem from '../../components/CustomRadioButtonItem';
import ApiManager from '../../managers/ApiManager';

export default class OnlineTeacherLessonListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      lessonList: [],
      userInfo: {},
      isLoading: false,
      selectedSubject: {},

      showCreateModal: false,
      valTopic: "",
      ClassRoomList: [],
      isShowClassRoomList: false,
      ShareList: [],
      isShowShareList: false,
    };
  }

  handleBackButton = () => {
    if(this.state.showCreateModal){
      this.setState({showCreateModal: false})
    }else{
      this.back();
    }
    return true;
  };

  async componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", () => {
      if(this.backhandler){
        this.backhandler.remove();
      }

      console.log("OnlineTeacherLessonList");
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const userInfo = this.props.navigation.getParam('userInfo');
      const subject = this.props.navigation.getParam('subject');

      this.setState({ userInfo: userInfo, selectedSubject: subject}, () => {
        this.loadData(true);
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

    this.props.navigation.navigate('OnlineTeacherSubjectList');
  };

  onRefresh() {
    this.setState({isFetching: true,},() => {this.loadData(true);});
  }

  loadData = (isRefresh) => {
    this.setState({isLoading: true});
    const schoolID = this.state.userInfo.SchoolID;
    const teacherID = this.state.userInfo.ID;
    const termID = this.state.selectedSubject.TermID;
    const planeID = this.state.selectedSubject.PlaneID;
    const levelID = this.state.selectedSubject.LevelID;

    // this.setState({isLoading: true})
    ApiManager.getOnlineGroupList(schoolID, teacherID, termID, planeID,levelID).then(data => {
      this.setState({lessonList: data,isLoading: false });
      console.log("list group:", data)
    }).catch(error => {
      console.error("OnlineGroupList: ", error);
      this.setState({ isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN') });
    });
  };


  renderItem = (index) => {
    const lesson = this.state.lessonList[index];
    let name = "";
    let topic = "";
    if(lesson){
      name = lesson.Id;
      topic = lesson.Text;
    }

    return (
      <View style={styles.listItem}>
        <TouchableOpacity activeOpacity={0.5} onPress={() => { this.onClickLesson(lesson) }} >
          <NotificationIconInfoItem
            icon={Images.n_ic_homework_blue}
            label={name}
            value_txt={topic}
            dateText={null}
            isRead={false}
            imageStyle={{width: 30, height: 30, borderRadius: 0}}
          />
        </TouchableOpacity>
      </View>
    );
  };

  onClickLesson = (item) => {
    const params = {
      userInfo: this.state.userInfo,
      lesson: item,
      subject: this.state.selectedSubject,
    };

    this.props.navigation.navigate('OnlineTopicList', params);
  };

  onChangeTopic = (valStr) => {
    this.setState({valTopic: valStr});
  }

  closeModal = () => {
    this.setState({showCreateModal: false, valTopic: '', isShowClassRoomList: false, isShowShareList: false});
  }

  clickRoomList = () => {
    this.setState({isShowClassRoomList: !this.state.isShowClassRoomList, isShowShareList: false});
  }

  clickShareList = () => {
    this.setState({isShowClassRoomList: false, isShowShareList: !this.state.isShowShareList});
  }

  renderClassroomItems() {
    var res = []
    const list = this.state.ClassRoomList;

    if(list.length > 0){
      for(let i = 0; i < list.length; i++){
        let item = list[i];
        if(item.select){
          let roomName = item.Level;
          if(getCurrentLocale() == 'en' && item.LevelEn && item.LevelEn != ""){
            roomName = item.LevelEn
          }
          res.push(
            <View style={{borderRadius: 18, backgroundColor: Color.n_default_orange, paddingLeft: 15, paddingRight: 5, flexDirection: 'row', alignSelf: 'flex-start', height: 35, margin: 3,}} key={i}>
              <Text style={{color: Color.white, fontFamily: 'THSarabunNew', fontSize: 25, backgroundColor: Color.n_default_orange}}>{`${roomName} / ${item.Room}`}</Text>
              <TouchableOpacity
                style={{width: 30, hegith: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginHorizontal: 10 }}
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
    const temp = this.state.ClassRoomList;
    const index = temp.findIndex((item)=> item==selitem);
    if(index >= 0){
      temp[index].select = false
      this.setState({ClassRoomList: temp});
    }
  }

  renderClassroomListItem = (item, index) => {
    if(item == null){
      this.setState({isShowClassRoomList: false});
    }else{
      let roomName = item.Level;
      if(getCurrentLocale() == 'en' && item.LevelEn && item.LevelEn != ""){
        roomName = item.LevelEn
      }
      return (
        <View style={{...styles.checkboxContainer, flex: 1}}>
          <CustomRadioButtonItem
            isSelected={item.select}
            selectedColor={Color.n_button_gradient_green_start}
            onPress={()=>this.onChangeClassroomItem(item, index)}
            radioSize={25}
            text={`${roomName} / ${item.Room}`}
            itemTextStyle={styles.checkboxlabel} />
        </View>
      );
    }
  };

  onChangeClassroomItem = (item, index) =>{
    const temp = this.state.ClassRoomList;
    temp[index].select = !temp[index].select
    this.setState({ClassRoomList: temp});
  }

  renderShareItems() {
    var res = []
    const list = this.state.ShareList;

    if(list.length > 0){
      for(let i = 0; i < list.length; i++){
        let item = list[i];
        let name = item.TeacherName;
        if(getCurrentLocale() == 'en' && item.TeacherNameEn && item.TeacherNameEn.trim() != ''){
          name = item.TeacherNameEn;
        }
        const nameArray = name.split(' ');
        let firstName = '';
        let lastName = '';
        if (nameArray.length > 0) {
          firstName = nameArray[0];
        }
        if (nameArray.length > 1) {
          lastName = nameArray[nameArray.length - 1];
        }

        if(item.select){
          res.push(
            <View style={{borderRadius: 18, backgroundColor: Color.n_default_orange, paddingLeft: 15, paddingRight: 5, paddingVertical: 2, flexDirection: 'row', alignSelf: 'flex-start', margin: 3,}} key={i}>
              <View>
                <Text style={{color: Color.white, fontFamily: 'THSarabunNew', fontSize: 25, backgroundColor: Color.n_default_orange}}>{firstName}</Text>
                <Text style={{color: Color.white, fontFamily: 'THSarabunNew', fontSize: 25, backgroundColor: Color.n_default_orange}}>{lastName}</Text>
              </View>
              <TouchableOpacity
                style={{width: 30, hegith: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginHorizontal: 10 }}
                onPressOut={() => this.removeShareItem(item)}>
                <Image source={Images.n_ic_close_circle_white} style={{width: 20, height: 20, resizeMode: 'contain'}}/>
              </TouchableOpacity>
            </View>
          );
        }
      }
    }
    return res;
  }

  removeShareItem = (selitem)=>{
    const temp = this.state.ShareList;
    const index = temp.findIndex((item)=> item==selitem);
    if(index >= 0){
      temp[index].select = false
      this.setState({ShareList: temp});
    }
  }

  renderShareListItem = (item, index) => {
    let shareName = ""
    if(item){
      shareName = item.TeacherName;
      if(getCurrentLocale() == 'en' && item.TeacherNameEn && item.TeacherNameEn.trim() != ''){
        shareName = item.TeacherNameEn;
      }
    }
    return (
      <View style={{...styles.checkboxContainer, flex: 1}}>
        <CustomRadioButtonItem
          isSelected={item.select}
          selectedColor={Color.n_button_gradient_green_start}
          onPress={()=>this.onChangeShareItem(item, index)}
          radioSize={25}
          text={shareName}
          itemTextStyle={styles.checkboxlabel} />
      </View>
    );
  };

  onChangeShareItem = (item, index) =>{
    const temp = this.state.ShareList;
    temp[index].select = !temp[index].select
    this.setState({ShareList: temp});
  }

  onClickAddBtn = () => {
    this.setState({showCreateModal: true}, ()=>{
      this.loadClassList();
    })
  }

  loadClassList = () => {
    const schoolID = this.state.userInfo.SchoolID;
    const teacherID = this.state.userInfo.ID;
    const termID = this.state.selectedSubject.TermID;
    const planeID = this.state.selectedSubject.PlaneID;
    const levelID = this.state.selectedSubject.LevelID;

    ApiManager.getOnlineClassList(schoolID, teacherID, termID, planeID,levelID).then(list => {
      this.loadShareTeacherList();
      list.forEach((item)=>{
        item.select = false;
      })
      this.setState({ ClassRoomList: list});
    }).catch(error => {
      console.log(error);
    });
  }

  loadShareTeacherList = () => {
    const schoolID = this.state.userInfo.SchoolID;
    const teacherID = this.state.userInfo.ID;
    const termID = this.state.selectedSubject.TermID;
    const planeID = this.state.selectedSubject.PlaneID;
    const levelID = this.state.selectedSubject.LevelID;

    ApiManager.getOnlineShareTeacherList(schoolID, teacherID, termID, planeID,levelID).then(list => {
      list.forEach((item)=>{
        item.select = false;
      })
      this.setState({ ShareList: list});
    }).catch(error => {
      console.log(error);
    });
  }

  createLesson = () => {
    const TermID = this.state.selectedSubject.TermID;
    const LevelID = this.state.selectedSubject.LevelID;
    const PlaneID = this.state.selectedSubject.PlaneID;
    const TeacherID = this.state.userInfo.ID;
    const SchoolID = this.state.userInfo.SchoolID;

    let TitleName = "";
    let ShareRoomID = [];
    let ShareTeacherID = [];
    let GroupID = "";

    if(this.state.valTopic == ""){
      return;
    }else{
      TitleName = this.state.valTopic;
    }

    const tempClassRoom = this.state.ClassRoomList.filter(item=>item.select===true);
    if(tempClassRoom.length > 0){
      tempClassRoom.forEach((item, index)=>{
        ShareRoomID.push(item.RoomID);
      })
    }else{
      return;
    }

    const tempShareTeacher = this.state.ShareList.filter(item=>item.select);
    if(tempShareTeacher.length > 0){
      tempShareTeacher.forEach((item, index)=>{
        ShareTeacherID.push(item.TeacherID);
      })
    }

    this.setState({isLoading: true});
    const promise = ApiManager.createOnlineGroup(TermID, LevelID, PlaneID, TeacherID, SchoolID, TitleName, ShareRoomID, ShareTeacherID, GroupID);
    promise.then(result => {
      this.setState({isLoading: false}, ()=>{
        this.loadData();
        this.closeModal();
      });
    }).catch(error => {
      console.log("CreateGroupList", error);
      this.setState({isLoading: false});
    })
  }

  render() {
    const {ClassRoomList, ShareList} = this.state
    return (
      <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
        <BackNavigationBar
          title={translang.t('DRAWER_onlineclassroom')}
          onMenuTap={() => this.back()}
        />
        <View style = {{paddingHorizontal: 35, marginTop: 30, flexDirection: 'row', justifyContent: 'flex-end'}}>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => { this.onClickAddBtn() }}
            style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image source={Images.n_ic_add_orange} style={{width: 25, height: 25}}/>
            <Text style={{color: Color.n_default_orange, fontSize: 25, fontFamily: 'THSarabunNew', fontWeight: 'bold', marginLeft: 5}}>{translang.t('CREATE_TOPIC')}</Text>
          </TouchableOpacity>
          <View style={{height: 2, borderRadius: 1, backgroundColor: Color.n_default_brown, marginTop: 20,}}/>
        </View>

        <View style={{height: 2, borderRadius: 2, backgroundColor: Color.n_default_brown, marginHorizontal: 35, marginVertical: 10,}}/>


        <View style={styles.container}>
          { this.state.lessonList.length > 0 &&
            <FlatList
              style={styles.menuContainer}
              data={this.state.lessonList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item, index}) => this.renderItem(index)}
            />
          }
          { this.state.lessonList.length === 0 &&
            <View style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{fontFamily: 'THSarabunNew', fontSize: 30}}>{translang.t('NO_DATA')}</Text>
            </View>
          }
        </View>

        <ProgressHud isVisible={this.state.isLoading} />

        {this.state.showCreateModal &&
          <View style={{...styles.centeredView, position: 'absolute', left: 0, right: 0, top: 0, bottom: 0}} >
            <View style={{...styles.dialogStyle, width: "90%"}}>
              <Text style={styles.createTopicTextStyle}>{translang.t('CREATE_TOPIC')}</Text>
              <View style={{height: 1, backgroundColor: Color.n_default_orange, marginVertical: 12}}/>

              <Text style={styles.createTopicTextStyle}>{translang.t('HEAD_TOPIC')}</Text>
              <View style={styles.createTopicViewContainer}>
                <TextInput
                  style={{backgroundColor: Color.transparent, fontSize:20, fontFamily: 'THSarabunNew', color: Color.red_color_bg, width: '100%' }}
                  placeholder={translang.t('HEAD_TOPIC')}
                  onChangeText={text => this.onChangeTopic(text)}>{this.state.valTopic}</TextInput>
              </View>

              <Text style={styles.createTopicTextStyle}>{translang.t('CLASSROOM')}</Text>
              <View style={{position: 'relative', zIndex: 2}}>
                <TouchableOpacity onPressOut={() => this.clickRoomList()}>
                  <View style={styles.createTopicViewContainer}>
                    {this.renderClassroomItems()}
                  </View>
                </TouchableOpacity>
              </View>

              <Text style={styles.createTopicTextStyle}>{translang.t('SHARE')}</Text>
              <View style={{position: 'relative', zIndex: 1}}>
                <TouchableOpacity onPressOut={() => this.clickShareList()}>
                  <View style={styles.createTopicViewContainer}>
                    {this.renderShareItems()}
                  </View>
                </TouchableOpacity>
              </View>

              <View style={{flexDirection: 'row', justifyContent: 'flex-end', zIndex: 0}}>
                <GradientButton
                  label={translang.t('COMMON_cancel') }
                  containerStyle={styles.buttonContainer}
                  buttonStyle={{borderRadius: 0}}
                  colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
                  textStyle={{fontSize: 24, fontWeight: 'bold'}}
                  isVerticalGradient={false}
                  _onPress={() => { this.closeModal() }} />

                <GradientButton
                  label={translang.t('CREATE') }
                  containerStyle={styles.buttonContainer}
                  buttonStyle={{borderRadius: 0}}
                  colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                  textStyle={{fontSize: 24, fontWeight: 'bold'}}
                  isVerticalGradient={false}
                  _onPress={() => { this.createLesson() }} />

              </View>
            </View>
          </View>
        }

      {this.state.isShowClassRoomList &&
      <Modal
        animationType="fade"
        transparent={true}
        key="modal">
          <View style={{...styles.centeredView}}>
            <View style={{...styles.dialogStyle, width: "70%", height: 250, padding: 0, borderRadius: 10}}>
              <Text style={styles.titleTextStyle}>{translang.t('CLASSROOM')}</Text>
              <View style={{height: 1, marginHorizontal: 10,   backgroundColor: Color.n_default_orange}}/>
              <FlatList
                style={{marginTop: 10, paddingLeft: 20,}}
                data={ClassRoomList}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => this.renderClassroomListItem(item, index)}/>
              <TouchableOpacity style={{position: 'absolute', top: 10, right: 10}} onPress={()=> this.setState({isShowClassRoomList: false})} >
                <Image source={Images.n_close_circle} style={{width: 30, height: 30, resizeMode: 'contain'}}/>
              </TouchableOpacity>
            </View>
          </View>
      </Modal>}

      {this.state.isShowShareList &&
      <Modal
        animationType="fade"
        transparent={true}
        key="modal">
        <View style={{...styles.centeredView}} >
          <View style={{...styles.dialogStyle, width: "70%", height: 200, padding: 0, borderRadius: 10}}>
            <Text style={styles.titleTextStyle}>{translang.t('SHARE')}</Text>
            <View style={{height: 1, marginHorizontal: 10,   backgroundColor: Color.n_default_orange}}/>
            <FlatList
              style={{marginTop: 10, paddingLeft: 20,}}
              data={ShareList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item, index}) => this.renderShareListItem(item, index)}/>
            <TouchableOpacity style={{position: 'absolute', top: 10, right: 10}} onPress={()=> this.setState({isShowShareList: false})} >
              <Image source={Images.n_close_circle} style={{width: 30, height: 30, resizeMode: 'contain'}}/>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>}

      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  listItem: {
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
    marginHorizontal: 10,
  },

  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
  },
  menuContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  alarmText: {
    fontFamily: 'THSarabunNew',
    color: 'black',
    fontSize: 20,
  },

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000070',
  },
  dialogStyle: {
    width: '90%',
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

  title:{
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Color.n_default_gray,

  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray,
    marginBottom: 20,
  },

  buttonContainer: {
    width: 126,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 50,
    marginHorizontal: 5
  },

  alertImage: {
    height: 60,
    width: 100,
    resizeMode: 'contain',
    marginBottom: 20,
  },

  timeintervalStyle: {
    fontFamily: 'THSarabunNew',
    fontWeight: 'bold',
    fontSize: 24,
    color: Color.n_default_gray,
    marginTop: 15,
    marginLeft: 20,

  },

  createTopicTextStyle: {
    fontFamily: 'THSarabunNew',
    fontWeight: 'bold',
    fontSize: 25,
    color: Color.n_default_orange,
    marginTop: 30,
  },

  createTopicViewContainer: {
    borderColor: Color.n_scorpion,
    borderRadius: 10,
    borderWidth: 1,
    width: '100%',
    padding: 3,
    minHeight: 55,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dropdownViewContainer: {
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 5,
    },
    shadowOpacity: 0.25,
    elevation: 5,
    backgroundColor: 'white',
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: 'center',
    marginVertical: 2,
  },
  checkbox: {
    width: 25,
    height: 25,
  },
  checkboxlabel: {
    color: Color.n_default_orange,
    fontFamily: 'THSarabunNew',
    fontSize: 25,
    fontWeight: 'bold',
    marginLeft: 5,
  },

  titleTextStyle: {
    width: '100%',
    marginVertical: 10,
    fontFamily: 'THSarabunNew',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Color.n_default_orange
  },
});
