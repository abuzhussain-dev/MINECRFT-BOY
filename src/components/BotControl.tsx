import React, { useState } from 'react';
import { Send, Zap, Globe, User, Hash, Power, PowerOff } from 'lucide-react';
import { motion } from 'motion/react';

interface BotControlProps {
  onConnect: (host: string, port: number, username: string) => void;
  onDisconnect: () => void;
  onSendChat: (msg: string) => void;
  onSendAI: (instruction: string) => void;
  status: { connected: boolean; username?: string };
}

export default function BotControl({ onConnect, onDisconnect, onSendChat, onSendAI, status }: BotControlProps) {
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState(25565);
  const [username, setUsername] = useState('AIBot');
  const [chatMsg, setChatMsg] = useState('');
  const [aiInstruction, setAiInstruction] = useState('');

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect(host, port, username);
  };

  return (
    <div className="space-y-6">
      {/* Connection Panel */}
      <div className="p-6 bg-[#1a1a1a] border border-[#222] rounded-sm">
        <h2 className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-6 flex items-center gap-2">
          <Globe size={12} className="text-green-500" /> SATELLITE_UPLINK
        </h2>
        
        <form onSubmit={handleConnect} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[9px] uppercase font-bold text-gray-600 tracking-tighter">Host Address</label>
            <div className="relative">
              <input 
                type="text" 
                value={host}
                onChange={e => setHost(e.target.value)}
                disabled={status.connected}
                className="w-full px-3 py-2 bg-[#0c0c0c] border border-[#333] rounded-sm text-sm text-gray-300 focus:outline-none focus:border-green-500/50 transition-colors disabled:opacity-50"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] uppercase font-bold text-gray-600 tracking-tighter">Port</label>
            <div className="relative">
              <input 
                type="number" 
                value={port}
                onChange={e => setPort(parseInt(e.target.value))}
                disabled={status.connected}
                className="w-full px-3 py-2 bg-[#0c0c0c] border border-[#333] rounded-sm text-sm text-gray-300 focus:outline-none focus:border-green-500/50 transition-colors disabled:opacity-50"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] uppercase font-bold text-gray-600 tracking-tighter">Identifier</label>
            <div className="relative">
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={status.connected}
                className="w-full px-3 py-2 bg-[#0c0c0c] border border-[#333] rounded-sm text-sm text-gray-300 focus:outline-none focus:border-green-500/50 transition-colors disabled:opacity-50"
              />
            </div>
          </div>
          <div className="flex items-end">
            {!status.connected ? (
              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2 bg-white text-black rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors"
              >
                INITIALIZE_BOT
              </button>
            ) : (
              <button 
                onClick={onDisconnect}
                type="button"
                className="w-full flex items-center justify-center gap-2 py-2 bg-red-950/20 text-red-500 border border-red-900/30 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-red-900/40 transition-colors"
              >
                KILL_PROCESS
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chat Control */}
        <div className="p-6 bg-[#1a1a1a] border border-[#222] rounded-sm">
          <h2 className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-6 flex items-center gap-2">
            <Send size={12} /> BROADCAST_SIGNAL
          </h2>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Transmit message to server stream..."
              value={chatMsg}
              onChange={e => setChatMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (onSendChat(chatMsg), setChatMsg(''))}
              className="flex-1 px-4 py-3 bg-[#0c0c0c] border border-[#333] rounded-sm text-sm text-gray-300 focus:outline-none focus:border-white/20"
            />
            <button 
              onClick={() => { onSendChat(chatMsg); setChatMsg(''); }}
              className="px-4 bg-[#222] text-white rounded-sm hover:bg-[#333] transition-colors uppercase text-[10px] font-bold flex items-center gap-2"
            >
              SEND
            </button>
          </div>
        </div>

        {/* AI Command */}
        <div className="p-6 bg-[#000] border border-[#333] rounded-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
            <Zap size={140} className="text-green-500" />
          </div>
          <h2 className="text-[10px] uppercase tracking-widest font-bold text-green-500 mb-6 flex items-center gap-2 relative z-10">
            <Zap size={12} /> NEURAL_COMMAND_INPUT
          </h2>
          <div className="flex flex-col gap-3 relative z-10">
            <textarea 
              rows={1}
              placeholder="Inject natural language intent... (e.g. 'Harvest nearby coal')"
              value={aiInstruction}
              onChange={e => setAiInstruction(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (onSendAI(aiInstruction), setAiInstruction(''))}
              className="w-full px-4 py-3 bg-[#111] border border-[#222] rounded-sm text-sm text-gray-300 focus:outline-none focus:border-green-500/50 resize-none min-h-[46px]"
            />
            <div className="flex gap-2">
              <button 
                onClick={() => { onSendAI(aiInstruction); setAiInstruction(''); }}
                className="flex-1 py-2 bg-green-500 text-black rounded-sm hover:bg-green-400 transition-colors uppercase text-xs font-bold tracking-widest"
              >
                EXECUTE
              </button>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/5 relative z-10">
            <p className="text-[9px] uppercase font-bold text-gray-600 mb-3 tracking-widest">Automation Modules</p>
            <div className="flex flex-wrap gap-2 mb-4">
               {['Mine Coal', 'Mine Iron', 'Follow Me', 'Stop All'].map(task => (
                 <button 
                   key={task}
                   onClick={() => onSendAI(task)}
                   className="px-3 py-1.5 bg-[#111] border border-[#222] hover:border-green-500/50 hover:text-green-400 text-[10px] font-mono tracking-tighter uppercase transition-all rounded-sm"
                 >
                   {task}
                 </button>
               ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => onSendAI("Enable Auto-Grind")}
                className="py-2 bg-blue-900/20 text-blue-400 border border-blue-900/30 text-[10px] uppercase font-bold tracking-widest hover:bg-blue-900/40"
              >
                AUTO_GRIND
              </button>
              <button 
                onClick={() => onSendAI("Enable Guard Mode")}
                className="py-2 bg-red-900/20 text-red-500 border border-red-900/30 text-[10px] uppercase font-bold tracking-widest hover:bg-red-900/40"
              >
                GUARD_DEFENSE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
