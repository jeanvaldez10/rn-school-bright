import React, {Component} from 'react';
import {StyleSheet, View, TextInput, Platform} from 'react-native';
import Color from '../constants/color';

export default class CustomTextInput extends Component {
  focusedInput = () => { 
    this.textInput.setNativeProps({
      style: { borderColor: Color.n_default_brown }
    }) 
  }

  blurredInput = () => { 
    this.textInput.setNativeProps({
      style: { borderColor: Color.n_default_brown }
    }) 
  }

  render() {
    const {inputWrapperStyle, inputStyle, notouch, bottomBorderColor, disableMultiline} = this.props;
    return (
      <View pointerEvents={notouch?"none":"auto"} style={[styles.textInputWrapper, inputWrapperStyle]} ref={c => { this.textInput = c}}>
        <TextInput onBlur={this.blurredInput} onFocus={this.focusedInput} style={[styles.textInput, inputStyle]} {...this.props} editable={this.props.editable ?? true} multiline={disableMultiline ? false : true} selectTextOnFocus={true}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  textInputWrapper: {
    // borderWidth: 0,
    // borderBottomWidth: 1,
    // borderColor: Color.n_scorpion,
    borderRadius: 0,
    overflow: 'hidden',
  },
  textInput: {
    fontSize: 20,
    paddingHorizontal: 5,
    paddingVertical: 1,
    padding: Platform.select({
      android: 0,
    }),
    color: Color.n_default_gray,
    fontFamily: 'THSarabunNew',
  },
});
