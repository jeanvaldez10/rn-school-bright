import React from 'react';
import {StyleSheet, View, Text, TextInput, FlatList, Image, Modal, TouchableOpacity} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';
import Color from '../constants/color';

export default function SelectListModalNoTitle({
  isVisible,
  onListSelect,
  listData,
  renderItem,
}) {

  const ItemView = ({item, index}) => {
    if (renderItem !== undefined && renderItem !== null) {
      return renderItem(item, index);
    } else {
      return (
        // Flat List Item
        <View style={{borderBottomColor: Color.n_default_brown, borderBottomWidth: 1,}}>
          <Text
            style={styles.itemStyle}
            onPress={() => getItem(item, index)}>
            { item.title != null && item.title !== '' && (
                item.title
            )}
          </Text>
        </View>

      );
    }
  };
  const getItem = (item, index) => {
    let _item = item;
    _item.name = item.title;

    onListSelect(_item, index);
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
        onPressOut={() => {onListSelect(null)}}
      >
        <View style={styles.dialogStyle}>
          <FlatList
            data={listData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={ItemView}
            style={{marginBottom: 20}}
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
    backgroundColor: '#00000090',
  },
  dialogStyle: {
    width: '90%',
    borderRadius: '25@s',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
    paddingTop: '20@s',
    paddingHorizontal: '15@s'
  },
  itemStyle: {
    fontSize: '24@s',
    fontWeight: 'bold',
    textAlign: 'center',
    color: Color.n_default_gray,
    paddingVertical: '5@s',
  },
  titleTextStyle: {
    width: '100%',
    marginTop: 20,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Color.n_default_orange
  },
});
