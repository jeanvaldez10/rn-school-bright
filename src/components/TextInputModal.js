import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
} from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import Color from "../constants/color";
import Images from "../themes/Images";
import GradientButton from "../components/GradientButton";
import CustomTextInput from "../components/CustomTextInput";

export default function TextInputModal({
  isVisible,
  onOk,
  onClose,
  dialogTtitle,
  placeholder,
  defaultText,
  buttonTitle,
}) {
  const [value, setValue] = useState(defaultText);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      key="modal"
      visible={isVisible}
    >
      <TouchableOpacity
        style={styles.centeredView}
        activeOpacity={1}
        onPressOut={onClose}
      >
        <View style={styles.dialogStyle}>
          <Text style={styles.titleTextStyle}>{dialogTtitle}</Text>
          <TouchableOpacity
            style={{ position: "absolute", top: 5, right: 5 }}
            onPress={onClose}
          >
            <Image
              source={Images.ic_close_cross}
              style={{ width: 12, height: 12, margin: 10 }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <CustomTextInput
            inputStyle={{
              fontSize: 24,
              margin: 4,
            }}
            inputWrapperStyle={{
              width: "100%",
              borderWidth: 1,
              borderRadius: 10,
              marginHorizontal: 35,
              borderColor: Color.gray_divider,
            }}
            value={value}
            onChangeText={setValue}
            disableMultiline
            placeholder={placeholder}
            placeholderTextColor={Color.n_text_placeholder_gray}
          />

          <View>
            <GradientButton
              label={buttonTitle ?? translang.t("COMMON_close")}
              containerStyle={{
                marginVertical: 20,
                shadowColor: "transparent",
                shadowOpacity: 0,
              }}
              buttonStyle={{
                borderRadius: 20,
                height: 40,
                paddingHorizontal: 30,
              }}
              colors={[
                Color.n_button_gradient_orange_start,
                Color.n_button_gradient_orange_end,
              ]}
              _onPress={() => onOk(value)}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = ScaledSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000025",
  },
  dialogStyle: {
    width: "300@ms",
    maxHeight: "60%",
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  itemStyle: {
    fontSize: 24,
    padding: 10,
    textAlign: "center",
  },

  titleTextStyle: {
    width: "100%",
    marginTop: 10,
    marginBottom: 10,
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: Color.n_default_orange,
  },
});
