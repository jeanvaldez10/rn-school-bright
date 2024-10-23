import React from 'react';
import {useState, useEffect} from "react";
import { Image, View, TouchableOpacity, ImageBackground, Modal, FlatList} from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileModal from '../../components/ProfileModal';
import BackNavigationBar from '../../components/BackNavigationBar';
import Storage from '../../managers/StorageManager';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import moment from 'moment';

import CardInfoItem from '../../components/CardInfoItem';
import GradientButton from '../../components/GradientButton';
import CustomTextInput from '../../components/CustomTextInput';
import GradientButtonWithImg from '../../components/GradientButtonWithImg';

import LinearGradient from 'react-native-linear-gradient';
import ApiManager from '../../managers/ApiManager';
import ProgressHud from '../../components/ProgressHud';
import httpClient from '../../utils/httpClient';
import devHttpClient from '../../utils/devHttpClient';
import { apiUrls } from '../../constants/ApiUrls';

import CustomSwitcher from '../../components/CustomSwitcher';
import CustomCheckButton from '../../components/CustomCheckButton';
import DropDownPicker from 'react-native-dropdown-picker';
import CalendarModal from '../../components/CalendarModal';
import ProfileSelectModal from '../../components/ProfileSelectModal'

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
  const {disable, canSelect, selectList, label, value_txt, onClickInput,  onChangeText, onSelectItem, zIndex, placeHolder, containerStyle, notouch} = props;
  const [isOpen, setIsOpen] = useState(false)
  
  let titleCol = Color.n_default_orange;
  if(disable){
    titleCol = Color.n_default_gray;
  }

  const selectItem = (item) => {
    setIsOpen(false)
    onSelectItem(item)
  }

  const renderSelectItem = () => {
    var res = []
    if(selectList.length > 0){
      for(let i = 0; i < selectList.length; i++){
        let item = selectList[i];
        res.push(
          <TouchableOpacity style={{marginRight: 30}} onPressOut={() => selectItem(item)} key = {`value_text ${i}`}>
            <Text style={{...styles.bottomText, marginHorizontal: 10, marginVertical: 2}}>{item.title}</Text>
          </TouchableOpacity>);
      }
    }
    return res;
  }

  return (
    <View style={[styles.menuItem, containerStyle, {zIndex: zIndex}]} >
      <View style={{ flexDirection: 'column', flex: 1}}>
        <Text style={[styles.topText, {color: titleCol}]}> {label} </Text>
        {disable && <Text style={[styles.bottomText, {color: titleCol}]}> {value_txt?value_txt:placeHolder} </Text>}
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
          <View style={{ position: 'relative', height: 38, borderBottomColor: Color.n_default_brown, borderBottomWidth: 1, width: '100%', paddingHorizontal: 5}}>
            <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPressOut={() => {setIsOpen(!isOpen)}}>
              <Text style={{...styles.bottomText, flex: 1,  color: value_txt?Color.n_default_gray:Color.n_text_placeholder_gray}}>{value_txt?value_txt:placeHolder}</Text>
              <Image source={Images.n_carrot_down} style={{width: 10, height: 10, resizeMode: 'contain', marginLeft: 5}}/>
            </TouchableOpacity>
            {isOpen && 
              <ScrollView 
                style={{
                    position: 'absolute', 
                    top: '100%', 
                    right: 0, 
                    left: 0, 
                    marginTop: 3, 
                    borderColor: Color.n_default_brown, 
                    borderWidth: 1, 
                    backgroundColor: Color.n_default_gray_light, 
                    borderRadius: 5, 
                    maxHeight: 100}}>
                {renderSelectItem()}
              </ScrollView>
            }
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
            notouch = {notouch}
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

export default class ProfileTeacherMainNoTabScreen_TEMP_Dropdown extends React.Component {
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

      genderList: [{value: '0', label: translang.t('Male'), id: '0', title: translang.t('Male')}, {value: '1', label: translang.t('Female'), id: '1', title: translang.t('Female')}],
      nameTitleList: [],
      bloodtypeList: [{id: '0', title: "O", value: '0', label: "O"}, {id: '1', title: "A", value: '1', label: "A"}, {id: '3', title: "B", value: '3', label: "B"}, {id: '4', title: "AB", value: '4', label: "AB"}],
      nationalList: [],
      raceList: [],
      religionList: [],
      statusList: [],
      provinceList: [],
      districtList: [],
      subdistrictList: [],
      educationList: [],
      trainingTypeList: [],
      licenseTypeList:[],

      employeeTypeList: [],
      jobPositionList: [],
      departmentList: [],
      workingStatusList: [],
      insightYearList:[],

      selItemSelectedIndex: 0,
      selItemShowList: {},
      selItemSelTypeStr: "",
      selItemShowable: false,
    };
    this.focusListener = null;
  }
  

  async componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", () => {     
      const userInfo = this.props.navigation.getParam('userInfo');
      this.setState({userInfo: userInfo}, ()=>{
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
      this.setState({ user });
    }
  }
  
  componentWillUnmount = () => {
    this.focusListener.remove();
  };

  loadData = () => {
    this.setState({ isLoading: true });
    const {userInfo} = this.state;
    // ApiManager.getEmployeeInfo(userInfo.SchoolID, userInfo.ID).then(data => {
    ApiManager.getEmployeeInfo("307", "477536").then(res => {
      this.setState({dataEmployee: res.data, isLoading: false});
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });   
  };

  loadNameTitles = () => {
    httpClient.get(apiUrls.getNameTitleListUrl(this.state.userInfo.SchoolID))
    .then(response => response.data)
    .then(data => {
      this.setState({nameTitleList: data.data});
    })
    .catch((error) => {
      console.error("Get NameTitles", error);
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
  loadRace = () => {
    devHttpClient.get(apiUrls.getRaceUrl(this.state.userInfo.SchoolID))
    .then(response => response.data)
    .then(data => {
      this.setState({raceList: data.data});
    })
    .catch((error) => {
      console.error("Get Race", error);
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
  loadProvince = () => {
    devHttpClient.get(apiUrls.getProvinceListUrl())
    .then(response => response.data)
    .then(data => {
      this.setState({provinceList: data.data});
    })
    .catch((error) => {
      console.error("Get ProvinceList", error);
    });
  }
  loadDistrict = (provinceId) => {
    devHttpClient.get(apiUrls.getDistrictListUrl(provinceId))
    .then(response => response.data)
    .then(data => {
      this.setState({districtList: data.data});
    })
    .catch((error) => {
      console.error("Get DistrictList", error);
    });
  }
  loadSubDistrict = (provinceID, districtID) => {
    devHttpClient.get(apiUrls.getSubDistrictListUrl(provinceID, districtID))
    .then(response => response.data)
    .then(data => {
      this.setState({subdistrictList: data.data});
    })
    .catch((error) => {
      console.error("Get SubDistrictList", error);
    });
  }
  loadEducationLevel = () => {
    httpClient.get(apiUrls.getEducationLevelUrl())
    .then(response => response.data)
    .then(data => {
      this.setState({educationList: data.data});
    })
    .catch((error) => {
      console.error("Get EducationLevel", error);
    });
  }
  loadTrainingType = () => {
    httpClient.get(apiUrls.getEducationTypeUrl())
    .then(response => response.data)
    .then(data => {
      this.setState({trainingTypeList: data.data});
    })
    .catch((error) => {
      console.error("Get TrainingType", error);
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

    this.setState({isSelectPermanentAddr: !this.state.isSelectPermanentAddr}, ()=>{
      if (this.state.isSelectPermanentAddr){
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
      }else{
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

  addFamilyInfo = () =>{
    const {dataEmployee, tempAddFamilyInfo} = this.state;
    if(!dataEmployee.familyInfo){
      dataEmployee.familyInfo = [];
    }
    dataEmployee.familyInfo.push(tempAddFamilyInfo);
    this.setState({tempAddFamilyInfo: {}, dataEmployee: dataEmployee, showAddFamilyFormModal: false});
  }
  removeFamilyInfo = (index) => {
    const tempData = this.state.dataEmployee;
    tempData.familyInfo.splice(index, 1);
    this.setState({dataEmployee: tempData})
  }
  renderFamilyInfoItem = (index) => {
    const {dataEmployee, indexFamilyInfoEditSelected} = this.state;
    let isEdit = false
    if(index == indexFamilyInfoEditSelected){
      isEdit = true;
    }
    const item = dataEmployee.familyInfo[index];
    
    let firstname_add_family = "";
    let lastname_add_family = "";
    if(item.fullname != null && item.fullname != ''){
      const nameArray = item.fullname.split(' ');
      if (nameArray.length > 0) {
        firstname_add_family = nameArray[0];
      }
      if (nameArray.length > 1) {
        lastname_add_family = nameArray[nameArray.length - 1];
      }
    }

    const nameTitleList = this.state.nameTitleList.map( item => {
      return {value: item.titleId, id: item.titleId, title: item.title, label: item.title};
    });
    const statusList = this.state.statusList.map( item => {
      return {value: item.key, id: item.key, title: item.value, label: item.value};
    });
    const educationList = this.state.educationList.map( item => {
      return {value: item.key, id: item.key, title: item.value, label: item.value};
    });

    return (
      <View>
        <View style={styles.partSubTitleContainer}>
          <Text style={styles.partSubTitleText}>{`${translang.t('FAMILY_INFORMATION_FORM')} ${translang.t('NO')}. ${index + 1}`}</Text>
          {!isEdit && <View style={{flexDirection: 'row'}}>
          <GradientButtonWithImg
            noText = {true}
            iconImage={Images.n_ic_pencil_white}
            containerStyle={{ width: 25, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0}}
            buttonStyle={{ borderRadius: 13, height: 25}}
            iconStyle={{width: 10, height: 10}}
            colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
            isVerticalGradient={false}
            _onPress={() => {this.setState({indexFamilyInfoEditSelected: index})}} 
            />
          <GradientButtonWithImg
            noText = {true}
            iconImage={Images.n_ic_trash_white}
            containerStyle={{ width: 25, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0, marginLeft: 10}}
            buttonStyle={{ borderRadius: 13, height: 25}}
            iconStyle={{width: 10, height: 10}}
            colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
            isVerticalGradient={false}
            _onPress={() => {this.removeFamilyInfo(index)}} 
            />
        </View>}
        </View>
        {!isEdit &&
        <View style={styles.partContainer}>
          <InfoTextItem
            label={translang.t('NO')}
            value_txt={`${index + 1}`}/>
          <InfoTextItem
            label={translang.t('PROFILE_RELATIONSHIP')}
            value_txt={item.relationship ?? ''}/>
          <InfoTextItem
            label={translang.t('NAME_TITLES')}
            value_txt={item.nameTitle ?? ''}/>
          <InfoTextItem
            label={translang.t('USERINFO_name')}
            value_txt={firstname_add_family}/>
          <InfoTextItem
            label={translang.t('USERINFO_surname')}
            value_txt={lastname_add_family}/>
          <InfoTextItem
            label={translang.t('PROFILE_birthday')}
            value_txt={moment(item.birthday).format('DD/MM/YYYY') ?? ''}/>
          <InfoTextItem
            label={translang.t('MARITAL_TYPE')}
            value_txt={item.personalStatus ?? ''}/>
          <InfoTextItem
            label={translang.t('LIVING_STATUS')}
            value_txt={item.livingStatus ?? ''}/>
          <InfoTextItem
            label={translang.t('DEATH_STATUS')}
            value_txt={item.deathStatus ?? ''}/>
          <InfoTextItem
            label={translang.t('FAMILY_OCCUPATION')}
            value_txt={item.occupation ?? ''}/>
          <InfoTextItem
            label={translang.t('PROFILE_EDUCATION')}
            value_txt={item.education ?? ''}/>
        </View>}
        {isEdit &&
        <View style={styles.partEditContainer}>
          <InfoTextInputItem
            disable={true}
            label={translang.t('NO')}
            value_txt={`${index + 1}`}/>
          
          <InfoTextInputItem
            disable={false}
            canSelect = {false}
            onChangeText={(key)=>{
              dataEmployee.familyInfo[index].relationship = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={30}
            placeHolder={translang.t('PROFILE_RELATIONSHIP')}
            label={translang.t('PROFILE_RELATIONSHIP')}
            value_txt={item.relationship ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect = {true}
            selectList={nameTitleList}
            onSelectItem={(item) => {
              dataEmployee.familyInfo[index].nameTitleId = item.id;
              dataEmployee.familyInfo[index].nameTitle = item.title;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={29}
            placeHolder={translang.t('SELECT_NAMETITLES')}
            label={translang.t('NAME_TITLES')}
            value_txt={item.nameTitle ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect = {false}
            onChangeText={(key)=>{
              dataEmployee.familyInfo[index].fullname = key + " " + lastname_add_family;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={28}
            placeHolder={translang.t('USERINFO_name')}
            label={translang.t('USERINFO_name')}
            value_txt={firstname_add_family}/>

          <InfoTextInputItem
            disable={false}
            canSelect = {false}
            onChangeText={(key)=>{
              dataEmployee.familyInfo[index].fullname = firstname_add_family + " " + key
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={27}
            placeHolder={translang.t('USERINFO_surname')}
            label={translang.t('USERINFO_surname')}
            value_txt={lastname_add_family}/>
          <TouchableOpacity onPress={()=>{this.setState({showDatePicker: true, selCalendarType: "EditFamily", selEditIndex: index});}}>
            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              zIndex={26}
              notouch={true}
              placeHolder={translang.t('DDMMYYYY')}
              label={translang.t('PROFILE_birthday')}
              value_txt={moment(item.birthday).format('DD/MM/YYYY') ?? ''}/>
          </TouchableOpacity>
          
          
          <InfoTextInputItem
            disable={false}
            canSelect = {true}
            selectList={statusList}
            onSelectItem={(item) => {
              dataEmployee.familyInfo[index].personalStatusId = item.id;
              dataEmployee.familyInfo[index].personalStatus = item.title;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={25}
            placeHolder={translang.t('MARITAL_TYPE')}
            label={translang.t('MARITAL_TYPE')}
            value_txt={item.personalStatus ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect = {false}
            onChangeText={(key)=>{
              dataEmployee.familyInfo[index].livingStatus = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={24}
            placeHolder={translang.t('LIVING_STATUS')}
            label={translang.t('LIVING_STATUS')}
            value_txt={item.livingStatus ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect = {false}
            onChangeText={(key)=>{
              dataEmployee.familyInfo[index].deathStatus = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={23}
            placeHolder={translang.t('DEATH_STATUS')}
            label={translang.t('DEATH_STATUS')}
            value_txt={item.deathStatus ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect = {false}
            onChangeText={(key)=>{
              dataEmployee.familyInfo[index].occupation = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={22}
            placeHolder={translang.t('FAMILY_OCCUPATION')}
            label={translang.t('FAMILY_OCCUPATION')}
            value_txt={item.occupation ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect = {true}
            selectList={educationList}
            onSelectItem={(item) => {
              dataEmployee.familyInfo[index].educationId = item.id;
              dataEmployee.familyInfo[index].education = item.title;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={21}
            placeHolder={translang.t('PROFILE_EDUCATION')}
            label={translang.t('PROFILE_EDUCATION')}
            value_txt={item.education ?? ''}/>


          <View style={{flexDirection:'row', justifyContent: 'center'}}>
            <GradientButton
              label={translang.t('COMMON_cancel')}
              containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
              buttonStyle={{ borderRadius: 22, height: 44 }}
              colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
              isVerticalGradient={false}
              _onPress={() => {this.setState({indexFamilyInfoEditSelected: -1}, ()=>{
                this.loadData();
              })}} 
            />
            <GradientButton
              label={translang.t('SAVE')}
              containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0, marginLeft: 30 }}
              buttonStyle={{ borderRadius: 22, height: 44 }}
              colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
              isVerticalGradient={false}
              _onPress={() => {this.setState({indexFamilyInfoEditSelected: -1})}} 
            />
          </View>

        </View>}
      </View>

    );
  }

  addEducationInfo = () =>{
    const {dataEmployee, tempAddEducationInfo} = this.state;
    
    if(!dataEmployee.employeeEducationInfos){
      dataEmployee.employeeEducationInfos = [];
    }
    dataEmployee.employeeEducationInfos.push(tempAddEducationInfo);
    this.setState({tempAddEducationInfo: {}, dataEmployee: dataEmployee, showAddEducationInfoModal: false});
  }
  removeEducationInfo = (index) => {
    const tempData = this.state.dataEmployee;
    tempData.employeeEducationInfos.splice(index, 1);
    this.setState({dataEmployee: tempData})
  }
  renderEducationInfoItem = (index) => {
    const {dataEmployee, indexEducationInfoEditSelected} = this.state;
    let isEdit = false
    if(index == indexEducationInfoEditSelected){
      isEdit = true;
    }
    const item = dataEmployee.employeeEducationInfos[index];
    
    const educationList = this.state.educationList.map( item => {
      return {value: item.key, id: item.key, title: item.value, label: item.value};
    });

    return (
      <View>
        <View style={styles.partSubTitleContainer}>
          <Text style={styles.partSubTitleText}>{`${translang.t('PROFILE_educationinfo')} ${translang.t('NO')}. ${index + 1}`}</Text>
          {!isEdit && <View style={{flexDirection: 'row'}}>
          <GradientButtonWithImg
            noText = {true}
            iconImage={Images.n_ic_pencil_white}
            containerStyle={{ width: 25, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0}}
            buttonStyle={{ borderRadius: 13, height: 25}}
            iconStyle={{width: 10, height: 10}}
            colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
            isVerticalGradient={false}
            _onPress={() => {this.setState({indexEducationInfoEditSelected: index})}} 
            />
          <GradientButtonWithImg
            noText = {true}
            iconImage={Images.n_ic_trash_white}
            containerStyle={{ width: 25, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0, marginLeft: 10}}
            buttonStyle={{ borderRadius: 13, height: 25}}
            iconStyle={{width: 10, height: 10}}
            colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
            isVerticalGradient={false}
            _onPress={() => {this.removeEducationInfo(index)}} 
            />
        </View>}
        </View>
        {!isEdit &&
        <View style={styles.partContainer}>
          <InfoTextItem
            label={translang.t('NO')}
            value_txt={`${index + 1}`}/>
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
            label={translang.t('PROFILE_EDUCATION')}
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
            value_txt={`${index + 1}`}/>
          
          <InfoTextInputItem
            disable={false}
            canSelect = {false}
            onChangeText={(key)=>{
              dataEmployee.employeeEducationInfos[index].institution = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={30}
            placeHolder={translang.t('PROFILE_EDUCATION_INSTITUTION')}
            label={translang.t('PROFILE_EDUCATION_INSTITUTION')}
            value_txt={item.institution ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect = {false}
            onChangeText={(key)=>{
              dataEmployee.employeeEducationInfos[index].studyYear = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={29}
            placeHolder={translang.t('YYYY')}
            label={translang.t('GRADUATE_START_DATE')}
            value_txt={item.studyYear ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect = {false}
            onChangeText={(key)=>{
              dataEmployee.employeeEducationInfos[index].graduationYear = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={28}
            placeHolder={translang.t('YYYY')}
            label={translang.t('GRADUATE_END_DATE')}
            value_txt={item.graduationYear ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect = {true}
            selectList={educationList}
            onSelectItem={(item) => {
              dataEmployee.employeeEducationInfos[index].educationLevelId = item.id;
              dataEmployee.employeeEducationInfos[index].educationLevel = item.title;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={27}
            placeHolder={translang.t('PROFILE_EDUCATION')}
            label={translang.t('PROFILE_EDUCATION')}
            value_txt={item.educationLevel ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect = {false}
            onChangeText={(key)=>{
              dataEmployee.employeeEducationInfos[index].major = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={26}
            placeHolder={translang.t('MAJOR')}
            label={translang.t('MAJOR')}
            value_txt={item.major ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect = {false}
            onChangeText={(key)=>{
              dataEmployee.employeeEducationInfos[index].minor = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={25}
            placeHolder={translang.t('MINOR')}
            label={translang.t('MINOR')}
            value_txt={item.minor ?? ''}/>


          <View style={{flexDirection:'row', justifyContent: 'center'}}>
            <GradientButton
              label={translang.t('COMMON_cancel')}
              containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
              buttonStyle={{ borderRadius: 22, height: 44 }}
              colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
              isVerticalGradient={false}
              _onPress={() => {this.setState({indexEducationInfoEditSelected: -1}, ()=>{
                this.loadData();
              })}} 
            />
            <GradientButton
              label={translang.t('SAVE')}
              containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0, marginLeft: 30 }}
              buttonStyle={{ borderRadius: 22, height: 44 }}
              colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
              isVerticalGradient={false}
              _onPress={() => {this.setState({indexEducationInfoEditSelected: -1})}} 
            />
          </View>

        </View>}
      </View>

    );
  }

  addHonorInfo = () =>{
    const {dataEmployee, tempAddHonorInfo} = this.state;
    
    if(!dataEmployee.employeeHonorInfos){
      dataEmployee.employeeHonorInfos = [];
    }
    dataEmployee.employeeHonorInfos.push(tempAddHonorInfo);
    this.setState({tempAddHonorInfo: {}, dataEmployee: dataEmployee, showAddHonorInfoModal: false});
  }
  removeHonorInfo = (index) => {
    const tempData = this.state.dataEmployee;
    tempData.employeeHonorInfos.splice(index, 1);
    this.setState({dataEmployee: tempData})
  }
  renderHonorInfoItem = (index) => {
    const {dataEmployee, indexHonorInfoEditSelected} = this.state;
    let isEdit = false
    if(index == indexHonorInfoEditSelected){
      isEdit = true;
    }
    const item = dataEmployee.employeeHonorInfos[index];

    return (
      <View>
        <View style={styles.partSubTitleContainer}>
          <Text style={styles.partSubTitleText}>{`${translang.t('PROFILE_HONOR_INFORMATION')} ${translang.t('NO')}. ${index + 1}`}</Text>
          {!isEdit && <View style={{flexDirection: 'row'}}>
          <GradientButtonWithImg
            noText = {true}
            iconImage={Images.n_ic_pencil_white}
            containerStyle={{ width: 25, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0}}
            buttonStyle={{ borderRadius: 13, height: 25}}
            iconStyle={{width: 10, height: 10}}
            colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
            isVerticalGradient={false}
            _onPress={() => {this.setState({indexHonorInfoEditSelected: index})}} 
            />
          <GradientButtonWithImg
            noText = {true}
            iconImage={Images.n_ic_trash_white}
            containerStyle={{ width: 25, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0, marginLeft: 10}}
            buttonStyle={{ borderRadius: 13, height: 25}}
            iconStyle={{width: 10, height: 10}}
            colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
            isVerticalGradient={false}
            _onPress={() => {this.removeHonorInfo(index)}} 
            />
        </View>}
        </View>
        {!isEdit &&
        <View style={styles.partContainer}>
          <InfoTextItem
            label={translang.t('NO')}
            value_txt={`${index + 1}`}/>
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
            value_txt={`${index + 1}`}/>
      
          <InfoTextInputItem
            disable={false}
            canSelect = {false}
            onChangeText={(key)=>{
              dataEmployee.employeeHonorInfos[index].honor = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={30}
            placeHolder={translang.t('PROFILE_HONOR_TYPE')}
            label={translang.t('PROFILE_HONOR_TYPE')}
            value_txt={item.honor ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect = {false}
            onChangeText={(key)=>{
              dataEmployee.employeeHonorInfos[index].honorAgency = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={29}
            placeHolder={translang.t('PROFILE_DONATING_AGENCY')}
            label={translang.t('PROFILE_DONATING_AGENCY')}
            value_txt={item.honorAgency ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect = {false}
            onChangeText={(key)=>{
              dataEmployee.employeeHonorInfos[index].honorYear = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={28}
            placeHolder={translang.t('YYYY')}
            label={translang.t('PROFILE_YEAR_RECEIVED')}
            value_txt={item.honorYear ?? ''}/>
            
          <View style={{flexDirection:'row', justifyContent: 'center'}}>
            <GradientButton
              label={translang.t('COMMON_cancel')}
              containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
              buttonStyle={{ borderRadius: 22, height: 44 }}
              colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
              isVerticalGradient={false}
              _onPress={() => {this.setState({indexHonorInfoEditSelected: -1}, ()=>{
                this.loadData();
              })}} 
            />
            <GradientButton
              label={translang.t('SAVE')}
              containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0, marginLeft: 30 }}
              buttonStyle={{ borderRadius: 22, height: 44 }}
              colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
              isVerticalGradient={false}
              _onPress={() => {this.setState({indexHonorInfoEditSelected: -1})}} 
            />
          </View>

        </View>}
      </View>

    );
  }

  addTrainingInfo = () =>{
    const {dataEmployee, tempAddTrainingInfo} = this.state;
    
    if(!dataEmployee.employeeTrainingInfos){
      dataEmployee.employeeTrainingInfos = [];
    }
    dataEmployee.employeeTrainingInfos.push(tempAddTrainingInfo);
    this.setState({tempAddTrainingInfo: {}, dataEmployee: dataEmployee, showAddTrainingInfoModal: false});
  }
  removeTrainingInfo = (index) => {
    const tempData = this.state.dataEmployee;
    tempData.employeeTrainingInfos.splice(index, 1);
    this.setState({dataEmployee: tempData})
  }
  renderTrainingInfoItem = (index) => {
    const {dataEmployee, indexTrainingInfoEditSelected} = this.state;
    let isEdit = false
    if(index == indexTrainingInfoEditSelected){
      isEdit = true;
    }
    const item = dataEmployee.employeeTrainingInfos[index];
    const trainingTypeList = this.state.trainingTypeList.map( item => {
      return {value: item.key, id: item.key, title: item.value, label: item.value};
    });
    return (
      <View>
        <View style={styles.partSubTitleContainer}>
          <Text style={styles.partSubTitleText}>{`${translang.t('TRAINING_EDUCATION_VISITING_INFORMATION')} ${translang.t('NO')}. ${index + 1}`}</Text>
          {!isEdit && <View style={{flexDirection: 'row'}}>
          <GradientButtonWithImg
            noText = {true}
            iconImage={Images.n_ic_pencil_white}
            containerStyle={{ width: 25, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0}}
            buttonStyle={{ borderRadius: 13, height: 25}}
            iconStyle={{width: 10, height: 10}}
            colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
            isVerticalGradient={false}
            _onPress={() => {this.setState({indexTrainingInfoEditSelected: index})}} 
            />
          <GradientButtonWithImg
            noText = {true}
            iconImage={Images.n_ic_trash_white}
            containerStyle={{ width: 25, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0, marginLeft: 10}}
            buttonStyle={{ borderRadius: 13, height: 25}}
            iconStyle={{width: 10, height: 10}}
            colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
            isVerticalGradient={false}
            _onPress={() => {this.removeTrainingInfo(index)}} 
            />
        </View>}
        </View>
        {!isEdit &&
        <View style={styles.partContainer}>
          <InfoTextItem
            label={translang.t('NO')}
            value_txt={`${index + 1}`}/>

          <InfoTextItem
            label={translang.t('PROFILE_TYPE')}
            value_txt={item.trainingType ?? ''}/>
          <InfoTextItem
            label={translang.t('PROFILE_PROJECT')}
            value_txt={item.projectName ?? ''}/>
          <InfoTextItem
            label={translang.t('PROFILE_TRAINING_COURSE_NAME')}
            value_txt={item.trainingName ?? ''}/>
          <View style={{flexDirection: 'row', zIndex: 86}}>
            <View style={{flex: 1, paddingleft: 10, paddingRight: 10}}>
              <InfoTextItem
                label={translang.t('PROFILE_TRAINING_START_DATE')}
                value_txt={moment(item.trainingStartDate).format('DD/MM/YYYY') ?? ''}/>
            </View>
            
            <View style={{flex: 1, paddingleft: 10}}>
              <InfoTextItem
                label={translang.t('PROFILE_TRAINING_END_DATE')}
                value_txt={moment(item.trainingEndDate).format('DD/MM/YYYY') ?? ''}/>
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
            value_txt={`${index + 1}`}/>
      
          <InfoTextInputItem
            disable={false}
            canSelect = {true}
            selectList={trainingTypeList}
            onSelectItem={(item) => {
              dataEmployee.employeeTrainingInfos[index].trainingTypeId = item.id;
              dataEmployee.employeeTrainingInfos[index].trainingType = item.title;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={31}
            placeHolder={translang.t('PROFILE_TYPE')}
            label={translang.t('PROFILE_TYPE')}
            value_txt={item.trainingType ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect = {false}
            onChangeText={(key)=>{
              dataEmployee.employeeTrainingInfos[index].projectName = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={30}
            placeHolder={translang.t('PROFILE_PROJECT')}
            label={translang.t('PROFILE_PROJECT')}
            value_txt={item.projectName ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect = {false}
            onChangeText={(key)=>{
              dataEmployee.employeeTrainingInfos[index].trainingName = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={29}
            placeHolder={translang.t('PROFILE_TRAINING_COURSE_NAME')}
            label={translang.t('PROFILE_TRAINING_COURSE_NAME')}
            value_txt={item.trainingName ?? ''}/>

          <View style={{flexDirection: 'row', zIndex: 86}}>
            <View style={{flex: 1, paddingleft: 10, paddingRight: 10}}>
              <TouchableOpacity onPress={()=>{this.setState({showDatePicker: true, selCalendarType: "EditStartTraining", selEditIndex: index});}}>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {false}
                  zIndex={28}
                  notouch={true}
                  placeHolder={translang.t('DDMMYYYY')}
                  label={translang.t('PROFILE_TRAINING_START_DATE')}
                  value_txt={moment(item.trainingStartDate).format('DD/MM/YYYY') ?? ''}/>
              </TouchableOpacity>
            </View>
            
            <View style={{flex: 1, paddingleft: 10}}>
              <TouchableOpacity onPress={()=>{this.setState({showDatePicker: true, selCalendarType: "EditEndTraining", selEditIndex: index});}}>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {false}
                  zIndex={27}
                  notouch={true}
                  placeHolder={translang.t('DDMMYYYY')}
                  label={translang.t('PROFILE_TRAINING_END_DATE')}
                  value_txt={moment(item.trainingEndDate).format('DD/MM/YYYY') ?? ''}/>
              </TouchableOpacity>
            </View>
          </View>

          <InfoTextInputItem
            disable={false}
            canSelect = {false}
            onChangeText={(key)=>{
              dataEmployee.employeeTrainingInfos[index].trainingHours = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={28}
            placeHolder={translang.t('PROFILE_NUMBER_OF_HOURS')}
            label={translang.t('PROFILE_NUMBER_OF_HOURS')}
            value_txt={item.trainingHours ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect = {false}
            onChangeText={(key)=>{
              dataEmployee.employeeTrainingInfos[index].trainingPlace = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={26}
            placeHolder={translang.t('PROFILE_LOCATION')}
            label={translang.t('PROFILE_LOCATION')}
            value_txt={item.trainingPlace ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect = {false}
            onChangeText={(key)=>{
              dataEmployee.employeeTrainingInfos[index].trainingCountry = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={27}
            placeHolder={translang.t('PROFILE_COUNTRY')}
            label={translang.t('PROFILE_COUNTRY')}
            value_txt={item.trainingCountry ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect = {false}
            onChangeText={(key)=>{
              dataEmployee.employeeTrainingInfos[index].trainingProvince = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={25}
            placeHolder={translang.t('PROFILE_PROVINCE')}
            label={translang.t('PROFILE_PROVINCE')}
            value_txt={item.trainingProvince ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect = {false}
            onChangeText={(key)=>{
              dataEmployee.employeeTrainingInfos[index].expenses = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={25}
            placeHolder={translang.t('PROFILE_EXPENSES')}
            label={translang.t('PROFILE_EXPENSES')}
            value_txt={item.expenses ?? ''}/>
            
          <View style={{flexDirection:'row', justifyContent: 'center'}}>
            <GradientButton
              label={translang.t('COMMON_cancel')}
              containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
              buttonStyle={{ borderRadius: 22, height: 44 }}
              colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
              isVerticalGradient={false}
              _onPress={() => {this.setState({indexTrainingInfoEditSelected: -1}, ()=>{
                this.loadData();
              })}} 
            />
            <GradientButton
              label={translang.t('SAVE')}
              containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0, marginLeft: 30 }}
              buttonStyle={{ borderRadius: 22, height: 44 }}
              colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
              isVerticalGradient={false}
              _onPress={() => {this.setState({indexTrainingInfoEditSelected: -1})}} 
            />
          </View>

        </View>}
      </View>

    );
  }

  addLicenseInfo = () =>{
    const {dataEmployee, tempAddLicenseInfo} = this.state;
    
    if(!dataEmployee.EmployeeProfessionalLicenseInfos){
      dataEmployee.EmployeeProfessionalLicenseInfos = [];
    }
    dataEmployee.EmployeeProfessionalLicenseInfos.push(tempAddLicenseInfo);
    this.setState({tempAddLicenseInfo: {}, dataEmployee: dataEmployee, showAddLicenseInfoModal: false});
  }
  removeLicenseInfo = (index) => {
    const tempData = this.state.dataEmployee;
    tempData.EmployeeProfessionalLicenseInfos.splice(index, 1);
    this.setState({dataEmployee: tempData})
  }
  renderLicenseInfoItem = (index) => {
    const {dataEmployee, indexLicenseInfoEditSelected} = this.state;
    let isEdit = false
    if(index == indexLicenseInfoEditSelected){
      isEdit = true;
    }
    const item = dataEmployee.EmployeeProfessionalLicenseInfos[index];
    
    const licenseTypeList = this.state.licenseTypeList.map( item => {
      return {value: item.key, id: item.key, title: item.value, label: item.value};
    });
    return (
      <View>
        <View style={styles.partSubTitleContainer}>
          <Text style={styles.partSubTitleText}>{`${translang.t('OCCUPATIONAL_LICENSE')} ${translang.t('NO')}. ${index + 1}`}</Text>
          {!isEdit && <View style={{flexDirection: 'row'}}>
          <GradientButtonWithImg
            noText = {true}
            iconImage={Images.n_ic_pencil_white}
            containerStyle={{ width: 25, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0}}
            buttonStyle={{ borderRadius: 13, height: 25}}
            iconStyle={{width: 10, height: 10}}
            colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
            isVerticalGradient={false}
            _onPress={() => {this.setState({indexLicenseInfoEditSelected: index})}} 
            />
          <GradientButtonWithImg
            noText = {true}
            iconImage={Images.n_ic_trash_white}
            containerStyle={{ width: 25, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0, marginLeft: 10}}
            buttonStyle={{ borderRadius: 13, height: 25}}
            iconStyle={{width: 10, height: 10}}
            colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
            isVerticalGradient={false}
            _onPress={() => {this.removeLicenseInfo(index)}} 
            />
        </View>}
        </View>
        {!isEdit &&
        <View style={styles.partContainer}>
          <InfoTextItem
            label={translang.t('NO')}
            value_txt={`${index + 1}`}/>
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
            value_txt={moment(item.licenseIssuedDate).format('DD/MM/YYYY') ?? ''}/>
          <InfoTextItem
            label={translang.t('PROFILE_CERTIFICATE_EXPIRATION_DATE')}
            value_txt={moment(item.licenseExpireDate).format('DD/MM/YYYY') ?? ''}/>
          <InfoTextItem
            label={translang.t('PROFILE_ORGANIZATION_ACCOMPANYING_CERTIFICATE')}
            value_txt={item.licenseAgencyIssued ?? ''}/>
        </View>}
        {isEdit &&
        <View style={styles.partEditContainer}>
          <InfoTextInputItem
            disable={true}
            label={translang.t('NO')}
            value_txt={`${index + 1}`}/>
      
          <InfoTextInputItem
            disable={false}
            canSelect = {true}
            selectList={licenseTypeList}
            onSelectItem={(item) => {
              dataEmployee.EmployeeProfessionalLicenseInfos[index].licenseTypeId = item.id;
              dataEmployee.EmployeeProfessionalLicenseInfos[index].licenseType = item.title;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={31}
            placeHolder={translang.t('PROFILE_PROFESSIONAL_LICENSE_TYPE')}
            label={translang.t('PROFILE_PROFESSIONAL_LICENSE_TYPE')}
            value_txt={item.licenseType ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect = {false}
            onChangeText={(key)=>{
              dataEmployee.EmployeeProfessionalLicenseInfos[index].licenseNo = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={30}
            placeHolder={translang.t('PROFILE_PROFESSIONAL_LICENSE_NUMBER')}
            label={translang.t('PROFILE_PROFESSIONAL_LICENSE_NUMBER')}
            value_txt={item.licenseNo ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect = {false}
            onChangeText={(key)=>{
              dataEmployee.EmployeeProfessionalLicenseInfos[index].licenseName = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={29}
            placeHolder={translang.t('PROFILE_PROFESSIONAL_LICENSE_NAME')}
            label={translang.t('PROFILE_PROFESSIONAL_LICENSE_NAME')}
            value_txt={item.licenseName ?? ''}/>
          
          <TouchableOpacity onPress={()=>{this.setState({showDatePicker: true, selCalendarType: "EditLicenseIssueDate", selEditIndex: index});}}>
            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                dataEmployee.EmployeeProfessionalLicenseInfos[index].licenseIssuedDate = key;
                this.setState({dataEmployee: dataEmployee});
              }}
              zIndex={28}
              notouch={true}
              placeHolder={translang.t('DDMMYYYY')}
              label={translang.t('PROFILE_DATE_ISSUE_ACCOMPANYING_CERTIFICATE')}
              value_txt={moment(item.licenseIssuedDate).format('DD/MM/YYYY') ?? ''}/>
          </TouchableOpacity>

          <TouchableOpacity onPress={()=>{this.setState({showDatePicker: true, selCalendarType: "EditLicenseExpireDate", selEditIndex: index});}}>
            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                dataEmployee.EmployeeProfessionalLicenseInfos[index].licenseExpireDate = key;
                this.setState({dataEmployee: dataEmployee});
              }}
              zIndex={27}
              notouch={true}
              placeHolder={translang.t('DDMMYYYY')}
              label={translang.t('PROFILE_CERTIFICATE_EXPIRATION_DATE')}
              value_txt={moment(item.licenseExpireDate).format('DD/MM/YYYY') ?? ''}/>
          </TouchableOpacity>
          
          <InfoTextInputItem
            disable={false}
            canSelect = {false}
            onChangeText={(key)=>{
              dataEmployee.EmployeeProfessionalLicenseInfos[index].licenseAgencyIssued = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={26}
            placeHolder={translang.t('PROFILE_ORGANIZATION_ACCOMPANYING_CERTIFICATE')}
            label={translang.t('PROFILE_ORGANIZATION_ACCOMPANYING_CERTIFICATE')}
            value_txt={item.licenseAgencyIssued ?? ''}/>

          <View style={{flexDirection:'row', justifyContent: 'center'}}>
            <GradientButton
              label={translang.t('COMMON_cancel')}
              containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
              buttonStyle={{ borderRadius: 22, height: 44 }}
              colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
              isVerticalGradient={false}
              _onPress={() => {this.setState({indexLicenseInfoEditSelected: -1}, ()=>{
                this.loadData();
              })}} 
            />
            <GradientButton
              label={translang.t('SAVE')}
              containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0, marginLeft: 30 }}
              buttonStyle={{ borderRadius: 22, height: 44 }}
              colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
              isVerticalGradient={false}
              _onPress={() => {this.setState({indexLicenseInfoEditSelected: -1})}} 
            />
          </View>

        </View>}
      </View>

    );
  }

  addInsignInfo = () =>{
    const {dataEmployee, tempAddInsignInfo} = this.state;
    
    if(!dataEmployee.EmployeeInsigniaInfos){
      dataEmployee.EmployeeInsigniaInfos = [];
    }
    dataEmployee.EmployeeInsigniaInfos.push(tempAddInsignInfo);
    this.setState({tempAddInsignInfo: {}, dataEmployee: dataEmployee, showAddInsignInfoModal: false});
  }
  removeInsignInfo = (index) => {
    const tempData = this.state.dataEmployee;
    tempData.EmployeeInsigniaInfos.splice(index, 1);
    this.setState({dataEmployee: tempData})
  }
  renderInsignInfoItem = (index) => {
    const {dataEmployee, indexInsignInfoEditSelected} = this.state;
    let isEdit = false
    if(index == indexInsignInfoEditSelected){
      isEdit = true;
    }
    const item = dataEmployee.EmployeeInsigniaInfos[index];
    
    return (
      <View>
        <View style={styles.partSubTitleContainer}>
          <Text style={styles.partSubTitleText}>{`${translang.t('OCCUPATIONAL_LICENSE')} ${translang.t('NO')}. ${index + 1}`}</Text>
          {!isEdit && <View style={{flexDirection: 'row'}}>
          <GradientButtonWithImg
            noText = {true}
            iconImage={Images.n_ic_pencil_white}
            containerStyle={{ width: 25, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0}}
            buttonStyle={{ borderRadius: 13, height: 25}}
            iconStyle={{width: 10, height: 10}}
            colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
            isVerticalGradient={false}
            _onPress={() => {this.setState({indexInsignInfoEditSelected: index})}} 
            />
          <GradientButtonWithImg
            noText = {true}
            iconImage={Images.n_ic_trash_white}
            containerStyle={{ width: 25, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0, marginLeft: 10}}
            buttonStyle={{ borderRadius: 13, height: 25}}
            iconStyle={{width: 10, height: 10}}
            colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
            isVerticalGradient={false}
            _onPress={() => {this.removeLicenseInfo(index)}} 
            />
        </View>}
        </View>
        {!isEdit &&
        <View style={styles.partContainer}>
          <InfoTextItem
            label={translang.t('NO')}
            value_txt={`${index + 1}`}/>
          <InfoTextItem
            label={translang.t('PROFILE_YEAR_RECEIVED')}
            value_txt={item.insigniaYear ?? ''}/>
          <InfoTextItem
            label={translang.t('PROFILE_ROYAL_DECORATION_CLASS')}
            value_txt={item.insigniaGrade ?? ''}/>
          <InfoTextItem
            label={translang.t('USERINFO_position')}
            value_txt={item.insigniaPosition ?? ''}/>
          <View style={{flexDirection: 'row', zIndex: 86}}>
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
            value_txt={moment(item.insigniaRecordDate).format('DD/MM/YYYY') ?? ''}/>
        </View>}
        {isEdit &&
        <View style={styles.partEditContainer}>
          <InfoTextInputItem
            disable={true}
            label={translang.t('NO')}
            value_txt={`${index + 1}`}/>

          <InfoTextInputItem
            disable={false}
            canSelect = {false}
            onChangeText={(key)=>{
              dataEmployee.EmployeeInsigniaInfos[index].insigniaYear = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={30}
            placeHolder={translang.t('YYYY')}
            label={translang.t('PROFILE_YEAR_RECEIVED')}
            value_txt={item.insigniaYear ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect = {false}
            onChangeText={(key)=>{
              dataEmployee.EmployeeInsigniaInfos[index].insigniaGrade = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={29}
            placeHolder={translang.t('PROFILE_ROYAL_DECORATION_CLASS')}
            label={translang.t('PROFILE_ROYAL_DECORATION_CLASS')}
            value_txt={item.insigniaGrade ?? ''}/>

          <InfoTextInputItem
            disable={false}
            canSelect = {false}
            onChangeText={(key)=>{
              dataEmployee.EmployeeInsigniaInfos[index].insigniaPosition = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={28}
            placeHolder={translang.t('USERINFO_position')}
            label={translang.t('USERINFO_position')}
            value_txt={item.insigniaPosition ?? ''}/>

          <View style={{flexDirection: 'row', zIndex: 86}}>
            <View style={{flex: 1, paddingleft: 10, paddingRight: 10}}>
              <InfoTextInputItem
                disable={false}
                canSelect = {false}
                onChangeText={(key)=>{
                  dataEmployee.EmployeeInsigniaInfos[index].insigniaBookNumber = key;
                  this.setState({dataEmployee: dataEmployee});
                }}
                zIndex={27}
                placeHolder={translang.t('PROFILE_ROYAL_GOVERNMENT_VOLUME_NO')}
                label={translang.t('PROFILE_ROYAL_GOVERNMENT_VOLUME_NO')}
                value_txt={item.insigniaBookNumber ?? ''}/>
            </View>
            
            <View style={{flex: 1, paddingleft: 10}}>
              <InfoTextInputItem
                disable={false}
                canSelect = {false}
                onChangeText={(key)=>{
                  dataEmployee.EmployeeInsigniaInfos[index].insigniaPart = key;
                  this.setState({dataEmployee: dataEmployee});
                }}
                zIndex={26}
                placeHolder={translang.t('PROFILE_ROYAL_GOVERNMENT_PART')}
                label={translang.t('PROFILE_ROYAL_GOVERNMENT_PART')}
                value_txt={item.insigniaPart ?? ''}/>
            </View>
          </View>

          <InfoTextInputItem
            disable={false}
            canSelect = {false}
            onChangeText={(key)=>{
              dataEmployee.EmployeeInsigniaInfos[index].insigniaNumber = key;
              this.setState({dataEmployee: dataEmployee});
            }}
            zIndex={25}
            placeHolder={translang.t('PROFILE_ROYAL_GOVERNMENT_NO')}
            label={translang.t('PROFILE_ROYAL_GOVERNMENT_NO')}
            value_txt={item.insigniaNumber ?? ''}/>
          <TouchableOpacity onPress={()=>{this.setState({showDatePicker: true, selCalendarType: "EditInsignInfo", selEditIndex: index});}}>
            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                dataEmployee.EmployeeInsigniaInfos[index].insigniaRecordDate = key;
                this.setState({dataEmployee: dataEmployee});
              }}
              notouch={true}
              zIndex={24}
              placeHolder={translang.t('DDMMYYYY')}
              label={translang.t('PROFILE_DATED')}
              value_txt={moment(item.insigniaRecordDate).format('DD/MM/YYYY') ?? ''}/>
          </TouchableOpacity>
            
          <View style={{flexDirection:'row', justifyContent: 'center'}}>
            <GradientButton
              label={translang.t('COMMON_cancel')}
              containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
              buttonStyle={{ borderRadius: 22, height: 44 }}
              colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
              isVerticalGradient={false}
              _onPress={() => {this.setState({indexInsignInfoEditSelected: -1}, ()=>{
                this.loadData();
              })}} 
            />
            <GradientButton
              label={translang.t('SAVE')}
              containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0, marginLeft: 30 }}
              buttonStyle={{ borderRadius: 22, height: 44 }}
              colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
              isVerticalGradient={false}
              _onPress={() => {this.setState({indexInsignInfoEditSelected: -1})}} 
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
    };

    if(selCalendarType == "ProfileBirthday"){
      dataEmployee.birthday = moment(date);
      this.setState({ dataEmployee: dataEmployee, showDatePicker: false });
    }else if(selCalendarType == "AddFamily"){
      tempAddFamilyInfo.birthday = moment(date);
      this.setState({ tempAddFamilyInfo: tempAddFamilyInfo, showDatePicker: false });
    }else if(selCalendarType == "EditFamily"){
      dataEmployee.familyInfo[selEditIndex].birthday = moment(date);
      this.setState({dataEmployee: dataEmployee, showDatePicker: false});
    }else if(selCalendarType == "AddStartTraining"){
      tempAddTrainingInfo.trainingStartDate = moment(date);
      this.setState({ tempAddTrainingInfo: tempAddTrainingInfo, showDatePicker: false });
    }else if(selCalendarType == "AddEndTraining"){
      tempAddTrainingInfo.trainingEndDate = moment(date);
      this.setState({ tempAddTrainingInfo: tempAddTrainingInfo, showDatePicker: false });
    }else if(selCalendarType == "EditStartTraining"){
      dataEmployee.employeeTrainingInfos[selEditIndex].trainingStartDate = moment(date);
      this.setState({ dataEmployee: dataEmployee, showDatePicker: false });
    }else if(selCalendarType == "EditEndTraining"){
      dataEmployee.employeeTrainingInfos[selEditIndex].trainingEndDate = moment(date);
      this.setState({ dataEmployee: dataEmployee, showDatePicker: false });
    }else if(selCalendarType == "AddLicenseIssueDate"){
      tempAddLicenseInfo.licenseIssuedDate = moment(date);
      this.setState({ tempAddLicenseInfo: tempAddLicenseInfo, showDatePicker: false });
    }else if(selCalendarType == "AddLicenseExpireDate"){
      tempAddLicenseInfo.licenseExpireDate = moment(date);
      this.setState({ tempAddLicenseInfo: tempAddLicenseInfo, showDatePicker: false });
    }else if(selCalendarType == "EditLicenseIssueDate"){
      dataEmployee.EmployeeProfessionalLicenseInfos[selEditIndex].licenseIssuedDate = moment(date);
      this.setState({ dataEmployee: dataEmployee, showDatePicker: false });
    }else if(selCalendarType == "EditLicenseExpireDate"){
      dataEmployee.EmployeeProfessionalLicenseInfos[selEditIndex].licenseExpireDate = moment(date);
      this.setState({ dataEmployee: dataEmployee, showDatePicker: false });
    }else if(selCalendarType == "AddInsignRecordDate"){
      tempAddInsignInfo.insigniaRecordDate = moment(date);
      this.setState({ tempAddInsignInfo: tempAddInsignInfo, showDatePicker: false });
    }else if(selCalendarType == "EditInsignInfo"){
      dataEmployee.EmployeeInsigniaInfos[selEditIndex].insigniaRecordDate = moment(date);
      this.setState({ dataEmployee: dataEmployee, showDatePicker: false });
    }
  };

  onChangeListItem = (item)=>{
    const {selItemSelTypeStr} = this.state;
    if(item == null){
      this.setState({selItemShowable: false})
    }else{

    }


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
        { title: translang.t('BASIC_INFORMATION')},
        { title: translang.t('EDUCATIONAL_INFORMATION')},
        { title: translang.t('JOB_POSITION_INFORMATION')+translang.t('TEACHING_INFORMATION')},
        { title: translang.t('OCCUPATIONAL_LICENSE')},
    ];

    let firstname = "";
    let lastname = "";
    if(dataEmployee.fullname != null && dataEmployee.fullname != ''){
      const nameArray = dataEmployee.fullname.split(' ');
      if (nameArray.length > 0) {
        firstname = nameArray[0];
      }
      if (nameArray.length > 1) {
        lastname = nameArray[nameArray.length - 1];
      }
    }

    let firstname_en = "";
    let lastname_en = "";
    if(dataEmployee.fullname_en != null && dataEmployee.fullname_en != ''){
      const nameArray = dataEmployee.fullname_en.split(' ');
      if (nameArray.length > 0) {
        firstname_en = nameArray[0];
      }
      if (nameArray.length > 1) {
        lastname_en = nameArray[nameArray.length - 1];
      }
    }
    
    let firstname_supouse = "";
    let lastname_supouse = "";
    if(dataEmployee.fullname_supouse != null && dataEmployee.fullname_supouse != ''){
      const nameArray = dataEmployee.fullname_supouse.split(' ');
      if (nameArray.length > 0) {
        firstname_supouse = nameArray[0];
      }
      if (nameArray.length > 1) {
        lastname_supouse = nameArray[nameArray.length - 1];
      }
    }

    let firstname_add_family = "";
    let lastname_add_family = "";
    if(tempAddFamilyInfo.fullname != null && tempAddFamilyInfo.fullname != ''){
      const nameArray = tempAddFamilyInfo.fullname.split(' ');
      if (nameArray.length > 0) {
        firstname_add_family = nameArray[0];
      }
      if (nameArray.length > 1) {
        lastname_add_family = nameArray[nameArray.length - 1];
      }
    }


    let birthday = dataEmployee.birthday;
    if(moment(dataEmployee.birthday).format('MM/DD/YYYY') != 'Invalid date'){
      birthday = moment(dataEmployee.birthday).format('MM/DD/YYYY')
    }
    
    const nameTitleList = this.state.nameTitleList.map( item => {
      return {value: item.titleId, id: item.titleId, title: item.title, label: item.title};
    });
    const nationalList = this.state.nationalList.map( item => {
      return {value: item.nationId, id: item.nationId, title: item.nation, label: item.nation};
    });
    const raceList = this.state.raceList.map( item => {
      return {value: item.raceId, id: item.raceId, title: item.race, label: item.race};
    });
    const religionList = this.state.religionList.map( item => {
      return {value: item.religionId, id: item.religionId, title: item.religion, label: item.religion};
    });
    const statusList = this.state.statusList.map( item => {
      return {value: item.key, id: item.key, title: item.value, label: item.value};
    });
    const provinceList = this.state.provinceList.map( item => {
      if(getCurrentLocale() == 'en'){
        return {value: item.provinceId, id: item.provinceId, title: item.provinceEn, label: item.provinceEn};
      }else{
        return {value: item.provinceId, id: item.provinceId, title: item.provinceTh, label: item.provinceTh};
      }
    });
    const districtList = this.state.districtList.map( item => {
      if(getCurrentLocale() == 'en'){
        return {value: item.districtId, id: item.districtId, title: item.districtEn, label: item.districtEn};
      }else{
        return {value: item.districtId, id: item.districtId, title: item.districtTh, label: item.districtTh};
      }
    });
    const subdistrictList = this.state.subdistrictList.map( item => {
      if(getCurrentLocale() == 'en'){
        return { value: item.subDistrictId, id: item.subDistrictId, title: item.subDistrictEn, label: item.subDistrictEn};
      }else{
        return { value: item.subDistrictId, id: item.subDistrictId, title: item.subDistrictTh, label: item.subDistrictTh};
      }
    });
    const educationList = this.state.educationList.map( item => {
      return {value: item.key, id: item.key, title: item.value, label: item.value};
    });
    const trainingTypeList = this.state.trainingTypeList.map( item => {
      return {value: item.key, id: item.key, title: item.value, label: item.value};
    });
    const licenseTypeList = this.state.licenseTypeList.map( item => {
      return {value: item.key, id: item.key, title: item.value, label: item.value};
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
            </TouchableOpacity >
          </ImageBackground>

          <View style={{marginTop: 20,}}>
            {this.state.profileType == '0' && <>
              <View style={styles.partTitleContainer}>
                <Text style={styles.partTitleText}>{translang.t('DRAWER_profile')}</Text>
                {!this.state.isEditProfile && 
                <GradientButtonWithImg
                    label={translang.t('PROFILE_edit')}
                    iconImage={Images.n_ic_pencil_white}
                    containerStyle={{ width: 70, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
                    buttonStyle={{ borderRadius: 5, height: 25 }}
                    textStyle={{fontSize: 20, fontWeight: 'bold'}}
                    iconStyle={{width: 10, height: 10}}
                    colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                    isVerticalGradient={false}
                    _onPress={() => {this.setState({isEditProfile: true})}} 
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
                  value_txt={firstname ?? ''}/>
                <InfoTextItem
                  label={translang.t('USERINFO_surname')}
                  value_txt={lastname ?? ''}/>
                <InfoTextItem
                  label={translang.t('USERINFO_name_en')}
                  value_txt={firstname_en ?? ''}/>
                <InfoTextItem
                  label={translang.t('USERINFO_surname_en')}
                  value_txt={lastname_en ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_idcard')}
                  value_txt={dataEmployee.idcardnumber ?? ''}/>
                <InfoTextItem
                  label={translang.t('PASSPORT_NUMBER')}
                  value_txt={dataEmployee.passportnumber ?? ''}/>
                <InfoTextItem
                  label={translang.t('PASSPORT_COUNTRY')}
                  value_txt={dataEmployee.passportcountry ?? ''}/>
                <InfoTextItem
                  label={translang.t('PROFILE_birthday')}
                  value_txt={birthday}/>
                <View style={{flexDirection: 'row'}}>
                  <View style={{flex: 1}}>
                    <InfoTextItem
                      label={translang.t('USERINFO_bloodtype')}
                      value_txt={dataEmployee.bloodtype ?? ''}/>
                  </View>
                  <View style={{flex: 1}}>
                    <InfoTextItem
                      label={translang.t('PROFILE_Nationality')}
                      value_txt={dataEmployee.nationality ?? "" }/>
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
                  value_txt={firstname_supouse}/>
                <InfoTextItem
                  label={translang.t('SPOUSE_SURNAME')}
                  value_txt={lastname_supouse}/>
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
                  zIndex={100}
                  label={translang.t('PERSONAL_TYPE')}
                  value_txt={dataEmployee.employeeType ?? ''}/>
                <InfoTextInputItem
                  disable={true}
                  zIndex={99}
                  label={translang.t('PROFILE_EMPLOYEE_ID')}
                  value_txt={dataEmployee.employeeCode ?? ''}/>
                <InfoTextInputItem
                  disable={true}
                  zIndex={98}
                  label={translang.t('PROFILE_position')}
                  value_txt={dataEmployee.jobPosition ?? ''}/>
                <InfoTextInputItem
                  disable={true}
                  zIndex={97}
                  label={translang.t('PROFILE_department')}
                  value_txt={dataEmployee.department ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {true}
                  selectList={this.state.genderList}
                  onSelectItem={(item) => {
                    let temp = dataEmployee;
                    temp.sexId = item.id;
                    temp.sex = item.title;
                    this.setState({dataEmployee: temp});}}
                  zIndex={96}
                  placeHolder={translang.t('SELECT_GENDER')}
                  label={translang.t('PROFILE_gender')}
                  value_txt={dataEmployee.sex ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {true}
                  selectList={nameTitleList}
                  onSelectItem={(item) => {
                    const temp = dataEmployee;
                    temp.nameTitleId = item.id;
                    temp.nameTitle = item.title;
                    this.setState({dataEmployee: temp});
                  }}
                  zIndex={95}
                  placeHolder={translang.t('SELECT_NAMETITLES')}
                  label={translang.t('NAME_TITLES')}
                  value_txt={dataEmployee.nameTitle ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {false}
                  onChangeText={(key)=>{
                    dataEmployee.fullname = key + " " + lastname;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  zIndex={94}
                  placeHolder={translang.t('USERINFO_name')}
                  label={translang.t('USERINFO_name')}
                  value_txt={firstname}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect={false}
                  onChangeText={(key)=>{
                    dataEmployee.fullname = firstname + " " + key
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  zIndex={93}
                  placeHolder={translang.t('USERINFO_surname')}
                  label={translang.t('USERINFO_surname')}
                  value_txt={lastname}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {false}
                  onChangeText={(key)=>{
                    dataEmployee.fullname_en = key + " " + lastname_en
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  zIndex={92}
                  placeHolder={translang.t('USERINFO_name_en')}
                  label={translang.t('USERINFO_name_en')}
                  value_txt={firstname_en ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {false}
                  onChangeText={(key)=>{
                    dataEmployee.fullname_en = firstname_en + " " + key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  zIndex={91}
                  placeHolder={translang.t('USERINFO_surname_en')}
                  label={translang.t('USERINFO_surname_en')}
                  value_txt={lastname_en ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {false}
                  onChangeText={(key)=>{
                    dataEmployee.idcardnumber = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  zIndex={90}
                  placeHolder={translang.t('PROFILE_idcard')}
                  label={translang.t('PROFILE_idcard')}
                  value_txt={dataEmployee.idcardnumber ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {false}
                  onChangeText={(key)=>{
                    dataEmployee.passportnumber = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  zIndex={89}
                  placeHolder={translang.t('PASSPORT_NUMBER')}
                  label={translang.t('PASSPORT_NUMBER')}
                  value_txt={dataEmployee.passportnumber ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {false}
                  onChangeText={(key)=>{
                    dataEmployee.passportcountry = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  zIndex={88}
                  placeHolder={translang.t('PASSPORT_COUNTRY')}
                  label={translang.t('PASSPORT_COUNTRY')}
                  value_txt={dataEmployee.passportcountry ?? ''}/>
                <TouchableOpacity onPress={()=>{this.setState({showDatePicker: true, selCalendarType: "ProfileBirthday"});}}>
                  <InfoTextInputItem
                    disable={false}
                    canSelect = {false}
                    zIndex={87}
                    placeHolder={translang.t('DDMMYYYY')}
                    label={translang.t('PROFILE_birthday')}
                    notouch = {true}
                    value_txt={birthday}/>
                </TouchableOpacity>
                

                <View style={{flexDirection: 'row', zIndex: 86}}>
                  <View style={{flex: 1, paddingleft: 10, paddingRight: 10}}>
                    <InfoTextInputItem
                      disable={false}
                      canSelect = {true}
                      selectList={this.state.bloodtypeList}
                      onSelectItem={(item) => {
                        dataEmployee.bloodtypeID = item.id;
                        dataEmployee.bloodtype = item.title;
                        this.setState({dataEmployee: dataEmployee});
                      }}
                      zIndex={84}
                      placeHolder={translang.t('USERINFO_bloodtype')}
                      label={translang.t('USERINFO_bloodtype')}
                      value_txt={dataEmployee.bloodtype ?? ''}/>
                  </View>
                  
                  <View style={{flex: 1, paddingleft: 10}}>
                    <InfoTextInputItem
                      disable={false}
                      canSelect = {true}
                      selectList={nationalList}
                      onSelectItem={(item) => {
                        dataEmployee.nationalityId = item.id;
                        dataEmployee.nationality = item.title;
                        this.setState({dataEmployee: dataEmployee});
                      }}
                      zIndex={83}
                      placeHolder={translang.t('PROFILE_Nationality')}
                      label={translang.t('PROFILE_Nationality')}
                      value_txt={dataEmployee.nationality ?? "" }/>
                  </View>
                </View>

                <View style={{flexDirection: 'row', zIndex: 85}}>
                  <View style={{flex: 1, paddingleft: 10, paddingRight: 10}}>
                  <InfoTextInputItem
                    disable={false}
                    canSelect = {true}
                    selectList={raceList}
                    onSelectItem={(item) => {
                      dataEmployee.raceId = item.id;
                      dataEmployee.race = item.title;
                      this.setState({dataEmployee: dataEmployee});
                    }}
                    zIndex={82}
                    placeHolder={translang.t('RACE')}
                    label={translang.t('RACE')}
                    value_txt={dataEmployee.race ?? ''}/>
                  </View>
                  
                  <View style={{flex: 1, paddingleft: 10}}>
                    <InfoTextInputItem
                      disable={false}
                      canSelect = {true}
                      selectList={religionList}
                      onSelectItem={(item) => {
                        dataEmployee.religionId = item.id;
                        dataEmployee.religion = item.title;
                        this.setState({dataEmployee: dataEmployee});
                      }}
                      zIndex={81}
                      placeHolder={translang.t('PROFILE_Religion')}
                      label={translang.t('PROFILE_Religion')}
                      value_txt={dataEmployee.religion ?? ''}/>
                  </View>
                </View>
                
                <InfoTextInputItem
                  disable={false}
                  canSelect = {true}
                  selectList={statusList}
                  onSelectItem={(item) => {
                    dataEmployee.personalStatusId = item.id;
                    dataEmployee.personalStatus = item.title;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  zIndex={82}
                  placeHolder={translang.t('MARITAL_TYPE')}
                  label={translang.t('MARITAL_TYPE')}
                  value_txt={dataEmployee.personalStatus ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {false}
                  onChangeText={(key)=>{
                    dataEmployee.fullname_supouse = key + " " + lastname_supouse;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  zIndex={81}
                  placeHolder={translang.t('SPOUSE_NAME')}
                  label={translang.t('SPOUSE_NAME')}
                  value_txt={firstname_supouse}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {false}
                  onChangeText={(key)=>{
                    dataEmployee.fullname_supouse = firstname_supouse + " " + key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  zIndex={80}
                  placeHolder={translang.t('SPOUSE_SURNAME')}
                  label={translang.t('SPOUSE_SURNAME')}
                  value_txt={lastname_supouse}/>

                <InfoTextInputItem
                  disable={false}
                  canSelect = {false}
                  onChangeText={(key)=>{
                    dataEmployee.phoneNumber = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  zIndex={79}
                  placeHolder={translang.t('PROFILE_phonenumber')}
                  label={translang.t('PROFILE_phonenumber')}
                  value_txt={dataEmployee.phoneNumber ?? ''}/>

                <InfoTextInputItem
                  disable={false}
                  canSelect = {false}
                  onChangeText={(key)=>{
                    dataEmployee.email = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  zIndex={78}
                  placeHolder={translang.t('PROFILE_email')}
                  label={translang.t('PROFILE_email')}
                  value_txt={dataEmployee.email ?? ''}/>

                <View style={{flexDirection:'row', justifyContent: 'center'}}>
                  <GradientButton
                    label={translang.t('COMMON_cancel')}
                    containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
                    buttonStyle={{ borderRadius: 22, height: 44 }}
                    colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
                    isVerticalGradient={false}
                    _onPress={() => {this.setState({isEditProfile: false}, ()=>{
                      this.loadData();
                    })}} 
                  />
                  <GradientButton
                    label={translang.t('SAVE')}
                    containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0, marginLeft: 30 }}
                    buttonStyle={{ borderRadius: 22, height: 44 }}
                    colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                    isVerticalGradient={false}
                    _onPress={() => {this.setState({isEditProfile: false})}} 
                  />
                </View>

              </View>}

              <View style={styles.partTitleContainer}>
                <Text style={styles.partTitleText}>{translang.t('PERMANENT_ADDRESS')}</Text>
                {!this.state.isEditHouseInfo && 
                <GradientButtonWithImg
                    label={translang.t('PROFILE_edit')}
                    iconImage={Images.n_ic_pencil_white}
                    containerStyle={{ width: 70, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
                    buttonStyle={{ borderRadius: 5, height: 25 }}
                    textStyle={{fontSize: 20, fontWeight: 'bold'}}
                    iconStyle={{width: 10, height: 10}}
                    colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                    isVerticalGradient={false}
                    _onPress={() => {this.setState({isEditHouseInfo: true})}} 
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
                  label={translang.t('LEAVE_district')}
                  value_txt={dataEmployee.district ?? ''}/>
                <InfoTextItem
                  label={translang.t('LEAVE_msg_district')}
                  value_txt={dataEmployee.subDistrict ?? ''}/>
                <InfoTextItem
                  label={translang.t('POSTAL_CODE')}
                  value_txt={dataEmployee.postalCode ?? ''}/>
              </View>}
              {this.state.isEditHouseInfo &&
              <View style={styles.partEditContainer}>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {false}
                  onChangeText={(key)=>{
                    dataEmployee.houseNo = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  zIndex={77}
                  placeHolder={translang.t('LEAVE_houseno')}
                  label={translang.t('LEAVE_houseno')}
                  value_txt={dataEmployee.houseNo ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {false}
                  onChangeText={(key)=>{
                    dataEmployee.villageNo = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  zIndex={76}
                  placeHolder={translang.t('MOO')}
                  label={translang.t('MOO')}
                  value_txt={dataEmployee.villageNo ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {false}
                  onChangeText={(key)=>{
                    dataEmployee.village = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  zIndex={75}
                  placeHolder={translang.t('VILAGE')}
                  label={translang.t('VILAGE')}
                  value_txt={dataEmployee.village ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {false}
                  onChangeText={(key)=>{
                    dataEmployee.lane = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  zIndex={74}
                  placeHolder={translang.t('SOI')}
                  label={translang.t('SOI')}
                  value_txt={dataEmployee.lane ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {false}
                  onChangeText={(key)=>{
                    dataEmployee.building = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  zIndex={73}
                  placeHolder={translang.t('BUILDING_FLOOR')}
                  label={translang.t('BUILDING_FLOOR')}
                  value_txt={dataEmployee.building ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {false}
                  onChangeText={(key)=>{
                    dataEmployee.road = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  zIndex={72}
                  placeHolder={translang.t('ADDR_ROAD')}
                  label={translang.t('ADDR_ROAD')}
                  value_txt={dataEmployee.road ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {true}
                  selectList={provinceList}
                  onSelectItem={(item) => {
                    const temp = dataEmployee;
                    temp.provinceId = item.id;
                    temp.province = item.title;
                    this.loadDistrict(item.id);
                    this.setState({dataEmployee: temp});
                  }}
                  zIndex={71}
                  placeHolder={translang.t('PROFILE_PROVINCE')}
                  label={translang.t('PROFILE_PROVINCE')}
                  value_txt={dataEmployee.province ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {true}
                  selectList={districtList}
                  onSelectItem={(item) => {
                    const temp = dataEmployee;
                    temp.districtId = item.id;
                    temp.district = item.title;
                    this.loadSubDistrict(dataEmployee.provinceId, item.id);
                    this.setState({dataEmployee: temp});
                  }}
                  zIndex={70}
                  placeHolder={translang.t('LEAVE_district')}
                  label={translang.t('LEAVE_district')}
                  value_txt={dataEmployee.district ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {true}
                  selectList={subdistrictList}
                  onSelectItem={(item) => {
                    const temp = dataEmployee;
                    temp.subDistrictId = item.id;
                    temp.subDistrict = item.title;
                    this.setState({dataEmployee: temp});
                  }}
                  zIndex={69}
                  placeHolder={translang.t('LEAVE_msg_district')}
                  label={translang.t('LEAVE_msg_district')}
                  value_txt={dataEmployee.subDistrict ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {false}
                  onChangeText={(key)=>{
                    dataEmployee.postalCode = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  zIndex={68}
                  placeHolder={translang.t('POSTAL_CODE')}
                  label={translang.t('POSTAL_CODE')}
                  value_txt={dataEmployee.postalCode ?? ''}/>

                <View style={{flexDirection:'row', justifyContent: 'center'}}>
                  <GradientButton
                    label={translang.t('COMMON_cancel')}
                    containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
                    buttonStyle={{ borderRadius: 22, height: 44 }}
                    colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
                    isVerticalGradient={false}
                    _onPress={() => {this.setState({isEditHouseInfo: false}, ()=>{
                      this.loadData();
                    })}} 
                  />
                  <GradientButton
                    label={translang.t('SAVE')}
                    containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0, marginLeft: 30 }}
                    buttonStyle={{ borderRadius: 22, height: 44 }}
                    colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                    isVerticalGradient={false}
                    _onPress={() => {this.setState({isEditHouseInfo: false})}} 
                  />
                </View>

              </View>}

              <View style={styles.partTitleContainer}>
                <Text style={styles.partTitleText}>{translang.t('CONTACT_ADDRESS')}</Text>
                {!this.state.isEditContactAddress && 
                <GradientButtonWithImg
                    label={translang.t('PROFILE_edit')}
                    iconImage={Images.n_ic_pencil_white}
                    containerStyle={{ width: 70, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
                    buttonStyle={{ borderRadius: 5, height: 25 }}
                    textStyle={{fontSize: 20, fontWeight: 'bold'}}
                    iconStyle={{width: 10, height: 10}}
                    colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                    isVerticalGradient={false}
                    _onPress={() => {this.setState({isEditContactAddress: true})}} 
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
                  label={translang.t('LEAVE_district')}
                  value_txt={dataEmployee.c_district ?? ''}/>
                <InfoTextItem
                  label={translang.t('LEAVE_msg_district')}
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
                  canSelect = {false}
                  onChangeText={(key)=>{
                    dataEmployee.c_houseNo = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  zIndex={67}
                  placeHolder={translang.t('LEAVE_houseno')}
                  label={translang.t('LEAVE_houseno')}
                  value_txt={dataEmployee.c_houseNo ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {false}
                  onChangeText={(key)=>{
                    dataEmployee.c_villageNo = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  zIndex={66}
                  placeHolder={translang.t('MOO')}
                  label={translang.t('MOO')}
                  value_txt={dataEmployee.c_villageNo ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {false}
                  onChangeText={(key)=>{
                    dataEmployee.c_village = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  zIndex={65}
                  placeHolder={translang.t('VILAGE')}
                  label={translang.t('VILAGE')}
                  value_txt={dataEmployee.c_village ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {false}
                  onChangeText={(key)=>{
                    dataEmployee.c_lane = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  zIndex={64}
                  placeHolder={translang.t('SOI')}
                  label={translang.t('SOI')}
                  value_txt={dataEmployee.c_lane ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {false}
                  onChangeText={(key)=>{
                    dataEmployee.c_building = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  zIndex={63}
                  placeHolder={translang.t('BUILDING_FLOOR')}
                  label={translang.t('BUILDING_FLOOR')}
                  value_txt={dataEmployee.c_building ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {false}
                  onChangeText={(key)=>{
                    dataEmployee.c_road = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  zIndex={62}
                  placeHolder={translang.t('ADDR_ROAD')}
                  label={translang.t('ADDR_ROAD')}
                  value_txt={dataEmployee.c_road ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {true}
                  selectList={provinceList}
                  onSelectItem={(item) => {
                    const temp = dataEmployee;
                    temp.c_provinceId = item.id;
                    temp.c_province = item.title;
                    this.loadDistrict(item.id);
                    this.setState({dataEmployee: temp});
                  }}
                  zIndex={61}
                  placeHolder={translang.t('PROFILE_PROVINCE')}
                  label={translang.t('PROFILE_PROVINCE')}
                  value_txt={dataEmployee.c_province ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {true}
                  selectList={districtList}
                  onSelectItem={(item) => {
                    const temp = dataEmployee;
                    temp.c_districtId = item.id;
                    temp.c_district = item.title;
                    this.loadSubDistrict(dataEmployee.c_provinceId, item.id);
                    this.setState({dataEmployee: temp});
                  }}
                  zIndex={60}
                  placeHolder={translang.t('LEAVE_district')}
                  label={translang.t('LEAVE_district')}
                  value_txt={dataEmployee.c_district ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {true}
                  selectList={subdistrictList}
                  onSelectItem={(item) => {
                    const temp = dataEmployee;
                    temp.c_subDistrictId = item.id;
                    temp.c_subDistrict = item.title;
                    this.setState({dataEmployee: temp});
                  }}
                  zIndex={59}
                  placeHolder={translang.t('LEAVE_msg_district')}
                  label={translang.t('LEAVE_msg_district')}
                  value_txt={dataEmployee.c_subDistrict ?? ''}/>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {false}
                  onChangeText={(key)=>{
                    dataEmployee.c_postalCode = key;
                    this.setState({dataEmployee: dataEmployee});
                  }}
                  zIndex={58}
                  placeHolder={translang.t('POSTAL_CODE')}
                  label={translang.t('POSTAL_CODE')}
                  value_txt={dataEmployee.c_postalCode ?? ''}/>

                <View style={{flexDirection:'row', justifyContent: 'center'}}>
                  <GradientButton
                    label={translang.t('COMMON_cancel')}
                    containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
                    buttonStyle={{ borderRadius: 22, height: 44 }}
                    colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
                    isVerticalGradient={false}
                    _onPress={() => {this.setState({isEditContactAddress: false}, ()=>{
                      this.loadData();
                    })}} 
                  />
                  <GradientButton
                    label={translang.t('SAVE')}
                    containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0, marginLeft: 30 }}
                    buttonStyle={{ borderRadius: 22, height: 44 }}
                    colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                    isVerticalGradient={false}
                    _onPress={() => {this.setState({isEditContactAddress: false})}} 
                  />
                </View>

              </View>}
              
              <View style={styles.partTitleContainer}>
                <Text style={styles.partTitleText}>{translang.t('FAMILY_INFORMATION')}</Text>
                <GradientButtonWithImg
                  label={translang.t('ADD')}
                  iconImage={Images.n_ic_plus_white}
                  containerStyle={{ width: 70, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
                  buttonStyle={{ borderRadius: 5, height: 25 }}
                  textStyle={{fontSize: 20, fontWeight: 'bold'}}
                  iconStyle={{width: 10, height: 10}}
                  colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                  isVerticalGradient={false}
                  _onPress={() => {this.setState({showAddFamilyFormModal: true})}} 
                />
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
                <GradientButtonWithImg
                  label={translang.t('ADD')}
                  iconImage={Images.n_ic_plus_white}
                  containerStyle={{ width: 70, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
                  buttonStyle={{ borderRadius: 5, height: 25 }}
                  textStyle={{fontSize: 20, fontWeight: 'bold'}}
                  iconStyle={{width: 10, height: 10}}
                  colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                  isVerticalGradient={false}
                  _onPress={() => {this.setState({showAddEducationInfoModal: true})}} 
                />
              </View>
              <FlatList 
                style={styles.menuContainer}
                data={dataEmployee.employeeEducationInfos}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => this.renderEducationInfoItem(index)}
                scrollEnabled={false}
              />

              <View style={styles.partTitleContainer}>
                <Text style={styles.partTitleText}>{translang.t('PROFILE_HONOR_INFORMATION')}</Text>
                <GradientButtonWithImg
                  label={translang.t('ADD')}
                  iconImage={Images.n_ic_plus_white}
                  containerStyle={{ width: 70, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
                  buttonStyle={{ borderRadius: 5, height: 25 }}
                  textStyle={{fontSize: 20, fontWeight: 'bold'}}
                  iconStyle={{width: 10, height: 10}}
                  colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                  isVerticalGradient={false}
                  _onPress={() => {this.setState({showAddHonorInfoModal: true})}} 
                />
              </View>
              <FlatList 
                style={styles.menuContainer}
                data={dataEmployee.employeeHonorInfos}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => this.renderHonorInfoItem(index)}
                scrollEnabled={false}
              />

              <View style={styles.partTitleContainer}>
                <Text style={styles.partTitleText}>{translang.t('TRAINING_EDUCATION_VISITING_INFORMATION')}</Text>
                <GradientButtonWithImg
                  label={translang.t('ADD')}
                  iconImage={Images.n_ic_plus_white}
                  containerStyle={{ width: 70, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
                  buttonStyle={{ borderRadius: 5, height: 25 }}
                  textStyle={{fontSize: 20, fontWeight: 'bold'}}
                  iconStyle={{width: 10, height: 10}}
                  colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                  isVerticalGradient={false}
                  _onPress={() => {this.setState({showAddTrainingInfoModal: true})}} 
                />
              </View>
              <FlatList 
                style={styles.menuContainer}
                data={dataEmployee.employeeTrainingInfos}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => this.renderTrainingInfoItem(index)}
                scrollEnabled={false}
              />
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
                value_txt={moment(dataEmployee.workInEducationDate).format('DD/MM/YYYY') ?? ''}/>
              <InfoTextItem
                label={translang.t('PROFILE_PACKING_ORDER_DATE')}
                value_txt={moment(dataEmployee.governmentOrderDate).format('DD/MM/YYYY') ?? ''}/>
              <InfoTextItem
                label={translang.t('PROFILE_OFFICIAL_START_DATE')}
                value_txt={moment(dataEmployee.workStartDate).format('DD/MM/YYYY') ?? ''}/>
              <InfoTextItem
                label={translang.t('PROFILE_RETIREMENT_DATE')}
                value_txt={moment(dataEmployee.retirementDate).format('DD/MM/YYYY') ?? ''}/>
              <InfoTextItem
                label={translang.t('PROFILE_REMAINING_SERVICE_LIFE')}
                value_txt={dataEmployee.remainingRetirementDays ?? ''}/>
              <InfoTextItem
                label={translang.t('PROFILE_SALARY')}
                value_txt={dataEmployee.netSalary ?? ''}/>
              <InfoTextItem
                label={translang.t('PROFILE_POSITION_ALLOWANCE')}
                value_txt={dataEmployee.positionMoney ?? ''}/>
              <InfoTextItem
                label={translang.t('PROFILE_AMOUNT_ACADEMY_STANDING')}
                value_txt={dataEmployee.academicStandingMoney ?? ''}/>
              <InfoTextItem
                label={translang.t('PROFILE_TOTAL_NET_INCOME')}
                value_txt={dataEmployee.tatalSalary ?? ''}/>
            </View>
            </>}
            {this.state.profileType == '3' && <>
              <View style={styles.partTitleContainer}>
                <Text style={styles.partTitleText}>{translang.t('OCCUPATIONAL_LICENSE')}</Text>
                <GradientButtonWithImg
                  label={translang.t('ADD')}
                  iconImage={Images.n_ic_plus_white}
                  containerStyle={{ width: 70, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
                  buttonStyle={{ borderRadius: 5, height: 25 }}
                  textStyle={{fontSize: 20, fontWeight: 'bold'}}
                  iconStyle={{width: 10, height: 10}}
                  colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                  isVerticalGradient={false}
                  _onPress={() => {this.setState({showAddLicenseInfoModal: true})}} 
                />
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
                <GradientButtonWithImg
                  label={translang.t('ADD')}
                  iconImage={Images.n_ic_plus_white}
                  containerStyle={{ width: 70, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
                  buttonStyle={{ borderRadius: 5, height: 25 }}
                  textStyle={{fontSize: 20, fontWeight: 'bold'}}
                  iconStyle={{width: 10, height: 10}}
                  colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                  isVerticalGradient={false}
                  _onPress={() => {this.setState({showAddInsignInfoModal: true})}} 
                />
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
        <ScrollView style={styles.centeredView} >
          <View style={{...styles.dialogStyle}}>
            <View style={{...styles.partTitleContainer, marginHorizontal: 0}}>
              <Text style={styles.partTitleText}>{translang.t('FAMILY_INFORMATION_FORM')}</Text>
            </View>
            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                tempAddFamilyInfo.relationship = key;
                this.setState({tempAddFamilyInfo: tempAddFamilyInfo});
              }}
              zIndex={30}
              placeHolder={translang.t('PROFILE_RELATIONSHIP')}
              label={translang.t('PROFILE_RELATIONSHIP')}
              value_txt={tempAddFamilyInfo.relationship ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect = {true}
              selectList={nameTitleList}
              onSelectItem={(item) => {
                tempAddFamilyInfo.nameTitleId = item.id;
                tempAddFamilyInfo.nameTitle = item.title;
                this.setState({tempAddFamilyInfo: tempAddFamilyInfo});
              }}
              zIndex={29}
              placeHolder={translang.t('SELECT_NAMETITLES')}
              label={translang.t('NAME_TITLES')}
              value_txt={tempAddFamilyInfo.nameTitle ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                tempAddFamilyInfo.fullname = key + " " + lastname_add_family;
                this.setState({tempAddFamilyInfo: tempAddFamilyInfo});
              }}
              zIndex={28}
              placeHolder={translang.t('USERINFO_name')}
              label={translang.t('USERINFO_name')}
              value_txt={firstname_add_family}/>

            <InfoTextInputItem
              disable={false}
              canSelect={false}
              onChangeText={(key)=>{
                tempAddFamilyInfo.fullname = firstname_add_family + " " + key
                this.setState({tempAddFamilyInfo: tempAddFamilyInfo});
              }}
              zIndex={27}
              placeHolder={translang.t('USERINFO_surname')}
              label={translang.t('USERINFO_surname')}
              value_txt={lastname_add_family}/>
            <TouchableOpacity onPress={()=>{this.setState({showDatePicker: true, selCalendarType: "AddFamily"});}}>
              <InfoTextInputItem
                disable={false}
                canSelect = {false}
                zIndex={26}
                placeHolder={translang.t('DDMMYYYY')}
                label={translang.t('PROFILE_birthday')}
                notouch={true}
                value_txt={moment(tempAddFamilyInfo.birthday).format('DD/MM/YYYY') ?? ''}/>
            </TouchableOpacity>
            
            
            <InfoTextInputItem
              disable={false}
              canSelect = {true}
              selectList={statusList}
              onSelectItem={(item) => {
                tempAddFamilyInfo.personalStatusId = item.id;
                tempAddFamilyInfo.personalStatus = item.title;
                this.setState({tempAddFamilyInfo: tempAddFamilyInfo});
              }}
              zIndex={25}
              placeHolder={translang.t('MARITAL_TYPE')}
              label={translang.t('MARITAL_TYPE')}
              value_txt={tempAddFamilyInfo.personalStatus ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                tempAddFamilyInfo.livingStatus = key;
                this.setState({tempAddFamilyInfo: tempAddFamilyInfo});
              }}
              zIndex={24}
              placeHolder={translang.t('LIVING_STATUS')}
              label={translang.t('LIVING_STATUS')}
              value_txt={tempAddFamilyInfo.livingStatus ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                tempAddFamilyInfo.deathStatus = key;
                this.setState({tempAddFamilyInfo: tempAddFamilyInfo});
              }}
              zIndex={23}
              placeHolder={translang.t('DEATH_STATUS')}
              label={translang.t('DEATH_STATUS')}
              value_txt={tempAddFamilyInfo.deathStatus ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                tempAddFamilyInfo.occupation = key;
                this.setState({tempAddFamilyInfo: tempAddFamilyInfo});
              }}
              zIndex={22}
              placeHolder={translang.t('FAMILY_OCCUPATION')}
              label={translang.t('FAMILY_OCCUPATION')}
              value_txt={tempAddFamilyInfo.occupation ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect = {true}
              selectList={educationList}
              onSelectItem={(item) => {
                tempAddFamilyInfo.educationId = item.id;
                tempAddFamilyInfo.education = item.title;
                this.setState({tempAddFamilyInfo: tempAddFamilyInfo});
              }}
              zIndex={21}
              placeHolder={translang.t('PROFILE_EDUCATION')}
              label={translang.t('PROFILE_EDUCATION')}
              value_txt={tempAddFamilyInfo.education ?? ''}/>

            <View style={{flexDirection:'row', justifyContent: 'center'}}>
              <GradientButton
                label={translang.t('COMMON_cancel')}
                containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
                buttonStyle={{ borderRadius: 22, height: 44 }}
                colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
                isVerticalGradient={false}
                _onPress={() => {this.setState({showAddFamilyFormModal: false})}} 
              />
              <GradientButton
                label={translang.t('ADD')}
                containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0, marginLeft: 30 }}
                buttonStyle={{ borderRadius: 22, height: 44 }}
                colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                isVerticalGradient={false}
                _onPress={() => {this.addFamilyInfo()}} 
              />
            </View>
          </View>
        </ScrollView>}

        {this.state.showAddEducationInfoModal && 
        <ScrollView style={styles.centeredView}  >
          <View style={{...styles.dialogStyle}}>
            <View style={{...styles.partTitleContainer, marginHorizontal: 0}}>
              <Text style={styles.partTitleText}>{translang.t('EDUCATION_INFORMATION_FORM')}</Text>
            </View>
            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                tempAddEducationInfo.institution = key;
                this.setState({tempAddEducationInfo: tempAddEducationInfo});
              }}
              zIndex={30}
              placeHolder={translang.t('PROFILE_EDUCATION_INSTITUTION')}
              label={translang.t('PROFILE_EDUCATION_INSTITUTION')}
              value_txt={tempAddEducationInfo.institution ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                tempAddEducationInfo.studyYear = key;
                this.setState({tempAddEducationInfo: tempAddEducationInfo});
              }}
              zIndex={29}
              placeHolder={translang.t('YYYY')}
              label={translang.t('GRADUATE_START_DATE')}
              value_txt={tempAddEducationInfo.studyYear ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                tempAddEducationInfo.graduationYear = key;
                this.setState({tempAddEducationInfo: tempAddEducationInfo});
              }}
              zIndex={28}
              placeHolder={translang.t('YYYY')}
              label={translang.t('GRADUATE_END_DATE')}
              value_txt={tempAddEducationInfo.graduationYear ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect = {true}
              selectList={educationList}
              onSelectItem={(item) => {
                tempAddEducationInfo.educationLevelId = item.id;
                tempAddEducationInfo.educationLevel = item.title;
                this.setState({tempAddEducationInfo: tempAddEducationInfo});
              }}
              zIndex={27}
              placeHolder={translang.t('PROFILE_EDUCATION')}
              label={translang.t('PROFILE_EDUCATION')}
              value_txt={tempAddEducationInfo.tempAddEducationInfo ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                tempAddEducationInfo.major = key;
                this.setState({tempAddEducationInfo: tempAddEducationInfo});
              }}
              zIndex={26}
              placeHolder={translang.t('MAJOR')}
              label={translang.t('MAJOR')}
              value_txt={tempAddEducationInfo.major ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                tempAddEducationInfo.minor = key;
                this.setState({tempAddEducationInfo: tempAddEducationInfo});
              }}
              zIndex={25}
              placeHolder={translang.t('MINOR')}
              label={translang.t('MINOR')}
              value_txt={tempAddEducationInfo.minor ?? ''}/>

            <View style={{flexDirection:'row', justifyContent: 'center'}}>
              <GradientButton
                label={translang.t('COMMON_cancel')}
                containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
                buttonStyle={{ borderRadius: 22, height: 44 }}
                colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
                isVerticalGradient={false}
                _onPress={() => {this.setState({showAddEducationInfoModal: false})}} 
              />
              <GradientButton
                label={translang.t('ADD')}
                containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0, marginLeft: 30 }}
                buttonStyle={{ borderRadius: 22, height: 44 }}
                colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                isVerticalGradient={false}
                _onPress={() => {this.addEducationInfo()}} 
              />
            </View>
          </View>
        </ScrollView>}

        {this.state.showAddHonorInfoModal && 
        <ScrollView style={styles.centeredView}  >
          <View style={{...styles.dialogStyle}}>
            <View style={{...styles.partTitleContainer, marginHorizontal: 0}}>
              <Text style={styles.partTitleText}>{translang.t('HONOR_INFORMATION_FORM')}</Text>
            </View>
            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                tempAddHonorInfo.honor = key;
                this.setState({tempAddHonorInfo: tempAddHonorInfo});
              }}
              zIndex={30}
              placeHolder={translang.t('PROFILE_HONOR_TYPE')}
              label={translang.t('PROFILE_HONOR_TYPE')}
              value_txt={tempAddHonorInfo.honor ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                tempAddHonorInfo.honorAgency = key;
                this.setState({tempAddHonorInfo: tempAddHonorInfo});
              }}
              zIndex={29}
              placeHolder={translang.t('PROFILE_DONATING_AGENCY')}
              label={translang.t('PROFILE_DONATING_AGENCY')}
              value_txt={tempAddHonorInfo.honorAgency ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                tempAddHonorInfo.honorYear = key;
                this.setState({tempAddHonorInfo: tempAddHonorInfo});
              }}
              zIndex={28}
              placeHolder={translang.t('PROFILE_YEAR_RECEIVED')}
              label={translang.t('PROFILE_YEAR_RECEIVED')}
              value_txt={tempAddHonorInfo.honorYear ?? ''}/>

              
            <View style={{flexDirection:'row', justifyContent: 'center'}}>
              <GradientButton
                label={translang.t('COMMON_cancel')}
                containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
                buttonStyle={{ borderRadius: 22, height: 44 }}
                colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
                isVerticalGradient={false}
                _onPress={() => {this.setState({showAddHonorInfoModal: false})}} 
              />
              <GradientButton
                label={translang.t('ADD')}
                containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0, marginLeft: 30 }}
                buttonStyle={{ borderRadius: 22, height: 44 }}
                colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                isVerticalGradient={false}
                _onPress={() => {this.addHonorInfo()}} 
              />
            </View>
          </View>
        </ScrollView>}

        {this.state.showAddTrainingInfoModal && 
        <ScrollView style={styles.centeredView}  >
          <View style={{...styles.dialogStyle}}>
            <View style={{...styles.partTitleContainer, marginHorizontal: 0}}>
              <Text style={styles.partTitleText}>{translang.t('TRAINING_EDUCATION_VISITING_INFORMATION_FORM')}</Text>
            </View>
            <InfoTextInputItem
              disable={false}
              canSelect = {true}
              selectList={trainingTypeList}
              onSelectItem={(item) => {
                tempAddTrainingInfo.trainingTypeId = item.id;
                tempAddTrainingInfo.trainingType = item.title;
                this.setState({tempAddTrainingInfo: tempAddTrainingInfo});
              }}
              zIndex={31}
              placeHolder={translang.t('PROFILE_TYPE')}
              label={translang.t('PROFILE_TYPE')}
              value_txt={tempAddEducationInfo.trainingType ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                tempAddTrainingInfo.projectName = key;
                this.setState({tempAddTrainingInfo: tempAddTrainingInfo});
              }}
              zIndex={30}
              placeHolder={translang.t('PROFILE_PROJECT')}
              label={translang.t('PROFILE_PROJECT')}
              value_txt={tempAddTrainingInfo.projectName ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                tempAddTrainingInfo.trainingName = key;
                this.setState({tempAddTrainingInfo: tempAddTrainingInfo});
              }}
              zIndex={29}
              placeHolder={translang.t('PROFILE_TRAINING_COURSE_NAME')}
              label={translang.t('PROFILE_TRAINING_COURSE_NAME')}
              value_txt={tempAddTrainingInfo.trainingName ?? ''}/>

            <View style={{flexDirection: 'row', zIndex: 86}}>
              <View style={{flex: 1, paddingleft: 10, paddingRight: 10}}>
                <TouchableOpacity onPress={()=>{this.setState({showDatePicker: true, selCalendarType: "AddStartTraining"});}}>
                  <InfoTextInputItem
                    disable={false}
                    canSelect = {false}
                    zIndex={28}
                    placeHolder={translang.t('DDMMYYYY')}
                    label={translang.t('PROFILE_TRAINING_START_DATE')}
                    notouch={true}
                    value_txt={moment(tempAddTrainingInfo.trainingStartDate).format('DD/MM/YYYY') ?? ''}/>
                </TouchableOpacity>
              </View>
              
              <View style={{flex: 1, paddingleft: 10}}>
                <TouchableOpacity onPress={()=>{this.setState({showDatePicker: true, selCalendarType: "AddEndTraining"});}}>
                  <InfoTextInputItem
                    disable={false}
                    canSelect = {false}
                    zIndex={27}
                    placeHolder={translang.t('DDMMYYYY')}
                    label={translang.t('PROFILE_TRAINING_END_DATE')}
                    notouch={true}
                    value_txt={moment(tempAddTrainingInfo.trainingEndDate).format('DD/MM/YYYY') ?? ''}/>
                </TouchableOpacity>
              </View>
            </View>

            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                tempAddTrainingInfo.trainingHours = key;
                this.setState({tempAddTrainingInfo: tempAddTrainingInfo});
              }}
              zIndex={28}
              placeHolder={translang.t('PROFILE_NUMBER_OF_HOURS')}
              label={translang.t('PROFILE_NUMBER_OF_HOURS')}
              value_txt={tempAddTrainingInfo.trainingHours ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                tempAddTrainingInfo.trainingPlace = key;
                this.setState({tempAddTrainingInfo: tempAddTrainingInfo});
              }}
              zIndex={26}
              placeHolder={translang.t('PROFILE_LOCATION')}
              label={translang.t('PROFILE_LOCATION')}
              value_txt={tempAddTrainingInfo.trainingPlace ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                tempAddTrainingInfo.trainingCountry = key;
                this.setState({tempAddTrainingInfo: tempAddTrainingInfo});
              }}
              zIndex={27}
              placeHolder={translang.t('PROFILE_COUNTRY')}
              label={translang.t('PROFILE_COUNTRY')}
              value_txt={tempAddTrainingInfo.trainingCountry ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                tempAddTrainingInfo.trainingProvince = key;
                this.setState({tempAddTrainingInfo: tempAddTrainingInfo});
              }}
              zIndex={25}
              placeHolder={translang.t('PROFILE_PROVINCE')}
              label={translang.t('PROFILE_PROVINCE')}
              value_txt={tempAddTrainingInfo.trainingProvince ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                tempAddTrainingInfo.expenses = key;
                this.setState({tempAddTrainingInfo: tempAddTrainingInfo});
              }}
              zIndex={25}
              placeHolder={translang.t('PROFILE_EXPENSES')}
              label={translang.t('PROFILE_EXPENSES')}
              value_txt={tempAddTrainingInfo.expenses ?? ''}/>
              
            <View style={{flexDirection:'row', justifyContent: 'center'}}>
              <GradientButton
                label={translang.t('COMMON_cancel')}
                containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
                buttonStyle={{ borderRadius: 22, height: 44 }}
                colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
                isVerticalGradient={false}
                _onPress={() => {this.setState({showAddTrainingInfoModal: false})}} 
              />
              <GradientButton
                label={translang.t('ADD')}
                containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0, marginLeft: 30 }}
                buttonStyle={{ borderRadius: 22, height: 44 }}
                colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                isVerticalGradient={false}
                _onPress={() => {this.addTrainingInfo()}} 
              />
            </View>
          </View>
        </ScrollView>}

        {this.state.showAddLicenseInfoModal && 
        <ScrollView style={styles.centeredView}  >
          <View style={{...styles.dialogStyle}}>
            <View style={{...styles.partTitleContainer, marginHorizontal: 0}}>
              <Text style={styles.partTitleText}>{translang.t('OCCUPATIONAL_LICENSE_FORM')}</Text>
            </View>
            <InfoTextInputItem
              disable={false}
              canSelect = {true}
              selectList={licenseTypeList}
              onSelectItem={(item) => {
                tempAddLicenseInfo.licenseTypeId = item.id;
                tempAddLicenseInfo.licenseType = item.title;
                this.setState({tempAddLicenseInfo: tempAddLicenseInfo});
              }}
              zIndex={31}
              placeHolder={translang.t('PROFILE_PROFESSIONAL_LICENSE_TYPE')}
              label={translang.t('PROFILE_PROFESSIONAL_LICENSE_TYPE')}
              value_txt={tempAddLicenseInfo.licenseType ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                tempAddLicenseInfo.licenseNo = key;
                this.setState({tempAddLicenseInfo: tempAddLicenseInfo});
              }}
              zIndex={30}
              placeHolder={translang.t('PROFILE_PROFESSIONAL_LICENSE_NUMBER')}
              label={translang.t('PROFILE_PROFESSIONAL_LICENSE_NUMBER')}
              value_txt={tempAddLicenseInfo.licenseNo ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                tempAddLicenseInfo.licenseName = key;
                this.setState({tempAddLicenseInfo: tempAddLicenseInfo});
              }}
              zIndex={29}
              placeHolder={translang.t('PROFILE_PROFESSIONAL_LICENSE_NAME')}
              label={translang.t('PROFILE_PROFESSIONAL_LICENSE_NAME')}
              value_txt={tempAddLicenseInfo.licenseName ?? ''}/>

            <TouchableOpacity onPress={()=>{this.setState({showDatePicker: true, selCalendarType: "AddLicenseIssueDate"});}}>
              <InfoTextInputItem
                disable={false}
                canSelect = {false}
                onChangeText={(key)=>{
                  tempAddLicenseInfo.licenseIssuedDate = key;
                  this.setState({tempAddLicenseInfo: tempAddLicenseInfo});
                }}
                zIndex={28}
                notouch={true}
                placeHolder={translang.t('DDMMYYYY')}
                label={translang.t('PROFILE_DATE_ISSUE_ACCOMPANYING_CERTIFICATE')}
                value_txt={moment(tempAddLicenseInfo.licenseIssuedDate).format('DD/MM/YYYY') ?? ''}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>{this.setState({showDatePicker: true, selCalendarType: "AddLicenseExpireDate"});}}>
              <InfoTextInputItem
                disable={false}
                canSelect = {false}
                onChangeText={(key)=>{
                  tempAddLicenseInfo.licenseExpireDate = key;
                  this.setState({tempAddLicenseInfo: tempAddLicenseInfo});
                }}
                zIndex={27}
                notouch={true}
                placeHolder={translang.t('DDMMYYYY')}
                label={translang.t('PROFILE_CERTIFICATE_EXPIRATION_DATE')}
                value_txt={moment(tempAddLicenseInfo.licenseExpireDate).format('DD/MM/YYYY') ?? ''}/>
            </TouchableOpacity>
            

            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                tempAddLicenseInfo.licenseAgencyIssued = key;
                this.setState({tempAddLicenseInfo: tempAddLicenseInfo});
              }}
              zIndex={26}
              placeHolder={translang.t('PROFILE_ORGANIZATION_ACCOMPANYING_CERTIFICATE')}
              label={translang.t('PROFILE_ORGANIZATION_ACCOMPANYING_CERTIFICATE')}
              value_txt={tempAddLicenseInfo.licenseAgencyIssued ?? ''}/>
              
            <View style={{flexDirection:'row', justifyContent: 'center'}}>
              <GradientButton
                label={translang.t('COMMON_cancel')}
                containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
                buttonStyle={{ borderRadius: 22, height: 44 }}
                colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
                isVerticalGradient={false}
                _onPress={() => {this.setState({showAddLicenseInfoModal: false})}} 
              />
              <GradientButton
                label={translang.t('ADD')}
                containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0, marginLeft: 30 }}
                buttonStyle={{ borderRadius: 22, height: 44 }}
                colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                isVerticalGradient={false}
                _onPress={() => {this.addLicenseInfo()}} 
              />
            </View>
          </View>
        </ScrollView>}

        {this.state.showAddInsignInfoModal && 
        <ScrollView style={styles.centeredView}  >
          <View style={{...styles.dialogStyle}}>
            <View style={{...styles.partTitleContainer, marginHorizontal: 0}}>
              <Text style={styles.partTitleText}>{translang.t('PROFILE_HISTORY_ROYAL_DECORATION_FORM')}</Text>
            </View>
            
            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                tempAddInsignInfo.insigniaYear = key;
                this.setState({tempAddInsignInfo: tempAddInsignInfo});
              }}
              zIndex={30}
              placeHolder={translang.t('YYYY')}
              label={translang.t('PROFILE_YEAR_RECEIVED')}
              value_txt={tempAddInsignInfo.insigniaYear ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                tempAddInsignInfo.insigniaGrade = key;
                this.setState({tempAddInsignInfo: tempAddInsignInfo});
              }}
              zIndex={29}
              placeHolder={translang.t('PROFILE_ROYAL_DECORATION_CLASS')}
              label={translang.t('PROFILE_ROYAL_DECORATION_CLASS')}
              value_txt={tempAddInsignInfo.insigniaGrade ?? ''}/>

            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                tempAddInsignInfo.insigniaPosition = key;
                this.setState({tempAddInsignInfo: tempAddInsignInfo});
              }}
              zIndex={28}
              placeHolder={translang.t('USERINFO_position')}
              label={translang.t('USERINFO_position')}
              value_txt={tempAddInsignInfo.insigniaPosition ?? ''}/>

            <View style={{flexDirection: 'row', zIndex: 86}}>
              <View style={{flex: 1, paddingleft: 10, paddingRight: 10}}>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {false}
                  onChangeText={(key)=>{
                    tempAddInsignInfo.insigniaBookNumber = key;
                    this.setState({tempAddInsignInfo: tempAddInsignInfo});
                  }}
                  zIndex={27}
                  placeHolder={translang.t('PROFILE_ROYAL_GOVERNMENT_VOLUME_NO')}
                  label={translang.t('PROFILE_ROYAL_GOVERNMENT_VOLUME_NO')}
                  value_txt={tempAddInsignInfo.insigniaBookNumber ?? ''}/>
              </View>
              
              <View style={{flex: 1, paddingleft: 10}}>
                <InfoTextInputItem
                  disable={false}
                  canSelect = {false}
                  onChangeText={(key)=>{
                    tempAddInsignInfo.insigniaPart = key;
                    this.setState({tempAddInsignInfo: tempAddInsignInfo});
                  }}
                  zIndex={26}
                  placeHolder={translang.t('PROFILE_ROYAL_GOVERNMENT_PART')}
                  label={translang.t('PROFILE_ROYAL_GOVERNMENT_PART')}
                  value_txt={tempAddInsignInfo.insigniaPart ?? ''}/>
              </View>
            </View>

            <InfoTextInputItem
              disable={false}
              canSelect = {false}
              onChangeText={(key)=>{
                tempAddInsignInfo.insigniaNumber = key;
                this.setState({tempAddInsignInfo: tempAddInsignInfo});
              }}
              zIndex={25}
              placeHolder={translang.t('PROFILE_ROYAL_GOVERNMENT_NO')}
              label={translang.t('PROFILE_ROYAL_GOVERNMENT_NO')}
              value_txt={tempAddInsignInfo.insigniaNumber ?? ''}/>

            <TouchableOpacity onPress={()=>{this.setState({showDatePicker: true, selCalendarType: "AddInsignRecordDate"});}}>
              <InfoTextInputItem
                disable={false}
                canSelect = {false}
                onChangeText={(key)=>{
                  tempAddInsignInfo.insigniaRecordDate = key;
                  this.setState({tempAddInsignInfo: tempAddInsignInfo});
                }}
                zIndex={24}
                notouch={true}
                placeHolder={translang.t('DDMMYYYY')}
                label={translang.t('PROFILE_DATED')}
                value_txt={moment(tempAddInsignInfo.insigniaRecordDate).format('DD/MM/YYYY') ?? ''}/>  
            </TouchableOpacity>

            <View style={{flexDirection:'row', justifyContent: 'center'}}>
              <GradientButton
                label={translang.t('COMMON_cancel')}
                containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
                buttonStyle={{ borderRadius: 22, height: 44 }}
                colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
                isVerticalGradient={false}
                _onPress={() => {this.setState({showAddInsignInfoModal: false})}} 
              />
              <GradientButton
                label={translang.t('ADD')}
                containerStyle={{ width: 116, marginTop: 30, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0, marginLeft: 30 }}
                buttonStyle={{ borderRadius: 22, height: 44 }}
                colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                isVerticalGradient={false}
                _onPress={() => {this.addInsignInfo()}} 
              />
            </View>
          </View>
        </ScrollView>}

        <ProfileModal
          isVisible={this.state.showModal}
          onPositivePress={() => this.setState({ showModal: false })}
          user={user}/>

        <CalendarModal
          isVisible={this.state.showDatePicker}
          type={'single'}
          onDateSelect={result => this.onDateSelect(result)} />

        <ProfileSelectModal
          isVisible={this.state.selItemShowable}
          listData = {this.state.selItemShowList}
          onListSelect={result => this.onChangeListItem(result)} />

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


  partContainer:{
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
  partEditContainer:{
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
    backgroundColor: Color.n_default_gray_light,
    borderRadius: 5,
    marginTop: 3,
    padding: 0,
  },
});
