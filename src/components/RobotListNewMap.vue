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
          <div v-for="(r, i) in robots" :key="i">
            <LMovingMarker
              ref="movingMarker"
              :lat-lng="r"
              :duration="duration"
              :icon="icon"
              @click="hello($event, i)"
            ></LMovingMarker>
          </div>
        </LMap>
      </div>
    </v-card>
  </v-container>
</template>

<script>
import L from "leaflet";
import { LMap, LTileLayer } from "vue2-leaflet";
import LMovingMarker from "vue2-leaflet-movingmarker";

const icon = L.icon({
  iconUrl: "https://s3-eu-west-1.amazonaws.com/ct-documents/emails/A-static.png",
  iconSize: [21, 31],
  iconAnchor: [10.5, 31],
  popupAnchor: [4, -25],
});

export default {
  components: {
    LMap,
    LTileLayer,
    LMovingMarker,
  },

  data() {
    return {
      icon,

      search: "",
      selected: [],

      mapView: true,

      testRobot: L.latLng(55.66071, 12.6024),

      robots: [
        L.latLng(55.61071, 12.6124),
        L.latLng(55.63171, 12.6224),
        L.latLng(55.66071, 12.6324),
        L.latLng(55.66261, 12.6014),
        L.latLng(55.66071, 12.6044),
        L.latLng(55.68071, 12.6054),
        L.latLng(55.65061, 12.6184),
      ],

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

  methods: {
    mapReady() {
      this.map = this.$refs.robotmap.mapObject;
    },

    hello(event, i) {
      console.log(event);
      console.log(i);
      this.$refs.movingMarker[2].mapObject.slideTo([55.66071, 12.6135], {
        duration: 10000,
        keepAtCenter: false,
      });
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
