import React from 'react';
import {
  Image,
  View,
  TouchableOpacity,
  FlatList,
  BackHandler,
  Modal,
  ScrollView,
  Text,
} from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import dimension from '../../constants/dimension';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import CalendarModal from '../../components/CalendarModal';

import translang, { getCurrentLocale } from '../../utils/language.utils';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import ProgressHud from '../../components/ProgressHud';
import moment from 'moment';

export default class CheckTemperature extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showModal: false,
      showCalendarModal: false,
      dataSource: [],

      selectedDate: null,
      userInfo: null,
    };
  }

  handleBackButton = () => {
    console.log(this.state.showCalendarModal);
    if(this.state.showCalendarModal){
      this.setState({showCalendarModal: false});
    }else{
      this.back();
    }
    return true;
  };

  async componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", async () => { 
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const userInfo = navigation.getParam('userInfo');
      const seldate = moment().format('YYYY-MM-DD');
      this.setState({userInfo: userInfo, selectedDate: seldate}, ()=>{
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

  onCheckBoxPress = (folder) => {

  };
  loadData = () => {
    this.setState({ isLoading: true });

    const userId = this.state.userInfo.ID;
    const schoolId = this.state.userInfo.SchoolID;
    const date = this.state.selectedDate;

    // const userId = "701621";
    // const schoolId = "1079";
    // const date = "2022-07-12";

    ApiManager.getHealthTemperatureData(userId, schoolId, date).then(res => {
      console.log(res);
      this.setState({ dataSource: res, isLoading: false });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  }

  renderItem = (item, index) =>{
    return (
      <View style={styles.listItem}>
        <View style={{flex: 1, justifyContent: 'center', marginLeft: 15}}>
          <Text style={{...styles.textStyle, fontSize: 20, fontWeight: 'bold'}}>{item.LogTime}</Text>
          <Text style={{...styles.textStyle, fontSize: 25, fontWeight: 'bold'}}>{item.LogDate}</Text>
        </View>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'flex-end', marginRight: 15}}>
          <Text style={{...styles.textStyle, fontSize: 35, fontWeight: 'bold'}}>{item.Temperature}</Text>
        </View>
      </View>
    );
  };


  back = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }

    this.props.navigation.goBack();
  };

  onDateSelected = (date) => {
    if (date === null) {
      this.setState({showCalendarModal: false});
      return;
    }
    this.setState({ showCalendarModal: false, selectedDate: date }, ()=>{
      this.loadData();  
    });
  }

  render() {
    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_temperature')}
          onMenuTap={() => this.back()}
          is_calendar='1'
          onCalendarTap={() => {
            this.setState({ showCalendarModal: true,});
          }}
        />

        <View style={styles.container}>
          {this.state.dataSource.length > 0 && 
          <FlatList 
            style={{flex: 1}}
            data={this.state.dataSource}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => this.renderItem(item, index)}
          />
          }
          {this.state.dataSource.length <= 0 && 
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{...styles.textStyle, fontSize: 35, fontWeight: 'bold'}}>{translang.t('NO_DATA')}</Text>
            </View>
          }
        </View>

        <CalendarModal 
          isVisible={this.state.showCalendarModal} 
          type={'single'}
          onDateSelect={ result => this.onDateSelected(result)} />

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.checked}
          title=' '
          message={translang.t('COMMON_close')}
          buttonColors={[Color.green_button_next_color1]}
          onClose={() => { this.setState({ showModal: false }) }}
        />
        <ProgressHud isVisible={this.state.isLoading} />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    backgroundColor: Color.n_background_white,
    flex: 1,
  },

  listItem: {
    height: 100,
    flexDirection: 'row',
    backgroundColor: Color.n_default_brown_light,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
    marginVertical: 10,
    marginHorizontal: 20,
  },

  textStyle: {
    fontFamily: 'THSarabunNew',
    color: 'black',
  },
  
});
