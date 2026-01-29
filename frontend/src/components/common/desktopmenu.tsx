import { NavLink } from "react-router-dom";

export default function DeskTopMenu() {
  const linkClasses = ({ isActive }: { isActive: boolean }): string =>
    isActive
      ? "bg-blue-600 text-white px-4 py-2 rounded"
      : "hover:text-blue-500 text-gray-700 px-4 py-2";

  return (
    <ul className="hidden md:flex space-x-6">
      <li>
        <NavLink to="/" className={linkClasses}>
          Home
        </NavLink>
      </li>
      <li>
        <NavLink to="/about" className={linkClasses}>
          About BrandFX
        </NavLink>
      </li>
      <li>
        <NavLink to="/whatwedo" className={linkClasses}>
          What We Do
        </NavLink>
      </li>
      <li>
        <NavLink to="/copytrading" className={linkClasses}>
          Copy Trading
        </NavLink>
      </li>
      <li>
        <NavLink to="/contact" className={linkClasses}>
          Contact
        </NavLink>
      </li>
    </ul>
  );
}