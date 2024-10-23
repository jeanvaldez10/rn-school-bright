import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, ImageBackground, ScrollView, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import NextButton from '../../components/NextButton';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import Images from '../../themes/Images';
import translang from '../../utils/language.utils';
import CustomRadioButtonItem from '../../components/CustomRadioButtonItem';
import CustomTextInput from '../../components/CustomTextInput';
import CalendarModal from '../../components/CalendarModal';
import TimerPickerModal from '../../components/TimerPickerModal';
import ProgressHud from '../../components/ProgressHud';
import moment from 'moment';
import ApiManager from '../../managers/ApiManager';
import Storage from '../../managers/StorageManager';
import _, { times } from 'lodash';

export default class HomeworkFillInfoScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showModal: false,
      modalBody: '',
      showDueDatePicker: false,
      showEndDatePicker: false,
      showAlertDatePicker: false,
      showTimePicker: false,
      dueDate: '',
      endDate: '',
      alertDate: '',
      alertTime: '',
      description: '',
      studentList: [],
      classLevel: {},
      classRoom: {},
      classRoomList: [],
      sendType: 1,
    };
  }
//   alendarModal
//   isVisible={this.state.showDueDatePicker}
//   selectedDate={null}
//   type={'single'}
//   onDateSelect={result => this.onDatePicked('dueDate', result)} />
// <CalendarModal
//   isVisible={this.state.showEndDatePicker}
//   selectedDate={null}
//   type={'single'}
//   onDateSelect={result => this.onDatePicked('endDate', result)} />
// <CalendarModal
//   isVisible={this.state.showAlertDatePicker}
//   selectedDate={null}
//   type={'single'}


  handleBackButton = () => {
    if(this.state.showDueDatePicker){
      this.setState({showDueDatePicker: false});
      return true;
    }

    if(this.state.showEndDatePicker){
      this.setState({showEndDatePicker: false});
      return true;
    }

    if(this.state.showAlertDatePicker){
      this.setState({showAlertDatePicker: false});
      return true;
    }

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

      const userInfo = await Storage.getUserInfo();
      const studentList = this.props.navigation.getParam('students');
      const classLevel = this.props.navigation.getParam('classLevel');
      const classRoom = this.props.navigation.getParam('classRoom');
      const classRoomList = this.props.navigation.getParam('classRoomList');
      const subject = this.props.navigation.getParam('subject');
      const sendType = this.props.navigation.getParam('sendType') ?? 1;
  
      this.setState({ userInfo: userInfo, students: studentList, classLevel: classLevel, classRoom: classRoom, classRoomList: classRoomList, subject: subject, sendType: sendType });
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
    
    this.props.navigation.pop();
  };

  __next = async () => {
    if (this.state.description === '') {
      this.setState({ showModal: true, modalBody: translang.t('PROVIDE_DETAILS') });
      return;
    }
    if (this.state.dueDate === '' || this.state.endDate === '' || this.state.alertDate === '') {
      this.setState({ showModal: true, modalBody: translang.t('SPECIFY_DATE') });
      return;
    }
    if (this.state.alertTime === '') {
      this.setState({ showModal: true, modalBody: translang.t('SPECIFY_TIME') });
      return; 
    }

    const params = { 
      classLevel: this.state.classLevel, 
      classRoom: this.state.classRoom, 
      subject: this.state.subject, 
      students: this.state.studentList,
      dueDate: this.state.dueDate,
      endDate: this.state.endDate,
      alertDate: this.state.alertDate,
      alertTime: this.state.alertTime,
      description: this.state.description,
      sendType: this.state.sendType,
     };
    this.props.navigation.push('HomeworkSummarize', params);
  };

  onDatePicked = (key, date) => {
    if (date === null || date === '') {
      this.setState({showDueDatePicker: false, showEndDatePicker: false, showAlertDatePicker: false});
      return;
    };

    const formattedDate = moment(date).format('DD/MM/YYYY');
    if (key === 'dueDate') {
      this.setState({dueDate: formattedDate, showDueDatePicker: false});
    } else if (key === 'endDate') {
      this.setState({endDate: formattedDate, showEndDatePicker: false});
    } else if (key === 'alertDate') {
      this.setState({alertDate: formattedDate, showAlertDatePicker: false});
    } else {
      this.setState({showDueDatePicker: false, showEndDatePicker: false, showAlertDatePicker: false});
    }
  };

  onTimePicked = (date) => {
    if (date === null) {
      this.setState({showTimePicker: false});
      return;
    }

    this.setState({alertTime: moment(date).format('YYYY-MM-DDTHH:mm'), showTimePicker: false});
  }

  render() {
    const dueDate = this.state.dueDate === '' ? 'Day/Month/Year' : this.state.dueDate;
    const endDate = this.state.endDate === '' ? 'Day/Month/Year' : this.state.endDate;
    const alertDate = this.state.alertDate === '' ? 'Day/Month/Year' : this.state.alertDate;
    const alertTime = this.state.alertTime === '' ? translang.t('HOMEWORK_time') : moment(this.state.alertTime).format('HH:mm');

    return (
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('HOMEWORK_fill_information')}
          onMenuTap={() => this.back()}
        />

        <View style={styles.container}>
          <ScrollView style={styles.list}>
            <View style={styles.listContent}>
              <View style={styles.listItem}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <Text style={styles.itemTitle}>{translang.t('HOMEWORK_due_date')}</Text>
                  <Text style={styles.itemAstro}>*</Text>
                  <Text style={styles.itemTitleColon}>:</Text>
                </View>
                <TouchableOpacity 
                  style={styles.itemDateTimeInput}
                  onPress={() => this.setState({showDueDatePicker: true})}>
                  <Text style={styles.itemDateTimeText}>{dueDate}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.listItem}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <Text style={styles.itemTitle}>{translang.t('HOMEWORK_end_date')}</Text>
                  <Text style={styles.itemAstro}>*</Text>
                  <Text style={styles.itemTitleColon}>:</Text>
                </View>
                <TouchableOpacity 
                  style={styles.itemDateTimeInput}
                  onPress={() => this.setState({showEndDatePicker: true})}>
                  <Text style={styles.itemDateTimeText}>{endDate}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.listItem}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <Text style={styles.itemTitle}>{translang.t('HOMEWORK_alert_date')}</Text>
                  <Text style={styles.itemAstro}>*</Text>
                  <Text style={styles.itemTitleColon}>:</Text>
                </View>
                <TouchableOpacity 
                  style={styles.itemDateTimeInput}
                  onPress={() => this.setState({showAlertDatePicker: true})}>
                  <Text style={styles.itemDateTimeText}>{alertDate}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.listItem}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <Text style={styles.itemTitle}>{translang.t('HOMEWORK_alert_time')}</Text>
                  <Text style={styles.itemAstro}>*</Text>
                  <Text style={styles.itemTitleColon}>:</Text>
                </View>
                <TouchableOpacity 
                  style={styles.itemDateTimeInput}
                  onPress={() => this.setState({showTimePicker: true})}>
                  <Text style={styles.itemDateTimeText}>{alertTime}</Text>
                </TouchableOpacity>
              </View>
              <View style={{...styles.listItem, flexDirection: 'column', alignItems: 'flex-start'}}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <Text style={styles.itemTitle}>{translang.t('HOMEWORK_description1')}</Text>
                  <Text style={styles.itemAstro}>*</Text>
                  <Text style={styles.itemTitleColon1}>:</Text>
                </View>
                <CustomTextInput
                  inputWrapperStyle={{...styles.itemTextInput}}
                  inputStyle={{fontFamily: 'THSarabunNew', fontSize: 24 }}
                  multiline={true}
                  placeholder={translang.t('HOMEWORK_fill_in_the_detail')}
                  onChangeText={text => this.setState({ description: text })}
                />
              </View>
              <View style={{...styles.listItem, flexDirection: 'column', alignItems: 'flex-start'}}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <Text style={styles.itemTitle}>{translang.t('HOMEWORK_attachfile')}</Text>
                </View>
                <View style={{...styles.itemTextInput, flexDirection: 'row', height: 70}}>
                  <View style={{flex: 1}}>

                  </View>
                  <TouchableOpacity style={{alignSelf: 'center', marginHorizontal: 10}}>
                    <Image source={Images.attach_file} style={styles.imageButton}></Image>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{...styles.listItem, flexDirection: 'column', alignItems: 'flex-start'}}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <Text style={styles.itemTitle}>{translang.t('HOMEWORK_attachimg')}</Text>
                </View>
                <View style={{...styles.itemTextInput, flexDirection: 'row', height: 70}}>
                  <View style={{flex: 1}}>

                  </View>
                  <TouchableOpacity style={{alignSelf: 'center', marginHorizontal: 10}}>
                    <Image source={Images.attach_image} style={styles.imageButton}></Image>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
          <NextButton
            label={translang.t('COMMON_next')}
            containerStyle={{ paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
            buttonStyle={{ borderRadius: 3 }}
            colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
            isVerticalGradient={false}
            _onPress={() => this.__next()} />
        </View>

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.alert_inbox}
          message={this.state.modalBody}
          buttonColors={[Color.red_orange, Color.soft_red]}
          isVerticalGradient={false}
          onClose={() => { this.setState({ showModal: false }) }}
        />
        <CalendarModal
          isVisible={this.state.showDueDatePicker}
          selectedDate={null}
          type={'single'}
          onDateSelect={result => this.onDatePicked('dueDate', result)} />
        <CalendarModal
          isVisible={this.state.showEndDatePicker}
          selectedDate={null}
          type={'single'}
          onDateSelect={result => this.onDatePicked('endDate', result)} />
        <CalendarModal
          isVisible={this.state.showAlertDatePicker}
          selectedDate={null}
          type={'single'}
          onDateSelect={result => this.onDatePicked('alertDate', result)} />
        <TimerPickerModal
          isVisible={this.state.showTimePicker}
          selectedTime={moment().format('YYYY-MM-DDTHH:mm')}
          onTimeSelect={result => this.onTimePicked(result)} />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    width: '100%',
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.bluegray,
  },
  title: {
    fontSize: 16,
    fontWeight: '300',
  },
  list: {
    flex: 1,
  },
  listContent: {
    flex: 1,
    marginHorizontal: 10,
    marginVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Color.white,
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  listItem: {
    flexDirection: 'row', 
    alignItems: 'center',
    marginVertical: 4,
  },
  itemTitle: {
    fontFamily: 'THSarabunNew',
    fontSize: 25,
  },
  itemAstro: {
    fontSize: 17, 
    fontWeight: 'bold', 
    color: 'red',
    marginHorizontal: 4,
  },
  itemTitleColon: {
    flex: 1, 
    textAlign: 'right', 
    marginRight: 4
  },
  itemTitleColon1: {
    textAlign: 'right', 
    marginRight: 4
  },
  itemDateTimeInput: {
    flex: 1, 
    borderBottomColor: 'black', 
    borderBottomWidth: 0.5, 
    height: 30, 
    marginVertical: 5, 
    justifyContent: 'center'
  },
  itemDateTimeText: {
    fontFamily: 'THSarabunNew',
    fontSize: 20, 
    textAlign: 'center'
  },
  itemTextInput: {
    width: '100%',
    height: 100,
    marginVertical: 10,
    paddingVertical: 10,
    overflow: 'visible',
    borderRadius: 2,
    borderBottomWidth: 0,
    backgroundColor: Color.white,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  imageButton: {
    height: 50, 
    width: 50, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: 25
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
