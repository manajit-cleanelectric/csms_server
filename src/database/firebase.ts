import * as firebase from 'firebase-admin';

firebase.initializeApp({
    credential: firebase.credential.applicationDefault(),
});

export default firebase;
