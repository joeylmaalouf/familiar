var spells;
var spellList;
var spellCard;
var spellCardTitle;
var spellCardLink;
var spellCardInfo;
var filterToggle;
var filterBody;
var filterFields;

$(document).ready(() => {
  spellList      = $("#spell-list");
  spellCard      = $("#spell-card");
  spellCardTitle = $("#spell-title");
  spellCardLink  = $("#spell-link");
  spellCardInfo  = $("#spell-info");
  filterToggle   = $("#filter-toggle");
  filterBody     = $("#filter-body");
  filterFields   = $("[id^='filter-'][id$='-field']");

  spellCard.hide();
  closeFilters();

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      user.getIdToken().then((token) => {
        $.ajax({
          url: "/spells",
          headers : { "Authorization": "Bearer " + token }
        })
          .then((data) => {
            spells = data.map((spell) => { return spell.data; });
            $.ajax({
              "url"     : "/spells/custom/get",
              "type"    : "post",
              "data"    : {},
              "headers" : { "Authorization": "Bearer " + token },
              "dataType": "json"
            })
          .done((data) => {
            if (data.success) {
              Array.prototype.push.apply(spells, data.data.spells);
            }
            spells.sort((a, b) => {
              return a.name.toUpperCase().charCodeAt(0) - b.name.toUpperCase().charCodeAt(0);
            });
            $("#loading-spinner").hide();
            listSpells(spells);
          });
        });
      });
    }
  });

  $("#close-spell").click((event) => {
    spellCard.fadeOut();
  });

  $("#filter-button").click((event) => {
    applyFilters(spells);
  });
});

var prepareSpell = (spell) => {
  if (spell.hasOwnProperty("level")) {
    spell.levelstr = Object.keys(spell.level).sort().map((spellClass) => {
      return `${spellClass}: ${spell.level[spellClass]}`;
    }).join(", ");
  }

  if (spell.hasOwnProperty("components")) {
    spell.componentstr = spell.components.list.sort().map((component) => {
      var detail = spell.components.details[component];
      return `${component}${detail ? ` (${detail})` : ""}`;
    }).join(", ");
  }

  Object.keys(spell).forEach((key) => {
    if (spell[key] === null || spell[key] === undefined) {
      spell[key] = "none";
    }
  });

  return spell;
};

var addCard = (spell) => {
  spellList.append(
    $("<div>", {
      "class": "mdl-card mdl-shadow--4dp spell-card"
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

  spellCardTitle.text(spell.name);
  spellCardLink.attr("href", `https://www.archivesofnethys.com/${spell.link}`);
  spellCardInfo.html(spellinfo);
  spellCard.fadeIn();
};

var listSpells = (spells) => {
  spells.forEach((spell) => {
    addCard(prepareSpell(spell));
  });
};

var openFilters = () => {
  filterToggle
  .text("remove_circle_outline")
  .click(closeFilters);

  filterBody.show();

  spellList.css("height", "20vh");
};

var closeFilters = () => {
  filterToggle
  .text("add_circle_outline")
  .click(openFilters);

  filterBody.hide();

  spellList.css("height", "75vh");
};

var applyFilters = (spells) => {
  var filters = {};
  filterFields.each((index, element) => {
    if (element.value.length) {
      filters[element.id.split("-")[1]] = element.value.toUpperCase();
    }
  });
  var fields = Object.keys(filters);
  spellList.empty();
  listSpells(
    spells.filter((spell) => {
      return fields.every((field) => {
        switch (field) {
          case "desc":
            return spell.shortdesc.toUpperCase().includes(filters.desc) ||
                   spell.longdesc .toUpperCase().includes(filters.desc);
          case "components":
            var components = filters.components.split(",");
            if (components.length > 1) {
              return components.map((c) => c.trim())
              .every((component) => spell.components.list.includes(component));
            }
            else {
              return spell.componentstr.toUpperCase().includes(filters.components);
            }
          case "class":
            if (fields.includes("level")) {
              return Object.keys(spell.level)
              .filter((class_) => class_.toUpperCase().includes(filters.class))
              .some((class_) => spell.level[class_].toString().includes(filters.level));
            }
            else {
              return Object.keys(spell.level)
              .some((class_) => class_.toUpperCase().includes(filters.class));
            }
          case "level":
            if (fields.includes("class")) {
              return true; // actual logic taken care of above
            }
            else {
              return Object.values(spell.level).toString().includes(filters.level);
            }
          default:
            return spell[field].toUpperCase().includes(filters[field]);
        }
      });
      return true;
    })
  );
};
