import React from 'react';
import {View, BackHandler, TouchableOpacity, FlatList, Image, ScrollView} from 'react-native';
import {Col, Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import { SafeAreaView } from 'react-native-safe-area-context';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import BackNavigationBar from '../../components/BackNavigationBar';
import Color from '../../constants/color';
import ApiManager from '../../managers/ApiManager';
import moment from 'moment';
import CustomSwitcher from '../../components/CustomSwitcher';
import ProgressHud from '../../components/ProgressHud';
export default class OnlineStudentTopicListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selSubject: {},
      selLesson: {},
      academicYear: "2654",

      isLoading: false,
      userInfo: {},
      userTermInfo: {},
      groupId: "",
      tabIndex: 0,

      showNotFinishList: true,
      showFinishList: true,

      homeworklist: [],
      filteredHomeworkList: {finish: [], notfinish: []},
      learningList: [],
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

      console.log("OnlineStudentTopicListScreen");
      const userInfo = this.props.navigation.getParam('userInfo');
      const subject = this.props.navigation.getParam('subject');
      const userTermInfo = this.props.navigation.getParam('userTermInfo');
      const lessonData = this.props.navigation.getParam('lessonData');
      const academicYear = this.props.navigation.getParam('academicYear');

      const groupId = this.props.navigation.getParam('groupId');


      this.setState({ userInfo: userInfo, selSubject: subject, academicYear: academicYear, selLesson: lessonData, userTermInfo: userTermInfo, groupId: groupId}, () => {
        this.loadData();
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

    this.props.navigation.navigate('OnlineStudentLessonList');

  };

  loadData = () => {
    const schoolid = this.state.userInfo.SchoolID;
    const studentid = this.state.userInfo.ID;
    const termId = this.state.userTermInfo.TermID;
    const level1 = this.state.userTermInfo.LevelID;
    const level2 = this.state.userTermInfo.Level2ID;
    const subjectId = this.state.selSubject.SubjectId;

    this.setState({isLoading: true})
    ApiManager.getOnlineLessonListForStudent(schoolid, studentid, termId, level1, level2, subjectId).then(data => {
      let res = data.filter(item=>(item.GroupID == this.state.groupId));
      if(res.length > 0){
        res = res[0];
      }else{
        res = null
      }
      let res_homeworklist = [];
      let res_learningList = [];
      if(res){
        res.List.forEach(item=>{
          if(item.Type == 1){
            res_homeworklist.push(item);
          }else if(item.Type == 2){
            res_learningList.push(item);
          }
        });
      }
      this.setState({homeworklist: res_homeworklist, learningList:res_learningList, isLoading: false}, ()=>{
        this.makeFilter("0")
      });
    }).catch(error => {
      console.error("GetLessonListError: ", error);
      this.setState({ isLoading: false});
    });
  };


  makeFilter = (type) => {
    let tempFiltered = [];
    if(type == "0"){
      tempFiltered = this.state.homeworklist;
    }else if(type == "1"){
      tempFiltered = this.state.homeworklist.filter(item=>item.Status=="1");
    }else if(type == "2"){
      tempFiltered = this.state.homeworklist.filter(item=>item.Status=="2");
    }else if(type == "3"){
      tempFiltered = this.state.homeworklist.filter(item=>item.Status=="3");
    }else if(type == "4"){
      tempFiltered = this.state.homeworklist.filter(item=>item.Status=="4");
    }

    // tempFiltered = tempFiltered.sort((a, b) => b.Deadline - a.Deadline);

    let tmpNotfinished = [];
    let tmpFinished = [];
    tempFiltered.forEach(item=>{
      if(item.Status == "1" || item.Status == "2"){
        tmpNotfinished.push(item);
      }else{
        tmpFinished.push(item)
      }
    })

    this.setState({filteredHomeworkList: {finish: tmpFinished, notfinish: tmpNotfinished}});


  }
  onClickLesson = (item) => {
    const params = {
      userInfo: this.state.userInfo,
      selSubject: this.state.selSubject,
      selLesson: this.state.selLesson,
      selTopic: item,
      type: this.state.tabIndex,
    }
    this.props.navigation.navigate('OnlineStudentHomeworkDetail', params);
  };

  renderItem = (item) => {
    const topic = item;
    let title = topic.Title;

    let time = ""
    let fontSize = 15;
    let backgroundColor = Color.white;
    let statusColor = Color.white;
    let statusText = "";
    let scoreText = "";

    let displaydate = "";
    if(topic.DisplayDate){
      displaydate = topic.DisplayDate
    }

    if(topic.Type == 1){
      time = translang.t('DEADLINE') +": "+ moment(topic.Deadline).format('DD MMM YYYY');
      fontSize = 18;
      if(topic.Status == "1"){
        statusColor = Color.n_default_brown;
        statusText = translang.t("PENDING");
        backgroundColor = Color.n_default_orange_light;
        scoreText = ""
      }else if(topic.Status == "2"){
        statusColor = Color.n_scorpion;
        statusText = translang.t("ONLINE_OVERDUE");
        backgroundColor = Color.white;
        scoreText = ""
      }else if(topic.Status == "3"){
        statusColor = Color.n_button_gradient_green_end;
        statusText = translang.t("SUBMITTED");
        backgroundColor = Color.white;
        scoreText = ""
        if(topic.Score > 0){
          scoreText = topic.Score + " / " + topic.MaxScore;
        }
      }else if(topic.Status == "4"){
        scoreText = ""
        statusColor = Color.n_default_orange;
        statusText = translang.t("SUBMITTED_LATE");
        backgroundColor = Color.white;

        if(topic.Score > 0){
          scoreText = topic.Score + " / " + topic.MaxScore;
        }
      }
    }else{
      time = moment(topic.DisplayDate).format('DD MMM YYYY');
      fontSize = 20;
      backgroundColor = Color.n_default_orange_light;
    }

    return (
      <TouchableOpacity style={{...styles.itemContainer, backgroundColor: backgroundColor}} activeOpacity={0.5} onPress={() => { this.onClickLesson(item) }} >
        <View style={styles.menuItem} >
          <View style={{...styles.imageContainer}}>
            <Image source={Images.n_ic_homework_blue} style={styles.image}></Image>
          </View>
          <View style={{ flex: 1, marginLeft: 20}}>
            <Text style={styles.topText}>{title}</Text>
            {this.state.tabIndex == 0 &&
            <Text style={{...styles.bottomText, fontSize: fontSize}}>{time}</Text>}
          </View>
          {topic.Type == 1 &&
          <View style={{width: '25%',backgroundColor: statusColor, height: 110, justifyContent: 'center', alignItems: 'center', borderTopRightRadius: 15, borderBottomRightRadius: 15}}>
            <Text style={{...styles.statusText}}>{statusText}</Text>
            {scoreText != "" &&
            <Text style={{...styles.statusText,fontSize: 30, marginTop: 5}}>{scoreText}</Text>}
          </View>}
        </View>
      </TouchableOpacity>
    );
  };

  onChangeSwitcher = (index) => {
    this.setState({tabIndex: index});
  }

  render() {
    const {filteredHomeworkList, learningList, tabIndex, selSubject} = this.state
    const options = [
      { title: translang.t('HOMEWORK')},
      { title: translang.t('MATERIAL')}
    ];

    let strSubject = "";
    if(selSubject){
      strSubject = selSubject.Subject
      if(getCurrentLocale() == 'en' && selSubject.SubjectEn && selSubject.SubjectEn != ""){
        strSubject = selSubject.SubjectEn
      }
    }
    let strClassLevel = "";
    if(userInfo){
      strClassLevel = userInfo.StudentClass;
      if(getCurrentLocale() == 'en' && userInfo.StudentClassEN && userInfo.StudentClassEN != ""){
        strClassLevel = userInfo.StudentClassEN
      }
    }


    return (
      <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
        <BackNavigationBar
          title={translang.t('DRAWER_onlineclassroom')}
          onMenuTap={() => this.back()}
          is_more="1"
          actions={[translang.t('NOTIFICATION_all'), translang.t("PENDING"), translang.t("ONLINE_OVERDUE"), translang.t("SUBMITTED"), translang.t("SUBMITTED_LATE")]}
          onMoreTap={(value, index) => {
            if (index === 0){
              this.makeFilter("0");
            }
            else if (index === 1){
              this.makeFilter("1");
            }
            else if (index === 2){
              this.makeFilter("2");
            }
            else if (index === 3){
              this.makeFilter("3");
            }
            else if (index === 4){
              this.makeFilter("4");
            }

          }}
        />

        <CustomSwitcher
          dataList={options}
          selectedIndex={this.state.tabIndex ?? 0}
          onChangedSwitch={(index)=>this.onChangeSwitcher(index)}
          containerStyle = {{marginHorizontal: 15, height: 50, marginTop: 20}}
          radius = {10}
          textSize = {20}
        />

        <View style = {{paddingHorizontal: 35, marginTop: 30}}>
          <View style={{flexDirection: 'row'}}>
            <Text style={{...styles.headerTextStyle, width: 150}}>{`${translang.t('LESSON')}`}</Text>
            <Text style={{...styles.headerTextStyle}}>{this.state.selLesson.GroupName ?? ""}</Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text style={{...styles.headerTextStyle, width: 150}}>{`${translang.t('TIMETABLE_subject')}`}</Text>
            <Text style={{...styles.headerTextStyle}}>{strSubject}</Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text style={{...styles.headerTextStyle, width: 150}}>{`${translang.t('TIMETABLE_room')}`}</Text>
            <Text style={{...styles.headerTextStyle}}>{strClassLevel}</Text>
          </View>
          <View style={{height: 2, borderRadius: 1, backgroundColor: Color.n_default_brown, marginTop: 20,}}/>
        </View>

        <View style={styles.container}>
          {tabIndex == 0 &&
            <ScrollView>
              {filteredHomeworkList.notfinish.length > 0 && <>
                <Text style={{fontFamily: 'THSarabunNew', fontSize: 28, color: Color.n_default_orange, marginLeft: 30, marginTop: 15,  fontWeight: 'bold'}}>{translang.t('NOT_FINISHED')}</Text>
                <FlatList
                  style={styles.menuContainer}
                  data={filteredHomeworkList.notfinish}
                  scrollEnabled={false}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item, index}) => this.renderItem(item)}
                />
              </>}
              {filteredHomeworkList.finish.length > 0 && <>
                <Text style={{fontFamily: 'THSarabunNew', fontSize: 28, color: Color.n_default_orange, marginLeft: 30, marginTop: 15, fontWeight: 'bold'}}>{translang.t('FINISHED')}</Text>
                <FlatList
                  style={styles.menuContainer}
                  data={filteredHomeworkList.finish}
                  scrollEnabled={false}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item, index}) => this.renderItem(item)}
                />
              </>}
            </ScrollView>
          }
          {tabIndex == 1 && <>
            { learningList.length > 0 &&
              <FlatList
                style={styles.menuContainer}
                data={learningList}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => this.renderItem(item)}
              />
            }
            { learningList.length === 0 &&
              <View style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{fontFamily: 'THSarabunNew', fontSize: 20}}>{translang.t('NO_DATA')}</Text>
              </View>
            }
          </>}
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
  menuContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },

  itemContainer: {
    height: 110,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
        width: 2,
        height: 2,
    },
    shadowOpacity: 0.25,
    elevation: 5,
    marginVertical: 8,
  },

  menuItem: {
    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'center',
  },

  imageContainer:{
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Color.white,
    marginLeft: 30,

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    height: 30,
    width: 30,
    resizeMode: 'contain',
  },
  topText: {
    fontFamily: 'THSarabunNew',
    fontSize: 23,
    fontWeight: 'bold',
    color: '#000'
  },
  bottomText: {
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray,
  },
  statusText: {
    marginHorizontal: 5,
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    fontWeight: '300',
    color: Color.white,
    textAlign: 'center',
  },
});
