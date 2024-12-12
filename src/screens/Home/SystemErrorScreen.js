import React from 'react';
import {
  View,
  Image,
  BackHandler,
  Text,
} from 'react-native';

import {ScaledSheet} from "react-native-size-matters";

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import GradientSmallButton from '../../components/GradientSmallButton';
import ValidationComponent from 'react-native-form-validator';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import translang, {getCurrentLocale} from '../../utils/language.utils';
import {SafeAreaView} from 'react-native-safe-area-context';


export default class SystemErrorScreen extends ValidationComponent {
  constructor(props) {
    super(props);
    this.state = {
      thText: props.thText,
      enText: props.enText,
    };
  }

  handleBackButton = () => {
    this._back();
    return true;
  };

  modalButtonClick = () => {
    this.setState({showModal: false});
  };

  _back = () => {

    if (this.backhandler) {
      this.backhandler.remove();
    }

    const parentRoute = this.props.navigation.getParam('parent') ?? 'App';
    this.props.navigation.navigate(parentRoute);
  };

  async componentDidMount() {
    const {navigation} = this.props;
    const enText = this.props.navigation.getParam('enText') ?? this.state.enText;
    const thText = this.props.navigation.getParam('thText') ?? this.state.thText;
    this.setState({enText: enText, thText: thText});
    this.focusListener = navigation.addListener("didFocus", async () => {
      if (this.backhandler) {
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

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

  next = async () => {
    if (this.props.onClose !== undefined) {
      this.props.onClose();
    } else {
      BackHandler.exitApp();
    }
  };

  render() {
    const {enText, thText} = this.state;
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView style={styles.container}>
          <View style={{alignItems: 'center', flex: 1}}>
            <View style={styles.InContainer}>
              <View style={styles.appimage}>
                <Image source={Images.School_Bright_H_Logo} style={styles.lineLogo} resizeMode='contain'/>
                <Image source={Images.Alert_t} style={styles.AlertLogo} resizeMode='contain'/>
                <View style={styles.textContainer}>
                  <Text style={styles.AlertText}> {getCurrentLocale() === 'en' ? enText: thText} </Text>
                </View>
                {/* <View style={styles.DividerLine}/> */}
                <GradientSmallButton
                  containerStyle={styles.loginBtn}
                  label={translang.t('HOME_close')}
                  _onPress={() => this.next()}
                  opacity={1}
                />
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
  },
  InContainer: {
    paddingVertical: 20,
    width: '360@ms',
  },
  appLogo: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    borderRadius: 16,
    // backgroundColor: '#F1A456',
    padding: 16,
    marginTop: 25,

  },
  AlertText: {
    fontSize: "24@ms",
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  DividerLine: {
    backgroundColor: '#F1A456',
    height: 2,
    width: '90%',
    marginTop: 25,
  },

  loginBtn: {
    width: 200,
    height: 40,
    paddingHorizontal: 30,
    marginTop: 20
  },

  lineLogo: {
    height: '90@vs',
  },
  AlertLogo: {
    height: '110@vs',
  },
  appimage: {
    marginVertical: '50@vs',
    width: '100%',
    alignItems: 'center',
  },

});
