$(document).ready(function() {
  $("#account-logout").click(function() {
    firebase.auth().signOut();
  });

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      $("#display-name").text(user.displayName);

      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var uid = user.uid;
      var providerData = user.providerData;
      var token = user.getIdToken();
      console.log(displayName, email, emailVerified, photoURL, isAnonymous, uid, providerData, token);
    } else {
      // User is signed out.
      window.location.replace("Login.html");
    }
  });
});