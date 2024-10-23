import React from 'react';
import {StyleSheet, View, Text, FlatList, Modal, TouchableOpacity} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';
import Color from '../constants/color';
import translang from '../utils/language.utils';

export default function SelectListModalNoTitleMenu({
  isVisible,
  onListSelect,
  listData,
  renderItem,
}) {


  const ItemSeparatorView = () => {
    return (
      // Flat List Item Separator
      <View
        style={{
          height: 2,
          flex: 1,
          marginHorizontal: 40,
          backgroundColor: Color.n_default_brown_light,
        }}
      />
    );
  };

  const ItemView = ({item, index}) => {
    if (renderItem !== undefined && renderItem !== null) {
      return renderItem(item, index);
    } else {
      return (
        // Flat List Item
        <View>
          <Text
            style={styles.itemStyle}
            onPress={() => getItem(item, index)}>
            { item.key != null && item.key !== '' && (
                translang.t(item.key)
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
            ItemSeparatorComponent={ItemSeparatorView}
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

});
