import axios from 'axios';
import StorageManager from "../managers/StorageManager";
import Storage from "../managers/StorageManager";
import {apiUrls, SHOP_BASE_URL, SHOP_BASE_URL_DEV} from '../constants/ApiUrls';
import apiHttpClient from "../utils/apiHttpClient";
import ApiManager from "../managers/ApiManager";
import NavigationService from "../NavigationService";


const shopHttpClient = axios.create({
  baseURL: SHOP_BASE_URL,
  // headers: {
  //     'Content-Type': 'application/json',
  // },
});

shopHttpClient.interceptors.request.use(
  async (config) => {
    const tokenInfo = await StorageManager.getUser();
    const urlsInfo = await Storage.getUrlsInfo();
    if (urlsInfo) {
      if (urlsInfo.dev === true) {
        if (urlsInfo.payment) {
          config.baseURL = `${urlsInfo.payment.DevURL}api`;
        }else{
          if(urlsInfo.payment){
            config.baseURL = `${urlsInfo.payment.ProdURL}api`;
        }
        }
      }
    }
    if (tokenInfo) {
      config.headers[`JabjaiKey-${tokenInfo.SchoolId}-${tokenInfo.ID}`] = tokenInfo.token;
    }
    console.log("request url:", config.baseURL + config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

shopHttpClient.interceptors.response.use(response => {
  // const config = response.config;
  // console.log("request url:", config.baseURL + config.url);
  // console.log(config.method);
  // if(config.method == 'post'){
  //   console.log("post data: ", config.data);
  // }
  // console.log("response data:", response.data);
  return response;
}, async (error) => {
  console.log("shop error,", error);
  // console.log("shop error,", error.response.data.Message);
  const originalConfig = error.config;
  if (error.response) {
    // if (error.response.status === 401 && !originalConfig._retry) {
    //   originalConfig._retry = true;

    //   try {
    //     const tokenInfo = await Storage.getUser();
    //     const rs = await ApiManager.updateToken(tokenInfo.token, tokenInfo.SchoolId, tokenInfo.ID);
    //     if (rs.success) {
    //       await Storage.setUser({...tokenInfo, "token": rs.token})
    //     }
    //     return shopHttpClient(originalConfig)
    //   } catch (_error) {
    //     console.log("shop Again error");
    //     if (_error.response && _error.response.data) {
    //       return Promise.reject(_error.response.data);
    //     }
    //     return Promise.reject(_error);
    //   }

    // }

    // if (error.response.status === 401 && originalConfig._retry) {
    //   console.log("shop again error");
    //   NavigationService.setShowTokenError();
    // }

    if (error.response.status === 401) {
      console.log("Again error");
      NavigationService.setShowTokenError();
    }

    if (error.response.status === 403 && error.response.data) {
      return Promise.reject(error.response.data);
    }
  }

  return Promise.reject(error);
});


export default shopHttpClient;
