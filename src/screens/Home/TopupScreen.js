import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, Modal, AppState } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import { ScrollView } from 'react-native-gesture-handler';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import IconInfoItem from '../../components/IconInfoItem';
import TopupIconInfoItem from '../../components/IconInfoItem_OneLine';
import TopupAmountModal from '../../components/TopupAmountModal';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import moment from 'moment';
import NumberFormat from 'react-number-format';
import GradientButton from '../../components/GradientButton';
import CustomCheckButton from '../../components/CustomCheckButton';
import NetInfo from "@react-native-community/netinfo";
import OfflineModal from '../../components/AlertWithImageModal';

export default class TopupScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      showModalOffline: false,
      modalBody: '',
      showErrorModal: false,
      userInfo: {},
      isLoading: false,

      showAlertModal: false,
      checkShowWeek: false,
      rememberCheckStatus: false,
      appState: AppState.currentState,
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  unsubscribe = null;

  async componentDidMount() {

    // this.unsubscribe = NetInfo.addEventListener(state => {
    //   console.log("R");
    //   if(!state.isConnected){
    //     this.setState({showModalOffline: true, modalBody: translang.t('ALERT_OFFLINE') });
    //   }
    // });

    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", async () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      console.log("Topup Screen");

      const userInfo = await Storage.getUserInfo();
      // await this.loadUserInfo();
      const statusAlert = await Storage.getStatusTopupAlert();

      let alertS = true;
      let alertR = false;

      if(statusAlert != null || statusAlert != undefined){
        if(statusAlert||statusAlert.status){
          alertR = statusAlert.status
          var timeDifferenceInDay = moment().diff(moment(statusAlert.date), 'days');
          if(timeDifferenceInDay<=7 && alertR){
            alertS = false
          }
        }
      }
      this.setState({ userInfo: userInfo, showAlertModal: alertS, rememberCheckStatus: alertR });
    });

    AppState.addEventListener("change", this._handleAppStateChange);
  }

  componentWillUnmount = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }
    if(this.focusListener){
      this.focusListener.remove();
    }
    if(this.unsubscribe){
      this.unsubscribe && this.unsubscribe();
      this.willFocusSubscription();
    }
    AppState.removeEventListener("change", this._handleAppStateChange);
  };

  _handleAppStateChange = nextAppState => {
    if (
        this.state.appState.match(/inactive|background/) &&
        nextAppState === "active"
    ) {
      console.log("App has come to the foreground!");
      this.loadUserInfo();
    }
    this.setState({ appState: nextAppState });
  };

  loadUserInfo = () => {
    this.setState({isLoading: true});
    Storage.getUser().then(user => {
      const userId = user.ID;
      const schoolId = user.SchoolId;
      return ApiManager.getUserInfo(userId, schoolId);
    }).then(userInfo => {
      this.setState({userInfo: userInfo, isLoading: false});
      console.log("UserInfo updated");
    }).catch(error => {
      console.log("UserInfo error", error);
      this.setState({isLoading: false});
    });
  }

  back = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }

    this.props.navigation.goBack();
  };

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
  };

  onClickSomePrice = (amount) => {
    if(amount > 50000){
      return;
    }

    this.setState({ showModal: false });
    this.props.navigation.navigate('TopupDetails', { amount: amount, userInfo: this.state.userInfo});
  };

  onClickOther = () => {
    this.setState({ showModal: true });
  };

  onClickAlertClose = ()=>{
    let temp = {status: false, date: moment()};
    if(this.state.checkShowWeek){
      temp.status = true;
    }else{
      temp.status = this.state.rememberCheckStatus;
    }
    Storage.setStatusTopupAlert(temp);
    this.setState({showAlertModal: false, checkShowWeek: false});
  }

  render() {
    const user = this.state.userInfo;
    let studentId = user.StudentId ?? '';
    const isStudent = studentId !== '';
    let profileImage = isStudent ? Images.student_01 : Images.teacher_02;
    let userName = user.sName + " " + user.sLastname;
    if(getCurrentLocale() == 'en' && user.NameEn != "" && user.NameEn != null){
      userName = user.NameEn + ' ' + user.LastNameEN;
    }


    if (user !== {}) {
      if (user.image !== null && user.image !== '') {
        profileImage = {uri: user.image};
      }
    }

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_topup')}
          onMenuTap={() => this.back()}
          is_help={true}
          onHelpTap={()=>this.setState({showAlertModal: true})}
        />

        <View style={styles.container}>
          <View style={{...styles.infoContainer}}>
            <Image style={styles.imgProfile} source={profileImage}></Image>
            <View style = {styles.infoNameContainer}>
              <Text style={{fontFamily: 'THSarabunNew', fontWeight: 'bold', fontSize: 24, color: Color.n_default_gray}}>{userName}</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{fontFamily: 'THSarabunNew', fontWeight: 'bold', fontSize: 20, color: Color.n_default_orange}}>{translang.t('USERINFO_balance')}</Text>
                <NumberFormat
                  value={user.nMoney}
                  displayType={'text'}
                  thousandSeparator={true}
                  renderText={(value) => {
                    return(
                      <Text style={{fontFamily: 'THSarabunNew', fontWeight: 'bold', fontSize: 30, color: Color.n_default_orange, marginLeft: 20}}>{value}</Text>
                    )
                  }} />
                <Text style={{fontFamily: 'THSarabunNew', fontWeight: 'bold', fontSize: 20, color: Color.n_default_orange, marginLeft: 5}}>{}</Text>
              </View>
            </View>
          </View>

          <ScrollView style={styles.menuContainer} indicatorStyle={'black'}>
            <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickSomePrice(50) }} >
              <TopupIconInfoItem
                icon_mark={Images.n_ic_currency_dollar_orange}
                label={translang.t('TOPUP_tu50')}
                imageSize={40}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickSomePrice(100) }} >
              <TopupIconInfoItem
                icon_mark={Images.n_ic_currency_dollar_orange}
                label={translang.t('TOPUP_tu100')}
                imageSize={40}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickSomePrice(200) }} >
              <TopupIconInfoItem
                icon_mark={Images.n_ic_currency_dollar_orange}
                label={translang.t('TOPUP_tu200')}
                imageSize={40}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickSomePrice(300) }} >
              <TopupIconInfoItem
                icon_mark={Images.n_ic_currency_dollar_orange}
                label={translang.t('TOPUP_tu300')}
                imageSize={40}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickSomePrice(400) }} >
              <TopupIconInfoItem
                icon_mark={Images.n_ic_currency_dollar_orange}
                label={translang.t('TOPUP_tu400')}
                imageSize={40}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickSomePrice(500) }} >
              <TopupIconInfoItem
                icon_mark={Images.n_ic_currency_dollar_orange}
                label={translang.t('TOPUP_tu500')}
                imageSize={40}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickOther(null) }} >
              <TopupIconInfoItem
                icon_mark={Images.n_ic_currency_dollar_orange}
                label={translang.t('TOPUP_other')}
                imageSize={40}
              />
            </TouchableOpacity>

          </ScrollView>
        </View>

        <TopupAmountModal
          isVisible={this.state.showModal}
          onClose={() => { this.setState({ showModal: false }) }}
          description = {translang.t("TOPUP_AMOUNT_NOTICE")}
          onOK={(amount) => { this.onClickSomePrice(parseFloat(amount)) }}
          onError={() => { }}
        />

        <AlertWithImageModal
          isVisible={this.state.showErrorModal}
          image={Images.alert_inbox}
          title=' '
          message={translang.t('TOPUP_msg_inputamount')}
          buttonColors={[Color.red_orange, Color.soft_red]}
          isVerticalGradient={false}
          onClose={() => { this.setState({ showErrorModal: false }) }}
        />

        <OfflineModal
          isVisible={this.state.showModalOffline}
          image={Images.alert_inbox}
          title=' '
          message={this.state.modalBody}
          buttonColors={[Color.red_orange, Color.soft_red]}
          isVerticalGradient={false}
          onClose={() => { this.setState({ showErrorModal: false }) }}
        />

        {this.state.showAlertModal &&
        <Modal
          animationType='fade'
          transparent={true}
          key="modal">
          <View style={styles.centeredView} >
            <View style={{...styles.dialogStyle}}>
              <Text style={[styles.text]}>{translang.t('TOPUP_ALERT')}</Text>

              <CustomCheckButton
                isSelected={this.state.checkShowWeek}
                onPress={() => this.setState({checkShowWeek: !this.state.checkShowWeek})}
                checkboxSize={20}
                text={translang.t('DONT_SHOW_AGAIN_WEEK')}
                textColor={Color.n_default_gray}
                itemTextStyle={styles.checkbox}
                alignCenter={false}
              />

              <View style={{height: 1,  backgroundColor: Color.n_default_orange, marginHorizontal: 0, marginVertical: 20}} />

              <GradientButton
                label={translang.t('COMMON_close') }
                containerStyle={styles.buttonContainer}
                buttonStyle={{borderRadius: 0}}
                colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                textStyle={{fontSize: 24, fontWeight: 'bold'}}
                isVerticalGradient={false}
                _onPress={() => { this.onClickAlertClose()}} />
            </View>
          </View>
        </Modal>}

      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({

  container: {
    flex: 1,
    backgroundColor: Color.n_background_white
  },

  infoContainer: {
    width: '100%',
    height: 120,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    backgroundColor: Color.white,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 2,

    paddingHorizontal: 25,
  },

  imgProfile: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },

  infoNameContainer:{
    padding: 20
  },
  menuContainer: {
    marginTop: 25,
    paddingHorizontal: 0,
  },
  menuEachStyle: {
    height: 60,
    borderRadius: 15,
    marginLeft: 15,
    marginRight: 15,
    backgroundColor: Color.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 2,
    paddingHorizontal: 35,

    marginBottom: 15,
  },


  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000070',
  },
  dialogStyle: {
    width: '350@ms',
    padding: '20@ms',

    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 5,
    },
    shadowOpacity: 0.25,
    elevation: 5,
    overflow: 'hidden',
    backgroundColor: 'white',
  },

  title:{
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Color.n_default_gray,

  },
  text: {
    fontSize: "18@ms",
    fontWeight: 'bold',
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray,
    marginBottom: 20,
  },

  checkbox: {
    fontSize: "18@ms",
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray,
  },

  buttonContainer: {
    width: 126,
    height: 44,
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center'
  },
});
