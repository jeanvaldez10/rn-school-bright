import React from 'react';
import {View, Text, Image, StyleSheet, Dimensions} from 'react-native';
import Color from '../constants/color';
import { ScaledSheet } from 'react-native-size-matters';

const CardInfoItem = ({...props}) => {
    const { title, value_txt, titleColor, infoColor, titleFontSize, infoFontSize} = props;

    const titleCol = titleColor ?? Color.n_default_gray;
    const infoCol = infoColor ?? Color.n_default_gray;

    let titleTextSize = titleFontSize ?? 24;
    let infoTextSize = infoFontSize ?? 20;

    const screenWidth = Dimensions.get('window').width;

    if (!titleFontSize && !infoFontSize){
        titleTextSize = titleTextSize +  titleTextSize * (screenWidth/480 - 1) * 0.5;
        infoTextSize = infoTextSize +  infoTextSize * (screenWidth/480 - 1) * 0.5;
    }

    return (
        <View style={[props.style]}>
            <View style={styles.menuItem} >
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{...styles.itemTitle, fontSize: titleTextSize, color: titleCol}}>
                        {title}
                    </Text>
                    <Text style={{...styles.itemInfo, fontSize: infoTextSize, color: infoCol}} multiline={true}>
                        {value_txt}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = ScaledSheet.create({
    menuItem: {
        flexDirection: 'row',
        marginVertical: 1,
        alignItems: 'center',
    },
    itemTitle: {
        fontFamily: 'THSarabunNew',
        flex: 1,
        fontWeight: 'bold',
        fontSize: "20@ms"
    },
    itemInfo: {
        fontFamily: 'THSarabunNew',
        flex: 1,
        fontSize: "20@ms",
    }
});

export default CardInfoItem;
