import React from 'react';
import { SafeAreaView, Image, View, BackHandler, TouchableOpacity, FlatList, ScrollView, TextInput} from 'react-native';
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

export default class BroadcastFillInfoScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showModal: false,
      modalBody: '',
      showReplySelect: false,
      deliveryFormat: {},
      recipient: {},
      selectedIds:[],
      deliveryTimeType: -1,
      deliveryDate: '',
      deliveryTime: '',
      showDatePicker: false,
      showTimePicker: false,
      topic: '',
      reply: '',
      description: '',
      attachedFiles: [],
      attachedImages: [],
      showAttachImages: [],
      showImageView: false,
      selImageIndex: 0,
      level2id: [],
      userInfo: {},
      replyList: [],
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

      console.log("BroadcastFillInfoScreen");
      const deliveryFormat = this.props.navigation.getParam('deliveryFormat');
      const recipient = this.props.navigation.getParam('recipient');
      const selectedIds = this.props.navigation.getParam('selectedIds');
      const userInfo = this.props.navigation.getParam('userInfo');
      const level2id = this.props.navigation.getParam('level2id') ?? [];
      this.setState({userInfo: userInfo, deliveryFormat: deliveryFormat, recipient: recipient, selectedIds: selectedIds, level2id: level2id}, ()=>{
        this.getResponseTypeList();
      });
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

  getResponseTypeList = () => {
    ApiManager.getSmsResponseTypeList(this.state.userInfo.SchoolID, getCurrentLocale()).then(list => {
      console.log("reply list", list);
      const tmp = list.map( item => {
        return { title: item.value, value: item.key};
      });
      this.setState({ replyList: tmp});
    }).catch(error => {
      console.log(error);
    });
  };

  back = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }

    const parentRoute = this.props.navigation.getParam('parent') ?? 'Broadcast';
      this.props.navigation.navigate(parentRoute);
  };

  __next = async () => {
    if (this.state.topic === '') {
      this.setState({ showModal: true, modalBody: translang.t('INPUT_HEADTOPIC') });
      return;
    }

    if (this.state.reply === '') {
      this.setState({ showModal: true, modalBody: translang.t('INPUT_REPLY') });
      return;
    }

    if(this.state.deliveryTimeType == -1){
      return;
    }

    if (this.state.deliveryTimeType === 2) {
      if (this.state.deliveryDate === '') {
        this.setState({ showModal: true, modalBody: translang.t('SPECIFY_DATE') });
        return;
      }
      if (this.state.deliveryTime === '') {
        this.setState({ showModal: true, modalBody: translang.t('SPECIFY_TIME') });
        return;
      }
    }
    if (this.state.description === '') {
      this.setState({ showModal: true, modalBody: translang.t('INPUT_DESCRIPTION') });
      return;
    }
    const params = {
      deliveryFormat: this.state.deliveryFormat,
      recipient: this.state.recipient,
      deliveryTimeType: this.state.deliveryTimeType - 1,
      deliveryDate: this.state.deliveryDate,
      deliveryTime: this.state.deliveryTime,
      topic: this.state.topic,
      reply: this.state.reply,
      description: this.state.description,
      attachedFiles: this.state.attachedFiles,
      attachedImages: this.state.attachedImages,
      showAttachImages: this.state.showAttachImages,
      individualIds: this.state.selectedIds,
      userInfo: this.state.userInfo,
      level2id: this.state.level2id,
    }
    this.props.navigation.navigate('BroadcastSubmit', params);
  };

  onDatePicked = (date) => {
    if (date === null || date === '') {
      this.setState({showDatePicker: false});
      return;
    };

    const formattedDate = moment(date).format('YYYY-MM-DD');
    this.setState({ deliveryDate: formattedDate, showDatePicker: false });
  };

  onTimePicked = (date) => {
    if (date === null) {
      this.setState({showTimePicker: false});
      return;
    }

    const formattedTime = moment(date).format('YYYY-MM-DDTHH:mm');
    this.setState({deliveryTime: formattedTime, showTimePicker: false});
  }

  onChooseFile = async () => {
    try {
      const results = await DocumentPicker.pickMultiple({
        type: [DocumentPicker.types.doc, DocumentPicker.types.docx, DocumentPicker.types.xls, DocumentPicker.types.xlsx, DocumentPicker.types.pdf]
      })

      let requestCnt = 0;
      let uris = this.state.attachedFiles;

      if(uris.length + results.length > 10){
        this.setState({ showModal: true, modalBody: translang.t('CANTSELECT_LIMIT') });
        return;
      }
      this.setState({isLoading: true});
      results.forEach(item=>{
        if(item.size > 25000000){
          this.setState({ showModal: true, modalBody: translang.t('OVERSIZE_ALERT'), isLoading: false });
          return;
        }
        ApiManager.uploadFile("broadcast", this.state.userInfo.SchoolID, item).then(data => {
          uris.push({FileType: data[0].FileType, FileURL: data[0].FileURL});
          requestCnt = requestCnt + 1;
          if(requestCnt == results.length){
            this.setState({isLoading: false, attachedFiles: uris});
          }
        }).catch(error => {
          console.log("uploadFile", error);
          this.setState({isLoading: false});
        });
      });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {

      } else {

      }
    }
  }

  onChooseImage = () => {
    const options = {
      mediaType: 'photo',
      selectionLimit: 0,
    }

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.assets) {
        let requestCnt = 0;
        let uris = this.state.attachedImages;
        let showUris = this.state.showAttachImages;

        if(uris.length + response.assets.length > 10){
          this.setState({ showModal: true, modalBody: translang.t('CANTSELECT_LIMIT') });
          return;
        }
        this.setState({isLoading: true});
        response.assets.forEach(item=>{
          if(item.fileSize > 25000000){
            this.setState({ showModal: true, modalBody: translang.t('OVERSIZE_ALERT') });
            return;
          }

          ApiManager.uploadImage("broadcast", this.state.userInfo.SchoolID, item).then(data => {
            uris.push({FileType: data[0].FileType, FileURL: data[0].FileURL});
            showUris.push({uri: data[0].FileURL});
            requestCnt = requestCnt + 1;
            if(requestCnt == response.assets.length){
              this.setState({isLoading: false, attachedImages: uris, showAttachImages: showUris});
            }
          }).catch(error => {
            console.log("uploadImage", error);
            this.setState({isLoading: false});
          });
        });
      }
    });
  }

  renderAttachFile = (item, index) => {
    let image = Images.icon_word;

    if (item.FileURL.endsWith('.pdf')) {
      image = Images.icon_pdf;
    } else if (item.FileURL.endsWith('.doc') || item.FileURL.endsWith('.docx')) {
      image = Images.icon_word;
    } else if (item.FileURL.endsWith('.xls') || item.FileURL.endsWith('.xlsx')) {
      image = Images.icon_excel;
    }  else if (item.FileURL.endsWith('.ppt') || item.FileURL.endsWith('.pptx')) {
      image = Images.icon_ppt;
    }

    return (
      <View style={{position: 'relative', marginVertical: 10, marginRight: 10}}>
        <Image style={{width: 50, height: 50}} source={image} />
        <TouchableOpacity style={{position: 'absolute', top: -10, right: -10}} onPress={()=> this.setState({attachedFiles: this.state.attachedFiles.filter((item, idex)=> idex != index)})} >
          <Image source={Images.n_close_circle} style={{width: 20, height: 20, resizeMode: 'contain'}}/>
        </TouchableOpacity>
      </View>
    )
  }

  renderAttachImages = (item, index) => {
    return (
      <TouchableOpacity style={{position: 'relative', marginVertical: 10, marginRight: 10}} key={index} onPress={()=>this.setState({showImageView: true, selImageIndex: index})} >
        <Image style={{width: 50, height: 70}} source={{uri: item.uri}} />
        <TouchableOpacity style={{position: 'absolute', top: -10, right: -10}} onPress={()=> this.setState({attachedImages: this.state.attachedImages.filter((item, idex)=> idex != index), showAttachImages: this.state.showAttachImages.filter((item, idex)=> idex != index)})} >
          <Image source={Images.n_close_circle} style={{width: 20, height: 20, resizeMode: 'contain'}}/>
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }

  onReplySelect = (item, index) => {
    if(item != null){
      this.setState({showReplySelect: false, reply: item});
    }else{
      this.setState({showReplySelect: false});
    }
  }


  render() {
    var radio_props = [
      { text: translang.t('BROADCAST_send_now'), key: 1 },
      { text: translang.t('BROADCAST_set_time'), key: 2 }
    ];


    const deliveryDate = this.state.deliveryDate === '' ? 'DD/MM/YYYY' : moment(this.state.deliveryDate).format('DD/MM/YYYY');
    const deliveryTime = this.state.deliveryTime === '' ? 'HH:mm' : moment(this.state.deliveryTime).format('HH:mm');
    const _deliveryTime = this.state.deliveryTime === '' ? moment() : this.state.deliveryTime;

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_broadcast')}
          onMenuTap={() => this.back()}/>
          <ScrollView style={styles.list}>
            <View style={{...styles.listItem, marginTop: 20, marginBottom: 10}}>
              <View style={{...styles.listItem, flexDirection: 'column', alignItems: 'flex-start'}}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <Text style={styles.itemTitle}>{translang.t('HEAD_TOPIC')}</Text>
                </View>
                <CustomTextInput
                  inputStyle={{
                    borderWidth: 0,
                    borderColor: Color.n_default_brown,
                    borderBottomWidth: 1,
                    fontSize: 20,
                  }}
                  inputWrapperStyle={{
                    marginBottom: 10,
                    marginTop: 10,
                    width: '100%',
                  }}
                  value={this.state.topic}
                  placeholder={translang.t('HEAD_TOPIC')}
                  placeholderTextColor={Color.n_text_placeholder_gray}
                  onChangeText={text => this.setState({ topic: text })}
                />
              </View>
              <View style={{...styles.listItem, flexDirection: 'column', alignItems: 'flex-start'}}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <Text style={styles.itemTitle}>{translang.t('REPLY')}</Text>
                </View>
                <TouchableOpacity
                    style={{width: '100%'}}
                    onPress={() => this.setState({showReplySelect: true})}>
                  <CustomTextInput
                    inputStyle={{
                      borderWidth: 0,
                      borderBottomWidth: 0,
                      borderColor: Color.n_default_brown,
                      fontSize: 20,
                    }}
                    inputWrapperStyle={{
                      marginBottom: 10,
                      marginTop: 10,
                      width: '100%',
                      borderColor: Color.n_default_brown,
                      borderBottomWidth: 1,
                    }}
                    value={this.state.reply.title ?? ''}
                    notouch={true}
                    placeholder={translang.t('REPLY')}
                    placeholderTextColor={Color.n_text_placeholder_gray}
                  />
                </TouchableOpacity>
              </View>

              <View style={{flexDirection: 'row'}}>
                <Text style={styles.itemTitle}>{translang.t('REPORT_delivery_format')}</Text>
              </View>
              <CustomRadioButton
                PROP={radio_props}
                isVertically={true}
                radioColor={Color.n_button_gradient_green_start}
                radioSize={30}
                itemTextStyle={{fontSize: 24}}
                selVal={this.state.deliveryTimeType}
                onPress={(value) => { this.setState({ deliveryTimeType: value }) }} />
            </View>
            { this.state.deliveryTimeType === 2 &&
              <View style={{flexDirection: 'row',width: '100%'}}>
                <View style={{marginRight: 30, flex: 1}}>
                  <TouchableOpacity
                    style={styles.itemDateTimeInput}
                    onPress={() => this.setState({showDatePicker: true})}>
                    <Text style={styles.itemDateTimeText}>{deliveryDate}</Text>
                  </TouchableOpacity>
                </View>
                <View style={{flex: 1}}>
                  <TouchableOpacity
                    style={styles.itemDateTimeInput}
                    onPress={() => this.setState({showTimePicker: true})}>
                    <Text style={styles.itemDateTimeText}>{deliveryTime}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            }
            <View style={{...styles.listItem, flexDirection: 'column', alignItems: 'flex-start'}}>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <Text style={styles.itemTitle}>{translang.t('HOMEWORK_description1')}</Text>
              </View>
              <CustomTextInput
                inputStyle={{
                  borderWidth: 0,
                  borderColor: Color.n_default_brown,
                  borderBottomWidth: 1,
                  fontSize: 20,
                }}
                inputWrapperStyle={{
                  marginBottom: 10,
                  marginTop: 10,
                  width: '100%',
                }}
                value={this.state.description}
                placeholder={translang.t('HOMEWORK_fill_in_the_detail')}
                placeholderTextColor={Color.n_text_placeholder_gray}
                onChangeText={text => {this.setState({ description: text })}}
              />
            </View>
            <View style={{...styles.listItem, flexDirection: 'column', alignItems: 'flex-start'}}>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <Text style={styles.itemTitle}>{translang.t('HOMEWORK_attachfile')}</Text>
              </View>
              <TouchableOpacity style={styles.chooseFileContainer} onPress={() => this.onChooseFile()}>
                <Text style={styles.chooseFile}>{translang.t('CHOOSE_FILE')}</Text>
              </TouchableOpacity>
              <FlatList
                data={this.state.attachedFiles}
                keyExtractor={(item, index) => index.toString()}
                ItemSeparatorComponent={this.ItemSeparatorView}
                renderItem={({item, index}) => this.renderAttachFile(item, index)}
                horizontal
              />
              <Text style={{color: Color.n_default_orange, fontFamily: 'THSarabunNew', fontSize: 18, fontWeight: 'bold',}}>{translang.t("FileSizeDes")}</Text>
            </View>
            <View style={{...styles.listItem, flexDirection: 'column', alignItems: 'flex-start'}}>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <Text style={styles.itemTitle}>{translang.t('HOMEWORK_attachimg')}</Text>
              </View>
              <TouchableOpacity style={styles.chooseImageContainer} onPress={() => this.onChooseImage()}>
                <Text style={styles.chooseImage}>{translang.t('CHOOSE_IMAGE')}</Text>
              </TouchableOpacity>

              <FlatList
                data={this.state.showAttachImages}
                keyExtractor={(item, index) => index.toString()}
                ItemSeparatorComponent={this.ItemSeparatorView}
                renderItem={({item, index}) => this.renderAttachImages(item, index)}
                horizontal
              />
              <Text style={{color: Color.n_default_orange, fontFamily: 'THSarabunNew', fontSize: 18, fontWeight: 'bold',}}>{translang.t("FileSizeDes")}</Text>
            </View>

            <NextButton
            label={translang.t('COMMON_next')}
            containerStyle={{ width: 290, marginLeft: 'auto', marginRight: 'auto', marginBottom: 20,}}
            buttonStyle={{ borderRadius: 38, height: 75}}
            colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
            isVerticalGradient={false}
            _onPress={() => this.__next()} />

          </ScrollView>

          <SelectListModal
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
        />
        <CalendarModal
          isVisible={this.state.showDatePicker}
          selectedDate={this.state.deliveryDate}
          type={'single'}
          minDate={moment()}
          onDateSelect={result => this.onDatePicked(result)} />
        <TimerPickerModal
          isVisible={this.state.showTimePicker}
          selectedTime={_deliveryTime}
          onTimeSelect={result => this.onTimePicked(result)} />

        <ImageView
          images={this.state.showAttachImages}
          imageIndex={this.state.selImageIndex}
          visible={this.state.showImageView}
          onRequestClose={() => this.setState({showImageView: false, selImageIndex: 0})}
        />
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
  titleContainer: {
    width: '100%',
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.bluegray,
  },
  title: {
    fontSize: 16,
    fontWeight: '300',
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    flex: 1,
    backgroundColor: Color.n_background_white,
    marginHorizontal: 10,
    marginVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  listItem: {
    marginVertical: 4,
  },
  itemTitle: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    color: Color.n_default_orange
  },
  itemAstro: {
    fontFamily: 'THSarabunNew',
    fontSize: 25,
    fontWeight: 'bold',
    color: 'red',
    marginHorizontal: 4,
  },
  itemTitleColon: {
    flex: 1,
    textAlign: 'right',
    marginRight: 4
  },
  itemTitleColon1: {
    textAlign: 'right',
    marginRight: 4
  },
  itemDateTimeInput: {
    flex: 1,
    borderBottomColor: Color.n_scorpion,
    borderBottomWidth: 1,
    height: 30,
    marginVertical: 0,
    justifyContent: 'center'
  },
  itemDateTimeText: {
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    textAlign: 'center',
    color: Color.n_scorpion,
  },
  itemTextInput: {
    width: '100%',
    marginVertical: 10,
    paddingVertical: 10,
    overflow: 'visible',
    borderRadius: 2,
    borderBottomWidth: 0,
    backgroundColor: Color.white,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 3,
  },
  imageButton: {
    height: 50,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25
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
  chooseFile: {
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    fontWeight: 'bold',
    color: Color.white,
    textAlign: 'center',
    alignSelf: 'center',
  },
  chooseFileContainer: {
    width: 140,
    height: 45,
    borderRadius: 23,
    backgroundColor: Color.n_default_brown,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10
  },
  chooseImage: {
    fontSize: 13,
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
});
