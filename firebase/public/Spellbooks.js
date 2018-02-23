$(document).ready(function() {
  $("#add-spellbook").click(function() {
    createNewSpellbook("foobar");
  });
});

function createNewSpellbook(name) {
  firebase.auth().currentUser.getIdToken().then(function(token) {
    $.ajax({
      url: "/spellbooks/",
      type: "post",
      data: {name: name},
      headers: {"Authorization": "Bearer " + token},
      dataType: "json",
      success: function(data) {
        console.log(data);
      }
    });
  });
}
