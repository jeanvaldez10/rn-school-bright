import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, FlatList, Text} from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import moment from 'moment';


import NextButton from '../../components/NextButton';


import ClassLevelModal from '../../components/SelectListModal';
import SubjectModal from '../../components/SelectListModal';
import TeacherModal from '../../components/SelectListModal';
import CalendarModal from '../../components/CalendarModal';


export default class ReportTeacherPersonalOnlineScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      reportList: [],
      userInfo: {},
      currentPage: 0,
      isLoading: false,

      showClassLevelModal: false,
      showSubjectModal: false,
      
      classLevelList: [],
      subjectList: [],
      
      selectedClassLevel: null,
      selectedSubject: null,

      showCalendarModal: false,
      selectedDate: null,
    };
  }

  handleBackButton = () => {
    if(this.state.showCalendarModal){
      this.setState({showCalendarModal: false});
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

      this.setState({ userInfo: userInfo}, () => {
          this.getClassLevelData();
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
    
    this.props.navigation.navigate('ReportForTeacher');
  };
  
  getClassLevelData = () => {
    ApiManager.getStudentClassLevel(this.state.userInfo.SchoolID).then(list => {
      this.setState({ classLevelList: list });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };

  getSubjectData = () => {
    const data = [{SchoolID: 849, plane_id: "ส11010", scheduleId: 902335, scheduleName: "การอ่าน", timeend: "17:00:00.0000000", timestart: "16:00:00.0000000"}];
    this.setState({subjectList: data});

  }

  _onChangeClassLevel = () => {
    this.setState({showClassLevelModal: true});
  }
  onClassLevelSelect = (item, index) => {
    if (item == null) {
      this.setState({ showClassLevelModal: false })
    } else {
      const classLevel = this.state.classLevelList[index];
      this.setState({ showClassLevelModal: false, selectedClassLevel: classLevel}, () => {
        this.getSubjectData();
      });
    }
  };

  _onChangeSubject = () => {
    this.setState({showSubjectModal: true});
  }
  onSubjectSelect = (item, index) => {
    if (item == null) {
      this.setState({ showSubjectModal: false })
    } else {
      this.setState({ showSubjectModal: false, selectedSubject: item }, () => {
        
      })
    }
  };

  onDateSelected = (date) => {
    if (date === null) {
      this.setState({ showCalendarModal: false });
    } else {
      this.setState({ showCalendarModal: false, selectedDate: moment(date) });
    }
  }

  loadData = (isRefresh) => {
    this.setState({ isLoading: true });

    const userInfo = this.state.userInfo;
    const page = isRefresh ? 0 : this.state.currentPage;

    ApiManager.getHomeworkReportList(userInfo.SchoolID, page + 1).then(list => {
      if (isRefresh) {
        this.setState({ reportList: list, currentPage: page + 1, isLoading: false });
      } else {
        let reportList = this.state.reportList;
        reportList = reportList.concat(list);
        this.setState({ reportList: reportList, currentPage: page + 1, isLoading: false });
      }
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };

  onSelectItem = (index) => {
    const homework = this.state.reportList[index];
    this.props.navigation.navigate('ReportHomeworkDetail', {homework: homework, userInfo: this.state.userInfo, parent: 'ReportTeacherPersonalOnline'});
  };

  renderItem = (index) => {
    const homework = this.state.reportList[index];
    const date = moment(homework.daynoti).format('DD/MM/YYYY HH:mm');
    let icon = Images.n_ic_notification_homework;

    return (
      <TouchableOpacity style={styles.listItem} onPress={() => this.onSelectItem(index)}>
        <Image source={icon} style={styles.itemAvatar}></Image>
        
        <View style={{flex: 1, marginLeft: 20,}}>
          <Text style={styles.dateText}>{date}</Text>  
          <Text style={styles.topText}>{homework.plane_name}</Text>
          <Text style={styles.bottomText} numberOfLines={1}>{homework.message}</Text>
        
        </View>
      </TouchableOpacity>
    );
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
    const { selectedClassLevel, selectedSubject} = this.state;
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

    const classLevelList = this.state.classLevelList.map( level => {
      if (getCurrentLocale() === 'th' && level.NameTH && level.NameTH !== '') {
        return { title: level.NameTH };
      } else if (getCurrentLocale() === 'en' && level.NameEN && level.NameEN !== '') {
        return { title: level.NameEN };
      }
      return { title: level.Value };
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
          title={translang.t('ONLINE_CLASSROOM_REPORT')}
          onMenuTap={() => this.back()}
          is_calendar={true}
          onCalendarTap={() => {
            this.setState({ showCalendarModal: true, });
          }}
        />

        <View style={styles.container}>
          <View style={{backgroundColor: Color.n_default_brown_light, paddingHorizontal: 10, paddingTop: 20}}>
            <View style={{flexDirection: 'row',}}>
              <TouchableOpacity onPress={this._onChangeClassLevel} style={styles.bigContainer} activeOpacity={1.0}>
                <View style={{ flex: 1}}>
                  <Text style={{ ...styles.title2 }}>{translang.t('BEHAVIOR_classlevel')}</Text>
                  <Text style={{ ...styles.selectValueText}}>{classlevel ? classlevel : translang.t('BEHAVIOR_classlevel')} </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={this._onChangeSubject} style={styles.bigContainer} activeOpacity={1.0}>
                <View style={{ flex: 1 }}>
                  <Text style={{ ...styles.title2 }}>{translang.t('BEHAVIOR_subject')}</Text>
                  <Text style={{ ...styles.selectValueText }}>{selsubject ? selsubject : translang.t('BEHAVIOR_subject')} </Text>
                </View>
              </TouchableOpacity>
            </View>
            
            <NextButton
              label={translang.t('Search')}
              textStyle={{fontSize: 25,}}
              containerStyle={{marginBottom: 20, marginTop: 20}}
              buttonStyle={{height: 40, borderRadius: 20,}}
              colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_start]}
              isVerticalGradient={false}
              _onPress={() => {this.loadData()}} />
          </View>

          <FlatList 
            style={styles.menuContainer}
            data={this.state.reportList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => this.renderItem(index)}
            onEndReachedThreshold={0.01}
            onEndReached={ () => {
              if (this.state.reportList.length === 0) {

              } else {
                this.loadData(false)
              }
            }}
          />
        </View>
        <ProgressHud isVisible={this.state.isLoading} />
        
        <ClassLevelModal
          isVisible={this.state.showClassLevelModal}
          onListSelect={this.onClassLevelSelect}
          listData={classLevelList}
          dialogTtitle={translang.t('BEHAVIOR_classlevel')}
        />
        <SubjectModal
          isVisible={this.state.showSubjectModal}
          onListSelect={this.onSubjectSelect}
          listData={this.state.subjectList}
          renderItem={this.renderSubjectListItem}
          dialogTtitle={translang.t('BEHAVIOR_subject')}
        />
        <CalendarModal
          isVisible={this.state.showCalendarModal}
          type={'single'}
          onDateSelect={result => this.onDateSelected(result)} />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
    
  },
  menuContainer: {
    marginTop: 10,
  },
  listItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 110,
    alignItems: 'center',
    paddingVertical: 5,
    paddingLeft: 30,
    paddingRight: 15,

    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,

    marginVertical: 8,
    marginHorizontal: 20,
  },
  dateText: {
    width: '100%',
    textAlign: 'right',
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray,
    fontSize: 16,
    fontWeight: 'bold',
  },
  topText: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    color: Color.n_default_gray
  },
  bottomText: {
    fontFamily: 'THSarabunNew',
    fontSize: 18,
    fontWeight: 'bold',
    color: Color.n_default_gray
  },
  itemAvatar: {
    width: 50, 
    height: 50, 
    borderRadius: 25,
  },

  bigContainer: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 5,
  },

  title2: {
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    fontWeight: 'bold',
    color: Color.black,
  },
  selectValueText: {
    width: '100%',
    height: 30,
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    backgroundColor: Color.white,
    borderColor: Color.n_default_gray,
    borderWidth: 1,
    borderRadius: 5,
    color: Color.n_default_gray,
    paddingHorizontal: 10,
    paddingTop: 3
  },
});
