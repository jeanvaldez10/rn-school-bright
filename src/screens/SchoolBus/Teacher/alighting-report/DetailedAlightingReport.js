import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import BackNavigationBar from '../../../../components/BackNavigationBar';
import ProgressHud from '../../../../components/ProgressHud';
import Color from '../../../../constants/color';
import ApiManager from '../../../../managers/ApiManager';
import translang from '../../../../utils/language.utils';
import ReportItem1 from './RepoertItem1';

const DetailedAlightingReport = ({ navigation }) => {
  const busID = navigation.getParam('busID');
  const isEvening = navigation.getParam('isEvening');
  const date = '2567-11-18'; //navigation.getParam('date');

  console.log(busID, isEvening, date);

  const [reportList, setReportList] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const back = useCallback(() => {
    navigation.navigate('PassengerAlightingReport');
  }, [navigation]);

  const handleBackButton = useCallback(() => {
    back();
    return true;
  }, [back]);

  useEffect(() => {
    const backhandler = BackHandler.addEventListener('hardwareBackPress', handleBackButton);

    return () => {
      backhandler.remove();
    };
  }, [handleBackButton, navigation]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const initialize = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await ApiManager.getPassengerBoardingAlightingReportDetails(
        date,
        busID,
        isEvening,
      );
      setReportList(data.lstData);
    } catch (error) {
      console.log(error);
      alert(error.message || 'Failed to fetch data.');
    } finally {
      setIsLoading(false);
    }
  }, [busID, date, isEvening]);

  const renderItem = ({ item }) => {
    return <ReportItem1 item={item} />;
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
      <BackNavigationBar title={translang.t('BUS_ALIGHTING_REPORT')} onMenuTap={back} />
      {reportList.length > 0 || isLoading ? (
        <FlatList
          contentContainerStyle={styles.contentContainerStyle}
          data={reportList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          ListHeaderComponent={
            <Text style={styles.pageTitle}>{translang.t('DATE_NUMBER')}{moment(date).format('DD MMMM YYYY')}</Text>
          }
        />
      ) : (
        <View style={styles.noSupportWrapper}>
          <Text style={styles.noSupportText}>{translang.t('NOT_FOUND_DATA')}</Text>
        </View>
      )}

      <ProgressHud isVisible={isLoading} />
    </SafeAreaView>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
  },
  subContainer: {
    flex: 1,
  },
  contentContainerStyle: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 60,
  },
  pageTitle: {
    marginBottom: 16,
    fontSize: 26,
    fontWeight: 'normal',
    color: Color.n_default_orange,
    alignSelf: 'center',
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

export default DetailedAlightingReport;
