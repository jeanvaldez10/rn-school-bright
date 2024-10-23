import React from 'react';
import { View, ScrollView, Text, FlatList, TouchableOpacity } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Color from '../../constants/color';
import LinearGradient from 'react-native-linear-gradient';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import translang from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import moment from 'moment';

export default class ReportListTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      userInfo: {},
      health: {},
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
      return Color.n_default_brown;
    } else if (status == 3) {
      return Color.n_default_orange;
    } else if (status == 5 || status == 6 || status == 7 || status == 8 || status == 9) {
      return Color.n_default_gray;
    } else if (status == 10) {
      return Color.seance;
    } else if (status == 11) {
      return Color.electric_violet;
    } else if (status == 12) {
      return Color.science_blue;
    } else if ((parseInt(status) >= 21) && (parseInt(status) >= 26)) {
      return Color.purple_heart;
    } else {
      return Color.n_default_gray;
    }
  }

  getStatusText = (status) => {
    if (status == 0) {
      return translang.t('ON_TIME');
    } else if (status == 1) {
      return translang.t('LATE');
    } else if (status == 3) {
      return translang.t('ABSENCE');
    } else if (status == 5 || status == 6 || status == 7 || status == 8 || status == 9) {
      return translang.t('HOLIDAY');
    } else if (status == 10) {
      return translang.t('PERSONAL_LEAVE');
    } else if (status == 11) {
      return translang.t('SICK_LEAVE');
    } else if (status == 12) {
      return translang.t('EVENT');
    } else if (parseInt(status) >= 21 && parseInt(status) >= 26) {
      return '-';
    } else if (status == 99) {
      return translang.t('UNCHECK');
    } else {
      return '-';
    }
  }

  // getStatusColor = (status) => {
  //   if (status == 0) {
  //     return Color.n_button_gradient_green_start
  //   } else if (status == 1) {
  //     return Color.n_default_brown
  //   } else if (status == 3) {
  //     return Color.n_default_orange
  //   } else if (status == 5 || status == 6 || status == 7 || status == 8 || status == 9) {
  //     return Color.n_default_orange
  //   } else if (status == 10) {
  //     return Color.n_default_orange
  //   } else if (status == 11) {
  //     return Color.n_default_orange
  //   } else if (status == 12) {
  //     return Color.n_default_orange
  //   } else if (parseInt(status) >= 21 && parseInt(status) >= 26) {
  //     return Color.n_default_orange
  //   } else if (status == 99) {
  //     return Color.n_default_orange
  //   } else {
  //     return Color.n_default_orange
  //   }
  // }

  renderItem = (item, index) => {
    const day = moment(item.dScan).format('DD MMMM YYYY');
    let timeIn = moment(item.TimeIn).format('HH:mm:ss');
    let timeOut = moment(item.TimeOut).format('HH:mm:ss');
    const statusIn = item.StatusIN;
    const statusOut = Math.abs(parseInt(item.StatusOut));

    if (timeIn === '00:00:00') {
      timeIn = '-';
    }
    if (timeOut === '00:00:00') {
      timeOut = '-';
    }

    return (
      <View style={ styles.itemContainer}>
        <Text style={{...styles.userInfoTitle, textAlign: 'right', flex: 0}}>{day}</Text>
        <View style={{flexDirection: 'row'}}>
          <Text style={styles.userInfoTitle}>{translang.t('TIME_IN')}</Text>
          <Text style={styles.userInfoContent}>{timeIn}</Text>
          <View style={{...styles.statusContainer, backgroundColor: this.getStatusColor(item.status)}}>
            <Text style={styles.statusText}>{this.getStatusText(statusIn)}</Text>
          </View>
        </View>
        <View style={{flexDirection: 'row', marginTop: 5}}>
          <Text style={styles.userInfoTitle}>{translang.t('TIME_OUT')}</Text>
          <Text style={styles.userInfoContent}>{timeOut}</Text>
          <View style={{...styles.statusContainer, backgroundColor: this.getStatusColor(item.status)}}>
            <Text style={{...styles.statusText}}>{this.getStatusText(statusOut)}</Text>
          </View>
          
        </View>            
      
      </View>
    )
  };

  render() {
    const reportList = this.props.reportList;

    return (
      <View style={styles.content}>
        <FlatList 
          style={{flex: 1}}
          data={reportList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => this.renderItem(item, index)}
        />
      </View>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  rowContainer: {

    backgroundColor: Color.white,
    borderRadius: 5,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowColor: 'black',
    shadowRadius: 3,
    shadowOpacity: 0.4,
    marginVertical: 5,
    marginHorizontal: 5,
    paddingHorizontal: 5,
    paddingBottom: 10,
  },
  infoItemContainer: {
    marginVertical: 5,
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItemText: {
    flex: 1,
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
  dateText: {
    color: '#000',
    fontSize: 25,
    fontFamily: 'THSarabunNew',
  },
  dateRow: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  attendanceItemMarkImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },

  statusContainer:{
    width: 60,
    height: 25,
    borderRadius: 13,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  statusText:{
    fontFamily: 'THSarabunNew',
    fontSize: 15,
    fontWeight: 'bold',
    marginHorizontal: 5,
    color: Color.white
  },
  itemContainer:{
    flexDirection: 'column',
    justifyContent: 'center',

    height: 100,
    borderRadius: 15,

    marginTop: 10,
    marginHorizontal: 15,
    
    paddingHorizontal: 15,
    paddingVertical: 5,

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

  userInfoTitle:{
    flex: 1,
    fontFamily: 'THSarabunNew',
    fontSize: 18,
    fontWeight: 'bold',
    color: Color.n_default_gray,
  },
  userInfoContent:{
    flex: 1,
    fontFamily: 'THSarabunNew',
    fontSize: 18,
    color: Color.n_default_gray,
    marginLeft: 5,
  },
});