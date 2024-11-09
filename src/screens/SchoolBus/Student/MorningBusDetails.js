import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, SafeAreaView, StyleSheet, View } from 'react-native';
import AlertWithImageModal from '../../../components/AlertWithImageModal';
import BackNavigationBar from '../../../components/BackNavigationBar';
import ProgressHud from '../../../components/ProgressHud';
import Color from '../../../constants/color';
import ApiManager from '../../../managers/ApiManager';
import Images from '../../../themes/Images';
import translang from '../../../utils/language.utils';

const MorningBusDetails = ({ navigation }) => {
  const [userInfo] = useState(navigation.getParam('userInfo'));
  const [students, setStudents] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alertContent, setAlertContent] = useState('');

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

  const moreActions = [
    translang.t('DOT_MENU_QUEUE_MANAGE'),
    translang.t('DOT_MENU_BUS_DETAILS'),
    translang.t('DOT_MENU_GROUP_ICIDENT_REPORT'),
    translang.t('DOT_MENU_INCIDENT_REPORTING_REPORT'),
    translang.t('DOT_MENU_PASSENGER_REPORT'),
  ];

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
      <View style={styles.subContainer}>
        <View style={styles.mapViewContainer}></View>
        <View style={styles.detailsView}>

        </View>
      </View>
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
  subContainer: {
    flex: 1,
  },
  mapViewContainer: {
    height: 240,
    alignSelf: 'stretch',
  },
  
  detailsView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'column',
    backgroundColor: 'white',
    borderTopRadius: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 11.27,
    elevation: 12,
  },
});

export default MorningBusDetails;
