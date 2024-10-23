import React from 'react';
import { StyleSheet, BackHandler, View} from 'react-native';


import Color from '../../constants/color';
import translang from '../../utils/language.utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import GradientButton from '../../components/GradientButton';
import { ScrollView } from 'react-native-gesture-handler';
import ApiManager from "../../managers/ApiManager";
import BackNavigationBar from '../../components/BackNavigationBar';
import StorageManager from '../../managers/StorageManager';

export default class PrivacyPolicyNoActionScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: "",
      policy: "",
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

      const userInfo = await StorageManager.getUserInfo();
      this.GetPrivacyData(userInfo.ID);
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

    this.props.navigation.navigate('SettingAbout');
  }

  GetPrivacyData = (userId) => {
    ApiManager.CheckPrivacyStatus(userId).then(data => {
      this.setState({userId: userId, policy: data.PolicyMessage});
    }).catch(error => {
      console.log("GetPrivacyData", error);
    });
  }

  render() {
    return (
      <SafeAreaView style={styles.container} edges={['right','top', 'left']}>
        <BackNavigationBar
          title={translang.t('PRIVACY_POLICY')}
          onMenuTap={() => this.back()}
        />
     
        <ScrollView style={{flexDirection: 'column', flex: 1, marginBottom: 40}} contentContainerStyle={{flexGrow: 1}}>
          <View style={{flex: 1, paddingHorizontal: 10}}>
            <WebView source={{ html: this.state.policy}}/>
          </View>
        </ScrollView>
      </SafeAreaView>
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
