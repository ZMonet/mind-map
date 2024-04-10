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
    path: '/', 
    name: 'Edit', 
    component: () => import(`./pages/Edit/Index.vue`) 
  },
]

const router = new VueRouter({
  routes
})

export default router
