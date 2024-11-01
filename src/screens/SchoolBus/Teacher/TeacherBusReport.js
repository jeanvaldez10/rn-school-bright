import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, FlatList, Image, Pressable, TouchableOpacity, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import BackNavigationBar from '../../../components/BackNavigationBar';
import {
  default as EndCalendarModal,
  default as StartCalendarModal,
} from '../../../components/CalendarModal';
import ProgressHud from '../../../components/ProgressHud';
import Color from '../../../constants/color';
import ApiManager from '../../../managers/ApiManager';
import Storage from '../../../managers/StorageManager';
import translang, { getCurrentLocale } from '../../../utils/language.utils';
import images from '../../../themes/Images';

const getStatusText = (status) => {
  switch (status) {
    case '0':
      return translang.t('LEAVE_pending');
    case '1':
      return translang.t('LEAVE_approved');
    case '2':
      return translang.t('LEAVE_rejected');
    case '3':
      return translang.t('DELETED');
    case '4':
      return translang.t('CANCELED');
    case '5':
      return translang.t('REQUEST_CANCELED');
    default:
      return '';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case '0':
      return Color.n_default_brown;
    case '1':
      return Color.n_button_gradient_green_end;
    case '2':
      return Color.n_default_orange;
    case '3':
    case '4':
      return Color.n_scorpion;
    default:
      return '#4072b1';
  }
};

const TeacherBusReport = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState({});
  const [reportList, setReportList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(moment());
  const [endDate, setEndDate] = useState(moment());
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [type, setType] = useState('');

  let title = '';
  title = translang.t('PASSENGER_REPORT');

  let mindate = moment().subtract(6, 'M');
  mindate = moment(mindate).startOf('month');

  const handleBackButton = useCallback(() => {
    if (showStartCalendar || showEndCalendar) {
      setShowStartCalendar(false);
      setShowEndCalendar(false);
      return true;
    }
    navigation.goBack();
    return true;
  }, [showStartCalendar, showEndCalendar, navigation]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => backHandler.remove();
  }, [handleBackButton, navigation]);

  useEffect(() => {
    loadData(userInfo);
  }, [loadData, userInfo]);

  useEffect(() => {
    const fetchData = async () => {
      const userInfo = await Storage.getUserInfo();
      const type = navigation.getParam('type');
      setUserInfo(userInfo);
      setType(type);
    };

    fetchData();
  }, [handleBackButton, loadData, navigation]);

  const loadData = useCallback(async () => {
    if (!userInfo.ID) {
      return;
    }
    setIsLoading(true);
    try {
      const list = await ApiManager.getLeaveReportListWithDate(userInfo.ID, startDate, endDate);
      setReportList(list);
    } catch (error) {
      alert('Error', 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [endDate, startDate, userInfo.ID]);

  const onStartDateSelected = (date) => {
    if (date == null) {
      setShowStartCalendar(false);
    } else {
      setShowStartCalendar(false);
      setStartDate(date);
    }
  };

  const onEndDateSelected = (date) => {
    if (date == null) {
      setShowEndCalendar(false);
    } else {
      setShowEndCalendar(false);
      setEndDate(date);
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <View style={styles.group1}>
          <Image source={images.man_user} style={styles.itemAvatar} />
          <Text style={styles.text1}>เด็กหญิงหนึ่ง สคูลไบร์ท</Text>
        </View>
        <View style={styles.group2}>
          <Text style={styles.text2}>รอบเช้า</Text>
          <Text style={styles.text3}>วันที่ 2 กันยายน 2567</Text>
        </View>
        <View style={styles.group2}>
          <Text style={styles.text2}>ขึ้นรถ : 6.30 น. </Text>

          <Pressable style={[styles.buttons, { backgroundColor: Color.green_button_color }]}>
            <Text style={styles.buttonText}>{translang.t('BUS_CHECK_IN_STATUS_CHECKED_IN')}</Text>
          </Pressable>
        </View>
        <View style={styles.group2}>
          <Text style={styles.text2}>ขึ้นรถ : 15.00 น. </Text>

          <Pressable style={[styles.buttons, { backgroundColor: Color.green_button_color }]}>
            <Text style={styles.buttonText}>{translang.t('BUS_CHECK_IN_STATUS_CHECKED_IN')}</Text>
          </Pressable>
        </View>
        <View style={styles.group2}>
          <Text style={styles.text2}>ลงรถ : 16.10 น. </Text>

          <Pressable style={[styles.buttons, { backgroundColor: Color.green_button_color }]}>
            <Text style={styles.buttonText}>{translang.t('BUS_CHECK_IN_STATUS_CHECKED_IN')}</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
      <BackNavigationBar title={translang.t('PASSENGER_REPORT')} onMenuTap={handleBackButton} />

      <View style={styles.container}>
        <View style={styles.topRangeContainer}>
          <View style={{ flexDirection: 'row' }}>
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                color: Color.n_default_orange,
                fontFamily: 'THSarabunNew',
                fontSize: 15,
                fontWeight: 'bold',
              }}
            >
              {translang.t('SEARCH_STARTDATE')}
            </Text>
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                color: Color.n_default_orange,
                fontFamily: 'THSarabunNew',
                fontSize: 15,
                fontWeight: 'bold',
              }}
            >
              {translang.t('SEARCH_ENDDATE')}
            </Text>
          </View>
          <View style={styles.rangeContainer}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => {
                setShowStartCalendar(true);
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  color: Color.white,
                  fontFamily: 'THSarabunNew',
                  fontSize: 18,
                  fontWeight: 'bold',
                }}
              >
                {moment(startDate).format('DD MMMM YYYY')}
              </Text>
            </TouchableOpacity>
            <View style={{ height: '80%', width: 1, backgroundColor: Color.white }} />
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => {
                setShowEndCalendar(true);
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  color: Color.white,
                  fontFamily: 'THSarabunNew',
                  fontSize: 18,
                  fontWeight: 'bold',
                }}
              >
                {moment(endDate).format('DD MMMM YYYY')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          style={{ flex: 1, marginHorizontal: 10, marginVertical: 5 }}
          data={reportList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
        />
      </View>

      <StartCalendarModal
        isVisible={showStartCalendar}
        type={'single'}
        // maxDate={moment()}
        minDate={mindate}
        onDateSelect={(result) => onStartDateSelected(result)}
      />
      <EndCalendarModal
        isVisible={showEndCalendar}
        type={'single'}
        // maxDate={moment()}
        minDate={mindate}
        onDateSelect={(result) => onEndDateSelected(result)}
      />

      <ProgressHud isVisible={isLoading} />
    </SafeAreaView>
  );
};

export default TeacherBusReport;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_backgroud_gray_light,
  },
  itemContainer: {
    flexDirection: 'column',
    borderRadius: 15,
    backgroundColor: Color.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    marginHorizontal: 5,
    marginVertical: 8,
    padding: 12,
  },
  bottomTxt: {
    color: Color.n_default_orange,
    textAlign: 'center',
    fontSize: 26,
    fontFamily: 'THSarabunNew',
    fontWeight: 'bold',
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

  topRangeContainer: {
    paddingVertical: 10,
    marginBottom: 5,
  },

  rangeContainer: {
    height: 40,
    borderRadius: 15,
    backgroundColor: Color.n_default_brown,
    shadowColor: Color.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  group1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  itemAvatar: {
    width: 24,
    height: 24,
    borderRadius: 30,
    marginRight: 8,
  },
  text1: {
    flex: 1,
    color: Color.n_default_gray_dark,
    fontSize: 20,
    fontFamily: 'THSarabunNew',

  },
  group2: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text2: {
    color: Color.n_default_gray_dark,
    fontSize: 20,
  },
  text3: {
    flex: 1,
    textAlign: 'right',
    color: Color.n_default_gray_dark,
    fontSize: 20,
  },
  buttons: {
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    marginLeft: 8,
    shadowColor: '#1C191966',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 6,
    shadowOpacity: 1,
    elevation: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0,
    color: Color.white,
  },
});
