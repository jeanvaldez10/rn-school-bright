import Storage from "../managers/StorageManager";


// Define action types
export const GET_DEV = 'GET_DEV';
export const SET_DEV = 'SET_DEV';
export const GET_AUTH = 'GET_AUTH';
export const SET_AUTH = 'SET_AUTH';
export const GET_ISEDITSTATUS = 'GET_ISEDITSTATUS';
export const SET_ISEDITSTATUS = 'SET_ISEDITSTATUS';
export const GET_QUICKMENU = 'GET_QUICKMENU';
export const SET_QUICKMENU = 'SET_QUICKMENU';
export const GET_TABINDEX = 'GET_TABINDEX';
export const SET_TABINDEX = 'SET_TABINDEX';
export const GET_USERINFO = 'GET_USERINFO';
export const SET_USERINFO = 'SET_USERINFO';
export const GET_LOGININFO = 'GET_LOGININFO';
export const SET_LOGININFO = 'SET_LOGININFO';
export const GET_SHOWTOKENERROR = 'GET_SHOWTOKENERROR';
export const SET_SHOWTOKENERROR = 'SET_SHOWTOKENERROR';
export const GET_GOVERIFYLINESUCCESS = 'GET_GOVERIFYLINESUCCESS';
export const SET_GOVERIFYLINESUCCESS = 'SET_GOVERIFYLINESUCCESS';

export const getDEV = dev => dispatch => {
  dispatch({
    type: GET_DEV,
    payload: dev,
  });
};

export const setDEV = dev => dispatch => {
  dispatch({
    type: SET_DEV,
    payload: dev,
  });
};

export const getAuth = data => dispatch => {
  dispatch({
    type: GET_AUTH,
    payload: data,
  });
};


export const setAuth = data => dispatch => {
  dispatch({
    type: SET_AUTH,
    payload: data,
  });
};

export const getIsEditStatus = data => dispatch => {
  dispatch({
    type: GET_ISEDITSTATUS,
    payload: data,
  });
};


export const setIsEditStatus = data => dispatch => {
  dispatch({
    type: SET_ISEDITSTATUS,
    payload: data,
  });
};

export const getQuickMenu = data => dispatch => {
  dispatch({
    type: GET_QUICKMENU,
    payload: data,
  });
};

export const setQuickMenu = data => dispatch => {
  dispatch({
    type: SET_QUICKMENU,
    payload: data,
  });
};


export const getTabIndex = data => dispatch => {
  dispatch({
    type: GET_TABINDEX,
    payload: data,
  });
};

export const setTabIndex = data => dispatch => {
  dispatch({
    type: SET_TABINDEX,
    payload: data,
  });
};

export const getUserInfo = data => dispatch => {
  dispatch({
    type: GET_USERINFO,
    payload: data,
  });
};

export const setUserInfo = data => dispatch => {
  dispatch({
    type: SET_USERINFO,
    payload: data,
  });
};

export const getLoginInfo = data => dispatch => {
  dispatch({
    type: GET_LOGININFO,
    payload: data,
  });
};

export const setLoginInfo = data => dispatch => {
  dispatch({
    type: SET_LOGININFO,
    payload: data,
  });
};

export const getShowTokenError = data => dispatch => {
  dispatch({
    type: SET_SHOWTOKENERROR,
    payload: data,
  });
};


export const setShowTokenError = data => dispatch => {
  dispatch({
    type: SET_SHOWTOKENERROR,
    payload: data,
  });
};

export const getGoVerifyLineSuccess = data => dispatch => {
  dispatch({
    type: GET_GOVERIFYLINESUCCESS,
    payload: data,
  });
};


export const setGoVerifyLineSuccess = data => dispatch => {
  dispatch({
    type: SET_GOVERIFYLINESUCCESS,
    payload: data,
  });
};
