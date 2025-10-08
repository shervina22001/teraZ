import React from 'react';
import { usePage, Link } from '@inertiajs/react';

// Color Configuration
const colors = {
  text: '#FFFFFF',
  buttonLogin: '#C9A982',
  buttonContact: '#FFFFFF',
  buttonContactText: '#2C2420',
  buttonContactBorder: '#8B7355',
};

const Navbar = () => {
  const { auth } = usePage<{ auth?: { user?: { name: string; } } }>().props;
  const user = auth?.user;


  return (
    <nav
      className="w-full px-8 flex items-center"
      style={{ fontFamily: "'Poppins', sans-serif", height: '85px' }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between w-full min-w-0">
        {/* Logo */}
        <div className="relative flex items-center flex-shrink-0">
          <img
            src="/teraZ/logo.png"
            alt="Arzeta Logo"
            className="object-contain -ml-4"
            style={{ height: 88, width: 88, transform: 'scale(1.8)' }}
          />
        </div>

        <div
          className="flex items-center gap-8 mx-4 flex-shrink min-w-0 overflow-x-auto no-scrollbar"
          style={{ whiteSpace: 'nowrap' }}
        >
          {['Home', 'About', 'Facilities', 'Room', 'Testimonial'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="font-medium text-sm tracking-wide transition-colors duration-200"
              style={{ color: colors.text }}
              onMouseEnter={(e) => (e.currentTarget.style.color = colors.buttonLogin)}
              onMouseLeave={(e) => (e.currentTarget.style.color = colors.text)}
            >
              {item}
            </a>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Tombol Login atau Profil */}
          {!user ? (
            <Link href="/login">
              <button
                className="rounded-full font-medium text-sm transition-all hover:scale-110"
                style={{
                  minWidth: 120,
                  height: 36,
                  backgroundColor: colors.buttonLogin,
                  color: colors.buttonContactText,
                }}
              >
                Login
              </button>
            </Link>
          ) : (
            <Link href="/user">
              <button
                className="rounded-full font-medium text-sm transition-all hover:scale-110"
                style={{
                  minWidth: 120,
                  height: 36,
                  backgroundColor: colors.buttonLogin,
                  color: colors.buttonContactText,
                }}
              >
                {user.name}
              </button>
            </Link>
          )}

          {/* Tombol Contact Us */}
          <a
            href="#contact"
            className="rounded-full font-medium text-sm transition-all hover:scale-110 flex items-center justify-center"
            style={{
              minWidth: 120,
              height: 36,
              backgroundColor: colors.buttonContact,
              color: colors.buttonContactText,
              border: `2px solid ${colors.buttonContactBorder}`,
            }}
          >
            Contact Us
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
