import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Color from '../../../constants/color';
import { BusStatusColorMap } from '../../../constants/constants';
import translang from '../../../utils/language.utils';

const StudentStatusModal = ({ isVisible, onSelect, onCan }) => {
  const handleSelected = (index) => {
    const handleSelect = onSelect ?? (() => {});
    handleSelect(index);
  };

  const handleCanceled = () => {
    const handleCancel = onCan ?? (() => {});
    handleCancel();
  };

  const renderStatusItem = (index) => {
    const StudentStatusTitle = {
      0: { title: translang.t('BUS_CHECK_IN_STATUS_CHECKED_IN') },
      1: { title: translang.t('BUS_CHECK_IN_STATUS_CHECKED_IN_LATE') },
      2: { title: translang.t('BUS_CHECK_IN_STATUS_NOT_BOARD') },
      3: { title: translang.t('BUS_CHECK_IN_STATUS_PERSONNAL_LEAVE') },
      4: { title: translang.t('BUS_CHECK_IN_STATUS_SICK_LEAVE') },
      '-1': { title: translang.t('BUS_CHECK_IN_STATUS_UNSPECIFIED') },
    };

    const colors = BusStatusColorMap[index].color;
    const title = StudentStatusTitle[index].title;

    return (
      <TouchableOpacity
        style={styles.statusItemContainer}
        activeOpacity={0.7}
        onPress={() => handleSelected(index)}
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
        <View>
          <View style={styles.row}>
            {renderStatusItem(0)}
            {renderStatusItem(3)}
          </View>
          <View style={styles.row}>
            {renderStatusItem(1)}
            {renderStatusItem(4)}
          </View>
          <View style={styles.row}>
            {renderStatusItem(2)}
            {renderStatusItem(-1)}
          </View>
        </View>
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
