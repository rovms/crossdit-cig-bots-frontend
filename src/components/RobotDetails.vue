<template>
  <v-card>
    <v-card-title class="pb-0"> ID: {{ robot.id }} </v-card-title>
    <v-list class="transparent">
      <v-list-item>
        <v-list-item-title>Status</v-list-item-title>
        <v-list-item-subtitle class="text-right green--text"> {{ robot.status }} </v-list-item-subtitle>
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
      <v-btn text @click="pickup" small color="primary">Assign</v-btn>
    </v-card-actions>
  </v-card>
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
      center: [],
      bounds: null,
    };
  },

  methods: {
    pickup() {
      console.log("pickup");
      axios.post("http://localhost:5000/api/robot/pickup", {
        robotId: this.$route.params.robotId,
        // engineerId:
      });
    },

    move(cigarettePosition) {
      const diff0 = this.robotPosition[0] - cigarettePosition[0];
      console.log("cigarettePosition");
      console.log(cigarettePosition);
      console.log(this.robotPosition);
      let moved = false;
      if (Math.abs(diff0) > 0.00015) {
        moved = true;
        if (diff0 > 0) {
          this.robotPosition[0] -= this.speed;
        } else if (diff0 < 0) {
          this.robotPosition[0] += this.speed;
        }
      }

      const diff1 = this.robotPosition[1] - cigarettePosition[1];
      if (Math.abs(diff1) > 0.00015) {
        moved = true;
        if (diff1 > 0) {
          this.robotPosition[1] -= this.speed;
        } else if (diff1 < 0) {
          this.robotPosition[1] += this.speed;
        }
      }

      console.log(moved);
      console.log(this.robotPosition);

      if (moved) setTimeout(this.move(cigarettePosition), 5000);
    },
  },

  filters: {
    toFixedNumber(number) {
      return Math.round(number * 1e5) / 1e5;
    },
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
  },
};
</script>

<style></style>
