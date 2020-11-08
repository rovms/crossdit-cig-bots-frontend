import Vue from "vue";
import VueRouter from "vue-router";
import RobotList from "@/components/RobotList.vue";
import RobotList2 from "@/components/RobotList2.vue";
import RobotDetails from "@/components/RobotDetails.vue";
import Home from "@/components/Home.vue";

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
  },
  {
    path: "/robots2",
    name: "Robots",
    component: RobotList2,
  },
  {
    path: "/robots/:robotId",
    name: "RobotDetails",
    component: RobotDetails,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
