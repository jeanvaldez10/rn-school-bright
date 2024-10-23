import React from 'react';
import {useState, useEffect} from "react";
import {StyleSheet, View, Text, TextInput, FlatList, Image, Modal, TouchableOpacity} from 'react-native';
import dimension from '../constants/dimension';
import Images from '../themes/Images';
import translang, { getCurrentLocale } from '../utils/language.utils';
import apiHttpClient from "../utils/apiHttpClient";
import { apiUrls } from '../constants/ApiUrls';

export default function SchoolModal({
  isVisible,
  header,
  onSchoolSelect,
}) {
  const [search, setSearch] = useState('');
  const [filteredDataSource, setFilteredDataSource] = useState([]);
  const [masterDataSource, setMasterDataSource] = useState([]);

  useEffect(() => {
    apiHttpClient.get(apiUrls.getSchools())
    .then(response => response.data)
    .then(data => {
      setFilteredDataSource(data);
      setMasterDataSource(data);
    })
    .catch((error) => {
      console.error(error);
    });
  }, []);

  const searchFilterFunction = (text) => {
    // Check if searched text is not blank
    if (text) {
      const newData = masterDataSource.filter(
        function (item) {

          let schoolname = '';
          if(getCurrentLocale() == 'en' && item.SchoolNameEN != null && item.SchoolNameEN !== '')
            schoolname = item.SchoolNameEN;
          if(getCurrentLocale() == 'th' || item.SchoolNameEN == null || item.SchoolNameEN === '')
            schoolname = item.SchoolName;

          const itemData = schoolname ? schoolname.toUpperCase() : ''.toUpperCase();
          const textData = text.toUpperCase();
          return itemData.indexOf(textData) > -1;
      });
      setFilteredDataSource(newData);
      setSearch(text);
    } else {
      //setFilteredDataSource(masterDataSource);
      setSearch(text);
    }
  };

  const ItemView = ({item}) => {
    return (
      // Flat List Item
      <Text
        style={styles.itemStyle}
        onPress={() => getItem(item)}>
        { (getCurrentLocale() == 'en' && item.SchoolNameEN != null && item.SchoolNameEN !== '') && (
            item.SchoolNameEN
        )}
        { (getCurrentLocale() == 'th' || item.SchoolNameEN == null || item.SchoolNameEN === '') && (
          item.SchoolName
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
    if (getCurrentLocale() == 'en' && item.SchoolNameEN != null && item.SchoolNameEN !== '') {
      _item.name = item.SchoolNameEN;
    } else {
      _item.name = item.SchoolName;
    }
    onSchoolSelect(_item);
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
            onPressOut={() => {onSchoolSelect(null)}}
          >
        <View style={styles.dialogStyle}>
          <View
            style={{
              width: '100%',
              marginLeft: dimension.px20,
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 20,
            }}>
            {/* <Image source={Images.gallery_icon} style={styles.modalLogo} resizeMode={'contain'} /> */}
            <Text
              style={{
                textAlign: 'center',
                fontSize: 24,
                paddingHorizontal: 15,
                fontWeight: 'bold',
              }}>
              {header}
            </Text>
          </View>
          <View style={styles.container}>
            <TextInput
              style={styles.textInputStyle}
              onChangeText={(text) => searchFilterFunction(text)}
              value={search}
              underlineColorAndroid="transparent"
              placeholder={translang.t('HOME_searchschool')}
            />
            <FlatList
              data={filteredDataSource}
              keyExtractor={(item, index) => index.toString()}
              ItemSeparatorComponent={ItemSeparatorView}
              renderItem={ItemView}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginHorizontal: 10,
              marginBottom: 15,
            }}>

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
  modalLogo: {
    width: 72,
    height: 30,
  },
  container: {
    backgroundColor: 'white',
    height: 300,
    width: '100%',
    paddingHorizontal: 10,
  },
  itemStyle: {
    padding: 6,
    fontSize: 25,
    color: 'black',
  },
  textInputStyle: {
    width: '100%',
    height: 50,
    borderWidth: 0,
    borderBottomWidth: 1,
    paddingLeft: 20,
    margin: 5,
    borderColor: '#009688',
    backgroundColor: '#FFFFFF',
    fontSize: 25,
    color: 'black',
  },
});
