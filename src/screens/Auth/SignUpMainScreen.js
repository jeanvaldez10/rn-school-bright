import React from 'react';
import {
  StyleSheet,
  View,
  Image,
} from 'react-native';
import GradientButton from '../../components/GradientButton';
import Images from '../../themes/Images';
import Orientation from 'react-native-orientation-locker';
import _ from 'lodash';
import Color from '../../constants/color';
import translang from '../../utils/language.utils';
import { SafeAreaView } from 'react-native-safe-area-context';

import PasswordInputModal from '../../components/PasswordInputModal';


export default class SignUpMainScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      password: '',
      showErrorModal: false,
      showModal: false,
      
      regtype: "student",

    };
  }

  async componentDidMount() {
    
  }

  componentWillUnmount() {
    
  }

  componentDidUpdate(prevProps, prevState) {
  
  }

  gotoStudentReg = () => {
    this.setState({showModal: true, regtype: 'student'});
  }

  gotoTeacherReg = () => {
    this.setState({showModal: true, regtype: 'teacher'});
  }

  onPasswordOk = (password) => {
    this.setState({showModal: false, password, password}, ()=>{
      this.props.navigation.navigate('SignUpStepOne', {password: this.state.password, regtype: this.state.regtype});
    });
    
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View>
          <View style={styles.appimage}>
            <Image source={Images.n_applogo_logo} style={styles.appLogo} resizeMode='contain' />
          </View>
          <GradientButton
            containerStyle={styles.loginBtn}
            label={translang.t('SIGNUP_STUDENT')}
            colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
            _onPress={() => this.gotoStudentReg()}
          />
          <GradientButton
            containerStyle={styles.loginBtn}
            label={translang.t('SIGNUP_TEACHER')}
            colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
            _onPress={() => this.gotoTeacherReg()}
          />
          <GradientButton
            containerStyle={styles.loginBtn}
            label={translang.t('Home')}
            colors={[Color.white, Color.white]}
            borderColor = {Color.n_button_gradient_green_start}
            textStyle = {{color: Color.n_button_gradient_green_start}}
            _onPress={() => this.props.navigation.navigate('Login')}
          />
        </View>

        <PasswordInputModal
          isVisible={this.state.showModal}
          onClose={() => { this.setState({ showModal: false }) }}
          onOK={(password) => { this.onPasswordOk(password) }}
          onError={() => { this.setState({ showModal: true }) }}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white
  },
  appLogo: {
    width: '100%',
    height: '100%',
  },
  appimage: {
    marginTop: 20,
    width: '100%',
    height: 130,
    alignItems: 'center',
  },
 
  loginBtn: {
    width: '100%',
    height: 70,
    marginTop: 45,
    paddingHorizontal: 35,
  },
  
});
