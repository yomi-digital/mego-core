<template>
  <div id="app">
    <div
      v-if="!account && $route.path !== '/manifesto'"
      style="margin-top: 10px"
    >
      <img src="./assets/polygon_me.jpg" width="250" /><br />
      <b>ME</b> is an on-chain solution to manage identities on Polygon
      Network.<br />
      This is a *beta* version with a minimal UI/UX just to understand the
      dynamics.<br />
      You will be able to mint your own names and see it on OpenSea as regular
      ERC-721 tokens.<br /><br />
      Tokens are stored directly into the blockchain and are rendered as
      SVGs,<br />
      you'll be able to change the colors and add your own logo too!<br /><br />
      This is not an official Polygon project, use it as it is,<br />by
      registering an identity you accept to respect the
      <a href="/#/manifesto" target="_blank">manifesto</a>.<br /><br /><br />
      --
      <br /><br /><br />
      <b-button type="is-primary" v-if="!connecting" v-on:click="connect()"
        >Connect Wallet</b-button
      >
      <div v-if="connecting">Connecting, please wait..</div>
    </div>
    <div v-if="account || $route.path === '/manifesto'">
      <b-navbar
        v-if="account"
        style="position: fixed; top: 0; left: 0; width: 100%"
      >
        <template #brand>
          <b-navbar-item tag="router-link" :to="{ path: '/' }">
            <img src="./assets/logo.png" style="margin-right: 10px" /> <b>ME</b>
          </b-navbar-item>
        </template>
        <template #start>
          <b-navbar-item href="/#/"> Register </b-navbar-item>
          <b-navbar-item href="/#/names"> My Names </b-navbar-item>
          <b-navbar-item href="/#/pgp"> PGP </b-navbar-item>
          <b-navbar-item href="/#/redeem"> Redeem </b-navbar-item>
        </template>

        <template #end>
          <b-navbar-item tag="div" class="account">
            <span
              style="font-size: 12px; text-align: right; padding-right: 20px"
              >{{ account.substr(0, 8) }}..{{ account.substr(-8) }}<br />{{
                balance
              }}
              MATIC
            </span>
            <div class="buttons">
              <b-button type="is-primary" v-on:click="disconnect()"
                >Disconnect</b-button
              >
            </div>
          </b-navbar-item>
        </template>
      </b-navbar>
      <router-view />
    </div>
    <br />
    <hr />
    A project by <a href="https://yomi.digital" target="_blank">YOMI</a>
  </div>
</template>

<script>
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

export default {
  data() {
    return {
      selected_network: "",
      account: "",
      web3: "",
      balance: 0,
      connecting: false
    };
  },
  methods: {
    async connect() {
      const app = this;
      app.connecting = true;
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
      const netId = await app.web3.eth.net.getId();
      if (netId !== 137) {
        app.connecting = false;
        await app.switchNetwork();
      } else {
        const accounts = await app.web3.eth.getAccounts();
        if (accounts.length > 0) {
          const balance = await app.web3.eth.getBalance(accounts[0]);
          app.account = accounts[0];
          app.balance = parseFloat(
            app.web3.utils.fromWei(balance, "ether")
          ).toFixed(10);
          localStorage.setItem("connected", app.account);
        }
        app.connecting = false;
      }
    },
    async switchNetwork() {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x89",
            chainName: "Polygon",
            rpcUrls: ["https://rpc-mainnet.matic.network"],
            nativeCurrency: {
              name: "MATIC",
              symbol: "MATIC",
              decimals: 18,
            },
            blockExplorerUrls: ["https://polygonscan.com/"],
          },
        ],
      });
      location.reload()
    },
    async disconnect() {
      const app = this;
      localStorage.removeItem("connected");
      app.account = "";
      app.balance = 0;
      location.reload();
    },
  }
};
</script>

<style>
#app {
  font-family: "JetBrains Mono", monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
* {
  font-family: "JetBrains Mono", monospace;
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
.on-mobile {
  display: none;
}
@media screen and (max-width: 1010px) {
  .account .button {
    width: 100% !important;
    margin-top: 20px !important;
  }
  .on-mobile {
    display: block !important;
  }
  .no-mobile {
    display: none !important;
  }
}
</style>
