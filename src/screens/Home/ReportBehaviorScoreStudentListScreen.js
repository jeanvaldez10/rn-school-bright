import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, FlatList, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import Images from '../../themes/Images';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import _ from 'lodash';
import ApiManager from '../../managers/ApiManager';
import ProgressHud from '../../components/ProgressHud';
import CustomTextSearch from '../../components/CustomTextSearch';

export default class ReportBehaviorScoreStudentListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalBody: '',
      selectedClassLevel: null,
      selectedClass: null,
      selectedYear: null,
      selectedSemester: null,
      studentList: [],
      userInfo: {},
      filteredStudent: [],
      searchVal: '',
      isLoading: false,
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      console.log("ReportBehaviorScoreStudentListScreen");
      const year = this.props.navigation.getParam('year');
      const semester = this.props.navigation.getParam('semester');
      const classLevel = this.props.navigation.getParam('classLevel');
      const classRoom = this.props.navigation.getParam('classRoom');
      const userInfo = this.props.navigation.getParam('userInfo');

      this.setState({ selectedClassLevel: classLevel, selectedClass: classRoom, selectedYear: year, selectedSemester: semester, userInfo: userInfo, searchVal: ''}, ()=>{
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

    this.props.navigation.navigate('ReportBehavior');
  };

  loadData = ()=>{
    this.setState({ isLoading: true });
    ApiManager.getReportTeacherForBehaviorStudentList(this.state.selectedClass.ID, this.state.userInfo.SchoolID, this.state.selectedSemester.ID).then(students => {
      this.setState({studentList: students, filteredStudent: students, isLoading: false});
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    })
  }

  _onChangeSearchVal = (searchVal) => {
    this.setState({ searchVal: searchVal });
    let filtered = [];
    if (searchVal !== '') {
      this.state.studentList.forEach((data, index) => {
        let studentNameEn = data.FirstNameEN + data.LastNameEN;
        let studentNameTh = data.FirstNameTH + data.LastNameTH;
        let studentCode = data.StudentCode ?? "";

        if (studentNameEn.toLowerCase().includes(searchVal.toLowerCase()) || studentNameTh.toLowerCase().includes(searchVal.toLowerCase()) || studentCode.includes(searchVal.toLowerCase())) {
          filtered.push(data);
        }
      });
    }else{
      filtered = this.state.studentList;
    }
    this.setState({searchVal: searchVal, filteredStudent: filtered});
  };

  onSelectItem = (item) => {
    const classLevel = this.state.selectedClassLevel;
    const classRoom = this.state.selectedClass;
    const userInfo = this.state.userInfo;
    const year = this.state.selectedYear;
    const semester = this.state.selectedSemester;

    const params = {
      classLevel: classLevel,
      classRoom: classRoom,
      userInfo: userInfo,
      year: year,
      semester: semester,
      selStudent: item
    }

    this.props.navigation.navigate('ReportBehaviorScoreDetail', params);
  }

  renderItem = (item, index) => {
    let student = {};
    student = item;

    let firstName = student.FirstNameTH;
    let lastName = student.LastNameTH;
    let addScores = 0;
    let reduceScores = 0;

    if(getCurrentLocale() == 'en'){
      if(student.FirstNameEN != "" && student.FirstNameEN != null){
        firstName = student.FirstNameEN;
        lastName = student.LastNameEN;
      }
    }

    let profileImage = student.sex === '0' ? Images.man_user : Images.women_user;
    if (student.StudentPicture) {
      profileImage = {uri: student.StudentPicture};
    }

    let colorScore = Color.white;
    // let strScore = "";

    if(student.LastScore > 0){
      colorScore = Color.n_button_gradient_green_start;
      // strScore = "+" + student.score;
    }else{
      colorScore = Color.n_default_orange;
      // strScore = "-" + student.score;
    }

    const behaviorsHistory = student.BehaviorsHistory ?? [];
    for (const behavior of behaviorsHistory) {
      if (behavior.BehaviorsType !== "1") {
        addScores += behavior.Score;
      } else {
        reduceScores -= behavior.Score;
      }
    }

    const enableState = student.Student_State === '0';
    if(enableState){
      return (
        <View style={styles.listItem}>
          <TouchableOpacity style={{height: 130, flexDirection: 'row', flex: 1, alignItems: 'center', padding: 15, }}  onPress={() => this.onSelectItem(item, index)}>
            <Text style={styles.itemText}>{index + 1}.</Text>
            <Image source={profileImage} style={styles.itemAvatar} />
            <View style={{flexDirection: 'column', flex: 1, justifyContent: 'space-around'}}>
              <Text style={styles.itemText}>{student.StudentCode}</Text>
              <Text style={styles.itemText}>{firstName}</Text>
              <Text style={styles.itemText}>{lastName}</Text>
            </View>
            <View style={{flexDirection: 'row', marginHorizontal: 10}}>
              <Text style={{fontFamily: 'THSarabunNew', color: 'black', fontSize: 24, width: 40}}>{`${addScores}`}</Text>
              <Text style={{fontFamily: 'THSarabunNew', color: 'black', fontSize: 24, width: 40}}>{`${reduceScores}`}</Text>
            </View>
            <View style={{width: 50, height: 50, borderRadius: 25, backgroundColor: colorScore, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{fontFamily: 'THSarabunNew', color: 'white', fontSize: 24,}}>{student.LastScore ?? ''}</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={{...styles.listItem, backgroundColor: Color.n_default_gray_light}}>
        <View style={{height: 130, flexDirection: 'row', flex: 1, alignItems: 'center', padding: 15, }}  onPress={() => this.onSelectItem(item, index)}>
          <Text style={styles.itemText}>{index + 1}.</Text>
          <Image source={profileImage} style={styles.itemAvatar} />
          <View style={{flexDirection: 'column', flex: 1, justifyContent: 'space-around'}}>
            <Text style={styles.itemText}>{student.StudentCode}</Text>
            <Text style={styles.itemText}>{firstName}</Text>
            <Text style={styles.itemText}>{lastName}</Text>
          </View>
          <View style={{flexDirection: 'row', marginHorizontal: 10}}>
            <Text style={{fontFamily: 'THSarabunNew', color: 'black', fontSize: 24, width: 40}}>{`${addScores}`}</Text>
            <Text style={{fontFamily: 'THSarabunNew', color: 'black', fontSize: 24, width: 40}}>{`${reduceScores}`}</Text>
          </View>
          <View style={{width: 50, height: 50, borderRadius: 25, backgroundColor: colorScore, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontFamily: 'THSarabunNew', color: 'white', fontSize: 24,}}>{student.LastScore ?? ''}</Text>
          </View>
        </View>
      </View>
    );
  };

  render() {
    const { searchVal, selectedClass, selectedYear, selectedSemester} = this.state;

    let Stryear = ""
    if(selectedYear != null){
      Stryear = selectedYear.YearNumber;
    }

    let Strsemster = ""
    if(selectedSemester != null){
      Strsemster = selectedSemester.name;
    }

    let StrclassName = ""
    if(selectedClass != null){
      if (getCurrentLocale() === 'th') {
        StrclassName = selectedClass.NameTH;
      } else if (getCurrentLocale() === 'en') {
        StrclassName = selectedClass.NameEN;
      } else {
        StrclassName = selectedClass.NameTH;
      }
    }


    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_reportbehavior')}
          onMenuTap={() => this.back()}
        />

        <View style={styles.container}>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.title}>{translang.t('ACADEMIC_year2')}{": " + Stryear}</Text>
            <Text style={styles.title}>{translang.t('ACADEMIC_semester')}{": " + Strsemster}</Text>
          </View>

          <Text style={styles.title}>{translang.t('BEHAVIOR_classlevel')}{": " + StrclassName}</Text>

          <View style={{flexDirection: 'row', justifyContent: 'space-between', height: 60, width: '100%', paddingHorizontal: 30,}}>
            <CustomTextSearch
              inputWrapperStyle={{
                height: 50,
                flex: 1,
                borderRadius: 25,
                borderColor: Color.n_default_orange,
                borderWidth: 1
              }}
              value={searchVal}
              onChangeText={this._onChangeSearchVal}
              inputStyle={{ fontSize: 27 }}
              placeholder={translang.t('SEARCH_Placeholder_namestudent')}
              placeholderTextColor={Color.n_default_orange}

              clickSearch={()=>{

              }}
            />
          </View>
          <View style={{flexDirection: 'row', marginTop: 30, marginHorizontal: 10, paddingHorizontal: 15}}>
            {this.state.filteredStudent.length > 0 && (
              <>
              <View style={{flex: 1}} />
              <Text style={{width: 40, marginLeft: 10, color: Color.n_default_orange, fontFamily: 'THSarabunNew', fontWeight: '600', fontSize: 15}}>{translang.t('DISCIPLINE_POINT_ADDED')}</Text>
              <Text style={{width: 40, marginRight: 10, color: Color.n_default_orange, fontFamily: 'THSarabunNew', fontWeight: '600', fontSize: 15}}>{translang.t('DISCIPLINE_POINT_DEDUCTED')}</Text>
              <Text style={{width: 50, fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontWeight: '600', fontSize: 15}}>{translang.t('DISCIPLINE_POINT_REMAINING')}</Text>
              </>
            )}
          </View>
          <FlatList style={styles.list}
            data={this.state.filteredStudent}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => this.renderItem(item, index)}
          />
        </View>

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
  title: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    color: Color.n_default_orange,
    marginVertical: 10,
    marginHorizontal: 20,
  },
  list: {
    flex: 1,
  },
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
  itemText: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    color: Color.n_default_gray,
  },
  itemAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 8,
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

  behaviorDetailText: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
