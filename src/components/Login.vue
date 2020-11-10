<template>
  <v-container fill-height>
    <v-layout align-center justify-center class="text-xs-center">
      <v-card class="login-card">
        <v-form v-model="validated">
          <v-text-field class="ma-3" v-model="name" :rules="nameRules" label="Name" required></v-text-field>
          <v-text-field
            class="ma-3"
            v-model="password"
            type="password"
            :rules="passwordRules"
            label="Password"
            required
          ></v-text-field>
          <v-btn @click="loginUser" class="float-right ma-3" color="primary">Login</v-btn>
        </v-form>
      </v-card>
    </v-layout>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data: () => ({
    validated: false,
    name: "",
    password: "",
    nameRules: [(v) => !!v || "Name is required"],
    passwordRules: [(v) => !!v || "Password is required"],
  }),

  methods: {
    loginUser() {
      axios
        .post("http://localhost:5000/api/auth/login", {
          name: this.name,
          password: this.password,
        })
        .then((response) => {
          if (response && response.data && response.data.token) {
            localStorage.setItem("engineer", response.data.token);
            this.$router.push({ name: "Robots2" });
          } else throw "No token found.";
        })
        .catch(() => {
          alert("Wrong credentials.");
        });
    },
  },
};
</script>
<style scoped>
.login {
  max-width: 500px;
}
.login-card {
  min-width: 300px;
}
</style>
