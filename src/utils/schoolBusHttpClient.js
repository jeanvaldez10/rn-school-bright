import axios from 'axios';
import { SCHOOL_BUS_URL } from '../constants/ApiUrls';
import Storage from '../managers/StorageManager';

const TEMP_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjAxIiwiZW1haWwiOiIwMV84NDlfMDFAc2Nob29sYnJpZ2h0LmNvbSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL3Bvc3RhbGNvZGUiOiI4NDkiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9zaWQiOiI1NjA5NjIiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9oYXNoIjoiMDEiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL2V4cGlyYXRpb24iOiIxMS8yNi8yMDI0IDc6Mjg6NDYgQU0iLCJuYmYiOjE3MzI1MTk3MjYsImV4cCI6MTczMjYwNjEyNiwiaWF0IjoxNzMyNTE5NzI2fQ.WYflXLmjOPra-97IdUl2oGlZkQ6vY_di6PIOyu2m4Ww';

const schoolBusHttpClient = axios.create({
  baseURL: SCHOOL_BUS_URL,
});

const addAuthToken = async (config) => {
  try {
    // const tokenInfo = await Storage.getUser();
    const urlsInfo = await Storage.getUrlsInfo();
    if (urlsInfo.dev === true) {
      config.baseURL = SCHOOL_BUS_URL;
    } else {
      config.baseURL = SCHOOL_BUS_URL;
    }

    config.headers['jabjaikey'] = TEMP_TOKEN; //tokenInfo.token;

    console.log('request url:', config.baseURL + config.url);
    return config;
  } catch (error) {
    console.error('Failed to add auth token to request', error);
    throw error;
  }
};
const handleRequestError = (error) => {
  console.error('Request error:', error);
  return Promise.reject(error);
};

schoolBusHttpClient.interceptors.request.use(addAuthToken, handleRequestError);

// schoolBusHttpClient.interceptors.response.use(
//   (response) => {
//     // const config = response.config;
//     // console.log("request url:", config.baseURL + config.url);
//     // console.log(config.method);
//     // if(config.method == 'post'){
//     //   console.log("post data: ", config.data);
//     // }
//     // console.log("response data:", response.data);
//     return response;
//   },
//   async (error) => {
//     console.log(
//       'api error,',
//       error.config.baseURL,
//       error.config.url,
//       '----',
//       error.response?.data?.Message,
//       '---',
//       error.response?.status,
//     );
//     const originalConfig = error.config;
//     console.log('config header:', originalConfig?.headers);
//     if (error.response) {
//       if (error.response.status === 401 && !originalConfig?._retry) {
//         originalConfig._retry = true;
//         try {
//           const tokenInfo = await Storage.getUser();
//           const rs = await ApiManager.updateToken(
//             tokenInfo.token,
//             tokenInfo.SchoolId,
//             tokenInfo.ID,
//           );
//           if (rs.success) {
//             await Storage.setUser({ ...tokenInfo, token: rs.token });
//           }
//           return schoolBusHttpClient(originalConfig);
//         } catch (_error) {
//           console.log('Token Update error:', _error);
//           if (_error.response && _error.response?.data) {
//             return Promise.reject(_error.response.data);
//           }
//           return Promise.reject(_error);
//         }
//       }

//       if (error.response.status === 401 && originalConfig._retry) {
//         console.log('Again error');
//         NavigationService.setShowTokenError();
//       }

//       if (error.response.status === 403 && error.response?.data) {
//         return Promise.reject(error.response.data);
//       }
//     }

//     return Promise.reject(error);
//   },
// );

export default schoolBusHttpClient;
