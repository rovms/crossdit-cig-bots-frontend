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
    <div style="height: 350px;">
      <LMap
        style="height: 100%; width: 100%"
        ref="robotmap"
        :zoom="zoom"
        :center="[55.66071, 12.6024]"
        @ready="mapReady"
      >
        <LTileLayer :url="url"></LTileLayer>
        <div v-if="robots && robots[0] && robots[0].latlng">
          <div v-for="(r, i) in robots" :key="i">
            <LMovingMarker
              :ref="'robot' + i"
              :lat-lng="r.latlng"
              :duration="duration"
              :icon="icon"
              @click="hello(r)"
            ></LMovingMarker>
            <LCircle :lat-lng="r.latlng" :radius="r.radius || 300" color="red">
              <LPopup>
                Area of: <strong> {{ r.name }}</strong></LPopup
              >
            </LCircle>
          </div>
        </div>
      </LMap>
    </div>
    <div v-for="(robot, id) in robots" :key="id">{{ robot.latlng }}</div>
  </v-container>
</template>

<script>
import axios from "axios";
import L from "leaflet";
import { LMap, LTileLayer, LCircle, LPopup } from "vue2-leaflet";
import LMovingMarker from "vue2-leaflet-movingmarker";

const icon = L.icon({
  iconUrl: "https://s3-eu-west-1.amazonaws.com/ct-documents/emails/A-static.png",
  iconSize: [21, 31],
  iconAnchor: [10.5, 31],
  popupAnchor: [4, -25],
});

const locations = [];
for (let i = 0; i < 10; i++) {
  locations.push({
    id: i,
    latlng: L.latLng(rand(55.309735), rand(14.901958)),
    text: "Moving Marker #" + i,
    radius: Math.random() * 100 + 4500,
  });
}

function rand(n) {
  const max = n + 0.001;
  const min = n - 0.001;
  return Math.random() * (max - min) + min;
}

export default {
  components: { LMap, LTileLayer, LMovingMarker, LCircle, LPopup },

  data() {
    return {
      robots: [],

      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      zoom: 11,
      bounds: null,

      icon,

      duration: 5000,
      interval: null,
      map: null,

      locations,
    };
  },
  mounted() {
    this.fetchRobots();
  },

  methods: {
    hello(robot) {
      console.log(robot);
      L.popup()
        .setLatLng(L.latLng(robot.latlng.lat + 0.01, robot.latlng.lng))
        .setContent(robot.name)
        .openOn(this.map);

      console.log(this.$refs.robot1.mapObject);
    },

    mapReady() {
      this.map = this.$refs.robotmap.mapObject;
    },

    fetchRobots() {
      axios
        .get("http://localhost:5000/api/robot")
        .then((response) => {
          this.robots = response.data;
          this.robots.forEach((r) => {
            r.latlng = L.latLng(r.position[0], r.position[1]);
          });
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

  watch: {
    duration: {
      handler(value, oldValue) {
        if (value !== oldValue) {
          clearInterval(this.interval);
          if (this.robots && this.robots[0]) {
            const setRandomLatLng = () => {
              this.robots.forEach((r) => {
                r.latlng = L.latLng(rand(r.position[0]), rand(r.position[1]));
              });
            };
            this.interval = setInterval(() => {
              setRandomLatLng();
            }, value);
            setRandomLatLng();
          }
        }
      },
      immediate: true,
    },
  },
};
</script>

<style></style>
