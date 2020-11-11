<template>
  <div>
    <v-btn :disabled="!mapView" class="my-2 mr-1" @click="mapView = !mapView">
      <v-icon>mdi-table-large</v-icon>
    </v-btn>
    <v-btn :disabled="mapView" class="mry-2" @click="mapView = !mapView">
      <v-icon>mdi-google-maps</v-icon>
    </v-btn>
    <v-tooltip right>
      <template v-slot:activator="{ on, attrs }">
        <v-icon v-if="mapView" class="ml-16" color="orange" dark v-bind="attrs" v-on="on">
          mdi-information-outline
        </v-icon>
      </template>
      <span>Click on marker and then on map to send it somewhere else.</span>
    </v-tooltip>
    <v-btn v-if="selectedOnMap !== null" class="ml-16 mr-2" color="orange">
      <v-icon class="mr-3">mdi-robot</v-icon> {{ selectedRobotOnMapRef }}
    </v-btn>
    <v-btn v-if="selectedOnMap !== null" disabled>
      Click on map to set robot's target position.
    </v-btn>

    <v-card v-if="!mapView">
      <v-card-title>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
        <v-spacer></v-spacer>
        <!-- <v-btn
          :disabled="!(selected && selected.length === 1)"
          color="primary"
          dark
          class="mb-2"
          @click="assignEngineerDialog = true"
          outlined
        >
          Assign contact
        </v-btn> -->
        <!-- <v-btn
          text
          :disabled="!(selected && selected.length === 1)"
          color="primary"
          dark
          class="mb-2"
          :to="{ name: 'RobotDetails', params: { robotId: selected[0] ? selected[0]._id : 'fake' } }"
        >
          Details
        </v-btn> -->
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
        <template v-slot:[`item.wheels`]="{ item }">
          <div :class="item.wheels !== 'Ok' ? 'red--text' : ''">{{ item.wheels }}</div>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn small :to="{ name: 'RobotDetails', params: { robotId: item ? item._id : 'fake' } }">
            <v-icon small class="mr-2"> mdi-dots-horizontal</v-icon>Details
          </v-btn>
        </template>
        <template v-slot:no-data>
          <v-btn color="primary" @click="initialize">
            Reset
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
    <v-card v-if="mapView">
      <div style="height: 800px;">
        <LMap ref="robotmap" class="mymap" :zoom="zoom" :center="center" @ready="mapReady" @click="moveRobot">
          <LTileLayer :url="url"></LTileLayer>
          <div v-for="(r, i) in robots" :key="i">
            <LMovingMarker
              ref="movingMarker"
              :lat-lng="r.latlng"
              :duration="duration"
              :icon="icon"
              @click="selectRobot(i)"
            ></LMovingMarker>
          </div>
        </LMap>
      </div>
    </v-card>
    <v-dialog v-model="assignEngineerDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Notify company</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-select
              v-model="selectedEngineer"
              outlined
              :items="engineerOptions"
              label="Contact"
              item-text="name"
              item-value="_id"
            ></v-select>
            <v-textarea outlined label="Additional information" v-model="notifyReason"></v-textarea>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="assignEngineerDialog = false">
            Close
          </v-btn>
          <v-btn color="blue darken-1" text @click="pickup">
            Save & Send notification
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios";
import authHeader from "@/auth/authHeader";
import L from "leaflet";
import { LMap, LTileLayer } from "vue2-leaflet";
import LMovingMarker from "vue2-leaflet-movingmarker";
import distance from "euclidean-distance";

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
      assignEngineerDialog: false,
      selectedEngineer: "",
      icon,
      notifyReasonDetail: "",
      engineerOptions: ["Engineer 1", "Company X"],

      search: "",
      selected: [],

      mapView: true,

      testRobot: L.latLng(55.66071, 12.6024),

      /**
     *
     * DEV
     *
      robots: [
        { id: "RF981-1", latlng: L.latLng(55.61071, 12.6124) },
        { id: "RF981-2", latlng: L.latLng(55.63171, 12.6224) },
        { id: "RF981-3", latlng: L.latLng(55.66071, 12.6324) },
        { id: "RF981-4", latlng: L.latLng(55.66261, 12.6014) },
        { id: "RF981-5", latlng: L.latLng(55.66071, 12.6044) },
        { id: "RF981-6", latlng: L.latLng(55.68071, 12.6054) },
        { id: "RF981-7", latlng: L.latLng(55.65061, 12.6184) },
      ],
      */

      robots: [],

      selectedOnMap: null,

      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      zoom: 13,
      bounds: null,
      center: [55.66071, 12.6024],
      map: null,

      duration: 2000,
      speed: 10000,

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
        { text: "Actions", value: "actions", sortable: false },
      ],
    };
  },

  methods: {
    pickup() {
      axios
        .post(
          "http://localhost:5000/api/robot/pickup",
          {
            robotId: this.selected[0]._id,
            engineerId: this.selectedEngineer,
          },
          { headers: authHeader() }
        )
        .then((response) => {
          console.log(response);
          if (response.status === 200) console.log("ok");
        })
        .catch((error) => {
          console.log(error);
          alert(error);
        });
    },

    mapReady() {
      this.map = this.$refs.robotmap.mapObject;
    },

    moveRobot(event) {
      if (this.selectedOnMap && this.selectedOnMap.reference) {
        const current = this.selectedOnMap.reference;
        const dist = distance([event.latlng.lat, event.latlng.lng], [current._latlng.lat, current._latlng.lng]);
        current.slideTo(event.latlng, {
          duration: 10000000 * dist,
          keepAtCenter: false,
        });
        this.selectedOnMap = null;
      }
    },

    selectRobot(i) {
      this.selectedOnMap = { reference: this.$refs.movingMarker[i].mapObject, index: i };
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
        .catch((error) => alert(error));
    },

    fetchEngineers() {
      axios
        .get("http://localhost:5000/api/engineer")
        .then((response) => {
          this.engineerOptions = response.data;
        })
        .catch((error) => alert(error));
    },
  },

  created() {
    this.fetchRobots();
    this.fetchEngineers();
  },

  computed: {
    selectedRobotOnMapRef() {
      if (this.selectedOnMap !== null) {
        return this.robots[this.selectedOnMap.index].id;
      }
      return null;
    },

    notifyReason() {
      if (this.selected && this.selected[0]) {
        const robot = this.selected[0];
        console.log(robot);
        let errorMessage = "";
        if (robot.wheels !== "Ok") errorMessage += robot.wheels + "\n";
        if (robot.oil !== "Ok") errorMessage += robot.oil + "\n";
        if (robot.camera !== "Ok") errorMessage += robot.camera + "\n";
        return errorMessage + "\n\n" + this.notifyReasonDetail;
      }
      return "";
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
