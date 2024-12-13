import Color from '../constants/color';
import ApiManager from '../managers/ApiManager';
import { NativeModules } from 'react-native';
import Storage from '../managers/StorageManager';
import translang, { getCurrentLocale } from '../utils/language.utils';
import Images from '../themes/Images';

export const AttendanceStatusStudentValueArray = [0, 1, 3, 10, 11, 12, 99];
export const ClassAttendanceStatusStudentValueArray = [0, 1, 3, 4, 5, 6, 99];
export const AttendanceStatusValueArray = [
  0, 1, 3, 4, 10, 5, 11, 6, 12, 8, 9, 21, 22, 23, 24, 25, 26, 99,
];
export const AttendanceStatusMap = {
  0: {
    value: 0,
    title: translang.t('ATTENDANCE_STATUS_on_time'),
    colors: [Color.jungle_green, Color.downy],
  },
  1: {
    value: 1,
    title: translang.t('ATTENDANCE_STATUS_late'),
    colors: [Color.salmon, Color.macaroni_and_cheese],
  },
  3: {
    value: 1,
    title: translang.t('ATTENDANCE_STATUS_absence'),
    colors: [Color.red_orange, Color.bitter_sweet],
  },
  4: {
    value: 1,
    title: translang.t('ATTENDANCE_STATUS_event'),
    colors: [Color.science_blue, Color.picton_blue],
  },
  10: {
    value: 1,
    title: translang.t('ATTENDANCE_STATUS_event'),
    colors: [Color.science_blue, Color.picton_blue],
  },

  5: {
    value: 1,
    title: translang.t('ATTENDANCE_STATUS_personal_leave'),
    colors: [Color.seance, Color.medium_purple],
  },
  11: {
    value: 1,
    title: translang.t('ATTENDANCE_STATUS_personal_leave'),
    colors: [Color.seance, Color.medium_purple],
  },

  6: {
    value: 1,
    title: translang.t('ATTENDANCE_STATUS_sick_leave'),
    colors: [Color.electric_violet, Color.orchid],
  },
  12: {
    value: 1,
    title: translang.t('ATTENDANCE_STATUS_sick_leave'),
    colors: [Color.electric_violet, Color.orchid],
  },
  8: {
    value: 1,
    title: translang.t('ATTENDANCE_STATUS_holiday'),
    colors: [Color.scorpion, Color.gray],
  },
  9: {
    value: 1,
    title: translang.t('ATTENDANCE_STATUS_holiday'),
    colors: [Color.scorpion, Color.gray],
  },
  21: {
    value: 1,
    title: translang.t('MANTERNITY_LEAVE'),
    colors: [Color.scorpion, Color.gray],
  },
  22: {
    value: 1,
    title: translang.t('VACATION_LEAVE'),
    colors: [Color.scorpion, Color.gray],
  },
  23: {
    value: 1,
    title: translang.t('ORDINATION_LEAVE'),
    colors: [Color.scorpion, Color.gray],
  },
  24: {
    value: 1,
    title: translang.t('MILITARY_SERVICE_LEAVE'),
    colors: [Color.scorpion, Color.gray],
  },
  25: {
    value: 1,
    title: translang.t('STUDY_LEAVE'),
    colors: [Color.scorpion, Color.gray],
  },
  26: {
    value: 1,
    title: translang.t('GOVERNMENT_SERVICE_LEAVE'),
    colors: [Color.scorpion, Color.gray],
  },
  '-1': {
    value: 1,
    title: translang.t('ATTENDANCE_STATUS_undefined'),
    colors: [Color.scorpion, Color.gray],
  },
  99: {
    value: 1,
    title: translang.t('ATTENDANCE_STATUS_undefined'),
    colors: [Color.scorpion, Color.gray],
  },
};

export const AttendanceStatusMapOneColor = {
  0: {
    value: 0,
    title: translang.t('ATTENDANCE_STATUS_on_time'),
    color: Color.n_button_gradient_green_end,
    temp: getCurrentLocale(),
  },
  1: {
    value: 1,
    title: translang.t('ATTENDANCE_STATUS_late'),
    color: Color.n_default_brown,
    temp: getCurrentLocale(),
  },
  3: {
    value: 1,
    title: translang.t('ATTENDANCE_STATUS_absence'),
    color: Color.n_default_orange,
    temp: getCurrentLocale(),
  },
  4: {
    value: 1,
    title: translang.t('ATTENDANCE_STATUS_personal_leave'),
    color: Color.n_seance,
    temp: getCurrentLocale(),
  },
  10: {
    value: 1,
    title: translang.t('ATTENDANCE_STATUS_personal_leave'),
    color: Color.n_seance,
    temp: getCurrentLocale(),
  },
  5: {
    value: 1,
    title: translang.t('ATTENDANCE_STATUS_sick_leave'),
    color: Color.n_electric_violet,
    temp: getCurrentLocale(),
  },
  11: {
    value: 1,
    title: translang.t('ATTENDANCE_STATUS_sick_leave'),
    color: Color.n_electric_violet,
    temp: getCurrentLocale(),
  },
  6: {
    value: 1,
    title: translang.t('ATTENDANCE_STATUS_event'),
    color: Color.n_science_blue,
    temp: getCurrentLocale(),
  },
  12: {
    value: 1,
    title: translang.t('ATTENDANCE_STATUS_event'),
    color: Color.n_science_blue,
    temp: getCurrentLocale(),
  },
  8: {
    value: 1,
    title: translang.t('ATTENDANCE_STATUS_holiday'),
    color: Color.n_scorpion,
    temp: getCurrentLocale(),
  },
  9: {
    value: 1,
    title: translang.t('ATTENDANCE_STATUS_holiday'),
    color: Color.n_scorpion,
    temp: getCurrentLocale(),
  },
  21: {
    value: 1,
    title: translang.t('MANTERNITY_LEAVE'),
    color: Color.n_scorpion,
    temp: getCurrentLocale(),
  },
  22: {
    value: 1,
    title: translang.t('VACATION_LEAVE'),
    color: Color.n_scorpion,
    temp: getCurrentLocale(),
  },
  23: {
    value: 1,
    title: translang.t('ORDINATION_LEAVE'),
    color: Color.n_scorpion,
    temp: getCurrentLocale(),
  },
  24: {
    value: 1,
    title: translang.t('MILITARY_SERVICE_LEAVE'),
    color: Color.n_scorpion,
    temp: getCurrentLocale(),
  },
  25: {
    value: 1,
    title: translang.t('STUDY_LEAVE'),
    color: Color.n_scorpion,
    temp: getCurrentLocale(),
  },
  26: {
    value: 1,
    title: translang.t('GOVERNMENT_SERVICE_LEAVE'),
    color: Color.n_scorpion,
    temp: getCurrentLocale(),
  },
  '-1': {
    value: 1,
    title: translang.t('ATTENDANCE_STATUS_undefined'),
    color: Color.n_scorpion,
    temp: getCurrentLocale(),
  },
  99: {
    value: 1,
    title: translang.t('ATTENDANCE_STATUS_undefined'),
    color: Color.n_scorpion,
    temp: getCurrentLocale(),
  },
};

export const SchoolCalendarColor = {
  0: {
    color: Color.n_default_orange,
  },
  1: {
    color: Color.n_jungle_green,
  },
  2: {
    color: Color.n_electric_violet,
  },
  3: {
    color: Color.n_scorpion,
  },
  4: {
    color: Color.n_purple,
  },
  5: {
    color: Color.n_scorpion,
  },
};

export const StudentAttendanceValueArray = [0, 1, 2, 3, 4, 5, 6, 7];
export const StudentAttendanceColor = {
  0: {
    value: 0,
    color: Color.n_button_gradient_green_end,
  },
  1: {
    value: 1,
    color: Color.n_default_brown,
  },
  2: {
    value: 2,
    color: Color.n_default_orange,
  },
  3: {
    value: 3,
    color: Color.n_science_blue,
  },
  4: {
    value: 4,
    color: Color.n_electric_violet,
  },
  5: {
    value: 5,
    color: Color.n_seance,
  },
  6: {
    value: 6,
    color: Color.n_scorpion,
  },
  7: {
    value: 7,
    color: Color.n_scorpion,
  },
  '-1': {
    value: -1,
    color: Color.n_scorpion,
  },
};

export const defaultAllMenuStudent = {
  student_affairs: [
    {
      key: 'pickUp',
      image: Images.m_pickup,
      quick_menu: false,
      link: 'Pickup',
      func: 'link',
    },
    {
      key: 'sdqHomeVisit',
      image: Images.m_sdq,
      quick_menu: false,
      link: 'VisitHomeDetailStudent',
      func: 'link',
    },
  ],
  academic: [
    {
      key: 'TimetableStudent',
      image: Images.m_timetable,
      quick_menu: false,
      link: 'Timetable',
      func: 'link',
    },
    {
      key: 'onlineClassroom',
      image: Images.m_online_class,
      quick_menu: false,
      link: 'OnlineStudent',
      func: 'link',
    },
    {
      key: 'academicResult',
      image: Images.m_academic_result,
      quick_menu: false,
      link: 'Academic',
      func: 'link',
    },
  ],
  financial: [
    {
      key: 'topUp',
      image: Images.m_topup,
      quick_menu: false,
      link: 'Topup',
      func: 'link',
    },
    {
      key: 'shop',
      image: Images.m_shop,
      quick_menu: false,
      link: 'Shop',
      func: 'link',
    },
    {
      key: 'savings',
      image: Images.m_saving,
      quick_menu: false,
      link: 'Shop',
      func: 'coming',
    },
    {
      key: 'tuition',
      image: Images.m_tuition,
      section: 'financial',
      quick_menu: false,
      link: 'Tuition',
      func: 'link',
    },
  ],
  general: [
    {
      key: 'leave',
      image: Images.m_leave,
      quick_menu: false,
      link: 'FulldayLeave',
      func: 'modal',
      subMenu: [
        {
          key: 'leaveHalfDay',
          image: Images.m_leave_half_day,
          link: 'HalfdayLeave',
          func: 'gotoPageAfterLeavePermission',
        },
        {
          key: 'leaveFullDay',
          image: Images.m_leave_half_day,
          link: 'FulldayLeave',
          func: 'gotoPageAfterLeavePermission',
        },
      ],
    },
    {
      key: 'schoolBus',
      image: Images.m_school_bus,
      quick_menu: false,
      link: 'VehicleList',
      func: 'link',
    },
    {
      key: 'message',
      image: Images.m_message,
      quick_menu: false,
      link: 'Message',
      func: 'link',
    },
    {
      key: 'calendar',
      image: Images.m_calendar,
      quick_menu: false,
      link: 'SchoolCalendar',
      func: 'link',
    },
    {
      key: 'report',
      image: Images.m_report,
      quick_menu: false,
      link: 'Report',
      func: 'link',
    },
  ],
  other_service: [
    {
      key: 'alpha',
      image: Images.m_alpha,
      quick_menu: false,
      func: 'app',
      link: 'whatsapp://send?phone=1212121&text=adfadsfa',
    },
    {
      key: 'recycle_bank',
      image: Images.m_recycle_bank,
      quick_menu: false,
      func: 'coming',
    },
  ],
};
export const defaultAllMenuTeacher = {
  student_affairs: [
    {
      key: 'checkInAttendance',
      image: Images.m_checkin,
      quick_menu: false,
      link: 'AttendanceCheckIn',
      menuGroupID: 1,
      subMenuID: 3,
      func: 'gotoPageAfterAuth',
    },
    {
      key: 'editCheckInAttendance',
      image: Images.m_edit_checkin,

      quick_menu: false,
      link: 'AttendanceEditCheckin',
      menuGroupID: 1,
      subMenuID: 10,
      func: 'gotoPageAfterAuth',
    },
    {
      key: 'checkOutAttendance',
      image: Images.m_checkout,

      quick_menu: false,
      link: 'AttendanceCheckOut',
      menuGroupID: 1,
      subMenuID: 34,
      func: 'gotoPageAfterAuth',
    },
    {
      key: 'discipline',
      image: Images.m_discipline,

      quick_menu: false,
      link: 'BehaviorAdd',
      menuGroupID: 4,
      subMenuID: 6,
      func: 'modal',
      subMenu: [
        {
          key: 'addDisciplineScore',
          image: Images.m_reduce_score,

          quick_menu: false,
          link: 'BehaviorAdd',
          menuGroupID: 4,
          subMenuID: 6,
          func: 'gotoPageAfterAuth',
        },
        {
          key: 'reduceDisciplineScore',
          image: Images.m_reduce_score,

          quick_menu: false,
          link: 'BehaviorReduce',
          menuGroupID: 4,
          subMenuID: 12,
          func: 'gotoPageAfterAuth',
        },
      ],
    },

    {
      key: 'leaveRequest',
      image: Images.m_leave_request,

      quick_menu: false,
      link: 'LeaveRequest',
      func: 'link',
    },
    {
      key: 'sdqHomeVisit',
      image: Images.m_sdq,

      quick_menu: false,
      link: 'VisitHome',
      func: 'link',
    },
  ],
  academic: [
    {
      key: 'takeClassAttendance',
      image: Images.m_take_class,
      quick_menu: false,
      link: 'ClassAttendTake',
      menuGroupID: 2,
      subMenuID: 9,
      func: 'gotoPageAfterAuth',
    },
    {
      key: 'editClassAttendance',
      image: Images.m_edit_class,
      quick_menu: false,
      link: 'ClassAttendEdit',
      menuGroupID: 2,
      subMenuID: 11,
      func: 'gotoPageAfterAuth',
    },
    {
      key: 'onlineClassroom',
      image: Images.m_online_class,
      quick_menu: false,
      link: 'OnlineTeacher',
      func: 'link',
    },
    {
      key: 'TimetableTeacher',
      image: Images.m_timetable,
      quick_menu: false,
      link: 'Timetable',
      func: 'link',
    },
  ],
  financial: [
    {
      key: 'topUp',
      image: Images.m_topup,
      section: 'financial',
      quick_menu: false,
      link: 'Topup',
      func: 'link',
    },
    {
      key: 'shop',
      image: Images.m_shop,
      section: 'financial',
      quick_menu: false,
      link: 'Shop',
      func: 'link',
    },
    {
      key: 'savings',
      image: Images.m_saving,
      section: 'financial',
      quick_menu: false,
      link: 'Shop',
      func: 'coming',
    },
    {
      key: 'verifySlip',
      image: Images.m_verify_slip,
      section: 'financial',
      quick_menu: false,
      link: 'VerifySlip',
      func: 'link',
    }
  ],
  general: [
    {
      key: 'leave',
      image: Images.m_leave,
      quick_menu: false,
      link: 'FulldayLeave',
      func: 'modal',
      subMenu: [
        {
          key: 'leaveHalfDay',
          image: Images.m_leave_half_day,
          link: 'HalfdayLeave',
          func: 'gotoPageAfterLeavePermission',
        },
        {
          key: 'leaveFullDay',
          image: Images.m_leave_half_day,
          link: 'FulldayLeave',
          func: 'gotoPageAfterLeavePermission',
        },
      ],
    },
    {
      key: 'schoolBus',
      image: Images.m_school_bus,
      quick_menu: false,
      link: 'VehicleList',
      func: 'link',
    },
    {
      key: 'broadcast',
      image: Images.m_broadcast,
      quick_menu: false,
      link: 'Broadcast',
      menuGroupID: 13,
      subMenuID: 10,
      func: 'gotoPageAfterAuth',
    },
    {
      key: 'message',
      image: Images.m_message,

      quick_menu: false,
      link: 'Message',
      func: 'link',
    },
    {
      key: 'calendar',
      image: Images.m_calendar,
      quick_menu: false,
      link: 'SchoolCalendar',
      func: 'link',
    },
    {
      key: 'report',
      image: Images.m_report,
      quick_menu: false,
      link: 'ReportForTeacher',
      func: 'link',
    },
  ],
  other_service: [
    {
      key: 'alpha',
      image: Images.m_alpha,
      quick_menu: false,
      link: 'whatsapp://send?phone=1212121&text=adfadsfa',
      func: 'app',
    },
    {
      key: 'recycle_bank',
      image: Images.m_recycle_bank,
      quick_menu: false,
      func: 'coming',
    },
  ],
};

class Constant {
  static isRunning = false;
  static AddProfiles = [];
  static URL_API_SERVER = Constant.BASE_URL + '/api/v2';
  static STATIC_BASEURL = Constant.BASE_URL + '/static';
  static URLSTRING_FAQ = Constant.STATIC_BASEURL + '/FAQ.html';
  static URLSTRING_TOU = Constant.STATIC_BASEURL + '/TOU.html';

  static gotoAddedProfile = (item) => {
    ApiManager.signin(item.iduser, item.passuser, item.idschool)
      .then(async (success) => {
        if (!success) {
          const msg =
            translang.t('INCORRECT_USERNAME_PWD') +
            '\n' +
            translang.t('CONTACT_YOUER_SCHOOL_ADMIN');
          return Promise.reject(msg);
        } else {
          const user = await Storage.getUser();
          const userId = user.ID;
          const schoolId = user.SchoolId;
          return ApiManager.getUserInfo(userId, schoolId);
        }
      })
      .then(() => {
        this.props.navigation.navigate('MainScreen');
      })
      .catch((err) => {
        console.log('ADDED PROFILE', err);
      });
  };
}

export default Constant;
