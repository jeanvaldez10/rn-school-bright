import React, { Component } from 'react'
import { View, StyleSheet, } from 'react-native'
import {ScaledSheet} from "react-native-size-matters";
import ModalDropdown from 'react-native-modal-dropdown-with-flatlist'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Color from '../constants/color'

const ICON_SIZE = 26

export default class PopupMenu extends Component {
  constructor(props) {
    super(props)

    this.state = {
      icon: null,
    }
  }

  onError() {
    console.log('Popup Error')
  }

  onRef = icon => {
    if (!this.state.icon) {
      this.setState({ icon })
    }
  }

  _dropdown_3_adjustFrame(style) {
    //style.left += 150;
    style.top += 20;
    style.right = 10;
    // style.height = 42 * this.props.actions.length;
    style.height = 'auto';
    return style;
  }

  render() {
    return (
      <View style={styles.iconContainer}>
        <ModalDropdown
          style={styles.dd}
          dropdownStyle={styles.dd_dropdown}
          dropdownTextStyle={styles.dropdownTextStyle}
          dropdownTextHighlightStyle={styles.dropdownTextHighlightStyle}
          adjustFrame={style => this._dropdown_3_adjustFrame(style)}
          options={this.props.actions}
          renderSeparator={() => <View /> }
          onSelect={(idx, value) => this.props.onPress(value, idx)}>
          <Icon
            name={this.props.iconname}
            size={this.props.iconsize}
            color={Color.n_default_orange}
            ref={this.onRef} />
        </ModalDropdown>
      </View>
    )
  }
}

const styles = ScaledSheet.create({
  iconContainer: {
    width: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dd: {
    backgroundColor: 'transparent',
    margin: 0
  },
  dd_dropdown: {
    width: '130@s',
    height: 'auto',
    borderColor: '#eee',
    borderRadius: 5,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.35,
    shadowRadius: 3.84,
    elevation: 2,
  },
  dropdownTextStyle: {
    color: Color.n_default_gray,
    fontSize: '16@ms',
    fontWeight: 'bold',
  },
  dropdownTextHighlightStyle: {
    color: Color.n_default_gray,
    fontSize: '16@ms',
    fontWeight: 'bold'
  },
});
