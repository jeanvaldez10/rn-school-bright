import React from 'react';
import { View, BackHandler, } from 'react-native';
import { WebView } from 'react-native-webview';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Color from '../../constants/color';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import Images from '../../themes/Images';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import { BASE_WEBSITE_URL } from '../../constants/ApiUrls';
import ProgressHud from '../../components/ProgressHud';
import LogoutModal from '../../components/LogoutModal';
import Storage from '../../managers/StorageManager';
export default class VisitHomeDetailStudentScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalBody: null,

      userInfo: null,
      selectedClassLevel: null,
      classRoom: null,
      tokenInfo: {},
      randomNum: 0,
      isLoading: false,
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

      const userInfo = await Storage.getUserInfo();
      const tokenInfo = await Storage.getUser();
      const RandomNumber = Math.floor(Math.random() * 100) + 1 ;

      this.setState({ userInfo, tokenInfo, showModal: false, randomNum: RandomNumber, isLoading: true,});
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

    this.setState({showModal: true});
  };

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
  };
  onNavigationStateChange = (webViewState) => {
    const closeUrl = "https://system.schoolbright.co/closepage.html";
    const currentUrl = webViewState.url;

    if(currentUrl == closeUrl){
      this.back();
    }
  };
  render() {
    let url = "";
    let keyName ='';
    const {tokenInfo} = this.state;
    if(this.state.userInfo){
     url = BASE_WEBSITE_URL + `/VisitHousePage/Mobile/Index2.aspx?schoolid=${this.state.userInfo.SchoolID}&sid=${this.state.userInfo.ID}`;
      keyName = `JabjaiKey-${tokenInfo.SchoolId}-${tokenInfo.ID}`;
    }

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('SDQ_HOMEVISIT')}
          onMenuTap={() => this.back()}
        />

        <View style={[styles.container, {backgroundColor: 'white', borderRadius: 5, margin: 5,}]}>
          { url != '' &&
            <WebView
              key={this.state.randomNum}
              onLoad={() => {console.log("VISIT HOME WEB"); this.setState({isLoading: false});}}
              onNavigationStateChange={this.onNavigationStateChange}
              onError={(event)=>{console.log("AAA ERROR")}}
              source={{uri: url, headers: {[keyName]: tokenInfo.token}}}
              javaScriptEnabled={true}
              onMessage={m => this.onMessage(m)}
            />
          }
        </View>

        <LogoutModal
          isVisible={this.state.showModal}
          image={Images.n_ic_warning}
          showCancelButton={true}
          message = {translang.t('VISITHOME_LOST_ALERT')}
          onClose={() => { this.setState({ showModal: false }) }}
          onConfirm={() => {
            this.setState({showModal: false}, ()=>{
              this.props.navigation.navigate('App');
            });
          }}
        />

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
