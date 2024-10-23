import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import Color from '../constants/color';

const IconInfoAcademy = ({...props}) => {
    const { icon_mark, label, value_txt, show_bottom } = props;
    const { topTextStyle, bottomTextStyle } = props;

    return (
        <View style={[{ paddingHorizontal: 0, paddingBottom: 0 }, props.style]}>
            <View style={styles.menuItem} >
                <Image source={icon_mark} style={[styles.image]}></Image>
                <View style={{ marginLeft: 10 }}>
                    <Text
                        style={styles.topText}>
                        {label}
                    </Text>
                    <Text
                        style={styles.bottomText}>
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
        width: 50,
        height: 50, 
        resizeMode: 'contain',
        alignItems: 'center', 
        justifyContent: 'center', 
    },
    topText: {
        marginBottom: 0,
        fontSize: 22, 
        fontWeight: 'bold',
        color: Color.n_default_gray
    },
    bottomText: {
        fontSize: 16, 
        fontWeight: 'bold',
        color: Color.n_default_gray
    }
});

export default IconInfoAcademy;