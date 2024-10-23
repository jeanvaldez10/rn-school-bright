import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, FlatList, AppState} from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import GradientButton from '../../components/GradientButton';
import Color from '../../constants/color';
import { ScrollView } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import { Icon } from 'native-base';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import ShopIconInfoItem from '../../components/IconInfoItem_OneLine';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import moment from 'moment';
import NumberFormat from 'react-number-format';
import CustomTextSearch from '../../components/CustomTextSearch';
import NetInfo from "@react-native-community/netinfo";
import AlertWithImageModal from '../../components/AlertWithImageModal';

export default class ShopScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalBody: '',
      shopList: [],
      filteredShop: [],
      userInfo: {},
      isLoading: false,
      searchVal: '',
      appState: AppState.currentState,
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  unsubscribe = null;

  async componentDidMount() {
    console.log("ShopScreen");
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    const userInfo = await Storage.getUserInfo();
    this.checkChangePinStatus(userInfo);
    this.setState({ userInfo: userInfo }, () => {
      this.loadData();
    });
    AppState.addEventListener("change", this._handleAppStateChange);

    this.willFocusSubscription = this.props.navigation.addListener(
        'willFocus',
        async () => {
          const userInfo = await Storage.getUserInfo();
          this.setState({ userInfo: userInfo });
        }
    );
  };

  componentWillUnmount = () => {
    // this.unsubscribe();
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

  checkChangePinStatus = (userInfo) => {
    ApiManager.checkChangePinStatus(userInfo.ID).then(res => {
      console.log(res);
      if(res.resCode != "200"){
        this.props.navigation.navigate('ShopSetPincode', {parent: 'App', userInfo: userInfo});
      }
    }).catch(error => {
      console.log(error);
    });
  }

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

  loadData = () => {
    this.setState({ isLoading: true });

    const userInfo = this.state.userInfo;

    ApiManager.getShopList(userInfo.SchoolID).then(list => {
      this.setState({ shopList: list, isLoading: false, filteredShop: list });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };

  back = () => {
    // this.props.navigation.goBack();
    this.props.navigation.navigate('UserInfo');
  };

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
  };

  onClickItem = (item) => {
    const shopId = item.shop_id;
    this.props.navigation.navigate('ShopInput', { shopId: shopId, shop: item, userInfo: this.state.userInfo, refresh: true });
  };

  _onChangeSearchVal = (searchVal) => {
    let tempfiltered = [];
    this.state.shopList.forEach((data, index) => {
      if (data.shop_name.toLowerCase().includes(searchVal.toLowerCase())) {
        tempfiltered.push(data);
      }
    });
    this.setState({searchVal: searchVal, searchKeyword: searchVal, filteredShop: tempfiltered});
  };

  renderItem = (item) => {
    const shop = item;
    let picture = Images.n_ic_shop;
    if (shop.picture && shop.picture !== '') {
      picture = {uri: shop.picture};
    }
    return (
      <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem(item) }} >
        <ShopIconInfoItem
          icon_mark={picture}
          label={shop.shop_name}
          imageSize={50}
          topTextStyle={styles.infoTitle}
        />
      </TouchableOpacity>
    );
  }

  render() {
    const userInfo = this.state.userInfo;
    const { searchVal} = this.state;
    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_shop')}
          onMenuTap={() => this.back()}/>

        <View style={styles.container}>

          <View style={{flexDirection: 'row', justifyContent: 'space-between', height: 60, width: '100%', paddingHorizontal: 30, marginTop: 20}}>
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
          {this.state.filteredShop.length > 0 &&
          <FlatList
            style={styles.menuContainer}
            data={this.state.filteredShop}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => this.renderItem(item)}
          />
          }
          {this.state.filteredShop.length <= 0 &&
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{fontFamily: 'THSarabunNew', fontSize: 20, color: Color.n_default_gray, padding: 20, textAlign: 'center'}}>{translang.t('NOT_SUPPORT_STRING')}</Text>
            </View>

          }

          <View style={styles.bottomStyle} >
            <Text style={{fontFamily: 'THSarabunNew', fontWeight: 'bold', fontSize: 24, color: Color.n_default_gray}}>{translang.t('SHOP_balance')}</Text>
            <NumberFormat
            value={userInfo.nMoney}
            displayType={'text'}
            thousandSeparator={true}
            renderText={(value) => {
              return(
                <Text style={{fontFamily: 'THSarabunNew', fontWeight: 'bold', fontSize: 30, color: Color.n_default_orange, marginLeft: 20}}>{value}</Text>
              )
            }} />
            <Text style={{fontFamily: 'THSarabunNew', fontWeight: 'bold', fontSize: 24, color: Color.n_default_gray, marginLeft: 5}}>{}</Text>
          </View>
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
    backgroundColor: Color.n_background_white,
  },






  menuContainer: {
    marginTop: 10,
    paddingHorizontal: 0,

  },
  menuEachStyle: {
    height: 100,
    borderRadius: 15,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,

    marginBottom: 20,
    marginHorizontal: 15,
    paddingHorizontal: 10,

    alignItems: 'center',
  },
  infoTitle: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    color: 'black',

  },
  bottomStyle: {
    flexDirection: 'row',
    width: '100%',
    height: 100,
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    backgroundColor: Color.white,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,

    paddingHorizontal: '25%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
  },
  bottombutton: {
    color: Color.dark,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
