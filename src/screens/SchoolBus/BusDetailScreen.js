import React, { useCallback, useEffect, useState } from 'react';
import {
  BackHandler,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import busIcon from '../../assets/images/services/m_school_bus.png';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import BackNavigationBar from '../../components/BackNavigationBar';
import CustomRadioButtonItem from '../../components/CustomRadioButtonItem';
import NextButton from '../../components/NextButton';
import ProgressHud from '../../components/ProgressHud';
import Color from '../../constants/color';
import ApiManager from '../../managers/ApiManager';
import Images from '../../themes/Images';
import translang from '../../utils/language.utils';

const BusDetailScreen = ({ navigation }) => {
  const [userInfo] = useState(navigation.getParam('userInfo'));
  const [shopList, setShopList] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalBody, setModalBody] = useState();

  useEffect(() => {
    loadData(userInfo);
  }, [loadData, userInfo]);

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

  const renderItem = ({ item, index }) => {
    const { firstName = 'ตรีมนต์', lastName = 'รันการ' } = item;

    return (
      <View style={styles.listItem}>
        <Text style={styles.itemText}>{index + 1}.</Text>
        <Image source={busIcon} style={styles.itemAvatar} />
        <View style={styles.studentTextWrapper}>
          <Text style={styles.itemText} numberOfLines={1}>
            {firstName}
          </Text>
          <Text style={styles.itemText} numberOfLines={1}>
            {lastName}
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <Pressable style={[styles.buttons, { backgroundColor: Color.n_password_grey }]}>
            <Text style={styles.buttonText}>{translang.t('UNDEFINED')}</Text>
          </Pressable>
          <Pressable style={[styles.buttons, { backgroundColor: Color.n_password_grey }]}>
            <Text style={styles.buttonText}>{translang.t('UNDEFINED')}</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const onPressJourney = () => {
    setShowModal(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
      <BackNavigationBar
        title={translang.t('schoolBus')}
        onMenuTap={back}
        is_journey={true}
        onPressJourney={onPressJourney}
      />
      <View style={styles.subContainer}>
        <View style={styles.statusContainer}>
          <View style={styles.radioContainer}>
            <CustomRadioButtonItem
              radioSize={16}
              isSelected={true}
              selectedColor={Color.green_color_bg}
            />
            <Text style={styles.radioLabel}>{translang.t('NOT_DEPARTRED')}</Text>
          </View>
          <View style={styles.radioContainer}>
            <CustomRadioButtonItem
              radioSize={16}
              isSelected={false}
              selectedColor={Color.green_color_bg}
            />
            <Text style={styles.radioLabel}>{translang.t('DEPARTED')}</Text>
          </View>
          <View style={styles.radioContainer}>
            <CustomRadioButtonItem
              radioSize={16}
              isSelected={false}
              selectedColor={Color.green_color_bg}
            />
            <Text style={styles.radioLabel}>{translang.t('ARRIVED')}</Text>
          </View>
        </View>
        <FlatList
          data={shopList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.flatlist}
        />
        <NextButton
          label={translang.t('COMMON_next')}
          containerStyle={styles.nextButtonContainer}
          buttonStyle={styles.nextButton}
          colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
          isVerticalGradient={true}
          // _onPress={() => this.__next()}
        />
      </View>
      <ProgressHud isVisible={isLoading} />
      <AlertWithImageModal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        image={Images.n_ic_warning}
        message={translang.t('TURN_ON_GPS')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
  },
  subContainer: {
    flex: 1,
    paddingTop: 16,
  },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    backgroundColor: Color.n_background_white,
    borderRadius: 15,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  radioContainer: {
    alignItems: 'center',
  },
  radioLabel: {
    fontSize: 20,
    color: Color.n_default_gray,
    marginTop: 4,
  },
  flatlist: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  nextButton: { height: 75, borderRadius: 38 },
  nextButtonContainer: {
    width: '90%',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginVertical: 15,
  },

  itemAvatar: {
    borderRadius: 30,
    height: 46,
    marginHorizontal: 8,
    width: 46,
  },
  itemText: {
    color: Color.n_default_gray,
    fontSize: 24,
  },
  listItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Color.white,
    borderRadius: 15,
    elevation: 2,
    flexDirection: 'row',
    marginVertical: 5,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  studentTextWrapper: {
    flex: 1,
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-evenly',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  buttons: {
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    borderRadius: 25,
    height: 40,
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

export default BusDetailScreen;
