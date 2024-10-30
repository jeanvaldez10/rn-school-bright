import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  Image,
  View,
  BackHandler,
  TouchableOpacity,
  FlatList,
  ScrollView,
  TextInput,
} from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import NextButton from '../../../components/NextButton';
import Color from '../../../constants/color';
import BackNavigationBar from '../../../components/BackNavigationBar';
import AlertWithImageModal from '../../../components/AlertWithImageModal';
import Images from '../../../themes/Images';
import translang, { getCurrentLocale } from '../../../utils/language.utils';
import CustomTextInput from '../../../components/CustomTextInput';
import CalendarModal from '../../../components/CalendarModal';
import TimerPickerModal from '../../../components/TimerPickerModal';
import CustomRadioButton from '../../../components/CustomRadioButton';
import moment from 'moment';
import DocumentPicker from 'react-native-document-picker';
import * as ImagePicker from 'react-native-image-picker';
import SelectListModal from '../../../components/SelectListModal';
import ApiManager from '../../../managers/ApiManager';
import ProgressHud from '../../../components/ProgressHud';
import ImageView from 'react-native-image-viewing';

const IncidentReport = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalBody, setModalBody] = useState('');
  const [showReplySelect, setShowReplySelect] = useState(false);
  const [deliveryFormat, setDeliveryFormat] = useState({});
  const [recipient, setRecipient] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [deliveryTimeType, setDeliveryTimeType] = useState(-1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');

  const [topic, setTopic] = useState('');
  const [reply, setReply] = useState('');
  const [description, setDescription] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [attachedImages, setAttachedImages] = useState([]);
  const [showAttachImages, setShowAttachImages] = useState([]);
  const [showImageView, setShowImageView] = useState(false);
  const [selImageIndex, setSelImageIndex] = useState(0);
  const [level2id, setLevel2id] = useState([]);
  const [userInfo, setUserInfo] = useState({});

  // Back button handler
  const handleBackButton = useCallback(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
  }, [handleBackButton]);

  const __next = async () => {
    if (topic === '') {
      setShowModal(true);
      setModalBody(translang.t('INPUT_HEADTOPIC'));
      return;
    }

    if (reply === '') {
      setShowModal(true);
      setModalBody(translang.t('INPUT_REPLY'));
      return;
    }

    if (deliveryTimeType == -1) {
      return;
    }

    if (deliveryTimeType === 2) {
      if (deliveryDate === '') {
        setShowModal(true);
        setModalBody(translang.t('SPECIFY_DATE'));
        return;
      }
      if (deliveryTime === '') {
        setShowModal(true);
        setModalBody(translang.t('SPECIFY_TIME'));
        return;
      }
    }
    if (description === '') {
      setShowModal(true);
      setModalBody(translang.t('INPUT_DESCRIPTION'));
      return;
    }
    const params = {
      deliveryFormat: deliveryFormat,
      recipient: recipient,
      deliveryTimeType: deliveryTimeType - 1,
      deliveryDate: deliveryDate,
      deliveryTime: deliveryTime,
      topic: topic,
      reply: reply,
      description: description,
      attachedFiles: attachedFiles,
      attachedImages: attachedImages,
      showAttachImages: showAttachImages,
      individualIds: selectedIds,
      userInfo: userInfo,
      level2id: level2id,
    };
    navigation.navigate('BroadcastSubmit', params);
  };

  const onChooseFile = async () => {
    try {
      const results = await DocumentPicker.pickMultiple({
        type: [
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
          DocumentPicker.types.xls,
          DocumentPicker.types.xlsx,
          DocumentPicker.types.pdf,
        ],
      });

      let requestCnt = 0;
      let uris = attachedFiles;

      if (uris.length + results.length > 10) {
        setShowModal(true);
        setModalBody(translang.t('CANTSELECT_LIMIT'));
        return;
      }
      setIsLoading(true);
      results.forEach((item) => {
        if (item.size > 25000000) {
          setShowModal(true);
          setModalBody(translang.t('OVERSIZE_ALERT'));
          setIsLoading(false);
          return;
        }
        ApiManager.uploadFile('broadcast', userInfo.SchoolID, item)
          .then((data) => {
            uris.push({ FileType: data[0].FileType, FileURL: data[0].FileURL });
            requestCnt = requestCnt + 1;
            if (requestCnt == results.length) {
              setIsLoading(false);
              setAttachedFiles(uris);
            }
          })
          .catch((error) => {
            console.log('uploadFile', error);
            setIsLoading(false);
          });
      });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
      } else {
      }
    }
  };

  const onChooseImage = () => {
    const options = {
      mediaType: 'photo',
      selectionLimit: 0,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.assets) {
        let requestCnt = 0;
        let uris = attachedImages;
        let showUris = showAttachImages;

        if (uris.length + response.assets.length > 10) {
          setShowModal(true);
          setModalBody(translang.t('CANTSELECT_LIMIT'));
          return;
        }
        setIsLoading(true);
        response.assets.forEach((item) => {
          if (item.fileSize > 25000000) {
            setShowModal(true);
            setModalBody(translang.t('OVERSIZE_ALERT'));
            return;
          }

          ApiManager.uploadImage('broadcast', userInfo.SchoolID, item)
            .then((data) => {
              uris.push({ FileType: data[0].FileType, FileURL: data[0].FileURL });
              showUris.push({ uri: data[0].FileURL });
              requestCnt = requestCnt + 1;
              if (requestCnt == response.assets.length) {
                setIsLoading(false);
                setAttachedImages(uris);
                setShowAttachImages(showUris);
              }
            })
            .catch((error) => {
              console.log('uploadImage', error);
              setIsLoading(false);
            });
        });
      }
    });
  };

  const renderAttachFile = (item, index) => {
    let image = Images.icon_word;

    if (item.FileURL.endsWith('.pdf')) {
      image = Images.icon_pdf;
    } else if (item.FileURL.endsWith('.doc') || item.FileURL.endsWith('.docx')) {
      image = Images.icon_word;
    } else if (item.FileURL.endsWith('.xls') || item.FileURL.endsWith('.xlsx')) {
      image = Images.icon_excel;
    } else if (item.FileURL.endsWith('.ppt') || item.FileURL.endsWith('.pptx')) {
      image = Images.icon_ppt;
    }

    return (
      <View style={{ position: 'relative', marginVertical: 10, marginRight: 10 }}>
        <Image style={{ width: 50, height: 50 }} source={image} />
        <TouchableOpacity
          style={{ position: 'absolute', top: -10, right: -10 }}
          onPress={() => setAttachedFiles(attachedFiles.filter((item, idex) => idex != index))}
        >
          <Image
            source={Images.n_close_circle}
            style={{ width: 20, height: 20, resizeMode: 'contain' }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderAttachImages = (item, index) => {
    return (
      <TouchableOpacity
        style={{ position: 'relative', marginVertical: 10, marginRight: 10 }}
        key={index}
        onPress={() => {
          setShowImageView(true);
          setSelImageIndex(index);
        }}
      >
        <Image style={{ width: 50, height: 70 }} source={{ uri: item.uri }} />
        <TouchableOpacity
          style={{ position: 'absolute', top: -10, right: -10 }}
          onPress={() => {
            setAttachedFiles(attachedImages.filter((item, idex) => idex != index));
            setShowAttachImages(showAttachImages.filter((item, idex) => idex != index));
          }}
        >
          <Image
            source={Images.n_close_circle}
            style={{ width: 20, height: 20, resizeMode: 'contain' }}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  var radio_props = [
    { text: translang.t('REPORT_TYPE_SCHOOL'), key: 1 },
    { text: translang.t('REPORT_TYPE_PARENT'), key: 2 },
  ];

  // UI Components
  return (
    <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
      <BackNavigationBar title={translang.t('SchoolBus')} onMenuTap={handleBackButton} />
      <ScrollView style={styles.list}>
        <View style={{ ...styles.listItem, marginTop: 20, marginBottom: 10 }}>
          <View style={{ ...styles.listItem, flexDirection: 'column', alignItems: 'flex-start' }}>
            <Text style={styles.itemTitle}>{translang.t('REPORT_INCIDENT_TO_PARENT')}</Text>

            <CustomTextInput
              inputStyle={styles.input1}
              inputWrapperStyle={{
                marginBottom: 10,
                marginTop: 10,
                width: '100%',
              }}
              value={topic}
              textAlignVertical={'top'}
              placeholderTextColor={Color.n_text_placeholder_gray}
              onChangeText={(text) => setTopic(text)}
            />
          </View>

          <Text style={styles.itemTitle}>{translang.t('SEND_TYPE')}</Text>
          <CustomRadioButton
            PROP={radio_props}
            isVertically={true}
            radioColor={Color.n_button_gradient_green_start}
            radioSize={30}
            itemTextStyle={{ fontSize: 24 }}
            selVal={deliveryTimeType}
            onPress={(value) => {
              setDeliveryTimeType(value);
            }}
          />
        </View>

        <View style={{ ...styles.listItem, flexDirection: 'column', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <Text style={styles.itemTitle}>{translang.t('HOMEWORK_attachfile')}</Text>
          </View>
          <TouchableOpacity style={styles.chooseFileContainer} onPress={() => onChooseFile()}>
            <Text style={styles.chooseFile}>{translang.t('CHOOSE_FILE')}</Text>
          </TouchableOpacity>
          <FlatList
            data={attachedFiles}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => renderAttachFile(item, index)}
            horizontal
          />
          <Text
            style={{
              color: Color.n_default_orange,
              fontFamily: 'THSarabunNew',
              fontSize: 18,
              fontWeight: 'bold',
            }}
          >
            {translang.t('FileSizeDes')}
          </Text>
        </View>
        <View style={{ ...styles.listItem, flexDirection: 'column', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <Text style={styles.itemTitle}>{translang.t('HOMEWORK_attachimg')}</Text>
          </View>
          <TouchableOpacity style={styles.chooseImageContainer} onPress={() => onChooseImage()}>
            <Text style={styles.chooseImage}>{translang.t('CHOOSE_IMAGE')}</Text>
          </TouchableOpacity>

          <FlatList
            data={showAttachImages}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => renderAttachImages(item, index)}
            horizontal
          />
          <Text
            style={{
              color: Color.n_default_orange,
              fontFamily: 'THSarabunNew',
              fontSize: 18,
              fontWeight: 'bold',
            }}
          >
            {translang.t('FileSizeDes')}
          </Text>
        </View>

        <NextButton
          label={translang.t('COMMON_next')}
          containerStyle={{ width: 290, marginLeft: 'auto', marginRight: 'auto', marginBottom: 20 }}
          buttonStyle={{ borderRadius: 38, height: 75 }}
          colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
          isVerticalGradient={false}
          _onPress={() => __next()}
        />
      </ScrollView>

      <AlertWithImageModal
        isVisible={showModal}
        image={Images.alert_inbox}
        message={modalBody}
        buttonColors={[Color.red_orange, Color.soft_red]}
        isVerticalGradient={false}
        onClose={() => {
          setShowModal(false);
        }}
      />

      <ImageView
        images={showAttachImages}
        imageIndex={selImageIndex}
        visible={showImageView}
        onRequestClose={() => {
          setShowImageView(false);
          setSelImageIndex(0);
        }}
      />
      <ProgressHud isVisible={isLoading} />
    </SafeAreaView>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
    color: Color.n_default_orange,
  },

  imageButton: {
    height: 50,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
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
    marginVertical: 10,
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
    marginVertical: 10,
  },
  input1: {
    borderColor: Color.divider_color,
    borderWidth: 1,
    fontSize: 20,
    borderRadius: 8,
    minHeight: 200,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
});

export default IncidentReport;
