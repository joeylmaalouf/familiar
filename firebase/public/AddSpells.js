$(document).ready(function() {
  console.log("Loaded");
  $("#invalidFiletype").hide();

  $("#jsonSelect").on("change", event => {
    $("#invalidFiletype").hide();
    var file = event.target.files[0];
    console.log(file);
    if (file.name.substr((file.name.lastIndexOf('.') + 1)) === "json") {
      var reader = new FileReader();
      reader.onload = handleJSON;
      reader.readAsText(event.target.files[0]);
    } else {
      $("#invalidFiletype").show();
    }
  });
});

function handleJSON(event) {
  console.log(JSON.parse(event.target.result));
}