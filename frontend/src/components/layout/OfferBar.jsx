import React from 'react';
import { useQuery } from 'react-query';
import { X, Tag } from 'lucide-react';
import { settingsAPI } from '../../services/api.js';

export default function OfferBar() {
  const [isVisible, setIsVisible] = React.useState(true);

  const { data } = useQuery('siteSettings', settingsAPI.get, {
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
  });

  if (!data?.offer_bar_active || !isVisible) return null;

  return (
    <div className="bg-leather-900 text-white text-center py-2.5 px-4 relative">
      <div className="flex items-center justify-center gap-2 text-sm">
        <Tag size={14} className="text-gold-400" />
        <span className="font-medium">{data.offer_bar_text}</span>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
      >
        <X size={16} />
      </button>
    </div>
  );
}
