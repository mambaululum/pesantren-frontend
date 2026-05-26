import { useState, useEffect } from "react";
import axios from "axios";

const API = "https://pesantren-backend.vercel.app/api/admin";
const formatRupiah = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n || 0);

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
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #064e3b, #065f46)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ background: "white", borderRadius: 20, padding: 40, width: "100%", maxWidth: 400, boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}>
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
          <input style={iStyle} type="text" placeholder="Username admin" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
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
        <button style={{ width: "100%", background: "linear-gradient(135deg, #065f46, #059669)", color: "white", border: "none", borderRadius: 10, padding: 14, fontSize: 16, fontWeight: 600, cursor: "pointer" }} onClick={handleLogin} disabled={loading}>
          {loading ? "Memuat..." : "Masuk sebagai Admin"}
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
  const [santri, setSantri] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}` };

  const loadSantri = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/santri`, { headers });
      setSantri(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadSantri(); }, []);

  const handleLogout = () => { localStorage.removeItem("adminToken"); onLogout(); };

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
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "system-ui,sans-serif" }}>
      <header style={{ background: "linear-gradient(135deg, #064e3b, #065f46)", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/Mu.jpg" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>Dashboard Admin</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>PP. Muhammadiyah Mambaul Ulum</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "white", fontSize: 13 }}>👤 {admin.nama}</span>
          <button style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: "6px 14px", color: "white", cursor: "pointer", fontSize: 13 }} onClick={handleLogout}>Keluar</button>
        </div>
      </header>

      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "0 24px", display: "flex", gap: 4, overflowX: "auto" }}>
        {menus.map(m => (
          <button key={m.key} onClick={() => setMenu(m.key)} style={{ padding: "14px 14px", border: "none", background: "none", borderBottom: menu === m.key ? "3px solid #059669" : "3px solid transparent", color: menu === m.key ? "#059669" : "#64748b", fontWeight: menu === m.key ? 700 : 500, cursor: "pointer", fontSize: 12, whiteSpace: "nowrap" }}>
            {m.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px 16px" }}>
        {menu === "rekap" && (
          <RekapKeuangan
            santri={santri}
            loading={loading}
            totalTagihan={totalTagihan}
            totalTerbayar={totalTerbayar}
            totalTunggakan={totalTunggakan}
            santriLunas={santriLunas}
            headers={headers}
          />
        )}
        {menu === "santri" && <DataSantri santri={santri} headers={headers} onRefresh={loadSantri} />}
        {menu === "tagihan" && <DataTagihan santri={santri} headers={headers} onRefreshSantri={loadSantri} />}
        {menu === "cicilan" && <InputCicilan santri={santri} headers={headers} />}
        {menu === "tambah_santri" && <TambahSantri headers={headers} onRefresh={() => { loadSantri(); setMenu("santri"); }} />}
        {menu === "pengingat" && <Pengingat santri={santri} headers={headers} />}
        {menu === "semester" && <ManajemenSemester santri={santri} headers={headers} onRefreshSantri={loadSantri} />}
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
// Konversi gambar URL ke base64 agar html2canvas bisa render
const toBase64 = (url) => new Promise((resolve) => {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext("2d").drawImage(img, 0, 0);
    resolve(c.toDataURL("image/png"));
  };
  img.onerror = () => resolve(null);
  img.src = url + "?t=" + Date.now();
});

function HeaderLaporan({ subtitle, logoBase64 }) {
  return (
    <div style={{ background: "linear-gradient(135deg, #064e3b, #065f46)", borderRadius: 12, padding: "14px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", background: "rgba(255,255,255,0.15)", flexShrink: 0 }}>
        {logoBase64
          ? <img src={logoBase64} style={{ width: 44, height: 44, objectFit: "cover", display: "block" }} />
          : <div style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🕌</div>
        }
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


function RekapKeuangan({ santri, loading, totalTagihan, totalTerbayar, totalTunggakan, santriLunas, headers }) {
  const [tab, setTab] = useState("semua"); // "semua" | "persantri"
  const [exporting, setExporting] = useState(false);
  const [logoBase64, setLogoBase64] = useState(null);

  useEffect(() => {
    toBase64("/Mu.jpg").then(b64 => { if (b64) setLogoBase64(b64); });
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
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>📊 Rekap Keuangan</div>

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
            <HeaderLaporan subtitle="Laporan Keuangan Keseluruhan" logoBase64={logoBase64} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 16 }}>
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
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16, alignItems: "start" }}>
          {/* Panel kiri: pilih santri */}
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
                  <HeaderLaporan subtitle={`Rekap Keuangan Santri`} logoBase64={logoBase64} />

                  {/* Identitas santri */}
                  <div style={{ background: "white", borderRadius: 12, padding: 16, marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
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
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
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
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0, borderBottom: t.riwayat?.length > 0 ? "1px solid #f1f5f9" : "none" }}>
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

  const handleSelectTagihan = (t) => {
    setSelectedTagihan(t);
    setEditCicilan(null);
    loadRiwayat(t.id);
  };

  const totalSudahBayar = riwayatBayar.reduce((a, b) => a + Number(b.jumlah_bayar), 0);
  const sisaTagihan = selectedTagihan ? Number(selectedTagihan.jumlah) - totalSudahBayar : 0;

  // Langkah 1: klik Simpan → jika ada kelebihan, tampilkan form konfirmasi dulu
  const handleBayar = () => {
    if (!selectedTagihan || !form.jumlah_bayar) { setMsg("❌ Pilih tagihan dan isi jumlah bayar!"); return; }
    const jumlahInput = Number(form.jumlah_bayar);
    const kelebihan = jumlahInput - sisaTagihan;

    if (kelebihan > 0) {
      // Ada kelebihan → tampilkan panel konfirmasi untuk edit keterangan
      const defaultKet = `Bayar ${formatRupiah(jumlahInput)} | Tagihan lunas. Kelebihan ${formatRupiah(kelebihan)} untuk uang jajan${form.keterangan ? ` (${form.keterangan})` : ""}`;
      setPendingBayar({ jumlahInput, jumlahBayar: sisaTagihan, kelebihan });
      setKeteranganLebih(defaultKet);
      setKirimWALebih(true);
      setShowKonfirmasiLebih(true);
    } else {
      handleSimpanBayar(jumlahInput, jumlahInput, 0, form.keterangan, false);
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
      }, { headers });

      // Kirim WA jika ada kelebihan dan admin pilih kirim
      if (kelebihan > 0 && kirimWA && selectedUser?.no_hp) {
        try {
          await axios.post(`${API}/kirim-wa-kelebihan`, {
            no_hp: selectedUser.no_hp,
            nama_wali: selectedUser.nama,
            nama_siswa: selectedUser.nama_siswa,
            jumlah_bayar: jumlahInput,
            jumlah_tagihan: Number(selectedTagihan.jumlah),
            kelebihan,
            keterangan,
          }, { headers });
        } catch (e) { console.log("WA kelebihan gagal:", e.message); }
      }

      if (kelebihan > 0) {
        setMsg(`✅ Tagihan lunas! Kelebihan ${formatRupiah(kelebihan)} dicatat.${kirimWA && selectedUser?.no_hp ? " Notifikasi WA terkirim." : ""}`);
      } else {
        setMsg("✅ " + res.data.message);
      }
      setForm({ jumlah_bayar: "", tanggal_bayar: new Date().toISOString().split("T")[0], keterangan: "" });
      setShowKonfirmasiLebih(false);
      setPendingBayar(null);
      loadTagihan(selectedUser.id);
      loadRiwayat(selectedTagihan.id);
      if (res.data.lunas || kelebihan > 0) setSelectedTagihan(null);
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
      loadTagihan(selectedUser.id);
      loadRiwayat(selectedTagihan.id);
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
      loadTagihan(selectedUser.id);
      loadRiwayat(selectedTagihan.id);
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
          <label style={lStyle}>2. Pilih Tagihan yang Akan Dibayar</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {tagihan.map(t => {
              const isSelected = selectedTagihan?.id === t.id;
              return (
                <div key={t.id} onClick={() => handleSelectTagihan(t)} style={{ padding: "12px 16px", borderRadius: 10, border: `2px solid ${isSelected ? "#059669" : "#e5e7eb"}`, background: isSelected ? "#f0fdf4" : "white", cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{t.jenis}</span>
                  <span style={{ color: "#dc2626", fontWeight: 700 }}>{formatRupiah(t.jumlah)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedTagihan && (
        <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          {/* INFO TAGIHAN */}
          <div style={{ background: "#fffbeb", borderRadius: 10, padding: 12, marginBottom: 14 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{selectedTagihan.jenis}</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
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
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
                <div>
                  <label style={lStyle}>Jumlah Bayar (Rp)</label>
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
                    ✏️ Konfirmasi & Edit Keterangan Kelebihan
                  </div>

                  {/* Ringkasan */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                    {[
                      { label: "Total Dibayar", value: formatRupiah(pendingBayar.jumlahInput), color: "#1e40af" },
                      { label: "Untuk Tagihan", value: formatRupiah(pendingBayar.jumlahBayar), color: "#065f46" },
                      { label: "Kelebihan", value: formatRupiah(pendingBayar.kelebihan), color: "#b45309" },
                    ].map((c, i) => (
                      <div key={i} style={{ background: "white", borderRadius: 8, padding: "8px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>{c.label}</div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: c.color }}>{c.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Edit keterangan */}
                  <div style={{ marginBottom: 12 }}>
                    <label style={lStyle}>📝 Keterangan kelebihan (bisa diedit)</label>
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
                    {`Assalamu'alaikum Bapak/Ibu *${selectedUser.nama}*,\n\n✅ *Konfirmasi Pembayaran*\n━━━━━━━━━━━━━━━━━\nSantri       : *${selectedUser.nama_siswa}*\n━━━━━━━━━━━━━━━━━\n💰 Total Bayar   : *${formatRupiah(pendingBayar.jumlahInput)}*\n✅ Untuk Tagihan : *${formatRupiah(pendingBayar.jumlahBayar)}* (Lunas)\n━━━━━━━━━━━━━━━━━\n🎉 Sisa Uang     : *${formatRupiah(pendingBayar.kelebihan)}*\n📝 Ket           : ${keteranganLebih}\n━━━━━━━━━━━━━━━━━\nJazakumullahu khairan 🙏\n\n_PP. Muhammadiyah Mambaul Ulum_`}
                    </div>
                  )}

                  {/* Tombol aksi */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      style={{ ...btnGreen, flex: 1, padding: 12, fontSize: 14 }}
                      onClick={() => handleSimpanBayar(pendingBayar.jumlahInput, pendingBayar.jumlahBayar, pendingBayar.kelebihan, keteranganLebih, kirimWALebih)}
                      disabled={loading}
                    >
                      {loading ? "Menyimpan..." : `💾 Konfirmasi & Simpan`}
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

  const handleEdit = (s) => { setEditSantri(s.id); setForm({ nama: s.nama, nama_siswa: s.nama_siswa, kelas: s.kelas, password: "", no_hp: s.no_hp || "" }); setShowPass(false); };

  const handleSave = async (id) => {
    try {
      await axios.put(`${API}/santri/${id}`, form, { headers });
      setEditSantri(null); setMsg("✅ Data berhasil diupdate!"); onRefresh();
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div><label style={lStyle}>Nama Wali</label><input style={iStyle} value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} /></div>
                  <div><label style={lStyle}>Nama Santri</label><input style={iStyle} value={form.nama_siswa} onChange={e => setForm({ ...form, nama_siswa: e.target.value })} /></div>
                  <div><label style={lStyle}>Kelas</label><input style={iStyle} value={form.kelas} onChange={e => setForm({ ...form, kelas: e.target.value })} /></div>
                  <div>
                    <label style={lStyle}>📱 No. HP Wali (notif WA)</label>
                    <input style={iStyle} placeholder="contoh: 08123456789" value={form.no_hp || ""} onChange={e => setForm({ ...form, no_hp: e.target.value })} />
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
  const [massalForm, setMassalForm] = useState({ jenis: "", jumlah: "", semester: "", status: "belum" });
  const [massalSantri, setMassalSantri] = useState([]);
  const [massalLoading, setMassalLoading] = useState(false);

  // ── Kelola Tagihan state ──────────────────────────────────
  const [selectedUser, setSelectedUser] = useState(null);
  const [tagihan, setTagihan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
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

  useEffect(() => {
    const loadSemesters = async () => {
      try {
        const semRes = await axios.get(`${API}/semester`, { headers });
        const semObjs = semRes.data;
        const semNames = semObjs.map(s => s.semester);
        setSemesters(semNames);
        if (semNames.length > 0) setSemesterSetting({ aktif: semNames[0], daftar: semNames });
      } catch (e) { console.error(e); }
    };
    loadSemesters();
  }, []);

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
          kirim_notif: massalForm.status === "belum"
        }, { headers });
        berhasil++;
      } catch (e) { gagal++; }
    }
    setMsg(`✅ Tagihan berhasil ditambahkan ke ${berhasil} santri${gagal > 0 ? `, ${gagal} gagal` : ""}!`);
    setMassalLoading(false);
    setShowMassal(false);
    setMassalForm({ jenis: "", jumlah: "", semester: "", status: "belum" });
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
            <div><label style={lStyle}>Semester</label>
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

          <button style={{ ...btnGreen, width: "100%", padding: 12, fontSize: 15 }} onClick={handleTambahMassal} disabled={massalLoading}>
            {massalLoading ? "Menyimpan..." : `💾 Tambah Tagihan ke ${massalSantri.length} Santri`}
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

              <button style={{ ...btnGreen, marginBottom: 12 }} onClick={() => { setShowForm(!showForm); if (!showForm) setForm({ jenis: "", jumlah: "", tanggal_bayar: "", status: "belum", semester: semesterSetting.aktif || "", keterangan_semester: "", kirim_notif: false }); }}>{showForm ? "❌ Batal" : "➕ Tambah Tagihan Baru"}</button>

              {showForm && (
                <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div><label style={lStyle}>Jenis Tagihan</label><input style={iStyle} placeholder="contoh: Syahriyah Juli" value={form.jenis} onChange={e => setForm({ ...form, jenis: e.target.value })} /></div>
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
                        <div key={t.id} style={{ padding: "12px 16px", borderBottom: "1px solid #f8fafc", background: t.status === "lunas" ? "white" : "#fffbeb" }}>
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
      {false && (
        <div>
          {rekapMsg && <div style={{ background: rekapMsg.includes("✅") ? "#ecfdf5" : "#fef2f2", border: `1px solid ${rekapMsg.includes("✅") ? "#a7f3d0" : "#fecaca"}`, borderRadius: 10, padding: "10px 16px", marginBottom: 12, fontSize: 14, color: rekapMsg.includes("✅") ? "#065f46" : "#dc2626" }}>{rekapMsg}</div>}

          {/* TOOLBAR */}
          <div style={{ background: "white", borderRadius: 14, padding: 14, marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input style={{ ...iStyle, maxWidth: 220, padding: "8px 12px", fontSize: 13 }} placeholder="🔍 Cari nama santri..." value={searchRekap} onChange={e => setSearchRekap(e.target.value)} />
            <div style={{ display: "flex", gap: 4 }}>
              {[["semua","Semua"],["lunas","✅ Lunas"],["belum","⏳ Belum"]].map(([v,l]) => (
                <button key={v} onClick={() => setFilterRekap(v)} style={{ padding: "7px 12px", border: "none", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: filterRekap === v ? 700 : 400, background: filterRekap === v ? (v === "lunas" ? "#059669" : v === "belum" ? "#f59e0b" : "#3b82f6") : "#f1f5f9", color: filterRekap === v ? "white" : "#64748b" }}>{l}</button>
              ))}
            </div>
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
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
        <button style={{ ...btnGreen, marginTop: 16, width: "100%", padding: 14, fontSize: 15 }} onClick={handleSubmit} disabled={loading}>
          {loading ? "Menyimpan..." : "✅ Tambah Santri & Buat Akun"}
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

      {/* KIRIM SEMUA */}
      <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>📢 Kirim Pengingat ke Semua Wali</div>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
          Akan dikirim ke <b>{santriTunggakan.length}</b> wali yang punya nomor WA dan masih ada tunggakan.
          {santriTanpaWA.length > 0 && <span style={{ color: "#f59e0b" }}> ({santriTanpaWA.length} wali belum punya no WA)</span>}
        </div>
        <button style={{ ...btnGreen, padding: "10px 20px", fontSize: 14, opacity: loading ? 0.7 : 1 }} onClick={handleKirimSemua} disabled={loading || santriTunggakan.length === 0}>
          {loading ? "⏳ Mengirim..." : `📲 Kirim Pengingat ke ${santriTunggakan.length} Wali`}
        </button>
      </div>

      {/* JADWAL OTOMATIS */}
      <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>⏰ Jadwal Pengingat Otomatis</div>
        {jadwalMsg && <div style={{ background: jadwalMsg.includes("✅") ? "#ecfdf5" : "#fef2f2", border: `1px solid ${jadwalMsg.includes("✅") ? "#a7f3d0" : "#fecaca"}`, borderRadius: 8, padding: "8px 12px", marginBottom: 10, fontSize: 13, color: jadwalMsg.includes("✅") ? "#065f46" : "#dc2626" }}>{jadwalMsg}</div>}

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, padding: 12, background: jadwal.aktif ? "#f0fdf4" : "#f8fafc", borderRadius: 10, border: `1px solid ${jadwal.aktif ? "#a7f3d0" : "#e5e7eb"}` }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
            <input type="checkbox" checked={jadwal.aktif} onChange={e => setJadwal({ ...jadwal, aktif: e.target.checked })} style={{ width: 18, height: 18, cursor: "pointer" }} />
            {jadwal.aktif ? "🟢 Jadwal Aktif" : "⚪ Jadwal Nonaktif"}
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div>
            <label style={lStyle}>Tanggal Pengiriman (tiap bulan)</label>
            <select style={iStyle} value={jadwal.tanggal} onChange={e => setJadwal({ ...jadwal, tanggal: Number(e.target.value) })}>
              {Array.from({ length: 28 }, (_, i) => i + 1).map(t => (
                <option key={t} value={t}>Tanggal {t}</option>
              ))}
            </select>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>Maks tanggal 28 (aman untuk semua bulan)</div>
          </div>
          <div>
            <label style={lStyle}>Jam Pengiriman</label>
            <input style={iStyle} type="time" value={jadwal.jam} onChange={e => setJadwal({ ...jadwal, jam: e.target.value })} />
          </div>
        </div>

        {jadwal.aktif && (
          <div style={{ background: "#fffbeb", borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 13, color: "#92400e" }}>
            ⚡ Pengingat akan otomatis dikirim setiap <b>tanggal {jadwal.tanggal}</b> pukul <b>{jadwal.jam}</b> WIB ke semua wali yang masih punya tunggakan.
          </div>
        )}

        <button style={{ ...btnBlue, padding: "9px 18px" }} onClick={handleSimpanJadwal}>💾 Simpan Jadwal</button>
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
                    style={{ ...btnGreen, padding: "7px 14px", fontSize: 12, opacity: (!s.no_hp || loadingId === s.id) ? 0.5 : 1 }}
                    onClick={() => handleKirimSatu(s)}
                    disabled={!s.no_hp || loadingId === s.id}
                  >
                    {loadingId === s.id ? "⏳" : "📲 Kirim"}
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

  const loadSemesters = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/semester`, { headers });
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

  // ── Duplikasi tagihan ke semua santri ──
  const handleDuplikasi = async () => {
    if (!dupForm.semesterAsal) { showMsg("❌ Pilih semester asal!"); return; }
    if (!dupForm.semesterTujuan) { showMsg("❌ Pilih semester tujuan!"); return; }
    if (dupForm.semesterAsal === dupForm.semesterTujuan) { showMsg("❌ Semester asal dan tujuan tidak boleh sama!"); return; }
    if (!confirm(
      `Duplikasi tagihan dari "${dupForm.semesterAsal}" → "${dupForm.semesterTujuan}" untuk ${santri.length} santri?\n\n` +
      `Jenis tagihan dan jumlah akan sama persis.\nStatus semua tagihan baru: BELUM BAYAR.\n\nLanjutkan?`
    )) return;

    setLoadingDup(true);
    setDupProgress({ done: 0, total: santri.length });
    let berhasil = 0, gagal = 0;

    for (let i = 0; i < santri.length; i++) {
      const s = santri[i];
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
      setDupProgress({ done: i + 1, total: santri.length });
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
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
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
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
          <button style={{ ...btnBlue, padding: "7px 14px", fontSize: 13 }} onClick={() => setShowDuplikasi(!showDuplikasi)}>
            {showDuplikasi ? "❌ Tutup" : "🔁 Mulai Duplikasi"}
          </button>
        </div>

        {showDuplikasi && (
          <div>
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: "#1e40af", marginBottom: 12, fontWeight: 600 }}>⚙️ Pengaturan Duplikasi</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
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
                  style={{ ...btnGreen, padding: "10px 20px", fontSize: 14, opacity: (loadingDup || !dupForm.semesterAsal || !dupForm.semesterTujuan) ? 0.6 : 1 }}
                  onClick={handleDuplikasi}
                  disabled={loadingDup || !dupForm.semesterAsal || !dupForm.semesterTujuan}
                >
                  {loadingDup ? "⏳ Memproses..." : `🔁 Duplikasi ke Semua ${santri.length} Santri`}
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
// STYLES
// ============================================================
const iStyle = { width: "100%", border: "2px solid #e5e7eb", borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" };
const lStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 };
const btnGreen = { background: "#059669", color: "white", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" };
const btnBlue = { background: "#3b82f6", color: "white", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" };
const btnRed = { background: "#ef4444", color: "white", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" };
const btnGray = { background: "#6b7280", color: "white", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" };

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
