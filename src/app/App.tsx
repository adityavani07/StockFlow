import { RouterProvider } from 'react-router';
import { InventoryProvider } from './context/InventoryContext';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <InventoryProvider>
      <RouterProvider router={router} />
      <Toaster />
    </InventoryProvider>
  );
}
