var token;
var spells;
var learnt_spells = {};
var selected_spell_lists = [];
var pending_selected_spell_lists = [];
var selected_list_classes = [];

$(document).ready(function() {
  var dialog = document.querySelector("#choose-class-dialog");
  var dialogButton = document.querySelector("#choose-class");

  fetchSpellLists();
  fetchAllSpells();

  var selectedSpellUID = undefined;
  var selectedSpellName = undefined;
  var selectedSpellLevel = undefined;
  $("#save-spellbook").click(function(event) {
    $("#save-spellbook").trigger("familiar.save-spellbook");
  });
  $("#switch-to-prep-mode").click(function() {
    $(this).hide();
    $("#switch-to-learn-mode").show();
    $("#learn-spells").hide();
    $("#prepare-spells").show();
  });

  $("#switch-to-learn-mode").click(function() {
    $(this).hide();
    $("#switch-to-prep-mode").show();
    $("#learn-spells").show();
    $("#prepare-spells").hide();
  });

  $(".spell-card").each(function() {
    $(this).click(function() {
      $("#spell-learn-drop").addClass("spell-learn-drop-active");
      selectedSpellUID = $(this).data("uid");
      selectedSpellLevel = $(this).data("level");
      selectedSpellName = $(this).find(".spell-result-card-title").text();
    });
  });

  $("#spell-learn-drop").click(function() {
    $("#spell-learn-drop").removeClass("spell-learn-drop-active");
    learnSpell(selectedSpellUID, selectedSpellName, 0, selectedSpellLevel);
    selectedSpellUID = undefined;
    selectedSpellName = undefined;
    selectedSpellLevel = undefined;
  });

  if (!dialog.showModal) {
    dialogPolyfill.registerDialog(dialog);
  }

  dialogButton.addEventListener('click', function() {
    dialog.showModal();
  });

  document.querySelector("#close-dialog").addEventListener('click', function() {
    pending_selected_spell_lists = selected_spell_lists.slice();
    resetToPendingSelections();
    dialog.close();
  });

  document.querySelector("#ok-dialog").addEventListener('click', function() {
    selected_spell_lists = pending_selected_spell_lists.slice();
    splitJointClassLists();
    displaySpellsOfList();
    dialog.close();
  });

  $("#add-spellbook").click(function() {
    $("#add-spellbook").hide();
    $("#add-spellbook-name").show();
  });

  $("#add-spellbook-cancel").click(function() {
    $("#add-spellbook").show();
    $("#add-spellbook-name").hide();
    $("#spellbook-input").val(null);
  });

  $("#add-spellbook-save").click(function() {
    var name = $("#spellbook-input").val();
    if (name) {
      $("#add-spellbook").show();
      $("#add-spellbook-name").hide();
      createNewSpellbook(name);
      $("#spellbook-input").val(null);
    } else {
      // Do nothing
    }
  });

  document.getElementById("spellsearch").addEventListener("input", function (e) {
    displaySpellsOfName(this.value);
  });

  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      user.getIdToken().then(myToken => {
        token = myToken;
        fetchUserSpellbooks();
      });
    }
  });
});

function fetchUserSpellbooks() {
  $("#spinner").show();
  $("#spellbooks-list").hide();
  $.ajax({
    url: "/spellbooks/",
    type: "get",
    headers: {"Authorization": "Bearer " + token},
    success: function(data) {
      createSpellBookTokens(data);
    }
  });
}

function createNewSpellbook(name) {
  $("#spinner").show();
  $("#spellbooks-list").hide();
  $.ajax({
    url: "/spellbooks/",
    type: "post",
    data: {name: name},
    headers: {"Authorization": "Bearer " + token},
    dataType: "json",
    statusCode: {
      200: function(data) {
        fetchUserSpellbooks();
      }
    }
  });
}

function deleteSpellbook(event) {
  event.stopPropagation();
  $("#spinner").show();
  $("#spellbooks-list").hide();
  var uid = event.data.uid;
  $.ajax({
    url: "/spellbooks/",
    type: "delete",
    data: {uid: uid},
    headers: {"Authorization": "Bearer " + token},
    dataType: "json",
    statusCode: {
      200: function(data) {
        fetchUserSpellbooks();
      }
    }
  });
}

function createSpellBookTokens(books) {
  var list = $("#spellbooks-list");
  $(".delet-this").remove();
  books.forEach(book => {
    var card = $('<div />', {
      "class": 'delet-this spellbook-card spellbook-card--hover mdl-card mdl-shadow--4dp'
    });
    card.click({uid: book.id, name: book.data.name}, viewSpellbook);

    var title = $('<div />', {
      "class": 'mdl-card__title mdl-card--expand'
    });
    title.append($('<h4 />', {
      text: book.data.name
    }));
    card.append(title);

    var card_actions = $('<div />', {
      "class": 'mdl-card__actions mdl-card--border'
    });
    var delete_button = $('<button />', {
      "class": 'mdl-button mdl-js-button mdl-button--icon mdl-button--colored'
    });
    delete_button.append($('<i />', {
      "class": 'material-icons',
      style: 'color: #F44336',
      text: "delete"
    }));
    delete_button.click({uid: book.id}, deleteSpellbook);
    card_actions.append($('<div />', {style: 'float: right;'}).append(delete_button));
    card.append(card_actions);

    list.prepend(card);
  });

  $("#spinner").hide();
  $("#spellbooks-list").show();
}

function viewSpellbook(event) {
  var uid = event.data.uid;
  $("#spinner").show();
  $("#spellbooks-list").hide();
  $.ajax({
    url: "/spellbooks/",
    type: "get",
    data: {uid: uid},
    headers: {"Authorization": "Bearer " + token},
    dataType: "json",
    success: function(data) {
      $("#spellbook-name").text(event.data.name);
      $("#spinner").hide();
      $("#spellbooks-list").show();
      $("#spellbook-display").show();
      learnt_spells = {};
      renderSpellbook(data["stored-spells"]);
      $("#save-spellbook").off("familiar.save-spellbook", pushSpellbook);
      $("#save-spellbook").on("familiar.save-spellbook", {"uid": uid}, pushSpellbook);
      document.getElementById('spellbook-display').scrollIntoView();
    }
  });
}

function renderSpellbook(data) {
  deRenderSpellbook();
  for (uid in data) {
    if (data.hasOwnProperty(uid)) {
      learnSpell(uid, data[uid].name, data[uid].count, data[uid].level);
    }
  }
}

function deRenderSpellbook() {
  $("#spell-learn-drop-list .learnt-spell").remove();
  $("#prepped-spells-list .prep-card").remove();
}

function learnSpell(uid, name, count, level) {
  count = count || 0;
  level = level || 0;
  if (!(uid in learnt_spells)) {
    learnt_spells[uid] = {"count": count, "name": name, "level": level};
    addLearnedSpellCard(uid, name, level);
    makePrepCard(uid, name, count, level);
  }
}

function addLearnedSpellCard(uid, s_name, level) {
  if (uid && s_name) {
    var li = $('<li />', {
      "class": 'learnt-spell mdl-list__item'
    });

    var name = $('<span />', {
      "class": 'mdl-list__item-primary-content',
      "text": s_name
    });

    var btn = $('<button />', {
      "class": 'mdl-button mdl-js-button mdl-button--icon'
    });
    btn.append($('<i />', {
      "class": 'material-icons',
      style: 'color: #F44336',
      text: "delete"
    }));

    name.append(btn);
    li.append(name);

    btn.click(function(event) {
      event.stopPropagation();
      $(li).remove();
      $("#prep-card-" + uid).remove();
      delete learnt_spells[uid];
    });

    $("#spell-learn-drop-list").prepend(li);
    learnt_spells[uid] = {"name": s_name, "count": 0, "level": level};
  }
}

function makePrepCard(uid, name, count, level) {
  var row = $('<div />', {
    "class": 'prep-card mdl-cell mdl-cell--12-col mdl-grid',
    "id": "prep-card-" + uid
  });

  var name = $('<div />', {
    "class": 'mdl-cell mdl-cell--3-col marginless',
    "text": name
  });
  row.append(name);

  var counter = $('<div />', {
    "class": 'mdl-cell mdl-cell--3-col marginless'
  });

  var btn = $('<button />', {
    "class": 'mdl-button mdl-js-button mdl-button--icon'
  });
  btn.append($('<i />', {
    "class": 'material-icons',
    text: "remove_circle_outline"
  }));
  counter.append(btn);

  var field = $('<div />', {
    "class": 'mdl-textfield mdl-js-textfield',
    "style": "width: 28px; padding-top: 2px;"
  });

  var input = $('<input />', {
    "class": 'mdl-textfield__input',
    "style": "width: 28px;",
    "pattern": "-?[0-9]*(\.[0-9]+)?",
    "id": "input-" + uid,
  });
  field.append(input);
  counter.append(field);
  $(input).val(count);
  $(input).change(function() {
    var input_count = parseInt($(this).val());
    if (isNaN(input_count) || input_count < 0) {
      $(input).val(0);
      learnt_spells[uid].count = 0;
    }
  });
  var btn2 = $('<button />', {
    "class": 'mdl-button mdl-js-button mdl-button--icon'
  });
  btn2.append($('<i />', {
    "class": 'material-icons',
    text: "add_circle_outline"
  }));
  counter.append(btn2);

  row.append(counter);

  $("#prepped-spells-list-level-" + level).append(row);

  $(btn).click(function() {
    var input_count = parseInt($(input).val());
    if (isNaN(input_count)) {
      input_count = 0;
    } else {
      input_count = Math.max(0, input_count - 1);
    }

    $(input).val(input_count);
    learnt_spells[uid].count = input_count;
  });

  $(btn2).click(function() {
    var input_count = parseInt($(input).val());
    if (isNaN(input_count)) {
      input_count = 0;
    } else {
      input_count = Math.max(0, input_count + 1);
    }

    $(input).val(input_count);
    learnt_spells[uid].count = input_count;
  });
}

function pushSpellbook(event) {
  $.ajax({
    url: "/spellbooks/" + event.data.uid,
    type: "post",
    data: {'spells': learnt_spells},
    headers: {"Authorization": "Bearer " + token},
    dataType: "json",
    beforeSend: function() {
      $("#save-spinner").addClass("is-active");
      $("#save-spellbook").hide();
    },
    complete: function() {
      $("#save-spinner").removeClass("is-active");
      $("#save-spellbook").show();
    },
    statusCode: {
      200: function(data) {
      }
    }
  });
}

function fetchSpellLists() {
  $.ajax({
    url: "/spells/lists",
    type: "get",
    headers: {"Authorization": "Bearer " + token},
    dataType: "json",
    beforeSend: function() {

    },
    complete: function() {

    },
    statusCode: {
      200: function(data) {
        createSpellListDialogOptions(data);
      }
    }
  });
}

function createSpellListDialogOptions(spell_lists) {
  $("#spell-list-selectors-1").empty();
  $("#spell-list-selectors-2").empty();
  spell_lists.forEach(function(listname, index) {
    var custom_id = `class-spell-list-${listname}-selector`;
    var label_container = $('<label />', {
      'class': 'spell-list-selector mdl-icon-toggle mdl-js-icon-toggle mdl-js-ripple-effect',
      'for': custom_id
    });

    var input_field = $('<input />', {
      'class': 'mdl-icon-toggle__input',
      'type': 'checkbox',
      'data-name': listname,
      'id': custom_id
    });
    label_container.append(input_field);
    var full_icon = $('<i />', {
      'class': 'mdl-icon-toggle__label material-icons filled-label',
      'text': "label"
    });
    label_container.append(full_icon);
    var empty_icon = $('<i />', {
      'class': 'mdl-icon-toggle__label material-icons empty-label',
      'text': "label_outline"
    });
    label_container.append(empty_icon);
    label_container.append($('<span />', {
      'class': 'class-select-labels',
      'text': listname
    }));

    input_field.hide();
    if (input_field.is(':checked')) {
      full_icon.show();
      empty_icon.hide();
    } else {
      full_icon.hide();
      empty_icon.show();
    }
    label_container.click(function() {
      if ($(this).find('input').is(':checked')) {
        $(this).find('.filled-label').show();
        $(this).find('.empty-label').hide();
        pending_selected_spell_lists.push(listname);
      } else {
        $(this).find('.filled-label').hide();
        $(this).find('.empty-label').show();
        pending_selected_spell_lists.remove(listname);
      }
    });

    $("#spell-list-selectors-" + (index % 4 + 1)).append(label_container);
  });
}

function resetToPendingSelections() {
  $('[id^=class-spell-list-]').each(function(index, element) {
    var listname = element.id.split('-')[3];
    var container = $(element).parent();
    var checked = pending_selected_spell_lists.includes(listname);
    var to_show = checked ? '.filled-label' : '.empty-label';
    var to_hide = checked ? '.empty-label' : '.filled-label';
    container.find(to_show).show();
    container.find(to_hide).hide();
  });
}

function splitJointClassLists() {
  selected_list_classes = [];
  selected_spell_lists.forEach(function(listname) {
    if (listname.includes("/")) {
      listname.split("/").forEach(function(classname) {
        selected_list_classes.push(classname);
      });
    }
    else {
      selected_list_classes.push(listname);
    }
  });
}

function filterSpellsToLists() {
  if (!spells) {
    return;
  }
  return spells.filter((spell) => {
    for (var i = 0; i < selected_list_classes.length; i++) {
      if (spell.level.hasOwnProperty(selected_list_classes[i])) {
        return true;
      }
    }
    return false;
  });
}

function displaySpellsOfList() {
  if (!spells) {
    return;
  }
  $("#selected-lists").text(`Spell lists: ${selected_spell_lists ? selected_spell_lists.join(", ") : "none"}`);
  var filtered_spells = filterSpellsToLists();
  renderSpells(filtered_spells);
}

function displaySpellsOfName(name) {
  if (!spells) {
    return;
  }
  name = name.toUpperCase();
  var filtered_spells = filterSpellsToLists().filter((spell) => {
    return spell.name.toUpperCase().includes(name);
  });
  renderSpells(filtered_spells);
}

function renderSpells(spells_to_render) {
  $("#list-spells").empty();

  spells_to_render.forEach((spell) => {
    var minlevel = 10;
    for (var i = 0; i < selected_list_classes.length; i++) {
      var classname = selected_list_classes[i];
      if (spell.level.hasOwnProperty(classname)) {
        minlevel = Math.min(minlevel, Number.parseInt(spell.level[classname]));
      }
    }

    var container = $('<div />', {
      'class': 'mdl-cell mdl-cell--12-col spell-card mdl-grid mdl-shadow--2dp spell-result-card',
      'data-uid': spell.uid,
      'data-level': minlevel
    });

    container.append($('<div />', {
      'class': 'mdl-cell mdl-cell--9-col spell-result-card-element'
    }).append($('<div />', {
      'class': 'spell-result-card-title',
      'text': spell.name
    })));

    var btn_container = $('<div />', {
      'class': 'mdl-cell mdl-cell--3-col spell-result-card-element'
    });
    var btn = $('<button />', {
      'class': 'mdl-button mdl-js-button mdl-button--icon mdl-button--colored spell-result-card-button'
    }).append($('<i />', {
      'class': 'material-icons',
      'text': "trending_flat"
    }));

    btn.click(function(event) {
      event.stopPropagation();
      var uid = $(this).parents(".spell-result-card").data("uid");
      var name = $(this).parents(".spell-result-card").find(".spell-result-card-title").text();
      var level = $(this).parents(".spell-result-card").data("level");
      learnSpell(uid, name, 0, level);
    });

    btn_container.append(btn);
    container.append(btn_container);

    $("#list-spells").append(container);
  });
}

function fetchAllSpells() {
  $.get("/spells").then((data) => {
    spells = data.map((spell) => { 
      spell.data.uid = spell.id;
      return spell.data;
    });
  });
}
