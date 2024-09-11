import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/flow/edit',
    name: 'FlowEdit',
    component: () => import(`./pages/Flow/Index.vue`)
  },
  { 
    path: '/mindMap/edit',
    name: 'MindMapEdit',
    component: () => import(`./pages/Mind/Edit/Index.vue`)
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
