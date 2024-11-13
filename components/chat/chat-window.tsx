import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { createEmbedding } from '@/lib/firebase-functions'


const db        = getFirestore()

interface Message {
    id?: string
    content: string
    isUser: boolean
    timestamp: Date
    sessionId?: string
    embeddingId?: string
}

interface ChatWindowProps {
    onClose: () => void
}

interface FirestoreMessage {
    content: string
    isUser: boolean
    timestamp: any  // FirebaseFirestore.Timestamp
    sessionId: string
    embeddingId?: string
}

export default function ChatWindow({ onClose }: ChatWindowProps) {
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState<Message[]>([])
    const [sessionId, setSessionId] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [awaitingAi, setAwaitingAi] = useState(false)

    useEffect(() => {
        // Generate a unique session ID when the chat window opens
        const newSessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        setSessionId(newSessionId)

        // Subscribe to messages for this session
        const q = query(
            collection(db, 'chats'),
            orderBy('timestamp', 'asc')
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newMessages = snapshot.docs
                .map(doc => {
                    const data = doc.data() as FirestoreMessage
                    return {
                        id: doc.id,
                        content: data.content,
                        isUser: data.isUser,
                        sessionId: data.sessionId,
                        embeddingId: data.embeddingId,
                        timestamp: data.timestamp?.toDate()
                    }
                })
                .filter(msg => msg.sessionId === newSessionId) as Message[]

            setMessages(newMessages)
        })

        // Add initial AI message
        addDoc(collection(db, 'chats'), {
            content: "Hi, please give me information to digest. I take about 10 seconds to process each message. Then open an incognito window to ask me about it.",
            isUser: false,
            timestamp: serverTimestamp(),
            sessionId: newSessionId
        })

        return () => unsubscribe()
    }, [])
    

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault()


        // const result = await vectorSearch({ data:{ query:'computer?' } })
        // console.log('result', result)
        // return

        if (!message.trim() || isLoading) return

        setIsLoading(true)
        setAwaitingAi(true)
        try {
            // USER MESSAGE
            const userMessage = {
                content: message,
                isUser: true,
                timestamp: serverTimestamp(),
                sessionId,
            }

            // ADD USER MESSAGE TO FIRESTORE
            const docRef = await addDoc(collection(db, 'chats'), userMessage)
            const chatId = docRef.id
            console.log('chatId', { text: message, chatId })
            setMessage('')
            setIsLoading(false)

            // CREATE EMBEDDING AND SAVE TO PINECONE
            let aiResponse                        = await createEmbedding({ text: message, chatId })
            console.log('aiResponse', aiResponse)

            // SYSTEM MESSAGE
            setAwaitingAi(false)
            await addDoc(collection(db, 'chats'), {
                content: aiResponse?.data || 'Sorry, I encountered an error processing your message. Please try again.',
                isUser: false,
                timestamp: serverTimestamp(),
                sessionId                
            })
        } catch (error) {
            console.error('Error processing message:', error)
            setIsLoading(false)
            // Add error message to chat
            await addDoc(collection(db, 'chats'), {
                content: "Sorry, I encountered an error processing your message. Please try again.",
                isUser: false,
                timestamp: serverTimestamp(),
                sessionId,
            })
        }
    }

    return (
        <div className="font-urban h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b bg-white" style={{ padding: '0.5rem 1rem' }}>
                <h2 className="text-lg font-semibold text-gray-800">Chat</h2>
                <button
                    onClick={onClose}
                    className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                >
                    <XMarkIcon className="h-6 w-6 text-gray-500" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg,index) => (
                    <div
                        key={index}
                        className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.isUser
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-gray-800 border border-gray-200'
                                }`}
                        >
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 ${msg.isUser ? 'text-indigo-100' : 'text-gray-400'
                                }`}>
                                {msg.timestamp?.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                ))}

                {awaitingAi? 
                <div className="flex space-x-1" style={{padding:'1rem'}}>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
                </div>
                :null}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Chat..."
                        className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        style={{ borderRadius: 10 }}
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`rounded-full p-2 text-white transition-colors w-16 flex justify-center items-center ${
                            isLoading 
                                ? 'bg-indigo-400 cursor-not-allowed' 
                                : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                        style={{ borderRadius: 10 }}
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle 
                                    className="opacity-25" 
                                    cx="12" 
                                    cy="12" 
                                    r="10" 
                                    stroke="currentColor" 
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <path 
                                    className="opacity-75" 
                                    fill="currentColor" 
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                        ) : (
                            <PaperAirplaneIcon className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
} 