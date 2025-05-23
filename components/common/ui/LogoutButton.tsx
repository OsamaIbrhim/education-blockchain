import { useRouter } from 'next/router';
import { FiLogOut } from 'react-icons/fi';

interface LogoutButtonProps {
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ className = '' }) => {
  const router = useRouter();

  const handleLogout = () => {
    // Clear any stored state/tokens
    localStorage.removeItem('userRole');
    localStorage.removeItem('userAddress');
    
    // Redirect to home page
    router.push('/');
  };

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 transition-colors ${className}`}
    >
      <FiLogOut className="w-5 h-5" />
      <span>تسجيل الخروج - Logout</span>
    </button>
  );
};

export default LogoutButton; 