// pages/Home.jsx
import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';

const SLIDES = [
  {
    tag: 'NUEVA COLECCIÓN 2026',
    title: 'La Gastronomía como Arte,\ny Emoción',
    desc: 'Utensilios de acero inoxidable y materiales premium para chefs que exigen lo mejor.',
    bg: 'linear-gradient(120deg,rgba(0,0,0,0.82) 45%,rgba(184,134,11,0.18) 100%),url("https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1400&q=80") center/cover no-repeat',
  },
  {
    tag: 'DISEÑO EXCLUSIVO',
    title: 'Equipamiento\nProfesional',
    desc: 'Cada pieza pensada para combinar rendimiento de chef con estética de cocina moderna.',
    bg: 'linear-gradient(120deg,rgba(0,0,0,0.82) 45%,rgba(184,134,11,0.18) 100%),url("https://images.unsplash.com/photo-1600891964092-4316c288032e?w=1400&q=80") center/cover no-repeat',
  },
];

const FEATURES = [
  { icon: '🏆', title: 'Calidad Premium',   desc: 'Materiales de acero inoxidable y cerámica de alta durabilidad.' },
  { icon: '🚚', title: 'Envío Nacional',    desc: 'Despacho a todo el Perú con seguimiento en tiempo real.' },
  { icon: '🔒', title: 'Compra Segura',     desc: 'Tus datos protegidos con cifrado SSL y pago verificado.' },
];

export default function Home() {
  const [productos, setProductos]   = useState([]);
  const [slide, setSlide]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState('');
  const { user }                    = useContext(AuthContext);
  const navigate                    = useNavigate();

  useEffect(() => {
    apiClient.get('/productos')
      .then(r => setProductos(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide(p => (p + 1) % SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);

  const addToCart = async (p) => {  
    if (!user) { navigate('/login'); return; }
    if (p.stock <= 0) return;
    try {
      await apiClient.post('/carrito/add', { id_producto: p.id_producto, cantidad: 1 });
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const idx  = cart.findIndex(i => i.id_producto === p.id_producto);
      idx > -1 ? cart[idx].cantidad++ : cart.push({ ...p, cantidad: 1 });
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
      setToast(`"${p.nombre_producto}" añadido al carrito`);
      setTimeout(() => setToast(''), 3000);
    } catch { setToast('Error al agregar producto'); setTimeout(() => setToast(''), 3000); }
  };

  return (
    <div>

      {/* ── HERO SLIDER ── */}
      <section style={{ position: 'relative', height: '82vh', overflow: 'hidden' }}>
        {SLIDES.map((sl, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0, background: sl.bg,
            display: 'flex', alignItems: 'center', padding: '0 8%',
            opacity: i === slide ? 1 : 0, transition: 'opacity 0.9s ease',
          }}>
            <div className="fade-in" style={{ maxWidth: 560 }}>
              <span style={h.tag}>{sl.tag}</span>
              <h1 style={h.title}>{sl.title.split('\n').map((l,i) => <span key={i}>{l}<br/></span>)}</h1>
              <p style={h.desc}>{sl.desc}</p>
              <div style={{ display: 'flex', gap: 16 }}>
                <Link to="/catalogo" style={h.btnGold}>VER CATÁLOGO</Link>
                {!user && <Link to="/register" style={h.btnOutline}>CREAR CUENTA</Link>}
              </div>
            </div>
          </div>
        ))}
        {/* Dots */}
        <div style={{ position:'absolute', bottom:28, left:'50%', transform:'translateX(-50%)', display:'flex', gap:8 }}>
          {SLIDES.map((_,i) => (
            <button key={i} onClick={() => setSlide(i)} style={{
              width: i===slide?28:10, height:10, borderRadius:5, border:'none', cursor:'pointer',
              background: i===slide?'#B8860B':'rgba(255,255,255,0.35)', transition:'all 0.3s',
            }}/>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ background:'#111', display:'grid', gridTemplateColumns:'repeat(3,1fr)', borderTop:'1px solid #1f1f1f' }}>
        {FEATURES.map((f,i) => (
          <div key={i} style={{ padding:'44px 36px', textAlign:'center', borderRight: i<2 ? '1px solid #1f1f1f' : 'none' }}>
            <span style={{ fontSize:'2.2rem', display:'block', marginBottom:12 }}>{f.icon}</span>
            <h3 style={{ color:'#B8860B', fontSize:'0.95rem', fontWeight:800, letterSpacing:'1px', marginBottom:8 }}>{f.title}</h3>
            <p  style={{ color:'#555', fontSize:'0.85rem', lineHeight:1.7 }}>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* ── PRODUCTOS DESTACADOS ── */}
      <section style={{ padding:'80px 6%', background:'#fafafa' }}>
        <div style={{ textAlign:'center', marginBottom:50 }}>
          <p style={{ color:'#B8860B', fontSize:'0.75rem', letterSpacing:'3px', fontWeight:700, marginBottom:10 }}>SELECCIÓN ESPECIAL</p>
          <h2 style={{ fontSize:'2rem', fontWeight:900, color:'#111' }}>Esenciales de Temporada</h2>
          <div style={{ width:50, height:3, background:'#B8860B', margin:'16px auto 0' }}/>
        </div>

        {loading
          ? <div className="loading-page"><div className="spinner"/><p>Cargando productos...</p></div>
          : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))', gap:24, maxWidth:1200, margin:'0 auto' }}>
            {productos.slice(0,8).map(p => (
              <article key={p.id_producto} style={h.card}
                onMouseEnter={e => e.currentTarget.style.transform='translateY(-6px)'}
                onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
              >
                <div style={h.imgBox}>
                  <img src={`http://localhost:5000${p.imagen_url}`} alt={p.nombre_producto}
                    style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.4s' }}
                    onError={e => { e.target.style.display='none'; }}
                  />
                  {p.stock <= 0 && <span style={h.badgeOut}>AGOTADO</span>}
                  {p.stock > 0 && p.stock <= 5 && <span style={h.badgeLow}>ÚLTIMAS UNIDADES</span>}
                </div>
                <div style={{ padding:'16px' }}>
                  <Link to={`/producto/${p.id_producto}`}>
                    <h4 style={{ fontSize:'0.9rem', fontWeight:700, color:'#111', marginBottom:4, lineHeight:1.4 }}>
                      {p.nombre_producto}
                    </h4>
                  </Link>
                  {p.nombre_categoria && (
                    <span style={{ fontSize:'0.7rem', color:'#999', letterSpacing:'0.5px' }}>{p.nombre_categoria}</span>
                  )}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:14 }}>
                    <span style={{ color:'#B8860B', fontWeight:900, fontSize:'1.15rem' }}>
                      S/ {parseFloat(p.precio).toFixed(2)}
                    </span>
                    <button
                      onClick={() => addToCart(p)}
                      disabled={p.stock <= 0}
                      style={{
                        background: p.stock > 0 ? '#111' : '#ddd',
                        color: p.stock > 0 ? '#B8860B' : '#999',
                        border:'none', borderRadius:6, padding:'8px 16px',
                        fontSize:'0.75rem', fontWeight:700, cursor: p.stock > 0 ? 'pointer' : 'not-allowed',
                        letterSpacing:'0.5px', transition:'background 0.2s',
                      }}
                    >
                      {p.stock > 0 ? '+ AÑADIR' : 'AGOTADO'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div style={{ textAlign:'center', marginTop:48 }}>
          <Link to="/catalogo" style={h.viewAll}>VER TODO EL CATÁLOGO →</Link>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background:'#111', padding:'80px 20px', textAlign:'center' }}>
        <p style={{ color:'#B8860B', fontSize:'0.75rem', letterSpacing:'3px', fontWeight:700, marginBottom:16 }}>ÚNETE A NOSOTROS</p>
        <h2 style={{ color:'#fff', fontSize:'2.2rem', fontWeight:900, marginBottom:16 }}>¿Listo para cocinar como un pro?</h2>
        <p style={{ color:'#555', marginBottom:36, maxWidth:480, margin:'0 auto 36px' }}>
          Crea tu cuenta y accede a todos nuestros productos con el mejor precio y envío seguro.
        </p>
        {!user
          ? <Link to="/register" style={h.btnGold}>CREAR CUENTA GRATIS</Link>
          : <Link to="/catalogo" style={h.btnGold}>EXPLORAR CATÁLOGO</Link>
        }
      </section>

      {/* TOAST */}
      {toast && (
        <div style={{
          position:'fixed', bottom:30, left:'50%', transform:'translateX(-50%)',
          background:'#1a1a1a', border:'1px solid #B8860B', color:'#fff',
          padding:'14px 28px', borderRadius:10, zIndex:999,
          boxShadow:'0 8px 30px rgba(0,0,0,0.4)', fontSize:'0.88rem', whiteSpace:'nowrap',
        }}>
          ✅ {toast}
        </div>
      )}
    </div>
  );
}

const h = {
  tag:      { color:'#B8860B', fontSize:'0.72rem', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', display:'block', marginBottom:14 },
  title:    { color:'#fff', fontSize:'3.4rem', fontWeight:900, lineHeight:1.1, margin:'0 0 20px' },
  desc:     { color:'#aaa', fontSize:'1rem', lineHeight:1.75, margin:'0 0 34px', maxWidth:440 },
  btnGold:  { display:'inline-block', background:'#B8860B', color:'#111', padding:'13px 32px', fontWeight:800, fontSize:'0.82rem', letterSpacing:'1px', borderRadius:6, textDecoration:'none' },
  btnOutline:{ display:'inline-block', border:'2px solid #B8860B', color:'#B8860B', padding:'11px 28px', fontWeight:800, fontSize:'0.82rem', letterSpacing:'1px', borderRadius:6, textDecoration:'none' },
  card:     { background:'#fff', borderRadius:12, overflow:'hidden', boxShadow:'0 4px 18px rgba(0,0,0,0.07)', transition:'transform 0.25s, box-shadow 0.25s', cursor:'pointer' },
  imgBox:   { height:210, overflow:'hidden', position:'relative', background:'#f0f0f0' },
  badgeOut: { position:'absolute', top:10, left:10, background:'#222', color:'#fff', fontSize:'0.62rem', fontWeight:700, padding:'4px 10px', borderRadius:4, letterSpacing:'0.5px' },
  badgeLow: { position:'absolute', top:10, left:10, background:'#B8860B', color:'#111', fontSize:'0.62rem', fontWeight:700, padding:'4px 10px', borderRadius:4, letterSpacing:'0.5px' },
  viewAll:  { display:'inline-block', border:'2px solid #333', color:'#ccc', padding:'13px 36px', fontWeight:700, fontSize:'0.82rem', letterSpacing:'1px', borderRadius:6, textDecoration:'none' },
};
