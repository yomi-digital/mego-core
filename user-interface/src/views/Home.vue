<template>
  <div class="container">
    <div class="row">
      <h1
        class="title is-2"
        style="padding-top: 20vh"
        v-if="!searched || name.length === 0"
      >
        Your next Polygon name is awaiting...
      </h1>
      <h1
        class="title is-2"
        style="padding-top: 20vh"
        v-if="searched && Object.keys(found).length === 0 && name.length > 0"
      >
        Nice shot, buy it for {{ price }} MATIC!
      </h1>
      <b-field class="biginput">
        <b-input
          v-model="name"
          placeholder="Write a name to search or buy.."
        ></b-input>
      </b-field>
    </div>
    <div v-if="tld === 'NO'" style="margin-top: 20px">
      <hr />
      TLD is not valid, available are:<br /><b>{{ tlds.join(",") }}</b>
    </div>
    <div v-if="searched" style="padding-bottom: 10vh">
      <hr />
      <div v-if="Object.keys(found).length > 0">
        <div class="columns">
          <div class="column">
            <img :src="found.image" width="100%" />
          </div>
          <div class="column" style="text-align: left">
            <h1 class="title is-4">Details</h1>
            <div v-if="found.ethereum_address">
              ETH ADDRESS: {{ found.ethereum_address }}
            </div>
            <div v-if="found.bitcoin_address">
              BTC ADDRESS: {{ found.bitcoin_address }}
            </div>
            <div v-if="found.bitcoin_address">
              E-MAIL: <a :href="'mailto:' + found.email">{{ found.email }}</a>
            </div>
            <div v-if="found.url">
              URL: <a :href="found.url">{{ found.url }}</a>
            </div>
            <div v-if="found.social.length > 0">
              SOCIAL: <a :href="found.social">{{ found.social }}</a>
            </div>
            <div v-if="found.description.length > 0">
              DESCRIPTION:
              {{ found.description }}
            </div>
            <hr />

            <a
              :href="
                'https://opensea.io/assets/matic/0xe51690e6ccf8f388d683d6a55ffb56dfc5d6bdde/' +
                found.tokenId
              "
              target="_blank"
              >Show in Opensea</a
            >
          </div>
        </div>
      </div>
      <div v-if="Object.keys(found).length === 0 && tld !== 'NO'">
        <b-button
          v-if="!buying"
          type="is-primary bigbutton"
          v-on:click="buyName()"
          >BUY ME NOW!</b-button
        >
        <div v-if="buying">
          Waiting for blockchain confirmation, please wait...
        </div>
      </div>
    </div>
    <div v-if="searching && !searched" style="padding-top: 20px">
      <hr />
      Searching name, please wait..
    </div>
    <div v-if="!searched" style="padding-bottom: 30vh"></div>
  </div>
</template>
<style>
.biginput .input {
  font-size: 40px !important;
  font-family: "JetBrains Mono", monospace;
}
.bigbutton {
  width: 100%;
  font-size: 30px !important;
}
@media screen and (max-width: 768px) {
  .biginput .input {
    font-size: 20px !important;
  }
  .bigbutton {
    width: 100%;
    font-size: 15px !important;
  }
  #app {
    padding: 20px;
  }
  .title {
    font-size: 25px !important;
  }
}
</style>
<script>
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
const ABI = require("../abi_core.json");
export default {
  data() {
    return {
      selected_network: "",
      account: "",
      web3: "",
      balance: 0,
      name: "",
      found: {},
      searched: false,
      searching: false,
      price: "",
      tld: "",
      tlds: ["dao", "art", "ibz", "martix"],
      buying: false,
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
      if (app.tld !== "NO") {
        app.price = 10;
        let justname = app.name.replace("." + app.tld, "");
        if (justname.length > 5 && justname.length <= 10) {
          app.price = 5;
        } else if (justname.length > 10) {
          app.price = 2;
        }
        app.search();
      }
    },
  },
  methods: {
    async search() {
      const app = this;
      app.name = app.name.toLowerCase().trim().replace(/\s/g, "-");
      if (app.name.length > 0) {
        app.searching = true;
        const nftContract = new app.web3.eth.Contract(
          ABI,
          process.env.VUE_APP_CONTRACT_ADDRESS
        );
        const result = await nftContract.methods.returnNameID(app.name).call();
        if (parseInt(result) !== 0) {
          const uri = await nftContract.methods.tokenURI(result).call();
          const decodedStr = JSON.parse(
            Buffer.from(uri.split("base64,")[1], "base64").toString()
          );
          app.found = decodedStr;
          app.found.tokenId = result;
        } else {
          app.found = false;
        }
        app.searched = true;
        app.searching = false;
      } else {
        app.searching = false;
        app.searched = false;
      }
    },
    async buyName() {
      const app = this;
      if (!app.buying) {
        app.buying = true;
        const nftContract = new app.web3.eth.Contract(
          ABI,
          process.env.VUE_APP_CONTRACT_ADDRESS
        );
        try {
          const result = await nftContract.methods
            .mintName(app.name.split(".")[0], app.name.split(".")[1])
            .send({
              from: app.account,
              value: app.price.toString() + "000000000000000000",
            });
          alert("Transaction confirmed at " + result.transactionHash + "!");
          window.location = "/#/name/" + app.name;
          app.name = "";
          app.found = false;
          app.searched = false;
          app.price = "";
          app.buying = false;
        } catch (e) {
          app.buying = false;
          alert("Something goes wrong, retry!" + e.message);
        }
      }
    },
  },
  async mounted() {
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
    app.searching = false;
    app.searched = false;
    app.name = "";
    app.found = {};
  },
};
</script>
