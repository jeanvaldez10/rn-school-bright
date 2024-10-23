import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, ImageBackground, ScrollView} from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import GradientButton from '../../components/GradientButton';
import Color from '../../constants/color';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import CustomModal from '../../components/CustomModal';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import Images from '../../themes/Images';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import GetLocation from 'react-native-get-location'
import ApiManager from '../../managers/ApiManager';
import Storage from '../../managers/StorageManager';
import { getDistance } from 'geolib';
import ProgressHud from '../../components/ProgressHud';
import moment from 'moment';


export default class PickupScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showModal: false,
      modalBody: null,
      modalImage: Images.n_img_complete_green,

      userInfo: {},

      currentLat: 0,
      currentLng: 0,
      destLat: 0,
      destLng: 0,
      distance: 0,

      isDoneCalc: false,
      isAvaliableConfirm: false,
      isLeave: false,

      // isPicked: false,
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  unsubscribe = null;

  async componentDidMount() {
    // this.unsubscribe = NetInfo.addEventListener(state => {
    //   console.log("I");
    //   if(!state.isConnected){
    //     this.setState({showModal: true, modalBody: translang.t('ALERT_OFFLINE') });
    //   }
    // });

    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

    const userInfo = await Storage.getUserInfo();
    const pickupdate = await Storage.getPickupDate();

    // let isPicked = false;
    // if(pickupdate){
    //   var timeDifferenceInDay = moment().diff(moment(pickupdate), 'days');
    //   if(timeDifferenceInDay==0){
    //     isPicked = true
    //   }else{
    //     isPicked = false;
    //   }
    // }else{
    //   isPicked = false;
    // }

    this.setState({userInfo: userInfo}, ()=>{
      this.onRefresh();
    })
  }

  componentWillUnmount = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }
    if(this.focusListener){
      this.focusListener.remove();
    }
    // this.unsubscribe();
  };

  back = () => {
    this.props.navigation.goBack();
  };

  onRefresh = ()=>{
    this.setState({isDoneCalc: false, isAvaliableConfirm: false});
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    })
    .then(location => {
      console.log(location);
        this.setState({currentLat: location.latitude, currentLng: location.longitude}, ()=>{
          this.getSchoolLocation();
        });
    })
    .catch(error => {
      console.log("getCurrentPosition", error);
      this.setState({isDoneCalc: true});
        const { code, message } = error;
    })
  }

  getSchoolLocation = ()=>{
    const schoolid = this.state.userInfo.SchoolID;
    const sid = this.state.userInfo.ID;

    ApiManager.getSchoolLocation(schoolid, sid).then(res => {
      this.setState({destLat: res.latitude ?? 0, destLng: res.longitude ?? 0}, ()=>{
        var dis = getDistance(
          {latitude: this.state.currentLat, longitude: this.state.currentLng},
          {latitude: this.state.destLat, longitude: this.state.destLng},
        );

        let isAvaliable = false;

        if(dis <= res.radius*1000) {
          isAvaliable = true;
        }

         if(!res.isActive){
          this.setState({distance: dis, isDoneCalc: true, isAvaliableConfirm: isAvaliable, showModal: true, modalBody: translang.t('PICKUP_NOT_AVAILABLE'), modalImage: Images.n_ic_warning});
          return;
        }

        if(res.isLeave == 1){
          this.setState({isLeave:true ,distance: dis, isDoneCalc: true, isAvaliableConfirm: isAvaliable, showModal: true, modalBody: translang.t('PICKUP_LEAVE'), modalImage: Images.n_ic_warning});
          return;
        }

        if(!isAvaliable){
          this.setState({distance: dis, isDoneCalc: true, isAvaliableConfirm: isAvaliable, showModal: true, modalBody: translang.t('PICKUP_OUT_SCHOOL_COME_CLOSER'), modalImage: Images.n_ic_warning});
          return;
        }
        else{
          this.setState({distance: dis, isDoneCalc: true, isAvaliableConfirm: isAvaliable,});
        }

      })
    }).catch(error => {
      console.log(error);
      this.setState({isDoneCalc: true});
    });
  }

  setPackup = ()=>{
    const schoolid = this.state.userInfo.SchoolID;
    const sid = this.state.userInfo.ID;
    this.setState({isLoading: true})
    ApiManager.getAnnouncementLocation(schoolid, sid, "1").then(res => {
      if(res.status == 'ok'){
        Storage.setPickupDate(moment());
        this.setState({isLoading: false, showModal: true, modalBody: translang.t('COMMON_success')});
      }else{
        this.setState({isLoading: false, showModal: true, modalBody: translang.t('PICUP_ALERT'), modalImage: Images.n_ic_warning});
      }
    }).catch(error => {
      console.log(error);
      this.setState({isLoading: false});
    });
  }

  __next = async () => {
    this.setPackup();
  };

  render() {
    const { selectedPickupReason } = this.state;
    let leave_reason = '';
    if (selectedPickupReason != null) {
      leave_reason = selectedPickupReason.name;
    }

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_pickup')}
          onMenuTap={() => this.back()}
        />

        <ScrollView style={styles.container}>
          {this.state.isDoneCalc && <>
            {this.state.isAvaliableConfirm && <View >
              <View style={{height: 90, marginTop: 30}}>
                <Text style={{textAlign: 'center', fontFamily: 'THSarabunNew', fontSize: 30, fontWeight: 'bold', color: Color.n_default_orange}}>{translang.t('PICKUP_IN_SCHOOL')}</Text>
                <Text style={{textAlign: 'center', fontFamily: 'THSarabunNew', fontSize: 20, fontWeight: 'bold', color: Color.n_default_orange}}>{translang.t('WANT_PACK_UP')}</Text>
              </View>
              <Image style={{resizeMode: 'contain', width: '100%',}} source={Images.n_pickup_car} />
            </View>}
            {!this.state.isAvaliableConfirm && <View>
              <View style={{height: 90, marginTop: 30}}>
                <Text style={{textAlign: 'center', fontFamily: 'THSarabunNew', fontSize: 30, fontWeight: 'bold', color: Color.n_default_orange}}>{translang.t('PICKUP_OUT_SCHOOL')}</Text>
              </View>
              <Image style={{resizeMode: 'contain', width: '100%',}} source={Images.n_pickup_car} />
            </View>}
          </>}

          {!this.state.isDoneCalc && <View>
            <Image style={{resizeMode: 'contain', width: '100%',}} source={Images.n_gif_pickup} />
          </View>}

          <View style={{ height: 90, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <Text style={{ ...styles.title2, textAlign: 'center' }}>{`${(this.state.distance/1000).toFixed(2)} Km`}</Text>
            {!this.state.isAvaliableConfirm &&
            <TouchableOpacity style={{ position: 'absolute', right: 15, }}
              onPress={this.onRefresh}>
              <Image style={{ ...styles.refresh_btn }} source={Images.n_ic_refresh} />
            </TouchableOpacity>}
          </View>

          {(this.state.isAvaliableConfirm) && (!this.state.isLeave) &&
          <TouchableOpacity
            style={{...styles.buttonStyle, backgroundColor: Color.n_button_gradient_green_start}} activeOpacity={0.9}
            onPress={() => this.__next()}
          >
            <Text style={{...styles.nextbutton}}>{translang.t('CONFIRM_PACK_UP')}</Text>
          </TouchableOpacity>}

        </ScrollView>

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={this.state.modalImage}
          message={this.state.modalBody}
          buttonColors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
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
    backgroundColor: Color.n_background_white,
  },
  bigContainer: {
    flex: 1,
    marginHorizontal: 5,
    marginVertical: 5,
    // padding: 15,
    borderRadius: 5,
    shadowColor: 'black',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextbutton: {
    fontFamily: 'THSarabunNew',
    color: Color.white,
    textAlign: 'center',
    fontSize: 30,
  },
  buttonStyle: {
    width: 290,
    height: 75,
    borderRadius: 38,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  title2: {
    fontFamily: 'THSarabunNew',
    fontSize: 40,
    fontWeight: 'bold',
    marginVertical: 5,
    color: Color.n_default_orange,
  },
  selectValueText: {
    fontFamily: 'THSarabunNew',
    fontSize: 25,
    marginVertical: 30,
  },
  refresh_btn: {
    height: 35,
    width: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,

  },
});
