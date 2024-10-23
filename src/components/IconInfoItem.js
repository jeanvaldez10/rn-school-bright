import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import Color from '../constants/color';

const IconInfoItem = ({...props}) => {
    const { icon_mark, label, value_txt, show_bottom } = props;
    const { imageSize, topTextStyle, bottomTextStyle } = props;

    const _imageSize = imageSize ?? 50;

    return (
        <View style={[{ paddingHorizontal: 0, paddingBottom: 0 }, props.style]}>
            <View style={styles.menuItem} >
                <Image source={icon_mark} style={[styles.image, { height: _imageSize, width: _imageSize, borderRadius: _imageSize / 2 }]}></Image>
                <View style={{ flexDirection: 'column' }}>
                    <Text
                        style={[styles.topText, topTextStyle]}>
                        {label}
                    </Text>
                    <Text
                        style={[styles.bottomText, bottomTextStyle]}>
                        {value_txt}
                    </Text>
                </View>
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
        flexDirection: 'row',
        marginVertical: 6,
        alignItems: 'center',
    },
    image: {
        height: 50, 
        width: 50, 
        alignItems: 'center', 
        justifyContent: 'center', 
        borderRadius: 25
    },
    topText: {
        fontSize: 12, 
        marginTop: 3, 
        marginHorizontal: 10, 
        color: Color.dark 
    },
    bottomText: {
        fontSize: 16, 
        marginBottom: 5, 
        marginHorizontal: 10, 
        color: Color.dark
    }
});

export default IconInfoItem;