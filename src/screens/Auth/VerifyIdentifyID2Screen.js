import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  BackHandler,
  ActivityIndicator,
  TouchableOpacity, ScrollView, Modal,
} from 'react-native';

import {ScaledSheet} from 'react-native-size-matters';
import CustomTextInput from '../../components/CustomTextInput';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import GradientButton from '../../components/GradientButton';
import GradientSmallButton from '../../components/GradientSmallButton';
import ValidationComponent from 'react-native-form-validator';
import {usersService} from '../../services/UsersService';
import LinearGradient from 'react-native-linear-gradient';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import {formatter} from '../../utils/Formatter';
import {speak} from '../../utils/tts';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import translang from '../../utils/language.utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import SchoolModal from '../../components/SchoolModal';
import ApiManager from "../../managers/ApiManager";
import CustomPassInput from '../../components/CustomPassInput';
import CustomEmailInput from '../../components/CustomEmailInput';

import {StepProgressBar} from 'react-native-step-progress-bar/src';
import Storage from '../../managers/StorageManager';
import ProgressHud from "../../components/ProgressHud";
import * as ImagePicker from "react-native-image-picker";


export default class VerifyIdentifyID2Screen extends ValidationComponent {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalBody: '',
      modalHeader: null,
      modalImage: Images.n_ic_warning,
      modalButton: `${translang.t('COMMON_ok')}`,
      isSetPassword: false,
      selectedSchool: null,
      type: 0,
      userInfo: {},
      isLoading: false,
      verifyInfo: {},
      selectedItem: null,
      showImageModal: false,
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
    // this.props.navigation.navigate('App');
    if(this.backhandler){
      this.backhandler.remove();
    }

    this.props.navigation.navigate("VerifyIdentify1");

  };

  async componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", async () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
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

  changeImage = (response) => {
    console.log(response);
    this.setState({showImageModal: false});
    if(response.assets){
      if(response.assets.length){
        this.setState({selectedItem: response.assets[0]});
        Storage.setIDItem3(response.assets[0]);
      }
    }
  }

  _updateFromGallery = async () => {
    const options = {
      mediaType: 'photo',
      selectionLimit: 1,
    }
    await ImagePicker.launchImageLibrary(options, (response) =>{
      this.changeImage(response);
    });
  }

  _updateCamera = async () => {
    const options = {
      mediaType: 'photo',
      selectionLimit: 1,
      saveToPhotos: true,
    }
    await ImagePicker.launchCamera(options, (response) =>{
      this.changeImage(response);
    });
  };

  goNext = () => {
    this.props.navigation.navigate("VerifyIdentify3");
  }


  render() {

    const { type, verifyInfo, showImageModal } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        <BackNavigationBar
          style={{elevation: 0}}
          title={translang.t('Step') + "  6"}
          is_skip={false}
          onPressSkip={()=>{this.skip();}}
          onMenuTap={() => this._back()}
        />

        <KeyboardAwareScrollView style={styles.container}>
          <View style={styles.appimage}>
            <Image source={Images.n_applogo_logo} style={styles.appLogo} resizeMode='contain' />
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.bigText}>{translang.t('Attach_Parent_ID')}</Text>
            <Text style={styles.bigText1}>{translang.t('ID_Card_Photo_Front')}</Text>
            <Text style={styles.bigText1}>{translang.t('Attach_Photo')}</Text>
          </View>
          <View style={styles.idImageBox}>
            <Image source={Images.default_ID} style={styles.idImage} resizeMode='contain' />
          </View>

          <View style={{marginHorizontal: 40}}>
            <Text style={styles.bigText2}>{translang.t('ID_Card_Instruction1')}</Text>
            <Text style={styles.bigText2}>{translang.t('ID_Card_Instruction2')}</Text>
            <Text style={styles.bigText2}>{translang.t('ID_Card_Instruction3')}</Text>

          </View>

          <GradientButton
            containerStyle={{...styles.loginBtn, marginTop: 25}}
            label={ translang.t('Attach_Picture')}
            _onPress={() => {this.setState({showImageModal: true})}}
          />

          <View style={styles.line}>
            {this.state.selectedItem !== null &&
            <View style={styles.idImageBox1}>
              <Image style={styles.idImage} source={{uri: this.state.selectedItem.uri}} resizeMode='contain' />
            </View>
            }
          </View>

          <GradientButton
            containerStyle={styles.loginBtn}
            enabled={(this.state.selectedItem !== null)}
            disableColors={[Color.n_disable_button, Color.n_disable_button]}
            label={ translang.t('COMMON_next')}
            _onPress={() => {this.goNext();}}
          />

          <View style={{marginBottom: 40}}></View>

        </KeyboardAwareScrollView>

        <ProgressHud isVisible={this.state.isLoading} />

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={this.state.modalImage}
          title={this.state.modalHeader}
          message={this.state.modalBody}
          buttonColors={[Color.green_button_color]}
          isVerticalGradient={false}
          buttonTitle={translang.t('HOME_close')}
          onClose={() => { this.modalButtonClick()}}
        />

        {showImageModal &&

        <Modal animationType="slide" transparent={true} key="modal">
          <View style={styles.centeredView}>
            <View style={styles.dialogStyle}>
              <View style={styles.modalHeaderContainer}>
                <Text style={styles.modalHeader}>{ translang.t('Select_Between') }</Text>
              </View>

              <GradientButton
                containerStyle={{...styles.loginBtn, marginTop: 25}}
                label={ translang.t('Upload_Gallery')}
                textStyle={ styles.btnText }
                _onPress={() => this._updateFromGallery()}
              />
              <GradientButton
                containerStyle={{...styles.loginBtn, marginTop: 25}}
                label={ translang.t('Open_Camera')}
                textStyle={ styles.btnText }
                _onPress={() => this._updateCamera()}
              />

              <GradientButton
                containerStyle={{...styles.loginBtn1, marginTop: 25}}
                label={ translang.t('HOME_close')}
                colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
                textStyle={ {fontSize:22} }
                _onPress={() => this.setState({showImageModal: false})}
              />

            </View>
          </View>
        </Modal>

        }
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
  },
  appLogo: {
    width: '100%',
    height: '100%',
  },
  appimage: {
    marginTop: 40,
    width: '100%',
    height: 130,
    alignItems: 'center',
  },
  idImage: {
    width: '100%',
    height: '100%',
  },
  idImageBox1: {
    height: 200,
    alignItems: 'center',
  },
  idImageBox: {
    height: 200,
    alignItems: 'center',
    marginHorizontal: 40,
  },
  btnText: {
    fontSize: "18@ms"
  },

  BtnContainer: {
    width: '100%',
    height: 70,
    marginTop: 25,
    paddingHorizontal: 50,
  },

  loginBtnBackground: {
    flex: 1,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loginBtn: {
    width: '100%',
    height: 70,
    paddingHorizontal: 12,
  },

  loginBtn1: {
    width: '100%',
    height: 70,
    paddingHorizontal: 80,
  },

  bigText: {
    width: '100%',
    fontSize: 28  ,
    textAlign: 'center',
    color: Color.n_default_gray,
  },
  modalHeader: {
    textAlign: 'center',
    fontSize: 28,
  },
  bigText1: {
    width: '100%',
    fontSize: 24  ,
    color: Color.n_default_gray,
    textAlign: 'center'
  },

  bigText2: {
    width: '100%',
    fontSize: 24  ,
    color: Color.n_default_gray,
    marginTop: 10,
  },

  titleContainer: {
    paddingVertical: 15,
    paddingHorizontal: 40,
  },
  stepImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  line: {
    borderBottomWidth: 2,
    borderBottomColor: Color.n_button_gradient_orange_start,
    marginHorizontal: 50,
    marginVertical: 20,
  },
  //Modal
  modalHeaderContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginHorizontal: 60,
    borderBottomColor: Color.n_default_orange,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000090',
  },
  dialogStyle: {
    width: '90%',
    maxWidth: 400,
    height: 400,
    // height: dimension.px180,
    flexDirection: 'column',
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 10,
  },
  modalLogo: {
    width: 70,
    height: 70,
  },

});
