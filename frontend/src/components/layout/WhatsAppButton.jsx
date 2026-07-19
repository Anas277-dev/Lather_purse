import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useQuery } from 'react-query';
import { settingsAPI } from '../../services/api.js';

export default function WhatsAppButton() {
  const { data } = useQuery('siteSettings', settingsAPI.get, {
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
  });

  const phoneNumber = data?.whatsapp_number || '+1234567890';
  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\+/g, '')}?text=Hi! I have a question about your products.`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all hover:scale-110"
      title="Chat on WhatsApp"
    >
      <MessageCircle size={24} />
    </a>
  );
}
