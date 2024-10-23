import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, ImageBackground, FlatList, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import NextButton from '../../components/NextButton';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import ProgressHud from '../../components/ProgressHud';
import Images from '../../themes/Images';
import CustomTextSearch from '../../components/CustomTextSearch';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import DropDownPicker from 'react-native-dropdown-picker';
import ApiManager from '../../managers/ApiManager';

export default class OnlineTopicMainScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showModal: false,

      userInfo: {},
      selSubject: {},
      selLesson: {},
      selClassLevel: {},
      selTopic: {},
      studentList: [],

      selStatus: '',
      selRoom: {},

      showClassLevelModal: false,
      showClassModal: false,
      isStatusChangeModalVisible: false,
      isSearching: false,
      searchKeyword: '',
      shouldSetAll: false,
      filteredStudentIndexs: [],
      classLevel: null,
      classRoom: null,
      selectedItemIndex: -1,
      isEdit: false,

      searchVal: '',

    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      console.log("OnlineTopicMain");

      const userInfo = this.props.navigation.getParam('userInfo');
      const selSubject = this.props.navigation.getParam('selSubject');
      const selLesson = this.props.navigation.getParam('selLesson');
      const selClassLevel = this.props.navigation.getParam('selClassLevel');
      const selTopic = this.props.navigation.getParam('selTopic');

      const selRoom = {label: translang.t('NOTIFICATION_all'), value: 0};
      this.setState({ userInfo, selSubject, selLesson, selClassLevel, selTopic, selRoom, selStatus: translang.t('NOTIFICATION_all')}, ()=>{
        this.loadStudentData();
      })
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

  loadStudentData = ()=>{
    this.setState({isLoading: true});
    const schoolID = this.state.userInfo.SchoolID;
    const homeworkID = this.state.selTopic.ID;
    // const homeworkID = "178369";
    ApiManager.getListCheckHomework(schoolID, homeworkID)
    .then(res => {
      this.setState({studentList: res.data, isLoading: false});
    }).catch(error => {
      console.log(error);
      this.setState({isLoading: false});
    });
  }

  back = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }

    if (this.state.isSearching) {
      this.setState({isSearching: false, searchKeyword: '', filteredStudentIndexs: []});
    } else {
      this.props.navigation.navigate('OnlineTopicList');
    }
  };

  _onChangeSearchVal = (text) => {
    this.setState({ searchVal: text });
  };

  onSelectItem = (item, classLevel) =>{
    const param = {
      selStudent: item,
      selTopic: this.state.selTopic,
      userInfo: this.state.userInfo,
      classLevel: classLevel
    };
    this.props.navigation.navigate('OnlineScoreSubmit', param);
  }

  renderClassItem = (item, index) =>{
    const itemCL = item;
    let classLevel = ""
    let studentlist = []
    if(itemCL){
      classLevel = getCurrentLocale() == 'th' ? itemCL.Room : itemCL.RoomEn;
      studentlist = itemCL.StudentList
    }

    return (
      <View>
        <View style={{marginTop: 20, borderBottomColor: Color.n_default_orange, borderBottomWidth: 1, marginHorizontal: 35}}>
          <Text style={{color: Color.n_default_orange, fontFamily: 'THSarabunNew', fontSize: 30}}>{classLevel}</Text>
        </View>

        <FlatList
          data={studentlist}
          scrollEnabled = {false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => this.renderStudentItem(item, index, classLevel)}
        />
      </View>
    );
  }

  renderStudentItem = (item, index, classlevel) => {
    let student = item;
    let name = student.FullName;
    if(getCurrentLocale() == 'en' && student.FullNameEn && student.FullNameEn.trim() != ''){
      name = student.FullNameEn;
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

    let statusText = translang.t('NOT_SUBMIT');
    let scoreText = "";
    let stateColors = Color.n_default_orange;

    if(item.Status == "1"){
      statusText = translang.t('PENDING');
      stateColors = Color.n_default_brown;
    }else if(item.Status == "2"){
      statusText = translang.t('ONLINE_OVERDUE');
      stateColors = Color.n_scorpion
    }else if(item.Status == "3"){
      statusText = translang.t('SUBMITTED');
      stateColors = Color.n_button_gradient_green_end;
      if(student.Score && student.Score > 0){
        scoreText = student.Score + " / " + student.MaxScore;
      }
    }else if(item.Status == "4"){
      statusText = translang.t('SUBMITTED_LATE');
      stateColors = Color.n_default_orange;
      if(student.Score && student.Score > 0){
        scoreText = student.Score + " / " + student.MaxScore;
      }
    }

    let profileImage = Images.man_user;
    if (student.pic) {
      profileImage = {uri: student.pic};
    }

    return (
      <TouchableOpacity style={styles.listItem} onPress={() => this.onSelectItem(item, classlevel)}>
        <Text style={styles.itemText}>{index + 1}.</Text>
        <Image source={profileImage} style={styles.itemAvatar}></Image>
        <View style={{flexDirection: 'column', flex: 1, height: '100%', justifyContent: 'space-around', marginLeft: 15,}}>
          <Text style={styles.itemText}>{item.Code}</Text>
          <Text style={styles.itemText}>{firstName}</Text>
          <Text style={styles.itemText}>{lastName}</Text>
        </View>
        <View style={{...styles.statusCircle, backgroundColor: stateColors}}>
          <Text style={styles.statusText}>{statusText}</Text>
          {scoreText != "" &&
          <Text style={{...styles.statusText,  fontSize: 30, marginTop: 5}}>{scoreText}</Text>}

        </View>
      </TouchableOpacity>
    );
  };

  makeFilterList = ()=>{
    const list = this.state.studentList;
    let filteredRoomList = [];
    if(this.state.selRoom.value == 0){
      filteredRoomList = list;
    }else{
      filteredRoomList = list.filter((item)=>item.Room === this.state.selRoom.label);
    }

    let res = [];

    filteredRoomList.forEach((item, index)=>{
      let res_room = {};
      res_room = {...item, StudentList:[]};
      item.StudentList.forEach(itemStudent =>{
        let studentName = itemStudent.FullName;
        if(getCurrentLocale()=='en' && itemStudent.FullNameEn && itemStudent.FullNameEn != ""){
          studentName = itemStudent.FullNameEn;
        }

        if(this.state.selStatus == translang.t('PENDING')){
          if(itemStudent.Status == "1"){
            if(this.state.searchVal != ""){
              if(studentName.toString().toLowerCase().includes(this.state.searchVal.toLowerCase()) || itemStudent.Code.toString().includes(this.state.searchVal.toLowerCase())){
                res_room.StudentList.push(itemStudent);
              }
            }else{
              res_room.StudentList.push(itemStudent);
            }
          }
        }else if(this.state.selStatus == translang.t('ONLINE_OVERDUE')){
          if(itemStudent.Status == "2"){
            if(this.state.searchVal != ""){
              if(studentName.toString().toLowerCase().includes(this.state.searchVal.toLowerCase()) || itemStudent.Code.toString().includes(this.state.searchVal.toLowerCase())){
                res_room.StudentList.push(itemStudent);
              }
            }else{
              res_room.StudentList.push(itemStudent);
            }
          }
        }else if(this.state.selStatus == translang.t('SUBMITTED')){
          if(itemStudent.Status == "3"){
            if(this.state.searchVal != ""){
              if(studentName.toString().toLowerCase().includes(this.state.searchVal.toLowerCase()) || itemStudent.Code.toString().includes(this.state.searchVal.toLowerCase())){
                res_room.StudentList.push(itemStudent);
              }
            }else{
              res_room.StudentList.push(itemStudent);
            }
          }
        }else if(this.state.selStatus == translang.t('SUBMITTED_LATE')){
          if(itemStudent.Status == "4"){
            if(this.state.searchVal != ""){
              if(studentName.toString().toLowerCase().includes(this.state.searchVal.toLowerCase()) || itemStudent.Code.toString().includes(this.state.searchVal.toLowerCase())){
                res_room.StudentList.push(itemStudent);
              }
            }else{
              res_room.StudentList.push(itemStudent);
            }
          }
        }else{
          if(this.state.searchVal != ""){
            if(studentName.toString().toLowerCase().includes(this.state.searchVal.toLowerCase()) || itemStudent.Code.toString().includes(this.state.searchVal.toLowerCase())){
              res_room.StudentList.push(itemStudent);
            }
          }else{
            res_room.StudentList.push(itemStudent);
          }
        }

      })
      res.push(res_room);
    });
    return res;
  }

  render() {
    const {selTopic, selLesson, searchVal} = this.state;

    let strLesson = ""
    if(selLesson){
      strLesson = selLesson.Text;
    }

    let srtTopic = ""
    if(selTopic){
      srtTopic = selTopic.Title;
    }

    let dataList = [];
    let dropdownRoomItems = [{label: translang.t('NOTIFICATION_all'), value: 0},];
    if(this.state.studentList != undefined && this.state.studentList){
      if(this.state.studentList.length > 0){
        dataList = this.makeFilterList();

        this.state.studentList.forEach((item, index) => {
          const temp = {label: item.Room, value: index+1};
          dropdownRoomItems.push(temp);
        });
      }
    }


    const moreActions = dataList.length > 0 ? [translang.t('NOTIFICATION_all'), translang.t("PENDING"), translang.t("ONLINE_OVERDUE"), translang.t("SUBMITTED"), translang.t("SUBMITTED_LATE")] : [];


    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('CHECKING_HOMEWORK')}
          onMenuTap={() => this.back()}
          is_more='1'
          actions={moreActions}
          onMoreTap={(value, index) => {
            if (index === 0){
              this.setState({selStatus: translang.t('NOTIFICATION_all')});
            }
            else if (index === 1){
              this.setState({selStatus: translang.t('PENDING')});
            }
            else if (index === 2){
              this.setState({selStatus: translang.t('ONLINE_OVERDUE')});
            }
            else if (index === 3){
              this.setState({selStatus: translang.t('SUBMITTED')});
            }
            else if (index === 4){
              this.setState({selStatus: translang.t('SUBMITTED_LATE')});
            }

          }}
        />

        <View style={styles.container}>
          <View style={{marginTop: 20, marginHorizontal: 30, flexDirection: 'row'}}>
            <Text style={{width: 150, color: Color.n_default_orange, fontFamily: 'THSarabunNew', fontSize: 24, fontWeight: 'bold'}}>{strLesson}:</Text>
            <Text style={{flex: 1, color: Color.n_default_orange, fontFamily: 'THSarabunNew', fontSize: 24}}>{srtTopic}</Text>
          </View>

          <View style={{marginTop: 20, marginHorizontal: 30, flexDirection: 'row'}}>
            <Text style={{width: 150, color: Color.n_default_orange, fontFamily: 'THSarabunNew', fontSize: 24, fontWeight: 'bold'}}>{translang.t('HOMEWORK_classlevel')}:</Text>
            <DropDownPicker
              arrowColor={Color.n_default_orange}
              items={dropdownRoomItems}
              defaultValue={this.state.selRoom.value}
              style={styles.dropdownPicker}
              itemStyle={{ justifyContent: 'flex-start' }}
              containerStyle = {styles.dropdownPickerContainer}
              labelStyle={styles.dropdownPickerLabel}
              dropDownStyle={styles.dropDown}
              onChangeItem={ item => {
                this.setState({selRoom: item});
              }}
            />
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', height: 60, width: '100%', paddingHorizontal: 30, marginTop: 20, zIndex: -1}}>
            <CustomTextSearch
              inputWrapperStyle={{
                height: 50,
                flex: 1,
                borderRadius: 25,
                borderColor: Color.n_default_orange,
                borderWidth: 1,
              }}
              value={searchVal}
              onChangeText={this._onChangeSearchVal}
              clickSearch={()=>{

              }}
              inputStyle={{ fontSize: 27 }}
              placeholder={translang.t('Search')}
              placeholderTextColor={Color.n_default_orange}
            />
          </View>
          { dataList.length > 0 &&
            <FlatList style={styles.list}
              data={dataList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item, index}) => this.renderClassItem(item, index)}
            />
          }
          { dataList.length === 0 &&
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={styles.emptyText}>{translang.t('NO_DATA')}</Text>
            </View>
          }

        </View>

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
  titleContainer: {
    width: '100%',
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.bluegray,
  },
  title: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    color: Color.n_default_orange,
    marginHorizontal: 20,
  },
  list: {
    flex: 1,
    zIndex: -1,
  },
  listItem: {
    height: 100,
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
    marginVertical: 10,
    marginHorizontal: 15,
    paddingLeft: 10,
  },
  itemText: {
    fontSize: 24,
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray
  },
  itemAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 8,
  },
  statusCircle: {
    width: 85,
    height: '100%',
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    marginHorizontal: 5,
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    fontWeight: '300',
    color: Color.white,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray,
  },

  dropdownPicker: {
    backgroundColor: Color.white,
    shadowColor: 'black',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    elevation: 13,
    borderColor: Color.n_default_orange,
    borderWidth: 1,
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
    borderBottomLeftRadius: 23,
    borderBottomRightRadius: 23,

  },
  dropdownPickerContainer: {
    flex: 1,
    height: 45,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  dropDown: {
    backgroundColor: Color.white,
    shadowColor: 'black',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    elevation: 13,
    borderBottomLeftRadius: 23,
    borderBottomRightRadius: 23,
    borderWidth: 1,
    borderColor: Color.n_default_gray,
  },
  dropdownPickerLabel: {
    fontSize: 23,
    fontFamily: 'THSarabunNew',
    color: Color.n_default_orange,
  },

});
