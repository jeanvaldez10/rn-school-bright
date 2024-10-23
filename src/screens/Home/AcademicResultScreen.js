import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, ImageBackground, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import NextButton from '../../components/NextButton';
import Color from '../../constants/color';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import SchoolYearModal from '../../components/SchoolYearModal';
import TypeSelModal from '../../components/SelectListModal';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import BackNavigationBar from '../../components/BackNavigationBar';
import Storage from '../../managers/StorageManager';
import Images from '../../themes/Images';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import { ScrollView } from 'react-native-gesture-handler';
import ProgressHud from '../../components/ProgressHud';
import ApiManager from '../../managers/ApiManager';


export default class AcademicResultScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showModal: false,
      modalBody: '',
      showTypeModal: false,
      showSchoolYearModal: false,
      showSemesterModal: false,
      selectedType: null,
      selectedSchoolYear: null,
      selectedSemester: null,
      userInfo: {},

      yearList: [],
      typeList: [],
      showAlertModal: false,
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    const { navigation } = this.props;
    console.log('AcademicResult');
    this.focusListener = navigation.addListener("didFocus", async () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      userInfo = await Storage.getUserInfo();
      this.setState({userInfo}, ()=>{
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

    this.props.navigation.goBack();
  };

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
  };

  __next = async () => {
    const { selectedSchoolYear, selectedSemester, selectedType } = this.state;
    if (selectedSchoolYear == null) {
      this.setState({ showModal: true, modalBody: translang.t('ACADEMIC_msg_selectyear') });
      return;
    }else if (selectedType == null) {
      this.setState({ showModal: true, modalBody: translang.t('SELECT_TYPE') });
      return;
    }
    if(selectedType.ErrorMessage != null){
      this.setState({ showModal: true, modalBody: selectedType.ErrorMessage});
      return;
    }

    this.props.navigation.navigate('AcademicOutput', {userInfo: this.state.userInfo, year: this.state.selectedSchoolYear, type: selectedType});
  };

  getYearList = ()=>{
    this.setState({isLoading: true});
    ApiManager.getYearSelectGradeAcademic(this.state.userInfo.SchoolID, getCurrentLocale()).then(data => {
      this.setState({ yearList: data, isLoading: false, showAlertModal: data.length == 0 });
    }).catch(error => {
      console.error("getYearList ERRROR", error);
      this.setState({isLoading: false});
    });
  };

  getTermList = ()=>{
    ApiManager.getTermSelectGradeAcademic(this.state.userInfo.SchoolID, this.state.selectedSchoolYear.nYear, this.state.userInfo.ID, getCurrentLocale()).then(data => {
      console.log("typelist:", data);
      this.setState({typeList: data, isLoading: false});
    }).catch(error => {
      console.error("getTermList Error", error);
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
      this.setState({ showSchoolYearModal: false })
    } else {
      this.setState({ showSchoolYearModal: false, selectedSchoolYear: item, selectedType: null }, ()=>{
        this.getTermList();
      })
    }
  };

  _onChangeType = () => {
    this.setState({
      showTypeModal: true,
    });
  };
  onTypeSelect = (item, index) => {
    if (item == null) {
      this.setState({ showTypeModal: false })
    } else {
      const itemSel = this.state.typeList[index];
      this.setState({ showTypeModal: false, selectedType: itemSel});
    }
  };

  render() {
    const { selectedSchoolYear, selectedSemester, selectedType } = this.state;
    let typeText = '';
    if (selectedType != null) {
      typeText = selectedType.Text;
    }

    let schoolyear = '';
    if (selectedSchoolYear != null) {
      schoolyear = selectedSchoolYear.YearNumber;
    }

    const typeList = this.state.typeList.map( typeItem => {
      return { title: typeItem.Text};
    });

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_acadresult')}
          onMenuTap={() => this.back()}
        />

        <ScrollView style={styles.containerScroll} contentContainerStyle={{flexGrow: 1}}>
          <TouchableOpacity onPress={this._onChangeSchoolYear} style={styles.bigContainer} activeOpacity={1.0}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ ...styles.title2}}>{translang.t('ACADEMIC_year2')}</Text>
              <Text style={{ ...styles.selectValueText }}>{schoolyear ? schoolyear : translang.t('ACADEMIC_msg_selectyear')}</Text>
            </View>
            <View style={styles.bottomline} />
          </TouchableOpacity>

          <TouchableOpacity onPress={this._onChangeType} style={styles.bigContainer} activeOpacity={1.0}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ ...styles.title2}}>{translang.t('PROFILE_TYPE')}</Text>
              <Text style={{ ...styles.selectValueText }}>{typeText ? typeText : translang.t('PROFILE_TYPE')}</Text>
            </View>
            <View style={styles.bottomline} />
          </TouchableOpacity>

          <NextButton
            label={translang.t('COMMON_next')}
            containerStyle={styles.buttonStyle}
            buttonStyle={{ borderRadius: 40}}
            colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
            isVerticalGradient={false}
            _onPress={() => this.__next()} />
        </ScrollView>

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.alert_inbox}
          title=' '
          message={this.state.modalBody}
          buttonColors={[Color.red_orange, Color.soft_red]}
          isVerticalGradient={false}
          onClose={() => { this.setState({ showModal: false }) }}
        />

        <SchoolYearModal
          isVisible={this.state.showSchoolYearModal}
          onSchoolYearSelect={this.onSchoolYearSelect}
          listData = {this.state.yearList}
        />

        <TypeSelModal
          isVisible={this.state.showTypeModal}
          onListSelect={this.onTypeSelect}
          listData={typeList}
          dialogTtitle={translang.t('PROFILE_TYPE')}
        />

        <AlertWithImageModal
          isVisible={this.state.showAlertModal}
          image={Images.n_ic_warning}
          message={translang.t('NO_SCHOOL_EXAM')}
          buttonColors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
          isVerticalGradient={false}
          onClose={() => { this.setState({ showAlertModal: false });  this.props.navigation.navigate('App',{});}}
        />

        <ProgressHud isVisible={this.state.isLoading} />
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

  buttonStyle:{
    width: 290,
    marginVertical:30,
    marginLeft: 'auto',
    marginRight: 'auto',
  }
});
