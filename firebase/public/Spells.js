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

var openFilters = () => {
  $("#filter-toggle")
  .text("remove_circle_outline")
  .click(closeFilters);

  $("#filter-body").show();
};

var closeFilters = () => {
  $("#filter-toggle")
  .text("add_circle_outline")
  .click(openFilters);

  $("#filter-body").hide();
};

$(document).ready(() => {
  $("#spell-card").hide();
  closeFilters();

  $("#close-spell").click((event) => {
    $("#spell-card").fadeOut();
  });

  $.get("/spells").then((data) => {
    $("#loading-spinner").hide();
    data.forEach((spell) => {
      addCard(prepareSpell(spell.data));
    });
  });
});

// TODO: if filter is applied, hide anything that doesn't match
