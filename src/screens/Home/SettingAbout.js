import React, { useState } from 'react';
import {Text, View, BackHandler, TouchableOpacity, Dimensions, Linking,} from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Hyperlink from 'react-native-hyperlink';

import ProgressHud from '../../components/ProgressHud';
import BackNavigationBar from '../../components/BackNavigationBar';
import FilterModal from '../../components/FilterModal';

import translang, { getCurrentLocale } from '../../utils/language.utils';
import StorageManager from '../../managers/StorageManager';

export default class SettingAbout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: true,
      deviceInfo: {},
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
      const deviceinfo = await StorageManager.getDeviceInfo();
      this.setState({deviceInfo: deviceinfo})
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

  clickPrivacy = () => {
    this.props.navigation.navigate('SettingPrivacy');
  }

  render() {
    const initialLayout = { width: Dimensions.get('window').width };
    const url = translang.t('JAB_WEBSITE');

    return (
      <SafeAreaView style={styles.container} edges={['right','top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_aboutus')}
          onMenuTap={() => this.back()}
        />

        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.caption}>{translang.t('JAB_COMPANY_NAME')}</Text>
            <Text style={styles.caption}>{translang.t('LEAVE_address')}</Text>
            <Text style={styles.smallcaption}>{translang.t('JAB_ADDRESSS')}</Text>

            <Text style={styles.caption}>{translang.t('WEBSITE')}</Text>
            <Hyperlink onPress={url => {console.log(url); Linking.openURL(url)}} linkDefault={false}>
              <Text style={styles.highlightTxt}>{url}</Text>
            </Hyperlink>
            <Text style={styles.caption}>{translang.t('PROFILE_email')}</Text>
            <Hyperlink onPress={url => {console.log(url); Linking.openURL("mailto:" + url)}} linkDefault={false} >
              <Text style={styles.highlightTxt}>{translang.t('JAB_EMAIL')}</Text>
            </Hyperlink>

            <Text style={styles.caption}>{translang.t('LEAVE_phonenumber')}</Text>
            <Text onPress={() => {Linking.openURL(`tel:${translang.t('JAB_PHONENUMBER')}`)}} style={styles.highlightTxt}>{translang.t('JAB_PHONENUMBER')}</Text>

            <Text style={styles.caption}>{translang.t('VERSION')}</Text>
            <Text style={styles.smallcaption}>{this.state.deviceInfo.version ?? ""}</Text>

          </View>

          <TouchableOpacity
            onPress={this.clickPrivacy}
            style={{alignSelf: 'center', marginBottom: 40}}
            activeOpacity={0.3}>
            <Text style = {styles.privacyText}>{translang.t('PRIVACY_POLICY')}</Text>
          </TouchableOpacity>
        </View>
        <ProgressHud isVisible={this.state.isLoading} />

      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({

  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: Color.n_background_white,
  },
  content: {
    backgroundColor: 'white',
    margin: 15,
    padding: 10,
    borderRadius: 15,
    shadowOffset: {
      width: 0,
      height: 0
    },
    elevation: 3,
    shadowColor: 'black',
    shadowRadius: 3,
    shadowOpacity: 0.4
  },
  smallcaption: {
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    marginHorizontal: 10,
    color: '#000',
  },
  caption: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    marginHorizontal: 10,
    color: Color.n_default_orange
  },
  highlightTxt: {
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    marginHorizontal: 10,
    color: Color.n_default_gray,
  },
  privacyText: {
    fontFamily: 'THSarabunNew',
    fontSize: 25,
    fontWeight: 'bold',
    color: Color.n_default_orange,
    textAlign: 'center',
  }
});
