import React from 'react';
import { SafeAreaView, Image, View, BackHandler, TouchableOpacity, Dimensions, ScrollView} from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import NextButton from '../../components/NextButton';
import Color from '../../constants/color';
// import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import Images from '../../themes/Images';
import translang, {getCurrentLocale} from '../../utils/language.utils';
import CustomTextInput from '../../components/CustomTextInput';
import CalendarModal from '../../components/CalendarModal';
import TimerPickerModal from '../../components/TimerPickerModal';
import CustomRadioButton from '../../components/CustomRadioButton';
import moment from 'moment';
import _ from 'lodash';
import DocumentPicker from 'react-native-document-picker';
import * as ImagePicker from 'react-native-image-picker';
import SelectListModal from '../../components/SelectListModal';
import ApiManager from '../../managers/ApiManager';
import ProgressHud from '../../components/ProgressHud';
import ImageView from "react-native-image-viewing";
import DropDownPicker from 'react-native-dropdown-picker';

export default class VerifySlipUploadScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showModal: false,
      modalBody: '',
      type: null,
      date: null,
      attachedImage: null,
      showImageView: false,
    };
  }

  handleBackButton = () => {
    if(this.state.showDatePicker){
      this.setState({showDatePicker: false});
    }else{
      this.back();
    }
    return true;
  };

  async componentDidMount() {

    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const type = this.props.navigation.getParam('type');
      const date = this.props.navigation.getParam('date');

      this.setState({type, date});
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

    this.props.navigation.navigate("VerifySlipPaymentList");
  };

  __next = async () => {
    
  };

  onChooseImage = () => {
    const options = {
      mediaType: 'photo',
      selectionLimit: 1,
    }

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.assets) {
        if (response.assets && response.assets.length > 0) {
          this.setState({isLoading: true});

          const item = response.assets[0];
          if(item.fileSize > 25000000){
            this.setState({ showModal: true, modalBody: translang.t('OVERSIZE_ALERT') });
            return;
          }

          this.setState({
            attachedImage: item,
            isLoading: false,
          });

          // ApiManager.uploadImage("broadcast", this.state.userInfo.SchoolID, item).then(data => {
          //   this.setState({
          //     attachedImage: {
          //       FileType: data[0].FileType, 
          //       FileURL: data[0].FileURL,
          //     },
          //     isLoading: false,
          //   });
          // }).catch(error => {
          //   console.log("uploadImage", error);
          //   this.setState({isLoading: false});
          // });
        }
      }
    });
  }

  render() {
    const { type, date, attachedImage } = this.state;

    const screenWidth = Dimensions.get('window').width;
    let imgWidth = screenWidth * 0.8;
    let imgHeight = 0;

    if (attachedImage) {
      const ratio = attachedImage.height / attachedImage.width;
      imgHeight = imgWidth * ratio;
    }

    if (imgHeight > 300) {
      const ratio = attachedImage.width / attachedImage.height;
      imgHeight = 300;
      imgWidth = imgHeight * ratio;
    }

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('UPLOAD_SLIP')}
          onMenuTap={() => this.back()}/>
        <ScrollView style={styles.list}>
          <View style={{...styles.listItem, marginTop: 20, marginBottom: 10}}>
            <View style={{...styles.listItem, flexDirection: 'column'}}>
              <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={styles.text1}>{translang.t('DATE')} {date ? moment(date).format('DD/MM/YYYY') : ''}</Text>
                <Text style={styles.text1}>{2000.00}</Text>
              </View>

              <Text style={styles.text2}>{translang.t('REFERENCE_NO')} {'012345678'}</Text>

              <View style={{marginVertical: 10}}>
                <Text style={styles.text2}>{translang.t('PAYMENT_BANK')}</Text>
                <DropDownPicker
                  arrowColor={Color.n_default_orange}
                  items={[
                    {label: 'Bank1', value: 0},
                    {label: 'Bank2', value: 1},
                  ]}
                  defaultValue={0}
                  style={styles.dropdownPicker}
                  itemStyle={{ justifyContent: 'flex-start' }}
                  containerStyle = {styles.dropdownPickerContainer}
                  labelStyle={styles.dropdownPickerLabel}
                  dropDownStyle={styles.dropDown}
                  onChangeItem={ item => {
                    this.setState({selRoom: item});
                  }}
                />
              </View>

              <View style={{marginVertical: 10}}>
                <Text style={styles.text2}>{translang.t('ATTACH_SLIP_IMAGE')}</Text>
                <TouchableOpacity style={styles.chooseImageContainer} onPress={() => this.onChooseImage()}>
                  <Text style={styles.chooseImage}>{translang.t('SELECT_IMAGE')}</Text>
                </TouchableOpacity>

                {attachedImage && (
                  <TouchableOpacity style={{marginVertical: 10, marginRight: 10, alignItems: 'center'}} onPress={()=>this.setState({showImageView: true})} >
                    <View>
                      <Image style={{width: imgWidth, height: imgHeight, resizeMode: 'contain'}} source={{uri: attachedImage.uri}} />
                      <TouchableOpacity style={{position: 'absolute', top: -14, right: -14}} onPress={()=> {this.setState({attachedImage: null})}} >
                        <Image source={Images.n_close_circle} style={{width: 28, height: 28, resizeMode: 'contain'}}/>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                )}

                <Text style={styles.text2}>{translang.t('FileSizeDes')}</Text>
              </View>
            </View>
          </View>

          <NextButton
            label={translang.t('COMMON_confirm')}
            containerStyle={{ width: 290, marginLeft: 'auto', marginRight: 'auto', marginBottom: 20,}}
            buttonStyle={{ borderRadius: 38, height: 75}}
            colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
            isVerticalGradient={false}
            _onPress={() => this.__next()} />

        </ScrollView>

        {/* <SelectListModal
          isVisible={this.state.showReplySelect}
          onListSelect={this.onReplySelect}
          listData={this.state.replyList}
          dialogTtitle={translang.t('REPLY')}
        />

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.alert_inbox}
          message={this.state.modalBody}
          buttonColors={[Color.red_orange, Color.soft_red]}
          isVerticalGradient={false}
          onClose={() => { this.setState({ showModal: false }) }}
        /> */}

        {/* <ImageView
          images={[this.state.attachedImage?.uri ?? '']}
          imageIndex={0}
          visible={this.state.showImageView}
          onRequestClose={() => this.setState({showImageView: false})}
        /> */}
        <ProgressHud isVisible={this.state.isLoading}/>
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listItem: {
    marginVertical: 4,
  },
  text1: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    color: Color.n_default_orange
  },
  text2: {
    fontFamily: 'THSarabunNew',
    fontSize: 22,
    fontWeight: 'bold',
    color: Color.n_default_orange
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
  chooseImage: {
    fontSize: 14,
    fontWeight: '600',
    color: Color.white,
    textAlign: 'center',
    alignSelf: 'center',
  },
  chooseImageContainer: {
    width: 140,
    height: 45,
    borderRadius: 23,
    backgroundColor: Color.n_default_orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10
  },
  dropdownPicker: {
    width: '100%',
    borderColor: Color.n_default_orange,
    borderWidth: 0,
    borderBottomWidth: 1,
  },
  dropdownPickerContainer: {
    flex: 1,
    height: 45,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  dropDown: {
    backgroundColor: Color.white,
    borderBottomLeftRadius: 23,
    borderBottomRightRadius: 23,
    borderWidth: 1,
    borderColor: Color.n_default_gray,
  },
  dropdownPickerLabel: {
    fontSize: 23,
    fontFamily: 'THSarabunNew',
    color: Color.n_default_orange,
  },
});
