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
      $.post("/spells", {spells: spell_data}, onSuccess).fail(error => {
        $("#spinner").hide();
        $("#error").text(error.responseText);
        $("#error").show();
      });
    }
  });
});

function onSuccess(data, status, xhr) {
  console.log(data, status, xhr);
  $("#spinner").hide();
  $("#file-chooser").show();
  if (data.success === "true") {
    alert("Spells Added");
  } else {
    $("#error").text(data.error);
    $("#error").show();
  }
}

function displaySpellData(data) {
  console.log(data);
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
