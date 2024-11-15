// index.js
const functions     = require('firebase-functions');
const dotenv        = require('dotenv');
const tf            = require('@tensorflow/tfjs-node'); // Add TensorFlow.js for Node.js
const use           = require('@tensorflow-models/universal-sentence-encoder');
const { Pinecone }  = require('@pinecone-database/pinecone');
const OpenAI        = require("openai");


dotenv.config();


const openai = new OpenAI({ apiKey: functions.config?.()?.OPENAI_API_KEY || process.env.OPENAI_API_KEY })



// PINECONE
const PINECONE_API_KEY          = functions.config?.()?.pinecone?.apikey || process.env.PINECONE_API_KEY;
const PINECONE_ENVIRONMENT      = functions.config?.()?.pinecone?.environment || process.env.PINECONE_ENVIRONMENT;
const PINECONE_INDEX            = functions.config?.()?.pinecone?.index || process.env.PINECONE_INDEX;
const pc                        = new Pinecone({ apiKey: PINECONE_API_KEY });
const pcIndex                   = pc.index(PINECONE_INDEX)
const model                     = 'universal-sentence-encoder'


// UNIVERSAL SENTENCE ENCODER - USE MODEL PRODUCES 512-DIMENSIONAL EMBEDDINGS - THE USE EMBEDDINGS WORK WELL WITH THE COSINE SIMILARITY METRIC, MATCHING YOUR INDEX'S METRIC CONFIGURATION
let modelPromise;
async function loadModel() {
    if (!modelPromise) modelPromise = use.load();
    return modelPromise;
}


// GENERATE EMBEDDINGS
async function generateEmbedding(text) {
    const model             = await loadModel()
    const embeddings        = await model.embed([text])
    const embeddingArray    = embeddings.arraySync()[0]
    return embeddingArray
}


// VECTOR SEARCH
async function vectorSearch({ embeddings }) {

    try {
        // Search the index for the three most similar vectors using 
        const queryResponse = await pcIndex.namespace("namespace1").query({
            topK: 10,
            vector: embeddings,
            includeValues: false,
            includeMetadata: true
        });

        return { results: queryResponse.matches };
    } 
    catch (error) {
        console.error('Error in vectorSearch:', error);
        return { error: error.message };
    }
}


async function generateAiResponse({ context, question }) {

    let systemContext = `You are a helpful assistant that both takes questions and information from users. 
    If the user asks a question, please generate a response based on the information provided. If the user provides information, 
    please thank them for the information and state you will add it to your knowledge base.
    So if the user asks a question, please generate a response based on the information provided context. If there is no context provided or the content is non-sensical, 
    state there is not enough information to provide a response. IF the user has asked a question, here is the CONTEXT: "${JSON.stringify(context)}". 
    REMEMBER - ONLY ANSWER BASED ON THE INFORMATION CONTEXT PROVIDED.
    TRY TO ANSWER IN A CONCISE MANNER, BUT PROVIDE AS MUCH INFORMATION AS NECESSARY TO ANSWER THE QUESTION CORRECTLY. FIND AN ANSWER IN THE CONTEXT. IF THERE IS NO ANSWER IN THE 
    CONTEXT, THEN SIMPLY SUMMARISE THE CONTEXT IN A FEW SENTENCES, EXPLAINING WHAT THE CONTEXT IS ABOUT IN A FEW SENTENCES.
    Remember, if the user has not asked a question please simply thank them for the information and state you will add it to your knowledge base.`
    console.log('content', systemContext, question)

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system",   content: systemContext },
            { role: "user",     content: question }
        ],
    });
    return completion?.choices?.[0]?.message?.content
}

// CREATE EMBEDDINGS
exports.createEmbedding = functions.runWith({ memory: '1GB' }).https.onCall(async ({ text, chatId }, context) => {
    
    try {
        const embeddings = await generateEmbedding(text);

        // UPLOAD TO PINECONE
        const record            = {
            id:         chatId,
            values:     embeddings,
            metadata:   { text }
        }
        pcIndex.namespace('namespace1').upsert([ record ]);

        // DEMO - RETURN SEARCH RESULTS
        let searchResults       = await vectorSearch({ embeddings })
        let respTextArray       = []
        searchResults.results?.forEach?.(result => {
            if (result.metadata?.text) respTextArray.push(result.metadata?.text)
        })
        console.log('respTextArray', respTextArray, text)

        // ARTICULATE RESPONSE VIA OPENAI
        const aiResponse = await generateAiResponse({ context:respTextArray, question:text })
        console.log('aiResponse', aiResponse)

        return aiResponse
    } 
    catch (error) {
        console.error('Error in createEmbedding:', error);
        return { error: error.message };
    }
})



