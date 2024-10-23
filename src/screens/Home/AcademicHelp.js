import React from 'react';
import { Image, View, BackHandler } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Color from '../../constants/color';
import { ScrollView } from 'react-native-gesture-handler';

import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';

import translang, { getCurrentLocale } from '../../utils/language.utils';

export default class AcademicHelp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [require("../../assets/images/advice_english.png")],
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
  }

  componentWillUnmount = () => {
    if(this.backHandler){
      this.backHandler.remove();
    }
  };

  back = () => {
    this.props.navigation.navigate('AcademicOutput');
  };

  render() {
    const { files } = this.state;
    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_acadresult')}
          onMenuTap={() => this.back()}
        />
        <View style={styles.viewcontainer}>
          <Image
            source={(getCurrentLocale() == 'th') ? require("../../assets/images/advice_thai.png") : require("../../assets/images/advice_english.png")}
            style={styles.attachImage}
          />
        </View>
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  attachImage: {
    width: '100%',
    height: '100%',
    margin: 2,
    //resizeMode: 'contain'
  },
  container: {
    height: '100%',
    backgroundColor: Color.n_background_white,
  },
  viewcontainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
