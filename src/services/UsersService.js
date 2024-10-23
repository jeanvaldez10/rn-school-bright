import AsyncStorage from '@react-native-community/async-storage';
import {httpUtils} from '../utils/HttpUtils';
import {AsyncStorageKey, Mode} from '../constants/TextConstants';

class UsersService {
  signup(params, cbSuccess, cbError) {
    let url = httpUtils.signup();
    url =
      url +
      '&user=' +
      params.email +
      '&pass=' +
      params.password +
      '&device_id=' +
      params.device_id +
      '&lang=' +
      params.lang +
      '&token=' +
      params.token;

    fetch(
      url,
      {
        method: 'POST',
        headers: httpUtils.getHeaders(),
      },
      300000,
    )
      .then((response) => {
        return response.text();
      })
      .then((text) => {
        cbSuccess(text);
      })
      .catch((error) => {
        cbError(error);
      });
  }

  async appLogger(params, cbSuccess, cbError) {
    const email = await AsyncStorage.getItem(AsyncStorageKey.email);
    const fair_use_count = await AsyncStorage.getItem(
      email.concat(AsyncStorageKey.fair_use_count),
    );
    const nowMonth = new Date().toISOString().substr(0, 7).replace('-', '');
    let url =
      httpUtils.appLogger() +
      params.cmd +
      '&user=' +
      email +
      '&fair_use_count=' +
      fair_use_count +
      '&app_yyyymm=' +
      nowMonth;

    if (params.mp3_text) {
      url = url.concat('&mp3_text=', params.mp3_text);
    }

    if (params.app_response) {
      url = url.concat('&app_response=', params.app_response);
    }

    if (params.vision_api_response) {
      url = url.concat('&vision_api_response=', params.vision_api_response);
    }

    if (params.read_word_count) {
      url = url.concat('&read_word_count=', params.read_word_count);
    }

    console.log(url);
    fetch(url, {
      method: 'GET',
      headers: httpUtils.getHeaders(),
    })
      .then((response) => {
        return response.text();
      })
      .then((text) => {
        console.log('[UserService-log==>]', text);
        cbSuccess(text);
      })
      .catch((error) => {
        console.log('error', error);
        cbError(error);
      });
  }

  signin(params, cbSuccess, cbError) {
    let url = httpUtils.signin();
    const nowMonth = new Date().toISOString().substr(0, 7).replace('-', '');
    switch (params.mode) {
      case Mode.PassMode:
        url = url + '&pass=' + params.password;
        break;
      case Mode.GoogleLogin:
        url = url + '&google_id=' + params.google_id;
        break;
      case Mode.FacebookLogin:
        url = url + '&facebook_id=' + params.facebook_id;
        break;
      case Mode.FingerPrint:
        url = url + '&user_id=' + params.user_id;
        break;
    }
    url =
      url +
      '&user=' +
      params.email +
      '&lang=' +
      params.lang +
      '&device_id=' +
      params.device_id +
      '&fair_use_count=' +
      params.fair_use_count +
      '&app_yyyymm=' +
      nowMonth +
      '&token=' +
      params.token;
    console.log(url);
    fetch(url, {
      method: 'POST',
      headers: httpUtils.getHeaders(),
    })
      .then((response) => {
        return response.text();
      })
      .then((text) => {
        console.log('[UserService-log==>]', text);
        cbSuccess(text);
      })
      .catch((error) => {
        console.log('error', error);
        cbError(error);
      });
  }

  signInAfterRegistration(params, cbSuccess, cbError) {
    let url = httpUtils.signin();
    const nowMonth = new Date().toISOString().substr(0, 7).replace('-', '');
    console.log('Shanto ', nowMonth, params);

    url =
      url +
      '&user=' +
      params.user +
      '&lang=' +
      params.lang +
      '&device_id=' +
      params.device_id +
      '&app_yyyymm=' +
      nowMonth +
      '&user_id=' +
      params.user_id +
      '&token=' +
      params.token;

    console.log(url);
    fetch(url, {
      method: 'POST',
      headers: httpUtils.getHeaders(),
    })
      .then((response) => {
        return response.text();
      })
      .then((text) => {
        console.log('[UserService-log==>]', text);
        cbSuccess(text);
      })
      .catch((error) => {
        console.log('error', error);
        cbError(error);
      });
  }

  logout(params, cbSuccess, cbError) {
    let url = httpUtils.logout();
    const nowMonth = new Date().toISOString().substr(0, 7).replace('-', '');
    switch (params.mode) {
      case Mode.PassMode:
        url = url + '&pass=' + params.password;
        break;
      case Mode.GoogleLogin:
        url = url + '&google_id=' + params.google_id;
        break;
      case Mode.FacebookLogin:
        url = url + '&facebook_id=' + params.facebook_id;
        break;
      case Mode.FingerPrint:
        url = url + '&user_id=' + params.user_id;
        break;
    }
    url =
      url +
      '&user=' +
      params.email +
      '&lang=' +
      params.lang +
      '&session_id=' +
      params.session_id +
      '&device_id=' +
      params.device_id +
      '&fair_use_count=' +
      params.fair_use_count +
      '&app_yyyymm=' +
      nowMonth;
    console.log(url);
    fetch(url, {
      method: 'POST',
      headers: httpUtils.getHeaders(),
    })
      .then((response) => {
        return response.text();
      })
      .then((text) => {
        console.log('[UserService-log==>]', text);
        cbSuccess(text);
      })
      .catch((error) => {
        console.log('error', error);
        cbError(error);
      });
  }

  async getAllLanguages() {
    const params = await httpUtils.getHTTPParams();
    params.lang = 'all';
    let url = httpUtils.addAuth(httpUtils.translate(), params);
    url = url.concat('&info=yes', '&fair_use_count', params.fair_use_count);
    const response = await fetch(url, {
      method: 'POST',
      headers: httpUtils.getHeaders(),
    });
    return response.json();
  }

  async detectLanguage(text) {
    const params = await httpUtils.getTranslationAPIParams(text);
    const url =
      httpUtils.translate() +
      '&user=' +
      params.email +
      '&user_id=' +
      params.user_id +
      '&lang=all' +
      '&device_id=' +
      params.device_id +
      '&input_text=' +
      params.input_text +
      '&user_id=' +
      params.user_id +
      '&fair_use_count=' +
      params.fair_use_count +
      '&info=detect';
    const response = await fetch(url, {
      method: 'POST',
      headers: httpUtils.getHeaders(),
    });
    return response.text();
  }

  async translate(langCode, text) {
    const params = await httpUtils.getTranslationAPIParams(text);
    const url =
      httpUtils.translate() +
      '&user=' +
      params.email +
      '&user_id=' +
      params.user_id +
      '&lang=' +
      langCode +
      '&device_id=' +
      params.device_id +
      '&input_text=' +
      params.input_text +
      '&user_id=' +
      params.user_id +
      '&fair_use_count=' +
      params.fair_use_count;

    const response = await fetch(url, {
      method: 'POST',
      headers: httpUtils.getHeaders(),
    });
    return response.text();
  }

  validate(params, cbSuccess, cbError) {
    let url = httpUtils.addAuth(httpUtils.validate(), params);

    if (params.dest_telno) {
      url = url.concat('&dest_telno=', params.dest_telno, '&dest_email=');
    }

    if (params.telno) {
      url += '&telno=' + params.telno;
    }

    if (params.send_telno_code) {
      url += '&send_telno_code=yes';
    }

    if (params.send_email_code) {
      url += '&send_email_code=yes';
    }

    if (params.info) {
      url += '&info=' + params.info;
    }

    console.log('[UserService==> ', url);
    return fetch(url, {
      method: 'POST',
      headers: httpUtils.getHeaders(),
    })
      .then((response) => {
        return response.text();
      })
      .then((text) => {
        console.log('[UserService==> ', text);
        if (cbSuccess) {
          cbSuccess(text);
        }
      })
      .catch((error) => {
        if (cbError) {
          cbError(error);
        } else {
          console.log(error);
        }
      });
  }

  forgot(params, cbSuccess, cbError) {
    let url =
      httpUtils.forgot() +
      '&user=' +
      params.email +
      '&device_id=' +
      params.device_id;

    if (params.send_email_code) {
      url += '&send_email_code=' + params.send_email_code;
    }
    if (params.pass) {
      url += '&pass=' + params.pass;
    }
    if (params.info) {
      url += '&info=' + params.info;
    }

    console.log(url);
    fetch(url, {
      method: 'POST',
      headers: httpUtils.getHeaders(),
    })
      .then((response) => {
        return response.text();
      })
      .then((text) => {
        cbSuccess(text);
      })
      .catch((error) => {
        cbError(error);
      });
  }
}

export const usersService = new UsersService();
