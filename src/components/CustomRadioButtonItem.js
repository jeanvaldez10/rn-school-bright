import React, { Component } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Color from '../constants/color';

export default class CustomRadioButtonItem extends Component {
	render() {
		const value = this.props.value ?? 0;
		const text = this.props.text ?? '';
		const isSelected = this.props.isSelected ?? false;
		const onPress = this.props.onPress ?? (() => {});
		const disabled = this.props.disabled ?? false;

		const circleSize = this.props.radioSize ?? 20;
		const selectedSize = circleSize / 3 * 2;
		const radioCircleStyle = { width: circleSize, height: circleSize, borderRadius: circleSize / 2 };
		const selectedColor = this.props.selectedColor ? this.props.selectedColor : Color.n_default_brown;
		const selectedRb = { width: selectedSize, height: selectedSize, borderRadius: selectedSize / 2, backgroundColor: selectedColor };

		let disabledTextStyle = {}
		if(disabled){
			disabledTextStyle = {color: Color.custom_text_inactive};
		}


		return (
			<View style={[styles.container, this.props.itemContainerStyle]} key={value} >
				<TouchableOpacity
					style={{flexDirection: 'row', alignItems: 'center'}}
					onPress={() => {onPress(value)}}
					disabled={disabled}>
					<View
						style={[styles.radioCircle, {borderColor: selectedColor}, radioCircleStyle, isSelected && { borderColor: selectedColor }]}>
						{isSelected && <View style={[styles.selectedRb, selectedRb]} />}
					</View>
					{text!= "" && <Text style={[styles.radioText, this.props.itemTextStyle, disabledTextStyle]} multiLine={true}>{text}</Text>}
				</TouchableOpacity>

			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	radioText: {
		flex: 1,
    fontFamily: 'THSarabunNew',
		marginLeft: 10,
		fontSize: 24,
		color: Color.n_default_gray,
		fontWeight: 'normal'
	},
	radioCircle: {
		height: 20,
		width: 20,
		borderRadius: 10,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	selectedRb: {
		width: 20,
		height: 20,
		borderRadius: 10,
	},
});
