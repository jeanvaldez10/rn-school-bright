import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Color from '../../../constants/color';
import translang from '../../../utils/language.utils';

const StudentStatusModal = ({ isVisible, onSelect, onCan, checkMode = 'in' }) => {
  // can't be in constants as language switch is affected.
  let BusStatusColorMap = {
    1: {
      value: 1,
      title:
        checkMode === 'in'
          ? translang.t('BUS_CHECK_IN_STATUS_CHECKED_IN')
          : translang.t('BUS_CHECK_IN_STATUS_CHECKED_OUT'),
      color: Color.n_button_gradient_green_end,
    },
    2: {
      value: 2,
      title: translang.t('BUS_CHECK_IN_STATUS_CHECKED_IN_LATE'),
      color: Color.n_default_brown,
    },
    3: {
      value: 1,
      title: translang.t('BUS_CHECK_IN_STATUS_CHECKED_OUT'),
      color: Color.n_button_gradient_green_end,
    },
    '-1': {
      value: 2,
      title: translang.t('BUS_CHECK_IN_STATUS_NOT_BOARD'),
      color: Color.n_default_orange,
    },
    '-2': {
      value: 3,
      title: translang.t('BUS_CHECK_IN_STATUS_PERSONNAL_LEAVE'),
      color: Color.n_seance,
    },
    '-3': {
      value: 4,
      title: translang.t('BUS_CHECK_IN_STATUS_SICK_LEAVE'),
      color: Color.n_electric_violet,
    },
    0: {
      value: 0,
      title: translang.t('BUS_CHECK_IN_STATUS_UNSPECIFIED'),
      color: Color.n_scorpion,
    },
  };

  const handleSelected = (index) => {
    const handleSelect = onSelect ?? (() => {});
    handleSelect(index);
  };

  const handleCanceled = () => {
    const handleCancel = onCan ?? (() => {});
    handleCancel();
  };

  const renderStatusItem = (status) => {
    const colors = BusStatusColorMap[status].color;
    const title = BusStatusColorMap[status].title;

    return (
      <TouchableOpacity
        style={styles.statusItemContainer}
        activeOpacity={0.7}
        onPress={() => {
          handleSelected(status);
          handleCanceled();
        }}
      >
        <View style={{ ...styles.statusItem, backgroundColor: colors }}>
          <Text style={styles.statusTitle}>{title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal animationType="fade" transparent={true} visible={isVisible}>
      <TouchableOpacity style={styles.centeredView} onPress={handleCanceled}>
        {checkMode === 'in' ? (
          <View>
            <View style={styles.row}>
              {renderStatusItem(1)}
              {renderStatusItem(-2)}
            </View>
            <View style={styles.row}>
              {renderStatusItem(2)}
              {renderStatusItem(-3)}
            </View>
            <View style={styles.row}>
              {renderStatusItem(-1)}
              {renderStatusItem(0)}
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.row}>
              {renderStatusItem(1)}
              {renderStatusItem(0)}
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000A0',
  },
  statusItemContainer: {
    marginVertical: 10,
    marginHorizontal: 15,
  },
  statusItem: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '400',
    color: Color.white,
    textAlign: 'center',
  },
  row: { flexDirection: 'row', justifyContent: 'center' },
});

export default StudentStatusModal;
