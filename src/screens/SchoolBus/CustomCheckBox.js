import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import Color from '../../constants/color';
import images from '../../themes/Images';

const CustomCheckbox = ({ label, onToggle, checked, disabled, containerStyle }) => {
  return (
    <TouchableOpacity
      style={[containerStyle, styles.checkboxContainer, disabled && styles.disabledContainer]}
      onPress={!disabled ? onToggle : null}
      activeOpacity={disabled ? 1 : 0.7}
    >
      <View style={styles.checkbox}>
        {checked && (
          <Image
            source={disabled ? images.ic_checked_disabled : images.ic_checked_green}
            style={styles.checkmarkImage}
          />
        )}
      </View>
      <Text style={[styles.label, disabled && styles.disabledLabel]}>{label}</Text>
    </TouchableOpacity>
  );
};

export default CustomCheckbox;

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: Color.divider_color,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  disabledContainer: {
    opacity: 0.6,
  },
  label: {
    fontFamily: 'THSarabunNew',
    marginLeft: 10,
    fontSize: 24,
    color: Color.n_default_gray,
    fontWeight: 'normal',
  },
  disabledLabel: {
    color: Color.disabled_text || '#a0a0a0',
  },
  checkmarkImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
});
