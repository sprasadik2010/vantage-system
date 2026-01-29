import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

export default function SocialMediaLinks() {
  return (
    <div className="hidden md:flex space-x-4">
      <a 
        href="https://facebook.com" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-gray-600 hover:text-blue-600"
      >
        <FaFacebook size={20} />
      </a>
      <a 
        href="https://twitter.com" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-gray-600 hover:text-blue-400"
      >
        <FaTwitter size={20} />
      </a>
      <a 
        href="https://instagram.com" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-gray-600 hover:text-pink-600"
      >
        <FaInstagram size={20} />
      </a>
    </div>
  );
}