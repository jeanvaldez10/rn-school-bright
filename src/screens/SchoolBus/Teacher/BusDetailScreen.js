import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import AlertWithImageModal from '../../../components/AlertWithImageModal';
import BackNavigationBar from '../../../components/BackNavigationBar';
import CustomRadioButtonItem from '../../../components/CustomRadioButtonItem';
import NextButton from '../../../components/NextButton';
import ProgressHud from '../../../components/ProgressHud';
import Color from '../../../constants/color';
import ApiManager from '../../../managers/ApiManager';
import Images from '../../../themes/Images';
import translang from '../../../utils/language.utils';
import StudentItem from './StudentItem';
import StudentPopup from './StudentPopup';
import StudentStatusModal from './StudentStatusModal';
import BusPopup from './BusPopups';

const BusDetailScreen = ({ navigation }) => {
  const [userInfo] = useState(navigation.getParam('userInfo'));
  const [students, setStudents] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alertContent, setAlertContent] = useState('');
  const [alertStatus, setAlertStatus] = useState(''); // success or warning

  const [showStudentStatusModal, setShowStudentStatusModal] = useState(false);

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState();
  const [reordering, setReordering] = useState(false);
  const [showBusModal, setShowBusModal] = useState(false);

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
        setStudents(
          list.map((item) => ({
            ...item,
            checkInStatus: 'unspecified',
            checkoutStatus: 'unspecified',
          })),
        );
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

  const onPressStudent = (student) => () => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const onPressCheckIn = (student) => () => {
    const firstUnchecked = students.find((student) => student.checkInStatus === 'unspecified');

    if (firstUnchecked && firstUnchecked.shop_id !== student.shop_id) {
      setAlertContent(translang.t('CHECK_STUDENT_QUEUE'));
      setShowModal(true);
    } else {
      setSelectedStudent(student);
      setShowStudentStatusModal(true);
    }
  };

  const onPressCheckout = (student) => () => {
    setSelectedStudent(student);
    setShowStudentStatusModal(true);
  };

  const renderItem = ({ item, index }) => {
    return (
      <StudentItem
        onPressStudent={onPressStudent}
        onPressCheckIn={onPressCheckIn}
        onPressCheckout={onPressCheckout}
        reordering={reordering}
        item={item}
        index={index}
      />
    );
  };

  const onPressJourney = () => {
    setAlertContent(translang.t('TURN_ON_GPS'));
    setShowModal(true);
  };

  const onChangeStudentStatus = () => {};

  const onPressNext = () => {
    setReordering(false);
  };

  const onHandleQueue = () => {
    setReordering(true);
  };

  const onVehicleDetail = () => {
    setShowBusModal(true);
  };

  const onGroupIncidentReport = () => {
    let params = {
      deliveryFormat: {},
      recipient: {},
      selectedIds: [],
      userInfo: {},
    };
    navigation.navigate('GroupIncidentReport', { params });
  };

  const onReportingReport = () => {
    navigation.navigate('IncidentReportingReport');
  };

  const moreActions = [
    translang.t('DOT_MENU_QUEUE_MANAGE'),
    translang.t('DOT_MENU_BUS_DETAILS'),
    translang.t('DOT_MENU_GROUP_ICIDENT_REPORT'),
    translang.t('DOT_MENU_INCIDENT_REPORTING_REPORT'),
  ];

  return (
    <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
      <BackNavigationBar
        title={translang.t('schoolBus')}
        onMenuTap={back}
        is_journey={true}
        onPressJourney={onPressJourney}
        is_more="1"
        actions={moreActions}
        onMoreTap={(value, index) => {
          if (index === 0) onHandleQueue();
          else if (index === 1) onVehicleDetail();
          else if (index === 2) onGroupIncidentReport();
          else if (index === 3) onReportingReport();
        }}
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
          data={students}
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
          _onPress={onPressNext}
        />
      </View>
      <ProgressHud isVisible={isLoading} />
      <AlertWithImageModal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        image={Images.n_ic_warning}
        message={alertContent}
      />
      <StudentPopup
        isVisible={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        navigation={navigation}
      />

      <BusPopup
        isVisible={showBusModal}
        onClose={() => setShowBusModal(false)}
        navigation={navigation}
      />

      <StudentStatusModal
        isVisible={showStudentStatusModal}
        onSelect={onChangeStudentStatus}
        onCan={() => setShowStudentStatusModal(false)}
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
});

export default BusDetailScreen;
