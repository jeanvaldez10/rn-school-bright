import React from 'react';
import { Image, View, TouchableOpacity, ImageBackground, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import { ScrollView } from 'react-native-gesture-handler';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileModal from '../../components/ProfileModal';
import BackNavigationBar from '../../components/BackNavigationBar';
import IconInfoItem from '../../components/IconInfoItem';
import Storage from '../../managers/StorageManager';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import moment from 'moment';

import CardInfoItem from '../../components/CardInfoItem';
import GradientButton from '../../components/GradientButton';
import CustomTextInput from '../../components/CustomTextInput';
import GradientButtonWithImg from '../../components/GradientButtonWithImg';

import SchoolModal from '../../components/SchoolModal';
import GenderModal from '../../components/SelectListModal';
import StatusModal from '../../components/SelectListModal';

import CalendarModal from '../../components/CalendarModal';
import LinearGradient from 'react-native-linear-gradient';

const InfoTextItem = (props) => {
  const { icon_mark, label, value_txt } = props;
  return (
    <View style={styles.menuItem} >
      {/* <Image source={icon_mark} style={[styles.image]}></Image> */}
      <View style={{ flexDirection: 'column' }}>
          <Text style={[styles.topText]}> {label} </Text>
          <Text style={[styles.bottomText]} multiline={true}> {value_txt}</Text>                  
      </View>
    </View>

  );
};

const InfoTextInputItem = (props) => {
  const { icon_mark, label, value_txt, onChangeText, notouch } = props;
  return (
    <View style={styles.menuItem} >
      {/* <Image source={icon_mark} style={[styles.image]}></Image> */}
      <View style={{ flexDirection: 'column', flex: 1}}>
        <Text style={[styles.topText]}> {label} </Text>
        <CustomTextInput
          inputStyle={{
            borderBottomWidth: 1,
            borderColor: Color.n_default_brown,
          }}
          inputWrapperStyle={{
            borderColor: Color.n_default_brown,
            borderBottomWidth: 1,
          }}
          placeholder={value_txt}
          notouch = {notouch ?? false}
          placeholderTextColor={Color.n_text_placeholder_gray}
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
};

export default class ProfileTeacherEducationTabScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      showModal: false,
      isEdit: false,

      showSchoolModal: false,
      showGenderModal: false,
      showDatePicker: false,
      showStatusModal: false,

      genderList: [{data: '0', title: translang.t('Male')}, {data: '1', title: translang.t('Female')}],
      statusList: [{data: '0', title: "Status 1"}, {data: '1', title: "Status 2"}],

      valSchoolItem: "",
      valName: "",
      valJob: "",
      valDepartment: "",
      valGenderItem: "",
      valBirthday: "",
      valNational: "",
      valReligion: "",
      valStatus: '',
      valPhoneNumber: "",
      valEmail: "",
      valAddress: "",

    };
  }

  async componentDidMount() {
    const user = await Storage.getUserInfo();
    this.setState({ user });
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.isFocused !== this.props.isFocused && this.props.isFocused === true) {
      const user = await Storage.getUserInfo();
      this.setState({ user });
    }
  }
  
  componentWillUnmount = () => {
    
  };

  back = () => {
    // this.props.navigation.goBack();
    const parentRoute = this.props.navigation.getParam('parent') ?? 'App';
    this.props.navigation.navigate(parentRoute);
  };

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
  };

  _onChangeSchool = () => {
    this.setState({
      showSchoolModal: true,
    });
  };
  onSchoolSelect = (item) => {
    if (item == null) {
      this.setState({ showGenderModal: false })
    } else {
      this.setState({ showGenderModal: false, valSchoolItem: item })
    }
  };

  _onChangeGender = () => {
    this.setState({
      showGenderModal: true,
    });
  };
  onGenderSelect = (item) => {
    if (item == null) {
      this.setState({ showGenderModal: false })
    } else {
      this.setState({ showGenderModal: false, valGender: item.data })
    }
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

  _onChangeStatus = () => {
    this.setState({
      showStatusModal: true,
    });
  };
  onStatusSelect = (item) => {
    if (item == null) {
      this.setState({ showStatusModal: false })
    } else {
      this.setState({ showStatusModal: false, valStatus: item })
    }
  };


  render() {
    const user = this.state.user;
    let schoolImage = Images.school;
    let profileImage = Images.teacher_02;
    let logo = Images.n_img_card_logo;
    let userName = "_";
    let userName_first = "-";
    let userName_last = "-";
    let sex = user.cSex ?? 0
    let birthday = '';
    
    if(getCurrentLocale() == 'en' && user.NameEn != null && user.LastNameEN !== ''){
      userName = (user.NameEn ?? '') + ' ' + (user.LastNameEN ?? '');
      userName_first = (user.NameEn ?? '');
      userName_last = (user.LastNameEN ?? '');
    }
      
    if(getCurrentLocale() == 'th' || user.sName == null || user.sLastname === ''){
      userName = (user.sName ?? '') + ' ' + (user.sLastname ?? '');
      userName_first = (user.sName ?? '');
      userName_last = (user.sLastname ?? '');
    }

    if (user !== {}) {
      if (user.school_image !== null && user.school_image !== '') {
        schoolImage = {uri: this.state.user.school_image};
      }
      if (user.school_logo !== null && user.school_logo !== '') {
        logo = {uri: user.school_logo};
      }
      if (user.image !== null && user.image !== '') {
        profileImage = {uri: user.image};
      }

      if (user.dBirth !== null && user.dBirth !== '') {
        birthday = moment(user.dBirth).format('DD/MM/YYYY');
      }
    }

    return (
      <View style={styles.container}>
        

        <ScrollView style={styles.container}>
          <ImageBackground source={schoolImage} style={styles.headerImgContainer}>
            <TouchableOpacity style={styles.cardContainer} activeOpacity={0.9}
              onPress={() => this.setState({ showModal: true })}>

              <Image source={Images.n_img_card_back} style={{resizeMode: 'stretch', position: 'absolute', width: '100%', height: '100%', flex: 1}}></Image>      

              <LinearGradient
                style={styles.schoolNameStyle}
                start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                colors={[Color.n_button_gradient_orange_end, Color.n_button_gradient_orange_start]}>
                <Image source={logo} style={{width: 20, height: 20, resizeMode: 'contain', marginTop: 5}}/>
                <View style={{marginLeft: 20,}}>
                  <Text style={{...styles.schoolName, fontSize: 10,}}>{user.SchoolName ?? ''}</Text>
                  <Text style={styles.schoolName}>{user.SchoolName ?? ''}</Text>
                </View>
              </LinearGradient>
              
              <View style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginTop: 'auto', marginBottom: 'auto'}}>
                <Image source={profileImage} style={{ height: 86, width: 70, borderRadius: 5, resizeMode: 'contain', marginRight: 10}}></Image>
                <View>
                  <CardInfoItem
                    title={translang.t('staff_id')}
                    value_txt={user.ID ?? '-'}
                    titleFontSize={11}
                    infoFontSize={12}/>

                  <CardInfoItem
                    title={translang.t('PROFILE_firstname')}
                    value_txt={userName_first ?? '-'}
                    titleFontSize={11}
                    infoFontSize={12}/>

                  <CardInfoItem
                    title={translang.t('PROFILE_lastname')}
                    value_txt={userName_last ?? '-'}
                    titleFontSize={11}
                    infoFontSize={12}/>

                  <CardInfoItem
                    title={translang.t('PROFILE_department')}
                    value_txt={user.department ?? '-'}
                    titleFontSize={11}
                    infoFontSize={12}/>

                  <CardInfoItem
                    title={translang.t('PROFILE_position')}
                    value_txt={user.job_name ?? '-'}
                    titleFontSize={11}
                    infoFontSize={12}/>                  
                </View>
              </View>
            </TouchableOpacity >
          </ImageBackground>

          <View>
          {!this.state.isEdit &&<View>
              <InfoTextItem
                icon_mark={Images.ic_hat_blue}
                label={translang.t('PROFILE_school')}
                value_txt={user.SchoolName ?? '-'}
                imageSize={36}/>
              
              <InfoTextItem
                icon_mark={Images.ic_user_blue}
                label={translang.t('PROFILE_namesurname')}
                value_txt={userName ?? '-'}
                imageSize={36}/>

              <InfoTextItem
                icon_mark={Images.ic_new_chair}
                label={translang.t('JOB')}
                value_txt={user.job_name ?? '-'}
                imageSize={36}/>

              <InfoTextItem
                icon_mark={Images.ic_new_chair}
                label={translang.t('USERINFO_department')}
                value_txt={user.department ?? '-'}
                imageSize={36}/>

              <InfoTextItem
                icon_mark={Images.ic_sex_blue}
                label={translang.t('PROFILE_gender')}
                value_txt={sex == 0 ? translang.t('Male') : translang.t('Female')}
                imageSize={36}
              />

              <InfoTextItem
                icon_mark={Images.ic_calendar_blue}
                label={translang.t('PROFILE_birthday')}
                value_txt={birthday}
                imageSize={36}
              />

              <View style={{flexDirection: 'row'}}>
                <View style={{flex: 1}}>
                  <InfoTextItem
                    icon_mark={Images.ic_flag_blue}
                    label={translang.t('Nationality')}
                    value_txt={"-"}
                    imageSize={36}
                  />
                </View>
                
                <View style={{flex: 1}}>
                  <InfoTextItem
                    icon_mark={Images.ic_behavior_score}
                    label={translang.t('Religion')}
                    value_txt={"_"}
                    imageSize={36}
                  />
                </View>
              </View>

              <InfoTextItem
                icon_mark={Images.ic_family_blue}
                label={translang.t('STATUS')}
                value_txt={'-'}
                imageSize={36}
              />

              <InfoTextItem
                icon_mark={Images.ic_call_blue}
                label={translang.t('PROFILE_phonenumber')}
                value_txt={user.sPhone ?? '-'}
                imageSize={36}
              />
              <InfoTextItem
                icon_mark={Images.ic_envelope_new}
                label={translang.t('PROFILE_email')}
                value_txt={user.sEmail ?? '-'}
                imageSize={36}
              />
              
              <InfoTextItem
                icon_mark={Images.ic_location_blue}
                label={translang.t('LEAVE_address')}
                value_txt={user.sAddress ?? '-'}
                imageSize={36}
              />

              <View style={{marginVertical: 30, flexDirection:'row', justifyContent: 'center'}}>
                <GradientButtonWithImg
                  label={translang.t('PROFILE_edit')}
                  iconImage={Images.n_ic_pencil_white}
                  containerStyle={{ width: 255, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
                  buttonStyle={{ borderRadius: 38, height: 75 }}
                  colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                  isVerticalGradient={false}
                  _onPress={() => {this.setState({isEdit: true})}} 
                   />
              </View>
            </View>}

          {this.state.isEdit &&<View>
            <TouchableOpacity onPress={this._onChangeSchool}>
              <InfoTextInputItem
                icon_mark={Images.ic_hat_blue}
                label={translang.t('PROFILE_school')}
                value_txt={this.state.valSchoolItem ? this.state.valSchoolItem.SchoolName : user.SchoolName}
                notouch = "true"
                imageSize={36}/>
            </TouchableOpacity>
            
            <InfoTextInputItem
              icon_mark={Images.ic_user_blue}
              label={translang.t('PROFILE_namesurname')}
              value_txt={userName ?? '-'}
              imageSize={36}
              onChangeText={(val)=>this.setState({valName: val})}/>

            <InfoTextInputItem
              icon_mark={Images.ic_new_chair}
              label={translang.t('JOB')}
              value_txt={user.job_name ?? '-'}
              imageSize={36}
              onChangeText={(val)=>this.setState({valJob: val})}/>

            <InfoTextInputItem
              icon_mark={Images.ic_new_chair}
              label={translang.t('USERINFO_department')}
              value_txt={user.department ?? '-'}
              imageSize={36}
              onChangeText={(val)=>this.setState({valDepartment: val})}/>

            <TouchableOpacity onPress={this._onChangeGender}>
              <InfoTextInputItem
                icon_mark={Images.ic_sex_blue}
                label={translang.t('PROFILE_gender')}
                value_txt={this.state.valGender == 0 ? translang.t('Male') : translang.t('Female')}
                imageSize={36}
                notouch = {true}
              />  
            </TouchableOpacity>
            
            <TouchableOpacity onPress={this._onChangeBirthday}>
              <InfoTextInputItem
                icon_mark={Images.ic_calendar_blue}
                label={translang.t('PROFILE_birthday')}
                value_txt={this.state.valBirthday}
                imageSize={36}
                notouch = {true}
              />
            </TouchableOpacity>

            <View style={{flexDirection: 'row', marginRight: 20}}>
              <View style={{flex: 1, marginRight: 10}}>
                <InfoTextInputItem
                  icon_mark={Images.ic_flag_blue}
                  label={translang.t('Nationality')}
                  value_txt={"-"}
                  imageSize={36}
                  onChangeText={(val)=>this.setState({valNational: val})}
                />
              </View>
              
              <View style={{flex: 1}}>
                <InfoTextInputItem
                  icon_mark={Images.ic_behavior_score}
                  label={translang.t('Religion')}
                  value_txt={this.state.valReligion}
                  imageSize={36}
                  onChangeText={(val)=>this.setState({valReligion: val})}
                />
              </View>
            </View>

            <TouchableOpacity onPress={this._onChangeStatus}>
              <InfoTextInputItem
                icon_mark={Images.ic_family_blue}
                label={translang.t('STATUS')}
                value_txt={this.state.valStatus.title}
                imageSize={36}
                notouch = {true}
              />
            </TouchableOpacity>
            
            <InfoTextInputItem
              icon_mark={Images.ic_call_blue}
              label={translang.t('PROFILE_phonenumber')}
              value_txt={this.state.valPhoneNumber? this.state.valPhoneNumber : user.sPhone}
              imageSize={36}
              onChangeText={(val)=>this.setState({valPhoneNumber: val})}/>
            <InfoTextInputItem
              icon_mark={Images.ic_envelope_new}
              label={translang.t('PROFILE_email')}
              value_txt={this.state.valEmail? this.state.valEmail : user.sEmail}
              imageSize={36}
              onChangeText={(val)=>this.setState({valEmail: val})}/>
            
            <InfoTextInputItem
              icon_mark={Images.ic_location_blue}
              label={translang.t('LEAVE_address')}
              value_txt={this.state.valAddress? this.state.valAddress : user.sAddress}
              imageSize={36}
              onChangeText={(val)=>this.setState({valAddress: val})}/>

            <View style={{marginVertical: 40, flexDirection:'row', justifyContent: 'center'}}>
              <GradientButton
                label={translang.t('COMMON_cancel')}
                containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
                buttonStyle={{ borderRadius: 22, height: 44 }}
                colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
                isVerticalGradient={false}
                _onPress={() => {this.setState({isEdit: false})}} 
              />

              <GradientButton
                label={translang.t('PROFILE_edit')}
                containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0, marginLeft: 30 }}
                buttonStyle={{ borderRadius: 22, height: 44 }}
                colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                isVerticalGradient={false}
                _onPress={() => {this.setState({isEdit: false})}} 
              />

              </View>
            
            </View>}

          </View>

          <ProfileModal
            isVisible={this.state.showModal}
            onPositivePress={() => this.setState({ showModal: false })}
            user={user}
          />

          <SchoolModal
            isVisible={this.state.showSchoolModal}
            header={translang.t('HOME_searchschool')}
            positiveText={translang.t('HOME_close')}
            onSchoolSelect={this.onSchoolSelect}
          />
          <GenderModal
            isVisible={this.state.showGenderModal}
            onListSelect={this.onGenderSelect}
            listData={this.state.genderList}
            dialogTtitle={translang.t('SELECT_GENDER')}
          />

          <StatusModal
            isVisible={this.state.showStatusModal}
            onListSelect={this.onStatusSelect}
            listData={this.state.statusList}
            dialogTtitle={translang.t('SELECT_STATUS')}
          />

          <CalendarModal
            isVisible={this.state.showDatePicker}
            selectedDate={this.state.deliveryDate}
            type={'single'}
            onDateSelect={result => this.onDatePicked(result)} />

        </ScrollView>
      </View>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
  },
  headerImgContainer: {
    height: 180, 
    width: '100%', 
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardContainer: {
    width: 260,
    height: 147,
    borderRadius: 15,
    backgroundColor: Color.white,
  },

  menuItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    paddingHorizontal: 30,
  },

  image: {
    height: 50, 
    width: 50, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: 25,
    marginRight: 10,
  },
  topText: {
    fontFamily: 'THSarabunNew',
    fontSize: 24, 
    fontWeight: 'bold',
    color: Color.n_default_orange 
  },
  bottomText: {
    fontFamily: 'THSarabunNew',
    fontSize: 22, 
    color: Color.dark
  },
  schoolNameStyle: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical:3,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    alignItems: 'center'
  },
  schoolName: {
    fontFamily: 'THSarabunNew',
    fontSize: 8,
    color: Color.white,
  },
});
