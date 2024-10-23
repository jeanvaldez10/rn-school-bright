import React from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  BackHandler,
} from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import SettingIconInfoItem from '../../components/SettingIconInfoItem'
import translang, { setLocale } from '../../utils/language.utils';
import ApiManager from '../../managers/ApiManager';
import Storage from "../../managers/StorageManager";


export default class SettingManageLanguage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      userInfo: null,
      deviceInfo: null,
    };
  }
  handleBackButton = () => {
    this.back();
    return true;
  };
  async componentDidMount() {
    const { navigation } = this.props;
    const userInfo = await Storage.getUser();
    const deviceInfo = await Storage.getDeviceInfo();

    console.log("userInfo:", userInfo);
    console.log("deviceInfo:", deviceInfo);

    this.setState({userInfo: userInfo, deviceInfo: deviceInfo});

    this.focusListener = navigation.addListener("didFocus", () => {
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
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

    this.props.navigation.navigate('Setting');
  };

  onLanguageSelect = (item) => {
    setLocale(item);
    const {deviceInfo, userInfo } = this.state;
    const data = {
      "Token": deviceInfo.fcmtoken,
      "UserID": userInfo.ID,
      "SchoolID": userInfo.SchoolId,
      "Imei": deviceInfo.imei,
      "System": deviceInfo.system,
      "appVersion": deviceInfo.version,
      "model": deviceInfo.model,
      "IPAddress": '11.1.1.1',
      "Location": ''
    };
    ApiManager.updateLanguage(item, data).then(
        () => {
          this.back();
        }
    );
  };

  render() {
    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('SETTING_language')}
          onMenuTap={() => this.back()}
        />

        <ScrollView style={{marginTop: 10}}>
          <TouchableOpacity style={styles.buttonStyle} activeOpacity={0.9}
            onPress={() => this.onLanguageSelect('th')}>
            <SettingIconInfoItem
              icon_mark={Images.n_ic_lang_th}
              label={"ภาษาไทย"}
              topTextStyle={styles.optionText}
              imageSize={25}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonStyle} activeOpacity={0.9}
            onPress={() => this.onLanguageSelect('en')}>
            <SettingIconInfoItem
              icon_mark={Images.n_ic_lang_en}
              label={"English"}
              topTextStyle={styles.optionText}
              imageSize={25}
            />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    height: '100%',
    backgroundColor: Color.n_background_white
  },
  dispcontainer: {
    flex: 1,
    marginHorizontal: 5,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonStyle: {
    marginHorizontal: 15,
    borderRadius: 15,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 4,
    marginVertical: 7,
    paddingHorizontal: 20,
  },

  optionText:{
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    color: Color.n_default_gray
  },

  backbutton: {
    color: Color.white,
    textAlign: 'center',
    fontSize: 18,
  },

});
