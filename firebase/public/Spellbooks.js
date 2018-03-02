var token;

$(document).ready(function() {
  $("#add-spellbook").click(function() {
    createNewSpellbook("foobar");
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

function deleteSpellBook(event) {
  $("#spinner").show();
  $("#spellbooks-list").hide();
  var uid = $(event.target).parent().parent().parent().parent().attr("data-uid");
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
      "class": 'delet-this spellbook-card mdl-card mdl-shadow--4dp'
    });
    card.attr("data-uid", book.id);

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
    delete_button.click(deleteSpellBook);
    card_actions.append($('<div />', {style: 'float: right;'}).append(delete_button));
    card.append(card_actions);

    list.prepend(card);
  });

  $("#spinner").hide();
  $("#spellbooks-list").show();
}
