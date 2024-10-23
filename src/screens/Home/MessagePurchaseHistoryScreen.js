import React from 'react';
import {
  Image,
  View,
  TouchableOpacity,
  FlatList,
  BackHandler,
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
import moment from 'moment';

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

export default class MessagePurchaseHistoryScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      productList: [],
    };
  }

  handleBackButton = () => {
    return true;
  };

  async componentDidMount() {
    const { navigation } = this.props;
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    this.focusListener = navigation.addListener("didFocus", () => {
      const productList = this.props.navigation.getParam('productList');
      this.setState({productList});
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


  pay = () => {
    this.props.navigation.navigate('Shop');
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
    const date = moment().format('DD MMMM YYYY   HH.mm');
    let totalPrice = 0;

    this.state.productList.forEach((value) => {
      const price = value.price;
      const amount = value.amount;
      totalPrice = totalPrice + (price * amount);
    });

    return (
      <SafeAreaView style={{...styles.container}} edges={['right', 'left', 'top']}>
        <Image source={Images.n_imgage_shop_payment_done_back} style={{position: 'absolute', left: 0, top: 0, right: 0, height: '70%', resizeMode: 'stretch'}}/>

        <Image source={Images.n_img_complete_white} style={{width: 50, height: 50, resizeMode: 'contain', marginTop: 40}}/>
        <Text style={styles.caption}>{translang.t('PAYMENT_DONE')}</Text>
       
        <View style={styles.detailContainer}>
          <View style={styles.dateContainer}>
            <Text style={styles.detailDate}>{date}</Text>
          </View>
          <View style={{paddingHorizontal: 20, flexDirection: 'column', flex: 1}}>
            <Text style={styles.detailTitle}>{translang.t('DETAIL')}</Text>
            <View style={{height: 1, width: '100%', backgroundColor: Color.n_default_brown,}}/>
            <FlatList 
              style={{marginTop: 10}}
              data={this.state.productList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item, index}) => this.renderItem(index)}
            />

            <View style={{...styles.captionRow, marginVertical: 20}}>
              <Text style={{...styles.amountText, marginTop: 5}}>
                {translang.t('SHOP_amount')}
              </Text>
              <Text style={styles.amountText}>{totalPrice.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-end', width: '90%'}}>
          <TouchableOpacity style={styles.buttonStyle} activeOpacity={0.9}
            onPress={() => this.pay()}>
            <Text style={styles.paybutton}>{translang.t('HOME_close')}</Text>
          </TouchableOpacity>
        </View>
        

      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    backgroundColor: Color.n_background_white,
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
  },

  caption: {
    fontFamily: 'THSarabunNew',
    fontSize: 30, 
    fontWeight: 'bold',
    textAlign: 'center', 
    color: Color.white,
    marginTop: 20,
  },

  detailContainer: {
    height: '50%',
    width: '80%',
    flexDirection: 'column',
    marginTop: 20,
    borderRadius: 45,
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
  dateContainer:{
    height: 60,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    backgroundColor: Color.n_science_blue,
    overflow: 'hidden',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailDate: {
    fontFamily: 'THSarabunNew',
    fontSize: 30,
    fontWeight: 'bold',
    color: Color.white,
  },

  detailTitle: {
    height: 50,
    fontFamily: 'THSarabunNew',
    fontSize: 28,
    fontWeight: 'bold',
    color: Color.n_default_gray,
    marginTop: 20,
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
    width: '100%',
    height: 75,
    borderRadius: 38,
    backgroundColor: Color.green_button_next_color1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    
    
    marginBottom: 10,

  },
  paybutton: {
    fontFamily: 'THSarabunNew',
    color: Color.white,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 30,
  },
  
});
