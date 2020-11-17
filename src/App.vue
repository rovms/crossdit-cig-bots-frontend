<template>
  <v-app>
    <v-app-bar dense app color="primary" dark>
      <v-toolbar-title @click="$router.push('/')" style="cursor:pointer">
        Bot-Service <strong> CPH </strong>
      </v-toolbar-title>
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
};
</script>
