import axios from "axios";
import qs from "qs";
import Vue from "vue";
import router from "../router";


export const baseURL= 'http://localhost:8139';

export const postRequest = (url, params) => {
  return axios({
    method: 'post',
    url: url,
    data: qs.stringify(params, { indices: false })
  });
};

export const postJsonRequest = (url, params) => {
  return axios({
    method: 'post',
    url: url,
    contentType: 'application/json; charset=utf-8',
    data: params
  });
};

export const putRequest = (url, params) => {
  return axios({
    method: 'put',
    url: url,
    data: params
  });
};

export const getRequest = (url,params) => {
  return axios.get(url, {
    params: params
  })
};

export const deleteRequest = (url,params) => {
  return axios({
    method: 'delete',
    url: url,
    data: params
  });
};

export const uploadFileRequest = (url, params) => {
  return axios({
    method: 'post',
    url: url,
    data: params,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

axios.defaults.baseURL = baseURL;
//设置post的默认请求头
axios.defaults.crossDomain = true;
// axios.defaults.headers.get['Content-Type']='application/x-www-form-urlencoded';


//配置发送请求前的拦截器
axios.interceptors.request.use(
  config => {
    //非GET请求将数据转换为json
    // if (config.method.toUpperCase() !== "GET") {
    //   config.data = qs.stringify(config.data, { indices: false });
    // }
    //非登录请求需携带token
    if (config.url.indexOf("/login") === -1) {
      console.log(localStorage.getItem("authorized-token"))
      config.headers.Authorization = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxX3RydWVfemp4aWFuIiwiZXhwIjoxNzE1ODQzMDE2LCJpYXQiOjE3MTUyMzgyMTZ9.X-ZfDhZxKwv1AhTMx1r9f8XqOw1CZwQTT5NPQO-k4Xo";
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  });

// 响应拦截
axios.interceptors.response.use(
  res => {
    return res;
  },
  error => {
    if (error) {
      // 请求配置发生的错误
      if (!error.response) {
        return;
      }

      // 提示错误信息
      Vue.prototype.$message.error("Request Error："+error.response.statusText);

      //错误状态处理
      const status = error.response.status;
      if (status === 401) {
        router.push('/')
      }else if(status === 403){
        router.push('/403');
      }else if(status ===503){
        Vue.prototype.$message.error("服务器不可用@_@！");
      }else if (status >= 404 && status < 422) {
        router.push('/404')
      }

    }
    return Promise.reject(error);
  }
);


