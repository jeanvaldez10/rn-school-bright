import React from 'react';
import { Image, View, TouchableOpacity, ImageBackground, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import { ScrollView } from 'react-native-gesture-handler';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileModal from '../../components/ProfileModal';
import BackNavigationBar from '../../components/BackNavigationBar';
import IconInfoItem from '../../components/IconInfoItem';
import Storage from '../../managers/StorageManager';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import moment from 'moment';

import CardInfoItem from '../../components/CardInfoItem';
import GradientButton from '../../components/GradientButton';
import CustomTextInput from '../../components/CustomTextInput';
import GradientButtonWithImg from '../../components/GradientButtonWithImg';

import LinearGradient from 'react-native-linear-gradient';
import SwitchSelector from 'react-native-switch-selector';
import ApiManager from '../../managers/ApiManager';
import ProgressHud from '../../components/ProgressHud';
import httpClient from '../../utils/httpClient';
import { apiUrls } from '../../constants/ApiUrls';

import SchoolModal from '../../components/SchoolModal';
import GenderModal from '../../components/SelectListModal';
import StatusModal from '../../components/SelectListModal';
import EmployeeTypeModal from '../../components/SelectListModal';
import DepartmentModal from '../../components/SelectListModal';
import NationalModal from '../../components/SelectListModal';
import ReligionModal from '../../components/SelectListModal';
import CalendarModal from '../../components/CalendarModal';
import YearRangePickerModal from '../../components/YearRangePickerModal';
import EducationLevelModal from '../../components/SelectListModal';
import EducationTypeModal from '../../components/SelectListModal';
import TrainingStartCalendarModal from '../../components/CalendarModal';
import TrainingEndCalendarModal from '../../components/CalendarModal';
import WorkingStatusModal from '../../components/SelectListModal';
import DateWorkInCalendarModal from '../../components/CalendarModal';
import PackingOrderCalendarModal from '../../components/CalendarModal';
import OfficialStartCalendarModal from '../../components/CalendarModal';
import RetirementCalendarModal from '../../components/CalendarModal';
import CertificateDateCalendarModal from '../../components/CalendarModal';
import CertificateExpireCalendarModal from '../../components/CalendarModal';
import RoyalDatedCalendarModal from '../../components/CalendarModal';
import LicenseTypeModal from '../../components/SelectListModal';
import InsightYearModal from '../../components/SelectListModal';
import CustomSwitcher from '../../components/CustomSwitcher';


const InfoTextItem = (props) => {
  const { icon_mark, label, value_txt } = props;
  return (
    <View style={styles.menuItem} >
      {/* <Image source={icon_mark} style={[styles.image]}></Image> */}
      <View style={{ flexDirection: 'column' }}>
          <Text style={[styles.topText]}> {label} </Text>
          <Text style={[styles.bottomText]} multiline={true}> {value_txt}</Text>                  
      </View>
    </View>

  );
};

const InfoTextInputItem = (props) => {
  const { icon_mark, label, value_txt, onChangeText, notouch } = props;
  return (
    <View style={styles.menuItem} >
      {/* <Image source={icon_mark} style={[styles.image]}></Image> */}
      <View style={{ flexDirection: 'column', flex: 1}}>
        <Text style={[styles.topText]}> {label} </Text>
        <CustomTextInput
          inputStyle={{
            borderBottomWidth: 1,
            borderColor: Color.n_default_brown,
            ...styles.bottomText
          }}
          inputWrapperStyle={{
            borderColor: Color.n_default_brown,
            borderBottomWidth: 1,
          }}
          placeholder={""}
          value={value_txt.toString()}
          notouch = {notouch ?? false}
          placeholderTextColor={Color.n_text_placeholder_gray}
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
};

export default class ProfileTeacherMainNoTabScreen_TEMP extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      showModal: false,
      isEdit: false,
      profileType: '1',
      isLoading: false,

      valSchoolItem: null,
      valSchoolName: "",
      valName: "",
      valJob: "",
      valEmployeeTypeItem: {},
      valDepartment: "",
      valDepartmentItem: {},
      valGender: "",
      valGenderItem: {},
      valBirthday: "",
      valNational: "",
      valNationalItem: {},
      valReligion: "",
      valReligionItem: {},
      valStatusItem: {},
      valStatus: '',
      valPhoneNumber: "",
      valEmail: "",
      valAddress: "",

      valPeriod: "2556-2560",
      valEducationLevel: "Bachelor's degree",
      valEducationLevelItem: {},
      valEducationInstitution: "King Mongkut's University of Technology Thonburi",
      valHonorType: "Qualified",
      valDonatingAgency: "Ministry of Education",
      valYearReceived: "2562",
      valEducationType: "Train",
      valEducationTypeItem: {},
      valEducationProject: "School bright",
      valTrainingCourseName: "Score",
      valTrainingStartDate: "29/01/2565",
      valTrainingEndDate: "29/01/2565",
      valNumberHours: "3",
      valTrainingLocation: "Online",
      valTrainingCountry: "Thailand",
      valTrainingProvince: "Bangkok",
      valTrainingExpenses: "_",

      valWorkingStatus: "work",
      valWorkingStatusItem: {},
      valLevelGovernment: "1st grade teacher",
      valJobDateWorkIn: "10/10/2561",
      valJobPackingOrderDate: "10/12/2561",
      valJobSalary: "20,000",
      valJobOfficalStartDate: "10/10/2561",
      valJobPositionAllowance: "5,000",
      valJobAmountAcademy: "1,000",
      valJobRetirementDate: "10/10/2581",
      valJobTotalIncome: "26,000",
      valJobRemainingServiceLife: "15 Year 2 Month 2 Day",

      valLicenseType: "Teacher",
      valLicenseTypeItem: {},
      valLicenseNumber: "1111092",
      valLicenseName: "Teacher's license name",
      valAccompanyingCertificate: "12/12/2561",
      valCertificateExpire: "12/12/2566",
      valOrganizationAccompanyingCertificate: "Teachers Council",
      valRoyalyearReceived: "2563",
      valRoyalyearReceivedItem: {},
      valRoyalDecorationClass: "Thai Crown Silver Medal",
      valRoyalPosition: "Operational level teacher",
      valRoyalGovernmentVolumnNo: "137",
      valRoyalGovernmentPart: "2",
      valRoyalGovernmentNo: "19",
      valRoyalDated: "20/09/2563",


      showSchoolModal: false,
      showEmployeeTypeModal: false,
      showDepartmentModal: false,
      showGenderModal: false,
      showBirthdayDatePicker: false,
      showNationalModal: false,
      showReligionModal: false,
      showStatusModal: false,
      employeeTypeList: [],
      jobPositionList: [],
      departmentList: [],
      genderList: [{data: '0', title: translang.t('Male')}, {data: '1', title: translang.t('Female')}],
      nationalList: [],
      religionList: [],
      statusList: [],

      showEducationPeriodModal: false,
      showEducationLevelModal: false,
      showEducationTypeModal: false,
      showTrainingStartDatePicker: false,
      showTrainingEndDatePicker: false,
      educationLevelList: [],
      educationTypeList: [],

      showWorkingStatusModal: false,
      showDateWorkInDatePicker: false,
      showPackingOrderDatePicker: false,
      showOfficialStartDatePicker: false,
      showRetirementDatePicker: false,
      workingStatusList: [],

      showCertificateDateDatePicker: false,
      showCertificateExpireDatePicker: false,
      showRoyalDatedDatePicker: false,
      showLicenceTypeModal: false,
      showInsightYearModal: false,

      licenseTypeList:[],
      insightYearList:[],
      
    };
  }

  async componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", () => {     
      const userInfo = this.props.navigation.getParam('userInfo');
      this.setState({userInfo: userInfo}, ()=>{
        this.loadData();
        this.loadEmployeeType();
        this.loadJobPosition();
        this.loadDepartment();
        this.loadNational();
        this.loadReligion();
        this.loadPersonalStatus();
        this.loadEducationLevel();
        this.loadEducationType();
        this.loadWorkingStatus();
        this.loadLicenseType();
        this.loadInsightYear();
      })
    });
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.isFocused !== this.props.isFocused && this.props.isFocused === true) {
      const user = await Storage.getUserInfo();
      this.setState({ user });
    }
  }
  
  componentWillUnmount = () => {};

  loadData = () => {
    this.setState({ isLoading: true });
    const {userInfo} = this.state;
    // ApiManager.getEmployeeInfo(userInfo.SchoolID, userInfo.ID).then(data => {
    ApiManager.getEmployeeInfo("307", "477536").then(res => {

      const infoServer = res.data;

      params = {
        valSchoolName: infoServer.school,
        valName: infoServer.fullname,
        valJob: infoServer.employeeType,
        valDepartment: infoServer.department,
        valGender: infoServer.sex,
        valBirthday: infoServer.birthday,
        valNational: infoServer.nationality,
        valReligion: infoServer.religion,
        valStatus: infoServer.personalStatus,
        valPhoneNumber: infoServer.phoneNumber,
        valEmail: infoServer.email,
        valAddress: infoServer.houseNo + "/" + infoServer.villageNo + "/" + infoServer.lane + " " + infoServer.building + " " + infoServer.road + " " + infoServer.subDistrict + " " + infoServer.district + " " + infoServer.province + " " + infoServer.postalCode,

        valPeriod: infoServer.studyYear + " - " + infoServer.graduationYear,
        valEducationLevel: infoServer.educationLevel,
        valEducationInstitution: infoServer.institution,
        valHonorType: infoServer.honor,
        valDonatingAgency: infoServer.honorAgency,
        valYearReceived: infoServer.honorYear,
        valEducationType: infoServer.trainingType,
        valEducationProject: infoServer.projectName,
        valTrainingCourseName: infoServer.trainingName,
        valTrainingStartDate: infoServer.trainingStartDate,
        valTrainingEndDate: infoServer.trainingEndDate,
        valNumberHours: infoServer.trainingHours,
        valTrainingLocation: infoServer.trainingPlace,
        valTrainingCountry: infoServer.trainingCountry,
        valTrainingProvince: infoServer.trainingProvince,
        valTrainingExpenses: infoServer.expenses,
  
        valWorkingStatus: infoServer.workStatus,
        valLevelGovernment: infoServer.degree,
        valJobDateWorkIn: infoServer.workInEducationDate,
        valJobPackingOrderDate: infoServer.governmentOrderDate,
        valJobSalary: infoServer.salary,
        valJobOfficalStartDate: infoServer.workStartDate,
        valJobPositionAllowance: infoServer.positionMoney,
        valJobAmountAcademy: infoServer.academicStandingMoney ? infoServer.academicStandingMoney : '0',
        valJobRetirementDate: infoServer.retirementDate,
        valJobTotalIncome: infoServer.netSalary,
        valJobRemainingServiceLife: infoServer.remainingRetirementDays,
  
        valLicenseType: infoServer.licenseType,
        valLicenseNumber: infoServer.licenseNo,
        valLicenseName: infoServer.licenseName,
        valAccompanyingCertificate: infoServer.licenseIssuedDate,
        valCertificateExpire: infoServer.licenseExpireDate,
        valOrganizationAccompanyingCertificate: infoServer.licenseAgencyIssued,
        valRoyalyearReceived: infoServer.insigniaYear,
        valRoyalDecorationClass: infoServer.insigniaGrade,
        valRoyalPosition: infoServer.insigniaPosition,
        valRoyalGovernmentVolumnNo: infoServer.insigniaBookNumber,
        valRoyalGovernmentPart: infoServer.insigniaPart,
        valRoyalGovernmentNo: infoServer.insigniaNumber,
        valRoyalDated: infoServer.insigniaRecordDate,

        isLoading: false,
      };
      
      this.setState(params);
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });   
  };

  loadEmployeeType = () => {
    httpClient.get(apiUrls.getEmployeeTypeListUrl(this.state.userInfo.SchoolID))
    .then(response => response.data)
    .then(data => {
      this.setState({employeeTypeList: data.data});
    })
    .catch((error) => {
      console.error("Get EmployeeTypes", error);
    });
  }
  loadJobPosition = () => {
    httpClient.get(apiUrls.getJobPositionUrl(this.state.userInfo.SchoolID))
    .then(response => response.data)
    .then(data => {
      this.setState({jobPositionList: data.data});
    })
    .catch((error) => {
      console.error("Get JobPosition", error);
    });
  }
  loadDepartment = () => {
    httpClient.get(apiUrls.getDepartmentUrl(this.state.userInfo.SchoolID))
    .then(response => response.data)
    .then(data => {
      this.setState({departmentList: data.data});
    })
    .catch((error) => {
      console.error("Get JobPosition", error);
    });
  }
  loadNational = () => {
    httpClient.get(apiUrls.getNationalUrl(this.state.userInfo.SchoolID))
    .then(response => response.data)
    .then(data => {
      this.setState({nationalList: data.data});
    })
    .catch((error) => {
      console.error("Get National", error);
    });
  }
  loadReligion = () => {
    httpClient.get(apiUrls.getReligionUrl(this.state.userInfo.SchoolID))
    .then(response => response.data)
    .then(data => {
      this.setState({religionList: data.data});
    })
    .catch((error) => {
      console.error("Get Religion", error);
    });
  }
  loadPersonalStatus = () => {
    httpClient.get(apiUrls.getPersonalStatusUrl())
    .then(response => response.data)
    .then(data => {
      this.setState({statusList: data.data});
    })
    .catch((error) => {
      console.error("Get PersonalStatus", error);
    });
  }
  loadEducationLevel = () => {
    httpClient.get(apiUrls.getEducationLevelUrl())
    .then(response => response.data)
    .then(data => {
      this.setState({educationLevelList: data.data});
    })
    .catch((error) => {
      console.error("Get EducationLevel", error);
    });
  }
  loadEducationType = () => {
    httpClient.get(apiUrls.getEducationTypeUrl())
    .then(response => response.data)
    .then(data => {
      this.setState({educationTypeList: data.data});
    })
    .catch((error) => {
      console.error("Get EducationType", error);
    });
  }
  loadWorkingStatus = () => {
    httpClient.get(apiUrls.getWorkingStatusUrl())
    .then(response => response.data)
    .then(data => {
      this.setState({workingStatusList: data.data});
    })
    .catch((error) => {
      console.error("Get WorkingStatus", error);
    });
  }
  loadLicenseType = () => {
    httpClient.get(apiUrls.getLicenseTypeUrl())
    .then(response => response.data)
    .then(data => {
      this.setState({licenseTypeList: data.data});
    })
    .catch((error) => {
      console.error("Get LicenseType", error);
    });
  }
  loadInsightYear = () => {
    httpClient.get(apiUrls.getInsightYearUrl())
    .then(response => response.data)
    .then(data => {
      this.setState({insightYearList: data.data});
    })
    .catch((error) => {
      console.error("Get InsightYear", error);
    });
  }
  
  back = () => {
    // this.props.navigation.goBack();
    const parentRoute = this.props.navigation.getParam('parent') ?? 'App';
    this.props.navigation.navigate(parentRoute);
  };

  _onChangeSchool = () => {
    this.setState({
      showSchoolModal: true,
    });
  };
  onSchoolSelect = (item) => {
    if (item == null) {
      this.setState({ showSchoolModal: false })
    } else {
      this.setState({ showSchoolModal: false, valSchoolItem: item, valSchoolName: item.SchoolName })
    }
  };

  _onChangeGender = () => {
    this.setState({
      showGenderModal: true,
    });
  };
  onGenderSelect = (item) => {
    if (item == null) {
      this.setState({ showGenderModal: false })
    } else {
      this.setState({ showGenderModal: false, valGenderItem: item, valGender: item.title})
    }
  };

  _onChangeBirthday = () => {
    this.setState({
      showBirthdayDatePicker: true,
    });
  };
  onBirthdaySelect = (date) => {
    if (date === null || date === '') {
      this.setState({showBirthdayDatePicker: false});
      return;
    };
    this.setState({ valBirthday: date, showBirthdayDatePicker: false });
  };

  _onChangeStatus = () => {
    this.setState({
      showStatusModal: true,
    });
  };
  onStatusSelect = (item) => {
    if (item == null) {
      this.setState({ showStatusModal: false })
    } else {
      this.setState({ showStatusModal: false, valStatusItem: item, valStatus: item.title })
    }
  };

  _onChangeEmployeeType = () => {
    this.setState({showEmployeeTypeModal: true,});
  };
  onEmployeeTypeSelect = (item, index) => {
    if (item == null) {
      this.setState({ showEmployeeTypeModal: false })
    } else {
      this.setState({ showEmployeeTypeModal: false, valEmployeeTypeItem: this.state.employeeTypeList[index], valJob: item.title })
    }
  };

  _onChangeDepartment = () => {
    this.setState({showDepartmentModal: true,});
  };
  onDepartmentSelect = (item, index) => {
    if (item == null) {
      this.setState({ showDepartmentModal: false })
    } else {
      this.setState({ showDepartmentModal: false, valDepartmentItem: this.state.departmentList[index], valDepartment: item.title })
    }
  };

  _onChangeNational = () => {
    this.setState({showNationalModal: true,});
  };
  onNationalSelect = (item, index) => {
    if (item == null) {
      this.setState({ showNationalModal: false })
    } else {
      this.setState({ showNationalModal: false, valNationalItem: this.state.nationalList[index], valNational: item.title })
    }
  };
  
  _onChangeReligion = () => {
    this.setState({showReligionModal: true,});
  };
  onReligionSelect = (item, index) => {
    if (item == null) {
      this.setState({ showReligionModal: false })
    } else {
      this.setState({ showReligionModal: false, valReligionItem: this.state.religionList[index], valReligion: item.title })
    }
  };

  _onChangeEducationPeriod = () => {
    this.setState({showEducationPeriodModal: true,});
  };
  onEducationPeriodSelect = (res) => {
    if (res == null) {
      this.setState({ showEducationPeriodModal: false })
    } else {
      this.setState({ showEducationPeriodModal: false, valPeriod: `${res.start} - ${res.end}` })
    }
  };

  _onChangeEducationLevel = () => {
    this.setState({showEducationLevelModal: true,});
  };
  onEducationLevelSelect = (item, index) => {
    if (item == null) {
      this.setState({ showEducationLevelModal: false })
    } else {
      this.setState({ showEducationLevelModal: false, valEducationLevelItem: this.state.educationLevelList[index], valEducationLevel: item.title })
    }
  };

  _onChangeEducationType = () => {
    this.setState({showEducationTypeModal: true,});
  };
  onEducationTypeSelect = (item, index) => {
    if (item == null) {
      this.setState({ showEducationTypeModal: false })
    } else {
      this.setState({ showEducationTypeModal: false, valEducationTypeItem: this.state.educationTypeList[index], valEducationType: item.title })
    }
  };
  
  _onChangeTrainingStart = () => {
    this.setState({
      showTrainingStartDatePicker: true,
    });
  };
  onTrainingStartSelect = (date) => {
    if (date === null || date === '') {
      this.setState({showTrainingStartDatePicker: false});
      return;
    };
    this.setState({ valTrainingStartDate: date, showTrainingStartDatePicker: false });
  };

  _onChangeTrainingEnd = () => {
    this.setState({
      showTrainingEndDatePicker: true,
    });
  };
  onTrainingEndSelect = (date) => {
    if (date === null || date === '') {
      this.setState({showTrainingEndDatePicker: false});
      return;
    };
    this.setState({ valTrainingEndDate: date, showTrainingEndDatePicker: false });
  };

  _onChangeWorkingStatus = () => {
    this.setState({showWorkingStatusModal: true,});
  };
  onWorkingStatusSelect = (item, index) => {
    if (item == null) {
      this.setState({ showWorkingStatusModal: false })
    } else {
      this.setState({ showWorkingStatusModal: false, valWorkingStatusItem: this.state.workingStatusList[index], valWorkingStatus: item.title })
    }
  };

  _onChangeDateWorkIn = () => {
    this.setState({
      showDateWorkInDatePicker: true,
    });
  };
  onDateWorkInSelect = (date) => {
    if (date === null || date === '') {
      this.setState({showDateWorkInDatePicker: false});
      return;
    };
    this.setState({ valJobDateWorkIn: date, showDateWorkInDatePicker: false });
  };

  _onChangePackingOrder = () => {
    this.setState({showPackingOrderDatePicker: true,});
  };
  onPackingOrderSelect = (date) => {
    if (date === null || date === '') {
      this.setState({showDateWorkInDatePicker: false});
      return;
    };
    this.setState({ valJobPackingOrderDate: date, showPackingOrderDatePicker: false });
  };

  _onChangeOfficialStart = () => {
    this.setState({
      showOfficialStartDatePicker: true,
    });
  };
  onOfficialStartSelect = (date) => {
    if (date === null || date === '') {
      this.setState({showOfficialStartDatePicker: false});
      return;
    };
    this.setState({ valJobOfficalStartDate: date, showOfficialStartDatePicker: false });
  };

  _onChangeRetirement = () => {
    this.setState({
      showRetirementDatePicker: true,
    });
  };
  onRetirementSelect = (date) => {
    if (date === null || date === '') {
      this.setState({showRetirementDatePicker: false});
      return;
    };
    this.setState({ valJobRetirementDate: date, showRetirementDatePicker: false });
  };

  _onChangeCertificateDate = () => {
    this.setState({
      showCertificateDateDatePicker: true,
    });
  };
  onCertificateDateSelect = (date) => {
    if (date === null || date === '') {
      this.setState({showCertificateDateDatePicker: false});
      return;
    };
    this.setState({ valAccompanyingCertificate: date, showCertificateDateDatePicker: false });
  };

  _onChangeCertificateExpire = () => {
    this.setState({
      showCertificateExpireDatePicker: true,
    });
  };
  onCertificateExpireSelect = (date) => {
    if (date === null || date === '') {
      this.setState({showCertificateExpireDatePicker: false});
      return;
    };
    this.setState({ valCertificateExpire: date, showCertificateExpireDatePicker: false });
  };

  _onChangeRoyalDated = () => {
    this.setState({
      showRoyalDatedDatePicker: true,
    });
  };
  onRoyalDatedSelect = (date) => {
    if (date === null || date === '') {
      this.setState({showRoyalDatedDatePicker: false});
      return;
    };
    this.setState({ valRoyalDated: date, showRoyalDatedDatePicker: false });
  };

  _onChangeLicenseType = () => {
    this.setState({showLicenceTypeModal: true,});
  };
  onLicenseTypeSelect = (item, index) => {
    if (item == null) {
      this.setState({ showLicenceTypeModal: false })
    } else {
      this.setState({ showLicenceTypeModal: false, valLicenseTypeItem: this.state.licenseTypeList[index], valLicenseType: item.title })
    }
  };

  _onChangeInsightYear = () => {
    this.setState({showInsightYearModal: true,});
  };
  onInsightYearSelect = (item, index) => {
    if (item == null) {
      this.setState({ showInsightYearModal: false })
    } else {
      this.setState({ showInsightYearModal: false, valRoyalyearReceivedItem: this.state.insightYearList[index], valRoyalyearReceived: item.title })
    }
  };

  onChangeSwitcher = (index) => {
    this.setState({profileType: index, isEdit: false})
  }

  render() {
    const user = this.state.userInfo;
    let schoolImage = Images.school;
    let profileImage = Images.teacher_02;
    let logo = Images.n_img_card_logo;
    let userName = this.state.valName??"";
    let userName_first = "-";
    let userName_last = "-";

    const nameArray = userName.split(' ');
    if (nameArray.length > 0) {
      userName_first = nameArray[0];
    }
    if (nameArray.length > 1) {
      userName_last = nameArray[nameArray.length - 1];
    }
    
    if (user !== {}) {
      if (user.school_image !== null && user.school_image !== '') {
        schoolImage = {uri: user.school_image};
      }
      if (user.school_logo !== null && user.school_logo !== '') {
        logo = {uri: user.school_logo};
      }
      if (user.image !== null && user.image !== '') {
        profileImage = {uri: user.image};
      }

      if (user.dBirth !== null && user.dBirth !== '') {
        birthday = moment(user.dBirth).format('DD/MM/YYYY');
      }
    }
  
    const valPeriod = this.state.valPeriod;
    const tmp = valPeriod.split('-');
    
    const valPeriod_start = parseInt(tmp[0])??0;
    const valPeriod_end = parseInt(tmp[1])??0;

    const options = [
        { title: translang.t('BASIC_INFORMATION')},
        { title: translang.t('EDUCATIONAL_INFORMATION')},
        { title: translang.t('JOB_POSITION_INFORMATION')+translang.t('TEACHING_INFORMATION')},
        { title: translang.t('OCCUPATIONAL_LICENSE')},
    ];

    const employeeTypeList = this.state.employeeTypeList.map( item => {
      return { title: item.employeeType??"" };
    });
    const departmentList = this.state.departmentList.map( item => {
      return { title: item.department??""};
    });
    const nationalList = this.state.nationalList.map( item => {
      return { title: item.nation??""};
    });
    const religionList = this.state.religionList.map( item => {
      return { title: item.religion??""};
    });
    const statusList = this.state.statusList.map( item => {
      return { title: item.value??""};
    });
    const educationLevelList = this.state.educationLevelList.map( item => {
      return { title: item.value??""};
    });
    const educationTypeList = this.state.educationTypeList.map( item => {
      return { title: item.value??""};
    });
    const workingStatusList = this.state.workingStatusList.map( item => {
      return { title: item.value??""};
    });
    const licenseTypeList = this.state.licenseTypeList.map( item => {
      return { title: item.value??""};
    });
    const insightYearList = this.state.insightYearList.map( item => {
      return { title: item.value??""};
    });
    
    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_profile')}
          onMenuTap={() => this.back()}
        />
        <ScrollView style={styles.container}>

          <CustomSwitcher
            dataList={options}
            selectedIndex={this.state.profileType ?? 0}
            onChangedSwitch={(index)=>this.onChangeSwitcher(index)}
            containerStyle = {{width: '90%', height: 60, marginTop: 20, marginBottom: 20}}
            radius = {20}
            textSize = {13}
          />

          <ImageBackground source={schoolImage} style={styles.headerImgContainer}>
            <TouchableOpacity style={styles.cardContainer} activeOpacity={0.9}
              onPress={() => this.setState({ showModal: true })}>

              <Image source={Images.n_img_card_back} style={{resizeMode: 'stretch', position: 'absolute', width: '100%', height: '100%', flex: 1}}></Image>      

              <LinearGradient
                style={styles.schoolNameStyle}
                start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                colors={[Color.n_button_gradient_orange_end, Color.n_button_gradient_orange_start]}>
                <Image source={logo} style={{width: 20, height: 20, resizeMode: 'contain', marginTop: 5}}/>
                <View style={{marginLeft: 20,}}>
                  <Text style={{...styles.schoolName, fontSize: 10,}}>{user.SchoolName ?? ''}</Text>
                  <Text style={styles.schoolName}>{user.SchoolName ?? ''}</Text>
                </View>
              </LinearGradient>
              
              <View style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginTop: 'auto', marginBottom: 'auto'}}>
                <Image source={profileImage} style={{ height: 86, width: 70, borderRadius: 5, resizeMode: 'contain', marginRight: 10}}></Image>
                <View style={{flex: 1}}>
                  <CardInfoItem
                    title={translang.t('PROFILE_EMPLOYEE_ID')}
                    value_txt={user.ID ?? '-'}
                    titleFontSize={11}
                    infoFontSize={12}/>

                  <CardInfoItem
                    title={translang.t('PROFILE_firstname')}
                    value_txt={userName_first ?? '-'}
                    titleFontSize={11}
                    infoFontSize={12}/>

                  <CardInfoItem
                    title={translang.t('PROFILE_lastname')}
                    value_txt={userName_last ?? '-'}
                    titleFontSize={11}
                    infoFontSize={12}/>

                  <CardInfoItem
                    title={translang.t('PROFILE_department')}
                    value_txt={this.state.valDepartment ?? '-'}
                    titleFontSize={11}
                    infoFontSize={12}/>

                  <CardInfoItem
                    title={translang.t('PROFILE_position')}
                    value_txt={this.state.valJob ?? '-'}
                    titleFontSize={11}
                    infoFontSize={12}/>                  
                </View>
              </View>
            </TouchableOpacity >
          </ImageBackground>

          <View style={{marginTop: 20,}}>
            {!this.state.isEdit &&<>
              {this.state.profileType == '0' && 
              
              <View>
                <InfoTextItem
                  icon_mark={Images.ic_hat_blue}
                  label={translang.t('PROFILE_school')}
                  value_txt={this.state.valSchoolName ?? '_'}
                  imageSize={36}/>
                  
                <InfoTextItem
                  icon_mark={Images.ic_user_blue}
                  label={translang.t('PROFILE_firstname') + "-" + translang.t('PROFILE_lastname')}
                  value_txt={this.state.valName ?? '_'}
                  imageSize={36}/>

                <InfoTextItem
                  icon_mark={Images.ic_new_chair}
                  label={translang.t('PROFILE_PERSONAL_TYPE')}
                  value_txt={this.state.valJob ?? '_'}
                  imageSize={36}/>

                <InfoTextItem
                  icon_mark={Images.ic_new_chair}
                  label={translang.t('PROFILE_department')}
                  value_txt={this.state.valDepartment ?? '_'}
                  imageSize={36}/>

                <InfoTextItem
                  icon_mark={Images.ic_sex_blue}
                  label={translang.t('PROFILE_gender')}
                  value_txt={this.state.valGender ?? "_"}
                  imageSize={36}
                />

                <InfoTextItem
                  icon_mark={Images.ic_calendar_blue}
                  label={translang.t('PROFILE_birthday')}
                  value_txt={moment(this.state.valBirthday).format('DD/MM/YYYY') ?? '_'}
                  imageSize={36}
                />

                <View style={{flexDirection: 'row'}}>
                  <View style={{flex: 1}}>
                    <InfoTextItem
                      icon_mark={Images.ic_flag_blue}
                      label={translang.t('PROFILE_Nationality')}
                      value_txt={this.state.valNational ?? "_" }
                      imageSize={36}
                    />
                  </View>
                  
                  <View style={{flex: 1}}>
                    <InfoTextItem
                      icon_mark={Images.ic_behavior_score}
                      label={translang.t('PROFILE_Religion')}
                      value_txt={this.state.valReligion ?? "_"}
                      imageSize={36}
                    />
                  </View>
                </View>

                <InfoTextItem
                  icon_mark={Images.ic_family_blue}
                  label={translang.t('STATUS')}
                  value_txt={this.state.valStatus ?? "_"}
                  imageSize={36}
                />

                <InfoTextItem
                  icon_mark={Images.ic_call_blue}
                  label={translang.t('PROFILE_phonenumber')}
                  value_txt={this.state.valPhoneNumber ?? '_'}
                  imageSize={36}
                />

                <InfoTextItem
                  icon_mark={Images.ic_envelope_new}
                  label={translang.t('PROFILE_email')}
                  value_txt={this.state.valEmail ?? '_'}
                  imageSize={36}
                />
                  
                <InfoTextItem
                  icon_mark={Images.ic_location_blue}
                  label={translang.t('LEAVE_address')}
                  value_txt={this.state.valAddress ?? '-'}
                  imageSize={36}
                />
              </View>}
              {this.state.profileType == '1' && 
              <View>
                <Text style={styles.titleTextStyle}>{translang.t('EDUCATIONAL_INFORMATION')}</Text>
                <View style={{height: 2, backgroundColor: Color.n_default_brown, marginHorizontal: 30,}}></View>
                <InfoTextItem
                  label={translang.t('PROFILE_PERIOD')}
                  value_txt={this.state.valPeriod ? this.state.valPeriod : "_"}/>
                <InfoTextItem
                  label={translang.t('PROFILE_EDUCATION_LEVEL')}
                  value_txt={this.state.valEducationLevel ? this.state.valEducationLevel : "_"}/>
                <InfoTextItem
                  label={translang.t('PROFILE_EDUCATION_INSTITUTION')}
                  value_txt={this.state.valEducationInstitution ? this.state.valEducationInstitution : "_"}/>


                <Text style={styles.titleTextStyle}>{translang.t('PROFILE_HONOR_INFORMATION')}</Text>
                <View style={{height: 2, backgroundColor: Color.n_default_brown, marginHorizontal: 30,}}></View>
                <InfoTextItem
                  label={translang.t('PROFILE_HONOR_TYPE')}
                  value_txt={this.state.valHonorType ? this.state.valHonorType : "_"}/>
                <InfoTextItem
                  label={translang.t('PROFILE_DONATING_AGENCY')}
                  value_txt={this.state.valDonatingAgency ? this.state.valDonatingAgency : "_"}/>
                <InfoTextItem
                  label={translang.t('PROFILE_YEAR_RECEIVED')}
                  value_txt={this.state.valYearReceived ? this.state.valYearReceived : "_"}/>

                <Text style={styles.titleTextStyle}>{translang.t('PROFILE_EDUCATION') + "," + translang.t("PROFILE_TRAINING") + "," + translang.t("PROFILE_JOB_VIEWING")}</Text>
                <View style={{height: 2, backgroundColor: Color.n_default_brown, marginHorizontal: 30,}}></View>
                <InfoTextItem
                  label={translang.t('PROFILE_TYPE')}
                  value_txt={this.state.valEducationType ? this.state.valEducationType : "_"}/>
                <InfoTextItem
                  label={translang.t('PROFILE_PROJECT')}
                  value_txt={this.state.valEducationProject ? this.state.valEducationProject : "_"}/>
                <InfoTextItem
                  label={translang.t('PROFILE_TRAINING_COURSE_NAME')}
                  value_txt={this.state.valTrainingCourseName ? this.state.valTrainingCourseName : "_"}/>
                <View style={{flexDirection: 'row'}}>
                  <View style={{flex: 1}}>
                    <InfoTextItem
                      label={translang.t('PROFILE_TRAINING_START_DATE')}
                      value_txt={this.state.valTrainingStartDate ? moment(this.state.valTrainingStartDate).format("DD/MM/YYYY") : "_"}/>
                  </View>
                  
                  <View style={{flex: 1}}>
                    <InfoTextItem
                      label={translang.t('PROFILE_TRAINING_END_DATE')}
                      value_txt={this.state.valTrainingEndDate ? moment(this.state.valTrainingEndDate).format("DD/MM/YYYY") : "_"}/>
                  </View>
                </View>
                <InfoTextItem
                  label={translang.t('PROFILE_NUMBER_OF_HOURS')}
                  value_txt={this.state.valNumberHours ? this.state.valNumberHours : "_"}/>
                <InfoTextItem
                  label={translang.t('PROFILE_LOCATION')}
                  value_txt={this.state.valTrainingLocation ? this.state.valTrainingLocation : "_"}/>
                <InfoTextItem
                  label={translang.t('PROFILE_COUNTRY')}
                  value_txt={this.state.valTrainingCountry ? this.state.valTrainingCountry : "_"}/>
                <InfoTextItem
                  label={translang.t('PROFILE_PROVINCE')}
                  value_txt={this.state.valTrainingProvince ? this.state.valTrainingProvince : "_"}/>
                <InfoTextItem
                  label={translang.t('PROFILE_EXPENSES')}
                  value_txt={this.state.valTrainingExpenses ? this.state.valTrainingExpenses : "_"}/>
              </View>}

              {this.state.profileType == '2' && 
              <View>
                <Text style={styles.titleTextStyle}>{translang.t('JOB_POSITION_INFORMATION')}</Text>
                <View style={{height: 2, backgroundColor: Color.n_default_brown, marginHorizontal: 30,}}></View>
                <InfoTextItem
                  label={translang.t('PROFILE_WORKING_STATUS')}
                  value_txt={this.state.valWorkingStatus ? this.state.valWorkingStatus : "_"}/>
                <InfoTextItem
                  label={translang.t('PROFILE_LEVEL_GOVERNMENT')}
                  value_txt={this.state.valLevelGovernment ? this.state.valLevelGovernment : "_"}/>
                <InfoTextItem
                  label={translang.t('PROFILE_DATE_OF_WORK_IN')}
                  value_txt={this.state.valJobDateWorkIn ? moment(this.state.valJobDateWorkIn).format('DD/MM/YYYY') : "_"}/>
                <InfoTextItem
                  label={translang.t('PROFILE_PACKING_ORDER_DATE')}
                  value_txt={this.state.valJobPackingOrderDate ? moment(this.state.valJobPackingOrderDate).format('DD/MM/YYYY') : "_"}/>
                <InfoTextItem
                  label={translang.t('PROFILE_SALARY')}
                  value_txt={this.state.valJobSalary ? this.state.valJobSalary : "_"}/>
                <InfoTextItem
                  label={translang.t('PROFILE_OFFICIAL_START_DATE')}
                  value_txt={this.state.valJobOfficalStartDate ? moment(this.state.valJobOfficalStartDate).format('DD/MM/YYYY') : "_"}/>
                <InfoTextItem
                  label={translang.t('PROFILE_POSITION_ALLOWANCE')}
                  value_txt={this.state.valJobPositionAllowance ? this.state.valJobPositionAllowance : "_"}/>
                <InfoTextItem
                  label={translang.t('PROFILE_AMOUNT_ACADEMY_STANDING')}
                  value_txt={this.state.valJobAmountAcademy ? this.state.valJobAmountAcademy : "_"}/>
                <InfoTextItem
                  label={translang.t('PROFILE_RETIREMENT_DATE')}
                  value_txt={this.state.valJobRetirementDate ? moment(this.state.valJobRetirementDate).format('DD/MM/YYYY') : "_"}/>
                <InfoTextItem
                  label={translang.t('PROFILE_TOTAL_NET_INCOME')}
                  value_txt={this.state.valJobTotalIncome ? this.state.valJobTotalIncome : "_"}/>
                <InfoTextItem
                  label={translang.t('PROFILE_REMAINING_SERVICE_LIFE')}
                  value_txt={this.state.valJobRemainingServiceLife ? this.state.valJobRemainingServiceLife : "_"}/>
              </View>}
              
              {this.state.profileType == '3' && 
              <View>
                <Text style={styles.titleTextStyle}>{translang.t('OCCUPATIONAL_LICENSE')}</Text>
                <View style={{height: 2, backgroundColor: Color.n_default_brown, marginHorizontal: 30,}}></View>
                <InfoTextItem
                  label={translang.t('PROFILE_PROFESSIONAL_LICENSE_TYPE')}
                  value_txt={this.state.valLicenseType ? this.state.valLicenseType : "_"}/>
                <InfoTextItem
                  label={translang.t('PROFILE_PROFESSIONAL_LICENSE_NUMBER')}
                  value_txt={this.state.valLicenseNumber ? this.state.valLicenseNumber : "_"}/>
                <InfoTextItem
                  label={translang.t('PROFILE_PROFESSIONAL_LICENSE_NAME')}
                  value_txt={this.state.valLicenseName ? this.state.valLicenseName : "_"}/>
                <InfoTextItem
                  label={translang.t('PROFILE_DATE_ISSUE_ACCOMPANYING_CERTIFICATE')}
                  value_txt={this.state.valAccompanyingCertificate ? moment(this.state.valAccompanyingCertificate).format('DD/MM/YYYY') : "_"}/>
                <InfoTextItem
                  label={translang.t('PROFILE_CERTIFICATE_EXPIRATION_DATE')}
                  value_txt={this.state.valCertificateExpire ? moment(this.state.valCertificateExpire).format('DD/MM/YYYY') : "_"}/>
                <InfoTextItem
                  label={translang.t('PROFILE_ORGANIZATION_ACCOMPANYING_CERTIFICATE')}
                  value_txt={this.state.valOrganizationAccompanyingCertificate ? this.state.valOrganizationAccompanyingCertificate : "_"}/>

                <Text style={styles.titleTextStyle}>{translang.t('PROFILE_HISTORY_ROYAL_DECORATION')}</Text>
                <View style={{height: 2, backgroundColor: Color.n_default_brown, marginHorizontal: 30,}}></View>
                <InfoTextItem
                  label={translang.t('PROFILE_YEAR_RECEIVED')}
                  value_txt={this.state.valRoyalyearReceived ? this.state.valRoyalyearReceived : "_"}/>
                <InfoTextItem
                  label={translang.t('PROFILE_ROYAL_DECORATION_CLASS')}
                  value_txt={this.state.valRoyalDecorationClass ? this.state.valRoyalDecorationClass : "_"}/>
                <InfoTextItem
                  label={translang.t('PROFILE_position')}
                  value_txt={this.state.valRoyalPosition ? this.state.valRoyalPosition : "_"}/>
                <View style={{flexDirection: 'row'}}>
                  <View style={{flex: 1}}>
                    <InfoTextItem
                      label={translang.t('PROFILE_ROYAL_GOVERNMENT_VOLUME_NO')}
                      value_txt={this.state.valRoyalGovernmentVolumnNo ? this.state.valRoyalGovernmentVolumnNo : "_"}/>
                  </View>
                  
                  <View style={{flex: 1}}>
                    <InfoTextItem
                      label={translang.t('PROFILE_ROYAL_GOVERNMENT_PART')}
                      value_txt={this.state.valRoyalGovernmentPart ? this.state.valRoyalGovernmentPart : "_"}/>
                  </View>
                </View>
                <InfoTextItem
                  label={translang.t('PROFILE_ROYAL_GOVERNMENT_NO')}
                  value_txt={this.state.valRoyalGovernmentNo ? this.state.valRoyalGovernmentNo : "_"}/>
                <InfoTextItem
                  label={translang.t('PROFILE_DATED')}
                  value_txt={this.state.valRoyalDated ? moment(this.state.valRoyalDated).format('DD/MM/YYYY') : "_"}/>
              </View>}
              
              <View style={{marginVertical: 30, flexDirection:'row', justifyContent: 'center'}}>
                <GradientButtonWithImg
                  label={translang.t('PROFILE_edit')}
                  iconImage={Images.n_ic_pencil_white}
                  containerStyle={{ width: 255, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
                  buttonStyle={{ borderRadius: 38, height: 75 }}
                  colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                  isVerticalGradient={false}
                  _onPress={() => {this.setState({isEdit: true})}} 
                  />
              </View>  
            </>}

            {this.state.isEdit &&<>
              {this.state.profileType == '0' && 
              <View>
                <TouchableOpacity onPress={this._onChangeSchool}>
                  <InfoTextInputItem
                    label={translang.t('PROFILE_school')}
                    value_txt={this.state.valSchoolName ? this.state.valSchoolName : '_'}
                    notouch = "true"/>
                </TouchableOpacity>
                
                <InfoTextInputItem
                  label={translang.t('PROFILE_firstname') + "" + translang.t('PROFILE_lastname')}
                  value_txt={this.state.valName ?? ''}
                  onChangeText={(val)=>this.setState({valName: val})}/>
                <TouchableOpacity onPress={this._onChangeEmployeeType}>
                  <InfoTextInputItem
                    icon_mark={Images.ic_new_chair}
                    label={translang.t('PROFILE_PERSONAL_TYPE')}
                    value_txt={this.state.valJob ?? ''}
                    notouch = "true"/>
                </TouchableOpacity>
                <TouchableOpacity onPress={this._onChangeDepartment}>
                  <InfoTextInputItem
                    label={translang.t('PROFILE_department')}
                    value_txt={this.state.valDepartment ?? ''}
                    notouch="true"/>
                </TouchableOpacity>
                

                <TouchableOpacity onPress={this._onChangeGender}>
                  <InfoTextInputItem
                    label={translang.t('PROFILE_gender')}
                    value_txt={this.state.valGender ? this.state.valGender : ""}
                    notouch = {true}
                  />  
                </TouchableOpacity>
                
                <TouchableOpacity onPress={this._onChangeBirthday}>
                  <InfoTextInputItem
                    label={translang.t('PROFILE_birthday')}
                    value_txt={moment(this.state.valBirthday).format('DD/MM/YYYY') ?? ''}
                    notouch = {true}/>
                </TouchableOpacity>

                <View style={{flexDirection: 'row', marginRight: 20}}>
                  <View style={{flex: 1, marginRight: 10}}>
                    <TouchableOpacity onPress={this._onChangeNational}>
                      <InfoTextInputItem
                        label={translang.t('PROFILE_Nationality')}
                        value_txt={this.state.valNational ?? ""}
                        notouch={true}/>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={{flex: 1}}>
                    <TouchableOpacity onPress={this._onChangeReligion}>
                      <InfoTextInputItem
                        label={translang.t('PROFILE_Religion')}
                        value_txt={this.state.valReligion ?? ""}
                        notouch={true}/>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity onPress={this._onChangeStatus}>
                  <InfoTextInputItem
                    icon_mark={Images.ic_family_blue}
                    label={translang.t('STATUS')}
                    value_txt={this.state.valStatus}
                    imageSize={36}
                    notouch = {true}
                  />
                </TouchableOpacity>
                
                <InfoTextInputItem
                  icon_mark={Images.ic_call_blue}
                  label={translang.t('PROFILE_phonenumber')}
                  value_txt={this.state.valPhoneNumber? this.state.valPhoneNumber : ""}
                  imageSize={36}
                  onChangeText={(val)=>this.setState({valPhoneNumber: val})}/>
                <InfoTextInputItem
                  icon_mark={Images.ic_envelope_new}
                  label={translang.t('PROFILE_email')}
                  value_txt={this.state.valEmail? this.state.valEmail : user.sEmail}
                  imageSize={36}
                  onChangeText={(val)=>this.setState({valEmail: val})}/>
                
                <InfoTextInputItem
                  icon_mark={Images.ic_location_blue}
                  label={translang.t('LEAVE_address')}
                  value_txt={this.state.valAddress? this.state.valAddress : ""}
                  imageSize={36}
                  onChangeText={(val)=>this.setState({valAddress: val})}/>
              </View>}
              {this.state.profileType == '1' && 
              <View>
                <Text style={styles.titleTextStyle}>{translang.t('EDUCATIONAL_INFORMATION')}</Text>
                <View style={{height: 2, backgroundColor: Color.n_default_brown, marginHorizontal: 30,}}></View>
                <TouchableOpacity onPress={this._onChangeEducationPeriod}>
                  <InfoTextInputItem
                    label={translang.t('PROFILE_PERIOD')}
                    value_txt={this.state.valPeriod ? this.state.valPeriod : ""}
                    notouch={true}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={this._onChangeEducationLevel}>
                  <InfoTextInputItem
                    label={translang.t('PROFILE_EDUCATION_LEVEL')}
                    value_txt={this.state.valEducationLevel ? this.state.valEducationLevel : ""}
                    notouch={true}/>
                </TouchableOpacity>
                <InfoTextInputItem
                  label={translang.t('PROFILE_EDUCATION_INSTITUTION')}
                  value_txt={this.state.valEducationInstitution ? this.state.valEducationInstitution : ""}
                  onChangeText={(val)=>this.setState({valEducationInstitution: val})}/>

                <Text style={styles.titleTextStyle}>{translang.t('PROFILE_HONOR_INFORMATION')}</Text>
                <View style={{height: 2, backgroundColor: Color.n_default_brown, marginHorizontal: 30,}}></View>
                <InfoTextInputItem
                  label={translang.t('PROFILE_HONOR_TYPE')}
                  value_txt={this.state.valHonorType ? this.state.valHonorType : ""}
                  onChangeText={(val)=>this.setState({valHonorType: val})}/>
                <InfoTextInputItem
                  label={translang.t('PROFILE_DONATING_AGENCY')}
                  value_txt={this.state.valDonatingAgency ? this.state.valDonatingAgency : ""}
                  onChangeText={(val)=>this.setState({valDonatingAgency: val})}/>
                <InfoTextInputItem
                  label={translang.t('PROFILE_YEAR_RECEIVED')}
                  value_txt={this.state.valYearReceived ? this.state.valYearReceived : ""}
                  onChangeText={(val)=>this.setState({valYearReceived: val})}/>

                <Text style={styles.titleTextStyle}>{translang.t('PROFILE_EDUCATION') + "," + translang.t("PROFILE_TRAINING") + "," + translang.t("PROFILE_JOB_VIEWING")}</Text>
                <View style={{height: 2, backgroundColor: Color.n_default_brown, marginHorizontal: 30,}}></View>
                <TouchableOpacity onPress={this._onChangeEducationType}>
                  <InfoTextInputItem
                    label={translang.t('PROFILE_TYPE')}
                    value_txt={this.state.valEducationType ? this.state.valEducationType : ""}
                    notouch={true}/>
                </TouchableOpacity>
                <InfoTextInputItem
                  label={translang.t('PROFILE_PROJECT')}
                  value_txt={this.state.valEducationProject ? this.state.valEducationProject : ""}
                  onChangeText={(val)=>this.setState({valEducationProject: val})}/>
                <InfoTextInputItem
                  label={translang.t('PROFILE_TRAINING_COURSE_NAME')}
                  value_txt={this.state.valTrainingCourseName ? this.state.valTrainingCourseName : ""}
                  onChangeText={(val)=>this.setState({valTrainingCourseName: val})}/>
                <View style={{flexDirection: 'row'}}>
                  <View style={{flex: 1}}>
                    <TouchableOpacity onPress={this._onChangeTrainingStart}>
                      <InfoTextInputItem
                        label={translang.t('PROFILE_TRAINING_START_DATE')}
                        value_txt={this.state.valTrainingStartDate ? moment(this.state.valTrainingStartDate).format("DD/MM/YYYY") : "_"}
                        notouch={true}/>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={{flex: 1}}>
                    <TouchableOpacity onPress={this._onChangeTrainingEnd}>
                      <InfoTextInputItem
                        label={translang.t('PROFILE_TRAINING_END_DATE')}
                        value_txt={this.state.valTrainingEndDate ? moment(this.state.valTrainingEndDate).format("DD/MM/YYYY") : "_"}
                        notouch={true}/>
                    </TouchableOpacity>
                  </View>
                </View>
                <InfoTextInputItem
                  label={translang.t('PROFILE_NUMBER_OF_HOURS')}
                  value_txt={this.state.valNumberHours ? this.state.valNumberHours : ""}
                  onChangeText={(val)=>this.setState({valNumberHours: val})}/>
                <InfoTextInputItem
                  label={translang.t('PROFILE_LOCATION')}
                  value_txt={this.state.valTrainingLocation ? this.state.valTrainingLocation : ""}
                  onChangeText={(val)=>this.setState({valTrainingLocation: val})}/>
                <InfoTextInputItem
                  label={translang.t('PROFILE_COUNTRY')}
                  value_txt={this.state.valTrainingCountry ? this.state.valTrainingCountry : ""}
                  onChangeText={(val)=>this.setState({valTrainingCountry: val})}/>
                <InfoTextInputItem
                  label={translang.t('PROFILE_PROVINCE')}
                  value_txt={this.state.valTrainingProvince ? this.state.valTrainingProvince : ""}
                  onChangeText={(val)=>this.setState({valTrainingProvince: val})}/>
                <InfoTextInputItem
                  label={translang.t('PROFILE_EXPENSES')}
                  value_txt={this.state.valTrainingExpenses ? this.state.valTrainingExpenses : ""}
                  onChangeText={(val)=>this.setState({valTrainingExpenses: val})}/>
              </View>}
              {this.state.profileType == '2' && 
              <View>
                <Text style={styles.titleTextStyle}>{translang.t('JOB_POSITION_INFORMATION')}</Text>
                <View style={{height: 2, backgroundColor: Color.n_default_brown, marginHorizontal: 30}}></View>
                <TouchableOpacity onPress={this._onChangeWorkingStatus}>
                  <InfoTextInputItem
                    label={translang.t('PROFILE_WORKING_STATUS')}
                    value_txt={this.state.valWorkingStatus ? this.state.valWorkingStatus : ""}
                    notouch={true}/>
                </TouchableOpacity>
                
                <InfoTextInputItem
                  label={translang.t('PROFILE_LEVEL_GOVERNMENT')}
                  value_txt={this.state.valLevelGovernment ? this.state.valLevelGovernment : ""}
                  onChangeText={(val)=>this.setState({valLevelGovernment: val})}/>
                <TouchableOpacity onPress={this._onChangeDateWorkIn}>
                  <InfoTextInputItem
                    label={translang.t('PROFILE_DATE_OF_WORK_IN')}
                    value_txt={this.state.valJobDateWorkIn ? moment(this.state.valJobDateWorkIn).format('DD/MM/YYYY') : ""}
                    notouch={true}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={this._onChangePackingOrder}>
                  <InfoTextInputItem
                    label={translang.t('PROFILE_PACKING_ORDER_DATE')}
                    value_txt={this.state.valJobPackingOrderDate ? moment(this.state.valJobPackingOrderDate).format('DD/MM/YYYY') : ""}
                    notouch={true}/>
                </TouchableOpacity>
                <InfoTextInputItem
                  label={translang.t('PROFILE_SALARY')}
                  value_txt={this.state.valJobSalary ? this.state.valJobSalary : ""}
                  onChangeText={(val)=>this.setState({valJobSalary: val})}/>
                <TouchableOpacity onPress={this._onChangeOfficialStart}>
                  <InfoTextInputItem
                    label={translang.t('PROFILE_OFFICIAL_START_DATE')}
                    value_txt={this.state.valJobOfficalStartDate ? moment(this.state.valJobOfficalStartDate).format('DD/MM/YYYY') : ""}
                    notouch={true}/>
                </TouchableOpacity>
                <InfoTextInputItem
                  label={translang.t('PROFILE_POSITION_ALLOWANCE')}
                  value_txt={this.state.valJobPositionAllowance ? this.state.valJobPositionAllowance : ""}
                  onChangeText={(val)=>this.setState({valJobPositionAllowance: val})}/>
                <InfoTextInputItem
                  label={translang.t('PROFILE_AMOUNT_ACADEMY_STANDING')}
                  value_txt={this.state.valJobAmountAcademy ? this.state.valJobAmountAcademy : ""}
                  onChangeText={(val)=>this.setState({valJobAmountAcademy: val})}/>
                <TouchableOpacity onPress={this._onChangeRetirement}>
                  <InfoTextInputItem
                    label={translang.t('PROFILE_RETIREMENT_DATE')}
                    value_txt={this.state.valJobRetirementDate ? moment(this.state.valJobRetirementDate).format('DD/MM/YYYY') : ""}
                    notouch={true}/>  
                </TouchableOpacity>
                <InfoTextInputItem
                  label={translang.t('PROFILE_TOTAL_NET_INCOME')}
                  value_txt={this.state.valJobTotalIncome ? this.state.valJobTotalIncome : ""}
                  onChangeText={(val)=>this.setState({valJobTotalIncome: val})}/>
                <InfoTextItem
                  label={translang.t('PROFILE_REMAINING_SERVICE_LIFE')}
                  value_txt={this.state.valJobRemainingServiceLife ? this.state.valJobRemainingServiceLife : ""}/>
              </View>} 
              {this.state.profileType == '3' && 
              <View>
                <Text style={styles.titleTextStyle}>{translang.t('OCCUPATIONAL_LICENSE')}</Text>
                <View style={{height: 2, backgroundColor: Color.n_default_brown, marginHorizontal: 30,}}></View>
                <TouchableOpacity onPress={this._onChangeLicenseType}>
                  <InfoTextInputItem
                    label={translang.t('PROFILE_PROFESSIONAL_LICENSE_TYPE')}
                    value_txt={this.state.valLicenseType ? this.state.valLicenseType : ""}
                    notouch={true}/>
                </TouchableOpacity>
                <InfoTextInputItem
                  label={translang.t('PROFILE_PROFESSIONAL_LICENSE_NUMBER')}
                  value_txt={this.state.valLicenseNumber ? this.state.valLicenseNumber : ""}
                  onChangeText={(val)=>this.setState({valWorkingStatus: val})}/>
                <InfoTextInputItem
                  label={translang.t('PROFILE_PROFESSIONAL_LICENSE_NAME')}
                  value_txt={this.state.valLicenseName ? this.state.valLicenseName : ""}
                  onChangeText={(val)=>this.setState({valWorkingStatus: val})}/>
                <TouchableOpacity onPress={this._onChangeCertificateDate}>
                  <InfoTextInputItem
                    label={translang.t('PROFILE_DATE_ISSUE_ACCOMPANYING_CERTIFICATE')}
                    value_txt={this.state.valAccompanyingCertificate ? moment(this.state.valAccompanyingCertificate).format('DD/MM/YYYY') : ""}
                    notouch={true}/>  
                </TouchableOpacity>
                <TouchableOpacity onPress={this._onChangeCertificateExpire}>
                  <InfoTextInputItem
                    label={translang.t('PROFILE_CERTIFICATE_EXPIRATION_DATE')}
                    value_txt={this.state.valCertificateExpire ? moment(this.state.valCertificateExpire).format('DD/MM/YYYY') : ""}
                    notouch={true}/>
                </TouchableOpacity>
                <InfoTextInputItem
                  label={translang.t('PROFILE_ORGANIZATION_ACCOMPANYING_CERTIFICATE')}
                  value_txt={this.state.valOrganizationAccompanyingCertificate ? this.state.valOrganizationAccompanyingCertificate : ""}
                  onChangeText={(val)=>this.setState({valWorkingStatus: val})}/>

                <Text style={styles.titleTextStyle}>{translang.t('PROFILE_HISTORY_ROYAL_DECORATION')}</Text>
                <View style={{height: 2, backgroundColor: Color.n_default_brown, marginHorizontal: 30,}}></View>
                <TouchableOpacity onPress={this._onChangeInsightYear}>
                  <InfoTextInputItem
                    label={translang.t('PROFILE_YEAR_RECEIVED')}
                    value_txt={this.state.valRoyalyearReceived ? this.state.valRoyalyearReceived : ""}
                    notouch={true}/>
                </TouchableOpacity>
                
                <InfoTextInputItem
                  label={translang.t('PROFILE_ROYAL_DECORATION_CLASS')}
                  value_txt={this.state.valRoyalDecorationClass ? this.state.valRoyalDecorationClass : ""}
                  onChangeText={(val)=>this.setState({valWorkingStatus: val})}/>
                <InfoTextInputItem
                  label={translang.t('PROFILE_position')}
                  value_txt={this.state.valRoyalPosition ? this.state.valRoyalPosition : ""}
                  onChangeText={(val)=>this.setState({valWorkingStatus: val})}/>
                <View style={{flexDirection: 'row'}}>
                  <View style={{flex: 1}}>
                    <InfoTextInputItem
                      label={translang.t('PROFILE_ROYAL_GOVERNMENT_VOLUME_NO')}
                      value_txt={this.state.valRoyalGovernmentVolumnNo ? this.state.valRoyalGovernmentVolumnNo : ""}
                      onChangeText={(val)=>this.setState({valWorkingStatus: val})}/>
                  </View>
                  
                  <View style={{flex: 1}}>
                    <InfoTextInputItem
                      label={translang.t('PROFILE_ROYAL_GOVERNMENT_PART')}
                      value_txt={this.state.valRoyalGovernmentPart ? this.state.valRoyalGovernmentPart : ""}
                      onChangeText={(val)=>this.setState({valWorkingStatus: val})}/>
                  </View>
                </View>
                <InfoTextInputItem
                  label={translang.t('PROFILE_ROYAL_GOVERNMENT_NO')}
                  value_txt={this.state.valRoyalGovernmentNo ? this.state.valRoyalGovernmentNo : ""}
                  onChangeText={(val)=>this.setState({valWorkingStatus: val})}/>
                <TouchableOpacity onPress={this._onChangeRoyalDated}>
                  <InfoTextInputItem
                    label={translang.t('PROFILE_DATED')}
                    value_txt={this.state.valRoyalDated ? moment(this.state.valRoyalDated).format('DD/MM/YYYY') : ""}
                    notouch={true}/>
                </TouchableOpacity>
              </View>}

              <View style={{marginVertical: 40, flexDirection:'row', justifyContent: 'center'}}>
                <GradientButton
                  label={translang.t('COMMON_cancel')}
                  containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
                  buttonStyle={{ borderRadius: 22, height: 44 }}
                  colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
                  isVerticalGradient={false}
                  _onPress={() => {this.setState({isEdit: false})}} 
                />
                <GradientButton
                  label={translang.t('PROFILE_edit')}
                  containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0, marginLeft: 30 }}
                  buttonStyle={{ borderRadius: 22, height: 44 }}
                  colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                  isVerticalGradient={false}
                  _onPress={() => {this.setState({isEdit: false})}} 
                />
              </View>
            </>}
          </View>
        </ScrollView>

        <ProfileModal
          isVisible={this.state.showModal}
          onPositivePress={() => this.setState({ showModal: false })}
          user={user}
        />

        <SchoolModal
          isVisible={this.state.showSchoolModal}
          header={translang.t('HOME_searchschool')}
          positiveText={translang.t('HOME_close')}
          onSchoolSelect={this.onSchoolSelect}
        />
        
        <EmployeeTypeModal
          isVisible={this.state.showEmployeeTypeModal}
          onListSelect={this.onEmployeeTypeSelect}
          listData={employeeTypeList}
          dialogTtitle={translang.t('PROFILE_PERSONAL_TYPE')}
        />

        <DepartmentModal
          isVisible={this.state.showDepartmentModal}
          onListSelect={this.onDepartmentSelect}
          listData={departmentList}
          dialogTtitle={translang.t('PROFILE_department')}
        />

        <GenderModal
          isVisible={this.state.showGenderModal}
          onListSelect={this.onGenderSelect}
          listData={this.state.genderList}
          dialogTtitle={translang.t('SELECT_GENDER')}
        />
        
        <CalendarModal
          isVisible={this.state.showBirthdayDatePicker}
          type={'single'}
          onDateSelect={result => this.onBirthdaySelect(result)} />

        <NationalModal
          isVisible={this.state.showNationalModal}
          onListSelect={this.onNationalSelect}
          listData={nationalList}
          dialogTtitle={translang.t('PROFILE_Nationality')}
        />

        <ReligionModal
          isVisible={this.state.showReligionModal}
          onListSelect={this.onReligionSelect}
          listData={religionList}
          dialogTtitle={translang.t('PROFILE_Religion')}
        />

        <StatusModal
          isVisible={this.state.showStatusModal}
          onListSelect={this.onStatusSelect}
          listData={statusList}
          dialogTtitle={translang.t('STATUS')}
        />

        <YearRangePickerModal
          isVisible={this.state.showEducationPeriodModal}
          selectedStart={valPeriod_start}
          selectedEnd={valPeriod_end}
          onRangeelect={result => this.onEducationPeriodSelect(result)} />

        <EducationLevelModal
          isVisible={this.state.showEducationLevelModal}
          onListSelect={this.onEducationLevelSelect}
          listData={educationLevelList}
          dialogTtitle={translang.t('PROFILE_EDUCATION_LEVEL')}
        />

        <EducationTypeModal
          isVisible={this.state.showEducationTypeModal}
          onListSelect={this.onEducationTypeSelect}
          listData={educationTypeList}
          dialogTtitle={translang.t('PROFILE_TYPE')}
        />

        <TrainingStartCalendarModal
          isVisible={this.state.showTrainingStartDatePicker}
          type={'single'}
          onDateSelect={result => this.onTrainingStartSelect(result)} />

        <TrainingEndCalendarModal
          isVisible={this.state.showTrainingEndDatePicker}
          type={'single'}
          onDateSelect={result => this.onTrainingEndSelect(result)} />

        <WorkingStatusModal
          isVisible={this.state.showWorkingStatusModal}
          onListSelect={this.onWorkingStatusSelect}
          listData={workingStatusList}
          dialogTtitle={translang.t('PROFILE_WORKING_STATUS')}/>

        <DateWorkInCalendarModal
          isVisible={this.state.showDateWorkInDatePicker}
          type={'single'}
          onDateSelect={result => this.onDateWorkInSelect(result)} />

        <PackingOrderCalendarModal
          isVisible={this.state.showPackingOrderDatePicker}
          type={'single'}
          onDateSelect={result => this.onPackingOrderSelect(result)} />

        <OfficialStartCalendarModal
          isVisible={this.state.showOfficialStartDatePicker}
          type={'single'}
          onDateSelect={result => this.onOfficialStartSelect(result)} />

        <RetirementCalendarModal
          isVisible={this.state.showRetirementDatePicker}
          type={'single'}
          onDateSelect={result => this.onRetirementSelect(result)} />

        <CertificateDateCalendarModal
          isVisible={this.state.showCertificateDateDatePicker}
          type={'single'}
          onDateSelect={result => this.onCertificateDateSelect(result)} />

        <CertificateExpireCalendarModal
          isVisible={this.state.showCertificateExpireDatePicker}
          type={'single'}
          onDateSelect={result => this.onCertificateExpireSelect(result)} />

        <RoyalDatedCalendarModal
          isVisible={this.state.showRoyalDatedDatePicker}
          type={'single'}
          onDateSelect={result => this.onRoyalDatedSelect(result)} />

        <LicenseTypeModal
          isVisible={this.state.showLicenceTypeModal}
          onListSelect={this.onLicenseTypeSelect}
          listData={licenseTypeList}
          dialogTtitle={translang.t('PROFILE_PROFESSIONAL_LICENSE_TYPE')}/>

        <InsightYearModal 
          isVisible={this.state.showInsightYearModal}
          onListSelect={this.onInsightYearSelect}
          listData={insightYearList}
          dialogTtitle={translang.t('PROFILE_YEAR_RECEIVED')}/>

        

        <ProgressHud isVisible={this.state.isLoading} />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  switchContainer: {
    marginHorizontal: 10, 
    marginTop: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
    borderRadius: 10,
  },


  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
  },
  headerImgContainer: {
    height: 180, 
    width: '100%', 
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardContainer: {
    width: 260,
    height: 147,
    borderRadius: 15,
    backgroundColor: Color.white,
  },

  menuItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    paddingHorizontal: 30,
  },

  image: {
    height: 50, 
    width: 50, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: 25,
    marginRight: 10,
  },
  topText: {
    fontFamily: 'THSarabunNew',
    fontSize: 24, 
    fontWeight: 'bold',
    color: Color.n_default_orange 
  },
  bottomText: {
    fontFamily: 'THSarabunNew',
    fontSize: 22, 
    color: Color.dark
  },
  titleTextStyle: {
    fontFamily: 'THSarabunNew',
    fontSize: 30,
    color: Color.n_default_orange,
    fontWeight: 'bold',
    marginVertical: 10,
    paddingHorizontal: 30,
  },

  schoolNameStyle: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical:3,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    alignItems: 'center'
  },
  schoolName: {
    fontFamily: 'THSarabunNew',
    fontSize: 8,
    color: Color.white,
  },
});
