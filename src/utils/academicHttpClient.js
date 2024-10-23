import axios from 'axios';
import Storage from "../managers/StorageManager";
import StorageManager from "../managers/StorageManager";
import {apiUrls, BASE_URL, ACADEMIC_WEBSITE_URL, ACADEMIC_WEBSITE_URL_DEV} from '../constants/ApiUrls';
import ApiManager from "../managers/ApiManager";
import NavigationService from "../NavigationService";


const academicHttpClient = axios.create({
  baseURL: ACADEMIC_WEBSITE_URL,
  // headers: {
  //     'Content-Type': 'application/json',
  // },
});


const addAuthToken = async (config) => {
    try {
      const tokenInfo = await Storage.getUser();
      const urlsInfo = await Storage.getUrlsInfo();

      if (tokenInfo) {
        config.headers[`JabjaiKey-${tokenInfo.SchoolId}-${tokenInfo.ID}`] = tokenInfo.token;
      }

      if (urlsInfo.dev === true) {
        config.baseURL = ACADEMIC_WEBSITE_URL_DEV;
      } else {
        config.baseURL = ACADEMIC_WEBSITE_URL;
      }

      console.log("request url:", config.baseURL + config.url);
      return config;
    } catch
      (error) {
      console.error("Failed to add auth token to request", error);
      throw error;
    }
  }
;

const handleRequestError = (error) => {
  console.error("Request error:", error);
  return Promise.reject(error);
};

academicHttpClient.interceptors.request.use(addAuthToken, handleRequestError);

academicHttpClient.interceptors.response.use(response => {
  // const config = response.config;
  // console.log("request url:", config.baseURL + config.url);
  // console.log(config.method);
  // if(config.method == 'post'){
  //   console.log("post data: ", config.data);
  // }
  // console.log("response data:", response.data);
  return response;
}, async (error) => {
  console.log("api error,", error.config.baseURL, error.config.url, '----', error.response?.data?.Message, '---', error.response?.status);
  const originalConfig = error.config;
  console.log("config header:", originalConfig?.headers);
  if (error.response) {
    if (error.response.status === 401 && !originalConfig?._retry) {
      originalConfig._retry = true;
      try {
        const tokenInfo = await Storage.getUser();
        const rs = await ApiManager.updateToken(tokenInfo.token, tokenInfo.SchoolId, tokenInfo.ID);
        if (rs.success) {
          await Storage.setUser({...tokenInfo, "token": rs.token})
        }
        return academicHttpClient(originalConfig)
      } catch (_error) {
        console.log("Token Update error:", _error);
        if (_error.response && _error.response?.data) {
          return Promise.reject(_error.response.data);
        }
        return Promise.reject(_error);
      }

    }

    if (error.response.status === 401 && originalConfig._retry) {
      console.log("Again error");
      NavigationService.setShowTokenError();
    }

    if (error.response.status === 403 && error.response?.data) {
      return Promise.reject(error.response.data);
    }
  }

  return Promise.reject(error);
});


export default academicHttpClient;
