import React, { useState, useEffect, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { LayoutDashboard, Activity, Heart, Utensils, MessageSquare, Bot } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import LogView from './components/LogView';
import BotControl from './components/BotControl';

export default function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState({ connected: false, username: '' });
  const [telemetry, setTelemetry] = useState({
    pos: { x: 0, y: 0, z: 0 },
    health: 20,
    food: 20,
    username: '',
    xp: { level: 0 }
  });

  const ai = useMemo(() => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  }, []);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('bot:log', (log: string) => {
      setLogs(prev => [...prev, log].slice(-100));
    });

    newSocket.on('bot:logs', (initialLogs: string[]) => {
      setLogs(initialLogs);
    });

    newSocket.on('bot:status', (data) => {
      setStatus(data);
    });

    newSocket.on('bot:telemetry', (data) => {
      setTelemetry(data);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleConnect = (host: string, port: number, username: string) => {
    socket?.emit('bot:connect', { host, port, username });
  };

  const handleDisconnect = () => {
    socket?.emit('bot:disconnect');
  };

  const handleSendChat = (message: string) => {
    socket?.emit('bot:chat', message);
  };

  const handleSendAI = async (instruction: string) => {
    if (!ai || !socket) return;
    
    // Add local log so user knows it's working
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] NEURAL_PROCESSING: "${instruction}"`].slice(-100));

    try {
      const prompt = `You are a Minecraft Bot Controller. Translate instructions into JSON actions.
      Instruction: "${instruction}"
      Bot Position: ${JSON.stringify(telemetry.pos)}
      
      Supported actions:
      1. { "action": "goto", "x": number, "y": number, "z": number }
      2. { "action": "mine", "block": "block_name", "count": number }
      3. { "action": "chat", "message": "string" }
      4. { "action": "stop" }
      
      Return ONLY valid JSON.`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const responseText = result.text;
      if (!responseText) throw new Error("Empty AI response");

      const jsonMatch = responseText.match(/\{.*\}/s);
      if (jsonMatch) {
         const cmd = JSON.parse(jsonMatch[0]);
         socket.emit('bot:action', cmd);
      } else {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] NEURAL_FAULT: Could not parse AI response as JSON.`].slice(-100));
      }
    } catch (err: any) {
      console.error(err);
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] NEURAL_FAULT: ${err.message}`].slice(-100));
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-gray-200 font-sans selection:bg-white selection:text-black">
      {/* Top Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-[#222] bg-[#0c0c0c] sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-sm flex items-center justify-center font-mono font-bold text-black text-xs">
            MB
          </div>
          <h1 className="text-lg font-bold tracking-tight uppercase">
            MineBot <span className="text-gray-500 font-light italic">Control Hub</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] rounded border border-[#333] text-[10px] font-mono tracking-wider">
            <span className={`w-2 h-2 rounded-full ${status.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500 opacity-50'}`}></span>
            {status.connected ? `SYSTEM: ONLINE (${status.username})` : 'SYSTEM: OFFLINE'}
          </div>
          <nav className="hidden md:flex items-center gap-6 ml-4 mr-2">
            {['DASHBOARD', 'SCRIPTS', 'SENSORS'].map(item => (
              <button key={item} className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors tracking-widest">{item}</button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-10rem)] min-h-[700px]">
          {/* Left Column: Management */}
          <div className="lg:col-span-12 xl:col-span-7 flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold font-mono tracking-tight">MISSION CONTROL</h2>
              <p className="text-gray-500 text-sm italic mt-1">Autonomous Minecraft entity orchestration via Gemini AI</p>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <BotControl 
                status={status}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                onSendChat={handleSendChat}
                onSendAI={handleSendAI}
              />
            </div>
          </div>

          {/* Right Column: Monitoring */}
          <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-6">
             <div>
              <h2 className="text-xl font-bold font-mono text-gray-400">TELEMETRY_LOG</h2>
              <div className="h-0.5 w-12 bg-green-500 mt-2"></div>
            </div>
            
            <div className="flex-1 min-h-[400px]">
              <LogView logs={logs} />
            </div>
          </div>
        </div>
      </main>

      {/* Status Bar */}
      <footer className="fixed bottom-6 right-6 px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded flex items-center gap-6 shadow-2xl text-[10px] font-mono text-gray-400">
        <div className="flex items-center gap-2 pr-4 border-r border-[#333]">
          <Activity size={12} className="text-green-500" />
          <span className="uppercase font-bold tracking-tighter">
            X: {Math.round(telemetry.pos.x)} Y: {Math.round(telemetry.pos.y)} Z: {Math.round(telemetry.pos.z)}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Heart size={12} className="text-red-500" />
            <span>{Math.round(telemetry.health)}/20</span>
          </div>
          <div className="flex items-center gap-2">
            <Utensils size={12} className="text-orange-500" />
            <span>{Math.round(telemetry.food)}/20</span>
          </div>
          <div className="flex items-center gap-1 opacity-50 ml-2">
            <span className="text-[8px] bg-green-900/40 text-green-400 px-1 rounded">LVL {telemetry.xp?.level || 0}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
