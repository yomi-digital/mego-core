<template>
  <div class="container">
    <div class="columns" v-if="loading">
      <div class="column" style="text-align: center; padding: 40vh 0">
        Searching on the blockchain...
      </div>
    </div>
    <!-- LIST VIEW -->
    <div class="row" style="margin-top: 80px">
      <div v-if="!loading && redeemed">
        <h3 class="title is-3">You've redeemed your badge!</h3>
        <p>
          You've redeemed your badge yet, you can see it on OpenSea at:
          <a
            :href="
              'https://opensea.io/assets/matic/' +
              badgeContract +
              '/' +
              $route.params.tokenId
            "
            target="_blank"
          >
            {{
              "https://opensea.io/assets/matic/" +
              badgeContract +
              "/" +
              $route.params.tokenId
            }}
          </a>
        </p>
      </div>
      <div v-if="!loading && !redeemed">
        <div v-if="isWhitelisted">
          <h3 class="title is-3">Redeem your Badge</h3>
          <hr />
          <p>
            Please confirm the transaction by clicking following button.<br />Please
            remind that redemption process is completely <b>free</b>.
          </p>
          <br />
          <b-button
            v-if="!isRedeeming"
            type="is-primary bigbutton"
            v-on:click="redeem()"
            >REDEEM BADGE</b-button
          >
          <div v-if="isRedeeming">
            Please confirm the operation in Metamask..
          </div>
          <div v-if="pendingTx">
            <hr />
            Waiting for confirmation at {{ pendingTx }}..
          </div>
        </div>
        <div v-if="!isWhitelisted">
          <h3 class="title is-3">Can't redeem</h3>
          <hr />
          <p>Unfortunately you're not whitelisted.</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Web3 from "web3";
import Web3Modal, { isMobile } from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
const ABI = require("../abi_badges.json");
const axios = require("axios");

export default {
  data() {
    return {
      badgeAPI: process.env.VUE_APP_BADGE_API,
      badgeContract: process.env.VUE_APP_BADGE_CONTRACT,
      ipfsEndpoint: process.env.VUE_APP_IPFS_ENDPOINT,
      selected_network: "",
      account: "",
      web3: "",
      balance: 0,
      loading: true,
      isRedeeming: false,
      isWhitelisted: false,
      redeemed: false,
      axios: axios,
      event: {
        name: "",
        description: "",
        image: [],
        startime: "",
        endtime: "",
      },
      pendingTx: ""
    };
  },
  methods: {
    async redeem() {
      const app = this;
      if (!app.isRedeeming) {
        app.isRedeeming = true;
        const nftContract = new app.web3.eth.Contract(ABI, app.badgeContract);
        try {
          const gasPrice = await app.web3.eth.getGasPrice() * 2
          await nftContract.methods
            .claim(app.$route.params.tokenId, "")
            .send({
              from: app.account,
              gasPrice: gasPrice,
            })
            .on("transactionHash", (tx) => {
              app.pendingTx = tx;
            });
          app.isMinting = false;
          alert("You've successfully redeemed your name!");
          location.reload();
        } catch (e) {
          alert(e.message);
          app.isMinting = false;
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
    const nftContract = new app.web3.eth.Contract(ABI, app.badgeContract);
    app.created = [];
    const redeemed = await nftContract.methods
      .balanceOf(app.account, app.$route.params.tokenId)
      .call();
    if (redeemed > 0) {
      app.redeemed = true;
    }
    app.isWhitelisted = await nftContract.methods
      .isInAddressWhitelist(app.$route.params.tokenId, app.account)
      .call();
    app.loading = false;
  },
};
</script>
