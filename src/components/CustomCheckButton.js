import React, { Component } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import Color from '../constants/color';
import Images from '../themes/Images';
export default class CustomCheckButton extends Component {
	render() {
		const value = this.props.value ?? 0;
		const text = this.props.text ?? '';
		const isSelected = this.props.isSelected ?? false;
		const onPress = this.props.onPress ?? (() => {});
		const disabled = this.props.disabled ?? false;
		const aligncenter = this.props.alignCenter ?? true;


		let textcolor = this.props.textColor ?? Color.n_default_orange;
		if(disabled){
			textcolor = Color.n_default_gray;
		}

		const width = this.props.checkboxSize ?? 20;
		return (
			<View>
				<TouchableOpacity
					key={isSelected}
					activeOpacity={1}
					style={[styles.container]}
					onPress={() => {onPress(isSelected)}}
					disabled={disabled}>
					<View>
						{isSelected &&
						<Image source={Images.n_ic_checkbox_sel} style={{width: width, height: width, resizeMode: 'contain' }}/>}
						{!isSelected &&
						<Image source={Images.n_ic_checkbox_unsel} style={{width: width, height: width, resizeMode: 'contain' }}/>}
					</View>
					<Text style={[styles.radioText, this.props.itemTextStyle, {color: textcolor}]}>{text}</Text>
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
    fontFamily: 'THSarabunNew',
		marginLeft: 10,
		fontSize: 24,
		color: Color.n_default_gray,
		fontWeight: 'normal'
	},
});
