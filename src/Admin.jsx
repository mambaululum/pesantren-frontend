import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

const API = "https://pesantren-backend.vercel.app/api/admin";
const formatRupiah = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n || 0);
const toBase64 = (url) => new Promise((resolve) => {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext("2d").drawImage(img, 0, 0);
    resolve(canvas.toDataURL("image/png"));
  };
  img.onerror = () => resolve(null);
  img.src = url + "?t=" + Date.now();
});
// ============================================================
// LOGIN ADMIN
// ============================================================
function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) { setError("Lengkapi username dan password"); return; }
    setLoading(true); setError("");
    try {
      const res = await axios.post(`${API}/login`, { username, password });
      localStorage.setItem("adminToken", res.data.token);
      onLogin(res.data.admin);
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #064e3b, #065f46)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif", padding: "16px" }}>
      <div style={{ background: "white", borderRadius: 20, padding: "32px 24px", width: "100%", maxWidth: 400, boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #f1f5f9" }}>
          <img src="/Mu.png" style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover" }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#1e293b" }}>PP. MUHAMMADIYAH MAMBAUL ULUM</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Dashboard Admin Keuangan</div>
          </div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Login Admin</div>
        <div style={{ marginBottom: 16 }}>
          <label style={lStyle}>Username</label>
          <input style={{ ...iStyle, fontSize: 16 }} type="text" placeholder="Username admin" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={lStyle}>Password</label>
          <div style={{ position: "relative" }}>
            <input style={{ ...iStyle, paddingRight: 44 }} type={showPass ? "text" : "password"} placeholder="Password admin" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
            <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#64748b" }}>
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
        </div>
        {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: 14 }}>{error}</div>}
        <button style={{ width: "100%", background: "linear-gradient(135deg, #065f46, #059669)", color: "white", border: "none", borderRadius: 10, padding: 14, fontSize: 16, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={handleLogin} disabled={loading}>
          {loading ? <><Spinner />Memuat...</> : "Masuk sebagai Admin"}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD ADMIN
// ============================================================
function AdminDashboard({ admin, onLogout }) {
  const [menu, setMenu] = useState("rekap");
  const menuRef = useRef(null);
  const touchStartX = useRef(null);
  const allMenuKeys = ["rekap","santri","tagihan","cicilan","bayar_umum","tambah_santri","semester","pengingat","riwayat_bayar","riwayat_notif","pengumuman"];

  const handleTouchStart = (e) => {
  touchStartX.current = e.touches[0].clientX;
  touchStartX.startY = e.touches[0].clientY;
};
const handleTouchEnd = (e) => {
  if (touchStartX.current === null) return;
  const diffX = touchStartX.current - e.changedTouches[0].clientX;
  const diffY = touchStartX.startY - e.changedTouches[0].clientY;
  // Abaikan kalau gerakan vertikal lebih besar dari horizontal
  if (Math.abs(diffY) > Math.abs(diffX) * 0.5) return;
  // Minimal swipe 120px — lebih besar agar tidak mudah terpicu
  if (Math.abs(diffX) < 120) return;
  const idx = allMenuKeys.indexOf(menu);
  if (diffX > 0 && idx < allMenuKeys.length - 1) setMenu(allMenuKeys[idx + 1]);
  else if (diffX < 0 && idx > 0) setMenu(allMenuKeys[idx - 1]);
  touchStartX.current = null;
};
  const [santri, setSantri] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}` };

  const loadSantri = async (force = false) => {
    if (AdminDashboard._cache && !force) {
      setSantri(AdminDashboard._cache);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${API}/santri`, { headers });
      AdminDashboard._cache = res.data;
      setSantri(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadSantri(); }, []);

  const handleLogout = () => {
    if (!confirm("Yakin ingin keluar dari akun admin?")) return;
    localStorage.removeItem("adminToken");
    onLogout();
  };

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      if (confirm("Yakin ingin keluar dari akun admin?")) {
        localStorage.removeItem("adminToken");
        onLogout();
      } else {
        window.history.pushState(null, "", window.location.href);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const totalTagihan = santri.reduce((a, b) => a + Number(b.total_tagihan || 0), 0);
  const totalTerbayar = santri.reduce((a, b) => a + Number(b.sudah_bayar || 0), 0);
  const totalTunggakan = totalTagihan - totalTerbayar;
  const santriLunas = santri.filter(s => {
    const tagihan = Number(s.total_tagihan || 0);
    const bayar = Number(s.sudah_bayar || 0);
    return tagihan > 0 && Math.round(bayar) >= Math.round(tagihan);
  }).length;

  const menus = [
    { key: "rekap", label: "📊 Rekap" },
    { key: "santri", label: "👥 Data Santri" },
    { key: "tagihan", label: "💰 Tagihan" },
    { key: "cicilan", label: "🧾 Input Bayar" },
    { key: "tambah_santri", label: "➕ Tambah Santri" },
    { key: "semester", label: "📅 Semester" },
    { key: "pengingat", label: "🔔 Pengingat" },
    { key: "bayar_umum", label: "💳 Bayar Umum" },
    { key: "riwayat_bayar", label: "📜 Riwayat Bayar" },
    { key: "riwayat_notif", label: "📨 Riwayat Notif WA" },
    { key: "pengumuman", label: "📣 Pengumuman" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "system-ui,sans-serif" }}>
      <LoadingBar loading={loading} />
      <header style={{ background: "linear-gradient(135deg, #064e3b, #065f46)", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/Mu.png" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "white", lineHeight: 1.3 }}>Dashboard Admin</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>PP. Muhammadiyah Mambaul Ulum</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "white", fontSize: 12 }}>👤 {admin.nama}</span>
          <button style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: "8px 14px", color: "white", cursor: "pointer", fontSize: 13, minHeight: 40 }} onClick={handleLogout}>Keluar</button>
        </div>
      </header>

     <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "0 8px", display: "flex", gap: 0, overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }} ref={menuRef}
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
>
        {menus.map(m => (
          <button key={m.key} onClick={() => setMenu(m.key)} style={{ padding: "14px 12px", border: "none", background: "none", borderBottom: menu === m.key ? "3px solid #059669" : "3px solid transparent", color: menu === m.key ? "#059669" : "#64748b", fontWeight: menu === m.key ? 700 : 500, cursor: "pointer", fontSize: 12, whiteSpace: "nowrap", minHeight: 48, flexShrink: 0 }}>
            {m.label}
          </button>
        ))}
      </div>
      {/* Area swipe khusus */}
<div
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
  style={{ height: 6, background: "transparent" }}
/>
{/* Area swipe khusus */}
<div
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
  style={{ height: 6, background: "transparent" }}
/>
<div 
  style={{ maxWidth: 1000, margin: "0 auto", padding: "16px 12px" }}
>
        {menu === "rekap" && (
          <RekapKeuangan
            santri={santri}
            loading={loading}
            totalTagihan={totalTagihan}
            totalTerbayar={totalTerbayar}
            totalTunggakan={totalTunggakan}
            santriLunas={santriLunas}
            headers={headers}
            onRefresh={() => loadSantri(true)}
          />
        )}
        {menu === "santri" && <DataSantri santri={santri} headers={headers} onRefresh={() => loadSantri(true)} />}
        {menu === "tagihan" && <DataTagihan santri={santri} headers={headers} onRefreshSantri={loadSantri} />}
        {menu === "cicilan" && <InputCicilan santri={santri} headers={headers} />}
        {menu === "tambah_santri" && <TambahSantri headers={headers} onRefresh={() => { loadSantri(); setMenu("santri"); }} />}
        {menu === "pengingat" && <Pengingat santri={santri} headers={headers} />}
        {menu === "semester" && <ManajemenSemester santri={santri} headers={headers} onRefreshSantri={loadSantri} />}
        {menu === "bayar_umum" && <InputPembayaranUmum headers={headers} santri={santri} />}
{menu === "riwayat_bayar" && <RiwayatPembayaran headers={headers} />}
        {menu === "riwayat_notif" && <RiwayatNotif headers={headers} />}
        {menu === "pengumuman" && <Pengumuman santri={santri} headers={headers} />}
      </div>
    </div>
  );
}

// ============================================================
// REKAP KEUANGAN + EXPORT PDF / JPG (Keseluruhan & Per Santri)
// ============================================================

// Helper: load CDN script sekali saja
const loadScript = (src) => new Promise((resolve, reject) => {
  if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
  const s = document.createElement("script");
  s.src = src; s.onload = resolve; s.onerror = reject;
  document.head.appendChild(s);
});

// Helper: ambil canvas dari elemen DOM
const getCanvas = async (elId) => {
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
  const el = document.getElementById(elId);
  return window.html2canvas(el, { scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false });
};

// Helper: export canvas ke JPG download
const exportJPG = async (elId, filename) => {
  const canvas = await getCanvas(elId);
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/jpeg", 0.95);
  link.click();
};

// Helper: export canvas ke PDF download (multi-halaman otomatis)
const exportPDF = async (elId, filename) => {
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
  const canvas = await getCanvas(elId);
  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW = pageW - 20;
  const imgH = (canvas.height / canvas.width) * imgW;
  let y = 10;
  if (imgH <= pageH - 20) {
    pdf.addImage(imgData, "JPEG", 10, y, imgW, imgH);
  } else {
    let remainH = imgH; let srcY = 0;
    while (remainH > 0) {
      const sliceH = Math.min(remainH, pageH - 20);
      const sc = document.createElement("canvas");
      const ratio = canvas.width / imgW;
      sc.width = canvas.width; sc.height = sliceH * ratio;
      sc.getContext("2d").drawImage(canvas, 0, srcY * ratio, canvas.width, sliceH * ratio, 0, 0, sc.width, sc.height);
      pdf.addImage(sc.toDataURL("image/jpeg", 0.95), "JPEG", 10, y, imgW, sliceH);
      remainH -= sliceH; srcY += sliceH;
      if (remainH > 0) { pdf.addPage(); y = 10; }
    }
  }
  pdf.save(filename);
};

// Tombol export reusable
function TombolExport({ elId, filename, exporting, setExporting, disabled }) {
  const tgl = new Date().toLocaleDateString("id-ID").replace(/\//g, "-");
  const fnJPG = `${filename}-${tgl}.jpg`;
  const fnPDF = `${filename}-${tgl}.pdf`;

  const run = async (fn) => {
    setExporting(true);
    try { await fn(); } catch (e) { alert("Gagal export: " + e.message); }
    setExporting(false);
  };

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={() => run(() => exportJPG(elId, fnJPG))} disabled={exporting || disabled}
        style={{ background: "#7c3aed", color: "white", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: (exporting || disabled) ? 0.6 : 1 }}>
        {exporting ? "⏳..." : "🖼️ JPG"}
      </button>
      <button onClick={() => run(() => exportPDF(elId, fnPDF))} disabled={exporting || disabled}
        style={{ background: "#dc2626", color: "white", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: (exporting || disabled) ? 0.6 : 1 }}>
        {exporting ? "⏳..." : "📄 PDF"}
      </button>
    </div>
  );
}

// Header laporan standar untuk capture


function HeaderLaporan({ subtitle }) {
  return (
    <div style={{ background: "linear-gradient(135deg, #064e3b, #065f46)", borderRadius: 12, padding: "14px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", background: "rgba(255,255,255,0.15)", flexShrink: 0 }}>
 <img src="/Mu.png" style={{ width: 44, height: 44, objectFit: "cover", display: "block" }} />
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 15, color: "white" }}>PP. MUHAMMADIYAH MAMBAUL ULUM</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
          {subtitle} · {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>
    </div>
  );
}


function RekapKeuangan({ santri, loading, totalTagihan, totalTerbayar, totalTunggakan, santriLunas, headers, onRefresh }) {
  const [tab, setTab] = useState("semua"); // "semua" | "persantri"
  const [exporting, setExporting] = useState(false);
  const [logoBase64, setLogoBase64] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (onRefresh) await onRefresh();
    setRefreshing(false);
  };

  useEffect(() => {
    toBase64("/Mu.png").then(b64 => { if (b64) setLogoBase64(b64); });
  }, []);


  // --- State untuk rekap per santri ---
  const [selectedSantri, setSelectedSantri] = useState(null);
  const [searchSantri, setSearchSantri] = useState("");
  const [tagihanDetail, setTagihanDetail] = useState([]);  // semua tagihan + riwayat cicilan
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [exportingDetail, setExportingDetail] = useState(false);

  const santriSorted = [...santri].sort((a, b) => {
    const numA = parseInt(a.kelas) || 99;
    const numB = parseInt(b.kelas) || 99;
    if (numA !== numB) return numA - numB;
    return a.nama_siswa.localeCompare(b.nama_siswa, "id");
  });

  const loadDetailSantri = async (s) => {
    setSelectedSantri(s);
    setTagihanDetail([]);
    setLoadingDetail(true);
    try {
      // Ambil semua tagihan santri (belum + lunas)
      const resTg = await axios.get(`${API}/tagihan/${s.id}`, { headers });
      const allTagihan = resTg.data;
      // Untuk setiap tagihan, ambil riwayat cicilan
      const withRiwayat = await Promise.all(allTagihan.map(async (t) => {
        try {
          const resPb = await axios.get(`${API}/pembayaran/${t.id}`, { headers });
          return { ...t, riwayat: resPb.data };
        } catch { return { ...t, riwayat: [] }; }
      }));
      setTagihanDetail(withRiwayat);
    } catch (e) { alert("Gagal memuat detail: " + e.message); }
    setLoadingDetail(false);
  };

  const tabStyle = (active) => ({
    padding: "10px 18px", border: "none", background: "none",
    borderBottom: active ? "3px solid #059669" : "3px solid transparent",
    color: active ? "#059669" : "#64748b", fontWeight: active ? 700 : 500,
    cursor: "pointer", fontSize: 13, whiteSpace: "nowrap",
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>📊 Rekap Keuangan</div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "#ecfdf5", border: "1.5px solid #a7f3d0",
            borderRadius: 10, padding: "8px 14px",
            fontSize: 13, fontWeight: 600, color: "#065f46",
            cursor: (refreshing || loading) ? "not-allowed" : "pointer",
            opacity: (refreshing || loading) ? 0.6 : 1,
            transition: "opacity 0.2s"
          }}
        >
          <span style={{ display: "inline-block", animation: refreshing ? "spin 0.8s linear infinite" : "none" }}>🔄</span>
          {refreshing ? "Memuat..." : "Refresh"}
          <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }` }} />
        </button>
      </div>

      {/* Tab switch */}
      <div style={{ background: "white", borderRadius: 12, display: "flex", gap: 0, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <button style={tabStyle(tab === "semua")} onClick={() => setTab("semua")}>📋 Rekap Keseluruhan</button>
        <button style={tabStyle(tab === "persantri")} onClick={() => setTab("persantri")}>👤 Rekap Per Santri</button>
      </div>

      {/* ====== TAB REKAP KESELURUHAN ====== */}
      {tab === "semua" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <TombolExport elId="rekap-semua" filename="Rekap-Keuangan-Keseluruhan" exporting={exporting} setExporting={setExporting} disabled={loading} />
          </div>
          <div id="rekap-semua" style={{ background: "#f1f5f9", padding: 16, borderRadius: 14 }}>
            <HeaderLaporan subtitle="Laporan Keuangan Keseluruhan"  />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Total Tagihan Semua Santri", value: formatRupiah(totalTagihan), color: "#1e40af", bg: "#eff6ff", icon: "📋" },
                { label: "Total Terbayar", value: formatRupiah(totalTerbayar), color: "#065f46", bg: "#ecfdf5", icon: "✅" },
                { label: "Total Tunggakan", value: formatRupiah(totalTunggakan), color: "#991b1b", bg: "#fef2f2", icon: "⚠️" },
                { label: "Santri Lunas", value: `${santriLunas} dari ${santri.length} santri`, color: "#065f46", bg: "#ecfdf5", icon: "🎓" },
              ].map((c, i) => (
                <div key={i} style={{ background: c.bg, borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>{c.icon} {c.label}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: c.color }}>{c.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", fontWeight: 700, fontSize: 13, background: "#f8fafc" }}>👥 Daftar Semua Santri</div>
              {loading ? <div style={{ padding: 30, textAlign: "center", color: "#94a3b8" }}>Memuat data...</div> : (
                <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 520 }}>
                  <thead>
                    <tr style={{ background: "#f1f5f9" }}>
                      {["No", "Nama Santri", "Kelas", "Total Tagihan", "Sudah Bayar", "Tunggakan", "Status"].map((h, i) => (
                        <th key={i} style={{ padding: "8px 12px", textAlign: i >= 3 && i <= 5 ? "right" : i === 6 ? "center" : "left", fontWeight: 700, color: "#374151", fontSize: 11 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {santri.map((s, idx) => {
                      const tunggakan = Math.round(Number(s.total_tagihan || 0) - Number(s.sudah_bayar || 0));
                      const lunas = tunggakan <= 0 && Number(s.total_tagihan) > 0;
                      return (
                        <tr key={s.id} style={{ borderBottom: "1px solid #f8fafc", background: idx % 2 === 0 ? "white" : "#fafafa" }}>
                          <td style={{ padding: "8px 12px", color: "#94a3b8" }}>{idx + 1}</td>
                          <td style={{ padding: "8px 12px", fontWeight: 600 }}>{s.nama_siswa}</td>
                          <td style={{ padding: "8px 12px", color: "#64748b" }}>{s.kelas}</td>
                          <td style={{ padding: "8px 12px", textAlign: "right", color: "#1e40af" }}>{formatRupiah(s.total_tagihan)}</td>
                          <td style={{ padding: "8px 12px", textAlign: "right", color: "#059669" }}>{formatRupiah(s.sudah_bayar)}</td>
                          <td style={{ padding: "8px 12px", textAlign: "right", color: tunggakan > 0 ? "#dc2626" : "#059669", fontWeight: 600 }}>
                            {tunggakan > 0 ? formatRupiah(tunggakan) : "-"}
                          </td>
                          <td style={{ padding: "8px 12px", textAlign: "center" }}>
                            <span style={{ background: lunas ? "#ecfdf5" : "#fef2f2", color: lunas ? "#065f46" : "#dc2626", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>
                              {lunas ? "✓ Lunas" : "Belum Lunas"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>
              )}
            </div>
            <div style={{ marginTop: 10, fontSize: 10, color: "#94a3b8", textAlign: "center" }}>
              Dicetak otomatis dari Sistem Keuangan PP. Muhammadiyah Mambaul Ulum
            </div>
          </div>
        </div>
      )}

      {/* ====== TAB REKAP PER SANTRI ====== */}
      {tab === "persantri" && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 16 }}>
          {/* Panel pilih santri */}
          <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9", fontWeight: 700, fontSize: 13, background: "#f8fafc" }}>👤 Pilih Santri</div>
            <div style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9" }}>
              <input
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 7, padding: "7px 10px", fontSize: 12, outline: "none", boxSizing: "border-box" }}
                placeholder="🔍 Cari nama..."
                value={searchSantri}
                onChange={e => setSearchSantri(e.target.value)}
              />
            </div>
            <div style={{ maxHeight: 480, overflowY: "auto" }}>
              {santriSorted
                .filter(s => s.nama_siswa.toLowerCase().includes(searchSantri.toLowerCase()))
                .map(s => {
                  const tunggakan = Math.round(Number(s.total_tagihan || 0) - Number(s.sudah_bayar || 0));
                  const isSelected = selectedSantri?.id === s.id;
                  return (
                    <div key={s.id} onClick={() => loadDetailSantri(s)}
                      style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #f8fafc", background: isSelected ? "#ecfdf5" : "white", borderLeft: isSelected ? "3px solid #059669" : "3px solid transparent" }}>
                      <div style={{ fontWeight: isSelected ? 700 : 500, fontSize: 13, color: isSelected ? "#065f46" : "#1e293b" }}>{s.nama_siswa}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{s.kelas}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: tunggakan > 0 ? "#dc2626" : "#059669", marginTop: 2 }}>
                        {tunggakan > 0 ? `⚠ Kurang ${formatRupiah(tunggakan)}` : "✓ Lunas"}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Panel kanan: detail + export */}
          <div>
            {!selectedSantri ? (
              <div style={{ background: "white", borderRadius: 12, padding: 40, textAlign: "center", color: "#94a3b8", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>👈</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Pilih santri di sebelah kiri</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>untuk melihat & mencetak rekap rinciannya</div>
              </div>
            ) : (
              <div>
                {/* Tombol export per santri */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                  <TombolExport
                    elId="rekap-persantri"
                    filename={`Rekap-${selectedSantri.nama_siswa.replace(/\s+/g, "-")}`}
                    exporting={exportingDetail}
                    setExporting={setExportingDetail}
                    disabled={loadingDetail}
                  />
                </div>

                {/* Area capture */}
                <div id="rekap-persantri" style={{ background: "#f1f5f9", padding: 16, borderRadius: 14 }}>
                  <HeaderLaporan subtitle={`Rekap Keuangan Santri`}  />

                  {/* Identitas santri */}
                  <div style={{ background: "white", borderRadius: 12, padding: 16, marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                      {[
                        { label: "Nama Santri", value: selectedSantri.nama_siswa },
                        { label: "Kelas", value: selectedSantri.kelas },
                        { label: "Nama Wali", value: selectedSantri.nama || "-" },
                        { label: "Username", value: `@${selectedSantri.username}` },
                      ].map((f, i) => (
                        <div key={i}>
                          <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2 }}>{f.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{f.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ringkasan keuangan santri */}
                  {(() => {
                    const totalTg = tagihanDetail.reduce((a, t) => a + Number(t.jumlah || 0), 0);
                    const totalByr = tagihanDetail.reduce((a, t) => {
                      if (t.status === "lunas") return a + Number(t.jumlah || 0);
                      return a + Number(t.sudah_dicicil || 0);
                    }, 0);
                    const totalSisa = totalTg - totalByr;
                    return (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 14 }}>
                        {[
                          { label: "Total Tagihan", value: formatRupiah(totalTg), color: "#1e40af", bg: "#eff6ff" },
                          { label: "Total Terbayar", value: formatRupiah(totalByr), color: "#065f46", bg: "#ecfdf5" },
                          { label: "Sisa Tunggakan", value: totalSisa > 0 ? formatRupiah(totalSisa) : "Lunas ✓", color: totalSisa > 0 ? "#991b1b" : "#065f46", bg: totalSisa > 0 ? "#fef2f2" : "#ecfdf5" },
                        ].map((c, i) => (
                          <div key={i} style={{ background: c.bg, borderRadius: 10, padding: "12px 14px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>{c.label}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: c.color }}>{c.value}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Daftar tagihan + riwayat cicilan */}
                  {loadingDetail ? (
                    <div style={{ background: "white", borderRadius: 12, padding: 30, textAlign: "center", color: "#94a3b8" }}>⏳ Memuat rincian...</div>
                  ) : tagihanDetail.length === 0 ? (
                    <div style={{ background: "white", borderRadius: 12, padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Belum ada tagihan</div>
                  ) : (
                    tagihanDetail.map((t, idx) => {
                      const sudahBayar = t.status === "lunas" ? Number(t.jumlah) : Number(t.sudah_dicicil || 0);
                      const sisa = Number(t.jumlah) - sudahBayar;
                      const lunas = t.status === "lunas" || sisa <= 0;
                      return (
                        <div key={t.id} style={{ background: "white", borderRadius: 12, marginBottom: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: lunas ? "1px solid #a7f3d0" : "1px solid #fecaca" }}>
                          {/* Header tagihan */}
                          <div style={{ padding: "11px 16px", background: lunas ? "#f0fdf4" : "#fef9f9", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9" }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13 }}>{idx + 1}. {t.jenis}</div>
                              <div style={{ fontSize: 11, color: "#64748b" }}>
                                {t.semester ? `Semester: ${t.semester}` : ""}{t.tanggal_bayar ? ` · Lunas: ${new Date(t.tanggal_bayar).toLocaleDateString("id-ID")}` : ""}
                              </div>
                            </div>
                            <span style={{ background: lunas ? "#059669" : "#f59e0b", color: "white", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                              {lunas ? "✓ Lunas" : "Belum Lunas"}
                            </span>
                          </div>
                          {/* Ringkasan per tagihan */}
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 0, borderBottom: t.riwayat?.length > 0 ? "1px solid #f1f5f9" : "none" }}>
                            {[
                              { label: "Jumlah Tagihan", value: formatRupiah(t.jumlah), color: "#1e40af" },
                              { label: "Sudah Dibayar", value: formatRupiah(sudahBayar), color: "#059669" },
                              { label: "Sisa", value: sisa > 0 ? formatRupiah(sisa) : "-", color: sisa > 0 ? "#dc2626" : "#059669" },
                            ].map((f, i) => (
                              <div key={i} style={{ padding: "10px 14px", borderRight: i < 2 ? "1px solid #f1f5f9" : "none" }}>
                                <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 3 }}>{f.label}</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: f.color }}>{f.value}</div>
                              </div>
                            ))}
                          </div>
                          {/* Riwayat cicilan */}
                          {t.riwayat?.length > 0 && (
                            <div style={{ padding: "10px 14px" }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>📋 Riwayat Pembayaran:</div>
                              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                                <thead>
                                  <tr style={{ background: "#f8fafc" }}>
                                    <th style={{ padding: "5px 8px", textAlign: "left", color: "#374151", fontWeight: 600 }}>No</th>
                                    <th style={{ padding: "5px 8px", textAlign: "left", color: "#374151", fontWeight: 600 }}>Tanggal</th>
                                    <th style={{ padding: "5px 8px", textAlign: "right", color: "#374151", fontWeight: 600 }}>Jumlah Bayar</th>
                                    <th style={{ padding: "5px 8px", textAlign: "left", color: "#374151", fontWeight: 600 }}>Keterangan</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {t.riwayat.map((r, ri) => (
                                    <tr key={r.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                                      <td style={{ padding: "5px 8px", color: "#94a3b8" }}>{ri + 1}</td>
                                      <td style={{ padding: "5px 8px" }}>{r.tanggal_bayar ? new Date(r.tanggal_bayar).toLocaleDateString("id-ID") : "-"}</td>
                                      <td style={{ padding: "5px 8px", textAlign: "right", fontWeight: 600, color: "#059669" }}>{formatRupiah(r.jumlah_bayar)}</td>
                                      <td style={{ padding: "5px 8px", color: "#64748b" }}>{r.keterangan || "-"}</td>
                                    </tr>
                                  ))}
                                  <tr style={{ background: "#f0fdf4", borderTop: "2px solid #a7f3d0" }}>
                                    <td colSpan={2} style={{ padding: "5px 8px", fontWeight: 700, fontSize: 11 }}>Total</td>
                                    <td style={{ padding: "5px 8px", textAlign: "right", fontWeight: 700, color: "#065f46" }}>
                                      {formatRupiah(t.riwayat.reduce((a, r) => a + Number(r.jumlah_bayar), 0))}
                                    </td>
                                    <td />
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}

                  <div style={{ marginTop: 10, fontSize: 10, color: "#94a3b8", textAlign: "center" }}>
                    Dicetak otomatis dari Sistem Keuangan PP. Muhammadiyah Mambaul Ulum
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// INPUT CICILAN / PEMBAYARAN SEBAGIAN
// ============================================================
function InputCicilan({ santri: santriRaw, headers }) {
  // Urutkan santri berdasarkan angka di depan kelas (1-6), lalu nama
  const santri = [...santriRaw].sort((a, b) => {
    const numA = parseInt(a.kelas) || 99;
    const numB = parseInt(b.kelas) || 99;
    if (numA !== numB) return numA - numB;
    return a.nama_siswa.localeCompare(b.nama_siswa, "id");
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [tagihan, setTagihan] = useState([]);
  const [selectedTagihan, setSelectedTagihan] = useState(null);
  const [riwayatBayar, setRiwayatBayar] = useState([]);
  const [form, setForm] = useState({ jumlah_bayar: "", tanggal_bayar: new Date().toISOString().split("T")[0], keterangan: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // State untuk edit cicilan
  const [editCicilan, setEditCicilan] = useState(null); // id cicilan yang sedang diedit
  const [editForm, setEditForm] = useState({ jumlah_bayar: "", tanggal_bayar: "", keterangan: "" });
  const [searchSantri, setSearchSantri] = useState("");

  // State konfirmasi kelebihan bayar
  const [showKonfirmasiLebih, setShowKonfirmasiLebih] = useState(false);
  const [keteranganLebih, setKeteranganLebih] = useState("");
  const [kirimWALebih, setKirimWALebih] = useState(true);
  const [pendingBayar, setPendingBayar] = useState(null);

  const loadTagihan = async (userId) => {
    const res = await axios.get(`${API}/tagihan/${userId}`, { headers });
    setTagihan(res.data.filter(t => t.status === "belum"));
  };

  const loadRiwayat = async (tagihanId) => {
    const res = await axios.get(`${API}/pembayaran/${tagihanId}`, { headers });
    setRiwayatBayar(res.data);
  };

  const [modeBulk, setModeBulk] = useState(false);
  const [selectedTagihanBulk, setSelectedTagihanBulk] = useState([]);
  const [formBulk, setFormBulk] = useState({ jumlah_total: "", tanggal_bayar: new Date().toISOString().split("T")[0], keterangan: "" });
  const [keteranganBulk, setKeteranganBulk] = useState("");
  const [showKonfirmasiBulk, setShowKonfirmasiBulk] = useState(false);
  const [resultBulk, setResultBulk] = useState(null);
  const [kirimWABulk, setKirimWABulk] = useState(true);
  const [metodeBayarBulk, setMetodeBayarBulk] = useState("tunai");

  const handleSelectTagihan = (t) => {
    console.log('selectedTagihan data:', JSON.stringify(t));
    setSelectedTagihan(t);
    setEditCicilan(null);
    loadRiwayat(t.id);
  };

  const totalSudahBayar = riwayatBayar.reduce((a, b) => a + Number(b.jumlah_bayar), 0);
  const sisaTagihan = selectedTagihan ? Number(selectedTagihan.jumlah) - totalSudahBayar : 0;

  // BULK: toggle centang tagihan
  const handleToggleBulk = (t) => {
    setSelectedTagihanBulk(prev =>
      prev.find(x => x.id === t.id) ? prev.filter(x => x.id !== t.id) : [...prev, t]
    );
  };

  // BULK: hitung total sisa tagihan yang dipilih
  const totalSisaBulk = selectedTagihanBulk.reduce((a, t) => a + Math.round(Number(t.jumlah) - (t.sudah_dicicil || 0)), 0);

  // BULK: simpan pembayaran
  const handleSimpanBulk = async () => {
    if (selectedTagihanBulk.length === 0) { setMsg("❌ Pilih minimal 1 tagihan!"); return; }
    if (!formBulk.jumlah_total) { setMsg("❌ Isi jumlah bayar!"); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/pembayaran-bulk`, {
        user_id: selectedUser.id,
        tagihan_ids: selectedTagihanBulk.map(t => t.id),
        jumlah_total: Number(formBulk.jumlah_total),
        tanggal_bayar: formBulk.tanggal_bayar,
        keterangan: keteranganBulk,
        metode_bayar: metodeBayarBulk,
        kirim_notif: kirimWABulk,
      }, { headers });
      setMsg(`✅ Pembayaran berhasil! ${res.data.lunas} tagihan lunas. 📲 Notifikasi WA terkirim.`);
      setSelectedTagihanBulk([]);
      setFormBulk({ jumlah_total: "", tanggal_bayar: new Date().toISOString().split("T")[0], keterangan: "" });
      setKeteranganBulk("");
      setShowKonfirmasiBulk(false);
      // Optimistic: hapus tagihan yang lunas dari state lokal
      const lunasIds = selectedTagihanBulk.map(t => t.id);
      setTagihan(prev => prev.filter(t => !lunasIds.includes(t.id)));
      setSelectedTagihan(null);
    } catch (e) { setMsg("❌ " + (e.response?.data?.message || "Gagal menyimpan")); }
    setLoading(false);
    setTimeout(() => setMsg(""), 5000);
  };

  // Langkah 1: klik Simpan → jika ada kelebihan, tampilkan form konfirmasi dulu
  const handleBayar = () => {
    if (!selectedTagihan || !form.jumlah_bayar) { setMsg("❌ Pilih tagihan dan isi jumlah bayar!"); return; }
    const jumlahInput = Number(form.jumlah_bayar);
    const uangJajan = Number(form.uang_jajan || 0);
    const kelebihan = jumlahInput - sisaTagihan + uangJajan;

    if (kelebihan > 0) {
      // Ada kelebihan → tampilkan panel konfirmasi untuk edit keterangan
      const defaultKet = `Bayar ${formatRupiah(jumlahInput)} | Tagihan lunas. Kelebihan ${formatRupiah(kelebihan)} untuk uang jajan${form.keterangan ? ` (${form.keterangan})` : ""}`;
      setPendingBayar({ jumlahInput: jumlahInput + uangJajan, jumlahBayar: sisaTagihan, kelebihan: kelebihan, uangJajan });
      setKeteranganLebih(defaultKet);
      setKirimWALebih(true);
      setShowKonfirmasiLebih(true);
    } else if (jumlahInput < sisaTagihan) {
      // Cicilan → tampilkan konfirmasi kirim WA
      setPendingBayar({ jumlahInput, jumlahBayar: jumlahInput, kelebihan: 0, isCicilan: true, uangJajan });
      setKeteranganLebih(form.keterangan || "");
      setKirimWALebih(true);
      setShowKonfirmasiLebih(true);
    } else {
      // Bayar pas lunas — tampilkan konfirmasi
      setPendingBayar({ jumlahInput, jumlahBayar: jumlahInput, kelebihan: 0, isCicilan: false, uangJajan: 0 });
      setKeteranganLebih(form.keterangan || "");
      setKirimWALebih(true);
      setShowKonfirmasiLebih(true);
    }
  };

  // Langkah 2: eksekusi simpan (dipanggil langsung atau dari konfirmasi)
  const handleSimpanBayar = async (jumlahInput, jumlahBayar, kelebihan, keterangan, kirimWA) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/pembayaran`, {
        tagihan_id: selectedTagihan.id,
        jumlah_bayar: jumlahBayar,
        tanggal_bayar: form.tanggal_bayar,
        keterangan: keterangan,
        kirim_notif: kirimWA,
      }, { headers });

      // Simpan data tagihan sebelum di-null
      const tagihanSnapshot = { ...selectedTagihan };
      console.log('tagihanSnapshot:', JSON.stringify(tagihanSnapshot));

      // Kirim WA jika ada kelebihan dan admin pilih kirim
      if (kelebihan > 0 && kirimWA && selectedUser?.no_hp) {
        try {
          await axios.post(`${API}/kirim-wa-kelebihan`, {
            no_hp: selectedUser.no_hp,
            nama_wali: selectedUser.nama,
            nama_siswa: selectedUser.nama_siswa,
            jumlah_bayar: jumlahInput,
            jumlah_tagihan: Number(selectedTagihan.jumlah),
            jenis_tagihan: tagihanSnapshot.jenis,
            kelebihan,
            keterangan,
            user_id: selectedUser.id,
          }, { headers });
        } catch (e) { console.log("WA kelebihan gagal:", e.message); }
      }

      if (kelebihan > 0) {
        setMsg(`✅ Tagihan lunas! Kelebihan ${formatRupiah(kelebihan)} dicatat.${kirimWA && selectedUser?.no_hp ? " 📲 Pesan masuk antrian Fonnte, terkirim 1-3 menit." : ""}`);
      } else if (res.data.lunas && kirimWA && selectedUser?.no_hp) {
        // Bayar pas lunas — kirim konfirmasi WA
        try {
          await axios.post(`${API}/kirim-wa-kelebihan`, {
            no_hp: selectedUser.no_hp,
            nama_wali: selectedUser.nama,
            nama_siswa: selectedUser.nama_siswa,
            jumlah_bayar: jumlahInput,
            jumlah_tagihan: Number(selectedTagihan.jumlah),
            jenis_tagihan: selectedTagihan.jenis,
            kelebihan: 0,
            keterangan: keterangan || "",
            user_id: selectedUser.id,
          }, { headers });
        } catch (e) { console.log("WA konfirmasi gagal:", e.message); }
        setMsg("✅ " + res.data.message + " 📲 Pesan masuk antrian Fonnte, terkirim 1-3 menit.");
      } else {
        setMsg("✅ " + res.data.message + (kirimWA && selectedUser?.no_hp ? " 📲 Pesan masuk antrian Fonnte, terkirim 1-3 menit." : ""));
      }

      const newCicilan = { id: res.data.id || Date.now(), jumlah_bayar: jumlahBayar, tanggal_bayar: form.tanggal_bayar, keterangan };
      const isLunas = res.data.lunas || kelebihan > 0;

      setForm({ jumlah_bayar: "", tanggal_bayar: new Date().toISOString().split("T")[0], keterangan: "" });
      setShowKonfirmasiLebih(false);
      setPendingBayar(null);

      if (isLunas) {
        // Hapus dari daftar tagihan (optimistic)
        setTagihan(prev => prev.filter(t => t.id !== tagihanSnapshot.id));
        setSelectedTagihan(null);
        setRiwayatBayar([]);
      } else {
        // Tambah cicilan ke riwayat lokal (optimistic)
        setRiwayatBayar(prev => [...prev, newCicilan]);
      }
    } catch (e) { setMsg("❌ " + (e.response?.data?.message || "Gagal menyimpan")); }
    setLoading(false);
    setTimeout(() => setMsg(""), 5000);
  };

  // Mulai edit cicilan — isi form edit dengan data cicilan yang dipilih
  const handleStartEdit = (r) => {
    setEditCicilan(r.id);
    setEditForm({
      jumlah_bayar: r.jumlah_bayar,
      tanggal_bayar: r.tanggal_bayar?.split("T")[0] || "",
      keterangan: r.keterangan || "",
    });
  };

  // Simpan hasil edit cicilan
  const handleSaveEdit = async (cicilanId) => {
    if (!editForm.jumlah_bayar || !editForm.tanggal_bayar) { setMsg("❌ Jumlah dan tanggal bayar wajib diisi!"); return; }
    // Hitung sisa tagihan di luar cicilan yang sedang diedit
    const totalLain = riwayatBayar.filter(r => r.id !== cicilanId).reduce((a, b) => a + Number(b.jumlah_bayar), 0);
    const maksEdit = Number(selectedTagihan.jumlah) - totalLain;
    if (Number(editForm.jumlah_bayar) > maksEdit) { setMsg(`❌ Jumlah melebihi sisa tagihan (${formatRupiah(maksEdit)})`); return; }
    setLoading(true);
    try {
      await axios.put(`${API}/pembayaran/${cicilanId}`, { ...editForm, jumlah_bayar: Number(editForm.jumlah_bayar) }, { headers });
      setMsg("✅ Cicilan berhasil diupdate!");
      setEditCicilan(null);
      // Optimistic: update riwayat lokal
      setRiwayatBayar(prev => prev.map(r => r.id === cicilanId ? { ...r, ...editForm, jumlah_bayar: Number(editForm.jumlah_bayar) } : r));
    } catch (e) { setMsg("❌ " + (e.response?.data?.message || "Gagal mengupdate cicilan")); }
    setLoading(false);
    setTimeout(() => setMsg(""), 4000);
  };

  // Hapus cicilan
  const handleDeleteCicilan = async (cicilanId) => {
    if (!window.confirm("Yakin hapus cicilan ini?")) return;
    setLoading(true);
    try {
      await axios.delete(`${API}/pembayaran/${cicilanId}`, { headers });
      setMsg("✅ Cicilan berhasil dihapus!");
      // Optimistic: hapus dari riwayat lokal
      setRiwayatBayar(prev => prev.filter(r => r.id !== cicilanId));
    } catch (e) { setMsg("❌ " + (e.response?.data?.message || "Gagal menghapus cicilan")); }
    setLoading(false);
    setTimeout(() => setMsg(""), 4000);
  };

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🧾 Input Pembayaran / Cicilan</div>
      {msg && <div style={{ background: msg.includes("✅") ? "#ecfdf5" : "#fef2f2", border: `1px solid ${msg.includes("✅") ? "#a7f3d0" : "#fecaca"}`, borderRadius: 10, padding: "10px 16px", marginBottom: 12, fontSize: 14, color: msg.includes("✅") ? "#065f46" : "#dc2626" }}>{msg}</div>}

      <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <label style={lStyle}>1. Pilih Santri</label>
        {/* Kotak Pencarian */}
        <div style={{ position: "relative", marginTop: 6, marginBottom: 10 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#94a3b8" }}>🔍</span>
          <input
            style={{ ...iStyle, paddingLeft: 36 }}
            placeholder="Cari nama santri..."
            value={searchSantri}
            onChange={e => setSearchSantri(e.target.value)}
          />
        </div>

        {/* Daftar santri per kelas */}
        {(() => {
          const filtered = santri.filter(s =>
            s.nama_siswa.toLowerCase().includes(searchSantri.toLowerCase())
          );
          const byKelas = filtered.reduce((acc, s) => {
            const k = s.kelas || "Lainnya";
            if (!acc[k]) acc[k] = [];
            acc[k].push(s);
            return acc;
          }, {});
          return (
            <div style={{ maxHeight: 260, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 10, marginBottom: 10 }}>
              {Object.keys(byKelas).length === 0
                ? <div style={{ padding: "12px 14px", fontSize: 13, color: "#94a3b8" }}>Santri tidak ditemukan</div>
                : Object.entries(byKelas).map(([kelas, list]) => (
                  <div key={kelas}>
                    <div style={{ padding: "6px 12px", background: "#f1f5f9", fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: 0.5 }}>
                      {kelas} <span style={{ fontWeight: 400 }}>({list.length} santri)</span>
                    </div>
                    {list.map(s => {
                      const isSelected = selectedUser?.id === s.id;
                      return (
                        <div key={s.id}
                          onClick={() => { setSelectedUser(s); loadTagihan(s.id); setSelectedTagihan(null); setEditCicilan(null); setSearchSantri(""); setShowKonfirmasiLebih(false); }}
                          style={{ padding: "9px 14px", cursor: "pointer", borderBottom: "1px solid #f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center", background: isSelected ? "#ecfdf5" : "white", borderLeft: isSelected ? "3px solid #059669" : "3px solid transparent" }}
                        >
                          <span style={{ fontSize: 14, fontWeight: isSelected ? 700 : 400, color: isSelected ? "#065f46" : "#1e293b" }}>
                            {s.nama_siswa}
                          </span>
                          {isSelected && <span style={{ fontSize: 11, background: "#059669", color: "white", borderRadius: 6, padding: "2px 8px" }}>✓ Dipilih</span>}
                        </div>
                      );
                    })}
                  </div>
                ))
              }
            </div>
          );
        })()}

        {/* Santri terpilih + tombol navigasi next/back */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            style={{ ...btnGray, padding: "8px 14px", fontSize: 13, opacity: !selectedUser || santri.indexOf(selectedUser) === 0 ? 0.4 : 1 }}
            disabled={!selectedUser || santri.indexOf(selectedUser) === 0}
            onClick={() => {
              const idx = santri.indexOf(selectedUser);
              if (idx > 0) { const s = santri[idx - 1]; setSelectedUser(s); loadTagihan(s.id); setSelectedTagihan(null); setEditCicilan(null); setShowKonfirmasiLebih(false); }
            }}
          >◀ Back</button>
          <div style={{ flex: 1, border: "2px solid #e5e7eb", borderRadius: 8, padding: "10px 12px", fontSize: 14, background: "#f8fafc", color: selectedUser ? "#1e293b" : "#94a3b8", fontWeight: selectedUser ? 600 : 400, minHeight: 42, textAlign: "center" }}>
            {selectedUser ? `${selectedUser.nama_siswa} (${selectedUser.kelas})` : "-- Belum ada santri dipilih --"}
          </div>
          <button
            style={{ ...btnGray, padding: "8px 14px", fontSize: 13, opacity: !selectedUser || santri.indexOf(selectedUser) === santri.length - 1 ? 0.4 : 1 }}
            disabled={!selectedUser || santri.indexOf(selectedUser) === santri.length - 1}
            onClick={() => {
              const idx = santri.indexOf(selectedUser);
              if (idx < santri.length - 1) { const s = santri[idx + 1]; setSelectedUser(s); loadTagihan(s.id); setSelectedTagihan(null); setEditCicilan(null); setShowKonfirmasiLebih(false); }
            }}
          >Next ▶</button>
        </div>
        {selectedUser && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6, textAlign: "center" }}>Santri ke-{santri.indexOf(selectedUser) + 1} dari {santri.length}</div>}
      </div>

      {selectedUser && tagihan.length === 0 && (
        <div style={{ background: "#ecfdf5", borderRadius: 14, padding: 16, textAlign: "center", color: "#065f46", fontWeight: 600 }}>✅ Semua tagihan {selectedUser.nama_siswa} sudah lunas!</div>
      )}

      {selectedUser && tagihan.length > 0 && (
        <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <label style={lStyle}>2. Pilih Tagihan yang Akan Dibayar</label>
            <button
              style={{ fontSize: 12, padding: "4px 10px", borderRadius: 8, border: "1px solid #059669", background: modeBulk ? "#059669" : "white", color: modeBulk ? "white" : "#059669", cursor: "pointer", fontWeight: 600 }}
              onClick={() => { setModeBulk(!modeBulk); setSelectedTagihanBulk([]); setSelectedTagihan(null); setShowKonfirmasiBulk(false); }}
            >
              {modeBulk ? "✓ Mode Bulk" : "☑️ Bayar Beberapa"}
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {tagihan.map(t => {
              const isSelected = modeBulk ? selectedTagihanBulk.find(x => x.id === t.id) : selectedTagihan?.id === t.id;
              return (
                <div key={t.id} onClick={() => modeBulk ? handleToggleBulk(t) : handleSelectTagihan(t)}
                  style={{ padding: "12px 16px", borderRadius: 10, border: `2px solid ${isSelected ? "#059669" : "#e5e7eb"}`, background: isSelected ? "#f0fdf4" : "white", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {modeBulk && (
                    <span style={{ marginRight: 10, fontSize: 18, color: isSelected ? "#059669" : "#cbd5e1" }}>
                      {isSelected ? "☑️" : "⬜"}
                    </span>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t.jenis}</div>
                    {t.semester && (
                      <div style={{ fontSize: 11, color: "#6366f1", marginTop: 2, fontWeight: 500 }}>
                        📅 {t.semester}
                      </div>
                    )}
                  </div>
                  <span style={{ color: "#dc2626", fontWeight: 700 }}>{formatRupiah(t.jumlah)}</span>
                </div>
              );
            })}
          </div>

          {/* FORM BULK */}
          {modeBulk && selectedTagihanBulk.length > 0 && (
            <div style={{ marginTop: 14, background: "#f0fdf4", borderRadius: 10, padding: 14 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>
                {selectedTagihanBulk.length} tagihan dipilih — Total sisa: <span style={{ color: "#dc2626" }}>{formatRupiah(totalSisaBulk)}</span>
              </div>
              <input
                style={{ ...iStyle, marginBottom: 8 }}
                type="number"
                placeholder="Jumlah bayar total"
                value={formBulk.jumlah_total}
                onChange={e => setFormBulk(f => ({ ...f, jumlah_total: e.target.value }))}
              />
              <input
                style={{ ...iStyle, marginBottom: 8 }}
                type="date"
                value={formBulk.tanggal_bayar}
                onChange={e => setFormBulk(f => ({ ...f, tanggal_bayar: e.target.value }))}
              />
              <input
                style={{ ...iStyle, marginBottom: 12 }}
                placeholder="Keterangan sisa / uang jajan (opsional)"
                value={keteranganBulk}
                onChange={e => setKeteranganBulk(e.target.value)}
              />
              {formBulk.jumlah_total && Number(formBulk.jumlah_total) > totalSisaBulk && (
                <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 10 }}>
                  🎉 Kelebihan: <b>{formatRupiah(Number(formBulk.jumlah_total) - totalSisaBulk)}</b> — catat di keterangan
                </div>
              )}
              {!showKonfirmasiBulk ? (
                <button
                  style={{ ...btnGreen, width: "100%", padding: 12, fontSize: 14 }}
                  onClick={() => {
                    if (!formBulk.jumlah_total) { setMsg("❌ Isi jumlah bayar dulu!"); return; }
                    setShowKonfirmasiBulk(true);
                  }}
                  disabled={loading}
                >
                  {`💾 Bayar ${selectedTagihanBulk.length} Tagihan Sekaligus`}
                </button>
              ) : (
                <div style={{ background: "#f0fdf4", border: "1px solid #a7f3d0", borderRadius: 10, padding: 14, marginTop: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>📋 Konfirmasi Pembayaran</div>
                  <div style={{ fontSize: 13, marginBottom: 6 }}>Santri: <b>{selectedUser?.nama_siswa}</b></div>
                  <div style={{ fontSize: 13, marginBottom: 6 }}>Total Bayar: <b style={{ color: "#059669" }}>{formatRupiah(Number(formBulk.jumlah_total))}</b></div>
                  <div style={{ fontSize: 13, marginBottom: 6 }}>Tagihan: <b>{selectedTagihanBulk.map(t => t.jenis).join(", ")}</b></div>
                  {keteranganBulk && <div style={{ fontSize: 13, marginBottom: 6 }}>Keterangan: <b>{keteranganBulk}</b></div>}

                  {/* Metode Bayar */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>💳 Metode Pembayaran:</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {["tunai", "transfer"].map(m => (
                        <button key={m} onClick={() => setMetodeBayarBulk(m)}
                          style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `2px solid ${metodeBayarBulk === m ? "#059669" : "#e5e7eb"}`, background: metodeBayarBulk === m ? "#f0fdf4" : "white", fontWeight: 600, fontSize: 13, cursor: "pointer", color: metodeBayarBulk === m ? "#059669" : "#64748b" }}>
                          {m === "tunai" ? "💵 Tunai" : "🏦 Transfer"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Kirim Notif WA */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, cursor: "pointer" }}
                    onClick={() => setKirimWABulk(!kirimWABulk)}>
                    <span style={{ fontSize: 20, color: kirimWABulk ? "#059669" : "#cbd5e1" }}>
                      {kirimWABulk ? "☑️" : "⬜"}
                    </span>
                    <span style={{ fontSize: 13, color: "#374151" }}>📲 Kirim notifikasi WA ke wali santri</span>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      style={{ ...btnGreen, flex: 1, padding: 12, fontSize: 14 }}
                      onClick={handleSimpanBulk}
                      disabled={loading}
                    >
                      {loading ? <><Spinner />Menyimpan...</> : kirimWABulk ? "✅ Konfirmasi & Kirim WA" : "✅ Konfirmasi"}
                    </button>
                    <button
                      style={{ ...btnGray, padding: "12px 16px" }}
                      onClick={() => setShowKonfirmasiBulk(false)}
                      disabled={loading}
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {selectedTagihan && (
        <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          {/* INFO TAGIHAN */}
          <div style={{ background: "#fffbeb", borderRadius: 10, padding: 12, marginBottom: 14 }}>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>{selectedTagihan.jenis}</div>
            {selectedTagihan.semester && (
              <div style={{ fontSize: 12, color: "#6366f1", fontWeight: 500, marginBottom: 6 }}>📅 Semester: {selectedTagihan.semester}</div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6, fontSize: 13 }}>
              <span>Total Tagihan: <b>{formatRupiah(selectedTagihan.jumlah)}</b></span>
              <span>Sudah Bayar: <b style={{ color: "#059669" }}>{formatRupiah(totalSudahBayar)}</b></span>
              <span>Sisa: <b style={{ color: "#dc2626" }}>{formatRupiah(sisaTagihan)}</b></span>
            </div>
          </div>

          {/* RIWAYAT CICILAN */}
          {riwayatBayar.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Riwayat Pembayaran:</div>
              {riwayatBayar.map((r, idx) => (
                <div key={r.id} style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 8, marginBottom: 8 }}>
                  {editCicilan === r.id ? (
                    /* FORM EDIT CICILAN */
                    <div style={{ background: "#f0fdf4", borderRadius: 10, padding: 12 }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: "#065f46", marginBottom: 8 }}>✏️ Edit Cicilan #{idx + 1}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
                        <div>
                          <label style={lStyle}>Jumlah Bayar (Rp)</label>
                          <input style={iStyle} type="number" value={editForm.jumlah_bayar} onChange={e => setEditForm({ ...editForm, jumlah_bayar: e.target.value })} />
                        </div>
                        <div>
                          <label style={lStyle}>Tanggal Bayar</label>
                          <input style={iStyle} type="date" value={editForm.tanggal_bayar} onChange={e => setEditForm({ ...editForm, tanggal_bayar: e.target.value })} />
                        </div>
                        <div style={{ gridColumn: "1/-1" }}>
                          <label style={lStyle}>Keterangan (opsional)</label>
                          <input style={iStyle} placeholder="contoh: Transfer BRI, Tunai, dll" value={editForm.keterangan} onChange={e => setEditForm({ ...editForm, keterangan: e.target.value })} />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                        <button style={{ ...btnGreen, flex: 1 }} onClick={() => handleSaveEdit(r.id)} disabled={loading}>
                          {loading ? "Menyimpan..." : "💾 Simpan"}
                        </button>
                        <button style={btnGray} onClick={() => setEditCicilan(null)}>Batal</button>
                      </div>
                    </div>
                  ) : (
                    /* TAMPILAN NORMAL CICILAN */
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                      <div>
                        <span style={{ color: "#475569" }}>{r.tanggal_bayar?.split("T")[0]}</span>
                        {r.keterangan && <span style={{ color: "#94a3b8" }}> · {r.keterangan}</span>}
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>Cicilan #{idx + 1}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ color: "#059669", fontWeight: 700 }}>+{formatRupiah(r.jumlah_bayar)}</span>
                        <button style={{ ...btnBlue, padding: "4px 10px", fontSize: 12 }} onClick={() => handleStartEdit(r)}>✏️</button>
                        <button style={{ ...btnRed, padding: "4px 10px", fontSize: 12 }} onClick={() => handleDeleteCicilan(r.id)} disabled={loading}>🗑️</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* FORM INPUT BAYAR BARU */}
          {!editCicilan && (
            <>
              <label style={lStyle}>3. Input Pembayaran Sekarang</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginTop: 8 }}>
                <div>
                  <label style={lStyle}>Jumlah Cicilan (Rp)</label>
                  <input
                    style={{ ...iStyle, borderColor: Number(form.jumlah_bayar) > sisaTagihan ? "#f59e0b" : undefined }}
                    type="number"
                    placeholder={`Sisa: ${sisaTagihan.toLocaleString("id-ID")}`}
                    value={form.jumlah_bayar}
                    onChange={e => { setForm({ ...form, jumlah_bayar: e.target.value }); setShowKonfirmasiLebih(false); }}
                    disabled={showKonfirmasiLebih}
                  />
                </div>
                <div>
                  <label style={lStyle}>Titipan Uang Jajan (Rp)</label>
                  <input
                    style={iStyle}
                    type="number"
                    placeholder="0 jika tidak ada"
                    value={form.uang_jajan || ""}
                    onChange={e => { setForm({ ...form, uang_jajan: e.target.value }); setShowKonfirmasiLebih(false); }}
                    disabled={showKonfirmasiLebih}
                  />
                </div>
                <div>
                  <label style={lStyle}>Tanggal Bayar</label>
                  <input style={iStyle} type="date" value={form.tanggal_bayar} onChange={e => setForm({ ...form, tanggal_bayar: e.target.value })} disabled={showKonfirmasiLebih} />
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={lStyle}>Keterangan (opsional)</label>
                  <input style={iStyle} placeholder="contoh: Transfer BRI, Tunai, dll" value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} disabled={showKonfirmasiLebih} />
                </div>
              </div>

              {/* Indikator kelebihan (sebelum konfirmasi) */}
              {form.jumlah_bayar && Number(form.jumlah_bayar) > sisaTagihan && !showKonfirmasiLebih && (
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 14px", marginTop: 10, fontSize: 13 }}>
                  <div style={{ fontWeight: 700, color: "#92400e", marginBottom: 4 }}>⚠️ Ada kelebihan bayar</div>
                  <div style={{ color: "#78350f", display: "flex", flexDirection: "column", gap: 3 }}>
                    <span>Dibayar: <b>{formatRupiah(Number(form.jumlah_bayar))}</b></span>
                    <span>Sisa tagihan: <b>{formatRupiah(sisaTagihan)}</b></span>
                    <span style={{ color: "#059669", fontWeight: 700 }}>Kelebihan: {formatRupiah(Number(form.jumlah_bayar) - sisaTagihan)} → akan dicatat & dikirim WA</span>
                  </div>
                </div>
              )}

              {/* ══ PANEL KONFIRMASI KELEBIHAN ══ */}
              {showKonfirmasiLebih && pendingBayar && (
                <div style={{ background: "#f0fdf4", border: "2px solid #86efac", borderRadius: 12, padding: 16, marginTop: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#065f46", marginBottom: 12 }}>
                    {pendingBayar?.isCicilan ? "💰 Konfirmasi Cicilan" : "✏️ Konfirmasi & Edit Keterangan Kelebihan"}
                  </div>

                  {/* Ringkasan */}
                  <div style={{ display: "grid", gridTemplateColumns: pendingBayar?.isCicilan ? "1fr 1fr" : "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                    {(pendingBayar?.isCicilan ? [
                      { label: "Jumlah Cicilan", value: formatRupiah(pendingBayar.jumlahInput), color: "#1e40af" },
                      { label: "Uang sisa bayar", value: formatRupiah(pendingBayar.uangJajan || 0), color: "#7c3aed" },
                      { label: "Sisa Tagihan", value: formatRupiah(sisaTagihan - pendingBayar.jumlahInput), color: "#b45309" },
                    ] : [
                      { label: "Total Dibayar", value: formatRupiah(pendingBayar.jumlahInput), color: "#1e40af" },
                      { label: "Untuk Tagihan", value: formatRupiah(pendingBayar.jumlahBayar), color: "#065f46" },
                      { label: "Kelebihan", value: formatRupiah(pendingBayar.kelebihan), color: "#b45309" },
                    ]).map((c, i) => (
                      <div key={i} style={{ background: "white", borderRadius: 8, padding: "8px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>{c.label}</div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: c.color }}>{c.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Edit keterangan */}
                  <div style={{ marginBottom: 12 }}>
                    <label style={lStyle}>📝 {pendingBayar?.isCicilan ? "Keterangan cicilan (opsional)" : "Keterangan kelebihan (bisa diedit)"}</label>
                    <textarea
                      style={{ ...iStyle, minHeight: 72, resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 }}
                      value={keteranganLebih}
                      onChange={e => setKeteranganLebih(e.target.value)}
                    />
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>Keterangan ini akan tersimpan di riwayat dan (jika diaktifkan) dikirim via WA.</div>
                  </div>

                  {/* Toggle kirim WA */}
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#374151", marginBottom: 14 }}>
                    <input type="checkbox" checked={kirimWALebih} onChange={e => setKirimWALebih(e.target.checked)} style={{ width: 16, height: 16 }} />
                    <span>
                      📲 Kirim notifikasi WhatsApp ke wali
                      {selectedUser?.no_hp
                        ? <span style={{ color: "#059669", marginLeft: 4 }}>({selectedUser.no_hp})</span>
                        : <span style={{ color: "#f59e0b", marginLeft: 4 }}>(⚠️ No. WA belum diisi)</span>
                      }
                    </span>
                  </label>

                  {/* Preview pesan WA */}
                  {kirimWALebih && selectedUser?.no_hp && (
                    <div style={{ background: "#dcfce7", border: "1px solid #86efac", borderRadius: 8, padding: "10px 12px", marginBottom: 14, fontSize: 12, color: "#166534", fontFamily: "monospace", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                    {pendingBayar?.isCicilan
  ? `Assalamu'alaikum Bapak/Ibu *${selectedUser.nama}*,\n\n💰 *Pembayaran Diterima (Cicilan)*\n━━━━━━━━━━━━━━━━━\nSantri  : *${selectedUser.nama_siswa}*\nTagihan : *${selectedTagihan?.jenis?.trim()}*\nDibayar : *${formatRupiah(pendingBayar.jumlahInput)}*\nSisa    : ⚠️ *${formatRupiah(sisaTagihan - pendingBayar.jumlahInput)}*\n━━━━━━━━━━━━━━━━━\nMohon segera lunasi sisa pembayaran 🙏\n\n_PP. Muhammadiyah Mambaul Ulum_\n_Mojo - Andong - Boyolali_`
  : `Assalamu'alaikum Bapak/Ibu *${selectedUser.nama}*,\n\n✅ *Konfirmasi Pembayaran*\n━━━━━━━━━━━━━━━━━━\nSantri       : *${selectedUser.nama_siswa}*\n━━━━━━━━━━━━━━━━━━\n💰 Total Bayar   : *${formatRupiah(pendingBayar.jumlahInput)}*\n📚 Pembayaran : *${selectedTagihan?.jenis?.trim()}*\n✅ Untuk Tagihan    : *${formatRupiah(pendingBayar.jumlahBayar)}* (Lunas)\n━━━━━━━━━━━━━━━━━━\n🎉 Sisa Uang     : *${formatRupiah(pendingBayar.kelebihan)}*\n📝 Ket           : ${keteranganLebih}\n━━━━━━━━━━━━━━━━━━\nTerima kasih atas pembayarannya 🙏\n_Jazakumullah Khoiron, Semoga Allah memudahkan_\n_dan melapangkan rizqi Bapak/Ibu_ Aamiin 🤲\n\n_PP. Muhammadiyah Mambaul Ulum_\n_Mojo - Andong - Boyolali_`
}
                    </div>
                  )}

                  {/* Tombol aksi */}
                  <div style={{ display: "flex", gap: 8 }}>
                   <button
          style={{ ...btnGreen, flex: 1, padding: 12, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          onClick={() => handleSimpanBayar(pendingBayar.jumlahInput, pendingBayar.jumlahBayar, pendingBayar.kelebihan, keteranganLebih, kirimWALebih)}
          disabled={loading}
        >
          {loading ? <><Spinner />Menyimpan...</> : `💾 Konfirmasi & Simpan`}
        </button>
                    <button style={{ ...btnGray, padding: "12px 16px" }} onClick={() => setShowKonfirmasiLebih(false)} disabled={loading}>
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {!showKonfirmasiLebih && (
                <button style={{ ...btnGreen, marginTop: 12, width: "100%", padding: 12 }} onClick={handleBayar} disabled={loading}>
                  {loading ? "Menyimpan..." : Number(form.jumlah_bayar) > sisaTagihan
                    ? `💾 Lanjut — Ada Kelebihan ${formatRupiah(Number(form.jumlah_bayar) - sisaTagihan)}`
                    : `💾 Simpan Pembayaran ${form.jumlah_bayar ? formatRupiah(Number(form.jumlah_bayar)) : ""}`
                  }
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}




// ============================================================
// DATA SANTRI
// ============================================================
function DataSantri({ santri, headers, onRefresh }) {
  const [editSantri, setEditSantri] = useState(null);
  const [form, setForm] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [msg, setMsg] = useState("");

  const handleKirimAkun = async (s) => {
    if (!s.no_hp) { setMsg("❌ Nomor WA wali belum diisi!"); return; }
    if (!confirm(`Kirim info akun ke WA wali ${s.nama}?`)) return;
    try {
      await axios.post(`${API}/santri/kirim-akun`, { user_id: s.id }, { headers });
      setMsg("✅ Info akun berhasil dikirim ke WA wali!");
      setTimeout(() => setMsg(""), 3000);
    } catch (e) { setMsg("❌ Gagal: " + e.response?.data?.message); }
  };

  const handleEdit = (s) => { setEditSantri(s.id); setForm({ nama: s.nama, nama_siswa: s.nama_siswa, kelas: s.kelas, password: "", no_hp: s.no_hp || "", username: s.username || "" }); setShowPass(false); };

  const handleSave = async (id) => {
    try {
      await axios.put(`${API}/santri/${id}`, form, { headers });
      setEditSantri(null);
      setMsg("✅ Data berhasil diupdate!");
      AdminDashboard._cache = null; // hapus cache agar data fresh
      onRefresh();
      setTimeout(() => setMsg(""), 3000);
    } catch (e) { setMsg("❌ Gagal: " + e.response?.data?.message); }
  };

  const handleDelete = async (id, nama) => {
    if (!confirm(`Hapus santri ${nama}? Semua tagihan akan ikut terhapus!`)) return;
    try {
      await axios.delete(`${API}/santri/${id}`, { headers });
      setMsg("✅ Santri berhasil dihapus!"); onRefresh();
      setTimeout(() => setMsg(""), 3000);
    } catch (e) { setMsg("❌ Gagal hapus"); }
  };

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>👥 Data Santri ({santri.length})</div>
      {msg && <div style={{ background: msg.includes("✅") ? "#ecfdf5" : "#fef2f2", border: `1px solid ${msg.includes("✅") ? "#a7f3d0" : "#fecaca"}`, borderRadius: 10, padding: "10px 16px", marginBottom: 12, fontSize: 14, color: msg.includes("✅") ? "#065f46" : "#dc2626" }}>{msg}</div>}
      <div style={{ background: "white", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        {santri.map(s => (
          <div key={s.id} style={{ padding: "14px 20px", borderBottom: "1px solid #f8fafc" }}>
            {editSantri === s.id ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
                  <div><label style={lStyle}>Nama Wali</label><input style={iStyle} value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} /></div>
                  <div><label style={lStyle}>Nama Santri</label><input style={iStyle} value={form.nama_siswa} onChange={e => setForm({ ...form, nama_siswa: e.target.value })} /></div>
                  <div><label style={lStyle}>Kelas</label><input style={iStyle} value={form.kelas} onChange={e => setForm({ ...form, kelas: e.target.value })} /></div>
                  <div>
                    <label style={lStyle}>📱 No. HP Wali (notif WA)</label>
                    <input style={iStyle} placeholder="contoh: 08123456789" value={form.no_hp || ""} onChange={e => setForm({ ...form, no_hp: e.target.value })} />
                  </div>
                  <div>
                    <label style={lStyle}>Username</label>
                    <input style={iStyle} value={form.username || ""} onChange={e => setForm({ ...form, username: e.target.value })} />
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={lStyle}>Password Baru (kosongkan jika tidak diubah)</label>
                    <div style={{ position: "relative" }}>
                      <input style={{ ...iStyle, paddingRight: 44 }} type={showPass ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                      <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>{showPass ? "🙈" : "👁️"}</button>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={btnGreen} onClick={() => handleSave(s.id)}>💾 Simpan</button>
                  <button style={btnGray} onClick={() => setEditSantri(null)}>Batal</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{s.nama_siswa}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{s.kelas} · Wali: {s.nama} · @{s.username}</div>
                  <div style={{ fontSize: 12, marginTop: 2 }}>
                    {s.no_hp ? <span style={{ color: "#059669" }}>📱 {s.no_hp} <span style={{ background: "#dcfce7", padding: "1px 6px", borderRadius: 4 }}>WA Aktif</span></span> : <span style={{ color: "#f59e0b" }}>⚠️ No. WA belum diisi</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={btnBlue} onClick={() => handleEdit(s)}>✏️ Edit</button>
<button style={{ background: "#7c3aed", color: "white", border: "none", borderRadius: 8, padding: "7px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer" }} onClick={() => handleKirimAkun(s)}>📲 Kirim Akun</button>
<button style={btnRed} onClick={() => handleDelete(s.id, s.nama_siswa)}>🗑️ Hapus</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// DATA TAGIHAN
// ============================================================
function DataTagihan({ santri: santriRaw, headers, onRefreshSantri }) {
  // Urutkan santri berdasarkan angka di depan kelas (1-6), lalu nama
  const santri = [...santriRaw].sort((a, b) => {
    const numA = parseInt(a.kelas) || 99;
    const numB = parseInt(b.kelas) || 99;
    if (numA !== numB) return numA - numB;
    return a.nama_siswa.localeCompare(b.nama_siswa, "id");
  });

  // ── Sub-tab ──────────────────────────────────────────────
  const [subTab, setSubTab] = useState("kelola");
  const [showMassal, setShowMassal] = useState(false);
  const [massalForm, setMassalForm] = useState({ jenis: "", jumlah: "", semester: "", status: "belum", kirim_notif: true });
  const [massalSantri, setMassalSantri] = useState([]);
  const [massalLoading, setMassalLoading] = useState(false);
  const [loadingSemester, setLoadingSemester] = useState(false);

  // ── Kelola Tagihan state ──────────────────────────────────
  const [selectedUser, setSelectedUser] = useState(null);
  const [tagihan, setTagihan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showCopy, setShowCopy] = useState(false);
  const [copyReferensi, setCopyReferensi] = useState(null);
  const [tagihanReferensi, setTagihanReferensi] = useState([]);
  const [loadingCopy, setLoadingCopy] = useState(false);
  const [searchCopySantri, setSearchCopySantri] = useState("");
const [selectedTagihanCopy, setSelectedTagihanCopy] = useState([]);
const [selectedTagihanHapus, setSelectedTagihanHapus] = useState([]);
const [modeHapusMassal, setModeHapusMassal] = useState(false);
  const [editTagihan, setEditTagihan] = useState(null);
  const [form, setForm] = useState({ jenis: "", jumlah: "", tanggal_bayar: "", status: "belum", semester: "", keterangan_semester: "", kirim_notif: false });
  const [msg, setMsg] = useState("");
  const [semesters, setSemesters] = useState([]);
  const [semesterSetting, setSemesterSetting] = useState({ aktif: "", daftar: [] });
  const [resetingId, setResetingId] = useState(null);
  const [searchTagihanSantri, setSearchTagihanSantri] = useState("");

  // ── Rekap pembayaran state ────────────────────────────────
  const [rekapData, setRekapData] = useState({}); // { userId: [tagihan...] }
  const [loadingRekap, setLoadingRekap] = useState(false);
  const [rekapMsg, setRekapMsg] = useState("");
  const [resettingLunas, setResettingLunas] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [searchRekap, setSearchRekap] = useState("");
  const [filterRekap, setFilterRekap] = useState("semua"); // "semua"|"lunas"|"belum"
  const [filterJenis, setFilterJenis] = useState(""); // "" = semua jenis
  const [viewMode, setViewMode] = useState("per_jenis"); // "per_santri" | "per_jenis"

  const refreshSemesters = async () => {
    setLoadingSemester(true);
    try {
      const semRes = await axios.get(`${API}/semester`, { headers });
      const semObjs = semRes.data;
      const semNames = semObjs.map(s => s.semester);
      setSemesters(semNames);
      if (semNames.length > 0) setSemesterSetting({ aktif: semNames[0], daftar: semNames });
    } catch (e) { console.error(e); }
    setLoadingSemester(false);
  };

  useEffect(() => { refreshSemesters(); }, []);

  // Load rekap semua santri saat tab rekap dibuka
  useEffect(() => {
    if (subTab === "rekap" && santri.length > 0 && Object.keys(rekapData).length === 0) {
      loadSemuaRekap();
    }
  }, [subTab, santri]);

  const loadSemuaRekap = async () => {
    setLoadingRekap(true);
    try {
      const results = await Promise.all(
        santri.map(s => axios.get(`${API}/tagihan/${s.id}`, { headers }).then(r => ({ id: s.id, data: r.data })).catch(() => ({ id: s.id, data: [] })))
      );
      const map = {};
      results.forEach(r => { map[r.id] = r.data; });
      setRekapData(map);
    } catch (e) { console.error(e); }
    setLoadingRekap(false);
  };

  // ── Kelola tagihan handlers ───────────────────────────────
  const loadTagihan = async (userId) => {
    setLoading(true);
    const res = await axios.get(`${API}/tagihan/${userId}`, { headers });
    setTagihan(res.data);
    setLoading(false);
  };

  const handleSelect = (s) => {
    setSelectedUser(s);
    loadTagihan(s.id);
    setShowForm(false);
    setEditTagihan(null);
  };

  const handleTambah = async () => {
    try {
      await axios.post(`${API}/tagihan`, { ...form, user_id: selectedUser.id, jumlah: Number(form.jumlah) }, { headers });
      setMsg("✅ Tagihan berhasil ditambahkan" + (form.kirim_notif ? " & notifikasi WA terkirim!" : " (tanpa notifikasi WA)"));
      setShowForm(false);
      setForm({ jenis: "", jumlah: "", tanggal_bayar: "", status: "belum", semester: semesterSetting.aktif || "", keterangan_semester: "", kirim_notif: false });
      loadTagihan(selectedUser.id);
      setRekapData({});
      setTimeout(() => setMsg(""), 4000);
    } catch (e) { setMsg("❌ " + e.response?.data?.message); }
  };

  const handleEdit = (t) => {
    setEditTagihan(t.id);
    setForm({ jenis: t.jenis, jumlah: t.jumlah, tanggal_bayar: t.tanggal_bayar?.split("T")[0] || "", status: t.status, semester: t.semester || "", keterangan_semester: t.keterangan_semester || "", kirim_notif: false });
  };

  const handleSaveEdit = async (id) => {
    try {
      await axios.put(`${API}/tagihan/${id}`, { ...form, jumlah: Number(form.jumlah) }, { headers });
      setMsg("✅ Berhasil diupdate" + (form.kirim_notif && form.status === "lunas" ? " & notifikasi lunas terkirim!" : ""));
      setEditTagihan(null);
      loadTagihan(selectedUser.id);
      setRekapData({});
      setTimeout(() => setMsg(""), 4000);
    } catch (e) { setMsg("❌ Gagal"); }
  };

  const handleLunas = async (t) => {
    const today = new Date().toISOString().split("T")[0];
    try {
      await axios.put(`${API}/tagihan/${t.id}`, { jenis: t.jenis, jumlah: t.jumlah, tanggal_bayar: today, status: "lunas", semester: t.semester, keterangan_semester: t.keterangan_semester || "", kirim_notif: false }, { headers });
      setMsg("✅ Lunas! (tanpa notifikasi WA)");
      loadTagihan(selectedUser.id);
      setRekapData({});
      setTimeout(() => setMsg(""), 3000);
    } catch (e) { setMsg("❌ Gagal"); }
  };

  const handleResetTagihan = async (t) => {
    if (!confirm(`Reset tagihan "${t.jenis}"?\n\nSemua riwayat cicilan akan dihapus dan status kembali ke "Belum Bayar".\nJenis tagihan & jumlah Rp ${Number(t.jumlah).toLocaleString("id-ID")} TIDAK berubah.`)) return;
    setResetingId(t.id);
    try {
      const r = await axios.post(`${API}/tagihan/${t.id}/reset`, {}, { headers });
      setMsg("✅ " + r.data.message);
      loadTagihan(selectedUser.id);
      setRekapData({});
      setTimeout(() => setMsg(""), 4000);
    } catch (e) { setMsg("❌ " + (e.response?.data?.message || "Gagal reset tagihan")); }
    setResetingId(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus tagihan ini? Semua cicilan ikut terhapus!")) return;
    await axios.delete(`${API}/tagihan/${id}`, { headers });
    setMsg("✅ Dihapus!"); loadTagihan(selectedUser.id); setRekapData({}); setTimeout(() => setMsg(""), 3000);
  };

  // ── Rekap handlers ────────────────────────────────────────
  // Toggle lunas/belum satu tagihan dari rekap
  const handleToggleLunas = async (santriObj, t) => {
    setTogglingId(t.id);
    const today = new Date().toISOString().split("T")[0];
    const newStatus = t.status === "lunas" ? "belum" : "lunas";
    try {
      await axios.put(`${API}/tagihan/${t.id}`, {
        jenis: t.jenis, jumlah: t.jumlah,
        tanggal_bayar: newStatus === "lunas" ? today : "",
        status: newStatus, semester: t.semester || "",
        keterangan_semester: t.keterangan_semester || "",
        kirim_notif: false
      }, { headers });
      // Update rekap local state
      setRekapData(prev => ({
        ...prev,
        [santriObj.id]: prev[santriObj.id].map(x => x.id === t.id ? { ...x, status: newStatus, tanggal_bayar: newStatus === "lunas" ? today : null } : x)
      }));
      setRekapMsg(`✅ Tagihan "${t.jenis}" (${santriObj.nama_siswa}) → ${newStatus === "lunas" ? "Lunas" : "Belum Bayar"}`);
    } catch (e) { setRekapMsg("❌ Gagal mengubah status tagihan"); }
    setTogglingId(null);
    setTimeout(() => setRekapMsg(""), 3000);
  };

  // Reset lunas SEMUA tagihan seluruh santri
  const handleResetLunasSemuaSantri = async () => {
    if (!confirm("Reset status lunas SEMUA tagihan seluruh santri?\n\nSemua tagihan yang statusnya 'Lunas' akan dikembalikan ke 'Belum Bayar'. Riwayat cicilan juga terhapus.\n\nTindakan ini tidak dapat dibatalkan!")) return;
    setResettingLunas(true);
    try {
      const r = await axios.post(`${API}/semester/reset`, {}, { headers });
      setRekapMsg("✅ " + (r.data.message || "Semua tagihan berhasil direset ke belum bayar!"));
      setRekapData({});
      await loadSemuaRekap();
      if (onRefreshSantri) onRefreshSantri();
    } catch (e) { setRekapMsg("❌ " + (e.response?.data?.message || "Gagal reset semua tagihan")); }
    setResettingLunas(false);
    setTimeout(() => setRekapMsg(""), 5000);
  };

  // Handle tambah tagihan massal
  const handleTambahMassal = async () => {
    if (!massalForm.jenis || !massalForm.jumlah) { setMsg("❌ Jenis dan jumlah wajib diisi!"); return; }
    if (massalSantri.length === 0) { setMsg("❌ Pilih minimal 1 santri!"); return; }
    setMassalLoading(true);
    let berhasil = 0;
    let gagal = 0;
    for (const uid of massalSantri) {
      try {
        await axios.post(`${API}/tagihan`, {
          user_id: uid,
          jenis: massalForm.jenis,
          jumlah: Number(massalForm.jumlah),
          semester: massalForm.semester || null,
          status: massalForm.status,
          tanggal_bayar: null,
          kirim_notif: massalForm.status === "belum" && massalForm.kirim_notif
        }, { headers });
        berhasil++;
      } catch (e) { gagal++; }
    }
    setMsg(`✅ Tagihan berhasil ditambahkan ke ${berhasil} santri${gagal > 0 ? `, ${gagal} gagal` : ""}!`);
    setMassalLoading(false);
    setShowMassal(false);
    setMassalForm({ jenis: "", jumlah: "", semester: "", status: "belum", kirim_notif: true });
    setMassalSantri([]);
    if (selectedUser) loadTagihan(selectedUser.id);
    onRefreshSantri();
    setTimeout(() => setMsg(""), 4000);
  };

  const totalTagihan = tagihan.reduce((a, b) => a + Number(b.jumlah), 0);
  const totalLunas = tagihan.reduce((a, b) => {
    if (b.status === "lunas") return a + Number(b.jumlah || 0);
    return a + Number(b.sudah_dicicil || 0);
  }, 0);

  const tagihanBySemester = tagihan.reduce((acc, t) => {
    const key = t.semester || "(Tanpa Semester)";
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  // Filter rekap
  const santriRekap = santri.filter(s => {
    const tg = rekapData[s.id] || [];
    const okSearch = s.nama_siswa.toLowerCase().includes(searchRekap.toLowerCase());
    if (!okSearch) return false;
    if (filterRekap === "semua") return true;
    const totalT = tg.reduce((a, b) => a + Number(b.jumlah), 0);
    const totalB = tg.reduce((a, b) => b.status === "lunas" ? a + Number(b.jumlah) : a + Number(b.sudah_dicicil || 0), 0);
    const sisa = Math.round(totalT - totalB);
    if (filterRekap === "lunas") return totalT > 0 && sisa <= 0;
    if (filterRekap === "belum") return sisa > 0;
    return true;
  });

  // Kumpulkan semua jenis tagihan unik dari semua santri
  const allJenis = [...new Set(
    Object.values(rekapData).flat().map(t => t.jenis).filter(Boolean)
  )].sort();

  // Data per jenis: untuk setiap jenis, siapa yang punya tagihan itu dan statusnya
  const rekapPerJenis = allJenis.map(jenis => {
    const list = [];
    santri.forEach(s => {
      const tg = (rekapData[s.id] || []).filter(t => t.jenis === jenis);
      if (tg.length > 0) {
        const sudahBayar = tg.every(t => t.status === "lunas");
        const cicilanAda = tg.some(t => t.sudah_dicicil > 0 && t.status !== "lunas");
        list.push({ santri: s, tagihan: tg, sudahBayar, cicilanAda });
      }
    });
    const lunas = list.filter(x => x.sudahBayar).length;
    const belum = list.filter(x => !x.sudahBayar).length;
    return { jenis, list, lunas, belum, total: list.length };
  });

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>💰 Tagihan</div>

      {/* TOMBOL TAMBAH MASSAL */}
      <div style={{ marginBottom: 16 }}>
        <button style={{ ...btnGreen, padding: "10px 18px", fontSize: 14 }} onClick={() => setShowMassal(!showMassal)}>
          {showMassal ? "❌ Batal Tambah Massal" : "➕ Tambah Tagihan untuk Semua / Pilihan Santri"}
        </button>
      </div>

      {/* FORM TAMBAH MASSAL */}
      {showMassal && (
        <div style={{ background: "white", borderRadius: 14, padding: 20, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>➕ Tambah Tagihan Massal</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div><label style={lStyle}>Jenis Tagihan</label><input style={iStyle} placeholder="contoh: Syahriyah Juli" value={massalForm.jenis} onChange={e => setMassalForm({ ...massalForm, jenis: e.target.value })} /></div>
            <div><label style={lStyle}>Jumlah (Rp)</label><input style={iStyle} type="number" placeholder="400000" value={massalForm.jumlah} onChange={e => setMassalForm({ ...massalForm, jumlah: e.target.value })} /></div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <label style={lStyle}>Semester</label>
                <button type="button" onClick={refreshSemesters} disabled={loadingSemester}
                  style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "2px 8px", fontSize: 11, cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                  {loadingSemester ? "⏳" : "🔄"} Refresh
                </button>
              </div>
              <select style={iStyle} value={massalForm.semester} onChange={e => setMassalForm({ ...massalForm, semester: e.target.value })}>
                <option value="">-- Tanpa Semester --</option>
                {semesters.map((s, i) => <option key={i} value={s}>{s}</option>)}
              </select>
            </div>
            <div><label style={lStyle}>Status</label>
              <select style={iStyle} value={massalForm.status} onChange={e => setMassalForm({ ...massalForm, status: e.target.value })}>
                <option value="belum">Belum Dibayar</option>
                <option value="lunas">Lunas</option>
              </select>
            </div>
          </div>

          {/* PILIH SANTRI */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label style={lStyle}>Pilih Santri yang Mendapat Tagihan:</label>
              <button style={btnBlue} onClick={() => setMassalSantri(massalSantri.length === santri.length ? [] : santri.map(s => s.id))}>
                {massalSantri.length === santri.length ? "Batal Semua" : "✅ Pilih Semua"}
              </button>
            </div>
            <div style={{ maxHeight: 220, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 10, padding: 8 }}>
              {santri.map(s => (
                <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", cursor: "pointer", borderRadius: 6, background: massalSantri.includes(s.id) ? "#f0fdf4" : "white", marginBottom: 2 }}>
                  <input type="checkbox" checked={massalSantri.includes(s.id)} onChange={() => setMassalSantri(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])} />
                  <span style={{ fontSize: 14 }}>{s.nama_siswa} <span style={{ color: "#94a3b8" }}>({s.kelas})</span></span>
                </label>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{massalSantri.length} santri dipilih</div>
          </div>

          {/* TOGGLE NOTIFIKASI WA */}
          <div style={{ marginBottom: 14, padding: "12px 14px", background: massalForm.kirim_notif ? "#f0fdf4" : "#f8fafc", borderRadius: 10, border: `1px solid ${massalForm.kirim_notif ? "#a7f3d0" : "#e5e7eb"}` }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, fontWeight: 600, color: massalForm.kirim_notif ? "#065f46" : "#64748b" }}>
              <input
                type="checkbox"
                checked={massalForm.kirim_notif}
                onChange={e => setMassalForm({ ...massalForm, kirim_notif: e.target.checked })}
                style={{ width: 18, height: 18, cursor: "pointer" }}
              />
              📲 Kirim notifikasi WhatsApp ke wali santri
            </label>
            <div style={{ fontSize: 12, marginTop: 6, marginLeft: 28, color: massalForm.kirim_notif ? "#059669" : "#94a3b8" }}>
              {massalForm.kirim_notif
                ? `✅ Notifikasi akan dikirim ke ${massalSantri.filter(uid => santri.find(s => s.id === uid)?.no_hp).length} wali yang punya nomor WA dari ${massalSantri.length} santri dipilih`
                : "❌ Notifikasi tidak akan dikirim"}
            </div>
            {massalForm.kirim_notif && massalSantri.filter(uid => !santri.find(s => s.id === uid)?.no_hp).length > 0 && (
              <div style={{ fontSize: 12, color: "#f59e0b", marginTop: 4, marginLeft: 28 }}>
                ⚠️ {massalSantri.filter(uid => !santri.find(s => s.id === uid)?.no_hp).length} santri tidak punya nomor WA (tidak akan dapat notif):&nbsp;
                {massalSantri.filter(uid => !santri.find(s => s.id === uid)?.no_hp).map(uid => santri.find(s => s.id === uid)?.nama_siswa).join(", ")}
              </div>
            )}
          </div>

          <button style={{ ...btnGreen, width: "100%", padding: 12, fontSize: 15 }} onClick={handleTambahMassal} disabled={massalLoading}>
            {massalLoading ? <><Spinner />Menyimpan...</> : `💾 Tambah Tagihan ke ${massalSantri.length} Santri${massalForm.kirim_notif ? " + Kirim WA" : " (Tanpa WA)"}`}
          </button>
        </div>
      )}

      {msg && <div style={{ background: msg.includes("✅") ? "#ecfdf5" : "#fef2f2", border: `1px solid ${msg.includes("✅") ? "#a7f3d0" : "#fecaca"}`, borderRadius: 10, padding: "10px 16px", marginBottom: 12, fontSize: 14, color: msg.includes("✅") ? "#065f46" : "#dc2626" }}>{msg}</div>}

      {/* ══════════════ KELOLA TAGIHAN ══════════════ */}
      <>
          <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <label style={lStyle}>Pilih Santri:</label>
            {/* Kotak Pencarian */}
            <div style={{ position: "relative", marginTop: 6, marginBottom: 10 }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#94a3b8" }}>🔍</span>
              <input
                style={{ ...iStyle, paddingLeft: 36 }}
                placeholder="Cari nama santri..."
                value={searchTagihanSantri}
                onChange={e => setSearchTagihanSantri(e.target.value)}
              />
            </div>

            {/* Daftar santri per kelas */}
            {(() => {
              const filtered = santri.filter(s =>
                s.nama_siswa.toLowerCase().includes(searchTagihanSantri.toLowerCase())
              );
              const byKelas = filtered.reduce((acc, s) => {
                const k = s.kelas || "Lainnya";
                if (!acc[k]) acc[k] = [];
                acc[k].push(s);
                return acc;
              }, {});
              return (
                <div style={{ maxHeight: 260, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 10, marginBottom: 10 }}>
                  {Object.keys(byKelas).length === 0
                    ? <div style={{ padding: "12px 14px", fontSize: 13, color: "#94a3b8" }}>Santri tidak ditemukan</div>
                    : Object.entries(byKelas).map(([kelas, list]) => (
                      <div key={kelas}>
                        {/* Header kelas */}
                        <div style={{ padding: "6px 12px", background: "#f1f5f9", fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: 0.5 }}>
                          {kelas} <span style={{ fontWeight: 400 }}>({list.length} santri)</span>
                        </div>
                        {list.map(s => {
                          const isSelected = selectedUser?.id === s.id;
                          return (
                            <div key={s.id}
                              onClick={() => { handleSelect(s); setSearchTagihanSantri(""); }}
                              style={{ padding: "9px 14px", cursor: "pointer", borderBottom: "1px solid #f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center", background: isSelected ? "#ecfdf5" : "white", borderLeft: isSelected ? "3px solid #059669" : "3px solid transparent" }}
                            >
                              <span style={{ fontSize: 14, fontWeight: isSelected ? 700 : 400, color: isSelected ? "#065f46" : "#1e293b" }}>
                                {s.nama_siswa}
                              </span>
                              {isSelected && <span style={{ fontSize: 11, background: "#059669", color: "white", borderRadius: 6, padding: "2px 8px" }}>✓ Dipilih</span>}
                            </div>
                          );
                        })}
                      </div>
                    ))
                  }
                </div>
              );
            })()}

            {/* Santri terpilih + tombol navigasi */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                style={{ ...btnGray, padding: "8px 14px", fontSize: 13, opacity: !selectedUser || santri.indexOf(selectedUser) === 0 ? 0.4 : 1 }}
                disabled={!selectedUser || santri.indexOf(selectedUser) === 0}
                onClick={() => { const idx = santri.indexOf(selectedUser); if (idx > 0) handleSelect(santri[idx - 1]); }}
              >◀ Back</button>
              <div style={{ flex: 1, border: "2px solid #e5e7eb", borderRadius: 8, padding: "10px 12px", fontSize: 14, background: "#f8fafc", color: selectedUser ? "#1e293b" : "#94a3b8", fontWeight: selectedUser ? 600 : 400, textAlign: "center" }}>
                {selectedUser ? `${selectedUser.nama_siswa} (${selectedUser.kelas})` : "-- Belum ada santri dipilih --"}
              </div>
              <button
                style={{ ...btnGray, padding: "8px 14px", fontSize: 13, opacity: !selectedUser || santri.indexOf(selectedUser) === santri.length - 1 ? 0.4 : 1 }}
                disabled={!selectedUser || santri.indexOf(selectedUser) === santri.length - 1}
                onClick={() => { const idx = santri.indexOf(selectedUser); if (idx < santri.length - 1) handleSelect(santri[idx + 1]); }}
              >Next ▶</button>
            </div>
            {selectedUser && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6, textAlign: "center" }}>Santri ke-{santri.indexOf(selectedUser) + 1} dari {santri.length}</div>}
          </div>

          {selectedUser && (
            <>
              {/* INFO SANTRI */}
              <div style={{ background: "#eff6ff", borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{selectedUser.nama_siswa}</div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>{selectedUser.kelas}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13 }}>Total: <b>{formatRupiah(totalTagihan)}</b></div>
                    <div style={{ fontSize: 13, color: "#059669" }}>Lunas: <b>{formatRupiah(totalLunas)}</b></div>
                    <div style={{ fontSize: 13, color: "#dc2626" }}>Kurang: <b>{formatRupiah(totalTagihan - totalLunas)}</b></div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                
                <button style={{ background: "#7c3aed", color: "white", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }} onClick={() => { setShowCopy(!showCopy); setShowForm(false); setCopyReferensi(null); setTagihanReferensi([]); setSearchCopySantri(""); }}>{showCopy ? "❌ Batal Copy" : "📋 Copy Tagihan dari Santri Lain"}</button>
                <button style={{ background: modeHapusMassal ? "#dc2626" : "#ef4444", color: "white", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  onClick={() => { setModeHapusMassal(!modeHapusMassal); setSelectedTagihanHapus([]); setShowForm(false); setShowCopy(false); }}>
                  {modeHapusMassal ? "❌ Batal Hapus" : "🗑️ Hapus Massal"}
                </button>
              </div>

              {showCopy && (
                <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "2px solid #7c3aed" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#7c3aed", marginBottom: 12 }}>📋 Copy Tagihan dari Santri Lain ke {selectedUser.nama_siswa}</div>
                  
                  {/* Pilih santri referensi */}
                  <label style={lStyle}>Pilih Santri Referensi (yang tagihannya mau di-copy):</label>
                  <input
                    style={{ ...iStyle, marginBottom: 8, marginTop: 4 }}
                    placeholder="🔍 Cari nama santri..."
                    value={searchCopySantri}
                    onChange={e => setSearchCopySantri(e.target.value)}
                  />
                  <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 10, marginBottom: 12 }}>
                    {santri.filter(s => s.id !== selectedUser.id && s.nama_siswa.toLowerCase().includes(searchCopySantri.toLowerCase())).map(s => (
                      <div key={s.id}
                        onClick={async () => {
                          setCopyReferensi(s);
                          setSearchCopySantri("");
                          try {
                            const res = await axios.get(`${API}/tagihan/${s.id}`, { headers });
                            setTagihanReferensi(res.data);
                          } catch(e) { setTagihanReferensi([]); }
                        }}
                        style={{ padding: "9px 14px", cursor: "pointer", borderBottom: "1px solid #f8fafc", background: copyReferensi?.id === s.id ? "#f5f3ff" : "white", borderLeft: copyReferensi?.id === s.id ? "3px solid #7c3aed" : "3px solid transparent", display: "flex", justifyContent: "space-between" }}
                      >
                        <span style={{ fontSize: 14, fontWeight: copyReferensi?.id === s.id ? 700 : 400 }}>{s.nama_siswa}</span>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>{s.kelas}</span>
                      </div>
                    ))}
                  </div>

                  {/* Preview tagihan referensi */}
                  {copyReferensi && tagihanReferensi.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>📋 Tagihan {copyReferensi.nama_siswa} ({tagihanReferensi.length} tagihan):</div>
                      <div style={{ background: "#f5f3ff", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                        {tagihanReferensi.map((t, i) => (
                          <div key={t.id} onClick={() => setSelectedTagihanCopy(prev => prev.includes(t.id) ? prev.filter(x => x !== t.id) : [...prev, t.id])}
                            style={{ display: "flex", justifyContent: "space-between", fontSize: 13, background: selectedTagihanCopy.includes(t.id) ? "#f5f3ff" : "white", borderRadius: 8, padding: "8px 12px", cursor: "pointer", border: `1px solid ${selectedTagihanCopy.includes(t.id) ? "#7c3aed" : "#e5e7eb"}` }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <input type="checkbox" checked={selectedTagihanCopy.includes(t.id)} readOnly style={{ width: 15, height: 15 }} />
                              <b>{t.jenis}</b>{t.semester ? <span style={{ color: "#7c3aed", marginLeft: 6, fontSize: 11 }}>({t.semester})</span> : ""}
                            </span>
                            <span style={{ color: "#059669", fontWeight: 700 }}>{formatRupiah(t.jumlah)}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          {selectedTagihanCopy.length === 0 ? "⚠️ Centang tagihan yang mau di-copy" : `✅ ${selectedTagihanCopy.length} tagihan dipilih`}
                        </div>
                        <button style={{ fontSize: 12, background: "none", border: "none", color: "#7c3aed", cursor: "pointer", fontWeight: 600 }}
                          onClick={() => setSelectedTagihanCopy(selectedTagihanCopy.length === tagihanReferensi.length ? [] : tagihanReferensi.map(t => t.id))}>
                          {selectedTagihanCopy.length === tagihanReferensi.length ? "Batal Semua" : "✅ Pilih Semua"}
                        </button>
                      </div>
                    </div>
                  )}

                  {copyReferensi && tagihanReferensi.length === 0 && (
                    <div style={{ background: "#fffbeb", borderRadius: 10, padding: 12, fontSize: 13, color: "#92400e", marginBottom: 12 }}>
                      ⚠️ {copyReferensi.nama_siswa} tidak punya tagihan.
                    </div>
                  )}

                  {copyReferensi && tagihanReferensi.length > 0 && (
                    <button
                      style={{ background: "#7c3aed", color: "white", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%", opacity: loadingCopy ? 0.7 : 1 }}
                      disabled={loadingCopy}
                      onClick={async () => {
                        if (selectedTagihanCopy.length === 0) { setMsg("❌ Pilih minimal 1 tagihan!"); return; }
                        setLoadingCopy(true);
                        let berhasil = 0;
                        for (const t of tagihanReferensi.filter(t => selectedTagihanCopy.includes(t.id))) {
                          try {
                            await axios.post(`${API}/tagihan`, {
                              user_id: selectedUser.id,
                              jenis: t.jenis,
                              jumlah: Number(t.jumlah),
                              semester: t.semester || null,
                              status: "belum",
                              tanggal_bayar: null,
                              kirim_notif: false,
                            }, { headers });
                            berhasil++;
                          } catch(e) {}
                        }
                        setMsg(`✅ ${berhasil} tagihan berhasil di-copy ke ${selectedUser.nama_siswa}!`);
                        setLoadingCopy(false);
                        setShowCopy(false);
                        setCopyReferensi(null);
                        setTagihanReferensi([]);
                        setSelectedTagihanCopy([]);
                        loadTagihan(selectedUser.id);
                        setTimeout(() => setMsg(""), 4000);
                      }}
                    >
                      {loadingCopy ? "⏳ Menyalin..." : `📋 Copy ${selectedTagihanCopy.length} Tagihan ke ${selectedUser.nama_siswa}`}
                    </button>
                  )}
                </div>
              )}

              {showForm && (
                <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                    <div><label style={lStyle}>Jumlah (Rp)</label><input style={iStyle} type="number" value={form.jumlah} onChange={e => setForm({ ...form, jumlah: e.target.value })} /></div>
                    <div>
                      <label style={lStyle}>Semester</label>
                      <select style={iStyle} value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })}>
                        <option value="">-- Tanpa Semester --</option>
                        {semesters.map((s, i) => <option key={i} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={lStyle}>Keterangan Semester</label>
                      <input style={iStyle} placeholder="contoh: Ganjil 2024/2025" value={form.keterangan_semester} onChange={e => setForm({ ...form, keterangan_semester: e.target.value })} />
                    </div>
                    <div><label style={lStyle}>Status</label>
                      <select style={iStyle} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                        <option value="belum">Belum Dibayar</option>
                        <option value="lunas">Lunas</option>
                      </select>
                    </div>
                    <div><label style={lStyle}>Tanggal Bayar</label><input style={iStyle} type="date" value={form.tanggal_bayar} onChange={e => setForm({ ...form, tanggal_bayar: e.target.value })} /></div>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, cursor: "pointer", fontSize: 13, color: "#374151" }}>
                    <input type="checkbox" checked={form.kirim_notif} onChange={e => setForm({ ...form, kirim_notif: e.target.checked })} style={{ width: 16, height: 16 }} />
                    <span>📲 Kirim notifikasi WhatsApp ke wali setelah disimpan</span>
                  </label>
                  <button style={{ ...btnGreen, marginTop: 12 }} onClick={handleTambah}>💾 Simpan</button>
                </div>
              )}

              {/* PANEL HAPUS MASSAL */}
              {modeHapusMassal && (
                <div style={{ background: "#fef2f2", border: "2px solid #fecaca", borderRadius: 12, padding: "12px 16px", marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <div style={{ fontSize: 13, color: "#dc2626", fontWeight: 600 }}>
                      🗑️ Mode Hapus Massal — {selectedTagihanHapus.length} tagihan dipilih
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ ...btnGray, fontSize: 12, padding: "6px 12px" }}
                        onClick={() => setSelectedTagihanHapus(selectedTagihanHapus.length === tagihan.length ? [] : tagihan.map(t => t.id))}>
                        {selectedTagihanHapus.length === tagihan.length ? "Batal Semua" : "✅ Pilih Semua"}
                      </button>
                      <button
                        style={{ background: "#dc2626", color: "white", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: selectedTagihanHapus.length === 0 ? 0.5 : 1 }}
                        disabled={selectedTagihanHapus.length === 0}
                        onClick={async () => {
                          if (!confirm(`Hapus ${selectedTagihanHapus.length} tagihan? Semua cicilan ikut terhapus!`)) return;
                          let berhasil = 0;
                          for (const id of selectedTagihanHapus) {
                            try { await axios.delete(`${API}/tagihan/${id}`, { headers }); berhasil++; } catch(e) {}
                          }
                          setMsg(`✅ ${berhasil} tagihan berhasil dihapus!`);
                          setSelectedTagihanHapus([]);
                          setModeHapusMassal(false);
                          loadTagihan(selectedUser.id);
                          setRekapData({});
                          setTimeout(() => setMsg(""), 4000);
                        }}>
                        🗑️ Hapus {selectedTagihanHapus.length} Tagihan
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* DAFTAR TAGIHAN per semester */}
              {loading ? <div style={{ padding: 30, textAlign: "center" }}>Memuat...</div> :
                Object.entries(tagihanBySemester).map(([semKey, items]) => (
                  <div key={semKey} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>📅 {semKey}</span>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>{items.filter(t => t.status === "lunas").length}/{items.length} lunas</span>
                    </div>
                    <div style={{ background: "white", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                      {items.map(t => (
                        <div key={t.id}
                          onClick={() => modeHapusMassal && setSelectedTagihanHapus(prev => prev.includes(t.id) ? prev.filter(x => x !== t.id) : [...prev, t.id])}
                          style={{ padding: "12px 16px", borderBottom: "1px solid #f8fafc", background: modeHapusMassal && selectedTagihanHapus.includes(t.id) ? "#fef2f2" : t.status === "lunas" ? "white" : "#fffbeb", cursor: modeHapusMassal ? "pointer" : "default" }}>
                          {modeHapusMassal && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                              <input type="checkbox" checked={selectedTagihanHapus.includes(t.id)} readOnly style={{ width: 15, height: 15 }} />
                              <span style={{ fontSize: 12, color: selectedTagihanHapus.includes(t.id) ? "#dc2626" : "#94a3b8", fontWeight: 600 }}>
                                {selectedTagihanHapus.includes(t.id) ? "✓ Dipilih untuk dihapus" : "Klik untuk pilih"}
                              </span>
                            </div>
                          )}
                          {editTagihan === t.id ? (
                            <div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                <div><label style={lStyle}>Jenis</label><input style={iStyle} value={form.jenis} onChange={e => setForm({ ...form, jenis: e.target.value })} /></div>
                                <div><label style={lStyle}>Jumlah</label><input style={iStyle} type="number" value={form.jumlah} onChange={e => setForm({ ...form, jumlah: e.target.value })} /></div>
                                <div>
                                  <label style={lStyle}>Semester</label>
                                  <select style={iStyle} value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })}>
                                    <option value="">-- Tanpa Semester --</option>
                                    {semesters.map((s, i) => <option key={i} value={s}>{s}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label style={lStyle}>Keterangan Semester</label>
                                  <input style={iStyle} placeholder="contoh: Ganjil 2024/2025" value={form.keterangan_semester} onChange={e => setForm({ ...form, keterangan_semester: e.target.value })} />
                                </div>
                                <div><label style={lStyle}>Status</label>
                                  <select style={iStyle} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                    <option value="belum">Belum</option>
                                    <option value="lunas">Lunas</option>
                                  </select>
                                </div>
                                <div><label style={lStyle}>Tanggal Bayar</label><input style={iStyle} type="date" value={form.tanggal_bayar} onChange={e => setForm({ ...form, tanggal_bayar: e.target.value })} /></div>
                              </div>
                              {form.status === "lunas" && (
                                <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, cursor: "pointer", fontSize: 13, color: "#374151" }}>
                                  <input type="checkbox" checked={form.kirim_notif} onChange={e => setForm({ ...form, kirim_notif: e.target.checked })} style={{ width: 16, height: 16 }} />
                                  <span>📲 Kirim notifikasi WhatsApp lunas ke wali</span>
                                </label>
                              )}
                              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                <button style={btnGreen} onClick={() => handleSaveEdit(t.id)}>💾 Simpan</button>
                                <button style={btnGray} onClick={() => setEditTagihan(null)}>Batal</button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>{t.jenis}</div>
                                {t.keterangan_semester && <div style={{ fontSize: 11, color: "#3b82f6", marginTop: 1 }}>📝 {t.keterangan_semester}</div>}
                                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                                  {t.status === "lunas"
                                    ? `✅ Lunas · Dibayar: ${t.tanggal_bayar?.split("T")[0]}`
                                    : t.sudah_dicicil > 0
                                      ? `⚡ Cicilan: ${formatRupiah(t.sudah_dicicil)} · Sisa: ${formatRupiah(Number(t.jumlah) - Number(t.sudah_dicicil))}`
                                      : "⏳ Belum dibayar"}
                                </div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                <span style={{ fontWeight: 700, color: t.status === "lunas" ? "#059669" : "#dc2626" }}>{formatRupiah(t.jumlah)}</span>
                                {t.status === "belum" && (
                                  <button style={{ ...btnGreen, padding: "5px 10px", fontSize: 12 }} onClick={() => handleLunas(t)}>✓ Lunas</button>
                                )}
                                {(t.status === "lunas" || Number(t.sudah_dicicil) > 0) && (
                                  <button title="Reset ke belum bayar" style={{ background: "#f59e0b", color: "white", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: resetingId === t.id ? 0.6 : 1 }} onClick={() => handleResetTagihan(t)} disabled={resetingId === t.id}>
                                    {resetingId === t.id ? "⏳" : "↺ Reset"}
                                  </button>
                                )}
                                <button style={{ ...btnBlue, padding: "5px 10px", fontSize: 12 }} onClick={() => handleEdit(t)}>✏️</button>
                                <button style={{ ...btnRed, padding: "5px 10px", fontSize: 12 }} onClick={() => handleDelete(t.id)}>🗑️</button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              }
            </>
          )}
        </>

      {/* ══════════════ TAB REKAP PEMBAYARAN ══════════════ */}
      {true && (
        <div>
          {rekapMsg && <div style={{ background: rekapMsg.includes("✅") ? "#ecfdf5" : "#fef2f2", border: `1px solid ${rekapMsg.includes("✅") ? "#a7f3d0" : "#fecaca"}`, borderRadius: 10, padding: "10px 16px", marginBottom: 12, fontSize: 14, color: rekapMsg.includes("✅") ? "#065f46" : "#dc2626" }}>{rekapMsg}</div>}

          {/* TOOLBAR */}
          <div style={{ background: "white", borderRadius: 14, padding: 14, marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {/* Toggle view mode */}
            <div style={{ display: "flex", gap: 4, marginBottom: 4, width: "100%" }}>
              <button onClick={() => setViewMode("per_jenis")} style={{ padding: "7px 14px", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 700, background: "#7c3aed", color: "white" }}>🏷️ Per Jenis Tagihan</button>
            </div>
            {viewMode === "per_santri" && (
              <>
                <input style={{ ...iStyle, maxWidth: 220, padding: "8px 12px", fontSize: 13 }} placeholder="🔍 Cari nama santri..." value={searchRekap} onChange={e => setSearchRekap(e.target.value)} />
                <div style={{ display: "flex", gap: 4 }}>
                  {[["semua","Semua"],["lunas","✅ Lunas"],["belum","⏳ Belum"]].map(([v,l]) => (
                    <button key={v} onClick={() => setFilterRekap(v)} style={{ padding: "7px 12px", border: "none", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: filterRekap === v ? 700 : 400, background: filterRekap === v ? (v === "lunas" ? "#059669" : v === "belum" ? "#f59e0b" : "#3b82f6") : "#f1f5f9", color: filterRekap === v ? "white" : "#64748b" }}>{l}</button>
                  ))}
                </div>
              </>
            )}
            {viewMode === "per_jenis" && (
              <select style={{ ...iStyle, maxWidth: 280, padding: "8px 12px", fontSize: 13 }} value={filterJenis} onChange={e => setFilterJenis(e.target.value)}>
                <option value="">-- Semua Jenis Tagihan --</option>
                {allJenis.map((j, i) => <option key={i} value={j}>{j}</option>)}
              </select>
            )}
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button style={{ ...btnBlue, padding: "7px 14px", fontSize: 12, opacity: loadingRekap ? 0.6 : 1 }} onClick={() => { setRekapData({}); loadSemuaRekap(); }} disabled={loadingRekap}>🔄 Refresh</button>
              <button
                style={{ background: "#ef4444", color: "white", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", opacity: resettingLunas ? 0.6 : 1 }}
                onClick={handleResetLunasSemuaSantri}
                disabled={resettingLunas}
                title="Reset status lunas semua tagihan seluruh santri menjadi belum bayar"
              >
                {resettingLunas ? "⏳ Mereset..." : "🔄 Reset Lunas Semua"}
              </button>
            </div>
          </div>

          {loadingRekap ? (
            <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>⏳ Memuat data rekap...</div>
          ) : viewMode === "per_jenis" ? (
            /* ── VIEW PER JENIS TAGIHAN ── */
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {(filterJenis ? rekapPerJenis.filter(r => r.jenis === filterJenis) : rekapPerJenis).length === 0 && (
                <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", background: "white", borderRadius: 14 }}>Tidak ada data tagihan.</div>
              )}
              {(filterJenis ? rekapPerJenis.filter(r => r.jenis === filterJenis) : rekapPerJenis).map(({ jenis, list, lunas, belum, total }) => (
                <div key={jenis} style={{ background: "white", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  {/* Header jenis */}
                  <div style={{ background: "linear-gradient(135deg, #1e293b, #334155)", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "white" }}>🏷️ {jenis}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ background: "#059669", color: "white", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>✅ Lunas: {lunas}</span>
                      <span style={{ background: "#dc2626", color: "white", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>⏳ Belum: {belum}</span>
                      <span style={{ background: "#475569", color: "white", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>Total: {total}</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 6, background: "#f1f5f9" }}>
                    <div style={{ height: "100%", width: `${total > 0 ? (lunas/total)*100 : 0}%`, background: "#059669", transition: "width 0.3s" }} />
                  </div>
                  {/* Dua kolom: sudah & belum bayar */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                    {/* Kolom Sudah Bayar */}
                    <div style={{ borderRight: "1px solid #f1f5f9" }}>
                      <div style={{ padding: "8px 12px", background: "#f0fdf4", fontSize: 12, fontWeight: 700, color: "#059669", borderBottom: "1px solid #dcfce7" }}>✅ Sudah Bayar ({lunas})</div>
                      {list.filter(x => x.sudahBayar).length === 0
                        ? <div style={{ padding: "12px", fontSize: 12, color: "#94a3b8", textAlign: "center" }}>—</div>
                        : list.filter(x => x.sudahBayar).map(({ santri: s, tagihan: tg }) => (
                          <div key={s.id} style={{ padding: "8px 12px", borderBottom: "1px solid #f8fafc", fontSize: 13 }}>
                            <div style={{ fontWeight: 600 }}>{s.nama_siswa}</div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>{s.kelas} · {tg[0]?.tanggal_bayar ? new Date(tg[0].tanggal_bayar).toLocaleDateString("id-ID") : "—"}</div>
                            <div style={{ fontSize: 11, color: "#059669", fontWeight: 600 }}>{formatRupiah(tg.reduce((a,t) => a+Number(t.jumlah),0))}</div>
                          </div>
                        ))
                      }
                    </div>
                    {/* Kolom Belum Bayar */}
                    <div>
                      <div style={{ padding: "8px 12px", background: "#fef9ec", fontSize: 12, fontWeight: 700, color: "#b45309", borderBottom: "1px solid #fde68a" }}>⏳ Belum Bayar ({belum})</div>
                      {list.filter(x => !x.sudahBayar).length === 0
                        ? <div style={{ padding: "12px", fontSize: 12, color: "#94a3b8", textAlign: "center" }}>—</div>
                        : list.filter(x => !x.sudahBayar).map(({ santri: s, tagihan: tg, cicilanAda }) => (
                          <div key={s.id} style={{ padding: "8px 12px", borderBottom: "1px solid #f8fafc", fontSize: 13 }}>
                            <div style={{ fontWeight: 600 }}>{s.nama_siswa}</div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>{s.kelas}</div>
                            {cicilanAda
                              ? <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 600 }}>⚡ Cicilan: {formatRupiah(tg.reduce((a,t) => a+Number(t.sudah_dicicil||0),0))} / {formatRupiah(tg.reduce((a,t) => a+Number(t.jumlah),0))}</div>
                              : <div style={{ fontSize: 11, color: "#dc2626", fontWeight: 600 }}>Tagihan: {formatRupiah(tg.reduce((a,t) => a+Number(t.jumlah),0))}</div>
                            }
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {santriRekap.length === 0 && <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", background: "white", borderRadius: 14 }}>Tidak ada data.</div>}
              {santriRekap.map(s => {
                const tg = rekapData[s.id] || [];
                const totalT = tg.reduce((a, b) => a + Number(b.jumlah), 0);
                const totalB = tg.reduce((a, b) => b.status === "lunas" ? a + Number(b.jumlah) : a + Number(b.sudah_dicicil || 0), 0);
                const sisa = Math.round(totalT - totalB);
                const persen = totalT > 0 ? Math.round((totalB / totalT) * 100) : 0;
                const semuaLunas = totalT > 0 && sisa <= 0;
                return (
                  <div key={s.id} style={{ background: "white", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                    {/* Header santri */}
                    <div style={{ padding: "12px 16px", background: semuaLunas ? "#f0fdf4" : "#fffbeb", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{s.nama_siswa}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{s.kelas} · Wali: {s.nama}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 12, color: semuaLunas ? "#059669" : "#dc2626", fontWeight: 700 }}>
                          {semuaLunas ? "✅ Semua Lunas" : `Sisa: ${formatRupiah(sisa)}`}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                          <div style={{ width: 80, height: 5, background: "#e5e7eb", borderRadius: 999 }}>
                            <div style={{ height: "100%", width: `${persen}%`, background: persen === 100 ? "#059669" : "#3b82f6", borderRadius: 999 }} />
                          </div>
                          <span style={{ fontSize: 11, color: "#64748b" }}>{persen}%</span>
                        </div>
                      </div>
                    </div>
                    {/* Daftar tagihan */}
                    {tg.length === 0 ? (
                      <div style={{ padding: "12px 16px", fontSize: 13, color: "#94a3b8" }}>Belum ada tagihan.</div>
                    ) : (
                      tg.map(t => {
                        const isLunas = t.status === "lunas";
                        return (
                          <div key={t.id} style={{ padding: "10px 16px", borderBottom: "1px solid #f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, background: isLunas ? "white" : "#fffef5" }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600 }}>{t.jenis}</div>
                              <div style={{ fontSize: 11, color: "#94a3b8", display: "flex", gap: 8, flexWrap: "wrap", marginTop: 2 }}>
                                {t.semester && <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "1px 6px", borderRadius: 4 }}>{t.semester}</span>}
                                {t.keterangan_semester && <span style={{ color: "#3b82f6" }}>📝 {t.keterangan_semester}</span>}
                                {isLunas && t.tanggal_bayar && <span style={{ color: "#059669" }}>Dibayar: {t.tanggal_bayar.split("T")[0]}</span>}
                                {!isLunas && Number(t.sudah_dicicil) > 0 && <span style={{ color: "#f59e0b" }}>Cicilan: {formatRupiah(t.sudah_dicicil)}</span>}
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontWeight: 700, fontSize: 13, color: isLunas ? "#059669" : "#dc2626" }}>{formatRupiah(t.jumlah)}</span>
                              {/* Toggle Lunas */}
                              <button
                                onClick={() => handleToggleLunas(s, t)}
                                disabled={togglingId === t.id}
                                style={{
                                  padding: "5px 12px", fontSize: 12, fontWeight: 700, border: "none", borderRadius: 8, cursor: "pointer",
                                  background: isLunas ? "#fef2f2" : "#f0fdf4",
                                  color: isLunas ? "#dc2626" : "#059669",
                                  border: `1px solid ${isLunas ? "#fecaca" : "#a7f3d0"}`,
                                  opacity: togglingId === t.id ? 0.5 : 1,
                                  minWidth: 80,
                                }}
                              >
                                {togglingId === t.id ? "⏳" : isLunas ? "↺ Belum" : "✓ Lunas"}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// TAMBAH SANTRI BARU
// ============================================================
function TambahSantri({ headers, onRefresh }) {
  const [form, setForm] = useState({ username: "", password: "", nama: "", nama_siswa: "", kelas: "" });
  const [showPass, setShowPass] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.username || !form.password || !form.nama || !form.nama_siswa || !form.kelas) {
      setMsg("❌ Semua kolom wajib diisi!"); return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/santri`, form, { headers });
      setMsg("✅ Santri berhasil ditambahkan!");
      setForm({ username: "", password: "", nama: "", nama_siswa: "", kelas: "", no_hp: "" });
      setTimeout(() => { setMsg(""); onRefresh(); }, 1500);
    } catch (e) { setMsg("❌ " + (e.response?.data?.message || "Error")); }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>➕ Tambah Santri & Akun Baru</div>
      {msg && <div style={{ background: msg.includes("✅") ? "#ecfdf5" : "#fef2f2", border: `1px solid ${msg.includes("✅") ? "#a7f3d0" : "#fecaca"}`, borderRadius: 10, padding: "10px 16px", marginBottom: 12, fontSize: 14, color: msg.includes("✅") ? "#065f46" : "#dc2626" }}>{msg}</div>}
      <div style={{ background: "white", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          <div><label style={lStyle}>Nama Wali / Orang Tua</label><input style={iStyle} placeholder="contoh: Ahmad Fauzi" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} /></div>
          <div><label style={lStyle}>Nama Santri</label><input style={iStyle} placeholder="contoh: Rizky Fauzi" value={form.nama_siswa} onChange={e => setForm({ ...form, nama_siswa: e.target.value })} /></div>
          <div>
            <label style={lStyle}>Kelas</label>
            <select style={iStyle} value={form.kelas} onChange={e => setForm({ ...form, kelas: e.target.value })}>
              <option value="">-- Pilih Kelas --</option>
              {[1,2,3,4,5,6].map(k => <option key={k} value={`Kelas ${k}`}>Kelas {k}</option>)}
            </select>
          </div>
          <div>
            <label style={lStyle}>📱 No. HP Wali (notif WhatsApp)</label>
            <input style={iStyle} placeholder="contoh: 08123456789" value={form.no_hp || ""} onChange={e => setForm({ ...form, no_hp: e.target.value })} />
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>Kosongkan jika belum ada. Bisa diisi lewat Edit Santri.</div>
          </div>
          <div><label style={lStyle}>Username Login</label><input style={iStyle} placeholder="contoh: ahmad.fauzi" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} /></div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={lStyle}>Password Login</label>
            <div style={{ position: "relative" }}>
              <input style={{ ...iStyle, paddingRight: 44 }} type={showPass ? "text" : "password"} placeholder="Password untuk login orang tua" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>{showPass ? "🙈" : "👁️"}</button>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 16, padding: 14, background: "#f0fdf4", borderRadius: 10, fontSize: 13, color: "#065f46" }}>
          💡 Setelah santri ditambahkan, masuk ke menu <b>Tagihan</b> untuk menambahkan tagihan santri ini.
        </div>
        <button style={{ ...btnGreen, marginTop: 16, width: "100%", padding: 14, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={handleSubmit} disabled={loading}>
          {loading ? <><Spinner />Menyimpan...</> : "✅ Tambah Santri & Buat Akun"}
        </button>
      </div>
    </div>
  );
}


// ============================================================
// PENGINGAT WA
// ============================================================
function Pengingat({ santri, headers }) {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [jadwal, setJadwal] = useState({ aktif: false, tanggal: 1, jam: "08:00" });
  const [jadwalMsg, setJadwalMsg] = useState("");

  useEffect(() => {
    axios.get(`${API}/pengingat/jadwal`, { headers })
      .then(r => setJadwal(r.data))
      .catch(console.error);
  }, []);

  // Kirim pengingat ke semua wali yang punya tunggakan
  const handleKirimSemua = async () => {
    if (!confirm("Kirim pengingat WA ke semua wali yang masih punya tunggakan?")) return;
    setLoading(true); setMsg("");
    try {
      const res = await axios.post(`${API}/pengingat/kirim-semua`, {}, { headers });
      setMsg("✅ " + res.data.message);
    } catch (e) { setMsg("❌ " + (e.response?.data?.message || "Gagal mengirim")); }
    setLoading(false);
    setTimeout(() => setMsg(""), 5000);
  };

  // Kirim pengingat ke 1 santri
  const handleKirimSatu = async (s) => {
    setLoadingId(s.id);
    try {
      const res = await axios.post(`${API}/pengingat/kirim/${s.id}`, {}, { headers });
      setMsg("✅ " + res.data.message);
    } catch (e) { setMsg("❌ " + (e.response?.data?.message || "Gagal mengirim")); }
    setLoadingId(null);
    setTimeout(() => setMsg(""), 4000);
  };

  // Simpan jadwal otomatis
  const handleSimpanJadwal = async () => {
    try {
      const res = await axios.post(`${API}/pengingat/jadwal`, jadwal, { headers });
      setJadwalMsg("✅ " + res.data.message);
    } catch (e) { setJadwalMsg("❌ Gagal menyimpan jadwal"); }
    setTimeout(() => setJadwalMsg(""), 4000);
  };

  const santriTunggakan = santri.filter(s => {
    const sisa = Math.round(Number(s.total_tagihan) - Number(s.sudah_bayar));
    return sisa > 0 && s.no_hp;
  });
  const santriTanpaWA = santri.filter(s => {
    const sisa = Math.round(Number(s.total_tagihan) - Number(s.sudah_bayar));
    return sisa > 0 && !s.no_hp;
  });

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🔔 Pengingat Pembayaran</div>
      {msg && <div style={{ background: msg.includes("✅") ? "#ecfdf5" : "#fef2f2", border: `1px solid ${msg.includes("✅") ? "#a7f3d0" : "#fecaca"}`, borderRadius: 10, padding: "10px 16px", marginBottom: 12, fontSize: 14, color: msg.includes("✅") ? "#065f46" : "#dc2626" }}>{msg}</div>}
{/* CRON JOB */}
      <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>⏰ Jadwal Pengingat Otomatis</div>
        <div style={{ background: "#fffbeb", borderRadius: 10, padding: 12, fontSize: 13, color: "#92400e", border: "1px solid #fde68a" }}>
          ⚠️ <b>Penting:</b> Karena aplikasi di-host di Vercel (serverless), jadwal otomatis tidak bisa berjalan sendiri.<br/>
          Gunakan <b>cron-job.org</b> (gratis) untuk memanggil URL ini setiap bulan:<br/>
          <code style={{ background: "#fef3c7", padding: "4px 8px", borderRadius: 6, fontSize: 12, display: "block", marginTop: 6, wordBreak: "break-all" }}>
            GET https://pesantren-backend.vercel.app/api/admin/cron/pengingat
          </code>
          <button onClick={() => window.open("https://cron-job.org", "_blank")} style={{ marginTop: 8, padding: "6px 14px", background: "#f59e0b", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
            🔗 Buka cron-job.org
          </button>
        </div>
      </div>
      {/* KIRIM SEMUA */}
      <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>📢 Kirim Pengingat ke Semua Wali</div>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
          Akan dikirim ke <b>{santriTunggakan.length}</b> wali yang punya nomor WA dan masih ada tunggakan.
          {santriTanpaWA.length > 0 && <span style={{ color: "#f59e0b" }}> ({santriTanpaWA.length} wali belum punya no WA)</span>}
        </div>
        <button style={{ ...btnGreen, padding: "10px 20px", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }} onClick={handleKirimSemua} disabled={loading || santriTunggakan.length === 0}>
          {loading ? <><Spinner />Mengirim...</> : `📲 Kirim Pengingat ke ${santriTunggakan.length} Wali`}
        </button>
      </div>

      

      {/* DAFTAR PER SANTRI */}
      <div style={{ background: "white", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9", fontWeight: 700, fontSize: 14 }}>
          📋 Kirim Pengingat per Santri ({santriTunggakan.length} santri dengan tunggakan & no WA)
        </div>
        {santri.filter(s => Math.round(Number(s.total_tagihan) - Number(s.sudah_bayar)) > 0).length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "#059669", fontWeight: 600 }}>✅ Semua santri sudah lunas!</div>
        ) : (
          santri
            .filter(s => Math.round(Number(s.total_tagihan) - Number(s.sudah_bayar)) > 0)
            .map(s => {
              const sisa = Math.round(Number(s.total_tagihan) - Number(s.sudah_bayar));
              return (
                <div key={s.id} style={{ padding: "12px 16px", borderBottom: "1px solid #f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{s.nama_siswa}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{s.kelas} · Wali: {s.nama}</div>
                    <div style={{ fontSize: 12, marginTop: 2 }}>
                      {s.no_hp
                        ? <span style={{ color: "#059669" }}>📱 {s.no_hp}</span>
                        : <span style={{ color: "#f59e0b" }}>⚠️ No WA belum diisi</span>}
                    </div>
                    <div style={{ fontSize: 13, color: "#dc2626", fontWeight: 700, marginTop: 2 }}>Tunggakan: {formatRupiah(sisa)}</div>
                  </div>
                 <button
          style={{ ...btnGreen, padding: "7px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 6, opacity: (!s.no_hp || loadingId === s.id) ? 0.5 : 1 }}
          onClick={() => handleKirimSatu(s)}
          disabled={!s.no_hp || loadingId === s.id}
        >
          {loadingId === s.id ? <><Spinner size={13} />Kirim...</> : "📲 Kirim"}
        </button>
                </div>
              );
            })
        )}
        {santriTanpaWA.length > 0 && (
          <div style={{ padding: "10px 16px", background: "#fffbeb", fontSize: 12, color: "#92400e" }}>
            ⚠️ {santriTanpaWA.length} santri tidak bisa dikirim karena belum punya nomor WA: {santriTanpaWA.map(s => s.nama_siswa).join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MANAJEMEN SEMESTER
// ============================================================
function ManajemenSemester({ santri, headers, onRefreshSantri }) {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Form tambah semester baru
  const [showTambah, setShowTambah] = useState(false);
  const [formSem, setFormSem] = useState({ semester: "", keterangan: "" });

  // Edit semester
  const [editSemesterId, setEditSemesterId] = useState(null);
  const [editSemForm, setEditSemForm] = useState({ semester: "", keterangan: "" });

  // Form duplikasi tagihan ke semester baru
  const [showDuplikasi, setShowDuplikasi] = useState(false);
  const [dupForm, setDupForm] = useState({ semesterAsal: "", semesterTujuan: "", resetStatus: true });
  const [previewTagihan, setPreviewTagihan] = useState([]); // tagihan dari semester asal (sample)
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingDup, setLoadingDup] = useState(false);
  const [dupProgress, setDupProgress] = useState({ done: 0, total: 0 });
  // Fitur pilih santri tertentu
  const [pilihanSantri, setPilihanSantri] = useState("semua"); // "semua" | "pilihan"
  const [santriTerpilih, setSantriTerpilih] = useState(new Set());
  const [filterNamaDup, setFilterNamaDup] = useState("");

  const loadSemesters = async (force = false) => {
    if (ManajemenSemester._cache && !force) {
      setSemesters(ManajemenSemester._cache);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${API}/semester`, { headers });
      ManajemenSemester._cache = res.data;
      setSemesters(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadSemesters(); }, []);

  const showMsg = (m, dur = 4000) => { setMsg(m); setTimeout(() => setMsg(""), dur); };

  // ── Tambah semester baru ──
  // Semester di backend bukan tabel tersendiri — diambil dari kolom tagihan.semester
  // "Tambah semester" di sini hanya mendaftarkan nama ke daftar lokal untuk keperluan dropdown & duplikasi
  const handleTambahSemester = () => {
    const nama = formSem.semester.trim();
    if (!nama) { showMsg("❌ Nama semester wajib diisi!"); return; }
    if (semesters.find(s => s.semester === nama)) { showMsg("❌ Semester sudah ada!"); return; }
    setSemesters(prev => [{ semester: nama, jumlah_tagihan: 0, jumlah_santri: 0, total_tagihan: 0 }, ...prev]);
    showMsg("✅ Semester ditambahkan ke daftar!");
    setFormSem({ semester: "", keterangan: "" });
    setShowTambah(false);
  };

  // ── Hapus semester + semua tagihannya ──
  const handleHapusSemester = async (nama) => {
    if (!confirm(
      `Hapus semester "${nama}"?\n\n` +
      `SEMUA tagihan di semester ini akan dihapus beserta riwayat cicilan.\n` +
      `Tindakan ini tidak dapat dibatalkan!`
    )) return;

    setLoading(true);
    try {
      // Ambil semua tagihan di semester ini (dari semua santri)
      const results = await Promise.all(
        santri.map(s =>
          axios.get(`${API}/tagihan/${s.id}`, { headers })
            .then(r => r.data.filter(t => t.semester === nama).map(t => t.id))
            .catch(() => [])
        )
      );
      const tagIds = results.flat();

      if (tagIds.length === 0) {
        // Tidak ada tagihan, hapus dari daftar saja
        setSemesters(prev => prev.filter(s => s.semester !== nama));
        showMsg("✅ Semester dihapus (tidak ada tagihan).");
        setLoading(false);
        return;
      }

      // Hapus semua tagihan satu per satu
      await Promise.all(tagIds.map(id => axios.delete(`${API}/tagihan/${id}`, { headers })));

      setSemesters(prev => prev.filter(s => s.semester !== nama));
      showMsg(`✅ Semester "${nama}" dihapus beserta ${tagIds.length} tagihan.`);
      if (onRefreshSantri) onRefreshSantri();
    } catch (e) {
      showMsg("❌ " + (e.response?.data?.message || "Gagal menghapus semester"));
    }
    setLoading(false);
  };

  // ── Edit semester ──
  const handleStartEditSemester = (s) => {
    setEditSemesterId(s.semester);
    setEditSemForm({ semester: s.semester, keterangan: "" });
  };

  const handleSaveEditSemester = async (namaLama) => {
    if (!editSemForm.semester.trim()) { showMsg("❌ Nama semester tidak boleh kosong!"); return; }
    if (namaLama === editSemForm.semester.trim()) { setEditSemesterId(null); return; }
    try {
      const res = await axios.put(`${API}/semester/rename`, { nama_lama: namaLama, nama_baru: editSemForm.semester.trim() }, { headers });
      showMsg("✅ " + res.data.message + " (" + res.data.jumlah_tagihan + " tagihan diperbarui)");
      setEditSemesterId(null);
      loadSemesters();
      if (onRefreshSantri) onRefreshSantri();
    } catch (e) { showMsg("❌ " + (e.response?.data?.message || "Gagal mengubah semester")); }
  };

  // ── Preview tagihan dari semester asal ──
  const loadPreview = async (semesterAsal) => {
    if (!semesterAsal || santri.length === 0) { setPreviewTagihan([]); return; }
    setLoadingPreview(true);
    try {
      // Ambil tagihan santri pertama sebagai contoh
      const res = await axios.get(`${API}/tagihan/${santri[0].id}`, { headers });
      const filtered = res.data.filter(t => t.semester === semesterAsal);
      setPreviewTagihan(filtered);
    } catch (e) { setPreviewTagihan([]); }
    setLoadingPreview(false);
  };

  useEffect(() => {
    if (dupForm.semesterAsal) loadPreview(dupForm.semesterAsal);
  }, [dupForm.semesterAsal]);

  // ── Duplikasi tagihan ke santri terpilih ──
  const handleDuplikasi = async () => {
    if (!dupForm.semesterAsal) { showMsg("❌ Pilih semester asal!"); return; }
    if (!dupForm.semesterTujuan) { showMsg("❌ Pilih semester tujuan!"); return; }
    if (dupForm.semesterAsal === dupForm.semesterTujuan) { showMsg("❌ Semester asal dan tujuan tidak boleh sama!"); return; }

    const targetSantri = pilihanSantri === "pilihan"
      ? santri.filter(s => santriTerpilih.has(s.id))
      : santri;

    if (targetSantri.length === 0) { showMsg("❌ Pilih minimal 1 santri!"); return; }

    if (!confirm(
      `Duplikasi tagihan dari "${dupForm.semesterAsal}" → "${dupForm.semesterTujuan}" untuk ${targetSantri.length} santri?\n\n` +
      `Jenis tagihan dan jumlah akan sama persis.\nStatus semua tagihan baru: BELUM BAYAR.\n\nLanjutkan?`
    )) return;

    setLoadingDup(true);
    setDupProgress({ done: 0, total: targetSantri.length });
    let berhasil = 0, gagal = 0;

    for (let i = 0; i < targetSantri.length; i++) {
      const s = targetSantri[i];
      try {
        // Ambil tagihan santri ini dari semester asal
        const res = await axios.get(`${API}/tagihan/${s.id}`, { headers });
        const tagihanAsal = res.data.filter(t => t.semester === dupForm.semesterAsal);

        if (tagihanAsal.length > 0) {
          // Cek apakah sudah ada tagihan di semester tujuan untuk santri ini
          const existing = res.data.filter(t => t.semester === dupForm.semesterTujuan);
          if (existing.length > 0) {
            // Skip santri yang sudah punya tagihan di semester tujuan
            gagal++;
          } else {
            // Buat tagihan baru untuk setiap jenis tagihan
            for (const t of tagihanAsal) {
              await axios.post(`${API}/tagihan`, {
                user_id: s.id,
                jenis: t.jenis,
                jumlah: Number(t.jumlah),
                semester: dupForm.semesterTujuan,
                keterangan_semester: t.keterangan_semester || "",
                status: "belum",
                tanggal_bayar: "",
                kirim_notif: false,
              }, { headers });
            }
            berhasil++;
          }
        }
      } catch (e) { gagal++; }
      setDupProgress({ done: i + 1, total: targetSantri.length });
    }

    setLoadingDup(false);
    showMsg(`✅ Selesai! ${berhasil} santri berhasil diduplikasi. ${gagal > 0 ? `⚠️ ${gagal} santri dilewati (sudah ada tagihan/error).` : ""}`, 6000);
    setShowDuplikasi(false);
    if (onRefreshSantri) onRefreshSantri();
  };

  const semesterNames = semesters.map(s => s.semester);

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📅 Manajemen Semester</div>

      {msg && (
        <div style={{ background: msg.includes("✅") ? "#ecfdf5" : "#fef2f2", border: `1px solid ${msg.includes("✅") ? "#a7f3d0" : "#fecaca"}`, borderRadius: 10, padding: "10px 16px", marginBottom: 12, fontSize: 14, color: msg.includes("✅") ? "#065f46" : "#dc2626" }}>
          {msg}
        </div>
      )}

      {/* ── DAFTAR SEMESTER ── */}
      <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>📋 Daftar Semester</div>
          <button style={{ ...btnGreen, padding: "7px 14px", fontSize: 13 }} onClick={() => setShowTambah(!showTambah)}>
            {showTambah ? "❌ Batal" : "➕ Tambah Semester"}
          </button>
        </div>

        {/* Form tambah semester */}
        {showTambah && (
          <div style={{ background: "#f0fdf4", border: "1px solid #a7f3d0", borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: "#065f46" }}>➕ Tambah Semester Baru</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={lStyle}>Nama Semester *</label>
                <input
                  style={iStyle}
                  placeholder="contoh: semester-2-2025"
                  value={formSem.semester}
                  onChange={e => setFormSem({ ...formSem, semester: e.target.value })}
                />
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>Format bebas, contoh: semester-1-2025 atau Ganjil 2025/2026</div>
              </div>
              <div>
                <label style={lStyle}>Keterangan (opsional)</label>
                <input
                  style={iStyle}
                  placeholder="contoh: Semester Ganjil TP 2025/2026"
                  value={formSem.keterangan}
                  onChange={e => setFormSem({ ...formSem, keterangan: e.target.value })}
                />
              </div>
            </div>
            <button style={{ ...btnGreen, padding: "8px 18px" }} onClick={handleTambahSemester}>💾 Simpan Semester</button>
          </div>
        )}

        {loading ? (
          <div style={{ padding: 20, textAlign: "center", color: "#94a3b8" }}>Memuat...</div>
        ) : semesters.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Belum ada semester. Tambahkan semester terlebih dahulu.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {semesters.map((s, i) => (
              <div key={s.id || i} style={{ background: "#f8fafc", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                {editSemesterId === s.semester ? (
                  // ── Form edit inline ──
                  <div style={{ padding: 14 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: "#1e40af" }}>✏️ Edit Semester</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 10 }}>
                      <div>
                        <label style={lStyle}>Nama Semester *</label>
                        <input
                          style={iStyle}
                          value={editSemForm.semester}
                          onChange={e => setEditSemForm({ ...editSemForm, semester: e.target.value })}
                          placeholder="contoh: semester-1-2025"
                        />
                      </div>
                      <div>
                        <label style={lStyle}>Keterangan (opsional)</label>
                        <input
                          style={iStyle}
                          value={editSemForm.keterangan}
                          onChange={e => setEditSemForm({ ...editSemForm, keterangan: e.target.value })}
                          placeholder="contoh: Semester Ganjil 2025/2026"
                        />
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "#f59e0b", background: "#fffbeb", borderRadius: 6, padding: "6px 10px", marginBottom: 10 }}>
                      ℹ️ Mengubah nama semester akan otomatis memperbarui nama semester di <b>semua tagihan</b> yang terkait.
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ ...btnGreen, padding: "7px 16px" }} onClick={() => handleSaveEditSemester(s.semester)}>💾 Simpan</button>
                      <button style={{ ...btnGray, padding: "7px 16px" }} onClick={() => setEditSemesterId(null)}>Batal</button>
                    </div>
                  </div>
                ) : (
                  // ── Tampilan normal ──
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>📅 {s.semester}</div>
                      {s.keterangan && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>📝 {s.keterangan}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ ...btnBlue, padding: "5px 12px", fontSize: 12 }} onClick={() => handleStartEditSemester(s)}>✏️ Edit</button>
                      <button style={{ ...btnRed, padding: "5px 12px", fontSize: 12 }} onClick={() => handleHapusSemester(s.semester)}>🗑️ Hapus</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── DUPLIKASI TAGIHAN ANTAR SEMESTER ── */}
      <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>🔁 Duplikasi Tagihan ke Semester Baru</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Salin jenis & jumlah tagihan dari semester lama ke semua santri sekaligus</div>
          </div>
          <button style={{ ...btnBlue, padding: "7px 14px", fontSize: 13 }} onClick={() => { setShowDuplikasi(!showDuplikasi); if (showDuplikasi) { setPilihanSantri("semua"); setSantriTerpilih(new Set()); setFilterNamaDup(""); } }}>
            {showDuplikasi ? "❌ Tutup" : "🔁 Mulai Duplikasi"}
          </button>
        </div>

        {showDuplikasi && (
          <div>
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: "#1e40af", marginBottom: 12, fontWeight: 600 }}>⚙️ Pengaturan Duplikasi</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={lStyle}>Semester Asal (sumber)</label>
                  <select style={iStyle} value={dupForm.semesterAsal} onChange={e => setDupForm({ ...dupForm, semesterAsal: e.target.value })}>
                    <option value="">-- Pilih semester asal --</option>
                    {semesterNames.map((s, i) => <option key={i} value={s}>{s}</option>)}
                  </select>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>Tagihan dari semester ini akan disalin</div>
                </div>
                <div>
                  <label style={lStyle}>Semester Tujuan (baru)</label>
                  <select style={iStyle} value={dupForm.semesterTujuan} onChange={e => setDupForm({ ...dupForm, semesterTujuan: e.target.value })}>
                    <option value="">-- Pilih semester tujuan --</option>
                    {semesterNames.map((s, i) => <option key={i} value={s}>{s}</option>)}
                  </select>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>Tagihan baru akan dibuat di semester ini</div>
                </div>
              </div>

              {/* Preview tagihan yang akan diduplikasi */}
              {dupForm.semesterAsal && (
                <div style={{ background: "white", borderRadius: 8, padding: 12, marginBottom: 12, border: "1px solid #e5e7eb" }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: "#374151" }}>
                    👁️ Preview Tagihan dari "{dupForm.semesterAsal}" (contoh dari santri pertama):
                  </div>
                  {loadingPreview ? (
                    <div style={{ fontSize: 13, color: "#94a3b8" }}>Memuat preview...</div>
                  ) : previewTagihan.length === 0 ? (
                    <div style={{ fontSize: 13, color: "#f59e0b" }}>⚠️ Tidak ada tagihan di semester ini untuk santri pertama. Pastikan semester asal sudah benar.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {previewTagihan.map((t, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "#f8fafc", borderRadius: 6, fontSize: 13 }}>
                          <span style={{ fontWeight: 600 }}>{t.jenis}</span>
                          <span style={{ color: "#059669", fontWeight: 700 }}>{formatRupiah(t.jumlah)}</span>
                        </div>
                      ))}
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, padding: "6px 10px", background: "#fffbeb", borderRadius: 6 }}>
                        ℹ️ Total <b>{previewTagihan.length} jenis tagihan</b> akan diduplikasi ke semua <b>{santri.length} santri</b>. Status: <b>Belum Bayar</b>.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pilihan target santri */}
              <div style={{ marginBottom: 14 }}>
                <label style={lStyle}>Target Santri</label>
                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <button
                    style={{ ...( pilihanSantri === "semua" ? btnGreen : btnGray), padding: "6px 14px", fontSize: 13 }}
                    onClick={() => { setPilihanSantri("semua"); setSantriTerpilih(new Set()); }}
                  >
                    👥 Semua Santri ({santri.length})
                  </button>
                  <button
                    style={{ ...(pilihanSantri === "pilihan" ? btnBlue : btnGray), padding: "6px 14px", fontSize: 13 }}
                    onClick={() => setPilihanSantri("pilihan")}
                  >
                    ☑️ Pilih Santri Tertentu
                  </button>
                </div>

                {pilihanSantri === "pilihan" && (
                  <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: 12 }}>
                    {/* Search & Select All */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
                      <input
                        style={{ ...iStyle, flex: 1, marginBottom: 0 }}
                        placeholder="🔍 Cari nama santri..."
                        value={filterNamaDup}
                        onChange={e => setFilterNamaDup(e.target.value)}
                      />
                      <button
                        style={{ ...btnBlue, padding: "6px 12px", fontSize: 12, whiteSpace: "nowrap" }}
                        onClick={() => {
                          const filtered = santri.filter(s =>
                            s.nama_siswa?.toLowerCase().includes(filterNamaDup.toLowerCase())
                          );
                          const allSelected = filtered.every(s => santriTerpilih.has(s.id));
                          const next = new Set(santriTerpilih);
                          if (allSelected) {
                            filtered.forEach(s => next.delete(s.id));
                          } else {
                            filtered.forEach(s => next.add(s.id));
                          }
                          setSantriTerpilih(next);
                        }}
                      >
                        {(() => {
                          const filtered = santri.filter(s =>
                            s.nama_siswa?.toLowerCase().includes(filterNamaDup.toLowerCase())
                          );
                          return filtered.every(s => santriTerpilih.has(s.id)) ? "☐ Batal Semua" : "☑️ Pilih Semua";
                        })()}
                      </button>
                    </div>

                    {/* Keterangan jumlah terpilih */}
                    <div style={{ fontSize: 12, color: "#0369a1", marginBottom: 8, fontWeight: 600 }}>
                      ✅ {santriTerpilih.size} santri terpilih dari {santri.length}
                    </div>

                    {/* Daftar santri dengan checkbox */}
                    <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                      {santri
                        .filter(s => s.nama_siswa?.toLowerCase().includes(filterNamaDup.toLowerCase()))
                        .map(s => (
                          <label
                            key={s.id}
                            style={{
                              display: "flex", alignItems: "center", gap: 10, padding: "7px 10px",
                              borderRadius: 7, cursor: "pointer", fontSize: 13,
                              background: santriTerpilih.has(s.id) ? "#eff6ff" : "#f8fafc",
                              border: `1px solid ${santriTerpilih.has(s.id) ? "#bfdbfe" : "#e5e7eb"}`,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={santriTerpilih.has(s.id)}
                              onChange={() => {
                                const next = new Set(santriTerpilih);
                                if (next.has(s.id)) next.delete(s.id);
                                else next.add(s.id);
                                setSantriTerpilih(next);
                              }}
                              style={{ width: 16, height: 16, accentColor: "#3b82f6" }}
                            />
                            <span style={{ fontWeight: santriTerpilih.has(s.id) ? 600 : 400 }}>
                              {s.nama_siswa}
                            </span>
                            {s.kelas && (
                              <span style={{ fontSize: 11, color: "#64748b", marginLeft: "auto" }}>
                                {s.kelas}
                              </span>
                            )}
                          </label>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>

              {/* Progress bar saat proses */}
              {loadingDup && (
                <div style={{ background: "#f0fdf4", borderRadius: 8, padding: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#065f46", marginBottom: 8 }}>
                    ⏳ Memproses... {dupProgress.done}/{dupProgress.total} santri
                  </div>
                  <div style={{ height: 8, background: "#e5e7eb", borderRadius: 999 }}>
                    <div style={{ height: "100%", width: `${dupProgress.total > 0 ? Math.round((dupProgress.done / dupProgress.total) * 100) : 0}%`, background: "#059669", borderRadius: 999, transition: "width 0.3s" }} />
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  style={{
                    ...btnGreen, padding: "10px 20px", fontSize: 14,
                    opacity: (loadingDup || !dupForm.semesterAsal || !dupForm.semesterTujuan || (pilihanSantri === "pilihan" && santriTerpilih.size === 0)) ? 0.6 : 1
                  }}
                  onClick={handleDuplikasi}
                  disabled={loadingDup || !dupForm.semesterAsal || !dupForm.semesterTujuan || (pilihanSantri === "pilihan" && santriTerpilih.size === 0)}
                >
                  {loadingDup
                    ? "⏳ Memproses..."
                    : pilihanSantri === "pilihan"
                      ? `🔁 Duplikasi ke ${santriTerpilih.size} Santri Terpilih`
                      : `🔁 Duplikasi ke Semua ${santri.length} Santri`
                  }
                </button>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  Santri yang sudah punya tagihan di semester tujuan akan dilewati otomatis.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── PANDUAN ── */}
      <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 14, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: "#92400e" }}>📖 Panduan Penggunaan</div>
        <div style={{ fontSize: 13, color: "#78350f", lineHeight: 1.7 }}>
          <div style={{ marginBottom: 6 }}>1️⃣ <b>Tambah Semester Baru</b> — klik "Tambah Semester", isi nama (contoh: <code>semester-2-2025</code>), simpan.</div>
          <div style={{ marginBottom: 6 }}>2️⃣ <b>Duplikasi Tagihan</b> — pilih semester lama sebagai asal, pilih semester baru sebagai tujuan, klik tombol duplikasi. Semua santri akan otomatis mendapat tagihan yang sama (jenis & jumlah identik, status mulai dari "Belum Bayar").</div>
          <div style={{ marginBottom: 6 }}>3️⃣ <b>Setelah duplikasi</b>, pergi ke menu <b>💰 Tagihan</b> untuk mengubah tagihan per santri jika ada yang berbeda.</div>
          <div>4️⃣ <b>Input Bayar</b> bisa langsung dilakukan dari menu <b>🧾 Input Bayar</b>.</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// INPUT PEMBAYARAN UMUM (Non-Tagihan)
// ============================================================
function InputPembayaranUmum({ headers, santri }) {
  const [form, setForm] = useState({
    nama_pembayar: "",
    keperluan: "",
    jumlah: "",
    tanggal: new Date().toISOString().split("T")[0],
    keterangan: "",
    kategori: "umum",
    no_hp: "",
    kirim_notif: true,
  });
  const [searchSantri, setSearchSantri] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [riwayat, setRiwayat] = useState([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(true);
  const [search, setSearch] = useState("");

  const kategoriList = [
    { value: "umum", label: "💳 Umum" },
    { value: "jajan", label: "🍜 Uang Jajan / Nitip" },
    { value: "infaq", label: "🕌 Infaq / Sedekah" },
    { value: "kegiatan", label: "🎒 Kegiatan" },
    { value: "lainnya", label: "📦 Lainnya" },
  ];

  const loadRiwayat = async () => {
    setLoadingRiwayat(true);
    try {
      const res = await axios.get(`${API}/pembayaran-umum`, { headers });
      setRiwayat(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error(e); }
    setLoadingRiwayat(false);
  };

  useEffect(() => { loadRiwayat(); }, []);

  const handleSubmit = async () => {
    if (!form.nama_pembayar || !form.keperluan || !form.jumlah) {
      setMsg("❌ Nama, keperluan, dan jumlah wajib diisi!"); return;
    }
    setLoading(true); setMsg("");
    try {
      await axios.post(`${API}/pembayaran-umum`, { ...form, kirim_notif: form.kirim_notif }, { headers });
      setMsg("✅ Pembayaran berhasil dicatat!");
      setForm({ nama_pembayar: "", keperluan: "", jumlah: "", tanggal: new Date().toISOString().split("T")[0], keterangan: "", kategori: "umum" });
      loadRiwayat();
    } catch (e) {
      setMsg("❌ " + (e.response?.data?.message || "Gagal menyimpan"));
    }
    setLoading(false);
    setTimeout(() => setMsg(""), 4000);
  };

  const handleHapus = async (id) => {
    if (!confirm("Hapus data ini?")) return;
    try {
      await axios.delete(`${API}/pembayaran-umum/${id}`, { headers });
      setRiwayat(prev => prev.filter(r => r.id !== id));
    } catch (e) { alert("Gagal hapus: " + (e.response?.data?.message || e.message)); }
  };

  const filtered = riwayat.filter(r =>
    (r.nama_pembayar || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.keperluan || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.kategori || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalFiltered = filtered.reduce((s, r) => s + Number(r.jumlah || 0), 0);

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>💳 Input Pembayaran Umum</div>
      {msg && <div style={{ background: msg.includes("✅") ? "#ecfdf5" : "#fef2f2", border: `1px solid ${msg.includes("✅") ? "#a7f3d0" : "#fecaca"}`, borderRadius: 10, padding: "10px 16px", marginBottom: 12, fontSize: 14, color: msg.includes("✅") ? "#065f46" : "#dc2626" }}>{msg}</div>}

      {/* FORM INPUT */}
      <div style={{ background: "white", borderRadius: 14, padding: 20, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>✍️ Catat Pembayaran Baru</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <div>
            <label style={lStyle}>Kategori</label>
            <select style={iStyle} value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })}>
              {kategoriList.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
            </select>
          </div>
          <div style={{ position: "relative" }}>
            <label style={lStyle}>Nama Pembayar * (pilih dari santri)</label>
            <input style={iStyle} placeholder="Cari nama santri..." value={searchSantri}
              onChange={e => { setSearchSantri(e.target.value); setShowDropdown(true); setForm({ ...form, nama_pembayar: e.target.value, no_hp: "" }); }}
              onFocus={() => setShowDropdown(true)} />
            {showDropdown && searchSantri && (
              <div style={{ position: "absolute", zIndex: 100, background: "white", border: "1px solid #e5e7eb", borderRadius: 8, width: "100%", maxHeight: 180, overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                {(santri || []).filter(s => s.nama_siswa.toLowerCase().includes(searchSantri.toLowerCase())).length === 0
                  ? <div style={{ padding: "10px 14px", fontSize: 13, color: "#94a3b8" }}>Tidak ditemukan</div>
                  : (santri || []).filter(s => s.nama_siswa.toLowerCase().includes(searchSantri.toLowerCase())).map(s => (
                    <div key={s.id} onClick={() => { setForm({ ...form, nama_pembayar: s.nama_siswa, no_hp: s.no_hp || "" }); setSearchSantri(s.nama_siswa); setShowDropdown(false); }}
                      style={{ padding: "9px 14px", cursor: "pointer", borderBottom: "1px solid #f1f5f9", fontSize: 13 }}
                      onMouseOver={e => e.currentTarget.style.background = "#f0fdf4"}
                      onMouseOut={e => e.currentTarget.style.background = "white"}>
                      <div style={{ fontWeight: 600 }}>{s.nama_siswa}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{s.kelas} · {s.no_hp ? `📱 ${s.no_hp}` : "⚠️ Tidak ada WA"}</div>
                    </div>
                  ))
                }
              </div>
            )}
            {form.no_hp && <div style={{ fontSize: 11, color: "#059669", marginTop: 4 }}>📱 {form.no_hp}</div>}
            {form.nama_pembayar && !form.no_hp && <div style={{ fontSize: 11, color: "#f59e0b", marginTop: 4 }}>⚠️ Santri ini tidak punya nomor WA</div>}
          </div>
          <div>
            <label style={lStyle}>Keperluan / Jenis Pembayaran *</label>
            <input style={iStyle} placeholder="contoh: Uang Jajan Minggu Ini" value={form.keperluan} onChange={e => setForm({ ...form, keperluan: e.target.value })} />
          </div>
          <div>
            <label style={lStyle}>Jumlah (Rp) *</label>
            <input style={iStyle} type="number" placeholder="contoh: 50000" value={form.jumlah} onChange={e => setForm({ ...form, jumlah: e.target.value })} />
          </div>
          <div>
            <label style={lStyle}>Tanggal</label>
            <input style={iStyle} type="date" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={lStyle}>Keterangan (opsional)</label>
            <input style={iStyle} placeholder="Catatan tambahan..." value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} />
          </div>
        </div>
        <div style={{ marginTop: 12, padding: "10px 14px", background: form.kirim_notif ? "#f0fdf4" : "#f8fafc", borderRadius: 10, border: `1px solid ${form.kirim_notif ? "#a7f3d0" : "#e5e7eb"}` }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, fontWeight: 600, color: form.kirim_notif ? "#065f46" : "#64748b" }}>
            <input type="checkbox" checked={form.kirim_notif} onChange={e => setForm({ ...form, kirim_notif: e.target.checked })} style={{ width: 18, height: 18, cursor: "pointer" }} />
            📲 Kirim notifikasi WhatsApp ke pembayar
          </label>
          <div style={{ fontSize: 12, marginTop: 4, marginLeft: 28, color: form.kirim_notif ? "#059669" : "#94a3b8" }}>
            {form.kirim_notif
              ? form.no_hp ? `✅ Akan dikirim ke ${form.no_hp}` : "⚠️ Santri tidak punya nomor WA, notif tidak akan terkirim"
              : "❌ Notifikasi tidak akan dikirim"}
          </div>
        </div>
        <button style={{ ...btnGreen, width: "100%", marginTop: 14, padding: 13, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={handleSubmit} disabled={loading}>
          {loading ? <><Spinner />Menyimpan...</> : "💾 Simpan Pembayaran"}
        </button>
      </div>

      {/* RIWAYAT */}
      <div style={{ background: "white", borderRadius: 14, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontWeight: 700 }}>📋 Riwayat Pembayaran Umum</div>
          <button onClick={loadRiwayat} style={{ background: "#059669", color: "white", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>🔄 Refresh</button>
        </div>
        <input placeholder="Cari nama / keperluan / kategori..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, boxSizing: "border-box", marginBottom: 10 }} />
        <div style={{ background: "#e8f5e9", borderRadius: 8, padding: "8px 14px", marginBottom: 12, fontWeight: 600, fontSize: 13 }}>
          💰 Total: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(totalFiltered)} — {filtered.length} transaksi
        </div>
        {loadingRiwayat ? <div style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>Memuat...</div> : filtered.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>Belum ada data</div>
        ) : filtered.map((r, i) => (
          <div key={r.id} style={{ padding: "12px 0", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{r.nama_pembayar}</span>
                <span style={{ background: "#f1f5f9", borderRadius: 6, padding: "2px 8px", fontSize: 11, color: "#475569" }}>
                  {kategoriList.find(k => k.value === r.kategori)?.label || r.kategori}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "#374151", marginTop: 2 }}>{r.keperluan}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                {r.tanggal ? new Date(r.tanggal).toLocaleDateString("id-ID") : "-"}
                {r.keterangan ? ` · ${r.keterangan}` : ""}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <span style={{ fontWeight: 700, color: "#059669", fontSize: 14 }}>
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(r.jumlah)}
              </span>
              <button onClick={() => handleHapus(r.id)} style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "5px 10px", fontSize: 12, color: "#dc2626", cursor: "pointer", fontWeight: 600 }}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// LOADING BAR & SPINNER
// ============================================================
function LoadingBar({ loading }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let interval;
    if (loading) {
      setVisible(true);
      setProgress(0);
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 85) { clearInterval(interval); return 85; }
          return p + Math.random() * 15;
        });
      }, 200);
    } else {
      setProgress(100);
      const t = setTimeout(() => { setVisible(false); setProgress(0); }, 400);
      return () => clearTimeout(t);
    }
    return () => clearInterval(interval);
  }, [loading]);

  if (!visible) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 9999, height: 3 }}>
      <div style={{
        height: "100%", background: "linear-gradient(90deg, #059669, #34d399)",
        width: `${progress}%`, transition: progress === 100 ? "width 0.3s ease" : "width 0.2s ease",
        boxShadow: "0 0 8px #059669"
      }} />
    </div>
  );
}

function Spinner({ size = 16, color = "white" }) {
  return (
    <>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        border: `2px solid rgba(255,255,255,0.25)`,
        borderTop: `2px solid ${color}`,
        animation: "spin 0.7s linear infinite",
        flexShrink: 0
      }} />
      <style dangerouslySetInnerHTML={{ __html: `@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}` }} />
    </>
  );
}

// ============================================================
// STYLES
// ============================================================
const iStyle = { width: "100%", border: "2px solid #e5e7eb", borderRadius: 8, padding: "12px 12px", fontSize: 16, outline: "none", boxSizing: "border-box" };
const lStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 };
const btnGreen = { background: "#059669", color: "white", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 44 };
const btnBlue = { background: "#3b82f6", color: "white", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 44 };
const btnRed = { background: "#ef4444", color: "white", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 44 };
const btnGray = { background: "#6b7280", color: "white", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 44 };
// ============================================================
// RIWAYAT PEMBAYARAN
// ============================================================
function RiwayatPembayaran({ headers }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tanggalDari, setTanggalDari] = useState("");
  const [tanggalSampai, setTanggalSampai] = useState("");
  const [modeHapus, setModeHapus] = useState(false);
  const [dipilih, setDipilih] = useState([]);

  useEffect(() => {
    // Pakai cache kalau data sudah ada
    if (RiwayatPembayaran._cache) {
      setData(RiwayatPembayaran._cache);
      setLoading(false);
      return;
    }
    axios.get(`${API}/riwayat-pembayaran`, { headers })
      .then(r => {
        const result = Array.isArray(r.data) ? r.data : [];
        RiwayatPembayaran._cache = result;
        setData(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = data.filter(r => {
    const cocokSearch =
      (r.nama_siswa || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.nama_wali || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.jenis_tagihan || "").toLowerCase().includes(search.toLowerCase());
    const tgl = r.tanggal_bayar ? new Date(r.tanggal_bayar) : null;
    const cocokDari = tanggalDari ? tgl && tgl >= new Date(tanggalDari) : true;
    const cocokSampai = tanggalSampai ? tgl && tgl <= new Date(tanggalSampai + "T23:59:59") : true;
    return cocokSearch && cocokDari && cocokSampai;
  });

  const totalBayar = filtered.reduce((s, r) => s + Number(r.jumlah_bayar || 0), 0);

  const togglePilih = (id) => setDipilih(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const pilihSemua = () => setDipilih(filtered.map(r => r.id));
  const batalPilih = () => { setDipilih([]); setModeHapus(false); };

  const handleHapusTerpilih = async () => {
    if (dipilih.length === 0) return;
    if (!confirm(`Hapus ${dipilih.length} data pembayaran yang dipilih? Tindakan tidak bisa dibatalkan!`)) return;
    try {
      await Promise.all(dipilih.map(id => axios.delete(`${API}/pembayaran/${id}`, { headers })));
      RiwayatPembayaran._cache = null;
      setData(prev => prev.filter(r => !dipilih.includes(r.id)));
      setDipilih([]);
      setModeHapus(false);
    } catch (e) { alert("Gagal hapus: " + (e.response?.data?.message || e.message)); }
  };

  const handleHapus = async (id) => {
    if (!confirm("Hapus data pembayaran ini? Tindakan tidak bisa dibatalkan!")) return;
    try {
      await axios.delete(`${API}/pembayaran/${id}`, { headers });
      RiwayatPembayaran._cache = null;
      setData(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      alert("Gagal hapus: " + (e.response?.data?.message || e.message));
    }
  };

  const handleHapusSemua = async () => {
    if (!confirm(`Hapus SEMUA ${filtered.length} data pembayaran yang tampil? Tindakan ini tidak bisa dibatalkan!`)) return;
    try {
      await axios.delete(`${API}/pembayaran/hapus-semua`, { headers });
      RiwayatPembayaran._cache = null;
      setData([]);
    } catch (e) {
      alert("Gagal hapus: " + (e.response?.data?.message || e.message));
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
  <h2 style={{ fontSize: 18, fontWeight: 700 }}>📜 Riwayat Pembayaran</h2>
  <div style={{ display: "flex", gap: 8 }}>
  <div style={{ display: "flex", gap: 8 }}>
    <button onClick={() => {
      RiwayatPembayaran._cache = null;
      setLoading(true);
      axios.get(`${API}/riwayat-pembayaran`, { headers })
        .then(r => {
          const result = Array.isArray(r.data) ? r.data : [];
          RiwayatPembayaran._cache = result;
          setData(result);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }} style={{ background: "#059669", color: "white", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
      🔄 Refresh
    </button>
    <button onClick={() => { setModeHapus(!modeHapus); setDipilih([]); }}
      style={{ background: modeHapus ? "#6b7280" : "#ef4444", color: "white", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
      {modeHapus ? "❌ Batal" : "🗑️ Hapus Pilihan"}
    </button>
  </div>
    <button onClick={handleHapusSemua} style={{ background: "#ef4444", color: "white", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
      🗑️ Hapus Semua
    </button>
  </div>
</div>
      <input
        placeholder="Cari nama santri / jenis tagihan..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", width: "100%", marginBottom: 10, fontSize: 14, boxSizing: "border-box" }}
      />
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ fontSize: 13, color: "#64748b" }}>📅 Dari:</div>
        <input type="date" value={tanggalDari} onChange={e => setTanggalDari(e.target.value)}
          style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13 }} />
        <div style={{ fontSize: 13, color: "#64748b" }}>s/d</div>
        <input type="date" value={tanggalSampai} onChange={e => setTanggalSampai(e.target.value)}
          style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13 }} />
        {(tanggalDari || tanggalSampai) && (
          <button onClick={() => { setTanggalDari(""); setTanggalSampai(""); }}
            style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "7px 12px", fontSize: 12, color: "#dc2626", cursor: "pointer", fontWeight: 600 }}>
            ✕ Reset
          </button>
        )}
      </div>
      <div style={{ background: "#e8f5e9", borderRadius: 10, padding: "10px 16px", marginBottom: 12, fontWeight: 600, fontSize: 14 }}>
        💰 Total Terbayar: {formatRupiah(totalBayar)} — {filtered.length} transaksi
      </div>
      {modeHapus && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: "#dc2626", fontWeight: 600 }}>🗑️ Mode Hapus — {dipilih.length} dipilih</span>
          <button onClick={pilihSemua} style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 6, padding: "5px 12px", fontSize: 12, color: "#dc2626", cursor: "pointer", fontWeight: 600 }}>☑️ Pilih Semua</button>
          <button onClick={batalPilih} style={{ background: "#f1f5f9", border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 12px", fontSize: 12, color: "#64748b", cursor: "pointer", fontWeight: 600 }}>☐ Batal Semua</button>
          <button onClick={handleHapusTerpilih} disabled={dipilih.length === 0}
            style={{ background: dipilih.length === 0 ? "#e5e7eb" : "#ef4444", color: dipilih.length === 0 ? "#94a3b8" : "white", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: dipilih.length === 0 ? "not-allowed" : "pointer" }}>
            🗑️ Hapus {dipilih.length} Data
          </button>
        </div>
      )}
      {loading ? <p>Memuat data...</p> : (
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 600 }}>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 24, color: "#94a3b8" }}>Belum ada data pembayaran</td></tr>
              )}
              {filtered.map((r, i) => (
                <tr key={r.id} onClick={() => modeHapus && togglePilih(r.id)}
                  style={{ background: modeHapus && dipilih.includes(r.id) ? "#fef2f2" : i % 2 === 0 ? "#fff" : "#f8fafc", cursor: modeHapus ? "pointer" : "default" }}>
                  {modeHapus && (
                    <td style={{ padding: "9px 12px", borderBottom: "1px solid #f1f5f9" }}>
                      <input type="checkbox" checked={dipilih.includes(r.id)} onChange={() => togglePilih(r.id)} style={{ width: 15, height: 15, accentColor: "#ef4444" }} />
                    </td>
                  )}
                  <td style={{ padding: "9px 12px", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>
                    {r.tanggal_bayar ? new Date(r.tanggal_bayar).toLocaleDateString("id-ID") : "-"}
                  </td>
                  <td style={{ padding: "9px 12px", borderBottom: "1px solid #f1f5f9" }}>{r.nama_siswa}</td>
                  <td style={{ padding: "9px 12px", borderBottom: "1px solid #f1f5f9" }}>{r.kelas}</td>
                  <td style={{ padding: "9px 12px", borderBottom: "1px solid #f1f5f9" }}>{r.jenis_tagihan}</td>
                  <td style={{ padding: "9px 12px", borderBottom: "1px solid #f1f5f9", color: "#16a34a", fontWeight: 600, whiteSpace: "nowrap" }}>
                    {formatRupiah(r.jumlah_bayar)}
                  </td>
                  <td style={{ padding: "9px 12px", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>
                    {formatRupiah(r.total_tagihan)}
                  </td>
                  <td style={{ padding: "9px 12px", borderBottom: "1px solid #f1f5f9", color: "#64748b" }}>{r.keterangan || "-"}</td>
                  <td style={{ padding: "9px 12px", borderBottom: "1px solid #f1f5f9" }}>
                    <button onClick={() => handleHapus(r.id)} style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "4px 10px", fontSize: 12, color: "#dc2626", cursor: "pointer", fontWeight: 600 }}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================
// RIWAYAT NOTIFIKASI WA
// ============================================================
function RiwayatNotif({ headers }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [resending, setResending] = useState({});

  const load = (force = false) => {
    if (RiwayatNotif._cache && !force) {
      setData(RiwayatNotif._cache);
      setLoading(false);
      return;
    }
    setLoading(true);
    axios.get(`${API}/riwayat-wa`, { headers })
      .then(r => {
        const result = Array.isArray(r.data) ? r.data : [];
        RiwayatNotif._cache = result;
        setData(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const resendWA = async (id) => {
    setResending(prev => ({ ...prev, [id]: true }));
    try {
      await axios.post(`${API}/resend-wa/${id}`, {}, { headers });
      RiwayatNotif._cache = null;
      load(true);
    } catch (e) {
      alert("Gagal kirim ulang: " + (e.response?.data?.message || e.message));
    } finally {
      setResending(prev => ({ ...prev, [id]: false }));
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = data.filter(r =>
    (r.nama_siswa || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.nama_wali || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.jenis || "").toLowerCase().includes(search.toLowerCase())
  );

  const labelJenis = (j) => ({
    tagihan_baru: "📋 Tagihan Baru",
    tagihan_lunas: "✅ Lunas Manual",
    pembayaran_lunas: "✅ Bayar Lunas",
    pembayaran_cicilan: "💰 Cicilan",
    pengingat_otomatis: "🔔 Pengingat Otomatis",
    pengingat_manual: "🔔 Pengingat Manual",
  }[j] || j || "-");

  return (
    <div>
      <h2 style={{ marginBottom: 12, fontSize: 18, fontWeight: 700 }}>📨 Riwayat Notifikasi WhatsApp</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Cari nama santri / jenis notif..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
        />
        <button onClick={load} style={{ padding: "8px 16px", borderRadius: 8, background: "#0ea5e9", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
          🔄 Refresh
        </button>
        <button onClick={async () => {
          if (!confirm("Hapus semua riwayat notifikasi WA? Tindakan ini tidak bisa dibatalkan!")) return;
          try {
            await axios.delete(`${API}/riwayat-wa`, { headers });
            load();
          } catch(e) { alert("Gagal hapus: " + (e.response?.data?.message || e.message)); }
        }} style={{ padding: "8px 16px", borderRadius: 8, background: "#ef4444", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
          🗑️ Hapus Semua
        </button>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <div style={{ background: "#dcfce7", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600 }}>
          ✅ Terkirim: {filtered.filter(r => r.status === "terkirim").length}
        </div>
        <div style={{ background: "#fee2e2", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600 }}>
          ❌ Gagal: {filtered.filter(r => r.status === "gagal").length}
        </div>
        <div style={{ background: "#f1f5f9", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600 }}>
          📊 Total: {filtered.length}
        </div>
      </div>
      {loading ? <p>Memuat data...</p> : (
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 600 }}>
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                {["Waktu","Nama Santri","No WA","Jenis","Status","Pesan"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 24, color: "#94a3b8" }}>Belum ada log notifikasi</td></tr>
              )}
              {filtered.map((r, i) => (
                <tr key={r.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                  <td style={{ padding: "9px 12px", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap", fontSize: 12 }}>
                    {r.created_at ? new Date(r.created_at).toLocaleString("id-ID") : "-"}
                  </td>
                  <td style={{ padding: "9px 12px", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ fontWeight: 600 }}>{r.nama_siswa}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{r.nama_wali}</div>
                  </td>
                  <td style={{ padding: "9px 12px", borderBottom: "1px solid #f1f5f9", fontSize: 12 }}>{r.no_hp}</td>
                  <td style={{ padding: "9px 12px", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>{labelJenis(r.jenis)}</td>
                  <td style={{ padding: "9px 12px", borderBottom: "1px solid #f1f5f9", textAlign: "center" }}>
                    <span style={{
                      background: r.status === "terkirim" ? "#dcfce7" : "#fee2e2",
                      color: r.status === "terkirim" ? "#16a34a" : "#dc2626",
                      borderRadius: 12, padding: "3px 10px", fontSize: 11, fontWeight: 600
                    }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: "9px 12px", borderBottom: "1px solid #f1f5f9" }}>
                    <details>
                      <summary style={{ cursor: "pointer", color: "#0ea5e9", fontSize: 12 }}>Lihat pesan</summary>
                      <pre style={{ marginTop: 6, fontSize: 11, whiteSpace: "pre-wrap", background: "#f8fafc", padding: 8, borderRadius: 6, maxWidth: 300 }}>
                        {r.pesan}
                      </pre>
                    </details>
                    {r.status === "gagal" && (
                      <button
                        onClick={() => resendWA(r.id)}
                        disabled={resending[r.id]}
                        style={{
                          marginTop: 6, display: "block",
                          padding: "4px 10px", borderRadius: 6,
                          background: resending[r.id] ? "#e2e8f0" : "#f59e0b",
                          color: resending[r.id] ? "#94a3b8" : "#fff",
                          border: "none", cursor: resending[r.id] ? "not-allowed" : "pointer",
                          fontSize: 11, fontWeight: 600
                        }}
                      >
                        {resending[r.id] ? "⏳ Mengirim..." : "🔁 Kirim Ulang"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
// ============================================================
// KOMPONEN PENGUMUMAN & BROADCAST
// ============================================================
function Pengumuman({ santri, headers }) {
  const [form, setForm] = useState({
    judul: "",
    pesan: "",
    target: "semua", // "semua" | "pilihan"
    kirim_grup: false,
    grup_id: "",
  });
  const [selectedSantri, setSelectedSantri] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [riwayat, setRiwayat] = useState([]);

  const loadRiwayat = async () => {
    try {
      const res = await axios.get(`${API}/pengumuman`, { headers });
      setRiwayat(res.data || []);
    } catch(e) { console.error(e); }
  };

  useEffect(() => { loadRiwayat(); }, []);

  const toggleSantri = (id) => setSelectedSantri(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleKirim = async () => {
    if (!form.pesan) { setMsg("❌ Isi pesan wajib diisi!"); return; }
    if (form.target === "pilihan" && selectedSantri.length === 0) { setMsg("❌ Pilih minimal 1 santri!"); return; }
    setLoading(true); setMsg("");

    try {
      // Jika ada file PDF, convert ke base64
      let fileBase64 = null;
      let fileName = null;
      if (file) {
        fileBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(",")[1]);
          reader.readAsDataURL(file);
        });
        fileName = file.name;
      }

      const targets = form.target === "semua"
        ? santri.filter(s => s.no_hp).map(s => s.id)
        : selectedSantri;

      const res = await axios.post(`${API}/pengumuman/kirim`, {
        judul: form.judul,
        pesan: form.pesan,
        target_ids: targets,
        file_base64: fileBase64,
        file_name: fileName,
        grup_id: form.kirim_grup ? form.grup_id : null,
      }, { headers });

      setMsg("✅ " + res.data.message);
      setForm({ judul: "", pesan: "", target: "semua" });
      setFile(null);
      setSelectedSantri([]);
      loadRiwayat();
    } catch(e) {
      setMsg("❌ " + (e.response?.data?.message || "Gagal mengirim"));
    }
    setLoading(false);
    setTimeout(() => setMsg(""), 5000);
  };

  const santriDenganWA = santri.filter(s => s.no_hp);

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📣 Pengumuman & Broadcast WA</div>
      {msg && <div style={{ background: msg.includes("✅") ? "#ecfdf5" : "#fef2f2", border: `1px solid ${msg.includes("✅") ? "#a7f3d0" : "#fecaca"}`, borderRadius: 10, padding: "10px 16px", marginBottom: 12, fontSize: 14, color: msg.includes("✅") ? "#065f46" : "#dc2626" }}>{msg}</div>}

      {/* FORM PENGUMUMAN */}
      <div style={{ background: "white", borderRadius: 14, padding: 20, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>✍️ Buat Pengumuman Baru</div>

        <div style={{ marginBottom: 12 }}>
          <label style={lStyle}>Judul (opsional)</label>
          <input style={iStyle} placeholder="contoh: Pengumuman Libur Pondok" value={form.judul} onChange={e => setForm({...form, judul: e.target.value})} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={lStyle}>Isi Pesan *</label>
          <textarea
            style={{ ...iStyle, minHeight: 120, resize: "vertical" }}
            placeholder="Tulis pesan pengumuman di sini..."
            value={form.pesan}
            onChange={e => setForm({...form, pesan: e.target.value})}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={lStyle}>Lampiran PDF (opsional)</label>
          <input
            type="file"
            accept=".pdf"
            style={{ display: "block", marginTop: 6, fontSize: 13 }}
            onChange={e => setFile(e.target.files[0] || null)}
          />
          {file && <div style={{ marginTop: 6, fontSize: 12, color: "#059669" }}>📄 {file.name} ({(file.size/1024).toFixed(1)} KB)</div>}
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>⚠️ PDF akan dikirim sebagai dokumen via WhatsApp</div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={lStyle}>Kirim ke:</label>
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "8px 14px", borderRadius: 8, border: `2px solid ${form.target === "semua" ? "#059669" : "#e5e7eb"}`, background: form.target === "semua" ? "#f0fdf4" : "white" }}>
              <input type="radio" value="semua" checked={form.target === "semua"} onChange={() => setForm({...form, target: "semua"})} />
              <span style={{ fontWeight: 600, fontSize: 13 }}>Semua Wali ({santriDenganWA.length} orang)</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "8px 14px", borderRadius: 8, border: `2px solid ${form.target === "pilihan" ? "#059669" : "#e5e7eb"}`, background: form.target === "pilihan" ? "#f0fdf4" : "white" }}>
              <input type="radio" value="pilihan" checked={form.target === "pilihan"} onChange={() => setForm({...form, target: "pilihan"})} />
              <span style={{ fontWeight: 600, fontSize: 13 }}>Pilih Santri</span>
            </label>
          </div>

          {/* Kirim ke Grup WA */}
          <div style={{ marginTop: 10 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "8px 14px", borderRadius: 8, border: `2px solid ${form.kirim_grup ? "#059669" : "#e5e7eb"}`, background: form.kirim_grup ? "#f0fdf4" : "white", width: "fit-content" }}>
              <input type="checkbox" checked={form.kirim_grup} onChange={e => setForm({...form, kirim_grup: e.target.checked})} />
              <span style={{ fontWeight: 600, fontSize: 13 }}>📢 Juga kirim ke Grup WA</span>
            </label>
            {form.kirim_grup && (
              <div style={{ marginTop: 8 }}>
                <input
                  placeholder="ID Grup WA (contoh: 1234567890-1234567890@g.us)"
                  value={form.grup_id}
                  onChange={e => setForm({...form, grup_id: e.target.value})}
                  style={{ width: "100%", border: "2px solid #e5e7eb", borderRadius: 10, padding: "10px 14px", fontSize: 14, boxSizing: "border-box" }}
                />
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Dapatkan ID grup dari dashboard Fonnte → Device → Get Group</div>
              </div>
            )}
          </div>
        </div>

        {form.target === "pilihan" && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={lStyle}>Pilih Penerima:</label>
              <button style={btnBlue} onClick={() => setSelectedSantri(selectedSantri.length === santriDenganWA.length ? [] : santriDenganWA.map(s => s.id))}>
                {selectedSantri.length === santriDenganWA.length ? "Batal Semua" : "✅ Pilih Semua"}
              </button>
            </div>
            <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 10, padding: 8 }}>
              {santriDenganWA.map(s => (
                <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px", cursor: "pointer", borderRadius: 6, background: selectedSantri.includes(s.id) ? "#f0fdf4" : "white", marginBottom: 2 }}>
                  <input type="checkbox" checked={selectedSantri.includes(s.id)} onChange={() => toggleSantri(s.id)} />
                  <span style={{ fontSize: 14 }}>{s.nama_siswa} <span style={{ color: "#94a3b8" }}>({s.no_hp})</span></span>
                </label>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{selectedSantri.length} penerima dipilih</div>
          </div>
        )}

        <button
          style={{ ...btnGreen, width: "100%", padding: 13, fontSize: 15, opacity: loading ? 0.7 : 1 }}
          onClick={handleKirim}
          disabled={loading}
        >
          {loading ? <><Spinner />Mengirim...</> : `📲 Kirim Pengumuman ke ${form.target === "semua" ? santriDenganWA.length : selectedSantri.length} Wali`}
        </button>
      </div>

      {/* RIWAYAT PENGUMUMAN */}
      <div style={{ background: "white", borderRadius: 14, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>📋 Riwayat Pengumuman</div>
        {riwayat.length === 0 ? (
          <div style={{ textAlign: "center", color: "#94a3b8", padding: 20, fontSize: 14 }}>Belum ada pengumuman yang dikirim</div>
        ) : riwayat.map((r, i) => (
          <div key={i} style={{ padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{r.judul || "Pengumuman"}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{new Date(r.created_at).toLocaleString("id-ID")} · {r.terkirim} penerima</div>
                <div style={{ fontSize: 13, color: "#374151", marginTop: 4, maxHeight: 60, overflow: "hidden" }}>{r.pesan}</div>
              </div>
              <span style={{ background: "#dcfce7", color: "#16a34a", borderRadius: 12, padding: "3px 10px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>✅ Terkirim</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Admin() {
  const [admin, setAdmin] = useState(() => {
    const token = localStorage.getItem("adminToken");
    const saved = localStorage.getItem("adminUser");
    if (token && saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  const handleLogin = (adminData) => {
    localStorage.setItem("adminUser", JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setAdmin(null);
  };

  return admin
    ? <AdminDashboard admin={admin} onLogout={handleLogout} />
    : <AdminLogin onLogin={handleLogin} />;
}
