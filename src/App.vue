<template>
  <v-app>
    <v-app-bar dense app color="primary" dark>
      <v-toolbar-title>Trash / CPH</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>
    <v-main class="mainview">
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
// import router from "./router";
// import axios from "axios";
export default {
  name: "App",

  data: () => ({
    items: ["123", "124"],
  }),

  created() {
    // axios.interceptors.response.use(undefined, function(err) {
    //   if (err.response.status === 401) {
    //     router.push({ name: "Home" });
    //     return;
    //   }
    //   return Promise.reject(err);
    // });
  },
};
</script>
