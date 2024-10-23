import React from 'react';
import {Modal} from 'react-native';
import {UIActivityIndicator} from 'react-native-indicators';

const Loader = (props) => {
  const {loading} = props;
  return (
    <Modal visible={loading} transparent={true}>
      <UIActivityIndicator color="#FFFFFF" />
    </Modal>
  );
};

export default Loader;
