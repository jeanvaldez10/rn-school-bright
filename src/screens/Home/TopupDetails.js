import React from 'react';
import {Image, View, BackHandler, TouchableOpacity,} from 'react-native';
import {WebView} from 'react-native-webview';
import {Text} from 'native-base';
import {ScaledSheet} from 'react-native-size-matters';
import Color from '../../constants/color';
import {DrawerActions} from 'react-navigation-drawer';
import {SafeAreaView} from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import Images from '../../themes/Images';
import translang, {getCurrentLocale} from '../../utils/language.utils';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import {BASE_WEBSITE_URL} from '../../constants/ApiUrls';
import moment from 'moment';
import ProgressHud from '../../components/ProgressHud';

export default class TopupDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      amount: 0.0,
      randomNum: 0,
      tokenInfo: {},
      isLoading: true,
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    const {navigation} = this.props;
    this.focusListener = navigation.addListener("didFocus", async () => {
      if (this.backhandler) {
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const userInfo = this.props.navigation.getParam('userInfo');
      const tokenInfo = await Storage.getUser();
      const amount = this.props.navigation.getParam('amount');

      const RandomNumber = Math.floor(Math.random() * 100) + 1;

      this.setState({userInfo, amount, randomNum: RandomNumber, tokenInfo, isLoading: true,});
    });

  }

  componentWillUnmount = () => {
    if (this.backhandler) {
      this.backhandler.remove();
    }
    if (this.focusListener) {
      this.focusListener.remove();
    }
  };

  back = () => {
    //this.props.navigation.goBack();
    if (this.backhandler) {
      this.backhandler.remove();
    }

    this.props.navigation.navigate('Topup');
  };

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
  };
  onNavigationStateChange = (webViewState) => {
    const closeUrl = "https://system.schoolbright.co/closepage.html";
    const currentUrl = webViewState.url;

    if (currentUrl == closeUrl) {
      this.back();
    }
  };

  render() {
    const {userInfo, tokenInfo} = this.state;
    const amount = this.state.amount;
    let url = '';
    let keyName = '';

    if (amount !== 0.0) {
      const lang = getCurrentLocale();
      url = BASE_WEBSITE_URL + `/PaymentGateway/Payment.aspx?pt=1&studentID=${userInfo.ID}&refno=&amount=${amount.toFixed(2)}&lang=${lang}`;
      keyName = `JabjaiKey-${tokenInfo.SchoolId}-${tokenInfo.ID}`;
    }

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_topup')}
          onMenuTap={() => this.back()}
        />

        <View style={[styles.container, {backgroundColor: 'white', borderRadius: 5, margin: 5,}]}>
          {url !== '' &&
          <WebView
            key={this.state.randomNum}
            onLoad={() => {console.log("TOPUP HOME WEB"); this.setState({isLoading: false})}}
            onNavigationStateChange={this.onNavigationStateChange}
            onError={(event) => {
              console.log("AAA ERROR")
            }}
            source={{uri: url, headers: {[keyName]: tokenInfo.token}}}
            javaScriptEnabled={true}
          />
          }
        </View>
        <ProgressHud isVisible={this.state.isLoading}/>
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
