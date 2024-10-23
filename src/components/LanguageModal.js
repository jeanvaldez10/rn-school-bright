import React from 'react';
import { useState, useEffect } from "react";
import { StyleSheet, View, Text, TextInput, FlatList, Image, Modal, TouchableOpacity } from 'react-native';

export default function LanguageModal({
  isVisible,
  onLanguageSelect,
}) {
  let filteredDataSource = [{ Language: 'ภาษาไทย' }, { Language: 'English' } ];

  const ItemView = ({ item }) => {
    return (
      // Flat List Item
      <Text
        style={styles.itemStyle}
        onPress={() => getItem(item)}>
        { item.Language != null && item.Language !== '' && (
          item.Language
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
          backgroundColor: '#C8C8C8',
        }}
      />
    );
  };

  const getItem = (item) => {
    let _item = item;
    _item.name = item.Language;

    onLanguageSelect(_item);
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
        onPressOut={() => { onLanguageSelect(null) }}
      >
        <View style={styles.dialogStyle}>
          <View style={styles.container}>

            <FlatList
              data={filteredDataSource}
              keyExtractor={(item, index) => index.toString()}
              ItemSeparatorComponent={ItemSeparatorView}
              renderItem={ItemView}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000025',
  },
  dialogStyle: {
    width: 350,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  container: {
    width: 300,
  },
  itemStyle: {
    padding: 10,
    fontSize: 25,
    textAlign: 'center',
  },
});
