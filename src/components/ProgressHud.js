import React from 'react';
import { StyleSheet, View, Modal, Image } from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';
import Color from '../constants/color';
import Images from '../themes/Images';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProgressHud = ({...props}) => {
    // const color = props.color ?? Colors.darkOrange;
    const backgroundColor = props.backgroundColor ?? 'transparent';
    const isVisible = props.isVisible;

    return (
        <>
            { isVisible &&
            <SafeAreaView style={{position:'absolute', top: 0, bottom: 0, left: 0, right: 0}} edges={['right', 'left']}>
                <View style={{position: 'absolute', width: '100%', height: '100%'}}>
                    <View style={styles.container}>
                        <View style={{...styles.wrapper, backgroundColor: backgroundColor}}>
                            <Image source={Images.n_ic_loading_gf} style={styles.image} />
                            {/* <BallIndicator
                                color={color}
                                size={indicatorSize}
                            /> */}
                        </View>
                    </View>
                </View>
            </SafeAreaView>
            }
        </>
    );
};

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0001',
    },
    wrapper: {
        width: '70@s',
        height: '70@s',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '70@s',
        height: '70@s',
    }
});

export default ProgressHud;
