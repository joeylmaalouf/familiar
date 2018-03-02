const functions = require('firebase-functions');
const admin = require("firebase-admin");
const express = require("express");
const cookieParser = require('cookie-parser')();

const firebaseValidateMiddleware = (req, res, next) => {
  if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
    !req.cookies.__session) {
    console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
      'Make sure you authorize your request by providing the following HTTP header:',
      'Authorization: Bearer <Firebase ID Token>',
      'or by passing a "__session" cookie.');
    res.status(403).send('Unauthorized');
    return;
  }

  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    console.log('Found "Authorization" header');
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else {
    console.log('Found "__session" cookie');
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  }
  admin.auth().verifyIdToken(idToken).then((decodedIdToken) => {
    console.log('ID Token correctly decoded', decodedIdToken);
    req.user = decodedIdToken;
    return next();
  }).catch((error) => {
    console.error('Error while verifying Firebase ID token:', error);
    res.status(403).send('Unauthorized');
  });
};

admin.initializeApp(functions.config().firebase);
var db = admin.firestore();

const spellbooksApp = express();
spellbooksApp.use(cookieParser);
spellbooksApp.use(firebaseValidateMiddleware);
spellbooksApp.get('/', (req, res) => {
  db.collection("users").doc(req.user.user_id).collection("spellbooks").get().then(snapshot => {
    var spellbookNames = [];
    snapshot.forEach(doc => {
      spellbookNames.push({
        id: doc.id,
        data: doc.data()
      });
    });
    return res.send(spellbookNames);
  }).catch(err => {
    console.error(err);
    res.status(500).send(err);
  });
});
spellbooksApp.post('/', (req, res) => {
  if (req.body) {
    var spellbookName = req.body.name;
    logUserAction(req.user, "Creating Spellbook " + spellbookName);
    db.collection("users").doc(req.user.uid).collection("spellbooks").add({name: spellbookName}).then(snapshot => {
      return res.send(spellbookName);
    }).catch(err => {
      console.error(err);
      res.status(500).send(err);
    });
  } else {
    res.status(400).send("No POST data sent");
  }
});
spellbooksApp.delete('/', (req, res) => {
  if (req.body && req.body.uid !== undefined) {
    var uid = req.body.uid;
    logUserAction(req.user, "Deleting Spellbook " + uid);
    db.collection("users").doc(req.user.uid).collection("spellbooks").doc(uid).delete().then(snapshot => {
      return res.send(uid);
    }).catch(err => {
      console.error(err);
      res.status(500).send(err);
    });
  } else {
    res.status(400).send("No DELETE data sent");
  }
});

const main = express();
main.use('/spellbooks', spellbooksApp);
exports.main = functions.https.onRequest(main);

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
        response.status(500).send(err);
    });
  }
  else if (request.method === "POST") {
    var spells = request.body.spells;
    console.log(spells);
    if (spells !== undefined) {
      if (Array.isArray(spells)) {
        spells.forEach(spell => {
          addSpell(spell);
        });
      } else {
        addSpell(spells);
      }

      response.json({
        success: true,
        error: ""
      });
    } else {
      response.json({
        success: false,
        error: "No spell data detected."
      });
    }
  }
});

function addSpell(spell) {
  db.collection("spells").add({
    name: spell.name,
    level: spell.data.level
  });
}

exports.createUserCollection = functions.auth.user().onCreate((event) => {
  return db.collection('users').doc(event.data.uid).set({});
});

function logUserAction(user, msg) {
  console.log("[" + user.uid + " (" + user.name + "}] "  + msg);
}
