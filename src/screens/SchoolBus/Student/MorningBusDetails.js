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
const screenHeight = Dimensions.get('window').height;

const MorningBusDetails = ({ navigation }) => {
  const [userInfo] = useState(navigation.getParam('userInfo'));
  const [students, setStudents] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alertContent, setAlertContent] = useState('');

  const [mapExpanded, setMapExpanded] = useState(false);

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

  const handleToggleMapView = () => {
    setMapExpanded((prev) => !prev);
  };

  const moreActions = [
    translang.t('DOT_MENU_QUEUE_MANAGE'),
    translang.t('DOT_MENU_BUS_DETAILS'),
    translang.t('DOT_MENU_GROUP_ICIDENT_REPORT'),
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
          if (index === 2) onGroupIncidentReport();
          else if (index === 3) onReportingReport();
          else if (index === 4) onPassengerReport();
        }}
      />

      <ScrollView contentContainerStyle={styles.contentContainerStyle} style={styles.scrollView}>
        <View style={[styles.mapViewContainer, mapExpanded && { height: screenHeight * 0.75 }]}>
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
            <Image source={images.women_user} style={styles.avatar} />
          </View>
          <View style={styles.wrapper1}>
            <Text style={styles.text1}>นายหนึ่ง สคูลไบร์ท</Text>
            <Text style={styles.text2}>{translang.t('DRIVER_NUMBER')}: 081-234-5678</Text>
            <Text style={styles.text2}>อบ 1212 กรุงเทพมหานคร : Toyota Commuter</Text>
            <Text style={styles.text2}>{translang.t('VEHICLE_ROUTE')}: 26/08/2567</Text>
            <Text style={styles.text2}>{translang.t('DEPATURE_TIME')}:5:00</Text>
          </View>

          <View style={styles.statusContainer}>
            {Object.values(TravelStatusMap).map((item) => (
              <View key={item.value} style={styles.radioContainer}>
                <CustomRadioButtonItem
                  radioSize={16}
                  isSelected={true}
                  selectedColor={Color.green_color_bg}
                />
                <Text style={styles.radioLabel}>{item.title}</Text>
              </View>
            ))}
          </View>
          <View style={styles.row1}>
            <Text style={styles.text3}>ลำดับคิว</Text>
            <Text style={styles.text3}>1</Text>
          </View>
          <View style={styles.row1}>
            <Text style={styles.text3}>{translang.t('BUS_CHECK_IN_STATUS_CHECKED_IN')} </Text>
            <Text style={styles.text3}>18/09/2024 06:00</Text>
          </View>
          <View style={styles.row1}>
            <Text style={styles.text3}>{translang.t('BUS_CHECK_IN_STATUS_CHECKED_OUT')} </Text>
            <Text style={styles.text3}>_</Text>
          </View>
          <View style={styles.row1}>
            <Text style={styles.text3}>{translang.t('BUS_TEACHER_STAFF')} </Text>
            <View style={styles.teacherStaffContainer}>
              <Image source={images.women_user} style={styles.staffAvatar} />
              <Text style={styles.staffText}>18/09/2024 06:00</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <ProgressHud isVisible={isLoading} />
      <AlertWithImageModal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        image={Images.n_ic_warning}
        message={alertContent}
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

export default MorningBusDetails;
