import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import RadioGroup, {RadioButtonProps} from 'react-native-radio-buttons-group';

import LinearGradient from 'react-native-linear-gradient';
import GradientButton from '../../components/GradientButton';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CustomTextInput from '../../components/CustomTextInput';
import CustomPassInput from '../../components/CustomPassInput';
import ValidationComponent from 'react-native-form-validator';
import Images from '../../themes/Images';
import Orientation from 'react-native-orientation-locker';
import _ from 'lodash';
import Color from '../../constants/color';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import { speak } from '../../utils/tts';
import translang from '../../utils/language.utils';
import SchoolModal from '../../components/SchoolModal';
import ApiManager from "../../managers/ApiManager";
import { SafeAreaView } from 'react-native-safe-area-context';
import StorageManager from '../../managers/StorageManager';
import { Right } from 'native-base';
import { getDBConnection, createUserTable, checkExist, insertUser, getAllUserInfo } from '../../utils/DBManager';
import Constant from '../../constants/constants';

import BackNavigationBar from '../../components/BackNavigationBar';
import { ScrollView } from 'react-native-gesture-handler';
import CalendarModal from '../../components/CalendarModal';
import moment from 'moment';

export default class SignUpStepOneScreen extends ValidationComponent {
  constructor(props) {
    super(props);

    this.state = {
      userName: '',
      password: '',
      
      isbase: true,
      password: '',
      showSchoolModal: false,
      selectedSchool: null,
      valDepartment: "",
      valPosition: "",
      valName: "",
      valSurname: "",
      showDatePicker: false,
      valBirthday: "",
      valGender: '1',
      valHouseNo: '',
      valGroup: '',
      valAlley: '',
      valRoad: '',
      valProvince: '',
      valDistrict: '',
      valZipcode: '',
      valPhonenumber: '',
      valEmail: '',
      isLoggingIn: false,
      showModal: false,
      modalBody: '',
      

    };
    //this.backhandler = null;
  }

      
  

  handleBackButton = () => {
    if(this.state.showDatePicker){
      this.setState({showDatePicker: false});
    }else{
      this.back();
    }
    return true;
  };

  async componentDidMount() {
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", () => {     
      const password = this.props.navigation.getParam('password');
      this.setState({isbase: true, password: password})
    });
  }

  componentWillUnmount() {
    if(this.backhandler){
      this.backhandler.remove();
    }
    if(this.focusListener){
      this.focusListener.remove();
    }
  }

  back = () => {
    this.props.navigation.goBack();
  };

  _onChangeSchool = () => {
    this.setState({
      showSchoolModal: true,
    });
  };
  onSchoolSelect = (item) => {
    if (item == null) {
      this.setState({ showSchoolModal: false })
    } else {
      this.setState({ showSchoolModal: false, selectedSchool: item })
    }
  };
  _onChangeDepartment = (str) => {
    this.setState({ valDepartment: str });
  };
  _onChangePosition = (str) => {
    this.setState({ valPosition: str });
  };
  _onChangeName = (str) => {
    this.setState({ valName: str });
  };
  _onChangeSurname = (str) => {
    this.setState({ valSurname: str });
  };
  _onChangeBirthday = () => {
    this.setState({
      showDatePicker: true,
    });
  };
  onDatePicked = (date) => {
    if (date === null || date === '') {
      this.setState({showDatePicker: false});
      return;
    };
    const formattedDate = moment(date).format('YYYY-MM-DD');
    this.setState({ valBirthday: formattedDate, showDatePicker: false });
  };
  onChangeGender = (radioArray) => {
    const selItem = radioArray.filter(item => item.selected === true);
    this.setState({valGender: selItem[0].value});
  };
  _onChangeHouseNo = (str) => {
    this.setState({ valHouseNo: str});
  };
  _onChangeGroup = (str) => {
    this.setState({ valGroup: str});
  };
  _onChangeAlley = (str) => {
    this.setState({ valAlley: str});
  };
  _onChangeRoad = (str) => {
    this.setState({ valRoad: str});
  };
  _onChangeProvince = (str) => {
    this.setState({ valProvince: str});
  };
  _onChangeDistrict = (str) => {
    this.setState({ valDistrict: str});
  };
  _onChangeZipcode = (str) => {
    this.setState({ valZipcode: str});
  };
  _onChangePhoneNumber = (str) => {
    this.setState({ valPhonenumber: str});
  };
  _onChangeEmail = (str) => {
    this.setState({ valEmail: str});
  };

  _gotoNext = () =>{
    if (this.state.selectedSchool == null) {
      this.setState({ showModal: true, modalBody: translang.t('HOME_msg_selectschool') });
      return;
    } else if (_.isEmpty(this.state.valName)) {
      this.setState({ showModal: true, modalBody: translang.t('HOME_msg_username') });
      return;
    } else if (_.isEmpty(this.state.valBirthday)) {
      this.setState({ showModal: true, modalBody: translang.t('HOME_msg_birthday') });
      return;
    }

    this.setState({isbase: false})
  }

  _register = async () => {
    const { selectedSchool, userName, password } = this.state;

    this.setState({ isLoggingIn: true });
    ApiManager.signin(userName, password, selectedSchool.SchoolID)
      .then(async success => {
        if (!success) {
          const msg = translang.t('INCORRECT_USERNAME_PWD') + '\n' + translang.t('CONTACT_YOUER_SCHOOL_ADMIN');
          this.setState({ showModal: true, modalBody: msg });
          return Promise.reject(msg);
        } else {
          const user = await StorageManager.getUser();
          const userId = user.ID;
          const schoolId = user.SchoolId;

          const isExist = await checkExist(user.ID);
          if(!isExist){
            const resInsert = await insertUser(user.ID, userName, password, user.SchoolId, user.Type, user.Value, user.name, user.lastname, user.sex, user.token, user.image, "", "", user.ID);
            if(resInsert){
              await getAllUserInfo();
            }else{
              console.log("Add Failed");
            }
          }
          return ApiManager.getUserInfo(userId, schoolId);
        }
      })
      .then(() => {
        this.setState({ isLoggingIn: false });
        this.props.navigation.navigate('App');
      })
      .catch(err => {
        console.log("ERROR", err);
        const msg = translang.t('INCORRECT_USERNAME_PWD') + '\n' + translang.t('CONTACT_YOUER_SCHOOL_ADMIN');
        this.setState({ showModal: true, modalBody: msg });
        this.setState({ isLoggingIn: false });
      });
  };

  

  

  render() {
    const { isbase, userName, selectedSchool, isLoggingIn} = this.state;
    let schoolName = ""
    if(selectedSchool != null){
      schoolName = selectedSchool.name
    }
    
    let isMale = true;
    if(this.state.valGender == "1"){
      isMale = false
    }
   
    radioButtonsData = [{
      id: '1',
      color: Color.n_button_gradient_green_start,
      borderColor: Color.n_button_gradient_green_start,
      labelStyle: {fontFamily: 'THSarabunNew', fontSize: 27, color: Color.n_default_gray},
      label: translang.t('Male'),
      value: '0', 
      selected: isMale
    }, 
    {
      id: '2',
      color: Color.n_button_gradient_green_start,
      borderColor: Color.n_button_gradient_green_start,
      labelStyle: {fontFamily: 'THSarabunNew', fontSize: 27, color: Color.n_default_gray},
      label: translang.t('Female'),
      value: '1', 
      selected: !isMale
  }]

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('REGEISTER')}
          onMenuTap={() => this.back()}
        />
        <KeyboardAwareScrollView style={styles.container}>
          <ScrollView>
            <View style={styles.bigContainer}>
              <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 40,}}>
                <View style={{...styles.stepTextContainer, backgroundColor: Color.n_default_orange}}>
                  <Text style={{...styles.stepTextStyle, color: Color.white}}>1</Text>
                </View>
                <View style={{width: 30, height: 10, borderRadius: 5, backgroundColor: isbase?Color.n_default_gray_light:Color.n_default_orange, marginHorizontal: 2}}/>
                <View style={{...styles.stepTextContainer, backgroundColor: isbase?Color.n_default_gray_light:Color.n_default_orange}}>
                  <Text style={{...styles.stepTextStyle, color: isbase?Color.n_default_gray:Color.white}}>2</Text>
                </View>
              </View>
              {isbase && <>
                <TouchableOpacity onPress={this._onChangeSchool}>
                  <CustomTextInput
                    inputStyle={styles.textInputStyle}
                    inputWrapperStyle={styles.textInputWrapperStyle}
                    notouch="true"
                    value={schoolName}
                    placeholder={translang.t('HOME_school')}
                    placeholderTextColor={Color.n_text_placeholder_gray}
                  />
                </TouchableOpacity>

                <CustomTextInput
                  inputStyle={styles.textInputStyle}
                  inputWrapperStyle={styles.textInputWrapperStyle}
                  value={this.state.valDepartment}
                  placeholder={translang.t('USERINFO_department')}
                  placeholderTextColor={Color.n_text_placeholder_gray}
                  onChangeText={this._onChangeDepartment}
                />

                <CustomTextInput
                  inputStyle={styles.textInputStyle}
                  inputWrapperStyle={styles.textInputWrapperStyle}
                  value={this.state.valPosition}
                  placeholder={translang.t('PROFILE_position')}
                  placeholderTextColor={Color.n_text_placeholder_gray}
                  onChangeText={this._onChangePosition}
                />
                <CustomTextInput
                  inputStyle={styles.textInputStyle}
                  inputWrapperStyle={styles.textInputWrapperStyle}
                  value={this.state.valName}
                  placeholder={translang.t('USERINFO_name')}
                  placeholderTextColor={Color.n_text_placeholder_gray}
                  onChangeText={this._onChangeName}
                />
                <CustomTextInput
                  inputStyle={styles.textInputStyle}
                  inputWrapperStyle={styles.textInputWrapperStyle}
                  value={this.state.valSurname}
                  placeholder={translang.t('USERINFO_surname')}
                  placeholderTextColor={Color.n_text_placeholder_gray}
                  onChangeText={this._onChangeSurname}
                />


                <View style={{marginBottom: 35}}>
                  <Text style={{fontSize: 27, color: Color.n_text_placeholder_gray}}>{translang.t('PROFILE_gender')}</Text>
                  <RadioGroup 
                      radioButtons={radioButtonsData} 
                      onPress={this.onChangeGender} 
                      layout='row'
                  />
                </View>

                <TouchableOpacity onPress={this._onChangeBirthday}>
                  <CustomTextInput
                    inputStyle={styles.textInputStyle}
                    inputWrapperStyle={styles.textInputWrapperStyle}
                    notouch="true"
                    value={this.state.valBirthday}
                    placeholder={translang.t('PROFILE_birthday')}
                    placeholderTextColor={Color.n_text_placeholder_gray}
                  />
                </TouchableOpacity>
              </>
              }
              {!isbase && <>
                <CustomTextInput
                  inputStyle={styles.textInputStyle}
                  inputWrapperStyle={styles.textInputWrapperStyle}
                  value={this.state.valHouseNo}
                  placeholder={translang.t('LEAVE_houseno')}
                  placeholderTextColor={Color.n_text_placeholder_gray}
                  onChangeText={this._onChangeHouseNo}
                />
                <CustomTextInput
                  inputStyle={styles.textInputStyle}
                  inputWrapperStyle={styles.textInputWrapperStyle}
                  value={this.state.valGroup}
                  placeholder={translang.t('ADDR_GROUP')}
                  placeholderTextColor={Color.n_text_placeholder_gray}
                  onChangeText={this._onChangeGroup}
                />
                <CustomTextInput
                  inputStyle={styles.textInputStyle}
                  inputWrapperStyle={styles.textInputWrapperStyle}
                  value={this.state.valAlley}
                  placeholder={translang.t('ADDR_ALLAY')}
                  placeholderTextColor={Color.n_text_placeholder_gray}
                  onChangeText={this._onChangeAlley}
                />
                <CustomTextInput
                  inputStyle={styles.textInputStyle}
                  inputWrapperStyle={styles.textInputWrapperStyle}
                  value={this.state.valRoad}
                  placeholder={translang.t('ADDR_ROAD')}
                  placeholderTextColor={Color.n_text_placeholder_gray}
                  onChangeText={this._onChangeRoad}
                />
                <CustomTextInput
                  inputStyle={styles.textInputStyle}
                  inputWrapperStyle={styles.textInputWrapperStyle}
                  value={this.state.valProvince}
                  placeholder={translang.t('ADDR_PROVINCE')}
                  placeholderTextColor={Color.n_text_placeholder_gray}
                  onChangeText={this._onChangeProvince}
                />
                <CustomTextInput
                  inputStyle={styles.textInputStyle}
                  inputWrapperStyle={styles.textInputWrapperStyle}
                  value={this.state.valDistrict}
                  placeholder={translang.t('ADDR_DISTRICT')}
                  placeholderTextColor={Color.n_text_placeholder_gray}
                  onChangeText={this._onChangeDistrict}
                />
                <CustomTextInput
                  inputStyle={styles.textInputStyle}
                  inputWrapperStyle={styles.textInputWrapperStyle}
                  value={this.state.valZipcode}
                  placeholder={translang.t('ADDR_ZIPCODE')}
                  placeholderTextColor={Color.n_text_placeholder_gray}
                  onChangeText={this._onChangeZipcode}
                />
                <CustomTextInput
                  inputStyle={styles.textInputStyle}
                  inputWrapperStyle={styles.textInputWrapperStyle}
                  value={this.state.valPhonenumber}
                  placeholder={translang.t('PROFILE_phonenumber')}
                  placeholderTextColor={Color.n_text_placeholder_gray}
                  onChangeText={this._onChangePhoneNumber}
                />
                <CustomTextInput
                  inputStyle={styles.textInputStyle}
                  inputWrapperStyle={styles.textInputWrapperStyle}
                  value={this.state.valEmail}
                  placeholder={translang.t('PROFILE_email')}
                  placeholderTextColor={Color.n_text_placeholder_gray}
                  onChangeText={this._onChangeEmail}
                />
              </>
              }
            </View>
            {isbase &&
              <GradientButton
                containerStyle={styles.loginBtn}
                label={translang.t('COMMON_next')}
                colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                _onPress={() => this._gotoNext()}
              />
            }
            {!isbase &&
              <View style={styles.actionContainer}>
              {isLoggingIn ? (
                <View style={styles.loginBtn}>
                  <LinearGradient
                    colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                    start={{x: 0, y: 1}}
                    end={{x: 1, y: 0}}
                    style={styles.loginBtnBackground}>
                    <ActivityIndicator color={Color.white} />
                  </LinearGradient>
                </View>
              ) : (
                  <GradientButton
                    containerStyle={styles.loginBtn}
                    colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                    label={translang.t('REGEISTER')}
                    _onPress={() => this._register()}
                  />
                )}
            </View>
            }
          </ScrollView>
        </KeyboardAwareScrollView>

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.alert_inbox}
          message={this.state.modalBody}
          buttonColors={[Color.red_orange, Color.soft_red]}
          isVerticalGradient={false}
          onClose={() => { this.setState({ showModal: false }) }}
        />
        <SchoolModal
          isVisible={this.state.showSchoolModal}
          header={translang.t('HOME_searchschool')}
          positiveText={translang.t('HOME_close')}
          onSchoolSelect={this.onSchoolSelect}
        />
        <CalendarModal
          isVisible={this.state.showDatePicker}
          selectedDate={this.state.deliveryDate}
          type={'single'}
          onDateSelect={result => this.onDatePicked(result)} />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white
  },
  appLogo: {
    width: '100%',
    height: '100%',
  },
  appimage: {
    marginTop: 20,
    width: '100%',
    height: 130,
    alignItems: 'center',
  },
  bigContainer: {
    margin: 30,
    padding: 20,
    borderRadius: 25,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 2,    
  },
  stepTextContainer: {
    width: 30, 
    height: 30, 
    borderRadius: 30, 
    backgroundColor: Color.n_default_orange, 
    marginHorizontal: 2, 
    justifyContent: 'center', 
    alignItems: 'center'
  },

  stepTextStyle: {
    fontFamily: 'THSarabunNew',
    fontWeight: '900',
    fontSize: 25,
  },
  textInputStyle: {
    borderWidth: 0,
    borderColor: Color.n_default_brown,
    fontSize: 27
  },
  textInputWrapperStyle: {
    marginBottom: 35,
    borderColor: Color.n_default_brown,
    borderBottomWidth: 2,
  },








  mainLoginContainer: {
    flex: 1,
    marginTop: 40,
  },
  subLoginContainer: {
    flex: 1,
    margin: 0,
  },
  actionContainer: {
    flex: 1,
    alignItems: 'center',
  },
  loginBtn: {
    width: '100%',
    height: 70,
    marginVertical: 25,
    paddingHorizontal: 35,
  },
  loginBtnBackground: {
    flex: 1,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langText: {
    color: '#707070',
    fontSize: 30,
    marginTop: 10,
    marginRight: 20,
    alignSelf: 'flex-end',
  },
  forgotText: {
    color: Color.n_default_orange,
    fontSize: 20,
    fontWeight: 'bold',
  },
  schoolTextWrapper: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: '#A0A0A0',
    borderRadius: 5,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginTop: 5,
  },
  schoolText: {
    fontSize: 16,
    paddingHorizontal: 15,
    paddingVertical: 8,
    padding: Platform.select({
      android: 0,
    }),
    color: '#707070',
    fontWeight: '400',
    fontFamily: 'THSarabunNew',
  },
});
