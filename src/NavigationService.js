import { NavigationActions } from 'react-navigation';
import { store } from './redux/store'
import { SET_SHOWTOKENERROR } from './redux/actions'
let _navigator;

function setTopLevelNavigator(navigatorRef) {
  _navigator = navigatorRef;
}

function navigate(routeName, params) {
  _navigator.dispatch(
    NavigationActions.navigate({
      routeName,
      params,
    })
  );
}

function setShowTokenError() {
  store.dispatch({type: 'SET_SHOWTOKENERROR', payload: true})
}

// add other navigation functions that you need and export them

export default {
  navigate,
  setTopLevelNavigator,
  setShowTokenError,
};
