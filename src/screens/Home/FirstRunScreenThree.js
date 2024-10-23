import React from 'react';
import { Image, View, BackHandler, Text } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Color from '../../constants/color';

import Images from '../../themes/Images';

import { SafeAreaView } from 'react-native-safe-area-context';


import translang, { getCurrentLocale } from '../../utils/language.utils';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default class FirstRunScreenThree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      
    };
  }

  handleBackButton = () => {
    return true;
  };

  componentDidMount() {
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
  }

  componentWillUnmount = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }
    if(this.focusListener){
      this.focusListener.remove();
    }
  };

  skip = () => {
    this.props.navigation.navigate('App');
  };

  render() {
    const { files } = this.state;
    return (
      <SafeAreaView style={styles.container} edges={['right', 'left']}>
        <Image
          source={(getCurrentLocale() == 'th') ? Images.n_img_first_three : Images.n_img_first_three}
          style={styles.attachImage}
        />

        <View style={styles.btncontainer}>
          <TouchableOpacity 
            style={{...styles.buttonstyle, backgroundColor: Color.n_default_orange}}
            onPress={() => {
              // this.props.navigation.navigate('App');
              this.props.navigation.navigate('Auth');
              }}>
            <Text style={{fontFamily: 'THSarabunNew', fontSize: 20, color: Color.white, fontWeight: 'bold'}}>{translang.t('FINISH')}</Text>
          </TouchableOpacity>
        </View>

          
        
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  attachImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
  },
  container: {
    height: '100%',
    position: 'relative'
  },

  btncontainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 30,

    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  buttonstyle: {
    width: 100,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.n_default_brown,

    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 3,
    borderRadius: 22,

  }
});
