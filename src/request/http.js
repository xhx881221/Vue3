/*
 * @Description: axios封装，用于请求拦截，相应拦截，错误统一处理
 * @Author: xhx
 * @Date: 2019-08-05 10:07:54
 * @LastEditTime: 2019-08-09 17:01:52
 * @LastEditors: Please set LastEditors
 */
import axios from 'axios';
import store from '../store/index';
import { ElMessage } from 'element-plus';
import zh from "../locales/zh";
import en from "../locales/en";
let messageCanAppear = true;

const toLogin = () => {
    sessionStorage.clear();
    localStorage.clear();
}

const errorHandle = (status, message) => {
    switch (status) {
        case 444:
            toLogin();
            break;
        case 500:
            if (!messageCanAppear) {
                break;
            }
            messageCanAppear = false;
            ElMessage({
                message: (window.localStorage.getItem("localeLanguage") === "zh" ? zh : en).Message['An Exception Occurred On Server, Please Try Again Later'],
                type: 'error',
                onClose: function() {
                    messageCanAppear = true;
                }
            });
            break;
        default:
            if (!messageCanAppear) {
                break;
            }
            messageCanAppear = false;
            ElMessage({
                message: message,
                type: 'error',
                onClose: function() {
                    messageCanAppear = true;
                }
            });
            break;
    }
}

//创建axios实例
let AXIOS_INSTANCE = axios.create();
let timeout;
AXIOS_INSTANCE.defaults.timeout = 60000;
//设置post请求头
AXIOS_INSTANCE.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
/*
    AXIOS_INSTANCE.defaults.headers = {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
    };
*/
/* 
 * 请求拦截器
 */
AXIOS_INSTANCE.interceptors.request.use(
    config => {
        const token = localStorage.getItem("token");
        token && (config.headers.Authorization = token);
        store.commit('setLoadingFlag', true);
        timeout = setTimeout(function() {
            if (store.state.authorization.loadingFlag) {
                store.dispatch('setLoadingAsync', true);
            }
        }, 500)
        return config;
    },
    error => {
        return Promise.reject(error);
    }
)

AXIOS_INSTANCE.interceptors.response.use(
    response => {
        clearTimeout(timeout);
        store.commit('setLoading', false);
        store.commit('setLoadingFlag', false);
        if (response.status === 200 && response.data.success) {
            return Promise.resolve(response.data);
        } else if (response.status === 200 && !response.data.success) {
            if (!messageCanAppear) {
                return Promise.reject(response);
            }
            messageCanAppear = false;
            ElMessage({
                message: response.data.message,
                type: 'error',
                onClose: function() {
                    messageCanAppear = true;
                }
            });
            return Promise.reject(response);
        } else {
            console.log(response.data.message);
        }
    },
    error => {
        clearTimeout(timeout);
        const { response } = error;
        store.commit('setLoading', false);
        store.commit('setLoadingFlag', false);
        if (response && response.status === 600) {
            errorHandle(response.status, response.data.errmsg);
            console.log(response.status);
        }  else if (response) {
            errorHandle(response.status, response.data.message);
            console.log(response.status);
        } else {
            if (!window.navigator.onLine) {
                store.commit('changeNetwork', false);
            } else {
                console.log(response.status);
            }
        }
        return Promise.reject(response);
    }
)

export { AXIOS_INSTANCE };