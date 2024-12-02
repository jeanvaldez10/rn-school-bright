import Geolocation from '@react-native-community/geolocation';
import { TravelStatuses } from '../constants/constants';
import ApiManager from '../managers/ApiManager';
import translang from '../utils/language.utils';

export const checkGPSPermission = async () => {
  try {
    const position = await new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(new Error(error.message)),
      );
    });

    console.log('GPS is enabled', position);
    return true;
  } catch (error) {
    console.error('GPS is not enabled:', error.message);
    return false;
  }
};

export const getTravelStatusUpdateFunction = (status) => {
  switch (status) {
    case TravelStatuses.DEPARTED:
      return ApiManager.busStartTravel;
    case TravelStatuses.ARRIVED:
      return ApiManager.busCompleteTravel;
    case TravelStatuses.CANCELLED:
      return ApiManager.busCancelTravel;
    default:
      return undefined;
  }
};

export const getNextTravelStatus = (currentStatus) => {
  switch (currentStatus) {
    case TravelStatuses.NOT_DEPARTED:
      return TravelStatuses.DEPARTED;
    case TravelStatuses.DEPARTED:
      return TravelStatuses.CANCELLED;
    default:
      return '';
  }
};

export const getTravelSwitchSuccessMessage = (status) => {
  const messages = {
    [TravelStatuses.DEPARTED]: translang.t('BUS_SUCCESSFUL_DEPART'),
    [TravelStatuses.CANCELLED]: translang.t('BUS_SUCCESSFUL_CANCEL'),
    [TravelStatuses.ARRIVED]: translang.t('BUS_SUCCESSFUL_ARRIVE'),
  };
  return messages[status] || '';
};

export const getTravelButtonLabel = (travelStatus) => {
  switch (travelStatus) {
    case TravelStatuses.NOT_DEPARTED:
      return translang.t('START_JOURNEY');
    case TravelStatuses.DEPARTED:
      return translang.t('CANCEL_TRAVEL');
    case TravelStatuses.ARRIVED:
      return translang.t('ARRIVED_TRAVEL');
    case TravelStatuses.CANCELLED:
      return translang.t('CANCELLED_TRAVEL');
    default:
      return '';
  }
};

export const canCompleteTask = (students) => {
  const hasUnspecifiedStatus = students.some(
    (student) => student.nCheckInStatus === 0 || student.nCheckOutStatus === 0,
  );

  return !hasUnspecifiedStatus;
};

export const hasUnspecifiedCheckInBefore = (students, targetStudent) => {
  const lowerOrderStudents = students.filter(
      student => student.nOrder < targetStudent.nOrder
  );

  return lowerOrderStudents.some(student => student.nCheckInStatus === 0);
}