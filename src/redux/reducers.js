import {
  GET_AUTH, GET_DEV, SET_AUTH, SET_DEV, GET_ISEDITSTATUS, SET_ISEDITSTATUS, GET_QUICKMENU, SET_QUICKMENU,
  GET_TABINDEX, SET_TABINDEX, GET_USERINFO, SET_USERINFO, GET_LOGININFO, SET_LOGININFO, GET_SHOWTOKENERROR,
  SET_SHOWTOKENERROR, GET_GOVERIFYLINESUCCESS, SET_GOVERIFYLINESUCCESS
} from "./actions";
import {combineReducers} from "redux";

const initialState = {
  dev: false,
  auth: null,
  isEditStatus: false,
  quickMenu: [],
  tabIndex: 0,
  userInfo: null,
  loginInfo: null,
  showTokenError: false,
  goVerifyLineSuccess: false,
};

function devReducer(state = initialState, action) {
  switch (action.type) {
    case GET_DEV:
      return state;
    case SET_DEV:
      return {...state, dev: action.payload};
    case GET_AUTH:
      return state.auth;
    case SET_AUTH:
      return {...state, auth: action.payload};
    case GET_ISEDITSTATUS:
      return state.isEditStatus;
    case SET_ISEDITSTATUS:
      return {...state, isEditStatus: action.payload};
    case GET_QUICKMENU:
      return state.quickMenu;
    case SET_QUICKMENU:
      return {...state, quickMenu: action.payload};
    case GET_TABINDEX:
      return state.tabIndex;
    case SET_TABINDEX:
      return {...state, tabIndex: action.payload};
    case GET_USERINFO:
      return state.userInfo;
    case SET_USERINFO:
      return {...state, userInfo: action.payload};
    case GET_LOGININFO:
      return state.loginInfo;
    case SET_LOGININFO:
      return {...state, loginInfo: action.payload};
    case GET_SHOWTOKENERROR:
      return state.showTokenError;
    case SET_SHOWTOKENERROR:
      return {...state, showTokenError: action.payload};
    case GET_GOVERIFYLINESUCCESS:
      return state.goVerifyLineSuccess;
    case SET_GOVERIFYLINESUCCESS:
      return {...state, goVerifyLineSuccess: action.payload};
    default:
      return state;
  }
}


export default devReducer;
