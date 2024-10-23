import React from 'react';
import {StyleSheet, BackHandler, View} from 'react-native';


import Color from '../../constants/color';
import translang from '../../utils/language.utils';
import {SafeAreaView} from 'react-native-safe-area-context';
import BackNavigationBarGradient from '../../components/BackNavigationBarGradient';
import {WebView} from 'react-native-webview';
import GradientButton from '../../components/GradientButton';
import {ScrollView} from 'react-native-gesture-handler';
import ApiManager from "../../managers/ApiManager";
import StorageManager from "../../managers/StorageManager";
import CheckVerification from "../../components/CheckVerification";
import ProgressHud from "../../components/ProgressHud";
import {removeUser} from "../../utils/DBManager";
import Constant from "../../constants/constants";

export default class PrivacyPolicyScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: "",
      policy: "",
      schoolId: '',
      isLoading: false,
    };
  }

  handleBackButton = () => {
    return true;
  };

  componentDidMount() {
    const {navigation} = this.props;
    this.focusListener = navigation.addListener("didFocus", () => {
      if (this.backhandler) {
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const userId = this.props.navigation.getParam('userID');
      const schoolId = this.props.navigation.getParam('schoolID');
      const policy = this.props.navigation.getParam('content');
      this.setState({userId: userId, policy: policy, schoolId: schoolId})
    });
  }


  AcceptPrivacy = () => {
    this.setState({isLoading: true});
    ApiManager.AcceptPrivacy(this.state.userId).then(async data => {
      if (data.Status) {
        const result = await CheckVerification.checkVerification(this.state.schoolId, this.state.userId);

        if (result.verifyNeed) {
          this.props.navigation.navigate('VerifyStart');
        } else {
          const device_verified = await CheckVerification.checkVerificationDevice('',this.state.userId, this.state.schoolId);
          if (device_verified) {
            this.props.navigation.navigate('App');
          } else {
            this.props.navigation.navigate('VerifyDevice', {parent: 'Login'});
          }
        }
        this.setState({isLoading: false});
      }
    }).catch(error => {
      console.log("AcceptPrivacy", error);
      this.setState({isLoading: false});
    });
  }


  cancel = ()=> {
    const parentRoute = this.props.navigation.getParam('parent') ?? 'Login';
    if (parentRoute == 'SettingAddAccount'){
      this.logOut_Prev();
    }else{
      this.props.navigation.navigate(parentRoute);
    }
  };


  logOut_Prev = async () => {
    console.log("logout prev");
    const userId = this.state.userId;
    removeUser(userId).then();    //have some problem, we have to userid from the response of this api
    await StorageManager.removeUser().then();
    await StorageManager.removeUserInfo().then();
    const prevUser = await StorageManager.getPrevUser();
    const prevUserInfo = await StorageManager.getPrevUserInfo();
    await StorageManager.setUser(prevUser);
    await StorageManager.setUserInfo(prevUserInfo);
    Constant.AddProfiles = Constant.AddProfiles.filter(item => item.userid != userId);
    this.props.navigation.navigate('SettingAddAccount');
  }


  render() {
    return (
      <View style={styles.container}>
        <BackNavigationBarGradient
          title={translang.t('PRIVACY_POLICY')}
          backColor={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
          is_backbtn={false}
        />
        <ScrollView style={{flexDirection: 'column', flex: 1,}} contentContainerStyle={{flexGrow: 1}}>
          <View style={{flex: 1, paddingHorizontal: 10}}>
            <WebView source={{html: this.state.policy}}/>
          </View>

          <View style={{
            height: 100,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}>
            <GradientButton
              label={translang.t('DENY')}
              containerStyle={{
                ...styles.buttonContainer,
                borderColor: Color.n_default_orange,
                borderWidth: 1,
                borderRadius: 22
              }}
              buttonStyle={{borderRadius: 22, height: 44}}
              colors={[Color.white, Color.white]}
              textStyle={{fontSize: 24, fontWeight: 'bold', color: Color.n_default_orange}}
              isVerticalGradient={false}
              _onPress={() => {
                this.cancel();
              }}/>

            <GradientButton
              label={translang.t('ACCEPT')}
              containerStyle={{...styles.buttonContainer, borderWidth: 0, borderRadius: 22}}
              buttonStyle={{borderRadius: 22, height: 44}}
              colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
              textStyle={{fontSize: 24, fontWeight: 'bold'}}
              isVerticalGradient={false}
              _onPress={() => {
                this.AcceptPrivacy()
              }}/>
          </View>
        </ScrollView>
        <ProgressHud isVisible={this.state.isLoading}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  buttonContainer: {
    width: 126,

    justifyContent: 'center',
    alignItems: 'center'
  },
});
