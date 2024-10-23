import React from 'react';
import { StyleSheet, View, Modal, Image } from 'react-native';
import { BallIndicator } from 'react-native-indicators';
import Color from '../constants/color';
import Images from '../themes/Images';

const ProgressHud = ({...props}) => {
    const color = props.color ?? Color.primaryButtonColor;
    const backgroundColor = props.backgroundColor ?? 'white';
    const size = props.size ?? 70;
    const indicatorSize = size * 0.5;

    return (
        <Modal
            transparent={true}
            key="progressHud"
            visible={props.isVisible ?? false}>
            <View style={styles.container}>
                <View style={{...styles.wrapper, width: size, height: size, backgroundColor: 'transparent'}}>
                    {/* <BallIndicator 
                        color={color}
                        size={indicatorSize}
                    /> */}
                    <Image 
                        source={Images.n_ic_loading_gf} 
                        style={{width: size, height: size, resizeMode:'contain'}}/>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0000',
    },
    wrapper: {
        width: 70,
        height: 70,
        backgroundColor: Color.red_color_bg,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ProgressHud;