import React from 'react';
import {View, Text, Modal, FlatList} from 'react-native';
import GradientSmallButton from './GradientSmallButton';
import Color from "../constants/color";
import {ScaledSheet} from 'react-native-size-matters';
import translang from "../utils/language.utils";
import {getCurrentLocale} from '../utils/language.utils';

export default function LeaveInfoModal({
                                      isVisible,
                                      onOkPress,
                                      leaveInfoList,
                                    }) {

  return (
    <Modal
      animationType="slide"
      transparent={true}
      key="modal"
      visible={isVisible}>
      <View style={styles.centeredView}>
        <View style={styles.dialogStyle}>
          <Text
            style={{
              marginTop: 20,
              textAlign: 'center',
              fontSize: 20,
              fontWeight: 'bold',
            }}>
            {translang.t('REMAINING_LEAVE_DAYS')}
          </Text>

          <FlatList 
            style={{width: '100%', marginTop: 20,}}
            data={leaveInfoList}
            renderItem={({item, index}) => {
              return (
                <View style={{flexDirection: 'row', marginHorizontal: 20, paddingVertical: 5, alignItems: 'center', borderBottomWidth: 0.2, borderBottomColor: 'gray'}}>
                  <Text style={{flex: 1.5, fontFamily: 'THSarabunNew', fontSize: 18,}}>{getCurrentLocale() === 'en' ? item.nameEN : item.nameTH}</Text>
                  <Text style={{flex: 1, fontFamily: 'THSarabunNew', fontSize: 18, textAlign: 'center'}}>{`${item.remain} / ${item.limit}`}</Text>
                </View>
              )
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginHorizontal: 10,
              marginVertical: 15,
            }}>
              <GradientSmallButton
                label={translang.t('COMMON_ok')}
                opacity={1}
                type='green'
                _onPress={onOkPress}
              />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = ScaledSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000050',
  },
  dialogStyle: {
    width: '80%',
    maxHeight: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '20@s',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  textStyle: {
    textAlign: 'center',
    fontSize: '24@s',
    marginVertical: '20@s',
    paddingHorizontal: '20@s',
    fontWeight: 'bold',
    color: Color.text_black,
  }
});
