import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Color from '../../constants/color';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import Images from '../../themes/Images';
import ProgressHud from '../../components/ProgressHud';
import ClassLevelModal from '../../components/SelectListModal';
import ClassModal from '../../components/SelectListModal';
import SchoolYearModal from '../../components/SchoolYearModal';
import SemesterModal from '../../components/SemesterModal';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import NextButton from '../../components/NextButton';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import { ScrollView } from 'react-native-gesture-handler';

export default class ReportAttendanceCheckInTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showModal: false,
      modalBody: null,
      userInfo: null,
      showClassLevelModal: false,
      showClassModal: false,
      selectedClassLevel: null,
      selectedClassRoom: null,
      classLevelList: [],
      classRoomList: [],

      showSchoolYearModal: false,
      showSemesterModal: false,
      selectedSchoolYear: null,
      selectedSemester: null,
      yearList: [],
      termList: [],

    };
  }

  async componentDidMount() {
    const userInfo = await Storage.getUserInfo();
    this.setState({ userInfo: userInfo }, () => {
      this.getYearList();
      this.getClassLevelData();
    });
  }

  componentWillUnmount = () => {

  };

  getYearList = ()=>{
    ApiManager.getYearSelectGrade(this.state.userInfo.SchoolID).then(data => {
      this.setState({ yearList: data, isLoading: false });
    }).catch(error => {
      console.error("ERRROR", error);
    });
  };
  getTermList = ()=>{
    ApiManager.getTermSelectGrade(this.state.selectedSchoolYear.Yearid, this.state.userInfo.ID).then(data => {
      console.log(data);
      this.setState({termList: data, isLoading: false});
    }).catch(error => {
      console.error(error);
    });
  };

  getClassLevelData = () => {
    ApiManager.getStudentClassLevel(this.state.userInfo.SchoolID).then(list => {
      this.setState({ classLevelList: list });
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

  getStudentInClass = () => {
    this.setState({ isLoading: true });
    ApiManager.getStudentInClassTAFlag(this.state.userInfo.SchoolID, this.state.selectedClassRoom.ID, this.state.userInfo.ID).then(students => {
      this.setState({ isLoading: false }, () => {
        let statusCheck = false;
        students.forEach(student => {
          if (student.statusCheck === true) {
            statusCheck = true;
          }
        });

        if (statusCheck) {
          this.setState({ showModal: true, modalBody: translang.t('COURES_ALREADY_TAKEN_ATTENDANCE') });
        } else {
          const params = { classLevel: this.state.selectedClassLevel, classRoom: this.state.selectedClassRoom, students: students };
          this.props.navigation.navigate('AttendanceCheckInList', params);
        }
      });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    })
  };

  _onChangeClassLevel = () => {
    this.setState({
      showClassLevelModal: true,
    });
  };
  onClassLevelSelect = (item, index) => {
    if (item == null) {
      this.setState({ showClassLevelModal: false })
    } else {
      const classLevel = this.state.classLevelList[index];
      this.setState({ showClassLevelModal: false, selectedClassLevel: classLevel, selectedClassRoom: null }, () => {
        this.getClassRoomData();
      });
    }
  };

  __next = () => {
    const { selectedSchoolYear, selectedSemester, selectedClassLevel, selectedClassRoom } = this.state;

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
    }else if(selectedClassRoom == null){
      this.setState({ showModal: true, modalBody: translang.t('BEHAVIOR_msg_selectclass') });
      return;
    }

    this.props.navigation.navigate('ReportAttendanceCalendar', {selectedSchoolYear:selectedSchoolYear, classLevel: selectedClassLevel, classRoom: selectedClassRoom, userInfo: this.state.userInfo, type: 'class'});
  };

  _onChangeClass = () => {
    if (this.state.classRoomList.length === 0) {
      this.setState({ showModal: true, modalBody: translang.t('NO_CLASSROOM') });
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
      const classRoom = this.state.classRoomList[index];
      this.setState({ showClassModal: false, selectedClassRoom: classRoom })
    }
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
      this.setState({ showSchoolYearModal: false, selectedSchoolYear: item }, ()=>{
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

  render() {
    const { selectedSchoolYear, selectedSemester, selectedClassLevel, selectedClassRoom } = this.state;
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
    if (selectedClassRoom != null) {
      if (getCurrentLocale() === 'th' && selectedClassRoom.NameTH && selectedClassRoom.NameTH !== '') {
        selclass = selectedClassRoom.NameTH;
      } else if (getCurrentLocale() === 'en' && selectedClassRoom.NameEN && selectedClassRoom.NameEN !== '') {
        selclass = selectedClassRoom.NameEN;
      } else {
        selclass = selectedClassRoom.Value;
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
      return { title: classRoom.Value };
    });

    return (
      <View style={styles.container}>
        <ScrollView style={styles.container}>
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

          <TouchableOpacity style={styles.bigContainer} onPress={this._onChangeClassLevel} activeOpacity={1.0}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ ...styles.title2, textAlign: 'center' }}>{translang.t('BEHAVIOR_classlevel')}</Text>
              <Text style={{ ...styles.selectValueText,}}>
                {classlevel ? classlevel : translang.t('BEHAVIOR_msg_selectclasslevel')}
              </Text>
            </View>
            <View style={styles.bottomline} />
          </TouchableOpacity>

          <TouchableOpacity onPress={this._onChangeClass} style={styles.bigContainer} activeOpacity={1.0}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ ...styles.title2, textAlign: 'center' }}>{translang.t('BEHAVIOR_class')}</Text>
              <Text style={{ ...styles.selectValueText }}>{selclass ? selclass : translang.t('BEHAVIOR_msg_selectclass')}</Text>
            </View>
            <View style={styles.bottomline} />
          </TouchableOpacity>
        </ScrollView>

        <NextButton
          label={translang.t('COMMON_next')}
          containerStyle={styles.buttonStyle}
          buttonStyle={{ borderRadius: 40}}
          colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
          isVerticalGradient={false}
          _onPress={() => this.__next()} />

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.n_ic_warning}
          message={this.state.modalBody}
          buttonColors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
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
          dialogTtitle={translang.t('BEHAVIOR_classlevel')}
        />

        <ClassModal
          isVisible={this.state.showClassModal}
          onListSelect={this.onClassSelect}
          listData={classRoomList}
          dialogTtitle={translang.t('BEHAVIOR_class')}
        />
        <ProgressHud isVisible={this.state.isLoading} />
      </View>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white
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
    elevation: 3,
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

  buttonStyle:{
    width: 290,
    marginVertical:30,
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  bottomline: {
    height: 1,
    width: '100%',
    backgroundColor: Color.n_default_orange,
    position: 'absolute',
    bottom: 35,
  },
});
