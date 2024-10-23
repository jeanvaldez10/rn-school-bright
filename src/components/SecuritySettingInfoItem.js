import React, {useState} from 'react';
import {View, Text, Image, StyleSheet, Switch, TouchableOpacity} from 'react-native';
import Color from '../constants/color';
import Images from '../themes/Images';

const ReportIconInfoItem = ({...props}) => {
  const {label, secondText, image_visible} = props;
  const {imageSize, topTextStyle, isImgRadius, tmarginleft, secondTextStyle, type, secondCallback, arrowCallback} = props;

  const _imageSize = imageSize ?? 50;
  const textMarginLeft = tmarginleft ?? 10;

  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <View style={[{paddingHorizontal: 0, paddingBottom: 0}, props.style]}>
      <View style={styles.menuItem}>
        <View style={{
          flexDirection: 'row',
          marginLeft: textMarginLeft,
          marginVertical: 10,
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          paddingRight: 30
        }}>
          <Text
            style={[styles.topText, topTextStyle]}>
            {label}
          </Text>
          {type !== 2 &&
          <Text style={[styles.secondText, secondTextStyle]}>
            {secondText}
          </Text>
          }
          {type == 2 &&
          <TouchableOpacity activeOpacity={0.5} onPress={secondCallback}>
            <Text style={[styles.secondText, secondTextStyle]}>
              {secondText}
            </Text>
          </TouchableOpacity>
          }

        </View>
        {image_visible && type !== 2 &&
        <Image source={Images.n_ic_arrow_right_orange_1} style={styles.image}></Image>
        }
        {image_visible && type == 2 &&
        <TouchableOpacity style={styles.image} activeOpacity={0.5} onPress={arrowCallback}>
          <Image source={Images.n_ic_arrow_right_orange_1} style={styles.image}></Image>
        </TouchableOpacity>
        }

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  menuItem: {
    flexDirection: 'row',
    marginVertical: 6,
    alignItems: 'center',
  },
  image: {
    height: 20,
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
    resizeMode: 'contain',
    position: 'absolute',
    right: 1,
    marginVertical: 10,
  },
  testBorder: {
    borderColor: 'red',
    borderWidth: 2,
  },
  topText: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    marginVertical: 3,
    marginHorizontal: 10,
    color: Color.dark
  },
  secondText: {
    fontFamily: 'THSarabunNew',
    fontSize: 16,
    color: '#b1b1b1',
  },
  bottomText: {
    fontFamily: 'THSarabunNew',
    fontSize: 16,
    marginVertical: 5,
    marginHorizontal: 10,
    color: Color.dark
  }
});

export default ReportIconInfoItem;
