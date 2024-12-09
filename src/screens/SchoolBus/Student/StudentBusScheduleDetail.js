import React, { useCallback, useEffect, useState } from 'react';
import {
  BackHandler,
  Dimensions,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AlertWithImageModal from '../../../components/AlertWithImageModal';
import BackNavigationBar from '../../../components/BackNavigationBar';
import ProgressHud from '../../../components/ProgressHud';
import Color from '../../../constants/color';
import ApiManager from '../../../managers/ApiManager';
import Images from '../../../themes/Images';
import translang from '../../../utils/language.utils';
import images from '../../../themes/Images';
import CustomRadioButtonItem from '../../../components/CustomRadioButtonItem';
import CollapseMapIcon from '../../../assets/images/new/ic_collapse_map.png';
import ExpandMapIcon from '../../../assets/images/new/ic_expand_map.png';
import Storage from '../../../managers/StorageManager';
import StuffPopup from './StuffPopup';
import MapView, { Marker, UrlTile } from 'react-native-maps';

const screenHeight = Dimensions.get('window').height;

const StudentBusScheduleDetail = ({ navigation }) => {
  const scheduleID = navigation.getParam('scheduleID');
  const [userInfo, setUserInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showStuffModal, setShowStuffModal] = useState(false);

  const [alertContent, setAlertContent] = useState('');

  const [infoLocation, setInfoLocation] = useState({});
  const [infoVehicle, setInfoVehicle] = useState({});
  const [infoRoute, setInfoRoute] = useState({});
  const [infoTravel, setInfoTravel] = useState({});

  const { sLocationUpdateTime, dLat = 0, dLng = 0 } = infoLocation;

  const { sLicensePlate, sBrandModel, sDriverName, sDriverPhoto, sDriverPhone } = infoVehicle;
  const { sDate, sTime } = infoRoute;
  const {
    nStatus,
    nQueueOrder,
    sCheckInTime,
    sCheckOutTime,
    nCheckInStatus,
    nCheckOutStatus,
    sTeacherName,
    sTeacherPhoto,
  } = infoTravel;

  const [mapExpanded, setMapExpanded] = useState(false);

  useEffect(() => {
    initialize();
    const interval = setInterval(fetchBusLocation, 5000); // Fetch location every 5 seconds

    return () => {
      clearInterval(interval); // Clean up interval on unmount
    };
  }, [fetchBusLocation, initialize]);

  const fetchBusLocation = useCallback(async () => {
    ApiManager.getScheduleDetailForStudent(scheduleID)
      .then((data) => {
        if (data.status === 1) {
          setInfoLocation(data.infoLocation);
          setInfoVehicle(data.infoVehicle);
          setInfoRoute(data.infoRoute);
          setInfoTravel(data.infoTravel);
        } else {
          alert(data.message);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [scheduleID]);

  const initialize = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await Storage.getUser();
      const { ID: userId, SchoolId: schoolId } = user;
      const userInfo = await ApiManager.getUserInfo(userId, schoolId);
      setUserInfo(userInfo);
      loadDetails();
    } catch (error) {
      console.log('UserInfo error', error);
    }
  }, [loadDetails]);

  const loadDetails = useCallback(() => {
    setIsLoading(true);
    ApiManager.getScheduleDetailForStudent(scheduleID)
      .then((data) => {
        if (data.status === 1) {
          setInfoLocation(data.infoLocation);
          setInfoVehicle(data.infoVehicle);
          setInfoRoute(data.infoRoute);
          setInfoTravel(data.infoTravel);
        } else {
          alert(data.message);
        }
      })
      .catch((error) => {
        console.log(error);
        alert('Failed to fetch details.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [scheduleID]);

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

  const handlePressStuff = useCallback(() => {
    setShowStuffModal(true);
  }, []);

  const onReportingReport = () => {
    navigation.navigate('StudentIncidentReportingReport');
  };

  const onPassengerReport = () => {
    navigation.navigate('StudentPickupDropOffReport');
  };

  const handleToggleMapView = () => {
    setMapExpanded((prev) => !prev);
  };

  const moreActions = [
    translang.t('DOT_MENU_INCIDENT_REPORTING_REPORT'),
    translang.t('DOT_MENU_PASSENGER_REPORT'),
  ];

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

  return (
    <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
      <BackNavigationBar
        title={translang.t('schoolBus')}
        onMenuTap={back}
        is_more="1"
        actions={moreActions}
        onMoreTap={(value, index) => {
          if (index === 0) onReportingReport();
          else if (index === 1) onPassengerReport();
        }}
      />

      <ScrollView contentContainerStyle={styles.contentContainerStyle} style={styles.scrollView}>
        <View style={[styles.mapViewContainer, mapExpanded && { height: screenHeight * 0.75 }]}>
          <MapView
            style={styles.map}
            provider={'google'}
            mapType="hybrid"
            zoomEnabled={mapExpanded}
            rotateEnabled={mapExpanded}
            scrollEnabled={mapExpanded}
            camera={{
              center: {
                latitude: dLat || 0,
                longitude: dLng || 0,
              },
              zoom: 15,
              pitch: 0,
              heading: 0,
            }}
          >
            {!isLoading && (
              <Marker
                coordinate={{ latitude: dLat || 0, longitude: dLng || 0 }}
                title="Bus Location"
                description="Current location of the bus"
                anchor={{
                  x: 0,
                  y: 0,
                }}
                image={
                  mapExpanded
                    ? Images.ic_school_bus_marker_large
                    : Images.ic_school_bus_marker_small
                }
                icon={
                  mapExpanded
                    ? Images.ic_school_bus_marker_large
                    : Images.ic_school_bus_marker_small
                }
              />
            )}
          </MapView>

          <Pressable style={styles.mapSwitchButton} onPress={handleToggleMapView}>
            <Image
              source={mapExpanded ? CollapseMapIcon : ExpandMapIcon}
              style={styles.mapSwitchIcon}
              resizeMode="contain"
            />
          </Pressable>
        </View>

        <View style={styles.detailsView}>
          <View style={styles.avatarWrapper}>
            <Image
              source={sDriverPhoto ? { uri: sDriverPhoto } : images.women_user}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.text4}>
            {translang.t('UPDATED_AS_OF')} {sLocationUpdateTime || '-'}
          </Text>
          <View style={styles.wrapper1}>
            <Text style={styles.text1}>{sDriverName}</Text>
            <Text style={styles.text2}>
              {translang.t('DRIVER_NUMBER')}: {sDriverPhone}
            </Text>
            <Text style={styles.text2}>
              {sLicensePlate} : {sBrandModel}
            </Text>
            <Text style={styles.text2}>
              {translang.t('VEHICLE_ROUTE')}: {sDate}
            </Text>
            <Text style={styles.text2}>
              {translang.t('DEPATURE_TIME')}: {sTime}
            </Text>
          </View>

          <View style={styles.statusContainer}>
            {Object.values(TravelStatusMap).map((item) => (
              <View key={item.value} style={styles.radioContainer}>
                <CustomRadioButtonItem
                  radioSize={16}
                  isSelected={nStatus === item.value}
                  selectedColor={Color.green_color_bg}
                />
                <Text style={styles.radioLabel}>{item.title}</Text>
              </View>
            ))}
          </View>
          <View style={styles.row1}>
            <Text style={styles.text3}>{translang.t('QUEUE_ORDER')}</Text>
            <Text style={styles.text3}>{nQueueOrder}</Text>
          </View>
          <View style={styles.row1}>
            <Text style={styles.text3}>{translang.t('BUS_CHECK_IN_STATUS_CHECKED_IN')} </Text>
            <Text style={styles.text3}>{sCheckInTime}</Text>
          </View>
          <View style={styles.row1}>
            <Text style={styles.text3}>{translang.t('BUS_CHECK_IN_STATUS_CHECKED_OUT')} </Text>
            <Text style={styles.text3}>{sCheckOutTime}</Text>
          </View>
          {sTeacherName ? (
            <TouchableOpacity style={styles.row1} onPress={handlePressStuff}>
              <Text style={styles.text3}>{translang.t('BUS_TEACHER_STAFF')} </Text>
              <View style={styles.teacherStaffContainer}>
                <Image
                  source={sTeacherPhoto ? { uri: sTeacherPhoto } : images.women_user}
                  style={styles.staffAvatar}
                />
                <Text style={styles.staffText}>{sTeacherName}</Text>
              </View>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
      <ProgressHud isVisible={isLoading} />
      <AlertWithImageModal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        image={Images.n_ic_warning}
        message={alertContent}
      />
      <StuffPopup
        isVisible={showStuffModal}
        stuff={{
          stuffPhone: '12345678',
        }}
        onClose={() => setShowStuffModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
  },

  mapViewContainer: {
    height: 240,
    width: '100%',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  marker: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  detailsView: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: 'white',
    borderTopRadius: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 11.27,
    elevation: 12,
    paddingTop: 70,
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  contentContainerStyle: {
    flexGrow: 1,
    // paddingTop: 240,
  },
  avatarWrapper: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Color.n_password_grey,
    top: -50,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  wrapper1: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Color.n_color_switch_off,
  },
  text1: {
    color: '#45494D',
    textAlign: 'center',
    fontSize: 28,
  },
  text2: {
    color: '#45494D',
    textAlign: 'center',
    fontSize: 18,
    marginTop: 2,
  },
  text3: {
    color: '#45494D',
    textAlign: 'center',
    fontSize: 18,
  },
  text4: {
    position: 'absolute',
    top: 4,
    right: 10,
    color: '#45494D',
    textAlign: 'center',
    fontSize: 16,
  },
  statusContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Color.n_color_switch_off,
  },
  radioContainer: {
    alignItems: 'center',
  },
  radioLabel: {
    fontSize: 20,
    color: Color.n_default_gray,
    marginTop: 4,
  },
  row1: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Color.n_color_switch_off,
  },
  teacherStaffContainer: {
    flexGrow: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  staffAvatar: {
    width: 14,
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
  },
  staffText: {
    fontSize: 20,
    color: '#45494D',
    marginLeft: 4,
  },
  mapSwitchButton: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 28,
    height: 28,
  },
  mapSwitchIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});

export default StudentBusScheduleDetail;
