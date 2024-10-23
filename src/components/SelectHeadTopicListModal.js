import React from 'react';
import {StyleSheet, View, Text, TextInput, FlatList, Image, Modal, TouchableOpacity} from 'react-native';
import Color from '../constants/color';

export default function SelectHeadTopicListModal({
  isVisible, 
  onListSelect,
  listData,
  renderItem,
  dialogTtitle,
}) {

  const ItemView = ({item, index}) => {
    if (renderItem !== undefined && renderItem !== null) {
      return renderItem(item, index);
    } else {
      return (
        // Flat List Item
        <Text
          style={styles.itemStyle}
          onPress={() => getItem(item, index)}>
          {item.Text != null && item.Text !== '' && (item.Text)}
        </Text>
      );
    }
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

  const getItem = (item, index) => {
    onListSelect(item, index);
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
          <Text style={styles.titleTextStyle}>{dialogTtitle}</Text>
          <View style={{height: 1, backgroundColor: Color.n_default_orange, marginVertical: 10}} />
          <FlatList 
            data={listData}
            keyExtractor={(item, index) => index.toString()}
            ItemSeparatorComponent={ItemSeparatorView}
            renderItem={ItemView}
            style={{marginBottom: 20}}
          />
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
    width: 300,
    maxHeight: "50%",
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
  itemStyle: {
    fontSize: 24,
    padding: 10, 
    paddingLeft: 20,
  }, 


  titleTextStyle: {
    width: '100%',
    marginTop: 20,
    fontSize: 28, 
    fontWeight: 'bold', 
    color: Color.n_default_orange
  },
});
