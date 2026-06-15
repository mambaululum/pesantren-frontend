import { useState, useEffect } from "react";
import axios from "axios";
import Admin from "./Admin";
// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered'))
      .catch(err => console.log('SW error:', err));
  });
}
const API = "https://pesantren-backend.vercel.app/api";
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
});
const formatRupiah = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n || 0);

const formatTanggal = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  const bulan = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  return `${dt.getDate()} ${bulan[dt.getMonth()]} ${dt.getFullYear()}`;
};
function InstallButton() {
  const [bisa, setBisa] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      setBisa(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    if (deferredPrompt) setBisa(true);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (installed) return (
    <div style={{ textAlign: "center", fontSize: 13, color: "#059669", marginTop: 10 }}>
      ✅ Aplikasi berhasil diinstall!
    </div>
  );

  // Selalu tampil — panduan manual jika tidak support
  return (
    <div style={{ marginTop: 10 }}>
      {bisa ? (
        <button onClick={() => deferredPrompt?.prompt()} style={{
          width: "100%",
          background: "linear-gradient(135deg, #059669, #047857)",
          color: "white", border: "none", borderRadius: 10, padding: 12,
          fontSize: 14, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8
        }}>
          📲 Klik Install Aplikasi
        </button>
      ) : (
        <div style={{
          background: "#f0fdf4", border: "1px solid #bbf7d0",
          borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#166534"
        }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>klik install aplikasi</div>
          <div>Buka di <b>Chrome Android</b>, lalu ketuk menu <b>⋮</b> → <b>"Tambahkan ke layar utama"</b></div>
        </div>
      )}
    </div>
  );
}
// ============================================================
// LOGIN PAGE
// ============================================================
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
    window.addEventListener("appinstalled", () => setInstalled(true));
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setInstallPrompt(null);
  };

  const handleLogin = async () => {
    if (!username || !password) { setError("Username dan password wajib diisi."); return; }
    setLoading(true); setError("");
    try {
      const res = await axios.post(`${API}/auth/login`, { username, password });
      localStorage.setItem("token", res.data.token);
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal");
    }
    setLoading(false);
  };

  return (
    <div style={styles.loginBg}>
      <div style={styles.loginCard}>
        <div style={styles.loginLogo}>
          <img src="/Mu.png" style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover" }} alt="logo" />
          <div>
            <div style={styles.logoSchool}>PP. Muhammadiyah Mambaul Ulum</div>
            <div style={styles.logoSub}>Sistem Informasi Keuangan Santri</div>
          </div>
        </div>
        <div style={styles.loginTitle}>Ahlan Wa Sahlan</div>        <div style={styles.formGroup}>
          <label style={styles.label}>Username</label>
          <input style={styles.input} type="text" placeholder="Masukkan username"
            value={username} onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Password</label>
          <div style={{ position: "relative" }}>
            <input style={{ ...styles.input, paddingRight: 44 }}
              type={showPass ? "text" : "password"} placeholder="Masukkan password"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()} />
            <button onClick={() => setShowPass(!showPass)}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#64748b" }}>
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
        </div>
        {error && <div style={styles.errorBox}>{error}</div>}
        <button style={styles.loginBtn} onClick={handleLogin} disabled={loading}>
  {loading ? (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
      <div style={{
        width: 14, height: 14, borderRadius: "50%",
        border: "2px solid rgba(255,255,255,0.25)",
        borderTop: "2px solid white",
        animation: "spin 0.8s linear infinite"
      }} />
      Memuat...
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  ) : "Masuk"}
</button>
<InstallButton />

{/* Tombol Admin */}
{window.location.pathname !== "/admin" && (
<div style={{ marginTop: 14, borderTop: "1px solid #f1f5f9", paddingTop: 14 }}>
  <a href="/admin" style={{
    display: "block", width: "100%", textAlign: "center",
    background: "#f8fafc", border: "1.5px solid #e2e8f0",
    borderRadius: 10, padding: 12, fontSize: 14,
    fontWeight: 600, color: "#475569", textDecoration: "none",
    cursor: "pointer", boxSizing: "border-box"
  }}>
    🔐 Masuk sebagai Admin
  </a>
</div>
)}
      </div>
    </div>
  );
}

// ============================================================
// INFO PEMBAYARAN
// ============================================================
const REKENING = "6665010146415 33";
const REKENING_COPY = "666501014641533";
const NAMA_REKENING = "Alfian Aji Wibowo";
const BANK = "BRI";
const NO_HP = "081393695901";

function InfoPembayaran({ copied, setCopied }) {
  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(""), 2000);
    });
  };

  return (
    <div style={{
      background: "#fefce8",
      border: "1.5px solid #fde68a",
      borderRadius: 18,
      padding: "20px 20px 16px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
    }}>

      {/* === BARIS ATAS: icon + teks (persis seperti gambar) === */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        {/* Icon kartu — kotak kuning gelap */}
        <div style={{
          width: 44, height: 44, borderRadius: 10, flexShrink: 0,
          background: "linear-gradient(135deg, #ca8a04, #eab308)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 6px rgba(202,138,4,0.35)"
        }}>
          <span style={{ fontSize: 22 }}>💳</span>
        </div>

        {/* Teks */}
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#78350f", marginBottom: 6 }}>
            Ada Tagihan yang Belum Dibayar
          </div>
          <div style={{ fontSize: 13, color: "#92400e", lineHeight: 1.65 }}>
            Silakan lakukan pembayaran ke bagian administrasi sekolah atau melalui transfer bank.
            Hubungi kami di nomor{" "}
            <span style={{ fontWeight: 700, color: "#78350f" }}>{NO_HP}</span>
            {" "}untuk informasi lebih lanjut.
          </div>
        </div>
      </div>

      {/* === DIVIDER === */}
      <div style={{ borderTop: "1px dashed #fcd34d", margin: "16px 0" }} />

      {/* === REKENING === */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#a16207", marginBottom: 6, letterSpacing: 0.5 }}>
          🏦 TRANSFER KE REKENING
        </div>
        <div style={{
          background: "white", border: "1px solid #fde68a", borderRadius: 12,
          padding: "12px 14px", display: "flex", justifyContent: "space-between",
          alignItems: "center", gap: 10
        }}>
          <div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 3 }}>
              {BANK} · a.n <span style={{ fontWeight: 600, color: "#374151" }}>{NAMA_REKENING}</span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0f172a", letterSpacing: 1 }}>
              {REKENING}
            </div>
          </div>
          <button
            onClick={() => handleCopy(REKENING_COPY, "rek")}
            style={{
              background: copied === "rek" ? "#059669" : "#ca8a04",
              color: "white", border: "none", borderRadius: 8,
              padding: "9px 16px", fontSize: 13, fontWeight: 700,
              cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
              transition: "background 0.2s"
            }}
          >
            {copied === "rek" ? "✓ Tersalin!" : "📋 Salin No. Rek"}
          </button>
        </div>
      </div>

      {/* === NO HP / KONFIRMASI === */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#a16207", marginBottom: 6, letterSpacing: 0.5 }}>
          📱 KONFIRMASI PEMBAYARAN
        </div>
        <div style={{
          background: "white", border: "1px solid #fde68a", borderRadius: 12,
          padding: "12px 14px", display: "flex", justifyContent: "space-between",
          alignItems: "center", gap: 10
        }}>
          <div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 3 }}>WhatsApp / Telepon</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", letterSpacing: 0.5 }}>
              {NO_HP}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => handleCopy(NO_HP, "hp")}
              style={{
                background: copied === "hp" ? "#059669" : "#ca8a04",
                color: "white", border: "none", borderRadius: 8,
                padding: "9px 14px", fontSize: 13, fontWeight: 700,
                cursor: "pointer", whiteSpace: "nowrap", transition: "background 0.2s"
              }}
            >
              {copied === "hp" ? "✓ Tersalin!" : "📋 Salin"}
            </button>
            <a
              href={`https://wa.me/62${NO_HP.replace(/^0/, "")}?text=Assalamu'alaikum%2C%20saya%20ingin%20konfirmasi%20pembayaran%20tagihan%20santri.`}
              target="_blank" rel="noreferrer"
              style={{
                background: "#16a34a", color: "white", border: "none", borderRadius: 8,
                padding: "9px 14px", fontSize: 13, fontWeight: 700,
                cursor: "pointer", whiteSpace: "nowrap", textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: 4
              }}
            >
              💬 WA
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
function NotifikasiPanel({ token }) {
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const fetchNotifs = async () => {
    try {
      const res = await axios.get(`${API}/admin/notifikasi`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const baru = res.data;
      // Tampilkan push notification HP jika ada yang baru
      const idLama = new Set(notifs.map(n => n.id));
      baru.filter(n => !n.sudah_dibaca && !idLama.has(n.id)).forEach(n => {
        if (Notification.permission === 'granted') {
          new Notification(n.judul, {
            body: n.pesan,
            icon: '/Mu.png',
            badge: '/Mu.png'
          });
        }
      });
      setNotifs(baru);
    } catch {}
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  const belumBaca = notifs.filter(n => !n.sudah_dibaca).length;

  const tandaiBaca = async (id) => {
    await axios.patch(`${API}/admin/notifikasi/${id}/baca`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, sudah_dibaca: true } : n));
  };
const handleKlikNotif = async (n) => {
    await tandaiBaca(n.id);
    setDetail(n); // buka modal detail
  };

  const bacaSemua = async () => {
    await axios.patch(`${API}/admin/notifikasi/baca-semua`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotifs(prev => prev.map(n => ({ ...n, sudah_dibaca: true })));
  };

  const warnaBadge = { tagihan: '#dc2626', bayar: '#059669', koreksi: '#d97706', info: '#1e40af' };

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{
        background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8,
        padding: '6px 10px', cursor: 'pointer', position: 'relative', color: 'white', fontSize: 18
      }}>
        🔔
        {belumBaca > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: '#ef4444', color: 'white',
            borderRadius: 999, fontSize: 10, fontWeight: 700,
            padding: '1px 5px', minWidth: 16, textAlign: 'center'
          }}>{belumBaca}</span>
        )}
      </button>
 {detail && (
        <div onClick={() => setDetail(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: 16, padding: 24,
            width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{detail.judul}</div>
              <button onClick={() => setDetail(null)} style={{
                background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8'
              }}>✕</button>
            </div>

            {/* Pesan */}
            <div style={{
              background: '#f8fafc', borderRadius: 10, padding: '12px 14px',
              fontSize: 13, color: '#475569', lineHeight: 1.6, marginBottom: 16
            }}>
              {detail.pesan}
            </div>

            {/* Detail dari data_json */}
            {detail.data_json && (
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: '#94a3b8', marginBottom: 10, letterSpacing: 0.5 }}>
                  RINCIAN
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

                  {detail.data_json.jenis && (
                    <Row label="Jenis" value={detail.data_json.jenis} />
                  )}
                  {detail.data_json.jumlah && (
                    <Row label="Total Tagihan" value={`Rp ${Number(detail.data_json.jumlah).toLocaleString('id-ID')}`} />
                  )}
                  {detail.data_json.jumlah_bayar && (
                    <Row label="Dibayar" value={`Rp ${Number(detail.data_json.jumlah_bayar).toLocaleString('id-ID')}`} color="#059669" />
                  )}
                  {detail.data_json.sisa > 0 && (
                    <Row label="Sisa" value={`Rp ${Number(detail.data_json.sisa).toLocaleString('id-ID')}`} color="#dc2626" />
                  )}
                  {detail.data_json.sisa === 0 && detail.data_json.jumlah_bayar && (
                    <Row label="Status" value="✅ Lunas" color="#059669" />
                  )}
                  {detail.data_json.tanggal_bayar && (
                    <Row label="Tanggal" value={formatTanggal(detail.data_json.tanggal_bayar)} />
                  )}

                  {/* Khusus bulk: tampilkan list lunas */}
                  {detail.data_json.lunasList && detail.data_json.lunasList.map((t, i) => (
                    <Row key={i} label={t.jenis} value={`Rp ${Number(t.dibayar).toLocaleString('id-ID')} ✅ (Total: Rp ${Number(t.jumlah).toLocaleString('id-ID')})`} color="#059669" />
                  ))}
                  {detail.data_json.cicilanItem && (
                    <Row
                      label={`${detail.data_json.cicilanItem.jenis} (cicilan)`}
                      value={`Dibayar Rp ${Number(detail.data_json.cicilanItem.dibayar).toLocaleString('id-ID')} — Sisa Rp ${Number(detail.data_json.cicilanItem.sisa).toLocaleString('id-ID')} (Total: Rp ${Number(detail.data_json.cicilanItem.jumlah).toLocaleString('id-ID')})`}
                      color="#d97706"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Waktu */}
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 16, textAlign: 'right' }}>
              {new Date(detail.created_at).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      )}

      {open && (
       <div style={{
        position: 'fixed', top: 64, right: 8, left: 8,
        background: 'white', borderRadius: 14, boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
        zIndex: 999, overflow: 'hidden', maxHeight: '80vh', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>🔔 Notifikasi</div>
            {belumBaca > 0 && (
              <button onClick={bacaSemua} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, color: '#1e40af', fontWeight: 600
              }}>Tandai semua dibaca</button>
            )}
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifs.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                Belum ada notifikasi
              </div>
           ) : notifs.map(n => (
  <div key={n.id} onClick={() => handleKlikNotif(n)} style={{
                padding: '12px 16px', borderBottom: '1px solid #f8fafc',
                background: n.sudah_dibaca ? 'white' : '#eff6ff',
                cursor: 'pointer', transition: 'background 0.2s'
              }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0,
                    background: n.sudah_dibaca ? 'transparent' : (warnaBadge[n.jenis] || '#1e40af')
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 2 }}>{n.judul}</div>
                    <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>{n.pesan}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                      {new Date(n.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
function Row({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
      <span style={{ color: '#64748b' }}>{label}</span>
      <span style={{ fontWeight: 600, color: color || '#0f172a' }}>{value}</span>
    </div>
  );
}
// ============================================================
// DASHBOARD WALI SANTRI
// ============================================================
function Dashboard({ user, onLogout }) {
  const [tagihan, setTagihan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("semua");
  const [copied, setCopied] = useState("");

  // Gunakan useEffect dengan callback untuk fetch data saat mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get(`${API}/tagihan`, { headers: { Authorization: `Bearer ${token}` } })
    .then(res => { setTagihan(res.data); setLoading(false); })
    .catch(() => setLoading(false));
  }, []);

  // ── Kalkulasi ringkasan ──
  const totalTagihan = tagihan.reduce((a, b) => a + Number(b.jumlah || 0), 0);

  const sudahBayar = tagihan.reduce((a, b) => {
    if (b.status === "lunas") return a + Number(b.jumlah || 0);
    return a + Number(b.sudah_dicicil || 0);
  }, 0);

  // Total cicilan dari tagihan yang BELUM lunas (bukan full bayar)
  const totalCicilan = tagihan
    .filter(t => t.status !== "lunas")
    .reduce((a, b) => a + Number(b.sudah_dicicil || 0), 0);

  const kekurangan = totalTagihan - sudahBayar;
  const persen = totalTagihan > 0 ? Math.round((sudahBayar / totalTagihan) * 100) : 0;

  const filtered = tagihan
    .filter(t => activeTab === "semua" ? true : t.status === activeTab)
    .slice()
    .sort((a, b) => {
      if (!a.tanggal_bayar && !b.tanggal_bayar) return 0;
      if (!a.tanggal_bayar) return -1;
      if (!b.tanggal_bayar) return 1;
      return new Date(a.tanggal_bayar) - new Date(b.tanggal_bayar);
    });

  const handleLogout = () => {
    if (!confirm("Yakin ingin keluar dari akun?")) return;
    localStorage.removeItem("token");
    onLogout();
  };

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      if (confirm("Yakin ingin keluar dari akun?")) {
        localStorage.removeItem("token");
        onLogout();
      } else {
        window.history.pushState(null, "", window.location.href);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div style={styles.dashBg}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/Mu.png" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} alt="logo" />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>PP. Muhammadiyah Mambaul Ulum</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>Sistem Informasi Keuangan Santri</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "white", fontSize: 13 }}>👤 {user.nama}</span>
          <NotifikasiPanel token={localStorage.getItem("token")} />
          <button style={styles.logoutBtn} onClick={handleLogout}>Keluar</button>
        </div>
      </header>

      <div style={styles.dashContent}>
        {/* KARTU SANTRI */}
        <div style={styles.studentCard}>
          <div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>Data Santri</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{user.nama_siswa}</div>
            <div style={{ fontSize: 13, color: "#64748b" }}>Kelas {user.kelas}</div>
          </div>
          <div style={styles.statusBadge(kekurangan <= 0)}>
            {kekurangan <= 0 ? "✓ Lunas" : "⚠ Ada Tunggakan"}
          </div>
        </div>

        {/* KARTU RINGKASAN — 4 kartu: Total Tagihan, Sudah Dibayar, Total Cicilan, Kekurangan */}
        <div style={styles.summaryGrid}>
          {[
            {
              label: "Total Tagihan",
              value: formatRupiah(totalTagihan),
              color: "#1e40af",
              bg: "#eff6ff",
              icon: "📋"
            },
            {
              label: "Sudah Dibayar",
              value: formatRupiah(sudahBayar),
              color: "#065f46",
              bg: "#ecfdf5",
              icon: "✅"
            },
            {
              label: "Total Cicilan",
              value: formatRupiah(totalCicilan),
              color: "#92400e",
              bg: "#fffbeb",
              icon: "🔄",
              sub: totalCicilan > 0 ? "Dari tagihan belum lunas" : "Belum ada cicilan"
            },
            {
              label: "Kekurangan",
              value: formatRupiah(kekurangan > 0 ? kekurangan : 0),
              color: kekurangan > 0 ? "#991b1b" : "#065f46",
              bg: kekurangan > 0 ? "#fef2f2" : "#ecfdf5",
              icon: kekurangan > 0 ? "⏳" : "🎉"
            },
          ].map((c, i) => (
            <div key={i} style={{ ...styles.summaryCard, background: c.bg }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{c.icon}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: c.color }}>{c.value}</div>
              {c.sub && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{c.sub}</div>}
            </div>
          ))}
        </div>

        {/* PROGRESS BAR */}
        <div style={styles.progressCard}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Progress Pembayaran</span>
            <span style={{ fontWeight: 800, color: "#1e40af" }}>{persen}%</span>
          </div>
          <div style={styles.progressTrack}>
            <div style={styles.progressFill(persen)} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "#94a3b8" }}>
            <span>Rp 0</span>
            <span>{formatRupiah(totalTagihan)}</span>
          </div>
        </div>

        {/* TABEL RIWAYAT TAGIHAN */}
        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>🧾 Riwayat Tagihan</div>
            <div style={{ display: "flex", gap: 6 }}>
              {["semua", "lunas", "belum"].map(t => (
                <button key={t} style={styles.tab(activeTab === t)} onClick={() => setActiveTab(t)}>
                  {t === "semua" ? "Semua" : t === "lunas" ? "✓ Lunas" : "⏳ Belum"}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 30, textAlign: "center", color: "#94a3b8" }}>Memuat data...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 30, textAlign: "center", color: "#94a3b8" }}>Tidak ada data tagihan.</div>
          ) : (
            filtered.map(item => {
              const sudahCicil = Number(item.sudah_dicicil || 0);
              const jumlah = Number(item.jumlah || 0);
              const sisa = jumlah - sudahCicil;
              const adaCicilan = item.status !== "lunas" && sudahCicil > 0;
              const persenCicil = jumlah > 0 ? Math.min(100, Math.round((sudahCicil / jumlah) * 100)) : 0;

              return (
                <div key={item.id} style={{
                  padding: "14px 20px",
                  borderBottom: "1px solid #f1f5f9",
                  background: item.status === "lunas" ? "white" : adaCicilan ? "#fffbeb" : "#fffbeb0a",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    {/* KIRI: info tagihan */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{item.jenis}</div>

                      {/* Status label */}
                      <div style={{ fontSize: 12, marginTop: 3, color: "#94a3b8" }}>
                        {item.status === "lunas"
                          ? `✅ Lunas · ${formatTanggal(item.tanggal_bayar)}`
                          : adaCicilan
                            ? `🔄 Sedang dicicil · sisa ${formatRupiah(sisa)}`
                            : "⏳ Belum dibayar"}
                      </div>

                      {/* Progress cicilan */}
                      {adaCicilan && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ height: 6, width: "min(200px, 100%)", background: "#e5e7eb", borderRadius: 999 }}>
                            <div style={{
                              height: "100%",
                              width: `${persenCicil}%`,
                              background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
                              borderRadius: 999,
                              transition: "width 0.4s"
                            }} />
                          </div>
                          <div style={{ fontSize: 11, color: "#92400e", marginTop: 4 }}>
                            Cicilan: <b>{formatRupiah(sudahCicil)}</b> dari {formatRupiah(jumlah)} ({persenCicil}%)
                          </div>
                        </div>
                      )}
                    </div>

                    {/* KANAN: jumlah & sisa */}
                    <div style={{ textAlign: "right", marginLeft: 12, flexShrink: 0 }}>
                      <div style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: item.status === "lunas" ? "#059669" : adaCicilan ? "#d97706" : "#dc2626"
                      }}>
                        {formatRupiah(jumlah)}
                      </div>
                      {adaCicilan && (
                        <div style={{ fontSize: 11, color: "#dc2626", fontWeight: 600, marginTop: 2 }}>
                          Sisa: {formatRupiah(sisa)}
                        </div>
                      )}
                      {item.semester && (
                        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{item.semester}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* FOOTER TABEL */}
          <div style={{ padding: "14px 20px", borderTop: "2px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafafa" }}>
            <span style={{ fontSize: 13, color: "#6b7280" }}>{filtered.length} tagihan</span>
            <div style={{ fontWeight: 700, fontSize: 14, color: kekurangan > 0 ? "#dc2626" : "#059669" }}>
              {kekurangan > 0 ? `Kekurangan: ${formatRupiah(kekurangan)}` : "✓ Semua Lunas"}
            </div>
          </div>
        </div>

        {/* INFO CICILAN — hanya tampil kalau ada cicilan aktif */}
        {totalCicilan > 0 && (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 14, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>🔄</span>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#92400e" }}>Ringkasan Cicilan Aktif</div>
            </div>
            <div style={{ fontSize: 12, color: "#a16207", marginBottom: 12 }}>
              Tagihan di bawah ini sedang dalam proses cicilan dan belum lunas.
            </div>

            {tagihan.filter(t => t.status !== "lunas" && Number(t.sudah_dicicil || 0) > 0).map((t, idx, arr) => {
              const cicil = Number(t.sudah_dicicil || 0);
              const jumlah = Number(t.jumlah || 0);
              const sisa = jumlah - cicil;
              const pct = jumlah > 0 ? Math.min(100, Math.round((cicil / jumlah) * 100)) : 0;
              const isLast = idx === arr.length - 1;
              return (
                <div key={t.id} style={{
                  padding: "12px 0",
                  borderBottom: isLast ? "none" : "1px dashed #fcd34d"
                }}>
                  {/* Nama tagihan + semester */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#78350f" }}>{t.jenis}</div>
                      {t.semester && (
                        <div style={{ fontSize: 11, color: "#a16207", marginTop: 1 }}>📅 {t.semester}</div>
                      )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>Total tagihan</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{formatRupiah(jumlah)}</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: 7, background: "#fef3c7", borderRadius: 999, overflow: "hidden", marginBottom: 6 }}>
                    <div style={{
                      height: "100%", width: `${pct}%`,
                      background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
                      borderRadius: 999
                    }} />
                  </div>

                  {/* Keterangan cicilan */}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: "#059669", fontWeight: 600 }}>
                      ✅ Sudah dicicil: {formatRupiah(cicil)} <span style={{ color: "#a16207", fontWeight: 400 }}>({pct}%)</span>
                    </span>
                    <span style={{ color: "#dc2626", fontWeight: 600 }}>
                      Sisa: {formatRupiah(sisa)}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Total */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              paddingTop: 10, marginTop: 4,
              borderTop: "2px solid #fde68a"
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#92400e" }}>Total Sudah Dicicil</div>
                <div style={{ fontSize: 11, color: "#a16207" }}>dari semua tagihan yang sedang dicicil</div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#d97706" }}>{formatRupiah(totalCicilan)}</div>
            </div>
          </div>
        )}

        {/* INFO PEMBAYARAN — di bawah, hanya tampil kalau ada tunggakan */}
        {kekurangan > 0 && (
          <InfoPembayaran copied={copied} setCopied={setCopied} />
        )}
      </div>
    </div>
  );
}

// ============================================================
// ROOT
// ============================================================
export default function App() {
  const isAdmin = window.location.pathname === "/admin";
  const [appLoading, setAppLoading] = useState(true);
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      try { return JSON.parse(savedUser); }
      catch { return null; }
    }
    return null;
  });

  useEffect(() => {
    const link = document.querySelector('link[rel="manifest"]');
    if (link) link.href = isAdmin ? "/manifest-admin.json" : "/manifest.json";
    const theme = document.querySelector('meta[name="theme-color"]');
    if (theme) theme.setAttribute("content", isAdmin ? "#064e3b" : "#1e3a8a");
    setTimeout(() => setAppLoading(false), 4500);
  }, []);

  if (appLoading) return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #064e3b, #065f46, #047857)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "system-ui, sans-serif", gap: 20
    }}>
      <img src="/Mu.png" style={{ width: 56, height: 56, borderRadius: 12, objectFit: "cover" }} alt="logo" />
      <div style={{ color: "white", fontWeight: 700, fontSize: 18 }}>PP. Muhammadiyah Mambaul Ulum</div>
      <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: 600 }}>Andong - Boyolali</div>
      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Sistem Informasi Keuangan Santri</div>
      <div style={{
        width: 14, height: 14, borderRadius: "50%",
        border: "2px solid rgba(255,255,255,0.25)",
        borderTop: "2px solid white",
        animation: "spin 0.8s linear infinite"
      }} />
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );

  if (isAdmin) return <Admin />;

  const handleLogin = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return user
    ? <Dashboard user={user} onLogout={handleLogout} />
    : <LoginPage onLogin={handleLogin} />;
}
// ============================================================
// STYLES
// ============================================================
const styles = {
  loginBg: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #064e3b, #065f46, #047857)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "system-ui, sans-serif",
    padding: "0 16px",
    boxSizing: "border-box"
  },
  loginCard: {
    background: "white", borderRadius: 20, padding: 32,
    width: "90%", maxWidth: 360, boxShadow: "0 25px 50px rgba(0,0,0,0.3)"
  },
  loginLogo: {
    display: "flex", alignItems: "center", gap: 14,
    marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #f1f5f9"
  },
  logoSchool: { fontWeight: 800, fontSize: 14, color: "#1e293b" },
  logoSub: { fontSize: 12, color: "#64748b" },
  loginTitle: { fontSize: 22, fontWeight: 700, marginBottom: 20, color: "#0f172a" },
  formGroup: { marginBottom: 16 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 },
  input: {
    width: "100%", border: "2px solid #e5e7eb", borderRadius: 10,
    padding: "11px 14px", fontSize: 15, outline: "none", boxSizing: "border-box"
  },
  errorBox: {
    background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8,
    padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: 14
  },
  loginBtn: {
    width: "100%", background: "linear-gradient(135deg, #065f46, #047857)",
    color: "white", border: "none", borderRadius: 10, padding: 14,
    fontSize: 16, fontWeight: 600, cursor: "pointer", marginTop: 4
  },
  dashBg: { minHeight: "100vh", background: "#f1f5f9", fontFamily: "system-ui, sans-serif" },
  header: {
    background: "linear-gradient(135deg, #1e3a8a, #1e40af)",
    padding: "0 24px", height: 60,
    display: "flex", alignItems: "center", justifyContent: "space-between"
  },
  logoutBtn: {
    background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8,
    padding: "6px 14px", color: "white", cursor: "pointer", fontSize: 13
  },
  dashContent: {
    maxWidth: 800, margin: "0 auto", padding: "20px 16px",
    display: "flex", flexDirection: "column", gap: 14
  },
  studentCard: {
    background: "white", borderRadius: 14, padding: 20,
    display: "flex", justifyContent: "space-between", alignItems: "center",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
  },
  statusBadge: (ok) => ({
    padding: "6px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600,
    background: ok ? "#ecfdf5" : "#fef2f2", color: ok ? "#065f46" : "#991b1b"
  }),
  // 4 kolom di desktop, 2 kolom di mobile via inline
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 },
  summaryCard: {
    background: "white", borderRadius: 14, padding: "14px 16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
  },
  progressCard: {
    background: "white", borderRadius: 14, padding: 20,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
  },
  progressTrack: { height: 10, background: "#e5e7eb", borderRadius: 999, overflow: "hidden" },
  progressFill: (pct) => ({
    height: "100%", width: `${pct}%`,
    background: "linear-gradient(90deg, #1e40af, #3b82f6)",
    borderRadius: 999, transition: "width 0.5s ease"
  }),
  tableCard: {
    background: "white", borderRadius: 14, overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
  },
  tableHeader: {
    padding: "16px 20px", borderBottom: "1px solid #f1f5f9",
    display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8
  },
  tab: (active) => ({
    padding: "5px 12px", borderRadius: 999, border: "none", cursor: "pointer",
    fontSize: 12, fontWeight: 600,
    background: active ? "#1e40af" : "#f1f5f9",
    color: active ? "white" : "#64748b"
  }),
};
