import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/project/:id',
    name: 'project',
    component: () => import(/* webpackChunkName: "Projects" */ '../views/Project.vue')
  },
  {
    path: '/project',
    name: 'projectHome',
    component: () => import(/* webpackChunkName: "Projects" */ '../views/Project.vue')
  },
  {
    path: '/preview',
    name: 'preview',
    component: () => import(/* webpackChunkName: "Projects" */ '../views/XlsxDemo.vue')
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
