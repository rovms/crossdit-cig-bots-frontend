<template>
  <v-container>
    <v-btn :disabled="!mapView" class="mry-1" @click="mapView = !mapView">
      <v-icon>mdi-table-large</v-icon>
    </v-btn>
    <v-btn :disabled="mapView" class="mry-1" @click="mapView = !mapView">
      <v-icon>mdi-google-maps</v-icon>
    </v-btn>
    <v-card v-if="!mapView">
      <v-card-title>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
        <v-spacer></v-spacer>
        <v-btn
          v-if="selected && selected.length === 1"
          color="primary"
          dark
          class="mb-2"
          :to="{ name: 'RobotDetails', params: { robotId: selected[0].id } }"
        >
          Details
        </v-btn>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="robots"
        :search="search"
        v-model="selected"
        item-key="id"
        show-select
        hide-default-footer
      >
      </v-data-table>
    </v-card>
    <v-card v-if="mapView">
      <div style="height: 750px;">
        <LMap ref="robotmap" class="mymap" :zoom="zoom" :center="center" @ready="mapReady">
          <LTileLayer :url="url"></LTileLayer>
          <!-- <LMovingMarker :lat-lng="testRobot" :duration="duration" :icon="icon" @click="hello(r)"></LMovingMarker> -->
        </LMap>
      </div>
    </v-card>
  </v-container>
</template>

<script>
import axios from "axios";
import authHeader from "@/auth/authHeader";
import L from "leaflet";
import { LMap, LTileLayer } from "vue2-leaflet";

export default {
  components: {
    LMap,
    LTileLayer,
  },

  data() {
    return {
      robots: [],
      search: "",
      selected: [],

      mapView: true,

      testRobot: L.latLng(55.66071, 12.6024),

      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      zoom: 13,
      bounds: null,
      center: [55.66071, 12.6024],
      map: null,

      duration: 2000,

      headers: [
        {
          text: "ID",
          value: "id",
        },
        { text: "Energy used (kWh)", value: "energyUsed" },
        { text: "Trash (%)", value: "trashLevel" },
        { text: "Status", value: "status" },
        { text: "Assigned", value: "engineer.name" },
        { text: "Oil", value: "oil" },
        { text: "Camera", value: "camera" },
        { text: "Wheels", value: "wheels" },
      ],
    };
  },
  created() {
    this.fetchRobots();
  },

  // mounted() {
  //   this.map = L.map(this.$refs["mapElement"]).setView([51.505, 12.09], 13);
  //   L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  //     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  //   }).addTo(this.map);
  //   this.initilizedMap = true;
  // },

  methods: {
    mapReady() {
      this.map = this.$refs.robotmap.mapObject;
    },

    fetchRobots() {
      axios
        .get("http://localhost:5000/api/robot", { headers: authHeader() })
        .then((response) => {
          this.robots = response.data;
        })
        .catch((error) => {
          alert(error);
        });
    },

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

<style scoped>
.mymap {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}
</style>
