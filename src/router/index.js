import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import RobotList from "@/components/RobotList.vue"

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/robots',
    name: "Robots",
    component: RobotList
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
