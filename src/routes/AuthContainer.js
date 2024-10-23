import {createStackNavigator} from 'react-navigation-stack';
import ForgotpassScreen from '../screens/Auth/ForgotPassScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import Validate from '../screens/Auth/Validate';

export const AuthContainer = createStackNavigator(
  {
    Login: LoginScreen,
    Register: RegisterScreen,
    Forgotpass: ForgotpassScreen,
    Validate: Validate,
  },
  {
    initialRouteName: 'Login',
    headerMode: 'none',
  }
);