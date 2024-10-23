import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import NextButton from '../../components/NextButton';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import Images from '../../themes/Images';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import { AttendanceStatusStudentValueArray } from '../../constants/constants';
import ProgressHud from '../../components/ProgressHud';
import Caretdown from 'react-native-vector-icons/AntDesign';
import ApiManager from '../../managers/ApiManager';
import Storage from '../../managers/StorageManager';

export default class AttendanceCheckInSummaryScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showModal: false,
      modalBody: '',
      expandStatus: {},
      userInfo: null,
      classLevel: null,
      classRoom: null,
      studentList: [],
      isEdit: false,
      sendStudentList: []
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    console.log("attendance checkin summary screen");
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const userInfo = this.props.navigation.getParam('userInfo');
      const studentList = this.props.navigation.getParam('studentList');
      const classLevel = this.props.navigation.getParam('classLevel');
      const classRoom = this.props.navigation.getParam('classRoom');
      const isEdit = this.props.navigation.getParam('isEdit');
      const sendStudentList = this.props.navigation.getParam('sendStudentList');

      this.setState({ userInfo: userInfo, studentList: studentList, classLevel: classLevel, classRoom: classRoom, isEdit: isEdit, sendStudentList: sendStudentList });
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

    this.props.navigation.navigate('AttendanceCheckInList');
  };

  onSubmit = async () => {
    this.setState({ isLoading: true });

    const objectArray = this.state.studentList.map(student => {
      return {UserId: student.UserId, scanstatus: student.scanstatus};
    })
    const json = {rootobject: this.state.sendStudentList};

    console.log(json);

    ApiManager.updateStudentStatusFlag(this.state.userInfo.SchoolID, this.state.userInfo.ID, json).then(result => {
      this.setState({ isLoading: false });
      if (result) {
        this.setState({ showModal: true, modalBody: translang.t('COMPLETED')});
      } else {
        this.setState({ showModal: true, modalBody: translang.t('SELECT_STATUS_AT_LEAST_ONE_PERSON')});
      }
    }).catch(error => {
      this.setState({ isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN')});
    });
  };

  onSelectItem = (index) => {
    this.setState({isStatusChangeModalVisible: true});
  }

  renderHeaderItem = (index) => {
    const value = AttendanceStatusStudentValueArray[index];
    // const AttendanceStatusMapTitle = {
    //   '0': {title: translang.t('ATTENDANCE_STATUS_on_time')},
    //   '1': {title: translang.t('ATTENDANCE_STATUS_late')},
    //   '3': {title: translang.t('ATTENDANCE_STATUS_absence')},
    //   '4': {title: translang.t('ATTENDANCE_STATUS_event')},
    //   '10': {title: translang.t('ATTENDANCE_STATUS_event'),},
    //   '5': {title: translang.t('ATTENDANCE_STATUS_personal_leave')},
    //   '11': {title: translang.t('ATTENDANCE_STATUS_personal_leave'),},
    //   '6': {title: translang.t('ATTENDANCE_STATUS_sick_leave'),},
    //   '12': {title: translang.t('ATTENDANCE_STATUS_sick_leave'),},
    //   '8': {title: translang.t('ATTENDANCE_STATUS_holiday')},
    //   '9': {title: translang.t('ATTENDANCE_STATUS_holiday')},
    //   '21': {title: translang.t('MANTERNITY_LEAVE')},
    //   '22': {title: translang.t('VACATION_LEAVE')},
    //   '23': {title: translang.t('ORDINATION_LEAVE')},
    //   '24': {title: translang.t('MILITARY_SERVICE_LEAVE'),},
    //   '25': {title: translang.t('STUDY_LEAVE')},
    //   '26': {title: translang.t('GOVERNMENT_SERVICE_LEAVE')},
    //   '-1': {title: translang.t('ATTENDANCE_STATUS_undefined')},
    //   '99': {title: translang.t('ATTENDANCE_STATUS_undefined')},
    // };

    const AttendanceStatusTitle = {
      '0': {title: translang.t('ATTENDANCE_STATUS_on_time')},
      '1': {title: translang.t('ATTENDANCE_STATUS_late')},
      '3': {title: translang.t('ATTENDANCE_STATUS_absence')},
      '99': {title: translang.t('ATTENDANCE_STATUS_undefined')},
      '-1': {title: translang.t('ATTENDANCE_STATUS_undefined')},
      '10': {title: translang.t('ATTENDANCE_STATUS_personal_leave')},
      '11': {title: translang.t('ATTENDANCE_STATUS_sick_leave'),},
      '12': {title: translang.t('ATTENDANCE_STATUS_event'),},
      '6': {title: translang.t('ATTENDANCE_STATUS_holiday')},
      '8': {title: translang.t('ATTENDANCE_STATUS_holiday')},
      '9': {title: translang.t('ATTENDANCE_STATUS_holiday')},
    };

    const title = AttendanceStatusTitle[value].title;

    const scanstatus = value === -1 ? '' : value.toString();
    const studentList = this.state.studentList.filter(student => student.scanstatus === scanstatus);

    const count = studentList.length;
    const totalCount = this.state.studentList.length;
    const isExpanded = this.state.expandStatus[value] ?? false;

    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => {
          let expandStatus = this.state.expandStatus;
          expandStatus[value] = !isExpanded;
          this.setState({ expandStatus });
        }}>
        <Text style={{...styles.itemText, flex: 1}}>{title}</Text>
        <Text style={{...styles.itemText, marginHorizontal: 10}}>{`${count}/${totalCount}`}</Text>
        <View style={{width: 20, height: 40, alignItems: 'center', justifyContent: 'center', marginLeft: 5}}>
          {count > 0 && isExpanded &&
            <Caretdown name="caretup" size={15} color={Color.n_default_orange} />
          }
          {count > 0 && !isExpanded &&
            <Caretdown name="caretdown" size={15} color={Color.n_default_orange} />
          }
        </View>
      </TouchableOpacity>
    );
  }

  renderItems = (index) => {
    const statusValue = AttendanceStatusStudentValueArray[index];
    const isExpand = this.state.expandStatus[statusValue] ?? false;

    const scanstatus = statusValue === -1 ? '' : statusValue.toString();
    const studentList = this.state.studentList.filter(student => student.scanstatus === scanstatus);

    if (isExpand) {
      return (
        <View>
          { studentList.map((value, index) => {
            return this.renderItem(value, index)
          })
          }
        </View>
      );
    } else {
      return null;
    }
  };

  renderItem = (student, index) => {

    let profileImage = student.sex === '0' ? Images.man_user : Images.women_user;
    if (student.pic) {
      profileImage = {uri: student.pic};
    }

    let firstName = student.FirstNameTH;
    let lastName = student.LastNameTH;

    if(getCurrentLocale() == 'en' && student.FirstNameEN && student.FirstNameEN != ""){
      firstName = student.FirstNameEN;
    }

    if(getCurrentLocale() == 'en' && student.LastNameEN && student.LastNameEN != ""){
      lastName = student.LastNameEN;
    }

    return (
      <View style={{...styles.listItem, backgroundColor: Color.n_backgroud_gray_light, borderBottomWidth: 0, marginHorizontal: 0,}}>
        <Text style={{...styles.itemText, marginLeft: 20}}>{index + 1}.</Text>
        <Image source={profileImage} style={styles.itemAvatar}></Image>
        <View style={{flexDirection: 'column', flex: 1, height: '100%',  marginLeft: 15,}}>
          <Text style={styles.itemText}>{student.studentId}</Text>
          <Text style={styles.itemText}>{firstName}</Text>
          <Text style={styles.itemText}>{lastName}</Text>
        </View>
      </View>
    );
  };

  render() {
    const { selectedClassLevel, selectedClass } = this.state;
    let classlevel = '';
    if (selectedClassLevel != null) {
      classlevel = selectedClassLevel.name;
    }
    let selclass = '';
    if (selectedClass != null) {
      selclass = selectedClass.name;
    }

    const alertImage = this.state.modalBody === translang.t('COMPLETED') ? Images.n_img_complete_green : Images.n_ic_warning;
    const alertButtonColor = this.state.modalBody === translang.t('COMPLETED') ? [Color.n_button_gradient_green_start, Color.n_button_gradient_green_end] : [Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end];

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={this.state.isEdit?translang.t('DRAWER_edit_checkin') : translang.t('DRAWER_checkin')}
          onMenuTap={() => this.back()}
        />

        <View style={styles.container}>
          <Text style={styles.title}>{translang.t('ATTENDANCE_summary')}</Text>
          <View style={styles.list}>
            <ScrollView>
              { AttendanceStatusStudentValueArray.map((value, index) => {
                return (
                  <View key={index}>
                    { this.renderHeaderItem(index) }
                    { this.renderItems(index) }
                  </View>
                )
              })
              }
            </ScrollView>
          </View>


          <NextButton
            label={translang.t('ATTENDANCE_submit')}
            containerStyle={{width: '90%', marginLeft: 'auto', marginRight: 'auto', marginVertical: 30}}
            buttonStyle={{height: 75, borderRadius: 38 }}
            colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
            isVerticalGradient={false}
            _onPress={() => this.onSubmit()} />
        </View>

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={alertImage}
          message={this.state.modalBody}
          buttonColors={alertButtonColor}
          isVerticalGradient={false}
          onClose={() => {
            if (this.state.modalBody === translang.t('COMPLETED')) {
              this.setState({ showModal: false }, ()=>{
                this.props.navigation.navigate('App');
              });
              // if (this.state.isEdit) {
              //   this.props.navigation.navigate('AttendanceEditCheckin');
              // } else {
              //   this.props.navigation.navigate('AttendanceCheckIn');
              // }
            } else {
              this.setState({ showModal: false });
            }
          }}
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
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  list: {
    flex: 1,
    height: '70%',
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

    marginHorizontal: 15,
    marginBottom: 10,
    paddingTop: 30,
    paddingBottom: 10,

  },
  listItem: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    borderBottomColor: Color.n_default_brown,
    borderBottomWidth: 1,

    marginHorizontal: 30,
    paddingVertical: 10,
    paddingHorizontal: 5,

  },
  itemText: {
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    color: Color.n_default_gray
  },
  itemAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    marginLeft: 25
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
});
