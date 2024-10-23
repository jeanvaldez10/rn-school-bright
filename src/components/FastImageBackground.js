import React from 'react';
import {View, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';
import Images from '../themes/Images';

const FastImageBackground = ({source, style, children, isImageVisible}) => {
    return (
        <View style={[styles.container, style]}>
            {isImageVisible &&
            <FastImage
                style={{...StyleSheet.absoluteFill, opacity: 0.7}}
                source={source}
                resizeMode={FastImage.resizeMode.cover}
            />
            }
            {!isImageVisible &&
            <FastImage
                style={{...StyleSheet.absoluteFill, opacity: 0.7}}
                source={Images.school}
                resizeMode={FastImage.resizeMode.cover}
            />
            }
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
});

export default FastImageBackground;