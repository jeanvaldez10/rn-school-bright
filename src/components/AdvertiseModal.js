import React from 'react';
import {useState, useEffect} from "react";
import {View, Text, Image, Modal, TouchableOpacity} from 'react-native';
import Color from '../constants/color';
import GradientButton from './GradientButton';
import translang, { getCurrentLocale } from '../utils/language.utils';
import CustomCheckButton from './CustomCheckButton';
import { SliderBox } from "react-native-image-slider-box";
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';

export default function AdvertiseModal({
  images,
  title,
  message,
  buttonTitle,
  onClose,
  onRemember,
  rememberVal,
  ...props
}) {
    const { isVisible, titleStyle, messageStyle } = props;
    const { buttonColors, isVerticalGradient } = props;

    const [isSelected, setIsSelected] = useState(false)

    useEffect(() => {
      onRemember(isSelected);
    }, [isSelected]);


    const close = () => {
      if (onClose !== undefined && onClose !== null) {
        onClose();
      }
    }
    const setRemember = () => {
      setIsSelected(!isSelected);
    }
    let showImgUri = "k";
    if(images && images.length){
      showImgUri = images[0]
    }

    return (
      <>
      { isVisible &&
        <View style={styles.centeredView} >
          <View style={styles.dialogStyle}>
            <Image source={{uri: showImgUri}} style={styles.image} />
            {/* <View style={styles.sliderContainer}>
              <SliderBox
                style={{borderTopRightRadius: 15, borderTopLeftRadius: 15,}}
                parentWidth={290}
                height = {350}
                circleLoop
                images={"images"} />
            </View> */}

            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent:'flex-start', alignSelf: 'flex-start', marginLeft: 20}}>
              <CustomCheckButton
                isSelected={isSelected}
                onPress={() => setRemember()}
                checkboxSize={20}
                text={translang.t('DONT_SHOW_AGAIN')}
                textColor={Color.n_default_orange}
                itemTextStyle={styles.checkboxlabel}
              />
            </View>
            <GradientButton
              label={buttonTitle ?? translang.t('COMMON_close') }
              containerStyle={styles.buttonStyle}
              buttonStyle={styles.buttonTextStyle}
              colors={buttonColors}
              isVerticalGradient={isVerticalGradient}
              titleStyle={styles.buttonTitleStyle}
              _onPress={() => close()} />
          </View>
        </View>

      }
      </>

    );
}

const styles = ScaledSheet.create({
  centeredView: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#00000070',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dialogStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden'
  },

  sliderContainer: {
    width: "290@s",
    height: "350@vs",
    marginBottom: 20,
  },


  image: {
    width: "290@s",
    height: "350@vs",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  text: {
    textAlign: 'center',
    paddingHorizontal: 8,
    fontSize: "24@ms",
    color: Color.n_default_gray,
    fontWeight: 'normal',
    fontFamily: 'THSarabunNew',
  },

  buttonStyle:{
    width: "130@ms",
    marginBottom: "20@ms",
    marginTop:"20@ms",
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  buttonTextStyle:{
    borderRadius: "20@ms",
    height: "40@ms",
  },
  buttonTitleStyle:{
    fontSize: "20@ms",
  },
  checkboxlabel: {
    fontFamily: 'THSarabunNew',
    fontSize: "20@ms",
    fontWeight: 'bold',
    marginLeft: "5@ms",
  },
});
