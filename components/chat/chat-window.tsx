    // Start of Selection
    import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
    import { useState, useEffect } from 'react'
    import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore'
    import { createEmbedding } from '@/lib/firebase-functions'
    
    const db = getFirestore()
    
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
          content: "Hi! How can I help you today?",
          isUser: false,
          timestamp: serverTimestamp(),
          sessionId: newSessionId
        })
    
        return () => unsubscribe()
      }, [])
    
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim()) return
    
        try {
          // Add user message first
          const userMessage = {
            content: message,
            isUser: true,
            timestamp: serverTimestamp(),
            sessionId,
          }
          
          await addDoc(collection(db, 'chats'), userMessage)
          setMessage('')

          // Create embedding using the callable function
          const embeddingResult: any = await createEmbedding({ text: message })
          console.log('embeddingResult', embeddingResult)
          const embeddingId = embeddingResult.data.id

          // Update the message with embedding ID
          await addDoc(collection(db, 'chats'), {
            content: message,
            isUser: true,
            timestamp: serverTimestamp(),
            sessionId,
            embeddingId
          })
          // Simulate AI response
          setTimeout(async () => {
            const aiResponse = "Thanks for your message! This is a demo response."
            
            // Create embedding for AI response
            const aiEmbeddingResult: any = await createEmbedding({ text: aiResponse })
            const aiEmbeddingId = aiEmbeddingResult.data.id

            await addDoc(collection(db, 'chats'), {
              content: aiResponse,
              isUser: false,
              timestamp: serverTimestamp(),
              sessionId,
              embeddingId: aiEmbeddingId
            })
          }, 1000)
        } catch (error) {
          console.error('Error processing message:', error)
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
          <div className="flex justify-between items-center p-4 border-b bg-white" style={{padding:'0.5rem 1rem' }}>
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
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    msg.isUser ? 'text-indigo-100' : 'text-gray-400'
                  }`}>
                    {msg.timestamp?.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
    
          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                style={{borderRadius:10 }}
              />
              <button
                type="submit"
                className="rounded-full bg-indigo-600 p-2 text-white hover:bg-indigo-700 transition-colors"
                style={{borderRadius:10 }}
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      )
    } 