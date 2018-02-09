const functions = require('firebase-functions');
const admin = require("firebase-admin");
const express = require("express");

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

admin.initializeApp(functions.config().firebase);
var db = admin.firestore();

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});

exports.allSpells = functions.https.onRequest((request, response) => {
  var res = db.collection("spells").get()
    .then(snapshot => {
        var all_spells = [];
        snapshot.forEach(doc => {
          console.log(doc.id);
          all_spells.push({
            id: doc.id,
            data: doc.data()
          });
        });
        console.log("inside .then()", all_spells);
        return all_spells;
    })
    .catch(err => {
        console.error(err);
    });

  response.send(res);
});
