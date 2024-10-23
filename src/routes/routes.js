import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import AuthLoadingScreen from '../screens/AuthLoading';
import { AuthContainer } from './AuthContainer';

export const AppContainer = createAppContainer(
  createSwitchNavigator(
    {
      AuthLoading: AuthLoadingScreen,
      Auth: AuthContainer,
      // App: MainAppContainer,
    },
    {
      initialRouteName: 'AuthLoading',
      headerMode: 'none',
    }
  )
);