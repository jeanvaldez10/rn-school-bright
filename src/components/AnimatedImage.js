import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

const AnimatedImage = ({...props}) => {

    return (
        <View style={styles.container}>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 100,
        height: 100,
    },
});

export default AnimatedImage;
