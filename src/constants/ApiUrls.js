export const BASE_URL = 'https://sbapi.schoolbright.co/api';
export const BASE_URL_DEV_MOBILE = 'https://apimobiledev.schoolbright.co/api';
export const BASE_URL_DEV = 'https://api-dev.schoolbright.co/api';
export const BASE_SERVER_URL = 'https://sbapi.schoolbright.co';
export const SERVER_URL_DEV = 'https://api-dev.schoolbright.co';
export const SHOP_BASE_URL = 'https://paysb.schoolbright.co/api';
export const SHOP_BASE_URL_DEV = 'https://paymentapi-dev.schoolbright.co/api';
export const BASE_WEBSITE_URL = 'https://system.schoolbright.co';
export const ACADEMIC_WEBSITE_URL = 'https://academic.schoolbright.co/api';
export const ACADEMIC_WEBSITE_URL_DEV = 'https://dev-academic.schoolbright.co/api'; 
export const SCHOOL_BUS_URL = 'https://sbbus-dev.schoolbright.co/MobileAPI/Teacher'; 
export const SCHOOL_BUS_URL_DEV = 'https://sbbus-dev.schoolbright.co/MobileAPI/Teacher'; 

import translang, {getCurrentLocale} from '../utils/language.utils';

class ApiUrls {
  getSchools() {
    return '/school';
  }

  getSchoolYears() {
    return '/schoolyear';
  }

  getSemesters() {
    return '/semesters';
  }

  getLeaveReasons() {
    return '/leavereasons';
  }

  signin() {
    return '/login';
  }

  forgotPwdUrl(schoolID, StudentCode) {
    return `/forgotPassword/v2?schoolID=${schoolID}&StudentCode=${StudentCode}`;
  }

  getPermission() {
    return '/school/permission';
  }

  getUserInfo(userId) {
    return `/user?userid=${userId}`;
  }

  getQRCodeImage(userId, resolution, width, height) {
    return `/User/qrcode/${resolution}/${width}/${height}/${userId}`;
  }

  getCome2School(userid, dstart, dend, schoolid) {
    return `/come2school?userid=${userid}&dstart=${dstart}&dend=${dend}&status=&schoolid=${schoolid}`;
  }

  getHealthProfile() {
    return '/healthProfile';
  }

  getTemperatureList() {
    return '/healthProfile/GetTemperatureLog';
  }

  getTimeTableListTEMP() {
    return '/school/Schedule/ScheduleList';
  }

  getTimeTableList(userId, usertype, DayOfWeek, termId) {
    if (usertype == 0) { //Student
      return `/school/Schedule/ScheduleList?studentid=${userId}&DayOfWeek=${DayOfWeek}&termId=${termId}`;
    } else {
      return `/school/Schedule/ScheduleList?teacherid=${userId}&DayOfWeek=${DayOfWeek}&termId=${termId}`;
    }
  }

  getTimeTableDetail() {
    return '/school/Schedule/ScheduleDetail';
  }

  getHomeworkList(userId, schoolId, page) {
    return `/messagebox/getMessage/homework/${userId}/${page}?schoolid=${schoolId}`
  }

  getMessageWithId(userId, schoolId, messageId) {
    return `/messagebox/ReadMessage/${userId}/${messageId}?schoolid=${schoolId}`;
  }

  getStudentClassLevel(schoolId) {
    return `/sublevel/getLevel/${schoolId}`;
  }

  getSchoolClassroom(schoolId, levelId) {
    return `/sublevel2?schoolid=${schoolId}&sublevelid=${levelId}`;
  }

  getSubject(schoolId, classroomId) {
    return `/School/getschedule/${schoolId}/${classroomId}`;
  }

  getSubjectWithDateUrl(schoolId, classroomId, date) {
    return `/School/getschedule/${schoolId}/${classroomId}?datetime=${date}`;
  }


  getStudentInClassTAFlag(schoolId, classroomId, teacherId) {
    return `/School/getstudent/${schoolId}/${classroomId}?teacherId=${teacherId}`;
  }

  getStudentInClassForClassAttendance(schoolId, classroomId, subjectId, teacherId, date) {
    return `/School/getstudent/${schoolId}/${classroomId}/${subjectId}/${teacherId}?date=${date}`;
  }

  getStudentInClassForClassAttendanceCopyUrl(schoolId, levelid, subjectId, teacherId) {
    return `/School/copystatus/${schoolId}/${levelid}/${subjectId}/${teacherId}`;
  }

  getStudentInClassroom(schoolId, classroomId) {
    return `/studentinclass?SchoolId=${schoolId}&level2=${classroomId}`;
  }

  getStudentListForBehaviorUrl(ClassId, schoolid) {
    return `/Behaviors/ScoreToday?ClassId=${ClassId}&schoolid=${schoolid}`;
  }

  updateStudentStatusFlag(schoolId, teacherId) {
    return `/School/updatestatusjobscan/${schoolId}/${teacherId}`;
  }

  updateStudentStatus(schoolId, subjectId, teacherId, date) {
    return `/School/updatestatus/${schoolId}/${subjectId}/${teacherId}?date=${date}`;
  }

  getQRCodeDataWithID(schoolId, code) {
    return `/user/qrcode?school_id=${schoolId}&code=${code}`;
  }

  checkoutTime(schoolId, userId, code, status) {
    return `/jobscan/checktimeout?school_id=${schoolId}&user_id=${userId}&user_barcode=${code}&job_status=${status}`;
  }

  checkOntime(schoolId, userId, code, status) {
    return `/Jobscan/checkontime/barcode?school_id=${schoolId}&user_id=${userId}&barcode=${code}`;
  }

  checkLateTime(schoolId, userId, code, status) {
    return `/Jobscan/checklate/qrcode?school_id=${schoolId}&user_id=${userId}&barcode=${code}`;
  }

  getAddBehaviorScoreList(schoolId) {
    return `/Behaviors/list/add?SchoolId=${schoolId}`;
  }

  getReduceBehaviorScoreList(schoolId) {
    return `/Behaviors/list/reduce?SchoolId=${schoolId}`;
  }

  updateStudentBehaviorScore(schoolId, teacherId) {
    return `/Behaviors/updatescore?SchoolId=${schoolId}&TheacherId=${teacherId}`;
  }

  updateStudentBehaviorScoreV2(schoolId, teacherId) {
    return `/Behaviors/updatescore/v2?SchoolId=${schoolId}&TheacherId=${teacherId}`;
  }

  getSubjectIndividualHomework(schoolId, plane) {
    return `/Homework/getplane?level2array=${plane}&school_id=${schoolId}`;
  }

  sendHomework() {
    return `/Homework/send`;
  }

  sendBroadcastFile() {
    return `/news/sendfiles`;
  }

  sendNews() {
    return `/news/send/v2`;
  }

  getProvinceList(schoolId) {
    return `/Province?schoolid=${schoolId}`;
  }

  getDistrictList(schoolId, provinceId) {
    return `/amphur/${provinceId}?schoolid=${schoolId}`;
  }

  getSubDistrictList(schoolId, districtId) {
    return `/district/${districtId}?schoolid=${schoolId}`;
  }

  getLeavePositionOfUser(userId) {
    return `/findJob?userid=${userId}`;
  }

  getLeavePositionOfStudentUrl(userId) {
    return `/findClassroom?userid=${userId}`;
  }


  sendLeaveData() {
    return `/studentLeave`;
  }

  getSchoolCalendarOnDate(userId, date, schoolId) {
    return `/SchoolCalendar?userid=${userId}&day=${date}&schoolid=${schoolId}`;
  }

  getSchoolCalendarDates(userId, date, schoolId) {
    return `/schoolCalendarList?userid=${userId}&day=${date}&schoolid=${schoolId}`;
  }

  getLeaveRequestList(userId, page) {
    return `/LeaveLetterList?userid=${userId}/${page}`;
  }

  getLeaveRequestDetail(userId, messageId) {
    return `/LetterDetail?userid=${userId}&messageID=${messageId}`;
  }

  updateLeaveRequestStatus(userId, messageId, status, schoolId, message) {
    return `/confirmLeave?letterid=${messageId}&userid=${userId}&approve=${status}&schoolid=${schoolId}&message=${message}`;
  }

  getNewsMessageList(userId, page, schoolId) {
    return `/messagebox/getMessage/news/${userId}/${page}?schoolid=${schoolId}`;
  }

  readNewsMessage(userId, messageId, schoolId, lang) {
    if (schoolId === '') {
      return `/messagebox/ReadMessag/${userId}/${messageId}?lang=${lang}`;
    }
    return `/messagebox/ReadMessag/${userId}/${messageId}?schoolid=${schoolId}&lang=${lang}`;
  }

  readSystemMessageUrl(userId, messageId) {
    return `/message/System/Detail?Messageid=${messageId}&userid=${userId}`;
  }

  readAllMessage(userId) {
    return `/messagebox/Readall?userid=${userId}`;
  }

  getShopList(schoolId) {
    return `/shop/shops?SchoolId=${schoolId}`;
  }

  checkChangePinStatusUrl(user_id) {
    return `/shop/pin/status?UserId=${user_id}`;
  }

  createPinCodeUrl(pinCode, user_id) {
    return `/shop/pin/Register?pinCode=${pinCode}&UserID=${user_id}`;
  }

  getProductList(schoolId, shopId) {
    return `/shop/product?SchoolID=${schoolId}&ShopID=${shopId}&ProductTypeID=&ProductName=`;
  }

  getMessageList(userId, page, status, schoolId, lang) {
    return `/messagebox/getMessage/${userId}/${page}?status=${status}&schoolid=${schoolId}&lang=${lang}`;
  }

  getCountUnreadMessage(userId) {
    return `/messagebox/CountUnreadMessag/${userId}`;
  }

  getHomeTotalUnreadCountUrl(userId) {
    return `/message/Main/unread/${userId}`;
  }

  getPaymentReceiptWithPinCode(schoolId, shopId) {
    return `/shop/payment?school_id=${schoolId}&shop_id=${shopId}`;
  }

  getHistoryStudentStatusList(schoolId, classroomId, date) {
    return `/reports/jobscan/daily?schoolid=${schoolId}&classid=${classroomId}&day=${date}`;
  }

  getPlanInfoUrl(teacherid, termid, levelid) {
    return `/Plane?teacherid=${teacherid}&TermID=${termid}&level2Id=${levelid}`;
  }


  getPersonalFlagHistory(schoolId, userId, date) {
    return `/reports/jobscan/daily/detail?schoolid=${schoolId}&studentid=${userId}&day=${date}`;
  }

  getBehaviorScoreHistoryInDateRange(schoolId, classroomId, startDate, endDate, type) {
    let url = `Behaviors/reports?schoolid=${schoolId}&classid=${classroomId}&daystart=${startDate}&dayend=${endDate}&type=`;
    if (type === 0 || type === 1) {
      url = url + `${type}`;
    }
    return url;
  }

  getBehaviorScoreHistoryURL(userid, schoolId, termId) {
    return `/Behaviors/History?StudentId=${userid}&schoolid=${schoolId}&termId=${termId}`;
    // return `/Behaviors/updatescore/v2?SchoolId=${schoolId}&TheacherId=${userid}`;
  }

  getHomeworkReportList(schoolId, page) {
    return `HomeWork/reports?school_id=${schoolId}&page=${page}`;
  }

  getHomeworkReportDetail(schoolId, homeworkId) {
    return `homework/reportsdetail?school_id=${schoolId}&homework_id=${homeworkId}`;
  }

  getHomeworkReportRecieverList(schoolId, homeworkId, page, status) {
    return `homework/reportsdetail/userlist?school_id=${schoolId}&homework_id=${homeworkId}&page=${page}&readstatus=${status}`;
  }

  getBroadcastReportList(datetype, page, userid) {
    return `/message/PersonalSend/Reports/${datetype}?page=${page}&UserId=${userid}`
  }

  getBroadcastExcuteReportListUrl(datetype, page, schoolID) {
    return `/message/school/Reports/${datetype}?page=${page}&schoolId=${schoolID}`
  }

  getBroadcastReportListAllUrl(page, schoolID) {
    return `/message/school/Reports/history?page=${page}&schoolID=${schoolID}`
  }

  getBroadcastReportDetail(schoolId, newsId, lang='th') {
    return `/news/reportsdetail?school_id=${schoolId}&news_id=${newsId}&lang=${lang}`
  }

  getBroadcastReportRecieverList(schoolId, newsId, page, status) {
    return `/news/reportsdetail/userlist?school_id=${schoolId}&news_id=${newsId}&page=${page}&readstatus=${status}`
  }

  getUncheckNameList(schoolId, date) {
    return `reports/jobscan/uncheck?school_Id=${schoolId}&day=${date}`
  }

  getUncheckNameDates(schoolId, date) {
    return `reports/jobscan/listday/uncheck?school_Id=${schoolId}&day=${date}`
  }

  getPurchaseReportDateList(userId, date) {
    return `Reports/buyproducts?userid=${userId}&day=${date}`
  }

  getPurchaseReportItemList(userId, schoolId, date) {
    return `report/buyitem/v2?userid=${userId}&schoolid=${schoolId}&day=${date}`
  }

  getPurchaseReportHistoryUrl(userId, schoolId, sdate, edate) {
    // return `/reports/Personal/sell/v2?school_id=${schoolId}&dayend=${edate}&daystart=${sdate}&userid=${userId}`
    return `/reports/Personal/payment/v2?school_id=${schoolId}&dayend=${edate}&daystart=${sdate}&UserId=${userId}`
  }


  getTopupReportDateList(userId, schoolId, date) {
    return `Reports/topupmoney?userid=${userId}&day=${date}&schoolid=${schoolId}`
  }

  getTopupReportList(userId, schoolId, date) {
    return `messagebox/getMessage/topup?userid=${userId}&dmessage=${date}&schoolid=${schoolId}`
  }

  getLeaveReportList(userId, schoolId) {
    return `UserLeaveDetail?userid=${userId}&schoolid=${schoolId}`;
  }

  getLeaveReportListWithDateUrl(userId, ddate, edeate) {
    // return `/LeaveLetterList?userid=${userId}&dateStart=${ddate}&dateEnd=${edeate}`;
    return `/LeaveLetter/report?userid=${userId}&dateStart=${ddate}&dateEnd=${edeate}`;
  }

  getYearTermData(userId, schoolId) {
    return `GetYear?userid=${userId}&schoolid=${schoolId}`;
  }

  getAttendanceSchoolReportGraph(schoolId, date) {
    return `/takeschoolattendancereports/v2?schoolid=${schoolId}&dayreports=${date}`
  }

  getAttendanceSchoolDetailClass(schoolId, date) {
    return `/takeschoolattendancereports/v2/SumStudent4class?schoolid=${schoolId}&dayreports=${date}`;
  }

  getAttendanceSchoolDetailDepartment(schoolId, date) {
    return `/takeschoolattendancereports/v2/Department?schoolid=${schoolId}&dayreports=${date}`;
  }

  getAttendanceSchoolDetailStudent(schoolId, date, levelId, lang='th') {
    return `/takeschoolattendancereports/v2/SumStudent4Rooms?schoolid=${schoolId}&dayreports=${date}&levelid=${levelId}&lang=${lang}`;
  }

  getAttendanceSchoolDetailEmployee(schoolId, date, departmentId, lang='th') {
    return `/takeschoolattendancereports/v2/Department/detail?schoolid=${schoolId}&dayreports=${date}&department_id=${departmentId}&lang=${lang}`;
  }

  getReportTopUpDate(schoolId, startDate, endDate) {
    return `reports/shop/topup?school_id=${schoolId}&daystart=${startDate}&dayend=${endDate}`;
  }

  getPurchaseReportDate(schoolId, startDate, endDate) {
    return `reports/shop/sell?school_id=${schoolId}&daystart=${startDate}&dayend=${endDate}&shop_id=${""}`;
  }

  getSelectLists() {
    return '/test';
  }

  /**
   *  NEW
   */


  getAllTeacherUrl(schoolId) {
    return `/user/getuser/Theacher?schoolid=${schoolId}`;
  }

  getAllEmployeeUrl(schoolId) {
    return `/user/getuser/employess?schoolid=${schoolId}`;
  }

  getCheckPasswordPOST() {
    return `/shop/pin/check`;
  }

  getResetPasswordPOST() {
    return `/shop/pin/reset`;
  }

  getAcademicGradeDetailInfoUrl(schoolid, userid, year, term, type, lang) {
    return `/student/GetGradeInfo?schoolId=${schoolid}&sid=${userid}&nyear=${year}&sterm=${term}&type=${type}&lang=${lang}`;
  }

  getYearSelectGradeUrl(schoolid) {
    return `/GetYearInSchool?schoolid=${schoolid}`;
  }

  getTermSelectGradeUrl(year, userid) {
    return `/GetTerm?yearid=${year}&userid=${userid}`;
  }

  getYearSelectGradeAcademicUrl(schoolid, lang) {
    return `/Common/GetYears?schoolId=${schoolid}&lang=${lang}`;
  }

  getTermSelectGradeAcademicUrl(schoolid, year, userid, lang) {
    return `/Common/GetTerms?schoolId=${schoolid}&nYear=${year}&sid=${userid}&type=MidTerm&lang=${lang}`;
  }

  getStatementFeeUrl(userId, schoolId) {
    return `/invoices/list?student_id=${userId}&schoolid=${schoolId}`;
  }

  getPaymentFeeUrl(userId, schoolId, invoiceId) {
    return `/invoices/detail?student_id=${userId}&invoices_Id=${invoiceId}&schoolid=${schoolId}`;
  }

  getOnlineListSubjectUrl(schoolId, teacherID, year, termId, levelId) {
    return `/ClassOnline/teacher/ListSubject?schoolID=${schoolId}&teacherID=${teacherID}&year=${year}&termID=${termId}&LevelID=${levelId}`;
  }

  getOnlineClassListUrl(schoolID, teacherID, termID, planeID, levelID) {
    return `/ClassOnline/teacher/ListAllRoom?schoolID=${schoolID}&teacherID=${teacherID}&termID=${termID}&planeID=${planeID}&levelID=${levelID}`;
  }

  getOnlineShareTeacherListUrl(schoolID, teacherID, termID, planeID, levelID) {
    return `/ClassOnline/teacher/TeacherShareList?schoolID=${schoolID}&teacherID=${teacherID}&termID=${termID}&planeID=${planeID}&levelID=${levelID}`;
  }

  getOnlineGroupListUrl(schoolID, teacherID, termID, planeID, levelID) {
    return `/ClassOnline/teacher/ListGroup?schoolID=${schoolID}&teacherID=${teacherID}&termID=${termID}&planeID=${planeID}&levelID=${levelID}`;
  }

  createOnlineGroupUrl() {
    return `/ClassOnline/teacher/SaveGroup`;
  }

  OnlineHomeworkAndLessonListUrl(schoolID, teacherID, termID, planeID, levelID) {
    return `/ClassOnline/teacher/ListHomeworkAndLesson?schoolID=${schoolID}&teacherID=${teacherID}&termID=${termID}&planeID=${planeID}&levelID=${levelID}`;
  }

  OnlineHomeworkAndLessonListSecondUrl(schoolID, groupId) {
    return `/ClassOnline/teacher/ListHomeworkAndLesson?schoolID=${schoolID}&groupid=${groupId}`;
  }

  getClassOnlieUrl(schoolID, GroupID) {
    return `/ClassOnline/teacher/ListSelectedRoomIDByGroup?schoolID=${schoolID}&GroupID=${GroupID}`;
  }

  OnlineGetHomeworkUrl(schoolID, homeworkId) {
    return `/ClassOnline/teacher/GetHomework?schoolID=${schoolID}&homeworkID=${homeworkId}`;
  }

  createOnlineHomeworkUrl() {
    return `/ClassOnline/teacher/SaveHomework`;
  }

  createOnlineLessonUrl() {
    return `/ClassOnline/teacher/SaveLesson`;
  }

  getHistoryStudentStatusListForSubjectUrl(userid, date, subjectid, schoolID, classroomId) {
    return `/reports/showschedule?userid=${userid}&day=${date}&planeid=${subjectid}&schoolid=${schoolID}&level2id=${classroomId}`;
  }

  getTeacherReportAttendanceSubjectStatusListUrl(schoolId, classroomId, date, scheduleID) {
    return `/school/Schedule/report4level2/getdaydetail/v1?schoolid=${schoolId}&level2Id=${classroomId}&day=${date}&ScheduleId=${scheduleID}`;
  }

  getEmployeeInfoUrl(schoolID, employeeID, lang) {
    return `/user/GetEmployeeInfo?schoolID=${schoolID}&employeeID=${employeeID}&lang=${lang}`;
  }

  getStudentRequestHistoryUrl(schoolID, userID, lang) {
    return `/userprofile/GetStudentRequestHistory?schoolID=${schoolID}&userID=${userID}&lang=${lang}`;
  }

  getStudentInfoUrl(schoolID, studentID, termID) {
    return `/user/GetStudentInfo?schoolID=${schoolID}&studentID=${studentID}&termID=${termID}`;
  }

  getCanUpdateStatusUrl(schoolID, userID, userType) {
    return `/userprofile/CanDataSentRepeatedly?schoolID=${schoolID}&userID=${userID}&userType=${userType}`;
  }

  getNameTitleListUrl(schoolID) {
    return `/masterdata/ListTitle?schoolID=${schoolID}`;
  }

  getEmployeeTypeListUrl(schoolID) {
    return `/masterdata/ListEmployeeType?schoolID=${schoolID}`;
  }

  getJobPositionUrl(schoolID) {
    return `/masterdata/ListJobPosition?schoolID=${schoolID}`;
  }

  getDepartmentUrl(schoolID) {
    return `/masterdata/ListDepartment?schoolID=${schoolID}`;
  }

  getNationalUrl(schoolID) {
    return `/masterdata/ListNation?schoolID=${schoolID}`;
  }

  getRaceUrl(schoolID) {
    return `/masterdata/ListRace?schoolID=${schoolID}`;
  }

  getReligionUrl(schoolID) {
    return `/masterdata/ListReligion?schoolID=${schoolID}`;
  }

  getDisabilityUrl(schoolID) {
    return `/masterdata/ListDisability?schoolID=${schoolID}`;
  }

  getDisadvantageUrl(schoolID) {
    return `/masterdata/ListDisadvantage?schoolID=${schoolID}`;
  }

  getPersonalStatusUrl() {
    return `/masterdata/ListPersonalStatus`;
  }

  getProvinceListUrl() {
    return `/masterdata/ListProvince`;
  }

  getHouseTypeListUrl() {
    return `/masterdata/ListHomeType`;
  }

  getFamilyStatusListUrl() {
    return `/masterdata/ListFamilyStatus`;
  }

  getTuitionStatusListUrl() {
    return `/masterdata/ListReimbursementTuitionFee`;
  }

  getDistrictListUrl(provinceId) {
    return `/masterdata/ListDistrict?provinceID=${provinceId}`;
  }

  getSubDistrictListUrl(provinceID, districtID) {
    return `/masterdata/ListSubDistrict?provinceID=${provinceID}&districtID=${districtID}`;
  }

  getEducationLevelUrl() {
    return `/masterdata/ListEducationLevel`;
  }

  getCopyDataFromUrl() {
    return `/masterdata/ListCopyDataFrom`;
  }

  getParentRelateUrl() {
    return `/masterdata/ListParentRelate`;
  }

  getEducationTypeUrl() {
    return `/masterdata/ListTrainingType`;
  }

  getWorkingStatusUrl() {
    return `/masterdata/ListWorkStatus`;
  }

  getLicenseTypeUrl() {
    return `/masterdata/ListLicenseType`;
  }

  getInsightYearUrl() {
    return `/masterdata/ListInsigniaYear`;
  }

  getAnnouncementInfoUrl(userId, schoolId) {
    return `/systemnews/List?userId=${userId}&schoolId=${schoolId}`;
  }

  getListCheckHomeworkUrl(schoolID, HomeworkID) {
    return `/ClassOnline/teacher/ListCheckHomeWork?schoolID=${schoolID}&HomeworkID=${HomeworkID}`;
  }

  getStudentHomeWorkUrl(schoolID, HomeworkID, studentID) {
    return `/ClassOnline/teacher/GetStudentHomeWork?schoolID=${schoolID}&HomeworkID=${HomeworkID}&studentID=${studentID}`;
  }

  getLessonDetailUrl(schoolID, lessonID) {
    return `/ClassOnline/teacher/GetLesson?schoolID=${schoolID}&lessonID=${lessonID}`;
  }

  saveHomeWorkScoreUrl() {
    return `/ClassOnline/teacher/SaveHomeWorkScore`;
  }

  getReportTeacherForBehaviorStudentListUrl(ClassId, schoolid, termId) {
    return `/Behaviors/History?ClassId=${ClassId}&schoolid=${schoolid}&termId=${termId}`;
  }

  getSmsGroupUrl(schoolId, lang='th') {
    return `/news/ListNewsOption?schoolID=${schoolId}&lang=${lang}`;
  }

  getAllClassUrl(schoolId) {
    return `/level/fulllist?schoolid=${schoolId}`;
  }

  getOnlineSubjectListForStudentUrl(schoolid, studentid, term, level, level2) {
    return `/classonline/student/GetStudentStudy?schoolid=${schoolid}&studentid=${studentid}&term=${term}&level=${level}&level2=${level2}`;
  }

  getOnlineLessonListForStudentUrl(schoolid, studentid, term, level, level2, subjectId) {
    return `/classonline/student/GetLesson?schoolid=${schoolid}&studentid=${studentid}&term=${term}&level=${level}&level2=${level2}&subjectId=${subjectId}`;
  }

  getOnlineHomeworkForStudentUrl(schoolid, studentid, workId) {
    return `/classonline/student/GetHomeWork?schoolid=${schoolid}&studentid=${studentid}&workId=${workId}`;
  }

  getOnlineLearningForStudentUrl(schoolid, studentid, learnId) {
    return `/classonline/student/GetLearning?schoolid=${schoolid}&studentid=${studentid}&learnId=${learnId}`;
  }

  getOnlineStudentWorksUrl(schoolid, studentid, workId) {
    return `/classonline/student/GetStudentWork?schoolid=${schoolid}&studentid=${studentid}&workId=${workId}`;
  }

  saveWorkForStudentUrl() {
    return `/classonline/student/SaveWork`;
  }

  getMessageForOnlineStudentUrl(schoolid, studentid, workId) {
    return `/classonline/student/LoadChat?schoolid=${schoolid}&studentid=${studentid}&workId=${workId}`;
  }

  sendMessageStudentUrl() {
    return `/classonline/student/SendChatText`;
  }

  getMessageListTodayGeneralUrl(UserId, page) {
    return `/Message/General/today?UserId=${UserId}&page=${page}`;
  }

  getMessageListWeekGeneralUrl(UserId, page) {
    return `/Message/General/week?UserId=${UserId}&page=${page}`;
  }

  getMessageListHistoryGeneralUrl(UserId, page) {
    return `/Message/General/history?UserId=${UserId}&page=${page}`;
  }

  getMessageListTodayAcceptedUrl(UserId, page) {
    return `/Message/Appecpt/today?UserId=${UserId}&page=${page}`;
  }

  getMessageListWeekAcceptedUrl(UserId, page) {
    return `/Message/Appecpt/week?UserId=${UserId}&page=${page}`;
  }

  getMessageListHistoryAcceptedUrl(UserId, page) {
    return `/Message/Appecpt/history?UserId=${UserId}&page=${page}`;
  }

  getMessageListTodaySystemUrl(UserId, page) {
    return `/Message/System/today?UserId=${UserId}&page=${page}`;
  }

  getMessageListWeekSystemUrl(UserId, page) {
    return `/Message/System/week?UserId=${UserId}&page=${page}`;
  }

  getMessageListHistorySystemUrl(UserId, page) {
    return `/Message/System/history?UserId=${UserId}&page=${page}`;
  }

  getReportTopUpSingleDateUrl(schoolId, date) {
    return `/reports/shop/topup/v2?school_id=${schoolId}&daystart=${date}`;
  }

  getReportTopUpRangeDateUrl(schoolId, startdate, enddate) {
    return `/reports/shop/topup/v2?school_id=${schoolId}&dayend=${enddate}&daystart=${startdate}`;
  }

  getReportPurchaseSingleDateUrl(schoolId, date) {
    // return `/reports/shop/sell/v2?school_id=${schoolId}&daystart=${date}`;
    return `/reports/shop/sell/v2?daystart=${date}&status=&school_id=${schoolId}`;
  }


  getReportPurchaseRangeDateUrl(schoolId, startdate, enddate) {
    return `/reports/shop/sell/v2?school_id=${schoolId}&dayend=${enddate}&daystart=${startdate}`;
  }

  getTopupHistoryListUrl(schoolId, startdate, enddate, userId) {
    return `/reports/Personal/topup/v2?school_id=${schoolId}&dayend=${enddate}&daystart=${startdate}&userid=${userId}`;
  }

  getUserTermInfoUrl(schoolid, sid) {
    return `/Common/GetCurrentTerm?schoolid=${schoolid}&sid=${sid}`;
  }

  getUserTermInfoByYearUrl(schoolid, sid, year) {
    return `/Common/GetTermsByYear?schoolid=${schoolid}&nYear=${year}&sid=${sid}`;
  }

  getUserSchoolYearUrl(schoolid) {
    return `/Common/GetYears?schoolid=${schoolid}`;
  }

  getNotificationMessageListTodayUrl(userId, page, lang) {
    return `/Notification/today/${userId}?page=${page}&lang=${lang}`;
  }

  getNotificationMessageListWeekUrl(userId, page, lang) {
    return `/Notification/week/${userId}?page=${page}&lang=${lang}`;
  }

  getNotificationSystemUrl(userId, page) {
    return `/Message/System/view?UserId=${userId}&page=${page}`;
  }

  getSchoolLocationUrl(schoolid, sid) {
    return `/StudentCall/GetSchoolLocation?schoolid=${schoolid}&sid=${sid}`;
  }

  getAnnouncementLocationUrl(schoolID, sid, serverType) {
    return `/StudentCall/SetAnnouncement?schoolid=${schoolID}&sid=${sid}&serverType=${serverType}`;
  }

  getTeacherReportTuitionUrl(schoolid, termId) {
    return `/reports/school/invoices?schoolid=${schoolid}&termId=${termId}`;
  }

  CheckPrivacyStatusUr(userid) {
    return `/policy/check?userid=${userid}`;
  }

  AcceptPrivacyUrl(userid) {
    return `/policy/update?userid=${userid}`;
  }

  AcceptPrivacyUrl(userid) {
    return `/policy/update?userid=${userid}`;
  }

  uploadImageUrl(type, schoolId) {
    return `/Upload/${type}/${schoolId}`;
  }

  MessageReplyUrl(userid, messageid, replycode) {
    return `/messagebox/ReplyMessage/${userid}/${messageid}/${replycode}`;
  }

  checkServerStatusUrl() {
    return `/SeverStatus`;
  }

  checkAuthStatusUrl() {
    return `/user/Authentication/v2`;
  }

  checkAuthStatusUrl0(user_id, ClientToken, deviceTocken) {
    return `/user/Authentication/v2?user_id=${user_id}&ClientToken=${ClientToken}&DeviceToken=${deviceTocken}`;
  }

  checkStudentIsPrimaryUrl(SchoolId, nYear, sid) {
    return `/Common/CheckStudentIsPrimary?SchoolId=${SchoolId}&nYear=${nYear}&sid=${sid}`;
  }

  checkLeavePermisionStatusUrl(user_id, lang) {
    return `/DetailWarning?userid=${user_id}&lang=${lang}`;
  }

  resetPasswordURL(user_id, ClientToken, password) {
    return `/user/password/change/?user_id=${user_id}&ClientToken=${ClientToken}&password=${password}`;
  }

  resetPasswordWithOldURL(user_id, ClientToken, password, oldPassword) {
    return `/user/password/change/?user_id=${user_id}&ClientToken=${ClientToken}&password=${password}&oldpasword=${oldPassword}`;
  }

  requestCancelUrl(letterid, userid) {
    return `/LeaveRequestCancel?letterid=${letterid}&userid=${userid}`;
  }

  saveDeviceInfoUrl(fcmtoken, userid, schoolid, imei, system, appversion) {
    // return `Notification/Insert?Token=${fcmtoken}&UserID=${userid}&SchoolID=${schoolid}&Imei=${imei}&System=${system}&appVersion=${appversion}`;
    return `/notification/insert`;
  }

  getCountUnreadGeneralMessageUrl(userId) {
    return `/message/General/unread?UserId=${userId}`;
  }

  getCountUnreadAcceptMessageUrl(userId) {
    return `/message/Appecpt/unread?UserId=${userId}`;
  }

  getCountUnreadSystemMessageUrl(userId) {
    return `/message/System/unread?UserId=${userId}`;
  }

  checkPushnotificationUrl(messageid, userid, school_id) {
    return `/messagebox/getuser?messageid=${messageid}&userid=${userid}&school_id=${school_id}`;
  }

  updateStudentProfileUrl() {
    return `/userprofile/RequestApprovalUpdateStudentProfile`;
  }

  updateStudentPermanentAddressUrl() {
    return `/userprofile/RequestApprovalUpdateStudentPermanentAddress`;
  }

  updateStudentContactAddressUrl() {
    return `/userprofile/RequestApprovalUpdateStudentContactAddress`;
  }

  updateStudentFatherInfoUrl() {
    return `/userprofile/RequestApprovalUpdateStudentFatherInfo`;
  }

  updateStudentMotherInfoUrl() {
    return `/userprofile/RequestApprovalUpdateStudentMotherInfo`;
  }

  updateStudentParentInfoUrl() {
    return `/userprofile/RequestApprovalUpdateStudentParentInfo`;
  }

  updateEmployeeProfileUrl() {
    return `/userprofile/RequestApprovalUpdateEmployeeProfile`;
  }

  updateEmployeePermanentAddressUrl() {
    return `/userprofile/RequestApprovalUpdateEmployeePermanentAddress`;
  }

  updateEmployeeContactAddressUrl() {
    return `/userprofile/RequestApprovalUpdateEmployeeContactAddress`;
  }

  updateEmployeeFamilyInfoUrl() {
    return `/userprofile/RequestApprovalUpdateEmployeeFamily`;
  }

  updateEmployeeEducationUrl() {
    return `/userprofile/RequestApprovalUpdateEmployeeEducation`;
  }

  updateEmployeeHonorUrl() {
    return `/userprofile/RequestApprovalUpdateEmployeeHonor`;
  }

  updateEmployeeTrainingUrl() {
    return `/userprofile/RequestApprovalUpdateEmployeeTraining`;
  }

  updateEmployeeOccupationalUrl() {
    return `/userprofile/RequestApprovalUpdateEmployeeOccupationalLicense`;
  }

  updateEmployeeDecorationUrl() {
    return `/userprofile/RequestApprovalUpdateEmployeeHistoryReceivingRoyalDecoration`;
  }

  getHealthTemperatureDataUrl(userId, schoolId, date) {
    return `/healthProfile?sid=${userId}&schoolid=${schoolId}&date=${date}`;
  }

  removeNotificationUrl() {
    return `/Notification/Remove`;
  }

  checkVerifyUrl(schoolID, userID, type, mode) {
    return `/user/CheckVerify?schoolID=${schoolID}&userID=${userID}&type=${type}&mode=${mode}`;
  }

  requestOTPUrl(schoolID, userID, type, email, phone) {
    return `/user/RequestOTP?schoolID=${schoolID}&userID=${userID}&type=${type}&email=${email}&phoneNumber=${phone}`;
  }

  recoveryRequestOTPUrl(schoolID, userID,  email) {
    return `/recoverdata/RequestOTP?schoolID=${schoolID}&userID=${userID}&email=${email}`;
  }


  verifyOTPUrl(schoolID, userID, type, requestCode, otp) {
    return `/user/VerifyOTP?schoolID=${schoolID}&userID=${userID}&type=${type}&requestCode=${requestCode}&otp=${otp}`;
  }

  recoveryVerifyOTPUrl(schoolID, userID, type, requestCode, otp) {
    return `/recoverdata/VerifyOTP?schoolID=${schoolID}&userID=${userID}&type=${type}&requestCode=${requestCode}&otp=${otp}`;
  }

  getLineConnectUrl(schoolID, userID) {
    return `/user/GetLINEConnectUrl?schoolID=${schoolID}&userID=${userID}`;
  }

  getLineDisConnectUrl(schoolID, userID) {
    return `/user/LINEDisconnect?schoolID=${schoolID}&userID=${userID}`;
  }

  getRSACodeUrl(code) {
    return `/device/encrypteddata?Code=${code}`;
  }
  getAPIUrls(appType) {
    return `/device/system/apiurls?applicationtype=${appType}`;
  }

  updateTokenUrl(token) {
    return `/account/updatedtoken`;
  }

  getTrustedDevices(UserID) {
    return `/device/gettrusteddevices?UserID=${UserID}`;
  }

  verifyDeviceUrl(channel) {
    return `/sendmessage/Verifierdevice?chanel=${channel}`;
  }

  verifyDeviceCheckUrl() {
    return `/device/verifier/check`;
  }

  getVerifiedDevices(){
    return `/Device/Verifier/List`;
  }

  sendMessagePasswordReset(UserID, schoolID, chanel){
    return `/sendmessage/forgotPassword?UserID=${UserID}&schoolID=${schoolID}&chanel=${chanel}`;
  }

  removeDevice(){
    return `/Device/Verifier/Remove`;
  }

  uploadRecoverData(Imei, requestCode){
    return `/recoverdata/student/upload?requestCode=${requestCode}&Imei=${Imei}`
  }

  uploadRecoverDataTeacher(Imei, requestCode){
    return `/recoverdata/teacher/upload?requestCode=${requestCode}&Imei=${Imei}`
  }

  updateLanguageUrl(lang){
    return `/Notification/languageUpdate?lang=${lang}`
  }

  getLogStatus(schoolID, date, logStatus, people){
    return `/takeschoolattendancereports/v2/Sum${people}/LogStatus?schoolid=${schoolID}&dayreports=${date}&logstatus=${logStatus}`
  }
  isOpenEditUserProfileUrl(schoolID){
    return `/userprofile/IsOpenEditUserProfile?schoolID=${schoolID}`
  }
  getStudentLeaveType(schoolID){
    return `/studentLeave/GetStudentLeaveType?schoolId=${schoolID}`
  }
  getTeacherLeaveType(schoolID){
    return `/studentLeave/GetTeacherLeaveType?schoolId=${schoolID}`
  }

  getVerification(){
    return `/verification`
  }

  getLeaveInfo(UserID) {
    return `/studentLeave/GetLeaveInfo?UserId=${UserID}`;
  }

  getBusList() {
    return '/GetBuses';
  }

  getTodayBusSchedule() {
    return `/GetBusTodaySchedules`;
  }

  getBusScheduleDetail() {
    return  '/GetScheduleDetail';
  }

  busStartTravel() {
    return '/StartTravel';
  }

  cacelBusTravel() {
    return '/CancelTravel';
  }

  completeBusTravel() {
    return '/CompleteTravel';
  }

  buscheckInStudent() {
    return '/CheckInStudent';
  }

  busCheckoutStudent() {
    return '/CheckOutStudent';
  }

  reOrderStudentQueue() {
    return '/Schedule/ReOrderStudents';
  }

  submitBusIndividualIncident() {
    return '/SubmitIncident/Individual';
  }

  submitBusGroupIncident() {
    return '/SubmitIncident/Group';
  }
}


export const apiUrls = new ApiUrls();
