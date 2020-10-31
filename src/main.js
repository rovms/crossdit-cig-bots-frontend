import Vue from "vue";
import App from "./App.vue";
import axios from "axios";
import VueAxios from "vue-axios";
import vuetify from "./plugins/vuetify";
import router from "./router";
import * as VueGoogleMaps from "vue2-google-maps";

Vue.use(VueGoogleMaps, {
  load: {
    key: "AIzaSyD0hqCUKkcBOyypNAqiOvFqaQShO0FWhys",
    libraries: "places", // This is required if you use the Autocomplete plugin
  },
});

Vue.config.productionTip = false;

Vue.use(VueAxios, axios);

Vue.use(require("vue-moment"));

new Vue({
  vuetify,
  router,
  render: (h) => h(App),
}).$mount("#app");
