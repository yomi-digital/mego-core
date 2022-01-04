<template>
  <div class="container" style="padding: 20vh 0">
    <h1 class="title is-1">Search for name's PGP</h1>
    <b-field class="biginput">
      <b-input
        v-model="name"
        v-if="!pgp"
        placeholder="Write the name you want to search.."
      ></b-input>
    </b-field>
    <b-button
      v-if="!searching && !pgp"
      type="is-primary bigbutton"
      v-on:click="search()"
      >ASK FOR PGP</b-button
    >
    <div v-if="searching">Searching PGP, please wait..</div>
    <pre v-if="pgp">{{ pgp }}</pre>
    <b-button
      v-if="pgp"
      style="margin-top:10px;"
      type="is-primary bigbutton"
      v-on:click="pgp = ''"
      >SEARCH AGAIN</b-button
    >
  </div>
</template>

<script>
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
const ABI = require("../abi_pgp.json");
export default {
  data() {
    return {
      selected_network: "",
      account: "",
      web3: "",
      balance: 0,
      name: "",
      found: {},
      searching: false,
      price: "",
      pgp: "",
    };
  },
  methods: {
    async search() {
      const app = this;
      const web3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions: {
          walletconnect: {
            package: WalletConnectProvider,
            options: {
              infuraId: "57d9ea9ca92a4449933c2b7d7145187d",
            },
          },
        },
      });
      const provider = await web3Modal.connect();
      app.web3 = await new Web3(provider);
      const accounts = await app.web3.eth.getAccounts();
      app.account = accounts[0];
      const pgpContract = new app.web3.eth.Contract(
        ABI,
        process.env.VUE_APP_PGP_ADDRESS
      );
      if (app.name.indexOf(".") !== -1) {
        try {
          const pgp = await pgpContract.methods
            .returnPGP(app.name.split(".")[0], app.name.split(".")[1])
            .call();
          if (pgp.length > 0) {
            app.searching = false;
            app.pgp = Buffer.from(pgp, "hex").toString();
          } else {
            alert('No PGP in this name!')
            app.searching = false;
          }
        } catch (e) {
          app.searching = false;
        }
      }
    },
  },
};
</script>
