<template>
  <v-container>
    <v-card>
      <v-card-title class="pb-0">
        {{ robot.name }}
      </v-card-title>
      <v-list class="transparent">
        <v-list-item>
          <v-list-item-title>Energy used</v-list-item-title>
          <v-list-item-subtitle class="text-right">
            {{ robot.energyUsed || 0 }}
          </v-list-item-subtitle>
        </v-list-item>
        <v-list-group>
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>Cigarettes collected</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list-item v-for="(cc, i) in robot.cigsCollected" :key="i">
            <v-list-item-title>{{
              cc.date | moment("DD.MM.YY h:mm:ss")
            }}</v-list-item-title>
            <v-list-item-subtitle class="text-right">
              {{ cc.position.lat }} / {{ cc.position.lng }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list-group>

        <v-list-item>
          <v-list-item-title>Battery level</v-list-item-title>
          <v-list-item-subtitle class="text-right">
            {{ robot.batteryLevel }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card>

    <GmapMap
      :center="{ lat: 55.659635, lng: 12.590958 }"
      :zoom="14"
      map-type-id="terrain"
      style="width: 400px; height: 500px"
    >
      <GmapMarker
        v-for="(cc, i) in robot.cigsCollected"
        :key="i"
        :position="cc.position"
      />
    </GmapMap>
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
