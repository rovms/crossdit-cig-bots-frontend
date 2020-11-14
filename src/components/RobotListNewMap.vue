<template>
  <div>
    <v-dialog v-model="eventDialog" max-width="500">
      <v-card v-if="currentEvent">
        <v-card-title>
          <span class="headline mb-5">Assign event [ID: {{ currentEvent.id }}] to robot</span>
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="eventSelectedRobot"
            outlined
            :items="robots"
            label="Robots"
            item-text="id"
            item-value="_id"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="saveScheduledMove" class="float-right ma-3" text color="primary">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar" :timeout="timeout">
      It can't go that far!
      <template v-slot:action="{ attrs }">
        <v-btn color="blue" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <v-btn
      :disabled="tableView"
      class="my-2 mr-1"
      @click="
        {
          mapView = false;
          eventView = false;
          tableView = true;
        }
      "
    >
      <v-icon>mdi-table-large</v-icon>
    </v-btn>
    <v-btn
      :disabled="mapView"
      class="mr-1 my-2"
      @click="
        {
          mapView = true;
          eventView = false;
          tableView = false;
        }
      "
    >
      <v-icon>mdi-google-maps</v-icon>
    </v-btn>
    <v-btn
      :disabled="eventView"
      class="mr-1 my-2"
      @click="
        {
          mapView = false;
          eventView = true;
          tableView = false;
        }
      "
    >
      <v-icon>mdi-calendar-blank-outline</v-icon>
    </v-btn>
    <div v-if="eventView"></div>
    <v-tooltip right>
      <template v-slot:activator="{ on, attrs }">
        <v-icon v-if="mapView" class="ml-16" color="orange" dark v-bind="attrs" v-on="on">
          mdi-information-outline
        </v-icon>
      </template>
      <span>Click on marker (robot) and then on map to send it somewhere else.</span>
    </v-tooltip>
    <v-btn v-if="selectedOnMap !== null" class="ml-16 mr-2" color="orange">
      <v-icon class="mr-3">mdi-robot</v-icon> {{ selectedRobotOnMapRef }}
    </v-btn>
    <v-btn v-if="selectedOnMap !== null" disabled> </v-btn>

    <v-card v-if="tableView">
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

    <v-card v-if="eventView">
      <v-data-table
        class="mt-5"
        :headers="headersEvent"
        :items="events"
        v-model="selectedEvent"
        item-key="id"
        show-select
        hide-default-footer
      >
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn small @click="scheduleThis(item)"> <v-icon small class="mr-2"> mdi-robot</v-icon>Assign </v-btn>
        </template>
        <template v-slot:[`item.date`]="{ item }">
          {{ item.date | moment("DD.MM.YYYY, HH:mm") }}
        </template>
      </v-data-table>
    </v-card>
    <v-card v-if="mapView">
      <div class="conti">
        <LMap ref="robotmap" class="mymap" :zoom="zoom" :center="center" @ready="mapReady" @click="moveRobot">
          <LTileLayer :url="url"></LTileLayer>
          <div v-for="(r, i) in robots" :key="i">
            <LMovingMarker
              ref="movingMarker"
              :lat-lng="r.latlng"
              :duration="duration"
              :icon="icon"
              @click="selectRobot(i, r)"
            ></LMovingMarker>
          </div>
        </LMap>
      </div>
    </v-card>
  </div>
</template>

<script>
import axios from "axios";
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

// const events = [
//   {
//     id: "1234",
//     description: "PARTY: We don't neeed no education VOL. 1",
//     date: moment()
//       .add(1, "minutes")
//       .toDate(),
//     location: "IT University Copenhagen",
//     latlng: L.latLng(),
//     robotId: "",
//   },
//   {
//     id: "1235",
//     description: "PARTY: We don't neeed no education VOL. 2",
//     date: moment()
//       .add(2, "minutes")
//       .toDate(),
//     location: "IT University Copenhagen",
//     latlng: L.latLng(),
//     robotId: "",
//   },
// {
//   id: "1236",
//   description: "PARTY: We don't neeed no education VOL. 3",
//   date: moment()
//     .add(4, "minutes")
//     .toDate(),
//   location: "IT University Copenhagen",
//   latlng: L.latLng(),
//   robotId: "",
// },
// ];

export default {
  components: {
    LMap,
    LTileLayer,
    LMovingMarker,
  },

  data() {
    return {
      icon,
      snackbar: false,

      search: "",
      selected: [],

      searchEvent: "",
      selectedEvent: [],

      mapView: true,
      tableView: false,
      eventView: false,

      testRobot: L.latLng(55.66071, 12.6024),

      robots: [],

      selectedOnMap: null,

      timeout: 2000,

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

      currentEvent: null,
      eventSelectedRobot: null,
      eventDialog: false,
      events: [],
      headersEvent: [
        {
          text: "ID",
          value: "id",
        },
        { text: "Description", value: "description" },
        { text: "Date", value: "date" },
        { text: "Location", value: "location" },
        { text: "Robot (ID)", value: "robot.id" },
        { text: "Actions", value: "actions", sortable: false },
      ],
    };
  },

  methods: {
    mapReady() {
      this.map = this.$refs.robotmap.mapObject;
    },

    moveRobot(event) {
      if (this.selectedOnMap && this.selectedOnMap.reference) {
        const current = this.selectedOnMap.reference;
        const dist = distance([event.latlng.lat, event.latlng.lng], [current._latlng.lat, current._latlng.lng]);
        if (dist > 0.1) {
          this.snackbar = true;
        } else {
          current.slideTo(event.latlng, {
            duration: 10000000 * dist,
            keepAtCenter: false,
          });
        }
        this.selectedOnMap = null;
      }
    },

    selectRobot(i, rob) {
      this.selectedOnMap = { reference: this.$refs.movingMarker[i].mapObject, index: i };
      this.selectedOnMap2 = { reference: this.$refs.movingMarker[i].mapObject, robot: rob };
    },

    saveScheduledMove() {
      if (this.currentEvent._id) {
        axios
          .post("http://localhost:5000/api/event/" + this.currentEvent._id, {
            robotId: this.eventSelectedRobot,
          })
          .then((response) => {
            if (response.status === 200) this.$router.go();
          })
          .catch((error) => {
            alert(error);
          });
      }
    },

    scheduleThis(schedEvent) {
      this.currentEvent = schedEvent;
      this.eventDialog = true;

      // store
    },

    fetchRobots() {
      axios
        .get("http://localhost:5000/api/robot")
        .then((response) => {
          this.robots = response.data;
          this.robots.forEach((r) => {
            r.latlng = L.latLng(r.position[0], r.position[1]);
          });

          setTimeout(() => {
            console.log(this.$refs.movingMarker);
            let i;
            for (i = 0; i < this.robots.length; i++) {
              if (this.robots[i].events && this.robots[i].events[0]) {
                console.log(i);
                if (this.$refs.movingMarker && this.$refs.movingMarker[i]) {
                  const e = this.robots[i].events[0];
                  const mm = this.$refs.movingMarker[i];
                  const diffTime = new Date() - new Date(e.date);
                  const dist = distance(e.latlng, [mm.latLng.lat, mm.latLng.lng]);
                  console.log(diffTime);
                  if (diffTime < 0) {
                    console.log(mm);
                    setTimeout(() => {
                      console.log("sliding");
                      mm.slideTo(L.latLng(e.latlng[0], e.latlng[1]), {
                        duration: 10000000 * dist,
                        keepAtCenter: false,
                      });
                    }, diffTime);
                  }
                }
              }
            }
          }, 5000);
        })
        .catch((error) => alert(error));
    },

    fetchEvents() {
      axios
        .get("http://localhost:5000/api/event")
        .then((response) => {
          this.events = response.data;
        })
        .catch((error) => alert(error));
    },
  },

  created() {
    this.fetchRobots();
    this.fetchEvents();
  },

  computed: {
    selectedRobotOnMapRef() {
      if (this.selectedOnMap !== null) {
        return this.robots[this.selectedOnMap.index].id;
      }
      return null;
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

.conti {
  height: 87vh;
  position: relative;
}
</style>
