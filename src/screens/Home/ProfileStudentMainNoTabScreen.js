import React from 'react';
import {useState, useEffect} from "react";
import {Image, View, TouchableOpacity, ImageBackground, BackHandler} from 'react-native';
import {Text} from 'native-base';
import {ScaledSheet} from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import {ScrollView} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
import ProfileModal from '../../components/ProfileModal';
import BackNavigationBar from '../../components/BackNavigationBar';
import Storage from '../../managers/StorageManager';
import translang, {getCurrentLocale} from '../../utils/language.utils';
import moment from 'moment';

import CardInfoItem from '../../components/CardInfoItem';
import GradientButton from '../../components/GradientButton';
import CustomTextInput from '../../components/CustomTextInput';
import GradientButtonWithImg from '../../components/GradientButtonWithImg';

import LinearGradient from 'react-native-linear-gradient';
import ApiManager from '../../managers/ApiManager';
import ProgressHud from '../../components/ProgressHud';
import apiHttpClient from '../../utils/apiHttpClient';
import {apiUrls} from '../../constants/ApiUrls';

import CustomSwitcher from '../../components/CustomSwitcher';
import CustomCheckButton from '../../components/CustomCheckButton';
import CalendarModal from '../../components/CalendarModal';
import ProfileSelectModal from '../../components/ProfileSelectModal'
import HealthTab from './HealthTab';

import NetInfo from "@react-native-community/netinfo";
import AlertWithImageModal from '../../components/AlertWithImageModal';

const InfoTextItem = (props) => {
  const {icon_mark, label, value_txt} = props;
  return (
    <View style={styles.menuItem}>
      {/* <Image source={icon_mark} style={[styles.image]}></Image> */}
      <View style={{flexDirection: 'column'}}>
        <Text style={[styles.topText]}> {label} </Text>
        <Text style={[styles.bottomText]} multiline={true}> {value_txt}</Text>
      </View>
    </View>

  );
};

const InfoTextInputItem = (props) => {
  const {disable, canSelect, selectList, label, value_txt, onClickInput, onChangeText, onSelectItem, zIndex, placeHolder, containerStyle, notouch, isNum = false} = props;
  const [isOpen, setIsOpen] = useState(false)

  let titleCol = Color.n_default_orange;
  if (disable) {
    titleCol = Color.n_default_gray;
  }

  const selectItem = (item, index) => {
    setIsOpen(false)
    onSelectItem(item, index)
  }

  const renderSelectItem = () => {
    var res = []
    if (selectList.length > 0) {
      for (let i = 0; i < selectList.length; i++) {
        let item = selectList[i];
        res.push(
          <TouchableOpacity style={{marginRight: 30}} onPressOut={() => selectItem(item, i)} key={`value_text ${i}`}>
            <Text style={{...styles.bottomText, marginHorizontal: 10, marginVertical: 2}}>{item.title}</Text>
          </TouchableOpacity>);
      }
    }
    return res;
  }

  return (
    <View style={[styles.menuItem, containerStyle, {zIndex: zIndex}]}>
      <View style={{flexDirection: 'column', flex: 1}}>
        <Text style={[styles.topText, {color: titleCol}]}> {label} </Text>
        {disable && <Text style={[styles.bottomText, {color: titleCol}]}> {value_txt ? value_txt : placeHolder} </Text>}
        {!disable && <>
          {canSelect &&
          <View style={{
            position: 'relative',
            height: 38,
            borderBottomColor: Color.n_default_brown,
            borderBottomWidth: 1,
            width: '100%',
            paddingHorizontal: 5
          }}>
            <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPressOut={onClickInput}>
              <Text style={{
                ...styles.bottomText,
                flex: 1,
                color: value_txt ? Color.n_default_gray : Color.n_text_placeholder_gray
              }}>{value_txt ? value_txt : placeHolder}</Text>
              <Image source={Images.n_carrot_down}
                     style={{width: 10, height: 10, resizeMode: 'contain', marginLeft: 5}}/>
            </TouchableOpacity>
          </View>}
          {!canSelect &&
          <CustomTextInput
            inputStyle={{
              borderBottomWidth: 1,
              borderColor: Color.n_default_brown,
              ...styles.bottomText
            }}
            inputWrapperStyle={{
              borderColor: Color.n_default_brown,
            }}
            notouch={notouch}
            placeholder={placeHolder}
            value={value_txt.toString()}
            placeholderTextColor={Color.n_text_placeholder_gray}
            onChangeText={onChangeText}
            isNum={isNum}
          />}
        </>}
      </View>
    </View>
  );
};

export default class ProfileStudentMainNoTabScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      userTermInfo: {},
      showModal: false,
      showPendingAlert: false,
      profileType: 0,
      isLoading: false,

      dataStudent: {},
      canUpdateStatus: {},

      showDatePicker: false,
      selCalendarType: "",

      isEditProfile: false,
      isEditPermenentAddress: false,
      isEditContactAddress: false,
      isEditFatherInfo: false,
      isEditMotherInfo: false,
      isEditParentInfo: false,

      isSelectPermanentAddr: false,
      tempContactAddr: {},

      isSelectFatherAddr: false,
      tempMotherAddr: {},

      genderList: [{id: '0', title: translang.t('Male')}, {id: '1', title: translang.t('Female')}],
      nameTitleList: [],
      raceList: [],
      nationalList: [],
      religionList: [],
      disabilityList: [],
      disadvantageList: [],
      provinceList: [],
      districtList: [],
      subdistrictList: [],

      birth_districtList: [],
      birth_subdistrictList: [],

      contact_districtList: [],
      contact_subdistrictList: [],

      father_districtList: [],
      father_subdistrictList: [],

      mother_districtList: [],
      mother_subdistrictList: [],

      parent_districtList: [],
      parent_subdistrictList: [],

      houseTypeList: [],
      educationList: [],
      copyDataFromList: [],
      parentRelateList: [],
      familyStatusList: [],
      tutionStatusList: [],

      selItemSelectedIndex: 0,
      selItemShowList: {},
      selItemSelTypeStr: "",
      selItemShowable: false,

      showModalOffline: false,
      modalBodyOffline: '',
      editEnable: false,
    };
  }

  unsubscribe = null;
  handleBackButton = () => {
    if (this.state.showDatePicker) {
      this.setState({showDatePicker: false});
      return true;
    }
    this.back();
    return true;
  };

  async componentDidMount() {
    // this.unsubscribe = NetInfo.addEventListener(state => {
    //   console.log("J");
    //   if(!state.isConnected){
    //     this.setState({showModalOffline: true, modalBodyOffline: translang.t('ALERT_OFFLINE') });
    //   }
    // });

    const {navigation} = this.props;
    this.focusListener = navigation.addListener("didFocus", async () => {
      if (this.backhandler) {
        this.backhandler.remove();
      }
      console.log("ProfileStudentMainNoTabScreen");
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
      const userInfo = await Storage.getUserInfo();
      const isOpenEdit = await ApiManager.isOpenEditUserProfile(userInfo.SchoolID);

      this.setState({userInfo: userInfo, editEnable: isOpenEdit}, () => {
        this.loadTermData();
        this.loadNameTitles();
        this.loadRace();
        this.loadNational();
        this.loadReligion();
        this.loadDiability();
        this.loadDisadvantage();
        this.loadProvince();

        this.loadHouseType();
        this.loadEducationLevel();
        this.loadCopyDataFrom();
        this.loadParentRelate();
        this.loadTuitionStatus();
        this.loadFamilyStatus();

      })
    });
  }

  componentDidUpdate(prevProps) {
    // console.log('here');
    //     // if (prevProps.isFocused !== this.props.isFocused && this.props.isFocused === true) {
    //     //   const user = await Storage.getUserInfo();
    //     //   this.setState({user});
    //     // }
  }

  componentWillUnmount = () => {
    // this.unsubscribe();
  };

  back = () => {
    if (this.backhandler) {
      this.backhandler.remove();
    }
    if (this.focusListener) {
      this.focusListener.remove();
    }

    const parentRoute = this.props.navigation.getParam('parent') ?? 'App';
    this.props.navigation.navigate(parentRoute);
  };
  onChangeSwitcher = (index) => {
    this.setState({profileType: index})
  }

  loadTermData = async () => {
    const schoolId = this.state.userInfo.SchoolID;
    const studentid = this.state.userInfo.ID;

    this.setState({isLoading: true})
    ApiManager.getUserTermInfo(schoolId, studentid).then(data => {
      this.setState({userTermInfo: data, isLoading: false}, () => {
        this.loadData();
      });
    }).catch(error => {
      console.error("TermInfoError: ", error);
      this.setState({isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN')});
    });
  };

  checkEdit = () => {
    this.setState({isEditProfile: true});
  }

  loadData = () => {
    this.setState({isLoading: true})
    const {userInfo, userTermInfo} = this.state;
    const termID = userTermInfo.TermID;
    ApiManager.getStudentInfo(userInfo.SchoolID, userInfo.ID, termID).then(res => {
      // ApiManager.getStudentInfo("307", "477536", "TS20003703400307").then(res => {
      let res_data = res.data;
      if (res_data == null) {
        res_data = {};
      }

      this.setState({dataStudent: res_data, isLoading: false}, () => {
        if (res_data.houseRegistrationProvinceId) {
          this.loadDistrict(res_data.houseRegistrationProvinceId, 'districtList');
          if (res_data.houseRegistrationDistrictId) {
            this.loadSubDistrict(res_data.houseRegistrationProvinceId, res_data.houseRegistrationDistrictId, 'subdistrictList');
          }
        }
        if (res_data.bornProvinceId) {
          this.loadDistrict(res_data.bornProvinceId, 'birth_districtList');
          if (res_data.bornDistrictId) {
            this.loadSubDistrict(res_data.bornProvinceId, res_data.bornDistrictId, 'birth_subdistrictList');
          }
        }
        if (res_data.contactProvinceId) {
          this.loadDistrict(res_data.contactProvinceId, 'contact_districtList');
          if (res_data.contactDistrictId) {
            this.loadSubDistrict(res_data.contactProvinceId, res_data.contactDistrictId, 'contact_subdistrictList');
          }
        }
        if (res_data.fatherProvinceId) {
          this.loadDistrict(res_data.fatherProvinceId, 'father_districtList');
          if (res_data.fatherDistrictId) {
            this.loadSubDistrict(res_data.fatherProvinceId, res_data.fatherDistrictId, 'father_subdistrictList');
          }
        }
        if (res_data.motherProvinceId) {
          this.loadDistrict(res_data.motherProvinceId, 'mother_districtList');
          if (res_data.motherDistrictId) {
            this.loadSubDistrict(res_data.motherProvinceId, res_data.motherDistrictId, 'mother_subdistrictList');
          }
        }
        if (res_data.parentProvinceId) {
          this.loadDistrict(res_data.parentProvinceId, 'parent_districtList');
          if (res_data.parentDistrictId) {
            this.loadSubDistrict(res_data.parentProvinceId, res_data.parentDistrictId, 'parent_subdistrictList');
          }
        }
      });
    }).catch(error => {
      console.log(error);
      this.setState({isLoading: false});
    });

    ApiManager.getCanUpdateStatus(userInfo.SchoolID, userInfo.ID, 'student').then(res => {
      let res_code = res.statusCode;
      if (res_code !== 200) {
        res = {};
      }
      this.setState({canUpdateStatus: res, isLoading: false});

    }).catch(error => {
      console.log(error);
      this.setState({isLoading: false});
    });

  };
  loadNameTitles = () => {
    apiHttpClient.get(apiUrls.getNameTitleListUrl(this.state.userInfo.SchoolID))
      .then(response => response.data)
      .then(data => {
        this.setState({nameTitleList: data.data});
      })
      .catch((error) => {
        console.error("Get NameTitles", error);
      });
  }
  loadRace = () => {
    apiHttpClient.get(apiUrls.getRaceUrl(this.state.userInfo.SchoolID))
      .then(response => response.data)
      .then(data => {
        this.setState({raceList: data.data});
      })
      .catch((error) => {
        console.error("Get Race", error);
      });
  }
  loadNational = () => {
    apiHttpClient.get(apiUrls.getNationalUrl(this.state.userInfo.SchoolID))
      .then(response => response.data)
      .then(data => {
        this.setState({nationalList: data.data});
      })
      .catch((error) => {
        console.error("Get National", error);
      });
  }
  loadReligion = () => {
    apiHttpClient.get(apiUrls.getReligionUrl(this.state.userInfo.SchoolID))
      .then(response => response.data)
      .then(data => {
        this.setState({religionList: data.data});
      })
      .catch((error) => {
        console.error("Get Religion", error);
      });
  }
  loadDiability = () => {
    apiHttpClient.get(apiUrls.getDisabilityUrl(this.state.userInfo.SchoolID))
      .then(response => response.data)
      .then(data => {
        this.setState({disabilityList: data.data});
      })
      .catch((error) => {
        console.error("Get Disablility", error);
      });
  }
  loadDisadvantage = () => {

    apiHttpClient.get(apiUrls.getDisadvantageUrl(this.state.userInfo.SchoolID))
      .then(response => response.data)
      .then(data => {
        this.setState({disadvantageList: data.data});
      })
      .catch((error) => {
        console.error("Get Disadventage", error);
      });
  }
  loadProvince = () => {
    apiHttpClient.get(apiUrls.getProvinceListUrl())
      .then(response => response.data)
      .then(data => {
        this.setState({provinceList: data.data});
      })
      .catch((error) => {
        console.error("Get ProvinceList", error);
      });
  }
  loadDistrict = (provinceId, key = 'districtList') => {
    apiHttpClient.get(apiUrls.getDistrictListUrl(provinceId))
      .then(response => response.data)
      .then(data => {
        this.setState({[key]: data.data});
      })
      .catch((error) => {
        console.error("Get DistrictList", error);
      });
  }
  loadSubDistrict = (provinceID, districtID, key = 'subdistrictList') => {
    apiHttpClient.get(apiUrls.getSubDistrictListUrl(provinceID, districtID))
      .then(response => response.data)
      .then(data => {
        this.setState({[key]: data.data});
      })
      .catch((error) => {
        console.error("Get SubDistrictList", error);
      });
  }
  loadHouseType = () => {
    apiHttpClient.get(apiUrls.getHouseTypeListUrl())
      .then(response => response.data)
      .then(data => {
        this.setState({houseTypeList: data.data});
      })
      .catch((error) => {
        console.error("Get HouseTypeList", error);
      });
  }
  loadEducationLevel = () => {
    apiHttpClient.get(apiUrls.getEducationLevelUrl())
      .then(response => response.data)
      .then(data => {
        console.log("education level data:", data.data);
        this.setState({educationList: data.data});
      })
      .catch((error) => {
        console.error("Get EducationLevel", error);
      });
  }

  loadCopyDataFrom = () => {
    apiHttpClient.get(apiUrls.getCopyDataFromUrl())
      .then(response => response.data)
      .then(data => {
        console.log("copy data from:", data.data);
        this.setState({copyDataFromList: data.data});
      })
      .catch((error) => {
        console.error("Get copy data from", error);
      });
  }

  loadParentRelate = () => {
    apiHttpClient.get(apiUrls.getParentRelateUrl())
      .then(response => response.data)
      .then(data => {
        console.log("parent relate data:", data.data);
        this.setState({parentRelateList: data.data});
      })
      .catch((error) => {
        console.error("parent relate error", error);
      });
  }

  loadTuitionStatus = () => {
    apiHttpClient.get(apiUrls.getTuitionStatusListUrl())
      .then(response => response.data)
      .then(data => {
        this.setState({tutionStatusList: data.data});
      })
      .catch((error) => {
        console.error("Get loadTuitionStatus", error);
      });
  }
  loadFamilyStatus = () => {
    apiHttpClient.get(apiUrls.getFamilyStatusListUrl())
      .then(response => response.data)
      .then(data => {
        this.setState({familyStatusList: data.data});
      })
      .catch((error) => {
        console.error("Get loadFamilyStatus", error);
      });
  }

  setLikePermanentAddress = () => {
    const {dataStudent, tempContactAddr} = this.state;

    let contactHomeNo = "";
    let contactLane = "";
    let contactVillageNo = "";
    let contactRoad = "";
    let contactSubDistrictId = "";
    let contactSubDistrict = "";
    let contactDistrictId = "";
    let contactDistrict = "";
    let contactProvinceId = "";
    let contactProvince = "";
    let contactPostalCode = "";

    this.setState({isSelectPermanentAddr: !this.state.isSelectPermanentAddr}, () => {
      if (this.state.isSelectPermanentAddr) {
        contactHomeNo = dataStudent.contactHomeNo;
        contactLane = dataStudent.contactLane;
        contactVillageNo = dataStudent.contactVillageNo;
        contactRoad = dataStudent.contactRoad;
        contactSubDistrictId = dataStudent.contactSubDistrictId;
        contactSubDistrict = dataStudent.contactSubDistrict;
        contactDistrictId = dataStudent.contactDistrictId;
        contactDistrict = dataStudent.contactDistrict;
        contactProvinceId = dataStudent.contactProvinceId;
        contactProvince = dataStudent.contactProvince;
        contactPostalCode = dataStudent.contactPostalCode;


        const temp = {
          contactHomeNo: contactHomeNo,
          contactLane: contactLane,
          contactVillageNo: contactVillageNo,
          contactRoad: contactRoad,
          contactSubDistrictId: contactSubDistrictId,
          contactSubDistrict: contactSubDistrict,
          contactDistrictId: contactDistrictId,
          contactDistrict: contactDistrict,
          contactProvinceId: contactProvinceId,
          contactProvince: contactProvince,
          contactPostalCode: contactPostalCode,
        }

        dataStudent.contactHomeNo = dataStudent.houseRegistrationNo;
        dataStudent.contactLane = dataStudent.houseRegistrationLane;
        dataStudent.contactVillageNo = dataStudent.houseRegistrationVillageNo;
        dataStudent.contactRoad = dataStudent.houseRegistrationRoad;
        dataStudent.contactSubDistrictId = dataStudent.houseRegistrationSubDistrictId;
        dataStudent.contactSubDistrict = dataStudent.houseRegistrationSubDistrict;
        dataStudent.contactDistrictId = dataStudent.houseRegistrationDistrictId;
        dataStudent.contactDistrict = dataStudent.houseRegistrationDistrict;
        dataStudent.contactProvinceId = dataStudent.houseRegistrationProvinceId;
        dataStudent.contactProvince = dataStudent.houseRegistrationProvince;
        dataStudent.contactPostalCode = dataStudent.houseRegistrationPostalCode;

        this.setState({tempContactAddr: temp, dataStudent: dataStudent});
      } else {
        dataStudent.contactHomeNo = tempContactAddr.contactHomeNo;
        dataStudent.contactLane = tempContactAddr.contactLane;
        dataStudent.contactVillageNo = tempContactAddr.contactVillageNo;
        dataStudent.contactRoad = tempContactAddr.contactRoad;
        dataStudent.contactSubDistrictId = tempContactAddr.contactSubDistrictId;
        dataStudent.contactSubDistrict = tempContactAddr.contactSubDistrict;
        dataStudent.contactDistrictId = tempContactAddr.contactDistrictId;
        dataStudent.contactDistrict = tempContactAddr.contactDistrict;
        dataStudent.contactProvinceId = tempContactAddr.contactProvinceId;
        dataStudent.contactProvince = tempContactAddr.contactProvince;
        dataStudent.contactPostalCode = tempContactAddr.contactPostalCode;

        this.setState({dataStudent: dataStudent});
      }
    });
  }
  setLikeFatherAddress = () => {
    const {dataStudent, tempMotherAddr} = this.state;

    let motherHomeNo = "";
    let motherLane = "";
    let motherVillageNo = "";
    let motherRoad = "";
    let motherSubDistrictId = "";
    let motherSubDistrict = "";
    let motherDistrictId = "";
    let motherDistrict = "";
    let motherProvinceId = "";
    let motherProvince = "";
    let motherPostalCode = "";

    this.setState({isSelectPermanentAddr: !this.state.isSelectPermanentAddr}, () => {
      if (this.state.isSelectPermanentAddr) {
        motherHomeNo = dataStudent.motherHomeNo;
        motherLane = dataStudent.motherLane;
        motherVillageNo = dataStudent.motherVillageNo;
        motherRoad = dataStudent.motherRoad;
        motherSubDistrictId = dataStudent.motherSubDistrictId;
        motherSubDistrict = dataStudent.motherSubDistrict;
        motherDistrictId = dataStudent.motherDistrictId;
        motherDistrict = dataStudent.motherDistrict;
        motherProvinceId = dataStudent.motherProvinceId;
        motherProvince = dataStudent.motherProvince;
        motherPostalCode = dataStudent.motherPostalCode;

        const temp = {
          motherHomeNo: motherHomeNo,
          motherLane: motherLane,
          motherVillageNo: motherVillageNo,
          motherRoad: motherRoad,
          motherSubDistrictId: motherSubDistrictId,
          motherSubDistrict: motherSubDistrict,
          motherDistrictId: motherDistrictId,
          motherDistrict: motherDistrict,
          motherProvinceId: motherProvinceId,
          motherProvince: motherProvince,
          motherPostalCode: motherPostalCode,
        }

        dataStudent.motherHomeNo = dataStudent.fatherHomeNo;
        dataStudent.motherLane = dataStudent.fatherLane;
        dataStudent.motherVillageNo = dataStudent.fatherVillageNo;
        dataStudent.motherRoad = dataStudent.fatherRoad;
        dataStudent.motherSubDistrictId = dataStudent.fatherSubDistrictId;
        dataStudent.motherSubDistrict = dataStudent.fatherSubDistrict;
        dataStudent.motherDistrictId = dataStudent.fatherDistrictId;
        dataStudent.motherDistrict = dataStudent.fatherDistrict;
        dataStudent.motherProvinceId = dataStudent.fatherProvinceId;
        dataStudent.motherProvince = dataStudent.fatherProvince;
        dataStudent.motherPostalCode = dataStudent.fatherPostalCode;

        this.setState({tempMotherAddr: temp, dataStudent: dataStudent});
      } else {
        dataStudent.motherHomeNo = tempMotherAddr.motherHomeNo;
        dataStudent.motherLane = tempMotherAddr.motherLane;
        dataStudent.motherVillageNo = tempMotherAddr.motherVillageNo;
        dataStudent.motherRoad = tempMotherAddr.motherRoad;
        dataStudent.motherSubDistrictId = tempMotherAddr.motherSubDistrictId;
        dataStudent.motherSubDistrict = tempMotherAddr.motherSubDistrict;
        dataStudent.motherDistrictId = tempMotherAddr.motherDistrictId;
        dataStudent.motherDistrict = tempMotherAddr.motherDistrict;
        dataStudent.motherProvinceId = tempMotherAddr.motherProvinceId;
        dataStudent.motherProvince = tempMotherAddr.motherProvince;
        dataStudent.motherPostalCode = tempMotherAddr.motherPostalCode;

        this.setState({dataStudent: dataStudent});
      }
    });
  }

  onDateSelect = (date) => {
    const {dataStudent, selCalendarType} = this.state;
    if (date === null || date === '') {
      this.setState({showDatePicker: false});
      return;
    }
    ;

    if (selCalendarType == "ProfileBirthday") {
      dataStudent.birthday = moment(date);
      this.setState({dataStudent: dataStudent, showDatePicker: false});
    } else if (selCalendarType == "FatherBirthday") {
      dataStudent.fatherBirthday = moment(date);
      this.setState({dataStudent: dataStudent, showDatePicker: false});
    } else if (selCalendarType == "MotherBirthday") {
      dataStudent.motherBirthday = moment(date);
      this.setState({dataStudent: dataStudent, showDatePicker: false});
    } else if (selCalendarType == "ParentBirthday") {
      dataStudent.parentBirthday = moment(date);
      this.setState({dataStudent: dataStudent, showDatePicker: false});
    }
  };

  copyFromParent = (parentID) => {
    const {dataStudent} = this.state;
    if (parentID === 1) {
      dataStudent.parentRelation = 'พ่อ';
      dataStudent.parentRelationId = 'พ่อ';
      dataStudent.parentTitle = dataStudent.fatherTitle;
      dataStudent.parentTitleId = dataStudent.fatherTitleId;
      dataStudent.parentNameTh = dataStudent.fatherNameTh;
      dataStudent.parentLastnameTh = dataStudent.fatherLastnameTh;
      dataStudent.parentNameEn = dataStudent.fatherNameEn;
      dataStudent.parentLastnameEn = dataStudent.fatherLastnameEn;
      dataStudent.parentBirthday = dataStudent.fatherBirthday;
      dataStudent.parentIDCardNumber = dataStudent.fatherIDCardNumber;
      dataStudent.parentRace = dataStudent.fatherRace;
      dataStudent.parentRaceId = dataStudent.fatherRaceId;
      dataStudent.parentNation = dataStudent.fatherNation;
      dataStudent.parentNationId = dataStudent.fatherNationId;
      dataStudent.parentReligion = dataStudent.fatherReligion;
      dataStudent.parentReligionId = dataStudent.fatherReligionId;
      dataStudent.parentGraduatedLevel = dataStudent.fatherGraduatedLevel;
      dataStudent.parentGraduatedLevelId = dataStudent.fatherGraduatedLevelId;
      dataStudent.parentHomeNo = dataStudent.fatherHomeNo;
      dataStudent.parentLane = dataStudent.fatherLane;
      dataStudent.parentVillageNo = dataStudent.fatherVillageNo;
      dataStudent.parentRoad = dataStudent.fatherRoad;
      dataStudent.parentProvince = dataStudent.fatherProvince;
      dataStudent.parentProvinceId = dataStudent.fatherProvinceId;
      dataStudent.parentDistrict = dataStudent.fatherDistrict;
      dataStudent.parentDistrictId = dataStudent.fatherDistrictId;
      dataStudent.parentSubDistrict = dataStudent.fatherSubDistrict;
      dataStudent.parentSubDistrictId = dataStudent.fatherSubDistrictId;
      dataStudent.parentPostalCode = dataStudent.fatherPostalCode;
      dataStudent.parentCareer = dataStudent.fatherCareer;
      dataStudent.parentIncome = dataStudent.fatherIncome;
      dataStudent.parentWorkPlace = dataStudent.fatherWorkPlace;
      dataStudent.parentHomePhone = dataStudent.fatherHomePhone;
      dataStudent.parentMobilePhone = dataStudent.fatherMobilePhone;
      dataStudent.parentWorkPlacePhone = dataStudent.fatherWorkPlacePhone;
    } else if (parentID === 2) {
      dataStudent.parentRelation = 'แม่';
      dataStudent.parentRelationId = 'แม่';
      dataStudent.parentTitle = dataStudent.motherTitle;
      dataStudent.parentTitleId = dataStudent.motherTitleId;
      dataStudent.parentNameTh = dataStudent.motherNameTh;
      dataStudent.parentLastnameTh = dataStudent.motherLastnameTh;
      dataStudent.parentNameEn = dataStudent.motherNameEn;
      dataStudent.parentLastnameEn = dataStudent.motherLastnameEn;
      dataStudent.parentBirthday = dataStudent.motherBirthday;
      dataStudent.parentIDCardNumber = dataStudent.motherIDCardNumber;
      dataStudent.parentRace = dataStudent.motherRace;
      dataStudent.parentRaceId = dataStudent.motherRaceId;
      dataStudent.parentNation = dataStudent.motherNation;
      dataStudent.parentNationId = dataStudent.motherNationId;
      dataStudent.parentReligion = dataStudent.motherReligion;
      dataStudent.parentReligionId = dataStudent.motherReligionId;
      dataStudent.parentGraduatedLevel = dataStudent.motherGraduatedLevel;
      dataStudent.parentGraduatedLevelId = dataStudent.motherGraduatedLevelId;
      dataStudent.parentHomeNo = dataStudent.motherHomeNo;
      dataStudent.parentLane = dataStudent.motherLane;
      dataStudent.parentVillageNo = dataStudent.motherVillageNo;
      dataStudent.parentRoad = dataStudent.motherRoad;
      dataStudent.parentProvince = dataStudent.motherProvince;
      dataStudent.parentProvinceId = dataStudent.motherProvinceId;
      dataStudent.parentDistrict = dataStudent.motherDistrict;
      dataStudent.parentDistrictId = dataStudent.motherDistrictId;
      dataStudent.parentSubDistrict = dataStudent.motherSubDistrict;
      dataStudent.parentSubDistrictId = dataStudent.motherSubDistrictId;
      dataStudent.parentPostalCode = dataStudent.motherPostalCode;
      dataStudent.parentCareer = dataStudent.motherCareer;
      dataStudent.parentIncome = dataStudent.motherIncome;
      dataStudent.parentWorkPlace = dataStudent.motherWorkPlace;
      dataStudent.parentHomePhone = dataStudent.motherHomePhone;
      dataStudent.parentMobilePhone = dataStudent.motherMobilePhone;
      dataStudent.parentWorkPlacePhone = dataStudent.motherWorkPlacePhone;
    }
    this.setState({dataStudent: dataStudent});
    if (parentID === 1) {
      this.setState({
        parent_districtList: this.state.father_districtList,
        parent_subdistrictList: this.state.father_subdistrictList
      });
    } else if (parentID === 2) {
      this.setState({
        parent_districtList: this.state.mother_districtList,
        parent_subdistrictList: this.state.mother_subdistrictList
      });
    }

  };

  onChangeListItem = (item) => {
    const {selItemSelTypeStr, dataStudent} = this.state;
    if (item == null) {
      this.setState({selItemShowable: false})
    } else {
      if (selItemSelTypeStr == "EditProfilesex") {
        dataStudent.sexId = item.id;
        dataStudent.sex = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditProfiletitle") {
        dataStudent.titleId = item.id;
        dataStudent.title = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditProfilerace") {
        dataStudent.raceId = item.id;
        dataStudent.race = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditProfilenationality") {
        dataStudent.nationalityId = item.id;
        dataStudent.nationality = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditProfilereligion") {
        dataStudent.religionId = item.id;
        dataStudent.religion = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditProfiledisability") {
        dataStudent.disabilityId = item.id;
        dataStudent.disability = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditProfiledisadvantage") {
        dataStudent.disadvantageId = item.id;
        dataStudent.disadvantage = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditPermanenthouseRegistrationProvince") {
        dataStudent.houseRegistrationProvinceId = item.id;
        dataStudent.houseRegistrationProvince = item.title;
        this.loadDistrict(item.id);
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditPermanenthouseRegistrationDistrict") {
        dataStudent.houseRegistrationDistrictId = item.id;
        dataStudent.houseRegistrationDistrict = item.title;
        this.loadSubDistrict(dataStudent.houseRegistrationProvinceId, item.id);
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditPermanenthouseRegistrationSubDistrict") {
        dataStudent.houseRegistrationSubDistrictId = item.id;
        dataStudent.houseRegistrationSubDistrict = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditPermanentbornProvince") {
        dataStudent.bornProvinceId = item.id;
        dataStudent.bornProvince = item.title;
        this.loadDistrict(item.id, 'birth_districtList');
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditPermanentbornDistrict") {
        dataStudent.bornDistrictId = item.id;
        dataStudent.bornDistrict = item.title;
        this.loadSubDistrict(dataStudent.bornProvinceId, item.id, 'birth_subdistrictList');
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditPermanentbornSubDistrict") {
        dataStudent.bornSubDistrictId = item.id;
        dataStudent.bornSubDistrict = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditContactcontactProvince") {
        dataStudent.contactProvinceId = item.id;
        dataStudent.contactProvince = item.title;
        this.loadDistrict(item.id, 'contact_districtList');
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditContactcontactDistrict") {
        dataStudent.contactDistrictId = item.id;
        dataStudent.contactDistrict = item.title;
        this.loadSubDistrict(dataStudent.contactProvinceId, item.id, 'contact_subdistrictList');
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditContactcontactSubDistrict") {
        dataStudent.contactSubDistrictId = item.id;
        dataStudent.contactSubDistrict = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditContactstayWithTitle") {
        dataStudent.stayWithTitleId = item.id;
        dataStudent.stayWithTitle = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditContacthomeType") {
        dataStudent.homeTypeId = item.id;
        dataStudent.homeType = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditfatherTitle") {
        dataStudent.fatherTitleId = item.id;
        dataStudent.fatherTitle = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditfatherRace") {
        dataStudent.fatherRaceId = item.id;
        dataStudent.fatherRace = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditfatherNation") {
        dataStudent.fatherNationId = item.id;
        dataStudent.fatherNation = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditfatherReligion") {
        dataStudent.fatherReligionId = item.id;
        dataStudent.fatherReligion = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditfatherGraduatedLevel") {
        dataStudent.fatherGraduatedLevelId = item.id;
        dataStudent.fatherGraduatedLevel = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditfatherProvince") {
        dataStudent.fatherProvinceId = item.id;
        dataStudent.fatherProvince = item.title;
        this.loadDistrict(item.id, 'father_districtList');
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditfatherDistrict") {
        dataStudent.fatherDistrictId = item.id;
        dataStudent.fatherDistrict = item.title;
        this.loadSubDistrict(dataStudent.fatherProvinceId, item.id, 'father_subdistrictList');
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditfatherSubDistrict") {
        dataStudent.fatherSubDistrictId = item.id;
        dataStudent.fatherSubDistrict = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditmotherTitle") {
        dataStudent.motherTitleId = item.id;
        dataStudent.motherTitle = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditmotherRace") {
        dataStudent.motherRaceId = item.id;
        dataStudent.motherRace = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditmotherNation") {
        dataStudent.motherNationId = item.id;
        dataStudent.motherNation = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditmotherReligion") {
        dataStudent.motherReligionId = item.id;
        dataStudent.motherReligion = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditmotherGraduatedLevel") {
        dataStudent.motherGraduatedLevelId = item.id;
        dataStudent.motherGraduatedLevel = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditmotherProvince") {
        dataStudent.motherProvinceId = item.id;
        dataStudent.motherProvince = item.title;
        this.loadDistrict(item.id, 'mother_districtList');
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditmotherDistrict") {
        dataStudent.motherDistrictId = item.id;
        dataStudent.motherDistrict = item.title;
        this.loadSubDistrict(dataStudent.motherProvinceId, item.id, 'mother_subdistrictList');
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditmotherSubDistrict") {
        dataStudent.motherSubDistrictId = item.id;
        dataStudent.motherSubDistrict = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditparentFrom") {
        dataStudent.parentFromId = item.id;
        dataStudent.parentFrom = item.title;
        this.copyFromParent(item.id);
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditparentRelation") {
        dataStudent.parentRelationId = item.id;
        dataStudent.parentRelation = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditparentTitle") {
        dataStudent.parentTitleId = item.id;
        dataStudent.parentTitle = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditparentRace") {
        dataStudent.parentRaceId = item.id;
        dataStudent.parentRace = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditparentNation") {
        dataStudent.parentNationId = item.id;
        dataStudent.parentNation = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditparentReligion") {
        dataStudent.parentReligionId = item.id;
        dataStudent.parentReligion = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditparentGraduatedLevel") {
        dataStudent.parentGraduatedLevelId = item.id;
        dataStudent.parentGraduatedLevel = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditparentProvince") {
        dataStudent.parentProvinceId = item.id;
        dataStudent.parentProvince = item.title;
        this.loadDistrict(item.id, 'parent_districtList');
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditparentDistrict") {
        dataStudent.parentDistrictId = item.id;
        dataStudent.parentDistrict = item.title;
        this.loadSubDistrict(dataStudent.parentProvinceId, item.id, 'parent_subdistrictList');
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditparentSubDistrict") {
        dataStudent.parentSubDistrictId = item.id;
        dataStudent.parentSubDistrict = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditreimbursementTuitionFee") {
        dataStudent.reimbursementTuitionFeeId = item.id;
        dataStudent.reimbursementTuitionFee = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditfamilyStatus") {
        dataStudent.familyStatusId = item.id;
        dataStudent.familyStatus = item.title;
        this.setState({dataStudent: dataStudent, selItemShowable: false});
      }
    }
  }

  updateStudentProfile = () => {
    const {dataStudent} = this.state;

    const params = {
      studentId: this.state.userInfo.ID,
      schoolId: this.state.userInfo.SchoolID,
      gender: dataStudent.sexId,
      title: dataStudent.titleId,
      name: dataStudent.nameTh,
      surname: dataStudent.lastnameTh,
      nameEn: dataStudent.nameEn,
      surnameEn: dataStudent.lastnameEn,
      nameOther: dataStudent.nameOther,
      surnameOther: dataStudent.lastnameOther,
      nickname: dataStudent.nicknameTh,
      nicknameEn: dataStudent.nicknameEn,
      birthDay: moment(dataStudent.birthday).format('YYYY-MM-DD') + "T00:00:00",
      race: dataStudent.raceId,
      nationality: dataStudent.nationalityId,
      religion: dataStudent.religionId,
      disability: dataStudent.disabilityId,
      disadvantaged: dataStudent.disadvantageId,
      phoneNumber: dataStudent.phoneNumber,
      email: dataStudent.email,
      numberMemberInFamily: dataStudent.totalSiblings,
      youAreChildOfFamily: dataStudent.sonNo,
      haveBrotherStudyInSchool: dataStudent.numberSiblingsStudyingInSchool,
      other: dataStudent.note2,
    };

    console.log("updateStudentProfile", params);

    const promise = ApiManager.updateStudentProfile(params);
    this.setState({isLoading: true});
    promise.then(result => {
      console.log("result:", result);
      this.setState({isEditProfile: false, isLoading: false}, () => {
        this.loadData();
      })
    }).catch(error => {
      console.log("updateStudentProfile", error);
      this.setState({isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN')});
    })
  }

  updatePermanentAddress = () => {
    const {dataStudent} = this.state;

    const params = {
      studentId: this.state.userInfo.ID,
      schoolId: this.state.userInfo.SchoolID,
      houseCode: dataStudent.houseRegistrationCode,
      houseNo: dataStudent.houseRegistrationNo,
      soi: dataStudent.houseRegistrationLane,
      moo: dataStudent.houseRegistrationVillageNo,
      road: dataStudent.houseRegistrationRoad,
      province: dataStudent.houseRegistrationProvinceId,
      district: dataStudent.houseRegistrationDistrictId,
      subDistrict: dataStudent.houseRegistrationSubDistrictId,
      postalCode: dataStudent.houseRegistrationPostalCode,
      homePhoneNumber: dataStudent.houseRegistrationPhone,
      birthPlace: dataStudent.bornPlace,
      birthPlaceProvince: dataStudent.bornProvinceId,
      birthPlaceDistrict: dataStudent.bornDistrictId,
      birthPlaceSubDistrict: dataStudent.bornSubDistrictId,
    };

    console.log("updatePermanentAddress", params);
    const promise = ApiManager.updateStudentPermanentAddress(params);
    this.setState({isLoading: true});
    promise.then(result => {
      this.setState({isEditPermenentAddress: false, isLoading: false}, () => {
        this.loadData();
      })
    }).catch(error => {
      console.log("updatePermanentAddress", error);
      this.setState({isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN')});
    })
  }

  updateContactAddress = () => {
    const {dataStudent} = this.state;

    const params = {
      studentId: this.state.userInfo.ID,
      schoolId: this.state.userInfo.SchoolID,
      isPermanentAddress: this.state.isSelectPermanentAddr,
      houseNo: dataStudent.contactHomeNo,
      soi: dataStudent.contactLane,
      moo: dataStudent.contactVillageNo,
      road: dataStudent.contactRoad,
      province: dataStudent.contactProvinceId,
      district: dataStudent.contactDistrictId,
      subDistrict: dataStudent.contactSubDistrictId,
      postalCode: dataStudent.contactPostalCode,
      housePhone: dataStudent.contactPhone,
      liveWithTitle: dataStudent.stayWithTitleId,
      liveWithName: dataStudent.stayWithName,
      liveWithSurname: dataStudent.stayWithLastname,
      emergencyPhone: dataStudent.stayWithEmergencyCall,
      liveWithEmail: dataStudent.stayWithEmail,
      neighborName: dataStudent.friendName,
      neighborSurname: dataStudent.friendLastname,
      neighborPhone: dataStudent.friendPhone,
      houseStyle: dataStudent.homeTypeId
    };

    console.log("updateContactAddress", params);

    const promise = ApiManager.updateStudentContactAddress(params);
    this.setState({isLoading: true});
    promise.then(result => {
      this.setState({isEditContactAddress: false, isLoading: false}, () => {
        this.loadData();
      })
    }).catch(error => {
      console.log("updateContactAddress", error);
      this.setState({isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN')});
    })
  }

  updateFatherInfo = () => {
    const {dataStudent} = this.state;

    const params = {
      studentId: this.state.userInfo.ID,
      schoolId: this.state.userInfo.SchoolID,
      title: dataStudent.fatherTitleId,
      name: dataStudent.fatherNameTh,
      surname: dataStudent.fatherLastnameTh,
      nameEn: dataStudent.fatherNameEn,
      surnameEn: dataStudent.fatherLastnameEn,
      birthDay: moment(dataStudent.fatherBirthday).format('YYYY-MM-DD') + "T00:00:00",
      idCardNumber: dataStudent.fatherIDCardNumber,
      race: dataStudent.fatherRaceId,
      nationality: dataStudent.fatherNationId,
      religion: dataStudent.fatherReligionId,
      education: dataStudent.fatherGraduatedLevelId,
      houseNo: dataStudent.fatherHomeNo,
      soi: dataStudent.fatherLane,
      moo: dataStudent.fatherVillageNo,
      road: dataStudent.fatherRoad,
      province: dataStudent.fatherProvinceId,
      district: dataStudent.fatherDistrictId,
      subDistrict: dataStudent.fatherSubDistrictId,
      postalCode: dataStudent.fatherPostalCode,
      career: dataStudent.fatherCareer,
      monthlyIncome: dataStudent.fatherIncome,
      workPlaces: dataStudent.fatherWorkPlace,
      phoneNumberHouse: dataStudent.fatherHomePhone,
      phoneNumberMobile: dataStudent.fatherMobilePhone,
      phoneNumberWorkPlace: dataStudent.fatherWorkPlacePhone,
    };

    console.log("updateFatherInfo", params);

    const promise = ApiManager.updateStudentFatherInfo(params);
    this.setState({isLoading: true});
    promise.then(result => {
      this.setState({isEditFatherInfo: false, isLoading: false}, () => {
        this.loadData();
      })
    }).catch(error => {
      console.log("updateFatherInfo", error);
      this.setState({isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN')});
    })
  }

  updateMotherInfo = () => {
    const {dataStudent} = this.state;

    const params = {
      studentId: this.state.userInfo.ID,
      schoolId: this.state.userInfo.SchoolID,
      title: dataStudent.motherTitleId,
      name: dataStudent.motherNameTh,
      surname: dataStudent.motherLastnameTh,
      nameEn: dataStudent.motherNameEn,
      surnameEn: dataStudent.motherLastnameEn,
      birthDay: moment(dataStudent.motherBirthday).format('YYYY-MM-DD') + "T00:00:00",
      idCardNumber: dataStudent.motherIDCardNumber,
      race: dataStudent.motherRaceId,
      nationality: dataStudent.motherNationId,
      religion: dataStudent.motherReligionId,
      education: dataStudent.motherGraduatedLevelId,
      isFatherAddress: this.state.isSelectFatherAddr,
      houseNo: dataStudent.motherHomeNo,
      soi: dataStudent.motherLane,
      moo: dataStudent.motherVillageNo,
      road: dataStudent.motherRoad,
      province: dataStudent.motherProvinceId,
      district: dataStudent.motherDistrictId,
      subDistrict: dataStudent.motherSubDistrictId,
      postalCode: dataStudent.motherPostalCode,
      career: dataStudent.motherCareer,
      monthlyIncome: dataStudent.motherIncome,
      workPlaces: dataStudent.motherWorkPlace,
      phoneNumberHouse: dataStudent.motherHomePhone,
      phoneNumberMobile: dataStudent.motherMobilePhone,
      phoneNumberWorkPlace: dataStudent.motherWorkPlacePhone,
    };

    console.log("updateMotherInfo", params);

    const promise = ApiManager.updateStudentMotherInfo(params);
    this.setState({isLoading: true});
    promise.then(result => {
      this.setState({isEditMotherInfo: false, isLoading: false}, () => {
        this.loadData();
      })
    }).catch(error => {
      console.log("updateMotherInfo", error);
      this.setState({isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN')});
    })
  }

  updateParentInfo = () => {
    const {dataStudent} = this.state;

    const params = {
      studentId: this.state.userInfo.ID,
      schoolId: this.state.userInfo.SchoolID,
      copyFrom: dataStudent.parentFromId,
      relationship: dataStudent.parentRelationId,
      title: dataStudent.parentTitleId,
      name: dataStudent.parentNameTh,
      surname: dataStudent.parentLastnameTh,
      nameEn: dataStudent.parentNameEn,
      surnameEn: dataStudent.parentLastnameEn,
      birthDay: moment(dataStudent.parentBirthday).format('YYYY-MM-DD') + "T00:00:00",
      idCardNumber: dataStudent.parentIDCardNumber,
      race: dataStudent.parentRaceId,
      nationality: dataStudent.parentNationId,
      religion: dataStudent.parentReligionId,
      education: dataStudent.parentGraduatedLevelId,
      houseNo: dataStudent.parentHomeNo,
      soi: dataStudent.parentLane,
      moo: dataStudent.parentVillageNo,
      road: dataStudent.parentRoad,
      province: dataStudent.parentProvinceId,
      district: dataStudent.parentDistrictId,
      subDistrict: dataStudent.parentSubDistrictId,
      postalCode: dataStudent.parentPostalCode,
      tuitionFee: dataStudent.reimbursementTuitionFeeId,
      familyStatus: dataStudent.familyStatusId,
      career: dataStudent.parentCareer,
      monthlyIncome: dataStudent.parentIncome,
      workPlaces: dataStudent.parentWorkPlace,
      phoneNumberHouse: dataStudent.parentHomePhone,
      phoneNumberMobile: dataStudent.parentMobilePhone,
      phoneNumberWorkPlace: dataStudent.parentWorkPlacePhone,
    };

    console.log("updateParentInfo", params);

    const promise = ApiManager.updateStudentParentInfo(params);
    this.setState({isLoading: true});
    promise.then(result => {
      this.setState({isEditParentInfo: false, isLoading: false}, () => {
        this.loadData();
      })
    }).catch(error => {
      console.log("updateParentInfo", error);
      this.setState({isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN')});
    })
  }

  toHistory = () => {
    this.props.navigation.navigate('EditingHistory', {'parent': 'ProfileStudent'});
  }


  render() {
    const {dataStudent, canUpdateStatus} = this.state;
    const user = this.state.userInfo;
    let schoolImage = Images.school;
    let profileImage = Images.student_01;
    let logo = Images.n_img_card_logo;
    let birthday = "";
    if (user != {}) {
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

    let studentAddress = "";
    if (dataStudent.oldSchoolSubDistrict != null) {
      studentAddress = studentAddress + dataStudent.oldSchoolSubDistrict + " ";
    }
    if (dataStudent.oldSchoolDistrict != null) {
      studentAddress = studentAddress + dataStudent.oldSchoolDistrict + " ";
    }
    if (dataStudent.oldSchoolProvince != null) {
      studentAddress = studentAddress + dataStudent.oldSchoolProvince + " ";
    }

    const options = [
      {title: translang.t('PROFILE_studentinfo')},
      {title: translang.t('PROFILE_parentinfo')},
      {title: translang.t('PROFILE_educationinfo')},
      {title: translang.t('PROFILE_healthinfo')},
    ];

    const nameTitleList = this.state.nameTitleList.map(item => {
      return {id: item.titleId, title: item.title};
    });
    const raceList = this.state.raceList.map(item => {
      return {id: item.raceId, title: item.race};
    });
    const religionList = this.state.religionList.map(item => {
      return {id: item.religionId, title: item.religion};
    });
    const nationalList = this.state.nationalList.map(item => {
      return {id: item.nationId, title: item.nation};
    });
    const disabilityList = this.state.disabilityList.map(item => {
      return {id: item.disabilityId, title: item.disability};
    });
    const disadvantageList = this.state.disadvantageList.map(item => {
      return {id: item.disadvantageId, title: item.disadvantage};
    });
    const provinceList = this.state.provinceList.map(item => {
      if (getCurrentLocale() == 'en') {
        return {id: item.provinceId, title: item.provinceEn};
      } else {
        return {id: item.provinceId, title: item.provinceTh};
      }
    });
    const districtList = this.state.districtList.map(item => {
      if (getCurrentLocale() == 'en') {
        return {id: item.districtId, title: item.districtEn};
      } else {
        return {id: item.districtId, title: item.districtTh};
      }
    });
    const subdistrictList = this.state.subdistrictList.map(item => {
      if (getCurrentLocale() == 'en') {
        return {id: item.subDistrictId, title: item.subDistrictEn};
      } else {
        return {id: item.subDistrictId, title: item.subDistrictTh};
      }
    });

    const birth_districtList = this.state.birth_districtList.map(item => {
      if (getCurrentLocale() == 'en') {
        return {id: item.districtId, title: item.districtEn};
      } else {
        return {id: item.districtId, title: item.districtTh};
      }
    });
    const birth_subdistrictList = this.state.birth_subdistrictList.map(item => {
      if (getCurrentLocale() == 'en') {
        return {id: item.subDistrictId, title: item.subDistrictEn};
      } else {
        return {id: item.subDistrictId, title: item.subDistrictTh};
      }
    });

    const contact_districtList = this.state.contact_districtList.map(item => {
      if (getCurrentLocale() == 'en') {
        return {id: item.districtId, title: item.districtEn};
      } else {
        return {id: item.districtId, title: item.districtTh};
      }
    });
    const contact_subdistrictList = this.state.contact_subdistrictList.map(item => {
      if (getCurrentLocale() == 'en') {
        return {id: item.subDistrictId, title: item.subDistrictEn};
      } else {
        return {id: item.subDistrictId, title: item.subDistrictTh};
      }
    });

    const father_districtList = this.state.father_districtList.map(item => {
      if (getCurrentLocale() == 'en') {
        return {id: item.districtId, title: item.districtEn};
      } else {
        return {id: item.districtId, title: item.districtTh};
      }
    });
    const father_subdistrictList = this.state.father_subdistrictList.map(item => {
      if (getCurrentLocale() == 'en') {
        return {id: item.subDistrictId, title: item.subDistrictEn};
      } else {
        return {id: item.subDistrictId, title: item.subDistrictTh};
      }
    });

    const mother_districtList = this.state.mother_districtList.map(item => {
      if (getCurrentLocale() == 'en') {
        return {id: item.districtId, title: item.districtEn};
      } else {
        return {id: item.districtId, title: item.districtTh};
      }
    });
    const mother_subdistrictList = this.state.mother_subdistrictList.map(item => {
      if (getCurrentLocale() == 'en') {
        return {id: item.subDistrictId, title: item.subDistrictEn};
      } else {
        return {id: item.subDistrictId, title: item.subDistrictTh};
      }
    });

    const parent_districtList = this.state.parent_districtList.map(item => {
      if (getCurrentLocale() == 'en') {
        return {id: item.districtId, title: item.districtEn};
      } else {
        return {id: item.districtId, title: item.districtTh};
      }
    });
    const parent_subdistrictList = this.state.parent_subdistrictList.map(item => {
      if (getCurrentLocale() == 'en') {
        return {id: item.subDistrictId, title: item.subDistrictEn};
      } else {
        return {id: item.subDistrictId, title: item.subDistrictTh};
      }
    });


    const houseTypeList = this.state.houseTypeList.map(item => {
      return {id: item.key, title: item.value};
    });
    const educationList = this.state.educationList.map(item => {
      return {id: item.key, title: item.value};
    });

    const copyDataFromList = this.state.copyDataFromList.map(item => {
      return {id: item.key, title: item.value};
    });

    const parentRelateList = this.state.parentRelateList.map(item => {
      return {id: item.key, title: item.value};
    });


    const tutionStatusList = this.state.tutionStatusList.map(item => {
      return {id: item.key, title: item.value};
    });
    const familyStatusList = this.state.familyStatusList.map(item => {
      return {id: item.key, title: item.value};
    });

    const copyFromList = [{id: '0', title: translang.t('PROFILE_FATHER_INFO')}, {
      id: '0',
      title: translang.t('PROFILE_MOTHER_INFO')
    }];
    const relationList = [{id: '0', title: translang.t('FATHER')}, {id: '0', title: translang.t('MOTHER')}];

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_profile')}
          is_history={true}
          onHistoryTap={() => this.toHistory()}
          onMenuTap={() => this.back()}
        />
        <ScrollView style={styles.container}>
          <CustomSwitcher
            dataList={options}
            selectedIndex={this.state.profileType ?? 0}
            onChangedSwitch={(index) => this.onChangeSwitcher(index)}
            containerStyle={{width: '90%', height: 60, marginTop: 20, marginBottom: 20}}
            radius={20}
            textSize={16}
          />

          {this.state.profileType < 3 &&
          <ImageBackground source={schoolImage} style={styles.headerImgContainer}>
            <TouchableOpacity style={styles.cardContainer} activeOpacity={0.9}
                              onPress={() => this.setState({showModal: true})}>
              <Image source={Images.n_img_card_back} style={{
                resizeMode: 'stretch',
                position: 'absolute',
                width: '100%',
                height: '100%',
                flex: 1
              }}></Image>
              <LinearGradient
                style={styles.schoolNameStyle}
                start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                colors={[Color.n_button_gradient_orange_end, Color.n_button_gradient_orange_start]}>
                <Image source={logo} style={{width: 20, height: 20, resizeMode: 'contain', marginTop: 5}}/>
                <View style={{marginLeft: 20,}}>
                  <Text style={{...styles.schoolName, fontSize: 10,}}>{user.SchoolName ?? ''}</Text>
                  <Text style={styles.schoolName}>{user.SchoolNameEN ?? ''}</Text>
                </View>
              </LinearGradient>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 15,
                marginTop: 'auto',
                marginBottom: 'auto'
              }}>
                <Image source={profileImage}
                       style={{height: 86, width: 70, borderRadius: 5, resizeMode: 'contain', marginRight: 10}}></Image>
                <View style={{flex: 1}}>
                  <CardInfoItem
                    title={translang.t('PROFILE_studentid')}
                    value_txt={dataStudent.studentCode ?? ''}
                    titleFontSize={11}
                    infoFontSize={12}/>

                  <CardInfoItem
                    title={translang.t('PROFILE_firstname')}
                    value_txt={dataStudent.name ?? ''}
                    titleFontSize={11}
                    infoFontSize={12}/>

                  <CardInfoItem
                    title={translang.t('PROFILE_lastname')}
                    value_txt={dataStudent.lastname ?? '-'}
                    titleFontSize={11}
                    infoFontSize={12}/>

                  <CardInfoItem
                    title={translang.t('PROFILE_class')}
                    value_txt={dataStudent.levelClassRoomName}
                    titleFontSize={11}
                    infoFontSize={12}/>

                </View>
              </View>
            </TouchableOpacity>
          </ImageBackground>
          }
          <View style={{marginTop: this.state.profileType === 3 ? 0 : 20,}}>
            {this.state.profileType == 0 && <>
              <View style={styles.partTitleContainer}>
                <Text style={styles.partTitleText}>{translang.t('DRAWER_profile')}</Text>
                {!this.state.isEditProfile && this.state.editEnable &&
                <GradientButtonWithImg
                  label={translang.t('PROFILE_edit')}
                  iconImage={Images.n_ic_pencil_white}
                  containerStyle={{width: 70, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0}}
                  buttonStyle={{borderRadius: 5, height: 25}}
                  textStyle={{fontSize: 20, fontWeight: 'bold'}}
                  iconStyle={{width: 10, height: 10}}
                  colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                  isVerticalGradient={false}
                  _onPress={() => {
                    if (canUpdateStatus.canUpdateProfile) {
                      this.setState({isEditProfile: true});
                    } else {
                      this.setState({showPendingAlert: true});
                    }
                  }}
                />}
              </View>
              {!this.state.isEditProfile &&
              <View style={styles.partContainer}>
                <InfoTextItem
                  label={translang.t('USERINFO_studentid')}
                  value_txt={dataStudent.studentCode ?? ''}/>
                <InfoTextItem
                  label={translang.t('STATUS')}
                  value_txt={dataStudent.studentStatus ?? ''}/>
                <InfoTextItem
                  label={translang.t('DATES_OF_ATTENDANCE')}
                  value_txt={dataStudent.dateOfAttendance ? moment(dataStudent.dateOfAttendance).format('DD/MM/YYYY') : ''}/>
                <InfoTextItem
                  label={translang.t('STUDENT_NUMBER')}
                  value_txt={dataStudent.studentNumber ?? ''}/>
                <InfoTextItem
                  label={translang.t('BEHAVIOR_classlevel')}
                  value_txt={dataStudent.levelName ?? ''}/>
                <InfoTextItem
                  label={translang.t('BEHAVIOR_class')}
                  value_txt={dataStudent.levelClassRoomName ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_gender')}
                  value_txt={dataStudent.sex ?? ''}/>
                <InfoTextItem
                  label={translang.t('NAME_TITLES')}
                  value_txt={dataStudent.title ?? ''}/>
                <InfoTextItem
                  label={translang.t('USERINFO_name')}
                  value_txt={dataStudent.nameTh ?? ''}/>
                <InfoTextItem
                  label={translang.t('USERINFO_surname')}
                  value_txt={dataStudent.lastnameTh ?? ''}/>
                <InfoTextItem
                  label={translang.t('USERINFO_name_en')}
                  value_txt={dataStudent.nameEn ?? ''}/>
                <InfoTextItem
                  label={translang.t('USERINFO_surname_en')}
                  value_txt={dataStudent.lastnameEn ?? ''}/>
                <InfoTextItem
                  label={translang.t('NAME_OTHER')}
                  value_txt={dataStudent.nameOther ?? ''}/>
                <InfoTextItem
                  label={translang.t('SURNAME_OTHER')}
                  value_txt={dataStudent.lastnameOther ?? ''}/>
                <InfoTextItem
                  label={translang.t('NICK_NAME')}
                  value_txt={dataStudent.nicknameTh ?? ''}/>
                <InfoTextItem
                  label={translang.t('NICK_NAME_EN')}
                  value_txt={dataStudent.nicknameEn ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_birthday')}
                  value_txt={dataStudent.birthday ? moment(dataStudent.birthday).format('DD/MM/YYYY') : ''}/>
                <View style={{flexDirection: 'row'}}>
                  <View style={{flex: 1}}>
                    <InfoTextItem
                      label={translang.t('RACE')}
                      value_txt={dataStudent.race ?? ''}/>
                  </View>
                  <View style={{flex: 1, paddingLeft: 10}}>
                    <InfoTextItem
                      label={translang.t('PROFILE_Nationality')}
                      value_txt={dataStudent.nationality ?? ""}/>
                  </View>
                </View>
                <InfoTextItem
                  label={translang.t('PROFILE_Religion')}
                  value_txt={dataStudent.religion ?? ''}/>
                <InfoTextItem
                  label={translang.t('DISABILITY')}
                  value_txt={dataStudent.disability ?? ''}/>
                <InfoTextItem
                  label={translang.t('DISADVANTAGE')}
                  value_txt={dataStudent.disadvantage ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_phonenumber')}
                  value_txt={dataStudent.phoneNumber ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_email')}
                  value_txt={dataStudent.email ?? ''}/>
                <InfoTextItem
                  label={translang.t('NUMBER_OF_FAMILY')}
                  value_txt={dataStudent.totalSiblings ?? ''}/>
                <InfoTextItem
                  label={translang.t('YOU_CHILD_OF_FAMILY')}
                  value_txt={dataStudent.sonNo ?? ''}/>
                <InfoTextItem
                  label={translang.t('BROTHER_SISTER_IN_SCHOOL')}
                  value_txt={dataStudent.numberSiblingsStudyingInSchool ?? ''}/>
                <InfoTextItem
                  label={translang.t('TOPUP_other')}
                  value_txt={dataStudent.note2 ?? ''}/>
              </View>}
              {this.state.isEditProfile &&
              <View style={styles.partEditContainer}>
                <InfoTextInputItem
                  disable={false}
                  label={translang.t('USERINFO_studentid')}
                  value_txt={dataStudent.studentCode ?? ''}/>

                <InfoTextInputItem
                  disable={false}
                  label={translang.t('STATUS')}
                  value_txt={dataStudent.studentStatus ?? ''}/>

                <InfoTextInputItem
                  disable={true}
                  label={translang.t('DATES_OF_ATTENDANCE')}
                  value_txt={dataStudent.dateOfAttendance ? moment(dataStudent.dateOfAttendance).format('DD/MM/YYYY') : ''}/>

                <InfoTextInputItem
                  disable={true}
                  label={translang.t('STUDENT_NUMBER')}
                  value_txt={dataStudent.studentNumber ?? ''}/>

                <InfoTextInputItem
                  disable={true}
                  label={translang.t('BEHAVIOR_classlevel')}
                  value_txt={dataStudent.levelName ?? ''}/>

                <InfoTextInputItem
                  disable={true}
                  label={translang.t('BEHAVIOR_class')}
                  value_txt={dataStudent.levelClassRoomName ?? ''}/>

                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditProfilesex",
                      selItemSelectedIndex: 0,
                      selItemShowList: this.state.genderList
                    })
                  }}
                  placeHolder={translang.t('SELECT_GENDER')}
                  label={translang.t('PROFILE_gender')}
                  value_txt={dataStudent.sex ?? ''}/>

                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditProfiletitle",
                      selItemSelectedIndex: 0,
                      selItemShowList: nameTitleList
                    })
                  }}
                  selectList={nameTitleList}
                  placeHolder={translang.t('NAME_TITLES')}
                  label={translang.t('NAME_TITLES')}
                  value_txt={dataStudent.title ?? ''}/>

                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.nameTh = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('USERINFO_name')}
                  label={translang.t('USERINFO_name')}
                  value_txt={dataStudent.nameTh ?? ''}/>

                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.lastnameTh = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('USERINFO_surname')}
                  label={translang.t('USERINFO_surname')}
                  value_txt={dataStudent.lastnameTh ?? ''}/>

                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.nameEn = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('USERINFO_name_en')}
                  label={translang.t('USERINFO_name_en')}
                  value_txt={dataStudent.nameEn ?? ''}/>

                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.lastnameEn = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('USERINFO_surname_en')}
                  label={translang.t('USERINFO_surname_en')}
                  value_txt={dataStudent.lastnameEn ?? ''}/>

                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.nameOther = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('NAME_OTHER')}
                  label={translang.t('NAME_OTHER')}
                  value_txt={dataStudent.nameOther ?? ''}/>

                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.lastnameOther = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('SURNAME_OTHER')}
                  label={translang.t('SURNAME_OTHER')}
                  value_txt={dataStudent.lastnameOther ?? ''}/>

                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.nicknameTh = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('NICK_NAME')}
                  label={translang.t('NICK_NAME')}
                  value_txt={dataStudent.nicknameTh ?? ''}/>

                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.nicknameEn = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('NICK_NAME_EN')}
                  label={translang.t('NICK_NAME_EN')}
                  value_txt={dataStudent.nicknameEn ?? ''}/>

                <TouchableOpacity onPress={() => {
                  this.setState({showDatePicker: true, selCalendarType: "ProfileBirthday"});
                }}>
                  <InfoTextInputItem
                    disable={false}
                    canSelect={false}
                    placeHolder={translang.t('DDMMYYYY')}
                    label={translang.t('PROFILE_birthday')}
                    notouch={true}
                    value_txt={moment(dataStudent.birthday).format('DD/MM/YYYY') ?? ''}/>
                </TouchableOpacity>


                <View style={{flexDirection: 'row'}}>
                  <View style={{flex: 1}}>
                    <InfoTextInputItem
                      disable={false}
                      canSelect={true}
                      onClickInput={() => {
                        this.setState({
                          selItemShowable: true,
                          selItemSelTypeStr: "EditProfilerace",
                          selItemSelectedIndex: 0,
                          selItemShowList: raceList
                        })
                      }}
                      selectList={raceList}
                      onSelectItem={(item, index) => {
                        let temp = dataStudent;
                        temp.raceId = item.id;
                        temp.race = item.title;
                        this.setState({dataStudent: temp});
                      }}
                      placeHolder={translang.t('RACE')}
                      label={translang.t('RACE')}
                      value_txt={dataStudent.race ?? ''}/>
                  </View>
                  <View style={{flex: 1, paddingLeft: 10}}>
                    <InfoTextInputItem
                      disable={false}
                      canSelect={true}
                      onClickInput={() => {
                        this.setState({
                          selItemShowable: true,
                          selItemSelTypeStr: "EditProfilenationality",
                          selItemSelectedIndex: 0,
                          selItemShowList: nationalList
                        })
                      }}
                      selectList={nationalList}
                      onSelectItem={(item, index) => {
                        let temp = dataStudent;
                        temp.nationalityId = item.id;
                        temp.nationality = item.title;
                        this.setState({dataStudent: temp});
                      }}
                      placeHolder={translang.t('PROFILE_Nationality')}
                      label={translang.t('PROFILE_Nationality')}
                      value_txt={dataStudent.nationality ?? ""}/>
                  </View>
                </View>

                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditProfilereligion",
                      selItemSelectedIndex: 0,
                      selItemShowList: religionList
                    })
                  }}
                  selectList={religionList}
                  onSelectItem={(item, index) => {
                    let temp = dataStudent;
                    temp.religionId = item.id;
                    temp.religion = item.title;
                    this.setState({dataStudent: temp});
                  }}
                  placeHolder={translang.t('PROFILE_Religion')}
                  label={translang.t('PROFILE_Religion')}
                  value_txt={dataStudent.religion ?? ''}/>

                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditProfiledisability",
                      selItemSelectedIndex: 0,
                      selItemShowList: disabilityList
                    })
                  }}
                  selectList={disabilityList}
                  onSelectItem={(item, index) => {
                    let temp = dataStudent;
                    temp.disabilityId = item.id;
                    temp.disability = item.title;
                    this.setState({dataStudent: temp});
                  }}
                  placeHolder={translang.t('DISABILITY')}
                  label={translang.t('DISABILITY')}
                  value_txt={dataStudent.disability ?? ''}/>

                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditProfiledisadvantage",
                      selItemSelectedIndex: 0,
                      selItemShowList: disadvantageList
                    })
                  }}
                  selectList={disadvantageList}
                  onSelectItem={(item, index) => {
                    let temp = dataStudent;
                    temp.disadvantageId = item.id;
                    temp.disadvantage = item.title;
                    this.setState({dataStudent: temp});
                  }}
                  placeHolder={translang.t('DISADVANTAGE')}
                  label={translang.t('DISADVANTAGE')}
                  value_txt={dataStudent.disadvantage ?? ''}/>

                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.phoneNumber = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('PROFILE_phonenumber')}
                  label={translang.t('PROFILE_phonenumber')}
                  value_txt={dataStudent.phoneNumber ?? ''}/>

                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.email = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('PROFILE_email')}
                  label={translang.t('PROFILE_email')}
                  value_txt={dataStudent.email ?? ''}/>

                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.totalSiblings = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  isNum={true}
                  placeHolder={translang.t('NUMBER_OF_FAMILY')}
                  label={translang.t('NUMBER_OF_FAMILY')}
                  value_txt={dataStudent.totalSiblings ?? ''}/>

                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.sonNo = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  isNum={true}
                  placeHolder={translang.t('YOU_CHILD_OF_FAMILY')}
                  label={translang.t('YOU_CHILD_OF_FAMILY')}
                  value_txt={dataStudent.sonNo ?? ''}/>

                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  isNum={true}
                  onChangeText={(key) => {
                    dataStudent.numberSiblingsStudyingInSchool = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('BROTHER_SISTER_IN_SCHOOL')}
                  label={translang.t('BROTHER_SISTER_IN_SCHOOL')}
                  value_txt={dataStudent.numberSiblingsStudyingInSchool ?? ''}/>

                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.note2 = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('TOPUP_other')}
                  label={translang.t('TOPUP_other')}
                  value_txt={dataStudent.note2 ?? ''}/>

                <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                  <GradientButton
                    label={translang.t('COMMON_cancel')}
                    containerStyle={{
                      width: 116,
                      marginTop: 30,
                      paddingHorizontal: 0,
                      shadowColor: 'transparent',
                      shadowOpacity: 0
                    }}
                    buttonStyle={{borderRadius: 22, height: 44}}
                    colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
                    isVerticalGradient={false}
                    _onPress={() => {
                      this.setState({isEditProfile: false}, () => {
                        this.loadData();
                      })
                    }}
                  />
                  <GradientButton
                    label={translang.t('SAVE')}
                    containerStyle={{
                      width: 116,
                      marginTop: 30,
                      paddingHorizontal: 0,
                      shadowColor: 'transparent',
                      shadowOpacity: 0,
                      marginLeft: 30
                    }}
                    buttonStyle={{borderRadius: 22, height: 44}}
                    colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                    isVerticalGradient={false}
                    _onPress={() => {
                      this.updateStudentProfile()
                    }}
                  />
                </View>

              </View>}

              <View style={styles.partTitleContainer}>
                <Text style={styles.partTitleText}>{translang.t('PERMANENT_ADDRESS')}</Text>
                {!this.state.isEditPermenentAddress && this.state.editEnable &&
                <GradientButtonWithImg
                  label={translang.t('PROFILE_edit')}
                  iconImage={Images.n_ic_pencil_white}
                  containerStyle={{width: 70, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0}}
                  buttonStyle={{borderRadius: 5, height: 25}}
                  textStyle={{fontSize: 20, fontWeight: 'bold'}}
                  iconStyle={{width: 10, height: 10}}
                  colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                  isVerticalGradient={false}
                  _onPress={() => {
                    if (canUpdateStatus.canUpdatePermanentAddress) {
                      this.setState({isEditPermenentAddress: true});
                    } else {
                      this.setState({showPendingAlert: true});
                    }
                  }}
                />}
              </View>
              {!this.state.isEditPermenentAddress &&
              <View style={styles.partContainer}>
                <InfoTextItem
                  label={translang.t('HOUSE_CODE')}
                  value_txt={dataStudent.houseRegistrationCode ?? ''}/>
                <InfoTextItem
                  label={translang.t('LEAVE_houseno')}
                  value_txt={dataStudent.houseRegistrationNo ?? ''}/>
                <InfoTextItem
                  label={translang.t('SOI')}
                  value_txt={dataStudent.houseRegistrationLane ?? ''}/>
                <InfoTextItem
                  label={translang.t('MOO')}
                  value_txt={dataStudent.houseRegistrationVillageNo ?? ''}/>
                <InfoTextItem
                  label={translang.t('ADDR_ROAD')}
                  value_txt={dataStudent.houseRegistrationRoad ?? ''}/>
                <InfoTextItem
                  label={translang.t('ADDR_PROVINCE')}
                  value_txt={dataStudent.houseRegistrationProvince ?? ''}/>
                <InfoTextItem
                  label={translang.t('ADDR_DISTRICT')}
                  value_txt={dataStudent.houseRegistrationDistrict ?? ''}/>
                <InfoTextItem
                  label={translang.t('SUB_DISTRICT')}
                  value_txt={dataStudent.houseRegistrationSubDistrict ?? ''}/>
                <InfoTextItem
                  label={translang.t('POSTAL_CODE')}
                  value_txt={dataStudent.houseRegistrationPostalCode ?? ''}/>
                <InfoTextItem
                  label={translang.t('HOME_PHONE_NUMBER')}
                  value_txt={dataStudent.houseRegistrationPhone ?? ''}/>
                <InfoTextItem
                  label={translang.t('PLACE_BIRTH_HOSPITAL')}
                  value_txt={dataStudent.bornPlace ?? ''}/>
                <InfoTextItem
                  label={translang.t('PLACE_BIRTH_PROVINCE')}
                  value_txt={dataStudent.bornProvince ?? ''}/>
                <InfoTextItem
                  label={translang.t('PLACE_BIRTH_DISTRICT')}
                  value_txt={dataStudent.bornDistrict ?? ''}/>
                <InfoTextItem
                  label={translang.t('PLACE_BIRTH_SUB_DISTRICT')}
                  value_txt={dataStudent.bornSubDistrict ?? ''}/>
              </View>}
              {this.state.isEditPermenentAddress &&
              <View style={styles.partEditContainer}>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.houseRegistrationCode = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('HOUSE_CODE')}
                  label={translang.t('HOUSE_CODE')}
                  value_txt={dataStudent.houseRegistrationCode ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.houseRegistrationNo = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('LEAVE_houseno')}
                  label={translang.t('LEAVE_houseno')}
                  value_txt={dataStudent.houseRegistrationNo ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.houseRegistrationLane = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('SOI')}
                  label={translang.t('SOI')}
                  value_txt={dataStudent.houseRegistrationLane ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.houseRegistrationVillageNo = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('MOO')}
                  label={translang.t('MOO')}
                  value_txt={dataStudent.houseRegistrationVillageNo ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.houseRegistrationRoad = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('ADDR_ROAD')}
                  label={translang.t('ADDR_ROAD')}
                  value_txt={dataStudent.houseRegistrationRoad ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditPermanenthouseRegistrationProvince",
                      selItemSelectedIndex: 0,
                      selItemShowList: provinceList
                    })
                  }}
                  placeHolder={translang.t('ADDR_PROVINCE')}
                  label={translang.t('ADDR_PROVINCE')}
                  value_txt={dataStudent.houseRegistrationProvince ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditPermanenthouseRegistrationDistrict",
                      selItemSelectedIndex: 0,
                      selItemShowList: districtList
                    })
                  }}
                  placeHolder={translang.t('ADDR_DISTRICT')}
                  label={translang.t('ADDR_DISTRICT')}
                  value_txt={dataStudent.houseRegistrationDistrict ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditPermanenthouseRegistrationSubDistrict",
                      selItemSelectedIndex: 0,
                      selItemShowList: subdistrictList
                    })
                  }}
                  placeHolder={translang.t('SUB_DISTRICT')}
                  label={translang.t('SUB_DISTRICT')}
                  value_txt={dataStudent.houseRegistrationSubDistrict ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.houseRegistrationPostalCode = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('POSTAL_CODE')}
                  label={translang.t('POSTAL_CODE')}
                  value_txt={dataStudent.houseRegistrationPostalCode ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.houseRegistrationPhone = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('HOME_PHONE_NUMBER')}
                  label={translang.t('HOME_PHONE_NUMBER')}
                  value_txt={dataStudent.houseRegistrationPhone ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.bornPlace = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('PLACE_BIRTH_HOSPITAL')}
                  label={translang.t('PLACE_BIRTH_HOSPITAL')}
                  value_txt={dataStudent.bornPlace ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditPermanentbornProvince",
                      selItemSelectedIndex: 0,
                      selItemShowList: provinceList
                    })
                  }}
                  placeHolder={translang.t('PLACE_BIRTH_PROVINCE')}
                  label={translang.t('PLACE_BIRTH_PROVINCE')}
                  value_txt={dataStudent.bornProvince ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditPermanentbornDistrict",
                      selItemSelectedIndex: 0,
                      selItemShowList: birth_districtList
                    })
                  }}
                  placeHolder={translang.t('PLACE_BIRTH_DISTRICT')}
                  label={translang.t('PLACE_BIRTH_DISTRICT')}
                  value_txt={dataStudent.bornDistrict ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditPermanentbornSubDistrict",
                      selItemSelectedIndex: 0,
                      selItemShowList: birth_subdistrictList
                    })
                  }}
                  placeHolder={translang.t('PLACE_BIRTH_SUB_DISTRICT')}
                  label={translang.t('PLACE_BIRTH_SUB_DISTRICT')}
                  value_txt={dataStudent.bornSubDistrict ?? ''}/>

                <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                  <GradientButton
                    label={translang.t('COMMON_cancel')}
                    containerStyle={{
                      width: 116,
                      marginTop: 30,
                      paddingHorizontal: 0,
                      shadowColor: 'transparent',
                      shadowOpacity: 0
                    }}
                    buttonStyle={{borderRadius: 22, height: 44}}
                    colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
                    isVerticalGradient={false}
                    _onPress={() => {
                      this.setState({isEditPermenentAddress: false}, () => {
                        this.loadData();
                      })
                    }}
                  />
                  <GradientButton
                    label={translang.t('SAVE')}
                    containerStyle={{
                      width: 116,
                      marginTop: 30,
                      paddingHorizontal: 0,
                      shadowColor: 'transparent',
                      shadowOpacity: 0,
                      marginLeft: 30
                    }}
                    buttonStyle={{borderRadius: 22, height: 44}}
                    colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                    isVerticalGradient={false}
                    _onPress={() => {
                      this.updatePermanentAddress()
                    }}
                  />
                </View>

              </View>}

              <View style={styles.partTitleContainer}>
                <Text style={styles.partTitleText}>{translang.t('CONTACT_ADDRESS')}</Text>
                {!this.state.isEditContactAddress && this.state.editEnable &&
                <GradientButtonWithImg
                  label={translang.t('PROFILE_edit')}
                  iconImage={Images.n_ic_pencil_white}
                  containerStyle={{width: 70, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0}}
                  buttonStyle={{borderRadius: 5, height: 25}}
                  textStyle={{fontSize: 20, fontWeight: 'bold'}}
                  iconStyle={{width: 10, height: 10}}
                  colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                  isVerticalGradient={false}
                  _onPress={() => {
                    if (canUpdateStatus.canUpdateContactAddress) {
                      this.setState({isEditContactAddress: true})
                    } else {
                      this.setState({showPendingAlert: true});
                    }

                  }}
                />}
              </View>
              {!this.state.isEditContactAddress &&
              <View style={styles.partContainer}>
                <CustomCheckButton
                  isSelected={this.state.isSelectPermanentAddr}
                  checkboxSize={20}
                  disabled={true}
                  text={translang.t('PERMANENT_ADDRESS')}
                  textColor={Color.n_default_orange}
                  itemTextStyle={styles.checkboxlabel}
                />
                <InfoTextItem
                  label={translang.t('LEAVE_houseno')}
                  value_txt={dataStudent.contactHomeNo ?? ''}/>
                <InfoTextItem
                  label={translang.t('SOI')}
                  value_txt={dataStudent.contactLane ?? ''}/>
                <InfoTextItem
                  label={translang.t('MOO')}
                  value_txt={dataStudent.contactVillageNo ?? ''}/>
                <InfoTextItem
                  label={translang.t('ADDR_ROAD')}
                  value_txt={dataStudent.contactRoad ?? ''}/>
                <InfoTextItem
                  label={translang.t('ADDR_PROVINCE')}
                  value_txt={dataStudent.contactProvince ?? ''}/>
                <InfoTextItem
                  label={translang.t('ADDR_DISTRICT')}
                  value_txt={dataStudent.contactDistrict ?? ''}/>
                <InfoTextItem
                  label={translang.t('SUB_DISTRICT')}
                  value_txt={dataStudent.contactSubDistrict ?? ''}/>
                <InfoTextItem
                  label={translang.t('POSTAL_CODE')}
                  value_txt={dataStudent.contactPostalCode ?? ''}/>
                <InfoTextItem
                  label={translang.t('HOME_PHONE_NUMBER')}
                  value_txt={dataStudent.contactPhone ?? ''}/>
                <InfoTextItem
                  label={translang.t('WHO_LIVE_WITH_NAME_TITLE')}
                  value_txt={dataStudent.stayWithTitle ?? ''}/>
                <InfoTextItem
                  label={translang.t('WHO_LIVE_WITH_NAME')}
                  value_txt={dataStudent.stayWithName ?? ''}/>
                <InfoTextItem
                  label={translang.t('WHO_LIVE_WITH_SURNAME')}
                  value_txt={dataStudent.stayWithLastname ?? ''}/>
                <InfoTextItem
                  label={translang.t('EMERGENCY_PHONE')}
                  value_txt={dataStudent.stayWithEmergencyCall ?? ''}/>
                <InfoTextItem
                  label={translang.t('WHO_LIVE_WITH_EMAIL')}
                  value_txt={dataStudent.stayWithEmail ?? ''}/>
                <InfoTextItem
                  label={translang.t('NEIGHBOUR_NAME')}
                  value_txt={dataStudent.friendName ?? ''}/>
                <InfoTextItem
                  label={translang.t('NEIGHBOUR_SURNAME')}
                  value_txt={dataStudent.friendLastname ?? ''}/>
                <InfoTextItem
                  label={translang.t('NEIGHBOUR_TELEPHONE')}
                  value_txt={dataStudent.friendPhone ?? ''}/>
                <InfoTextItem
                  label={translang.t('HOUSE_STYLE')}
                  value_txt={dataStudent.homeType ?? ''}/>
              </View>}
              {this.state.isEditContactAddress &&
              <View style={styles.partEditContainer}>
                <CustomCheckButton
                  isSelected={this.state.isSelectPermanentAddr}
                  checkboxSize={20}
                  onPress={() => this.setLikePermanentAddress()}
                  text={translang.t('PERMANENT_ADDRESS')}
                  textColor={Color.n_default_orange}
                  itemTextStyle={styles.checkboxlabel}
                />
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.contactHomeNo = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('LEAVE_houseno')}
                  label={translang.t('LEAVE_houseno')}
                  value_txt={dataStudent.contactHomeNo ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.contactLane = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('SOI')}
                  label={translang.t('SOI')}
                  value_txt={dataStudent.contactLane ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.contactVillageNo = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('MOO')}
                  label={translang.t('MOO')}
                  value_txt={dataStudent.contactVillageNo ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.contactRoad = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('ADDR_ROAD')}
                  label={translang.t('ADDR_ROAD')}
                  value_txt={dataStudent.contactRoad ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditContactcontactProvince",
                      selItemSelectedIndex: 0,
                      selItemShowList: provinceList
                    })
                  }}
                  placeHolder={translang.t('ADDR_PROVINCE')}
                  label={translang.t('ADDR_PROVINCE')}
                  value_txt={dataStudent.contactProvince ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditContactcontactDistrict",
                      selItemSelectedIndex: 0,
                      selItemShowList: contact_districtList
                    })
                  }}
                  placeHolder={translang.t('ADDR_DISTRICT')}
                  label={translang.t('ADDR_DISTRICT')}
                  value_txt={dataStudent.contactDistrict ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditContactcontactSubDistrict",
                      selItemSelectedIndex: 0,
                      selItemShowList: contact_subdistrictList
                    })
                  }}
                  placeHolder={translang.t('SUB_DISTRICT')}
                  label={translang.t('SUB_DISTRICT')}
                  value_txt={dataStudent.contactSubDistrict ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.contactPostalCode = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('POSTAL_CODE')}
                  label={translang.t('POSTAL_CODE')}
                  value_txt={dataStudent.contactPostalCode ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditContactstayWithTitle",
                      selItemSelectedIndex: 0,
                      selItemShowList: nameTitleList
                    })
                  }}
                  placeHolder={translang.t('WHO_LIVE_WITH_NAME_TITLE')}
                  label={translang.t('WHO_LIVE_WITH_NAME_TITLE')}
                  value_txt={dataStudent.stayWithTitle ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.contactPhone = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('HOME_PHONE_NUMBER')}
                  label={translang.t('HOME_PHONE_NUMBER')}
                  value_txt={dataStudent.contactPhone ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.stayWithName = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('WHO_LIVE_WITH_NAME')}
                  label={translang.t('WHO_LIVE_WITH_NAME')}
                  value_txt={dataStudent.stayWithName ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.stayWithLastname = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('WHO_LIVE_WITH_SURNAME')}
                  label={translang.t('WHO_LIVE_WITH_SURNAME')}
                  value_txt={dataStudent.stayWithLastname ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.stayWithEmergencyCall = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('EMERGENCY_PHONE')}
                  label={translang.t('EMERGENCY_PHONE')}
                  value_txt={dataStudent.stayWithEmergencyCall ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.stayWithEmail = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('WHO_LIVE_WITH_EMAIL')}
                  label={translang.t('WHO_LIVE_WITH_EMAIL')}
                  value_txt={dataStudent.stayWithEmail ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.friendName = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('NEIGHBOUR_NAME')}
                  label={translang.t('NEIGHBOUR_NAME')}
                  value_txt={dataStudent.friendName ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.friendLastname = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('NEIGHBOUR_SURNAME')}
                  label={translang.t('NEIGHBOUR_SURNAME')}
                  value_txt={dataStudent.friendLastname ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.friendPhone = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('NEIGHBOUR_TELEPHONE')}
                  label={translang.t('NEIGHBOUR_TELEPHONE')}
                  value_txt={dataStudent.friendPhone ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditContacthomeType",
                      selItemSelectedIndex: 0,
                      selItemShowList: houseTypeList
                    })
                  }}
                  placeHolder={translang.t('HOUSE_STYLE')}
                  label={translang.t('HOUSE_STYLE')}
                  value_txt={dataStudent.homeType ?? ''}/>

                <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                  <GradientButton
                    label={translang.t('COMMON_cancel')}
                    containerStyle={{
                      width: 116,
                      marginTop: 30,
                      paddingHorizontal: 0,
                      shadowColor: 'transparent',
                      shadowOpacity: 0
                    }}
                    buttonStyle={{borderRadius: 22, height: 44}}
                    colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
                    isVerticalGradient={false}
                    _onPress={() => {
                      this.setState({isEditContactAddress: false}, () => {
                        this.loadData();
                      })
                    }}
                  />
                  <GradientButton
                    label={translang.t('SAVE')}
                    containerStyle={{
                      width: 116,
                      marginTop: 30,
                      paddingHorizontal: 0,
                      shadowColor: 'transparent',
                      shadowOpacity: 0,
                      marginLeft: 30
                    }}
                    buttonStyle={{borderRadius: 22, height: 44}}
                    colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                    isVerticalGradient={false}
                    _onPress={() => {
                      this.updateContactAddress();
                    }}
                  />
                </View>

              </View>}
            </>}

            {this.state.profileType == 1 && <>
              <View style={styles.partTitleContainer}>
                <Text style={styles.partTitleText}>{translang.t('PROFILE_FATHER_INFO')}</Text>
                {!this.state.isEditFatherInfo && this.state.editEnable &&
                <GradientButtonWithImg
                  label={translang.t('PROFILE_edit')}
                  iconImage={Images.n_ic_pencil_white}
                  containerStyle={{width: 70, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0}}
                  buttonStyle={{borderRadius: 5, height: 25}}
                  textStyle={{fontSize: 20, fontWeight: 'bold'}}
                  iconStyle={{width: 10, height: 10}}
                  colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                  isVerticalGradient={false}
                  _onPress={() => {
                    if (canUpdateStatus.canUpdateFatherInfo) {
                      this.setState({isEditFatherInfo: true});
                    } else {
                      this.setState({showPendingAlert: true});
                    }
                  }}
                />}
              </View>
              {!this.state.isEditFatherInfo &&
              <View style={styles.partContainer}>
                <InfoTextItem
                  label={translang.t('NAME_TITLES')}
                  value_txt={dataStudent.fatherTitle ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_firstname')}
                  value_txt={dataStudent.fatherNameTh ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_lastname')}
                  value_txt={dataStudent.fatherLastnameTh ?? ''}/>
                <InfoTextItem
                  label={translang.t('USERINFO_name_en')}
                  value_txt={dataStudent.fatherNameEn ?? ''}/>
                <InfoTextItem
                  label={translang.t('USERINFO_surname_en')}
                  value_txt={dataStudent.fatherLastnameEn ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_birthday')}
                  value_txt={dataStudent.fatherBirthday ? moment(dataStudent.fatherBirthday).format('DD/MM/YYYY') : ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_ID_CARD_CODE')}
                  value_txt={dataStudent.fatherIDCardNumber ?? ''}/>
                <View style={{flexDirection: 'row'}}>
                  <View style={{flex: 1}}>
                    <InfoTextItem
                      label={translang.t('RACE')}
                      value_txt={dataStudent.fatherRace ?? ''}/>
                  </View>
                  <View style={{flex: 1, paddingLeft: 10}}>
                    <InfoTextItem
                      label={translang.t('PROFILE_Nationality')}
                      value_txt={dataStudent.fatherNation ?? ""}/>
                  </View>
                </View>
                <InfoTextItem
                  label={translang.t('PROFILE_Religion')}
                  value_txt={dataStudent.fatherReligion ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_EDUCATION')}
                  value_txt={dataStudent.fatherGraduatedLevel ?? ''}/>
                <InfoTextItem
                  label={translang.t('LEAVE_houseno')}
                  value_txt={dataStudent.fatherHomeNo ?? ''}/>
                <InfoTextItem
                  label={translang.t('SOI')}
                  value_txt={dataStudent.fatherLane ?? ''}/>
                <InfoTextItem
                  label={translang.t('MOO')}
                  value_txt={dataStudent.fatherVillageNo ?? ''}/>
                <InfoTextItem
                  label={translang.t('ADDR_ROAD')}
                  value_txt={dataStudent.fatherRoad ?? ''}/>
                <InfoTextItem
                  label={translang.t('ADDR_PROVINCE')}
                  value_txt={dataStudent.fatherProvince ?? ''}/>
                <InfoTextItem
                  label={translang.t('ADDR_DISTRICT')}
                  value_txt={dataStudent.fatherDistrict ?? ''}/>
                <InfoTextItem
                  label={translang.t('SUB_DISTRICT')}
                  value_txt={dataStudent.fatherSubDistrict ?? ''}/>
                <InfoTextItem
                  label={translang.t('POSTAL_CODE')}
                  value_txt={dataStudent.fatherPostalCode ?? ''}/>
                <InfoTextItem
                  label={translang.t('CAREER')}
                  value_txt={dataStudent.fatherCareer ?? ''}/>
                <InfoTextItem
                  label={translang.t('MONTHLY_INCOME')}
                  value_txt={dataStudent.fatherIncome ?? ''}/>
                <InfoTextItem
                  label={translang.t('WORK_PLACE')}
                  value_txt={dataStudent.fatherWorkPlace ?? ''}/>
                <InfoTextItem
                  label={translang.t('PHONE_NUMBER_HOUSE')}
                  value_txt={dataStudent.fatherHomePhone ?? ''}/>
                <InfoTextItem
                  label={translang.t('PHONE_NUMBER_PHONE')}
                  value_txt={dataStudent.fatherMobilePhone ?? ''}/>
                <InfoTextItem
                  label={translang.t('PHONE_NUMBER_WORKPLACE')}
                  value_txt={dataStudent.fatherWorkPlacePhone ?? ''}/>
              </View>}
              {this.state.isEditFatherInfo &&
              <View style={styles.partEditContainer}>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditfatherTitle",
                      selItemSelectedIndex: 0,
                      selItemShowList: nameTitleList
                    })
                  }}
                  placeHolder={translang.t('NAME_TITLES')}
                  label={translang.t('NAME_TITLES')}
                  value_txt={dataStudent.fatherTitle ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.fatherNameTh = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('PROFILE_firstname')}
                  label={translang.t('PROFILE_firstname')}
                  value_txt={dataStudent.fatherNameTh ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.fatherLastnameTh = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('PROFILE_lastname')}
                  label={translang.t('PROFILE_lastname')}
                  value_txt={dataStudent.fatherLastnameTh ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.fatherNameEn = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('USERINFO_name_en')}
                  label={translang.t('USERINFO_name_en')}
                  value_txt={dataStudent.fatherNameEn ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.fatherLastnameEn = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('USERINFO_surname_en')}
                  label={translang.t('USERINFO_surname_en')}
                  value_txt={dataStudent.fatherLastnameEn ?? ''}/>
                <TouchableOpacity onPress={() => {
                  this.setState({showDatePicker: true, selCalendarType: "FatherBirthday"});
                }}>
                  <InfoTextInputItem
                    disable={false}
                    canSelect={false}
                    onChangeText={(key) => {
                      dataStudent.fatherBirthday = key;
                      this.setState({dataStudent: dataStudent});
                    }}
                    notouch={true}
                    placeHolder={translang.t('DDMMYYYY')}
                    label={translang.t('PROFILE_birthday')}
                    value_txt={dataStudent.fatherBirthday ? moment(dataStudent.fatherBirthday).format('DD/MM/YYYY') : ''}/>
                </TouchableOpacity>

                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.fatherIDCardNumber = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('PROFILE_ID_CARD_CODE')}
                  label={translang.t('PROFILE_ID_CARD_CODE')}
                  value_txt={dataStudent.fatherIDCardNumber ?? ''}/>
                <View style={{flexDirection: 'row'}}>
                  <View style={{flex: 1}}>
                    <InfoTextInputItem
                      disable={false}
                      canSelect={true}
                      onClickInput={() => {
                        this.setState({
                          selItemShowable: true,
                          selItemSelTypeStr: "EditfatherRace",
                          selItemSelectedIndex: 0,
                          selItemShowList: raceList
                        })
                      }}
                      placeHolder={translang.t('RACE')}
                      label={translang.t('RACE')}
                      value_txt={dataStudent.fatherRace ?? ''}/>
                  </View>
                  <View style={{flex: 1, paddingLeft: 10}}>
                    <InfoTextInputItem
                      disable={false}
                      canSelect={true}
                      onClickInput={() => {
                        this.setState({
                          selItemShowable: true,
                          selItemSelTypeStr: "EditfatherNation",
                          selItemSelectedIndex: 0,
                          selItemShowList: nationalList
                        })
                      }}
                      placeHolder={translang.t('PROFILE_Nationality')}
                      label={translang.t('PROFILE_Nationality')}
                      value_txt={dataStudent.fatherNation ?? ""}/>
                  </View>
                </View>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditfatherReligion",
                      selItemSelectedIndex: 0,
                      selItemShowList: religionList
                    })
                  }}
                  placeHolder={translang.t('PROFILE_Religion')}
                  label={translang.t('PROFILE_Religion')}
                  value_txt={dataStudent.fatherReligion ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditfatherGraduatedLevel",
                      selItemSelectedIndex: 0,
                      selItemShowList: educationList
                    })
                  }}
                  placeHolder={translang.t('PROFILE_EDUCATION')}
                  label={translang.t('PROFILE_EDUCATION')}
                  value_txt={dataStudent.fatherGraduatedLevel ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.fatherHomeNo = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('LEAVE_houseno')}
                  label={translang.t('LEAVE_houseno')}
                  value_txt={dataStudent.fatherHomeNo ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.fatherLane = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('SOI')}
                  label={translang.t('SOI')}
                  value_txt={dataStudent.fatherLane ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.fatherVillageNo = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('MOO')}
                  label={translang.t('MOO')}
                  value_txt={dataStudent.fatherVillageNo ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.fatherRoad = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('ADDR_ROAD')}
                  label={translang.t('ADDR_ROAD')}
                  value_txt={dataStudent.fatherRoad ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditfatherProvince",
                      selItemSelectedIndex: 0,
                      selItemShowList: provinceList
                    })
                  }}
                  placeHolder={translang.t('ADDR_PROVINCE')}
                  label={translang.t('ADDR_PROVINCE')}
                  value_txt={dataStudent.fatherProvince ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditfatherDistrict",
                      selItemSelectedIndex: 0,
                      selItemShowList: father_districtList
                    })
                  }}
                  placeHolder={translang.t('ADDR_DISTRICT')}
                  label={translang.t('ADDR_DISTRICT')}
                  value_txt={dataStudent.fatherDistrict ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditfatherSubDistrict",
                      selItemSelectedIndex: 0,
                      selItemShowList: father_subdistrictList
                    })
                  }}
                  placeHolder={translang.t('SUB_DISTRICT')}
                  label={translang.t('SUB_DISTRICT')}
                  value_txt={dataStudent.fatherSubDistrict ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.fatherPostalCode = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('POSTAL_CODE')}
                  label={translang.t('POSTAL_CODE')}
                  value_txt={dataStudent.fatherPostalCode ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.fatherCareer = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('CAREER')}
                  label={translang.t('CAREER')}
                  value_txt={dataStudent.fatherCareer ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.fatherIncome = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('MONTHLY_INCOME')}
                  label={translang.t('MONTHLY_INCOME')}
                  value_txt={dataStudent.fatherIncome ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.fatherWorkPlace = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('WORK_PLACE')}
                  label={translang.t('WORK_PLACE')}
                  value_txt={dataStudent.fatherWorkPlace ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.fatherHomePhone = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('PHONE_NUMBER_HOUSE')}
                  label={translang.t('PHONE_NUMBER_HOUSE')}
                  value_txt={dataStudent.fatherHomePhone ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.fatherMobilePhone = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('PHONE_NUMBER_PHONE')}
                  label={translang.t('PHONE_NUMBER_PHONE')}
                  value_txt={dataStudent.fatherMobilePhone ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.fatherWorkPlacePhone = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('PHONE_NUMBER_WORKPLACE')}
                  label={translang.t('PHONE_NUMBER_WORKPLACE')}
                  value_txt={dataStudent.fatherWorkPlacePhone ?? ''}/>

                <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                  <GradientButton
                    label={translang.t('COMMON_cancel')}
                    containerStyle={{
                      width: 116,
                      marginTop: 30,
                      paddingHorizontal: 0,
                      shadowColor: 'transparent',
                      shadowOpacity: 0
                    }}
                    buttonStyle={{borderRadius: 22, height: 44}}
                    colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
                    isVerticalGradient={false}
                    _onPress={() => {
                      this.setState({isEditFatherInfo: false}, () => {
                        this.loadData();
                      })
                    }}
                  />
                  <GradientButton
                    label={translang.t('SAVE')}
                    containerStyle={{
                      width: 116,
                      marginTop: 30,
                      paddingHorizontal: 0,
                      shadowColor: 'transparent',
                      shadowOpacity: 0,
                      marginLeft: 30
                    }}
                    buttonStyle={{borderRadius: 22, height: 44}}
                    colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                    isVerticalGradient={false}
                    _onPress={() => {
                      this.updateFatherInfo()
                    }}
                  />
                </View>

              </View>}

              <View style={styles.partTitleContainer}>
                <Text style={styles.partTitleText}>{translang.t('PROFILE_MOTHER_INFO')}</Text>
                {!this.state.isEditMotherInfo && this.state.editEnable &&
                <GradientButtonWithImg
                  label={translang.t('PROFILE_edit')}
                  iconImage={Images.n_ic_pencil_white}
                  containerStyle={{width: 70, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0}}
                  buttonStyle={{borderRadius: 5, height: 25}}
                  textStyle={{fontSize: 20, fontWeight: 'bold'}}
                  iconStyle={{width: 10, height: 10}}
                  colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                  isVerticalGradient={false}
                  _onPress={() => {
                    if (canUpdateStatus.canUpdateMotherInfo) {
                      this.setState({isEditMotherInfo: true});
                    } else {
                      this.setState({showPendingAlert: true});
                    }
                  }}
                />}
              </View>
              {!this.state.isEditMotherInfo &&
              <View style={styles.partContainer}>
                <InfoTextItem
                  label={translang.t('NAME_TITLES')}
                  value_txt={dataStudent.motherTitle ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_firstname')}
                  value_txt={dataStudent.motherNameTh ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_lastname')}
                  value_txt={dataStudent.motherLastnameTh ?? ''}/>
                <InfoTextItem
                  label={translang.t('USERINFO_name_en')}
                  value_txt={dataStudent.motherNameEn ?? ''}/>
                <InfoTextItem
                  label={translang.t('USERINFO_surname_en')}
                  value_txt={dataStudent.motherLastnameEn ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_birthday')}
                  value_txt={dataStudent.motherBirthday ? moment(dataStudent.motherBirthday).format('DD/MM/YYYY') : ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_ID_CARD_CODE')}
                  value_txt={dataStudent.motherIDCardNumber ?? ''}/>
                <View style={{flexDirection: 'row'}}>
                  <View style={{flex: 1}}>
                    <InfoTextItem
                      label={translang.t('RACE')}
                      value_txt={dataStudent.motherRace ?? ''}/>
                  </View>
                  <View style={{flex: 1, paddingLeft: 10}}>
                    <InfoTextItem
                      label={translang.t('PROFILE_Nationality')}
                      value_txt={dataStudent.motherNation ?? ""}/>
                  </View>
                </View>
                <InfoTextItem
                  label={translang.t('PROFILE_Religion')}
                  value_txt={dataStudent.motherReligion ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_EDUCATION')}
                  value_txt={dataStudent.motherGraduatedLevel ?? ''}/>
                <CustomCheckButton
                  isSelected={this.state.isSelectFatherAddr}
                  checkboxSize={20}
                  disabled={true}
                  text={translang.t('COPY_OF_FATHER_ADDRESS')}
                  textColor={Color.n_default_orange}
                  itemTextStyle={styles.checkboxlabel}
                />
                <InfoTextItem
                  label={translang.t('LEAVE_houseno')}
                  value_txt={dataStudent.motherHomeNo ?? ''}/>
                <InfoTextItem
                  label={translang.t('SOI')}
                  value_txt={dataStudent.motherLane ?? ''}/>
                <InfoTextItem
                  label={translang.t('MOO')}
                  value_txt={dataStudent.motherVillageNo ?? ''}/>
                <InfoTextItem
                  label={translang.t('ADDR_ROAD')}
                  value_txt={dataStudent.motherRoad ?? ''}/>
                <InfoTextItem
                  label={translang.t('ADDR_PROVINCE')}
                  value_txt={dataStudent.motherProvince ?? ''}/>
                <InfoTextItem
                  label={translang.t('ADDR_DISTRICT')}
                  value_txt={dataStudent.motherDistrict ?? ''}/>
                <InfoTextItem
                  label={translang.t('SUB_DISTRICT')}
                  value_txt={dataStudent.motherSubDistrict ?? ''}/>
                <InfoTextItem
                  label={translang.t('POSTAL_CODE')}
                  value_txt={dataStudent.motherPostalCode ?? ''}/>
                <InfoTextItem
                  label={translang.t('CAREER')}
                  value_txt={dataStudent.motherCareer ?? ''}/>
                <InfoTextItem
                  label={translang.t('MONTHLY_INCOME')}
                  value_txt={dataStudent.motherIncome ?? ''}/>
                <InfoTextItem
                  label={translang.t('WORK_PLACE')}
                  value_txt={dataStudent.motherWorkPlace ?? ''}/>
                <InfoTextItem
                  label={translang.t('PHONE_NUMBER_HOUSE')}
                  value_txt={dataStudent.motherHomePhone ?? ''}/>
                <InfoTextItem
                  label={translang.t('PHONE_NUMBER_PHONE')}
                  value_txt={dataStudent.motherMobilePhone ?? ''}/>
                <InfoTextItem
                  label={translang.t('PHONE_NUMBER_WORKPLACE')}
                  value_txt={dataStudent.motherWorkPlacePhone ?? ''}/>
              </View>}
              {this.state.isEditMotherInfo &&
              <View style={styles.partEditContainer}>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditmotherTitle",
                      selItemSelectedIndex: 0,
                      selItemShowList: nameTitleList
                    })
                  }}
                  placeHolder={translang.t('NAME_TITLES')}
                  label={translang.t('NAME_TITLES')}
                  value_txt={dataStudent.motherTitle ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.motherNameTh = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('PROFILE_firstname')}
                  label={translang.t('PROFILE_firstname')}
                  value_txt={dataStudent.motherNameTh ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.motherLastnameTh = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('PROFILE_lastname')}
                  label={translang.t('PROFILE_lastname')}
                  value_txt={dataStudent.motherLastnameTh ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.motherNameEn = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('USERINFO_name_en')}
                  label={translang.t('USERINFO_name_en')}
                  value_txt={dataStudent.motherNameEn ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.motherLastnameEn = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('USERINFO_surname_en')}
                  label={translang.t('USERINFO_surname_en')}
                  value_txt={dataStudent.motherLastnameEn ?? ''}/>
                <TouchableOpacity onPress={() => {
                  this.setState({showDatePicker: true, selCalendarType: "MotherBirthday"});
                }}>
                  <InfoTextInputItem
                    disable={false}
                    canSelect={false}
                    notouch={true}
                    placeHolder={translang.t('DDMMYYYY')}
                    label={translang.t('PROFILE_birthday')}
                    value_txt={dataStudent.motherBirthday ? moment(dataStudent.motherBirthday).format('DD/MM/YYYY') : ''}/>
                </TouchableOpacity>

                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.motherIDCardNumber = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('PROFILE_ID_CARD_CODE')}
                  label={translang.t('PROFILE_ID_CARD_CODE')}
                  value_txt={dataStudent.motherIDCardNumber ?? ''}/>
                <View style={{flexDirection: 'row'}}>
                  <View style={{flex: 1}}>
                    <InfoTextInputItem
                      disable={false}
                      canSelect={true}
                      onClickInput={() => {
                        this.setState({
                          selItemShowable: true,
                          selItemSelTypeStr: "EditmotherRace",
                          selItemSelectedIndex: 0,
                          selItemShowList: raceList
                        })
                      }}
                      placeHolder={translang.t('RACE')}
                      label={translang.t('RACE')}
                      value_txt={dataStudent.motherRace ?? ''}/>
                  </View>
                  <View style={{flex: 1, paddingLeft: 10}}>
                    <InfoTextInputItem
                      disable={false}
                      canSelect={true}
                      onClickInput={() => {
                        this.setState({
                          selItemShowable: true,
                          selItemSelTypeStr: "EditmotherNation",
                          selItemSelectedIndex: 0,
                          selItemShowList: nationalList
                        })
                      }}
                      placeHolder={translang.t('PROFILE_Nationality')}
                      label={translang.t('PROFILE_Nationality')}
                      value_txt={dataStudent.motherNation ?? ""}/>
                  </View>
                </View>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditmotherReligion",
                      selItemSelectedIndex: 0,
                      selItemShowList: religionList
                    })
                  }}
                  placeHolder={translang.t('PROFILE_Religion')}
                  label={translang.t('PROFILE_Religion')}
                  value_txt={dataStudent.motherReligion ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditmotherGraduatedLevel",
                      selItemSelectedIndex: 0,
                      selItemShowList: educationList
                    })
                  }}
                  placeHolder={translang.t('PROFILE_EDUCATION')}
                  label={translang.t('PROFILE_EDUCATION')}
                  value_txt={dataStudent.motherGraduatedLevel ?? ''}/>

                <CustomCheckButton
                  isSelected={this.state.isSelectFatherAddr}
                  checkboxSize={20}
                  onPress={() => this.setLikeFatherAddress()}
                  text={translang.t('COPY_OF_FATHER_ADDRESS')}
                  textColor={Color.n_default_orange}
                  itemTextStyle={styles.checkboxlabel}
                />

                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.motherHomeNo = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('LEAVE_houseno')}
                  label={translang.t('LEAVE_houseno')}
                  value_txt={dataStudent.motherHomeNo ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.motherLane = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('SOI')}
                  label={translang.t('SOI')}
                  value_txt={dataStudent.motherLane ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.motherVillageNo = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('MOO')}
                  label={translang.t('MOO')}
                  value_txt={dataStudent.motherVillageNo ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.motherRoad = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('ADDR_ROAD')}
                  label={translang.t('ADDR_ROAD')}
                  value_txt={dataStudent.motherRoad ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditmotherProvince",
                      selItemSelectedIndex: 0,
                      selItemShowList: provinceList
                    })
                  }}
                  placeHolder={translang.t('ADDR_PROVINCE')}
                  label={translang.t('ADDR_PROVINCE')}
                  value_txt={dataStudent.motherProvince ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditmotherDistrict",
                      selItemSelectedIndex: 0,
                      selItemShowList: mother_districtList
                    })
                  }}
                  placeHolder={translang.t('ADDR_DISTRICT')}
                  label={translang.t('ADDR_DISTRICT')}
                  value_txt={dataStudent.motherDistrict ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditmotherSubDistrict",
                      selItemSelectedIndex: 0,
                      selItemShowList: mother_subdistrictList
                    })
                  }}
                  placeHolder={translang.t('SUB_DISTRICT')}
                  label={translang.t('SUB_DISTRICT')}
                  value_txt={dataStudent.motherSubDistrict ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.motherPostalCode = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('POSTAL_CODE')}
                  label={translang.t('POSTAL_CODE')}
                  value_txt={dataStudent.motherPostalCode ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.motherCareer = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('CAREER')}
                  label={translang.t('CAREER')}
                  value_txt={dataStudent.motherCareer ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.motherIncome = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('MONTHLY_INCOME')}
                  label={translang.t('MONTHLY_INCOME')}
                  value_txt={dataStudent.motherIncome ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.motherWorkPlace = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('WORK_PLACE')}
                  label={translang.t('WORK_PLACE')}
                  value_txt={dataStudent.motherWorkPlace ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.motherHomePhone = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('PHONE_NUMBER_HOUSE')}
                  label={translang.t('PHONE_NUMBER_HOUSE')}
                  value_txt={dataStudent.motherHomePhone ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.motherMobilePhone = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('PHONE_NUMBER_PHONE')}
                  label={translang.t('PHONE_NUMBER_PHONE')}
                  value_txt={dataStudent.motherMobilePhone ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.motherWorkPlacePhone = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('PHONE_NUMBER_WORKPLACE')}
                  label={translang.t('PHONE_NUMBER_WORKPLACE')}
                  value_txt={dataStudent.motherWorkPlacePhone ?? ''}/>

                <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                  <GradientButton
                    label={translang.t('COMMON_cancel')}
                    containerStyle={{
                      width: 116,
                      marginTop: 30,
                      paddingHorizontal: 0,
                      shadowColor: 'transparent',
                      shadowOpacity: 0
                    }}
                    buttonStyle={{borderRadius: 22, height: 44}}
                    colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
                    isVerticalGradient={false}
                    _onPress={() => {
                      this.setState({isEditMotherInfo: false}, () => {
                        this.loadData();
                      })
                    }}
                  />
                  <GradientButton
                    label={translang.t('SAVE')}
                    containerStyle={{
                      width: 116,
                      marginTop: 30,
                      paddingHorizontal: 0,
                      shadowColor: 'transparent',
                      shadowOpacity: 0,
                      marginLeft: 30
                    }}
                    buttonStyle={{borderRadius: 22, height: 44}}
                    colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                    isVerticalGradient={false}
                    _onPress={() => {
                      this.updateMotherInfo();
                    }}
                  />
                </View>

              </View>}

              <View style={styles.partTitleContainer}>
                <Text style={styles.partTitleText}>{translang.t('PROFILE_parentinfo')}</Text>
                {!this.state.isEditParentInfo && this.state.editEnable &&
                <GradientButtonWithImg
                  label={translang.t('PROFILE_edit')}
                  iconImage={Images.n_ic_pencil_white}
                  containerStyle={{width: 70, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0}}
                  buttonStyle={{borderRadius: 5, height: 25}}
                  textStyle={{fontSize: 20, fontWeight: 'bold'}}
                  iconStyle={{width: 10, height: 10}}
                  colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                  isVerticalGradient={false}
                  _onPress={() => {
                    if (canUpdateStatus.canUpdateParentInfo) {
                      this.setState({isEditParentInfo: true});
                    } else {
                      this.setState({showPendingAlert: true});
                    }
                  }}
                />}
              </View>
              {!this.state.isEditParentInfo &&
              <View style={styles.partContainer}>
                <InfoTextItem
                  label={translang.t('COPY_FORM')}
                  value_txt={dataStudent.parentFrom ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_RELATIONSHIP')}
                  value_txt={dataStudent.parentRelation ?? ''}/>
                <InfoTextItem
                  label={translang.t('NAME_TITLES')}
                  value_txt={dataStudent.parentTitle ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_firstname')}
                  value_txt={dataStudent.parentNameTh ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_lastname')}
                  value_txt={dataStudent.parentLastnameTh ?? ''}/>
                <InfoTextItem
                  label={translang.t('USERINFO_name_en')}
                  value_txt={dataStudent.parentNameEn ?? ''}/>
                <InfoTextItem
                  label={translang.t('USERINFO_surname_en')}
                  value_txt={dataStudent.parentLastnameEn ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_birthday')}
                  value_txt={dataStudent.parentBirthday ? moment(dataStudent.parentBirthday).format('DD/MM/YYYY') : ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_ID_CARD_CODE')}
                  value_txt={dataStudent.parentIDCardNumber ?? ''}/>
                <View style={{flexDirection: 'row'}}>
                  <View style={{flex: 1}}>
                    <InfoTextItem
                      label={translang.t('RACE')}
                      value_txt={dataStudent.parentRace ?? ''}/>
                  </View>
                  <View style={{flex: 1, paddingLeft: 10}}>
                    <InfoTextItem
                      label={translang.t('PROFILE_Nationality')}
                      value_txt={dataStudent.parentNation ?? ""}/>
                  </View>
                </View>
                <InfoTextItem
                  label={translang.t('PROFILE_Religion')}
                  value_txt={dataStudent.parentReligion ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_EDUCATION')}
                  value_txt={dataStudent.parentGraduatedLevel ?? ''}/>
                <InfoTextItem
                  label={translang.t('LEAVE_houseno')}
                  value_txt={dataStudent.parentHomeNo ?? ''}/>
                <InfoTextItem
                  label={translang.t('SOI')}
                  value_txt={dataStudent.parentLane ?? ''}/>
                <InfoTextItem
                  label={translang.t('MOO')}
                  value_txt={dataStudent.parentVillageNo ?? ''}/>
                <InfoTextItem
                  label={translang.t('ADDR_ROAD')}
                  value_txt={dataStudent.parentRoad ?? ''}/>
                <InfoTextItem
                  label={translang.t('ADDR_PROVINCE')}
                  value_txt={dataStudent.parentProvince ?? ''}/>
                <InfoTextItem
                  label={translang.t('ADDR_DISTRICT')}
                  value_txt={dataStudent.parentDistrict ?? ''}/>
                <InfoTextItem
                  label={translang.t('SUB_DISTRICT')}
                  value_txt={dataStudent.parentSubDistrict ?? ''}/>
                <InfoTextItem
                  label={translang.t('POSTAL_CODE')}
                  value_txt={dataStudent.parentPostalCode ?? ''}/>
                <InfoTextItem
                  label={translang.t('TUITION_FEE')}
                  value_txt={dataStudent.reimbursementTuitionFee ?? ''}/>
                <InfoTextItem
                  label={translang.t('FAMILY_STATUS')}
                  value_txt={dataStudent.familyStatus ?? ''}/>
                <InfoTextItem
                  label={translang.t('CAREER')}
                  value_txt={dataStudent.parentCareer ?? ''}/>
                <InfoTextItem
                  label={translang.t('MONTHLY_INCOME')}
                  value_txt={dataStudent.parentIncome ?? ''}/>
                <InfoTextItem
                  label={translang.t('WORK_PLACE')}
                  value_txt={dataStudent.parentWorkPlace ?? ''}/>
                <InfoTextItem
                  label={translang.t('PHONE_NUMBER_HOUSE')}
                  value_txt={dataStudent.parentHomePhone ?? ''}/>
                <InfoTextItem
                  label={translang.t('PHONE_NUMBER_PHONE')}
                  value_txt={dataStudent.parentMobilePhone ?? ''}/>
                <InfoTextItem
                  label={translang.t('PHONE_NUMBER_WORKPLACE')}
                  value_txt={dataStudent.parentWorkPlacePhone ?? ''}/>
              </View>}
              {this.state.isEditParentInfo &&
              <View style={styles.partEditContainer}>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditparentFrom",
                      selItemSelectedIndex: 0,
                      selItemShowList: copyDataFromList
                    })
                  }}
                  placeHolder={translang.t('COPY_FORM')}
                  label={translang.t('COPY_FORM')}
                  value_txt={dataStudent.parentFrom ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditparentRelation",
                      selItemSelectedIndex: 0,
                      selItemShowList: parentRelateList
                    })
                  }}
                  placeHolder={translang.t('PROFILE_RELATIONSHIP')}
                  label={translang.t('PROFILE_RELATIONSHIP')}
                  value_txt={dataStudent.parentRelation ?? ''}/>

                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditparentTitle",
                      selItemSelectedIndex: 0,
                      selItemShowList: nameTitleList
                    })
                  }}
                  placeHolder={translang.t('NAME_TITLES')}
                  label={translang.t('NAME_TITLES')}
                  value_txt={dataStudent.parentTitle ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.parentNameTh = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('PROFILE_firstname')}
                  label={translang.t('PROFILE_firstname')}
                  value_txt={dataStudent.parentNameTh ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.parentLastnameTh = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('PROFILE_lastname')}
                  label={translang.t('PROFILE_lastname')}
                  value_txt={dataStudent.parentLastnameTh ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.parentNameEn = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('USERINFO_name_en')}
                  label={translang.t('USERINFO_name_en')}
                  value_txt={dataStudent.parentNameEn ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.parentLastnameEn = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('USERINFO_surname_en')}
                  label={translang.t('USERINFO_surname_en')}
                  value_txt={dataStudent.parentLastnameEn ?? ''}/>
                <TouchableOpacity onPress={() => {
                  this.setState({showDatePicker: true, selCalendarType: "ParentBirthday"});
                }}>
                  <InfoTextInputItem
                    disable={false}
                    canSelect={false}
                    notouch={true}
                    placeHolder={translang.t('DDMMYYYY')}
                    label={translang.t('PROFILE_birthday')}
                    value_txt={dataStudent.parentBirthday ? moment(dataStudent.parentBirthday).format('DD/MM/YYYY') : ''}/>
                </TouchableOpacity>

                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.parentIDCardNumber = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('PROFILE_ID_CARD_CODE')}
                  label={translang.t('PROFILE_ID_CARD_CODE')}
                  value_txt={dataStudent.parentIDCardNumber ?? ''}/>
                <View style={{flexDirection: 'row'}}>
                  <View style={{flex: 1}}>
                    <InfoTextInputItem
                      disable={false}
                      canSelect={true}
                      onClickInput={() => {
                        this.setState({
                          selItemShowable: true,
                          selItemSelTypeStr: "EditparentRace",
                          selItemSelectedIndex: 0,
                          selItemShowList: raceList
                        })
                      }}
                      placeHolder={translang.t('RACE')}
                      label={translang.t('RACE')}
                      value_txt={dataStudent.parentRace ?? ''}/>
                  </View>
                  <View style={{flex: 1, paddingLeft: 10}}>
                    <InfoTextInputItem
                      disable={false}
                      canSelect={true}
                      onClickInput={() => {
                        this.setState({
                          selItemShowable: true,
                          selItemSelTypeStr: "EditparentNation",
                          selItemSelectedIndex: 0,
                          selItemShowList: nationalList
                        })
                      }}
                      placeHolder={translang.t('PROFILE_Nationality')}
                      label={translang.t('PROFILE_Nationality')}
                      value_txt={dataStudent.parentNation ?? ""}/>
                  </View>
                </View>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditparentReligion",
                      selItemSelectedIndex: 0,
                      selItemShowList: religionList
                    })
                  }}
                  placeHolder={translang.t('PROFILE_Religion')}
                  label={translang.t('PROFILE_Religion')}
                  value_txt={dataStudent.parentReligion ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditparentGraduatedLevel",
                      selItemSelectedIndex: 0,
                      selItemShowList: educationList
                    })
                  }}
                  placeHolder={translang.t('PROFILE_EDUCATION')}
                  label={translang.t('PROFILE_EDUCATION')}
                  value_txt={dataStudent.parentGraduatedLevel ?? ''}/>

                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.parentHomeNo = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('LEAVE_houseno')}
                  label={translang.t('LEAVE_houseno')}
                  value_txt={dataStudent.parentHomeNo ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.parentLane = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('SOI')}
                  label={translang.t('SOI')}
                  value_txt={dataStudent.parentLane ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.parentVillageNo = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('MOO')}
                  label={translang.t('MOO')}
                  value_txt={dataStudent.parentVillageNo ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.parentRoad = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('ADDR_ROAD')}
                  label={translang.t('ADDR_ROAD')}
                  value_txt={dataStudent.parentRoad ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditparentProvince",
                      selItemSelectedIndex: 0,
                      selItemShowList: provinceList
                    })
                  }}
                  placeHolder={translang.t('ADDR_PROVINCE')}
                  label={translang.t('ADDR_PROVINCE')}
                  value_txt={dataStudent.parentProvince ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditparentDistrict",
                      selItemSelectedIndex: 0,
                      selItemShowList: parent_districtList
                    })
                  }}
                  placeHolder={translang.t('ADDR_DISTRICT')}
                  label={translang.t('ADDR_DISTRICT')}
                  value_txt={dataStudent.parentDistrict ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditparentSubDistrict",
                      selItemSelectedIndex: 0,
                      selItemShowList: parent_subdistrictList
                    })
                  }}
                  placeHolder={translang.t('SUB_DISTRICT')}
                  label={translang.t('SUB_DISTRICT')}
                  value_txt={dataStudent.parentSubDistrict ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.parentPostalCode = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('POSTAL_CODE')}
                  label={translang.t('POSTAL_CODE')}
                  value_txt={dataStudent.parentPostalCode ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditreimbursementTuitionFee",
                      selItemSelectedIndex: 0,
                      selItemShowList: tutionStatusList
                    })
                  }}
                  placeHolder={translang.t('TUITION_FEE')}
                  label={translang.t('TUITION_FEE')}
                  value_txt={dataStudent.reimbursementTuitionFee ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditfamilyStatus",
                      selItemSelectedIndex: 0,
                      selItemShowList: familyStatusList
                    })
                  }}
                  placeHolder={translang.t('FAMILY_STATUS')}
                  label={translang.t('FAMILY_STATUS')}
                  value_txt={dataStudent.familyStatus ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  placeHolder={translang.t('CAREER')}
                  label={translang.t('CAREER')}
                  onChangeText={(key) => {
                    dataStudent.parentCareer = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  value_txt={dataStudent.parentCareer ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.parentIncome = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('MONTHLY_INCOME')}
                  label={translang.t('MONTHLY_INCOME')}
                  value_txt={dataStudent.parentIncome ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.parentWorkPlace = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('WORK_PLACE')}
                  label={translang.t('WORK_PLACE')}
                  value_txt={dataStudent.parentWorkPlace ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.parentHomePhone = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('PHONE_NUMBER_HOUSE')}
                  label={translang.t('PHONE_NUMBER_HOUSE')}
                  value_txt={dataStudent.parentHomePhone ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.parentMobilePhone = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('PHONE_NUMBER_PHONE')}
                  label={translang.t('PHONE_NUMBER_PHONE')}
                  value_txt={dataStudent.parentMobilePhone ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataStudent.parentWorkPlacePhone = key;
                    this.setState({dataStudent: dataStudent});
                  }}
                  placeHolder={translang.t('PHONE_NUMBER_WORKPLACE')}
                  label={translang.t('PHONE_NUMBER_WORKPLACE')}
                  value_txt={dataStudent.parentWorkPlacePhone ?? ''}/>

                <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                  <GradientButton
                    label={translang.t('COMMON_cancel')}
                    containerStyle={{
                      width: 116,
                      marginTop: 30,
                      paddingHorizontal: 0,
                      shadowColor: 'transparent',
                      shadowOpacity: 0
                    }}
                    buttonStyle={{borderRadius: 22, height: 44}}
                    colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
                    isVerticalGradient={false}
                    _onPress={() => {
                      this.setState({isEditParentInfo: false}, () => {
                        this.loadData();
                      })
                    }}
                  />
                  <GradientButton
                    label={translang.t('SAVE')}
                    containerStyle={{
                      width: 116,
                      marginTop: 30,
                      paddingHorizontal: 0,
                      shadowColor: 'transparent',
                      shadowOpacity: 0,
                      marginLeft: 30
                    }}
                    buttonStyle={{borderRadius: 22, height: 44}}
                    colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                    isVerticalGradient={false}
                    _onPress={() => {
                      this.updateParentInfo();
                    }}
                  />
                </View>

              </View>}
            </>}

            {this.state.profileType == 2 && <>
              <View style={styles.partTitleContainer}>
                <Text style={styles.partTitleText}>{translang.t('PROFILE_educationinfo')}</Text>
              </View>
              <View style={styles.partContainer}>
                <InfoTextItem
                  label={translang.t('FORMER_SCHOOL')}
                  value_txt={dataStudent.oldSchoolName ?? ''}/>
                <InfoTextItem
                  label={translang.t('LEAVE_address')}
                  value_txt={studentAddress}/>
                <InfoTextItem
                  label={translang.t('PROFILE_GPA')}
                  value_txt={dataStudent.oldSchoolGPA2 ?? ''}/>
                <InfoTextItem
                  label={translang.t('CREDIT_STUDY_UNIT')}
                  value_txt={dataStudent.oldSchoolCredit ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_EDUCATION_QULITY')}
                  value_txt={dataStudent.oldSchoolGraduated ?? ''}/>
                <InfoTextItem
                  label={translang.t('LEAVE_reason')}
                  value_txt={dataStudent.moveOutReason ?? ''}/>
              </View>
            </>}

            {this.state.profileType == 3 &&
            <HealthTab navigation={this.props.navigation}/>
            }
          </View>


        </ScrollView>

        <ProfileModal
          isVisible={this.state.showModal}
          onPositivePress={() => this.setState({showModal: false})}
          user={user}
        />

        <AlertWithImageModal
          isVisible={this.state.showModalOffline}
          image={Images.n_ic_warning}
          message={this.state.modalBodyOffline}
          buttonColors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
          isVerticalGradient={false}
          onClose={() => {
            this.setState({showModalOffline: false})
          }}
        />

        <AlertWithImageModal
          isVisible={this.state.showPendingAlert}
          image={Images.ic_warning}
          messageStyle={{fontSize: 18}}
          message={translang.t('TOPIC_REVIEW_YET')}
          buttonColors={[Color.green_button_next_color1, Color.green_button_next_color2]}
          isVerticalGradient={false}
          onClose={() => {
            this.setState({showPendingAlert: false})
          }}
        />


        <CalendarModal
          isVisible={this.state.showDatePicker}
          type={'single'}
          onDateSelect={result => this.onDateSelect(result)}/>

        <ProfileSelectModal
          isVisible={this.state.selItemShowable}
          listData={this.state.selItemShowList}
          onListSelect={result => this.onChangeListItem(result)}/>

        <ProgressHud isVisible={this.state.isLoading}/>
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
    paddingBottom: 25,
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
    fontSize: 20,
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
    paddingVertical: 3,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    alignItems: 'center'
  },
  schoolName: {
    fontFamily: 'THSarabunNew',
    fontSize: 8,
    color: Color.white,
  },


  partContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
    marginVertical: 10,
    marginHorizontal: 15,
    padding: 10,
  },
  partEditContainer: {
    backgroundColor: '#fff',
    marginVertical: 10,
    marginHorizontal: 15,
    padding: 10,
  },
  partTitleContainer: {
    paddingVertical: 5,
    borderBottomColor: Color.n_default_brown,
    borderBottomWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 30,
  },
  partTitleText: {
    fontFamily: 'THSarabunNew',
    fontSize: 28,
    fontWeight: 'bold',
    color: Color.n_default_orange,
  },

  partSubTitleContainer: {
    paddingVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 30,
    marginVertical: 10,
  },
  partSubTitleText: {
    flex: 1,
    fontFamily: 'THSarabunNew',
    fontSize: 23,
    fontWeight: 'bold',
    color: Color.n_default_gray,
  },

  checkboxlabel: {
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});
