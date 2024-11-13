// index.js

// index.js

const functions = require('firebase-functions');
const dotenv = require('dotenv');
const tf = require('@tensorflow/tfjs-node'); // Add TensorFlow.js for Node.js
const use = require('@tensorflow-models/universal-sentence-encoder');

const { Pinecone } = require('@pinecone-database/pinecone');



// ENVIRONMENT VARIABLES
dotenv.config();


// PINECONE
const PINECONE_API_KEY          = functions.config?.()?.pinecone?.apikey || process.env.PINECONE_API_KEY;
const PINECONE_ENVIRONMENT      = functions.config?.()?.pinecone?.environment || process.env.PINECONE_ENVIRONMENT;
const PINECONE_INDEX            = functions.config?.()?.pinecone?.index || process.env.PINECONE_INDEX;
const pc                        = new Pinecone({ apiKey: PINECONE_API_KEY });
const pcIndex   = pc.index(PINECONE_INDEX)
const model     = 'universal-sentence-encoder'


// Universal Sentence Encoder - USE model produces 512-dimensional embeddings - The USE embeddings work well with the cosine similarity metric, matching your index's metric configuration
let modelPromise;
async function loadModel() {
    if (!modelPromise) modelPromise = use.load();
    return modelPromise;
}


function getUniqueId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

async function generateEmbedding(text) {
    const model             = await loadModel()
    const embeddings        = await model.embed([text])
    const embeddingArray    = embeddings.arraySync()[0]
    return embeddingArray
}


exports.createEmbedding = functions.runWith({ memory: '1GB' }).https.onCall(async (data, context) => {
    
    try {
        const { text, chatId } = data;
        
        // Start of Selection
        const embeddings = await generateEmbedding(text);

        // UPLOAD TO PINECONE
        const record            = {
            id:         chatId,
            values:     embeddings,
            metadata:   { text }
        }
        pcIndex.namespace('namespace1').upsert([ record ]);

        // RETURN
        console.log('returning', { chatId:embeddings })
        return await vectorSearch({ embeddings })
    } 
    catch (error) {
        console.error('Error in createEmbedding:', error);
        return { error: error.message };
    }
})

// VECTOR SEARCH
async function vectorSearch({ embeddings }) {

    try {
        // Search the index for the three most similar vectors using 
        const queryResponse = await pcIndex.namespace("namespace1").query({
            topK: 5,
            vector: embeddings,
            includeValues: false,
            includeMetadata: true
        });

        console.log('vectorSearch 2', queryResponse);
        return { results: queryResponse.matches };
    } 
    catch (error) {
        console.error('Error in vectorSearch:', error);
        return { error: error.message };
    }
}


