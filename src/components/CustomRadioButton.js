import React, { Component } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Color from '../constants/color';
import CustomRadioButtonItem from './CustomRadioButtonItem';

export default class CustomRadioButton extends Component {
	componentDidMount(){
		this.setState({ value: this.props.selVal ?? -1 });
	}
	
	onPress = (value) => {
		const _onPress = this.props.onPress ?? (() => {});
		_onPress(value);
	}

	render() {
		const { PROP, selVal: value } = this.props;
		const { containerStyle, itemContainerStyle, radioSize, itemTextStyle, isVertically, radioColor} = this.props;

		return (
			<View style={[!isVertically?{flexDirection: 'row'}:{}, containerStyle]}>
				{PROP.map(res => {
					return (
						<CustomRadioButtonItem
							value={res.key} 
							text={res.text} 
							key={res.key}
              selectedColor={ radioColor? radioColor : Color.n_default_brown}
							isSelected={value === res.key} 
							onPress={(value) => this.onPress(value)}
							itemContainerStyle={itemContainerStyle}
							radioSize={radioSize}
							itemTextStyle={[itemTextStyle, {margin: 5}]} />
					);
				})}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		// flexDirection: 'row',
	},
	radioText: {
		marginLeft: 5,
		fontSize: 14,
		color: '#000',
		fontWeight: '600'
	},
	radioCircle: {
		height: 30,
		width: 30,
		borderRadius: 100,
		borderWidth: 1,
		borderColor: '#62C8ff',
		alignItems: 'center',
		justifyContent: 'center',
	},
	selectedRb: {
		width: 20,
		height: 20,
		borderRadius: 50,
		backgroundColor: '#0EC73F',
	},
	result: {
		marginTop: 20,
		color: 'white',
		fontWeight: '600',
		backgroundColor: '#F3FBFE',
	},
});