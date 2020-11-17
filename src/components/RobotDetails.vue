<template>
  <div>
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
              return-object
            ></v-select>
            <v-textarea rows="10" outlined label="Information" v-model="notifyReason"></v-textarea>
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

    <v-card max-width="600px">
      <v-card-title class="pb-0"> ID: {{ robot.id }} </v-card-title>
      <v-list class="transparent">
        <v-list-item>
          <v-list-item-title>Status</v-list-item-title>
          <v-list-item-subtitle :class="robot.status !== 'Active' ? 'text-right red--text' : 'text-right green--text'">
            {{ robot.status }}
          </v-list-item-subtitle>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>Energy used</v-list-item-title>
          <v-list-item-icon>
            <v-icon>mdi-chart-donut</v-icon>
          </v-list-item-icon>
          <v-list-item-subtitle class="text-right"> {{ robot.energyUsed || 0 }} kWh </v-list-item-subtitle>
        </v-list-item>

        <v-list-group>
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title class="font-italic">Last trash collected</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list-item v-for="(t, i) in trash" :key="i">
            <v-list-item-title>{{ t.date | moment("DD.MM, h:mm") }}</v-list-item-title>
            <v-list-item-subtitle class="text-right"> {{ t.weight }} g </v-list-item-subtitle>
          </v-list-item>
        </v-list-group>

        <v-list-item>
          <v-list-item-title>Installation</v-list-item-title>
          <v-list-item-subtitle class="text-right">
            {{ robot.installationAt | moment("DD.MM.YYYY") }}
          </v-list-item-subtitle>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>Oil</v-list-item-title>
          <v-list-item-subtitle class="text-right">
            {{ robot.oil }}
          </v-list-item-subtitle>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>Wheels</v-list-item-title>
          <v-list-item-subtitle :class="robot.wheels !== 'Ok' ? 'text-right red--text' : 'text-right'">
            {{ robot.wheels }}
          </v-list-item-subtitle>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>Camera</v-list-item-title>
          <v-list-item-subtitle class="text-right">
            {{ robot.camera }}
          </v-list-item-subtitle>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>Company</v-list-item-title>
          <v-list-item-subtitle class="text-right">
            {{ selectedEngineer ? selectedEngineer.name : "" }}
          </v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
          <v-list-item-title>Battery</v-list-item-title>
          <v-list-item-subtitle class="text-right"> {{ robot.batteryLevel || 0 }} % </v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
          <v-list-item-title>Trash level</v-list-item-title>
          <v-list-item-subtitle class="text-right"> {{ robot.trashLevel || 0 }} % </v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="assignEngineerDialog = true" x-large color="primary">Notify company</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import axios from "axios";

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
  data() {
    return {
      assignEngineerDialog: false,
      selectedEngineer: "",
      engineerOptions: [],
      notifyReasonDetail: "",

      API_URL: process.env.VUE_APP_API_URL,

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
    mapReady() {
      console.log("hello");
      this.map = this.$refs.robotmap.mapObject;
    },

    pickup() {
      if (this.selectedEngineer) {
        axios
          .post(this.API_URL + "/robot/pickup", {
            robotId: this.$route.params.robotId,
            engineerId: this.selectedEngineer._id,
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
      } else alert("Please select an engineer.");
    },

    fetchEngineers() {
      axios
        .get(this.API_URL + "/engineer")
        .then((response) => {
          this.engineerOptions = response.data;
        })
        .catch((error) => alert(error));
    },

    fetchRobot() {
      axios
        .get(this.API_URL + "/robot/" + this.$route.params.robotId)
        .then((response) => {
          this.robot = response.data;
          console.log(response.data);
          this.selectedEngineer = response.data.engineer;
        })
        .catch((error) => {
          alert(error);
        });
    },
  },

  created() {
    this.fetchEngineers();
    this.fetchRobot();
  },

  computed: {
    notifyReason() {
      const robot = this.robot;
      let errorMessage = "---- " + robot.id + " ----\n\n";
      errorMessage += "Wheels: " + robot.wheels + "\n";
      errorMessage += "Oil: " + robot.oil + "\n";
      errorMessage += "Camera: " + robot.camera + "\n\n";
      return errorMessage + "\n\n" + this.notifyReasonDetail;
    },
  },
};
</script>

<style></style>
