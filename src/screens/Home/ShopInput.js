import React, { useState, useEffect } from 'react';
import {
  Image,
  View,
  TouchableOpacity,
  FlatList,
  BackHandler,
  Modal,
  ScrollView,
  Text,
} from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import dimension from '../../constants/dimension';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import IconInfoItemNoImg from '../../components/IconInfoItemNoImg';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import NextButton from '../../components/NextButton';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import CustomTextView from '../../components/CustomTextView';
import ProgressHud from '../../components/ProgressHud';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import moment from 'moment';
import CustomTextSearch from '../../components/CustomTextSearch';
import LinearGradient from 'react-native-linear-gradient';

const OfferItem = ({ prodct, addfunc, expandable, clickItem, amount_props }) => {
  const [amount, setAmount] = useState(prodct.amount);

  return (
    <View style={styles.uperCardChild}>
      <TouchableOpacity
        onPress={() => {
          setAmount(amount_props)
          clickItem()
          }}>
        <View>
          <IconInfoItemNoImg
            label={prodct.product_name}
            value_txt={`${prodct.price}`}
            right_text = {prodct.amount==0?``:`X ${prodct.amount}`}
            topTextStyle={styles.title1}
            bottomTextStyle={styles.value1}
            rightTextStyle={styles.valueright}
            imageSize={60}
          />

          {expandable && <View style={{ paddingHorizontal: 30, justifyContent: 'center', paddingBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{width: '50%', flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity
                  onPress={() => {
                    if(amount >= 1) 
                      setAmount(amount=>amount-1);
                  }}>
                  <Image source={Images.ic_delete} style={styles.img} />
                </TouchableOpacity>

                <CustomTextView
                  inputWrapperStyle={{
                    flex: 1, alignItems: 'center'
                  }}
                  textStyle={{fontSize: 25}}
                  val_text={amount}
                />
                <TouchableOpacity
                  onPress={() => {
                    setAmount(amount=>amount+1)
                  }} >
                  <Image source={Images.ic_add} style={styles.img} />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                onPress={()=>{
                  addfunc(amount)
                }} >
                  <LinearGradient 
                    colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]} 
                    style={{width: 100, borderRadius: 20,}}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Text style={{marginVertical: 5, fontSize: 20, fontFamily: 'THSarabunNew', color: 'white', textAlign: 'center', fontWeight: 'bold'}}>{translang.t('ADD')}</Text>
                  </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>}
        </View>
      </TouchableOpacity>
    </View>
  );
};
export default class ShopInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showNoCartModal: false,
      showModal: false,
      shopId: '',
      shop: {},
      productList: [],
      filteredProducts: [],
      userInfo: {},
      isLoading: false,
      searchVal: '',

      minPrice: '',
      maxPrice: '',
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

      const isRefresh = this.props.navigation.getParam('refresh');
      if(isRefresh){
        const userInfo = this.props.navigation.getParam('userInfo');
        const shopId = this.props.navigation.getParam('shopId');
        const shop = this.props.navigation.getParam('shop');
        this.setState({ userInfo, shopId, shop, productList: [] }, () => {
          this.loadData();
        });
      }
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

  loadData = () => {
    this.setState({ isLoading: true });

    const userInfo = this.state.userInfo;
    const shopId = this.state.shopId;

    ApiManager.getProductList(userInfo.SchoolID, shopId).then(list => {
      const tempPrices = [];
      list.forEach((data, index) => {
        data.amount = 0
        data.expand = false
        tempPrices.push(data.price);
      })
      const minPrice = Math.min(tempPrices) ? Math.min(tempPrices) : "0";
      const maxPrice = Math.max(tempPrices) ? Math.max(tempPrices) : "0";
      this.setState({ productList: list, isLoading: false, filteredProducts: list, minPrice: minPrice, maxPrice: maxPrice  });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };

  _renderItem = (selitem ) => {
    const index = this.state.productList.findIndex((item)=> item==selitem.item);
    const item = this.state.productList[index];
    return (
      item &&
      <OfferItem
        prodct={item}
        expandable={item.expand}
        amount_props = {item.amount}
        addfunc = {(amount) => this.addbtnfunc(item, amount)}
        clickItem={()=>{
          const temp = this.state.productList;
          temp[index].expand = !temp[index].expand;
          this.setState({productList: temp});
        }}
      />
    );
  };

  addbtnfunc = (selitem, amount) => {
    const temp = this.state.productList
    const index = temp.findIndex((item)=> item==selitem);
    temp[index].amount = amount

    this.setState({productList: temp});
  }

  back = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }

    this.props.navigation.navigate('Shop');
    // const temp = this.state.productList.map((item, idx)=>({...item, expand: false}));
    // this.setState({productList: temp});
  };

  __next = async () => {
    let totalCartCount = this.state.productList.reduce(function(prev, current) {return prev + +current.amount}, 0);
    if (totalCartCount == 0) {
      this.setState({ showNoCartModal: true, modalBody: translang.t('SHOP_beforetransact') });
      return;
    }
    
    let productList = [];
    this.state.productList.forEach((value, index) => {
      if (value.amount > 0) {
        let product = this.state.productList[index];
        productList.push(product);
      }
    });

    this.props.navigation.navigate('ShopCart', { productList: productList, shop: this.state.shop, userInfo: this.state.userInfo });
  };

  _onChangeSearchVal = (searchVal) => {
    let tempfilteredProduct = [];
    this.state.productList.forEach((data, index) => {
      if (data.product_name.toLowerCase().includes(searchVal.toLowerCase())) {
        tempfilteredProduct.push(data)
      }
    });
    this.setState({searchVal: searchVal, searchKeyword: searchVal, filteredProducts: tempfilteredProduct});
  };

  render() {
    //const { folders, renameValue } = this.state;
    const { searchVal} = this.state;
    const { shop} = this.state;

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_shop')}
          onMenuTap={() => this.back()}
        />

        <View style={{ flex: 1, marginVertical: 5, }} indicatorStyle={'black'} bounces={false}>
          <View>
            <View style={styles.headerContainer}>
              <Text style={{fontFamily: 'THSarabunNew', fontSize: 30, fontWeight: 'bold', color: Color.n_default_gray}}>{shop.shop_name}</Text>
              {/* <Text style={{fontFamily: 'THSarabunNew', fontSize: 20, color: Color.n_default_gray}}>{"Price " + this.state.minPrice + " - " + this.state.maxPrice}</Text> */}
            </View>
          </View>

          <View style={{flexDirection: 'row', justifyContent: 'space-between', height: 60, width: '100%', paddingHorizontal: 30}}>
            <CustomTextSearch
              inputWrapperStyle={{
                height: 50,
                flex: 1,
                borderRadius: 25,
                borderColor: Color.n_default_orange,
                borderWidth: 1
              }}
              value={searchVal}
              onChangeText={this._onChangeSearchVal}
              inputStyle={{ fontSize: 27, color: Color.n_default_orange }}
              placeholder={translang.t('COMMON_search_placeholder')}
              placeholderTextColor={Color.n_default_orange}

              clickSearch={()=>{
                
              }}
            />
          </View>
          {this.state.filteredProducts.length > 0 && 
          <FlatList
            data={this.state.filteredProducts}
            keyExtractor={(item, index) => index.toString()}
            renderItem={this._renderItem}
          />}
          {this.state.filteredProducts.length == 0 &&
          <Text style={styles.value2}>
            {translang.t('NOT_FOUND_PRODUCT')}
          </Text>}
        </View>

        <NextButton
          label={translang.t('COMMON_next')}
          containerStyle={styles.buttonStyle}
          buttonStyle={{ borderRadius: 40 }}
          colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
          isVerticalGradient={false}
          _onPress={() => this.__next()} />

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.checked}
          title=' '
          message={translang.t('COMMON_close')}
          buttonColors={[Color.green_button_next_color1]}
          onClose={() => { this.setState({ showModal: false }) }}
        />

        <AlertWithImageModal
          isVisible={this.state.showNoCartModal}
          image={Images.n_close_circle}
          message={this.state.modalBody}
          buttonColors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
          isVerticalGradient={false}
          onClose={() => { this.setState({ showNoCartModal: false }) }}
        />
        <ProgressHud isVisible={this.state.isLoading} />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({

  headerContainer: {
    marginVertical: 30,
    marginHorizontal: 15,
    height: 70,
    borderRadius: 20,
    backgroundColor: Color.n_default_orange_light,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,

    paddingTop: 20,
    paddingLeft: 30,    
  },






  dialogStyle: {
    width: 350,
    height: dimension.px150,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2
  },
  container: {
    height: '100%',
    backgroundColor: Color.n_background_white,
  },
  uperCardChild: {
    marginVertical: 10,
    marginHorizontal: 15,
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
  title2: {
    fontFamily: 'THSarabunNew',
    fontSize: 16,
    fontWeight: 'bold'
  },
  value2: {
    fontFamily: 'THSarabunNew',
    fontSize: 16,
    textAlign: 'center',
  },
  title1: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    marginLeft: 20,
  },
  value1: {
    fontFamily: 'THSarabunNew',
    fontSize: 18,
    marginLeft: 20,
  },

  valueright: {
    fontFamily: 'THSarabunNew',
    fontSize: 25,
    marginRight: 20,
    color: Color.n_button_gradient_green_start
  },

  img: {
    width: 40, height: 40,
  },

  buttonStyle:{
    width: "90%",
    marginVertical:15,
    marginLeft: 'auto',
    marginRight: 'auto',
  }
});
