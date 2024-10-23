import React from 'react';
import {Image, View, BackHandler, TouchableOpacity, ImageBackground,} from 'react-native';
import {Text} from 'native-base';
import {ScaledSheet} from 'react-native-size-matters';
import NextButton from '../../components/NextButton';
import Color from '../../constants/color';
import {DrawerActions} from 'react-navigation-drawer';
import {SafeAreaView} from 'react-native-safe-area-context';
import SchoolYearModal from '../../components/SchoolYearModal';
import SemesterModal from '../../components/SemesterModal';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import BackNavigationBar from '../../components/BackNavigationBar';
import Storage from '../../managers/StorageManager';
import Images from '../../themes/Images';
import translang, {getCurrentLocale} from '../../utils/language.utils';
import {ScrollView} from 'react-native-gesture-handler';
import ProgressHud from '../../components/ProgressHud';
import ApiManager from '../../managers/ApiManager';
import ClassLevelModal from '../../components/SelectListModal';
import moment from "moment";

export default class OnlineStudentScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showModal: false,
      showSchoolYearModal: false,
      showSemesterModal: false,
      showClassLevelModal: false,
      selectedSchoolYear: null,
      selectedSemester: null,
      selectedClassLevel: null,
      userInfo: {},

      yearList: [],
      termList: [],
      classLevelList: [],
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    console.log("OnlineStudentScreen");
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    userInfo = await Storage.getUserInfo();
    this.setState({userInfo}, () => {
      this.getYearList();
      this.getClassLevelData();
    });
  }

  componentWillUnmount = () => {
    if (this.backhandler) {
      this.backhandler.remove();
    }
    if (this.focusListener) {
      this.focusListener.remove();
    }
  };

  back = () => {
    this.props.navigation.goBack();
  };

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
  };

  __next = async () => {

    const {selectedSchoolYear, selectedSemester, selectedClassLevel} = this.state;

    if (selectedSchoolYear == null) {
      this.setState({showModal: true, modalBody: translang.t('ACADEMIC_msg_selectyear')});
      return;
    }

    if (selectedSemester == null) {
      this.setState({showModal: true, modalBody: translang.t('ACADEMIC_msg_selectsemester')});
      return;
    }
    this.props.navigation.navigate('OnlineStudentSubjectList', {
      userInfo: this.state.userInfo,
      year: this.state.selectedSchoolYear,
      term: this.state.selectedSemester
    });
  };

  getYearList = () => {
    this.setState({isLoading: true});
    ApiManager.getYearSelectGrade(this.state.userInfo.SchoolID).then(data => {
      this.setState({yearList: data, isLoading: false});
      data.forEach((item) => {
        if (item.IsCurrentAcademicYear == true) {
          item.name = item.YearNumber;
          item.nameEn = item.YearNumberEn;
          this.setState({selectedSchoolYear: item});
          this.getTermList(true);
          this.getClassLevelData();
        }
      })
    }).catch(error => {
      console.error("ERRROR", error);
    });
  };


  getTermList = (autoInit = false) => {
    ApiManager.getTermSelectGrade(this.state.selectedSchoolYear.Yearid, this.state.userInfo.ID).then(data => {
      let temp = null;
      const current = moment();
      if (autoInit) {
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

      } else {
        this.setState({termList: data, isLoading: false, selectedSemester: null});
      }

    }).catch(error => {
      console.error(error);
    });
  };


  getClassLevelData = () => {
    ApiManager.getStudentClassLevel(this.state.userInfo.SchoolID).then(list => {
      const allItem = {ID: "ALL", NameEN: translang.t('ALL'), NameTH: translang.t('ALL')};
      list.unshift(allItem);
      this.setState({classLevelList: list, isLoading: false});
    }).catch(error => {
      console.log(error);
      this.setState({isLoading: false});
    });
  };

  _onChangeSchoolYear = () => {
    this.setState({
      showSchoolYearModal: true,
    });
  };
  onSchoolYearSelect = (item) => {
    if (item == null) {
      this.setState({showSchoolYearModal: false})
    } else {
      this.setState({showSchoolYearModal: false, selectedSchoolYear: item, selectedSemester: null}, () => {
        this.getTermList();
      })
    }
  };

  _onChangeSemester = () => {
    const {selectedSchoolYear} = this.state;

    if (selectedSchoolYear == null) {
      this.setState({showModal: true, modalBody: translang.t('ACADEMIC_msg_selectyear')});
      return;
    }

    this.setState({
      showSemesterModal: true,
    });
  };
  onSemesterSelect = (item) => {
    if (item == null) {
      this.setState({showSemesterModal: false});
    } else {
      this.setState({showSemesterModal: false, selectedSemester: item}, () => {
        this.getClassLevelData();
      })
    }
  };

  _onChangeClassLevel = () => {
    this.setState({showClassLevelModal: true,});
  };
  onClassLevelSelect = (item, index) => {
    if (item == null) {
      this.setState({showClassLevelModal: false})
    } else {
      const classLevel = this.state.classLevelList[index];
      this.setState({showClassLevelModal: false, selectedClassLevel: classLevel})
    }
  };


  render() {
    const {selectedSchoolYear, selectedSemester} = this.state;
    let schoolyear = '';
    if (selectedSchoolYear != null) {
      schoolyear = selectedSchoolYear.YearNumber;
      if (getCurrentLocale() == 'en' && selectedSchoolYear.YearNumberEn && selectedSchoolYear.YearNumberEn != '') {
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
          title={translang.t('DRAWER_onlineclassroom')}
          onMenuTap={() => this.back()}
        />

        <ScrollView style={styles.containerScroll} contentContainerStyle={{flexGrow: 1}}>
          <TouchableOpacity onPress={this._onChangeSchoolYear} style={styles.bigContainer} activeOpacity={1.0}>
            <View style={{flex: 1, alignItems: 'center'}}>
              <Text style={{...styles.title2}}>{translang.t('ACADEMIC_year2')}</Text>
              <Text
                style={{...styles.selectValueText}}>{schoolyear ? schoolyear : translang.t('ACADEMIC_msg_selectyear')}</Text>
            </View>
            <View style={styles.bottomline}/>
          </TouchableOpacity>

          <TouchableOpacity onPress={this._onChangeSemester} style={styles.bigContainer} activeOpacity={1.0}>
            <View style={{flex: 1, alignItems: 'center'}}>
              <Text style={{...styles.title2}}>{translang.t('ACADEMIC_semester')}</Text>
              <Text
                style={{...styles.selectValueText}}>{semester ? semester : translang.t('ACADEMIC_msg_selectsemester')}</Text>
            </View>
            <View style={styles.bottomline}/>
          </TouchableOpacity>


          <NextButton
            label={translang.t('COMMON_next')}
            containerStyle={styles.buttonStyle}
            buttonStyle={{borderRadius: 40}}
            colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
            isVerticalGradient={false}
            _onPress={() => this.__next()}/>
        </ScrollView>

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.alert_inbox}
          title=' '
          message={this.state.modalBody}
          buttonColors={[Color.red_orange, Color.soft_red]}
          isVerticalGradient={false}
          onClose={() => {
            this.setState({showModal: false})
          }}
        />

        <SchoolYearModal
          isVisible={this.state.showSchoolYearModal}
          onSchoolYearSelect={this.onSchoolYearSelect}
          listData={this.state.yearList}
        />

        <SemesterModal
          isVisible={this.state.showSemesterModal}
          onSemesterSelect={this.onSemesterSelect}
          listData={this.state.termList}
        />

        <ProgressHud isVisible={this.state.isLoading}/>
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
  containerScroll: {
    flex: 1,
    flexDirection: "column",
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
  bottomline: {
    height: 1,
    width: '100%',
    backgroundColor: Color.n_default_orange,
    position: 'absolute',
    bottom: 35,
  },

  buttonStyle: {
    width: 290,
    marginVertical: 30,
    marginLeft: 'auto',
    marginRight: 'auto',
  }
});
