import React, { useState } from 'react';
import {View, BackHandler, TouchableOpacity, FlatList, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment';
import BackNavigationBar from '../../components/BackNavigationBar';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import ProgressHud from '../../components/ProgressHud';

import SchoolYearModal from '../../components/SchoolYearModal';
import SemesterModal from '../../components/SemesterModal';
import NextButton from '../../components/NextButton';

export default class ReportStudentBehaviorScoreListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      reportList: {},
      isLoading: false,

      showAcademicModal: false,
      academicYears: [],
      selAcademicYear: null,

      showSemsterModal: false,
      semsters: [],
      selSemster: null,
    };
  }

  handleBackButton = () => {
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
      console.log("ReportStudentBehaviorScoreListScreen");
      const userInfo = await Storage.getUserInfo();

      this.setState({userInfo: userInfo, showAcademicModal: false}, ()=>{
        this.getYearList();
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

    this.setState({
      tabIndex: 0,
      selAcademicYear: null,
      selSemster: null,
      reportList: {},
    }, () => {
      const parentRoute = this.props.navigation.getParam('parent') ?? 'Report';
      this.props.navigation.navigate(parentRoute);
    });
  };

  getYearList = ()=>{
    ApiManager.getYearSelectGrade(this.state.userInfo.SchoolID).then(data => {
      this.setState({ academicYears: data });
      const currentYear = moment().format('yyyy');
      if(!this.state.selAcademicYear) {
        data.forEach((item) => {
          if (item.IsCurrentAcademicYear) {
            this.setState({selAcademicYear: item});
            this.getTermList(true);
          }
        })
      }
    }).catch(error => {
      console.error("getYearList ERRROR", error);
    });
  };

  getTermList = (autoInit = false)=>{
    ApiManager.getTermSelectGrade(this.state.selAcademicYear.Yearid, this.state.userInfo.ID).then(data => {
      let temp = null;
      const current = moment();
      if(autoInit){
        data.forEach((val) => {
          if (temp) {
            if (current.isAfter(temp.dEnd) && current.isBefore(val.dEnd)) {
              temp = val;
            }
          } else {
            if (current.isBefore(val.dEnd)) {
              temp = val;
            }
          }
        });

        if ((!temp) && (data.length)) {
          temp = data[data.length - 1];
        }
        if (temp) {
          temp.name = temp.sTerm;
          temp.ID = temp.nTerm;
        }

        this.setState({semsters: data, selSemster: temp});

      }
      else{
        this.setState({semsters: data, selSemster:null});
      }

    }).catch(error => {
      console.error(error);
    });
  };

  loadData = () => {
    if(this.state.selSemster == null){
      return;
    }

    const userID = this.state.userInfo.ID;
    const schoolId = this.state.userInfo.SchoolID;
    const termId = this.state.selSemster.ID;

    // const userID = "675117";
    // const schoolId = "307";
    // const termId = "TS20003703400307";

    this.setState({isLoading: true});
    ApiManager.getBehaviorScoreHistory(userID, schoolId, termId).then(data => {
      this.setState({ reportList: data, isLoading: false});
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };

  _onChangeAcademicYear = () => {
    this.setState({
      showAcademicModal: true,
    });
  };

  onAcademicYearsSelect = (item) => {
    if (item == null) {
      this.setState({ showAcademicModal: false })
    } else {
      this.setState({ showAcademicModal: false, selAcademicYear: item, selSemster: null }, ()=>{
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
      this.setState({ showSemsterModal: false })
    } else {
      this.setState({ showSemsterModal: false, selSemster: item })
    }
  };

  onSelectBehavior = (item, index) => {
    this.props.navigation.navigate('ReportStudentBehaviorScoreDetail', {behavior: item, userInfo: this.state.userInfo});
  }

  renderItem = (item, index) => {
    const date = moment(item.Day).format('DD MMM YYYY');
    let score = '';
    let color = Color.n_button_gradient_green_start;
    if (item.BehaviorsType === '1') {
      score = `-${item.Score} ${translang.t('Points')}`;
      color = Color.n_default_orange;
    } else {
      score = `+${item.Score} ${translang.t('Points')}`;
      color = Color.n_button_gradient_green_start;
    }
    // if (item.LastScore < 0) {
    //   score = `-${item.LastScore} ${translang.t('Points')}`;
    //   color = Color.n_default_orange;
    // } else {
    //   score = `+${item.LastScore} ${translang.t('Points')}`;
    //   color = Color.n_button_gradient_green_start;
    // }
    return (
      <TouchableOpacity style={styles.infoContainer} onPress={() => this.onSelectBehavior(item)}>
        <View style={{flex: 1,}}>
          <Text style={styles.infoDate}>{date}</Text>
          <Text style={styles.infoBehaviorName} numberOfLines={1}>{item.behaviorsname}</Text>
        </View>
        <Text style={{...styles.infoBehaviorScore, color: color}}>{score}</Text>
      </TouchableOpacity>
    )
  };

  onStartDateSelected = (date) => {
    if(date == null){
      this.setState({showStartCalendar: false});
    }else{
      this.setState({ showStartCalendar: false, startDate: date }, ()=>{
        this.loadData();
      });
    }
  }

  onEndDateSelected = (date) => {
    if(date == null){
      this.setState({showEndCalendar: false});
    }else{
      this.setState({ showEndCalendar: false, endDate: date }, ()=>{
        this.loadData();
      });
    }

  }

  render() {
    const {reportList, selAcademicYear, selSemster} = this.state;
    let remainScore = reportList.LastScore ?? 0;
    let behaviorList = [];
    if(reportList.BehaviorsHistory){
      behaviorList = reportList.BehaviorsHistory;
    }

    let schoolyear = '';
    if (selAcademicYear != null) {
      schoolyear = selAcademicYear.YearNumber;
      if(getCurrentLocale() == 'en' && selAcademicYear.YearNumberEn && selAcademicYear.YearNumberEn != ''){
        schoolyear = selAcademicYear.YearNumberEn;
      }
    }
    let semester = '';
    if (selSemster != null) {
      semester = selSemster.name;
    }

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_reportbehavior')}
          onMenuTap={() => this.back()}
        />

        <View style={styles.container}>

          <View style={styles.topRangeContainer}>
            <View style={{flexDirection: 'row'}}>
              <Text style={{flex: 1, textAlign: 'center', color: Color.n_default_orange, fontFamily: 'THSarabunNew', fontSize: 15, fontWeight: 'bold'}}>{translang.t('ACADEMIC_year2')}</Text>
              <Text style={{flex: 1, textAlign: 'center', color: Color.n_default_orange, fontFamily: 'THSarabunNew', fontSize: 15, fontWeight: 'bold'}}>{translang.t('ACADEMIC_semester')}</Text>
            </View>
            <View style={styles.rangeContainer}>
              <TouchableOpacity style={{flex: 1}}  onPress={() => {this.setState({showAcademicModal: true});}}>
                <Text style={{textAlign: 'center', color: Color.white, fontFamily: 'THSarabunNew', fontSize: 18, fontWeight: 'bold'}}>{schoolyear ? schoolyear : translang.t('ACADEMIC_year2')}</Text>
              </TouchableOpacity>
              <View style={{height: '80%', width: 1, backgroundColor: Color.white}} />
              <TouchableOpacity style={{flex: 1}}  onPress={() => {this.setState({showSemsterModal: true});}}>
                <Text style={{textAlign: 'center', color: Color.white, fontFamily: 'THSarabunNew', fontSize: 18, fontWeight: 'bold'}}>{semester ? semester : translang.t('ACADEMIC_semester')}</Text>
              </TouchableOpacity>
            </View>

            <NextButton
              label={translang.t('Search')}
              textStyle={{fontSize: 25,}}
              containerStyle={{marginVertical: 20, marginHorizontal: 20,}}
              buttonStyle={{height: 40, borderRadius: 20,}}
              colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_start]}
              isVerticalGradient={false}
              _onPress={() => this.loadData()} />

          </View>

          <FlatList
            style={{flex: 1, marginHorizontal: 10, marginVertical: 5}}
            data={behaviorList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => this.renderItem(item, index)} />
        </View>

        <View style={styles.bottomStyle}>
          <Text style={styles.bottomTxt}>{translang.t('REMAINING_SCORE')}</Text>
          <Text style={styles.bottomTxt}>{`${remainScore}`}</Text>
        </View>

        <SchoolYearModal
          isVisible={this.state.showAcademicModal}
          onSchoolYearSelect={this.onAcademicYearsSelect}
          listData={this.state.academicYears}/>

        <SemesterModal
          isVisible={this.state.showSemsterModal}
          onSemesterSelect={this.onSemsterSelect}
          listData={this.state.semsters}/>

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
  itemContainer: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: Color.white,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    marginHorizontal: 5,
    marginVertical: 8,
  },
  mark: {
    height: 20,
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10
  },
  date: {
    flex: 1.5,
    fontSize: 25,
    fontFamily: 'THSarabunNew',
    fontWeight: 'bold',
    marginLeft: 20,
    marginRight: 5,
  },
  type: {
    flex: 1,
    fontSize: 25,
    fontFamily: 'THSarabunNew',
    fontWeight: 'bold',
    marginRight: 5,
    textAlign: 'center',
  },
  status: {
    flex: 1,
    fontSize: 25,
    fontFamily: 'THSarabunNew',
    textAlign: 'center',
  },
  bottomStyle: {
    width: '100%',
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'space-between',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: Color.white,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  bottomTxt: {
    color: Color.n_default_orange,
    textAlign: 'center',
    fontSize: 26,
    fontFamily: 'THSarabunNew',
    fontWeight: 'bold',
  },

  calendar: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 20,
    paddingTop: 10,
    paddingBottom: 20,
    shadowColor: 'black',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    elevation: 3,
  },

  topRangeContainer:{
    shadowColor: Color.black,
    backgroundColor: 'white',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,

    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,

    paddingVertical: 10,
    marginBottom: 5,
  },

  rangeContainer: {
    height: 40,
    borderRadius: 15,
    backgroundColor: Color.n_default_brown,
    shadowColor: Color.black,
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    marginVertical: 10,
    marginHorizontal: 20,
  },

  itemInfoContainer:{
    flex: 1,
    paddingLeft: 15,
    paddingVertical: 10,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfoTitle:{
    flex: 1,
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    color: Color.n_default_gray
  },
  userInfoContent:{
    flex: 1,
    fontFamily: 'THSarabunNew',
    fontSize: 18,
    color: Color.n_default_gray,
    marginLeft: 5,
  },

  itemStatusContainer:{
    width: '30%',
    height: '100%',
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,

    flexDirection:'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  labelStatus:{
    fontFamily: 'THSarabunNew',
    color: Color.white,
    fontSize: 24,
    fontWeight: 'bold',
  },

  infoContainer: {
    height: 100,
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 15,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderRadius: 15,
    backgroundColor: Color.white,
    shadowColor: Color.black,
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,

  },
  infoDate: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    color: Color.n_default_gray_dark,
  },
  infoBehaviorName: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    color: Color.n_default_gray_dark,
  },
  infoBehaviorScore: {
    width: 100,
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'THSarabunNew',
    marginLeft: 10,
  },
});
