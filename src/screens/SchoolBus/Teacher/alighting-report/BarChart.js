import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Color from '../../../../constants/color';

const HorizontalScrollableBars = ({ data }) => {
  const boardingColor = '#28B573';
  const alightingColor = '#046BB8';

  return (
    <ScrollView
      horizontal
      contentContainerStyle={styles.scrollContainer}
      showsHorizontalScrollIndicator={false}
    >
      {data.map((item, index) => {
        const boardingHeight = (item.nBoardingPercent * 240) / 100 - 16;
        const alightingHeight = (item.nAlightingPercent * 240) / 100 - 16;
        const boardingTop = 240 - boardingHeight - 16;
        const alightingTop = 240 - alightingHeight - 16;

        return (
          <View key={index} style={styles.barContainer}>
            <View style={styles.barSubContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[styles.bar, { height: boardingHeight, backgroundColor: boardingColor }]}
                />
                <Text
                  style={[styles.barText, { top: boardingTop }]}
                >{`${item.nBoardingPercent}%`}</Text>
              </View>
              <View style={styles.barWrapper}>
                <Text
                  style={[styles.barText, { top: alightingTop }]}
                >{`${item.nAlightingPercent}%`}</Text>

                <View
                  style={[styles.bar, { height: alightingHeight, backgroundColor: alightingColor }]}
                />
              </View>
            </View>

            <Text style={styles.label}>{item.sBusLicensePlate}</Text>
            <Text style={styles.label}>คันที่ 1</Text>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    alignItems: 'flex-end',
  },
  barContainer: {
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barSubContainer: {
    height: 240,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  barWrapper: {
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  bar: {
    width: 18,
  },
  barText: {
    position: 'absolute',
    minWidth: 100,
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 6,
    fontFamily: 'THSarabunNew',
    fontWeight: 'bold',
    color: '#707070',
  },
  label: {
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
    fontFamily: 'THSarabunNew',
  },
});

export default HorizontalScrollableBars;
