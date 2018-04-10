var prepareSpell = (spell) => {
  spell.levelstr = Object.keys(spell.level).sort().map((spellClass) => {
    return `${spellClass}: ${spell.level[spellClass]}`;
  }).join(", ");

  spell.componentstr = spell.components.list.sort().map((component) => {
    var detail = spell.components.details[component];
    return `${component}${detail ? ` (${detail})` : ""}`;
  }).join(", ");

  Object.keys(spell).forEach((key) => {
    if (spell[key] === null || spell[key] === undefined) {
      spell[key] = "none";
    }
  });

  return spell;
};

var addCard = (spell) => {
  $("#spell-list").append(
    $("<div>", {
      "class": "mdl-card mdl-shadow--4dp",
      "style": "cursor: pointer;"
    })
    .append(
      $("<div>", {
        "class": "mdl-card__title"
      })
      .append(
        $("<h2>", {
          "class": "mdl-card__title-text",
          "text" : spell.name
        })
      )
    )
    .append(
      $("<div>", {
        "class": "mdl-card__supporting-text",
        "html" : `${spell.levelstr}<br>${spell.shortdesc}`
      })
    )
    .click((event) => {
      displaySpell(spell);
    })
  );
};

var displaySpell = (spell) => {
  var spellinfo = `<hr><b>Level:</b> ${spell.levelstr}<br>`;
  spellinfo += `<b>School:</b> ${spell.school}<hr>`;
  spellinfo += `<b>Restriction:</b> ${spell.restriction}<br>`;
  spellinfo += `<b>Casting Time:</b> ${spell.casttime}<br>`;
  spellinfo += `<b>Components:</b> ${spell.componentstr}<hr>`;
  spellinfo += `<b>Range:</b> ${spell.range}<br>`;
  spellinfo += `<b>Target:</b> ${spell.target}<br>`;
  spellinfo += `<b>Duration:</b> ${spell.duration}<hr>`;
  spellinfo += `<b>Saving Throw:</b> ${spell.save}<br>`;
  spellinfo += `<b>Spell Resistance:</b> ${spell.spellres}<hr>`;
  spellinfo += spell.longdesc;

  $("#spell-title").text(spell.name);
  $("#spell-link").attr("href", `https://www.archivesofnethys.com/${spell.link}`);
  $("#spell-info").html(spellinfo);
  $("#spell-card").fadeIn();
};

$(document).ready(() => {
  $("#spell-card").hide();
  $("#close-spell").click((event) => {
    $("#spell-card").fadeOut();
  });
  // TODO: call spells route, iterate over them and addCard each
  var spells = [
    {
      "casttime": "1 minute",
      "components": {
        "details": {
          "M": "a flask of holy water worth 25 gp"
        },
        "list": [
          "V",
          "S",
          "M",
          "DF"
        ]
      },
      "duration": "24 hours",
      "level": {
        "cleric": 2,
        "inquisitor": 2,
        "oracle": 2,
        "paladin": 2,
        "warpriest": 2
      },
      "link": "SpellDisplay.aspx?ItemName=Abeyance",
      "longdesc": "Abeyance suppresses the effects of a single curse on a creature. It does not restore any damage or drain that might have been caused by the curse. Abeyance cannot suppress curses that cannot be removed by remove curse, but it can suppress curses such as lycanthropy that require remove curse along with additional measures. An individual curse can be suppressed only once by abeyance, even if cast by a different caster.  Abeyance does not allow a creature to divest itself of cursed objects, though it can suppress a curse contracted from an object.",
      "name": "Abeyance",
      "range": "touch",
      "restriction": null,
      "save": "Will negates (harmless)",
      "school": "abjuration",
      "shortdesc": "Suppress the effects of a single curse.",
      "spellres": "yes (harmless)",
      "target": "creature touched"
    },
    {
      "casttime": "2 minutes",
      "components": {
        "details": {
          "M": "a flask of holy water worth 50 gp"
        },
        "list": [
          "V",
          "M"
        ]
      },
      "duration": "4 minutes",
      "level": {
        "sorcerer": 2,
        "wizard": 2
      },
      "link": "SpellDisplay.aspx?ItemName=Abeyance",
      "longdesc": "Abeyance2 suppresses the effects of a single curse on a creature. It does not restore any damage or drain that might have been caused by the curse. Abeyance cannot suppress curses that cannot be removed by remove curse, but it can suppress curses such as lycanthropy that require remove curse along with additional measures. An individual curse can be suppressed only once by abeyance, even if cast by a different caster.  Abeyance does not allow a creature to divest itself of cursed objects, though it can suppress a curse contracted from an object.",
      "name": "Abeyance2",
      "range": "touch",
      "restriction": null,
      "save": "Will negates (harmless)",
      "school": "abjuration",
      "shortdesc": "Suppress the effects of a single curse.",
      "spellres": "yes (harmless)",
      "target": "creature touched"
    }
  ];
  spells.forEach((spell) => {
    addCard(prepareSpell(spell));
  });
  // TODO: if filter is applied, hide anything that doesn't match
});
