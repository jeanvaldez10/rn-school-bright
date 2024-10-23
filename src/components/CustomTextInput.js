import React, {Component} from 'react';
import {StyleSheet, View, TextInput, Platform} from 'react-native';
import Color from '../constants/color';

export default class CustomTextInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: "99%",
    };
  }

  componentDidMount(){
    setTimeout(() => {this.setState({width: "100%"})}, 1000)
  }
  render() {
    const {inputWrapperStyle, inputStyle, notouch, bottomBorderColor, disableMultiline} = this.props;
    const {width} = this.state;

    let isNumberic = false;
    if(this.props.isNum){
      isNumberic = this.props.isNum
    }

    return (
      <View
        pointerEvents={notouch?"none":"box-none"}
        style={[styles.textInputWrapper, inputWrapperStyle]}
        ref={c => { this.textInput = c}}>
        <TextInput
          style={[styles.textInput, inputStyle, {width}]}
          {...this.props}
          editable={this.props.editable ?? true}
          multiline={disableMultiline ? false : true}
          keyboardType={isNumberic ? 'numeric' : 'default'}
          selectTextOnFocus={true}/>
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
    width: '99%',
  },
});
