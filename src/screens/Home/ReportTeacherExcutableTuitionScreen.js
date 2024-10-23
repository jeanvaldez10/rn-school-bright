import React from 'react';
import { View, TouchableOpacity, BackHandler } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import NextButton from '../../components/NextButton';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import ApiManager from '../../managers/ApiManager';
import Storage from '../../managers/StorageManager';
import Images from '../../themes/Images';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import BackNavigationBar from '../../components/BackNavigationBar';
import { ScrollView } from 'react-native-gesture-handler';
import SchoolYearModal from '../../components/SchoolYearModal';
import SemesterModal from '../../components/SemesterModal';
import moment from "moment";

export default class ReportTeacherExcutableTuitionScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showModal: false,
      modalBody: null,
      userInfo: null,
      showSchoolYearModal: false,
      showSemesterModal: false,
      selectedSchoolYear: null,
      selectedSemester: null,
      yearList: [],
      termList: [],
    };
  }

  handleBackButton = () => {
    this._back();
    return true;
  };

  async componentDidMount() {
    console.log("ReportTeacherExcuteableTuition");
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", async () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const userInfo = await Storage.getUserInfo();
      this.setState({ userInfo: userInfo }, () => {
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

  getYearList = ()=>{
    this.setState({isLoading: true});
    ApiManager.getYearSelectGrade(this.state.userInfo.SchoolID).then(data => {
      this.setState({ yearList: data, isLoading: false});
      console.log("year data: ", data);
      if(!this.state.selectedSchoolYear) {
        data.forEach((item) => {
          if (item.IsCurrentAcademicYear) {
            item.name = item.YearNumber;
            item.nameEn = item.YearNumberEn;
            this.setState({selectedSchoolYear: item});
            this.getTermList(true);
          }
        })
      }
    }).catch(error => {
      console.error("ERRROR", error);
    });
  };

  getTermList = (autoInit = false)=>{
    ApiManager.getTermSelectGrade(this.state.selectedSchoolYear.Yearid, this.state.userInfo.ID).then(data => {
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

        this.setState({termList: data, isLoading: false, selectedSemester: temp});

      }
      else{
        this.setState({termList: data, isLoading: false, selectedSemester:null});
      }

    }).catch(error => {
      console.error(error);
    });
  };


  __next = () => {
    if(this.state.selectedSchoolYear == null){
      this.setState({ showModal: true, modalBody: translang.t('ACADEMIC_msg_selectyear') });
      return;
    }

    if(this.state.selectedSemester == null){
      this.setState({ showModal: true, modalBody: translang.t('ACADEMIC_msg_selectsemester') });
      return;
    }

    const userInfo = this.state.userInfo;
    const year = this.state.selectedSchoolYear;
    const semester = this.state.selectedSemester;

    params = {
      parent: 'ReportTeacherExcutableTuition',
      userInfo: userInfo,
      year: year,
      semester: semester
    }

    this.props.navigation.navigate('ReportTeacherExcutableTuitionDetail', params);
  };

  _back = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }

    this.setState({
      tabIndex: 0,
      selectedSchoolYear: null,
      selectedSemester: null,
    }, () => {
      const parentRoute = this.props.navigation.getParam('parent') ?? 'Report';
      this.props.navigation.navigate(parentRoute);
    });

  };


  _onChangeSchoolYear = () => {
    this.setState({
      showSchoolYearModal: true,
    });
  };
  onSchoolYearSelect = (item) => {
    if (item == null) {
      this.setState({ showSchoolYearModal: false })
    } else {
      this.setState({ showSchoolYearModal: false, selectedSchoolYear: item, selectedSemester: null }, ()=>{
        this.getTermList();
      })
    }
  };

  _onChangeSemester = () => {
    const { selectedSchoolYear } = this.state;

    if (selectedSchoolYear == null) {
      this.setState({ showModal: true, modalBody: translang.t('ACADEMIC_msg_selectyear') });
      return;
    }

    this.setState({
      showSemesterModal: true,
    });
  };
  onSemesterSelect = (item) => {
    if (item == null) {
      this.setState({ showSemesterModal: false });
    } else {
      this.setState({ showSemesterModal: false, selectedSemester: item });
    }
  };

  render() {
    if (global.onDrawerChanged !== this.onDrawerChanged) {
      global.onDrawerChanged = this.onDrawerChanged;
    }

    const { selectedSchoolYear, selectedSemester } = this.state;

    let schoolyear = '';
    if (selectedSchoolYear != null) {
      schoolyear = selectedSchoolYear.YearNumber;
      if(getCurrentLocale() == 'en' && selectedSchoolYear.YearNumberEn && selectedSchoolYear.YearNumberEn != ''){
        schoolyear = selectedSchoolYear.YearNumberEn;
      }
    }
    let semester = '';
    if (selectedSemester != null) {
      semester = selectedSemester.name;
    }

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('TUITION_REPORT')}
          onMenuTap={() => this._back()}
        />
        <ScrollView style={styles.container} contentContainerStyle={{flexGrow: 1}}>
          <TouchableOpacity onPress={this._onChangeSchoolYear} style={styles.bigContainer} activeOpacity={1.0}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ ...styles.title2}}>{translang.t('ACADEMIC_year2')}</Text>
              <Text style={{ ...styles.selectValueText }}>{schoolyear ? schoolyear : translang.t('ACADEMIC_msg_selectyear')}</Text>
            </View>
            <View style={styles.bottomline} />
          </TouchableOpacity>

          <TouchableOpacity onPress={this._onChangeSemester} style={styles.bigContainer} activeOpacity={1.0}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ ...styles.title2 }}>{translang.t('ACADEMIC_semester')}</Text>
              <Text style={{ ...styles.selectValueText}}>{semester ? semester : translang.t('ACADEMIC_msg_selectsemester')}</Text>
            </View>
            <View style={styles.bottomline} />
          </TouchableOpacity>

          <NextButton
            label={translang.t('COMMON_next')}
            containerStyle={styles.buttonStyle}
            buttonStyle={{ borderRadius: 40}}
            colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
            isVerticalGradient={false}
            _onPress={() => this.__next()} />

        </ScrollView>

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.n_ic_warning}
          message={this.state.modalBody}
          buttonColors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
          isVerticalGradient={false}
          onClose={() => { this.setState({ showModal: false }) }}
        />

        <SchoolYearModal
          isVisible={this.state.showSchoolYearModal}
          onSchoolYearSelect={this.onSchoolYearSelect}
          listData = {this.state.yearList}
        />

        <SemesterModal
          isVisible={this.state.showSemesterModal}
          onSemesterSelect={this.onSemesterSelect}
          listData = {this.state.termList}
        />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white
  },
  bigContainer: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    shadowColor: 'black',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 2,
    justifyContent: 'center',
    minHeight: 200,
  },
  bottomline: {
    height: 1,
    width: '100%',
    backgroundColor: Color.n_default_orange,
    position: 'absolute',
    bottom: 35,
  },

  buttonStyle:{
    width: 290,
    marginVertical:15,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  title2: {
    fontFamily: 'THSarabunNew',
    fontSize: 30,
    fontWeight: 'bold',
    color: Color.n_default_orange,
    marginTop: 20,
  },
  selectValueText: {
    width: '100%',
    textAlign: 'center',
    fontFamily: 'THSarabunNew',
    fontSize: 28,
    color: Color.n_default_gray,
    position: 'absolute',
    bottom: 40,
  },
});
