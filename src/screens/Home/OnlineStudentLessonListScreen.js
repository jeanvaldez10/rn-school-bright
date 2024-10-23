import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, FlatList,Modal, TextInput} from 'react-native';
import {Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import { SafeAreaView } from 'react-native-safe-area-context';
import NotificationIconInfoItem from '../../components/NotificationIconInfoItem';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import BackNavigationBar from '../../components/BackNavigationBar';
import Color from '../../constants/color';
import GradientButton from '../../components/GradientButton';
import CheckBox from 'react-native-checkbox-heaven';
import CustomRadioButtonItem from '../../components/CustomRadioButtonItem';
import ApiManager from '../../managers/ApiManager';

export default class OnlineStudentLessonListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      isLoading: false,

      lessonList: [],

      userInfo: {},
      selectedSubject: {},
      academicYear: "",
      userTermInfo: {},
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

      console.log("OnlineStudentLessonListScreen");
      const userInfo = this.props.navigation.getParam('userInfo');
      const subject = this.props.navigation.getParam('subject');
      const academicYear = this.props.navigation.getParam('academicYear');
      const userTermInfo = this.props.navigation.getParam('userTermInfo');

      this.setState({ userInfo: userInfo, selectedSubject: subject, academicYear: academicYear, userTermInfo: userTermInfo }, () => {
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

    this.props.navigation.navigate('OnlineStudentSubjectList');
  };

  onRefresh() {
    this.setState({isFetching: true,},() => {this.loadData(true);});
  }

  loadData = () => {
    const schoolid = this.state.userInfo.SchoolID;
    const studentid = this.state.userInfo.ID;
    const termId = this.state.userTermInfo.TermID;
    const level1 = this.state.userTermInfo.LevelID;
    const level2 = this.state.userTermInfo.Level2ID;
    const subjectId = this.state.selectedSubject.SubjectId;

    this.setState({isLoading: true});
    ApiManager.getOnlineLessonListForStudent(schoolid, studentid, termId, level1, level2, subjectId).then(data => {
      this.setState({lessonList: data, isLoading: false});
    }).catch(error => {
      console.error("GetLessonListError: ", error);
      this.setState({ isLoading: false});
    });
  };

  renderItem = (index) => {
    const lesson = this.state.lessonList[index];
    let name = "";
    let topic = "";
    let isNew = false;

    if(lesson){
      name = lesson.GroupID;
      topic = lesson.GroupName;
      isNew = lesson.IsRead;
    }

    return (
      <View style={styles.listItem}>
        <TouchableOpacity activeOpacity={0.5} onPress={() => { this.onClickLesson(lesson) }} >
          {!isNew &&
          <View style={{position: 'absolute', top: 20, right: 20, paddingVertical:2, paddingHorizontal: 15, backgroundColor: Color.n_default_orange, borderRadius: 15, zIndex: 2}}>
            <Text style={{color: Color.white, fontFamily: 'THSarabunNew', fontSize: 20}}>{translang.t('NEW')}</Text>
          </View>}
          <NotificationIconInfoItem
            icon={Images.n_ic_homework_blue}
            label={name}
            value_txt={topic}
            dateText={null}
            isRead={false}
            imageStyle={{width: 30, height: 30, borderRadius: 0}}
          />
        </TouchableOpacity>
      </View>
    );
  };

  onClickLesson = (item) => {
    const param = {
      userInfo: this.state.userInfo,
      subject: this.state.selectedSubject,
      userTermInfo: this.state.userTermInfo,
      lessonData: item,
      academicYear: this.state.academicYear,
      groupId: item.GroupID,
    };

    this.props.navigation.navigate('OnlineStudentTopicList', param);
  };

  render() {
    return (
      <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
        <BackNavigationBar
          title={translang.t('DRAWER_onlineclassroom')}
          onMenuTap={() => this.back()}
        />
        <View style={styles.container}>
          { this.state.lessonList.length > 0 &&
            <FlatList
              style={styles.menuContainer}
              data={this.state.lessonList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item, index}) => this.renderItem(index)}
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
  listItem: {
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
    marginVertical: 5,
    marginHorizontal: 10,
  },

  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
  },
  menuContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
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
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 5,
    },
    shadowOpacity: 0.25,
    elevation: 5,
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
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 50,
    marginHorizontal: 5
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

  createTopicTextStyle: {
    fontFamily: 'THSarabunNew',
    fontWeight: 'bold',
    fontSize: 25,
    color: Color.n_default_orange,
    marginTop: 30,
  },

  createTopicViewContainer: {
    borderColor: Color.n_scorpion,
    borderRadius: 10,
    borderWidth: 1,
    width: '100%',
    padding: 3,
    minHeight: 40,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dropdownViewContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 5,
    },
    shadowOpacity: 0.25,
    elevation: 5,
    backgroundColor: 'white',

  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: 'center',
    marginLeft: 10,
    marginVertical: 2,
  },
  checkbox: {
    width: 25,
    height: 25,
  },
  checkboxlabel: {
    color: Color.n_default_orange,
    fontFamily: 'THSarabunNew',
    fontSize: 25,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});
