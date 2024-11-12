// index.js




// index.js

const functions = require('firebase-functions');
const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
const dotenv = require('dotenv');
const cors = require('cors')({ origin: true });

// Load environment variables
dotenv.config();


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Initialize Pinecone client
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// Cloud Function using callable HTTPS trigger
exports.createEmbedding = functions.https.onCall(async (data, context) => {
  try {
    if (!data.text || typeof data.text !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'The function must be called with a "text" argument of type string.'
      );
    }

    // Create embedding using OpenAI
    const embeddingResponse = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: data.text,
    });

    const embedding = embeddingResponse.data.data[0].embedding;

    // Generate a unique ID for the vector
    const vectorId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    // Prepare the record for upsert
    const record = {
      id: vectorId,
      values: embedding,
      metadata: {
        text: data.text,
        timestamp: new Date().toISOString(),
      },
    };

    // Target the index where you'll store the vector embeddings
    const index = pinecone.index(process.env.PINECONE_INDEX);

    // Upsert the vector to Pinecone
    await index.upsert([record]);

    return { id: vectorId };
  } catch (error) {
    console.error('Error creating embedding:', error);
    throw new functions.https.HttpsError('internal', 'Error creating embedding');
  }
});

// HTTP endpoint with CORS
exports.createEmbeddingHttp = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res
        .status(400)
        .json({ error: 'Invalid request. "text" field is required and must be a string.' });
    }

    try {
      // Create embedding using OpenAI
      const embeddingResponse = await openai.createEmbedding({
        model: 'text-embedding-ada-002',
        input: text,
      });

      const embedding = embeddingResponse.data.data[0].embedding;

      // Generate a unique ID for the vector
      const vectorId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

      // Prepare the record for upsert
      const record = {
        id: vectorId,
        values: embedding,
        metadata: {
          text: text,
          timestamp: new Date().toISOString(),
        },
      };

      // Target the index where you'll store the vector embeddings
      const index = pinecone.index(process.env.PINECONE_INDEX);

      // Upsert the vector to Pinecone
      await index.upsert([record]);

      return res.status(200).json({ id: vectorId });
    } catch (error) {
      console.error('Error creating embedding:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});
