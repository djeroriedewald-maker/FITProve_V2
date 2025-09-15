import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AuthDebugPanel } from './components/ui/AuthDebugPanel';
import { router } from './lib/router';

function App() {
  return (
    <AuthProvider>
      <RouterProvider
        router={router}
        future={{
          v7_startTransition: true,
        }}
      />
      {/* Debug panel for development - only shows in dev mode */}
      {import.meta.env.DEV && <AuthDebugPanel />}
    </AuthProvider>
  );
}

export default App;