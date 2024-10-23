import {Platform} from "react-native";
import {enablePromise, openDatabase} from "react-native-sqlite-storage";
import _ from 'lodash';
import Constant from "../constants/constants";
import ApiManager from '../managers/ApiManager';


enablePromise(true);

export const TABLE_USERNAME = "username";
export const COL_ID = "id";
export const COL_USERID = "userid";
export const COL_USERLOGINID = "userloginid";
export const COL_PASSWORD = "userpassword";
export const COL_SCHOOLID = "schoolID";
export const COL_TYPE = "type";
export const COL_VALUE = "value";
export const COL_NAME_FIRST = "name";
export const COL_NAME_LAST = "lastname";
export const COL_SEX = "sex";
export const COL_TOKEN = "token";
export const COL_IMAGE_USER = "imguser";
export const COL_IMAGE_SCHOOL = "imgsch";
export const COL_IMAGE_LOGO = "imglogosch";
export const COL_USERID_MAIN = "mainuserid";
export const COL_NAME_FIRST_EN = "nameen";
export const COL_NAME_LAST_EN = "lastnameen";

export const getDBConnection = async () => {
    if (Platform.OS === 'ios') {
        return openDatabase({name: 'SBData.sqlite3', location: 'default'});
    } else {
        return openDatabase({name: 'SBData.sqlite3', location: 'Shared'});
    }
}

export const createUserTable = async (db) => {
    const query = `CREATE TABLE IF NOT EXISTS ${TABLE_USERNAME}(
                ${COL_ID} INTEGER PRIMARY KEY AUTOINCREMENT, 
                ${COL_USERID} TEXT NOT NULL, 
                ${COL_USERLOGINID} TEXT NOT NULL, 
                ${COL_PASSWORD} TEXT NOT NULL, 
                ${COL_SCHOOLID} TEXT NOT NULL,
                ${COL_TYPE} TEXT NOT NULL,
                ${COL_VALUE} TEXT NOT NULL,
                ${COL_NAME_FIRST} TEXT NOT NULL,
                ${COL_NAME_LAST} TEXT NOT NULL,
                ${COL_SEX} TEXT NOT NULL,
                ${COL_TOKEN} TEXT NOT NULL,
                ${COL_IMAGE_USER} TEXT NOT NULL,
                ${COL_IMAGE_SCHOOL} TEXT NOT NULL,
                ${COL_IMAGE_LOGO} TEXT NOT NULL,
                ${COL_USERID_MAIN} TEXT NOT NULL);`;
    const alter_query = `ALTER TABLE ${TABLE_USERNAME} ADD ${COL_NAME_FIRST_EN} TEXT;`;
    const alter_query1 = `ALTER TABLE ${TABLE_USERNAME} ADD ${COL_NAME_LAST_EN} TEXT;`;
    // const alter_query = `DROP TABLE ${TABLE_USERNAME};`;
    db.transaction(txn => {
        txn.executeSql(query, [],
            () => {
                console.log("create Success");
                txn.executeSql(alter_query, [], () => {
                    console.log("Table success, ", alter_query);
                    txn.executeSql(alter_query1, [], () => {
                        console.log("Table success, ", alter_query1);
                    }, error => {
                        console.log("error Alter Table", error.message);
                    });
                }, error => {
                    console.log("error Alter Table", error.message);
                });
            },
            error => {
                // console.log("error Table", error.message);
            })
    });

    // await db.executeSql(query);
};

export const checkExist = async (userId) => {
    const db = await getDBConnection();
    try {
        var res = false;
        const results = await db.executeSql(`SELECT * FROM ${TABLE_USERNAME} WHERE ${COL_USERID}='${userId}'`);

        if (results.length > 0) {
            if (results[0].rows.length > 0) {
                res = true
            } else {
                res = false
            }
        } else {
            res = false
        }
        return res;
    } catch (error) {
        throw Error('Failed to get checkExist');
    }
}

export const insertUser = async (userID, loginid, password, schoolID, type, value, first_name, last_name, sex, token, img_user, img_school, img_logo, mainUserID, first_name_en = '', last_name_en = '') => {
    const db = await getDBConnection();
    const query = `INSERT INTO ${TABLE_USERNAME}(
      ${COL_USERID},
      ${COL_USERLOGINID},
      ${COL_PASSWORD}, 
      ${COL_SCHOOLID}, 
      ${COL_TYPE}, 
      ${COL_VALUE}, 
      ${COL_NAME_FIRST}, 
      ${COL_NAME_LAST}, 
      ${COL_SEX}, 
      ${COL_TOKEN}, 
      ${COL_IMAGE_USER}, 
      ${COL_IMAGE_SCHOOL}, 
      ${COL_IMAGE_LOGO}, 
      ${COL_USERID_MAIN},
      ${COL_NAME_FIRST_EN}, 
      ${COL_NAME_LAST_EN}
    ) values (
      '${userID}', 
      '${loginid}', 
      '${password}', 
      '${schoolID}', 
      '${type}',
      '${value}',
      '${first_name}',
      '${last_name}',
      '${sex}',
      '${token}',
      '${img_user}',
      '${img_school}',
      '${img_logo}',
      '${mainUserID}',
      "${first_name_en}",
      "${last_name_en}");`;
    return db.executeSql(query);
}

export const getOneUserInfo = async (userId) => {
    const db = await getDBConnection();
    try {
        const results = await db.executeSql(`SELECT * FROM ${TABLE_USERNAME} WHERE ${COL_USERID}=${userId}`);

        let res = undefined;
        if (results.length > 0) {
            res = results[0].rows.item(0);
        }
        return res;
    } catch (error) {
        throw Error('Failed to get getOneUserInfo');
    }
}

export const getAllUserInfo = async () => {
    const db = await getDBConnection();
    try {
        Constant.AddProfiles = [];
        let res = false;
        const query = `SELECT * FROM ${TABLE_USERNAME} GROUP BY ${COL_USERID}`;
        db.transaction(txn => {
            txn.executeSql(query, [],
                (txn, results) => {
                    if (results.rows.length > 0) {
                        for (let i = 0; i < results.rows.length; ++i) {
                            let tempItem = results.rows.item(i);
                            Constant.AddProfiles.push(tempItem);
                        }
                        res = true;
                    }
                },
                error => {
                    console.log("error Table", error.message);
                })
        }, []);
        return res;
    } catch (error) {
        throw Error('Failed to get getAllUserInfo');
    }
}

export const removeUser = async (userId) => {
    const db = await getDBConnection();
    const query = `DELETE FROM ${TABLE_USERNAME} WHERE ${COL_USERID}='${userId}';`;
    return db.executeSql(query);
}

export const updatePassword = async (userId, password) => {
    const db = await getDBConnection();
    const query = `UPDATE ${TABLE_USERNAME}  SET ${COL_PASSWORD} = '${password}' WHERE ${COL_USERID} = '${userId}';`
    return db.executeSql(query);
}

export const updateUserInfo = async (userId, userInfo) => {
    const db = await getDBConnection();
    const query = `UPDATE ${TABLE_USERNAME}  SET
        ${COL_SCHOOLID} = '${userInfo.SchoolId}', 
        ${COL_TYPE} = '${userInfo.Type}',
        ${COL_VALUE} = '${userInfo.Value}',
        ${COL_NAME_FIRST} = '${userInfo.name}',
        ${COL_NAME_LAST} = '${userInfo.lastname}',
        ${COL_SEX} = '${userInfo.sex}',
        ${COL_TOKEN} = '${userInfo.token}',
        ${COL_IMAGE_USER} = '${userInfo.image}',
        ${COL_NAME_FIRST_EN} = '${userInfo.nameEN}',
        ${COL_NAME_LAST_EN} = '${userInfo.lastnameEN}' WHERE ${COL_USERID} = '${userId}';`

    return db.executeSql(query);
}

export const removeAllUser = async () => {
    const db = await getDBConnection();

    // const query = `TRUNCATE TABLE ${TABLE_USERNAME};`;
    const query = `DELETE FROM ${TABLE_USERNAME};`;

    try {
        let res = false;
        db.transaction(txn => {
            txn.executeSql(query, [],
                (txn, results) => {
                    res = true;
                },
                error => {
                    console.log("error TableDelete", error.message);
                })
        }, []);
        return res;
    } catch (error) {
        throw Error('Failed to get getAllUserInfo');
    }
}
