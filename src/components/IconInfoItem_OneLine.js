import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import Color from '../constants/color';

const IconInfoItem_OneLine = ({...props}) => {
    const { icon_mark, radiussize, label, show_bottom, isMultiLine } = props;
    const { imageSize, topTextStyle } = props;

    const _imageSize = imageSize ?? 50;
    const borderRadius = radiussize ?? _imageSize / 2
    

    return (
        <View style={[props.style]}>
            <View style={styles.menuItem} >
                <Image source={icon_mark} style={[styles.image, { height: _imageSize, width: _imageSize, borderRadius: borderRadius}]}></Image>
                <Text style={[styles.topText, topTextStyle]} numberOfLines={isMultiLine ? 0 : 1}>
                    {label}
                </Text>
            </View>
            {show_bottom && <View style={{ height: 1, width: '100%', backgroundColor: '#E8E8E8', marginLeft: 50 }} />}
        </View>
    );
};

const styles = StyleSheet.create({
    menuContainer: {
        marginTop: 10,
        paddingHorizontal: 10,
    },
    menuItem: {
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    image: {
        marginRight: 30,
        alignItems: 'center', 
        justifyContent: 'center', 
    },
    topText: {
        width: "70%",
        fontSize: 24,
        fontWeight: 'bold', 
        color: Color.n_default_gray ,
        textAlign: 'left',
        marginRight: 10,
    },
});

export default IconInfoItem_OneLine;