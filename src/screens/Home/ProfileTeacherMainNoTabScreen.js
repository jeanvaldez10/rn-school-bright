import React from 'react';
import {useState, useEffect} from "react";
import {Image, View, TouchableOpacity, ImageBackground, Modal, FlatList, BackHandler} from 'react-native';
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
import DropDownPicker from 'react-native-dropdown-picker';
import CalendarModal from '../../components/CalendarModal';
import ProfileSelectModal from '../../components/ProfileSelectModal'

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
  const {disable, canSelect, selectList, label, value_txt, onClickInput, onChangeText, onSelectItem, zIndex, placeHolder, containerStyle, notouch} = props;
  const [isOpen, setIsOpen] = useState(false)

  let titleCol = Color.n_default_orange;
  if (disable) {
    titleCol = Color.n_default_gray;
  }

  const selectItem = (item) => {
    setIsOpen(false);
    onSelectItem(item);
  }

  const renderSelectItem = () => {
    var res = []
    if (selectList.length > 0) {
      for (let i = 0; i < selectList.length; i++) {
        let item = selectList[i];
        res.push(
          <TouchableOpacity style={{marginRight: 30}} onPressOut={() => selectItem(item)} key={`value_text ${i}`}>
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
          // <DropDownPicker
          //   arrowColor={Color.n_default_orange}
          //   items={selectList}
          //   placeholder={value_txt?value_txt:placeHolder}
          //   globalTextStyle={{paddingHorizontal: 0}}
          //   style={styles.dropdownPicker}
          //   itemStyle={{ justifyContent: 'flex-start' }}
          //   containerStyle = {{height: 38}}
          //   labelStyle={styles.bottomText}
          //   dropDownStyle={styles.dropDown}
          //   dropDownMaxHeight={140}
          //   onChangeItem={ item => {
          //     selectItem(item);
          //   }}
          // />
          // <View style={{ position: 'relative', height: 38, borderBottomColor: Color.n_default_brown, borderBottomWidth: 1, width: '100%', paddingHorizontal: 5}}>
          //   <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPressOut={() => {setIsOpen(!isOpen)}}>
          //     <Text style={{...styles.bottomText, flex: 1,  color: value_txt?Color.n_default_gray:Color.n_text_placeholder_gray}}>{value_txt?value_txt:placeHolder}</Text>
          //     <Image source={Images.n_carrot_down} style={{width: 10, height: 10, resizeMode: 'contain', marginLeft: 5}}/>
          //   </TouchableOpacity>
          //   {isOpen &&
          //     <ScrollView
          //       style={{
          //           position: 'absolute',
          //           top: '100%',
          //           right: 0,
          //           left: 0,
          //           marginTop: 3,
          //           borderColor: Color.n_default_brown,
          //           borderWidth: 1,
          //           backgroundColor: Color.n_default_gray_light,
          //           borderRadius: 5,
          //           maxHeight: 100}}>
          //       {renderSelectItem()}
          //     </ScrollView>
          //   }
          // </View>
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
          />}
        </>}
      </View>
    </View>
  );
};

export default class ProfileTeacherMainNoTabScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      showModal: false,
      profileType: 0,
      isLoading: false,

      isEditProfile: false,
      showDatePicker: false,
      selCalendarType: "",
      selEditIndex: -1,

      isEditHouseInfo: false,

      isSelectPermanentAddr: false,
      tempContactAddr: {},

      showAddFamilyFormModal: false,
      tempAddFamilyInfo: {},
      indexFamilyInfoEditSelected: -1,

      showAddEducationInfoModal: false,
      tempAddEducationInfo: {},
      indexEducationInfoEditSelected: -1,

      showAddHonorInfoModal: false,
      tempAddHonorInfo: {},
      indexHonorInfoEditSelected: -1,

      showAddTrainingInfoModal: false,
      tempAddTrainingInfo: {},
      indexTrainingInfoEditSelected: -1,

      showAddLicenseInfoModal: false,
      tempAddLicenseInfo: {},
      indexLicenseInfoEditSelected: -1,

      showAddInsignInfoModal: false,
      tempAddInsignInfo: {},
      indexInsignInfoEditSelected: -1,

      dataEmployee: {},

      genderList: [{value: '0', label: translang.t('Male'), id: '0', title: translang.t('Male')}, {
        value: '1',
        label: translang.t('Female'),
        id: '1',
        title: translang.t('Female')
      }],
      nameTitleList: [],
      bloodtypeList: [{id: '0', title: "O", value: '0', label: "O"}, {
        id: '1',
        title: "A",
        value: '1',
        label: "A"
      }, {id: '3', title: "B", value: '3', label: "B"}, {id: '4', title: "AB", value: '4', label: "AB"}],
      nationalList: [],
      raceList: [],
      religionList: [],
      statusList: [],
      provinceList: [],
      districtList: [],
      subdistrictList: [],
      educationList: [],
      trainingTypeList: [],
      licenseTypeList: [],

      employeeTypeList: [],
      jobPositionList: [],
      departmentList: [],
      workingStatusList: [],
      insightYearList: [],

      selItemSelectedIndex: 0,
      selItemShowList: {},
      selItemSelTypeStr: "",
      selItemShowable: false,

      showModalOffline: false,
      modalBodyOffline: '',
      editEnable: false,
    };
    this.focusListener = null;
  }

  unsubscribe = null;

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    const {navigation} = this.props;
    this.focusListener = navigation.addListener("didFocus", () => {
      if (this.backhandler) {
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      console.log("ProfileTeacherMainNoTabScreen");

      const userInfo = this.props.navigation.getParam('userInfo');
      // ApiManager.isOpenEditUserProfile(userInfo.SchoolID).then((isOpenEdit) =>{
      //   this.setState({editEnable: isOpenEdit});
      // });
      this.setState({userInfo: userInfo}, () => {
        this.loadData();
        this.loadNameTitles();
        this.loadNational();
        this.loadRace();
        this.loadReligion();
        this.loadPersonalStatus();
        this.loadProvince();
        this.loadEducationLevel();
        this.loadTrainingType();
        this.loadLicenseType();
      })
    });
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.isFocused !== this.props.isFocused && this.props.isFocused === true) {
      const user = await Storage.getUserInfo();
      this.setState({userInfo: user});
    }
  }

  componentWillUnmount = () => {
    if (this.backhandler) {
      this.backhandler.remove();
    }
    if (this.focusListener) {
      this.focusListener.remove();
    }

    this.focusListener.remove();
    // this.unsubscribe();
  };

  loadData = () => {
    this.setState({isLoading: true});
    const {userInfo} = this.state;
    ApiManager.getEmployeeInfo(userInfo.SchoolID, userInfo.ID, getCurrentLocale()).then(res => {
      // ApiManager.getEmployeeInfo("307", "477536").then(res => {
      this.setState({dataEmployee: res.data, isLoading: false});
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
  loadPersonalStatus = () => {
    apiHttpClient.get(apiUrls.getPersonalStatusUrl())
      .then(response => response.data)
      .then(data => {
        this.setState({statusList: data.data});
      })
      .catch((error) => {
        console.error("Get PersonalStatus", error);
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
  loadDistrict = (provinceId) => {
    apiHttpClient.get(apiUrls.getDistrictListUrl(provinceId))
      .then(response => response.data)
      .then(data => {
        this.setState({districtList: data.data});
      })
      .catch((error) => {
        console.error("Get DistrictList", error);
      });
  }
  loadSubDistrict = (provinceID, districtID) => {
    apiHttpClient.get(apiUrls.getSubDistrictListUrl(provinceID, districtID))
      .then(response => response.data)
      .then(data => {
        this.setState({subdistrictList: data.data});
      })
      .catch((error) => {
        console.error("Get SubDistrictList", error);
      });
  }
  loadEducationLevel = () => {
    apiHttpClient.get(apiUrls.getEducationLevelUrl())
      .then(response => response.data)
      .then(data => {
        this.setState({educationList: data.data});
      })
      .catch((error) => {
        console.error("Get EducationLevel", error);
      });
  }
  loadTrainingType = () => {
    apiHttpClient.get(apiUrls.getEducationTypeUrl())
      .then(response => response.data)
      .then(data => {
        this.setState({trainingTypeList: data.data});
      })
      .catch((error) => {
        console.error("Get TrainingType", error);
      });
  }
  loadLicenseType = () => {
    apiHttpClient.get(apiUrls.getLicenseTypeUrl())
      .then(response => response.data)
      .then(data => {
        this.setState({licenseTypeList: data.data});
      })
      .catch((error) => {
        console.error("Get LicenseType", error);
      });
  }

  loadEmployeeType = () => {
    apiHttpClient.get(apiUrls.getEmployeeTypeListUrl(this.state.userInfo.SchoolID))
      .then(response => response.data)
      .then(data => {
        this.setState({employeeTypeList: data.data});
      })
      .catch((error) => {
        console.error("Get EmployeeTypes", error);
      });
  }
  loadJobPosition = () => {
    apiHttpClient.get(apiUrls.getJobPositionUrl(this.state.userInfo.SchoolID))
      .then(response => response.data)
      .then(data => {
        this.setState({jobPositionList: data.data});
      })
      .catch((error) => {
        console.error("Get JobPosition", error);
      });
  }
  loadDepartment = () => {
    apiHttpClient.get(apiUrls.getDepartmentUrl(this.state.userInfo.SchoolID))
      .then(response => response.data)
      .then(data => {
        this.setState({departmentList: data.data});
      })
      .catch((error) => {
        console.error("Get JobPosition", error);
      });
  }
  loadWorkingStatus = () => {
    apiHttpClient.get(apiUrls.getWorkingStatusUrl())
      .then(response => response.data)
      .then(data => {
        this.setState({workingStatusList: data.data});
      })
      .catch((error) => {
        console.error("Get WorkingStatus", error);
      });
  }

  loadInsightYear = () => {
    apiHttpClient.get(apiUrls.getInsightYearUrl())
      .then(response => response.data)
      .then(data => {
        this.setState({insightYearList: data.data});
      })
      .catch((error) => {
        console.error("Get InsightYear", error);
      });
  }

  back = () => {
    if (this.backhandler) {
      this.backhandler.remove();
    }

    const parentRoute = this.props.navigation.getParam('parent') ?? 'App';
    this.props.navigation.navigate(parentRoute);
  };

  onChangeSwitcher = (index) => {
    this.setState({profileType: index, isEdit: false})
  }

  setLikePermanentAddress = () => {
    const {dataEmployee, tempContactAddr} = this.state;

    let c_houseNo = "";
    let c_villageNo = "";
    let c_village = "";
    let c_lane = "";
    let c_building = "";
    let c_road = "";
    let c_subDistrictId = "";
    let c_subDistrict = "";
    let c_districtId = "";
    let c_district = "";
    let c_provinceId = "";
    let c_province = "";
    let c_postalCode = "";

    this.setState({isSelectPermanentAddr: !this.state.isSelectPermanentAddr}, () => {
      if (this.state.isSelectPermanentAddr) {
        c_houseNo = dataEmployee.c_houseNo;
        c_villageNo = dataEmployee.c_villageNo;
        c_village = dataEmployee.c_village;
        c_lane = dataEmployee.c_lane;
        c_building = dataEmployee.c_building;
        c_road = dataEmployee.c_road;
        c_subDistrictId = dataEmployee.c_subDistrictId;
        c_subDistrict = dataEmployee.c_subDistrict;
        c_districtId = dataEmployee.c_districtId;
        c_district = dataEmployee.c_district;
        c_provinceId = dataEmployee.c_provinceId;
        c_province = dataEmployee.c_province;
        c_postalCode = dataEmployee.c_postalCode;

        const temp = {
          c_houseNo: c_houseNo,
          c_villageNo: c_villageNo,
          c_village: c_village,
          c_lane: c_lane,
          c_building: c_building,
          c_road: c_road,
          c_subDistrictId: c_subDistrictId,
          c_subDistrict: c_subDistrict,
          c_districtId: c_districtId,
          c_district: c_district,
          c_provinceId: c_provinceId,
          c_province: c_province,
          c_postalCode: c_postalCode
        }

        dataEmployee.c_houseNo = dataEmployee.houseNo;
        dataEmployee.c_villageNo = dataEmployee.villageNo;
        dataEmployee.c_village = dataEmployee.village;
        dataEmployee.c_lane = dataEmployee.lane;
        dataEmployee.c_building = dataEmployee.building;
        dataEmployee.c_road = dataEmployee.road;
        dataEmployee.c_subDistrictId = dataEmployee.subDistrictId;
        dataEmployee.c_subDistrict = dataEmployee.subDistrict;
        dataEmployee.c_districtId = dataEmployee.districtId;
        dataEmployee.c_district = dataEmployee.district;
        dataEmployee.c_provinceId = dataEmployee.provinceId;
        dataEmployee.c_province = dataEmployee.province;
        dataEmployee.c_postalCode = dataEmployee.postalCode;

        this.setState({tempContactAddr: temp, dataEmployee: dataEmployee});
      } else {
        dataEmployee.c_houseNo = tempContactAddr.c_houseNo;
        dataEmployee.c_villageNo = tempContactAddr.c_villageNo;
        dataEmployee.c_village = tempContactAddr.c_village;
        dataEmployee.c_lane = tempContactAddr.c_lane;
        dataEmployee.c_building = tempContactAddr.c_building;
        dataEmployee.c_road = tempContactAddr.c_road;
        dataEmployee.c_subDistrictId = tempContactAddr.c_subDistrictId;
        dataEmployee.c_subDistrict = tempContactAddr.c_subDistrict;
        dataEmployee.c_districtId = tempContactAddr.c_districtId;
        dataEmployee.c_district = tempContactAddr.c_district;
        dataEmployee.c_provinceId = tempContactAddr.c_provinceId;
        dataEmployee.c_province = tempContactAddr.c_province;
        dataEmployee.c_postalCode = tempContactAddr.c_postalCode;

        this.setState({dataEmployee: dataEmployee});
      }
    });
  }

  addFamilyInfo = () => {
    // const {dataEmployee, tempAddFamilyInfo} = this.state;
    // if(!dataEmployee.familyInfo){
    //   dataEmployee.familyInfo = [];
    // }
    // dataEmployee.familyInfo.push(tempAddFamilyInfo);
    // this.setState({tempAddFamilyInfo: {}, dataEmployee: dataEmployee, showAddFamilyFormModal: false});
    this.updateFamilyInfo(this.state.tempAddFamilyInfo);
  }
  removeFamilyInfo = (index) => {
    const tempData = this.state.dataEmployee;
    tempData.familyInfo.splice(index, 1);
    this.setState({dataEmployee: tempData})
  }
  renderFamilyInfoItem = (index) => {
    const {dataEmployee, indexFamilyInfoEditSelected} = this.state;
    let isEdit = false
    if (index == indexFamilyInfoEditSelected) {
      isEdit = true;
    }
    const item = dataEmployee.familyInfo[index];

    const nameTitleList = this.state.nameTitleList.map(item => {
      return {value: item.titleId, id: item.titleId, title: item.title, label: item.title};
    });
    const statusList = this.state.statusList.map(item => {
      return {value: item.key, id: item.key, title: item.value, label: item.value};
    });
    const educationList = this.state.educationList.map(item => {
      return {value: item.key, id: item.key, title: item.value, label: item.value};
    });

    let birthday = "";

    if (moment(item.birthday).format('MM/DD/YYYY') != 'Invalid date') {
      birthday = moment(item.birthday).format('DD/MM/YYYY');
    }

    return (
      <View>
        <View style={styles.partSubTitleContainer}>
          <Text
            style={styles.partSubTitleText}>{`${translang.t('FAMILY_INFORMATION_FORM')} ${translang.t('NO')}. ${item.no}`}</Text>
          {!isEdit && <View style={{flexDirection: 'row'}}>
            <GradientButtonWithImg
              noText={true}
              iconImage={Images.n_ic_pencil_white}
              containerStyle={{width: 25, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0}}
              buttonStyle={{borderRadius: 13, height: 25}}
              iconStyle={{width: 10, height: 10}}
              colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
              isVerticalGradient={false}
              _onPress={() => {
                this.setState({indexFamilyInfoEditSelected: index})
              }}
            />
            <GradientButtonWithImg
              noText={true}
              iconImage={Images.n_ic_trash_white}
              containerStyle={{
                width: 25,
                paddingHorizontal: 0,
                shadowColor: 'transparent',
                shadowOpacity: 0,
                marginLeft: 10
              }}
              buttonStyle={{borderRadius: 13, height: 25}}
              iconStyle={{width: 10, height: 10}}
              colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
              isVerticalGradient={false}
              _onPress={() => {
                this.removeFamilyInfo(index)
              }}
            />
          </View>}
        </View>
        {!isEdit &&
        <View style={styles.partContainer}>
          <InfoTextItem
            label={translang.t('NO')}
            value_txt={item.no}/>
          <InfoTextItem
            label={translang.t('PROFILE_RELATIONSHIP')}
            value_txt={item.familyRelationship ?? ''}/>
          <InfoTextItem
            label={translang.t('NAME_TITLES')}
            value_txt={item.title ?? ''}/>
          <InfoTextItem
            label={translang.t('USERINFO_name')}
            value_txt={item.name ?? ''}/>
          <InfoTextItem
            label={translang.t('USERINFO_surname')}
            value_txt={item.surname ?? ''}/>
          <InfoTextItem
            label={translang.t('PROFILE_birthday')}
            value_txt={birthday}/>
          <InfoTextItem
            label={translang.t('MARITAL_TYPE')}
            value_txt={item.maritalStatus ?? ''}/>
          <InfoTextItem
            label={translang.t('LIVING_STATUS')}
            value_txt={item.livingStatus ?? ''}/>
          <InfoTextItem
            label={translang.t('DEATH_STATUS')}
            value_txt={item.deathStatus ?? ''}/>
          <InfoTextItem
            label={translang.t('FAMILY_OCCUPATION')}
            value_txt={item.familyOccupation ?? ''}/>
          <InfoTextItem
            label={translang.t('PROFILE_EDUCATION')}
            value_txt={item.education ?? ''}/>
        </View>}
        {isEdit &&
        <View style={styles.partEditContainer}>
          <InfoTextInputItem
            disable={true}
            label={translang.t('NO')}
            value_txt={item.no}/>

          <InfoTextInputItem
            disable={false}
            canSelect={false}
            onChangeText={(key) => {
              dataEmployee.familyInfo[index].familyRelationship = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('PROFILE_RELATIONSHIP')}
            label={translang.t('PROFILE_RELATIONSHIP')}
            value_txt={item.relationship ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect={true}
            onClickInput={() => {
              this.setState({
                selItemShowable: true,
                selItemSelTypeStr: "EditProfileFamilynameTitle",
                selItemSelectedIndex: index,
                selItemShowList: nameTitleList
              })
            }}
            placeHolder={translang.t('SELECT_NAMETITLES')}
            label={translang.t('NAME_TITLES')}
            value_txt={item.title ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect={false}
            onChangeText={(key) => {
              dataEmployee.familyInfo[index].name = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('USERINFO_name')}
            label={translang.t('USERINFO_name')}
            value_txt={dataEmployee.familyInfo[index].name ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect={false}
            onChangeText={(key) => {
              dataEmployee.familyInfo[index].surname = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('USERINFO_surname')}
            label={translang.t('USERINFO_surname')}
            value_txt={dataEmployee.familyInfo[index].surname ?? ''}/>
          <TouchableOpacity onPress={() => {
            this.setState({showDatePicker: true, selCalendarType: "EditFamily", selEditIndex: index});
          }}>
            <InfoTextInputItem
              disable={false}
              canSelect={false}
              notouch={true}
              placeHolder={translang.t('DDMMYYYY')}
              label={translang.t('PROFILE_birthday')}
              value_txt={birthday}/>
          </TouchableOpacity>


          <InfoTextInputItem
            disable={false}
            canSelect={true}
            onClickInput={() => {
              this.setState({
                selItemShowable: true,
                selItemSelTypeStr: "EditProfileFamilypersonalStatus",
                selItemSelectedIndex: index,
                selItemShowList: statusList
              })
            }}
            placeHolder={translang.t('MARITAL_TYPE')}
            label={translang.t('MARITAL_TYPE')}
            value_txt={item.maritalStatus ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect={false}
            onChangeText={(key) => {
              dataEmployee.familyInfo[index].livingStatus = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('LIVING_STATUS')}
            label={translang.t('LIVING_STATUS')}
            value_txt={item.livingStatus ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect={false}
            onChangeText={(key) => {
              dataEmployee.familyInfo[index].deathStatus = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('DEATH_STATUS')}
            label={translang.t('DEATH_STATUS')}
            value_txt={item.deathStatus ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect={false}
            onChangeText={(key) => {
              dataEmployee.familyInfo[index].familyOccupation = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('FAMILY_OCCUPATION')}
            label={translang.t('FAMILY_OCCUPATION')}
            value_txt={item.familyOccupation ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect={true}
            onClickInput={() => {
              this.setState({
                selItemShowable: true,
                selItemSelTypeStr: "EditProfileFamilyeducation",
                selItemSelectedIndex: index,
                selItemShowList: educationList
              })
            }}
            placeHolder={translang.t('PROFILE_EDUCATION')}
            label={translang.t('PROFILE_EDUCATION')}
            value_txt={item.education ?? ''}/>

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
                this.setState({indexFamilyInfoEditSelected: -1}, () => {
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
                this.setState({indexFamilyInfoEditSelected: -1}, () => {
                  this.updateFamilyInfo(dataEmployee.familyInfo[index]);
                })
              }}
            />
          </View>

        </View>}
      </View>

    );
  }

  addEducationInfo = () => {
    // const {dataEmployee, tempAddEducationInfo} = this.state;

    // if(!dataEmployee.employeeEducationInfos){
    //   dataEmployee.employeeEducationInfos = [];
    // }
    // dataEmployee.employeeEducationInfos.push(tempAddEducationInfo);
    // this.setState({tempAddEducationInfo: {}, dataEmployee: dataEmployee, showAddEducationInfoModal: false});
    this.updateEducationInfo(this.state.tempAddEducationInfo);
  }
  removeEducationInfo = (index) => {
    const tempData = this.state.dataEmployee;
    tempData.employeeEducationInfos.splice(index, 1);
    this.setState({dataEmployee: tempData})
  }
  renderEducationInfoItem = (index) => {
    const {dataEmployee, indexEducationInfoEditSelected} = this.state;
    let isEdit = false
    if (index == indexEducationInfoEditSelected) {
      isEdit = true;
    }
    const item = dataEmployee.employeeEducationInfos[index];

    const educationList = this.state.educationList.map(item => {
      return {value: item.key, id: item.key, title: item.value, label: item.value};
    });

    return (
      <View>
        <View style={styles.partSubTitleContainer}>
          <Text
            style={styles.partSubTitleText}>{`${translang.t('PROFILE_educationinfo')} ${translang.t('NO')}. ${item.Id}`}</Text>
          {!isEdit && this.state.editEnable && <View style={{flexDirection: 'row'}}>
            <GradientButtonWithImg
              noText={true}
              iconImage={Images.n_ic_pencil_white}
              containerStyle={{width: 25, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0}}
              buttonStyle={{borderRadius: 13, height: 25}}
              iconStyle={{width: 10, height: 10}}
              colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
              isVerticalGradient={false}
              _onPress={() => {
                this.setState({indexEducationInfoEditSelected: index})
              }}
            />
            <GradientButtonWithImg
              noText={true}
              iconImage={Images.n_ic_trash_white}
              containerStyle={{
                width: 25,
                paddingHorizontal: 0,
                shadowColor: 'transparent',
                shadowOpacity: 0,
                marginLeft: 10
              }}
              buttonStyle={{borderRadius: 13, height: 25}}
              iconStyle={{width: 10, height: 10}}
              colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
              isVerticalGradient={false}
              _onPress={() => {
                this.removeEducationInfo(index)
              }}
            />
          </View>}
        </View>
        {!isEdit &&
        <View style={styles.partContainer}>
          <InfoTextItem
            label={translang.t('NO')}
            value_txt={item.Id}/>
          <InfoTextItem
            label={translang.t('PROFILE_EDUCATION_INSTITUTION')}
            value_txt={item.institution ?? ''}/>
          <InfoTextItem
            label={translang.t('GRADUATE_START_DATE')}
            value_txt={item.studyYear ?? ''}/>
          <InfoTextItem
            label={translang.t('GRADUATE_END_DATE')}
            value_txt={item.graduationYear ?? ''}/>
          <InfoTextItem
            label={translang.t('PROFILE_TEACHER_EDUCATION')}
            value_txt={item.educationLevel ?? ''}/>
          <InfoTextItem
            label={translang.t('MAJOR')}
            value_txt={item.major ?? ''}/>
          <InfoTextItem
            label={translang.t('MINOR')}
            value_txt={item.minor ?? ''}/>
        </View>}
        {isEdit &&
        <View style={styles.partEditContainer}>
          <InfoTextInputItem
            disable={true}
            label={translang.t('NO')}
            value_txt={item.Id}/>

          <InfoTextInputItem
            disable={false}
            canSelect={false}
            onChangeText={(key) => {
              dataEmployee.employeeEducationInfos[index].institution = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('PROFILE_EDUCATION_INSTITUTION')}
            label={translang.t('PROFILE_EDUCATION_INSTITUTION')}
            value_txt={item.institution ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect={false}
            onChangeText={(key) => {
              dataEmployee.employeeEducationInfos[index].studyYear = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('YYYY')}
            label={translang.t('GRADUATE_START_DATE')}
            value_txt={item.studyYear ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect={false}
            onChangeText={(key) => {
              dataEmployee.employeeEducationInfos[index].graduationYear = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('YYYY')}
            label={translang.t('GRADUATE_END_DATE')}
            value_txt={item.graduationYear ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect={true}
            onClickInput={() => {
              this.setState({
                selItemShowable: true,
                selItemSelTypeStr: "EditEducationInfoeducationLevel",
                selItemSelectedIndex: index,
                selItemShowList: educationList
              })
            }}
            selectList={educationList}
            onSelectItem={(item) => {
              dataEmployee.employeeEducationInfos[index].educationLevelId = item.id;
              dataEmployee.employeeEducationInfos[index].educationLevel = item.title;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('PROFILE_TEACHER_EDUCATION')}
            label={translang.t('PROFILE_TEACHER_EDUCATION')}
            value_txt={item.educationLevel ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect={false}
            onChangeText={(key) => {
              dataEmployee.employeeEducationInfos[index].major = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('MAJOR')}
            label={translang.t('MAJOR')}
            value_txt={item.major ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect={false}
            onChangeText={(key) => {
              dataEmployee.employeeEducationInfos[index].minor = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('MINOR')}
            label={translang.t('MINOR')}
            value_txt={item.minor ?? ''}/>

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
                this.setState({indexEducationInfoEditSelected: -1}, () => {
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
                this.setState({indexEducationInfoEditSelected: -1}, () => {
                  this.updateEducationInfo(dataEmployee.employeeEducationInfos[index]);
                })
              }}
            />
          </View>

        </View>}
      </View>

    );
  }

  addHonorInfo = () => {
    // const {dataEmployee, tempAddHonorInfo} = this.state;

    // if(!dataEmployee.employeeHonorInfos){
    //   dataEmployee.employeeHonorInfos = [];
    // }
    // dataEmployee.employeeHonorInfos.push(tempAddHonorInfo);
    // this.setState({tempAddHonorInfo: {}, dataEmployee: dataEmployee, showAddHonorInfoModal: false});
    this.updateHornorInfo(this.state.tempAddHonorInfo);
  }
  removeHonorInfo = (index) => {
    const tempData = this.state.dataEmployee;
    tempData.employeeHonorInfos.splice(index, 1);
    this.setState({dataEmployee: tempData})
  }
  renderHonorInfoItem = (index) => {
    const {dataEmployee, indexHonorInfoEditSelected} = this.state;
    let isEdit = false
    if (index == indexHonorInfoEditSelected) {
      isEdit = true;
    }
    const item = dataEmployee.employeeHonorInfos[index];

    return (
      <View>
        <View style={styles.partSubTitleContainer}>
          <Text
            style={styles.partSubTitleText}>{`${translang.t('PROFILE_HONOR_INFORMATION')} ${translang.t('NO')}. ${item.Id ?? ''}`}</Text>
          {!isEdit && this.state.editEnable && <View style={{flexDirection: 'row'}}>
            <GradientButtonWithImg
              noText={true}
              iconImage={Images.n_ic_pencil_white}
              containerStyle={{width: 25, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0}}
              buttonStyle={{borderRadius: 13, height: 25}}
              iconStyle={{width: 10, height: 10}}
              colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
              isVerticalGradient={false}
              _onPress={() => {
                this.setState({indexHonorInfoEditSelected: index})
              }}
            />
            <GradientButtonWithImg
              noText={true}
              iconImage={Images.n_ic_trash_white}
              containerStyle={{
                width: 25,
                paddingHorizontal: 0,
                shadowColor: 'transparent',
                shadowOpacity: 0,
                marginLeft: 10
              }}
              buttonStyle={{borderRadius: 13, height: 25}}
              iconStyle={{width: 10, height: 10}}
              colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
              isVerticalGradient={false}
              _onPress={() => {
                this.removeHonorInfo(index)
              }}
            />
          </View>}
        </View>
        {!isEdit &&
        <View style={styles.partContainer}>
          <InfoTextItem
            label={translang.t('NO')}
            value_txt={`${item.Id ?? ''}`}/>
          <InfoTextItem
            label={translang.t('PROFILE_HONOR_TYPE')}
            value_txt={item.honor ?? ''}/>
          <InfoTextItem
            label={translang.t('PROFILE_DONATING_AGENCY')}
            value_txt={item.honorAgency ?? ''}/>
          <InfoTextItem
            label={translang.t('PROFILE_YEAR_RECEIVED')}
            value_txt={item.honorYear ?? ''}/>
        </View>}
        {isEdit &&
        <View style={styles.partEditContainer}>
          <InfoTextInputItem
            disable={true}
            label={translang.t('NO')}
            value_txt={`${item.Id ?? ''}`}/>

          <InfoTextInputItem
            disable={false}
            canSelect={false}
            onChangeText={(key) => {
              dataEmployee.employeeHonorInfos[index].honor = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('PROFILE_HONOR_TYPE')}
            label={translang.t('PROFILE_HONOR_TYPE')}
            value_txt={item.honor ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect={false}
            onChangeText={(key) => {
              dataEmployee.employeeHonorInfos[index].honorAgency = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('PROFILE_DONATING_AGENCY')}
            label={translang.t('PROFILE_DONATING_AGENCY')}
            value_txt={item.honorAgency ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect={false}
            onChangeText={(key) => {
              dataEmployee.employeeHonorInfos[index].honorYear = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('YYYY')}
            label={translang.t('PROFILE_YEAR_RECEIVED')}
            value_txt={item.honorYear ?? ''}/>

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
                this.setState({indexHonorInfoEditSelected: -1}, () => {
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
                this.setState({indexHonorInfoEditSelected: -1}, () => {
                  this.updateHornorInfo(dataEmployee.employeeHonorInfos[index]);
                })
              }}
            />
          </View>

        </View>}
      </View>

    );
  }

  addTrainingInfo = () => {
    // const {dataEmployee, tempAddTrainingInfo} = this.state;

    // if(!dataEmployee.employeeTrainingInfos){
    //   dataEmployee.employeeTrainingInfos = [];
    // }
    // dataEmployee.employeeTrainingInfos.push(tempAddTrainingInfo);
    // this.setState({tempAddTrainingInfo: {}, dataEmployee: dataEmployee, showAddTrainingInfoModal: false});
    this.updateTrainingInfo(this.state.tempAddTrainingInfo);
  }
  removeTrainingInfo = (index) => {
    const tempData = this.state.dataEmployee;
    tempData.employeeTrainingInfos.splice(index, 1);
    this.setState({dataEmployee: tempData})
  }
  renderTrainingInfoItem = (index) => {
    const {dataEmployee, indexTrainingInfoEditSelected} = this.state;
    let isEdit = false
    if (index == indexTrainingInfoEditSelected) {
      isEdit = true;
    }
    const item = dataEmployee.employeeTrainingInfos[index];
    const trainingTypeList = this.state.trainingTypeList.map(item => {
      return {value: item.key, id: item.key, title: item.value, label: item.value};
    });

    let trainingStartDate = "";
    if (moment(item.trainingStartDate).format('MM/DD/YYYY') != 'Invalid date') {
      trainingStartDate = moment(item.trainingStartDate).format('DD/MM/YYYY');
    }
    let trainingEndDate = "";
    if (moment(item.trainingEndDate).format('MM/DD/YYYY') != 'Invalid date') {
      trainingEndDate = moment(item.trainingEndDate).format('DD/MM/YYYY');
    }

    return (
      <View>
        <View style={styles.partSubTitleContainer}>
          <Text
            style={styles.partSubTitleText}>{`${translang.t('TRAINING_EDUCATION_VISITING_INFORMATION')} ${translang.t('NO')}. ${item.Id}`}</Text>
          {!isEdit && this.state.editEnable && <View style={{flexDirection: 'row'}}>
            <GradientButtonWithImg
              noText={true}
              iconImage={Images.n_ic_pencil_white}
              containerStyle={{width: 25, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0}}
              buttonStyle={{borderRadius: 13, height: 25}}
              iconStyle={{width: 10, height: 10}}
              colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
              isVerticalGradient={false}
              _onPress={() => {
                this.setState({indexTrainingInfoEditSelected: index})
              }}
            />
            <GradientButtonWithImg
              noText={true}
              iconImage={Images.n_ic_trash_white}
              containerStyle={{
                width: 25,
                paddingHorizontal: 0,
                shadowColor: 'transparent',
                shadowOpacity: 0,
                marginLeft: 10
              }}
              buttonStyle={{borderRadius: 13, height: 25}}
              iconStyle={{width: 10, height: 10}}
              colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
              isVerticalGradient={false}
              _onPress={() => {
                this.removeTrainingInfo(index)
              }}
            />
          </View>}
        </View>
        {!isEdit &&
        <View style={styles.partContainer}>
          <InfoTextItem
            label={translang.t('NO')}
            value_txt={`${item.Id}`}/>

          <InfoTextItem
            label={translang.t('PROFILE_TYPE')}
            value_txt={item.trainingType ?? ''}/>
          <InfoTextItem
            label={translang.t('PROFILE_PROJECT')}
            value_txt={item.projectName ?? ''}/>
          <InfoTextItem
            label={translang.t('PROFILE_TRAINING_COURSE_NAME')}
            value_txt={item.trainingName ?? ''}/>
          <View style={{flexDirection: 'row'}}>
            <View style={{flex: 1, paddingleft: 10, paddingRight: 10}}>
              <InfoTextItem
                label={translang.t('PROFILE_TRAINING_START_DATE')}
                value_txt={trainingStartDate}/>
            </View>

            <View style={{flex: 1, paddingleft: 10}}>
              <InfoTextItem
                label={translang.t('PROFILE_TRAINING_END_DATE')}
                value_txt={trainingEndDate}/>
            </View>
          </View>
          <InfoTextItem
            label={translang.t('PROFILE_NUMBER_OF_HOURS')}
            value_txt={item.trainingHours ?? ''}/>
          <InfoTextItem
            label={translang.t('PROFILE_LOCATION')}
            value_txt={item.trainingPlace ?? ''}/>
          <InfoTextItem
            label={translang.t('PROFILE_COUNTRY')}
            value_txt={item.trainingCountry ?? ''}/>
          <InfoTextItem
            label={translang.t('PROFILE_PROVINCE')}
            value_txt={item.trainingProvince ?? ''}/>
          <InfoTextItem
            label={translang.t('PROFILE_EXPENSES')}
            value_txt={item.expenses ?? ''}/>
        </View>}
        {isEdit &&
        <View style={styles.partEditContainer}>
          <InfoTextInputItem
            disable={true}
            label={translang.t('NO')}
            value_txt={`${item.Id}`}/>

          <InfoTextInputItem
            disable={false}
            canSelect={true}
            onClickInput={() => {
              this.setState({
                selItemShowable: true,
                selItemSelTypeStr: "EditTrainingtrainingType",
                selItemSelectedIndex: index,
                selItemShowList: trainingTypeList
              })
            }}
            placeHolder={translang.t('PROFILE_TYPE')}
            label={translang.t('PROFILE_TYPE')}
            value_txt={item.trainingType ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect={false}
            onChangeText={(key) => {
              dataEmployee.employeeTrainingInfos[index].projectName = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('PROFILE_PROJECT')}
            label={translang.t('PROFILE_PROJECT')}
            value_txt={item.projectName ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect={false}
            onChangeText={(key) => {
              dataEmployee.employeeTrainingInfos[index].trainingName = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('PROFILE_TRAINING_COURSE_NAME')}
            label={translang.t('PROFILE_TRAINING_COURSE_NAME')}
            value_txt={item.trainingName ?? ''}/>

          <View style={{flexDirection: 'row'}}>
            <View style={{flex: 1, paddingleft: 10, paddingRight: 10}}>
              <TouchableOpacity onPress={() => {
                this.setState({showDatePicker: true, selCalendarType: "EditStartTraining", selEditIndex: index});
              }}>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  notouch={true}
                  placeHolder={translang.t('DDMMYYYY')}
                  label={translang.t('PROFILE_TRAINING_START_DATE')}
                  value_txt={trainingStartDate}/>
              </TouchableOpacity>
            </View>

            <View style={{flex: 1, paddingleft: 10}}>
              <TouchableOpacity onPress={() => {
                this.setState({showDatePicker: true, selCalendarType: "EditEndTraining", selEditIndex: index});
              }}>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  notouch={true}
                  placeHolder={translang.t('DDMMYYYY')}
                  label={translang.t('PROFILE_TRAINING_END_DATE')}
                  value_txt={trainingEndDate}/>
              </TouchableOpacity>
            </View>
          </View>

          <InfoTextInputItem
            disable={false}
            canSelect={false}
            onChangeText={(key) => {
              dataEmployee.employeeTrainingInfos[index].trainingHours = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('PROFILE_NUMBER_OF_HOURS')}
            label={translang.t('PROFILE_NUMBER_OF_HOURS')}
            value_txt={item.trainingHours ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect={false}
            onChangeText={(key) => {
              dataEmployee.employeeTrainingInfos[index].trainingPlace = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('PROFILE_LOCATION')}
            label={translang.t('PROFILE_LOCATION')}
            value_txt={item.trainingPlace ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect={false}
            onChangeText={(key) => {
              dataEmployee.employeeTrainingInfos[index].trainingCountry = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('PROFILE_COUNTRY')}
            label={translang.t('PROFILE_COUNTRY')}
            value_txt={item.trainingCountry ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect={false}
            onChangeText={(key) => {
              dataEmployee.employeeTrainingInfos[index].trainingProvince = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('PROFILE_PROVINCE')}
            label={translang.t('PROFILE_PROVINCE')}
            value_txt={item.trainingProvince ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect={false}
            onChangeText={(key) => {
              dataEmployee.employeeTrainingInfos[index].expenses = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('PROFILE_EXPENSES')}
            label={translang.t('PROFILE_EXPENSES')}
            value_txt={item.expenses ?? ''}/>

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
                this.setState({indexTrainingInfoEditSelected: -1}, () => {
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
                this.setState({indexTrainingInfoEditSelected: -1}, () => {
                  this.updateTrainingInfo(dataEmployee.employeeTrainingInfos[index]);
                })
              }}
            />
          </View>

        </View>}
      </View>

    );
  }

  addLicenseInfo = () => {
    // const {dataEmployee, tempAddLicenseInfo} = this.state;

    // if(!dataEmployee.EmployeeProfessionalLicenseInfos){
    //   dataEmployee.EmployeeProfessionalLicenseInfos = [];
    // }
    // dataEmployee.EmployeeProfessionalLicenseInfos.push(tempAddLicenseInfo);
    // this.setState({tempAddLicenseInfo: {}, dataEmployee: dataEmployee, showAddLicenseInfoModal: false});


    this.updateOccupationalInfo(this.state.tempAddLicenseInfo);
  }
  removeLicenseInfo = (index) => {
    const tempData = this.state.dataEmployee;
    tempData.EmployeeProfessionalLicenseInfos.splice(index, 1);
    this.setState({dataEmployee: tempData})
  }
  renderLicenseInfoItem = (index) => {
    const {dataEmployee, indexLicenseInfoEditSelected} = this.state;
    let isEdit = false
    if (index == indexLicenseInfoEditSelected) {
      isEdit = true;
    }
    const item = dataEmployee.EmployeeProfessionalLicenseInfos[index];

    const licenseTypeList = this.state.licenseTypeList.map(item => {
      return {value: item.key, id: item.key, title: item.value, label: item.value};
    });

    let licenseIssuedDate = "";
    let licenseExpireDate = "";
    if (moment(item.licenseIssuedDate).format('MM/DD/YYYY') != 'Invalid date') {
      licenseIssuedDate = moment(item.licenseIssuedDate).format('DD/MM/YYYY');
    }
    if (moment(item.licenseExpireDate).format('MM/DD/YYYY') != 'Invalid date') {
      licenseExpireDate = moment(item.licenseExpireDate).format('DD/MM/YYYY');
    }
    return (
      <View>
        <View style={styles.partSubTitleContainer}>
          <Text
            style={styles.partSubTitleText}>{`${translang.t('OCCUPATIONAL_LICENSE')} ${translang.t('NO')}. ${item.Id ?? ''}`}</Text>
          {!isEdit && this.state.editEnable && <View style={{flexDirection: 'row'}}>
            <GradientButtonWithImg
              noText={true}
              iconImage={Images.n_ic_pencil_white}
              containerStyle={{width: 25, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0}}
              buttonStyle={{borderRadius: 13, height: 25}}
              iconStyle={{width: 10, height: 10}}
              colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
              isVerticalGradient={false}
              _onPress={() => {
                this.setState({indexLicenseInfoEditSelected: index})
              }}
            />
            <GradientButtonWithImg
              noText={true}
              iconImage={Images.n_ic_trash_white}
              containerStyle={{
                width: 25,
                paddingHorizontal: 0,
                shadowColor: 'transparent',
                shadowOpacity: 0,
                marginLeft: 10
              }}
              buttonStyle={{borderRadius: 13, height: 25}}
              iconStyle={{width: 10, height: 10}}
              colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
              isVerticalGradient={false}
              _onPress={() => {
                this.removeLicenseInfo(index)
              }}
            />
          </View>}
        </View>
        {!isEdit &&
        <View style={styles.partContainer}>
          <InfoTextItem
            label={translang.t('NO')}
            value_txt={`${item.Id ?? ''}`}/>
          <InfoTextItem
            label={translang.t('PROFILE_PROFESSIONAL_LICENSE_TYPE')}
            value_txt={item.licenseType ?? ''}/>
          <InfoTextItem
            label={translang.t('PROFILE_PROFESSIONAL_LICENSE_NUMBER')}
            value_txt={item.licenseNo ?? ''}/>
          <InfoTextItem
            label={translang.t('PROFILE_PROFESSIONAL_LICENSE_NAME')}
            value_txt={item.licenseName ?? ''}/>
          <InfoTextItem
            label={translang.t('PROFILE_DATE_ISSUE_ACCOMPANYING_CERTIFICATE')}
            value_txt={licenseIssuedDate}/>
          <InfoTextItem
            label={translang.t('PROFILE_CERTIFICATE_EXPIRATION_DATE')}
            value_txt={licenseExpireDate}/>
          <InfoTextItem
            label={translang.t('PROFILE_ORGANIZATION_ACCOMPANYING_CERTIFICATE')}
            value_txt={item.licenseAgencyIssued ?? ''}/>
        </View>}
        {isEdit &&
        <View style={styles.partEditContainer}>
          <InfoTextInputItem
            disable={true}
            label={translang.t('NO')}
            value_txt={`${item.Id ?? ''}`}/>

          <InfoTextInputItem
            disable={false}
            canSelect={true}
            onClickInput={() => {
              this.setState({
                selItemShowable: true,
                selItemSelTypeStr: "EditLicenselicenseType",
                selItemSelectedIndex: index,
                selItemShowList: licenseTypeList
              })
            }}
            placeHolder={translang.t('PROFILE_PROFESSIONAL_LICENSE_TYPE')}
            label={translang.t('PROFILE_PROFESSIONAL_LICENSE_TYPE')}
            value_txt={item.licenseType ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect={false}
            onChangeText={(key) => {
              dataEmployee.EmployeeProfessionalLicenseInfos[index].licenseNo = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('PROFILE_PROFESSIONAL_LICENSE_NUMBER')}
            label={translang.t('PROFILE_PROFESSIONAL_LICENSE_NUMBER')}
            value_txt={item.licenseNo ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect={false}
            onChangeText={(key) => {
              dataEmployee.EmployeeProfessionalLicenseInfos[index].licenseName = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('PROFILE_PROFESSIONAL_LICENSE_NAME')}
            label={translang.t('PROFILE_PROFESSIONAL_LICENSE_NAME')}
            value_txt={item.licenseName ?? ''}/>

          <TouchableOpacity onPress={() => {
            this.setState({showDatePicker: true, selCalendarType: "EditLicenseIssueDate", selEditIndex: index});
          }}>
            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                dataEmployee.EmployeeProfessionalLicenseInfos[index].licenseIssuedDate = key;
                this.setState({dataEmployee: dataEmployee});
              }}
              notouch={true}
              placeHolder={translang.t('DDMMYYYY')}
              label={translang.t('PROFILE_DATE_ISSUE_ACCOMPANYING_CERTIFICATE')}
              value_txt={licenseIssuedDate}/>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
            this.setState({showDatePicker: true, selCalendarType: "EditLicenseExpireDate", selEditIndex: index});
          }}>
            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                dataEmployee.EmployeeProfessionalLicenseInfos[index].licenseExpireDate = key;
                this.setState({dataEmployee: dataEmployee});
              }}
              notouch={true}
              placeHolder={translang.t('DDMMYYYY')}
              label={translang.t('PROFILE_CERTIFICATE_EXPIRATION_DATE')}
              value_txt={licenseExpireDate}/>
          </TouchableOpacity>

          <InfoTextInputItem
            disable={false}
            canSelect={false}
            onChangeText={(key) => {
              dataEmployee.EmployeeProfessionalLicenseInfos[index].licenseAgencyIssued = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('PROFILE_ORGANIZATION_ACCOMPANYING_CERTIFICATE')}
            label={translang.t('PROFILE_ORGANIZATION_ACCOMPANYING_CERTIFICATE')}
            value_txt={item.licenseAgencyIssued ?? ''}/>

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
                this.setState({indexLicenseInfoEditSelected: -1}, () => {
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
                this.setState({indexLicenseInfoEditSelected: -1}, () => {
                  this.updateOccupationalInfo(dataEmployee.EmployeeProfessionalLicenseInfos[index]);
                })
              }}
            />
          </View>

        </View>}
      </View>

    );
  }

  addInsignInfo = () => {
    // const {dataEmployee, tempAddInsignInfo} = this.state;

    // if(!dataEmployee.EmployeeInsigniaInfos){
    //   dataEmployee.EmployeeInsigniaInfos = [];
    // }
    // dataEmployee.EmployeeInsigniaInfos.push(tempAddInsignInfo);
    // this.setState({tempAddInsignInfo: {}, dataEmployee: dataEmployee, showAddInsignInfoModal: false});

    this.updateDecorationInfo(this.state.tempAddInsignInfo);
  }
  removeInsignInfo = (index) => {
    const tempData = this.state.dataEmployee;
    tempData.EmployeeInsigniaInfos.splice(index, 1);
    this.setState({dataEmployee: tempData})
  }
  renderInsignInfoItem = (index) => {
    const {dataEmployee, indexInsignInfoEditSelected} = this.state;
    let isEdit = false
    if (index == indexInsignInfoEditSelected) {
      isEdit = true;
    }
    const item = dataEmployee.EmployeeInsigniaInfos[index];

    let insigniaRecordDate = ""
    if (moment(item.insigniaRecordDate).format('MM/DD/YYYY') != 'Invalid date') {
      insigniaRecordDate = moment(item.insigniaRecordDate).format('DD/MM/YYYY');
    }
    return (
      <View>
        <View style={styles.partSubTitleContainer}>
          <Text
            style={styles.partSubTitleText}>{`${translang.t('OCCUPATIONAL_LICENSE')} ${translang.t('NO')}. ${item.Id ?? ''}`}</Text>
          {!isEdit && this.state.editEnable && <View style={{flexDirection: 'row'}}>
            <GradientButtonWithImg
              noText={true}
              iconImage={Images.n_ic_pencil_white}
              containerStyle={{width: 25, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0}}
              buttonStyle={{borderRadius: 13, height: 25}}
              iconStyle={{width: 10, height: 10}}
              colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
              isVerticalGradient={false}
              _onPress={() => {
                this.setState({indexInsignInfoEditSelected: index})
              }}
            />
            <GradientButtonWithImg
              noText={true}
              iconImage={Images.n_ic_trash_white}
              containerStyle={{
                width: 25,
                paddingHorizontal: 0,
                shadowColor: 'transparent',
                shadowOpacity: 0,
                marginLeft: 10
              }}
              buttonStyle={{borderRadius: 13, height: 25}}
              iconStyle={{width: 10, height: 10}}
              colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
              isVerticalGradient={false}
              _onPress={() => {
                this.removeLicenseInfo(index)
              }}
            />
          </View>}
        </View>
        {!isEdit &&
        <View style={styles.partContainer}>
          <InfoTextItem
            label={translang.t('NO')}
            value_txt={`${item.Id ?? ''}`}/>
          <InfoTextItem
            label={translang.t('PROFILE_YEAR_RECEIVED')}
            value_txt={item.insigniaYear ?? ''}/>
          <InfoTextItem
            label={translang.t('PROFILE_ROYAL_DECORATION_CLASS')}
            value_txt={item.insigniaGrade ?? ''}/>
          <InfoTextItem
            label={translang.t('USERINFO_position')}
            value_txt={item.insigniaPosition ?? ''}/>
          <View style={{flexDirection: 'row'}}>
            <View style={{flex: 1, paddingleft: 10, paddingRight: 10}}>
              <InfoTextItem
                label={translang.t('PROFILE_ROYAL_GOVERNMENT_VOLUME_NO')}
                value_txt={item.insigniaBookNumber ?? ''}/>
            </View>
            <View style={{flex: 1, paddingleft: 10}}>
              <InfoTextItem
                label={translang.t('PROFILE_ROYAL_GOVERNMENT_PART')}
                value_txt={item.insigniaPart ?? ''}/>
            </View>
          </View>
          <InfoTextItem
            label={translang.t('PROFILE_ROYAL_GOVERNMENT_NO')}
            value_txt={item.insigniaNumber ?? ''}/>
          <InfoTextItem
            label={translang.t('PROFILE_DATED')}
            value_txt={insigniaRecordDate}/>
        </View>}
        {isEdit &&
        <View style={styles.partEditContainer}>
          <InfoTextInputItem
            disable={true}
            label={translang.t('NO')}
            value_txt={`${item.Id}`}/>

          <InfoTextInputItem
            disable={false}
            canSelect={false}
            onChangeText={(key) => {
              dataEmployee.EmployeeInsigniaInfos[index].insigniaYear = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('YYYY')}
            label={translang.t('PROFILE_YEAR_RECEIVED')}
            value_txt={item.insigniaYear ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect={false}
            onChangeText={(key) => {
              dataEmployee.EmployeeInsigniaInfos[index].insigniaGrade = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('PROFILE_ROYAL_DECORATION_CLASS')}
            label={translang.t('PROFILE_ROYAL_DECORATION_CLASS')}
            value_txt={item.insigniaGrade ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect={false}
            onChangeText={(key) => {
              dataEmployee.EmployeeInsigniaInfos[index].insigniaPosition = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('USERINFO_position')}
            label={translang.t('USERINFO_position')}
            value_txt={item.insigniaPosition ?? ''}/>

          <View style={{flexDirection: 'row'}}>
            <View style={{flex: 1, paddingleft: 10, paddingRight: 10}}>
              <InfoTextInputItem
                disable={false}
                canSelect={false}
                onChangeText={(key) => {
                  dataEmployee.EmployeeInsigniaInfos[index].insigniaBookNumber = key;
                  this.setState({dataEmployee: dataEmployee});
                }}
                placeHolder={translang.t('PROFILE_ROYAL_GOVERNMENT_VOLUME_NO')}
                label={translang.t('PROFILE_ROYAL_GOVERNMENT_VOLUME_NO')}
                value_txt={item.insigniaBookNumber ?? ''}/>
            </View>

            <View style={{flex: 1, paddingleft: 10}}>
              <InfoTextInputItem
                disable={false}
                canSelect={false}
                onChangeText={(key) => {
                  dataEmployee.EmployeeInsigniaInfos[index].insigniaPart = key;
                  this.setState({dataEmployee: dataEmployee});
                }}
                placeHolder={translang.t('PROFILE_ROYAL_GOVERNMENT_PART')}
                label={translang.t('PROFILE_ROYAL_GOVERNMENT_PART')}
                value_txt={item.insigniaPart ?? ''}/>
            </View>
          </View>

          <InfoTextInputItem
            disable={false}
            canSelect={false}
            onChangeText={(key) => {
              dataEmployee.EmployeeInsigniaInfos[index].insigniaNumber = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            placeHolder={translang.t('PROFILE_ROYAL_GOVERNMENT_NO')}
            label={translang.t('PROFILE_ROYAL_GOVERNMENT_NO')}
            value_txt={item.insigniaNumber ?? ''}/>
          <TouchableOpacity onPress={() => {
            this.setState({showDatePicker: true, selCalendarType: "EditInsignInfo", selEditIndex: index});
          }}>
            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                dataEmployee.EmployeeInsigniaInfos[index].insigniaRecordDate = key;
                this.setState({dataEmployee: dataEmployee});
              }}
              notouch={true}
              placeHolder={translang.t('DDMMYYYY')}
              label={translang.t('PROFILE_DATED')}
              value_txt={insigniaRecordDate}/>
          </TouchableOpacity>

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
                this.setState({indexInsignInfoEditSelected: -1}, () => {
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
                this.setState({indexInsignInfoEditSelected: -1}, () => {
                  this.updateDecorationInfo(dataEmployee.EmployeeInsigniaInfos[index]);
                })
              }}
            />
          </View>

        </View>}
      </View>

    );
  }

  onDateSelect = (date) => {
    const {dataEmployee, selCalendarType, selEditIndex, tempAddFamilyInfo, tempAddTrainingInfo, tempAddLicenseInfo, tempAddInsignInfo} = this.state;
    if (date === null || date === '') {
      this.setState({showDatePicker: false});
      return;
    }
    ;

    if (selCalendarType == "ProfileBirthday") {
      dataEmployee.birthday = moment(date);
      this.setState({dataEmployee: dataEmployee, showDatePicker: false});
    } else if (selCalendarType == "AddFamily") {
      tempAddFamilyInfo.birthday = moment(date);
      this.setState({tempAddFamilyInfo: tempAddFamilyInfo, showDatePicker: false});
    } else if (selCalendarType == "EditFamily") {
      dataEmployee.familyInfo[selEditIndex].birthday = moment(date);
      this.setState({dataEmployee: dataEmployee, showDatePicker: false});
    } else if (selCalendarType == "AddStartTraining") {
      tempAddTrainingInfo.trainingStartDate = moment(date);
      this.setState({tempAddTrainingInfo: tempAddTrainingInfo, showDatePicker: false});
    } else if (selCalendarType == "AddEndTraining") {
      tempAddTrainingInfo.trainingEndDate = moment(date);
      this.setState({tempAddTrainingInfo: tempAddTrainingInfo, showDatePicker: false});
    } else if (selCalendarType == "EditStartTraining") {
      dataEmployee.employeeTrainingInfos[selEditIndex].trainingStartDate = moment(date);
      this.setState({dataEmployee: dataEmployee, showDatePicker: false});
    } else if (selCalendarType == "EditEndTraining") {
      dataEmployee.employeeTrainingInfos[selEditIndex].trainingEndDate = moment(date);
      this.setState({dataEmployee: dataEmployee, showDatePicker: false});
    } else if (selCalendarType == "AddLicenseIssueDate") {
      tempAddLicenseInfo.licenseIssuedDate = moment(date);
      this.setState({tempAddLicenseInfo: tempAddLicenseInfo, showDatePicker: false});
    } else if (selCalendarType == "AddLicenseExpireDate") {
      tempAddLicenseInfo.licenseExpireDate = moment(date);
      this.setState({tempAddLicenseInfo: tempAddLicenseInfo, showDatePicker: false});
    } else if (selCalendarType == "EditLicenseIssueDate") {
      dataEmployee.EmployeeProfessionalLicenseInfos[selEditIndex].licenseIssuedDate = moment(date);
      this.setState({dataEmployee: dataEmployee, showDatePicker: false});
    } else if (selCalendarType == "EditLicenseExpireDate") {
      dataEmployee.EmployeeProfessionalLicenseInfos[selEditIndex].licenseExpireDate = moment(date);
      this.setState({dataEmployee: dataEmployee, showDatePicker: false});
    } else if (selCalendarType == "AddInsignRecordDate") {
      tempAddInsignInfo.insigniaRecordDate = moment(date);
      this.setState({tempAddInsignInfo: tempAddInsignInfo, showDatePicker: false});
    } else if (selCalendarType == "EditInsignInfo") {
      dataEmployee.EmployeeInsigniaInfos[selEditIndex].insigniaRecordDate = moment(date);
      this.setState({dataEmployee: dataEmployee, showDatePicker: false});
    }
  };
  onChangeListItem = (item) => {
    const {selItemSelTypeStr, dataEmployee, tempAddFamilyInfo, selItemSelectedIndex, tempAddEducationInfo, tempAddTrainingInfo, tempAddLicenseInfo} = this.state;
    if (item == null) {
      this.setState({selItemShowable: false})
    } else {
      if (selItemSelTypeStr == "EditProfilenameTitle") {
        dataEmployee.nameTitleId = item.id;
        dataEmployee.nameTitle = item.title;
        this.setState({dataEmployee: dataEmployee, selItemShowable: false});
      } else if (selItemSelTypeStr == "EditProfilesex") {
        dataEmployee.sexId = item.id;
        dataEmployee.sex = item.title;
        this.setState({dataEmployee: dataEmployee, selItemShowable: false})
      } else if (selItemSelTypeStr == "EditProfilebloodtype") {
        dataEmployee.bloodTypeID = item.id;
        dataEmployee.bloodType = item.title;
        this.setState({dataEmployee: dataEmployee, selItemShowable: false})
      } else if (selItemSelTypeStr == "EditProfilenationality") {
        dataEmployee.nationalityId = item.id;
        dataEmployee.nationality = item.title;
        this.setState({dataEmployee: dataEmployee, selItemShowable: false})
      } else if (selItemSelTypeStr == "EditProfilerace") {
        dataEmployee.raceId = item.id;
        dataEmployee.race = item.title;
        this.setState({dataEmployee: dataEmployee, selItemShowable: false})
      } else if (selItemSelTypeStr == "EditProfilereligion") {
        dataEmployee.religionId = item.id;
        dataEmployee.religion = item.title;
        this.setState({dataEmployee: dataEmployee, selItemShowable: false})
      } else if (selItemSelTypeStr == "EditProfilepersonalStatus") {
        dataEmployee.personalStatusId = item.id;
        dataEmployee.personalStatus = item.title;
        this.setState({dataEmployee: dataEmployee, selItemShowable: false})
      } else if (selItemSelTypeStr == "EditProfileprovince") {
        dataEmployee.provinceId = item.id;
        dataEmployee.province = item.title;
        this.loadDistrict(item.id);
        this.setState({dataEmployee: dataEmployee, selItemShowable: false})
      } else if (selItemSelTypeStr == "EditProfiledistrict") {
        dataEmployee.districtId = item.id;
        dataEmployee.district = item.title;
        this.loadSubDistrict(dataEmployee.provinceId, item.id);
        this.setState({dataEmployee: dataEmployee, selItemShowable: false})
      } else if (selItemSelTypeStr == "EditProfilesubdistrictList") {
        dataEmployee.subDistrictId = item.id;
        dataEmployee.subDistrict = item.title;
        this.setState({dataEmployee: dataEmployee, selItemShowable: false})
      } else if (selItemSelTypeStr == "EditProfileCprovince") {
        dataEmployee.c_provinceId = item.id;
        dataEmployee.c_province = item.title;
        this.loadDistrict(item.id);
        this.setState({dataEmployee: dataEmployee, selItemShowable: false})
      } else if (selItemSelTypeStr == "EditProfileCdistrict") {
        dataEmployee.c_districtId = item.id;
        dataEmployee.c_district = item.title;
        this.loadData(dataEmployee.c_provinceId, item.id);
        this.setState({dataEmployee: dataEmployee, selItemShowable: false})
      } else if (selItemSelTypeStr == "EditProfileCsubDistrict") {
        dataEmployee.c_subDistrictId = item.id;
        dataEmployee.c_subDistrict = item.title;
        this.setState({dataEmployee: dataEmployee, selItemShowable: false})
      } else if (selItemSelTypeStr == "AddProfileFamilynameTitle") {
        tempAddFamilyInfo.titleId = item.id;
        tempAddFamilyInfo.title = item.title;
        this.setState({tempAddFamilyInfo: tempAddFamilyInfo, selItemShowable: false})
      } else if (selItemSelTypeStr == "AddProfileFamilypersonalStatus") {
        tempAddFamilyInfo.maritalStatusId = item.id;
        tempAddFamilyInfo.maritalStatus = item.title;
        this.setState({tempAddFamilyInfo: tempAddFamilyInfo, selItemShowable: false})
      } else if (selItemSelTypeStr == "AddProfileFamilyeducation") {
        tempAddFamilyInfo.educationId = item.id;
        tempAddFamilyInfo.education = item.title;
        this.setState({tempAddFamilyInfo: tempAddFamilyInfo, selItemShowable: false})
      } else if (selItemSelTypeStr == "EditProfileFamilynameTitle") {
        dataEmployee.familyInfo[selItemSelectedIndex].titleId = item.id;
        dataEmployee.familyInfo[selItemSelectedIndex].title = item.title;
        this.setState({dataEmployee: dataEmployee, selItemShowable: false})
      } else if (selItemSelTypeStr == "EditProfileFamilypersonalStatus") {
        dataEmployee.familyInfo[selItemSelectedIndex].maritalStatusId = item.id;
        dataEmployee.familyInfo[selItemSelectedIndex].maritalStatus = item.title;
        this.setState({dataEmployee: dataEmployee, selItemShowable: false})
      } else if (selItemSelTypeStr == "EditProfileFamilyeducation") {
        dataEmployee.familyInfo[selItemSelectedIndex].educationId = item.id;
        dataEmployee.familyInfo[selItemSelectedIndex].education = item.title;
        this.setState({dataEmployee: dataEmployee, selItemShowable: false})
      } else if (selItemSelTypeStr == "AddEducationInfoeducationLevel") {
        tempAddEducationInfo.educationLevelId = item.id;
        tempAddEducationInfo.educationLevel = item.title;
        this.setState({tempAddEducationInfo: tempAddEducationInfo, selItemShowable: false})
      } else if (selItemSelTypeStr == "EditEducationInfoeducationLevel") {
        dataEmployee.employeeEducationInfos[selItemSelectedIndex].educationLevelId = item.id;
        dataEmployee.employeeEducationInfos[selItemSelectedIndex].educationLevel = item.title;
        this.setState({dataEmployee: dataEmployee, selItemShowable: false})
      } else if (selItemSelTypeStr == "AddTrainingtrainingType") {
        tempAddTrainingInfo.trainingTypeId = item.id;
        tempAddTrainingInfo.trainingType = item.title;
        this.setState({tempAddTrainingInfo: tempAddTrainingInfo, selItemShowable: false})
      } else if (selItemSelTypeStr == "EditTrainingtrainingType") {
        dataEmployee.employeeTrainingInfos[selItemSelectedIndex].trainingTypeId = item.id;
        dataEmployee.employeeTrainingInfos[selItemSelectedIndex].trainingType = item.title;
        this.setState({dataEmployee: dataEmployee, selItemShowable: false})
      } else if (selItemSelTypeStr == "AddLicenselicenseType") {
        tempAddLicenseInfo.licenseTypeId = item.id;
        tempAddLicenseInfo.licenseType = item.title;
        this.setState({tempAddLicenseInfo: tempAddLicenseInfo, selItemShowable: false})
      } else if (selItemSelTypeStr == "EditLicenselicenseType") {
        dataEmployee.EmployeeProfessionalLicenseInfos[selItemSelectedIndex].licenseTypeId = item.id;
        dataEmployee.EmployeeProfessionalLicenseInfos[selItemSelectedIndex].licenseType = item.title;
        this.setState({dataEmployee: dataEmployee, selItemShowable: false})
      }
    }
  }

  updateProfile = () => {
    const {dataEmployee} = this.state;

    const params = {
      employeeId: this.state.userInfo.ID,
      schoolId: this.state.userInfo.SchoolID,
      gender: dataEmployee.sexId,
      title: dataEmployee.nameTitleId,
      name: dataEmployee.firstName,
      surname: dataEmployee.lastName,
      nameEn: dataEmployee.firstNameEn,
      surnameEn: dataEmployee.lastNameEn,
      idCardNumber: dataEmployee.idCardNumber,
      passportNumber: dataEmployee.passportNumber,
      passportCountry: dataEmployee.passportCountry,
      birthDay: moment(dataEmployee.birthday).format('YYYY-MM-DD') + "T00:00:00",
      bloodType: dataEmployee.bloodType,
      nationality: dataEmployee.nationalityId,
      race: dataEmployee.raceId,
      religion: dataEmployee.religionId,
      maritalStatus: dataEmployee.personalStatusId,
      spouseName: dataEmployee.spouseFirstName,
      spouseSurname: dataEmployee.spouseLastName,
      phoneNumber: dataEmployee.phoneNumber,
      email: dataEmployee.email,
    };

    console.log("updateProfile", params);

    const promise = ApiManager.updateEmployeeProfile(params);
    this.setState({isLoading: true});
    promise.then(result => {
      this.setState({isEditProfile: false, isLoading: false}, () => {
        this.loadData();
      })
    }).catch(error => {
      console.log("updateProfile", error);
      this.setState({isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN')});
    })
  }

  updatePermanentAddress = () => {
    const {dataEmployee} = this.state;

    const params = {
      employeeId: this.state.userInfo.ID,
      schoolId: this.state.userInfo.SchoolID,
      houseNo: dataEmployee.houseNo,
      moo: dataEmployee.villageNo,
      village: dataEmployee.village,
      soi: dataEmployee.lane,
      building: dataEmployee.building,
      road: dataEmployee.road,
      province: dataEmployee.provinceId,
      district: dataEmployee.districtId,
      subDistrict: dataEmployee.subDistrictId,
      postalCode: dataEmployee.postalCode,
    };

    console.log("updatePermanentAddress", params);

    const promise = ApiManager.updateEmployeePermanentAddress(params);
    this.setState({isLoading: true});
    promise.then(result => {
      this.setState({isEditHouseInfo: false, isLoading: false}, () => {
        this.loadData();
      })
    }).catch(error => {
      console.log("updatePermanentAddress", error);
      this.setState({isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN')});
    })
  }

  updateContactAddress = () => {
    const {dataEmployee} = this.state;

    const params = {
      employeeId: this.state.userInfo.ID,
      schoolId: this.state.userInfo.SchoolID,
      isPermanentAddress: this.state.isSelectPermanentAddr,
      houseNo: dataEmployee.c_houseNo,
      moo: dataEmployee.c_villageNo,
      village: dataEmployee.c_village,
      soi: dataEmployee.c_lane,
      building: dataEmployee.c_building,
      road: dataEmployee.c_road,
      province: dataEmployee.c_provinceId,
      district: dataEmployee.c_districtId,
      subDistrict: dataEmployee.c_subDistrictId,
      postalCode: dataEmployee.c_postalCode,
    };

    console.log("updateContactAddress", params);

    const promise = ApiManager.updateEmployeeContactAddress(params);
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

  updateFamilyInfo = (familyinfo) => {
    const params = {
      employeeId: this.state.userInfo.ID,
      schoolId: this.state.userInfo.SchoolID,
      no: familyinfo.no,
      familyRelationship: familyinfo.familyRelationship,
      title: familyinfo.titleId,
      name: familyinfo.name,
      surname: familyinfo.surname,
      birthday: moment(familyinfo.birthday).format('YYYY-MM-DD') + "T00:00:00",
      maritalStatus: familyinfo.c_bumaritalStatusIdilding,
      livingStatus: familyinfo.livingStatus,
      deathStatus: familyinfo.deathStatus,
      familyOccupation: familyinfo.familyOccupation,
      education: familyinfo.educationId,
    };

    console.log("updateFamilyInfo", params);

    const promise = ApiManager.updateEmployeeFamilyInfo(params);
    this.setState({isLoading: true});
    promise.then(result => {
      this.setState({tempAddFamilyInfo: {}, showAddFamilyFormModal: false, isLoading: false}, () => {
        this.loadData();
      })
    }).catch(error => {
      console.log("updateFamilyInfo", error);
      this.setState({isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN')});
    })
  }

  updateEducationInfo = (educationinfo) => {
    const params = {
      employeeId: this.state.userInfo.ID,
      schoolId: this.state.userInfo.SchoolID,
      no: educationinfo.Id,
      educationInstitution: educationinfo.institution,
      graduateStartDate: educationinfo.studyYear,
      graduateEndDate: educationinfo.graduationYear,
      education: educationinfo.educationLevelId,
      major: educationinfo.major,
      minor: educationinfo.minor,
    };

    console.log("updateEducationInfo", params);

    const promise = ApiManager.updateEmployeeEducation(params);
    this.setState({isLoading: true});
    promise.then(result => {
      this.setState({tempAddEducationInfo: {}, showAddEducationInfoModal: false, isLoading: false}, () => {
        this.loadData();
      });
    }).catch(error => {
      console.log("updateEducationInfo", error);
      this.setState({isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN')});
    })
  }

  updateHornorInfo = (hornoinfo) => {
    const params = {
      employeeId: this.state.userInfo.ID,
      schoolId: this.state.userInfo.SchoolID,
      no: hornoinfo.Id,
      honorType: hornoinfo.honor,
      donatingAgency: hornoinfo.honorAgency,
      yearReceived: hornoinfo.honorYear,
    };

    console.log("updateHornorInfo", params);

    const promise = ApiManager.updateEmployeeHonor(params);
    this.setState({isLoading: true});
    promise.then(result => {
      this.setState({tempAddHonorInfo: {}, showAddHonorInfoModal: false, isLoading: false}, () => {
        this.loadData();
      });
    }).catch(error => {
      console.log("updateHornorInfo", error);
      this.setState({isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN')});
    })
  }

  updateTrainingInfo = (traininginfo) => {
    const params = {
      employeeId: this.state.userInfo.ID,
      schoolId: this.state.userInfo.SchoolID,
      no: traininginfo.Id,
      type: traininginfo.trainingTypeId,
      project: traininginfo.projectName,
      trainingCourseName: traininginfo.trainingName,
      trainingStartDate: moment(traininginfo.trainingStartDate).format('YYYY-MM-DD') + "T00:00:00",
      trainingEndDate: moment(traininginfo.trainingEndDate).format('YYYY-MM-DD') + "T00:00:00",
      numberHours: traininginfo.trainingHours,
      location: traininginfo.trainingPlace,
      country: traininginfo.trainingCountry,
      province: traininginfo.trainingProvince,
      expenses: traininginfo.expenses,
    };
    console.log("updateTrainingInfo", params);

    const promise = ApiManager.updateEmployeeTraining(params);
    this.setState({isLoading: true});
    promise.then(result => {
      this.setState({tempAddTrainingInfo: {}, showAddTrainingInfoModal: false, isLoading: false}, () => {
        this.loadData();
      });
    }).catch(error => {
      console.log("updateTrainingInfo", error);
      this.setState({isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN')});
    })
  }

  updateOccupationalInfo = (occupationalinfo) => {
    const params = {
      employeeId: this.state.userInfo.ID,
      schoolId: this.state.userInfo.SchoolID,
      no: occupationalinfo.Id,
      professionalLicenseType: occupationalinfo.licenseTypeId,
      professionalLicenseNumber: occupationalinfo.licenseNo,
      trainingCourseName: occupationalinfo.trainingName,
      professionalLicenseName: occupationalinfo.licenseName,
      certificateIssueDate: moment(occupationalinfo.licenseIssuedDate).format('YYYY-MM-DD') + "T00:00:00",
      certificateExpireDate: moment(occupationalinfo.licenseExpireDate).format('YYYY-MM-DD') + "T00:00:00",
      organizationIssuingCertificate: occupationalinfo.licenseAgencyIssued,
    };
    console.log("updateOccupationalInfo", params);

    const promise = ApiManager.updateEmployeeOccupational(params);
    this.setState({isLoading: true});
    promise.then(result => {
      this.setState({tempAddLicenseInfo: {}, showAddLicenseInfoModal: false, isLoading: false}, () => {
        this.loadData();
      });
    }).catch(error => {
      console.log("updateOccupationalInfo", error);
      this.setState({isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN')});
    })
  }

  updateDecorationInfo = (decorationinfo) => {
    const params = {
      employeeId: this.state.userInfo.ID,
      schoolId: this.state.userInfo.SchoolID,
      no: decorationinfo.Id,
      yearReceived: decorationinfo.insigniaYear,
      royalDecorationClass: decorationinfo.insigniaGrade,
      position: decorationinfo.insigniaPosition,
      royalGovernmentVolumeNo: decorationinfo.insigniaBookNumber,
      royalGovernmentPart: decorationinfo.insigniaPart,
      royalGovernmentNo: decorationinfo.insigniaNumber,
      dated: moment(decorationinfo.insigniaRecordDate).format('YYYY-MM-DD') + "T00:00:00",
    };

    console.log("updateDecorationInfo", params);

    const promise = ApiManager.updateEmployeeDecoration(params);
    this.setState({isLoading: true});
    promise.then(result => {
      this.setState({tempAddInsignInfo: {}, showAddInsignInfoModal: false, isLoading: false}, () => {
        this.loadData();
      });
    }).catch(error => {
      console.log("updateDecorationInfo", error);
      this.setState({isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN')});
    })
  }

  toHistory = () => {
    this.props.navigation.navigate('EditingHistory', {'parent': 'ProfileTeacher'});
  }

  render() {
    const {dataEmployee, tempAddFamilyInfo, tempAddEducationInfo, tempAddHonorInfo, tempAddTrainingInfo, tempAddLicenseInfo, tempAddInsignInfo} = this.state;

    const user = this.state.userInfo;
    let schoolImage = Images.school;
    let profileImage = Images.teacher_02;
    let logo = Images.n_img_card_logo;
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
    }
    const options = [
      {title: translang.t('BASIC_INFORMATION')},
      {title: translang.t('EDUCATIONAL_INFORMATION')},
      {title: translang.t('JOB_POSITION_INFORMATION') + translang.t('TEACHING_INFORMATION')},
      {title: translang.t('OCCUPATIONAL_LICENSE')},
    ];
    let firstname = "";
    let lastname = "";
    if (dataEmployee.fullname != null && dataEmployee.fullname != '') {
      const nameArray = dataEmployee.fullname.split(' ');
      if (nameArray.length > 0) {
        firstname = nameArray[0];
      }
      if (nameArray.length > 1) {
        lastname = nameArray[nameArray.length - 1];
      }
    }

    let birthday = "";
    if (moment(dataEmployee.birthday).format('MM/DD/YYYY') != 'Invalid date') {
      birthday = moment(dataEmployee.birthday).format('DD/MM/YYYY')
    }

    let workInEducationDate = "";
    let governmentOrderDate = "";
    let workStartDate = "";
    let retirementDate = "";

    if (moment(dataEmployee.workInEducationDate).format('MM/DD/YYYY') != 'Invalid date') {
      workInEducationDate = moment(dataEmployee.workInEducationDate).format('DD/MM/YYYY')
    }
    if (moment(dataEmployee.governmentOrderDate).format('MM/DD/YYYY') != 'Invalid date') {
      governmentOrderDate = moment(dataEmployee.governmentOrderDate).format('DD/MM/YYYY')
    }
    if (moment(dataEmployee.workStartDate).format('MM/DD/YYYY') != 'Invalid date') {
      workStartDate = moment(dataEmployee.workStartDate).format('DD/MM/YYYY')
    }
    if (moment(dataEmployee.retirementDate).format('MM/DD/YYYY') != 'Invalid date') {
      retirementDate = moment(dataEmployee.retirementDate).format('DD/MM/YYYY')
    }


    const nameTitleList = this.state.nameTitleList.map(item => {
      return {value: item.titleId, id: item.titleId, title: item.title, label: item.title};
    });
    const nationalList = this.state.nationalList.map(item => {
      return {value: item.nationId, id: item.nationId, title: item.nation, label: item.nation};
    });
    const raceList = this.state.raceList.map(item => {
      return {value: item.raceId, id: item.raceId, title: item.race, label: item.race};
    });
    const religionList = this.state.religionList.map(item => {
      return {value: item.religionId, id: item.religionId, title: item.religion, label: item.religion};
    });
    const statusList = this.state.statusList.map(item => {
      return {value: item.key, id: item.key, title: item.value, label: item.value};
    });
    const provinceList = this.state.provinceList.map(item => {
      if (getCurrentLocale() == 'en') {
        return {value: item.provinceId, id: item.provinceId, title: item.provinceEn, label: item.provinceEn};
      } else {
        return {value: item.provinceId, id: item.provinceId, title: item.provinceTh, label: item.provinceTh};
      }
    });
    const districtList = this.state.districtList.map(item => {
      if (getCurrentLocale() == 'en') {
        return {value: item.districtId, id: item.districtId, title: item.districtEn, label: item.districtEn};
      } else {
        return {value: item.districtId, id: item.districtId, title: item.districtTh, label: item.districtTh};
      }
    });
    const subdistrictList = this.state.subdistrictList.map(item => {
      if (getCurrentLocale() == 'en') {
        return {
          value: item.subDistrictId,
          id: item.subDistrictId,
          title: item.subDistrictEn,
          label: item.subDistrictEn
        };
      } else {
        return {
          value: item.subDistrictId,
          id: item.subDistrictId,
          title: item.subDistrictTh,
          label: item.subDistrictTh
        };
      }
    });
    const educationList = this.state.educationList.map(item => {
      return {value: item.key, id: item.key, title: item.value, label: item.value};
    });
    const trainingTypeList = this.state.trainingTypeList.map(item => {
      return {value: item.key, id: item.key, title: item.value, label: item.value};
    });
    const licenseTypeList = this.state.licenseTypeList.map(item => {
      return {value: item.key, id: item.key, title: item.value, label: item.value};
    });

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
            textSize={13}
          />

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
                    title={translang.t('PROFILE_EMPLOYEE_ID')}
                    value_txt={user.StaffID ?? '-'}
                    titleFontSize={11}
                    infoFontSize={12}/>

                  <CardInfoItem
                    title={translang.t('PROFILE_firstname')}
                    value_txt={firstname ?? '-'}
                    titleFontSize={11}
                    infoFontSize={12}/>

                  <CardInfoItem
                    title={translang.t('PROFILE_lastname')}
                    value_txt={lastname ?? '-'}
                    titleFontSize={11}
                    infoFontSize={12}/>

                  <CardInfoItem
                    title={translang.t('PROFILE_department')}
                    value_txt={dataEmployee.department ?? '-'}
                    titleFontSize={11}
                    infoFontSize={12}/>

                  <CardInfoItem
                    title={translang.t('PROFILE_position')}
                    value_txt={dataEmployee.jobPosition ?? ''}
                    titleFontSize={11}
                    infoFontSize={12}/>
                </View>
              </View>
            </TouchableOpacity>
          </ImageBackground>

          <View style={{marginTop: 20,}}>
            {this.state.profileType == '0' && <>
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
                    this.setState({isEditProfile: true})
                  }}
                />}
              </View>
              {!this.state.isEditProfile &&
              <View style={styles.partContainer}>
                <InfoTextItem
                  label={translang.t('PERSONAL_TYPE')}
                  value_txt={dataEmployee.employeeType ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_EMPLOYEE_ID')}
                  value_txt={dataEmployee.employeeCode ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_position')}
                  value_txt={dataEmployee.jobPosition ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_department')}
                  value_txt={dataEmployee.department ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_gender')}
                  value_txt={dataEmployee.sex ?? ''}/>
                <InfoTextItem
                  label={translang.t('NAME_TITLES')}
                  value_txt={dataEmployee.nameTitle ?? ''}/>
                <InfoTextItem
                  label={translang.t('USERINFO_name')}
                  value_txt={dataEmployee.firstName ?? ''}/>
                <InfoTextItem
                  label={translang.t('USERINFO_surname')}
                  value_txt={dataEmployee.lastName ?? ''}/>
                <InfoTextItem
                  label={translang.t('USERINFO_name_en')}
                  value_txt={dataEmployee.firstNameEn ?? ''}/>
                <InfoTextItem
                  label={translang.t('USERINFO_surname_en')}
                  value_txt={dataEmployee.lastNameEn ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_idcard')}
                  value_txt={dataEmployee.idCardNumber ?? ''}/>
                <InfoTextItem
                  label={translang.t('PASSPORT_NUMBER')}
                  value_txt={dataEmployee.passportNumber ?? ''}/>
                <InfoTextItem
                  label={translang.t('PASSPORT_COUNTRY')}
                  value_txt={dataEmployee.passportCountry ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_birthday')}
                  value_txt={birthday}/>
                <View style={{flexDirection: 'row'}}>
                  <View style={{flex: 1}}>
                    <InfoTextItem
                      label={translang.t('USERINFO_bloodtype')}
                      value_txt={dataEmployee.bloodType ?? ''}/>
                  </View>
                  <View style={{flex: 1}}>
                    <InfoTextItem
                      label={translang.t('PROFILE_Nationality')}
                      value_txt={dataEmployee.nationality ?? ""}/>
                  </View>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <View style={{flex: 1}}>
                    <InfoTextItem
                      label={translang.t('RACE')}
                      value_txt={dataEmployee.race ?? ''}/>
                  </View>
                  <View style={{flex: 1}}>
                    <InfoTextItem
                      label={translang.t('PROFILE_Religion')}
                      value_txt={dataEmployee.religion ?? ''}/>
                  </View>
                </View>
                <InfoTextItem
                  label={translang.t('MARITAL_TYPE')}
                  value_txt={dataEmployee.personalStatus ?? ''}/>
                <InfoTextItem
                  label={translang.t('SPOUSE_NAME')}
                  value_txt={dataEmployee.spouseFirstName}/>
                <InfoTextItem
                  label={translang.t('SPOUSE_SURNAME')}
                  value_txt={dataEmployee.spouseLastName}/>
                <InfoTextItem
                  label={translang.t('PROFILE_phonenumber')}
                  value_txt={dataEmployee.phoneNumber ?? '_'}/>
                <InfoTextItem
                  label={translang.t('PROFILE_email')}
                  value_txt={dataEmployee.email ?? '_'}/>
              </View>}
              {this.state.isEditProfile &&
              <View style={styles.partEditContainer}>
                <InfoTextInputItem
                  disable={true}
                  label={translang.t('PERSONAL_TYPE')}
                  value_txt={dataEmployee.employeeType ?? ''}/>
                <InfoTextInputItem
                  disable={true}
                  label={translang.t('PROFILE_EMPLOYEE_ID')}
                  value_txt={dataEmployee.employeeCode ?? ''}/>
                <InfoTextInputItem
                  disable={true}
                  label={translang.t('PROFILE_position')}
                  value_txt={dataEmployee.jobPosition ?? ''}/>
                <InfoTextInputItem
                  disable={true}
                  label={translang.t('PROFILE_department')}
                  value_txt={dataEmployee.department ?? ''}/>
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
                  value_txt={dataEmployee.sex ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditProfilenameTitle",
                      selItemSelectedIndex: 0,
                      selItemShowList: nameTitleList
                    })
                  }}
                  placeHolder={translang.t('SELECT_NAMETITLES')}
                  label={translang.t('NAME_TITLES')}
                  value_txt={dataEmployee.nameTitle ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataEmployee.firstName = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  placeHolder={translang.t('USERINFO_name')}
                  label={translang.t('USERINFO_name')}
                  value_txt={dataEmployee.firstName}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataEmployee.lastName = key
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  placeHolder={translang.t('USERINFO_surname')}
                  label={translang.t('USERINFO_surname')}
                  value_txt={dataEmployee.lastName}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataEmployee.firstNameEn = key
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  placeHolder={translang.t('USERINFO_name_en')}
                  label={translang.t('USERINFO_name_en')}
                  value_txt={dataEmployee.firstNameEn ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataEmployee.lastNameEn = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  placeHolder={translang.t('USERINFO_surname_en')}
                  label={translang.t('USERINFO_surname_en')}
                  value_txt={dataEmployee.lastNameEn ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataEmployee.idCardNumber = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  placeHolder={translang.t('PROFILE_idcard')}
                  label={translang.t('PROFILE_idcard')}
                  value_txt={dataEmployee.idCardNumber ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataEmployee.passportNumber = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  placeHolder={translang.t('PASSPORT_NUMBER')}
                  label={translang.t('PASSPORT_NUMBER')}
                  value_txt={dataEmployee.passportNumber ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataEmployee.passportCountry = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  placeHolder={translang.t('PASSPORT_COUNTRY')}
                  label={translang.t('PASSPORT_COUNTRY')}
                  value_txt={dataEmployee.passportCountry ?? ''}/>
                <TouchableOpacity onPress={() => {
                  this.setState({showDatePicker: true, selCalendarType: "ProfileBirthday"});
                }}>
                  <InfoTextInputItem
                    disable={false}
                    canSelect={false}
                    placeHolder={translang.t('DDMMYYYY')}
                    label={translang.t('PROFILE_birthday')}
                    notouch={true}
                    value_txt={birthday}/>
                </TouchableOpacity>

                <View style={{flexDirection: 'row'}}>
                  <View style={{flex: 1, paddingleft: 10, paddingRight: 10}}>
                    <InfoTextInputItem
                      disable={false}
                      canSelect={true}
                      onClickInput={() => {
                        this.setState({
                          selItemShowable: true,
                          selItemSelTypeStr: "EditProfilebloodtype",
                          selItemSelectedIndex: 0,
                          selItemShowList: this.state.bloodtypeList
                        })
                      }}
                      placeHolder={translang.t('USERINFO_bloodtype')}
                      label={translang.t('USERINFO_bloodtype')}
                      value_txt={dataEmployee.bloodType ?? ''}/>
                  </View>

                  <View style={{flex: 1, paddingleft: 10}}>
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
                      placeHolder={translang.t('PROFILE_Nationality')}
                      label={translang.t('PROFILE_Nationality')}
                      value_txt={dataEmployee.nationality ?? ""}/>
                  </View>
                </View>

                <View style={{flexDirection: 'row'}}>
                  <View style={{flex: 1, paddingleft: 10, paddingRight: 10}}>
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
                      placeHolder={translang.t('RACE')}
                      label={translang.t('RACE')}
                      value_txt={dataEmployee.race ?? ''}/>
                  </View>

                  <View style={{flex: 1, paddingleft: 10}}>
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
                      placeHolder={translang.t('PROFILE_Religion')}
                      label={translang.t('PROFILE_Religion')}
                      value_txt={dataEmployee.religion ?? ''}/>
                  </View>
                </View>

                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditProfilepersonalStatus",
                      selItemSelectedIndex: 0,
                      selItemShowList: statusList
                    })
                  }}
                  placeHolder={translang.t('MARITAL_TYPE')}
                  label={translang.t('MARITAL_TYPE')}
                  value_txt={dataEmployee.personalStatus ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataEmployee.spouseFirstName = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  placeHolder={translang.t('SPOUSE_NAME')}
                  label={translang.t('SPOUSE_NAME')}
                  value_txt={dataEmployee.spouseFirstName}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataEmployee.spouseLastName = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  placeHolder={translang.t('SPOUSE_SURNAME')}
                  label={translang.t('SPOUSE_SURNAME')}
                  value_txt={dataEmployee.spouseLastName}/>

                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataEmployee.phoneNumber = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  placeHolder={translang.t('PROFILE_phonenumber')}
                  label={translang.t('PROFILE_phonenumber')}
                  value_txt={dataEmployee.phoneNumber ?? ''}/>

                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataEmployee.email = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  placeHolder={translang.t('PROFILE_email')}
                  label={translang.t('PROFILE_email')}
                  value_txt={dataEmployee.email ?? ''}/>

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
                      this.updateProfile()
                    }}
                  />
                </View>
              </View>}

              <View style={styles.partTitleContainer}>
                <Text style={styles.partTitleText}>{translang.t('PERMANENT_ADDRESS')}</Text>
                {!this.state.isEditHouseInfo && this.state.editEnable &&
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
                    this.setState({isEditHouseInfo: true})
                  }}
                />}
              </View>
              {!this.state.isEditHouseInfo &&
              <View style={styles.partContainer}>
                <InfoTextItem
                  label={translang.t('LEAVE_houseno')}
                  value_txt={dataEmployee.houseNo ?? ''}/>
                <InfoTextItem
                  label={translang.t('MOO')}
                  value_txt={dataEmployee.villageNo ?? ''}/>
                <InfoTextItem
                  label={translang.t('VILAGE')}
                  value_txt={dataEmployee.village ?? ''}/>
                <InfoTextItem
                  label={translang.t('SOI')}
                  value_txt={dataEmployee.lane ?? ''}/>
                <InfoTextItem
                  label={translang.t('BUILDING_FLOOR')}
                  value_txt={dataEmployee.building ?? ''}/>
                <InfoTextItem
                  label={translang.t('ADDR_ROAD')}
                  value_txt={dataEmployee.road ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_PROVINCE')}
                  value_txt={dataEmployee.province ?? ''}/>
                <InfoTextItem
                  label={translang.t('DISTRICT')}
                  value_txt={dataEmployee.district ?? ''}/>
                <InfoTextItem
                  label={translang.t('SUB_DISTRICT')}
                  value_txt={dataEmployee.subDistrict ?? ''}/>
                <InfoTextItem
                  label={translang.t('POSTAL_CODE')}
                  value_txt={dataEmployee.postalCode ?? ''}/>
              </View>}
              {this.state.isEditHouseInfo &&
              <View style={styles.partEditContainer}>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataEmployee.houseNo = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  placeHolder={translang.t('LEAVE_houseno')}
                  label={translang.t('LEAVE_houseno')}
                  value_txt={dataEmployee.houseNo ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataEmployee.villageNo = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  placeHolder={translang.t('MOO')}
                  label={translang.t('MOO')}
                  value_txt={dataEmployee.villageNo ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataEmployee.village = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  placeHolder={translang.t('VILAGE')}
                  label={translang.t('VILAGE')}
                  value_txt={dataEmployee.village ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataEmployee.lane = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  placeHolder={translang.t('SOI')}
                  label={translang.t('SOI')}
                  value_txt={dataEmployee.lane ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataEmployee.building = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  placeHolder={translang.t('BUILDING_FLOOR')}
                  label={translang.t('BUILDING_FLOOR')}
                  value_txt={dataEmployee.building ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataEmployee.road = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  placeHolder={translang.t('ADDR_ROAD')}
                  label={translang.t('ADDR_ROAD')}
                  value_txt={dataEmployee.road ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditProfileprovince",
                      selItemSelectedIndex: 0,
                      selItemShowList: provinceList
                    })
                  }}
                  placeHolder={translang.t('PROFILE_PROVINCE')}
                  label={translang.t('PROFILE_PROVINCE')}
                  value_txt={dataEmployee.province ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditProfiledistrict",
                      selItemSelectedIndex: 0,
                      selItemShowList: districtList
                    })
                  }}
                  placeHolder={translang.t('DISTRICT')}
                  label={translang.t('DISTRICT')}
                  value_txt={dataEmployee.district ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditProfilesubdistrictList",
                      selItemSelectedIndex: 0,
                      selItemShowList: subdistrictList
                    })
                  }}
                  placeHolder={translang.t('SUB_DISTRICT')}
                  label={translang.t('SUB_DISTRICT')}
                  value_txt={dataEmployee.subDistrict ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataEmployee.postalCode = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  placeHolder={translang.t('POSTAL_CODE')}
                  label={translang.t('POSTAL_CODE')}
                  value_txt={dataEmployee.postalCode ?? ''}/>

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
                      this.setState({isEditHouseInfo: false}, () => {
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
                    this.setState({isEditContactAddress: true})
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
                  value_txt={dataEmployee.c_houseNo ?? ''}/>
                <InfoTextItem
                  label={translang.t('MOO')}
                  value_txt={dataEmployee.c_villageNo ?? ''}/>
                <InfoTextItem
                  label={translang.t('VILAGE')}
                  value_txt={dataEmployee.c_village ?? ''}/>
                <InfoTextItem
                  label={translang.t('SOI')}
                  value_txt={dataEmployee.c_lane ?? ''}/>
                <InfoTextItem
                  label={translang.t('BUILDING_FLOOR')}
                  value_txt={dataEmployee.c_building ?? ''}/>
                <InfoTextItem
                  label={translang.t('ADDR_ROAD')}
                  value_txt={dataEmployee.c_road ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_PROVINCE')}
                  value_txt={dataEmployee.c_province ?? ''}/>
                <InfoTextItem
                  label={translang.t('DISTRICT')}
                  value_txt={dataEmployee.c_district ?? ''}/>
                <InfoTextItem
                  label={translang.t('SUB_DISTRICT')}
                  value_txt={dataEmployee.c_subDistrict ?? ''}/>
                <InfoTextItem
                  label={translang.t('POSTAL_CODE')}
                  value_txt={dataEmployee.c_postalCode ?? ''}/>
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
                    dataEmployee.c_houseNo = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  placeHolder={translang.t('LEAVE_houseno')}
                  label={translang.t('LEAVE_houseno')}
                  value_txt={dataEmployee.c_houseNo ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataEmployee.c_villageNo = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  placeHolder={translang.t('MOO')}
                  label={translang.t('MOO')}
                  value_txt={dataEmployee.c_villageNo ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataEmployee.c_village = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  placeHolder={translang.t('VILAGE')}
                  label={translang.t('VILAGE')}
                  value_txt={dataEmployee.c_village ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataEmployee.c_lane = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  placeHolder={translang.t('SOI')}
                  label={translang.t('SOI')}
                  value_txt={dataEmployee.c_lane ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataEmployee.c_building = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  placeHolder={translang.t('BUILDING_FLOOR')}
                  label={translang.t('BUILDING_FLOOR')}
                  value_txt={dataEmployee.c_building ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataEmployee.c_road = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  placeHolder={translang.t('ADDR_ROAD')}
                  label={translang.t('ADDR_ROAD')}
                  value_txt={dataEmployee.c_road ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditProfileCprovince",
                      selItemSelectedIndex: 0,
                      selItemShowList: provinceList
                    })
                  }}
                  placeHolder={translang.t('PROFILE_PROVINCE')}
                  label={translang.t('PROFILE_PROVINCE')}
                  value_txt={dataEmployee.c_province ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditProfileCdistrict",
                      selItemSelectedIndex: 0,
                      selItemShowList: districtList
                    })
                  }}
                  placeHolder={translang.t('DISTRICT')}
                  label={translang.t('DISTRICT')}
                  value_txt={dataEmployee.c_district ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={true}
                  onClickInput={() => {
                    this.setState({
                      selItemShowable: true,
                      selItemSelTypeStr: "EditProfileCsubDistrict",
                      selItemSelectedIndex: 0,
                      selItemShowList: subdistrictList
                    })
                  }}
                  placeHolder={translang.t('SUB_DISTRICT')}
                  label={translang.t('SUB_DISTRICT')}
                  value_txt={dataEmployee.c_subDistrict ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    dataEmployee.c_postalCode = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  placeHolder={translang.t('POSTAL_CODE')}
                  label={translang.t('POSTAL_CODE')}
                  value_txt={dataEmployee.c_postalCode ?? ''}/>

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

              <View style={styles.partTitleContainer}>
                <Text style={styles.partTitleText}>{translang.t('FAMILY_INFORMATION')}</Text>
                {this.state.editEnable &&
                <GradientButtonWithImg
                  label={translang.t('ADD')}
                  iconImage={Images.n_ic_plus_white}
                  containerStyle={{width: 70, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0}}
                  buttonStyle={{borderRadius: 5, height: 25}}
                  textStyle={{fontSize: 20, fontWeight: 'bold'}}
                  iconStyle={{width: 10, height: 10}}
                  colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                  isVerticalGradient={false}
                  _onPress={() => {
                    this.setState({showAddFamilyFormModal: true})
                  }}
                />
                }

              </View>
              <FlatList
                style={styles.menuContainer}
                data={dataEmployee.familyInfo}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => this.renderFamilyInfoItem(index)}
                scrollEnabled={false}
              />
            </>}
            {this.state.profileType == '1' && <>
              <View style={styles.partTitleContainer}>
                <Text style={styles.partTitleText}>{translang.t('PROFILE_educationinfo')}</Text>
                {this.state.editEnable &&
                <GradientButtonWithImg
                  label={translang.t('ADD')}
                  iconImage={Images.n_ic_plus_white}
                  containerStyle={{width: 70, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0}}
                  buttonStyle={{borderRadius: 5, height: 25}}
                  textStyle={{fontSize: 20, fontWeight: 'bold'}}
                  iconStyle={{width: 10, height: 10}}
                  colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                  isVerticalGradient={false}
                  _onPress={() => {
                    this.setState({showAddEducationInfoModal: true})
                  }}
                />
                }
              </View>
              <FlatList
                style={styles.menuContainer}
                data={dataEmployee.employeeEducationInfos}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => this.renderEducationInfoItem(index)}
                scrollEnabled={false}/>

              <View style={styles.partTitleContainer}>
                <Text style={styles.partTitleText}>{translang.t('PROFILE_HONOR_INFORMATION')}</Text>
                {this.state.editEnable &&
                <GradientButtonWithImg
                  label={translang.t('ADD')}
                  iconImage={Images.n_ic_plus_white}
                  containerStyle={{width: 70, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0}}
                  buttonStyle={{borderRadius: 5, height: 25}}
                  textStyle={{fontSize: 20, fontWeight: 'bold'}}
                  iconStyle={{width: 10, height: 10}}
                  colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                  isVerticalGradient={false}
                  _onPress={() => {
                    this.setState({showAddHonorInfoModal: true})
                  }}
                />
                }
              </View>
              <FlatList
                style={styles.menuContainer}
                data={dataEmployee.employeeHonorInfos}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => this.renderHonorInfoItem(index)}
                scrollEnabled={false}/>

              <View style={styles.partTitleContainer}>
                <Text style={styles.partTitleText}>{translang.t('TRAINING_EDUCATION_VISITING_INFORMATION')}</Text>
                {this.state.editEnable &&
                <GradientButtonWithImg
                  label={translang.t('ADD')}
                  iconImage={Images.n_ic_plus_white}
                  containerStyle={{width: 70, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0}}
                  buttonStyle={{borderRadius: 5, height: 25}}
                  textStyle={{fontSize: 20, fontWeight: 'bold'}}
                  iconStyle={{width: 10, height: 10}}
                  colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                  isVerticalGradient={false}
                  _onPress={() => {
                    this.setState({showAddTrainingInfoModal: true})
                  }}
                />
                }
              </View>
              <FlatList
                style={styles.menuContainer}
                data={dataEmployee.employeeTrainingInfos}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => this.renderTrainingInfoItem(index)}
                scrollEnabled={false}/>
            </>}
            {this.state.profileType == '2' && <>
              <View style={styles.partTitleContainer}>
                <Text style={styles.partTitleText}>{translang.t('JOB_POSITION_INFORMATION')}</Text>
              </View>

              <View style={styles.partContainer}>
                <InfoTextItem
                  label={translang.t('PROFILE_WORKING_STATUS')}
                  value_txt={dataEmployee.workStatus ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_LEVEL_GOVERNMENT')}
                  value_txt={dataEmployee.degree ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_DATE_OF_WORK_IN')}
                  value_txt={workInEducationDate}/>
                <InfoTextItem
                  label={translang.t('PROFILE_PACKING_ORDER_DATE')}
                  value_txt={governmentOrderDate}/>
                <InfoTextItem
                  label={translang.t('PROFILE_OFFICIAL_START_DATE')}
                  value_txt={workStartDate}/>
                <InfoTextItem
                  label={translang.t('PROFILE_RETIREMENT_DATE')}
                  value_txt={retirementDate}/>
                <InfoTextItem
                  label={translang.t('PROFILE_REMAINING_SERVICE_LIFE')}
                  value_txt={dataEmployee.remainingRetirementDays ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_SALARY')}
                  value_txt={dataEmployee.salary ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_POSITION_ALLOWANCE')}
                  value_txt={dataEmployee.positionMoney ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_AMOUNT_ACADEMY_STANDING')}
                  value_txt={dataEmployee.academicStandingMoney ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_TOTAL_NET_INCOME')}
                  value_txt={dataEmployee.netSalary ?? ''}/>
              </View>
            </>}
            {this.state.profileType == '3' && <>
              <View style={styles.partTitleContainer}>
                <Text style={styles.partTitleText}>{translang.t('OCCUPATIONAL_LICENSE')}</Text>
                {this.state.editEnable &&
                <GradientButtonWithImg
                  label={translang.t('ADD')}
                  iconImage={Images.n_ic_plus_white}
                  containerStyle={{width: 70, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0}}
                  buttonStyle={{borderRadius: 5, height: 25}}
                  textStyle={{fontSize: 20, fontWeight: 'bold'}}
                  iconStyle={{width: 10, height: 10}}
                  colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                  isVerticalGradient={false}
                  _onPress={() => {
                    this.setState({showAddLicenseInfoModal: true})
                  }}
                />
                }
              </View>
              <FlatList
                style={styles.menuContainer}
                data={dataEmployee.EmployeeProfessionalLicenseInfos}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => this.renderLicenseInfoItem(index)}
                scrollEnabled={false}
              />

              <View style={styles.partTitleContainer}>
                <Text style={styles.partTitleText}>{translang.t('PROFILE_HISTORY_ROYAL_DECORATION')}</Text>
                {this.state.editEnable &&
                <GradientButtonWithImg
                  label={translang.t('ADD')}
                  iconImage={Images.n_ic_plus_white}
                  containerStyle={{width: 70, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0}}
                  buttonStyle={{borderRadius: 5, height: 25}}
                  textStyle={{fontSize: 20, fontWeight: 'bold'}}
                  iconStyle={{width: 10, height: 10}}
                  colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                  isVerticalGradient={false}
                  _onPress={() => {
                    this.setState({showAddInsignInfoModal: true})
                  }}
                />
                }
              </View>
              <FlatList
                style={styles.menuContainer}
                data={dataEmployee.EmployeeInsigniaInfos}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => this.renderInsignInfoItem(index)}
                scrollEnabled={false}
              />
            </>}
          </View>
        </ScrollView>

        {this.state.showAddFamilyFormModal &&
        <ScrollView style={styles.centeredView}>
          <View style={{...styles.dialogStyle}}>
            <View style={{...styles.partTitleContainer, marginHorizontal: 0}}>
              <Text style={styles.partTitleText}>{translang.t('FAMILY_INFORMATION_FORM')}</Text>
            </View>
            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                tempAddFamilyInfo.familyRelationship = key;
                this.setState({tempAddFamilyInfo: tempAddFamilyInfo});
              }}
              placeHolder={translang.t('PROFILE_RELATIONSHIP')}
              label={translang.t('PROFILE_RELATIONSHIP')}
              value_txt={tempAddFamilyInfo.familyRelationship ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect={true}
              onClickInput={() => {
                this.setState({
                  selItemShowable: true,
                  selItemSelTypeStr: "AddProfileFamilynameTitle",
                  selItemSelectedIndex: 0,
                  selItemShowList: nameTitleList
                })
              }}
              placeHolder={translang.t('SELECT_NAMETITLES')}
              label={translang.t('NAME_TITLES')}
              value_txt={tempAddFamilyInfo.title ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                tempAddFamilyInfo.name = key;
                this.setState({tempAddFamilyInfo: tempAddFamilyInfo});
              }}
              placeHolder={translang.t('USERINFO_name')}
              label={translang.t('USERINFO_name')}
              value_txt={tempAddFamilyInfo.name ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                tempAddFamilyInfo.surname = key
                this.setState({tempAddFamilyInfo: tempAddFamilyInfo});
              }}
              placeHolder={translang.t('USERINFO_surname')}
              label={translang.t('USERINFO_surname')}
              value_txt={tempAddFamilyInfo.surname ?? ''}/>
            <TouchableOpacity onPress={() => {
              this.setState({showDatePicker: true, selCalendarType: "AddFamily"});
            }}>
              <InfoTextInputItem
                disable={false}
                canSelect={false}
                placeHolder={translang.t('DDMMYYYY')}
                label={translang.t('PROFILE_birthday')}
                notouch={true}
                value_txt={moment(tempAddFamilyInfo.birthday).format('DD/MM/YYYY') ?? ''}/>
            </TouchableOpacity>

            <InfoTextInputItem
              disable={false}
              canSelect={true}
              onClickInput={() => {
                this.setState({
                  selItemShowable: true,
                  selItemSelTypeStr: "AddProfileFamilypersonalStatus",
                  selItemSelectedIndex: 0,
                  selItemShowList: statusList
                })
              }}
              placeHolder={translang.t('MARITAL_TYPE')}
              label={translang.t('MARITAL_TYPE')}
              value_txt={tempAddFamilyInfo.maritalStatus ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                tempAddFamilyInfo.livingStatus = key;
                this.setState({tempAddFamilyInfo: tempAddFamilyInfo});
              }}
              placeHolder={translang.t('LIVING_STATUS')}
              label={translang.t('LIVING_STATUS')}
              value_txt={tempAddFamilyInfo.livingStatus ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                tempAddFamilyInfo.deathStatus = key;
                this.setState({tempAddFamilyInfo: tempAddFamilyInfo});
              }}
              placeHolder={translang.t('DEATH_STATUS')}
              label={translang.t('DEATH_STATUS')}
              value_txt={tempAddFamilyInfo.deathStatus ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                tempAddFamilyInfo.familyOccupation = key;
                this.setState({tempAddFamilyInfo: tempAddFamilyInfo});
              }}
              placeHolder={translang.t('FAMILY_OCCUPATION')}
              label={translang.t('FAMILY_OCCUPATION')}
              value_txt={tempAddFamilyInfo.familyOccupation ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect={true}
              onClickInput={() => {
                this.setState({
                  selItemShowable: true,
                  selItemSelTypeStr: "AddProfileFamilyeducation",
                  selItemSelectedIndex: 0,
                  selItemShowList: educationList
                })
              }}
              selectList={educationList}
              onSelectItem={(item) => {
                tempAddFamilyInfo.educationId = item.id;
                tempAddFamilyInfo.education = item.title;
                this.setState({tempAddFamilyInfo: tempAddFamilyInfo});
              }}
              placeHolder={translang.t('PROFILE_TEACHER_EDUCATION')}
              label={translang.t('PROFILE_TEACHER_EDUCATION')}
              value_txt={tempAddFamilyInfo.education ?? ''}/>

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
                  this.setState({showAddFamilyFormModal: false})
                }}
              />
              <GradientButton
                label={translang.t('ADD')}
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
                  this.addFamilyInfo()
                }}
              />
            </View>
          </View>
        </ScrollView>}

        {this.state.showAddEducationInfoModal &&
        <ScrollView style={styles.centeredView}>
          <View style={{...styles.dialogStyle}}>
            <View style={{...styles.partTitleContainer, marginHorizontal: 0}}>
              <Text style={styles.partTitleText}>{translang.t('EDUCATION_INFORMATION_FORM')}</Text>
            </View>
            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                tempAddEducationInfo.institution = key;
                this.setState({tempAddEducationInfo: tempAddEducationInfo});
              }}
              placeHolder={translang.t('PROFILE_EDUCATION_INSTITUTION')}
              label={translang.t('PROFILE_EDUCATION_INSTITUTION')}
              value_txt={tempAddEducationInfo.institution ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                tempAddEducationInfo.studyYear = key;
                this.setState({tempAddEducationInfo: tempAddEducationInfo});
              }}
              placeHolder={translang.t('YYYY')}
              label={translang.t('GRADUATE_START_DATE')}
              value_txt={tempAddEducationInfo.studyYear ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                tempAddEducationInfo.graduationYear = key;
                this.setState({tempAddEducationInfo: tempAddEducationInfo});
              }}
              placeHolder={translang.t('YYYY')}
              label={translang.t('GRADUATE_END_DATE')}
              value_txt={tempAddEducationInfo.graduationYear ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect={true}
              onClickInput={() => {
                this.setState({
                  selItemShowable: true,
                  selItemSelTypeStr: "AddEducationInfoeducationLevel",
                  selItemSelectedIndex: 0,
                  selItemShowList: educationList
                })
              }}
              placeHolder={translang.t('PROFILE_TEACHER_EDUCATION')}
              label={translang.t('PROFILE_TEACHER_EDUCATION')}
              value_txt={tempAddEducationInfo.educationLevel ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                tempAddEducationInfo.major = key;
                this.setState({tempAddEducationInfo: tempAddEducationInfo});
              }}
              placeHolder={translang.t('MAJOR')}
              label={translang.t('MAJOR')}
              value_txt={tempAddEducationInfo.major ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                tempAddEducationInfo.minor = key;
                this.setState({tempAddEducationInfo: tempAddEducationInfo});
              }}
              placeHolder={translang.t('MINOR')}
              label={translang.t('MINOR')}
              value_txt={tempAddEducationInfo.minor ?? ''}/>

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
                  this.setState({showAddEducationInfoModal: false})
                }}
              />
              <GradientButton
                label={translang.t('ADD')}
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
                  this.addEducationInfo()
                }}
              />
            </View>
          </View>
        </ScrollView>}

        {this.state.showAddHonorInfoModal &&
        <ScrollView style={styles.centeredView}>
          <View style={{...styles.dialogStyle}}>
            <View style={{...styles.partTitleContainer, marginHorizontal: 0}}>
              <Text style={styles.partTitleText}>{translang.t('HONOR_INFORMATION_FORM')}</Text>
            </View>
            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                tempAddHonorInfo.honor = key;
                this.setState({tempAddHonorInfo: tempAddHonorInfo});
              }}
              placeHolder={translang.t('PROFILE_HONOR_TYPE')}
              label={translang.t('PROFILE_HONOR_TYPE')}
              value_txt={tempAddHonorInfo.honor ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                tempAddHonorInfo.honorAgency = key;
                this.setState({tempAddHonorInfo: tempAddHonorInfo});
              }}
              placeHolder={translang.t('PROFILE_DONATING_AGENCY')}
              label={translang.t('PROFILE_DONATING_AGENCY')}
              value_txt={tempAddHonorInfo.honorAgency ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                tempAddHonorInfo.honorYear = key;
                this.setState({tempAddHonorInfo: tempAddHonorInfo});
              }}
              placeHolder={translang.t('PROFILE_YEAR_RECEIVED')}
              label={translang.t('PROFILE_YEAR_RECEIVED')}
              value_txt={tempAddHonorInfo.honorYear ?? ''}/>


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
                  this.setState({showAddHonorInfoModal: false})
                }}
              />
              <GradientButton
                label={translang.t('ADD')}
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
                  this.addHonorInfo()
                }}
              />
            </View>
          </View>
        </ScrollView>}

        {this.state.showAddTrainingInfoModal &&
        <ScrollView style={styles.centeredView}>
          <View style={{...styles.dialogStyle}}>
            <View style={{...styles.partTitleContainer, marginHorizontal: 0}}>
              <Text style={styles.partTitleText}>{translang.t('TRAINING_EDUCATION_VISITING_INFORMATION_FORM')}</Text>
            </View>
            <InfoTextInputItem
              disable={false}
              canSelect={true}
              onClickInput={() => {
                this.setState({
                  selItemShowable: true,
                  selItemSelTypeStr: "AddTrainingtrainingType",
                  selItemSelectedIndex: 0,
                  selItemShowList: trainingTypeList
                })
              }}
              placeHolder={translang.t('PROFILE_TYPE')}
              label={translang.t('PROFILE_TYPE')}
              value_txt={tempAddTrainingInfo.trainingType ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                tempAddTrainingInfo.projectName = key;
                this.setState({tempAddTrainingInfo: tempAddTrainingInfo});
              }}
              placeHolder={translang.t('PROFILE_PROJECT')}
              label={translang.t('PROFILE_PROJECT')}
              value_txt={tempAddTrainingInfo.projectName ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                tempAddTrainingInfo.trainingName = key;
                this.setState({tempAddTrainingInfo: tempAddTrainingInfo});
              }}
              placeHolder={translang.t('PROFILE_TRAINING_COURSE_NAME')}
              label={translang.t('PROFILE_TRAINING_COURSE_NAME')}
              value_txt={tempAddTrainingInfo.trainingName ?? ''}/>

            <View style={{flexDirection: 'row'}}>
              <View style={{flex: 1, paddingleft: 10, paddingRight: 10}}>
                <TouchableOpacity onPress={() => {
                  this.setState({showDatePicker: true, selCalendarType: "AddStartTraining"});
                }}>
                  <InfoTextInputItem
                    disable={false}
                    canSelect={false}
                    placeHolder={translang.t('DDMMYYYY')}
                    label={translang.t('PROFILE_TRAINING_START_DATE')}
                    notouch={true}
                    value_txt={moment(tempAddTrainingInfo.trainingStartDate).format('DD/MM/YYYY') ?? ''}/>
                </TouchableOpacity>
              </View>

              <View style={{flex: 1, paddingleft: 10}}>
                <TouchableOpacity onPress={() => {
                  this.setState({showDatePicker: true, selCalendarType: "AddEndTraining"});
                }}>
                  <InfoTextInputItem
                    disable={false}
                    canSelect={false}
                    placeHolder={translang.t('DDMMYYYY')}
                    label={translang.t('PROFILE_TRAINING_END_DATE')}
                    notouch={true}
                    value_txt={moment(tempAddTrainingInfo.trainingEndDate).format('DD/MM/YYYY') ?? ''}/>
                </TouchableOpacity>
              </View>
            </View>

            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                tempAddTrainingInfo.trainingHours = key;
                this.setState({tempAddTrainingInfo: tempAddTrainingInfo});
              }}
              placeHolder={translang.t('PROFILE_NUMBER_OF_HOURS')}
              label={translang.t('PROFILE_NUMBER_OF_HOURS')}
              value_txt={tempAddTrainingInfo.trainingHours ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                tempAddTrainingInfo.trainingPlace = key;
                this.setState({tempAddTrainingInfo: tempAddTrainingInfo});
              }}
              placeHolder={translang.t('PROFILE_LOCATION')}
              label={translang.t('PROFILE_LOCATION')}
              value_txt={tempAddTrainingInfo.trainingPlace ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                tempAddTrainingInfo.trainingCountry = key;
                this.setState({tempAddTrainingInfo: tempAddTrainingInfo});
              }}
              placeHolder={translang.t('PROFILE_COUNTRY')}
              label={translang.t('PROFILE_COUNTRY')}
              value_txt={tempAddTrainingInfo.trainingCountry ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                tempAddTrainingInfo.trainingProvince = key;
                this.setState({tempAddTrainingInfo: tempAddTrainingInfo});
              }}
              placeHolder={translang.t('PROFILE_PROVINCE')}
              label={translang.t('PROFILE_PROVINCE')}
              value_txt={tempAddTrainingInfo.trainingProvince ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                tempAddTrainingInfo.expenses = key;
                this.setState({tempAddTrainingInfo: tempAddTrainingInfo});
              }}
              placeHolder={translang.t('PROFILE_EXPENSES')}
              label={translang.t('PROFILE_EXPENSES')}
              value_txt={tempAddTrainingInfo.expenses ?? ''}/>

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
                  this.setState({showAddTrainingInfoModal: false})
                }}
              />
              <GradientButton
                label={translang.t('ADD')}
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
                  this.addTrainingInfo()
                }}
              />
            </View>
          </View>
        </ScrollView>}

        {this.state.showAddLicenseInfoModal &&
        <ScrollView style={styles.centeredView}>
          <View style={{...styles.dialogStyle}}>
            <View style={{...styles.partTitleContainer, marginHorizontal: 0}}>
              <Text style={styles.partTitleText}>{translang.t('OCCUPATIONAL_LICENSE_FORM')}</Text>
            </View>
            <InfoTextInputItem
              disable={false}
              canSelect={true}
              onClickInput={() => {
                this.setState({
                  selItemShowable: true,
                  selItemSelTypeStr: "AddLicenselicenseType",
                  selItemSelectedIndex: 0,
                  selItemShowList: licenseTypeList
                })
              }}
              placeHolder={translang.t('PROFILE_PROFESSIONAL_LICENSE_TYPE')}
              label={translang.t('PROFILE_PROFESSIONAL_LICENSE_TYPE')}
              value_txt={tempAddLicenseInfo.licenseType ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                tempAddLicenseInfo.licenseNo = key;
                this.setState({tempAddLicenseInfo: tempAddLicenseInfo});
              }}
              placeHolder={translang.t('PROFILE_PROFESSIONAL_LICENSE_NUMBER')}
              label={translang.t('PROFILE_PROFESSIONAL_LICENSE_NUMBER')}
              value_txt={tempAddLicenseInfo.licenseNo ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                tempAddLicenseInfo.licenseName = key;
                this.setState({tempAddLicenseInfo: tempAddLicenseInfo});
              }}
              placeHolder={translang.t('PROFILE_PROFESSIONAL_LICENSE_NAME')}
              label={translang.t('PROFILE_PROFESSIONAL_LICENSE_NAME')}
              value_txt={tempAddLicenseInfo.licenseName ?? ''}/>

            <TouchableOpacity onPress={() => {
              this.setState({showDatePicker: true, selCalendarType: "AddLicenseIssueDate"});
            }}>
              <InfoTextInputItem
                disable={false}
                canSelect={false}
                onChangeText={(key) => {
                  tempAddLicenseInfo.licenseIssuedDate = key;
                  this.setState({tempAddLicenseInfo: tempAddLicenseInfo});
                }}
                notouch={true}
                placeHolder={translang.t('DDMMYYYY')}
                label={translang.t('PROFILE_DATE_ISSUE_ACCOMPANYING_CERTIFICATE')}
                value_txt={moment(tempAddLicenseInfo.licenseIssuedDate).format('DD/MM/YYYY') ?? ''}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              this.setState({showDatePicker: true, selCalendarType: "AddLicenseExpireDate"});
            }}>
              <InfoTextInputItem
                disable={false}
                canSelect={false}
                onChangeText={(key) => {
                  tempAddLicenseInfo.licenseExpireDate = key;
                  this.setState({tempAddLicenseInfo: tempAddLicenseInfo});
                }}
                notouch={true}
                placeHolder={translang.t('DDMMYYYY')}
                label={translang.t('PROFILE_CERTIFICATE_EXPIRATION_DATE')}
                value_txt={moment(tempAddLicenseInfo.licenseExpireDate).format('DD/MM/YYYY') ?? ''}/>
            </TouchableOpacity>


            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                tempAddLicenseInfo.licenseAgencyIssued = key;
                this.setState({tempAddLicenseInfo: tempAddLicenseInfo});
              }}
              placeHolder={translang.t('PROFILE_ORGANIZATION_ACCOMPANYING_CERTIFICATE')}
              label={translang.t('PROFILE_ORGANIZATION_ACCOMPANYING_CERTIFICATE')}
              value_txt={tempAddLicenseInfo.licenseAgencyIssued ?? ''}/>

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
                  this.setState({showAddLicenseInfoModal: false})
                }}
              />
              <GradientButton
                label={translang.t('ADD')}
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
                  this.addLicenseInfo()
                }}
              />
            </View>
          </View>
        </ScrollView>}

        {this.state.showAddInsignInfoModal &&
        <ScrollView style={styles.centeredView}>
          <View style={{...styles.dialogStyle}}>
            <View style={{...styles.partTitleContainer, marginHorizontal: 0}}>
              <Text style={styles.partTitleText}>{translang.t('PROFILE_HISTORY_ROYAL_DECORATION_FORM')}</Text>
            </View>

            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                tempAddInsignInfo.insigniaYear = key;
                this.setState({tempAddInsignInfo: tempAddInsignInfo});
              }}
              placeHolder={translang.t('YYYY')}
              label={translang.t('PROFILE_YEAR_RECEIVED')}
              value_txt={tempAddInsignInfo.insigniaYear ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                tempAddInsignInfo.insigniaGrade = key;
                this.setState({tempAddInsignInfo: tempAddInsignInfo});
              }}
              placeHolder={translang.t('PROFILE_ROYAL_DECORATION_CLASS')}
              label={translang.t('PROFILE_ROYAL_DECORATION_CLASS')}
              value_txt={tempAddInsignInfo.insigniaGrade ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                tempAddInsignInfo.insigniaPosition = key;
                this.setState({tempAddInsignInfo: tempAddInsignInfo});
              }}
              placeHolder={translang.t('USERINFO_position')}
              label={translang.t('USERINFO_position')}
              value_txt={tempAddInsignInfo.insigniaPosition ?? ''}/>

            <View style={{flexDirection: 'row'}}>
              <View style={{flex: 1, paddingleft: 10, paddingRight: 10}}>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    tempAddInsignInfo.insigniaBookNumber = key;
                    this.setState({tempAddInsignInfo: tempAddInsignInfo});
                  }}
                  placeHolder={translang.t('PROFILE_ROYAL_GOVERNMENT_VOLUME_NO')}
                  label={translang.t('PROFILE_ROYAL_GOVERNMENT_VOLUME_NO')}
                  value_txt={tempAddInsignInfo.insigniaBookNumber ?? ''}/>
              </View>

              <View style={{flex: 1, paddingleft: 10}}>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key) => {
                    tempAddInsignInfo.insigniaPart = key;
                    this.setState({tempAddInsignInfo: tempAddInsignInfo});
                  }}
                  placeHolder={translang.t('PROFILE_ROYAL_GOVERNMENT_PART')}
                  label={translang.t('PROFILE_ROYAL_GOVERNMENT_PART')}
                  value_txt={tempAddInsignInfo.insigniaPart ?? ''}/>
              </View>
            </View>

            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key) => {
                tempAddInsignInfo.insigniaNumber = key;
                this.setState({tempAddInsignInfo: tempAddInsignInfo});
              }}
              placeHolder={translang.t('PROFILE_ROYAL_GOVERNMENT_NO')}
              label={translang.t('PROFILE_ROYAL_GOVERNMENT_NO')}
              value_txt={tempAddInsignInfo.insigniaNumber ?? ''}/>

            <TouchableOpacity onPress={() => {
              this.setState({showDatePicker: true, selCalendarType: "AddInsignRecordDate"});
            }}>
              <InfoTextInputItem
                disable={false}
                canSelect={false}
                onChangeText={(key) => {
                  tempAddInsignInfo.insigniaRecordDate = key;
                  this.setState({tempAddInsignInfo: tempAddInsignInfo});
                }}
                notouch={true}
                placeHolder={translang.t('DDMMYYYY')}
                label={translang.t('PROFILE_DATED')}
                value_txt={moment(tempAddInsignInfo.insigniaRecordDate).format('DD/MM/YYYY') ?? ''}/>
            </TouchableOpacity>

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
                  this.setState({showAddInsignInfoModal: false})
                }}
              />
              <GradientButton
                label={translang.t('ADD')}
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
                  this.addInsignInfo()
                }}
              />
            </View>
          </View>
        </ScrollView>}

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

        <ProfileModal
          isVisible={this.state.showModal}
          onPositivePress={() => this.setState({showModal: false})}
          user={user}/>

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
    zIndex: 0,
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
    flex: 1,
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

  centeredView: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flex: 1,
    backgroundColor: '#00000070',
  },
  dialogStyle: {
    width: '85%',
    marginVertical: 50,
    marginLeft: 'auto',
    marginRight: 'auto',

    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    elevation: 5,
    backgroundColor: 'white',
  },

  dropdownPicker: {
    backgroundColor: Color.white,
    borderWidth: 0,
    borderBottomColor: Color.n_default_brown,
    borderBottomWidth: 1,
    paddingHorizontal: 0,
  },
  dropDown: {
    backgroundColor: Color.white,
    borderWidth: 1,
    borderColor: Color.n_default_brown,
    // backgroundColor: Color.n_default_gray_light,
    borderRadius: 5,
    marginTop: 3,
    padding: 0,
  },
});
