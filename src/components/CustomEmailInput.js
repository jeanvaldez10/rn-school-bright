import React, {Component} from 'react';
import {StyleSheet, View, TextInput, Platform} from 'react-native';
import {Icon} from 'native-base';
import Color from '../constants/color';

export default class CustomEmailInput extends Component {
  focusedInput = () => {
    this.textInput.setNativeProps({
      style: { borderColor: '#EE00EE' }
    })
  }

  blurredInput = () => {
    this.textInput.setNativeProps({
      style: { borderColor: Color.n_default_brown }
    })
  }

  render() {
    const {inputWrapperStyle, inputStyle} = this.props;
    const editable = this.props.editable ?? true;
    return (
      <View style={[styles.textInputWrapper, inputWrapperStyle]} ref={c => { this.textInput = c}} >
        {editable && <TextInput onBlur={this.blurredInput} onFocus={this.focusedInput}  style={[styles.textInput, inputStyle]} {...this.props} editable={editable} multiline={false} />}
        {!editable && <TextInput onBlur={this.blurredInput} onFocus={this.focusedInput}  style={[styles.textInputDisable, inputStyle]} {...this.props} editable={editable} multiline={false} />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  textInputWrapper: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: Color.n_default_brown,
    borderRadius: 0,
    overflow: 'hidden',
  },
  textInput: {
    fontSize: 22,
    paddingHorizontal: 5,
    paddingVertical: 8,
    padding: Platform.select({
      android: 0,
    }),
    color: '#000',
    fontFamily: 'THSarabunNew',
  },
  textInputDisable: {
    fontSize: 22,
    paddingHorizontal: 5,
    paddingVertical: 8,
    padding: Platform.select({
      android: 0,
    }),
    color: '#b1b1b1',
    fontFamily: 'THSarabunNew',
  },
  icon: {
    fontSize: 30,
    position: 'absolute',
    top: 5,
    right: 5,
  },
});
