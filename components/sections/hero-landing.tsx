'use client'

import { useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { BUSINESS_NAME, BUSINESS_NAME_SHORT } from '@/config/site'
import { Icons } from '../shared/icons'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '../ui/button'
import { Dialog as ChatDialog } from '@headlessui/react'
import dynamic from 'next/dynamic'

const navigation = [
  { name: 'Product', href: '#' },
  { name: 'Features', href: '#' },
  { name: 'Marketplace', href: '#' },
  { name: 'Company', href: '#' },
]

const ChatWindow = dynamic(() => import('../chat/chat-window'), { 
  loading: () => (
    <div className="w-full flex justify-center items-center py-10">
      <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      <span className="ml-2 text-indigo-600 text-lg">Loading...</span>
    </div>
  ),
  ssr: false 
})

export default function HeroLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="bg-white">
      <header className="absolute inset-x-0 top-0 z-50">
        {/* <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <img
                alt=""
                src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
                className="h-8 w-auto"
              />
            </a>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <a key={item.name} href={item.href} className="text-sm/6 font-semibold text-gray-900">
                {item.name}
              </a>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <a href="#" className="text-sm/6 font-semibold text-gray-900">
              Log in <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </nav> */}
        <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">Your Company</span>
                <img
                  alt=""
                  src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
                  className="h-8 w-auto"
                />
              </a>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>
            <div className="flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="py-6">
                  <a
                    href="#"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    Log in
                  </a>
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>

      <div className="relative isolate pt-14">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          />
        </div>
        <div className="py-24 sm:py-32 lg:pb-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">

              <Link
                href="https://twitter.com/miickasmt/status/1810465801649938857"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm", rounded: "full" }),
                  "px-4",
                )}
                target="_blank"
              >
                <span className="mr-3">🎉</span>
                <span className="hidden md:flex">A Next JS Starter with Chat, Dashboard, Auth, Database, Payments, Subscription</span>

              </Link>

              <div className="mt-4">
                <a href="#" className="inline-flex flex-wrap space-x-6" style={{gap:'0.5rem', justifyContent:'center'}} >
                  {['Next.js', 'Reactjs', 'Tailwind', 'Typescript', 'TensorFlow', 'Chat with RAG', 'Stripe', 
                    'Pinecone', 'Firebase Auth', 'Firestore', 'Shadcn/UI' ].map((item)=> <span className="rounded-full bg-indigo-600/10 px-3 py-1 text-sm/6 font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-600/10">
                    {item}
                  </span>)}
                  
                  {/* <span className="inline-flex items-center space-x-2 text-sm/6 font-medium text-gray-600">
                    <span>More →</span>
                  </span> */}
                </a>
              </div>
              <h1 className="mt-7 text-balance text-5xl font-extrabold tracking-tight text-gray-900 sm:text-7xl">
                NextJS 
                {" "}
                <span className="text-gradient_indigo-purple text-indigo-600">Chat</span>
              </h1>
              <h2 className="mt-5 text-gradient_indigo-purple text-balance font-urban text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl" style={{paddingBottom:'1rem'}} >
                {/* Maximizing AI for Unmatched Cost Savings */}
                {BUSINESS_NAME_SHORT} Starter
              </h2>
                <p className="mt-5 text-xl font-urban font-bold text-gray-800 leading-relaxed" style={{fontWeight:500}}>
                  {/* By harnessing the latest advancements in AI, web development is 100x more efficient. At {BUSINESS_NAME}, these translate into unmatched cost savings for you.</p> */}
                  A NextJS Retrieval Augmented Generation Chat Demo with TensorFlow Vectorization 
              </p>

              <div className="mt-10 flex items-center justify-center gap-x-6">
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="flex items-center rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  style={{minWidth:'30%', justifyContent:'center'}}
                >
                  Chat
                </button>
                <a href="https://github.com/codephycom/Nextjs-Chat-Vectorization-RAG" className="text-sm/6 font-semibold text-gray-900" 
                style={{minWidth:'30%'}} >
                  View On Github <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
            <div className="mt-16 flow-root sm:mt-24">
              <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                <img
                  alt="App screenshot"
                  src="https://tailwindui.com/plus/img/component-images/project-app-screenshot.png"
                  width={2432}
                  height={1442}
                  className="rounded-md shadow-2xl ring-1 ring-gray-900/10"
                />
              </div>
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          />
        </div>
      </div>
      <ChatDialog
        open={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <ChatDialog.Panel className="mx-auto max-w-3xl rounded-xl bg-white w-full h-[80vh]" style={{borderRadius:'1rem', overflow:'hidden'}} >
            <ChatWindow onClose={() => setIsChatOpen(false)} />
          </ChatDialog.Panel>
        </div>
      </ChatDialog>
    </div>
  )
}
