<template>
  <v-app>
    <v-app-bar dense app color="primary" dark>
      <v-toolbar-title>CIG-ROBOTS</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>
    <v-main>
      <router-view />
      <router-link :to="{ name: 'Robots' }" />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "App",

  data: () => ({
    items: ["123", "124"],
  }),
};
</script>
