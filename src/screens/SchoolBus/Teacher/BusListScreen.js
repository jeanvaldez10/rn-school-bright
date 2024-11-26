import { Text } from 'native-base';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Image,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import busIcon from '../../../assets/images/services/m_school_bus.png';
import BackNavigationBar from '../../../components/BackNavigationBar';
import GradientButton from '../../../components/GradientButton';
import ProgressHud from '../../../components/ProgressHud';
import ClassLevelModal from '../../../components/SelectListModal';
import Color from '../../../constants/color';
import ApiManager from '../../../managers/ApiManager';
import Storage from '../../../managers/StorageManager';
import translang from '../../../utils/language.utils';

const BusListScreen = ({ navigation }) => {
  const [showModal, setShowModal] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const [bustList, setBusList] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBus, setSelectedBus] = useState();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const back = useCallback(() => {
    navigation.pop();
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

  const initialize = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await Storage.getUser();
      const { ID: userId, SchoolId: schoolId } = user;
      const userInfo = await ApiManager.getUserInfo(userId, schoolId);
      setUserInfo(userInfo);
      loadBusList();
    } catch (error) {
      console.log('UserInfo error', error);
    }
  }, [loadBusList]);

  const loadBusList = useCallback(() => {
    setIsLoading(true);
    ApiManager.getBusList()
      .then((data) => {
        if (data.status === 1) {
          setBusList(data.lstData || []);
        } else {
          alert(data.message);
        }
      })
      .catch((error) => {
        console.log(error);
        alert('Failed to fetch bus list.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const onClickItem = async (item) => {
    if (loadingSchedule) {
      return;
    }
    setSelectedBus(item);

    setLoadingSchedule(true);
    ApiManager.getBusSchedule(item.nBusID)
      .then((data) => {
        if (data.status === 1) {
          setSchedules(data.lstData || []);
          setShowModal(true);
        } else {
          alert(data.message);
        }
      })
      .catch((error) => {
        console.log(error);
        alert('Failed to fetch schedules.');
      })
      .finally(() => {
        setLoadingSchedule(false);
      });
  };

  const onListSelect = (item) => {
    setShowModal(false);
    if (item === null) {
      return;
    }
    navigation.navigate('BusDetailScreen', {
      schedule: item,
      bus: selectedBus,
      userInfo,
    });
  };

  const renderItem = ({ item }) => {
    const { sLicensePlate, sBrandModel } = item;

    return (
      <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5}>
        <View style={styles.group1}>
          <Image source={busIcon} style={styles.image}></Image>
          <View style={styles.group2}>
            <Text style={styles.topText}>{sLicensePlate}</Text>
            <Text style={styles.topText}>{sBrandModel}</Text>
          </View>
        </View>

        <View style={styles.DividerLine} />
        <GradientButton
          containerStyle={styles.selectButton}
          buttonStyle={styles.buttonStyle}
          textStyle={styles.buttonTextStyle}
          label={translang.t('SELECT_ROUTE')}
          ContentComponent={
            loadingSchedule && selectedBus.nBusID === item.nBusID
              ? () => <ActivityIndicator color={Color.white} />
              : null
          }
          _onPress={() => onClickItem(item)}
        />
      </TouchableOpacity>
    );
  };

  const scheduleDataformatted = schedules.map((schedule) => ({
    ...schedule,
    title: `${schedule.isMorning ? 'Morning' : 'Evening'} : ${schedule.sTime}`,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
      <BackNavigationBar title={translang.t('schoolBus')} onMenuTap={back} />
      {bustList.length > 0 || isLoading ? (
        <FlatList
          contentContainerStyle={styles.contentContainerStyle}
          data={bustList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          ListHeaderComponent={
            <Text style={styles.pageTitle}>{translang.t('LIST_OF_VEHICLES')}</Text>
          }
        />
      ) : (
        <View style={styles.noSupportWrapper}>
          <Text style={styles.noSupportText}>{translang.t('NOT_FOUND_DATA')}</Text>
        </View>
      )}
      <ClassLevelModal
        isVisible={showModal}
        onListSelect={onListSelect}
        listData={scheduleDataformatted}
        dialogTtitle={translang.t('SELECT_ROUTE')}
      />
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
    fontSize: 24,
    fontWeight: 'normal',
    color: Color.n_default_orange,
    alignSelf: 'center',
  },
  menuEachStyle: {
    borderRadius: 15,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
    marginBottom: 20,
    padding: 15,
  },
  group1: {
    flexDirection: 'row',
  },
  group2: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  image: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  topText: {
    fontSize: 14,
    color: Color.n_default_gray,
    textAlign: 'left',
    marginRight: 10,
  },
  selectButton: {
    width: '50%',
    alignSelf: 'center',
    marginTop: 20,
  },
  buttonStyle: { height: 40, flexGrow: 0 },
  buttonTextStyle: { fontSize: 22 },
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
  DividerLine: {
    height: 1,
    backgroundColor: '#E2E2E2',
    width: '100%',
    marginTop: 20,
  },
});

export default BusListScreen;
