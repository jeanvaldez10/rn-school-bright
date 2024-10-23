import React, {Component} from 'react';
import {Image, View, Text, TouchableOpacity, ScrollView, FlatList, BackHandler, Dimensions} from 'react-native';
import {DrawerActions} from 'react-navigation-drawer';

import styles from './TimeTableStyle';
import WeekDays from '../../components/weekDays';
import Color from '../../constants/color';
import {SafeAreaView} from 'react-native-safe-area-context';
import Images from '../../themes/Images';
import translang, {getCurrentLocale} from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import BackNavigationBar from '../../components/BackNavigationBar';

import SchoolYearModal from '../../components/SchoolYearModal';
import SemesterModal from '../../components/SemesterModal';
import NextButton from '../../components/NextButton';
import moment from 'moment';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import {expectNoConsoleError} from "react-native/Libraries/Utilities/ReactNativeTestTools";

const {height, width} = Dimensions.get('window');

export default class TimeTableScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDate: null,
      selectedWeekday: 1,
      isLoading: false,
      userInfo: {},
      userTermInfo: null,
      scheduleList: [],

      showAcademicModal: false,
      academicYears: [],
      selAcademicYear: null,

      showSemsterModal: false,
      semsters: [],
      selSemster: null,

      showModal: false,
      modalBody: '',
      loadedSemester: null,
    };
  }


  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

    const userInfo = await Storage.getUserInfo();
    const userTermInfo = await ApiManager.getUserTermInfo(userInfo.SchoolID, userInfo.ID);
    const selWeekday = moment().isoWeekday() - 1;

    const today = new Date();

    this.setState({
      selectedDate: today,
      userInfo: userInfo,
      selectedWeekday: selWeekday,
      userTermInfo: userTermInfo
    }, () => {
      this.getYearList();
      this.getTermList();
    });
  }

  componentWillUnmount() {
    // this.unsubscribe();
    if (this.backhandler) {
      this.backhandler.remove();
    }
  }

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
  };

  back = () => {
    this.props.navigation.navigate("UserInfo");
  };

  getYearList = () => {
    ApiManager.getYearSelectGrade(this.state.userInfo.SchoolID).then(data => {
      let currentYearItem = data.filter(item => item.IsCurrentAcademicYear == true);
      if (currentYearItem && currentYearItem.length > 0) {
        currentYearItem = currentYearItem[0]
      } else {
        currentYearItem = null
      }

      this.setState({academicYears: data, selAcademicYear: currentYearItem}, () => {
        this.getTermList();
      });
    }).catch(error => {
      console.error("getYearSelectGrade ERRROR", error);
    });
  };

  getTermList = () => {
    if (this.state.selAcademicYear) {
      ApiManager.getTermSelectGrade(this.state.selAcademicYear.Yearid, this.state.userInfo.ID).then(data => {
        const currentTermId = this.state.userTermInfo.TermID;
        let curreentTermItem = data.filter(item => item.nTerm == currentTermId);
        if (curreentTermItem && curreentTermItem.length > 0) {
          curreentTermItem = {name: curreentTermItem[0].sTerm, ID: curreentTermItem[0].nTerm};
        } else {
          curreentTermItem = null
        }

        this.setState({semsters: data, selSemster: curreentTermItem, isLoading: false}, () => {
          this.loadData()
        });
      }).catch(error => {
        console.error(error);
      });
    }
  };

  loadData = () => {
    if (this.state.selSemster == null) {
      return;
    }

    const userId = this.state.userInfo.ID;
    const DayOfWeek = this.state.selectedWeekday;
    const termId = this.state.selSemster.ID;
    const userType = this.state.userInfo.cType == '0' ? 0 : 1;

    this.setState({isLoading: true, scheduleList: []});
    ApiManager.getTimeTableList(userId, userType, DayOfWeek, termId)
      .then(list => {
        this.setState({scheduleList: list, isLoading: false, loadedSemester: this.state.selSemster});
      }).catch(error => {
      console.log("getTimeTableList", error);
      this.setState({isLoading: false});
    });
  };

  onDateSelected = (date, index) => {
    this.setState({selectedDate: date, selectedWeekday: index}, () => {
      this.loadData();
    });
  }

  _onChangeAcademicYear = () => {
    this.setState({
      showAcademicModal: true,
    });
  };

  onAcademicYearsSelect = (item) => {
    if (item == null) {
      this.setState({showAcademicModal: false})
    } else {
      this.setState({showAcademicModal: false, selAcademicYear: item, selSemster: null}, () => {
        this.getTermList();
      })
    }
  };

  _onChangeSemsters = () => {
    this.setState({
      showSemsterModal: true,
    });
  };

  onSemsterSelect = (item) => {
    if (item == null) {
      this.setState({showSemsterModal: false})
    } else {
      this.setState({showSemsterModal: false, selSemster: item})
    }
  };

  getStudentInClass = (schedule) => {
    this.setState({isLoading: true});
    ApiManager.getStudentInClassForClassAttendance(this.state.userInfo.SchoolID, schedule.RoomID, schedule.ScheduleId, this.state.userInfo.ID, moment(this.state.selectedDate)).then(students => {
      this.setState({isLoading: false}, () => {
        let alreadyChecked = 0;
        let leave = 0;

        students.forEach(student => {
          if (student.scanstatus == '5' || student.scanstatus == '4') {
            leave++;
          } else if (student.scanstatus == '' || student.scanstatus == '0' || student.scanstatus == '3' || student.scanstatus == '6' || student.scanstatus == '1') {
            alreadyChecked++;
          }
        });

        if (alreadyChecked == "0") {

          const params = {
            classLevel: {},
            classRoom: {'ID': schedule.RoomID, 'NameEN': schedule.ClassNameEN, 'NameTH': schedule.ClassNameTH},
            subject: {
              'scheduleId': schedule.ScheduleId,
              'scheduleName': getCurrentLocale() == 'en' ? schedule.scheduleNameEN : schedule.ScheduleName,
            },
            students: students,
            isEdit: false,
            userInfo: this.state.userInfo,
            fromTimetable: true,
            selectedDate: moment(this.state.selectedDate)
          };
          this.props.navigation.navigate('ClassAttendStudentList', params);
        } else if (alreadyChecked > 0 || leave <= 0) {
          this.setState({showModal: true, modalBody: translang.t('COURES_ALREADY_TAKEN_ATTENDANCE')});
        }
      });
    }).catch(error => {
      console.log(error);
      this.setState({isLoading: false});
    })
  };

  getStudentEditInClass = (schedule) => {
    this.setState({isLoading: true});
    ApiManager.getStudentInClassForClassAttendance(this.state.userInfo.SchoolID, schedule.RoomID, schedule.ScheduleId, this.state.userInfo.ID, moment(this.state.selectedDate)).then(students => {
      this.setState({isLoading: false}, () => {
        const params = {
          classLevel: {},
          classRoom: {'ID': schedule.RoomID, 'NameEN': schedule.ClassNameEN, 'NameTH': schedule.ClassNameTH},
          subject: {
            'scheduleId': schedule.ScheduleId,
            'scheduleName': getCurrentLocale() == 'en' ? schedule.scheduleNameEN : schedule.ScheduleName,
          },
          students: students,
          isEdit: true,
          fromTimetable: true,
          selectedDate: moment(this.state.selectedDate),
          userInfo: this.state.userInfo
        };
        this.props.navigation.navigate('ClassAttendStudentList', params);
      });
    }).catch(error => {
      console.log(error);
      this.setState({isLoading: false});
    })
  };

  renderScheduleItem = (index) => {
    const schedule = this.state.scheduleList[index];
    let scheduleName = schedule.ScheduleName;
    let courseCode = schedule.CourseCodeTH;
    let className = schedule.ClassNameTH;
    let teacherName = schedule.TeacherNameTH;
    const isTeacher = !!this.state.userInfo.StaffID;

    if (getCurrentLocale() == "en" && schedule.TeacherNameEN && schedule.TeacherNameEN.trim() != "") {
      teacherName = schedule.TeacherNameEN;
    }
    if (getCurrentLocale() == "en" && schedule.ClassNameEN && schedule.ClassNameEN.trim() != "") {
      className = schedule.ClassNameEN;
    }
    if (getCurrentLocale() == "en" && schedule.CourseCodeEN && schedule.CourseCodeEN.trim() != "") {
      courseCode = schedule.CourseCodeEN;
    }
    if (getCurrentLocale() == "en" && schedule.scheduleNameEN && schedule.scheduleNameEN.trim() != "") {
      scheduleName = schedule.scheduleNameEN;
    }

    const today = new Date();

    return (
      <View style={styles.card} key={index.toString()}>
        <View style={{flex: 1, justifyContent: 'center'}}>
          <View style={{...styles.cardheader, borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}>
            <View style={styles.cardheaderitems}>
              <Text style={{...styles.cardheaderitemstext, fontWeight: 'bold', fontSize: 24}}>{scheduleName}</Text>
              <Text style={{...styles.cardheaderitemstext, fontWeight: 'bold',}}>{courseCode}</Text>
            </View>
            <View style={{width: 130, marginHorizontal: 15,}}>
              <Text style={{
                ...styles.cardheaderitemstext,
                textAlign: 'right'
              }}>{schedule.TimeIn} - {schedule.TimeOut}</Text>
            </View>
          </View>
          <View style={styles.cardbody}>
            <View style={styles.cardbodytextcontaienr}>
              <Text style={{
                ...styles.cardbodytext,
                width: 120,
                fontWeight: 'bold'
              }}>{translang.t('TIMETABLE_classlevel')} : </Text>
              <Text style={{...styles.cardbodytext, flex: 1}}>{className}</Text>
            </View>
            <View style={styles.cardbodytextcontaienr}>
              <Text style={{
                ...styles.cardbodytext,
                width: 120,
                fontWeight: 'bold'
              }}>{translang.t('TIMETABLE_teacher')} : </Text>
              <Text style={{...styles.cardbodytext, flex: 1}}>{teacherName}</Text>
            </View>
            <View style={styles.cardbodytextcontaienr}>
              <Text style={{
                ...styles.cardbodytext,
                width: 120,
                fontWeight: 'bold'
              }}>{translang.t('TIMETABLE_room')} : </Text>
              <Text style={{...styles.cardbodytext, flex: 1}}>{schedule.RoomName ?? ''}</Text>
            </View>
          </View>
          {isTeacher && this.state.userTermInfo.TermID == this.state.loadedSemester.ID &&
          <View style={{flexDirection: 'row', justifyContent: 'center', marginBottom: 12}}>
            {this.state.selectedDate.getDate() == today.getDate() &&
            <NextButton
              label={translang.t('CEHCK_IN')}
              textStyle={{fontSize: 16,}}
              containerStyle={{alignSelf: 'center'}}
              buttonStyle={{height: 28, borderRadius: 20, paddingHorizontal: 8}}
              touchCustomStyle={true}
              colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_start]}
              isVerticalGradient={false}
              _onPress={() => {
                this.getStudentInClass(schedule);
              }}/>
            }
            {this.state.selectedDate.getDay() <= today.getDay() &&
            <NextButton
              label={translang.t('edit_checkin')}
              textStyle={{fontSize: 16,}}
              containerStyle={{alignSelf: 'center'}}
              buttonStyle={{height: 28, borderRadius: 20, paddingHorizontal: 8}}
              touchCustomStyle={true}
              colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_start]}
              isVerticalGradient={false}
              _onPress={() => {
                this.getStudentEditInClass(schedule)
              }}/>
            }
          </View>
          }
        </View>
      </View>
    );
  };

  renderScheduleList = () => {
    let res = [];
    const {scheduleList} = this.state;
    if (scheduleList && scheduleList.length > 0) {
      this.state.scheduleList.map((item, index) => {
        res.push(this.renderScheduleItem(index))
      })
    }

    return res;
  }

  render() {
    const today = new Date();
    const {selAcademicYear, selSemster, userInfo} = this.state;

    let schoolyear = '';
    if (selAcademicYear != null) {
      schoolyear = selAcademicYear.YearNumber;
      if (getCurrentLocale() == 'en' && selAcademicYear.YearNumberEn && selAcademicYear.YearNumberEn != '') {
        schoolyear = selAcademicYear.YearNumberEn;
      }
    }
    let semester = '';
    if (selSemster != null) {
      semester = selSemster.name;
    }
    const isStudent = this.state.userInfo.StudentId > 0;

    return (
      <SafeAreaView style={styles.constainer} edges={['right', 'left', 'top']}>
        <BackNavigationBar
          title={isStudent ? translang.t('DRAWER_STUDENT_TIMETABLE') : translang.t('DRAWER_TEACHER_TIMETABLE')}
          onMenuTap={() => {
            this.back()
          }}
        />

        <ScrollView style={{...styles.constainer}} indicatorStyle={'black'}>
          <View style={{backgroundColor: Color.n_default_brown_light, paddingHorizontal: 10,}}>
            <View style={{flexDirection: 'row',}}>
              <TouchableOpacity onPress={this._onChangeAcademicYear} style={styles.bigContainer} activeOpacity={1.0}>
                <View style={{flex: 1}}>
                  <Text style={{...styles.title2}}>{translang.t('ACADEMIC_year2')}</Text>
                  <Text
                    style={{...styles.selectValueText}}>{schoolyear ? schoolyear : translang.t('ACADEMIC_year2')} </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={this._onChangeSemsters} style={styles.bigContainer} activeOpacity={1.0}>
                <View style={{flex: 1}}>
                  <Text style={{...styles.title2}}>{translang.t('ACADEMIC_semester')}</Text>
                  <Text
                    style={{...styles.selectValueText}}>{semester ? semester : translang.t('ACADEMIC_semester')} </Text>
                </View>
              </TouchableOpacity>
            </View>

            <NextButton
              label={translang.t('Search')}
              textStyle={{fontSize: 25,}}
              containerStyle={{marginBottom: 20,}}
              buttonStyle={{height: 40, borderRadius: 20,}}
              colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_start]}
              isVerticalGradient={false}
              _onPress={() => this.loadData()}/>

          </View>

          <WeekDays
            currentDate={today}
            selectedDate={this.state.selectedDate}
            onSelectDate={(date, index) => this.onDateSelected(date, index)}/>

          {this.state.scheduleList.length > 0 &&
          <View>
            {this.renderScheduleList()}
          </View>
          }

          {this.state.scheduleList.length === 0 &&
          <View style={{
            justifyContent: 'center',
            alignItems: 'center',
            height: height * 0.4
          }}>
            <Text style={{fontSize: 25, marginVertical: 5, marginHorizontal: 10, color: Color.dark}}>
              {translang.t('NOT_FOUND_DATA')}
            </Text>
          </View>
          }
        </ScrollView>

        <SchoolYearModal
          isVisible={this.state.showAcademicModal}
          onSchoolYearSelect={this.onAcademicYearsSelect}
          listData={this.state.academicYears}
        />

        <SemesterModal
          isVisible={this.state.showSemsterModal}
          onSemesterSelect={this.onSemsterSelect}
          listData={this.state.semsters}
        />

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.n_ic_warning}
          message={this.state.modalBody}
          buttonColors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
          isVerticalGradient={false}
          onClose={() => {
            this.setState({showModal: false})
          }}
        />

        <ProgressHud isVisible={this.state.isLoading}/>
      </SafeAreaView>
    );
  }
}
