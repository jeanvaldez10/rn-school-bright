import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, Dimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import { TabBar, TabView } from 'react-native-tab-view';
import BackNavigationBar from '../../../../components/BackNavigationBar';
import CalendarModal from '../../../../components/CalendarModal';
import ProgressHud from '../../../../components/ProgressHud';
import Color from '../../../../constants/color';
import Storage from '../../../../managers/StorageManager';

import moment from 'moment';
import ApiManager from '../../../../managers/ApiManager';
import translang from '../../../../utils/language.utils';
import PassengerAlightingReportTab from './PassengerAlightingReportTab';

const PassengerAlightingReport = ({ navigation }) => {
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [morningList, setMorningList] = useState([]);
  const [eveningList, setEveningList] = useState([]);
  const [morningTotalCount, setMoringTotalCount] = useState(0);
  const [eveningTotalCount, setEveningTotalCount] = useState(0);

  const [userInfo, setUserInfo] = useState({});

  const [isLoading, setIsLoading] = useState(false);

  const routes = [
    {
      key: 'morning',
      title: translang.t('BUS_MORNING_SESSION'),
    },
    {
      key: 'evening',
      title: translang.t('BUS_EVENING_SESSION'),
    },
  ];
  const back = useCallback(() => {
    navigation.navigate('ReportForTeacher');
  }, [navigation]);

  const handleBackButton = useCallback(() => {
    if (showCalendarModal) {
      setShowCalendarModal(false);
      return true;
    }
    back();
    return true;
  }, [showCalendarModal, back]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => backHandler.remove();
  }, [handleBackButton]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadData = useCallback(async () => {
    setIsLoading(true);

    try {
      const user = await Storage.getUser();
      const { ID: userId, SchoolId: schoolId } = user;
      const userInfo = await ApiManager.getUserInfo(userId, schoolId);
      setUserInfo(userInfo);
      // Change the date later
      const morningData = await ApiManager.getPassengerBoardingAlightingReports(
        '2567-11-18',
        false,
      );
      setMorningList(morningData.lstData);
      setMoringTotalCount(morningData.nTotalStudentsCnt);
      // Change the date later
      const eveningData = await ApiManager.getPassengerBoardingAlightingReports('2567-11-18', true);
      setEveningList(eveningData.lstData);
      setEveningTotalCount(eveningData.nTotalStudentsCnt);
      console.log(selectedDate);
    } catch (e) {
      alert(e.message || 'Failed to fetch data');
    }

    setIsLoading(false);
  }, [selectedDate]);

  const onDateSelected = (date) => {
    if (!date) {
      setShowCalendarModal(false);
    } else {
      setShowCalendarModal(false);
      setSelectedDate(moment(date));
    }
  };

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      style={{ ...styles.tabBar }}
      indicatorStyle={{ height: 50, backgroundColor: Color.n_default_brown, borderRadius: 20 }}
      inactiveColor={Color.n_default_orange}
      activeColor={Color.white}
      labelStyle={{
        fontWeight: 'bold',
        fontSize: 17,
        fontFamily: 'THSarabunNew',
        marginTop: 'auto',
        marginBottom: 'auto',
        textTransform: 'none',
      }}
    />
  );

  const renderMorningTab = () => (
    <PassengerAlightingReportTab
      navigation={navigation}
      reportList={morningList}
      date={selectedDate}
      total={morningTotalCount}
      isEvening={false}
      isSelected={selectedTabIndex === 0}
    />
  );

  const renderEveningTab = () => (
    <PassengerAlightingReportTab
      navigation={navigation}
      reportList={eveningList}
      date={selectedDate}
      total={eveningTotalCount}
      isEvening={true}
      isSelected={selectedTabIndex === 1}
    />
  );

  const initialLayout = { width: Dimensions.get('window').width };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
      <BackNavigationBar
        title={translang.t('BUS_ALIGHTING_REPORT')}
        onMenuTap={back}
        is_calendar="1"
        onCalendarTap={() => setShowCalendarModal(true)}
      />

      <View style={styles.container}>
        <TabView
          style={styles.tabView}
          navigationState={{ index: selectedTabIndex, routes }}
          renderTabBar={renderTabBar}
          renderScene={({ route }) => {
            switch (route.key) {
              case 'morning':
                return renderMorningTab();
              case 'evening':
                return renderEveningTab();
              default:
                return null;
            }
          }}
          onIndexChange={setSelectedTabIndex}
          initialLayout={initialLayout}
          swipeEnabled={false}
        />
      </View>

      <CalendarModal isVisible={showCalendarModal} type="single" onDateSelect={onDateSelected} />
      <ProgressHud isVisible={isLoading} />
    </SafeAreaView>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
  },
  tabBar: {
    width: '90%',
    height: 50,
    borderRadius: 20,
    marginVertical: 20,
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: Color.white,
    shadowColor: 'black',
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  tabView: {
    flex: 1,
  },
});

export default PassengerAlightingReport;
