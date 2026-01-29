import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function MobileMenu() {
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClasses = ({ isActive }: { isActive: boolean }): string =>
    isActive
      ? "bg-blue-600 text-white px-4 py-2 rounded"
      : "hover:text-blue-500 text-gray-700 px-4 py-2";

  return (
    <>
      {/* Hamburger Icon */}
      <button
        className="md:hidden text-gray-600 text-2xl z-50 relative"
        onClick={() => setMenuOpen(true)}
        aria-label="Open mobile menu"
      >
        ☰
      </button>

      {/* Overlay */}
      <div
        className={`fixed top-0 right-0 w-full h-full bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Slide-in Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-3/4 max-w-sm bg-white shadow-md z-50 transform transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-600 text-2xl"
          onClick={() => setMenuOpen(false)}
          aria-label="Close mobile menu"
        >
          ✕
        </button>

        {/* Menu Items */}
        <ul className="flex flex-col space-y-4 mt-16 px-6">
          <li>
            <NavLink 
              to="/" 
              onClick={() => setMenuOpen(false)} 
              className={linkClasses}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/about" 
              onClick={() => setMenuOpen(false)} 
              className={linkClasses}
            >
              About BrandFX
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/whatwedo" 
              onClick={() => setMenuOpen(false)} 
              className={linkClasses}
            >
              What We Do
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/copytrading" 
              onClick={() => setMenuOpen(false)} 
              className={linkClasses}
            >
              Copy Trading
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/contact" 
              onClick={() => setMenuOpen(false)} 
              className={linkClasses}
            >
              Contact
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="block bg-blue-600 text-white text-center py-2 rounded-lg"
            >
              Login
            </NavLink>
          </li>
        </ul>
      </div>
    </>
  );
}