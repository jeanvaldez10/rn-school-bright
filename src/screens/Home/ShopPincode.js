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
import translang, { getCurrentLocale } from '../../utils/language.utils';
import { JSHash, JSHmac, CONSTANTS } from "react-native-hash";
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import ProgressHud from '../../components/ProgressHud';

const OfferItem = ({ person, navigation, onCheckBoxPress }) => {
  return (
    <View>
      <TouchableOpacity
        onPress={() => navigation.navigate('TuitionHelp', { person })}>
        <View style={styles.uperCardChild}>
          <Image source={Images.folder} style={styles.itemIcon} />
          <View>
            <Text style={styles.itemText}>{person}</Text>
          </View>
          <TouchableOpacity
            onPress={() => onCheckBoxPress(person)}
            style={styles.itemActions}>
            <Text style={{ color: '#BE0B12', fontSize: 18, fontWeight: '700' }}>
              {' '}
              ...more{' '}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const MAX_PIN_CNT = 6;

export default class ShopPincode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pin: '',
      isLoading: false,
      showModal: false,
      modalBody: translang.t('SHOP_passincorrect'),
      productList: [],
      shop: {},
      userInfo: {},
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
      const productList = this.props.navigation.getParam('productList');
      const shop = this.props.navigation.getParam('shop');

      this.setState({ userInfo, productList, shop });
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

  onCheckBoxPress = (folder) => {

  };

  _renderItem = ({ item }) => {
    return (
      <OfferItem
        person={item}
        navigation={this.props.navigation}
        onCheckBoxPress={this.onCheckBoxPress}
      />
    );
  };

  back = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }

    // this.props.navigation.goBack();
    const productList = this.state.productList;
    const shop = this.state.shop;
    const params = { productList, shop };
    this.props.navigation.navigate('ShopCart', params);
  };

  onCompleted = () => {
    const productList = this.state.productList;
    const shop = this.state.shop;
    const params = { productList, shop, isCompleted: true };
    this.props.navigation.navigate('ShopPaymentDone', params);
  }

  hashMac = () => {
    const secret = 'ra7$K:L.]%';
    const pin = this.state.pin;
    JSHmac(pin, secret, CONSTANTS.HmacAlgorithms.HmacSHA256)
      .then(hash => {
        this.sendPayment(hash);
      })
      .catch(error => {
        console.log(error);
      })
  }

  sendPayment = (pinHash) => {
    const userInfo = this.state.userInfo;
    const shop = this.state.shop;
    const productList = this.state.productList;
    const promise = ApiManager.getPaymentReceiptWithPinCode(userInfo.ID, userInfo.SchoolID, shop.shop_id, productList, pinHash);

    this.setState({isLoading: true});
    promise.then(result => {
      this.setState({isLoading: false});
      console.log("result:", result);
      const status = result.status;
      const data = result.data;
      console.log("status:", status);
      if (status === 'Success') {
        this.setState({ showModal: true, modalBody: translang.t('COMPLETED') });
      } else if (status === 'not match data') {
        this.setState({ showModal: true, modalBody: translang.t('PASSWORD_INCORRECT') });
      } else if (status === 'not have pin code') {
        this.setState({ showModal: true, modalBody: translang.t('WRONG_PIN_CODE') });
      } else if (status === 'Low Money') {
        this.setState({ showModal: true, modalBody: translang.t('BALANCE_NOT_ENOUGH') });
      } else if (status === 'some of the product is not available') {
        this.setState({ showModal: true, modalBody: translang.t('NO_PROUDCT') });
      } else if (status === 'Daily used limit reached, ') {
        this.setState({ showModal: true, modalBody: translang.t('AMOUNT_EXCEED') });
      } else {
        this.setState({ showModal: true, modalBody: translang.t('PASSWORD_INCORRECT') });
      }
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  }

  onClickNum = (number) => {
    let pin = this.state.pin;
    pin = `${pin}${number}`;
    this.setState({ pin: pin }, () => {
      if (pin.length >= MAX_PIN_CNT) {
        this.hashMac();
        // this.setState({ showModal: true }); //it's test mode
      }
    });
  };

  onClickDelete = () => {
    let pin = this.state.pin;
    if (pin === '') {
      return;
    }
    pin = pin.slice(0, -1);
    this.setState({ pin: pin });
  };

  render() {
    const pinCnt = this.state.pin.length;

    const alertImage = this.state.modalBody === translang.t('COMPLETED') ? Images.checked : Images.n_close_circle;
    const alertButtonColor = this.state.modalBody === translang.t('COMPLETED') ? [Color.n_button_gradient_green_start, Color.n_button_gradient_green_end] : [Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end];

    return (
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_shop')}
          onMenuTap={() => this.back()}
        />

        <ScrollView >
          <View style={styles.dispcontainer}>
            <View style={styles.captionRow}>
              <Text style={styles.pinText}>{translang.t('SETTING_enterpincode_shop')}</Text>
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
              <View style={{ height: 100, flexDirection: 'row', justifyContent: 'space-between'}}>
                <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(4) }}><Text style={styles.eachNumTxt}>4</Text></TouchableOpacity>
                <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(5) }}><Text style={styles.eachNumTxt}>5</Text></TouchableOpacity>
                <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(6) }}><Text style={styles.eachNumTxt}>6</Text></TouchableOpacity>
              </View>
              <View style={{ height: 100, flexDirection: 'row', justifyContent: 'space-between'}}>
                <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(7) }}><Text style={styles.eachNumTxt}>7</Text></TouchableOpacity>
                <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(8) }}><Text style={styles.eachNumTxt}>8</Text></TouchableOpacity>
                <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(9) }}><Text style={styles.eachNumTxt}>9</Text></TouchableOpacity>
              </View>
              <View style={{ height: 100, flexDirection: 'row', justifyContent: 'space-between'}}>
                <TouchableOpacity style={{...styles.eachNumContainer, backgroundColor: Color.transparent}} activeOpacity={0.3} onPress={() => { this.onClickNum() }}><Text style={styles.eachNumTxt}></Text></TouchableOpacity>
                <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(0) }}><Text style={styles.eachNumTxt}>0</Text></TouchableOpacity>
                <TouchableOpacity style={{...styles.eachNumContainer, backgroundColor: Color.transparent}} activeOpacity={0.3} onPress={() => { this.onClickDelete() }}><Image source={Images.n_ic_arrow_left_orange} style={styles.icon} /></TouchableOpacity>
              </View>
            </View>
          </View>

        </ScrollView>

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={alertImage}
          message={this.state.modalBody}
          buttonColors={alertButtonColor}
          isVerticalGradient={false}
          onClose={() => {
            if (this.state.modalBody === translang.t('COMPLETED')) {
              this.setState({ showModal: false, pin: '' }, () => {
                this.onCompleted();
              })
            } else {
              this.setState({ showModal: false, pin: '' })
            }
          }}
        />
        <ProgressHud isVisible={this.state.isLoading} />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    height: '100%',
    backgroundColor: Color.n_background_white,
  },
  dispcontainer: {
    marginHorizontal: 5,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: Color.transparent,
    flex: 1,
    justifyContent: 'space-between',
  },
  itemIcon: {
    width: '25@ms',
    height: '25@ms',
  },
  uperCardChild: {
    flexDirection: 'row',
    marginHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  itemText: {
    color: '#000',
    fontSize: '14@ms',
  },
  itemActions: {
    position: 'absolute',
    right: 1,
    alignItems: 'center',
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
