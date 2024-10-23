import React from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Color from '../../constants/color';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import Images from '../../themes/Images';
import ProgressHud from '../../components/ProgressHud';
import translang from '../../utils/language.utils';
import { Calendar, CalendarList } from 'react-native-calendars';
import moment from 'moment';
import { AttendanceStatusMap } from '../../constants/constants';

export default class ReportCalendarTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      startDate: '',
      endDate: '',
      selectedDate: null,
    };
  }
  
  async componentDidMount() {

  }

  componentWillUnmount = () => {

  };

  getStatusColor = (status) => {
    if (status == 0) {
      return Color.n_jungle_green;
    } else if (status == 1) {
      return Color.n_science_blue;
    } else if (status == 3) {
      return Color.n_default_brown;
    } else if (status == 7) {
      return Color.n_seance;
    } else if (status == 8 || status == 99){
      return Color.n_purple;
    } else if (status == 9) {
      return Color.light_gray;
    } else if (status == 10) {
      return Color.n_default_orange_light;
    } else if (status == 11) {
      return Color.n_default_brown;
    } else if (status == 12) {
      return Color.n_default_blue_dark;
    }
  }

  selectDate = (date) => {
    const _selDate = moment(date).format('DD MMMM YYYY');
    this.setState({ selected: _selDate, selectedDate: date });
  };

  render() {
    const startDate = this.props.startDate;
    const endDate = this.props.endDate;

    if (this.state.startDate !== startDate || this.state.endDate !== endDate) {
      this.setState({startDate, endDate});
    }

    const reportList = this.props.reportList;
    const monthDiff = moment(endDate).diff(moment(startDate), 'months');

    let markedDates = {};
    reportList.forEach(item => {
      const status = item.StatusIN;
      const color = this.getStatusColor(status);
      const day = moment(item.dScan).format('DD MMMM YYYY');
      const statusOut = item.StatusOut;
      markedDates[day] = { selected: true, selectedColor: color, textColor: 'white' };
    });
    return (
      <ScrollView style={styles.container}>
        <Calendar
          style={styles.calendar}
          onDayPress={(day) => {
            const date = moment(day.timestamp);
            this.selectDate(date);
          }}
          onMonthChange={(month) => {
            // const date = moment(month.timestamp);
            // this.loadData(date);
          }}
          monthFormat={'MMMM yyyy'}
          markedDates={markedDates}
          theme={{
            textDayFontSize: 13,
            dayTextColor: Color.n_default_gray,
            // todayBackgroundColor: _todayColor,
            todayTextColor: 'white',
            textSectionTitleColor: Color.n_default_gray,
            arrowColor: Color.n_default_gray,

            'stylesheet.calendar.header': {
              monthText: {
                fontSize: 24,
                fontWeight: 'bold',
                color: Color.n_default_gray,
              },
              week: {
                marginTop: 35,
                marginHorizontal: 12,
                flexDirection: 'row',
                justifyContent: 'space-between'
              },
            },

            'stylesheet.day.period': {
              today: {
                fontFamily: 'THSarabunNew',
                backgroundColor: Color.n_default_green_dark,
                borderRadius: 16,
              }
            },
            'stylesheet.day.basic': {
              today: {
                fontFamily: 'THSarabunNew',
                backgroundColor: Color.n_default_green_dark,
                borderRadius: 16,
              }
            },
          }}
        />

        <View style={ styles.menuContainer}>
          <Text style={styles.labelSelectDate}>{this.state.selected}</Text>
        </View>

        <View style={ styles.itemContainer}>
          <View style={styles.itemInfoContainer}>
            <Text style={styles.userInfoTitle}>{"13 July 2021"}</Text>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.userInfoTitle}>{translang.t('TIME_IN')}</Text>
              <Text style={styles.userInfoContent}>{': 9.30'}</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.userInfoTitle}>{translang.t('TIME_OUT')}</Text>
              <Text style={styles.userInfoContent}>{': 17.00'}</Text>
            </View>
          </View>
          <View style={styles.itemStatusContainer}>
            <Text style={styles.labelStatus}>{"Late"}</Text>
          </View>
        </View>
        
        <ProgressHud isVisible={this.state.isLoading} />
      </ScrollView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    //backgroundColor: 'white',
    margin: 10,
    borderRadius: 5,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowColor: 'black',
    shadowRadius: 3,
    shadowOpacity: 0.4
  },




  calendar: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 20,
    paddingTop: 10,
    paddingBottom: 20,
    shadowColor: 'black', 
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    elevation: 3,
  },

  menuContainer: {
    height: 60,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: Color.n_default_brown,
    shadowColor: 'black', 
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2.0,
  },

  labelSelectDate:{
    fontFamily: 'THSarabunNew',
    color: Color.white,
    fontSize: 25,
    fontWeight: 'bold',
    marginLeft: 50,
  },

  itemContainer:{
    flexDirection: 'row',
    alignItems: 'center',

    marginHorizontal: 15,
    marginTop: 20,
    height: 100,
    borderRadius: 15,

    backgroundColor: Color.white,
    shadowColor: 'black', 
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2.0,
  },

  
  itemInfoContainer:{
    flex: 1,
    paddingLeft: 15,
    paddingVertical: 10,
  },

  itemStatusContainer:{
    width: '30%', 
    height: '100%', 
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    backgroundColor: Color.n_default_brown,

    flexDirection:'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  labelStatus:{
    fontFamily: 'THSarabunNew',
    color: Color.white,
    fontSize: 24,
    fontWeight: 'bold',
  },

  userInfoTitle:{
    flex: 1,
    fontFamily: 'THSarabunNew',
    fontSize: 18,
    fontWeight: 'bold',
    color: Color.n_default_gray
  },

  userInfoContent:{
    flex: 1,
    fontFamily: 'THSarabunNew',
    fontSize: 18,
    color: Color.n_default_gray,
    marginLeft: 5,
  },
});