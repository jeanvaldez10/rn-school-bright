import Geolocation from '@react-native-community/geolocation';
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
import GradientButton from '../../../components/GradientButton';
import NextButton from '../../../components/NextButton';
import ProgressHud from '../../../components/ProgressHud';
import Color from '../../../constants/color';
import { TravelStatuses } from '../../../constants/constants';
import {
  canCompleteTask,
  checkGPSPermission,
  getNextTravelStatus,
  getTravelButtonLabel,
  getTravelStatusUpdateFunction,
  getTravelSwitchSuccessMessage,
  hasUnspecifiedCheckInBefore,
} from '../../../helpers/schoolbus';
import ApiManager from '../../../managers/ApiManager';
import Images from '../../../themes/Images';
import translang, { getCurrentLocale } from '../../../utils/language.utils';
import BusPopup from './BusPopups';
import StudentItem from './StudentItem';
import StudentPopup from './StudentPopup';
import StudentStatusModal from './StudentStatusModal';
import SortableList from 'react-native-sortable-list';
import StorageManager from '../../../managers/StorageManager';

// Geolocation.setRNConfiguration({});

const BusDetailScreen = ({ navigation }) => {
  const [selectedBus] = useState(navigation.getParam('bus'));
  const [userInfo] = useState(navigation.getParam('userInfo'));

  const [selectedSchedule] = useState(navigation.getParam('schedule'));

  const [students, setStudents] = useState([]); // nCheckInStatus: 0:None, 1:Checked In, 2:Checked In Late, -1:Not Board, -2:Personal Leave, "nCheckOutStatus": 0 0:None, 1:Checked Out, -1:Not Board, -2:Personal Leave, -3:Sick Leave
  const [infoTravel, setInfoTravel] = useState({}); // 0:Not Departed, 1:Departed, 100:Arrived, -1:Cancelled, -100:Inciden
  const [infoVehicle, setInfoVehicle] = useState({});

  const [isLoading, setIsLoading] = useState(false);
  const [switchingTravelStatus, setSwitchingTravelStatus] = useState(false);
  const [completingTravel, setCompletingTravel] = useState(false);

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertContent, setAlertContent] = useState('');
  const [alertStatus, setAlertStatus] = useState(''); // success or warning

  const [showStudentStatusModal, setShowStudentStatusModal] = useState(false);

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState();
  const [checkMode, setCheckMode] = useState('in');

  const [reordering, setReordering] = useState(false);
  const [showBusModal, setShowBusModal] = useState(false);

  const { nScheduleID } = selectedSchedule;
  const { nStatus: travelStatus, nTravelID, hasStartedByOther } = infoTravel || {};

  const sortedStudents = [...students].sort((a, b) => a.nOrder - b.nOrder);

  useEffect(() => {
    loadScheduleDetails();
  }, [loadScheduleDetails]);

  const loadScheduleDetails = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await ApiManager.getBusScheduleDetail(nScheduleID, getCurrentLocale());

      if (data.status === 1) {
        setStudents(data.lstStudents || []);
        setInfoTravel(data.infoTravel);
        setInfoVehicle(data.infoVehicle);
      } else {
        showAlert(data.message, 'warning');
      }
    } catch (e) {
      console.log(e, 'Schedule Details Error');
      showAlert(translang.t('ERROR_OCCURED_TRY_AGAIN'), 'warning');
    }
    setIsLoading(false);
  }, [nScheduleID, showAlert]);

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

  const showAlert = useCallback((message, status) => {
    setAlertContent(message);
    setAlertStatus(status);
    setShowAlertModal(true);
  }, []);

  const onPressStudent = (student) => () => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  console.log(nTravelID);

  const onPressCheckIn = (student) => () => {
    if (
      travelStatus === TravelStatuses.ARRIVED ||
      travelStatus === TravelStatuses.CANCELLED ||
      hasStartedByOther
    ) {
      return;
    }
    if (hasUnspecifiedCheckInBefore(students, student)) {
      showAlert(translang.t('CHECK_STUDENT_QUEUE'), 'warning');
      return;
    }
    setSelectedStudent(student);
    setCheckMode('in');
    setShowStudentStatusModal(true);
  };

  const onPressCheckout = (student) => () => {
    if (
      travelStatus === TravelStatuses.ARRIVED ||
      travelStatus === TravelStatuses.CANCELLED ||
      hasStartedByOther
    ) {
      return;
    }

    if (![1, 2].includes(student.nCheckInStatus)) {
      return;
    }
    setSelectedStudent(student);
    setCheckMode('out');
    setShowStudentStatusModal(true);
  };

  const handleRelease = (_, currentOrder) => {
    const newStudents = currentOrder.map((key, index) => ({
      ...students[key],
      nOrder: index + 1,
    }));
    setStudents(newStudents);
  };

  const renderStudentItem = ({ item, index, toggleRowActive }) => {
    return (
      <StudentItem
        onPressStudent={onPressStudent}
        onPressCheckIn={onPressCheckIn}
        onPressCheckout={onPressCheckout}
        reordering={reordering}
        item={item}
        index={index}
        toggleRowActive={toggleRowActive}
      />
    );
  };

  const onSwitchSuccess = async (newStatus) => {
    const data = await ApiManager.getBusScheduleDetail(nScheduleID);

    if (data.status === 1) {
      setStudents(data.lstStudents || []);
      setInfoTravel(data.infoTravel);
    }
    const successMessage = getTravelSwitchSuccessMessage(newStatus);

    showAlert(successMessage, 'success');
  };

  const onPressJourney = async () => {
    if (switchingTravelStatus || hasStartedByOther) {
      return;
    }
    const newStatus = getNextTravelStatus(travelStatus);

    try {
      if (!(await checkGPSPermission())) {
        showAlert(translang.t('TURN_ON_GPS'), 'warning');
        return;
      }

      setSwitchingTravelStatus(true);
      const updateFunc = getTravelStatusUpdateFunction(newStatus);

      if (updateFunc) {
        const result = await updateFunc(nTravelID);
        result.status === 1;
        if (result.status === 1) {
          if (newStatus === TravelStatuses.DEPARTED) {
            StorageManager.saveScheduleID(nScheduleID);
          }

          await onSwitchSuccess(newStatus);
        } else {
          showAlert(result.message, 'warning');
        }
      }
    } catch (e) {
      console.error('Switch travel status error', e);
      showAlert(translang.t('ERROR_OCCURED_TRY_AGAIN'), 'warning');
    } finally {
      setSwitchingTravelStatus(false);
    }
  };

  const handleErrorCheckInOut = (message) => {
    let newStudentList = [...students];
    showAlert(message, 'warning');

    setStudents(newStudentList);
  };

  const onChangeStudentStatus = async (newStatus) => {
    let newStudentList = [...students];
    const studentIndex = newStudentList.findIndex(
      (student) => student.sStudentID === selectedStudent.sStudentID,
    );

    const nCheckInStatus =
      checkMode === 'in' ? newStatus : newStudentList[studentIndex].nCheckInStatus;

    let nCheckOutStatus =
      checkMode === 'out' ? newStatus : newStudentList[studentIndex].nCheckOutStatus;
    if (checkMode === 'in' && [0, 1, 2].includes(newStatus)) {
      nCheckOutStatus = 0;
    } else if (checkMode === 'out' && [0, 1].includes(newStatus)) {
      nCheckOutStatus = newStatus;
    } else if (checkMode === 'in') {
      nCheckOutStatus = nCheckInStatus;
    }

    newStudentList[studentIndex] = {
      ...newStudentList[studentIndex],
      nCheckInStatus,
      nCheckOutStatus,
    };
    setStudents(newStudentList);

    const updateFunc =
      checkMode === 'in' ? ApiManager.busCheckInStudent : ApiManager.busCheckoutStudent;
    try {
      const result = await updateFunc(infoTravel.nTravelID, selectedStudent.sStudentID, newStatus);
      if (result.status !== 1) {
        handleErrorCheckInOut(result.message || '');
      }

      console.log(result);
    } catch (e) {
      handleErrorCheckInOut(translang.t('ERROR_OCCURED_TRY_AGAIN'));
    }
  };

  const onPressComplete = async () => {
    if (hasStartedByOther || completingTravel) {
      return;
    }
    try {
      if (TravelStatuses.ARRIVED && !canCompleteTask(students)) {
        showAlert(translang.t('CHECK_STUDENT_STATUS'), 'warning');
        return;
      }

      setCompletingTravel(true);

      const result = await ApiManager.busCompleteTravel(nTravelID);
      result.status === 1
        ? await onSwitchSuccess(TravelStatuses.ARRIVED)
        : showAlert(result.message, 'warning');
    } catch (e) {
      console.error('Switch travel status error', e);
      showAlert(translang.t('CHECK_STUDENT_STATUS'), 'warning');
    } finally {
      setCompletingTravel(false);
    }
  };

  const onPressConfirmReorder = async () => {
    // TODO - show loading...
    ApiManager.reOrderStudentQueue(
      nScheduleID,
      sortedStudents.map((student) => student.sStudentID),
    );
    setReordering(false);
  };

  const onHandleQueue = () => {
    if (
      travelStatus === TravelStatuses.ARRIVED ||
      travelStatus === TravelStatuses.CANCELLED ||
      hasStartedByOther
    ) {
      return;
    }
    setReordering(true);
  };

  const onVehicleDetail = () => {
    setShowBusModal(true);
  };

  const onGroupIncidentReport = () => {
    let params = {
      nTravelID,
      userInfo,
    };
    navigation.navigate('GroupIncidentReport', params);
  };

  const onReportingReport = () => {
    navigation.navigate('IncidentReportingReport');
  };

  const onPassengerReport = () => {
    navigation.navigate('VehiclePassgngerAlightingReport', {
      busID: selectedBus.nBusID,
    });
  };

  const RenderTravelButton = () => {
    if (
      !Object.values(TravelStatuses).includes(travelStatus) ||
      travelStatus === TravelStatuses.ARRIVED ||
      travelStatus === TravelStatuses.CANCELLED
    ) {
      return null;
    }
    const buttonLabel = getTravelButtonLabel(travelStatus);
    return (
      <GradientButton
        containerStyle={styles.gradientButtonContainer}
        buttonStyle={styles.gradientButton}
        textStyle={styles.gradientButtonText}
        colors={
          travelStatus === TravelStatuses.NOT_DEPARTED
            ? [Color.green_button_color]
            : [Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]
        }
        isVerticalGradient={true}
        label={buttonLabel}
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
        is_travel={!hasStartedByOther}
        TravelButton={RenderTravelButton}
        is_more="1"
        actions={moreActions}
        titleContainerStyle={styles.titleContainer}
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
          {Object.values(TravelStatusMap).map((item, index) => (
            <>
              <View key={item.value} style={styles.radioContainer}>
                <CustomRadioButtonItem
                  radioSize={16}
                  isSelected={travelStatus === item.value}
                  selectedColor={Color.green_color_bg}
                />
                <Text style={styles.radioLabel}>{item.title}</Text>
              </View>
              {index !== 2 && <Text style={styles.travelArrow}>{'>>>'}</Text>}
            </>
          ))}
        </View>
        <View style={styles.group1}>
          <Text style={styles.text1}>{translang.t('CHECK_IN')}</Text>
          <Text style={styles.text1}>{translang.t('CHECK_OUT')}</Text>
        </View>
        <SortableList
          style={styles.sortableList}
          data={sortedStudents}
          sortingEnabled={reordering}
          manuallyActivateRows={true}
          renderRow={({ data, index, toggleRowActive }) =>
            renderStudentItem({ item: data, index, toggleRowActive })
          }
          onReleaseRow={handleRelease}
          contentContainerStyle={styles.flatlist}
        />
        {/* <FlatList
          data={sortedStudents}
          keyExtractor={(item) => item.sStudentID}
          renderItem={renderStudentItem}
          contentContainerStyle={styles.flatlist}
        /> */}

        {reordering ? (
          <GradientButton
            label={translang.t('COMMON_confirm')}
            containerStyle={styles.nextButtonContainer}
            buttonStyle={styles.nextButton}
            colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
            ContentComponent={
              completingTravel ? () => <ActivityIndicator color={Color.white} /> : null
            }
            isVerticalGradient={true}
            _onPress={onPressConfirmReorder}
          />
        ) : (
          travelStatus === TravelStatuses.DEPARTED &&
          !hasStartedByOther && (
            <GradientButton
              label={translang.t('COMPLETE_TRAVEL')}
              containerStyle={styles.nextButtonContainer}
              buttonStyle={styles.nextButton}
              enabled={travelStatus === TravelStatuses.DEPARTED}
              colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
              disableColors={[Color.n_disable_button, Color.n_disable_button]}
              ContentComponent={
                completingTravel ? () => <ActivityIndicator color={Color.white} /> : null
              }
              isVerticalGradient={true}
              _onPress={onPressComplete}
            />
          )
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
        nTravelID={nTravelID}
        student={selectedStudent}
        userInfo={userInfo}
        onClose={() => setShowStudentModal(false)}
        navigation={navigation}
      />

      <BusPopup
        infoVehicle={infoVehicle}
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
  titleContainer: {
    left: -24,
  },
  subContainer: {
    flex: 1,
    paddingTop: 16,
  },
  sortableList: {
    flex: 1,
  },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    backgroundColor: Color.n_background_white,
    borderRadius: 15,
    marginHorizontal: 16,
    marginBottom: 24,
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
  travelArrow: {
    fontSize: 20,
    color: '#B1B1B1',
    fontWeight: 'bold',
    marginHorizontal: 12,
  },
  group1: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    paddingRight: 16,
  },
  text1: {
    textAlign: 'center',
    color: Color.n_default_orange,
    fontFamily: 'THSarabunNew',
    fontSize: 15,
    fontWeight: 'bold',
    paddingHorizontal: 16,
  },
  flatlist: {
    paddingBottom: 16,
    paddingTop: 12,
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
