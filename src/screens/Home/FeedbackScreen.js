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

export default class FeedbackScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      amount: 0.0,
      isLoading: true
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

      this.setState({isLoading: true });
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
    //this.props.navigation.goBack();
    if(this.backhandler){
      this.backhandler.remove();
    }

    this.props.navigation.navigate('Setting');
  };

  render() {
    const url = "https://docs.google.com/forms/d/e/1FAIpQLSdEOFYW_RKFousSiHGb6sZOGFSNinWtjUjnyizu0LJxMF_E4w/viewform";
    const userInfo = this.state.userInfo;
    const amount = this.state.amount;

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('SUGGESTION')}
          onMenuTap={() => this.back()}
        />

        <View style={[styles.container, {backgroundColor: 'white', borderRadius: 5, margin: 5,}]}>
          { url !== '' &&
            <WebView
              onLoad={() => this.setState({isLoading: false})}
              source={{uri: url}}
            />
          }
        </View>
        <ProgressHud isVisible={this.state.isLoading} />
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
