const functions = require('firebase-functions');
const admin = require("firebase-admin");
const express = require("express");
const app = express();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

admin.initializeApp(functions.config().firebase);
var db = admin.firestore();

// Allow cross-origin requests
app.use(cors({origin: true}));

app.get('/', (request, response) => {
  response.send("Hello from Firebase!");
});

app.get('/spells', (request, response) => {
  db.collection("spells").get()
    .then(snapshot => {
      var all_spells = [];
      snapshot.forEach(doc => {
        all_spells.push({
          id: doc.id,
          data: doc.data()
        });
      });
      return response.send(all_spells);
    })
    .catch(err => {
      console.error(err);
    });
});

app.post('/spells', (request, response) => {
  var spells = request.body.spells;
  spells.forEach(spell => {
    db.collection("spells").add({
      name: spell.name,
      level: spell.level
    });
  });
});

exports.widgets = functions.https.onRequest(app);
