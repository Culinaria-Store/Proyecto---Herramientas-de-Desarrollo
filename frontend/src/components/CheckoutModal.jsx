import { useState } from 'react';
import apiClient from '../api/apiClient';
import { validateCheckoutForm, validateCartBeforeCheckout } from '../utils/validators';
import { useNavigate } from 'react-router-dom';

const CheckoutModal = ({ items, total, onClose, onSuccess }) => {
  const [sucursalId, setSucursalId] = useState('CHICLAYO-CENTRO');
  const [direccion, setDireccion] = useState('');
  const [tipoComprobante, setTipoComprobante] = useState('BOLETA');
  const [ruc, setRuc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [tipoPago, setTipoPago] = useState('TARJETA');
  const [numeroPago, setNumeroPago] = useState('');
  const [nombreTitular, setNombreTitular] = useState('');
  const [fechaExpiracion, setFechaExpiracion] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async (e) => {
    e.preventDefault();
    setErrors({});

    const cartErrors = validateCartBeforeCheckout(items);
    if (cartErrors.length > 0) return alert(cartErrors.join('\n'));

    const checkoutData = {
      tipoPago, numeroPago, nombreTitular,
      fechaExpiracion, cvv, sucursalId,
      tipoComprobante, ruc, razonSocial, direccion
    };

    const formErrors = validateCheckoutForm(checkoutData);
    if (Object.values(formErrors).some(e => e !== null)) {
      setErrors(formErrors);
      return;
    }

    try {
      setLoading(true);
      await apiClient.post('/ventas/checkout', { items, total, ...checkoutData });
      alert('🚀 ¡Pago autorizado! La facturación y el inventario han sido actualizados.');
      onSuccess();
      navigate('/mis-pedidos');
    } catch (err) {
      alert('Error en pasarela: ' + (err.response?.data?.message || 'Error al conectar con el banco emisor'));
    } finally {
      setLoading(false);
    }
  };

  // Input reutilizable con el estilo del proyecto (blanco/dorado)
  const Campo = ({ type = 'text', placeholder, value, onChange, maxLength, error }) => (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        placeholder={placeholder}
        style={{
          padding: '11px 14px',
          background: 'white',
          color: '#1a1a1a',
          border: error ? '1px solid #c00' : '1px solid #ddd',
          borderRadius: '8px',
          fontSize: '0.9rem',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box'
        }}
        onFocus={e => e.target.style.border = '1px solid #B8860B'}
        onBlur={e => e.target.style.border = error ? '1px solid #c00' : '1px solid #ddd'}
      />
      {error && <span style={{ fontSize: '0.75rem', color: '#c00', marginTop: '4px' }}>{error}</span>}
    </div>
  );

  const Label = ({ children }) => (
    <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#888', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>
      {children}
    </label>
  );

  const Section = ({ number, title, children }) => (
    <div style={{ marginTop: '25px' }}>
      <h4 style={{ margin: '0 0 18px', color: '#1a1a1a', fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ background: '#1a1a1a', color: 'gold', width: '24px', height: '24px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>
          {number}
        </span>
        {title}
      </h4>
      {children}
    </div>
  );

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'white', padding: '35px', borderRadius: '15px', border: '1px solid #eee', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid gold', paddingBottom: '15px', marginBottom: '5px' }}>
          <div>
            <h3 style={{ margin: 0, color: '#1a1a1a', fontWeight: '800', fontSize: '1.2rem' }}>Finalizar Compra</h3>
            <p style={{ margin: '4px 0 0', color: '#888', fontSize: '0.8rem' }}>🔒 Pago 100% seguro — SSL cifrado</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#aaa', lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={handleCheckout}>

          {/* SECCIÓN 1: Facturación */}
          <Section number="1" title="Datos de Facturación y Entrega">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <Label>SUCURSAL</Label>
                <select
                  value={sucursalId}
                  onChange={e => setSucursalId(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', background: 'white', color: '#1a1a1a' }}
                >
                  <option value="CHICLAYO-CENTRO">Sede Central — Chiclayo</option>
                  <option value="CHICLAYO-MALL">Sede Mall Aventura</option>
                </select>
              </div>
              <div>
                <Label>COMPROBANTE</Label>
                <select
                  value={tipoComprobante}
                  onChange={e => { setTipoComprobante(e.target.value); setRuc(''); setRazonSocial(''); }}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', background: 'white', color: '#1a1a1a' }}
                >
                  <option value="BOLETA">Boleta Electrónica</option>
                  <option value="FACTURA">Factura Corporativa</option>
                </select>
              </div>
            </div>

            <Label>DIRECCIÓN DE ENTREGA</Label>
            <Campo placeholder="Av. Principal 123, Dpto 402" value={direccion} onChange={e => setDireccion(e.target.value)} error={errors.direccion} />

            {tipoComprobante === 'FACTURA' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px', padding: '15px', background: '#fafafa', borderRadius: '8px', border: '1px dashed #ddd' }}>
                <div>
                  <Label>RUC</Label>
                  <Campo placeholder="20xxxxxxxxx" value={ruc} onChange={e => setRuc(e.target.value.replace(/\D/g, ''))} maxLength={11} error={errors.ruc} />
                </div>
                <div>
                  <Label>RAZÓN SOCIAL</Label>
                  <Campo placeholder="Empresa S.A.C." value={razonSocial} onChange={e => setRazonSocial(e.target.value)} error={errors.razonSocial} />
                </div>
              </div>
            )}
          </Section>

          {/* SECCIÓN 2: Método de pago */}
          <Section number="2" title="Método de Pago">
            {/* Selector de método */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              {['TARJETA', 'YAPE'].map(metodo => (
                <label
                  key={metodo}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem',
                    border: tipoPago === metodo ? '2px solid #B8860B' : '1px solid #ddd',
                    background: tipoPago === metodo ? '#fffbf0' : 'white',
                    color: tipoPago === metodo ? '#B8860B' : '#555'
                  }}
                >
                  <input
                    type="radio" name="pago" value={metodo}
                    checked={tipoPago === metodo}
                    onChange={() => { setTipoPago(metodo); setNumeroPago(''); setErrors({}); }}
                    style={{ display: 'none' }}
                  />
                  {metodo === 'TARJETA' ? '💳 Tarjeta' : '📱 Yape'}
                </label>
              ))}
            </div>

            {/* Campos dinámicos */}
            <div style={{ background: '#fafafa', padding: '20px', borderRadius: '10px', border: '1px solid #eee' }}>
              {tipoPago === 'TARJETA' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <Label>NÚMERO DE TARJETA</Label>
                    <Campo placeholder="1234 5678 9012 3456" value={numeroPago} onChange={e => setNumeroPago(e.target.value.replace(/\D/g, ''))} maxLength={16} error={errors.numeroPago} />
                  </div>
                  <div>
                    <Label>NOMBRE EN LA TARJETA</Label>
                    <Campo placeholder="JUAN PÉREZ" value={nombreTitular} onChange={e => setNombreTitular(e.target.value.toUpperCase())} error={errors.nombreTitular} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <Label>VENCIMIENTO</Label>
                      <Campo placeholder="MM/AA" value={fechaExpiracion} onChange={e => setFechaExpiracion(e.target.value)} maxLength={5} error={errors.fechaExpiracion} />
                    </div>
                    <div>
                      <Label>CVV</Label>
                      <Campo type="password" placeholder="•••" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, ''))} maxLength={4} error={errors.cvv} />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '12px', margin: '0 0 14px' }}>
                    Ingresa el número de celular registrado en tu cuenta Yape.
                  </p>
                  <Label>NÚMERO YAPE</Label>
                  <Campo placeholder="987 654 321" value={numeroPago} onChange={e => setNumeroPago(e.target.value.replace(/\D/g, ''))} maxLength={9} error={errors.numeroPago} />
                </div>
              )}
            </div>
          </Section>

          {/* Footer con total y botón */}
          <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#aaa', fontWeight: 'bold' }}>TOTAL A PAGAR</p>
              <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: '900', color: '#B8860B' }}>S/ {total.toFixed(2)}</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#ccc' : '#1a1a1a',
                color: 'gold',
                border: 'none',
                padding: '14px 35px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.95rem',
                letterSpacing: '0.5px'
              }}
            >
              {loading ? 'Procesando...' : 'PAGAR AHORA'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;