import Geolocation from '@react-native-community/geolocation';
import { useCallback, useEffect } from 'react';
import ApiManager from '../../../managers/ApiManager';
import StorageManager from '../../../managers/StorageManager';

const TravelUpdater = () => {
  const updateTravelStatuses = useCallback(async () => {
    const startedSchedules = await StorageManager.getStartedSchedules();

    for (const scheduleID of startedSchedules) {
      try {
        const data = await ApiManager.getBusScheduleDetail(scheduleID).catch(() => null);

        if (data?.infoTravel?.nStatus === 1 && !data?.infoTravel?.hasStartedByOther) {
          Geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              ApiManager.updateBusLocation(data?.infoTravel?.nTravelID, latitude, longitude);
            },
            (error) => {
              console.error('Error fetching location for ongoing travel:', error);
              alert('Error fetching location for ongoing travel.');
            },
          );
        } else {
          StorageManager.setStartedSchedules(
            startedSchedules.filter((schedule) => schedule !== scheduleID),
          );
        }
      } catch (e) {
        console.error(`Failed to fetch details for Schedule ID ${scheduleID}`);
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      updateTravelStatuses();
    }, 30000);
    return () => clearInterval(interval);
  }, [updateTravelStatuses]);

  return null;
};

export default TravelUpdater;
