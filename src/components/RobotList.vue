<template>
  <v-container>
    <v-card v-for="robot in robots" :key="robot.id" class="ma-1">
      <v-card-title class="pb-0">
        {{ robot.name }}
      </v-card-title>
      <v-list class="transparent">
        <v-list-item>
          <v-list-item-title>Energy used</v-list-item-title>
          <v-list-item-icon>
            <v-icon>TODO</v-icon>
          </v-list-item-icon>
          <v-list-item-subtitle class="text-right">
            {{ robot.energyUsed || 0 }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn
          color="primary"
          :to="{ name: 'RobotDetails', params: { robotId: robot.id } }"
          >Details</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      robots: [],
    };
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
