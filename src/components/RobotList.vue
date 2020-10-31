<template>
  <v-container>
    <v-card v-for="robot in robots" :key="robot"></v-card>
  </v-container>
</template>

<script>
import axios from "axios";
export default {
  data() {
    [];
  },
  created() {
    console.log("created");
    axios
      .get("http://localhost:5000/api/robot")
      .then((response) => {
        this.robots = response.data;
      })
      .catch((error) => {
        alert(error);
      });
  },
};
</script>
()

<style></style>
