import { useState, useEffect } from 'react';
import { supabase } from './client';
import { useNavigate } from 'react-router-dom';

const UserIcon = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
      }
    };
    getUser();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <div className="relative">
      <div 
        className="flex items-center space-x-3 cursor-pointer hover:bg-gray-600 p-2 rounded-lg transition-colors"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {/* W3.org-style user icon (from Icons8) */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-6 h-6 text-gray-300 hover:text-white"
        >
          <path 
            fillRule="evenodd" 
            d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" 
            clipRule="evenodd" 
          />
        </svg>

        <span className="text-white text-sm truncate max-w-[150px]">{userEmail}</span>
      </div>

      {/* Optional dropdown menu */}
      {isMenuOpen && (
        <div className="absolute bottom-16 left-4 w-48 bg-gray-600 rounded-md shadow-lg z-10 border border-gray-600">
          <div className="py-1">
            <button 
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-500 border-t border-gray-600"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserIcon;