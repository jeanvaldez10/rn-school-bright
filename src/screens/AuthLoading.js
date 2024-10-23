import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';

export default class AuthLoadingScreen extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
    this._bootstrapAsync();
  }

  _bootstrapAsync = async () => {
    // const user = await Storage.getUser();
    // this.props.navigation.navigate(!_.isEmpty(user) ? 'App' : 'Auth');
    this.props.navigation.navigate('Auth');
  };

  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})