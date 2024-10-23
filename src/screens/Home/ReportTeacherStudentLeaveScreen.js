import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, ImageBackground, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import NextButton from '../../components/NextButton';
import Color from '../../constants/color';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import SchoolYearModal from '../../components/SchoolYearModal';
import SemesterModal from '../../components/SemesterModal';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import BackNavigationBar from '../../components/BackNavigationBar';
import Storage from '../../managers/StorageManager';
import Images from '../../themes/Images';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import { ScrollView } from 'react-native-gesture-handler';
import ProgressHud from '../../components/ProgressHud';
import ApiManager from '../../managers/ApiManager';
import ClassLevelModal from '../../components/SelectListModal';
import ClassModal from '../../components/SelectListModal';

export default class ReportTeacherStudentLeaveScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showModal: false,
      showSchoolYearModal: false,
      showSemesterModal: false,
      showClassLevelModal: false,
      showClassModal: false,

      selectedSchoolYear: null,
      selectedSemester: null,
      selectedClassLevel: null,
      selectedClass: null,
      userInfo: {},

      yearList: [],
      termList: [],
      classLevelList: [],
      classRoomList: []
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", async () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      userInfo = await Storage.getUserInfo();
      this.setState({userInfo}, ()=>{
        this.getYearList();
        this.getClassLevelData();
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

    const parentRoute = this.props.navigation.getParam('parent') ?? 'ReportForTeacher';
    this.props.navigation.navigate(parentRoute);
  };

  __next = async () => {

    const { selectedSchoolYear, selectedSemester, selectedClassLevel, selectedClass } = this.state;

    if (selectedSchoolYear == null) {
      this.setState({ showModal: true, modalBody: translang.t('ACADEMIC_msg_selectyear') });
      return;
    } else if (selectedSemester == null) {
      this.setState({ showModal: true, modalBody: translang.t('ACADEMIC_msg_selectsemester') });
      return;
    }
    else if (selectedClassLevel == null) {
      this.setState({ showModal: true, modalBody: translang.t('HOMEWORK_select_classlevel') });
      return;
    }else if(selectedClass == null){
      this.setState({ showModal: true, modalBody: translang.t('BEHAVIOR_msg_selectclass') });
      return;
    }
    this.getStudentInClass();
  };

  getStudentInClass = () => {
    this.setState({ isLoading: true });
    ApiManager.getStudentInClassroom(this.state.userInfo.SchoolID, this.state.selectedClass.ID).then(students => {
      this.setState({ isLoading: false }, () => {
        const params = { 
          userInfo: this.state.userInfo,
          year: this.state.selectedSchoolYear,
          semester: this.state.selectedSemester,
          classLevel: this.state.selectedClassLevel, 
          classRoom: this.state.selectedClass, 
          students: students, };
        this.props.navigation.navigate('ReportTeacherStudentLeaveStudentList', params);
      });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    })
  }
  
  getYearList = ()=>{
    this.setState({isLoading: true})
    ApiManager.getYearSelectGrade(this.state.userInfo.SchoolID).then(data => {
      this.setState({ yearList: data, isLoading: false });
    }).catch(error => {
      console.error("ERRROR", error);
    });
  };

  getTermList = ()=>{
    ApiManager.getTermSelectGrade(this.state.selectedSchoolYear.Yearid, this.state.userInfo.ID).then(data => {
      this.setState({termList: data, isLoading: false});
    }).catch(error => {
      console.error(error);
    });
  };

  getClassLevelData = () => {
    this.setState({isLoading: true});
    ApiManager.getStudentClassLevel(this.state.userInfo.SchoolID).then(list => {
      const allItem = {ID: "ALL", NameEN: translang.t('ALL'), NameTH: translang.t('ALL')};
      list.unshift(allItem);
      this.setState({ classLevelList: list, isLoading: false });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };

  getClassRoomData = () => {
    ApiManager.getSchoolClassroom(this.state.userInfo.SchoolID, this.state.selectedClassLevel.ID).then(list => {
      this.setState({ classRoomList: list });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };

  _onChangeSchoolYear = () => {
    this.setState({
      showSchoolYearModal: true,
    });
  };
  onSchoolYearSelect = (item) => {
    if (item == null) {
      this.setState({ showSchoolYearModal: false })
    } else {
      this.setState({ showSchoolYearModal: false, selectedSchoolYear: item, selectedSemester: null }, ()=>{
        this.getTermList();
      })
    }
  };

  _onChangeSemester = () => {
    const { selectedSchoolYear } = this.state;

    if (selectedSchoolYear == null) {
      this.setState({ showModal: true, modalBody: translang.t('ACADEMIC_msg_selectyear') });
      return;
    }

    this.setState({
      showSemesterModal: true,
    });
  };
  onSemesterSelect = (item) => {
    if (item == null) {
      this.setState({ showSemesterModal: false });
    } else {
      this.setState({ showSemesterModal: false, selectedSemester: item });
    }
  };

  _onChangeClassLevel = () => {
    this.setState({showClassLevelModal: true,});
  };
  onClassLevelSelect = (item, index) => {
    if (item == null) {
      this.setState({ showClassLevelModal: false })
    } else {
      const classLevel = this.state.classLevelList[index];
      this.setState({ showClassLevelModal: false, selectedClassLevel: classLevel }, ()=>{
        this.getClassRoomData()
      })
    }
  };

  _onChangeClass = () => {
    if (!this.state.selectedClassLevel) {
      this.setState({ showModal: true, modalBody: translang.t('SELECT_YOUR_GRADE') })
    } else {
      this.setState({
        showClassModal: true,
      });
    }
  };
  onClassSelect = (item, index) => {
    if (item == null) {
      this.setState({ showClassModal: false })
    } else {
      this.setState({selectedClass: this.state.classRoomList[index], showClassModal: false});
    }
  };

  render() {
    const { selectedSchoolYear, selectedSemester, selectedClassLevel, selectedClass } = this.state;
    let schoolyear = '';
    if (selectedSchoolYear != null) {
      schoolyear = selectedSchoolYear.YearNumber;
      if(getCurrentLocale() == 'en' && selectedSchoolYear.YearNumberEn && selectedSchoolYear.YearNumberEn != ''){
        schoolyear = selectedSchoolYear.YearNumberEn;
      }
    }
    let semester = '';
    if (selectedSemester != null) {
      semester = selectedSemester.name;
    }

    let classlevel = '';
    if (selectedClassLevel != null) {
      if (getCurrentLocale() === 'th' && selectedClassLevel.NameTH && selectedClassLevel.NameTH !== '') {
        classlevel = selectedClassLevel.NameTH;
      } else if (getCurrentLocale() === 'en' && selectedClassLevel.NameEN && selectedClassLevel.NameEN !== '') {
        classlevel = selectedClassLevel.NameEN;
      } else {
        classlevel = selectedClassLevel.Value;
      }
    }
    
    let selclass = '';
    if (selectedClass != null) {
      if (getCurrentLocale() === 'th') {
        selclass = selectedClass.NameTH;
      } else if (getCurrentLocale() === 'en') {
        selclass = selectedClass.NameEN;
      } else {
        selclass = selectedClass.NameTH;
      }
    }

    const classLevelList = this.state.classLevelList.map( level => {
      if (getCurrentLocale() === 'th' && level.NameTH && level.NameTH !== '') {
        return { title: level.NameTH };
      } else if (getCurrentLocale() === 'en' && level.NameEN && level.NameEN !== '') {
        return { title: level.NameEN };
      }
      return { title: level.Value };
    });
    const classRoomList = this.state.classRoomList.map( classRoom => {
      if (getCurrentLocale() === 'th' && classRoom.NameTH && classRoom.NameTH !== '') {
        return { title: classRoom.NameTH };
      } else if (getCurrentLocale() === 'en' && classRoom.NameEN && classRoom.NameEN !== '') {
        return { title: classRoom.NameEN };
      }
      return { title: classRoom.NameEN };
    });
    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_leave')}
          onMenuTap={() => this.back()}
        />

        <ScrollView style={styles.containerScroll} contentContainerStyle={{flexGrow: 1}}>
          <TouchableOpacity onPress={this._onChangeSchoolYear} style={styles.bigContainer} activeOpacity={1.0}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ ...styles.title2}}>{translang.t('ACADEMIC_year2')}</Text>
              <Text style={{ ...styles.selectValueText }}>{schoolyear ? schoolyear : translang.t('ACADEMIC_msg_selectyear')}</Text>
            </View>
            <View style={styles.bottomline} />
          </TouchableOpacity>

          <TouchableOpacity onPress={this._onChangeSemester} style={styles.bigContainer} activeOpacity={1.0}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ ...styles.title2 }}>{translang.t('ACADEMIC_semester')}</Text>
              <Text style={{ ...styles.selectValueText}}>{semester ? semester : translang.t('ACADEMIC_msg_selectsemester')}</Text>
            </View>
            <View style={styles.bottomline} />
          </TouchableOpacity>

          <TouchableOpacity onPress={this._onChangeClassLevel} style={styles.bigContainer} activeOpacity={1.0}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ ...styles.title2 }}>{translang.t('HOMEWORK_classlevel')}</Text>
              <Text style={{ ...styles.selectValueText}}>{classlevel ? classlevel : translang.t('HOMEWORK_select_classlevel')}</Text>
            </View>
            <View style={styles.bottomline} />
          </TouchableOpacity>

          <TouchableOpacity onPress={this._onChangeClass} style={styles.bigContainer} activeOpacity={1.0}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ ...styles.title2, textAlign: 'center' }}>{translang.t('HOMEWORK_class')}</Text>
              <Text style={{ ...styles.selectValueText }}>{selclass ? selclass : translang.t('HOMEWORK_select_class')}</Text>
            </View>
            <View style={styles.bottomline} />
          </TouchableOpacity>

          <NextButton
            label={translang.t('COMMON_next')}
            containerStyle={styles.buttonStyle}
            buttonStyle={{ borderRadius: 40}}
            colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
            isVerticalGradient={false}
            _onPress={() => this.__next()} />
        </ScrollView>

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.alert_inbox}
          title=' '
          message={this.state.modalBody}
          buttonColors={[Color.red_orange, Color.soft_red]}
          isVerticalGradient={false}
          onClose={() => { this.setState({ showModal: false }) }}
        />

        <SchoolYearModal
          isVisible={this.state.showSchoolYearModal}
          onSchoolYearSelect={this.onSchoolYearSelect}
          listData = {this.state.yearList}
        />

        <SemesterModal
          isVisible={this.state.showSemesterModal}
          onSemesterSelect={this.onSemesterSelect}
          listData = {this.state.termList}
        />

        <ClassLevelModal
          isVisible={this.state.showClassLevelModal}
          onListSelect={this.onClassLevelSelect}
          listData={classLevelList}
          dialogTtitle = {translang.t('HOMEWORK_classlevel')}
        />
        <ClassModal
          isVisible={this.state.showClassModal}
          onListSelect={this.onClassSelect}
          listData={classRoomList}
          dialogTtitle={translang.t('BEHAVIOR_class')}
        />
        <ProgressHud isVisible={this.state.isLoading} />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
  containerScroll: {
    flex: 1,
    flexDirection: "column",
  },
  bigContainer: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    shadowColor: 'black',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 2,
    justifyContent: 'center',
    minHeight: 200,
  },
  title2: {
    fontFamily: 'THSarabunNew',
    fontSize: 30,
    fontWeight: 'bold',
    color: Color.n_default_orange,

    marginTop: 20,

  },
  selectValueText: {
    width: '100%',
    textAlign: 'center',
    fontFamily: 'THSarabunNew',
    fontSize: 28,
    color: Color.n_default_gray,
    position: 'absolute', 
    bottom: 40,
  },
  bottomline: {
    height: 1, 
    width: '100%', 
    backgroundColor: Color.n_default_orange, 
    position: 'absolute', 
    bottom: 35,
  },

  buttonStyle:{
    width: 290,
    marginVertical:30,
    marginLeft: 'auto',
    marginRight: 'auto',
  }
});
