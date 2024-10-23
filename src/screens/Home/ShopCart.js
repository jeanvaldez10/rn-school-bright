import React from 'react';
import {
  Image,
  View,
  TouchableOpacity,
  FlatList,
  BackHandler,
  Modal,
  ScrollView,
  Dimensions
} from 'react-native';
import { Col, Text } from 'native-base';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import moment from 'moment';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import NumberFormat from 'react-number-format';

const VerticalItem = ({ topTxt, icon_mark, bottomTxt }) => {
  return (
    <View style={styles.downCardChild}>
      <View>
        <Image source={icon_mark} style={styles.itemIcon} />
      </View>
      <View >
        <Text style={styles.itemText}>{bottomTxt}</Text>
      </View>
    </View>

  );
};

const PlanItem = ({ noTxt, leftTxt, rightTxt }) => {
  return (
    <View style={styles.uperCardChild}>
      <View style={{ flexDirection:'row' }}>
        <Text style={[styles.listTextNo, {width: 50}]}>{noTxt}</Text>
        <Text style={styles.listTextLeft}>{leftTxt}</Text>
      </View>
      <TouchableOpacity
        style={styles.itemActions}>
        <Text style={styles.listTextRight}>
          {rightTxt}
        </Text>
      </TouchableOpacity>
    </View>
  );
};


export default class ShopCart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      productList: [],
      shop: {},
      userInfo: {},
      isLoading: false,
      isCompleted: false,
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
      const isCompleted = this.props.navigation.getParam('isCompleted') ?? false;
  
      this.setState({ userInfo, productList, shop, isCompleted });
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

    this.props.navigation.navigate('ShopInput', {refresh: false});

  };

  pay = () => {
    if (this.state.isCompleted) {
      this.props.navigation.goBack();
    } else {
      const productList = this.state.productList;
      const shop = this.state.shop;
      const params = { productList, shop, userInfo: this.state.userInfo };
      this.props.navigation.navigate('ShopPincode', params);
    }
  };

  renderItem = (index) => {
    const product = this.state.productList[index];
    
    return (
      <PlanItem
        noTxt={"X "+product.amount}
        leftTxt={product.product_name}
        rightTxt={product.price.toFixed(1)}
      />
    );
  }

  render() {
    const user = this.state.userInfo;
    let studentId = user.StudentId ?? '';
    const isStudent = studentId !== '';
    let profileImage = isStudent ? Images.student_01 : Images.teacher_02;
    let userName = (user.sName ?? '') + ' ' + (user.sLastname ?? '');

    const screenHeight = Dimensions.get('window').height - 30;

    if (user !== {}) {
      if (user.image !== null && user.image !== '') {
        profileImage = {uri: user.image};
      }
    }

    const date = moment().format('HH.mm น. DD MMM YYYY');
    let totalPrice = 0;

    this.state.productList.forEach((value) => {
      const price = value.price;
      const amount = value.amount;
      totalPrice = totalPrice + (price * amount);
    });

    const currency = getCurrentLocale() === 'th' ? 'บาท' : 'THB';

    return (
      <SafeAreaView style={{...styles.container}} edges={['right', 'left', 'top']}>
        <BackNavigationBar
          title={translang.t('DRAWER_shop')}
          onMenuTap={() => this.back()}
        />
        <ScrollView>
          <Text style={styles.caption}>{translang.t('SHOP_payment')}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 40, marginTop: 20}}>
            <VerticalItem
              icon_mark={profileImage}
              bottomTxt={userName}/>
            <Image source={Images.n_ic_arrow_right_green} style={{width: 35, resizeMode: 'contain'}}/>
            <VerticalItem
              icon_mark={Images.ic_shopping_cart_orange}
              bottomTxt={this.state.shop.shop_name ?? '-'}/>
          </View>

          <View style={styles.detailContainer}>
            <Text style={styles.detailDate}>{date}</Text>
            <Text style={{...styles.detailDate, fontSize: 28}}>{translang.t('DETAIL')}</Text>
            <View style={{height: 1, width: '100%', backgroundColor: Color.n_default_brown }}/>
            <FlatList 
              style={{marginTop: 10}}
              data={this.state.productList}
              scrollEnabled={false}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item, index}) => this.renderItem(index)}
            />
          </View>

          <View style={{...styles.captionRow, marginTop: 20}}>
            <Text style={{...styles.amountText, marginTop: 5}}>
              {translang.t('SHOP_amount')}
            </Text>
            <NumberFormat
              value={totalPrice.toFixed(2)}
              displayType={'text'}
              thousandSeparator={true}
              renderText={value => (<Text style={styles.amountText}>{value}</Text>)}/>
            
          </View>

          <TouchableOpacity style={styles.buttonStyle} activeOpacity={0.9}
            onPress={() => this.pay()}>
            <Text style={styles.paybutton}>{this.state.isCompleted ? translang.t('BACK_TO_MAIN_PAGE').toUpperCase() : translang.t('SHOP_payment')}</Text>
          </TouchableOpacity>
        </ScrollView>

      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    backgroundColor: Color.n_background_white,
    flex: 1,
  },

  caption: {
    fontFamily: 'THSarabunNew',
    fontSize: 30, 
    fontWeight: 'bold',
    textAlign: 'center', 
    color: Color.n_button_gradient_green_start,

    marginTop: 10,
  },

  downCardChild: {
    width: '45%',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  itemText: {
    height: 60,
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    marginTop: 15,
    color: Color.n_default_gray,
    textAlign: 'center',
  },

  itemIcon: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },

  detailContainer: {
    flex: 1,
    marginHorizontal: 15,
    marginTop: 20,
    padding: 15,
    borderRadius: 15,
    backgroundColor: Color.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },

  detailDate: {
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    fontWeight: 'bold',
    color: Color.n_scorpion,
  },

  uperCardChild: {
    flexDirection: 'row',
    paddingVertical: 5,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 5,
  },

  listTextNo: {
    fontFamily: 'THSarabunNew',
    fontSize: 18,
    fontWeight: 'bold',
    color: Color.n_button_gradient_green_start,
  },

  listTextLeft: {
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    fontWeight: 'bold',
    color: Color.n_default_gray,
  },

  listTextRight: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    color: Color.n_default_gray,
  },

  captionRow: {
    height: 50,
    marginHorizontal: 15,
    backgroundColor: Color.white,
    borderRadius: 20,
    marginVertical: 20,
    paddingHorizontal: 30,
    
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  amountText: {
    fontFamily: 'THSarabunNew',
    fontWeight: 'bold',
    fontSize: 24, 
    textAlign: 'center', 
    color: Color.n_button_gradient_green_start
  },

  buttonStyle: {
    width: '90%',
    height: 75,
    borderRadius: 38,
    backgroundColor: Color.green_button_next_color1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
    alignSelf: 'center'

  },
  paybutton: {
    fontFamily: 'THSarabunNew',
    color: Color.white,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 30,
  },
  
});
