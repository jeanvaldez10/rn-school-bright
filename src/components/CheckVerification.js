import ApiManager from "../managers/ApiManager";
import StorageManager from "../managers/StorageManager";
import {getUniqueId} from "react-native-device-info";
import {removeUser} from '../utils/DBManager';
import { getCurrentLocale } from '../utils/language.utils';


async function checkVerification(schoolId, userId) {
  let emailVerify = false;
  let phoneVerify = false;
  let lineConnect = false;
  let compromise = false;
  let verifyFlag = false;
  let verifyNeed = false;

  const res0 = await ApiManager.checkVerify(schoolId, userId, 'email', 'compromise');
  const result0 = res0.result;
  if (result0.code === 100) {
    compromise = true;
  }

  const res = await ApiManager.checkVerify(schoolId, userId, 'email');
  const {result} = res;
  if (result.code === 100) {
    emailVerify = true;
  }

  const res1 = await ApiManager.checkVerify(schoolId, userId, 'phone');
  const result1 = res1.result;
  if (result1.code === 100) {
    phoneVerify = true;
  }

  const res2 = await ApiManager.checkVerify(schoolId, userId, 'line');
  const result2 = res2.result;
  if (result2.code === 100) {
    lineConnect = true;
  }

  const verifyInfo = {
    phoneVerify,
    emailVerify,
    lineConnect,
    email: result1.email,
    phone: result1.phoneNumber
  }

  await StorageManager.setVerifyInfo(verifyInfo);

  verifyFlag = await StorageManager.getVerifyFlag() ?? false;

  if (compromise) {
    verifyNeed = false;
  } else {
    if (!phoneVerify && !emailVerify && !lineConnect) {
      if (!verifyFlag) {
        verifyNeed = true;
      }
    }
  }

  // verifyNeed = true;
  return {verifyInfo, verifyNeed}

}

async function checkVerificationDevice(token, userId, schoolId) {
  const imei = getUniqueId();
  const deviceInfo = await StorageManager.getDeviceInfo();
  const res = await ApiManager.verifyDeviceCheck(deviceInfo.fcmtoken, userId, schoolId, imei);
  return res.StatusCode === 200;
  // return true;
}

async function logoutUser(loginInfo, deviceInfo) {
  const { fcmtoken: token, imei, system, version: appversion } = deviceInfo;
  const { ID: userId, SchoolId: schoolId } = loginInfo;

  try {
    const result = await ApiManager.removeNotification(token, userId, schoolId, imei, system, appversion);
    if (result.StatusCode != "200") {
      throw new Error("Failed to remove notification");
    }

    await Promise.all([
      StorageManager.removeUser(),
      StorageManager.removeUserInfo(),
      // removeUser(userId),
    ]);

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}



export default {
  checkVerification,
  checkVerificationDevice,
  logoutUser,
}
