<template>
  <div class="container" style="padding: 20vh 0">
    <h1 class="title is-1">Redeem a reserved name</h1>
    <b-field class="biginput">
      <b-input
        v-model="name"
        v-if="!canRedeem"
        placeholder="Write the name you want to redeem.."
      ></b-input>
      <b-input
        v-model="code"
        v-if="canRedeem"
        placeholder="Enter the code received with e-mail.."
      ></b-input>
    </b-field>
    <b-button
      v-if="!searching && !canRedeem"
      type="is-primary bigbutton"
      v-on:click="search()"
      >ASK FOR REDEMPTION</b-button
    >
    <b-button
      v-if="!redeeming && canRedeem"
      type="is-primary bigbutton"
      v-on:click="redeemName()"
      >SIGN REQUEST WITH WALLET</b-button
    >
    <div v-if="searching">Asking if can redeem, please wait..</div>
    <div v-if="redeeming">Redeeming please wait, please wait..</div>
  </div>
</template>

<script>
const axios = require("axios");
export default {
  data() {
    return {
      selected_network: "",
      account: "",
      web3: "",
      balance: 0,
      code: "",
      name: "",
      found: {},
      searching: false,
      canRedeem: false,
      redeeming: false,
    };
  },
  watch: {
    async name() {
      const app = this;
      if (
        app.name.split(".")[1] !== undefined &&
        app.tlds.indexOf(app.name.split(".")[1]) !== -1
      ) {
        app.tld = app.name.split(".")[1];
      } else {
        app.tld = "NO";
      }
    },
  },
  methods: {
    async connect() {
      const app = this;
      if (window.ethereum) {
        // Check if network is desired one
        app.selected_network = await app.web3.eth.net.getId();
        // Request accounts
        await window.ethereum.send("eth_requestAccounts");
        // Read accounts
        const accounts = await app.web3.eth.getAccounts();
        if (accounts[0] !== undefined) {
          app.account = accounts[0];
          // Take balance
          const balance = await app.web3.eth.getBalance(accounts[0]);
          app.balance = parseFloat(
            app.web3.utils.fromWei(balance, "ether")
          ).toFixed(10);
          localStorage.setItem("connected", app.account);
        }
      } else {
        alert("Please install Metamask");
      }
    },
    async search() {
      const app = this;
      if (!app.searching) {
        app.name = app.name.toLowerCase().trim().replace(/\s/g, "-");
        if (app.name.length > 0) {
          try {
            let check = await axios.get(
              process.env.VUE_APP_LAMBDA_API + "/ask/" + app.name
            );
            app.searching = false;
            if (check.data.error === undefined) {
              app.canRedeem = true;
              alert(check.data.message);
            } else {
              alert(check.data.error);
            }
          } catch (e) {
            alert(e.message);
          }
        }
      }
    },
    async redeemName() {
      const app = this;
      if (!app.redeeming && app.code.length > 0) {
        app.redeeming = true;
        try {
          const signature = await app.web3.eth.personal.sign(
            app.code,
            app.account
          );
          const request = await axios.post(
            process.env.VUE_APP_LAMBDA_API + "/verify/" + app.name,
            {
              address: app.account,
              secret: app.code,
              signature: signature,
            }
          );
          if (request.data.error === undefined) {
            alert(request.data.message);
            app.code = "";
            app.name = "";
            app.canRedeem = false;
            app.redeeming = false;
          } else {
            alert(request.data.error);
            app.redeeming = false;
          }
        } catch (e) {
          app.redeeming = false;
          alert("Something goes wrong, retry!");
        }
      }
    },
  }
};
</script>