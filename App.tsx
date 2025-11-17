
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Chat } from '@google/genai';
import { Campaign, ChatMessage, AppState } from './types';
import { generateCampaignContent, generateImage, startChat } from './services/geminiService';
import CampaignForm from './components/CampaignForm';
import CampaignDisplay from './components/CampaignDisplay';
import Chatbot from './components/Chatbot';
import { Header } from './components/Header';
import { AppStateIndicator } from './components/AppStateIndicator';

const App: React.FC = () => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);

  const chatSessionRef = useRef<Chat | null>(null);

  useEffect(() => {
    try {
      chatSessionRef.current = startChat();
      setChatHistory([
        { role: 'model', content: 'Hello! I can help you refine your campaign or answer any questions. How can I assist you today?' }
      ]);
    } catch (e) {
      console.error("Failed to start chat session:", e);
      setError("Could not initialize the AI chat. Please check your API key and refresh.");
      setAppState(AppState.ERROR);
    }
  }, []);

  const handleGenerateCampaign = useCallback(async (prompt: string) => {
    if (!prompt.trim()) {
      setError("Please enter a prompt for your campaign.");
      return;
    }

    setAppState(AppState.GENERATING_TEXT);
    setError(null);
    setCampaign(null);

    try {
      const { subject, body, imagePrompt } = await generateCampaignContent(prompt);
      setCampaign({ subject, body, imageUrl: null });

      setAppState(AppState.GENERATING_IMAGE);
      const imageUrl = await generateImage(imagePrompt);
      setCampaign({ subject, body, imageUrl });

      setAppState(AppState.IDLE);
    } catch (e: any) {
      console.error(e);
      setError(`Failed to generate campaign. ${e.message || 'Please try again.'}`);
      setAppState(AppState.ERROR);
    }
  }, []);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !chatSessionRef.current) {
      return;
    }

    setAppState(AppState.CHATTING);
    setError(null);

    const userMessage: ChatMessage = { role: 'user', content: message };
    setChatHistory(prev => [...prev, userMessage]);

    try {
      const stream = await chatSessionRef.current.sendMessageStream({ message });
      let modelResponse = '';
      const modelMessage: ChatMessage = { role: 'model', content: '' };
      setChatHistory(prev => [...prev, modelMessage]);

      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setChatHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = { ...newHistory[newHistory.length - 1], content: modelResponse };
          return newHistory;
        });
      }
    } catch (e: any) {
      console.error(e);
      const errorMessage = `Sorry, I encountered an error. ${e.message || 'Please try again.'}`;
      setChatHistory(prev => [...prev, { role: 'model', content: errorMessage }]);
      setError(errorMessage);
    } finally {
      setAppState(AppState.IDLE);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12">
          
          {/* Left Column: Input & Chat */}
          <div className="flex flex-col space-y-8">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">1. Create Your Campaign</h2>
              <p className="text-gray-400 mb-6">Describe your product, target audience, and the goal of your email. The more detail, the better!</p>
              <CampaignForm onSubmit={handleGenerateCampaign} isLoading={appState === AppState.GENERATING_TEXT || appState === AppState.GENERATING_IMAGE} />
            </div>
            
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 flex-grow">
               <h2 className="text-2xl font-bold text-cyan-400 mb-4">3. Refine with AI Chat</h2>
               <Chatbot
                  history={chatHistory}
                  onSendMessage={handleSendMessage}
                  isLoading={appState === AppState.CHATTING}
                />
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="mt-8 lg:mt-0">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 sticky top-8">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">2. Review Your Generated Campaign</h2>
              <AppStateIndicator state={appState} error={error} />
              <CampaignDisplay campaign={campaign} isLoading={appState === AppState.GENERATING_TEXT || appState === AppState.GENERATING_IMAGE}/>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
