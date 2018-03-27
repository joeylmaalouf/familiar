var showMessage = (message) => {
  document.querySelector("#toast-message")
    .MaterialSnackbar.showSnackbar({
      "message": message
    });
};

var submitForm = () => {
  firebase.auth().currentUser.getIdToken().then((token) => {
    var spellData = {
      "casttime"   : $("#spell-casttime"   ).val(),
      "components" : $("#spell-components" ).val(),
      "duration"   : $("#spell-duration"   ).val(),
      "level"      : $("#spell-level"      ).val(),
      "link"       : $("#spell-link"       ).val(),
      "longdesc"   : $("#spell-longdesc"   ).val(),
      "name"       : $("#spell-name"       ).val(),
      "range"      : $("#spell-range"      ).val(),
      "restriction": $("#spell-restriction").val(),
      "save"       : $("#spell-save"       ).val(),
      "school"     : $("#spell-school"     ).val(),
      "shortdesc"  : $("#spell-shortdesc"  ).val(),
      "spellres"   : $("#spell-spellres"   ).val(),
      "target"     : $("#spell-target"     ).val()
    };
    var headers = {
      "Authorization": "Bearer " + token
    };
    $.ajax({
      "url"     : "/spells/custom",
      "type"    : "post",
      "data"    : spellData,
      "headers" : headers,
      "dataType": "json"
    })
    .done((data) => {
      if (data["success"]) {
        $("[id^=spell-]").each((index, element) => {
          element = $(element);
          var parent = element.parent();
          element.val("");
          parent.removeClass("is-upgraded");
          parent.removeClass("is-dirty");
        });
        showMessage("Success! Submitted custom spell.");
      }
      else {
        showMessage("Error! Failed to submit custom spell.");
      }
    })
    .fail((error) => {
      showMessage("Error! Failed to connect to server.");
    });
  });
};

$(document).ready(function() {
  $("#submit").click((event) => {
    var numInvalid = 0;
    $(".required-spell-field").each((index, element) => {
      element = $(element);
      var parent = element.parent();
      if (!element.val() || parent.hasClass("is-invalid")) {
        ++numInvalid;
        parent.addClass("is-invalid");
      }
    });
    if (numInvalid > 0) {
      showMessage("Please fill out all required fields.");
    }
    else {
      submitForm();
    }
  });
});
