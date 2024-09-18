import exampleData from 'simple-mind-map/example/exampleData'
import { simpleDeepClone } from 'simple-mind-map/src/utils'
import Vue from 'vue'
import {getRequest,postJsonRequest} from "@/api/api";
import store from "@/store";

const SIMPLE_MIND_MAP_DATA = 'SIMPLE_MIND_MAP_DATA'
const SIMPLE_MIND_MAP_LANG = 'SIMPLE_MIND_MAP_LANG'
const SIMPLE_MIND_MAP_LOCAL_CONFIG = 'SIMPLE_MIND_MAP_LOCAL_CONFIG'

let mindMapData = null

//克隆思维导图数据，去除激活状态
const copyMindMapTreeData = (tree, root) => {
  if (!root) return null
  tree.data = simpleDeepClone(root.data)
  // tree.data.isActive = false
  tree.children = []
  if (root.children && root.children.length > 0) {
    root.children.forEach((item, index) => {
      tree.children[index] = copyMindMapTreeData({}, item)
    })
  }
  return tree
}

//获取缓存的思维导图数据
export const getData = (articleId) => {
  console.log("getData",articleId)
  return new Promise((resolve) => {
    setTimeout(() => {
      getRequest('/blog/content/detail?articleId=' + articleId).then(res => {
        let data = res.data
        if (data.code === 200) {
          mindMapData = data.data
          try {
            if(mindMapData.content){
              mindMapData.content = JSON.parse(mindMapData.content)
            }else {
              mindMapData.content = simpleDeepClone(exampleData)
            }
            store.commit('setArticleInfo', {
              articleId: mindMapData.articleId,
              title: mindMapData.title,
              contentId: mindMapData.contentId,
            })
          } catch (error) {
            resolve(mindMapData)
          }
        }
        resolve(mindMapData)
      })
    }, 200)
  })
}

//存储思维导图数据
export const storeData = data => {
  console.log("storeData")
  mindMapData.content.root = copyMindMapTreeData({}, data)
  storeDataThrottled()
}

export const saveData = () => {
  console.log("saveData")
  try {
    let data = {
      ...mindMapData,
      ...store.state.articleInfo,
      content: JSON.stringify(mindMapData.content)
    }
    postJsonRequest('/blog/content/save', data).then(res => {
      if (res.data.code === 200 ) {
        //新建第一次保存要刷新下contentId
        if(!store.state.articleInfo.contentId){
          store.commit('setArticleInfo', {
            contentId: res.data.data,
          })
        }
        store.commit('setLastSaveTime', new Date().toLocaleString())
      }else {
        Vue.prototype.$message({type: 'error', message: '自动保存失败：'+res.data.message});
      }
    })
    Vue.prototype.$bus.$emit('write_local_file', mindMapData)
    let dataStr = JSON.stringify(mindMapData)
    localStorage.setItem(SIMPLE_MIND_MAP_DATA, dataStr)
  } catch (error) {
    console.log(error)
  }
}

//节流函数
export const throttle=(fn, delay) => {
  // 时间戳
  let timeTwo = 0
  // 定时器
  let timeThree = null;
  return function() {
    let context = this;
    let args = arguments;
    let now = new Date()
    let wait = delay - (now - timeTwo)
    clearTimeout(timeThree)
    if (wait <= 0) {
      fn.apply(context, args);
      timeTwo = new Date();
    } else {
      timeThree = setTimeout(function() {
        fn.apply(context, args);
      }, delay)
    }
  }
}

export const storeDataThrottled = throttle(saveData, 30000);

//存储思维导图配置数据
export const storeConfig = config => {
  console.log("storeConfig")
  mindMapData.content = {
    ...mindMapData.content,
    ...config
  }
  storeDataThrottled()
}

/**
 * 存储语言
 */
export const storeLang = lang => {
  if (window.takeOverApp) {
    window.takeOverAppMethods.saveLanguage(lang)
    return
  }
  localStorage.setItem(SIMPLE_MIND_MAP_LANG, lang)
}

/**
 * 获取存储的语言
 */
export const getLang = () => {
  if (window.takeOverApp) {
    return window.takeOverAppMethods.getLanguage() || 'zh'
  }
  let lang = localStorage.getItem(SIMPLE_MIND_MAP_LANG)
  if (lang) {
    return lang
  }
  storeLang('zh')
  return 'zh'
}

/**
 * 存储本地配置
 */
export const storeLocalConfig = config => {
  if (window.takeOverApp) {
    return window.takeOverAppMethods.saveLocalConfig(config)
  }
  localStorage.setItem(SIMPLE_MIND_MAP_LOCAL_CONFIG, JSON.stringify(config))
}

/**
 * 获取本地配置
 */
export const getLocalConfig = () => {
  if (window.takeOverApp) {
    return window.takeOverAppMethods.getLocalConfig()
  }
  let config = localStorage.getItem(SIMPLE_MIND_MAP_LOCAL_CONFIG)
  if (config) {
    return JSON.parse(config)
  }
  return null
}
