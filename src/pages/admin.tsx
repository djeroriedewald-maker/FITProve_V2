import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { isAdmin } from '../api/admin';

export default function AdminPanel() {
  const { user } = useAuth();
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) {
      setIsAdminUser(false);
      return;
    }
    isAdmin(user.id).then(setIsAdminUser);
  }, [user]);

  if (isAdminUser === null) return <div className="p-8">Loading...</div>;
  if (!isAdminUser) return <div className="p-8 text-red-600">Geen toegang: alleen admins mogen deze pagina zien.</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <p className="mb-2">Welkom, admin! Hier kun je badges beheren, admins uitnodigen en meer.</p>
      {/* Voeg hier admin functionaliteit toe */}
    </div>
  );
}
