import React from 'react';
import {Image, View, Text, ImageBackground, TouchableOpacity } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Color from '../../constants/color';
import translang from '../../utils/language.utils';
import moment from 'moment';
import Images from '../../themes/Images';
import { ScrollView } from 'react-native-gesture-handler';
import IconInfoItem from '../../components/IconInfoItem';
import ProfileModal from '../../components/ProfileModal';
import Storage from '../../managers/StorageManager';
import CardInfoItem from '../../components/CardInfoItem';
import CustomTextInput from '../../components/CustomTextInput';
import GradientButton from '../../components/GradientButton';

const InfoTextItem = (props) => {
  const { icon_mark, label, value_txt } = props;
  return (
    <View style={styles.menuItem} >
      <Image source={icon_mark} style={[styles.image]}></Image>
      <View style={{ flexDirection: 'column' }}>
          <Text style={[styles.topText]}> {label} </Text>
          <Text style={[styles.bottomText]}> {value_txt}</Text>                  
      </View>
    </View>

  );
};

const InfoTextInputItem = (props) => {
  const { icon_mark, label, value_txt } = props;
  return (
    <View style={styles.menuItem} >
      <Image source={icon_mark} style={[styles.image]}></Image>
      <View style={{ flexDirection: 'column'}}>
        <Text style={[styles.topText]}> {label} </Text>
        <CustomTextInput
          inputStyle={{
            borderBottomWidth: 1,
            borderColor: Color.n_default_orange,
          }}
          inputWrapperStyle={{
            borderColor: Color.n_default_orange,
            borderBottomWidth: 1,
            width: 230
          }}
          inputStyle={styles.bottomText}
          placeholder={value_txt}
          placeholderTextColor={Color.n_text_placeholder_gray}
        />
      </View>
    </View>
  );
};

export default class ProfileStudentTabScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      showModal: false,
      isEdit: false,
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

 

  render() {
    const user = this.state.user;
    let schoolImage = Images.school;
    let profileImage = Images.student_01;
    let logo = Images.n_img_card_logo;
    let userName = (user.sName ?? '') + ' ' + (user.sLastname ?? '');
    let sex = user.cSex ?? 0
    let birthday = '';

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
                <View style={styles.schoolNameStyle}>
                  <Image source={logo} style={styles.schoolLogo}/>
                  <Text style={styles.schoolName}>{user.SchoolName ?? ''}</Text>
                </View>
              
              <View style={{marginTop: 5}}>
                <View style={{flexDirection: 'row', alignItems: 'center',paddingRight: 20}}>
                  <Image source={profileImage} style={{ height: 86, width: 70, borderRadius: 5, resizeMode: 'contain', marginRight: 10}}></Image>
                  <View>
                    <CardInfoItem
                      title={translang.t('PROFILE_namesurname')}
                      value_txt={userName ?? '-'}
                      titleFontSize={11}
                      infoFontSize={12}/>

                    <CardInfoItem
                      title={translang.t('PROFILE_class')}
                      value_txt={user.StudentClass ?? '-'}
                      titleFontSize={11}
                      infoFontSize={12}/>

                    <CardInfoItem
                      title={translang.t('PROFILE_studentid')}
                      value_txt={user.StudentId ?? '-'}
                      titleFontSize={11}
                      infoFontSize={12}/>

                    <CardInfoItem
                      title={translang.t('PROFILE_idcode')}
                      value_txt={user.sIdentification ?? '-'}
                      titleFontSize={11}
                      infoFontSize={12}/>
                  </View>
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
                icon_mark={Images.ic_hat_blue}
                label={translang.t('PROFILE_firstname')}
                value_txt={user.sName ?? '-'}
                imageSize={36}/>

              <InfoTextItem
                icon_mark={Images.ic_chair_blue}
                label={translang.t('PROFILE_lastname')}
                value_txt={user.sLastname ?? '-'}
                imageSize={36}
              />
              <InfoTextItem
                icon_mark={Images.ic_card_blue}
                label={translang.t('PROFILE_class')}
                value_txt={user.StudentClass ?? '-'}
                imageSize={36}
              />
              <InfoTextItem
                icon_mark={Images.ic_card_blue}
                label={translang.t('PROFILE_studentid')}
                value_txt={user.StudentId ?? '-'}
                imageSize={36}
              />
              <InfoTextItem
                icon_mark={Images.ic_card_blue}
                label={translang.t('PROFILE_idcode')}
                value_txt={user.sIdentification ?? '-'}
                imageSize={36}
              />
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

              <View style={{marginVertical: 30, flexDirection:'row', justifyContent: 'center'}}>
                <GradientButton
                  label={translang.t('PROFILE_edit')}
                  containerStyle={{ width: 255, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
                  buttonStyle={{ borderRadius: 38, height: 75 }}
                  colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                  isVerticalGradient={false}
                  _onPress={() => {this.setState({isEdit: true})}} 
                   />
              </View>
            </View>}

            {this.state.isEdit &&<View>
            <InfoTextInputItem
              icon_mark={Images.ic_hat_blue}
              label={translang.t('PROFILE_school')}
              value_txt={user.SchoolName ?? '-'}
              imageSize={36}/>
            
            <InfoTextInputItem
              icon_mark={Images.ic_hat_blue}
              label={translang.t('PROFILE_firstname')}
              value_txt={user.sName ?? '-'}
              imageSize={36}/>

            <InfoTextInputItem
              icon_mark={Images.ic_chair_blue}
              label={translang.t('PROFILE_lastname')}
              value_txt={user.sLastname ?? '-'}
              imageSize={36}
            />
            <InfoTextInputItem
              icon_mark={Images.ic_card_blue}
              label={translang.t('PROFILE_class')}
              value_txt={user.StudentClass ?? '-'}
              imageSize={36}
            />
            <InfoTextInputItem
              icon_mark={Images.ic_card_blue}
              label={translang.t('PROFILE_studentid')}
              value_txt={user.StudentId ?? '-'}
              imageSize={36}
            />
            <InfoTextInputItem
              icon_mark={Images.ic_card_blue}
              label={translang.t('PROFILE_idcode')}
              value_txt={user.sIdentification ?? '-'}
              imageSize={36}
            />
            <InfoTextInputItem
              icon_mark={Images.ic_sex_blue}
              label={translang.t('PROFILE_gender')}
              value_txt={sex == 0 ? translang.t('Male') : translang.t('Female')}
              imageSize={36}
            />
            <InfoTextInputItem
              icon_mark={Images.ic_calendar_blue}
              label={translang.t('PROFILE_birthday')}
              value_txt={birthday}
              imageSize={36}
            />
            <InfoTextInputItem
              icon_mark={Images.ic_call_blue}
              label={translang.t('PROFILE_phonenumber')}
              value_txt={user.sPhone ?? '-'}
              imageSize={36}
            />
            <InfoTextInputItem
              icon_mark={Images.ic_envelope_new}
              label={translang.t('PROFILE_email')}
              value_txt={user.sEmail ?? '-'}
              imageSize={36}
            />
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

  schoolNameStyle: {
    flexDirection: 'row',
    marginLeft: 5,
    marginTop: 5,
  },

  schoolLogo: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  schoolName: {
    fontFamily: 'THSarabunNew',
    textAlign: 'center',
    fontSize: 13,
    color: Color.black,
    marginLeft: 5,
    alignSelf: 'flex-end'
  },


  menuItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',

    marginVertical: 15,
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
    fontSize: 18, 
    color: Color.n_default_orange 
  },
  bottomText: {
    fontFamily: 'THSarabunNew',
    fontSize: 24, 
    color: Color.dark
  },
  headerImgContainer: {
    height: 180, 
    width: '100%', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: 239,
    height: 137,
    borderRadius: 15,
    backgroundColor: Color.white,
    padding: 5,
  },
});