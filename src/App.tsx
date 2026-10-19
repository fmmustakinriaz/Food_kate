import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Toaster } from '@/components/Toast';
import { RequireAuth, RequireAdmin } from '@/components/ProtectedRoute';

import Home from '@/pages/Home';
import Menu from '@/pages/Menu';
import FoodDetails from '@/pages/FoodDetails';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Profile from '@/pages/Profile';
import Orders from '@/pages/Orders';

import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import ManageFoods from '@/pages/admin/ManageFoods';
import ManageOrders from '@/pages/admin/ManageOrders';
import ManageCustomers from '@/pages/admin/ManageCustomers';
import FoodForm from '@/pages/admin/FoodForm';
import EditFood from '@/pages/admin/EditFood';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/food/:id" element={<FoodDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/checkout" element={
                  <RequireAuth><Checkout /></RequireAuth>
                } />
                <Route path="/profile" element={
                  <RequireAuth><Profile /></RequireAuth>
                } />
                <Route path="/orders" element={
                  <RequireAuth><Orders /></RequireAuth>
                } />

                <Route path="/admin" element={
                  <RequireAdmin><AdminLayout /></RequireAdmin>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="foods" element={<ManageFoods />} />
                  <Route path="foods/new" element={<FoodForm />} />
                  <Route path="foods/:id/edit" element={<EditFood />} />
                  <Route path="orders" element={<ManageOrders />} />
                  <Route path="customers" element={<ManageCustomers />} />
                </Route>

                <Route path="*" element={
                  <div className="container-page py-20 text-center">
                    <p className="text-6xl font-bold text-primary-600">404</p>
                    <p className="mt-2 text-ink-500">This page doesn't exist.</p>
                  </div>
                } />
              </Routes>
            </main>
            <Footer />
            <CartDrawer />
            <Toaster />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
