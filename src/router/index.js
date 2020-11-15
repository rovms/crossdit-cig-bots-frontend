import Vue from "vue";
import VueRouter from "vue-router";
import RobotsOverview from "@/components/RobotsOverview.vue";
import RobotDetails from "@/components/RobotDetails.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "RobotsOverview",
    component: RobotsOverview,
  },
  {
    path: "/:robotId",
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
