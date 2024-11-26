import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, FlatList, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import BackNavigationBar from '../../../../components/BackNavigationBar';
import ProgressHud from '../../../../components/ProgressHud';
import ClassLevelModal from '../../../../components/SelectListModal';
import Color from '../../../../constants/color';
import ApiManager from '../../../../managers/ApiManager';
import Storage from '../../../../managers/StorageManager';
import images from '../../../../themes/Images';
import translang from '../../../../utils/language.utils';

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

const DetailedAlightingReport = ({ navigation }) => {
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState(routes);

  const [shopList, setShopList] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBus, setSelectedBus] = useState();

  useEffect(() => {
    loadData(userInfo);
  }, [loadData, userInfo]);

  useEffect(() => {
    loadUserInfo();
  }, [loadUserInfo]);

  const back = useCallback(() => {
    navigation.navigate('UserInfo');
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


  const onListSelect = (item) => {
    setShowModal(false);
    navigation.navigate('BusDetailScreen', {
      route: item?.id,
      bus: selectedBus.id,
      userInfo,
    });
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
      <BackNavigationBar title={translang.t('BUS_ALIGHTING_REPORT')} onMenuTap={back} />
      {shopList.length > 0 || isLoading ? (
        <FlatList
          contentContainerStyle={styles.contentContainerStyle}
          data={shopList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          ListHeaderComponent={
            <Text style={styles.pageTitle}>รอบเช้า วันที่ 2 กันยายน 2567</Text>
          }
        />
      ) : (
        <View style={styles.noSupportWrapper}>
          <Text style={styles.noSupportText}>{translang.t('NOT_SUPPORT_STRING')}</Text>
        </View>
      )}
      <ClassLevelModal
        isVisible={showModal}
        onListSelect={onListSelect}
        listData={items}
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
