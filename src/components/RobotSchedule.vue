<template>
  <v-card>
    <v-card-title>
      <v-spacer></v-spacer>
      <v-btn dark text @click="scheduleTask">
        Save
      </v-btn>
    </v-card-title>
    <div style="height: 800px;">
      <LMap :zoom="zoom" :center="center">
        <LTileLayer :url="url"></LTileLayer>
        <VGeosearch @search="some" :options="geosearchOptions"></VGeosearch>
      </LMap>
    </div>
  </v-card>
</template>

<script>
import axios from "axios";

import { LMap, LTileLayer } from "vue2-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import VGeosearch from "vue2-leaflet-geosearch";

const searchControl = new GeoSearchControl({
  provider: provider,
});

const trash = [
  {
    weight: 27,
    date: new Date(),
  },
  {
    weight: 41,
    date: new Date(),
  },
  {
    weight: 57,
    date: new Date(),
  },
];

export default {
  components: { LMap, LTileLayer, VGeosearch },

  data() {
    return {
      geosearchOptions: {
        provider: new OpenStreetMapProvider(),
      },
      assignEngineerDialog: false,
      selectedEngineer: "",
      engineerOptions: [],
      notifyReasonDetail: "",

      scheduleDialog: false,

      map: null,
      trash,
      robot: {},
      targetPosition: [],
      cigarettes: [
        [55.6603, 12.6013],
        [55.6604, 12.6014],
        [55.6603, 12.6016],
        [55.6603, 12.6003],
        [55.6606, 12.6011],
      ],

      robotPosition: [55.6607, 12.6015],

      speed: 0.0001,

      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      zoom: 14,
      center: [55.6603, 12.6013],
      bounds: null,
    };
  },

  methods: {
    some() {
      console.log("some");
    },

    mapReady() {
      console.log("hello");
      this.map = this.$refs.robotmap.mapObject;
    },

    pickup() {
      axios
        .post("http://localhost:5000/api/robot/pickup", {
          robotId: this.$route.params.robotId,
          engineerId: this.selectedEngineer,
        })
        .then((response) => {
          console.log(response);
          if (response.status === 200) console.log("ok");
        })
        .catch((error) => {
          console.log(error);
          alert(error);
        });

      this.assignEngineerDialog = false;
    },

    fetchEngineers() {
      axios
        .get("http://localhost:5000/api/engineer")
        .then((response) => {
          this.engineerOptions = response.data;
        })
        .catch((error) => alert(error));
    },

    scheduleTask() {},
  },

  created() {
    axios
      .get("http://localhost:5000/api/robot/" + this.$route.params.robotId)
      .then((response) => {
        this.robot = response.data;
        // this.center = this.robot.position;
      })
      .catch((error) => {
        alert(error);
      });

    this.fetchEngineers();
  },

  computed: {
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

<style></style>
