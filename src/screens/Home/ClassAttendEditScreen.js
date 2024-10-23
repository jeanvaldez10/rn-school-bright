import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, ImageBackground, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import NextButton from '../../components/NextButton';
import Color from '../../constants/color';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import CustomModal from '../../components/CustomModal';
import ClassLevelModal from '../../components/SelectListModal';
import ClassModal from '../../components/SelectListModal';
import SubjectModal from '../../components/SelectListModal';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import CalendarModal from '../../components/CalendarModal';
import ApiManager from '../../managers/ApiManager';
import Storage from '../../managers/StorageManager';
import moment from 'moment';
import Images from '../../themes/Images';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import { ScrollView } from 'react-native-gesture-handler';
import ProgressHud from '../../components/ProgressHud';

export default class ClassAttendEditScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showModal: false,
      showCalendarModal: false,
      modalBody: null,
      userInfo: null,
      showClassLevelModal: false,
      showClassModal: false,
      showSubjectModal: false,
      selectedClassLevel: null,
      selectedClassRoom: null,
      selectedSubject: null,
      classLevelList: [],
      classRoomList: [],
      subjectList: [],
      selectedDate: moment(),
      isEdit: true,
    };
  }

  handleBackButton = () => {
    if(this.state.showCalendarModal){
      this.setState({showCalendarModal: false});
    }else{
      this.back();
    }
    return true;
  };

  async componentDidMount() {

    console.log("ClassAttendEdit");
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

    const userInfo = await Storage.getUserInfo();
    this.setState({ userInfo: userInfo, selectedDate: moment() }, () => {
      this.getClassLevelData();
    });

    if (global.onDrawerChanged !== this.onDrawerChanged) {
      global.onDrawerChanged = this.onDrawerChanged;
    }
  }

  componentWillUnmount = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }
    if(this.focusListener){
      this.focusListener.remove();
    }
    global.onDrawerChanged = null;
  };

  onDrawerChanged = () => {
    this.setState({ showClassModal: false, showClassLevelModal: false, showCalendarModal: false, showSubjectModal: false, selectedClassRoom: null, selectedClassLevel: null, selectedSubject: null, selectedDate: moment(), classRoomList: [], subjectList: [] });
  }

  back = () => {
    this.props.navigation.goBack();
  };

  onDateSelected = (date) => {
    if (date == null) {
      this.setState({ showCalendarModal: false });
    } else {
      this.setState({ showCalendarModal: false, selectedDate: moment(date), selectedClassRoom: null, selectedClassLevel: null, selectedSubject: null, classRoomList: [], subjectList: [] });
    }
  }

  __next = async () => {
    const { selectedClassLevel, selectedClassRoom, selectedSubject } = this.state;

    if (selectedClassLevel == null) {
      this.setState({ showModal: true, modalBody: translang.t('SELECT_YOUR_GRADE') });
      return;
    } else if (selectedClassRoom == null) {
      this.setState({ showModal: true, modalBody: translang.t('BEHAVIOR_msg_selectclass') });
      return;
    } else if (selectedSubject === null) {
      this.setState({ showModal: true, modalBody: translang.t('SELECT_SUBJECT') });
      return;
    }

    this.getStudentInClass();
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

  getSubjectData = () => {
    ApiManager.getSubjectWithDate(this.state.userInfo.SchoolID, this.state.selectedClassRoom.ID, this.state.selectedDate).then(list => {
      this.setState({ subjectList: list });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    })
  }

  getStudentInClass = () => {
    this.setState({ isLoading: true });
    ApiManager.getStudentInClassForClassAttendance(this.state.userInfo.SchoolID, this.state.selectedClassRoom.ID, this.state.selectedSubject.scheduleId, this.state.userInfo.ID, this.state.selectedDate).then(students => {
      this.setState({ isLoading: false }, () => {
        const params = {
          classLevel: this.state.selectedClassLevel,
          classRoom: this.state.selectedClassRoom,
          subject: this.state.selectedSubject,
          students: students,
          isEdit: this.state.isEdit,
          selectedDate: this.state.selectedDate,
          userInfo: this.state.userInfo
        };
        this.props.navigation.navigate('ClassAttendStudentList', params);
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
      this.setState({ showClassLevelModal: false, selectedClassLevel: classLevel, selectedClassRoom: null, selectedSubject: null }, () => {
        this.getClassRoomData();
      });
    }
  };

  _onChangeClass = () => {
    if (!this.state.selectedClassLevel) {
      this.setState({ showModal: true, modalBody: translang.t('SELECT_YOUR_GRADE') })
    } else if (this.state.classRoomList.length === 0) {
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
      this.setState({ showClassModal: false, selectedClassRoom: classRoom, selectedSubject: null }, () => {
        this.getSubjectData();
      });
    }
  };

  _onChangeSubject = () => {
    if (!this.state.selectedClassLevel) {
      this.setState({ showModal: true, modalBody: translang.t('SELECT_YOUR_GRADE') })
    } else if (!this.state.selectedClassRoom) {
      this.setState({ showModal: true, modalBody: translang.t('SELECT_CLASS') })
    } else if (this.state.subjectList.length === 0) {
      this.setState({ showModal: true, modalBody: translang.t('HAVE_NOT_ARRANGED_TIME_TABLE') });
    } else {
      this.setState({
        showSubjectModal: true,
      });
    }
  };
  onSubjectSelect = (item, index) => {
    if (item == null) {
      this.setState({ showSubjectModal: false })
    } else {
      this.setState({ showSubjectModal: false, selectedSubject: item })
    }
  };

  renderSubjectListItem = (item, index) => {
    const today = moment().format('yyyy-MM-DD');
    const startTime = moment(today + ' ' + item.timestart).format('HH:mm');
    const endTime = moment(today + ' ' + item.timeend).format('HH:mm');

    let sName = item.scheduleName;
    if(getCurrentLocale() == "en" && item.scheldulNameEN && item.scheldulNameEN != ""){
      sName = item.scheldulNameEN;
    }

    let pName = item.plane_id
    if(getCurrentLocale() == "en" && item.plane_idEN && item.plane_idEN != ""){
      pName = item.plane_idEN;
    }

    return (
      <TouchableOpacity onPress={() => this.onSubjectSelect(item, index)}>
        <Text
          style={{fontFamily: 'THSarabunNew', fontSize: 26 }}>
          { item.scheduleName != null && item.scheduleName !== '' && (
              sName
          )}
        </Text>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text
            style={{ fontFamily: 'THSarabunNew', fontSize: 26 }}>
            {pName}
          </Text>
          <Text
            style={{ fontFamily: 'THSarabunNew', fontSize: 26 }}>
            {`${startTime} - ${endTime}`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    if (global.onDrawerChanged !== this.onDrawerChanged) {
      global.onDrawerChanged = this.onDrawerChanged;
    }

    const { selectedClassLevel, selectedClassRoom, selectedSubject } = this.state;
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

    let selsubject = '';
    if (selectedSubject != null) {
      selsubject = selectedSubject.scheduleName;
      if(getCurrentLocale() == 'en' && selectedSubject.scheldulNameEN && selectedSubject.scheldulNameEN != ""){
        selsubject = selectedSubject.scheldulNameEN;
      }
    }

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_edit_classattend')}
          onMenuTap={() => this.back()}
          is_calendar={true}
          onCalendarTap={() => {
            this.setState({ showCalendarModal: true, });
          }}
        />

        <ScrollView style={{...styles.container, marginTop: -2}}>
          <View style={{height: 40, backgroundColor: Color.n_default_orange, justifyContent: 'center'}}>
            <Text style={styles.titleDate}>{this.state.selectedDate.format('DD MMMM YYYY')}</Text>
          </View>

          <TouchableOpacity onPress={this._onChangeClassLevel} style={styles.bigContainer} activeOpacity={1.0}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ ...styles.title2, textAlign: 'center' }}>{translang.t('BEHAVIOR_classlevel')}</Text>
              <Text style={{ ...styles.selectValueText, color: '#666' }}>
                {classlevel ? classlevel : translang.t('BEHAVIOR_msg_selectclasslevel')}
              </Text>
            </View>
            <View style={styles.bottomline} />
          </TouchableOpacity>

          <TouchableOpacity onPress={this._onChangeClass} style={styles.bigContainer} activeOpacity={1.0}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ ...styles.title2, textAlign: 'center' }}>{translang.t('BEHAVIOR_class')}</Text>
              <Text style={{ ...styles.selectValueText, color: '#666' }}>{selclass ? selclass : translang.t('BEHAVIOR_msg_selectclass')}</Text>
            </View>
            <View style={styles.bottomline} />
          </TouchableOpacity>

          <TouchableOpacity onPress={this._onChangeSubject} style={styles.bigContainer} activeOpacity={1.0}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ ...styles.title2, textAlign: 'center' }}>{translang.t('BEHAVIOR_subject')}</Text>
              <Text style={{ ...styles.selectValueText, color: '#666' }}>
                {selsubject ? selsubject : translang.t('BEHAVIOR_msg_selectsubject')}
              </Text>
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

        <CalendarModal
          isVisible={this.state.showCalendarModal}
          type={'single'}
          onDateSelect={result => this.onDateSelected(result)} />

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.n_ic_warning}
          message={this.state.modalBody}
          buttonColors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
          isVerticalGradient={false}
          onClose={() => { this.setState({ showModal: false }) }}
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

        <SubjectModal
          isVisible={this.state.showSubjectModal}
          onListSelect={this.onSubjectSelect}
          listData={this.state.subjectList}
          renderItem={this.renderSubjectListItem}
          dialogTtitle={translang.t('BEHAVIOR_subject')}
        />
        <ProgressHud isVisible={this.state.isLoading} />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({

  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
    flexDirection: 'column',
  },

  titleDate: {
    fontFamily: 'THSarabunNew',
    fontSize: 22,
    fontWeight: 'bold',
    color: Color.white,
    textAlign: 'center',
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
  bottomline: {
    height: 1,
    width: '100%',
    backgroundColor: Color.n_default_orange,
    position: 'absolute',
    bottom: 35,
  },

  buttonStyle:{
    width: 290,
    marginVertical:20,
    marginLeft: 'auto',
    marginRight: 'auto',
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
});
