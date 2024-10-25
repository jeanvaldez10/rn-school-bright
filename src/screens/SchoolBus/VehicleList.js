import { Text } from 'native-base';
import React, { useCallback, useEffect, useState } from 'react';
import { AppState, BackHandler, FlatList, Image, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import { DrawerActions } from 'react-navigation-drawer';
import NumberFormat from 'react-number-format';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import BackNavigationBar from '../../components/BackNavigationBar';
import CustomTextSearch from '../../components/CustomTextSearch';
import ShopIconInfoItem from '../../components/IconInfoItem_OneLine';
import ProgressHud from '../../components/ProgressHud';
import Color from '../../constants/color';
import ApiManager from '../../managers/ApiManager';
import Storage from '../../managers/StorageManager';
import Images from '../../themes/Images';
import translang from '../../utils/language.utils';
import busIcon from '../../assets/images/services/m_school_bus.png';
import GradientButton from '../../components/GradientButton';

const ShopScreen = ({ navigation }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalBody, setModalBody] = useState('');
  const [shopList, setShopList] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  const handleBackButton = useCallback(() => {
    back();
    return true;
  }, [back]);

  useEffect(() => {
    loadData(userInfo);
  }, [loadData, userInfo]);

  useEffect(() => {
    const loadUserInfoAndData = async () => {
      const userInfo = await Storage.getUserInfo();
      setUserInfo(userInfo);
    };

    loadUserInfoAndData();
  }, [loadData]);

  useEffect(() => {
    const backhandler = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    AppState.addEventListener('change', handleAppStateChange);
    const willFocusSubscription = navigation.addListener('willFocus', async () => {
      const userInfo = await Storage.getUserInfo();
      setUserInfo(userInfo);
    });

    return () => {
      backhandler.remove();
      AppState.removeEventListener('change', handleAppStateChange);
      willFocusSubscription.remove();
    };
  }, [handleAppStateChange, handleBackButton, navigation]);

  const handleAppStateChange = useCallback(
    (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
        loadUserInfo();
      }
      setAppState(nextAppState);
    },
    [appState],
  );

  const loadUserInfo = async () => {
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
  };

  const loadData = useCallback((userInfo) => {
    setIsLoading(true);
    const { SchoolID } = userInfo;
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

  const back = useCallback(() => {
    navigation.navigate('UserInfo');
  }, [navigation]);

  const onClickItem = (item) => {
    const { shop_id: shopId } = item;
    navigation.navigate('ShopInput', {
      shopId,
      shop: item,
      userInfo,
      refresh: true,
    });
  };

  const renderItem = ({ item }) => {
    const { name, driver } = item;

    return (
      <TouchableOpacity
        style={styles.menuEachStyle}
        activeOpacity={0.5}
        onPress={() => onClickItem(item)}
      >
        <View style={styles.group1}>
          <Image source={busIcon} style={styles.image}></Image>
          <View style={styles.group2}>
            <Text style={styles.topText}>อบ 1212 กรุงเทพมหานคร</Text>
            <Text style={styles.topText}>Toyota Commuter</Text>
          </View>
        </View>

        <View style={styles.DividerLine} />
        <GradientButton
          containerStyle={styles.selectButton}
          buttonStyle={{ height: 40 }}
          textStyle={{ fontSize: 22 }}
          label={translang.t('SELECT_ROUTE')}
          _onPress={() => this.removeDevice(item)}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
      <BackNavigationBar title={translang.t('schoolBus')} onMenuTap={back} />
      <Text style={styles.pageTitle}>{translang.t('LIST_OF_VEHICLES')}</Text>
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

      <AlertWithImageModal
        isVisible={showModal}
        image={Images.n_ic_warning}
        message={modalBody}
        buttonColors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
        isVerticalGradient={false}
        onClose={() => setShowModal(false)}
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
    marginTop: 16,
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
    marginTop: 20,
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
  DividerLine: {
    height: 1,
    backgroundColor: '#E2E2E2',
    width: '100%',
    marginTop: 20,
  },
});

/* Rectangle 3385 */

export default ShopScreen;
