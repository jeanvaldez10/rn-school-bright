import { Text } from 'native-base';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import * as ImagePicker from 'react-native-image-picker';
import ImageView from 'react-native-image-viewing';
import { ScaledSheet } from 'react-native-size-matters';
import AlertWithImageModal from '../../../components/AlertWithImageModal';
import BackNavigationBar from '../../../components/BackNavigationBar';
import CustomRadioButton from '../../../components/CustomRadioButton';
import CustomTextInput from '../../../components/CustomTextInput';
import GradientButton from '../../../components/GradientButton';
import ProgressHud from '../../../components/ProgressHud';
import Color from '../../../constants/color';
import ApiManager from '../../../managers/ApiManager';
import Images from '../../../themes/Images';
import translang from '../../../utils/language.utils';
import CustomCheckbox from '../CustomCheckBox';

const GroupIncidentReport = ({ navigation }) => {
  const [userInfo] = useState(navigation.getParam('userInfo'));
  const [nTravelID] = useState(navigation.getParam('nTravelID'));

  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalBody, setModalBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [description, setDescription] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [attachedImages, setAttachedImages] = useState([]);
  const [showAttachImages, setShowAttachImages] = useState([]);
  const [showImageView, setShowImageView] = useState(false);
  const [selImageIndex, setSelImageIndex] = useState(0);
  const [isSendToParent, setIsSentToParent] = useState(false);
  const [groupType, setGroupType] = useState(0);

  console.log(nTravelID, userInfo);
  // Back button handler
  const handleBackButton = useCallback(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
  }, [handleBackButton]);

  const handleToggleParent = useCallback(() => {
    if (isSendToParent) {
      setGroupType(0);
    }
    setIsSentToParent(!isSendToParent);
  }, [isSendToParent]);

  const __next = async () => {
    if (submitting) {
      return;
    }
    if (description === '') {
      setShowModal(true);
      setModalBody(translang.t('INPUT_DESCRIPTION'));
      return;
    }

    setSubmitting(true);
    try {
      const result = await ApiManager.submitBusGroupIncident({
        nTravelID,
        isSendToSchool: true,
        isSendToParent,
        nStudentGroupKind: groupType,
        sMessage: description,
        sFileURLs: attachedFiles.map((file) => file.FileURL).join(','),
        sImageURLs: attachedImages.map((file) => file.FileURL).join(','),
      });
      if (result.status === 1) {
        setShowModal(true);
        setModalBody(translang.t('SUCCESS_INCIDENT_SUBMIT'));
      } else {
        throw Error(result.message);
      }
    } catch (e) {
      console.log(e);
      setShowModal(true);
      setModalBody(e.message || translang.t('ERROR_OCCURED_TRY_AGAIN'));
    }
    setSubmitting(false);
  };

  const onChooseFile = async () => {
    try {
      const results = await DocumentPicker.pick({
        allowMultiSelection: true,
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
          });
      });
    } catch (err) {
      // if (DocumentPicker.isCancel(err)) {
      // } else {
      // }
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
              console.log(data);
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
    { text: translang.t('REPORT_SEND_TO_PARENTS_NOT_CHECKEDIN'), key: 1 },
    { text: translang.t('REPORT_SEND_TO_PARENTS_NOT_CHECKEDOUT'), key: 2 },
    { text: translang.t('REPORT_SEND_TO_PARENTS_ALL'), key: 3 },
  ];

  console.log(modalBody);

  // UI Components
  return (
    <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
      <BackNavigationBar title={translang.t('SchoolBus')} onMenuTap={handleBackButton} />
      <ScrollView style={styles.list}>
        <View style={{ ...styles.listItem, marginTop: 20, marginBottom: 10 }}>
          <View style={{ ...styles.listItem, flexDirection: 'column', alignItems: 'flex-start' }}>
            <Text style={styles.itemTitle}>{translang.t('REPORT_INCIDENT_TO_GROUP')}</Text>
            <Text style={styles.itemTitle}>{translang.t('REPORT_INCIDENT_TO_PARENT')}</Text>

            <CustomTextInput
              inputStyle={styles.input1}
              inputWrapperStyle={{
                marginBottom: 10,
                marginTop: 10,
                width: '100%',
              }}
              value={description}
              textAlignVertical={'top'}
              placeholder={translang.t('FILL_IN_THE_DETAIL')}
              placeholderTextColor={Color.n_text_placeholder_gray}
              onChangeText={(text) => setDescription(text)}
            />
          </View>

          <Text style={styles.itemTitle}>{translang.t('SEND_TYPE')}</Text>
          <CustomCheckbox
            checked={true}
            label={translang.t('REPORT_SEND_TO_SCHOOL')}
            disabled={true}
          />
          <CustomCheckbox
            checked={isSendToParent}
            label={translang.t('REPORT_SEND_TO_PARENTS')}
            onToggle={handleToggleParent}
            containerStyle={styles.checkBoxContainer}
          />
          {isSendToParent && (
            <CustomRadioButton
              PROP={radio_props}
              isVertically={true}
              radioColor={Color.n_button_gradient_green_start}
              radioSize={30}
              itemTextStyle={{ fontSize: 24 }}
              selVal={groupType}
              containerStyle={{ marginLeft: 24 }}
              onPress={setGroupType}
            />
          )}
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

        <GradientButton
          label={translang.t('COMMON_next')}
          containerStyle={styles.nextButtonContainer}
          buttonStyle={{ borderRadius: 38, height: 75 }}
          colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
          isVerticalGradient={false}
          ContentComponent={submitting ? () => <ActivityIndicator color={Color.white} /> : null}
          _onPress={() => __next()}
        />
      </ScrollView>

      <AlertWithImageModal
        isVisible={showModal}
        image={Images.alert_inbox}
        message={JSON.stringify(modalBody)}
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
  checkBoxContainer: {
    marginTop: 8,
  },
  nextButtonContainer: {
    width: 290,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 24,
    marginBottom: 20,
  },
});

export default GroupIncidentReport;
