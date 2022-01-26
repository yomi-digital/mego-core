const AWS = require("aws-sdk");
const express = require("express");
const serverless = require("serverless-http");
const mailgun = require("mailgun-js");
const web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const cors = require('cors');

const USERS_TABLE = process.env.USERS_TABLE;
const dynamoDbClientParams = {};
if (process.env.IS_OFFLINE) {
  dynamoDbClientParams.region = 'localhost'
  dynamoDbClientParams.endpoint = 'http://localhost:8000'
}
const dynamoDbClient = new AWS.DynamoDB.DocumentClient(dynamoDbClientParams);
const SECRET = process.env.SECRET;
const DOMAIN = process.env.MG_DOMAIN;
const KEY = process.env.MG_KEY;

const app = express();
app.use(cors());
const mg = mailgun({ apiKey: KEY, domain: DOMAIN });

app.use(express.json());

function createRedemptionCode(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}

function createNameVerificationRequest(req) {
  return new Promise(async response => {
    try {
      const { Item } = await dynamoDbClient.get({
        TableName: USERS_TABLE,
        Key: {
          userId: req.params.userId,
        },
      }).promise();
      if (Item && !Item.verified) {
        const redemptionCode = createRedemptionCode(24)
        dynamoDbClient.update({
          TableName: USERS_TABLE,
          Key: {
            userId: req.params.userId,
          },
          UpdateExpression: "set secret = :s",
          ExpressionAttributeValues: {
            ":s": redemptionCode
          },
          ReturnValues: "UPDATED_NEW"
        }, function (err, data) {
          if (err) {
            res.json({ message: "Something goes wrong, please retry." })
          } else {
            mg.messages().send({
              from: 'PolygonME Verification BOT <noreply@' + DOMAIN + '>',
              to: Item.email,
              subject: 'Verify the ownership of your e-mail.',
              html: 'Thank you, this your redemption code: ' + redemptionCode
            }, function (error, body) {
              if (error) {
                response({ message: "Something goes wrong, please reply." });
              } else {
                response({ message: "Please verify your e-mail now." });
              }
            })
          }
        });
      } else if (Item.verified) {
        response({ error: 'This account have been verified yet' });
      } else {
        response({ error: 'Could not find user with provided "userId"' });
      }
    } catch (error) {
      console.log(error);
      response({ error: "Could not ask verification" });
    }
  })
}

function createEventVerificationRequest(req) {
  return new Promise(async response => {
    try {
      const { Item } = await dynamoDbClient.get({
        TableName: USERS_TABLE,
        Key: {
          eventId: req.params.eventId,
        },
      }).promise();
      if (Item && !Item.verified) {
        const redemptionCode = createRedemptionCode(24)
        dynamoDbClient.update({
          TableName: USERS_TABLE,
          Key: {
            eventId: req.params.eventId,
          },
          UpdateExpression: "set secret = :s",
          ExpressionAttributeValues: {
            ":s": redemptionCode
          },
          ReturnValues: "UPDATED_NEW"
        }, function (err, data) {
          if (err) {
            res.json({ message: "Something goes wrong, please retry." })
          } else {
            mg.messages().send({
              from: 'PolygonME Verification BOT <noreply@' + DOMAIN + '>',
              to: Item.email,
              subject: 'Verify the ownership of your e-mail.',
              html: 'Thank you, this your redemption code: ' + redemptionCode
            }, function (error, body) {
              if (error) {
                response({ message: "Something goes wrong, please reply." });
              } else {
                response({ message: "Please verify your e-mail now." });
              }
            })
          }
        });
      } else if (Item.verified) {
        response({ error: 'This account have been verified yet' });
      } else {
        response({ error: 'Could not find user with provided "userId"' });
      }
    } catch (error) {
      console.log(error);
      response({ error: "Could not ask verification" });
    }
  })
}

app.get("/users/:userId", async function (req, res) {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId: req.params.userId,
    },
  };

  try {
    const { Item } = await dynamoDbClient.get(params).promise();
    if (Item) {
      res.json({
        verified: Item.verified,
        address: Item.address,
        redeemed: Item.redeemed,
        signature: Item.signature
      });
    } else {
      res
        .status(404)
        .json({ error: 'Could not find user with id provided.' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retreive user" });
  }
});

app.post("/user", async function (req, res) {
  const { userId, email, secret } = req.body;
  if (secret === SECRET) {
    if (userId === undefined) {
      res.status(400).json({ error: 'Malformed request' });
    } else if (typeof email !== "string") {
      res.status(400).json({ error: '"name" must be a string' });
    }

    try {
      await dynamoDbClient.put({
        TableName: USERS_TABLE,
        Item: {
          userId: userId,
          email: email,
          verified: false,
          address: "",
          signature: '',
          redeemed: false,
          secret: ""
        },
      }).promise();
      res.json({ message: "User added correctly.", error: false });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Could not create user" });
    }
  } else {
    res.status(401).json({ error: "Not authorized" })
  }
});

app.post("/event", async function (req, res) {
  const { eventId, email, secret } = req.body;
  if (secret === SECRET) {
    if (eventId === undefined) {
      res.status(400).json({ error: 'Malformed request' });
    } else if (typeof email !== "string") {
      res.status(400).json({ error: '"name" must be a string' });
    }
    try {
      await dynamoDbClient.put({
        TableName: USERS_TABLE,
        Item: {
          userId: eventId,
          email: email,
          verified: false,
          address: "",
          signature: '',
          redeemed: false,
          secret: ""
        },
      }).promise();
      res.json({ message: "Event added correctly.", error: false });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Could not create event" });
    }
  } else {
    res.status(401).json({ error: "Not authorized" })
  }
});

app.get("/ask/name/:userId", async function (req, res) {
  const response = await createNameVerificationRequest(req)
  res.json(response)
});

app.get("/ask/event/:eventId", async function (req, res) {
  const response = await createEventVerificationRequest(req)
  res.json(response)
});

// Claim event
app.post("/claim/:eventId", async function (req, res) {
  try {
    const { Item } = await dynamoDbClient.get({
      TableName: USERS_TABLE,
      Key: {
        eventId: req.params.eventId,
      },
    }).promise();
    if (Item) {
      const provider = new HDWalletProvider(
        process.env.DUMMY_MNEMONIC,
        process.env.POLYGON_PROVIDER
      );
      const web3Instance = new web3(provider);
      const verified = await web3Instance.eth.personal.ecRecover(req.body.secret, req.body.signature)
      if (verified.toUpperCase() === req.body.address.toUpperCase()) {
        dynamoDbClient.update({
          TableName: USERS_TABLE,
          Key: {
            eventId: req.params.eventId,
          },
          UpdateExpression: "set verified = :v, address = :a, signature = :s",
          ExpressionAttributeValues: {
            ":v": true,
            ":a": req.body.address,
            ":s": req.body.signature
          },
          ReturnValues: "UPDATED_NEW"
        }, function (err, data) {
          if (err) {
            res.status(500).json({ message: "Something goes wrong, please retry." })
          } else {
            // TODO: Send the NFT to the user
          }
        });
      } else {
        res.status(200).json({ error: "Can't verify your signature, please send valid data." });
      }
    } else {
      res
        .status(404)
        .json({ error: 'Could not find user with provuserIded "userId"' });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Something goes wrong, please retry" });
  }
});

// Verify userId
app.post("/verify/:userId", async function (req, res) {
  try {
    const { Item } = await dynamoDbClient.get({
      TableName: USERS_TABLE,
      Key: {
        userId: req.params.userId,
      },
    }).promise();
    if (Item) {
      const provider = new HDWalletProvider(
        process.env.DUMMY_MNEMONIC,
        process.env.POLYGON_PROVIDER
      );
      const web3Instance = new web3(provider);
      const verified = await web3Instance.eth.personal.ecRecover(req.body.secret, req.body.signature)
      if (verified.toUpperCase() === req.body.address.toUpperCase()) {
        dynamoDbClient.update({
          TableName: USERS_TABLE,
          Key: {
            userId: req.params.userId,
          },
          UpdateExpression: "set verified = :v, address = :a, signature = :s",
          ExpressionAttributeValues: {
            ":v": true,
            ":a": req.body.address,
            ":s": req.body.signature
          },
          ReturnValues: "UPDATED_NEW"
        }, function (err, data) {
          if (err) {
            res.json({ message: "Something goes wrong, please retry." })
          } else {
            mg.messages().send({
              from: 'PolygonME Verification BOT <noreply@' + DOMAIN + '>',
              to: process.env.ADMIN_EMAIL,
              subject: 'Name verified, need to send it.',
              html: 'Need to send: ' + Item.userId + ' to ' + req.body.address
            }, function (error, body) {
              if (error) {
                res.status(200).json({ message: "Something goes wrong, please reply." });
              } else {
                res.status(200).json({ message: "Proof of address passed, we'll send the NFT to " + req.body.address + "." });
              }
            })
          }
        });
      } else {
        res.status(200).json({ error: "Can't verify your signature, please send valid data." });
      }
    } else {
      res
        .status(404)
        .json({ error: 'Could not find user with provuserIded "userId"' });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Something goes wrong, please retry" });
  }
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
