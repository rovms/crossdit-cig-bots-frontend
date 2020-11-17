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
          <v-btn :disabled="savingScheduled" @click="saveScheduledMove" class="float-right ma-3" text color="primary"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="changeEventDateDialog" max-width="500">
      <v-card>
        <v-card-title>
          Set a new time
        </v-card-title>
        <v-card-text>
          <v-row justify="space-around" align="center">
            <v-time-picker format="24hr" v-model="selectedTime" use-seconds></v-time-picker> </v-row
        ></v-card-text>
        <v-card-actions>
          <v-btn @click="changeEventDate" class="float-right ma-3" text color="primary">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-row class="ml-3 mr-3">
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
        <v-icon class="mr-3">mdi-table-large</v-icon> Overview
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
        <v-icon class="mr-3">mdi-google-maps</v-icon> Maps
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
        <v-icon class="mr-3">mdi-calendar-blank-outline</v-icon> Events
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
      <v-btn
        v-if="selectedOnMap !== null && mapView"
        class="ml-16 mr-2 white--text nottransf"
        :color="selectedRobotOnMapRef.wheels === 'Ok' ? 'green' : 'red'"
        :to="{ name: 'RobotDetails', params: { robotId: selectedRobotOnMapRef._id } }"
      >
        <v-icon class="mr-3">mdi-robot</v-icon>
        <div>
          {{
            selectedRobotOnMapRef.id +
              (selectedRobotOnMapRef.wheels === "Ok" ? " ----- OK" : " ----- Wheels: " + selectedRobotOnMapRef.wheels)
          }}
        </div>
        <br />
      </v-btn>

      <v-spacer></v-spacer>

      <v-slider
        class="mb-0"
        v-if="mapView"
        max="5"
        min="0"
        style="max-width: 300px;"
        label="Robot speed"
        v-model="robotSpeed"
      >
        <template v-slot:append class="mb-0">
          <v-text-field
            v-model="robotSpeed"
            class="mt-0 pt-0 mb-0"
            hide-details
            single-line
            type="number"
            style="width: 30px"
          ></v-text-field>
        </template>
      </v-slider>
    </v-row>

    <v-card v-if="tableView">
      <v-card-title>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
        <v-spacer></v-spacer>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="robots"
        :search="search"
        v-model="selected"
        item-key="id"
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
        hide-default-footer
      >
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn small @click="scheduleThis(item)"> <v-icon small class="mr-2"> mdi-robot</v-icon>Assign </v-btn>
        </template>
        <template v-slot:[`item.date`]="{ item }">
          {{ item.date | moment("DD.MM.YYYY, HH:mm") }}
          <v-icon
            @click="
              changeEventDateDialog = true;
              changeEventDateId = item._id;
            "
            class="ml-2"
            sml
            >mdi-pencil</v-icon
          >
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
              @click="selectRobot(i)"
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
import moment from "moment";

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

      robotSpeed: 1,

      selectedOnMap: null,

      timeout: 2000,

      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      zoom: 13,
      bounds: null,
      center: [55.66071, 12.6024],
      map: null,

      duration: 2000,

      headers: [
        {
          text: "Robot ID",
          value: "id",
        },
        { text: "Energy used (kWh)", value: "energyUsed" },
        { text: "Trash (%)", value: "trashLevel" },
        { text: "Status", value: "status" },
        { text: "Assigned to", value: "engineer.name" },
        { text: "Oil", value: "oil" },
        { text: "Camera", value: "camera" },
        { text: "Wheels", value: "wheels" },
        { text: "Actions", value: "actions", sortable: false },
      ],

      changeEventDateDialog: false,
      selectedTime: null,
      changeEventDateId: "",

      savingScheduled: false,

      currentEvent: null,
      eventSelectedRobot: null,
      eventDialog: false,
      events: [],
      API_URL: process.env.VUE_APP_API_URL,
      headersEvent: [
        {
          text: "Event ID",
          value: "id",
        },
        { text: "Description", value: "description" },
        { text: "Date", value: "date" },
        { text: "Location", value: "location" },
        { text: "Assigned robot (ID)", value: "robot.id" },
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
          if (this.robotSpeed > 0)
            current.slideTo(event.latlng, {
              duration: (10000000 / this.robotSpeed) * dist,
              keepAtCenter: false,
            });
        }
        this.selectedOnMap = null;
      }
    },

    changeEventDate() {
      const time = this.selectedTime;
      console.log("this.changeEventDateId :>> ", this.changeEventDateId);
      console.log("moment :>> ", moment());
      const d = moment()
        .set("hour", time.substring(0, 2))
        .set("minute", time.substring(3, 5))
        .set("second", time.substring(6, 8));
      console.log("d.toDate() :>> ", d.toDate());
      axios
        .post(this.API_URL + "/event/changeDate/" + this.changeEventDateId, {
          date: d.toDate(),
        })
        .then((response) => {
          this.events.forEach((e) => {
            if (e._id === this.changeEventDateId) {
              e.date = response.data.date;
            }
          });
        })
        .then(() => {
          this.changeEventDateId = "";
          this.changeEventDateDialog = false;
        })
        .catch((error) => alert(error));
    },

    selectRobot(i) {
      this.selectedOnMap = { reference: this.$refs.movingMarker[i].mapObject, index: i };
      console.log("selected on map");
      console.log(this.selectedOnMap.reference);
      // this.selectedOnMap2 = { reference: this.$refs.movingMarker[i].mapObject, robot: rob };
    },

    saveScheduledMove() {
      if (this.currentEvent._id) {
        this.savingScheduled = true;

        axios
          .post(this.API_URL + "/event/" + this.currentEvent._id, {
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
    },

    fetchRobots() {
      console.log(process.env);
      axios
        .get(this.API_URL + "/robot")
        .then((response) => {
          this.robots = response.data;
          this.robots.forEach((r) => {
            r.latlng = L.latLng(r.position[0], r.position[1]);
          });

          setTimeout(() => {
            let i;
            for (i = 0; i < this.robots.length; i++) {
              if (this.robots[i].events && this.robots[i].events[0]) {
                if (this.$refs.movingMarker && this.$refs.movingMarker[i]) {
                  const e = this.robots[i].events[0];
                  const mm = this.$refs.movingMarker[i].mapObject;
                  const diffTime = new Date(e.date) - new Date();
                  const dist = distance(e.latlng, [mm._latlng.lat, mm._latlng.lng]);
                  if (diffTime > 0) {
                    setTimeout(() => {
                      if (this.robotSpeed > 0)
                        mm.slideTo(L.latLng(e.latlng[0], e.latlng[1]), {
                          duration: (10000000 / this.robotSpeed) * dist,
                          keepAtCenter: false,
                        });
                    }, diffTime);
                  }
                }
              }
            }
          }, 4000);
        })
        .catch((error) => alert(error));
    },

    fetchEvents() {
      axios
        .get(this.API_URL + "/event")
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
        const robot = this.robots[this.selectedOnMap.index];
        return robot;
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

.input__slot {
  margin-bottom: 0px;
}

.nottransf {
  text-transform: none;
}
</style>
