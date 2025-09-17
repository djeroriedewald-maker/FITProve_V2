import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { isAdmin } from '../../api/admin';

export const AdminPanelMenuItem = () => {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setShow(false);
      setChecked(true);
      return;
    }
    isAdmin(user.id).then(isAdminResult => {
      setShow(isAdminResult);
      setChecked(true);
    });
  }, [user]);

  if (!checked || !user || !show) return null;
  return (
    <button
      onClick={() => navigate('/admin')}
      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
    >
      <Shield className="w-4 h-4" />
      <span>Admin Panel</span>
    </button>
  );
};
