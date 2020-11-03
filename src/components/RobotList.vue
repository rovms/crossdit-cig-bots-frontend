<template>
  <v-container>
    <v-card v-for="robot in robots" :key="robot.id" class="ma-1">
      <v-card-title class="pb-0"> ID: {{ robot.id }} </v-card-title>
      <v-list class="transparent">
        <v-list-item>
          <v-list-item-title>Battery</v-list-item-title>
          <v-list-item-icon>
            <v-icon :color="batteryColor(robot.id)">{{ batteryIcon(robot.id) }}</v-icon>
          </v-list-item-icon>
          <v-list-item-subtitle class="text-right"> {{ robot.batteryLevel || 0 }} % </v-list-item-subtitle>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn color="primary" :to="{ name: 'RobotDetails', params: { robotId: robot.id } }">Details</v-btn>
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

  methods: {
    batteryColor(robotId) {
      const robot = this.robots.find((r) => r.id === robotId);
      if (!robot) return "grey";
      const batteryLevel = robot.batteryLevel;
      if (batteryLevel > 70) return "green";
      if (batteryLevel > 30) return "yellow";
      else return "red";
    },

    batteryIcon(robotId) {
      const robot = this.robots.find((r) => r.id === robotId);
      if (!robot) return "mdi-battery";
      const batteryLevel = robot.batteryLevel;
      if (batteryLevel > 70) return "mdi-battery";
      if (batteryLevel > 30) return "mdi-battery-50";
      else return "mdi-battery-20";
    },
  },
};
</script>
()

<style></style>
