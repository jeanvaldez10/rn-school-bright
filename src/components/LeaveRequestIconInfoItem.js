import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Color from '../constants/color';
import Images from '../themes/Images';
import translang, { getCurrentLocale } from '../utils/language.utils';

const LeaveRequestIconInfoItem = ({ ...props }) => {
    const { label, value_txt, dateText, status } = props;
    const { topTextStyle, bottomTextStyle, } = props;

    let local_imgcolor = '#4072b1';
    let local_bgcolor = '#fff';
    let txtStatus = "";

    if (status == '0') {
        local_bgcolor = Color.leave_status_background;
        local_imgcolor = Color.n_default_brown;
        txtStatus = translang.t('LEAVE_pending');
    } else if (status == '1') {
        local_bgcolor = Color.leave_status_background;
        local_imgcolor = Color.n_button_gradient_green_end;
        txtStatus = translang.t('LEAVE_approved');
    } else if (status == '2') {
        local_bgcolor = Color.leave_status_background;
        local_imgcolor = Color.n_default_orange;
        txtStatus = translang.t('LEAVE_rejected');
    } else if (status == '3') {
        local_bgcolor = Color.leave_status_background;
        local_imgcolor = Color.n_scorpion;
        txtStatus = translang.t('DELETED');
    } else if (status == '4') {
        local_bgcolor = Color.leave_status_background;
        local_imgcolor = Color.n_scorpion;
        txtStatus = translang.t('CANCELED');
    } else if (status == '5') {
      local_bgcolor = Color.leave_status_background;
      local_imgcolor = Color.n_default_brown;
      txtStatus = translang.t('REQUEST_CANCELED');
    }

    return (
      <View style={{flexDirection: 'row', flex: 1, justifyContent:'space-between'}}>
        <View style={{flex: 1, justifyContent: 'center', marginLeft: 10, marginRight: 10}}>
           <Text style={{...styles.userInfoTitle, fontSize: 20,}}>{dateText}</Text>
           <Text style={{...styles.userInfoTitle, color:Color.n_default_gray}}>{label}</Text>
           <Text style={{...styles.userInfoTitle, color:Color.n_default_gray_dark,fontWeight: 'bold'}}>{value_txt}</Text>
        </View>
        <View style={{...styles.itemStatusContainer, backgroundColor: local_imgcolor}}>
          <Text style={styles.labelStatus}>{txtStatus}</Text>
        </View>
      </View>
    );
};

const styles = StyleSheet.create({
  itemInfoContainer:{
    flex: 1,
    paddingLeft: 15,
  },

  containerStatusText: {
    width: '25%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },

  userInfoTitle:{
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    color: Color.n_default_gray
  },

  itemStatusContainer:{
    width: '25%',
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },

  labelStatus:{
    fontFamily: 'THSarabunNew',
    color: Color.white,
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 'auto',
    marginBottom: 'auto',
  },

});

export default LeaveRequestIconInfoItem;