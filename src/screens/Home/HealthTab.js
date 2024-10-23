import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, Image } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Color from '../../constants/color';
import LinearGradient from 'react-native-linear-gradient';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import translang from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import DropDownPicker from 'react-native-dropdown-picker';
import moment from 'moment';
import CalendarModal from '../../components/CalendarModal';
import Images from '../../themes/Images';
import NextButton from '../../components/NextButton';

export default class HealthTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      userInfo: {},
      health: {},
      showCalendarModal: false,
    };
  }

  async componentDidMount() {
    const userInfo = await Storage.getUserInfo();
    this.setState({ userInfo: userInfo }, () => {
      this.loadData();
    });
  }

  componentWillUnmount = () => {

  };

  loadData = () => {
    this.setState({ isLoading: true });

    const userId = this.state.userInfo.ID;
    const schoolId = this.state.userInfo.SchoolID;

    ApiManager.getHealthProfile(userId, schoolId).then(health => {
      this.setState({ health: health, isLoading: false });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  }

  onDateSelected = (dates) => {
    this.setState({ showCalendarModal: false });
    if (dates === null) {
      return;
    }
  }

  renderInfoItem = (image, title, value) => {
    return (
      <View style={styles.infoItemContainer}>
        <View style={styles.infoImageView}>
          <Image source={image} style={styles.infoImage}/>
        </View>
        <Text style={styles.infoItemTitle}>{title} :</Text>
        <Text style={styles.infoItemText}>{value}</Text>
      </View>
    )
  };

  onSelectItem = (index) => {

  }

  render() {
    const { navigation } = this.props;
    const health = this.state.health;
    const gender = this.state.userInfo.cSex == '1' ? translang.t('Female') : translang.t('Male');
    const year = health.age ? `${health.age}` : translang.t('NOT_FOUND_DATA');
    const height = health.height ? `${health.height} cm` : translang.t('NOT_FOUND_DATA');
    const weight = health.weight ? `${health.weight} kg` : translang.t('NOT_FOUND_DATA');
    const bloodType = health.bloodType ? `${health.bloodType}` : translang.t('NOT_FOUND_DATA');
    const foodallergy = health.dangerFood ? `${health.dangerFood}` : translang.t('NOT_FOUND_DATA');
    const drugallergy = health.dangerDrug ? `${health.dangerDrug}` : translang.t('NOT_FOUND_DATA');
    const disease = health.disease ? `${health.disease}` : translang.t('NOT_FOUND_DATA');
    let healthLevel = translang.t('USERINFO_healthLevelOne');
    let healthLevelColor = [Color.salmon, Color.macaroni_and_cheese];

    const weightVal = health.weight ?? 0;
    const heightVal = (health.health ?? 0) / 100;
    let bmi = 0;

    if (heightVal > 0) {
      bmi = weight / (heightVal * heightVal);

      if (bmi < 18.5) {
        healthLevel = translang.t('USERINFO_healthLevelOne');
        healthLevelColor = [Color.salmon, Color.macaroni_and_cheese];
      } else if (bmi < 22.9) {
        healthLevel = translang.t('USERINFO_healthLevelTwo');
        healthLevelColor = [Color.jungle_green, Color.downy];
      } else if (bmi < 24.9) {
        healthLevel = translang.t('USERINFO_healthLevelThree');
        healthLevelColor = [Color.buddha_gold, Color.golden_rod];
      } else if (bmi < 29.9) {
        healthLevel = translang.t('USERINFO_healthLevelFour');
        healthLevelColor = [Color.salmon, Color.macaroni_and_cheese];
      } else if (bmi >= 30.0) {
        healthLevel = translang.t('USERINFO_healthLevelFive');
        healthLevelColor = [Color.red_orange, Color.bitter_sweet];
      } else {
        healthLevel = '\n' + translang.t('NOT_FOUND_DATA') + '\n';
        healthLevelColor = [Color.scorpion, Color.gray];
      }
    } else {
      healthLevel = '\n' + translang.t('NOT_FOUND_DATA') + '\n';
      healthLevelColor = [Color.scorpion, Color.gray];
    }

    const startOfWeek = moment().clone().startOf('week').add(1, 'day').format('DD MMM yyyy');
    const endOfWeek = moment().clone().endOf('week').add(1, 'day').format('DD MMM yyyy');
    const startOfMonth = moment().clone().startOf('month').format('DD MMM yyyy');
    const endOfMonth = moment().format('DD MMM yyyy');
    const startOfYear = moment().clone().startOf('year').format('DD MMM yyyy');
    const endOfYear = moment().format('DD MMM yyyy');

    const dropdownPickerItems = [
      { label: translang.t('USERINFO_weekly') + "\t\t\t" + startOfWeek + " - " + endOfWeek, value: translang.t('USERINFO_weekly'), start: startOfWeek, end: endOfWeek },
      { label: translang.t('USERINFO_monthly') + "\t\t" + startOfMonth + " - " + endOfMonth, value: translang.t('USERINFO_monthly'), start: startOfMonth, end: endOfMonth },
      { label: translang.t('USERINFO_yearly') + "\t\t\t" + startOfYear + " - " + endOfYear, value: translang.t('USERINFO_yearly'), start: startOfYear, end: endOfYear },
      { label: translang.t('USERINFO_selectdate'), value: translang.t('USERINFO_selectdate') }
    ];


    return (
      <ScrollView style={{flex: 1}}>
        <View style={styles.headerStatusStyle}>
          <View style={{width: 'auto', flexDirection: 'column', alignItems: 'center'}}>
            <Text style={{textAlign: 'center',fontFamily: 'THSarabunNew',fontSize: 20,color: 'white'}}>{translang.t('BODY_MASS')}</Text>
            <Image source={Images.n_ic_heart_white} style={{width: 32, height: 32, resizeMode: 'contain'}}/>
          </View>
          <View style={{flexDirection: 'row', alignItems:'center'}}>
            <Text  style={{textAlign: 'center',fontFamily: 'THSarabunNew',fontSize: 30, fontWeight: 'bold', color: 'white'}}>{translang.t('GOOD')}</Text>
          </View>
        </View>
        <Text style={styles.textPageTitle}> {translang.t('USERINFO_helthyreport')} </Text>

        
        
          {/* <LinearGradient
            style={styles.resultBack}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            colors={healthLevelColor}>
            <Text style={styles.resultBackText}>{healthLevel}</Text>
          </LinearGradient> */}
          <View style={styles.content}>
            {this.renderInfoItem(Images.n_ic_userinfo_gender,translang.t('USERINFO_sex'), gender)}
            {this.renderInfoItem(Images.n_ic_userinfo_age,translang.t('USERINFO_age'), year)}
            {this.renderInfoItem(Images.n_ic_userinfo_weight,translang.t('USERINFO_weight'), weight)}
            {this.renderInfoItem(Images.n_ic_userinfo_height,translang.t('USERINFO_height'), height)}
            {this.renderInfoItem(Images.n_ic_userinfo_blood,translang.t('USERINFO_bloodtype'), bloodType)}
            {this.renderInfoItem(Images.n_ic_userinfo_food,translang.t('USERINFO_foodAllergy'), foodallergy)}
            {this.renderInfoItem(Images.n_ic_userinfo_drug,translang.t('USERINFO_drugAllergy'), drugallergy)}
            {this.renderInfoItem(Images.n_ic_userinfo_disease,translang.t('USERINFO_congendisease'), disease)}

            <NextButton
              label={translang.t('USERINFO_checktemp')}
              containerStyle={styles.buttonStyle}
              buttonStyle={{ borderRadius: 40}}
              colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
              isVerticalGradient={false}
              _onPress={() => {navigation.navigate('CheckTemperature', {userInfo: this.state.userInfo});}} />
          </View>
          <ProgressHud isVisible={this.state.isLoading} />
        


        <CalendarModal 
          isVisible={this.state.showCalendarModal} 
          type={'period'}
          onDateSelect={ result => this.onDateSelected(result)}/>

      </ScrollView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    // flex: 1,
    height: '100%'
  },

  headerStatusStyle: {
    height: 80,
    backgroundColor: Color.n_science_blue,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  textPageTitle: {
    marginTop: 25,
    width: '100%',
    textAlign: 'center',
    color: Color.n_default_orange,
    fontWeight: 'bold',
    fontSize: 24
  },

  dropdownPickerContainer: {
    width: '92%',
    height: 45,
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  dropdownPicker: {
    backgroundColor: Color.white,
    shadowColor: 'black', 
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    elevation: 13,
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
    borderBottomLeftRadius: 23,
    borderBottomRightRadius: 23
  },
  dropDown: {
    backgroundColor: Color.white,
    shadowColor: 'black', 
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    elevation: 13,
    borderBottomLeftRadius: 23,
    borderBottomRightRadius: 23
  },
  dropdownPickerLabel: {
    fontSize: 23,
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray,
  },

  buttonStyle:{
    width: "100%",
    marginVertical:20,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  

  resultBack: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultBackText: {
    textAlign: 'center',
    fontFamily: 'THSarabunNew',
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    lineHeight: 30,
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    margin: 10,
    padding: 10,
  },
  infoItemContainer: {
    height: 60,
    marginVertical: 7,
    flexDirection: 'row',
    paddingHorizontal: 5,
    backgroundColor: 'white',
    alignItems: 'center'
  },

  infoImageView: {
    width: 40,
    height: 40,
    marginRight: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Color.n_default_orange,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.white,
    shadowColor: 'black', 
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    elevation: 5,
    
  },
  infoImage: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  infoItemTitle: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    color: Color.n_default_orange,
    flex: 1,
  },

  infoItemText: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    color: Color.n_default_gray,
    flex: 1,
  },
  checkTempContainer: {
    height: 60,
    backgroundColor: Color.green_button_next_color1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  checkTempText: {
    fontFamily: 'THSarabunNew',
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
  }
});