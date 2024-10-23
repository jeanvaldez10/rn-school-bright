import React from 'react';
import {
  Image,
  View,
  TouchableOpacity,
  FlatList,
  BackHandler,
  Modal,
  ScrollView,
} from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';

import BackNavigationBar from '../../components/BackNavigationBar';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import { JSHash, JSHmac, CONSTANTS } from "react-native-hash";
import translang, { getCurrentLocale } from '../../utils/language.utils';
import ApiManager from '../../managers/ApiManager';
import Storage from '../../managers/StorageManager';
import ProgressHud from '../../components/ProgressHud';
const MAX_PIN_CNT = 6;

export default class SettingChangePincodeConfirm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmpin: '',
      newpin: '',
      oldpinhash: '',
      showModal: false,
      modalBody: translang.t('CONTACT_YOUER_SCHOOL_ADMIN'),
      userInfo: {},
      parent: "",
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

      const userInfo = this.props.navigation.getParam('userInfo');
      const oldhash = this.props.navigation.getParam('oldhash');
      const newp = this.props.navigation.getParam('newpin');
      const parent = this.props.navigation.getParam('parent');

      this.setState({userInfo: userInfo, oldpinhash: oldhash, newpin: newp, parent: parent, confirmpin: '',});
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
    // this.props.navigation.goBack();
    if(this.backhandler){
      this.backhandler.remove();
    }

    this.props.navigation.navigate(this.state.parent);
  };

  onClickNum = (number) => {
    let confirmpin = this.state.confirmpin;
    confirmpin = `${confirmpin}${number}`;
    this.setState({ confirmpin: confirmpin }, () => {
      if (confirmpin.length >= MAX_PIN_CNT) {
        let newpin = this.state.newpin;

        if(confirmpin === newpin){
          this.resetPassword(newpin)
        }else{
          this.setState({confirmpin: "", showModal: true, modalBody: translang.t('Password_not_match')})
        }
      }
    });
  };

  resetPassword = (newpin) =>{
    const userInfo = this.state.userInfo;
    let oldhash = this.state.oldpinhash;
    let userID = userInfo.ID;
    let schoolID = userInfo.SchoolID;

    const promise = ApiManager.getResetPassword(oldhash, newpin, userID, schoolID);

    this.setState({isLoading: true});

    promise.then(result => {
      this.setState({isLoading: false});
      let resMsg = result.resMessage;
      if(resMsg === "Success"){
        this.props.navigation.navigate(this.state.parent);
      }else{
        this.setState({showModal: true, modalBody: translang.t('CONTACT_YOUER_SCHOOL_ADMIN')});
      }
    }).catch(error => {
      this.setState({isLoading: false});
      this.setState({showModal: true, modalBody: translang.t('CONTACT_YOUER_SCHOOL_ADMIN')});

    })
  };

  onClickDelete = () => {
    let pin = this.state.confirmpin;
    if (pin === '') {
      return;
    }
    pin = pin.slice(0, -1);
    this.setState({ confirmpin: pin });
  };

  render() {
    const pinCnt = this.state.confirmpin.length;

    return (
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_changepincode')}
          onMenuTap={() => this.back()}
        />

        <ScrollView >
          <View style={styles.dispcontainer}>
            <View style={styles.captionRow}>
              <Text style={styles.pinText}>{translang.t('Password_confrim_again')}</Text>
            </View>

            <View style={[styles.captionRow, { flexDirection: 'row' }]}>
              <View style={[styles.radiobtn, pinCnt >= 1 && { backgroundColor: Color.n_default_orange }]}></View>
              <View style={[styles.radiobtn, pinCnt >= 2 && { backgroundColor: Color.n_default_orange }]}></View>
              <View style={[styles.radiobtn, pinCnt >= 3 && { backgroundColor: Color.n_default_orange }]}></View>
              <View style={[styles.radiobtn, pinCnt >= 4 && { backgroundColor: Color.n_default_orange }]}></View>
              <View style={[styles.radiobtn, pinCnt >= 5 && { backgroundColor: Color.n_default_orange }]}></View>
              <View style={[styles.radiobtn, pinCnt >= 6 && { backgroundColor: Color.n_default_orange }]}></View>
            </View>

            <View style={{ flex: 1, margin: 30, }}>
              <View style={{ height: 100, flexDirection: 'row', justifyContent: 'space-between'}}>
                <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(1) }}><Text style={styles.eachNumTxt}>1</Text></TouchableOpacity>
                <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(2) }}><Text style={styles.eachNumTxt}>2</Text></TouchableOpacity>
                <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(3) }}><Text style={styles.eachNumTxt}>3</Text></TouchableOpacity>
              </View>
              <View style={{ height: 100, flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(4) }}><Text style={styles.eachNumTxt}>4</Text></TouchableOpacity>
                <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(5) }}><Text style={styles.eachNumTxt}>5</Text></TouchableOpacity>
                <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(6) }}><Text style={styles.eachNumTxt}>6</Text></TouchableOpacity>
              </View>
              <View style={{ height: 100, flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(7) }}><Text style={styles.eachNumTxt}>7</Text></TouchableOpacity>
                <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(8) }}><Text style={styles.eachNumTxt}>8</Text></TouchableOpacity>
                <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(9) }}><Text style={styles.eachNumTxt}>9</Text></TouchableOpacity>
              </View>
              <View style={{ height: 100, flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity style={{...styles.eachNumContainer, backgroundColor: Color.transparent}} activeOpacity={0.3} onPress={() => { this.onClickNum() }}><Text style={styles.eachNumTxt}></Text></TouchableOpacity>
                <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(0) }}><Text style={styles.eachNumTxt}>0</Text></TouchableOpacity>
                <TouchableOpacity style={{...styles.eachNumContainer, backgroundColor: Color.transparent}} activeOpacity={0.3} onPress={() => { this.onClickDelete() }}><Image source={Images.n_ic_arrow_left_orange} style={styles.icon} /></TouchableOpacity>
              </View>
            </View>
          </View>

        </ScrollView>

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.alert_inbox}
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
    height: '100%',
    backgroundColor: Color.n_background_white
  },
  dispcontainer: {
    marginHorizontal: 5,
    marginVertical: 5,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flex: 1,
    justifyContent: 'space-between',
  },

  captionRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  pinText: {
    fontFamily: 'THSarabunNew',
    fontSize: 30,
    fontWeight: 'bold',
    color: Color.n_default_orange,
    textAlign: 'center',
    marginVertical: 10,
  },
  image: {
    height: 60,
    width: 60,
  },
  icon: {
    height: 25,
    width: 25,
  },
  radiobtn: {
    borderWidth: 1,
    borderRadius: 9,
    width: 18,
    height: 18,
    borderColor: Color.n_default_orange,
    marginHorizontal: 5,
  },
  eachNumContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: Color.n_default_brown,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eachNumTxt: {
    fontFamily: 'THSarabunNew',
    fontSize: 54,
    color: Color.white,
    textAlign: 'center'
  }
});
