import React from 'react';
import {
  Image,
  View,
  TouchableOpacity,
  BackHandler,
  ScrollView,
} from 'react-native';
import { Col, Text } from 'native-base';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Toast from 'react-native-simple-toast';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import IconInfoAcademy from '../../components/IconInfoAcademy';

import translang, { getCurrentLocale } from '../../utils/language.utils';
import ApiManager from '../../managers/ApiManager';
import ProgressHud from '../../components/ProgressHud';
import moment from 'moment';
import { types } from '@babel/core';



const CourseItem = ({ left1Txt, left2Txt, right1Txt, right2Txt }) => {
  return (
    <View style={{marginBottom: 20}}>
      <View style={styles.uperCardChild}>
        <Text style={{...styles.AcademyInfoScore, flex: 1, textAlign: 'left'}}>{left1Txt}</Text>
        <Text style={{...styles.AcademyInfoScore, width: 70, textAlign: 'right'}}>{right1Txt}</Text>
      </View>
      <View style={styles.uperCardChild}>
        <Text style={{...styles.AcademyInfoTitle, flex: 1, textAlign: 'left'}} multiLine={true}>{left2Txt}</Text>
        <Text style={{...styles.AcademyInfoList, width: 70, textAlign: 'right'}}>{right2Txt}</Text>
      </View>
    </View>
  );
};


export default class AcademicOutput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      userInfo: {},
      selYear: "",
      selType: null,
      gradeData: {},
      subjectList: [],
      scoreData: null,
      terminfo: {},
      isPrimary: false,
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

      console.log("AcademicOutput");

      const userInfo = this.props.navigation.getParam('userInfo');
      const year = this.props.navigation.getParam('year');
      const selType = this.props.navigation.getParam('type');

      // ApiManager.checkStudentIsPrimary(userInfo.SchoolID, year.nYear, userInfo.ID).then((data) => {
      //   this.setState({isPrimary:data});
      // });

      this.setState({userInfo: userInfo, selYear: year, selType: selType}, ()=>{
        this.getGradeDetailInfo();
      })
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

    this.props.navigation.navigate('Academic');
  };

  getGradeDetailInfo = async() =>{
    const lang = getCurrentLocale() == "en" ? "eng" : "thai";
    this.setState({ isLoading: true });
    ApiManager.getAcademicGradeDetailInfo(this.state.userInfo.SchoolID, this.state.userInfo.ID, this.state.selYear.nYear, this.state.selType.STerm, this.state.selType.Type, lang).then(data => {
      this.makeSubjectList(data);
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  }

  makeSubjectList = (data) => {
    let res = [];
    let score_temp = 0;

    if(data.PlanCourses.length > 0){
      data.PlanCourses.forEach(item=>{
        if(!res.find(it => it.CourseGroup === item.CourseGroup)){
          const tempPlanList = data.PlanCourses.filter(itemte=> itemte.CourseGroup==item.CourseGroup);
          const temp = {CourseGroup: item.CourseGroup, CourseGroupName: item.CourseGroupName, list: tempPlanList};
          res.push(temp);
          score_temp = item.MaxScoreForPrimary;
          console.log("item.MaxScoreForPrimary:", item);
        }
      });
    }

    this.setState({gradeData: data, subjectList: res, isLoading: false, scoreData:score_temp});
  };

  getCoursGroupInfo(){
    var res = []
    if(this.state.subjectList.length > 0){
      for(let i = 0; i < this.state.subjectList.length; i++){
        let item = this.state.subjectList[i];
        res.push(
          <View key={i}>
            <Text style={{...styles.AcademyInfoTitle, textDecorationLine: 'underline'}}>
              {item.CourseGroupName}
            </Text>
            {this.getCourseInfo(item)}
          </View>
        );
      }
    }
    return res;
  }

  getCourseInfo(item) {
    var res = []
    if(item.list.length > 0){
      const courslist = item.list;
      const courslistRes = Object.keys(courslist).map(key => ({[key]: courslist[key]}));
      if(courslistRes.length > 0){
        for(let i = 0; i < courslist.length; i++){
          let item = courslist[i];
          let score = "";
          let grade = "";
          if(this.state.selType != null){
            if(this.state.selType.Type == "MidTerm"){
              score = item.BeforeMidTermAndMidTermScoreTotal;
            }else{
              score = item.TermScore;
              grade = item.Grade;
            }
          }

          if(item.GetSpecial != ""){
            score = "";
            grade = item.GetSpecial;
          }

          res.push(
            <CourseItem
                key={i}
                left1Txt={item.CourseCode?item.CourseCode:''} right1Txt={score}
                left2Txt={item.CourseName?item.CourseName:''} right2Txt={grade}
              />
          );
        }
      }
    }
    return res;
  }

  render() {

    const {gradeData, scoreData} = this.state;
    const daySend = moment().format('MM/DD/YYYY');
    let schoolimg = Images.n_applogo_logo;
    if(gradeData.SchoolImage !== '' ?? gradeData.SchoolImage !== null){
      schoolimg = { uri: gradeData.SchoolImage };
    }

    let txtGrade = '';
    let txtItem = '';
    let gradeType = 0;

    console.log("primary:", gradeData.IsPrimary);
    console.log("scoredata:", scoreData);
    console.log("this.state.selType:", this.state.selType);
    if (gradeData.IsPrimary){
      if (this.state.selType.Type == 'Final'){
        if(scoreData > 0){
          txtGrade = scoreData;
        }else{
          txtGrade = translang.t('Grade');
        }
      }else if( this.state.selType.Type == 'Yearly'){
          txtGrade = translang.t('Grade');
      }else {
        txtGrade = translang.t('MIDDLE_SCORE');
        gradeType = 1;
      }
    }
    else if(this.state.selType != null){
      if (this.state.selType.Type == 'Final' || this.state.selType.Type == 'Yearly'){
        txtGrade = translang.t('Grade');
      }else {
        txtGrade = translang.t('MIDDLE_SCORE');
        gradeType = 1;
      }
    }

    if(this.state.selType != null){
      if (this.state.selType.Type == 'Final' || this.state.selType.Type == 'Yearly'){
        txtItem = translang.t('SCORE') + '/';
      }else {
        if(getCurrentLocale() == 'en'){
          txtItem = translang.t('MIDDLE_SCORE_Item');
        }
        else{
          txtItem = translang.t('MIDDLE_SCORE_Item')+ '/';
        }

      }
    }



    let typeStr = "";
    if(this.state.selType != null){
        if (this.state.selType.Type == 'MidTerm'){
          typeStr = translang.t('MIDTERM');
        }
        else if (this.state.selType.Type == 'Final'){
          typeStr = translang.t('FINAL');
        }
        else{
          typeStr = translang.t('YEARLY');
        }
    }

    let gpaLabel = translang.t('ACADEMIC_gpa');
    if(this.state.selType){
      if(gradeData.IsPrimary){
        if(this.state.selType.Type == "Yearly"){
          gpaLabel = translang.t('ACADEMIC_gpa');
        }else{
          gpaLabel = translang.t('PERCENTAGE');
        }
      }else{
        if(this.state.selType.Type == "Yearly" || this.state.selType.Type == "MidTerm"){
          gpaLabel = translang.t('PERCENTAGE');
        }else{
          gpaLabel = translang.t('ACADEMIC_gpa');
        }
      }
    }


    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_acadresult')}
          is_help="1"
          onHelpTap={() => this.props.navigation.navigate('AcademicHelp')}
          onMenuTap={() => this.back()}
        />

        <ScrollView style={styles.dispcontainer} contentContainerStyle={{flexGrow: 1}}>
          <View style={styles.userInfoContainer}>
            <Text style={styles.timeStyle}>{daySend}</Text>
            <IconInfoAcademy
              style={{marginBottom: 20}}
              icon_mark={schoolimg}
              label={gradeData.SchoolName?gradeData.SchoolName:'_'}
              value_txt={gradeData.SchoolNameEn?gradeData.SchoolNameEn:'_'}
            />

            <View style={{flexDirection: 'row'}}>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <Text style={styles.userInfoTitle}>{translang.t('ACADEMIC_year')}</Text>
                <Text style={styles.userInfoContent}>{gradeData.Year?gradeData.Year:'_'}</Text>
              </View>
              <View style={{width: '35%', flexDirection: 'row'}}>
                <Text style={styles.userInfoTitle}>{translang.t('ACADEMIC_semester2')}</Text>
                <Text style={styles.userInfoContent}>{gradeData.Term?gradeData.Term:'_'}</Text>
              </View>
            </View>

            <View style={{flexDirection: 'row'}}>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <Text style={styles.userInfoTitle}>{`${translang.t('PROFILE_TYPE')} : `}</Text>
                <Text style={styles.userInfoContent}>{typeStr}</Text>
              </View>
            </View>

            <View style={{flexDirection: 'row'}}>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <Text style={styles.userInfoTitle}>{translang.t('ACADEMIC_name')}</Text>
                <Text style={styles.userInfoContent}>{gradeData.FullName?gradeData.FullName:''}</Text>
              </View>

            </View>

            <View style={{flexDirection: 'row'}}>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <Text style={styles.userInfoTitle}>{translang.t('ACADEMIC_class')}</Text>
                <Text style={styles.userInfoContent}>{gradeData.SubLevelName?gradeData.SubLevelName:''}</Text>
              </View>
              <View style={{width: '35%', flexDirection: 'row'}}>
                <Text style={styles.userInfoTitle}>{translang.t('ACADEMIC_studentid')}</Text>
                <Text style={styles.userInfoContent}>{gradeData.SStudentId?gradeData.SStudentId:'_'}</Text>
              </View>
            </View>
          </View>

          <View style={{...styles.userInfoContainer, flex: 1, marginBottom: 20}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', }}>
              <Text style={styles.AcademyInfoTitle}>{translang.t('ACADEMIC_subject')}</Text>
              <View>
                <Text style={styles.AcademyInfoScore}>{txtItem}</Text>
                {/*<Text style={styles.AcademyInfoList}>{translang.t('Grade')}{this.state.scoreData}</Text>*/}
                {gradeType == 1 &&
                <Text style={styles.AcademyInfoScore}>{txtGrade}</Text>
                }
                {gradeType == 0 &&
                <Text style={styles.AcademyInfoList}>{txtGrade}</Text>
                }
              </View>
            </View>
            <View style={{ height: 1, width: '100%', backgroundColor: Color.n_default_orange, marginBottom: 20, }} />
            {this.getCoursGroupInfo()}
          </View>
        </ScrollView>

        <View style={{...styles.gpaContainer}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', }}>
            <Text style={styles.gpaHeaderTitle}>{gpaLabel}</Text>
            <Text style={styles.gpaHeaderScore}>{gradeData.GradeAverage?gradeData.GradeAverage:''}</Text>
          </View>
        </View>

        <ProgressHud isVisible={this.state.isLoading} />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    height: '100%',
    backgroundColor: Color.white
  },

  gpaContainer: {
    paddingTop: 25,
    paddingBottom: 25,
    paddingHorizontal: 30,

    borderRadius: 20,
    backgroundColor: Color.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,

    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },

  userInfoContainer: {
    marginHorizontal: 15,
    marginTop: 22,
    paddingTop: 25,
    paddingBottom: 15,
    paddingHorizontal: 20,

    borderRadius: 20,
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

  timeStyle: {
    position: 'absolute',
    right: 10,
    top: 5,
    color: "#00000040",
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    fontWeight: 'bold'
  },

  userInfoTitle:{
    fontFamily: 'THSarabunNew',
    fontSize: 18,
    fontWeight: 'bold',
    color: Color.n_default_gray
  },

  userInfoContent:{
    marginLeft: 5,
    fontFamily: 'THSarabunNew',
    fontSize: 18,
    color: Color.n_default_gray,

  },

  AcademyInfoTitle:{
    fontSize: 24,
    fontWeight: 'bold',
    color: Color.n_default_gray,
    fontFamily: 'THSarabunNew',
  },

  AcademyInfoScore:{
    fontSize: 20,
    fontWeight: 'bold',
    color: Color.n_default_gray,
    fontFamily: 'THSarabunNew',
  },

  AcademyInfoList:{
    fontSize: 24,
    fontWeight: 'bold',
    color: Color.n_default_orange,
    fontFamily: 'THSarabunNew',
  },

  uperCardChild: {
    flexDirection: 'row',
    marginHorizontal: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },

  itemActions: {
    position: 'absolute',
    right: 1,
    alignItems: 'center',
  },

  gpaHeaderTitle:{
    fontSize: 30,
    fontWeight: 'bold',
    color: Color.n_default_gray,
    fontFamily: 'THSarabunNew',
  },
  gpaHeaderScore: {
    fontSize: 30,
    fontWeight: 'bold',
    color: Color.n_default_orange,
    fontFamily: 'THSarabunNew',
  },
  dispcontainer: {
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
