import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { router } from './lib/router';


function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <RouterProvider
          router={router}
          future={{
            v7_startTransition: true,
          }}
        />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
