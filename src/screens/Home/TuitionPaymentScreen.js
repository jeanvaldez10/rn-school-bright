import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, } from 'react-native';
import { WebView } from 'react-native-webview';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Color from '../../constants/color';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import Images from '../../themes/Images';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import { BASE_WEBSITE_URL } from '../../constants/ApiUrls';
import moment from 'moment';
import ProgressHud from '../../components/ProgressHud';

export default class TuitionPaymentScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      paymentType: null,
      balance: 0,
      invoiceID: "",
      isLoading: true,
      isLoaded: false,
      tokenInfo:{}
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
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      console.log("TuitionPaymentScreen");

      const userInfo = this.props.navigation.getParam('userInfo');
      const paymentType = this.props.navigation.getParam('type');
      const balance = this.props.navigation.getParam('balance');
      const invoiceID = this.props.navigation.getParam('invoiceid');
      const tokenInfo = await Storage.getUser();

      console.log("paymentType:", paymentType);

      this.setState({ userInfo, paymentType, balance, invoiceID, isLoading: true, isLoaded: false, tokenInfo });
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

    this.props.navigation.navigate('TuitionOutput');
  };

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
  };

  onNavigationStateChange = (webViewState) => {
    console.log(webViewState);
    const closeUrl = "https://system.schoolbright.co/closepage.html";
    const currentUrl = webViewState.url;

    if(currentUrl == closeUrl){
      this.back();
    }
  };

  render() {
    const {userInfo, balance, invoiceID, paymentType, isLoaded, tokenInfo} = this.state;
    getCurrentLocale()
    let url = "";
    let keyName = '';
    if(paymentType){
      url = paymentType.URLPayment + '&lang=' + getCurrentLocale();
      keyName = `JabjaiKey-${tokenInfo.SchoolId}-${tokenInfo.ID}`;
      console.log("url:", url);
    }

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_tuition')}
          onMenuTap={() => this.back()}
        />

        <View style={[styles.container, {backgroundColor: 'white', borderRadius: 5, margin: 5,}]}>
          <WebView
            // onLoad={() => this.setState({isLoading: false})}
            onError={(event)=>{console.log("AAA ERROR")}}
            source={{uri: url, headers: {[keyName]: tokenInfo.token}}}
            onNavigationStateChange={this.onNavigationStateChange}
            javaScriptEnabled={true}

          />
        </View>
        {/* <ProgressHud isVisible={this.state.isLoading} /> */}
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({

  container: {
    flex: 1,
    backgroundColor: Color.n_background_white
  },
  backbutton: {
    color: Color.white,
    textAlign: 'center',
    fontSize: 18,
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
  title2: {
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 20,
  },
});
