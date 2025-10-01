import React, { useState } from 'react';

const RoomSection: React.FC = () => {
  const rooms = [
    {
      id: 1,
      name: 'Kamar Tipe A',
      type: 'Single Room',
      price: 'Rp. 850.000',
      priceNote: 'per bulan',
      size: '3 x 4 Meter',
      images: [
        '/teraZ/kamar2.jpg',
        '/teraZ/kamar2-2.jpg',
      ],
      facilities: ['Kipas Angin', 'Wi-Fi', 'Kamar Mandi Luar', 'Lemari', 'Kasur']
    },
    {
      id: 2,
      name: 'Kamar Tipe B',
      type: 'Single Room',
      price: 'Rp. 1,000,000',
      priceNote: 'per bulan',
      size: '3 x 4 Meter',
      images: [
        '/teraZ/kamar1.jpg',
        '/teraZ/kamar1-2.jpg',
      ],
      facilities: ['AC', 'Wi-Fi', 'Kamar Mandi Dalam', 'Lemari', 'Kasur']
    }
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: number]: number }>({
    1: 0,
    2: 0
  });

  const nextImage = (roomId: number, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [roomId]: (prev[roomId] + 1) % totalImages
    }));
  };

  const prevImage = (roomId: number, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [roomId]: (prev[roomId] - 1 + totalImages) % totalImages
    }));
  };

  const goToImage = (roomId: number, index: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [roomId]: index
    }));
  };

  return (
    <section
      id="room"
      className="bg-[#E5E0D8] py-16 px-4 scroll-mt-28"
    >
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <h2 className="text-3xl md:text-2xl font-bold text-center mb-12 bg-gradient-to-r from-[#3b0b01] via-[#ca381a] to-[#f8a08f] bg-clip-text text-transparent">
          Room Types for Your Stay
        </h2>

        {/* Room Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-[#CEC2BB] rounded-2xl overflow-hidden shadow-lg"
            >
              {/* Room Image Slider */}
              <div className="relative group">
                <img
                  src={room.images[currentImageIndex[room.id]]}
                  alt={`${room.name} - ${currentImageIndex[room.id] + 1}`}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Navigation Buttons */}
                {room.images.length > 1 && (
                  <>
                    {/* Previous Button */}
                    <button
                      onClick={() => prevImage(room.id, room.images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    >
                      ‹
                    </button>

                    {/* Next Button */}
                    <button
                      onClick={() => nextImage(room.id, room.images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    >
                      ›
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
                      {room.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToImage(room.id, index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            currentImageIndex[room.id] === index
                              ? 'bg-white w-6'
                              : 'bg-white/50 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Room Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{room.name}</h3>
                      <p className="text-sm opacity-90">{room.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{room.price}</p>
                      <p className="text-sm opacity-90">{room.priceNote}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Room Details */}
              <div className="p-6">
                <p className="text-[#412E27] mb-3 font-medium">
                  Ukuran: {room.size}
                </p>

                <p className="text-[#412E27] mb-3 font-medium">Fasilitas:</p>

                <div className="flex flex-wrap gap-2">
                  {room.facilities.map((facility, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-[#49493A] text-white text-sm rounded-md"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoomSection;
