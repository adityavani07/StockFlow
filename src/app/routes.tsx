import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Receipts } from './pages/Receipts';
import { Transfers } from './pages/Transfers';
import { Deliveries } from './pages/Deliveries';
import { Adjustments } from './pages/Adjustments';
import { MoveHistory } from './pages/MoveHistory';
import { Warehouses } from './pages/Warehouses';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'products',
        element: <Products />,
      },
      {
        path: 'receipts',
        element: <Receipts />,
      },
      {
        path: 'transfers',
        element: <Transfers />,
      },
      {
        path: 'deliveries',
        element: <Deliveries />,
      },
      {
        path: 'adjustments',
        element: <Adjustments />,
      },
      {
        path: 'history',
        element: <MoveHistory />,
      },
      {
        path: 'warehouses',
        element: <Warehouses />,
      },
    ],
  },
]);
