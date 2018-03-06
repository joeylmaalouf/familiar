var token;

$(document).ready(function() {
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
    card.click({uid: book.id}, viewSpellbook);

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
    // card_actions.append($('<div />', {
    //   "class": 'mdl-layout-spacer'
    // }));
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
      $("#spinner").hide();
      $("#spellbooks-list").show();
      console.log(data);
    }
  });
}
