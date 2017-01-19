var provider = new firebase.auth.GoogleAuthProvider();

firebase.auth().signInWithRedirect(provider);
