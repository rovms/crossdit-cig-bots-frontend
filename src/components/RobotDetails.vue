<template>
  <v-container>
    {{ robotPosition.latlng }}
    <div style="height: 450px;">
      <LMap id="map" style="height: 100%; width: 100%" :zoom="zoom" :center="initialLocation">
        <LTileLayer :url="url"></LTileLayer>
        <LMovingMarker ref="marker1" :icon="iconR" :lat-lng="robotPosition.latlng" :duration="duration"></LMovingMarker>
        <!-- <LMovingMarker :icon="iconR" :lat-lng="robotPosition2.latlng" :duration="duration"></LMovingMarker> -->
        <!-- <LCircleMarker
          v-for="cigPos in []"
          :key="cigPos.id"
          :lat-lng="cigPos"
          :radius="6"
          color="red"
          @click="move(cigPos)"
        ></LCircleMarker>
        <LMovingMarker
          v-for="l in locations"
          :key="l.id"
          :lat-lng="l"
          :icon="icon"
          :duration="duration"
          @click="move(l)"
        ></LMovingMarker> -->
      </LMap>
    </div>
    <v-btn @click="move()">MOVE</v-btn>
  </v-container>
</template>

<script>
import axios from "axios";
import L from "leaflet";
import { LMap, LTileLayer } from "vue2-leaflet";
import LMovingMarker from "vue2-leaflet-movingmarker";

const icon = L.icon({
  iconUrl: "https://s3-eu-west-1.amazonaws.com/ct-documents/emails/A-static.png",
  iconSize: [21, 31],
  iconAnchor: [10.5, 31],
  popupAnchor: [4, -25],
});

const iconR = L.icon({
  iconUrl: "https://s3-eu-west-1.amazonaws.com/ct-documents/emails/A-static.png",
  iconSize: [30, 41],
  iconAnchor: [15, 41],
  popupAnchor: [4, -25],
});

// function rand(n) {
//   const max = n + 0.01;
//   const min = n - 0.01;
//   return Math.random() * (max - min) + min;
// }

// const locations = [];
// for (let i = 0; i < 10; i++) {
//   locations.push({
//     id: i,
//     latlng: L.latLng(rand(48.8929425), rand(2.3821873)),
//     text: "Moving Marker #" + i,
//   });
// }

const robotPosition = {
  latlng: L.latLng(48.8929425, 2.4821873),
  text: "Moving Marker",
};

const robotPosition2 = {
  latlng: L.latLng(48.8929425, 5.3921873),
  text: "Moving Marker",
};

export default {
  components: {
    LMap,
    LTileLayer,
    // LCircleMarker,
    LMovingMarker,
  },

  data() {
    return {
      // map: null,
      robot: {},
      targetPosition: [],
      cigarettes: [
        [55.6603, 12.6013],
        [55.6604, 12.6014],
        [55.6603, 12.6016],
        [55.6603, 12.6003],
        [55.6606, 12.6011],
      ],

      // robotPosition: [55.6607, 12.6015],
      robotPosition,
      robotPosition2,
      initialLocation: L.latLng(48.8929425, 2.4821873),

      icon,
      iconR,

      interval: null,

      speed: 0.0001,

      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      zoom: 14,
      center: [],
      bounds: null,

      duration: 2000,
    };
  },

  methods: {
    zoomUpdated(zoom) {
      this.zoom = zoom;
    },
    centerUpdated(center) {
      this.center = center;
    },
    boundsUpdated(bounds) {
      this.bounds = bounds;
    },

    move() {
      this.robotPosition.latlng.lat -= 0.001;
    },
  },

  // watch: {
  //   duration: {
  //     handler(value, oldValue) {
  //       if (value !== oldValue) {
  //         clearInterval(this.interval);
  //         const setRandomLatLng = () => {
  //           this.robotPosition.latlng = this.robotPosition2.latlng;
  //         };
  //         this.interval = setInterval(() => {
  //           setRandomLatLng();
  //         }, value);
  //         setRandomLatLng();
  //       }
  //     },
  //     immediate: true,
  //   },
  // },

  created() {
    axios
      .get("http://localhost:5000/api/robot/" + this.$route.params.robotId)
      .then((response) => {
        this.robot = response.data;
        this.center = this.robot.position;
      })
      .catch((error) => {
        alert(error);
      });
  },
};
</script>

<style scoped></style>
