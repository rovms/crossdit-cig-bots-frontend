import Vue from "vue";
import VueRouter from "vue-router";
import RobotList from "@/components/RobotList.vue";
import RobotList2 from "@/components/RobotList2.vue";
import RobotDetails from "@/components/RobotDetails.vue";
import Home from "@/components/Home.vue";
import Login from "@/components/Login.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/robots",
    name: "Robots",
    component: RobotList,
    meta: {
      authRequired: true,
    },
  },
  {
    path: "/robots2",
    name: "Robots2",
    component: RobotList2,
    meta: {
      authRequired: true,
    },
  },
  {
    path: "/robots/:robotId",
    name: "RobotDetails",
    component: RobotDetails,
    meta: {
      authRequired: true,
    },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  const authRequired = to.matched.some((record) => record.meta.authRequired);
  const token = localStorage.getItem("engineer");
  if (!!token || !authRequired) return next();
  return next("/login");
});

export default router;
