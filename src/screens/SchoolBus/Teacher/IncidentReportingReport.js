import { Text } from 'native-base';
import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, FlatList, Image, TouchableOpacity, View } from 'react-native';
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
import ReportPopup from './ReportPopup';
import images from '../../../themes/Images';

const routes = [
  {
    title: 'route 1',
  },
  {
    title: 'route 2',
  },
  {
    title: 'route 3',
  },
];

const IncidentReportingReport = ({ navigation }) => {
  const [shopList, setShopList] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    loadData(userInfo);
  }, [loadData, userInfo]);

  useEffect(() => {
    loadUserInfo();
  }, [loadUserInfo]);

  const back = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleBackButton = useCallback(() => {
    back();
    return true;
  }, [back]);

  useEffect(() => {
    const loadUserInfoAndData = async () => {
      const userInfo = await Storage.getUserInfo();
      setUserInfo(userInfo);
    };

    loadUserInfoAndData();
  }, [loadData]);

  useEffect(() => {
    const backhandler = BackHandler.addEventListener('hardwareBackPress', handleBackButton);

    return () => {
      backhandler.remove();
    };
  }, [handleBackButton, navigation]);

  const loadUserInfo = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await Storage.getUser();
      const { ID: userId, SchoolId: schoolId } = user;
      const userInfo = await ApiManager.getUserInfo(userId, schoolId);
      setUserInfo(userInfo);
      console.log('UserInfo updated');
    } catch (error) {
      console.log('UserInfo error', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadData = useCallback((userInfo) => {
    const { SchoolID } = userInfo || {};

    if (!SchoolID) {
      return;
    }
    setIsLoading(true);
    ApiManager.getShopList(SchoolID)
      .then((list) => {
        setShopList(list);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const renderItem = ({ item }) => {
    const { name, driver } = item;

    const onClickItem = () => {
      setShowReportModal(true);
    };

    return (
      <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={onClickItem}>
        <Image source={images.ic_school_bus_1} style={styles.image}></Image>
        <View style={styles.group2}>
          <View style={styles.group3}>
            <Text style={styles.text1}>6.00</Text>
            <Text style={styles.text1}>1/9/2567</Text>
          </View>
          <Text style={[styles.topText, { color: Color.n_default_orange }]}>
            {name || 'อบ 1212 กรุงเทพมหานคร'}
          </Text>
          <Text style={styles.topText}>{driver || 'Toyota Commuter'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
      <BackNavigationBar
        title={translang.t('DOT_MENU_INCIDENT_REPORTING_REPORT')}
        onMenuTap={back}
      />
      {shopList.length > 0 || isLoading ? (
        <FlatList
          contentContainerStyle={styles.contentContainerStyle}
          data={shopList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
        />
      ) : (
        <View style={styles.noSupportWrapper}>
          <Text style={styles.noSupportText}>{translang.t('NOT_SUPPORT_STRING')}</Text>
        </View>
      )}

      <ProgressHud isVisible={isLoading} />

      <ReportPopup
        isVisible={showReportModal}
        onClose={() => setShowReportModal(false)}
        navigation={navigation}
      />
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
    backgroundColor: Color.n_default_orange_light,
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

    flexDirection: 'row',
    alignItems: 'center'
  },
  group2: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  group3: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  text1: {
    fontSize: 14,
    color: Color.light_gray,
    textAlign: 'left',
    marginRight: 10,
    marginTop: 4,
  },
  image: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  topText: {
    fontSize: 14,
    color: Color.n_default_gray,
    textAlign: 'left',
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

export default IncidentReportingReport;
