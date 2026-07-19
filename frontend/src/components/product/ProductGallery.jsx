import React, { useState } from 'react';
import { ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductGallery({ images, title }) {
  const [mainImage, setMainImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const nextImage = () => setMainImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setMainImage((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div 
        className="relative aspect-square bg-stone-100 rounded-lg overflow-hidden cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={images[mainImage]}
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-200 ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          style={isZoomed ? {
            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
          } : {}}
        />

        {/* Navigation Arrows */}
        <button
          onClick={prevImage}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-colors"
        >
          <ChevronRight size={20} />
        </button>

        {/* Zoom indicator */}
        <div className="absolute bottom-3 right-3 p-2 bg-white/80 rounded-full">
          <ZoomIn size={16} className="text-stone-600" />
        </div>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-3">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setMainImage(idx)}
            className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
              mainImage === idx ? 'border-leather-700' : 'border-transparent hover:border-stone-300'
            }`}
          >
            <img
              src={img}
              alt={`${title} - view ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
