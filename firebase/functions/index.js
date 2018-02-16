const functions = require('firebase-functions');
const admin = require("firebase-admin");
const express = require("express");
const app = express();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

admin.initializeApp(functions.config().firebase);
var db = admin.firestore();

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});

exports.spells = functions.https.onRequest((request, response) => {
  if (request.method === "GET") {
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
  }
  else if (request.method === "POST") {
    request.body.spells.forEach(spell => {
      db.collection("spells").add({
        name: spell.name,
        level: spell.level
      });
    });
  }
});