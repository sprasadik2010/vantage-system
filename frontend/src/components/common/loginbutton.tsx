import { Link } from "react-router-dom";

export default function LoginButton() {
  return (
    <Link 
      to="/login" 
      className="hidden md:block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500"
    >
      Login
    </Link>
  );
}