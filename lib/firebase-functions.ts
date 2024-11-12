import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions'

const functions = getFunctions()

// In development, connect to the local emulator
// if (process.env.NODE_ENV === 'development') {
//   connectFunctionsEmulator(functions, 'localhost', 5001)
// }

export const createEmbedding = httpsCallable(functions, 'createEmbeddingHttp') 