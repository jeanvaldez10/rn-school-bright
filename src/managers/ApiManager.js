import serverHttpClient from "../utils/serverHttpClient";
import shopHttpClient from "../utils/shopHttpClient";
import apiHttpClient from "../utils/apiHttpClient";
import academicHttpClient from "../utils/academicHttpClient";
import {apiUrls} from "../constants/ApiUrls";
import StorageManager from "./StorageManager";
import moment from 'moment'
import schoolBusHttpClient from "../utils/schoolBusHttpClient";

let params;

const signin = (userName, password, schoolId, imei, ip) => {
    const params = {
        schoolid: schoolId,
        user: userName,
        pass: password,
        imei: imei,
        ipaddress: ip
    };

    const promise = apiHttpClient.get(apiUrls.signin(), {params: params})
        .then(response => {
            return response.data
        })
        .then((data) => {
            if (data.ID == null || data.ID == 0) {
                return Promise.reject('Failed to login');
            } else {
                StorageManager.setUser(data);
                // setAuth(data);
                return apiHttpClient.get(apiUrls.getPermission(), {params: {school_id: schoolId}});
            }
        })
        .then(response => response.data)
        .then(permission => {
            StorageManager.setSchoolPermission(permission.come2school);
            return Promise.resolve(true);
        });
    return promise;
};

const signinForAdd = (userName, password, schoolId, imei, ip) => {
    params = {
        schoolid: schoolId,
        user: userName,
        pass: password,
        imei: imei,
        ipaddress: ip
    };


    const promise = apiHttpClient.get(apiUrls.signin(), {params: params})
        .then(response => response.data)
        .then((data) => {
            if (data.ID == null || data.ID == 0) {
                return Promise.reject('Failed to login');
            } else {
                StorageManager.setTempUser(data);
                return apiHttpClient.get(apiUrls.getPermission(), {params: {school_id: schoolId}});
            }
        })
        .then(response => response.data)
        .then(permission => {
            StorageManager.setSchoolPermission(permission.come2school);
            return Promise.resolve(true);
        });
    return promise;
};

const forgotPassword = (schoolID, StudentCode) => {
    const promise = apiHttpClient.get(apiUrls.forgotPwdUrl(schoolID, StudentCode), {})
        .then(response => response.data)
        .then((data) => {
            return data;
        });
    return promise;
}

const getUserInfo = (userId, schoolId) => {
    params = {
        schoolid: schoolId,
        userid: userId,
    };
    const promise = apiHttpClient.get(apiUrls.getUserInfo(userId), {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            if (array.length == 0) {
                return Promise.reject('failed to get user info');
            } else {
                let userInfo = array[0];
                userInfo.ID = userId;
                userInfo.SchoolID = schoolId;
                StorageManager.setUserInfo(userInfo);
                return Promise.resolve(userInfo);
            }
        })
    return promise;
}

const getUserTermInfo = (schoolid, sid) => {
    const promise = apiHttpClient.get(apiUrls.getUserTermInfoUrl(schoolid, sid), {})
        .then(response => response.data)
        .then((data) => {
            return data;
        })
    return promise;
}

const getUserTermInfoByYear = (schoolid, sid, year) => {
    const promise = apiHttpClient.get(apiUrls.getUserTermInfoByYearUrl(schoolid, sid, year), {})
        .then(response => response.data)
        .then((data) => {
            return data;
        })
    return promise;
}

const getUserSchoolYear = (schoolid, sid) => {
    const promise = apiHttpClient.get(apiUrls.getUserSchoolYearUrl(schoolid, sid), {})
        .then(response => response.data)
        .then((data) => {
            return data;
        })
    return promise;
}

const getQRCode = (userId, schoolId, resolution) => {
    params = {
        schoolid: schoolId,
    };

    let width = 450;
    let height = 160;

    if (resolution === 'ldpi') {
        width = 450;
        height = 160;
    } else if (resolution === 'mdpi') {
        width = 550;
        height = 190;
    } else if (resolution === 'hdpi') {
        width = 650;
        height = 175;
    } else if (resolution === 'xhdpi') {
        width = 500;
        height = 175;
    } else if (resolution === 'xxhdpi') {
        width = 300;
        height = 100;
    } else if (resolution === 'xxxhdpi') {
        width = 950;
        height = 310;
    }

    const promise = apiHttpClient.get(apiUrls.getQRCodeImage(userId, resolution, width, height), {params: params})
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise;
}

const getCome2School = (userId, schoolId, startDate, endDate, status) => {
    const strStartDate = moment(startDate).format('MM/DD/YYYY');
    const strEndDate = moment(endDate).format('MM/DD/YYYY');

    let params = {
        userid: userId,
        schoolId: schoolId,
        dstart: strStartDate,
        dend: strEndDate,
        status: '',
    };
    if (status >= 0) {
        params.status = status
    }
    const userid = userId;
    const dstart = strStartDate;
    const dend = strEndDate;
    const schoolid = schoolId
    const promise = apiHttpClient.get(apiUrls.getCome2School(userid, dstart, dend, schoolid), {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getHealthProfile = (userId, schoolId) => {
    params = {
        userid: userId,
        schoolid: schoolId,
    };

    const promise = apiHttpClient.get(apiUrls.getHealthProfile(), {params: params})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            if (array.length == 0) {
                return Promise.reject('failed to get user info');
            } else {
                return Promise.resolve(array[0]);
            }
        });
    return promise;
}

const getHealthTemperatureData = (userId, schoolId, date) => {
    const _date = moment(date).format('MM/DD/YYYY');
    const promise = apiHttpClient.get(apiUrls.getHealthTemperatureDataUrl(userId, schoolId, _date))
        .then(response => response.data)
        .then((data) => {
            return data;
        });
    return promise;
}


const getTemperatureList = (userId, schoolId, date) => {
    const _date = moment(date).format('MM/DD/YYYY');

    params = {
        userid: userId,
        schoolid: schoolId,
        date: _date,
    };

    const promise = apiHttpClient.get(apiUrls.getTemperatureList(), {params: params})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getTimeTableList = (userId, userType, DayOfWeek, termId) => {
    const promise = apiHttpClient.get(apiUrls.getTimeTableList(userId, userType, DayOfWeek, termId), {})
        .then(response => response.data)
        .then((data) => {
            return data;
        });
    return promise;
}

const getTimeTableDetail = (id, scheduleId, isTeacher, date) => {
    const _date = moment(date).format('MM/DD/YYYY');

    let params = {
        ScheduleId: scheduleId,
        day: _date,
    };

    if (isTeacher) {
        params['teacherid'] = id;
    } else {
        params['studentid'] = id;
    }

    const promise = apiHttpClient.get(apiUrls.getTimeTableDetail(), {params: params})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            if (array.length == 0) {
                return Promise.reject('failed to get user info');
            } else {
                return Promise.resolve(array[0]);
            }
        });
    return promise;
}

const getHomeworkList = (userId, schoolId, page) => {
    const promise = apiHttpClient.get(apiUrls.getHomeworkList(userId, schoolId, page), {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getNotificationDetail = (userId, schoolId, messageId) => {
    const promise = apiHttpClient.get(apiUrls.getMessageWithId(userId, schoolId, messageId), {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            if (array.length == 0) {
                return Promise.reject('failed to get user info');
            } else {
                return Promise.resolve(array[0]);
            }
        });
    return promise;
}

const getStudentClassLevel = (schoolId) => {
    const promise = apiHttpClient.get(apiUrls.getStudentClassLevel(schoolId), {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getSchoolClassroom = (schoolId, levelId) => {
    const promise = apiHttpClient.get(apiUrls.getSchoolClassroom(schoolId, levelId), {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getStudentInClassTAFlag = (schoolId, classRoomId, userId) => {
    const promise = apiHttpClient.get(apiUrls.getStudentInClassTAFlag(schoolId, classRoomId, userId), {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getStudentInClassForClassAttendance = (schoolId, classRoomId, subjectId, userId, date) => {
    const url = apiUrls.getStudentInClassForClassAttendance(schoolId, classRoomId, subjectId, userId, date.format('MM/DD/YYYY'));
    const promise = apiHttpClient.get(url, {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getStudentInClassForClassAttendanceCopy = (schoolId, levelid, subjectId, teacherId) => {
    const url = apiUrls.getStudentInClassForClassAttendanceCopyUrl(schoolId, levelid, subjectId, teacherId);
    const promise = apiHttpClient.get(url, {})
        .then(response => response.data)
        .then((data) => {
            return data;
        });
    return promise;
}

const getStudentInClassroom = (schoolId, classRoomId) => {
    const promise = apiHttpClient.get(apiUrls.getStudentInClassroom(schoolId, classRoomId), {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getStudentForBehavior = (ClassId, schoolid) => {
    const promise = apiHttpClient.get(apiUrls.getStudentListForBehaviorUrl(ClassId, schoolid), {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getSubject = (schoolId, classRoomId) => {
    const promise = apiHttpClient.get(apiUrls.getSubject(schoolId, classRoomId), {})
        .then(response => response.data)
        .then((data) => {
            if (data.Status && data.Status === -1) {
                return Promise.resolve([]);
            } else {
                const array = Object.values(data);
                return Promise.resolve(array);
            }
        });
    return promise;
}

const getSubjectWithDate = (schoolId, classRoomId, date) => {
    const _date = moment(date).format('MM/DD/YYYY')
    const promise = apiHttpClient.get(apiUrls.getSubjectWithDateUrl(schoolId, classRoomId, _date), {})
        .then(response => response.data)
        .then((data) => {
            if (data.Status && data.Status === -1) {
                return Promise.resolve([]);
            } else {
                const array = Object.values(data);
                return Promise.resolve(array);
            }
        });
    return promise;
}

const updateStudentStatusFlag = (schoolId, userId, json) => {
    const promise = apiHttpClient.post(apiUrls.updateStudentStatusFlag(schoolId, userId), json)
        .then(response => response.data)
        .then((data) => {
            const status = parseInt(data.Status);
            return Promise.resolve(status === 1)
        });
    return promise;
}

const updateStudentStatus = (schoolId, subjectId, userId, date, json) => {
    const _date = moment(date).format('MM/DD/YYYY');
    const promise = apiHttpClient.post(apiUrls.updateStudentStatus(schoolId, subjectId, userId, _date), json)
        .then(response => response.data)
        .then((data) => {
            const status = parseInt(data.Status);
            return Promise.resolve(status === 1)
        });
    return promise;
}

const getQRCodeDataWithID = (schoolId, code, lang = 'th') => {
    const promise = apiHttpClient.get(apiUrls.getQRCodeDataWithID(schoolId, code), {})
        .then(response => response.data)
        .then((data) => {
            const code = data.resCode ?? 0;
            const message = data.resMessage ?? '';

            let dataModels = [];
            if (data.resDesc) {
                const json = JSON.parse(data.resDesc);
                let name, lastname, classroom;
                if (lang === 'th') {
                    name = json.name;
                    lastname = json.lastname;
                    classroom = json.classroom;
                } else {
                    name = json.nameEN ?? json.name;
                    lastname = json.lastnameEN ?? json.lastname;
                    classroom = json.classroomEN ?? json.classroom;
                }

                const picture = json.picture;
                const studentId = json.student_id;

                dataModels.push({name, lastname, picture, classroom, studentId});
            }

            return Promise.resolve({code, message, qrcodeDataModels: dataModels});
        });
    return promise;
}

const checkoutTime = (schoolId, userId, qrcode, status) => {
    const promise = apiHttpClient.get(apiUrls.checkoutTime(schoolId, userId, qrcode, status), {})
        .then(response => response.data)
        .then((data) => {
            const code = data.resCode ?? 0;
            const message = data.resMessage ?? '';

            let dataModels = [];
            if (data.resDesc) {
                const name = data.resDesc.name;
                const lastname = data.resDesc.lastname;
                const picture = data.resDesc.picture;
                const classroom = data.resDesc.classroom;

                dataModels.push({name, lastname, picture, classroom});
            }
            return Promise.resolve({code, message, qrcodeDataModels: dataModels});
        });
    return promise;
}

const checkOnTime = (schoolId, userId, qrcode, status) => {
    const promise = apiHttpClient.get(apiUrls.checkOntime(schoolId, userId, qrcode, status), {})
        .then(response => response.data)
        .then((data) => {
            const code = data.resCode ?? 0;
            const message = data.resMessage ?? '';

            let dataModels = [];
            if (data.resDesc) {
                const name = data.resDesc.name;
                const lastname = data.resDesc.lastname;
                const picture = data.resDesc.picture;
                const classroom = data.resDesc.classroom;

                dataModels.push({name, lastname, picture, classroom});
            }
            return Promise.resolve({code, message, qrcodeDataModels: dataModels});
        });
    return promise;
}

const checkLateTime = (schoolId, userId, qrcode, status) => {
    const promise = apiHttpClient.get(apiUrls.checkLateTime(schoolId, userId, qrcode, status), {})
        .then(response => response.data)
        .then((data) => {
            const code = data.resCode ?? 0;
            const message = data.resMessage ?? '';

            let dataModels = [];
            if (data.resDesc) {
                const name = data.resDesc.name;
                const lastname = data.resDesc.lastname;
                const picture = data.resDesc.picture;
                const classroom = data.resDesc.classroom;

                dataModels.push({name, lastname, picture, classroom});
            }
            return Promise.resolve({code, message, qrcodeDataModels: dataModels});
        });
    return promise;
}

const getAddBehaviorScoreList = (schoolId) => {
    const promise = apiHttpClient.get(apiUrls.getAddBehaviorScoreList(schoolId), {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getReduceBehaviorScoreList = (schoolId) => {
    const promise = apiHttpClient.get(apiUrls.getReduceBehaviorScoreList(schoolId), {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const updateStudentBehaviorScore = (schoolId, teacherId, json) => {
    const promise = apiHttpClient.post(apiUrls.updateStudentBehaviorScore(schoolId, teacherId), json)
        .then(response => {
            return response.data
        })
        .then((data) => {
            const status = parseInt(data.status);
            return Promise.resolve(status);
        });
    return promise;
}

const updateStudentBehaviorScoreV2 = (schoolId, teacherId, json) => {
    const promise = apiHttpClient.post(apiUrls.updateStudentBehaviorScoreV2(schoolId, teacherId), json)
        .then(response => {
            return response.data
        })
        .then((data) => {
            const status = parseInt(data.status);
            return Promise.resolve(status);
        });
    return promise;
}

const sendHomework = (schoolId, levelArray, userArray, sendType, startDate, endDate, alertDate, alertTime, homeworkDetail, planeId, teacherId, imageFiles, attachFiles) => {
    const params = {
        schoolid: schoolId,
        arraylevel: levelArray,
        arrayuser: userArray,
        sendtype: sendType,
        daystart: startDate,
        dayend: endDate,
        daynotification: alertDate,
        scheduled_time: alertTime,
        homeworkdetail: homeworkDetail,
        planeid: planeId,
        teacherid: teacherId,
    }

    const promise = apiHttpClient.post(apiUrls.sendHomework(), params)
        .then(response => response.data)
        .then((data) => {
            const homeworkId = parseInt(data.homeworkid);
            return Promise.resolve(homeworkId);
        });
    return promise;
}

const getSubjectIndividualHomework = (schoolId, plane) => {
    const promise = apiHttpClient.get(apiUrls.getSubjectIndividualHomework(schoolId, plane), {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const sendBroadcast = (schoolId, sendTimeType, sendType, sendGroup, description, level2id, studentId, employeesId, scheduleDate, userId, newsheader, files, reply) => {
    const params = {
        schoolid: schoolId,
        sendtimetype: sendTimeType,
        sendtype: sendType,
        sendgroup: sendGroup,
        newsdetail: description,
        level2id: level2id,
        studentid: studentId,
        employeesid: employeesId,
        daysend: moment().format("MM/DD/YYYY"),
        scheduled_time: scheduleDate,
        timesend: moment().format("YYYY-MM-DDTHH:mm"),
        useradd: userId,
        ActionType: reply,
        newsheader: newsheader,
        fileUploads: files,
    };


    const promise = apiHttpClient.post(apiUrls.sendNews(), params)
        .then(response => response.data)
        .then((data) => {
            const newsId = parseInt(data.newsid);
            return Promise.resolve(newsId);
        });
    return promise
}

const getProvinceList = (schoolId) => {
    return apiHttpClient.get(apiUrls.getProvinceList(schoolId), {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        })
}

const getDistrictList = (schoolId, provinceId) => {
    return apiHttpClient.get(apiUrls.getDistrictList(schoolId, provinceId), {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        })
}

const getSubDistrictList = (schoolId, districtId) => {
    return apiHttpClient.get(apiUrls.getSubDistrictList(schoolId, districtId), {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        })
}

const getLeavePositionOfUser = (userId) => {
    return apiHttpClient.get(apiUrls.getLeavePositionOfUser(userId), {})
        .then(response => response.data)
        .then((data) => {
            const position = String(data);
            return Promise.resolve(position);
        })
}

const getLeavePositionOfStudent = (userId) => {
    return apiHttpClient.get(apiUrls.getLeavePositionOfStudentUrl(userId), {})
        .then(response => response.data)
        .then((data) => {
            return data;
        })
}

const sendLeaveData = (senderId, leaveType, dayStart, dayEnd, description, house, district, amphur, province, phonenumber, season, attachImg) => {
    const params = {
        UserId: senderId,
        LeaveTypeID: leaveType,
        DayStart: moment(dayStart).format('MM/DD/YYYY'),
        DayEnd: moment(dayEnd).format('MM/DD/YYYY'),
        Description: description,
        HomeNumber: house,
        Road: district,
        Tumbon: '',
        Aumpher: amphur,
        Province: province,
        Phone: phonenumber,
        SubmitDate: moment().format('MM/DD/YYYY'),
        Season: season,
        fileUploads: attachImg,
    };

    const promise = apiHttpClient.post(apiUrls.sendLeaveData(), params)
        .then(response => response.data)
        .then((data) => {
            // return data;
            const letterId = parseInt(data.letterId);
            const status = data.letterStatus ? String(data.letterStatus) : '';
            return Promise.resolve(status === 'Success' || status === '');
        });
    return promise
}

const getSchoolCalendarOnDate = (userId, date, schoolId) => {
    const _date = moment(date).format('MM/DD/YYYY');
    const params = {};

    const promise = apiHttpClient.get(apiUrls.getSchoolCalendarOnDate(userId, _date, schoolId), params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise
}

const getSchoolCalendarDates = (userId, date, schoolId) => {
    const _date = moment(date).format('MM/DD/YYYY');
    const params = {};
    const promise = apiHttpClient.get(apiUrls.getSchoolCalendarDates(userId, _date, schoolId), params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise
}

const getLeaveRequestList = (userId, page) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.getLeaveRequestList(userId, page), params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise
}

const getLeaveRequestDetail = (userId, messageId) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.getLeaveRequestDetail(userId, messageId), params)
        .then(response => response.data)
        .then((data) => {

            const array = Object.values(data);
            if (array.length == 0) {
                return Promise.reject('failed to get detail');
            } else {
                return Promise.resolve(array[0]);
            }
        });
    return promise
}

const updateLeaveRequestStatus = (userId, messageId, status, schoolId, message) => {

    const params = {};
    const promise = apiHttpClient.get(apiUrls.updateLeaveRequestStatus(userId, messageId, status, schoolId, message), params)
        .then(response => response.data)
        .then((data) => {
            const result = String(data);
            if (result.toUpperCase() === 'SUCCESS') {
                return Promise.resolve(result);
            } else {
                return Promise.reject('failed to update');
            }
        });
    return promise
}

const getNewsMessageList = (userId, page, schoolId) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.getNewsMessageList(userId, page, schoolId), params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise
}

const readNewsMessage = (userId, messageId, schoolId, lang) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.readNewsMessage(userId, messageId, schoolId, lang), params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise
}

const readSystemMessage = (userId, messageId) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.readSystemMessageUrl(userId, messageId), params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise
}

const readAllMessage = (userId) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.readAllMessage(userId), params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise
}

const getShopList = (schoolId) => {
    const params = {};
    const promise = shopHttpClient.get(apiUrls.getShopList(schoolId), params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise
}

const getProductList = (schoolId, shopId) => {
    const params = {};
    const promise = shopHttpClient.get(apiUrls.getProductList(schoolId, shopId), params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise
}

const getMessageList = (userId, page, status, schoolId, lang) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.getMessageList(userId, page, status, schoolId, lang), params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise
}

const getCountUnreadMessage = (userId) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.getCountUnreadMessage(userId), params)
        .then(response => response.data)
        .then((data) => {
            const count = parseInt(data);
            return Promise.resolve(count);
        });
    return promise
}
const getHomeTotalUnreadCount = (userId) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.getHomeTotalUnreadCountUrl(userId), params)
        .then(response => response.data)
        .then((data) => {
            return data.UnRead;
        });
    return promise
}


const getPaymentReceiptWithPinCode = (userId, schoolId, shopId, productList, pinHash) => {
    const data1 = {User_Id: userId, Pin: pinHash};
    const data2 = productList.map(product => {
        return {product_id: product.product_id, amount: product.amount};
    })
    const params = {PinCode: data1, productdatas: data2};

    const promise = shopHttpClient.post(apiUrls.getPaymentReceiptWithPinCode(schoolId, shopId), params)
        .then((response) => {
            return response.data
        })
        .then((data) => {

            return Promise.resolve(data);
        });
    return promise;
}

const getHistoryStudentStatusList = (schoolId, classroomId, date) => {
    const _date = moment(date).format('MM/DD/YYYY');
    const params = {};
    const url = apiUrls.getHistoryStudentStatusList(schoolId, classroomId, _date);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise;
}

const getPlanInfo = (teacherid, termid, levelid) => {
    const url = apiUrls.getPlanInfoUrl(teacherid, termid, levelid);
    const promise = apiHttpClient.get(url, {})
        .then(response => response.data)
        .then((data) => {

            return data;
        });
    return promise;
}


const getPersonalFlagHistory = (schoolId, studentId, date) => {
    const _date = moment(date).format('MM/DD/YYYY');
    const params = {};
    const url = apiUrls.getPersonalFlagHistory(schoolId, studentId, _date);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            const studentName = data.Student_name;
            const array = Object.values(data.scanLists);
            return Promise.resolve(array);
        });
    return promise;
}

const getBehaviorScoreHistoryInDateRange = (schoolId, classroomId, startDate, endDate, type) => {
    const _startDate = moment(startDate).format('MM/DD/YYYY');
    const _endDate = moment(endDate).format('MM/DD/YYYY');
    const url = apiUrls.getBehaviorScoreHistoryInDateRange(schoolId, classroomId, _startDate, _endDate, type);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getBehaviorScoreHistory = (userid, schoolId, termId) => {
    const url = apiUrls.getBehaviorScoreHistoryURL(userid, schoolId, termId);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return data;
            // const array = Object.values(data);
            // return Promise.resolve(array);
        });
    return promise;
}

const getHomeworkReportList = (schoolId, page) => {
    const url = apiUrls.getHomeworkReportList(schoolId, page);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getHomeworkReportDetail = (schoolId, homeworkId) => {
    const url = apiUrls.getHomeworkReportDetail(schoolId, homeworkId);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise;
}

const getHomeworkReportRecieverList = (schoolId, homeworkId, page, status) => {
    const url = apiUrls.getHomeworkReportRecieverList(schoolId, homeworkId, page, status);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getBroadcastExcuteReportList = (datetype, page, schoolID) => {
    const url = apiUrls.getBroadcastExcuteReportListUrl(datetype, page, schoolID);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getBroadcastReportList = (datetype, page, userid) => {
    const url = apiUrls.getBroadcastReportList(datetype, page, userid);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getBroadcastReportDetail = (schoolId, newsId, lang = 'th') => {
    const url = apiUrls.getBroadcastReportDetail(schoolId, newsId, lang);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise;
}

const getBroadcastReportRecieverList = (schoolId, newsId, page, status) => {
    const url = apiUrls.getBroadcastReportRecieverList(schoolId, newsId, page, status);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getUncheckNameList = (schoolId, date) => {
    const _date = moment(date).format('MM/DD/YYYY');
    const url = apiUrls.getUncheckNameList(schoolId, _date);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getUncheckNameDates = (schoolId, date) => {
    const _date = moment(date).format('MM/DD/YYYY');
    const url = apiUrls.getUncheckNameDates(schoolId, _date);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getPurchaseReportDateList = (userId, date) => {
    const _date = moment(date).format('MM/DD/YYYY');
    const url = apiUrls.getPurchaseReportDateList(userId, _date);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getPurchaseReportItemList = (userId, schoolId, date) => {
    const _date = moment(date).format('MM/DD/YYYY');
    // const url = apiUrls.getPurchaseReportItemList(userId, schoolId, _date);
    // const promise = apiHttpClient.get(url, params)
    //                         .then(response => response.data)
    //                         .then((data) => {
    //                             const array = Object.values(data);
    //                             return Promise.resolve(array);
    //                         });

    const url = apiUrls.getPurchaseReportHistoryUrl(userId, schoolId, _date, _date);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return data;
        });

    return promise;
}

const getPurchaseReportHistory = (userId, schoolId, sdate, edate) => {
    const s_date = moment(sdate).format('MM/DD/YYYY');
    const e_date = moment(edate).format('MM/DD/YYYY');

    const url = apiUrls.getPurchaseReportHistoryUrl(userId, schoolId, s_date, e_date);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return data;
            // const array = Object.values(data);
            // return Promise.resolve(array);
        });
    return promise;
}

const getTopupReportDateList = (userId, schoolId, date) => {
    const _date = moment(date).format('MM/DD/YYYY');
    const url = apiUrls.getTopupReportDateList(userId, schoolId, _date);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getTopupReportList = (userId, schoolId, date) => {
    const _date = moment(date).format('MM/DD/YYYY');
    const url = apiUrls.getTopupReportList(userId, schoolId, _date);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getLeaveReportList = (userId, schoolId) => {
    const url = apiUrls.getLeaveReportList(userId, schoolId);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getLeaveReportListWithDate = (userId, ddate, edate) => {
    const url = apiUrls.getLeaveReportListWithDateUrl(userId, moment(ddate).format('MM/DD/YYYY'), moment(edate).format('MM/DD/YYYY'));
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getYearTermData = (userId, schoolId) => {
    const url = apiUrls.getYearTermData(userId, schoolId);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getAttendanceSchoolReportGraph = (schoolId, date) => {
    const _date = moment(date).format('MM/DD/YYYY');
    const url = apiUrls.getAttendanceSchoolReportGraph(schoolId, _date);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            if (array.length > 0) {
                return Promise.resolve(array[0]);
            } else {
                return Promise.resolve({});
            }
        });
    return promise;
}

const getAttendanceSchoolDetailClass = (schoolId, date) => {
    const _date = moment(date).format('MM/DD/YYYY');
    const url = apiUrls.getAttendanceSchoolDetailClass(schoolId, _date);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getAttendanceSchoolDetailDepartment = (schoolId, date) => {
    const _date = moment(date).format('MM/DD/YYYY');
    const url = apiUrls.getAttendanceSchoolDetailDepartment(schoolId, _date);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getAttendanceSchoolDetailStudent = (schoolId, date, levelId, lang = 'th') => {
    const _date = moment(date).format('MM/DD/YYYY');
    const url = apiUrls.getAttendanceSchoolDetailStudent(schoolId, _date, levelId, lang);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getAttendanceSchoolDetailEmployee = (schoolId, date, departmentId, lang = 'th') => {
    const _date = moment(date).format('MM/DD/YYYY');
    const url = apiUrls.getAttendanceSchoolDetailEmployee(schoolId, _date, departmentId, lang);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getReportTopUpDate = (schoolId, startDate, endDate) => {
    const _start = moment(startDate).format('MM/DD/YYYY');
    const _end = moment(endDate).format('MM/DD/YYYY');
    const url = apiUrls.getReportTopUpDate(schoolId, _start, _end);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getPurchaseReportDate = (schoolId, startDate, endDate) => {
    const _start = moment(startDate).format('MM/DD/YYYY');
    const _end = moment(endDate).format('MM/DD/YYYY');
    const url = apiUrls.getPurchaseReportDate(schoolId, _start, _end);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
};
//NEW
const getTeacherAll = (schoolID) => {
    const url = apiUrls.getAllTeacherUrl(schoolID);
    const promise = apiHttpClient.get(url, {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getEmployeeAll = (schoolID) => {
    const url = apiUrls.getAllEmployeeUrl(schoolID);
    const promise = apiHttpClient.get(url, {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getCheckPassword = (pinCode, userID) => {

    const params = {
        Pin: pinCode.toUpperCase(),
        User_Id: userID,
    };

    const promise = shopHttpClient.post(apiUrls.getCheckPasswordPOST(), params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise
}

const getResetPassword = (pinCode, newpwd, userID, schoolId) => {
    const params = {
        User_Id: userID,
        PinNew: newpwd,
        PinOld: pinCode.toUpperCase(),
    };


    const promise = shopHttpClient.post(apiUrls.getResetPasswordPOST(), params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise
}

const getAcademicGradeDetailInfo = (schoolid, userid, year, term, type, lang) => {
    const url = apiUrls.getAcademicGradeDetailInfoUrl(schoolid, userid, year, term, type, lang);
    const promise = academicHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return data
        }).catch(error => {
            console.log("...:", error)
        });
    ;
    return promise;
};

const getYearSelectGradeAcademic = (schoolid, lang) => {
    const _lang = lang == 'en' ? 'eng' : 'thai';
    const url = apiUrls.getYearSelectGradeAcademicUrl(schoolid, _lang);
    const promise = academicHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return data
        }).catch(error => {
            console.log("...:", error)
        });
    ;
    return promise;
};
const getTermSelectGradeAcademic = (schoolid, year, userid, lang) => {
    const _lang = lang == 'en' ? 'eng' : 'thai';
    const url = apiUrls.getTermSelectGradeAcademicUrl(schoolid, year, userid, _lang);
    const promise = academicHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return data
        }).catch(error => {
            console.log("...:", error)
        });
    ;
    return promise;
};

const getStatementFee = (userid, schoolid) => {
    const url = apiUrls.getStatementFeeUrl(userid, schoolid);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return data
        });
    return promise;
};

const getPaymentFee = (userid, schoolid, invoiceid) => {
    const url = apiUrls.getPaymentFeeUrl(userid, schoolid, invoiceid);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return data
        });
    return promise;
};
//ONLINE
const getOnlineSubjectList = (schoolId, teacherID, year, termId, levelId) => {
    const url = apiUrls.getOnlineListSubjectUrl(schoolId, teacherID, year, termId, levelId);

    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data.data);
            return Promise.resolve(array);
        });
    return promise;
}

const getOnlineClassList = (schoolID, teacherID, termID, planeID, levelID) => {
    const url = apiUrls.getOnlineClassListUrl(schoolID, teacherID, termID, planeID, levelID);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data.data);
            return Promise.resolve(array);
        });
    return promise;
}

const getOnlineShareTeacherList = (schoolID, teacherID, termID, planeID, levelID) => {
    const url = apiUrls.getOnlineShareTeacherListUrl(schoolID, teacherID, termID, planeID, levelID);

    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {

            const array = Object.values(data.data);
            return Promise.resolve(array);
        });
    return promise;
}

const getOnlineGroupList = (schoolID, teacherID, termID, planeID, levelID) => {
    const url = apiUrls.getOnlineGroupListUrl(schoolID, teacherID, termID, planeID, levelID);

    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data.data);
            return Promise.resolve(array);
        });
    return promise;
}

const createOnlineGroup = (TermID, LevelID, PlaneID, TeacherID, SchoolID, TitleName, ShareRoomID, ShareTeacherID, GroupID) => {
    const params = {
        TermID: TermID,
        LevelID: LevelID,
        PlaneID: PlaneID,
        TeacherID: TeacherID,
        SchoolID: SchoolID,
        TitleName: TitleName,
        ShareRoomID: ShareRoomID,
        ShareTeacherID: ShareTeacherID,
        GroupID: GroupID
    }

    const promise = apiHttpClient.post(apiUrls.createOnlineGroupUrl(), params)
        .then(response => response.data)
        .then((data) => {
            const resData = Object.values(data);
            return Promise.resolve(resData);
        });
    return promise;
}

const OnlineHomeworkAndLessonList = (schoolID, teacherID, termID, planeID, levelID) => {
    const url = apiUrls.OnlineHomeworkAndLessonListUrl(schoolID, teacherID, termID, planeID, levelID);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            // const array = Object.values(data.data);
            // return Promise.resolve(array);
            return data;
        });
    return promise;
}

const OnlineHomeworkAndLessonListSecond = (schoolID, groupId) => {
    const url = apiUrls.OnlineHomeworkAndLessonListSecondUrl(schoolID, groupId);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return data;
        });
    return promise;
}


const getClassOnlie = (schoolID, GroupID) => {
    const url = apiUrls.getClassOnlieUrl(schoolID, GroupID);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            // const array = Object.values(data.data);
            // return Promise.resolve(array);
            return data;
        });
    return promise;
}

const OnlineGetHomework = (schoolID, homeworkId) => {
    const url = apiUrls.OnlineGetHomeworkUrl(schoolID, homeworkId);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            // const array = Object.values(data.data);
            // return Promise.resolve(array);
            return data;
        });
    return promise;
}


const createOnlineHomework = (GroupID, HomeworkID, PlaneID, TitleName, Detail, Link, DeadlineDate, MaxScore, TeacherID, SchoolID, SelectedRoom, SelectedStudent, DisplayType, AssignType, DisplayDate, AttachFile) => {
    const params = {
        GroupID: GroupID,
        HomeworkID: HomeworkID,
        PlaneID: PlaneID,
        TitleName: TitleName,
        Detail: Detail,
        Link: Link,
        DeadlineDate: DeadlineDate,
        MaxScore: MaxScore,
        TeacherID: TeacherID,
        SchoolID: SchoolID,
        SelectedRoom: SelectedRoom,
        SelectedStudent: SelectedStudent,
        DisplayType: DisplayType,
        AssignType: AssignType,
        DisplayDate: DisplayDate,
        AttachFile: AttachFile,
        DeleteAttachFile: []
    }


    const promise = apiHttpClient.post(apiUrls.createOnlineHomeworkUrl(), params)
        .then(response => response.data)
        .then((data) => {
            return data;
            // const resData = Object.values(data);
            // return Promise.resolve(resData);
        });
    return promise;
}

const createOnlineLesson = (GroupID, LessonID, PlaneID, TitleName, Detail, Link, TeacherID, SchoolID, SelectedRoom, SelectedStudent, DisplayType, AssignType, DisplayDate, AttachFile) => {
    const params = {
        GroupID: GroupID,
        LessonID: LessonID,
        PlaneID: PlaneID,
        TitleName: TitleName,
        Detail: Detail,
        Link: Link,
        TeacherID: TeacherID,
        SchoolID: SchoolID,
        SelectedRoom: SelectedRoom,
        SelectedStudent: SelectedStudent,
        DisplayType: DisplayType,
        AssignType: AssignType,
        DisplayDate: DisplayDate,
        AttachFile: AttachFile,
        DeleteAttachFile: []
    }

    const promise = apiHttpClient.post(apiUrls.createOnlineLessonUrl(), params)
        .then(response => response.data)
        .then((data) => {
            return data;
            // const resData = Object.values(data);
            // return Promise.resolve(resData);
        });
    return promise;
}


const getHistoryStudentStatusListForSubject = (userid, date, subjectid, schoolID, classroomId) => {
    const _date = moment(date).format('MM/DD/YYYY');
    const params = {};
    const url = apiUrls.getHistoryStudentStatusListForSubjectUrl(userid, _date, subjectid, schoolID, classroomId);

    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {

            return Promise.resolve(data);
        });
    return promise;
}

const getTeacherReportAttendanceSubjectStatusList = (schoolId, classroomId, date, scheduleID) => {
    const _date = moment(date).format('MM/DD/YYYY');
    const params = {};

    const url = apiUrls.getTeacherReportAttendanceSubjectStatusListUrl(schoolId, classroomId, _date, scheduleID);

    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {

            return Promise.resolve(data);
        });
    return promise;
}

const getTeacherReportAttendanceSubjectStatusHistory = (user_id, selectDate, subject_id, school_id) => {
    const _date = moment(selectDate).format('MM/DD/YYYY');
    const params = {};

    const url = apiUrls.getTeacherReportAttendanceSubjectStatusHistoryUrl(user_id, _date, subject_id, school_id);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise;
}

const getStudentInfo = (schoolID, studentID, termID) => {
    const params = {};
    const url = apiUrls.getStudentInfoUrl(schoolID, studentID, termID);

    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise;
}

const getCanUpdateStatus = (schoolID, userID, userType) => {
    const params = {};
    const url = apiUrls.getCanUpdateStatusUrl(schoolID, userID, userType);

    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise;
}

const getEmployeeInfo = (schoolID, employeeID, lang = 'th') => {
    const params = {};
    const url = apiUrls.getEmployeeInfoUrl(schoolID, employeeID, lang);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise;
}

const getStudentRequestHistory = (schoolID, userID, lang = 'th') => {
    const params = {};
    const url = apiUrls.getStudentRequestHistoryUrl(schoolID, userID, lang);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise;
}


const getAnnouncementInfo = (userId, schoolId) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.getAnnouncementInfoUrl(userId, schoolId), params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise
}

const getListCheckHomework = (schoolID, HomeworkID) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.getListCheckHomeworkUrl(schoolID, HomeworkID), params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise
}

const getStudentHomeWork = (schoolID, HomeworkID, studentID) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.getStudentHomeWorkUrl(schoolID, HomeworkID, studentID), params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise
}

const getLessonDetail = (schoolID, lessonID) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.getLessonDetailUrl(schoolID, lessonID), params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise
}

const saveHomeWorkScore = (SchoolID, HomeWorkID, TeacherID, StudentID, Score) => {
    const params = {
        SchoolID: SchoolID,
        HomeWorkID: HomeWorkID,
        TeacherID: TeacherID,
        StudentID: StudentID,
        Score: Score,
    };
    const promise = apiHttpClient.post(apiUrls.saveHomeWorkScoreUrl(), params)
        .then(response => response.data)
        .then((data) => {
            return data;
        });
    return promise
}

const getReportTeacherForBehaviorStudentList = (ClassId, schoolid, termId) => {
    const promise = apiHttpClient.get(apiUrls.getReportTeacherForBehaviorStudentListUrl(ClassId, schoolid, termId), {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const getSmsGroup = (schoolId) => {
    const promise = apiHttpClient.get(apiUrls.getSmsGroupUrl(schoolId), {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data.NewsGroup);
            return Promise.resolve(array);
        });
    return promise;
}

const getSmsResponseTypeList = (schoolId, lang = 'th') => {
    const promise = apiHttpClient.get(apiUrls.getSmsGroupUrl(schoolId, lang), {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data.ResponseType);
            return Promise.resolve(array);
        });
    return promise;
}


const getOnlineSubjectListForStudent = (schoolid, studentid, term, level, level2) => {
    const url = apiUrls.getOnlineSubjectListForStudentUrl(schoolid, studentid, term, level, level2);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data.data);
            return Promise.resolve(array);
        });
    return promise;
}

const getOnlineLessonListForStudent = (schoolid, studentid, term, level, level2, subjectId) => {
    const url = apiUrls.getOnlineLessonListForStudentUrl(schoolid, studentid, term, level, level2, subjectId);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            // const array = Object.values(data.data);
            // return Promise.resolve(array);
            return data.data;
        });
    return promise;
}

const getOnlineHomeworkForStudent = (schoolid, studentid, workId) => {
    const url = apiUrls.getOnlineHomeworkForStudentUrl(schoolid, studentid, workId);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return data.data;
        });
    return promise;
}
const getOnlineLearningForStudent = (schoolid, studentid, learnId) => {
    const url = apiUrls.getOnlineLearningForStudentUrl(schoolid, studentid, learnId);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return data.data;
        });
    return promise;
}

const getOnlineStudentWorks = (schoolid, studentid, workId) => {
    const url = apiUrls.getOnlineStudentWorksUrl(schoolid, studentid, workId);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return data.data;
        });
    return promise;
}
const saveWorkForStudent = (SchoolID, HomeWorkID, StudentID, Link, Remark, AttachFile, DeleteFile) => {
    const params = {
        SchoolID: SchoolID,
        HomeWorkID: HomeWorkID,
        StudentID: StudentID,
        Link: Link,
        Remark: Remark,
        AttachFile: AttachFile,
        DeleteFile: DeleteFile,
    }
    const promise = apiHttpClient.post(apiUrls.saveWorkForStudentUrl(), params)
        .then(response => response.data)
        .then((data) => {
            return data;
            // const resData = Object.values(data);
            // return Promise.resolve(resData);
        });
    return promise;
}
const getMessageForOnlineStudent = (schoolid, studentid, workId) => {
    const url = apiUrls.getMessageForOnlineStudentUrl(schoolid, studentid, workId);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return data.data;
        });
    return promise;
}

const sendMessageStudent = (SchoolID, HomeWorkID, StudentID, TeacherID, Comment) => {
    const params = {
        SchoolID: SchoolID,
        HomeWorkID: HomeWorkID,
        StudentID: StudentID,
        TeacherID: TeacherID,
        Comment: Comment,
    }
    const promise = apiHttpClient.post(apiUrls.sendMessageStudentUrl(), params)
        .then(response => response.data)
        .then((data) => {
            return data;
            // const resData = Object.values(data);
            // return Promise.resolve(resData);
        });
    return promise;
}

const getMessageListTodayGeneral = (UserId, page) => {
    const promise = apiHttpClient.get(apiUrls.getMessageListTodayGeneralUrl(UserId, page), {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise
}
const getMessageListWeekGeneral = (UserId, page) => {
    const promise = apiHttpClient.get(apiUrls.getMessageListWeekGeneralUrl(UserId, page), {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise
}
const getMessageListHistoryGeneral = (UserId, page) => {
    const promise = apiHttpClient.get(apiUrls.getMessageListHistoryGeneralUrl(UserId, page), {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise
}

const getMessageListTodayAccepted = (UserId, page) => {
    const promise = apiHttpClient.get(apiUrls.getMessageListTodayAcceptedUrl(UserId, page), {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise
}
const getMessageListWeekAccepted = (UserId, page) => {
    const promise = apiHttpClient.get(apiUrls.getMessageListWeekAcceptedUrl(UserId, page), {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise
}
const getMessageListHistoryAccepted = (UserId, page) => {
    const promise = apiHttpClient.get(apiUrls.getMessageListHistoryAcceptedUrl(UserId, page), {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise
}

const getMessageListTodaySystem = (UserId, page) => {
    const promise = apiHttpClient.get(apiUrls.getMessageListTodaySystemUrl(UserId, page), {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise
}
const getMessageListWeekSystem = (UserId, page) => {
    const promise = apiHttpClient.get(apiUrls.getMessageListWeekSystemUrl(UserId, page), {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise
}
const getMessageListHistorySystem = (UserId, page) => {
    const promise = apiHttpClient.get(apiUrls.getMessageListHistorySystemUrl(UserId, page), {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise
}
const getReportTopUpSingleDate = (schoolId, d) => {
    const date = moment(d).format('MM/DD/YYYY');
    const url = apiUrls.getReportTopUpSingleDateUrl(schoolId, date);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return data;
            // const array = Object.values(data);
            // return Promise.resolve(array);
        });
    return promise;
}

const getReportTopUpRangeDate = (schoolId, sdate, edate) => {
    const startdate = moment(sdate).format('MM/DD/YYYY');
    const enddate = moment(edate).format('MM/DD/YYYY');
    const url = apiUrls.getReportTopUpRangeDateUrl(schoolId, startdate, enddate);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return data;
            // const array = Object.values(data);
            // return Promise.resolve(array);
        });
    return promise;
}

const getReportPurchaseSingleDate = (schoolId, d) => {
    const date = moment(d).format('MM/DD/YYYY');
    const url = apiUrls.getReportPurchaseSingleDateUrl(schoolId, date);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return data;
            // const array = Object.values(data);
            // return Promise.resolve(array);
        });
    return promise;
}

const getReportPurchaseRangeDate = (schoolId, sdate, edate) => {
    const startdate = moment(sdate).format('MM/DD/YYYY');
    const enddate = moment(edate).format('MM/DD/YYYY');
    const url = apiUrls.getReportPurchaseRangeDateUrl(schoolId, startdate, enddate);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return data;
            // const array = Object.values(data);
            // return Promise.resolve(array);
        });
    return promise;
}

const getTopupHistoryList = (schoolId, startdate, enddate, userId) => {
    const _sdate = moment(startdate).format('MM/DD/YYYY');
    const _edate = moment(enddate).format('MM/DD/YYYY');
    const url = apiUrls.getTopupHistoryListUrl(schoolId, _sdate, _edate, userId);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return data;
            // const array = Object.values(data);
            // return Promise.resolve(array);
        });
    return promise;
}

const getNotificationMessageListToday = (userId, page, lang) => {
    const promise = serverHttpClient.get(apiUrls.getNotificationMessageListTodayUrl(userId, page, lang), {})
        .then(response => response.data)
        .then((data) => {
            return data;
        });
    return promise
}
const getNotificationMessageListWeek = (userId, page, lang) => {
    const promise = serverHttpClient.get(apiUrls.getNotificationMessageListWeekUrl(userId, page, lang), {})
        .then(response => response.data)
        .then((data) => {
            return data;
        });
    return promise
}

const getNotificationSystem = (userId, page) => {
    const promise = apiHttpClient.get(apiUrls.getNotificationSystemUrl(userId, page), {})
        .then(response => response.data)
        .then((data) => {
            return data;
        });
    return promise
}
const getSchoolLocation = (schoolid, sid) => {
    const promise = apiHttpClient.get(apiUrls.getSchoolLocationUrl(schoolid, sid), {})
        .then(response => response.data)
        .then((data) => {
            return data.data;
        });
    return promise;
}
const getAnnouncementLocation = (schoolid, sid, serverType) => {
    const promise = apiHttpClient.get(apiUrls.getAnnouncementLocationUrl(schoolid, sid, serverType), {})
        .then(response => response.data)
        .then((data) => {
            return data;
        });
    return promise;
}

const getYearSelectGrade = (schoolid) => {
    const url = apiUrls.getYearSelectGradeUrl(schoolid);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return data
        });
    return promise;
};
const getTermSelectGrade = (year, userid) => {
    const url = apiUrls.getTermSelectGradeUrl(year, userid);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return data
        });
    return promise;
};

const getTeacherReportTuition = (schoolid, termId) => {
    const url = apiUrls.getTeacherReportTuitionUrl(schoolid, termId);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            return data
        });
    return promise;
};

const CheckPrivacyStatus = (userId) => {
    const url = apiUrls.CheckPrivacyStatusUr(userId);
    const promise = serverHttpClient.get(url, {})
        .then(response => response.data)
        .then((data) => {
            return data
        });
    return promise;
};
const AcceptPrivacy = (userId) => {
    const url = apiUrls.AcceptPrivacyUrl(userId);
    const promise = serverHttpClient.get(url, {})
        .then(response => response.data)
        .then((data) => {
            return data
        });
    return promise;
};

const uploadImage = (type, schoolId, assets) => {

    let f = new FormData();
    f.append("files", {
        name: assets.fileName,
        type: assets.type,
        uri: assets.uri
    });
    const promise = serverHttpClient.post(apiUrls.uploadImageUrl(type, schoolId), f, {headers: {'Content-Type': 'multipart/form-data'}})
        .then(response => response.data)
        .then((data) => {
            return data;
        });
    return promise;
}

const uploadFile = (type, schoolId, assets) => {
    let f = new FormData();
    f.append("files", {
        name: assets.name,
        type: assets.type,
        uri: assets.uri
    });
    const promise = serverHttpClient.post(apiUrls.uploadImageUrl(type, schoolId), f, {headers: {'Content-Type': 'multipart/form-data'}})
        .then(response => response.data)
        .then((data) => {
            return data;
        });
    return promise;
}

const uploadRecoverData = (Imei, requestCode, items) => {
    let formData = new FormData();
    let fields = ['student_picture_0', 'student_picture_1', 'parent_picture_1', 'parent_picture_0'];
    items.forEach((item, index) => {
        formData.append(fields[index], {
            name: item.fileName,
            type: item.type,
            uri: item.uri
        });
    });

    const promise = apiHttpClient.post(apiUrls.uploadRecoverData(Imei, requestCode), formData, {headers: {'Content-Type': 'multipart/form-data'}})
        .then(response => response.data)
        .then((data) => {
            return data;
        });
    return promise;
}

const uploadRecoverDataTeacher = (Imei, requestCode, items) => {
    let formData = new FormData();
    let fields = ['teacher_picture_0', 'teacher_picture_1'];
    items.forEach((item, index) => {
        // console.log("form add:", fields[index], {
        //   name: item.fileName,
        //   type: item.type,
        //   uri: item.uri
        // });
        formData.append(fields[index], {
            name: item.fileName,
            type: item.type,
            uri: item.uri
        });
    });

    // console.log("formData:", formData);

    const promise = apiHttpClient.post(apiUrls.uploadRecoverDataTeacher(Imei, requestCode), formData, {headers: {'Content-Type': 'multipart/form-data'}})
        .then(response => response.data)
        .then((data) => {
            return data;
        });
    return promise;
}

const MessageReply = (userid, messageid, replycode) => {
    const url = apiUrls.MessageReplyUrl(userid, messageid, replycode);
    const promise = apiHttpClient.get(url, {})
        .then(response => response.data)
        .then((data) => {
            return data
        });
    return promise;
};

const getBroadcastReportListAll = (page, schoolID) => {
    const url = apiUrls.getBroadcastReportListAllUrl(page, schoolID);
    const promise = apiHttpClient.get(url, params)
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const checkServerStatus = async () => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.checkServerStatusUrl(), params)
        .then(response => response.data)
        .then(async (data) => {
            return Promise.resolve(data);
        }).catch(error => {
            console.log("...:", error)
        });
    return promise
}

const checkAuthStatus = (user_id, ClientToken, deviceTocken) => {
    const params = {
        "user_id": user_id,
        "ClientToken": ClientToken,
        "DeviceToken": deviceTocken
    };
    const promise = apiHttpClient.post(apiUrls.checkAuthStatusUrl(), params)
        .then(response => {
            return response.data
        })
        .then(async (data) => {
            return data;
        });
    return promise
}

const checkAuthStatus0 = (user_id, ClientToken, deviceTocken) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.checkAuthStatusUrl(user_id, ClientToken, deviceTocken), params)
        .then(response => response.data)
        .then(async (data) => {
            return data;
        });
    return promise
}


const checkStudentIsPrimary = (SchoolId, nYear, sid) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.checkStudentIsPrimaryUrl(SchoolId, nYear, sid), params)
        .then(response => response.data)
        .then(async (data) => {
            return data;
        });
    return promise
}


const checkLeavePermisionStatus = (user_id, lang) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.checkLeavePermisionStatusUrl(user_id, lang), params)
        .then(response => response.data)
        .then(async (data) => {
            return data;
        });
    return promise
}
const resetPasswordWithOld = (user_id, ClientToken, password, oldpasword) => {
    const promise = apiHttpClient.get(apiUrls.resetPasswordWithOldURL(user_id, ClientToken, password, oldpasword), {})
        .then(response => {
            return response.data;
        })
        .then((data) => {
            return data;
        });
    return promise;
}

const resetPassword = (user_id, ClientToken, password) => {
    const promise = apiHttpClient.get(apiUrls.resetPasswordURL(user_id, ClientToken, password), {})
        .then(response => response.data)
        .then((data) => {
            return data;
        });
    return promise;
}

const requestCancel = (letterid, userid) => {
    const promise = apiHttpClient.get(apiUrls.requestCancelUrl(letterid, userid), {})
        .then(response => response.data)
        .then((data) => {
            return data;
        });
    return promise;
}

const checkChangePinStatus = (userid) => {
    const params = {};
    const promise = shopHttpClient.get(apiUrls.checkChangePinStatusUrl(userid), params)
        .then(response => response.data)
        .then((data) => {
            return data;
        });
    return promise
}
const createPinCode = (pinCode, user_id) => {
    const params = {};
    const promise = shopHttpClient.post(apiUrls.createPinCodeUrl(pinCode, user_id), params)
        .then(response => response.data)
        .then((data) => {
            return data;
        });
    return promise
}

const saveDeviceInfo = (fcmtoken, userid, schoolid, imei, system, appversion, model) => {
    const params = {
        Token: fcmtoken,
        UserID: userid,
        SchoolID: schoolid,
        Imei: imei,
        System: system,
        appVersion: appversion,
        model: model,
    };
    const promise = serverHttpClient.post(apiUrls.saveDeviceInfoUrl(), params)
        .then(response => response.data)
        .then((data) => {
            return data;
        });
    return promise;
}
const getCountUnreadGeneralMessage = (userId) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.getCountUnreadGeneralMessageUrl(userId), params)
        .then(response => response.data)
        .then((data) => {
            const count = parseInt(data);
            return Promise.resolve(count);
        });
    return promise
}

const getCountUnreadAcceptMessage = (userId) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.getCountUnreadAcceptMessageUrl(userId), params)
        .then(response => response.data)
        .then((data) => {
            const count = parseInt(data);
            return Promise.resolve(count);
        });
    return promise
}

const getCountUnreadSystemMessage = (userId) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.getCountUnreadSystemMessageUrl(userId), params)
        .then(response => response.data)
        .then((data) => {
            const count = parseInt(data);
            return Promise.resolve(count);
        });
    return promise
}

const checkPushnotificationUrl = (messageid, userid, school_id) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.checkPushnotificationUrl(messageid, userid, school_id), params)
        .then(response => response.data)
        .then((data) => {
            if (data.length > 0) {
                return data[0].userid;
            } else {
                return "";
            }
        });
    return promise
}

const updateStudentProfile = (params) => {

    const promise = apiHttpClient.post(apiUrls.updateStudentProfileUrl(), params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise;
}

const updateStudentPermanentAddress = (params) => {

    const promise = apiHttpClient.post(apiUrls.updateStudentPermanentAddressUrl(), params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise;
}

const updateStudentContactAddress = (params) => {

    const promise = apiHttpClient.post(apiUrls.updateStudentContactAddressUrl(), params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise;
}

const updateStudentFatherInfo = (params) => {

    const promise = apiHttpClient.post(apiUrls.updateStudentFatherInfoUrl(), params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise;
}

const updateStudentMotherInfo = (params) => {
    const promise = apiHttpClient.post(apiUrls.updateStudentMotherInfoUrl(), params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise;
}

const updateStudentParentInfo = (params) => {
    const promise = apiHttpClient.post(apiUrls.updateStudentParentInfoUrl(), params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise;
}

const updateEmployeeProfile = (params) => {
    const promise = apiHttpClient.post(apiUrls.updateEmployeeProfileUrl(), params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise;
}

const updateEmployeePermanentAddress = (params) => {
    const promise = apiHttpClient.post(apiUrls.updateEmployeePermanentAddressUrl(), params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise;
}

const updateEmployeeContactAddress = (params) => {
    const promise = apiHttpClient.post(apiUrls.updateEmployeeContactAddressUrl(), params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise;
}

const updateEmployeeFamilyInfo = (params) => {
    const promise = apiHttpClient.post(apiUrls.updateEmployeeFamilyInfoUrl(), params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise;
}

const updateEmployeeEducation = (params) => {
    const promise = apiHttpClient.post(apiUrls.updateEmployeeEducationUrl(), params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise;
}

const updateEmployeeHonor = (params) => {
    const promise = apiHttpClient.post(apiUrls.updateEmployeeHonorUrl(), params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise;
}

const updateEmployeeTraining = (params) => {
    const promise = apiHttpClient.post(apiUrls.updateEmployeeTrainingUrl(), params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise;
}

const updateEmployeeOccupational = (params) => {
    const promise = apiHttpClient.post(apiUrls.updateEmployeeOccupationalUrl(), params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise;
}

const updateEmployeeDecoration = (params) => {
    const promise = apiHttpClient.post(apiUrls.updateEmployeeDecorationUrl(), params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise;
}
const removeNotification = (token, userId, schoolId, imei, system, appversion) => {
    const params = {
        Token: token,
        UserID: userId,
        SchoolID: schoolId,
        Imei: imei,
        System: system,
        appVersion: appversion,
    };


    const promise = serverHttpClient.post(apiUrls.removeNotificationUrl(), params)
        .then(response => response.data)
        .then((data) => {
            return Promise.resolve(data);
        });
    return promise
}

const getAllClass = (schoolId) => {
    const promise = apiHttpClient.get(apiUrls.getAllClassUrl(schoolId), {})
        .then(response => response.data)
        .then((data) => {
            const array = Object.values(data);
            return Promise.resolve(array);
        });
    return promise;
}

const checkVerify = (schoolID, userID, type, mode) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.checkVerifyUrl(schoolID, userID, type, mode), params)
        .then(response => {
            return response.data
        })
        .then(async (data) => {
            return data;
        });
    return promise
}

const requestOTP = (schoolID, userID, type, email, phone) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.requestOTPUrl(schoolID, userID, type, email, phone), params)
        .then(response => response.data)
        .then(async (data) => {
            return data;
        });
    return promise
}

const recoveryRequestOTP = (schoolID, userID, email) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.recoveryRequestOTPUrl(schoolID, userID, email), params)
        .then(response => response.data)
        .then(async (data) => {
            return data;
        });
    return promise
}


const verifyOTP = (schoolID, userID, type, requestCode, otp) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.verifyOTPUrl(schoolID, userID, type, requestCode, otp), params)
        .then(response => response.data)
        .then(async (data) => {
            return data;
        });
    return promise
}


const recoveryVerifyOTP = (schoolID, userID, type, requestCode, otp) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.recoveryVerifyOTPUrl(schoolID, userID, type, requestCode, otp), params)
        .then(response => response.data)
        .then(async (data) => {
            return data;
        });
    return promise
}

const GetLineConnectUrl = (schoolID, userID) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.getLineConnectUrl(schoolID, userID), params)
        .then(response => response.data)
        .then(async (data) => {
            return data;
        });
    return promise
}

const LineDisconnect = (schoolID, userID) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.getLineDisConnectUrl(schoolID, userID), params)
        .then(response => response.data)
        .then(async (data) => {
            return data;
        });
    return promise
}

const GetRSACode = (string) => {
    const params = {};
    const promise = shopHttpClient.get(apiUrls.getRSACodeUrl(string), params)
        .then(response => response.data)
        .then(async (data) => {
            return data;
        });
    return promise
}

const GetAPIUrls = (appType) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.getAPIUrls(appType), params)
        .then(response => response.data)
        .then(async (data) => {
            return data;
        });
    return promise
}

const updateToken = (token, SchoolID, sID) => {
    const params = {
        SchoolID: SchoolID,
        sID: sID,
        OldToken: token
    };

    const promise = shopHttpClient.post(apiUrls.updateTokenUrl(token), params)
        .then(response => response.data)
        .then(async (data) => {
            return data;
        });
    return promise
}

const getTrustedDevices = (UserID) => {
    const params = {
        UserID: UserID,
    };
    const promise = apiHttpClient.get(apiUrls.getTrustedDevices(UserID), params)
        .then(response => response.data)
        .then(async (data) => {
            return data;
        });
    return promise
}

const verifyDevice = (channel, Token, UserID, SchoolID, Imei, ipAddress, model, System) => {
    const params = {
        "Token": Token,
        "UserID": UserID,
        "SchoolID": SchoolID,
        "Imei": Imei,
        "IPAddress": ipAddress,
        "Location": 'test',
        'model': model,
        'System': System
    };


    const promise = apiHttpClient.post(apiUrls.verifyDeviceUrl(channel), params)
        .then(response => response.data)
        .then(async (data) => {
            return data;
        });
    return promise
}

const verifyDeviceCheck = (Token, UserID, SchoolID, Imei) => {
    const params = {
        "Token": Token,
        "UserID": UserID,
        "SchoolID": SchoolID,
        "Imei": Imei
    };

    const promise = apiHttpClient.post(apiUrls.verifyDeviceCheckUrl(), params)
        .then(response => response.data)
        .then(async (data) => {
            return data;
        });
    return promise
}

const getVerifiedDevices = (Token, UserID, SchoolID, Imei) => {
    const params = {
        "Token": Token,
        "UserID": UserID,
        "SchoolID": SchoolID,
        "Imei": Imei
    };

    const promise = apiHttpClient.post(apiUrls.getVerifiedDevices(), params)
        .then(response => response.data)
        .then(async (data) => {
            return data;
        });
    return promise
}

const sendMessagePasswordReset = (UserID, SchoolID, chanel) => {

    const promise = apiHttpClient.get(apiUrls.sendMessagePasswordReset(UserID, SchoolID, chanel))
        .then(response => response.data)
        .then(async (data) => {
            return data;
        });
    return promise
}

const removeDevice = (Token, UserID, SchoolID, Imei) => {
    const params = {
        "Token": Token,
        "UserID": UserID,
        "SchoolID": SchoolID,
        "Imei": Imei
    };

    const promise = apiHttpClient.post(apiUrls.removeDevice(), params)
        .then(response => response.data)
        .then(async (data) => {
            return data;
        });
    return promise
}

const updateLanguage = (lang, data) => {
    const params = data;
    const promise = serverHttpClient.get(apiUrls.updateLanguageUrl(lang), params)
        .then(response => response.data)
        .then(async (data) => {
            return data;
        });
    return promise
}


const getLogStatus = (schoolID, date, logStatus, people) => {
    const _date = moment(date).format('MM/DD/YYYY');
    const params = {};
    const promise = apiHttpClient.get(apiUrls.getLogStatus(schoolID, _date, logStatus, people), params)
        .then(response => response.data)
        .then(async (data) => {
            return data;
        });
    return promise
}

const isOpenEditUserProfile = (schoolID) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.isOpenEditUserProfileUrl(schoolID), params)
        .then(response => response.data)
        .then(async (data) => {
            return data.isOpenEdit || false;
        });
    return promise
}

const getTeacherLeaveType = (schoolID) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.getTeacherLeaveType(schoolID), params)
        .then(response => response.data)
        .then(async (data) => {
            return data;
        });
    return promise
}

const getStudentLeaveType = (schoolID) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.getStudentLeaveType(schoolID), params)
        .then(response => response.data)
        .then(async (data) => {
            return data.data || [];
        });
    return promise
}

const getVerification = (Token, UserID, SchoolID, Imei) => {
    const params = {
        "Token": Token,
        "UserID": UserID,
        "SchoolID": SchoolID,
        "Imei": Imei,
        "IPAddress": '',
        "Location": 'test',
        'model': '',
        'System': '',
        "Type": "",
        "Mode": "",
        "appVersion": "1",
    };
    return apiHttpClient.post(apiUrls.getVerification(), params)
        .then(response => response.data)
        .then(async (data) => {
            return data;
        })
}

const getLeaveInfos = (userId) => {
    const params = {};
    const promise = apiHttpClient.get(apiUrls.getLeaveInfo(userId), params)
        .then(response => response.data)
        .then(async (data) => {
            return data.data || [];
        });
    return promise
}

const getBusList = () => {
  return schoolBusHttpClient
    .post(apiUrls.getBusList(), {})
    .then((response) => response.data)
    .catch((error) => {
      console.error('Error fetching bus list:', error);
      throw error;
    });
};

const getBusSchedule = (nBusID) => {
  return schoolBusHttpClient
    .post(apiUrls.getTodayBusSchedule(), {
      nBusID,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error('Error fetching bus schedule list:', error);
      throw error;
    });
};

const getBusScheduleDetail = (nScheduleID) => {
  return schoolBusHttpClient
    .post(apiUrls.getBusScheduleDetail(), {
      nScheduleID,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error('Error fetching bus schedule details:', error);
      throw error;
    });
};

const busCheckInStudent = (nTravelID, sStudentID, nStatus) => {
  return schoolBusHttpClient
    .post(apiUrls.buscheckInStudent(), {
      nTravelID,
      sStudentID,
      nStatus,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error('Error updating checkin status:', error);
      throw error;
    });
};

const busCheckoutStudent = (nTravelID, sStudentID, nStatus) => {
  return schoolBusHttpClient
    .post(apiUrls.busCheckoutStudent(), {
      nTravelID,
      sStudentID,
      nStatus,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error('Error updating checkout status:', error);
      throw error;
    });
};

const busStartTravel = (nTravelID) => {
  return schoolBusHttpClient
    .post(apiUrls.busStartTravel(), {
      nTravelID,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error('Error starting travel:', error);
      throw error;
    });
};

const busCancelTravel = (nTravelID) => {
  return schoolBusHttpClient
    .post(apiUrls.cacelBusTravel(), {
      nTravelID,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error('Error cancelling travel:', error);
      throw error;
    });
};

const busCompleteTravel = (nTravelID) => {
  return schoolBusHttpClient
    .post(apiUrls.completeBusTravel(), {
      nTravelID,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error('Error completing travel:', error);
      throw error;
    });
};

const reOrderStudentQueue = (nScheduleID, lstStudentIDsByOrder) => {
  return schoolBusHttpClient
    .post(apiUrls.reOrderStudentQueue(), {
      nScheduleID,
      lstStudentIDsByOrder,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error('Error re-ordering queue:', error);
      throw error;
    });
};

const submitBusIndividualIncident = ({
  nTravelID,
  sStudentID,
  sMessage,
  sFileURLs,
  sImageURLs,
}) => {
  return schoolBusHttpClient
    .post(apiUrls.submitBusIndividualIncident(), {
      nTravelID,
      sStudentID,
      sMessage,
      sFileURLs,
      sImageURLs,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error('Error submitting student incident:', error);
      throw error;
    });
};

const submitBusGroupIncident = ({
  nTravelID,
  isSendToSchool,
  isSendToParent,
  nStudentGroupKind,
  sMessage,
  sFileURLs,
  sImageURLs,
}) => {
  return schoolBusHttpClient
    .post(apiUrls.submitBusGroupIncident(), {
      nTravelID,
      isSendToSchool,
      isSendToParent,
      nStudentGroupKind,
      sMessage,
      sFileURLs,
      sImageURLs,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error('Error submitting group incident:', error);
      throw error;
    });
};

const getBusIncidentList = () => {
  return schoolBusHttpClient
    .post(apiUrls.getBusIncidentList(), {})
    .then((response) => response.data)
    .catch((error) => {
      console.error('Error retrieving incidents:', error);
      throw error;
    });
};

const readBusIncident = (incidentID) => {
  return schoolBusHttpClient
    .post(apiUrls.readBusIncident(incidentID), {})
    .then((response) => response.data)
    .catch((error) => {
      console.error('Error reading incident:', error);
      throw error;
    });
};

const getVehicleCheckInOutListWithDate = (busId, ddate, edate) => {
  const params = {
    nBusID: busId,
    sDateFrom: moment(ddate).format('DD/MM/YYYY'),
    sDateTo: moment(edate).format('DD/MM/YYYY'),
  };
  return schoolBusHttpClient
    .post(apiUrls.getReportVehicleCheckInOut(), params)
    .then((response) => response.data)
    .catch((error) => {
      console.error('Error reading reports:', error);
      throw error;
    });
};

const getPassengerBoardingAlightingReports = (sDate, isEvening) => {
    const params = {
      sDate: moment(sDate).format('DD/MM/YYYY'),
      isEvening
    };
    return schoolBusHttpClient
      .post(apiUrls.getPassengerBoardingAlightingReports(), params)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error reading reports:', error);
        throw error;
      });
  };

  const getPassengerBoardingAlightingReportDetails = (sDate, nBusID, isEvening) => {
    const params = {
      sDate: moment(sDate).format('DD/MM/YYYY'),
      nBusID,
      isEvening,
    };
    return schoolBusHttpClient
      .post(apiUrls.getPassengerBoardingAlightingReportDetails(), params)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error reading reports:', error);
        throw error;
      });
  };

  const checkTodayBusScheduleForStudent = () => {
    const params = {};
    return schoolBusHttpClient
      .post(apiUrls.checkTodayBusScheduleForStudent(), params, {
        headers: {
            isStudent: true
        }
  })
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error checking schedule:', error);
        throw error;
      });
  };

  const getScheduleDetailForStudent = (scheduleID) => {
    const params = { nScheduleID: scheduleID };
    return schoolBusHttpClient
      .post(apiUrls.getScheduleDetailForStudent(), params, {
        headers: {
            isStudent: true
        }
      })
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error checking schedule:', error);
        throw error;
      });
  };

export default {
    getVerification,
    getLogStatus,
    updateLanguage,
    uploadRecoverDataTeacher,
    uploadRecoverData,
    removeDevice,
    sendMessagePasswordReset,
    getVerifiedDevices,
    verifyDeviceCheck,
    verifyDevice,
    updateToken,
    GetAPIUrls,
    signin,
    getUserInfo,
    getQRCode,
    getCome2School,
    getHealthProfile,
    getTemperatureList,
    getTimeTableList,
    getTimeTableDetail,
    getHomeworkList,
    getNotificationDetail,
    getStudentClassLevel,
    getSchoolClassroom,
    getStudentInClassTAFlag,
    getStudentInClassForClassAttendance,
    getStudentInClassroom,
    getSubject,
    updateStudentStatusFlag,
    updateStudentStatus,
    getQRCodeDataWithID,
    checkoutTime,
    checkOnTime,
    checkLateTime,
    getAddBehaviorScoreList,
    getReduceBehaviorScoreList,
    updateStudentBehaviorScore,
    updateStudentBehaviorScoreV2,
    sendHomework,
    getSubjectIndividualHomework,
    sendBroadcast,
    getProvinceList,
    getDistrictList,
    getSubDistrictList,
    getLeavePositionOfUser,
    sendLeaveData,
    getSchoolCalendarOnDate,
    getSchoolCalendarDates,
    getLeaveRequestList,
    getLeaveRequestDetail,
    updateLeaveRequestStatus,
    getNewsMessageList,
    readNewsMessage,
    readAllMessage,
    getShopList,
    getProductList,
    getMessageList,
    getCountUnreadMessage,
    getPaymentReceiptWithPinCode,
    getHistoryStudentStatusList,
    getPersonalFlagHistory,
    getBehaviorScoreHistoryInDateRange,
    getHomeworkReportList,
    getHomeworkReportDetail,
    getHomeworkReportRecieverList,
    getBroadcastReportList,
    getBroadcastReportDetail,
    getBroadcastReportRecieverList,
    getUncheckNameList,
    getUncheckNameDates,
    getPurchaseReportDateList,
    getPurchaseReportItemList,
    getTopupReportDateList,
    getTopupReportList,
    getLeaveReportList,
    getYearTermData,
    getAttendanceSchoolReportGraph,
    getAttendanceSchoolDetailClass,
    getAttendanceSchoolDetailDepartment,
    getAttendanceSchoolDetailStudent,
    getAttendanceSchoolDetailEmployee,
    getReportTopUpDate,
    getPurchaseReportDate,

    //NEW
    getTeacherAll,
    getEmployeeAll,
    signinForAdd,
    getCheckPassword,
    getResetPassword,
    getAcademicGradeDetailInfo,
    getYearSelectGrade,
    getTermSelectGrade,
    getStatementFee,
    getPaymentFee,
    getOnlineSubjectList,
    getOnlineClassList,
    getOnlineShareTeacherList,
    getOnlineGroupList,
    createOnlineGroup,
    OnlineHomeworkAndLessonList,
    getClassOnlie,
    createOnlineHomework,
    getHistoryStudentStatusListForSubject,
    getTeacherReportAttendanceSubjectStatusList,
    getTeacherReportAttendanceSubjectStatusHistory,
    getEmployeeInfo,
    getStudentRequestHistory,
    getAnnouncementInfo,
    getListCheckHomework,
    getStudentHomeWork,
    saveHomeWorkScore,
    getStudentInfo,
    getCanUpdateStatus,
    forgotPassword,
    getStudentForBehavior,
    getReportTeacherForBehaviorStudentList,
    getSmsGroup,
    getOnlineSubjectListForStudent,
    getOnlineLessonListForStudent,
    getOnlineHomeworkForStudent,
    getOnlineLearningForStudent,
    getOnlineStudentWorks,
    saveWorkForStudent,
    getMessageForOnlineStudent,
    sendMessageStudent,
    getMessageListTodayGeneral,
    getMessageListWeekGeneral,
    getMessageListHistoryGeneral,
    getMessageListTodayAccepted,
    getMessageListWeekAccepted,
    getMessageListHistoryAccepted,
    getMessageListTodaySystem,
    getMessageListWeekSystem,
    getMessageListHistorySystem,
    getReportTopUpSingleDate,
    getReportTopUpRangeDate,
    getReportPurchaseSingleDate,
    getReportPurchaseRangeDate,
    getTopupHistoryList,
    getUserTermInfo,
    getNotificationMessageListToday,
    getNotificationMessageListWeek,
    getNotificationSystem,
    getSubjectWithDate,
    getSchoolLocation,
    getAnnouncementLocation,
    getSmsResponseTypeList,
    getUserSchoolYear,
    getYearSelectGradeAcademic,
    getTermSelectGradeAcademic,
    getTeacherReportTuition,
    CheckPrivacyStatus,
    AcceptPrivacy,
    uploadImage,
    uploadFile,
    readSystemMessage,
    getPurchaseReportHistory,
    MessageReply,
    getBroadcastReportListAll,
    getBroadcastExcuteReportList,
    createOnlineLesson,
    getLessonDetail,
    getUserTermInfoByYear,
    getLeaveReportListWithDate,
    getBehaviorScoreHistory,
    checkServerStatus,
    checkAuthStatus,
    checkLeavePermisionStatus,
    resetPassword,
    requestCancel,
    checkChangePinStatus,
    createPinCode,
    saveDeviceInfo,
    getCountUnreadGeneralMessage,
    getCountUnreadAcceptMessage,
    getCountUnreadSystemMessage,
    getHomeTotalUnreadCount,
    checkPushnotificationUrl,
    getStudentInClassForClassAttendanceCopy,
    getLeavePositionOfStudent,
    getPlanInfo,
    OnlineGetHomework,
    updateStudentProfile,
    updateStudentPermanentAddress,
    updateStudentContactAddress,
    updateStudentFatherInfo,
    updateStudentMotherInfo,
    updateStudentParentInfo,
    updateEmployeeProfile,
    updateEmployeePermanentAddress,
    updateEmployeeContactAddress,
    updateEmployeeFamilyInfo,
    updateEmployeeEducation,
    updateEmployeeHonor,
    updateEmployeeTraining,
    updateEmployeeOccupational,
    updateEmployeeDecoration,
    OnlineHomeworkAndLessonListSecond,
    getHealthTemperatureData,
    resetPasswordWithOld,
    removeNotification,
    getAllClass,
    checkStudentIsPrimary,
    checkVerify,
    requestOTP,
    recoveryRequestOTP,
    verifyOTP,
    recoveryVerifyOTP,
    GetLineConnectUrl,
    LineDisconnect,
    GetRSACode,
    getTrustedDevices,
    isOpenEditUserProfile,
    getStudentLeaveType,
    getTeacherLeaveType,
    getLeaveInfos,

    // start school bus
    getBusList,
    getBusSchedule,
    getBusScheduleDetail,
    busCheckInStudent,
    busCheckoutStudent,
    busStartTravel,
    busCancelTravel,
    busCompleteTravel,
    reOrderStudentQueue,
    submitBusIndividualIncident,
    submitBusGroupIncident,
    getBusIncidentList,
    readBusIncident,
    getVehicleCheckInOutListWithDate,
    getPassengerBoardingAlightingReports,
    getPassengerBoardingAlightingReportDetails,
    checkTodayBusScheduleForStudent,
    getScheduleDetailForStudent,
    // end schcool bus
};
