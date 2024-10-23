import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import NextButton from '../../components/NextButton';
import Color from '../../constants/color';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import SelectListModal from '../../components/SelectListModal';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import CustomTextInput from '../../components/CustomTextInput';
import Images from '../../themes/Images';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import ApiManager from '../../managers/ApiManager';
import Storage from '../../managers/StorageManager';
import * as ImagePicker from 'react-native-image-picker';
import CheckBox from '@react-native-community/checkbox';
import CustomCheckButton from '../../components/CustomCheckButton';
import ImageView from "react-native-image-viewing";
import ProgressHud from '../../components/ProgressHud';

export default class LeaveInputScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      description: '',
      isLoading: false,
      showModal: false,
      modalBody: '',
      showProvinceModal: false,
      showAmphurModal: false,
      showDistrictModal: false,

      houseno: '',
      phonenumber: '',
      province: "",
      amphur: "",
      district: "",

      userInfo: {},
      type: '',
      leaveReason: -1,
      leaveDate: '',
      leaveToDate: '',
      leaveSeasonIndex: -1,
      provinceList: [],
      districtList: [],
      subDistrictList: [],

      attachedImages: [],
      showAttachImages: [],
      showImageView: false,
      selImageIndex: 0,

      ischeckRemember: false,
      AddressInfo: {}
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", async () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
      console.log("LeaveInputScreen");
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const type = this.props.navigation.getParam('type');
      const leaveReason = this.props.navigation.getParam('leaveReason');
      const leaveDate = this.props.navigation.getParam('leaveDate');
      const leaveToDate = this.props.navigation.getParam('leaveToDate');
      const leaveSeasonIndex = this.props.navigation.getParam('leaveSeasonIndex');
      const userInfo = this.props.navigation.getParam('userInfo');

      const isRemember = await Storage.getRememberAddrStatus();
      const AddressInfo = await Storage.getAddrInfo();

      province = "";
      amphur = "";
      district = "";
      houseno = "";
      phonenumber = "";

      if(isRemember){
        province = AddressInfo.province;
        amphur = AddressInfo.amphur;
        district = AddressInfo.district;
        houseno = AddressInfo.houseno;
        phonenumber = AddressInfo.phonenum;
      }

      this.setState({userInfo: userInfo, type: type, leaveReason: leaveReason, leaveDate: leaveDate, leaveToDate: leaveToDate, leaveSeasonIndex: leaveSeasonIndex, ischeckRemember: isRemember, AddressInfo: AddressInfo, province: province, amphur: amphur, district: district, houseno: houseno, phonenumber: phonenumber}, () => {
        this.getProvinceData();
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
    //this.props.navigation.goBack();
    if(this.backhandler){
      this.backhandler.remove();
    }

    const from = this.props.navigation.getParam('type') ?? 'App';
    this.props.navigation.navigate(from);
  };

  __next = async () => {
    const { ischeckRemember, province, amphur, district, description, houseno, phonenumber } = this.state;

    if (description === '') {
      this.setState({ showModal: true, modalBody: translang.t('LEAVE_msg_pleasefill') });
      return;
    }

    Storage.setRememberAddrStatus(ischeckRemember);

    const temp = {province: province, amphur: amphur, district: district,  houseno: houseno, phonenum: phonenumber };
    if(ischeckRemember){
      Storage.seetAddrInfo(temp);

    }

    const params = {
      sender: this.state.userInfo,
      type: this.state.type,
      leaveReason: this.state.leaveReason,
      leaveDate: this.state.leaveDate,
      leaveToDate: this.state.leaveToDate,
      leaveSeasonIndex: this.state.leaveSeasonIndex,
      province: province,
      amphur: amphur,
      district: district,
      description: description,
      house: houseno,
      phonenumber: phonenumber,
      attachedImages: this.state.attachedImages,
      showAttachedImages: this.state.showAttachImages,
    };
    this.props.navigation.navigate('LeaveHistory', params);
  };

  getProvinceData = () => {
    const { userInfo } = this.state;

    ApiManager.getProvinceList(userInfo.SchoolID).then(provinceList => {
      this.setState({ provinceList });
    }).catch(error => {
      console.log(error);
    })
  };

  getDistrictData = () => {
    const { userInfo, provinceList, province } = this.state;

    if (province === "") {
      return;
    }

    const idx = provinceList.findIndex((item)=> item.PROVINCE_NAME == province);
    const selItem = provinceList[idx];

    ApiManager.getDistrictList(userInfo.SchoolID, selItem.PROVINCE_ID).then(districtList => {
      this.setState({ districtList });
    }).catch(error => {
      console.log(error);
    })
  };

  getSubDistrictData = () => {
    const { userInfo, districtList, amphur } = this.state;
    if (amphur === "") {
      return;
    }
    const idx = districtList.findIndex((item)=> item.AMPHUR_NAME == amphur);
    const selItem = districtList[idx];

    ApiManager.getSubDistrictList(userInfo.SchoolID, selItem.AMPHUR_ID).then(subDistrictList => {
      this.setState({ subDistrictList });
    }).catch(error => {
      console.log(error);
    })
  };

  _onChangeHouse = (hs) => {
    this.setState({ houseno: hs });
  };

  _onChangePhonenumber = (pn) => {
    this.setState({ phonenumber: pn });
  };

  _onChangeProvince = () => {
    this.setState({
      showProvinceModal: true,
    });
  };

  onProvinceSelect = (item, index) => {
    if (item == null) {
      this.setState({ showProvinceModal: false })
    } else {
      this.setState({ showProvinceModal: false, province: item.title }, () => {
        this.getDistrictData();
      });
    }
  };

  _onChangeAmphur = () => {
    this.setState({
      showAmphurModal: true,
    });
  };
  onAmphurSelect = (item, index) => {
    if (item == null) {
      this.setState({ showAmphurModal: false })
    } else {
      this.setState({ showAmphurModal: false, amphur: item.title }, () => {
        this.getSubDistrictData();
      })
    }
  };

  _onChangeDistrict = () => {
    this.setState({
      showDistrictModal: true,
    });
  };
  onDistrictSelect = (item, index) => {
    if (item == null) {
      this.setState({ showDistrictModal: false });
    } else {
      this.setState({ showDistrictModal: false, district: item.title });
    }
  };

  _onChangeDescription = (description) => {
    this.setState({ description: description });
  };
  _onChangeAttachImage = () => {
    const options = {
      mediaType: 'photo',
      selectionLimit: 0,
    }

    console.log("ImagePicker:", ImagePicker);

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.assets) {
        let requestCnt = 0;
        let uris = this.state.attachedImages;
        let showUris = this.state.showAttachImages;

        if(uris.length + response.assets.length > 10){
          this.setState({ showModal: true, modalBody: translang.t('CANTSELECT_LIMIT') });
          return;
        }
        this.setState({isLoading: true});
        response.assets.forEach(item=>{
          if(item.fileSize > 25000000){
            this.setState({ showModal: true, modalBody: translang.t('OVERSIZE_ALERT'), isLoading: false });
            return;
          }

          ApiManager.uploadImage("leave", this.state.userInfo.SchoolID, item).then(data => {
            uris.push({FileType: data[0].FileType, FileURL: data[0].FileURL});
            showUris.push({uri: data[0].FileURL});
            requestCnt = requestCnt + 1;
            if(requestCnt == response.assets.length){
              this.setState({isLoading: false, attachedImages: uris, showAttachImages: showUris});
            }
          }).catch(error => {
            console.log("uploadImage", error);
            this.setState({isLoading: false});
          });
        });
      }
    });
  };

  renderAttachImages = (item, index) => {
    return (
      <TouchableOpacity style={{position: 'relative', marginVertical: 10, marginRight: 10}} key={index} onPress={()=>this.setState({showImageView: true, selImageIndex: index})} >
        <Image style={{width: 50, height: 70}} source={{uri: item.uri}} />
        <TouchableOpacity style={{position: 'absolute', top: -10, right: -10}} onPress={()=> this.setState({attachedImages: this.state.attachedImages.filter((item, idex)=> idex != index), showAttachImages: this.state.showAttachImages.filter((item, idex)=> idex != index)})} >
          <Image source={Images.n_close_circle} style={{width: 20, height: 20, resizeMode: 'contain'}}/>
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }

  setSelection = () =>{
    this.setState({ischeckRemember: !this.state.ischeckRemember});
  }

  render() {
    const {province, amphur, district, provinceList, districtList, subDistrictList, description, houseno, phonenumber } = this.state;

    const _provinceList = provinceList.map(province => {
      return { value: province.PROVINCE_ID, title: province.PROVINCE_NAME }
    });
    const _districtList = districtList.map(district => {
      return { value: district.AMPHUR_ID, title: district.AMPHUR_NAME }
    });
    const _subDistrictList = subDistrictList.map(subDistrict => {
      return { value: subDistrict.DISTRICT_ID, title: subDistrict.DISTRICT_NAME }
    });

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_leave')}
          onMenuTap={() => this.back()}
        />

        <ScrollView style={styles.containerScroll}>

          <Text style={{ ...styles.title }}>{translang.t('LEAVE_description')}</Text>
          <CustomTextInput
            inputWrapperStyle={{
              marginBottom: 15,
              borderColor: Color.n_default_orange,
              borderBottomWidth: 1,
            }}
            value={description}
            placeholder={translang.t('LEAVE_msg_pleasefill')}
            placeholderTextColor={Color.n_scorpion}
            onChangeText={this._onChangeDescription}
          />

          <View>
            <Text style={{ ...styles.title }}>{translang.t('HOMEWORK_attachimg')}</Text>
            <TouchableOpacity onPress={this._onChangeAttachImage} style={{marginBottom: 10,}}>
              <View style={styles.attachBtn}>
                <Text style={styles.buttonText}>{translang.t('CHOOSE_IMAGE')}</Text>
              </View>
            </TouchableOpacity>
            <FlatList
              data={this.state.showAttachImages}
              keyExtractor={(item, index) => index.toString()}
              ItemSeparatorComponent={this.ItemSeparatorView}
              renderItem={({item, index}) => this.renderAttachImages(item, index)}
              horizontal
            />
            <Text style={{color: Color.n_default_orange, fontFamily: 'THSarabunNew', fontSize: 18, fontWeight: 'bold',}}>{translang.t("FileSizeDes")}</Text>
          </View>

          <View style={{flexDirection:'row', justifyContent: 'center'}}>
            <Text style={{ ...styles.title, flex: 1 }}>{translang.t('LEAVE_address')}</Text>
            <View style={{...styles.checkboxContainer, flex: 1}}>
              <CustomCheckButton
                isSelected={this.state.ischeckRemember}
                onPress={() => this.setSelection()}
                checkboxSize={20}
                text={translang.t('Remember')}
                textColor = {Color.n_default_orange}
                itemTextStyle={styles.checkboxlabel}
              />
            </View>
          </View>
          <View style={styles.uperCardChild}>
            <View style={{ flex: 1}}>
              <Text style={styles.itemText}>{translang.t('LEAVE_houseno')}</Text>
            </View>
            <TouchableOpacity style={[styles.itemActions]}>
              <CustomTextInput
                inputWrapperStyle={{
                  marginBottom: 0,
                  borderColor: Color.n_default_orange,
                  borderBottomWidth: 1,
                }}
                value={houseno}
                placeholder={translang.t('LEAVE_msg_house')}
                placeholderTextColor={Color.n_default_gray}
                onChangeText={this._onChangeHouse}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.uperCardChild}>
            <View style={{ flex: 1}}>
              <Text style={styles.itemText}>{translang.t('LEAVE_province')}</Text>
            </View>
            <TouchableOpacity style={[styles.itemActions]} onPress={this._onChangeProvince}>
              <CustomTextInput
                inputWrapperStyle={{
                  marginBottom: 0,
                  borderColor: Color.n_default_orange,
                  borderBottomWidth: 1,
                }}
                notouch="true"
                value={province}
                placeholder={translang.t('LEAVE_msg_province')}
                placeholderTextColor={Color.n_default_gray}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.uperCardChild}>
            <View style={{ flex: 1}}>
              <Text style={styles.itemText}>{translang.t('LEAVE_amphur')}</Text>
            </View>
            <TouchableOpacity style={[styles.itemActions]} onPress={this._onChangeAmphur}>
              <CustomTextInput
                inputWrapperStyle={{
                  marginBottom: 0,
                  borderColor: Color.n_default_orange,
                  borderBottomWidth: 1,
                }}
                notouch="true"
                value={amphur}
                placeholder={translang.t('LEAVE_msg_amphur')}
                placeholderTextColor={Color.n_default_gray}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.uperCardChild}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemText}>{translang.t('LEAVE_district')}</Text>
            </View>
            <TouchableOpacity style={[styles.itemActions]} onPress={this._onChangeDistrict}>
              <CustomTextInput
                inputWrapperStyle={{
                  marginBottom: 0,
                  borderColor: Color.n_default_orange,
                  borderBottomWidth: 1,
                }}
                notouch="true"
                value={district}
                placeholder={translang.t('LEAVE_msg_district')}
                placeholderTextColor={Color.n_default_gray}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.uperCardChild}>
            <View style={{ flex: 1, }}>
              <Text style={styles.itemText}>{translang.t('LEAVE_phonenumber')}</Text>
            </View>
            <TouchableOpacity style={[styles.itemActions]}>
              <CustomTextInput
                inputWrapperStyle={{
                  marginBottom: 0,
                  borderColor: Color.n_default_orange,
                  borderBottomWidth: 1,
                }}
                value={phonenumber}
                placeholder={translang.t('LEAVE_phonenumber')}
                placeholderTextColor={Color.n_default_gray}
                onChangeText={this._onChangePhonenumber}
              />
            </TouchableOpacity>
          </View>

          <NextButton
          label={translang.t('COMMON_next')}
          containerStyle={styles.buttonStyle}
          buttonStyle={{ borderRadius: 40}}
          colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
          isVerticalGradient={false}
          _onPress={() => this.__next()} />

        </ScrollView>

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.alert_inbox}
          title=' '
          message={this.state.modalBody}
          buttonColors={[Color.red_orange]}
          onClose={() => { this.setState({ showModal: false }) }}
        />

        <SelectListModal
          isVisible={this.state.showProvinceModal}
          onListSelect={this.onProvinceSelect}
          listData={_provinceList}
          dialogTtitle={translang.t('LEAVE_msg_province')}
        />

        <SelectListModal
          isVisible={this.state.showAmphurModal}
          onListSelect={this.onAmphurSelect}
          listData={_districtList}
          dialogTtitle={translang.t('LEAVE_amphur')}
        />

        <SelectListModal
          isVisible={this.state.showDistrictModal}
          onListSelect={this.onDistrictSelect}
          listData={_subDistrictList}
          dialogTtitle={translang.t('LEAVE_msg_district')}
        />

        <ImageView
          images={this.state.showAttachImages}
          imageIndex={this.state.selImageIndex}
          visible={this.state.showImageView}
          onRequestClose={() => this.setState({showImageView: false, selImageIndex: 0})}
        />

      <ProgressHud isVisible={this.state.isLoading} />

      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({

  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
  },

  containerScroll: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },

  attachBtn: {
    width: 140,
    height: 46,
    borderRadius: 23,
    backgroundColor: Color.n_default_orange,

    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    color: Color.white,
    textAlign: 'center',
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    fontWeight: 'bold',
  },

  bigContainer: {
    marginHorizontal: 5,
    marginVertical: 5,

    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: 'white',
    shadowColor: 'black',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  nextbutton: {
    color: Color.white,
    textAlign: 'center',
    fontFamily: 'THSarabunNew',
    fontSize: 25,
    fontWeight: 'bold',
  },
  bottombuttonStyle: {
    width: '100%',
    height: 60,
    borderRadius: 5,
    backgroundColor: Color.green_button_next_color1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
    position: 'absolute',
    bottom: 0,
  },
  title: {
    fontFamily: 'THSarabunNew',
    fontSize: 25,
    fontWeight: 'bold',
    color: Color.n_default_orange,
    marginBottom: 10,
  },
  img2: {
    width: 50,
    height: 50,
  },
  selectValueText: {
    fontFamily: 'THSarabunNew',
    fontSize: 25,
    marginVertical: 30,
  },
  uperCardChild: {
    flexDirection: 'row',
    marginLeft: 5,
    marginRight: 5,
    paddingVertical: 5,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  itemText: {
    color: Color.n_default_gray,
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    fontWeight: 'bold',
  },
  itemActions: {
    flex: 1,
  },

  buttonStyle:{
    width: 290,
    marginVertical:20,
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  checkboxContainer: {
    flexDirection: "row",
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
  },
  checkboxlabel: {
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});
