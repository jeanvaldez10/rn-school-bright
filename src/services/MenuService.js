import {httpUtils} from '../utils/HttpUtils';
import RNFetchBlob from 'rn-fetch-blob';

class MenuService {
  async barcodeRead(barcode, cbSuccess, cbError) {
    const params = await httpUtils.getHTTPParams();
    let url = httpUtils.addAuth(httpUtils.barcodeRead(), params);
    url = url.concat('&input_text=', barcode);
    console.log('[MenuService==> ', url);
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

  async subscription(cbSuccess, cbError) {
    const params = await httpUtils.getHTTPParams();
    const url = httpUtils.addAuth(httpUtils.subscription(), params);
    console.log('[MenuService==> ', url);
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

  read(params, cbSuccess, cbError) {
    const url = httpUtils.read();
    const myHeaders = new Headers();
    myHeaders.append('Accept', 'application/json');
    myHeaders.append('Content-Type', 'multipart/form-data');
    myHeaders.append(
      'cmd',
      ' --cmd=OG-read --user=' +
        params.email +
        ' --pass=' +
        params.password +
        ' --session_id=' +
        params.session_id +
        ' --device_id=' +
        params.device_id +
        ' --lang=' +
        params.lang +
        ' --input_file=' +
        '/tmp/' +
        params.inputfile,
    );
    myHeaders.append('filelocation', '/tmp/' + params.inputfile);
    RNFetchBlob.config({
      fileCache: false,
      path: `${RNFetchBlob.fs.dirs.DocumentDir}/audio.mp3`,
    })
      .fetch(
        'post',
        url,
        {
          'Content-Type': 'multipart/form-data',
          cmd:
            ' --cmd=OG-read --user=' +
            params.email +
            ' --pass=' +
            params.password +
            ' --session_id=' +
            params.session_id +
            ' --device_id=' +
            params.device_id +
            ' --lang=' +
            params.lang +
            ' --input_file=' +
            '/tmp/' +
            params.inputfile,
          filelocation: '/tmp/' + params.inputfile,
        },
        [
          {
            name: '',
            filename: params.inputfile,
            data: RNFetchBlob.wrap(params.path),
          },
        ],
      )
      .then((res) => {
        console.log('The file saved to ', res);
        if (res.respInfo.status === 200) {
          cbSuccess(res.data);
        }
      })
      .catch((error) => {
        console.log('error=', error);
        cbError(error);
      });
  }

  registerCall(params, cbSuccess, cbError) {
    let url = httpUtils.addAuth(httpUtils.notify(), params);
    url = url.concat(
      '&action=start_call',
      '&called_party=',
      params.called_party,
    );
    console.log('[MenuService==> ', url);
    return fetch(url, {
      method: 'POST',
      headers: httpUtils.getHeaders(),
    })
      .then((response) => {
        return response.text();
      })
      .then((text) => {
        console.log('[MenuService==> ', text);
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

  endCall(params, cbSuccess, cbError) {
    let url = httpUtils.addAuth(httpUtils.notify(), params);
    url = url.concat(
      '&action=end_call',
      '&called_party=',
      params.called_party,
      '&dest_ip=',
      params.dest_ip || '',
    );
    console.log('[MenuService==> ', url);
    return fetch(url, {
      method: 'POST',
      headers: httpUtils.getHeaders(),
    })
      .then((response) => {
        return response.text();
      })
      .then((text) => {
        console.log('[MenuService==> ', text);
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

  getCallHistory(params, cbSuccess, cbError) {
    let url = httpUtils.addAuth(httpUtils.notify(), params);
    url = url.concat('&action=call_hist');
    console.log('[MenuService==> ', url);
    return fetch(url, {
      method: 'POST',
      headers: httpUtils.getHeaders(),
    })
      .then((response) => {
        return response.json();
      })
      .then((text) => {
        console.log('[MenuService==> ', text);
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

  readNotification(params, cbSuccess, cbError) {
    let url = httpUtils.addAuth(httpUtils.notify(), params);
    url = url.concat(
      '&action=notification_read',
      '&notif_id=',
      params.notif_id,
    );
    console.log('[MenuService==> ', url);
    return fetch(url, {
      method: 'POST',
      headers: httpUtils.getHeaders(),
    })
      .then((response) => {
        return response.text();
      })
      .then((text) => {
        console.log('[MenuService==> ', text);
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

  createNotification(params, cbSuccess, cbError) {
    let url = httpUtils.addAuth(httpUtils.notify(), params);
    url = url.concat(
      '&action=create_notification',
      '&type=',
      params.type,
      '&message=',
      params.message,
      '&token=',
      params.token,
    );
    console.log('[MenuService==> ', url);
    return fetch(url, {
      method: 'POST',
      headers: httpUtils.getHeaders(),
    })
      .then((response) => {
        return response.text();
      })
      .then((text) => {
        console.log('[MenuService==> ', text);
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
}

export const menuservice = new MenuService();
