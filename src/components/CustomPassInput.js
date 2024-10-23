import React, {Component} from 'react';
import {StyleSheet, View, TextInput, Platform} from 'react-native';
import {Icon} from 'native-base';
import Color from '../constants/color';

export default class CustomPassInput extends Component {

  state = {
    icon: "visibility",
    secureTextEntry: true
  };

  focusedInput = () => {
    this.textInput.setNativeProps({
      style: { borderColor: Color.n_default_orange }
    })
  }

  blurredInput = () => {
    this.textInput.setNativeProps({
      style: { borderColor: Color.n_default_brown }
    })
  }

  _changeIcon() {
    this.setState(prevState => ({
      icon: prevState.icon === 'visibility' ? 'visibility-off' : 'visibility',
      secureTextEntry: !prevState.secureTextEntry
    }));
  }

  render() {
    const {inputWrapperStyle, inputStyle} = this.props;
    return (
      <View style={[styles.textInputWrapper, inputWrapperStyle]} ref={c => { this.textInput = c}} >
        <TextInput onBlur={this.blurredInput} onFocus={this.focusedInput}  style={[styles.textInput, inputStyle]} {...this.props}  multiline={false} secureTextEntry={this.state.secureTextEntry} />
        <Icon type="MaterialIcons" name={this.state.icon} onPress={() => this._changeIcon()} style={styles.icon}/>
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
    paddingVertical: 5,
    padding: Platform.select({
      android: 0,
    }),
    color: '#000',
    fontFamily: 'THSarabunNew',
  },
  icon: {
    fontSize: 20,
    position: 'absolute',
    bottom: 10,
    right: 12,
    color: Color.n_password_grey,
  },
});
