import React from 'react';
import { StyleSheet, View, Modal, Image } from 'react-native';
import Color from '../constants/color';
import Images from '../themes/Images';
import { SafeAreaView } from 'react-native-safe-area-context';

const SaveDevice = ({...props}) => {
    // const color = props.color ?? Colors.darkOrange;
    const backgroundColor = props.backgroundColor ?? 'transparent';
    const size = props.size ?? 80;
    const indicatorSize = size * 1;
    const isVisible = props.isVisible;

    return (
        <>
            { isVisible &&
            <SafeAreaView style={{position:'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex:999}} edges={['right', 'left']}>
                <View style={{position: 'absolute', width: '100%', height: '100%',  zIndex:999}}>
                    <View style={styles.container}>
                        <View style={{...styles.wrapper, width: size, height: size, backgroundColor: backgroundColor}}>
                            <Image source={Images.n_ic_loading_gf} style={{width: indicatorSize, height: indicatorSize}} />
                        </View>
                    </View>
                </View>
            </SafeAreaView>
            }
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0001',
    },
    wrapper: {
        width: 70,
        height: 70,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default SaveDevice;
