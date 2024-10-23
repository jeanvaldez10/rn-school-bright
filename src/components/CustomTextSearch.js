import React, {Component} from 'react';
import {StyleSheet, View, TextInput, Platform, TouchableOpacity, Image} from 'react-native';
import Color from '../constants/color';
import Images from '../themes/Images';

export default class CustomTextSearch extends Component {

  render() {
    const {inputWrapperStyle, inputStyle, notouch, bottomBorderColor,} = this.props;
    return (
      <View pointerEvents={notouch?"none":"auto"} style={[styles.textInputWrapper, inputWrapperStyle]} ref={c => { this.textInput = c}} >
        <TextInput  style={[styles.textInput, inputStyle]} {...this.props} editable={this.props.editable ?? true} multiline={false} />
        <TouchableOpacity style={{width: 25, height: 25, marginLeft: 10}} onPress={() => this.props.clickSearch()}>
          <Image source={Images.n_ic_search_orange} style={{width: '100%', height: '100%', resizeMode: 'contain'}}/>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  textInputWrapper: {
    borderRadius: 0,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,

    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
    backgroundColor: Color.white,
    
  },
  textInput: {
    flex: 1,
    fontSize: 20,
    paddingHorizontal: 5,
    paddingVertical: 1,
    padding: Platform.select({
      android: 0,
    }),
    color: Color.n_default_brown,
    fontFamily: 'THSarabunNew',
  },
});
