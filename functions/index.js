// index.js

// index.js

const functions = require('firebase-functions');
const dotenv = require('dotenv');
const tf = require('@tensorflow/tfjs-node'); // Add TensorFlow.js for Node.js
const use = require('@tensorflow-models/universal-sentence-encoder');

const { Pinecone } = require('@pinecone-database/pinecone');

// Initialize Pinecone client
// Load environment variables for local development
dotenv.config();

// Get environment variables
const PINECONE_API_KEY = functions.config?.()?.pinecone?.apikey || process.env.PINECONE_API_KEY;
const PINECONE_ENVIRONMENT = functions.config?.()?.pinecone?.environment || process.env.PINECONE_ENVIRONMENT;
const PINECONE_INDEX = functions.config?.()?.pinecone?.index || process.env.PINECONE_INDEX;

// Initialize Pinecone client
const pinecone        = new Pinecone({ apiKey: PINECONE_API_KEY });


// Cache the model loading promise
let modelPromise;
async function loadModel() {
    if (!modelPromise) modelPromise = use.load();
    return modelPromise;
}


function getUniqueId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

// Callable version
exports.createEmbedding = functions.runWith({ memory: '1GB' }).https.onCall(async (data, context) => {
    try {
        const text              = data.text;
        
        // CREATE EMBEDDING
        const model             = await loadModel()
        const embeddings        = await model.embed([text])
        const embeddingArray    = embeddings.arraySync()[0]

        // UPLOAD TO PINECONE
        const pcIndex           = pinecone.index(PINECONE_INDEX)
        const id                = getUniqueId()
        const record            = {
            id,
            values:     embeddingArray,
            metadata:   { text }
        }
        pcIndex.namespace('namespace1').upsert([ record ]);

        // RETURN
        console.log('returning', { embeddingArray, id })
        return { embeddingArray, id };
    } 
    catch (error) {
        console.error('Error in createEmbedding:', error);
        return { error: error.message };
    }
});

// Keep your existing createEmbedding2 HTTP endpoint if needed
