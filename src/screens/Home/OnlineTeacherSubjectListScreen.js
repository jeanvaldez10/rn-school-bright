import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, FlatList,Modal, RefreshControl } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationBar from '../../components/NavigationBar';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import moment from 'moment';

import BackNavigationBar from '../../components/BackNavigationBar';
import SwitchSelector from 'react-native-switch-selector';
import Color from '../../constants/color';
import GradientButton from '../../components/GradientButton';
import { ScrollView } from 'react-native-gesture-handler';

export default class OnlineTeacherSubjectListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      isLoading: false,
      modalBody: "",

      lessonList: [],
      userInfo: {},
      selectedYear: {},
      selectedSemster: {},
      selectedClassLevel: {},

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

      console.log("OnlineTeacherSubjectList");

      const userInfo = this.props.navigation.getParam('userInfo');
      const year = this.props.navigation.getParam('year');
      const semster = this.props.navigation.getParam('semester');
      const classlevel = this.props.navigation.getParam('classlevel');

      this.setState({ userInfo: userInfo, selectedYear: year, selectedSemster: semster, selectedClassLevel: classlevel}, () => {
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

    this.props.navigation.navigate('OnlineTeacher');
  };

  loadData = async () => {

    const schoolId = this.state.userInfo.SchoolID;
    const teacherID = this.state.userInfo.ID;
    const year = this.state.selectedYear.YearNumber;
    const termId = this.state.selectedSemster.ID;
    let levelId = this.state.selectedClassLevel.ID;
    if(this.state.selectedClassLevel.ID == "ALL"){
      levelId = "";
    }

    this.setState({isLoading: true})
    ApiManager.getOnlineSubjectList(schoolId, teacherID, year, termId,levelId).then(data => {
      let res = [];
      data.forEach((item, index)=>{
        const temp = res.filter((itemA)=>itemA.LevelID === item.LevelID);
        if(temp.length> 0){
          const exsitItem = temp[0];
          exsitItem.data.push(item);
        }else{
          let levelName = item.LevelName;
          if(getCurrentLocale() == 'en' && item.LevelNameEn && item.LevelNameEn != ""){
            levelName = item.LevelNameEn;
          }

          let classItem = {};
          classItem.LevelID = item.LevelID;
          classItem.LevelName = levelName;
          classItem.data = [];
          classItem.data.push(item);

          res.push(classItem)
        }
      });
      this.setState({lessonList: res,isLoading: false });
    }).catch(error => {
      console.error("SubjectListError: ", error);
      this.setState({ isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN') });
    });
  };

  renderLesson = (item, index) =>{
    let name = "";
    let lessonID = "";

    if(item){
      name = item.PlaneName
      lessonID = item.CourseCode

      if(getCurrentLocale() == 'en' && item.PlaneNameEn && item.PlaneNameEn != ""){
        name = item.PlaneNameEn;
      }
      if(getCurrentLocale() == 'en' && item.CourseCodeEn && item.CourseCodeEn != ""){
        lessonID = item.CourseCodeEn;
      }
    }

    return (
      <TouchableOpacity activeOpacity={0.5} onPress={() => { this.onClickLesson(item) }} >
        <View style={{backgroundColor: Color.n_default_orange_light, borderRadius: 15, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', paddingVertical: 20, marginBottom: 20}}>
          <Text style={{color: Color.n_default_gray, fontFamily: 'THSarabunNew', fontSize: 20}}>{lessonID}</Text>
          <Text style={{color: Color.n_default_gray, fontFamily: 'THSarabunNew', fontSize: 25, marginTop: 10}}>{name}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  renderClassLevel = (indexCL) => {
    const itemCL = this.state.lessonList[indexCL];

    let classLevel = ""
    let lessonlist = []
    if(itemCL){
      classLevel = itemCL.LevelName
      lessonlist = itemCL.data
    }

    return (
      <View>
        <View style={{borderRadius: 5, backgroundColor: Color.n_default_orange, paddingHorizontal: 15, alignSelf: 'flex-start', marginTop: 20}}>
          <Text style={{color: Color.white, fontFamily: 'THSarabunNew', fontSize: 35, fontWeight: 'bold', backgroundColor: Color.n_default_orange}}>{classLevel}</Text>
        </View>

        <FlatList
          style={styles.menuContainer}
          data={lessonlist}
          scrollEnabled = {false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => this.renderLesson(item, index)}
        />
      </View>
    );
  };

  onClickLesson = (item) => {
    this.props.navigation.navigate('OnlineTeacherLessonList', { subject: item, userInfo: this.state.userInfo});
  };

  render() {
    const {selectedYear, selectedSemster, selectedClassLevel} = this.state

    let strYear = ""
    if(selectedYear){
      strYear = selectedYear.name
      if(getCurrentLocale() == 'en' && selectedYear.nameEn && selectedYear.nameEn != ''){
        strYear = selectedYear.nameEn;
      }
    }

    let strSemster = ""
    if(selectedSemster){
      strSemster = selectedSemster.name
    }

    let strClasslevel = ""
    if(selectedClassLevel){
      if(getCurrentLocale() == 'en'){
        strClasslevel = selectedClassLevel.NameEN
      }else{
        strClasslevel = selectedClassLevel.NameTH
      }
    }

    return (
      <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
        <BackNavigationBar
          title={translang.t('DRAWER_onlineclassroom')}
          onMenuTap={() => this.back()}
        />
        <View style={styles.container}>
          <View style = {{paddingHorizontal: 35, marginTop: 20}}>
            <View style={{flexDirection: 'row'}}>
              <Text style={{...styles.headerTextStyle, width: 150}}>{`${translang.t('ACADEMIC_year2')}`}</Text>
              <Text style={{...styles.headerTextStyle}}>{`${strYear}`}</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text style={{...styles.headerTextStyle, width: 150}}>{`${translang.t('ACADEMIC_semester2')}`}</Text>
              <Text style={{...styles.headerTextStyle}}>{`${strSemster}`}</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text style={{...styles.headerTextStyle, width: 150}}>{`${translang.t('LEAVE_class')}`}</Text>
              <Text style={{...styles.headerTextStyle}}>{`${strClasslevel}`}</Text>
            </View>
            <View style={{height: 4, borderRadius: 2, backgroundColor: Color.n_default_brown, marginTop: 20,}}/>
          </View>

          { this.state.lessonList.length > 0 &&
            <FlatList
              style={{paddingTop: 10, paddingHorizontal: 35, marginBottom: 25}}
              data={this.state.lessonList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item, index}) => this.renderClassLevel(index)}
            />
          }
          { this.state.lessonList.length === 0 &&
            <View style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{fontFamily: 'THSarabunNew', fontSize: 30}}>{translang.t('NO_DATA')}</Text>
            </View>
          }
        </View>
        <ProgressHud isVisible={this.state.isLoading} />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
  },

  headerTextStyle: {
    fontFamily: 'THSarabunNew',
    color: Color.n_default_orange,
    fontSize: 23,
    fontWeight: 'bold'
  },

  menuContainer: {
    marginTop: 10,
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
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 5,
    },
    shadowOpacity: 0.25,
    elevation: 5,
    overflow: 'hidden',
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
    alignItems: 'center'
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
});
