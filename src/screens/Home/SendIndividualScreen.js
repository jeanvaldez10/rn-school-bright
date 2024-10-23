import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, ImageBackground, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import NextButton from '../../components/NextButton';
import Color from '../../constants/color';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationBar from '../../components/NavigationBar';
import CustomModal from '../../components/CustomModal';
import ClassLevelModal from '../../components/SelectListModal';
import ClassModal from '../../components/SelectListModal';
import SubjectModal from '../../components/SelectListModal';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import ApiManager from '../../managers/ApiManager';
import Storage from '../../managers/StorageManager';
import Images from '../../themes/Images';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import BackNavigationBar from '../../components/BackNavigationBar';
import { ScrollView } from 'react-native-gesture-handler';
import ProgressHud from '../../components/ProgressHud';

export default class SendIndividualScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showModal: false,
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
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

    const userInfo = await Storage.getUserInfo();
    this.setState({ userInfo: userInfo }, () => {
      this.getClassLevelData();
    });

    global.onDrawerChanged = this.onDrawerChanged;
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
    this.setState({showClassModal: false, showClassLevelModal: false, showSubjectModal: false, selectedClassRoom: null, selectedClassLevel: null, selectedSubject: null, classRoomList: [], subjectList: []});
  };

  back = () => {
    this.props.navigation.goBack();
  };

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
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
    ApiManager.getSubject(this.state.userInfo.SchoolID, this.state.selectedClassRoom.ID).then(list => {
      this.setState({ subjectList: list });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    })
  }

  getStudentInClass = () => {
    this.setState({ isLoading: true });
    ApiManager.getStudentInClassroom(this.state.userInfo.SchoolID, this.state.selectedClassRoom.ID).then(students => {
      this.setState({ isLoading: false }, () => {
        const params = { classLevel: this.state.selectedClassLevel, classRoom: this.state.selectedClassRoom, subject: this.state.selectedSubject, students: students };
        this.props.navigation.navigate('SendIndividualUserList', params);
      });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    })
  };

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
      this.setState({ showModal: true, modalBody: translang.t('NO_REGISTERED_COURSES') });
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
      const subject = this.state.subjectList[index];
      this.setState({ showSubjectModal: false, selectedSubject: subject })
    }
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
    const subjectList = this.state.subjectList.map(subject => {
      return { title: subject.plane_id + ' - ' + subject.scheduleName }
    });

    let selsubject = '';
    if (selectedSubject != null) {
      selsubject = selectedSubject.plane_id + ' - ' + selectedSubject.scheduleName;
    }

    return (
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_sendindiv')}
          onMenuTap={() => this.back()}
        />

        <ScrollView style={styles.container}>

          <TouchableOpacity onPress={this._onChangeClassLevel} style={styles.bigContainer} activeOpacity={1.0}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ ...styles.title2, textAlign: 'center' }}>{translang.t('HOMEWORK_classlevel')}</Text>
              <Text style={{ ...styles.selectValueText}}>
                {classlevel ? classlevel : translang.t('HOMEWORK_select_classlevel')}
              </Text>
            </View>
            <View style={styles.bottomline} />
          </TouchableOpacity>

          <TouchableOpacity onPress={this._onChangeClass} style={styles.bigContainer} activeOpacity={1.0}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ ...styles.title2, textAlign: 'center' }}>{translang.t('HOMEWORK_class')}</Text>
              <Text style={{ ...styles.selectValueText}}>{selclass ? selclass : translang.t('HOMEWORK_select_class')}</Text>
            </View>
            <View style={styles.bottomline} />
          </TouchableOpacity>

          <TouchableOpacity onPress={this._onChangeSubject} style={styles.bigContainer} activeOpacity={1.0}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ ...styles.title2, textAlign: 'center' }}>{translang.t('HOMEWORK_subject')}</Text>
              <Text style={{ ...styles.selectValueText }}>{selsubject ? selsubject : translang.t('HOMEWORK_select_subject')}</Text>
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
          dialogTtitle={translang.t('HOMEWORK_select_class')}
        />

        <SubjectModal
          isVisible={this.state.showSubjectModal}
          onListSelect={this.onSubjectSelect}
          listData={subjectList}
          dialogTtitle={translang.t('HOMEWORK_select_subject')}
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
