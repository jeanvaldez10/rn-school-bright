import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import { Icon } from 'native-base';
import Color from '../constants/color';
import LinearGradient from 'react-native-linear-gradient';
import GeneralStatusBarGradientColor from './GeneralStatusBarGradientColor';
import Images from '../themes/Images';
import PopupMenu from './PopupMenu';

const NavigationBar = ({ title, ...props }) => {

    const onMenuTap = () => {
        if (props.onMenuTap != undefined) {
            props.onMenuTap();
        }
    }

    const onNotificationTap = () => {
        if (props.onNotificationTap != undefined) {
            props.onNotificationTap();
        }
    }

    const onMoreTap = (eventName, index) => {
        if (props.onMoreTap != undefined) {
            props.onMoreTap(eventName, index);
        }
    }
    
    const onCalendarTap = (eventName, index) => {
        if (props.onCalendarTap != undefined) {
            props.onCalendarTap(eventName, index);
        }
    }

    const onSelectAllTap = (eventName, index) => {
        if (props.onSelectAllTap != undefined) {
            props.onSelectAllTap(eventName, index);
        }
    }

    const onDeselectAllTap = (eventName, index) => {
        if (props.onDeselectAllTap != undefined) {
            props.onDeselectAllTap(eventName, index);
        }
    }

    const onSearchTap = (eventName, index) => {
        if (props.onSearchTap != undefined) {
            props.onSearchTap(eventName, index);
        }
    }

    const onChangeSearchText = (text) => {
        if (props.onChangeSearchText != undefined) {
            props.onChangeSearchText(text);
        }
    }

    const is_notification = props.is_notification;

    const notificount = props.notifi_count ? props.notifi_count : 0;

    const is_more = props.is_more;
    const cactions = props.actions;

    const is_calendar = props.is_calendar;
    const is_selectAll = props.is_selectAll;
    const is_deselectAll = props.is_deselectAll;
    const is_search = props.is_search;
    const is_searching = props.is_searching;

    return (
        <View>
            <GeneralStatusBarGradientColor barStyle="light-content" />
            <LinearGradient
                style={ styles.navContainer}
                start={{ x: 0, y: 0 }} end={{ x: 0, y: 0 }}
                colors={[Color.barTransparent, Color.white]}>

                <TouchableOpacity
                    onPress={() => onMenuTap()}
                    style={styles.iconContainer}>
                    <Image
                        source={Images.n_ic_nav}
                        style={styles.iconimg}
                    />
                </TouchableOpacity>

                {is_notification && <TouchableOpacity
                    onPress={() => onNotificationTap()}
                    style={styles.iconContainer}>
                    <Image
                        source={Images.n_ic_bell}
                        style={styles.iconimg}
                    />
                    {notificount > 0 && <View style={styles.notificntContainer}>
                        <Text style={styles.notificount}>{notificount}</Text>
                    </View>}
                </TouchableOpacity>}

            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    navContainer:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 15,
    },

    iconContainer: {
        width: 48,
        height: 65,
        borderRadius: 24,
        marginLeft: 8,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        color: Color.n_default_orange,
        fontSize: 40
    },
    iconimg: {
        width: 25,
        height: 25,
    },
    titleContainer: {
        flex: 1,
        justifyContent: 'center',
        marginLeft: 8,
        height: 48,
        color: 'white'
    },
    title: {
        color: Color.white,
        textAlign: 'left',
        fontSize: 25,
        fontWeight: 'bold',
    },
    notificntContainer: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Color.n_default_orange,
        position: 'absolute',
        top: 5,
        right: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificount: {
        textAlign: 'center',
        fontSize: 14,
        color: Color.white,
    }
});

export default NavigationBar;