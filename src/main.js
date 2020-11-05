import Vue from "vue";
import App from "./App.vue";
import axios from "axios";
import VueAxios from "vue-axios";
import vuetify from "./plugins/vuetify";
import router from "./router";
import "leaflet/dist/leaflet.css";
// import "./MovingMarker.js"

import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

Vue.config.productionTip = false;

Vue.use(VueAxios, axios);

Vue.use(require("vue-moment"));

new Vue({
  vuetify,
  router,
  render: (h) => h(App),
}).$mount("#app");
