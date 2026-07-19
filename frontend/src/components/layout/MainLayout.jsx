import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import OfferBar from './OfferBar';
import WhatsAppButton from './WhatsAppButton';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <OfferBar />
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
