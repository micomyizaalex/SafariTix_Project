import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <section className="max-w-3xl w-full text-center rounded-2xl shadow-lg p-8 bg-white/80 backdrop-blur-sm dark:bg-gray-900/60">
        <div className="flex flex-col items-center gap-6">
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
            className=""
          >
            <circle cx="60" cy="60" r="56" stroke="url(#g)" strokeWidth="6" />
            <path d="M40 80 L80 80" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
            <path d="M44 46a12 12 0 1124 0" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0077B6" />
                <stop offset="100%" stopColor="#F4A261" />
              </linearGradient>
            </defs>
          </svg>

          <h1 className="text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">404</h1>

          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Page not found</h2>

          <p className="max-w-xl text-gray-600 dark:text-gray-300">
            The page you are looking for doesn’t exist or has been moved. If you think this is a mistake,
            try using the button below or head back to the homepage.
          </p>

          

        </div>
      </section>
    </main>
  )
}
