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

export default class OnlineStudentSubjectListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      isLoading: false,
      modalBody: "",

      lessonList: [],

      userInfo: {},
      selTerm: {},
      selYear: {},

      userTermInfo: {}

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
      console.log('OnlineStudentSubjectListScreen');
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const userInfo = this.props.navigation.getParam('userInfo');
      const selTerm = this.props.navigation.getParam('term');
      const selYear = this.props.navigation.getParam('year');

      this.setState({userInfo, selTerm, selYear}, ()=>{
        this.loadTermData();
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

    this.props.navigation.navigate('OnlineStudent');
  };

  loadTermData = async () => {
    const schoolId = this.state.userInfo.SchoolID;
    const studentid = this.state.userInfo.ID;
    const year = this.state.selYear.Yearid;

    this.setState({isLoading: true})
    ApiManager.getUserTermInfoByYear(schoolId, studentid, year).then(data => {
      const temp = data.filter(item=>item.TermID==this.state.selTerm.ID);
      if(temp != null && temp != undefined && temp.length > 0){
        this.setState({userTermInfo: temp[0], isLoading: false}, ()=>{
          this.loadData();
        });
      }
    }).catch(error => {
      console.error("loadTermData: ", error);
      this.setState({ isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN') });
    });
  };

  loadData = async () => {
    const schoolid = this.state.userInfo.SchoolID;
    const studentid = this.state.userInfo.ID;
    const term = this.state.userTermInfo.TermID;
    const level = this.state.userTermInfo.LevelID;
    const level2 = this.state.userTermInfo.Level2ID;

    ApiManager.getOnlineSubjectListForStudent(schoolid, studentid, term, level,level2).then(data => {
      this.setState({lessonList: data,isLoading: false });
    }).catch(error => {
      console.error("SubjectListError: ", error);
      this.setState({ isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN') });
    });
  };

  renderLesson = (item, index) =>{
    let name = "";
    let lessonID = "";
    let isNew = item.IsNew ?? false;
    if(item){
      name = item.Subject;
      lessonID = item.code;

      if(getCurrentLocale() == 'en' && item.SubjectEn && item.SubjectEn != ""){
        name = item.SubjectEn;
      }

      if(getCurrentLocale() == 'en' && item.codeEn && item.codeEn != ""){
        lessonID = item.codeEn;
      }
    }

    return (
      <View>
        <TouchableOpacity style={styles.itemContainer} activeOpacity={0.5} onPress={() => { this.onClickLesson(item) }} >
          {isNew && <View style={{position: 'absolute', right: 10, top: 10, backgroundColor: Color.n_default_orange, paddingVertical: 2, paddingHorizontal: 15, borderRadius: 15}}>
            <Text style={{color: Color.white, fontFamily: 'THSarabunNew', fontSize: 20}}>{translang.t('NEW')}</Text>
          </View>}
          <Text style={{color: Color.n_default_gray, fontFamily: 'THSarabunNew', fontSize: 20}}>{lessonID}</Text>
          <Text style={{color: Color.n_default_gray, fontFamily: 'THSarabunNew', fontSize: 25, marginTop: 10}}>{name}</Text>
        </TouchableOpacity>
      </View>

    );
  }

  onClickLesson = (item) => {
    // this.props.navigation.navigate('OnlineStudentLessonList', { subject: item, userInfo: this.state.userInfo});
    const param = {
      subject: item,
      userInfo: this.state.userInfo,
      userTermInfo: this.state.userTermInfo,
      academicYear: this.state.selYear.YearNumber,
    };
    this.props.navigation.navigate('OnlineStudentLessonList', param);
    // this.props.navigation.navigate('OnlineStudentTopicList', param);
  };

  render() {
    const {userTermInfo} = this.state;

    let termName = "";
    let classLevelName = "";
    if(userTermInfo){
      termName = userTermInfo.Term;
      classLevelName = userTermInfo.LevelName;

      if(getCurrentLocale() == 'en' && userTermInfo.LevelNameEn && userTermInfo.LevelNameEn != ""){
        classLevelName = userTermInfo.LevelNameEn;
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
              <Text style={{...styles.headerTextStyle}}>{`${this.state.selYear.YearNumber ?? ''}`}</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text style={{...styles.headerTextStyle, width: 150}}>{`${translang.t('ACADEMIC_semester2')}`}</Text>
              <Text style={{...styles.headerTextStyle}}>{`${this.state.userTermInfo.Term ?? ""}`}</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text style={{...styles.headerTextStyle, width: 150}}>{`${translang.t('LEAVE_class')}`}</Text>
              <Text style={{...styles.headerTextStyle}}>{classLevelName}</Text>
            </View>
            <View style={{height: 4, borderRadius: 2, backgroundColor: Color.n_default_brown, marginTop: 20,}}/>
          </View>

          { this.state.lessonList.length > 0 &&
            <FlatList
              style={styles.menuContainer}
              data={this.state.lessonList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item, index}) => this.renderLesson(item, index)}
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

  itemContainer: {
    position: 'relative',
    height: 110,
    marginHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 5,
    },
    shadowOpacity: 0.25,
    elevation: 5,
    marginVertical: 8,
    backgroundColor: Color.n_default_orange_light
  },

  menuContainer: {
    marginTop: 10,
    marginBottom: 35,
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
