import axios from 'axios';
import Storage from "../managers/StorageManager";
import {BASE_SERVER_URL, BASE_URL, BASE_URL_DEV_MOBILE} from '../constants/ApiUrls';
import { SERVER_URL_DEV } from '../constants/ApiUrls';
import ApiManager from "../managers/ApiManager";
import NavigationService from "../NavigationService";

const serverHttpClient = axios.create({
    baseURL: BASE_SERVER_URL,
    // headers: {
    //     'Content-Type': 'application/json',
    // },
});

const addAuthToken = async (config) => {
    try {
        const tokenInfo = await Storage.getUser();
        const urlsInfo = await Storage.getUrlsInfo();

        if(urlsInfo){
            if(urlsInfo.dev === true){
                if(urlsInfo.schoolbright){
                    config.baseURL = `${urlsInfo.schoolbright.DevURL}`;
                }
            }
            else{
                if(urlsInfo.schoolbright) {
                    config.baseURL = `${urlsInfo.schoolbright.ProdURL}`;
                }
            }
        }

        if (tokenInfo) {
            config.headers[`JabjaiKey-${tokenInfo.SchoolId}-${tokenInfo.ID}`] = tokenInfo.token;
        }

        const apiTypeRegex = /(Payment|Schoolbright)\s+API/;
        const urlMatch = config.url.match(/\/device\/system\/apiurls\?applicationtype=(.*)/);
        if (urlMatch && apiTypeRegex.test(urlMatch[1])) {
            config.baseURL = BASE_URL_DEV_MOBILE;
        }

        if(config.url == '/school'){
            config.baseURL = BASE_URL;
        }

        console.log("request url:", config.baseURL + config.url);
        return config;
    } catch (error) {
        console.error("Failed to add auth token to request", error);
        throw error;
    }
};

const handleRequestError = (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
};

serverHttpClient.interceptors.request.use(addAuthToken, handleRequestError);

serverHttpClient.interceptors.response.use(response => {
    // const config = response.config;
    // console.log("request url:", config.baseURL + config.url);
    // console.log(config.method);
    // if(config.method == 'post'){
    //     console.log("post data: ", config.data);
    // }
    // console.log("response data:", response.data);
    return response;
}, async (error) => {
    console.log("api error,", error.config.baseURL, error.config.url,'----',error.response?.data?.Message, '---', error.response?.status);
    const originalConfig = error.config;
    console.log("config header:", originalConfig?.headers);
    if (error.response){
        // if (error.response.status === 401 && !originalConfig?._retry) {
        //     originalConfig._retry = true;
        //     try {
        //         const tokenInfo = await Storage.getUser();
        //         const rs = await ApiManager.updateToken(tokenInfo.token, tokenInfo.SchoolId, tokenInfo.ID);
        //         if(rs.success){
        //             await Storage.setUser({...tokenInfo, "token":rs.token})
        //         }
        //         return serverHttpClient(originalConfig)
        //     }
        //     catch (_error) {
        //         console.log("Token Update error:", _error);
        //         if(_error.response && _error.response.data){
        //             return Promise.reject(_error.response.data);
        //         }
        //         return Promise.reject(_error);
        //     }
        // }

        // if (error.response.status === 401 && originalConfig._retry) {
        //     console.log("Again error");
        //     NavigationService.setShowTokenError();
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

export default serverHttpClient;
