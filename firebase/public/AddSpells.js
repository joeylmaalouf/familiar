$(document).ready(function() {
  $("#invalidFiletype").hide();
  $("#spinner").hide();
  $("#error").hide();
  $("#preview").hide();

  var spell_data;

  $("#jsonSelect").on("change", event => {
    $("#invalidFiletype").hide();
    $("#spinner").hide();
    $("#error").hide();

    var file = event.target.files[0];
    if (file.name.substr((file.name.lastIndexOf('.') + 1)) === "json") {
      $("#filename").text(file.name);
      spell_data = file;
      var reader = new FileReader();
      reader.onload = handleJSON;
      reader.readAsText(spell_data);
    } else {
      $("#invalidFiletype").show();
    }
  });

  function handleJSON(event) {
    spell_data = JSON.parse(event.target.result);
    displaySpellData(spell_data);
  }

  $("#submit").click(event => {
    if (spell_data != null) {
      $("#spinner").show();
      $("#file-chooser").hide();
      var chunk_size = 250;
      var spliced_data = [];
      for (var i = 0; i < Math.ceil(spell_data.length / chunk_size); i++) {
        spliced_data.push(spell_data.slice(i*chunk_size, Math.min(((i+1)*chunk_size)-1, spell_data.length-1)));
      }

      spliced_data.forEach(function(d) {
        $.ajax({
          url: "/spells",
          type: "POST",
          data: JSON.stringify({"spells": d}),
          dataType: "json",
          contentType: "application/json",
          headers: {"Authorization": "Bearer " + token},
          success: function(data) {
            $("#spinner").hide();
            $("#file-chooser").show();
            if (data.success === "true") {
              alert("Spells Added");
            } else {
              $("#error").text(data.error);
              $("#error").show();
            }
          },
          error: function(error) {
            $("#spinner").hide();
            $("#error").text(error.responseText);
            $("#error").show();
          }
        });
      });
    }
  });

  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      user.getIdToken().then(myToken => {
        token = myToken;
      });
    }
  });
});

function displaySpellData(data) {
  var list = $("<ul>");
  if ($.isArray(data)) {
    $.each(data, (index, spell) => {
      list.append($("<li>").text(spell.name));
    });
  } else {
    list.append($("<li>").text(data.name));
  }
  $("#preview-list").html(list);
  $("#preview").show();
}
