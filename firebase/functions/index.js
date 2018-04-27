const functions = require('firebase-functions');
const admin = require("firebase-admin");
const express = require("express");
const cookieParser = require('cookie-parser')();
var bodyParser = require('body-parser');

const customSpells = require('./customSpells.js');


const firebaseValidateMiddleware = (req, res, next) => {
  if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
    !req.cookies.__session) {
    res.status(403).send('Unauthorized');
    return;
  }

  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else {
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  }
  admin.auth().verifyIdToken(idToken).then((decodedIdToken) => {
    req.user = decodedIdToken;
    return next();
  }).catch((error) => {
    res.status(403).send('Unauthorized');
  });
};

const prepareApp = (app) => {
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cookieParser);
  app.use(firebaseValidateMiddleware);
  return app;
};

admin.initializeApp(functions.config().firebase);
var db = admin.firestore();

const spellbooksApp = express();
spellbooksApp.use(cookieParser);
spellbooksApp.use(firebaseValidateMiddleware);
spellbooksApp.get('/', (req, res) => {
  if (req.query && req.query.uid) {
    db.collection("users").doc(req.user.user_id).collection("spellbooks").doc(req.query.uid).get()
      .then(doc => {
        if (doc.exists) {
          getCollectionsOfDoc(
            db.collection("users").doc(req.user.user_id).collection("spellbooks").doc(req.query.uid),
            collections_data => {
              collections_data["spellbook-data"] = doc.data();
              res.send(collections_data);
            });
          return true;
        } else {
          return res.status(400).send("Could not find requested spellbook.");
        }
      })
      .catch(err => {
        console.error(err);
        return res.status(500).send("Error retrieving spellbook.");
      });
  } else {
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
  }
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
      return res.status(500).send(err);
    });
  } else {
    return res.status(400).send("No DELETE data sent");
  }
});
spellbooksApp.post('/:uid', (req, res) => {
  var spellbook_uid = req.params.uid;
  var spells_collection = db.collection("users").doc(req.user.uid).collection("spellbooks").doc(spellbook_uid).collection("stored-spells");
  var spells_to_add = req.body.spells || {};
  var batch = db.batch();

  // Update db to match state pushed by user
  for (spell_uid in spells_to_add) {
    if (spells_to_add.hasOwnProperty(spell_uid)) {
      var set_doc = spells_collection.doc(spell_uid);
      batch.set(set_doc, {
        "uid": spell_uid,
        "name": spells_to_add[spell_uid].name,
        "count": spells_to_add[spell_uid].count,
        "level": spells_to_add[spell_uid].level
      });
    }
  }

  // Delete spells which are not in the state pushed by the user
  spells_collection.get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        if (!Object.keys(spells_to_add).includes(doc.get("uid"))) {
          batch.delete(spells_collection.doc(doc.id));
        }
      });
      return true;
    })
    .then(function () {
      return batch.commit()
        .then(batch_res => {
          logUserAction(req.user, "Saved spellbook " + spellbook_uid);
          return res.send("Spellbook saved");
        })
        .catch(err => {
          console.error(err);
          res.status(500).send(err);
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send(err);
    });
});

const main = express();
main.use('/spellbooks', spellbooksApp);
exports.main = functions.https.onRequest(main);

exports.spells = functions.https.onRequest((request, response) => {
  if (request.method === "GET") {

    //Get the full list of spells
    db.collection("spells").get()
    .then(snapshot => {
      var all_spells = [];
      snapshot.forEach(doc => {
        all_spells.push({
          id: doc.id,
          data: doc.data()
        });
      });
      //check to see if the request calls for all spells or has a filter
      if (Object.keys(request.query).length) {
        filtered_spells = [];
        for (var i = 0; i < all_spells.length; i++) { //iterate through spell list
          keys = Object.keys(request.query)
          include_spell = true;
          spell = all_spells[i];
          for (var j = 0; j < keys.length; j++){
            if (request.query[keys[j]] !== spell.data[keys[j]]){
              include_spell = false; // One feature of the spell is missing
              break;
            }
          }
          if (include_spell){
            filtered_spells.push(all_spells[i]);
          }
        }
        return response.send(filtered_spells);
      }
      else{
          return response.send(all_spells);
      }
    })
    .catch(err => {
        console.error(err);
        response.status(500).send(err);
    });
  }
  else if (request.method === "POST") {
    var spells = request.body.spells;
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
    casttime: spell.casttime,
    components: spell.components,
    level: spell.level,
    link: spell.link,
    longdesc: spell.longdesc,
    name: spell.name,
    range: spell.range,
    restriction: spell.restriction,
    save: spell.save,
    school: spell.school,
    shortdesc: spell.shortdesc,
    spellres: spell.spellres,
    target: spell.target
  });
}

exports.createUserCollection = functions.auth.user().onCreate((event) => {
  return db.collection('users').doc(event.data.uid).set({});
});

const customSpellsApp = prepareApp(express());
customSpellsApp.post("/spells/custom/add", customSpells.add.bind(null, db));
customSpellsApp.post("/spells/custom/get", customSpells.get.bind(null, db));
exports.customSpells = functions.https.onRequest(customSpellsApp);

const spellListsApp = express();
spellListsApp.get("/spells/lists", (req, res) => {
  res.json([
    "bard", "cleric/oracle", "druid", "paladin", "ranger", "sorcerer/wizard", // core      classes
    "alchemist", "inquisitor", "magus", "summoner", "witch",                  // base      classes
    "antipaladin",                                                            // alternate classes
    "bloodrager", "shaman",                                                   // hybrid    classes
    "medium", "mesmerist", "occultist", "psychic", "spiritualist",            // occult    classes
    "summoner (unchained)"                                                    // unchained classes
  ]);
});
exports.spellLists = functions.https.onRequest(spellListsApp);

function logUserAction(user, msg) {
  console.log("[" + user.uid + " (" + user.name + "}] "  + msg);
}

function getCollectionsOfDoc(doc, callback) {
  var res = {};
  if (doc !== null) {
    doc.getCollections()
      .then(collections => {
        if (collections.length) {
          collections.forEach(collection => {
            collection.get()
              .then(snapshot => {
                var docs = {};
                snapshot.forEach(doc => {
                  docs[doc.id] = doc.data();
                });
                res[collection.id] = docs;
                callback(res);
                return res;
              })
              .catch(err => {
                console.error(err);
              });
          });
        } else {
          return callback(res);
        }
        return res;
      })
      .catch(err => {
        console.error(err);
      });

    return res;
  } else {
    return null;
  }
}
