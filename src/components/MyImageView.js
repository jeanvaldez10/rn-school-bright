import React, {useState} from 'react';
import {StyleSheet, View, Modal, Image, TouchableOpacity, Dimensions} from 'react-native';
import Color from '../constants/color';
import Images from '../themes/Images';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from "native-base";
import ImageView from "react-native-image-viewing";
import RNFS from "react-native-fs";
import translang, {getCurrentLocale} from '../utils/language.utils';
import {CameraRoll} from "@react-native-camera-roll/camera-roll";
import awaitAsyncGenerator from "@babel/runtime/helpers/esm/awaitAsyncGenerator";

const MyImageView = ({...props}) => {
  const visible = props.visible;
  const images = props.images;
  const onRequestClose = props.onRequestClose;
  const ScreenHeight = Dimensions.get("window").height;

  const [downloadingStatus, setDownloadingStatus] = useState('');

  const getUrlExtension = (url, filetype) => {
    let res = url.split(/[#?]/)[0].split(".").pop().trim();
    if (res.length > 4) {
      res = filetype.split('/').pop().trim();
    }
    return res;
  };

  const downloadFile = (item) => {
    let date = new Date();
    const url = item.uri;
    const fileName = "message_" + Math.floor(date.getTime() + date.getSeconds() / 2);
    const extension = getUrlExtension(url, item.filetype);

    const localFile = `${RNFS.DocumentDirectoryPath}/${fileName}.${extension}`;

    let options = {fromUrl: url, toFile: localFile};
    console.log(url);
    setDownloadingStatus('downloading');

    RNFS.downloadFile(options)
      .promise.then(async () => {
      await CameraRoll.save(localFile);
      setDownloadingStatus('downloaded');
    })
      .then(() => {
        setTimeout(() => {
          setDownloadingStatus('');
        }, 3000)
      })
      .catch((error) => {
        const temp = [{uri: url}];
        setDownloadingStatus('');
        console.log("OpenFilesError", error);
      });
  }

  const downloadImage = (imageIndex) => {
    downloadFile(images[imageIndex]);
  };


  return (
    <>
      <ImageView
        images={images}
        imageIndex={props.imageIndex ?? 0} presentationStyle='overFullScreen'
        visible={visible}
        onRequestClose={onRequestClose}
        FooterComponent={(imageIndex) => {
          if (downloadingStatus !== '') {
            return (
              <View style={{
                ...styles.saveContainer,
                height: ScreenHeight,
                justifyContent: 'center',
                alignItems: 'center'
              }}>

                {downloadingStatus == 'downloading' &&
                <Image source={Images.n_ic_loading_gf} style={styles.LoadingImage}/>
                }
                {downloadingStatus == 'downloaded' &&
                <View style={styles.loadedImageContainer}>
                  <Image source={Images.BLUE_SUCCESS} style={styles.SuccessImage}/>
                  <Text style={styles.savedText}>{translang.t('SAVED')}</Text>
                </View>
                }
              </View>
            )
          } else {
            return (
              <View style={{...styles.saveContainer}}>
                <TouchableOpacity style={styles.saveButton} onPress={() => {
                  downloadImage(imageIndex.imageIndex)
                }}>
                  <Image source={Images.BLUE_DOWNLOAD} style={styles.saveButtonImage}/>
                </TouchableOpacity>
              </View>
            )
          }
        }
        }
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0001',
  },
  wrapper: {
    width: 70,
    height: 70,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveContainer: {
    backgroundColor: "#00000077",
    flexDirection: 'column-reverse',
    justifyContent: 'center',
    padding: 40,
    gap: 30,
  },
  saveButton: {
    alignItems: 'center',
  },
  saveButtonImage: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  LoadingImage: {
    width: 80,
    resizeMode: 'contain',
  },
  SuccessImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  loadedImageContainer: {
    backgroundColor: '#00000080',
    borderRadius: 16,
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center'
  },
  savedText: {
    color: 'white',
    fontSize: 20,
    marginTop: 10,
  },
});

export default MyImageView;
