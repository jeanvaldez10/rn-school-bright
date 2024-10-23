import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, ImageBackground, FlatList, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import NextButton from '../../components/NextButton';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import Images from '../../themes/Images';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import CustomRadioButtonItem from '../../components/CustomRadioButtonItem';
import _ from 'lodash';

import CustomTextSearch from '../../components/CustomTextSearch';


import ProgressHud from '../../components/ProgressHud';
import ApiManager from '../../managers/ApiManager';
import Storage from '../../managers/StorageManager';


export default class BroadcastIndiviDualScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isKind: "0",
      classID: '0',
      isLoading: false,
      userInfo: null,
      dataList: [],
      filteredData: [],
      selectedIds: [],
      deliveryFormat: null,
      recipient: null,
      showModal: false,
      modalBody: '',
      isSearching: false,
      searchKeyword: '',
      searchVal: '',
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const isKind = this.props.navigation.getParam('isKind');
      const classID = this.props.navigation.getParam('classID');
      const deliveryFormat = this.props.navigation.getParam('deliveryFormat');
      const recipient = this.props.navigation.getParam('recipient');
      const userInfo = this.props.navigation.getParam('userInfo');

      this.setState({userInfo: userInfo, deliveryFormat: deliveryFormat, recipient: recipient, selectedIds: [] }, () => {
        if(isKind == "0"){   //Teacher
          this.getAllTeachers();
        }else if(isKind == "1"){
          this.getAllEmployees();
        }else{
          this.getAllStudents(classID);
        }
      });
    });
  }

  componentWillUnmount = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }
    if(this.focusListener){
      this.focusListener.remove();
    }
  };

  back = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }

    // this.props.navigation.goBack();
    if (this.state.isSearching) {
      this.setState({isSearching: false, searchKeyword: ''});
    } else {
      const parentRoute = this.props.navigation.getParam('parent') ?? 'Broadcast';
      this.props.navigation.navigate(parentRoute);
    }
  };

  getAllTeachers = () => {
    this.setState({ isLoading: true });
    ApiManager.getTeacherAll(this.state.userInfo.SchoolID).then(data => {
      this.setState({ isLoading: false }, () => {
        let resultList = [];
        data.forEach(item => {
          let tempItem = {ID: item.emplyoeesid, nameEN: item.emplyoeesname, nameTH: item.emplyoeesname, sex: item.sex, profileImg: item.pic, code: ""}
          resultList.push(tempItem)
        });
        this.setState({dataList: resultList, filteredData: resultList, isKind: '0'})
      });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    })
  }

  getAllEmployees = () => {
    this.setState({ isLoading: true });
    ApiManager.getEmployeeAll(this.state.userInfo.SchoolID).then(data => {
      this.setState({ isLoading: false }, () => {
        let resultList = [];
        data.forEach(item => {
          let tempItem = {ID: item.emplyoeesid, nameEN: item.emplyoeesname, nameTH: item.emplyoeesname, sex: item.sex, profileImg: item.pic, code: ""}
          resultList.push(tempItem)
        });
        this.setState({dataList: resultList, filteredData: resultList, isKind: '1'})
      });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    })
  }

  getAllStudents = (classID) => {
    this.setState({ isLoading: true });
    let resultList = [];
    ApiManager.getStudentInClassroom(this.state.userInfo.SchoolID, classID).then(data => {
      this.setState({ isLoading: false }, () => {
        data.forEach(item => {
          const nameEn = item.FirstNameEN + " " + item.LastNameEN;
          const nameTh = item.FirstNameTH + " " + item.LastNameTH;
          let tempItem = {ID: item.studentid, nameEN: nameEn, nameTH: nameTh, sex: item.sex, profileImg: item.pic, code: item.student_Code, Student_State: item.Student_State}
          resultList.push(tempItem)
        });

        this.setState({dataList: resultList, filteredData: resultList, isKind: '2'})
      });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    })
  }

  __next = async () => {
    if (this.state.selectedIds.length === 0) {
      this.setState({ showModal: true, modalBody: translang.t('COMMON_msg_select_one') });
    } else {
      let params = { deliveryFormat: this.state.deliveryFormat, recipient: this.state.recipient, selectedIds: this.state.selectedIds, parent: 'BroadcastIndiviDual', userInfo: this.state.userInfo };
      this.props.navigation.navigate('BroadcastFillInfo', params);
    }
  };

  _onChangeSearchVal = (searchVal) => {
    let tempfiltered = [];
    this.state.dataList.forEach((data, index) => {
      if(this.state.isKind == "2"){
        if (data.nameEN.toLowerCase().includes(searchVal.toLowerCase()) || data.nameTH.toLowerCase().includes(searchVal.toLowerCase()) || data.code.toLowerCase().includes(searchVal.toLowerCase())) {
          tempfiltered.push(data)
        }
      }else{
        if (data.nameEN.toLowerCase().includes(searchVal.toLowerCase()) || data.nameTH.toLowerCase().includes(searchVal.toLowerCase())) {
          tempfiltered.push(data)
        }
      }
    });
    this.setState({searchVal: searchVal, isSearching: true, searchKeyword: searchVal, filteredData: tempfiltered});

  };

  onSelectItem = (item) => {
    let selectedIds = this.state.selectedIds;
    if (selectedIds.includes(item.ID)) {
      selectedIds = _.without(selectedIds, item.ID);
    } else {
      selectedIds.push(item.ID);
    }
    this.setState({ selectedIds });
  }

  renderItem = (item, index) => {
    const isSelected = this.state.selectedIds.includes(item.ID);
    const itemInfo = item;

    let name = itemInfo.nameTH;
    if(getCurrentLocale() == 'en'){
      name = itemInfo.nameEN.trim();
      if(name == ""){
        name = itemInfo.nameTH.trim();
      }
    }

    const nameArray = name.split(' ');
    let firstName = '';
    let lastName = '';
    if (nameArray.length > 0) {
      firstName = nameArray[0];
    }
    if (nameArray.length > 1) {
      lastName = nameArray[nameArray.length - 1];
    }

    let profileImage = itemInfo.sex === '0' ? Images.man_user : Images.women_user;
    if (itemInfo.profileImg) {
      profileImage = {uri: itemInfo.profileImg};
    }

    let enableState = true;
    if(this.state.isKind == '2' && itemInfo.Student_State != '0'){
      enableState = false;
    }
    if(enableState){
      return (
        <TouchableOpacity style={styles.listItem} onPress={() => this.onSelectItem(item)}>
          <Text style={styles.itemText}>{index + 1}.</Text>
          <Image source={profileImage} style={styles.itemAvatar}></Image>
          <View style={{flexDirection: 'column', flex: 1, height: '100%', justifyContent: 'space-around'}}>
            {this.state.isKind == '2' &&
            <Text style={styles.itemText}>{itemInfo.code}</Text>}
            <Text style={styles.itemText}>{firstName}</Text>
            <Text style={styles.itemText}>{lastName}</Text>
          </View>
          <CustomRadioButtonItem
            isSelected={isSelected}
            selectedColor={Color.n_button_gradient_green_start}
            disabled={true}
            radioSize={30} />
        </TouchableOpacity>
      );
    }else{
      return (
        <View style={{...styles.listItem, backgroundColor: Color.n_default_gray_light}}>
          <Text style={styles.itemText}>{index + 1}.</Text>
          <Image source={profileImage} style={styles.itemAvatar}></Image>
          <View style={{flexDirection: 'column', flex: 1, height: '100%', justifyContent: 'space-around'}}>
            {this.state.isKind == '2' &&
            <Text style={styles.itemText}>{itemInfo.code}</Text>}
            <Text style={styles.itemText}>{firstName}</Text>
            <Text style={styles.itemText}>{lastName}</Text>
          </View>
        </View>
      );
    }
  };

  render() {
    const isSelectedAll = 0 === this.state.selectedIds.length;
    const nextButtonColor = [Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]

    const { searchVal, isKind} = this.state;
    let strKind = "";
    let searchPlaceholder = translang.t('USERINFO_name');

    if(isKind == "0"){
      strKind = translang.t('TEACHERS');
    }else if(isKind == "1"){
      strKind = translang.t('EMPLOYEES');
    }else{
      strKind = translang.t('Students');
      searchPlaceholder = translang.t('SEARCH_Placeholder_namestudent');
    }

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_broadcast')}
          onMenuTap={() => this.back()}
        />

        <View style={styles.container}>
          <Text style={styles.title}>{translang.t('RECIPIENT')}{": " + strKind}</Text>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', height: 60, width: '100%', paddingHorizontal: 30,}}>
            <CustomTextSearch
              inputStyle={{
                fontSize: 27,
                borderColor: Color.n_default_brown,
              }}
              inputWrapperStyle={{
                height: 50,
                flex: 1,
                borderRadius: 25,
                borderColor: Color.n_default_orange,
                borderWidth: 1
              }}
              value={searchVal}
              onChangeText={this._onChangeSearchVal}
              placeholder={searchPlaceholder}
              placeholderTextColor={Color.n_default_orange}

              clickSearch={()=>{


              }}
            />
            <TouchableOpacity style={{width: 37, height: 45, marginLeft: 30}} onPress={() => {
                let tmp;
                if(this.state.isKind == 0){
                  tmp = this.state.dataList;
                }
                else{
                  tmp = this.state.dataList.filter(item=>item.Student_State == '0');
                }

                const Ids = tmp.map((value, index) => { return value.ID });
                if(isSelectedAll){
                  this.setState({selectedIds: Ids})
                }else{
                  this.setState({selectedIds: []})
                }
                console.log(this.state.selectedIds);
                }}>
              <Image source={Images.n_ic_selectAll} style={{width: '100%', height: '100%', resizeMode: 'contain'}}></Image>
            </TouchableOpacity>

          </View>
          <FlatList style={styles.list}
            data={this.state.filteredData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => this.renderItem(item, index)}
          />
          <NextButton
            label={translang.t('COMMON_next')}
            containerStyle={{width: '90%', marginLeft: 'auto', marginRight: 'auto', marginVertical: 15}}
            buttonStyle={{height: 75, borderRadius: 38 }}
            colors={nextButtonColor}
            isVerticalGradient={false}
            _onPress={() => this.__next()} />
        </View>

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.n_ic_warning}
          message={this.state.modalBody}
          buttonColors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
          isVerticalGradient={false}
          onClose={() => { this.setState({ showModal: false }) }}
        />
        <ProgressHud isVisible={this.state.isLoading} />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white
  },
  title: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    color: Color.n_default_orange,
    marginVertical: 10,
    marginHorizontal: 20,
  },
  list: {
    flex: 1,
    marginTop: 30,
  },
  listItem: {
    height: 100,
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    backgroundColor: Color.white,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
    marginVertical: 5,
    marginHorizontal: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  itemText: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    color: Color.n_default_gray,
  },
  itemAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 8,
  },
  buttonStyle: {
    width: '100%',
    height: 60,
    borderRadius: 5,
    backgroundColor: Color.green_button_next_color1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
});
