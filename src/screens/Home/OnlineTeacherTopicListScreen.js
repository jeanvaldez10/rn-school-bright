import React from 'react';
import {View, BackHandler, TouchableOpacity, FlatList, Image} from 'react-native';
import {Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import { SafeAreaView } from 'react-native-safe-area-context';
import NotificationIconInfoItem from '../../components/NotificationIconInfoItem';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import BackNavigationBar from '../../components/BackNavigationBar';
import Color from '../../constants/color';
import SwitchSelector from 'react-native-switch-selector';
import ApiManager from '../../managers/ApiManager';
import moment from 'moment';
import CustomSwitcher from '../../components/CustomSwitcher';
import ProgressHud from '../../components/ProgressHud';

export default class OnlineTeacherTopicListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      selSubject: {},
      selLesson: {},

      userInfo: {},
      tabIndex: 0,

      topicList: [],
      homeworkList: [],
      lessonList: [],

      showAddMenu: false,
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

      console.log("OnlineTeacherTopicListScreen");
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const userInfo = this.props.navigation.getParam('userInfo');
      const lesson = this.props.navigation.getParam('lesson');
      const subject = this.props.navigation.getParam('subject');


      this.setState({ userInfo: userInfo, selSubject: subject, selLesson: lesson}, () => {
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

    this.props.navigation.navigate('OnlineTeacherLessonList');
  };


  loadData = () => {
    this.setState({isLoading: true});
    const schoolID = this.state.userInfo.SchoolID;
    const teacherID = this.state.userInfo.ID;
    const termID = this.state.selSubject.TermID;
    const planeID = this.state.selSubject.PlaneID;
    const levelID = this.state.selSubject.LevelID;
    const groupId = this.state.selLesson.Id;


    this.setState({isLoading: true})



    // ApiManager.OnlineHomeworkAndLessonList(schoolID, teacherID, termID, planeID, levelID).then(data => {
    //   const homeworklist = data.data.HomeworkList;
    //   const lessonlist = data.data.LessonList;

    //   homeworklist.forEach((item, index) => {
    //     item.showDropdown = false
    //   })
    //   lessonlist.forEach((item, index) => {
    //     item.showDropdown = false
    //   })

    //   if(this.state.tabIndex == 0){
    //     this.setState({topicList: homeworklist, homeworkList: homeworklist, lessonList: lessonlist, isLoading: false });
    //   }else{
    //     this.setState({topicList: lessonlist, homeworkList: homeworklist, lessonList: lessonlist, isLoading: false  });
    //   }
    // }).catch(error => {
    //   console.error("OnlineHomeworkAndLessonList: ", error);
    //   this.setState({ isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN') });
    // });

    ApiManager.OnlineHomeworkAndLessonListSecond(schoolID, groupId).then(data => {
      const homeworklist = data.data.HomeworkList;
      const lessonlist = data.data.LessonList;

      homeworklist.forEach((item, index) => {
        item.showDropdown = false
      })
      lessonlist.forEach((item, index) => {
        item.showDropdown = false
      })

      if(this.state.tabIndex == 0){
        this.setState({topicList: homeworklist, homeworkList: homeworklist, lessonList: lessonlist, isLoading: false });
      }else{
        this.setState({topicList: lessonlist, homeworkList: homeworklist, lessonList: lessonlist, isLoading: false  });
      }
    }).catch(error => {
      console.error("OnlineHomeworkAndLessonSecondList: ", error);
      this.setState({ isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN') });
    });

  };

  onClickLesson = (item) => {
    if(this.state.tabIndex == 0){
      const params = {
        userInfo: this.state.userInfo,
        selSubject: this.state.selSubject,
        selLesson: this.state.selLesson,
        selClassLevel: this.state.selClassLevel,
        selTopic: item,
      }

      this.props.navigation.navigate('OnlineTopicMain', params);
    }
    // else{
    //   const params = {
    //     userInfo: this.state.userInfo,
    //     selLesson: item,
    //   }
    //
    //   this.props.navigation.navigate('OnlineTeacherLessonDetail', params);
    // }
  };

  onClickAdd = () => {
    this.setState({showAddMenu: !this.state.showAddMenu})
  }

  onClickAddHomework = () => {
    this.setState({showAddMenu: false})
    const params = {
      userInfo: this.state.userInfo,
      selSubject: this.state.selSubject,
      selLesson: this.state.selLesson,
      type: 'homework',
      forceRefresh: true,
    }
    this.props.navigation.navigate('OnlineAddLesson', params);
  }

  onClickAddMaterial = () => {
    this.setState({showAddMenu: false})
    const params = {
      userInfo: this.state.userInfo,
      selSubject: this.state.selSubject,
      selLesson: this.state.selLesson,
      type: 'material',
      forceRefresh: true,
    }
    this.props.navigation.navigate('OnlineAddLesson', params);
  }

  onClickItemThreedot = (selItem) => {
    let temp = this.state.topicList;
    const idx = temp.findIndex((item)=>item==selItem);
    for(i = 0; i < temp.length; i++){
      if(i == idx){
        temp[i].showDropdown = !temp[i].showDropdown
      }else{
        temp[i].showDropdown = false
      }
    }
    this.setState({topicList: temp});
  }

  itemMenuClick = (indexMenu, item) => {
    let temp = this.state.topicList;
    for(i = 0; i < temp.length; i++){
      temp[i].showDropdown = false
    }
    this.setState({topicList: temp}, ()=>{
      let type = "";
      if(this.state.tabIndex == 0){
        type = 'homework';
      }else if(this.state.tabIndex == 1){
        type = 'material';
      }

      const params = {
        userInfo: this.state.userInfo,
        selSubject: this.state.selSubject,
        selLesson: this.state.selLesson,
        type: type,
        ID: item.ID,
        forceRefresh: true,
      }
      this.props.navigation.navigate('OnlineEditLesson', params);
    });
  }

  renderItem = (item) => {
    const topic = item;
    let gropuTitle = "";
    let title = ""
    let time_display = "";
    let time_deadline = "";
    if(topic){
      gropuTitle = topic.GroupTitle;
      title = topic.Title;

      time_display = moment(topic.DisplayDate).format('DD MMMM YYYY hh:mm');
      time_deadline = moment(topic.DeadlineDate).format('DD MMMM YYYY');
    }

    const menuList = [{name: translang.t('EDIT')}];
    return (
      <View style={styles.listItem}>
        <TouchableOpacity activeOpacity={0.5} onPress={() => { this.onClickLesson(item) }} >
          <NotificationIconInfoItem
            icon={Images.n_ic_homework_blue}
            label={title}
            value_txt={this.state.tabIndex == 0 ? `${translang.t('DEADLINE_DATE')} : ${time_deadline}` : null}
            value_txt2={`${translang.t('DISPLAY_Date')} : ${time_display}`}
            dateText={null}
            isRead={false}
            imageStyle={{width: 30, height: 30, borderRadius: 0}}
            threeDot = {true}
            showDropdown = {false}
            Item = {item}
            menuList = {menuList}
            selectMenuItem = {(index)=>this.itemMenuClick(index, item)}
            moreAction={()=>this.onClickItemThreedot(item)}
          />
        </TouchableOpacity>
      </View>
    );
  };

  onChangeSwitcher = (index) => {
    if(index == 0){
      this.setState({tabIndex: index, topicList: this.state.homeworkList});
    }else{
      this.setState({tabIndex: index, topicList: this.state.lessonList});
    }
  }

  render() {
    const {selSubject, selLesson, topicList, tabIndex} = this.state

    let strLesson = "";
    if(selLesson){
      strLesson = selLesson.Text
    }

    let strSubject = "";
    if(selSubject){
      strSubject = selSubject.PlaneName
      if(getCurrentLocale() == 'en' && selSubject.PlaneNameEn && selSubject.PlaneNameEn != ""){
        strSubject = selSubject.PlaneNameEn
      }
    }
    let strClassLevel = "";
    if(selSubject){
      strClassLevel = selSubject.LevelName;
      if(getCurrentLocale() == 'en' && selSubject.LevelNameEn && selSubject.LevelNameEn != ""){
        strClassLevel = selSubject.LevelNameEn
      }
    }

    const options = [
      { title: translang.t('HOMEWORK')},
      { title: translang.t('MATERIAL')}
    ];

    return (
      <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
        <BackNavigationBar
          title={translang.t('DRAWER_onlineclassroom')}
          onMenuTap={() => this.back()}
          is_add="1"
          actions={[translang.t('HOMEWORK'), translang.t('MATERIAL')]}
          onAddTap={(value, index) => {
            if (index === 0){
              this.onClickAddHomework();
            }
            else if (index === 1){
              this.onClickAddMaterial();
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
            <Text style={{...styles.headerTextStyle, width: 150, fontWeight: 'bold'}}>{`${translang.t('LESSON')}`}</Text>
            <Text style={{...styles.headerTextStyle}}>{`${strLesson}`}</Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text style={{...styles.headerTextStyle, width: 150, fontWeight: 'bold'}}>{`${translang.t('TIMETABLE_subject')}`}</Text>
            <Text style={{...styles.headerTextStyle}}>{`${strSubject}`}</Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text style={{...styles.headerTextStyle, width: 150, fontWeight: 'bold'}}>{`${translang.t('TIMETABLE_classlevel')}`}</Text>
            <Text style={{...styles.headerTextStyle}}>{`${strClassLevel}`}</Text>
          </View>
          <View style={{height: 1, borderRadius: 1, backgroundColor: Color.n_default_brown, marginTop: 20,}}/>
        </View>

        <View style={styles.container}>
          { topicList.length > 0 &&
            <FlatList
              style={styles.menuContainer}
              data={topicList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item, index}) => this.renderItem(item)}
            />
          }
          { topicList.length === 0 &&
            <View style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{fontFamily: 'THSarabunNew', fontSize: 30}}>{translang.t('NO_DATA')}</Text>
            </View>
          }
          {/* <View  style={{position: 'absolute', right: 30, bottom: 50}} >
            <TouchableOpacity activeOpacity={0.5} onPress={() => { this.onClickAdd() }}>
              <Image source={Images.n_ic_add_orange} style={{width: 50, height: 50, resizeMode: 'contain'}}/>
            </TouchableOpacity>
            {this.state.showAddMenu &&
            <View style={{...styles.menuDlgContainer}}>
              <TouchableOpacity activeOpacity={0.5} onPress={() => { this.onClickAddHomework() }}>
                <Text style={styles.menuTextStyle}>{translang.t('HOMEWORK')}</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.5} onPress={() => { this.onClickAddMaterial() }}>
                <Text style={styles.menuTextStyle}>{translang.t('Materials')}</Text>
              </TouchableOpacity>
            </View>}
          </View> */}
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
  headerTextStyle: {
    fontFamily: 'THSarabunNew',
    color: Color.n_default_orange,
    fontSize: 23,
  },
  menuContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000070',
  },
  switchContainer: {
    marginHorizontal: 30,
    marginTop: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
    borderRadius: 25,
  },

  menuDlgContainer: {
    width: 140,
    padding: 10,
    backgroundColor: Color.white,
    position: 'absolute',
    bottom: 30,
    right: 55,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
    borderRadius: 15,
  },

  menuTextStyle: {
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray,
    fontSize: 23,
  }

});
