const firebase_admin = require("firebase-admin");
var service_account = require("./firebase_key.json");
var express = require("express");
var app = express();

const PORT = process.env.PORT || 3000;

// Connect to Firebase Instance
firebase_admin.initializeApp({
  credential: firebase_admin.credential.cert(service_account)
});

var db = firebase_admin.firestore();

app.get("/", (req, res) => {
    res.send("Hello, world!");
});


app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);

    // File storage bucket not set up
    // var file_storage = firebase.storage();

    var all_spells = firebase_admin.firestore().collection("spells").get()
    .then(snapshot => {
        snapshot.forEach(doc => {
            console.log(doc.id, "=>", doc.data());
        });
    })
    .catch(err => {
        console.log("Error getting spells", err);
    });
});
