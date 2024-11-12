import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions'
import { app } from './firebase'  // Import the Firebase app instance

const functions = getFunctions(app)  // Pass the app instance to getFunctions

// In development, connect to the local emulator
// if (process.env.NODE_ENV === 'development') {
//   connectFunctionsEmulator(functions, 'localhost', 5001)
// }

export const createEmbedding = httpsCallable(functions, 'createEmbeddingHttp') 