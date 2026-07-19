import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-serif font-bold text-white mb-4">
              Leather<span className="text-gold-400">&</span>Goods
            </h3>
            <p className="text-sm leading-relaxed mb-4">
              Premium handcrafted leather accessories for the discerning gentleman and lady. 
              Quality that lasts a lifetime.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-stone-400 hover:text-gold-400 transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-stone-400 hover:text-gold-400 transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-stone-400 hover:text-gold-400 transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" className="hover:text-gold-400 transition-colors">Shop All</Link></li>
              <li><Link to="/shop/men_purse" className="hover:text-gold-400 transition-colors">Men's Purses</Link></li>
              <li><Link to="/shop/ladies_purse" className="hover:text-gold-400 transition-colors">Ladies' Purses</Link></li>
              <li><Link to="/shop/gents_belt" className="hover:text-gold-400 transition-colors">Gents' Belts</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/profile" className="hover:text-gold-400 transition-colors">My Account</Link></li>
              <li><Link to="/profile?tab=orders" className="hover:text-gold-400 transition-colors">Order Tracking</Link></li>
              <li><Link to="/profile?tab=complaints" className="hover:text-gold-400 transition-colors">Returns & Complaints</Link></li>
              <li><span className="hover:text-gold-400 transition-colors cursor-pointer">Size Guide</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-gold-400" />
                <span>support@leathergoods.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-gold-400" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-gold-400 mt-0.5" />
                <span>123 Leather Lane, Craft District<br />New York, NY 10001</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-10 pt-6 text-center text-sm text-stone-500">
          <p> {new Date().getFullYear()} Leather & Goods. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
