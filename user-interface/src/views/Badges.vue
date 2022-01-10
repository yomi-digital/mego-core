<template>
  <div class="container">
    <div class="columns" v-if="loading">
      <div class="column" style="text-align: center; padding: 40vh 0">
        Searching on the blockchain...
      </div>
    </div>
    <!-- LIST VIEW -->
    <div class="row" v-if="section === 'list'" style="margin-top: 80px">
      <div v-if="!loading && created.length === 0 && received.length === 0">
        <h3 class="title is-3">Introduction to Badges</h3>
        <p>
          Thanks to badges you're able to create "POAP" like NFTs, which can be
          transferred to users directly by your account or can be claimed
          directly by users inserted in a specific whitelist.<br /><br />
          Each badge is not transferable and can be transferred or claimed in a
          specific time-frame.<br /><br />
          To start creating badges you've to create an event first, which will
          be displayed as an ERC-1155 (collectible) token on OpenSea.
          <br /><br />
          <b>This service is completely free.</b>
        </p>
        <hr />
        <b-button type="is-primary bigbutton" v-on:click="section = 'new'"
          >REGISTER YOUR FIRST EVENT</b-button
        >
      </div>
      <div
        v-if="!loading && (created.length > 0 || received.length > 0)"
        style="text-align: left"
      >
        <h3 class="title is-3">
          Your events
          <a href="#" v-on:click="section = 'new'"
            ><b-icon style="float: right" class="is-large" icon="plus"></b-icon
          ></a>
        </h3>
        <hr />
        <table class="table" style="width: 100%; text-align: center">
          <thead>
            <tr>
              <th>Name</th>
              <th>Start at</th>
              <th>End at</th>
              <th>Balance</th>
              <th>Transfer</th>
              <th>Mint</th>
              <th>Whitelist</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="event in created" v-bind:key="event.tokenId">
              <td>
                <a v-if="parseInt(event.balance) === 0" href="#">{{
                  event.name
                }}</a>
                <a
                  v-if="parseInt(event.balance) > 0"
                  :href="
                    'https://opensea.io/assets/matic/' +
                    badgeContract +
                    '/' +
                    event.tokenId
                  "
                  target="_blank"
                >
                  {{ event.name }}
                </a>
              </td>
              <td>{{ event.start_datetime }}</td>
              <td>{{ event.end_datetime }}</td>
              <td>{{ event.balance }}</td>
              <td>
                <a
                  href="#"
                  v-on:click="
                    selected = event;
                    section = 'transfer';
                  "
                  ><b-icon icon="share"></b-icon
                ></a>
              </td>
              <td>
                <a
                  href="#"
                  v-on:click="
                    selected = event;
                    section = 'mint';
                  "
                  ><b-icon
                    icon="asterisk"
                    v-if="
                      new Date().getTime() > parseInt(event.start_timestamp)
                    "
                  ></b-icon
                ></a>
                <div
                  v-if="new Date().getTime() < parseInt(event.start_timestamp)"
                >
                  Can't mint before start
                </div>
              </td>
              <td>
                <a
                  href="#"
                  v-on:click="
                    selected = event;
                    section = 'whitelist';
                  "
                  ><b-icon icon="account-box-multiple"></b-icon
                ></a>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="created.length === 0" style="text-align: center">
          You haven't created any badge yet.
        </div>
        <hr />
      </div>
      <div v-if="!loading && received.length > 0" style="text-align: left">
        <h3 class="title is-3">Received badges</h3>
        <hr />
        <div
          v-for="event in received"
          v-bind:key="event.tokenId"
          class="name"
          style="
            width: 30%;
            margin: 1.5%;
            display: inline-block;
            border: 1px solid #eee;
            border-radius: 5px;
          "
        >
          <img
            :src="event.image.replace('ipfs://', ipfsEndpoint)"
            width="100%"
          /><br />
          <div style="padding: 15px">
            {{ event.name }}
            <a
              :href="
                'https://opensea.io/assets/matic/' +
                badgeContract +
                '/' +
                event.tokenId
              "
              target="_blank"
              style="float: right"
              ><b-icon icon="share"></b-icon
            ></a>
          </div>
        </div>
      </div>
    </div>
    <!-- NEW VIEW -->
    <div class="row" v-if="section === 'new'" style="margin-top: 80px">
      <h3 class="title is-3" style="text-align: left">
        Create new event
        <a href="#" v-on:click="section = 'list'"
          ><b-icon
            style="float: left; margin-top: -8px"
            class="is-large"
            icon="arrow-left"
          ></b-icon
        ></a>
      </h3>
      <div v-if="!ipfsHash">
        <b-field label="Name of the event">
          <b-input v-model="event.name"></b-input>
        </b-field>
        <b-field label="Start date and time">
          <b-datetimepicker
            v-model="event.startime"
            placeholder="Click to select start date and time..."
            icon="calendar-today"
            icon-right-clickable
            @icon-right-click="event.startime = ''"
            horizontal-time-picker
            :min-datetime="minDateTime"
          >
          </b-datetimepicker>
        </b-field>
        <b-field label="End date and time">
          <b-datetimepicker
            v-model="event.endtime"
            placeholder="Click to select end date and time..."
            icon="calendar-today"
            icon-right-clickable
            @icon-right-click="event.endtime = ''"
            horizontal-time-picker
          >
          </b-datetimepicker>
        </b-field>
        <b-field label="Description">
          <b-input v-model="event.description" type="textarea"></b-input>
        </b-field>
        <b-field label="Event image">
          <b-upload v-model="event.image" v-if="!event.image.name" drag-drop>
            <section class="section">
              <div class="content has-text-centered">
                <p>
                  <b-icon icon="upload" size="is-large"> </b-icon>
                </p>
                <p>Drop your image here or click to upload</p>
              </div>
            </section>
          </b-upload>
          <div v-if="event.image.name">
            Selected file: <b>{{ event.image.name }}</b>
          </div>
        </b-field>
        <b-button
          v-if="!ipfsHash && !isUploading"
          type="is-primary bigbutton"
          v-on:click="upload()"
          >PREPARE METADATA</b-button
        >
        <div v-if="isUploading">Uploading metadata to IPFS, please wait..</div>
      </div>
      <div v-if="ipfsHash">
        IPFS hash is: <b>{{ ipfsHash }}</b
        >,<br />
        please double check everything is correct
        <a :href="ipfsEndpoint + ipfsHash" target="_blank">here</a>
        <hr />
        If you're ready to register it please click following button and confirm
        operation on Metamask.<br />
        Once the event is created you'll be able to mint it or add your
        whitelist.<br /><br />
        <b-button
          v-if="!isPreparing"
          type="is-primary bigbutton"
          v-on:click="prepare()"
          >REGISTER EVENT</b-button
        >
        <div v-if="isPreparing">Please confirm the operation in Metamask..</div>
        <div v-if="pendingTx">
          <hr />
          Waiting for confirmation at {{ pendingTx }}..
        </div>
      </div>
    </div>
    <!-- WHITELIST VIEW -->
    <div class="row" style="margin-top: 80px" v-if="section === 'whitelist'">
      <h3 class="title is-3" style="text-align: left">
        Manage whitelist
        <a href="#" v-on:click="section = 'list'"
          ><b-icon
            style="float: left; margin-top: -8px"
            class="is-large"
            icon="arrow-left"
          ></b-icon
        ></a>
      </h3>
      <hr />
      <b-field
        label="Write down the list of the address to whitelist, 1 address per line, max 100"
      >
        <b-input v-model="toWhitelist" type="textarea"></b-input>
      </b-field>
      <b-button
        v-if="!isWhitelisting"
        type="is-primary bigbutton"
        v-on:click="whitelist()"
        v-bind:disabled="parsedWhiteList.length <= 0"
        >WHITELIST PROVIDED ACCOUNTS</b-button
      >
      <div v-if="parsedWhiteList.length > 0">
        <br />
        You're whitelisting {{ parsedWhiteList.length }} accounts.
      </div>
      <div v-if="isWhitelisting">
        Please confirm the operation in Metamask..
      </div>
      <div v-if="pendingTx">
        <hr />
        Waiting for confirmation at {{ pendingTx }}..
      </div>
      <hr />
      Use following link to allow addresses redeem their token:<br />
      <a
        :href="'https://polygonme.xyz/#/redeem/' + selected.tokenId"
        target="_blank"
        >https://polygonme.xyz/#/redeem/{{ selected.tokenId }}</a
      >
    </div>
    <!-- MINT VIEW -->
    <div class="row" style="margin-top: 80px" v-if="section === 'mint'">
      <h3 class="title is-3" style="text-align: left">
        Mint new badges
        <a href="#" v-on:click="section = 'list'"
          ><b-icon
            style="float: left; margin-top: -8px"
            class="is-large"
            icon="arrow-left"
          ></b-icon
        ></a>
      </h3>
      <hr />
      <b-field label="Select the amount of badges to mint">
        <b-input type="number" v-model="toMint"></b-input>
      </b-field>
      <b-button
        v-if="!isMinting"
        type="is-primary bigbutton"
        v-on:click="mint()"
        v-bind:disabled="toMint <= 0"
        >MINT BADGES</b-button
      >
      <div v-if="isMinting">Please confirm the operation in Metamask..</div>
      <div v-if="pendingTx">
        <hr />
        Waiting for confirmation at {{ pendingTx }}..
      </div>
    </div>
    <!-- TRANSFER VIEW -->
    <div class="row" style="margin-top: 80px" v-if="section === 'transfer'">
      <h3 class="title is-3" style="text-align: left">
        Transfer badges
        <a href="#" v-on:click="section = 'list'"
          ><b-icon
            style="float: left; margin-top: -8px"
            class="is-large"
            icon="arrow-left"
          ></b-icon
        ></a>
      </h3>
      <hr />
      <b-field
        label="Write down the list of the address to send, 1 address per line"
      >
        <b-input v-model="toSend" type="textarea"></b-input>
      </b-field>
      <b-button
        v-if="!isSending"
        type="is-primary bigbutton"
        v-on:click="send()"
        v-bind:disabled="parsedSendingList.length <= 0"
        >SEND BADGES</b-button
      >
      <div v-if="parsedSendingList.length > 0">
        <br />
        You're sending badges to {{ parsedSendingList.length }} accounts.
      </div>
      <div v-if="isSending">Please confirm the operation in Metamask..</div>
      <div v-if="pendingTx">
        <hr />
        Waiting for confirmation of transfer to {{ whatSending }} at
        {{ pendingTx }}..
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
      isUploading: false,
      isPreparing: false,
      isMinting: false,
      isSending: false,
      isWhitelisting: false,
      axios: axios,
      created: [],
      received: [],
      section: "list",
      event: {
        name: "",
        description: "",
        image: [],
        startime: "",
        endtime: "",
      },
      minDateTime: "",
      ipfsHash: "",
      pendingTx: "",
      selected: {},
      toMint: 1,
      toSend: "",
      whatSending: "",
      parsedSendingList: [],
      toWhitelist: "",
      parsedWhiteList: [],
    };
  },
  watch: {
    toSend() {
      const app = this;
      app.parsedSendingList = app.toSend.split("\n");
    },
    toWhitelist() {
      const app = this;
      app.parsedWhiteList = app.toWhitelist.split("\n");
    },
  },
  methods: {
    async upload() {
      const app = this;
      if (!app.isUploading) {
        app.isUploading = true;
        const formData = new FormData();
        formData.append("file", app.event.image);
        formData.append("name", app.event.name);
        formData.append("description", app.event.description);
        formData.append("start_timestamp", app.event.startime.getTime());
        formData.append("end_timestamp", app.event.endtime.getTime());
        try {
          const metadata = await axios({
            method: "post",
            url: app.badgeAPI + "/upload",
            data: formData,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          app.ipfsHash = metadata.data.ipfsHash;
          app.isUploading = false;
        } catch (e) {
          app.isUploading = false;
          alert(e.message);
        }
      }
    },
    async prepare() {
      const app = this;
      if (!app.isPreparing) {
        app.isPreparing = true;
        const nftContract = new app.web3.eth.Contract(ABI, app.badgeContract);
        app.created = [];
        const normalizedStart = parseInt(app.event.startime.getTime() / 1000);
        const normalizedEnd = parseInt(app.event.endtime.getTime() / 1000);
        try {
          const gasPrice = (await app.web3.eth.getGasPrice()) * 2;
          await nftContract.methods
            .prepare(
              normalizedStart.toString(),
              normalizedEnd.toString(),
              app.ipfsHash
            )
            .send({
              from: app.account,
              gasPrice: gasPrice,
            })
            .on("transactionHash", (tx) => {
              app.pendingTx = tx;
            });
          app.isUploading = false;
          alert("You've successfully registered an event!");
          location.reload();
        } catch (e) {
          alert(e.message);
          app.isUploading = false;
        }
      }
    },
    async mint() {
      const app = this;
      if (app.toMint > 0 && !app.isMinting) {
        app.isMinting = true;
        const nftContract = new app.web3.eth.Contract(ABI, app.badgeContract);
        try {
          const gasPrice = (await app.web3.eth.getGasPrice()) * 2;
          await nftContract.methods
            .mint(app.selected.tokenId, app.toMint)
            .send({
              from: app.account,
              gasPrice: gasPrice,
            })
            .on("transactionHash", (tx) => {
              app.pendingTx = tx;
            });
          app.isMinting = false;
          alert("You've successfully minted your badges!");
          location.reload();
        } catch (e) {
          alert(e.message);
          app.isMinting = false;
        }
      }
    },
    async send() {
      const app = this;
      if (app.parsedSendingList.length > 0 && !app.isSending) {
        app.isSending = true;
        const nftContract = new app.web3.eth.Contract(ABI, app.badgeContract);
        for (let k in app.parsedSendingList) {
          const receiver = app.parsedSendingList[k];
          try {
            const check = await nftContract.methods
              .balanceOf(receiver, app.selected.tokenId)
              .call();
            if (parseInt(check) === 0) {
              app.whatSending = receiver;
              const gasPrice = (await app.web3.eth.getGasPrice()) * 2;
              await nftContract.methods
                .transferBadge(receiver, "", app.selected.tokenId)
                .send({
                  from: app.account,
                  gasPrice: gasPrice,
                })
                .on("transactionHash", (tx) => {
                  app.pendingTx = tx;
                });
              alert("Badge sent successfully to " + receiver + "!");
              app.pendingTx = "";
            }
          } catch (e) {
            alert(e.message);
            app.isSending = false;
            app.pendingTx = "";
          }
        }
        app.isSending = false;
        app.pendingTx = "";
        alert("Entire list was processed!");
      }
    },
    async whitelist() {
      const app = this;
      if (app.parsedWhiteList.length > 0 && !app.isWhitelisting) {
        app.isWhitelisting = true;
        const nftContract = new app.web3.eth.Contract(ABI, app.badgeContract);
        try {
          const gasPrice = (await app.web3.eth.getGasPrice()) * 2;
          await nftContract.methods
            .manageAddressWhitelist(
              app.selected.tokenId,
              app.parsedWhiteList,
              true,
              0
            )
            .send({
              from: app.account,
              gasPrice: gasPrice,
            })
            .on("transactionHash", (tx) => {
              app.pendingTx = tx;
            });
          alert("All addresses were whitelisted!");
          app.pendingTx = "";
          app.isWhitelisting = false;
        } catch (e) {
          alert(e.message);
          app.isWhitelisting = false;
          app.pendingTx = "";
        }
      }
    },
  },
  async mounted() {
    const app = this;
    app.minDateTime = new Date();
    app.event.startime = new Date(Date.now() + 60 * 30 * 1000);
    app.event.endtime = new Date(Date.now() + 6.048e8);
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
    const created = await nftContract.methods.created(app.account).call();
    if (created.length > 0) {
      for (let k in created) {
        const tokenCID = await nftContract.methods.tokenCID(created[k]).call();
        const balance = await nftContract.methods
          .balanceOf(app.account, created[k])
          .call();
        const metadata = await app.axios.get(app.ipfsEndpoint + tokenCID);
        metadata.data.tokenId = created[k];
        metadata.data.tokenCID = tokenCID;
        metadata.data.balance = balance;
        app.created.push(metadata.data);
      }
    }
    const received = await nftContract.methods.received(app.account).call();
    if (received.length > 0) {
      for (let k in received) {
        const tokenCID = await nftContract.methods.tokenCID(received[k]).call();
        const metadata = await app.axios.get(app.ipfsEndpoint + tokenCID);
        metadata.data.tokenId = created[k];
        metadata.data.tokenCID = tokenCID;
        app.received.push(metadata.data);
      }
    }
    app.loading = false;
  },
};
</script>
