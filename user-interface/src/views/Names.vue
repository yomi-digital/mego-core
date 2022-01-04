<template>
  <div class="container">
    <div class="row" style="margin-top: 80px">
      <div v-if="names.length > 0">
        <h1 class="title is-1">Your registered names</h1>
        <br />
        <div
          v-for="name in names"
          class="name"
          style="width: 30%; margin: 1.5%; display: inline-block"
          v-bind:key="name.name"
        >
          <a :href="'/#/name/' + name.name"
            ><img :src="name.image" width="100%"
          /></a>
        </div>
      </div>
      <div v-if="names.length === 0 && !searching">
        <h1 class="title is-1">Oh no!</h1>
        <br />
        You've no names!
      </div>
      <div class="columns" v-if="searching">
        <div class="column" style="text-align: center; padding: 40vh 0">
          Searching on the blockchain...
        </div>
      </div>
    </div>
  </div>
</template>
<style>
@media screen and (max-width: 768px) {
  .name {
    width:100%!important;
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
      names: [],
      searching: true,
      price: "",
    };
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
    const names = await nftContract.methods.tokensOfOwner(app.account).call();
    if (names.length > 0) {
      for (let k in names) {
        const token = await nftContract.methods.tokenURI(names[k]).call();
        const decodedStr = JSON.parse(
          Buffer.from(token.split("base64,")[1], "base64").toString()
        );
        app.names.push(decodedStr);
        app.searching = false;
      }
    } else {
      app.searching = false;
    }
  },
};
</script>
