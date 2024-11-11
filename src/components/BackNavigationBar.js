import React from 'react';
import { Image, View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Icon } from 'native-base';
import Color from '../constants/color';
import LinearGradient from 'react-native-linear-gradient';
import GeneralStatusBarGradientColor from './GeneralStatusBarGradientColor';
import Images from '../themes/Images';
import PopupMenu from './PopupMenu';
import translang from '../utils/language.utils';
import GradientButton from './GradientButton';

const BackNavigationBar = ({ title, ...props }) => {
  const onMenuTap = () => {
    if (props.onMenuTap != undefined) {
      props.onMenuTap();
    }
  };

  const onCopyTap = () => {
    if (props.onCopyTap != undefined) {
      props.onCopyTap();
    }
  };

  const onHistoryTap = () => {
    if (props.onHistoryTap != undefined) {
      props.onHistoryTap();
    }
  };

  const onHelpTap = () => {
    if (props.onHelpTap != undefined) {
      props.onHelpTap();
    }
  };

  const onQRCodeTap = () => {
    if (props.onQRCodeTap != undefined) {
      props.onQRCodeTap();
    }
  };

  const onDownloadTap = () => {
    if (props.onDownloadTap != undefined) {
      props.onDownloadTap();
    }
  };

  const onMarketTap = () => {
    if (props.onMarketTap != undefined) {
      props.onMarketTap();
    }
  };

  const onFilterTap = () => {
    if (props.onFilterTap != undefined) {
      props.onFilterTap();
    }
  };

  const onMoreTap = (eventName, index) => {
    if (props.onMoreTap != undefined) {
      props.onMoreTap(eventName, index);
    }
  };

  const onAddTap = (eventName, index) => {
    if (props.onAddTap != undefined) {
      props.onAddTap(eventName, index);
    }
  };

  const onCalendarTap = (eventName, index) => {
    if (props.onCalendarTap != undefined) {
      props.onCalendarTap(eventName, index);
    }
  };

  const onSelectAllTap = (eventName, index) => {
    if (props.onSelectAllTap != undefined) {
      props.onSelectAllTap(eventName, index);
    }
  };

  const onDeselectAllTap = (eventName, index) => {
    if (props.onDeselectAllTap != undefined) {
      props.onDeselectAllTap(eventName, index);
    }
  };

  const onSearchTap = (eventName, index) => {
    if (props.onSearchTap != undefined) {
      props.onSearchTap(eventName, index);
    }
  };

  const onChangeSearchText = (text) => {
    if (props.onChangeSearchText != undefined) {
      props.onChangeSearchText(text);
    }
  };

  const onInfoTap = () => {
    if (props.onInfoTap) {
      props.onInfoTap();
    }
  };

  const onMessageTap = () => {
    props.onMessageTap();
  };

  const is_notification = props.is_notification;
  const notificount = props.notifi_count ? props.notifi_count : 0;

  const is_copy = props.is_copy;
  const is_history = props.is_history;

  const is_help = props.is_help;
  const is_qrcode = props.is_qrcode;
  const is_download = props.is_download;
  const is_market = props.is_market;
  const cartcount = props.cart_count;

  const is_filter = props.is_filter;
  const is_more = props.is_more;
  const is_add = props.is_add;
  const cactions = props.actions;

  const is_calendar = props.is_calendar;
  const is_selectAll = props.is_selectAll;
  const is_deselectAll = props.is_deselectAll;
  const is_search = props.is_search;
  const is_searching = props.is_searching;

  const is_skip = props.is_skip;
  const onPressSkip = props.onPressSkip;

  const isMessage = props.isMessage;
  const messageUnreadCnt = props.msgCount ? props.msgCount : 0;

  const is_info = props.is_info;

  const is_travel = props.is_travel;
  const TravelButton = props.TravelButton;

  const backHidden = props.backHidden;

  return (
    <View>
      {/* <GeneralStatusBarGradientColor barStyle="light-content" backgroundColor={Color.backgroundTopBar} /> */}
      <View style={[styles.container, props.style]}>
        {!backHidden && (
          <TouchableOpacity onPress={() => onMenuTap()} style={styles.iconContainer}>
            <Image source={Images.n_ic_back} style={styles.iconimg} />
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          {is_searching && (
            <TextInput
              style={{ color: Color.white, fontSize: 22 }}
              value={props.searchKeyword ?? ''}
              placeholder={translang.t('COMMON_search_placeholder')}
              placeholderTextColor="#ffffff80"
              onChangeText={(text) => onChangeSearchText(text)}
            />
          )}
          {!is_searching && <Text style={styles.title}>{title}</Text>}
        </View>

        <View style={styles.iconListContainer}>
          {isMessage && (
            <TouchableOpacity onPress={() => onMessageTap()} style={styles.iconContainer}>
              <Image source={Images.n_ic_message_orange} style={styles.iconimg} />
              {messageUnreadCnt > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    right: -6,
                    top: 10,
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: Color.n_default_orange,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={styles.notificount}>{messageUnreadCnt}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {is_notification && (
            <TouchableOpacity onPress={() => onNotificationTap()} style={styles.iconContainer}>
              <Image source={Images.n_ic_bell} style={styles.iconimg} />
              {notificount > 0 && (
                <View style={styles.notificntContainer}>
                  <Text style={styles.notificount}>{notificount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {is_help && (
            <TouchableOpacity onPress={() => onHelpTap()} style={styles.iconContainer}>
              <Image source={Images.n_ic_help} style={styles.iconimg} />
            </TouchableOpacity>
          )}
          {is_copy && (
            <TouchableOpacity onPress={() => onCopyTap()} style={styles.iconContainer}>
              <Image
                source={Images.n_ic_copy_orange}
                style={{
                  height: 30,
                  width: 20,
                  resizeMode: 'contain',
                  marginRight: 35,
                  marginTop: 15,
                }}
              />
            </TouchableOpacity>
          )}
          {is_history && (
            <TouchableOpacity onPress={() => onHistoryTap()} style={styles.iconContainer}>
              <Image source={Images.n_ic_history} style={styles.iconimg} />
            </TouchableOpacity>
          )}
          {is_qrcode && (
            <TouchableOpacity onPress={() => onQRCodeTap()} style={styles.iconContainer}>
              <Image
                source={Images.n_ic_topnav_qrcode_orange}
                style={{
                  height: 50,
                  width: 30,
                  resizeMode: 'contain',
                  marginRight: 35,
                  marginTop: 15,
                }}
              />
            </TouchableOpacity>
          )}

          {is_download && (
            <TouchableOpacity onPress={() => onDownloadTap()} style={styles.iconContainer}>
              <Icon type="MaterialIcons" name="file-download" style={styles.icon} />
            </TouchableOpacity>
          )}

          {is_market && (
            <TouchableOpacity
              onPress={() => onMarketTap()}
              style={{ ...styles.iconContainer, marginRight: 20 }}
            >
              <Icon type="MaterialIcons" name="shopping-cart" style={styles.icon} />
              {cartcount > 0 && (
                <View style={styles.cartcntContainer}>
                  <Text style={styles.cartcount}>{cartcount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {is_calendar && (
            <TouchableOpacity
              onPress={() => onCalendarTap()}
              style={{ ...styles.iconContainer, marginRight: 10 }}
            >
              <Image source={Images.n_ic_nav_timetable} style={{ ...styles.iconimg, width: 40 }} />
            </TouchableOpacity>
          )}

          {is_filter && (
            <TouchableOpacity onPress={() => onFilterTap()} style={styles.iconContainer}>
              <Image source={Images.filter} style={styles.iconimg} />
            </TouchableOpacity>
          )}

          {is_search && !is_searching && (
            <TouchableOpacity onPress={() => onSearchTap()} style={styles.iconContainer}>
              <Image source={Images.search} style={styles.iconimg} />
            </TouchableOpacity>
          )}

          {is_skip && onPressSkip && (
            <TouchableOpacity onPress={() => onPressSkip()} style={styles.iconContainer}>
              <Text style={styles.skipText}>{translang.t('SKIP')}</Text>
            </TouchableOpacity>
          )}

          {is_info && (
            <TouchableOpacity onPress={() => onInfoTap()} style={styles.iconContainer}>
              <Image source={Images.ic_alert} style={styles.iconimg} />
            </TouchableOpacity>
          )}

          {is_travel && (
            <TravelButton />
          )}

          {is_more && (
            <PopupMenu
              actions={cactions}
              iconname={'more-vert'}
              iconsize={26}
              onPress={onMoreTap}
            />
          )}
          {is_add && (
            <PopupMenu
              actions={cactions}
              iconname={'add-circle'}
              iconsize={30}
              onPress={onAddTap}
            />
          )}

          {is_selectAll && (
            <TouchableOpacity onPress={() => onSelectAllTap()} style={styles.iconContainer}>
              <Image source={Images.ic_select_all} style={styles.iconimg} />
            </TouchableOpacity>
          )}

          {is_deselectAll && (
            <TouchableOpacity onPress={() => onDeselectAllTap()} style={styles.iconContainer}>
              <Image source={Images.ic_deselect_all} style={styles.iconimg} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: 65,
    backgroundColor: Color.white,
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    elevation: 3,
    borderBottomRightRadius: 0,
    paddingHorizontal: 18,
    marginBottom: 2,
  },
  iconContainer: {
    width: 35,
    height: 60,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    position: 'relative',
  },
  icon: {
    color: Color.n_default_orange,
    fontSize: 25,
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  title: {
    color: Color.n_default_orange,
    fontSize: 26,
    textAlign: 'center',
    fontWeight: 'bold',
  },

  iconListContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    marginRight: 15,
  },

  cartcntContainer: {
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: Color.n_default_orange,
    position: 'absolute',
    top: 10,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartcount: {
    textAlign: 'center',
    fontSize: 14,
    color: Color.white,
  },
  iconimg: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  notificount: {
    textAlign: 'center',
    fontSize: 14,
    color: Color.white,
  },
  skipText: {
    fontSize: 20,
    color: 'grey',
  },
  
});

export default BackNavigationBar;
