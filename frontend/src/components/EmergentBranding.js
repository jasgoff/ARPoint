import React from 'react';
import { ExternalLink } from 'lucide-react';

const EmergentBranding = ({ position = 'bottom-right', show = true }) => {
  if (!show) return null;

  const positions = {
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'bottom-center': 'fixed bottom-4 left-1/2 -translate-x-1/2',
    'top-right': 'fixed top-20 right-4',
    'top-left': 'fixed top-20 left-4',
  };

  return (
    <a
      href="https://emergentagent.com"
      target="_blank"
      rel="noopener noreferrer"
      className={`${positions[position]} z-[9999] group`}
      title="Built with Emergent AI"
    >
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/80 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all hover:scale-105">
        <div className="w-5 h-5 rounded bg-gradient-to-br from-[#FF4500] to-[#FF6B35] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="currentColor">
            <path d="M12 2L2 7v10c0 5.5 3.8 10.7 10 12 6.2-1.3 10-6.5 10-12V7l-10-5z"/>
          </svg>
        </div>
        <span className="text-white/70 text-xs font-medium group-hover:text-white transition-colors">
          Made with Emergent
        </span>
        <ExternalLink className="w-3 h-3 text-white/40 group-hover:text-white/70 transition-colors" />
      </div>
    </a>
  );
};

export default EmergentBranding;
