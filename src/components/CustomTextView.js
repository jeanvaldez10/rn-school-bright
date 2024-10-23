import React, { Component } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';

export default class CustomTextView extends Component {

  render() {
    const { inputWrapperStyle, textStyle, val_text } = this.props;
    return (
      <View style={[styles.textViewWrapper, inputWrapperStyle]} ref={c => { this.textView = c }} >
        <Text style={[styles.textView, textStyle]} {...this.props} >{val_text}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  textViewWrapper: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: '#EEB2A5',
    borderRadius: 5,
    overflow: 'hidden',
  },
  textView: {
    fontSize: 16,
    paddingHorizontal: 15,
    paddingVertical: 8,
    padding: Platform.select({
      android: 0,
    }),
    color: '#000',
    fontWeight: '400',
    fontFamily: 'THSarabunNew',
    
  },
});
