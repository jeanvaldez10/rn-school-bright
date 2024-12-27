import { Text } from 'native-base';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import BackNavigationBar from '../../../components/BackNavigationBar';
import ProgressHud from '../../../components/ProgressHud';
import Color from '../../../constants/color';
import ApiManager from '../../../managers/ApiManager';
import Storage from '../../../managers/StorageManager';
import images from '../../../themes/Images';
import translang, { getCurrentLocale } from '../../../utils/language.utils';
import ReportPopup from './ReportPopup';
import AlertWithImageModal from '../../../components/AlertWithImageModal';
import moment from 'moment';

const IncidentReportingReport = ({ navigation }) => {
  const [incidentsToday, setIncidentsToday] = useState([]);
  const [incidentsIn7Days, setIncidentsIn7Days] = useState([]);

  const [userInfo, setUserInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedIncidentDetails, setSelectedIncidentDetails] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertContent, setAlertContent] = useState('');

  useEffect(() => {
    initialize();
  }, [initialize]);

  const back = useCallback(() => {
    navigation.goBack();
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
      loadIncidentList();
    } catch (error) {
      console.log('UserInfo error', error);
    }
  }, [loadIncidentList]);

  const loadIncidentList = useCallback((readType = 0) => {
    // 0 - all, 1 - read, 2 - unread
    setIsLoading(true);
    ApiManager.getBusIncidentList()
      .then((data) => {
        if (data.status === 1) {
          let allIncidentsToday = data.lstIncidentsInToday || [];
          let allIncidentsIn7Days = data.lstIncidentsIn7Days || [];

          if (readType === 1) {
            allIncidentsToday = allIncidentsToday.filter((incident) => incident.isAlreadyRead);
            allIncidentsIn7Days = allIncidentsIn7Days.filter((incident) => incident.isAlreadyRead);
          } else if (readType === 2) {
            allIncidentsToday = allIncidentsToday.filter((incident) => !incident.isAlreadyRead);
            allIncidentsIn7Days = allIncidentsIn7Days.filter((incident) => !incident.isAlreadyRead);
          }

          setIncidentsToday(allIncidentsToday);
          setIncidentsIn7Days(allIncidentsIn7Days);
        } else {
          // setShowAlertModal(true);
          // setAlertContent(data.message);
        }
      })
      .catch((error) => {
        console.log(error);
        setShowAlertModal(true);
        setAlertContent(translang.t('ERROR_OCCURED_TRY_AGAIN'));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleReadIncident = async (item, isToday) => {
    try {
      setIsLoading(true);
      const result = await ApiManager.readBusIncident(item.nIncidentID);
      let newIncidents = isToday ? [...incidentsToday] : [...incidentsIn7Days];
      const incidentIndex = newIncidents.findIndex(
        (incident) => incident.nIncidentID === item.nIncidentID,
      );
      if (incidentIndex > -1) {
        newIncidents[incidentIndex] = {
          ...newIncidents[incidentIndex],
          isAlreadyRead: true,
        };

        isToday ? setIncidentsToday(newIncidents) : setIncidentsIn7Days(newIncidents);
      }
      setIsLoading(false);
      return result;
    } catch (e) {
      setIsLoading(false);
      return null;
    }
  };

  const IncidentItem = ({ item, isToday = false }) => {
    const { sDate, sTime, sVehicleBrandModel, sVehicleLicensePlate, isAlreadyRead } = item;

    const onClickItem = async () => {
      setSelectedIncident(item);

      const readResult = await handleReadIncident(item, isToday);
      if (readResult) {
        setSelectedIncidentDetails(readResult.infoIncident);
        setShowReportModal(true);
      }
    };

    return (
      <TouchableOpacity
        style={[
          styles.menuEachStyle,
          !isAlreadyRead && { backgroundColor: Color.n_default_orange_light },
        ]}
        activeOpacity={0.5}
        onPress={onClickItem}
      >
        <Image
          source={isAlreadyRead ? images.ic_school_bus_2 : images.ic_school_bus_1}
          style={styles.image}
        ></Image>
        <View style={styles.group2}>
          <View style={styles.group3}>
            <Text style={styles.text1}>{sTime}</Text>
            <Text style={styles.text1}>
              {moment(sDate, 'DD/MM/YYYY')
                .add(getCurrentLocale() === 'th' ? 0 : -543, 'years')
                .format('DD/MM/YYYY')}
            </Text>
          </View>
          <Text style={[styles.topText, { color: Color.n_default_orange }]}>
            {sVehicleLicensePlate}
          </Text>
          <Text style={styles.topText}>{sVehicleBrandModel}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const moreActions = [
    translang.t('NOTIFICATION_all'),
    translang.t('NOTIFICATION_read'),
    translang.t('NOTIFICATION_unread'),
    translang.t('NOTIFICATION_readall'),
  ];

  const onAllSelect = useCallback(() => {
    loadIncidentList(0);
  }, [loadIncidentList]);

  const onReadSelect = useCallback(() => {
    loadIncidentList(1);
  }, [loadIncidentList]);

  const onUnreadSelect = useCallback(() => {
    loadIncidentList(2);
  }, [loadIncidentList]);

  const onReadAllSelect = useCallback(() => {
    ApiManager.readAllBusIncidentForTeacher()
      .then(loadIncidentList)
      .catch(() => null);
  }, [loadIncidentList]);

  return (
    <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
      <BackNavigationBar
        title={translang.t('DOT_MENU_INCIDENT_REPORTING_REPORT')}
        onMenuTap={back}
        is_more="1"
        actions={moreActions}
        onMoreTap={(value, index) => {
          if (index === 0) onAllSelect();
          else if (index === 1) onReadSelect();
          else if (index === 2) onUnreadSelect();
          else if (index === 3) onReadAllSelect();
        }}
      />
      <ScrollView contentContainerStyle={styles.contentContainerStyle}>
        {incidentsToday.length > 0 || isLoading ? (
          <>
            {isLoading ? null : (
              <>
                <Text style={styles.label1}>{translang.t('TODAY')}</Text>
                {incidentsToday.map((incident, index) => (
                  <IncidentItem item={incident} isToday={true} key={index.toString()} />
                ))}
              </>
            )}
          </>
        ) : (
          <>
            <Text style={styles.label1}>{translang.t('TODAY')}</Text>
            <View style={styles.noSupportWrapper}>
              <Text style={styles.noSupportText}>{translang.t('NOT_FOUND_DATA')}</Text>
            </View>
          </>
        )}
        {incidentsIn7Days.length > 0 || isLoading ? (
          <>
            {isLoading ? null : (
              <>
                <Text style={styles.label1}>{translang.t('THIS_WEEK')}</Text>
                {incidentsIn7Days.map((incident, index) => (
                  <IncidentItem item={incident} key={index.toString()} />
                ))}
              </>
            )}
          </>
        ) : (
          <>
            <Text style={styles.label1}>{translang.t('THIS_WEEK')}</Text>

            <View style={styles.noSupportWrapper}>
              <Text style={styles.noSupportText}>{translang.t('NOT_FOUND_DATA')}</Text>
            </View>
          </>
        )}
      </ScrollView>

      <ProgressHud isVisible={isLoading} />

      <ReportPopup
        isVisible={showReportModal}
        onClose={() => setShowReportModal(false)}
        incidentDetails={selectedIncidentDetails}
        navigation={navigation}
      />

      <AlertWithImageModal
        isVisible={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        message={alertContent}
        image={images.n_ic_warning}
        buttonColors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
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
  label1: {
    marginVertical: 16,
    fontSize: 24,
    fontWeight: 'normal',
    color: Color.expand_child_text,
  },
  menuEachStyle: {
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
    backgroundColor: Color.white,
    marginBottom: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
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
});

export default IncidentReportingReport;
