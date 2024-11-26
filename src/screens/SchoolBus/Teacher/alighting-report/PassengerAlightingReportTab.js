import moment from 'moment';
import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Color from '../../../../constants/color';
import Images from '../../../../themes/Images';
import translang from '../../../../utils/language.utils';
import HorizontalScrollableBars from './BarChart';

const PassengerAlightingReportTab = (props) => {
  const { reportList, total, isEvening } = props;

  const onMoreDetails = (item) => () => {
    props.navigation.navigate('DetailedAlightingReport', {
      date: props.date,
      busID: item.nBusID,
      isEvening,
    });
  };

  const RenderItem = ({ image, item }) => {
    const {
      sBusLicensePlate,
      nBusStudents,
      nBoardingCnt,
      nBoardingPercent,
      nAlightingCnt,
      nAlightingPercent,
    } = item;
    return (
      <Pressable style={styles.busItem} onPress={onMoreDetails(item)}>
        <Image source={image} style={styles.busImage} />
        <View style={styles.wrapper1}>
          <View style={styles.wrapper2}>
            <Text style={styles.text1}>{sBusLicensePlate}</Text>
            <Text style={styles.text2}>
              {nBusStudents} {translang.t('PEOPLE')}
            </Text>
          </View>
          <View style={styles.wrapper2}>
            <Text style={styles.text1}>
              {translang.t('CHECK_IN')} : {nBoardingCnt} {translang.t('PEOPLE')}
              <Text style={[styles.text3, nBoardingPercent < 100 && { color: Color.red_color_bg }]}>
                {' '}
                ({nBoardingPercent}%)
              </Text>
            </Text>
            <Text style={styles.text2} numberOfLines={1}>
              {translang.t('CHECK_OUT')} : {nAlightingCnt} {translang.t('PEOPLE')}
              <Text style={[styles.text3, nBoardingPercent < 100 && { color: Color.red_color_bg }]}>
                {' '}
                ({nAlightingPercent}%)
              </Text>
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const date = moment(props.date).format('DD MMMM YYYY');
  const titleText = translang.t('ALL_STUDENTS') + ` ${total} ` + translang.t('PEOPLE');

  return (
    <View style={styles.container} key={props.reportList}>
      <ScrollView style={styles.container}>
        <Text style={styles.topText1}>{date}</Text>
        <Text style={styles.topText2}>{titleText}</Text>
        <View style={styles.content}>
          <HorizontalScrollableBars data={reportList} />
        </View>
        {reportList.map((item, index) => (
          <RenderItem
            key={index.toString()}
            image={Images.ic_school_bus_green}
            index={index}
            item={item}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
  },
  content: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 15,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowColor: 'black',
    shadowRadius: 3,
    elevation: 2,
    shadowOpacity: 0.4,
    padding: 10,
  },
  topText1: {
    fontSize: 25,
    fontFamily: 'THSarabunNew',
    fontWeight: 'bold',
    textAlign: 'center',
    color: Color.text_black,
  },
  topText2: {
    fontSize: 18,
    fontFamily: 'THSarabunNew',
    fontWeight: 'bold',
    textAlign: 'center',
    color: Color.text_black,
  },

  busItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 8,
    paddingHorizontal: 15,
    paddingVertical: 16,
    backgroundColor: Color.white,
    borderRadius: 15,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowColor: 'black',
    shadowRadius: 3,
    elevation: 2,
    shadowOpacity: 0.4,
  },
  busImage: {
    width: 43,
    height: 43,
    marginRight: 20,
  },
  wrapper1: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'center',
  },
  wrapper2: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text1: {
    fontFamily: 'THSarabunNew',
    fontSize: 18,
    fontWeight: 'bold',
    color: Color.n_default_gray,
    marginRight: 10,
  },
  text2: {
    fontFamily: 'THSarabunNew',
    fontSize: 18,
    fontWeight: 'bold',
    color: Color.n_default_gray,
  },
  text3: {
    fontFamily: 'THSarabunNew',
    fontSize: 18,
    fontWeight: 'bold',
    color: Color.green_text,
  },
});

export default PassengerAlightingReportTab;
