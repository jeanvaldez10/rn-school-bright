import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, FlatList, Text, TouchableOpacity, View } from 'react-native';
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
import translang from '../../../utils/language.utils';
import ReportItem from './ReportItem';

const StudentPickupDropOffReport = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState({});
  const [reportList, setReportList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(moment());
  const [endDate, setEndDate] = useState(moment());
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  let mindate = moment().subtract(6, 'M');
  mindate = moment(mindate).startOf('month');

  const handleBackButton = useCallback(() => {
    if (showStartCalendar || showEndCalendar) {
      setShowStartCalendar(false);
      setShowEndCalendar(false);
      return true;
    }
    navigation.navigate('Report');
    return true;
  }, [showStartCalendar, showEndCalendar, navigation]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => backHandler.remove();
  }, [handleBackButton, navigation]);

  const initialize = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await Storage.getUser();
      const { ID: userId, SchoolId: schoolId } = user;
      const userInfo = await ApiManager.getUserInfo(userId, schoolId);
      setUserInfo(userInfo);
      console.log(endDate);
      const data = await ApiManager.getStudentPickUpDropOffReport(startDate, '2567-11-25');
      setReportList(data.lstData || []);
    } catch (error) {
      console.log(error);
      alert(error.message || 'Failed to fetch data.');
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const onStartDateSelected = (date) => {
    if (date == null) {
      setShowStartCalendar(false);
    } else {
      setShowStartCalendar(false);
      setStartDate(moment(date));
    }
  };

  const onEndDateSelected = (date) => {
    if (date == null) {
      setShowEndCalendar(false);
    } else {
      setShowEndCalendar(false);
      setEndDate(moment(date));
    }
  };

  const renderItem = ({ item }) => <ReportItem item={item} />;

  return (
    <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
      <BackNavigationBar title={translang.t('BUS_DROP_PICKUP')} onMenuTap={handleBackButton} />

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

        {reportList.length > 0 || isLoading ? (
          <FlatList
            style={{ flex: 1, marginHorizontal: 10, marginVertical: 5 }}
            data={reportList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
          />
        ) : (
          <View style={styles.noSupportWrapper}>
            <Text style={styles.noSupportText}>{translang.t('NOT_FOUND_DATA')}</Text>
          </View>
        )}
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

export default StudentPickupDropOffReport;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_backgroud_gray_light,
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

  noSupportWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noSupportText: {
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    color: Color.n_default_gray,
    padding: 20,
    textAlign: 'center',
  },
});
