import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/index', 
    name: 'Index', 
    component: () => import(`./pages/Index/Index.vue`)
  },
  { 
    path: '/mindMap/edit',
    name: 'MindMapEdit',
    component: () => import(`./pages/Edit/Index.vue`) 
  },
  {
    path: '/',
    name: 'MindMapList',
    component: () => import(`./pages/Mind/Index.vue`)
  }
]

const router = new VueRouter({
  routes
})

export default router
