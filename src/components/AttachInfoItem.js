import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import Color from '../constants/color';

const AttachInfoItem = ({...props}) => {
    const { icon_mark, label, icon_attach, show_bottom } = props;
    const { imageSize, topTextStyle, bottomTextStyle } = props;

    const _imageSize = imageSize ?? 30;

    return (
        <View style={[styles.menuContainer, props.style]}>
            <View style={styles.menuItem} >
                <Image source={icon_mark} style={[styles.image, { height: _imageSize, width: _imageSize, borderRadius: _imageSize / 2 }]}></Image>
                <View style={{ flexDirection: 'column' }}>
                    <Text
                        style={[styles.topText, topTextStyle]}>
                        {label}
                    </Text>
                    <Image source={icon_attach} style={[styles.bottomImage, bottomTextStyle]}></Image>
                </View>
            </View>
            {show_bottom && <View style={{ height: 1, width: '100%', backgroundColor: '#E8E8E8', marginLeft: 50 }} />}
        </View>
    );
};

const styles = StyleSheet.create({
    menuContainer: {
        marginTop: 10,
        paddingHorizontal: 5,
    },
    menuItem: {
        flexDirection: 'row',
        marginVertical: 6,
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
        marginVertical: 3, 
        marginHorizontal: 10, 
        color: Color.dark 
    },
    bottomImage: { 
        marginVertical: 5, 
        marginHorizontal: 10,  
    }
});

export default AttachInfoItem;