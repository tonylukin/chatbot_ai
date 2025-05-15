'use client';
import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchCategory, setSearchCategory] = useState(null);

  const BACKEND_HOST = process.env.NEXT_PUBLIC_BACKEND_HOST;

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      if (searchCategory) {
        const response = await fetch(`${BACKEND_HOST}/api/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: input, category: searchCategory }),
        });
        const data = await response.json();

        const aiMessage = {
          sender: `Search [${searchCategory}]`,
          links: data.map((row) => ({
            title: row.title,
            url: row.url,
          })),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } else {
        const response = await fetch(`${BACKEND_HOST}/api/ask`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: input }),
        });
        const data = await response.json();

        const aiMessage = {
          sender: 'ai',
          text: data.response,
        };

        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (err) {
      console.error('Error sending request:', err);
    }

    setLoading(false);
  };

  const categoryButtons = [
    { label: 'Companies', value: 'companies' },
    { label: 'People', value: 'people' },
    { label: 'LinkedIn', value: 'linkedin profiles' },
    { label: 'AI (Claude)', value: null },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 space-y-4">
        <h1 className="text-xl font-bold text-gray-800">🔍 AI Chatbot</h1>

        {/* Category Buttons */}
        <div className="flex flex-wrap gap-2">
          {categoryButtons.map((btn) => (
            <button
              key={btn.label}
              onClick={() => setSearchCategory(btn.value)}
              className={`px-4 py-2 rounded-full border font-medium transition-colors duration-200 ${
                searchCategory === btn.value
                  ? 'bg-blue-600 text-white border-blue-600 shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Chat Window */}
        <div className="h-96 overflow-y-auto space-y-4 border rounded-lg p-4 bg-gray-50">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-sm px-4 py-2 rounded-xl text-sm shadow whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                {msg.text && <p>{msg.text}</p>}

                {msg.links && (
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    {msg.links.map((link, j) => (
                      <li key={j}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          {link.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-center text-gray-400 text-sm">AI is thinking…</div>
          )}
        </div>

        {/* Input Field */}
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
