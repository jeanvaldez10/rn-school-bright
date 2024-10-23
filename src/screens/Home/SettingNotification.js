import React, { useState } from 'react';
import { Text, View, BackHandler, TouchableOpacity, Dimensions, Image, Switch} from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

import ProgressHud from '../../components/ProgressHud';
import BackNavigationBar from '../../components/BackNavigationBar';
import FilterModal from '../../components/FilterModal';

import translang, { getCurrentLocale } from '../../utils/language.utils';

export default class SettingNotification extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      statusNotifcation: {all: '0', message: '0', leave: '0', executive: '0', topup: '0', purchase: '0'},

      showModal: true,
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", async () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    });
    

  }

  componentWillUnmount = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }
    if(this.focusListener){
      this.focusListener.remove();
    }
  };

  back = () => {
    //this.props.navigation.goBack();
    if(this.backhandler){
      this.backhandler.remove();
    }

    this.props.navigation.navigate('Setting');
  };

  changeValue = (key, status) => {
    const {statusNotifcation} = this.state;

    if(key == 'all'){
      if(status){
        statusNotifcation.all = '1';
      }else{
        statusNotifcation.all = '0';
      }
    }else if(key == 'message'){
      if(status){
        statusNotifcation.message = '1';
      }else{
        statusNotifcation.message = '0';
      }
    }else if(key == 'leave'){
      if(status){
        statusNotifcation.leave = '1';
      }else{
        statusNotifcation.leave = '0';
      }
    }else if(key == 'executive'){
      if(status){
        statusNotifcation.executive = '1';
      }else{
        statusNotifcation.executive = '0';
      }
    }else if(key == 'topup'){
      if(status){
        statusNotifcation.topup = '1';
      }else{
        statusNotifcation.topup = '0';
      }
    }else if(key == 'purchase'){
      if(status){
        statusNotifcation.purchase = '1';
      }else{
        statusNotifcation.purchase = '0';
      }
    }

    this.setState({statusNotifcation});
  }

  render() {
    const initialLayout = { width: Dimensions.get('window').width };
    const {statusNotifcation} = this.state
    return (
      <SafeAreaView style={styles.container} edges={['right','top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_notification')}
          onMenuTap={() => this.back()}
        />

        <View style={styles.content}>
          <View style={styles.itemContainer}>
            <Image source={statusNotifcation.all=='1'?Images.n_ic_setting_notification_all_normal:Images.n_ic_setting_notification_all_disable} style={styles.itemImage}/>
            <View style={{flex: 1}}>
              <Text style={{...styles.caption, color: statusNotifcation.all=='1'?Color.n_default_orange:Color.n_color_switch_off}}>{translang.t('ALL_NOTIFICATION')}</Text>
              <Text style={{...styles.smallcaption}}>{statusNotifcation.all=='1'?translang.t('TURN_ON'):translang.t('TURN_OFF')}</Text>
            </View>
            <Switch
              style={{transform: [{ scaleX: .8 }, { scaleY: .8 }]}}
              trackColor={{true: Color.n_color_switch_on, false: Color.n_color_switch_off}}
              onValueChange={(status)=>{this.changeValue('all', status);}}
              value={statusNotifcation.all=='1'?true:false}/>
          </View>

          <View style={{width: '100%', height: 1, backgroundColor: Color.n_default_orange, marginVertical: 10,}} />
          
          <View style={styles.itemContainer}>
            <Image source={statusNotifcation.message=='1'?Images.n_ic_setting_notification_message_normal:Images.n_ic_setting_notification_message_disable} style={styles.itemImage}/>
            <View style={{flex: 1}}>
              <Text style={{...styles.caption, color: statusNotifcation.message=='1'?Color.n_default_orange:Color.n_color_switch_off}}>{translang.t('DRAWER_message')}</Text>
              <Text style={{...styles.smallcaption}}>{statusNotifcation.message=='1'?translang.t('TURN_ON'):translang.t('TURN_OFF')}</Text>
            </View>
            <Switch
              style={{transform: [{ scaleX: .8 }, { scaleY: .8 }]}}
              trackColor={{true: Color.n_color_switch_on, false: Color.n_color_switch_off}}
              onValueChange={(status)=>{this.changeValue('message', status);}}
              value={statusNotifcation.message=='1'?true:false}/>
          </View>

          <View style={styles.itemContainer}>
            <Image source={statusNotifcation.leave=='1'?Images.n_ic_setting_notification_leave_normal:Images.n_ic_setting_notification_leave_disable} style={styles.itemImage}/>
            <View style={{flex: 1}}>
              <Text style={{...styles.caption, color: statusNotifcation.leave=='1'?Color.n_default_orange:Color.n_color_switch_off}}>{translang.t('DRAWER_leaverequest')}</Text>
              <Text style={{...styles.smallcaption}}>{statusNotifcation.leave=='1'?translang.t('TURN_ON'):translang.t('TURN_OFF')}</Text>
            </View>
            <Switch
              style={{transform: [{ scaleX: .8 }, { scaleY: .8 }]}}
              trackColor={{true: Color.n_color_switch_on, false: Color.n_color_switch_off}}
              onValueChange={(status)=>{this.changeValue('leave', status);}}
              value={statusNotifcation.leave=='1'?true:false}/>
          </View>

          <View style={styles.itemContainer}>
            <Image source={statusNotifcation.executive=='1'?Images.n_ic_setting_notification_executive_normal:Images.n_ic_setting_notification_executive_disable} style={styles.itemImage}/>
            <View style={{flex: 1}}>
              <Text style={{...styles.caption, color: statusNotifcation.executive=='1'?Color.n_default_orange:Color.n_color_switch_off}}>{translang.t('REPORT_executive_report')}</Text>
              <Text style={{...styles.smallcaption}}>{statusNotifcation.executive=='1'?translang.t('TURN_ON'):translang.t('TURN_OFF')}</Text>
            </View>
            <Switch
              style={{transform: [{ scaleX: .8 }, { scaleY: .8 }]}}
              trackColor={{true: Color.n_color_switch_on, false: Color.n_color_switch_off}}
              onValueChange={(status)=>{this.changeValue('executive', status);}}
              value={statusNotifcation.executive=='1'?true:false}/>
          </View>

          <View style={styles.itemContainer}>
            <Image source={statusNotifcation.topup=='1'?Images.n_ic_setting_notification_topup_normal:Images.n_ic_setting_notification_topup_disable} style={styles.itemImage}/>
            <View style={{flex: 1}}>
              <Text style={{...styles.caption, color: statusNotifcation.topup=='1'?Color.n_default_orange:Color.n_color_switch_off}}>{translang.t('REPORT_topup')}</Text>
              <Text style={{...styles.smallcaption}}>{statusNotifcation.topup=='1'?translang.t('TURN_ON'):translang.t('TURN_OFF')}</Text>
            </View>
            <Switch
              style={{transform: [{ scaleX: .8 }, { scaleY: .8 }]}}
              trackColor={{true: Color.n_color_switch_on, false: Color.n_color_switch_off}}
              onValueChange={(status)=>{this.changeValue('topup', status);}}
              value={statusNotifcation.topup=='1'?true:false}/>
          </View>

          <View style={styles.itemContainer}>
            <Image source={statusNotifcation.purchase=='1'?Images.n_ic_setting_notification_purchase_normal:Images.n_ic_setting_notification_purchase_disable} style={styles.itemImage}/>
            <View style={{flex: 1}}>
              <Text style={{...styles.caption, color: statusNotifcation.purchase=='1'?Color.n_default_orange:Color.n_color_switch_off}}>{translang.t('REPORT_purchase')}</Text>
              <Text style={{...styles.smallcaption}}>{statusNotifcation.purchase=='1'?translang.t('TURN_ON'):translang.t('TURN_OFF')}</Text>
            </View>
            <Switch
              style={{transform: [{ scaleX: .8 }, { scaleY: .8 }]}}
              trackColor={{true: Color.n_color_switch_on, false: Color.n_color_switch_off}}
              onValueChange={(status)=>{this.changeValue('purchase', status);}}
              value={statusNotifcation.purchase=='1'?true:false}/>
          </View>
        </View>
        <ProgressHud isVisible={this.state.isLoading} />

      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({

  container: {
    flex: 1,
    backgroundColor: Color.n_background_white
  },
  content: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowOffset: {
      width: 0,
      height: 0
    },
    elevation: 3,
    shadowColor: 'black',
    shadowRadius: 3,
    shadowOpacity: 0.4
  },

  itemContainer:{
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  itemImage: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  caption: {
    fontFamily: 'THSarabunNew',
    fontSize: 22,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  smallcaption: {
    fontSize: 18, 
    marginHorizontal: 10, 
    color: Color.n_default_gray, 
  },
  
  
});
