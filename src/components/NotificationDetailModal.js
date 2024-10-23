import React, {useState} from 'react';
import {StyleSheet, View, Text, Dimensions, ScrollView, FlatList, TouchableOpacity, Image, Modal} from 'react-native';
import Color from '../constants/color';
import GradientButton from './GradientButton';
import translang, {getCurrentLocale} from '../utils/language.utils';
import moment from 'moment';
import Images from '../themes/Images';
import Hyperlink from 'react-native-hyperlink'
import {Linking} from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard';
import MyImageView from "./MyImageView";


export default function NotificationDetailModal({
                                                  image,
                                                  title,
                                                  message,
                                                  date,
                                                  sender,
                                                  buttonTitle,
                                                  attachedFiles,
                                                  buttonList,
                                                  onClose,
                                                  clickFiles,
                                                  onClickReply,
                                                  ...props
                                                }) {
  const {isVisible, titleStyle, messageStyle, msgDetail} = props;
  let {buttonColors, isVerticalGradient, buttonReplyLabel} = props;

  const [showImageView, setShowImageView] = useState(false);
  const [showCopyText, setShowCopyText] = useState(false);
  const [showImageIndex, setshowImageIndex] = useState(0);

  const close = () => {
    if (onClose !== undefined && onClose !== null) {
      onClose();
    }
  }

  if (buttonColors === undefined || buttonColors === null) {
    buttonColors = [Color.n_button_gradient_green_start, Color.n_button_gradient_green_end];
  }
  if (isVerticalGradient === undefined || isVerticalGradient === null) {
    isVerticalGradient = false;
  }

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const dlgWidth = screenWidth * 0.9;
  const dlgHeight = screenHeight * 0.7;

  const dateString = moment(date).format('DD MMMM YYYY HH:mm');

  let ImagesData = [];

  let idx = 0;
  attachedFiles.forEach((item1) => {
    if (item1.filetype.toLowerCase().includes('image')) {
      ImagesData[idx] = {
        id: idx,
        uri: item1.filename,
      };
      idx++;
    }
  });

  const getCurrentImageIndex = (item1) => {
    ImagesData.forEach((item) => {
      if(item1.filename == item.uri){
        setshowImageIndex(item.id);
      }
    })
  }

  const clickImage = (item) => {
    getCurrentImageIndex(item);
    setShowImageView(true);
  }


  const copyClipboard = () => {
    let content = `${date} \n${translang.t('BROADCAST_sender')}: ${sender} \n --------------------------------------------- \n${title} \n${message}`;
    Clipboard.setString(content);
    setShowCopyText(true);
    setTimeout(() => {
      setShowCopyText(false);
    }, 1000);
  }


  const renderAttachImages = (item, index) => {
    let image = Images.icon_pdf;
    if (item.filetype.toLowerCase().includes('pdf')) {
      image = Images.icon_pdf;
    } else if (item.filetype.toLowerCase().includes('word')) {
      image = Images.icon_word;
    } else if (item.filetype.toLowerCase().includes('excel') || item.filetype.toLowerCase().includes('sheet')) {
      image = Images.icon_excel;
    } else if (item.filetype.toLowerCase().includes('powerpoint') || item.filetype.toLowerCase().includes('presentation')) {
      image = Images.icon_ppt;
    } else if (item.filetype.toLowerCase().includes('image')) {
      image = {uri: item.filename};
    } else {
      image = Images.icon_word;
    }

    if (item.filetype.toLowerCase().includes('image')) {
      return (
        <TouchableOpacity style={{position: 'relative', marginVertical: 10, marginRight: 10}} key={index}
                          onPress={() => {
                            clickImage(item)
                          }}>
          <Image style={{width: 30, height: 50}} source={{uri: item.filename}}/>
        </TouchableOpacity>
      )
    } else {
      return (
        <TouchableOpacity style={{position: 'relative', marginVertical: 10, marginRight: 10}} key={index}
                          onPress={() => {
                            clickFiles(item)
                          }}>
          <Image style={{width: 30, height: 50}} source={image}/>
        </TouchableOpacity>
      )
    }

  }

  const renderButtons = (buttons) => {
    var res = [];

    if (msgDetail.replyStatus) {
      const btnlabel = msgDetail.replyResult;
      res.push(
        <GradientButton
          label={btnlabel}
          containerStyle={styles.buttonContainer}
          buttonStyle={{borderRadius: 22, height: 44,}}
          colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
          isVerticalGradient={false}
          enabled={false}
          _onPress={() => console.log("")}/>
      );
    } else {
      for (let i = 0; i < buttons.length; i++) {
        const item = buttons[i];
        const btnlabel = item.MessageButton
        res.push(
          <GradientButton
            key={i}
            label={btnlabel}
            containerStyle={styles.buttonContainer}
            buttonStyle={{borderRadius: 22, height: 44,}}
            colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
            isVerticalGradient={false}
            enabled={true}
            _onPress={() => onClickReply(item)}/>
        );
      }
    }


    return res;
  }

  return (
    <Modal
      animationType='fade'
      transparent={true}
      key="modal"
      visible={isVisible}>
      <View style={styles.centeredView}>
        <View style={{...styles.dialogStyle, width: dlgWidth, height: dlgHeight}}>
          <View style={{paddingTop: 25, paddingBottom: 15, paddingHorizontal: 20,}}>
            <Text style={[styles.text, titleStyle, {color: Color.n_default_gray_dark, marginTop: 10}]}>
              {dateString}
            </Text>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <Text style={[styles.text, titleStyle, {color: Color.n_default_gray_dark, marginBottom: 10}]}>
                {`${translang.t('BROADCAST_sender')}: ${sender}`}
              </Text>
              <TouchableOpacity onPress={() => {
                copyClipboard();
              }}>
                <Image source={Images.n_ic_copy_orange}
                       style={{width: 20, height: 24, marginRight: 5, resizeMode: 'stretch',}}/>
              </TouchableOpacity>
            </View>

            <View style={{height: 1, backgroundColor: Color.n_default_orange, marginVertical: 5}}/>
          </View>
          <ScrollView style={{paddingHorizontal: 20, marginBottom: 15, flex: 1}}
                      contentContainerStyle={{flexGrow: 1,}}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20
            }}>
              <Text style={[styles.title, titleStyle,]}>
                {title}
              </Text>
            </View>
            {/* <Autolink style={[styles.text, messageStyle]} linkStyle={[styles.text, {color: 'blue', fontWeight: 'normal', fontSize: 18}]} text={message} email={false} /> */}
            <Hyperlink onPress={url => {
              Linking.openURL(url)
            }} linkDefault={false} linkStyle={{color: "blue"}}>
              <Text style={[styles.text, messageStyle]}>{message}</Text>
            </Hyperlink>
            {attachedFiles.length > 0 &&
            <FlatList
              style={{flex: 1}}
              data={attachedFiles}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item, index}) => renderAttachImages(item, index)}
              horizontal
            />
            }
            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              width: '100%',
              flexWrap: 'wrap',
              marginTop: 'auto',
              marginBottom: 0
            }}>
              {buttonList.length > 0 && <>
                {renderButtons(buttonList)}
              </>}
            </View>
          </ScrollView>
          <TouchableOpacity onPress={() => close()} style={{position: 'absolute', right: 20, top: 20}}>
            <Image source={Images.n_close_circle} style={{width: 30, height: 30, resizeMode: 'contain'}}/>
          </TouchableOpacity>
        </View>
        {showCopyText &&
        <View style={{width: '100%',  alignItems: 'center'}}>
          <Text style={styles.copyText}>Copied To Clipboard</Text>
        </View>
        }
        <MyImageView
          images={ImagesData}
          imageIndex={showImageIndex} presentationStyle={'formSheet'}
          visible={showImageView}
          onRequestClose={() => setShowImageView(false)}/>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000070',
  },
  dialogStyle: {
    position: 'relative',
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    elevation: 5,
    overflow: 'hidden',
    backgroundColor: 'white',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Color.n_default_gray,
  },
  text: {
    fontSize: 23,
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray
  },

  buttonContainer: {
    width: 126,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    elevation: 5,

    justifyContent: 'center',
    alignItems: 'center',

    marginHorizontal: 3,
    marginVertical: 5,
  },

  image: {
    height: 60,
    marginVertical: 20,
    resizeMode: 'contain',
  },

  dateTime: {
    position: 'absolute',
    top: 10,
    right: 10,
    textAlign: 'right',
    paddingHorizontal: 8,
    fontSize: 22,
    fontWeight: 'normal',
    fontFamily: 'THSarabunNew',
  },
  copyText: {
    fontSize: 22,
    color: 'white',
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: '#000000A0',
    marginTop: 25,
    borderRadius: 8,
    fontWeight: 'bold',
    position: 'absolute',
    bottom: 30,
  }
});
