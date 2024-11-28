import Storage from '../utils/storage';
import { AsyncStorageKey } from '../constants/TextConstants';
import { updateUserInfo } from '../utils/DBManager';

const getUser = () => Storage.getObject(AsyncStorageKey.user);
const setUser = user => Storage.setObject(AsyncStorageKey.user, user);
const getPrevUser = () => Storage.getObject(AsyncStorageKey.prevUser);
const setPrevUser = user => Storage.setObject(AsyncStorageKey.prevUser, user);

const getPrevUserInfo = () => Storage.getObject(AsyncStorageKey.prevUserInfo);
const setPrevUserInfo = user => Storage.setObject(AsyncStorageKey.prevUserInfo, user);


const removeUser = () => Storage.remove(AsyncStorageKey.user);
const getUserInfo = () => Storage.getObject(AsyncStorageKey.userInfo);
const setUserInfo = user => {
    Storage.setObject(AsyncStorageKey.userInfo, user)
    updateUserInfo(user.ID, user);
};
const getRecoveryUserInfo = () => Storage.getObject(AsyncStorageKey.recoveryUserInfo);
const setRecoveryUserInfo = user => Storage.setObject(AsyncStorageKey.recoveryUserInfo, user);
const getRecoveryType = () => Storage.getObject(AsyncStorageKey.recoveryType);
const setRecoveryType = type => Storage.setObject(AsyncStorageKey.recoveryType, type);
const removeUserInfo = () => Storage.remove(AsyncStorageKey.userInfo);
const getSchoolPermission = () => Storage.getObject(AsyncStorageKey.schoolPermission);
const setSchoolPermission = permission => Storage.setObject(AsyncStorageKey.schoolPermission, permission);
const removeSchoolPermission = () => Storage.remove(AsyncStorageKey.schoolPermission);

const getTempUser = () => Storage.getObject(AsyncStorageKey.tempuser);
const setTempUser = tempuser => Storage.setObject(AsyncStorageKey.tempuser, tempuser);

const getFirstRunState = () => Storage.getObject(AsyncStorageKey.isfirst);
const setFirstRunState = state => Storage.setObject(AsyncStorageKey.isfirst, state);

const getAnnouncementState = () => Storage.getObject(AsyncStorageKey.announcementremember);
const setAnnouncementState = astate => Storage.setObject(AsyncStorageKey.announcementremember, astate);

const getRememberAddrStatus = () => Storage.getObject(AsyncStorageKey.rememberaddrstatus);
const setRememberAddrStatus = data => Storage.setObject(AsyncStorageKey.rememberaddrstatus, data);
const getAddrInfo = () => Storage.getObject(AsyncStorageKey.addrinfo);
const seetAddrInfo = data => Storage.setObject(AsyncStorageKey.addrinfo, data);

const getLanguage = () => Storage.getObject(AsyncStorageKey.language);
const setLanguage = data => Storage.setObject(AsyncStorageKey.language, data);

const getStatusTopupAlert = () => Storage.getObject(AsyncStorageKey.statustopupalert);
const setStatusTopupAlert = data => Storage.setObject(AsyncStorageKey.statustopupalert, data);

const getPickupDate = () => Storage.getObject(AsyncStorageKey.pickupdate);
const setPickupDate = data => Storage.setObject(AsyncStorageKey.pickupdate, data);

const getStatusTuitionAlert = () => Storage.getObject(AsyncStorageKey.statustuitionalert);
const setStatusTuitionAlert = data => Storage.setObject(AsyncStorageKey.statustuitionalert, data);

const getServerStatus = () => Storage.getObject(AsyncStorageKey.server_status);
const setServerStatus = data => Storage.setObject(AsyncStorageKey.server_status, data);

const getDeviceInfo = () => Storage.getObject(AsyncStorageKey.deviceinfo);
const setDeviceInfo = data => Storage.setObject(AsyncStorageKey.deviceinfo, data);


const getUserTermInfo = () => Storage.getObject(AsyncStorageKey.userterminfo);
const setUserTermInfo = data => Storage.setObject(AsyncStorageKey.userterminfo, data);

const getEmailOTPSendTime = () => Storage.getObject(AsyncStorageKey.emailOTPSendTime);
const setEmailOTPSendTime = data => Storage.setObject(AsyncStorageKey.emailOTPSendTime, data);

const getVerifyInfo = () => Storage.getObject(AsyncStorageKey.verifyInfo);
const setVerifyInfo = data => Storage.setObject(AsyncStorageKey.verifyInfo, data);

const getVerifyFlag = () => Storage.getObject(AsyncStorageKey.verifyFlag);
const setVerifyFlag = data => Storage.setObject(AsyncStorageKey.verifyFlag, data);

const getUrlsInfo = () => Storage.getObject(AsyncStorageKey.usersInfo);
const setUrlsInfo = data => Storage.setObject(AsyncStorageKey.usersInfo, data);

const getIDItem1 = () => Storage.getObject(AsyncStorageKey.IDItem1);
const setIDItem1 = data => Storage.setObject(AsyncStorageKey.IDItem1, data);

const getIDItem2 = () => Storage.getObject(AsyncStorageKey.IDItem2);
const setIDItem2 = data => Storage.setObject(AsyncStorageKey.IDItem2, data);

const getIDItem3 = () => Storage.getObject(AsyncStorageKey.IDItem3);
const setIDItem3 = data => Storage.setObject(AsyncStorageKey.IDItem3, data);

const getIDItem4 = () => Storage.getObject(AsyncStorageKey.IDItem4);
const setIDItem4 = data => Storage.setObject(AsyncStorageKey.IDItem4, data);

const getRecoveryUser = () => Storage.getObject(AsyncStorageKey.RecoveryUser);
const setRecoveryUser = data => Storage.setObject(AsyncStorageKey.RecoveryUser, data);

const getRequestCode = () => Storage.getObject(AsyncStorageKey.RequestCode);
const setRequestCode = data => Storage.setObject(AsyncStorageKey.RequestCode, data);

const getVerifyType = () => Storage.getObject(AsyncStorageKey.verifyType);
const setVerifyType = data => Storage.setObject(AsyncStorageKey.verifyType, data);

const getLineConnectionType = () => Storage.getObject(AsyncStorageKey.LineConnectionType);
const setLineConnectionType = data => Storage.setObject(AsyncStorageKey.LineConnectionType, data);

const getQuickMenuStudent = () => Storage.getObject(AsyncStorageKey.quickMenuStudent);
const setQuickMenuStudent = data => Storage.setObject(AsyncStorageKey.quickMenuStudent, data);

const getQuickMenuTeacher = () => Storage.getObject(AsyncStorageKey.quickMenuTeacher);
const setQuickMenuTeacher = data => Storage.setObject(AsyncStorageKey.quickMenuTeacher, data);

const getAllMenuStudent = () => Storage.getObject(AsyncStorageKey.allMenuStudent);
const setAllMenuStudent = data => Storage.setObject(AsyncStorageKey.allMenuStudent, data);

const getAllMenuTeacher = () => Storage.getObject(AsyncStorageKey.allMenuTeacher);
const setAllMenuTeacher = data => Storage.setObject(AsyncStorageKey.allMenuTeacher, data);
const getStartedSchedules = async () => {
  try {
    const schedules = await Storage.getObject(AsyncStorageKey.startedSchedules);
    if (Array.isArray(schedules)) {
      return schedules;
    } else {
      return [];
    }
  } catch (e) {
    return [];
  }
};

const setStartedSchedules = async (data) => {
  try {
    return await Storage.setObject(AsyncStorageKey.startedSchedules, data);
  } catch (e) {
    return false;
  }
};

const saveScheduleID = async (nScheduleID) => {
  try {
    let storedScheduleIDs = await getStartedSchedules();
    alert(storedScheduleIDs);

    if (!storedScheduleIDs.includes(nScheduleID)) {
      storedScheduleIDs.push(nScheduleID);

      setStartedSchedules(storedScheduleIDs);

      console.log('Schedule ID added successfully:', nScheduleID);
    } else {
      console.log('Schedule ID already exists in storage:', nScheduleID);
    }
  } catch (error) {
    console.error('Error saving schedule ID:', error);
  }
};

export default {
    getLineConnectionType,
    setLineConnectionType,
    getVerifyType,
    setVerifyType,
    getRequestCode,
    setRequestCode,
    getUser,
    setUser,
    getPrevUser,
    setPrevUser,
    getPrevUserInfo,
    setPrevUserInfo,
    removeUser,
    getUserInfo,
    setUserInfo,
    getRecoveryUserInfo,
    setRecoveryUserInfo,
    getRecoveryType,
    setRecoveryType,
    removeUserInfo,
    getSchoolPermission,
    setSchoolPermission,
    removeSchoolPermission,

    getTempUser,
    setTempUser,
    getFirstRunState,
    setFirstRunState,
    getAnnouncementState,
    setAnnouncementState,
    getRememberAddrStatus,
    setRememberAddrStatus,
    getAddrInfo,
    seetAddrInfo,
    getLanguage,
    setLanguage,
    getStatusTopupAlert,
    setStatusTopupAlert,
    getPickupDate,
    setPickupDate,
    getStatusTuitionAlert,
    setStatusTuitionAlert,
    getServerStatus,
    setServerStatus,
    getDeviceInfo,
    setDeviceInfo,
    getUserTermInfo,
    setUserTermInfo,
    getEmailOTPSendTime,
    setEmailOTPSendTime,

    getVerifyInfo,
    setVerifyInfo,

    getVerifyFlag,
    setVerifyFlag,

    getUrlsInfo,
    setUrlsInfo,

    getIDItem1,
    setIDItem1,

    getIDItem2,
    setIDItem2,

    getIDItem3,
    setIDItem3,

    getIDItem4,
    setIDItem4,

    getRecoveryUser,
    setRecoveryUser,

    getQuickMenuStudent,
    setQuickMenuStudent,

    getQuickMenuTeacher,
    setQuickMenuTeacher,

    getAllMenuStudent,
    setAllMenuStudent,

    getAllMenuTeacher,
    setAllMenuTeacher,
    getStartedSchedules,
    setStartedSchedules,
    saveScheduleID,
};
