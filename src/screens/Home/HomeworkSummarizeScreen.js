import React from 'react';
import {
  Image,
  View,
  TouchableOpacity,
  BackHandler,
  ScrollView,
} from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import IconInfoItemSmall from '../../components/IconInfoItemSmall';
import AttachInfoItem from '../../components/AttachInfoItem';
import NextButton from '../../components/NextButton';
import ApiManager from '../../managers/ApiManager';
import Storage from '../../managers/StorageManager';
import ProgressHud from '../../components/ProgressHud';
import moment from 'moment';

import translang, { getCurrentLocale } from '../../utils/language.utils';

const OfferItem = ({ person, navigation, onCheckBoxPress }) => {
  return (
    <View>
      <TouchableOpacity
        onPress={() => navigation.navigate('HomeworkHistoryAttach', { person })}>
        <View style={styles.uperCardChild}>
          <Image source={Images.folder} style={styles.itemIcon} />
          <View>
            <Text style={styles.itemText}>{person}</Text>
          </View>
          <TouchableOpacity
            onPress={() => onCheckBoxPress(person)}
            style={styles.itemActions}>
            <Text style={{ color: '#BE0B12', fontSize: 18, fontWeight: '700' }}>
              {' '}
              ...more{' '}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default class HomeworkSummarizeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalBody: '',
      userInfo: {}, 
      studentList: [], 
      classLevel: {},
      classRoom: {}, 
      classRoomList: [],
      subject: {}, 
      dueDate: '', 
      endDate: '', 
      alertDate: '', 
      alertTime: '', 
      description: '',
      sendType: 1,
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

    const userInfo = await Storage.getUserInfo();
    const studentList = this.props.navigation.getParam('students');
    const classLevel = this.props.navigation.getParam('classLevel');
    const classRoom = this.props.navigation.getParam('classRoom') ?? {};
    const classRoomList = this.props.navigation.getParam('classRoomList') ?? []; 
    const subject = this.props.navigation.getParam('subject');
    const dueDate = this.props.navigation.getParam('dueDate');
    const endDate = this.props.navigation.getParam('endDate');
    const alertDate = this.props.navigation.getParam('alertDate');
    const alertTime = this.props.navigation.getParam('alertTime');
    const description = this.props.navigation.getParam('description');
    const sendType = this.props.navigation.getParam('sendType');

    this.setState({ 
      userInfo: userInfo, 
      studentList: studentList, 
      classLevel: classLevel,
      classRoom: classRoom, 
      classRoomList: classRoomList,
      subject: subject, 
      dueDate: dueDate, 
      endDate: endDate, 
      alertDate: alertDate, 
      alertTime: alertTime, 
      description: description ,
      sendType: sendType,
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

  _renderItem = ({ item }) => {
    return (
      <OfferItem
        person={item}
        navigation={this.props.navigation}
        onCheckBoxPress={this.onCheckBoxPress}
      />
    );
  };

  back = () => {
    this.props.navigation.pop();
  };

  onSubmit = () => {
    let schoolId = this.state.userInfo.SchoolID;
    let levelArray = []
    let userArray = []
    if (this.state.sendType == 1) {
      userArray = this.state.studentList.map(student => student.studentid)
    } else {
      levelArray = this.state.classRoomList.map(classRoom => classRoom.ID);
    }

    const startDate = moment(this.state.startDate).format('MM/DD/YYYY');
    const endDate = moment(this.state.endDate).format('MM/DD/YYYY');
    const alertDate = moment(this.state.alertDate).format('MM/DD/YYYY');
    const alertTime = moment(this.state.alertTime).format('HH:mm');
    const promise = ApiManager.sendHomework(schoolId, levelArray, userArray, this.state.sendType, startDate, endDate, alertDate, alertTime, this.state.description, this.state.subject.plane_id, this.state.userInfo.ID, [], []);

    this.setState({ isLoading: true });
    promise.then(result => {
      this.setState({ isLoading: false, showModal: true, modalBody: translang.t('COMPLETED') });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN') })
    })
  };

  render() {
    const recipients = this.state.studentList.map(student => {
      if (getCurrentLocale() === 'th' || student.studentNameEN.trim() === '') {
        return student.studentName.trim();
      } else {
        return student.studentNameEN;
      }
    })

    const alertImage = this.state.modalBody === translang.t('COMPLETED') ? Images.checked : Images.alert_inbox;
    const alertButtonColor = this.state.modalBody === translang.t('COMPLETED') ? [Color.green_button_next_color1, Color.green_button_next_color2] : [Color.red_orange, Color.soft_red];

    return (
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('HOMEWORK_summarize')}
          onMenuTap={() => this.back()}
        />
        <View style={styles.dispcontainer}>
          <ScrollView>
            <IconInfoItemSmall
              style={{ marginHorizontal: 10, marginVertical: 5 }}
              icon_mark={Images.img_homework}
              label={translang.t('HOMEWORK_subject')}
              value_txt={this.state.subject.plane_id + ' - ' + this.state.subject.scheduleName}
              topTextStyle={styles.title2}
              bottomTextStyle={styles.value2}
              imageSize={40}
            />

            <IconInfoItemSmall
              style={{ marginHorizontal: 10, marginVertical: 5 }}
              icon_mark={Images.ic_send_green}
              label={translang.t('HOMEWORK_send_format')}
              value_txt={this.state.sendType === 1 ? translang.t('HOMEWORK_individual') : translang.t('HOMEWORK_group')}
              topTextStyle={styles.title2}
              bottomTextStyle={styles.value2}
              imageSize={40}
            />
            <IconInfoItemSmall
              style={{ marginHorizontal: 10, marginVertical: 5 }}
              icon_mark={Images.ic_user_blue}
              label={translang.t('HOMEWORK_recipient')}
              value_txt={recipients.join('\n')}
              topTextStyle={styles.title2}
              bottomTextStyle={styles.value2}
              imageSize={40}
            />
            <IconInfoItemSmall
              style={{ marginHorizontal: 10, marginVertical: 5 }}
              icon_mark={Images.ic_new_clock}
              label={translang.t('HOMEWORK_due_date')}
              value_txt={this.state.dueDate}
              topTextStyle={styles.title2}
              bottomTextStyle={styles.value2}
              imageSize={40}
            />
            <IconInfoItemSmall
              style={{ marginHorizontal: 10, marginVertical: 5 }}
              icon_mark={null}
              label={translang.t('HOMEWORK_end_date')}
              value_txt={this.state.endDate}
              topTextStyle={styles.title2}
              bottomTextStyle={styles.value2}
              imageSize={40}
            />
            <IconInfoItemSmall
              style={{ marginHorizontal: 10, marginVertical: 5 }}
              icon_mark={null}
              label={translang.t('HOMEWORK_alert_date')}
              value_txt={this.state.alertDate}
              topTextStyle={styles.title2}
              bottomTextStyle={styles.value2}
              imageSize={40}
            />
            <IconInfoItemSmall
              style={{ marginHorizontal: 10, marginVertical: 5 }}
              icon_mark={null}
              label={translang.t('HOMEWORK_alert_time')}
              value_txt={moment(this.state.alertTime).format('HH:mm')}
              topTextStyle={styles.title2}
              bottomTextStyle={styles.value2}
              imageSize={40}
            />
            <IconInfoItemSmall
              style={{ marginHorizontal: 10, marginVertical: 5 }}
              icon_mark={Images.description}
              label={translang.t('HOMEWORK_description')}
              value_txt={this.state.description}
              topTextStyle={styles.title2}
              bottomTextStyle={styles.value2}
              imageSize={40}
            />
            <IconInfoItemSmall
              style={{ marginHorizontal: 10, marginVertical: 5 }}
              icon_mark={Images.attach_image}
              label={translang.t('HOMEWORK_attachimg')}
              value_txt="-"
              topTextStyle={styles.title2}
              bottomTextStyle={styles.value2}
              imageSize={40}
            />
            {/* <TouchableOpacity
              onPress={() => this.props.navigation.navigate('HomeworkHistoryAttach')}>
              <AttachInfoItem
                style={{ marginHorizontal: 10, marginVertical: 5 }}
                icon_mark={Images.attach_image}
                icon_attach={require("../../assets/images/sample_attach.png")}
                label={translang.t('HOMEWORK_attachimg')}
                topTextStyle={styles.title2}
                bottomTextStyle={styles.attach2}
                imageSize={30}
              />
            </TouchableOpacity> */}
            <IconInfoItemSmall
              style={{ marginHorizontal: 10, marginVertical: 5 }}
              icon_mark={Images.attach_file}
              label={translang.t('HOMEWORK_attachfile')}
              value_txt="-"
              topTextStyle={styles.title2}
              bottomTextStyle={styles.value2}
              imageSize={40}
            />
          </ScrollView>
        </View>
        <NextButton
          label={translang.t('COMMON_submit')}
          containerStyle={{ paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
          buttonStyle={{ borderRadius: 3 }}
          colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
          isVerticalGradient={false}
          _onPress={() => this.onSubmit()} />

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={alertImage}
          message={this.state.modalBody}
          buttonColors={alertButtonColor}
          isVerticalGradient={false}
          onClose={() => {
            if (this.state.modalBody === translang.t('COMPLETED')) {
              this.setState({ showModal: false });
              // this.props.navigation.pop(1);
              if (this.state.sendType === 1) {
                this.props.navigation.navigate('SendIndividual');
              } else {
                this.props.navigation.navigate('SendGroup');
              }
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000025',
  },
  container: {
    height: '100%',
  },
  dispcontainer: {
    flex: 1,
    margin: 10,
    backgroundColor: Color.white,
    borderRadius: 3,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'visible',
  },
  home: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  title2: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold'
  },
  value2: {
    fontFamily: 'THSarabunNew',
    fontSize: 22,
  },
  attach2: {
    width: 100,
    height: 100,
  }
});
