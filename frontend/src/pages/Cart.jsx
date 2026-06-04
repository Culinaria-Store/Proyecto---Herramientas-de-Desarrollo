import { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import { Link } from 'react-router-dom';
import CheckoutModal from '../components/CheckoutModal';
import { formatPrice } from '../utils/validators';

const Cart = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const API_BASE = 'http://localhost:5000';

  const loadCart = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await apiClient.get('/carrito');
        setItems(res.data);
        localStorage.setItem('cart', JSON.stringify(res.data));
      } catch (err) {
        const raw = localStorage.getItem('cart');
        setItems(raw ? JSON.parse(raw) : []);
      }
    } else {
      const raw = localStorage.getItem('cart');
      setItems(raw ? JSON.parse(raw) : []);
    }
  };

  useEffect(() => {
    const suma = items.reduce((acc, item) =>
      acc + (parseFloat(item.precio) || 0) * (parseInt(item.cantidad) || 0), 0);
    setTotal(suma);
  }, [items]);

  useEffect(() => {
    loadCart();
    window.addEventListener('cartUpdated', loadCart);
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, []);

  const removeItem = async (id) => {
    const token = localStorage.getItem('token');
    try {
      if (token) await apiClient.delete(`/carrito/${id}`);
      const updated = items.filter(item => item.id_producto !== id);
      setItems(updated);
      localStorage.setItem('cart', JSON.stringify(updated));
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      alert('No se pudo eliminar el producto.');
    }
  };

  const handleCheckoutSuccess = () => {
    setItems([]);
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cartUpdated'));
    setIsModalOpen(false);
  };

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px', background: '#f9f9f9', minHeight: '80vh' }}>
        <div style={{ fontSize: '4rem' }}>🛒</div>
        <h3 style={{ color: '#555', margin: '20px 0 10px' }}>Tu carrito está vacío</h3>
        <p style={{ color: '#888', marginBottom: '30px' }}>Aún no has elegido tu equipamiento profesional.</p>
        <Link to="/catalogo" style={{ color: '#B8860B', fontWeight: 'bold', textDecoration: 'none', borderBottom: '2px solid gold', paddingBottom: '3px' }}>
          IR AL CATÁLOGO
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: '#1a1a1a', minHeight: '100vh', padding: '50px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', background: 'white', borderRadius: '15px', padding: '40px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid gold', paddingBottom: '15px' }}>
          <h2 style={{ margin: 0, fontWeight: '800', color: '#1a1a1a' }}>Resumen de Pedido</h2>
          <span style={{ color: '#888', fontSize: '0.9rem' }}>{items.length} artículo(s)</span>
        </header>

        {/* Tabla */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee', color: '#B8860B', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>
              <th style={{ padding: '10px 0' }}>PRODUCTO</th>
              <th>CANT.</th>
              <th>PRECIO</th>
              <th>SUBTOTAL</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id_producto} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '15px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={`${API_BASE}${item.imagen_url}`}
                    alt={item.nombre_producto}
                    style={{ width: '50px', height: '50px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #eee' }}
                  />
                  <span style={{ fontWeight: '600', color: '#1a1a1a', fontSize: '0.9rem' }}>{item.nombre_producto}</span>
                </td>
                <td style={{ color: '#555' }}>{item.cantidad}</td>
                <td style={{ color: '#555' }}>{formatPrice(item.precio)}</td>
                <td style={{ fontWeight: 'bold', color: '#B8860B' }}>
                  {formatPrice(parseFloat(item.precio) * item.cantidad)}
                </td>
                <td>
                  <button
                    onClick={() => removeItem(item.id_producto)}
                    style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '1.1rem', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = '#c00'}
                    onMouseLeave={e => e.target.style.color = '#ccc'}
                  >✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div style={{ marginTop: '35px', paddingTop: '20px', borderTop: '2px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/catalogo" style={{ color: '#888', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 'bold' }}>
            ← Seguir comprando
          </Link>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '0 0 15px', fontSize: '1.5rem', fontWeight: '900', color: '#1a1a1a' }}>
              Total: <span style={{ color: '#B8860B' }}>{formatPrice(total)}</span>
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{ background: '#1a1a1a', color: 'gold', border: 'none', padding: '14px 40px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem', letterSpacing: '0.5px' }}
            >
              PROCEDER AL PAGO
            </button>
          </div>
        </div>

      </div>

      {isModalOpen && (
        <CheckoutModal
          items={items}
          total={total}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </div>
  );
};

export default Cart;