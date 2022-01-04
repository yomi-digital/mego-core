<template>
  <div class="container">
    <div class="row" style="margin-top: 80px">
      <div class="columns" v-if="name !== ''">
        <div class="column">
          <a
            :href="
              'https://opensea.io/assets/matic/0xe51690e6ccf8f388d683d6a55ffb56dfc5d6bdde/' +
              tokenId
            "
            target="_blank"
            class="on-mobile"
            >Show in Opensea</a
          >
          <h1 class="title is-1 on-mobile">{{ $route.params.searcher }}</h1>
          <img :src="name.image" width="100%" />
        </div>
        <div
          class="column"
          v-if="owner.toUpperCase() !== account.toUpperCase()"
          style="text-align: left"
        >
          <div class="hidden-mobile">
            <a
              :href="
                'https://opensea.io/assets/matic/0xe51690e6ccf8f388d683d6a55ffb56dfc5d6bdde/' +
                tokenId
              "
              target="_blank"
              >Show in Opensea</a
            >
            <h1 class="title is-1">{{ $route.params.searcher }}</h1>
          </div>
          <div v-if="name.ethereum_address">
            ETH ADDRESS: {{ name.ethereum_address }}
          </div>
          <div v-if="name.bitcoin_address">
            BTC ADDRESS: {{ name.bitcoin_address }}
          </div>
          <div v-if="name.email">
            E-MAIL: <a :href="'mailto:' + name.email">{{ name.email }}</a>
          </div>
          <div v-if="name.url">
            URL: <a :href="name.url">{{ name.url }}</a>
          </div>
          <div v-if="name.social.length > 0">
            SOCIAL:
            <a :href="name.social">{{ name.social }}</a>
          </div>
          <div v-if="name.social.length > 0">
            DESCRIPTION:
            {{ name.description }}
          </div>
        </div>
        <div
          class="column"
          v-if="owner.toUpperCase() === account.toUpperCase()"
          style="text-align: left"
        >
          <div class="no-mobile">
            <a
              :href="
                'https://opensea.io/assets/matic/0xe51690e6ccf8f388d683d6a55ffb56dfc5d6bdde/' +
                tokenId
              "
              target="_blank"
              >Show in Opensea</a
            >
            <h1 class="title is-1">{{ $route.params.searcher }}</h1>
          </div>
          <b-tabs v-model="activeTab" :animated="false">
            <b-tab-item label="Metadata">
              <b-field label="ETH ADDRESS">
                <b-input v-model="name.ethereum_address"></b-input>
              </b-field>
              <b-field label="BTC ADDRESS">
                <b-input v-model="name.bitcoin_address"></b-input>
              </b-field>
              <b-field label="E-MAIL">
                <b-input v-model="name.email"></b-input>
              </b-field>
              <b-field label="PUBLIC URL">
                <b-input v-model="name.url"></b-input>
              </b-field>
              <b-field label="SOCIAL">
                <b-input v-model="name.social"></b-input>
              </b-field>
            </b-tab-item>
            <b-tab-item label="Graphic">
              <b-field label="BACKGROUND">
                <b-input v-model="name.background"></b-input>
              </b-field>
              <b-field label="FONT COLOR">
                <b-input v-model="name.color"></b-input>
              </b-field>
              <b-field label="VECTOR LOGO">
                <b-input v-model="name.logo"></b-input>
              </b-field>
            </b-tab-item>
            <b-tab-item label="Description">
              <b-input
                maxlength="200"
                v-model="name.description"
                type="textarea"
              ></b-input>
            </b-tab-item>
            <b-tab-item label="PGP">
              <b-input v-model="pgp" type="textarea"></b-input>
            </b-tab-item>
          </b-tabs>
          <b-button
            v-if="!updating && activeTab !== 3"
            type="is-primary bigbutton"
            v-on:click="changeName()"
            >CHANGE NAME</b-button
          >
          <b-button
            v-if="!updating && activeTab === 3"
            type="is-primary bigbutton"
            v-on:click="changePGP()"
            >CHANGE PGP KEY</b-button
          >
          <div v-if="updating">
            Waiting for blockchain confirmation, please wait...
          </div>
        </div>
      </div>
      <div class="columns" v-if="name === ''">
        <div class="column" style="text-align: center; padding: 40vh 0">
          Searching on the blockchain...
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
const ABI = require("../abi_core.json");
const ABI_PGP = require("../abi_pgp.json");
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
      updating: false,
      price: "",
      owner: "",
      tokenId: 0,
      pgp: "",
      activeTab: 0,
    };
  },
  methods: {
    async changeName() {
      const app = this;
      const nftContract = new app.web3.eth.Contract(
        ABI,
        process.env.VUE_APP_CONTRACT_ADDRESS
      );
      try {
        console.log(
          "Trying adjusting personal details of token " + app.tokenId + "..."
        );
        if (!app.updating) {
          app.updating = true;
          const result = await nftContract.methods
            .fixDetails(
              parseInt(app.tokenId),
              app.name.ethereum_address,
              app.name.ethereum_address,
              app.name.bitcoin_address,
              app.name.email,
              app.name.url,
              app.name.social,
              app.name.background,
              app.name.color,
              app.name.logo,
              app.name.description
            )
            .send({ from: app.account });
          alert("Transaction confirmed at: " + result.transactionHash + "!");
          const changed = await nftContract.methods
            .tokenURI(app.tokenId)
            .call();
          const decodedStr = JSON.parse(
            Buffer.from(changed.split("base64,")[1], "base64").toString()
          );
          app.name = decodedStr;
          try {
            app.name.logo = Buffer.from(app.name.logo, "base64").toString();
          } catch (e) {
            console.log("Can't decode logo.");
          }
          app.updating = false;
        }
      } catch (e) {
        app.updating = false;
        alert(e.message);
      }
    },
    async changePGP() {
      const app = this;
      const pgpContract = new app.web3.eth.Contract(
        ABI_PGP,
        process.env.VUE_APP_PGP_ADDRESS
      );
      try {
        console.log(
          "Trying adjusting personal details of token " + app.tokenId + "..."
        );
        if (!app.updating) {
          app.updating = true;
          const hexed = Buffer.from(app.pgp).toString("hex");
          const result = await pgpContract.methods
            .addPGP(
              app.name.name.split(".")[0],
              app.name.name.split(".")[1],
              hexed
            )
            .send({
              from: app.account,
              gasPrice: "200000000000",
            })
            .on("transactionHash", (tx) => {
              console.log("Pending transaction: " + tx);
            });
          alert("Transaction confirmed at: " + result.transactionHash + "!");
          app.updating = false;
        }
      } catch (e) {
        app.updating = false;
        alert(e.message);
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
    const nftContract = new app.web3.eth.Contract(
      ABI,
      process.env.VUE_APP_CONTRACT_ADDRESS
    );
    const tknId = await nftContract.methods
      .returnNameID(app.$route.params.searcher)
      .call();
    app.tokenId = tknId;
    const token = await nftContract.methods.tokenURI(tknId).call();
    app.owner = await nftContract.methods.ownerOf(tknId).call();
    const decodedStr = JSON.parse(
      Buffer.from(token.split("base64,")[1], "base64").toString()
    );
    app.name = decodedStr;
    try {
      app.name.logo = Buffer.from(app.name.logo, "base64").toString();
    } catch (e) {
      console.log("Can't decode logo.");
    }
    try {
      const pgpContract = new app.web3.eth.Contract(
        ABI_PGP,
        process.env.VUE_APP_PGP_ADDRESS
      );
      const retrieve = await pgpContract.methods
        .returnPGP(app.name.name.split(".")[0], app.name.name.split(".")[1])
        .call();
      app.pgp = Buffer.from(retrieve, "hex").toString();
    } catch (e) {
      console.log("Can't get PGP");
      console.log(e.message);
    }
  },
};
</script>
