import AsyncStorage from '@react-native-community/async-storage';
import _ from 'lodash';

const storageNamespace = '@armroom';

const getStorageKey = key => `${storageNamespace}:${key}`;

const setValue = (key, value) => AsyncStorage.setItem(getStorageKey(key), value);
const setObject = (key, object) => AsyncStorage.setItem(getStorageKey(key), JSON.stringify(object));

const getValue = key => AsyncStorage.getItem(getStorageKey(key));
const getObject = key => (
    new Promise((resolve, reject) => {
        AsyncStorage.getItem(getStorageKey(key), (err, res) => {
            if (err) {
                reject(err);
                return;
            }
            const object = JSON.parse(res);
            resolve(object);
        });
    })
);

const remove = key => AsyncStorage.removeItem(getStorageKey(key));

const hasKey = key => new Promise((resolve, reject) => {
    AsyncStorage.getAllKeys((err, keys) => {
        if (err) {
            reject(err);
            return;
        }
        resolve(_.includes(keys, getStorageKey(key)));
    });
});

export default {
    setValue,
    setObject,
    getValue,
    getObject,
    hasKey,
    remove,
};
