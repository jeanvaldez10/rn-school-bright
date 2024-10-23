import React from 'react';
import {StyleSheet, View, Text, TextInput, FlatList, Image, Modal, TouchableOpacity} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';
import translang, { getCurrentLocale } from '../utils/language.utils';
import Color from '../constants/color';

export default function SemesterModal({
  isVisible,
  onSemesterSelect,
  listData,
}) {

  const ItemView = ({item}) => {
    return (
      // Flat List Item
      <Text
        style={styles.itemStyle}
        onPress={() => getItem(item)}>
        { item.sTerm != null && item.sTerm !== '' && (
            item.sTerm
        )}
      </Text>
    );
  };

  const ItemSeparatorView = () => {
    return (
      // Flat List Item Separator
      <View
        style={{
          height: 0.5,
          width: '100%',
          backgroundColor: Color.n_default_gray,
        }}
      />
    );
  };

  const getItem = (item) => {
    let _item = item;
    _item.name = item.sTerm;
    _item.ID = item.nTerm;
    onSemesterSelect(_item);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      key="modal"
      visible={isVisible}>

      <TouchableOpacity
            style={styles.centeredView}
            activeOpacity={1}
            onPressOut={() => {onSemesterSelect(null)}}
          >
        <View style={styles.dialogStyle}>
          <Text style={styles.titleTextStyle}>{translang.t('ACADEMIC_msg_selectsemester')}</Text>
          <FlatList
            data={listData}
            keyExtractor={(item, index) => index.toString()}
            ItemSeparatorComponent={ItemSeparatorView}
            renderItem={ItemView}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = ScaledSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000025',
  },
  dialogStyle: {
    width: "300@ms",
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  titleTextStyle: {
    width: '100%',
    marginTop: 20,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Color.n_default_orange
  },

  itemStyle: {
    fontSize: 30,
    padding: 10,
    textAlign: 'center',
  },
});
