import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/index', 
    name: 'Index', 
    component: () => import(`./pages/Flow/Diagram.vue`)
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
