import axios from 'axios';
import { SCHOOL_BUS_URL } from '../constants/ApiUrls';
import Storage from '../managers/StorageManager';

const TEMP_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjAxIiwiZW1haWwiOiIwMV84NDlfMDFAc2Nob29sYnJpZ2h0LmNvbSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL3Bvc3RhbGNvZGUiOiI4NDkiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9zaWQiOiI1NjA5NjIiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9oYXNoIjoiMDEiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL2V4cGlyYXRpb24iOiIxMS8zMC8yMDI0IDEyOjUwOjUxIEFNIiwibmJmIjoxNzMyODQxNDUyLCJleHAiOjE3MzI5Mjc4NTEsImlhdCI6MTczMjg0MTQ1Mn0.Z09LZcwOK_yLua2_Y_eGQtC7k3m5zApJwHihaa145JA';

const STUDENT_TEMP_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjEwNzE1IiwiZW1haWwiOiJwaWNYWFhYQHNjaG9vbGJyaWdodC5jbyIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL3Bvc3RhbGNvZGUiOiI4NDkiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9zaWQiOiI1ODE3MjgiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9oYXNoIjoiMTExMTExIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9leHBpcmF0aW9uIjoiMTEvMTIvMjAyNCA1OjAzOjM3IFBNIiwibmJmIjoxNzMxMDg1NDE3LCJleHAiOjE3MzE0MzEwMTcsImlhdCI6MTczMTA4NTQxN30.VBxMaoBMYa7o1cueHcV8p22sOxMKghve-aPyffTdTFY';

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

    config.headers['jabjaikey'] = config.headers.isStudent ? STUDENT_TEMP_TOKEN : TEMP_TOKEN; //tokenInfo.token;

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
