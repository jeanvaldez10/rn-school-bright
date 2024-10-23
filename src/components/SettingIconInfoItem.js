import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Switch } from 'react-native';
import Color from '../constants/color';

const ReportIconInfoItem = ({ ...props }) => {
    const { icon_mark, label, is_switch } = props;
    const { imageSize, topTextStyle, isImgRadius, tmarginleft } = props;

    const _imageSize = imageSize ?? 50;
    const textMarginLeft = tmarginleft ?? 10;

    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    return (
        <View style={[{ paddingHorizontal: 0, paddingBottom: 0 }, props.style]}>
            <View style={styles.menuItem} >
                <Image source={icon_mark} style={[styles.image, { height: _imageSize, width: _imageSize}, isImgRadius? {borderRadius: _imageSize / 2 } : {borderRadius: 0 }]}></Image>
                <View style={{ flexDirection: 'column', marginLeft: textMarginLeft, marginVertical: 10, justifyContent: 'center', }}>
                    <Text
                        style={[styles.topText, topTextStyle]}>
                        {label}
                    </Text>
                </View>
                {is_switch && <Switch
                    style={{ position: 'absolute', right: 1, marginVertical: 10 }}
                    trackColor={{ false: "#767577", true: "#ff6765" }}
                    thumbColor={isEnabled ? "#f5fdfb" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleSwitch}
                    value={isEnabled}
                />}
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
        height: 50,
        width: 50,
        alignItems: 'center',
        justifyContent: 'center',
        resizeMode: 'contain',
    },
    topText: {
        fontFamily: 'THSarabunNew',
        fontSize: 24,
        marginVertical: 3,
        marginHorizontal: 10,
        color: Color.dark
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