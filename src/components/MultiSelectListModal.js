import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity, FlatList, Modal} from 'react-native';
import NextButton from './NextButton';
import CustomRadioButtonItem from './CustomRadioButtonItem';
import Color from '../constants/color';
import translang, { getCurrentLocale } from '../utils/language.utils';
import _ from 'lodash';

export default class MultiSelectListModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedIndexes: [],
      dialogTtitle: ""
    };
  }

  componentDidMount() {

  }

  ItemView = (item, index) => {
    const isSelected = this.state.selectedIndexes.includes(index);
    return (
      <TouchableOpacity 
        style={{flexDirection: 'row', alignItems: 'center'}} 
        activeOpacity={1}
        onPress={() => this.onItemSelected(index)}>
        <Text
          style={styles.itemStyle}>
          { item.title != null && item.title !== '' && (
              item.title
          )}
        </Text>
        <CustomRadioButtonItem radioSize={24} isSelected={isSelected} selectedColor={Color.n_default_orange} />
      </TouchableOpacity>
    );
  };

  ItemSeparatorView = () => {
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

  onItemSelected = (index) => {
    let _selectedIndexes = this.state.selectedIndexes;
    if (_selectedIndexes.includes(index)) {
      _selectedIndexes = _.without(_selectedIndexes, index);
    } else {
      _selectedIndexes.push(index);
    }
    this.setState({selectedIndexes: _selectedIndexes});
  };

  onNext = () => {
    if (this.props.onNext !== undefined) {
      const items = this.state.selectedIndexes.map(index => {
        return this.props.listData[index];
      });
      this.props.onNext(items, this.state.selectedIndexes);
    }
  };

  onClose = () => {
    if (this.props.onClose !== undefined) {
      this.setState({selectedIndexes: this.props.selectedIndexes ?? []});
      this.props.onClose();
    }
  };
  
  render() {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        key="modal"
        visible={this.props.isVisible}>
        
        <TouchableOpacity 
              style={styles.centeredView} 
              activeOpacity={1} 
              onPressOut={() => {this.onClose()}}
            >
          <View style={styles.dialogStyle}> 
            <Text style={styles.titleTextStyle}>{this.props.dialogTtitle}</Text>
            <View style={styles.container}>
              <FlatList 
                data={this.props.listData}
                keyExtractor={(item, index) => index.toString()}
                ItemSeparatorComponent={this.ItemSeparatorView}
                renderItem={({item, index}) => this.ItemView(item, index)}
              />
            </View>
            <NextButton
                label={translang.t('COMMON_next')}
                containerStyle={{ width: '50%',  marginLeft: 'auto', marginRight: 'auto', marginVertical: 10,}}
                buttonStyle={{ margin: 0, height: 40, borderRadius: 20 }}
                textStyle={{fontSize: 25, fontWeight: '400'}}
                colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                isVerticalGradient={false}
                _onPress={() => this.onNext()} />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }
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
    maxHeight: 300,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  itemStyle: {
    flex: 1,
    padding: 10, 
    fontSize: 25,
    fontWeight: '400'
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
