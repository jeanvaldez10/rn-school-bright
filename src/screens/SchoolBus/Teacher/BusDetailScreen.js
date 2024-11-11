import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
import GradientButton from '../../../components/GradientButton';
import { TravelStatuses } from '../../../constants/constants';

const BusDetailScreen = ({ navigation }) => {
  //const [selectedBus] = useState(navigation.getParam('bus'));
  // const [userInfo] = useState(navigation.getParam('userInfo'));

  const [selectedSchedule] = useState(navigation.getParam('schedule'));

  const [students, setStudents] = useState([]); // nCheckInStatus: 0:None, 1:Checked In, 2:Checked In Late, -1:Not Board, -2:Personal Leave, "nCheckOutStatus": 0 0:None, 1:Checked Out, -1:Not Board, -2:Personal Leave, -3:Sick Leave
  const [infoTravel, setInfoTravel] = useState({}); // 0:Not Departed, 1:Departed, 100:Arrived, -1:Cancelled, -100:Inciden

  const [isLoading, setIsLoading] = useState(false);
  const [switchingTravelStatus, setSwitchingTravelStatus] = useState(false);

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertContent, setAlertContent] = useState('');
  const [alertStatus, setAlertStatus] = useState(''); // success or warning

  const [showStudentStatusModal, setShowStudentStatusModal] = useState(false);

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState();
  const [checkMode, setCheckMode] = useState('in');

  const [reordering, setReordering] = useState(false);
  const [showBusModal, setShowBusModal] = useState(false);

  const { nStatus: travelStatus, nTravelID } = infoTravel || {};
  const { nScheduleID } = selectedSchedule;

  useEffect(() => {
    loadScheduleDetails();
  }, [loadScheduleDetails]);

  const loadScheduleDetails = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await ApiManager.getBusScheduleDetail(nScheduleID);

      if (data.status === 1) {
        setStudents(data.lstStudents || []);
        setInfoTravel(data.infoTravel);
      } else {
        setShowAlertModal(true);
        setAlertStatus('warning');
        setAlertContent(data.message || 'Failed to fetch data.');
      }
    } catch (e) {
      console.log(e, 'Schedule Details Error');
      setShowAlertModal(true);
      setAlertStatus('warning');
      setAlertContent(e.message || 'Failed to fetch data.');
    }
    setIsLoading(false);
  }, [nScheduleID]);

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
    setSelectedStudent(student);
    setCheckMode('in');
    setShowStudentStatusModal(true);
  };

  const onPressCheckout = (student) => () => {
    setSelectedStudent(student);
    setCheckMode('out');
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

  const handleErrorSwitchingTravel = (message) => {
    setAlertContent(message);
    setShowAlertModal(true);
    setAlertStatus('warning');
  };

  const handleSuccessSwitchingtravel = async (newStatus) => {
    const data = await ApiManager.getBusScheduleDetail(nScheduleID);

    if (data.status === 1) {
      setStudents(data.lstStudents || []);
      setInfoTravel(data.infoTravel);
    }
    setAlertContent(
      newStatus === TravelStatuses.DEPARTED
        ? translang.t('BUS_SUCCESSFUL_DEPART')
        : newStatus === TravelStatuses.CANCELLED
          ? translang.t('BUS_SUCCESSFUL_CANCEL')
          : newStatus === TravelStatuses.ARRIVED
            ? translang.t('BUS_SUCCESSFUL_ARRIVE')
            : '',
    );
    setAlertStatus('success');

    setShowAlertModal(true);
  };

  console.log(nTravelID)

  const handleSwitchTravel = async (newStatus) => {
    try {
      setSwitchingTravelStatus(true);
      const updateFunc =
        newStatus === TravelStatuses.DEPARTED
          ? ApiManager.busStartTravel
          : newStatus === TravelStatuses.ARRIVED
            ? ApiManager.busCompleteTravel
            : newStatus === TravelStatuses.CANCELLED
              ? ApiManager.busCancelTravel
              : undefined;

      if (updateFunc) {
        const result = await updateFunc(nTravelID);
        if (result.success !== 1) {
          handleErrorSwitchingTravel(result.message);
        } else {
          await handleSuccessSwitchingtravel(newStatus);
        }
      }
    } catch (e) {
      console.log(e, 'Switch travel status error');
      handleErrorSwitchingTravel(e.message || 'Failed to update travel status.');
    }
    setSwitchingTravelStatus(false);
  };

  const onPressJourney = () => {
    if (switchingTravelStatus) {
      return;
    }
    handleSwitchTravel(
      travelStatus === TravelStatuses.NOT_DEPARTED
        ? TravelStatuses.DEPARTED
        : travelStatus === TravelStatuses.DEPARTED
          ? TravelStatuses.CANCELLED
          : travelStatus === TravelStatuses.CANCELLED ? TravelStatuses.DEPARTED : '',
    );
    // setAlertContent(translang.t('TURN_ON_GPS'));
    // setShowAlertModal(true);
  };

  const handleErrorCheckInOut = (message) => {
    let newStudentList = [...students];

    setAlertContent(message);
    setShowAlertModal(true);
    setAlertStatus('warning');
    setStudents(newStudentList);
  };

  const onChangeStudentStatus = async (newStatus) => {
    let newStudentList = [...students];
    const studentIndex = newStudentList.findIndex(
      (student) => student.sStudentID === selectedStudent.sStudentID,
    );
    newStudentList[studentIndex] = {
      ...newStudentList[studentIndex],
      [checkMode === 'in' ? 'nCheckInStatus' : 'nCheckOutStatus']: newStatus,
    };
    setStudents(newStudentList);

    const updateFunc =
      checkMode === 'in' ? ApiManager.busCheckInStudent : ApiManager.busCheckoutStudent;
    try {
      const result = await updateFunc(infoTravel.nTravelID, selectedStudent.sStudentID, newStatus);
      if (result.status !== 1) {
        handleErrorCheckInOut(result.message || 'Error updating student status.');
      }
    } catch (e) {
      handleErrorCheckInOut(e.message || 'Error updating student status.');
    }
  };

  const onPressNext = () => {};

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

  const onPassengerReport = () => {
    navigation.navigate('TeacherBusAlightingReport');
  };

  const RenderTravelButton = () => {
    if (
      !Object.values(TravelStatuses).includes(travelStatus) ||
      travelStatus === TravelStatuses.ARRIVED
    ) {
      return null;
    }
    return (
      <GradientButton
        containerStyle={styles.gradientButtonContainer}
        buttonStyle={styles.gradientButton}
        textStyle={styles.gradientButtonText}
        colors={[Color.green_button_color]}
        isVerticalGradient={true}
        label={
          travelStatus === TravelStatuses.NOT_DEPARTED
            ? translang.t('START_TRAVEL')
            : travelStatus === TravelStatuses.DEPARTED
              ? translang.t('CANCEL_TRAVEL')
              : travelStatus === TravelStatuses.CANCELLED
                ? translang.t('RESTART_TRAVEL')
                : travelStatus === TravelStatuses.ARRIVED
                  ? translang.t('ARRIVED_TRAVEL')
                  : ''
        }
        ContentComponent={
          switchingTravelStatus ? () => <ActivityIndicator color={Color.white} /> : null
        }
        _onPress={onPressJourney}
      />
    );
  };

  // can't be other utility files as it effects language switching.
  const TravelStatusMap = {
    0: {
      value: 0,
      title: translang.t('NOT_DEPARTRED'),
    },
    1: {
      value: 1,
      title: translang.t('DEPARTED'),
    },
    100: {
      value: 100,
      title: translang.t('ARRIVED'),
    },
  };

  const moreActions = [
    translang.t('DOT_MENU_QUEUE_MANAGE'),
    translang.t('DOT_MENU_BUS_DETAILS'),
    translang.t('DOT_MENU_GROUP_ICIDENT_REPORT'),
    translang.t('DOT_MENU_INCIDENT_REPORTING_REPORT'),
    translang.t('DOT_MENU_PASSENGER_REPORT'),
  ];

  const alertImage = alertStatus === 'success' ? Images.checked : Images.n_ic_warning;
  const alertButtonColor =
    alertStatus === 'success'
      ? [Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]
      : [Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end];

  return (
    <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
      <BackNavigationBar
        title={translang.t('schoolBus')}
        onMenuTap={back}
        is_travel={true}
        TravelButton={RenderTravelButton}
        is_more="1"
        actions={moreActions}
        onMoreTap={(value, index) => {
          if (index === 0) onHandleQueue();
          else if (index === 1) onVehicleDetail();
          else if (index === 2) onGroupIncidentReport();
          else if (index === 3) onReportingReport();
          else if (index === 4) onPassengerReport();
        }}
      />
      <View style={styles.subContainer}>
        <View style={styles.statusContainer}>
          {Object.values(TravelStatusMap).map((item) => (
            <View key={item.value} style={styles.radioContainer}>
              <CustomRadioButtonItem
                radioSize={16}
                isSelected={travelStatus === item.value}
                selectedColor={Color.green_color_bg}
              />
              <Text style={styles.radioLabel}>{item.title}</Text>
            </View>
          ))}
        </View>
        <FlatList
          data={students}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.flatlist}
        />
        {(travelStatus === TravelStatuses.ARRIVED || travelStatus === TravelStatuses.DEPARTED) && (
          <NextButton
            label={
              travelStatus === TravelStatuses.ARRIVED
                ? translang.t('COMMON_confirm')
                : translang.t('COMMON_confirm')
            }
            containerStyle={styles.nextButtonContainer}
            buttonStyle={styles.nextButton}
            colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
            isVerticalGradient={true}
            _onPress={onPressNext}
          />
        )}
      </View>
      <ProgressHud isVisible={isLoading} />
      <AlertWithImageModal
        isVisible={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        image={alertImage}
        buttonColors={alertButtonColor}
        message={alertContent}
      />
      <StudentPopup
        isVisible={showStudentModal}
        student={selectedStudent}
        onClose={() => setShowStudentModal(false)}
        navigation={navigation}
      />

      <BusPopup
        isVisible={showBusModal}
        onClose={() => setShowBusModal(false)}
        navigation={navigation}
      />

      <StudentStatusModal
        checkMode={checkMode}
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
  gradientButtonContainer: {
    alignSelf: 'center',
  },
  gradientButton: { height: 40, paddingHorizontal: 16 },
  gradientButtonText: { fontSize: 22 },
});

export default BusDetailScreen;
