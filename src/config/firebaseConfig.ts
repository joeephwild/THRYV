
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';

// @react-native-firebase/app typically handles initialization automatically
// using GoogleService-Info.plist (iOS) and google-services.json (Android).
// If you haven't set these up, you might need to initialize manually, but it's less common.

// Initialize Firebase Auth
export const firebaseAuth = auth();

// Example: Listen for authentication state changes (optional, can be used in app logic)
// firebaseAuth.onAuthStateChanged(user => {
//   if (user) {
//     console.log('User UID:', user.uid, 'is signed in.');
//   } else {
//     console.log('User is signed out.');
//   }
// });

// If you plan to use Firestore for storing additional user data:
// import firestore from '@react-native-firebase/firestore';
// export const db = firestore();

// Export the initialized firebase app instance if needed elsewhere
export default firebase;
