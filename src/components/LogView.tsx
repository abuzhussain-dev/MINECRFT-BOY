import React, { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';

interface LogViewProps {
  logs: string[];
}

export default function LogView({ logs }: LogViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-black border border-[#222] rounded-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-[#0c0c0c] border-b border-[#222]">
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-green-500" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500">RUNTIME_LOG_STREAM</span>
        </div>
        <span className="text-[9px] font-mono text-gray-600">v1.2.0</span>
      </div>
      <div 
        ref={scrollRef}
        className="flex-1 p-5 font-mono text-[12px] leading-relaxed overflow-y-auto scrollbar-thin scrollbar-thumb-[#222] bg-black selection:bg-green-500 selection:text-black"
      >
        {logs.length === 0 ? (
          <div className="text-gray-700 italic text-center py-8 font-mono text-xs uppercase tracking-tighter">Initializing sequence... Standing by for stream.</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="mb-2 flex items-start gap-3 border-l border-white/5 pl-3">
              <span className="text-gray-600 shrink-0 text-[10px] mt-0.5">{log.match(/\[(.*?)\]/)?.[0]}</span>
              <span className="text-gray-300 break-all">{log.replace(/\[(.*?)\]\s/, '')}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
