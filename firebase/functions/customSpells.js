var routes = {};

var fieldsRequired = {
  "casttime"   : true ,
  "components" : false,
  "duration"   : true ,
  "level"      : true ,
  "link"       : false,
  "longdesc"   : false,
  "name"       : true ,
  "range"      : true ,
  "restriction": false,
  "save"       : true ,
  "school"     : false,
  "shortdesc"  : true ,
  "spellres"   : true ,
  "target"     : true
};

routes.add = (req, res) => {
  var spell = {};
  var success = true;

  for (var field in fieldsRequired) {
    var required = fieldsRequired[field];
    if (required && !(field in req.body)) {
      success = false;
      break;
    }
    spell[field] = req.body[field];

    if (field === "components") {
      var components = {
        "details": {},
        "list"   : []
      };
      components["list"] = spell["components"].split(",").map(s => s.trim());
      components["list"].forEach((component, index) => {
        var match = component.match(/^(.*)\((.*)\)$/);
        if (match) {
          components["list"][index] = match[1].trim();
          components["details"][match[1].trim()] = match[2].trim();
        }
      });
      spell["components"] = components;
    }
    else if (field === "level") {
      var level = {};
      var levels = spell["level"].split(",").map(s => s.trim());
      levels.forEach((levelPair) => {
        var pair = levelPair.split(":");
        pair[0].split("/").forEach((spellClass) => {
          level[spellClass.trim()] = parseInt(pair[1].trim());
        });
      });
      spell["level"] = level;
    }
  }

  res.json({
    "success": success
  });
};

module.exports = routes;
