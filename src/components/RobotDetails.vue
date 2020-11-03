<template>
  <v-container>
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
              <v-list-item-title class="font-italic">Cigs collected</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list-item v-for="(cc, i) in robot.cigsCollected" :key="i">
            <v-list-item-title>{{ cc.date | moment("DD.MM, h:mm") }}</v-list-item-title>
            <v-list-item-subtitle class="text-right">
              {{ cc.position.lat | toFixedNumber }} / {{ cc.position.lng | toFixedNumber }}
            </v-list-item-subtitle>
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

        <v-list-group>
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title class="font-italic">Show on map</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list-item>
            <GmapMap :center="robot.position" :zoom="14" map-type-id="terrain" style="width: 400px; height: 500px">
              <GmapMarker :position="robot.position" />
              <GmapMarker v-for="(cc, i) in robot.cigsCollected" :key="i" :position="cc.position" />
            </GmapMap>
          </v-list-item>
        </v-list-group>
      </v-list>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn small color="primary">Send to</v-btn>
        <v-btn small color="warning">Pick up</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      robot: {},
    };
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
      })
      .catch((error) => {
        alert(error);
      });
  },
};
</script>

<style></style>
