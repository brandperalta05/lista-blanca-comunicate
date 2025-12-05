import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Smartphone, Search, PlusCircle, Settings, 
  LayoutDashboard, Save, Edit, Trash2, Printer, 
  Users, BrainCircuit, Loader2, Camera, XCircle, 
  Upload, ScanFace, QrCode, Filter, Calendar, CheckCircle,
  Cloud, CloudOff, AlertTriangle, LogOut, Lock, UserPlus, ShieldCheck,
  FileSpreadsheet, Eye, X, MessageCircle, Copy
} from 'lucide-react';

// --- IMPORTACIONES DE FIREBASE ---
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { 
  getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, 
  onSnapshot, setDoc, serverTimestamp, getDoc 
} from 'firebase/firestore';

// --- CONFIGURACIÓN DE BASE DE DATOS (FIREBASE) ---
const firebaseConfig = {
  apiKey: "AIzaSyA0mqrKFFpgu2dX2TxsB84B48jORGql78Y",
  authDomain: "brand-9189e.firebaseapp.com",
  projectId: "brand-9189e",
  storageBucket: "brand-9189e.firebasestorage.app",
  messagingSenderId: "369141276642",
  appId: "1:369141276642:web:35c9135d255c0da6d763bb"
};

// Detección automática
const isFirebaseConfigured = firebaseConfig.apiKey !== "TU_API_KEY_AQUI";

// Variables globales
let app, auth, db;
if (isFirebaseConfigured) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.error("Error iniciando Firebase:", e);
  }
}

// --- GESTOR DE LIBRERÍAS EXTERNAS ---
const LoadExternalLibs = () => {
  useEffect(() => {
    const loadScript = (src, id) => {
      if (!document.getElementById(id)) {
        const s = document.createElement('script');
        s.src = src; s.id = id; s.async = true;
        document.body.appendChild(s);
      }
    };
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js", "lib-jspdf");
    loadScript("https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js", "lib-qrcode");
    loadScript("https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js", "lib-jsbarcode");
    loadScript("https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js", "lib-jsqr");
    loadScript("https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js", "lib-xlsx");
  }, []);
  return null;
};

// --- API GEMINI ---
const API_KEY = "AIzaSyCwOjbSm8IDBNcAh1O0GtsCPzyfqQxRQ0I"; 

const callGemini = async (prompt, imageBase64 = null) => {
  if (!API_KEY) return "Error: Falta API Key";
  const payload = {
    contents: [{ parts: [{ text: prompt }, ...(imageBase64 ? [{ inlineData: { mimeType: "image/jpeg", data: imageBase64 } }] : [])] }]
  };
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (e) { console.error(e); return "Error IA"; }
};

// --- COMPONENTES UI ---
const Card = ({ children, className = "" }) => <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>{children}</div>;

const Button = ({ children, onClick, variant = "primary", className = "", type="button", disabled=false }) => {
  const vars = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
    magic: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white",
    danger: "bg-red-50 text-red-600 hover:bg-red-100"
  };
  return <button type={type} onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${vars[variant]} ${className}`}>{children}</button>;
};

const InputGroup = ({ label, children }) => (
  <div className="flex flex-col gap-1 w-full">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

// --- LOGIN CON CAPTCHA ---
const LoginView = ({ onLogin, authorizedUsers }) => {
  const [userCode, setUserCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [captchaVal, setCaptchaVal] = useState({ a: Math.floor(Math.random()*10), b: Math.floor(Math.random()*10) });
  const [captchaInput, setCaptchaInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parseInt(captchaInput) !== (captchaVal.a + captchaVal.b)) {
      setError('Captcha incorrecto.');
      setCaptchaVal({ a: Math.floor(Math.random()*10), b: Math.floor(Math.random()*10) });
      setCaptchaInput('');
      return;
    }
    const validUsers = authorizedUsers && authorizedUsers.length > 0 ? authorizedUsers : ['44062206', '60268334'];
    if (validUsers.includes(userCode) && password === userCode) {
      onLogin(userCode);
    } else {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 notranslate">
      <Card className="w-full max-w-md p-8 bg-white shadow-xl border-t-4 border-t-blue-600">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Lock className="text-blue-600" size={32} /></div>
          <h1 className="text-2xl font-bold text-slate-800">Acceso Seguro</h1>
          <p className="text-slate-500 text-sm">REGISTRO COMUNIC@TE</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputGroup label="Usuario"><input type="text" className="w-full p-3 border rounded-lg" placeholder="Ingrese código" value={userCode} onChange={(e) => setUserCode(e.target.value)}/></InputGroup>
          <InputGroup label="Contraseña"><input type="password" className="w-full p-3 border rounded-lg" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}/></InputGroup>
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1"><ShieldCheck size={14}/> CAPTCHA</label>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-lg font-mono bg-white px-3 py-1 border rounded">{captchaVal.a} + {captchaVal.b} = ?</span>
              <input type="number" className="w-20 p-2 border rounded text-center font-bold" placeholder="Respuesta" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} required/>
            </div>
          </div>
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex gap-2"><AlertTriangle size={16}/> {error}</div>}
          <Button type="submit" variant="primary" className="w-full py-3 mt-2">Ingresar</Button>
        </form>
      </Card>
    </div>
  );
};

// --- APP PRINCIPAL ---
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('comunicate_auth') === 'true');
  const [sessionUser, setSessionUser] = useState(() => localStorage.getItem('comunicate_user') || '');
  const [authorizedUsers, setAuthorizedUsers] = useState(['44062206', '60268334']); 

  const [view, setView] = useState('dashboard');
  const [user, setUser] = useState(null); 
  const [isCloudMode, setIsCloudMode] = useState(false);
  
  const [records, setRecords] = useState([]);
  const [prices, setPrices] = useState({ tienda: 40, pase: 40, externo: 80 });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const [formData, setFormData] = useState(initialFormState());
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ marca: '', operador: '', fecha: '', minPrice: '', maxPrice: '' });
  const [showFilters, setShowFilters] = useState(false);

  const [activeScanMode, setActiveScanMode] = useState(null);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [scanResult, setScanResult] = useState(null); 
  const [newUserCode, setNewUserCode] = useState('');
  
  const [selectedRecord, setSelectedRecord] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const verifyTimerRef = useRef(null);
  const inactivityTimerRef = useRef(null); // Referencia para el temporizador de inactividad

  useEffect(() => { document.title = "REGISTROS COMUNIC@TE"; }, []);

  // --- LÓGICA DE CIERRE DE SESIÓN POR INACTIVIDAD (10 MINUTOS) ---
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    // 10 minutos * 60 segundos * 1000 milisegundos = 600000 ms
    inactivityTimerRef.current = setTimeout(() => {
      if (isAuthenticated) {
        handleLogout(true); // Cerrar sesión forzosamente
        showNotify("Sesión cerrada por inactividad (10 min).", "warning");
      }
    }, 600000); 
  };

  const handleUserActivity = () => {
    resetInactivityTimer();
  };

  // Escuchar la actividad del usuario en todo el documento
  useEffect(() => {
    if (isAuthenticated) {
      window.addEventListener('mousemove', handleUserActivity);
      window.addEventListener('touchstart', handleUserActivity); // Para dispositivos táctiles
      window.addEventListener('scroll', handleUserActivity);
      resetInactivityTimer(); // Iniciar el temporizador al cargar la sesión
    }
    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
    };
  }, [isAuthenticated]);


  // --- CALCULOS ---
  const filteredRecords = useMemo(() => {
    if (!records) return [];
    return records.filter(r => {
      const basic = (r.imei||'').includes(searchTerm) || (r.dni||'').includes(searchTerm) || (r.clienteNombre||'').toLowerCase().includes(searchTerm.toLowerCase());
      const fMarca = !filters.marca || (r.marca||'').toLowerCase().includes(filters.marca.toLowerCase());
      const fOp = !filters.operador || r.operador === filters.operador;
      const fDate = !filters.fecha || r.fecha === filters.fecha;
      const fMin = !filters.minPrice || r.precio >= parseFloat(filters.minPrice);
      const fMax = !filters.maxPrice || r.precio <= parseFloat(filters.maxPrice);
      return basic && fMarca && fOp && fDate && fMin && fMax;
    });
  }, [records, searchTerm, filters]);

  // --- FUNCIONES ---
  const loadLocalData = () => {
    setIsCloudMode(false);
    setRecords(JSON.parse(localStorage.getItem('comunicate_records') || '[]'));
    setPrices(JSON.parse(localStorage.getItem('comunicate_prices') || '{"tienda": 40, "pase": 40, "externo": 80}'));
    setLoading(false);
  };

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      setIsCloudMode(true);
      const initAuth = async () => {
        try {
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
             try { await signInWithCustomToken(auth, __initial_auth_token); } 
             catch (e) { await signInAnonymously(auth); }
          } else { await signInAnonymously(auth); }
        } catch (error) { setIsCloudMode(false); loadLocalData(); }
      };
      initAuth();

      const unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
        if (u) {
          const unsubRec = onSnapshot(collection(db, 'registros_publicos'), (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            data.sort((a, b) => new Date(b.createdAt || b.fecha) - new Date(a.createdAt || a.fecha));
            setRecords(data);
            setLoading(false);
          }, () => { setIsCloudMode(false); loadLocalData(); });
          
          const unsubPrices = onSnapshot(doc(db, 'settings', 'precios'), (docSnap) => {
            if (docSnap.exists()) setPrices(docSnap.data());
          });

          const unsubUsers = onSnapshot(doc(db, 'settings', 'usuarios'), (docSnap) => {
            if (docSnap.exists() && docSnap.data().lista) setAuthorizedUsers(docSnap.data().lista);
            else setDoc(doc(db, 'settings', 'usuarios'), { lista: ['44062206', '60268334'] });
          });
          return () => { unsubRec(); unsubPrices(); unsubUsers(); };
        } else if(!loading) loadLocalData();
      });
      return () => unsubscribe();
    } else { loadLocalData(); }
  }, []);

  useEffect(() => {
    if (!isCloudMode) {
      localStorage.setItem('comunicate_records', JSON.stringify(records));
      localStorage.setItem('comunicate_prices', JSON.stringify(prices));
    }
  }, [records, prices, isCloudMode]);

  function initialFormState() {
    return {
      id: '', operacion: '', marca: '', modelo: '', nombreComercial: '',
      imei: '', dni: '', clienteNombre: '', celular: '', correo: '', // Correo agregado nuevamente
      numeroReferencial: '',
      fecha: new Date().toISOString().split('T')[0], 
      estado: 'REGISTRADO', metodo: 'Claro', operador: 'Claro', precio: 0, tipo: 'TIENDA',
      esBloqueado: 'No'
    };
  }

  const generateOperationId = () => {
    const maxId = records.reduce((max, r) => {
      const num = parseInt(r.operacion?.split('-')[1] || 0);
      return num > max ? num : max;
    }, 0);
    return `RECO-${String(maxId + 1).padStart(5, '0')}`;
  };

  const handleLogin = (userCode) => {
    setIsAuthenticated(true);
    setSessionUser(userCode);
    localStorage.setItem('comunicate_auth', 'true');
    localStorage.setItem('comunicate_user', userCode);
    resetInactivityTimer(); // Iniciar temporizador al loguearse
  };

  const handleLogout = (force = false) => {
    if(force || confirm("¿Cerrar sesión?")) {
      setIsAuthenticated(false);
      setSessionUser('');
      localStorage.removeItem('comunicate_auth');
      localStorage.removeItem('comunicate_user');
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      showNotify("Sesión cerrada.", "warning");
    }
  };

  const handleAddUser = async () => {
    if (!newUserCode) return;
    const newList = [...authorizedUsers, newUserCode];
    if (isCloudMode && user) await setDoc(doc(db, 'settings', 'usuarios'), { lista: newList });
    else setAuthorizedUsers(newList);
    setNewUserCode(''); showNotify(`Usuario agregado`);
  };

  const handleRemoveUser = async (code) => {
    if (code === '44062206') return alert("No eliminar Admin");
    const newList = authorizedUsers.filter(u => u !== code);
    if (isCloudMode && user) await setDoc(doc(db, 'settings', 'usuarios'), { lista: newList });
    else setAuthorizedUsers(newList);
    showNotify(`Usuario eliminado`);
  };

  const showNotify = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSave = async () => {
    if (!formData.imei) return showNotify("Falta el IMEI", "error");
    setLoading(true);

    const newOp = !formData.operacion ? generateOperationId() : formData.operacion;
    
    const finalData = { ...formData };
    if (!finalData.numeroReferencial) {
      finalData.numeroReferencial = finalData.celular;
    }

    const recordToSave = { 
      ...finalData, 
      operacion: newOp,
      createdAt: new Date().toISOString()
    };
    if (!recordToSave.id) delete recordToSave.id;

    try {
      if (isCloudMode && user) {
        if (isEditing && formData.id) await updateDoc(doc(db, 'registros_publicos', formData.id), recordToSave);
        else await addDoc(collection(db, 'registros_publicos'), recordToSave);
      } else {
        if (isEditing) setRecords(records.map(r => r.id === formData.id ? recordToSave : r));
        else setRecords([{ ...recordToSave, id: Date.now().toString() }, ...records]);
      }
      showNotify("Guardado con éxito");
      setView('dashboard');
      setFormData(initialFormState());
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      showNotify("Error al guardar", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Borrar registro?")) return;
    if (isCloudMode && user) await deleteDoc(doc(db, 'registros_publicos', id));
    else {
      const newRecs = records.filter(r => r.id !== id);
      setRecords(newRecs);
      localStorage.setItem('comunicate_records', JSON.stringify(newRecs));
    }
    showNotify("Eliminado");
  };

  const handleUpdatePrice = async (key, val) => {
    const newPrices = { ...prices, [key]: parseFloat(val) };
    if (isCloudMode && user) await setDoc(doc(db, 'settings', 'precios'), newPrices);
    else setPrices(newPrices);
  };

  const handleExportExcel = () => {
    if (!window.XLSX) return alert("Cargando librería Excel... intente en unos segundos.");
    
    const dataToExport = records.map(r => ({
      "Operación": r.operacion,
      "Fecha": r.fecha,
      "IMEI": r.imei,
      "Marca": r.marca,
      "Modelo": r.modelo,
      "Nombre Comercial": r.nombreComercial,
      "Precio (S/.)": r.precio,
      "Estado": r.estado,
      "Cliente": r.clienteNombre,
      "DNI": r.dni,
      "Celular": r.celular,
      "Correo": r.correo, // Exportar Correo
      "Num. Ref.": r.numeroReferencial, 
      "Método": r.metodo,
      "Bloqueado": r.esBloqueado,
      "Operador": r.operador,
      "Tipo": r.tipo
    }));

    const ws = window.XLSX.utils.json_to_sheet(dataToExport);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Registros");
    
    const wscols = [
      {wch:12}, {wch:12}, {wch:18}, {wch:15}, {wch:15}, {wch:20}, {wch:10}, {wch:15}, {wch:25}, {wch:12}, {wch:12}, {wch:20}, {wch:12}
    ];
    ws['!cols'] = wscols;

    window.XLSX.writeFile(wb, `Reporte_Comunicate_${new Date().toISOString().slice(0,10)}.xlsx`);
    showNotify("Excel descargado correctamente");
  };

  const openWhatsApp = (record) => {
    const hour = new Date().getHours();
    let greeting = "Buenas noches";
    if (hour >= 5 && hour < 12) greeting = "Buenos días";
    else if (hour >= 12 && hour < 18) greeting = "Buenas tardes";

    const message = `${greeting} Sr(a). ${record.clienteNombre}, su dispositivo ${record.nombreComercial}, con IMEI N° ${record.imei} ya se encuentra registrado a osiptel :)`;
    
    const phone = record.numeroReferencial || record.celular;
    const cleanPhone = phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('9') && cleanPhone.length === 9 ? `51${cleanPhone}` : cleanPhone;

    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // --- FUNCIÓN COPIAR DATOS (MEJORADA) ---
  const handleCopyData = (record) => {
    const textToCopy = 
`IMEI: ${record.imei}
MODELO: ${record.modelo}
NOMBRE COMERCIAL: ${record.nombreComercial}
DNI: ${record.dni}
CELULAR: ${record.celular}
NOMBRE CLIENTE: ${record.clienteNombre}
CORREO ELECTRONICO: ${record.correo || '-'}`;

    // MÉTODO ROBUSTO DE COPIADO
    const textarea = document.createElement('textarea');
    textarea.value = textToCopy;
    textarea.style.position = 'fixed'; // Para que no altere el scroll
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    try {
      document.execCommand('copy');
      showNotify("Datos copiados al portapapeles");
    } catch (err) {
      showNotify("Error al copiar (Intente manualmente)", "error");
    }
    
    document.body.removeChild(textarea);
  };

  // --- ESCÁNER Y IA ---
  const scanForQR = () => {
    if (!videoRef.current || !canvasRef.current || activeScanMode !== 'verify') return;
    const video = videoRef.current;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      if (window.jsQR) {
        let code = window.jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
        if(!code) code = window.jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "invert" });
        if (code && code.data.startsWith('COMUNIC@TE')) {
          const parts = code.data.split('|');
          setScanResult({ valid: true, op: parts[1], imei: parts[2], dni: parts[3] });
          stopCamera(); return;
        }
      }
    }
    verifyTimerRef.current = requestAnimationFrame(scanForQR);
  };

  const startCamera = async (mode) => {
    setActiveScanMode(mode); setScanResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        if (mode === 'verify') videoRef.current.onloadedmetadata = () => { videoRef.current.play(); requestAnimationFrame(scanForQR); };
      }
    } catch (err) { alert("Error cámara"); setActiveScanMode(null); }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    if (verifyTimerRef.current) cancelAnimationFrame(verifyTimerRef.current);
    setActiveScanMode(null);
  };

  const captureImageForAI = () => {
    const video = videoRef.current; const canvas = canvasRef.current;
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.9).split(',')[1]; 
    stopCamera(); analyzeImageWithAI(base64, activeScanMode);
  };

  const analyzeImageWithAI = async (base64, mode) => {
    setIsAutoFilling(true);
    let prompt = "";
    if (mode === 'box') prompt = `Analiza etiqueta caja celular. Extrae: IMEI (15 digitos), Marca, Modelo Tecnico, Nombre Comercial (SOLO NOMBRE, SIN GB/RAM). JSON: {"imei": "...", "marca": "...", "modelo": "...", "nombreComercial": "..."}`;
    if (mode === 'dni') prompt = `Analiza DNI Peru. JSON: {"dni": "8digitos", "nombre": "Nombres Completos"}`;
    
    const res = await callGemini(prompt, base64);
    const jsonMatch = res.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      if (mode === 'box') setFormData(prev => ({ ...prev, ...data }));
      if (mode === 'dni') setFormData(prev => ({ ...prev, dni: data.dni, clienteNombre: data.nombre }));
    } else { showNotify("No se detectaron datos", "error"); }
    setIsAutoFilling(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    const mode = fileInputRef.current.getAttribute('data-mode');
    reader.onloadend = () => analyzeImageWithAI(reader.result.split(',')[1], mode);
    reader.readAsDataURL(file); e.target.value = '';
  };

  const generatePDF = async (record) => {
    if (record.estado !== 'REGISTRADO') return showNotify("Solo imprimible si está REGISTRADO", "error");
    const doc = new window.jspdf.jsPDF();
    const qrData = `COMUNIC@TE|${record.operacion}|${record.imei}|${record.dni}|VALIDADO`;
    const qrUrl = await window.QRCode.toDataURL(qrData, { margin: 2, scale: 8, errorCorrectionLevel: 'M' });
    const cvs = document.createElement('canvas');
    window.JsBarcode(cvs, record.operacion, { format: "CODE128", displayValue: true });
    
    doc.setFillColor(37, 99, 235); doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255); doc.setFontSize(16); doc.text("CONSTANCIA DE REGISTRO", 105, 12, null, null, "center");
    doc.setFontSize(10); doc.text("LISTA BLANCA COMUNIC@TE", 105, 22, null, null, "center");
    doc.setTextColor(0); doc.text(`Fecha: ${record.fecha}`, 160, 40);

    const startY = 50; const lh = 7;
    doc.setFont(undefined, 'bold'); doc.text("DATOS CLIENTE", 20, startY); doc.line(20, startY+1, 190, startY+1);
    doc.setFont(undefined, 'normal'); doc.text(`Nombre: ${record.clienteNombre}`, 20, startY+lh*2); doc.text(`DNI: ${record.dni}`, 20, startY+lh*3);
    
    const eqY = startY + lh*5;
    doc.setFont(undefined, 'bold'); doc.text("DATOS EQUIPO", 20, eqY); doc.line(20, eqY+1, 190, eqY+1);
    doc.setFont(undefined, 'normal'); doc.text(`Equipo: ${record.nombreComercial}`, 20, eqY+lh*2); doc.text(`IMEI: ${record.imei}`, 20, eqY+lh*3);

    const decY = 220;
    doc.setFontSize(9);
    const decl = `Yo, ${record.clienteNombre || '_______________'}, identificado(a) con DNI N° ${record.dni}, en calidad de titular del equipo terminal móvil identificado con IMEI N° ${record.imei}, estoy conforme con el registro de mi dispositivo a la lista blanca de OPSITEL.`;
    doc.text(doc.splitTextToSize(decl, 170), 20, decY);

    if (qrUrl) doc.addImage(qrUrl, 'PNG', 20, decY+15, 40, 40);
    doc.addImage(cvs.toDataURL("image/png"), 'PNG', 120, decY+15, 70, 20);
    doc.setFontSize(14); doc.setFont(undefined, 'bold'); doc.text(`Total: S/ ${record.precio}.00`, 105, decY+55, null, null, "center");
    doc.save(`${record.operacion}.pdf`);
  };

  if (!isAuthenticated) return <LoginView onLogin={handleLogin} authorizedUsers={authorizedUsers} />;

  // --- RENDERIZADO ---
  const renderCameraModal = () => (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden relative">
        <div className="p-3 bg-slate-900 text-white flex justify-between items-center">
          <h3 className="font-bold">{activeScanMode==='verify'?'Escanear QR Documento':'Escanear Datos'}</h3>
          <button onClick={stopCamera}><XCircle/></button>
        </div>
        {scanResult ? (
          <div className="p-8 text-center bg-green-50 animate-in zoom-in duration-300">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4"/>
            <h3 className="text-xl font-bold">¡Auténtico!</h3>
            <div className="mt-4 text-left bg-white p-4 rounded border text-sm shadow-sm">
              <p className="font-bold text-blue-600">{scanResult.op}</p>
              <p>IMEI: {scanResult.imei}</p>
              <p>DNI: {scanResult.dni}</p>
            </div>
            <Button onClick={stopCamera} className="mt-6 w-full">Cerrar</Button>
          </div>
        ) : (
          <div className="relative bg-black aspect-video flex justify-center">
            <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover"/>
            <canvas ref={canvasRef} className="hidden"/>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className={`w-64 h-64 border-4 border-green-500 rounded-xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]`}></div>
            </div>
            {activeScanMode !== 'verify' && <div className="absolute bottom-4 pointer-events-auto"><Button onClick={captureImageForAI} variant="magic">Capturar</Button></div>}
          </div>
        )}
      </div>
    </div>
  );

  const renderDetailModal = () => (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl overflow-hidden shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={() => setSelectedRecord(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-full">
          <X size={24}/>
        </button>
        
        <div className="p-6 bg-slate-50 border-b">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <Smartphone className="text-blue-600"/> {selectedRecord.nombreComercial}
          </h2>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">{selectedRecord.operacion}</span>
            <span className={`px-2 py-1 rounded text-xs font-bold ${selectedRecord.estado==='REGISTRADO'?'bg-green-100 text-green-800':'bg-red-100 text-red-800'}`}>
              {selectedRecord.estado}
            </span>
          </div>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-500 border-b pb-1 mb-2 uppercase text-xs">Detalles del Equipo</h3>
            <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
              <span className="text-slate-500">IMEI:</span> 
              <span className="font-mono bg-slate-100 px-2 py-1 rounded select-all">{selectedRecord.imei}</span>
              
              <span className="text-slate-500">Marca:</span> 
              <span className="font-medium">{selectedRecord.marca}</span>
              
              <span className="text-slate-500">Modelo:</span> 
              <span className="font-medium">{selectedRecord.modelo}</span>
              
              <span className="text-slate-500">Operador:</span> 
              <span className="font-medium">{selectedRecord.operador}</span>

              <span className="text-slate-500">Bloqueado:</span> 
              <span className={`font-bold ${selectedRecord.esBloqueado === 'Si' ? 'text-red-600' : 'text-green-600'}`}>{selectedRecord.esBloqueado || 'No'}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-500 border-b pb-1 mb-2 uppercase text-xs">Detalles del Cliente</h3>
            <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
              <span className="text-slate-500">Nombre:</span> 
              <span className="font-medium">{selectedRecord.clienteNombre}</span>
              
              <span className="text-slate-500">DNI:</span> 
              <span className="font-medium">{selectedRecord.dni}</span>
              
              <span className="text-slate-500">Celular:</span> 
              <span className="font-medium">{selectedRecord.celular}</span>
              
              <span className="text-slate-500">Correo:</span> 
              <span className="font-medium">{selectedRecord.correo || '-'}</span>
              
              <span className="text-slate-500">Num. Ref:</span> 
              <div className="flex items-center gap-2">
                  <span className="font-medium">{selectedRecord.numeroReferencial}</span>
                  <button 
                    onClick={() => openWhatsApp(selectedRecord)}
                    className="bg-green-500 text-white p-1 rounded-full hover:bg-green-600 transition-colors"
                    title="Enviar WhatsApp"
                  >
                    <MessageCircle size={16}/>
                  </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg border grid grid-cols-2 md:grid-cols-4 gap-4">
             <div>
                <span className="block text-xs text-slate-500">Fecha Registro</span>
                <span className="font-bold">{selectedRecord.fecha}</span>
             </div>
             <div>
                <span className="block text-xs text-slate-500">Método</span>
                <span className="font-bold">{selectedRecord.metodo}</span>
             </div>
             <div>
                <span className="block text-xs text-slate-500">Tipo</span>
                <span className="font-bold">{selectedRecord.tipo}</span>
             </div>
             <div>
                <span className="block text-xs text-slate-500">Precio Total</span>
                <span className="font-bold text-lg text-emerald-600">S/ {selectedRecord.precio}</span>
             </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t flex overflow-x-auto justify-end gap-2 flex-nowrap">
            <Button onClick={() => handleCopyData(selectedRecord)} variant="secondary" className="bg-gray-200 hover:bg-gray-300 text-gray-700">
               <Copy size={16}/> Copiar Datos
            </Button>
            <Button onClick={() => generatePDF(selectedRecord)} variant="secondary" className="border"><Printer size={16}/> Imprimir Comprobante</Button>
            <Button onClick={() => setSelectedRecord(null)} variant="primary">Cerrar</Button>
        </div>
      </Card>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in pb-20">
      {selectedRecord && renderDetailModal()}
      
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">Panel <span className="text-sm font-normal text-gray-500">({sessionUser})</span></h2>
          <div className={`text-xs mt-1 flex items-center gap-1 ${isCloudMode ? 'text-green-600' : 'text-orange-600'}`}>
            {isCloudMode ? <><Cloud size={12}/> Nube Activa</> : <><CloudOff size={12}/> Modo Local</>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportExcel} variant="success" className="border bg-emerald-600 hover:bg-emerald-700"><FileSpreadsheet size={18}/> Excel</Button>
          <Button onClick={() => startCamera('verify')} variant="secondary" className="border"><QrCode size={18}/> Verificar</Button>
          <Button onClick={() => { setView('form'); setIsEditing(false); setFormData(initialFormState()); }}><PlusCircle size={18}/> Nuevo</Button>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-2 snap-x hide-scrollbar">
        <div className="min-w-[260px] snap-center w-1/2">
          <Card className="p-4 border-l-4 border-blue-500 h-full flex flex-col justify-between">
            <div className="text-gray-500 text-sm font-bold uppercase">Total Equipos</div>
            <div className="text-3xl font-bold text-slate-800">{records.length}</div>
          </Card>
        </div>
        <div className="min-w-[260px] snap-center w-1/2">
          <Card className="p-4 border-l-4 border-emerald-500 h-full flex flex-col justify-between">
            <div className="text-gray-500 text-sm font-bold uppercase">Caja Total</div>
            <div className="text-3xl font-bold text-slate-800">S/ {records.reduce((a,b)=>a+(parseFloat(b.precio)||0),0).toFixed(2)}</div>
          </Card>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border shadow-sm space-y-4">
        <div className="flex gap-2">
          <Search className="text-gray-400 mt-2"/>
          <input className="w-full border-b outline-none p-2" placeholder="Buscar..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>
          <button onClick={()=>setShowFilters(!showFilters)} className="p-2 border rounded"><Filter size={18}/></button>
        </div>
        {showFilters && <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm pt-2 border-t">
          <InputGroup label="Marca"><input className="border p-1 rounded w-full" value={filters.marca} onChange={e=>setFilters({...filters, marca: e.target.value})}/></InputGroup>
          <InputGroup label="Operador"><select className="border p-1 rounded w-full" value={filters.operador} onChange={e=>setFilters({...filters, operador: e.target.value})}><option value="">Todos</option>{['Claro','Movistar','Entel','Bitel'].map(o=><option key={o}>{o}</option>)}</select></InputGroup>
          <InputGroup label="Fecha"><input type="date" className="border p-1 rounded w-full" value={filters.fecha} onChange={e=>setFilters({...filters, fecha: e.target.value})}/></InputGroup>
          <InputGroup label="Max Precio"><input type="number" className="border p-1 rounded w-full" value={filters.maxPrice} onChange={e=>setFilters({...filters, maxPrice: e.target.value})}/></InputGroup>
        </div>}
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400"><span>Cargando...</span></div> : 
         filteredRecords.map(r => (
          <div key={r.id} className="p-4 border-b flex justify-between items-center hover:bg-slate-50">
            <div>
              <div className="font-bold text-slate-800">{r.nombreComercial}</div>
              <div className="text-xs text-gray-500 font-mono">{r.operacion} • {r.dni}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelectedRecord(r)} className="text-blue-600 p-2 hover:bg-blue-50 rounded" title="Ver Detalles"><Eye size={18}/></button>
              <button onClick={() => generatePDF(r)} className="text-slate-500 p-2 hover:bg-slate-100 rounded" title="Imprimir PDF"><Printer size={18}/></button>
              <button onClick={()=>{setFormData(r);setIsEditing(true);setView('form')}} className="text-orange-600 p-2 hover:bg-orange-50 rounded"><Edit size={18}/></button>
              <button onClick={()=>handleDelete(r.id)} className="text-red-600 p-2 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
            </div>
          </div>
        ))}
        {filteredRecords.length === 0 && !loading && <div className="p-8 text-center text-gray-400"><span>No hay registros</span></div>}
      </div>
    </div>
  );

  const renderForm = () => (
    <div className="max-w-5xl mx-auto animate-in fade-in pb-20">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload}/>
      <Card className="p-6 border-t-4 border-t-blue-600">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-bold">{isEditing?'Editar':'Nuevo'}</h2>
          <input type="date" className="border rounded p-1 text-sm" value={formData.fecha} onChange={e=>setFormData({...formData, fecha: e.target.value})}/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold border-b pb-2">Equipo</h3>
            <InputGroup label="IMEI">
              <div className="flex gap-2">
                <input maxLength={15} className="w-full p-2 border rounded font-mono" value={formData.imei} onChange={e=>setFormData({...formData, imei: e.target.value})} placeholder="15 dígitos"/>
                <button onClick={()=>startCamera('box')} className="p-2 bg-indigo-600 text-white rounded"><Camera size={18}/></button>
                <button onClick={()=>{fileInputRef.current.setAttribute('data-mode','box'); fileInputRef.current.click()}} className="p-2 bg-purple-600 text-white rounded"><Upload size={18}/></button>
              </div>
            </InputGroup>
            <InputGroup label="Nombre Comercial"><input className="w-full p-2 border rounded" value={formData.nombreComercial} onChange={e=>setFormData({...formData, nombreComercial: e.target.value})}/></InputGroup>
            <div className="grid grid-cols-2 gap-2">
              <InputGroup label="Marca"><input className="w-full p-2 border rounded" value={formData.marca} onChange={e=>setFormData({...formData, marca: e.target.value})}/></InputGroup>
              <InputGroup label="Modelo"><input className="w-full p-2 border rounded" value={formData.modelo} onChange={e=>setFormData({...formData, modelo: e.target.value})}/></InputGroup>
            </div>
            <InputGroup label="¿Equipo Bloqueado?">
              <select 
                className={`w-full p-2 border rounded font-bold ${formData.esBloqueado === 'Si' ? 'bg-red-50 text-red-700' : 'bg-white'}`}
                value={formData.esBloqueado}
                onChange={e => {
                  const val = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    esBloqueado: val,
                    precio: val === 'Si' ? 130 : (prices[prev.tipo.toLowerCase()] || 40),
                    metodo: val === 'Si' ? 'Smart Unlock' : 'Claro'
                  }));
                }}
              >
                <option value="No">No</option>
                <option value="Si">Si</option>
              </select>
            </InputGroup>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold border-b pb-2">Cliente</h3>
            <InputGroup label="DNI">
              <div className="flex gap-2">
                <input maxLength={8} className="w-full p-2 border rounded" value={formData.dni} onChange={e=>setFormData({...formData, dni: e.target.value})}/>
                <button onClick={()=>startCamera('dni')} className="p-2 bg-blue-600 text-white rounded"><ScanFace size={18}/></button>
                <button onClick={()=>{fileInputRef.current.setAttribute('data-mode','dni'); fileInputRef.current.click()}} className="p-2 bg-sky-500 text-white rounded"><Upload size={18}/></button>
              </div>
            </InputGroup>
            <InputGroup label="Nombre"><input className="w-full p-2 border rounded" value={formData.clienteNombre} onChange={e=>setFormData({...formData, clienteNombre: e.target.value})}/></InputGroup>
            <InputGroup label="Celular"><input maxLength={9} className="w-full p-2 border rounded" value={formData.celular} onChange={e=>setFormData({...formData, celular: e.target.value})}/></InputGroup>
            
            <InputGroup label="Correo">
              <input className="w-full p-2 border rounded" value={formData.correo} onChange={e=>setFormData({...formData, correo: e.target.value})} placeholder="Opcional"/>
            </InputGroup>

            <InputGroup label="Número Referencial">
              <div className="relative">
                <input 
                  maxLength={9} 
                  className="w-full p-2 border rounded bg-green-50" 
                  value={formData.numeroReferencial} 
                  onChange={e=>setFormData({...formData, numeroReferencial: e.target.value})}
                  placeholder="Opcional (Se copia celular si vacío)"
                />
                <MessageCircle className="absolute right-2 top-2 text-green-600" size={18}/>
              </div>
            </InputGroup>
          </div>

          <div className="space-y-4 bg-slate-50 p-4 rounded">
            <InputGroup label="Tipo"><select className="w-full p-2 border rounded" value={formData.tipo} onChange={e=>{const t=e.target.value; setFormData({...formData, tipo:t, precio: formData.esBloqueado === 'Si' ? 130 : (prices[t.toLowerCase()]||0)})}}>{['TIENDA','PASE','EXTERNO'].map(t=><option key={t}>{t}</option>)}</select></InputGroup>
            
            <InputGroup label="Precio">
              <input 
                type="number" 
                className="w-full p-2 border rounded font-bold" 
                value={formData.precio} 
                readOnly={formData.esBloqueado === 'Si'}
                onChange={e=>setFormData({...formData, precio: e.target.value})}
              />
            </InputGroup>

            <InputGroup label="Estado"><select className="w-full p-2 border rounded" value={formData.estado} onChange={e=>setFormData({...formData, estado: e.target.value})}>{['REGISTRADO','NO REGISTRADO','EN PROCESO'].map(s=><option key={s}>{s}</option>)}</select></InputGroup>
            
            <InputGroup label="Método">
              <select 
                className="w-full p-2 border rounded" 
                value={formData.metodo} 
                disabled={formData.esBloqueado === 'Si'}
                onChange={e=>setFormData({...formData, metodo: e.target.value})}
              >
                <option>Claro</option>
                <option>Bitel</option>
                <option>Movistar</option>
                <option>Entel</option>
                <option>Smart Unlock</option>
              </select>
            </InputGroup>

            <InputGroup label="Operador"><select className="w-full p-2 border rounded" value={formData.operador} onChange={e=>setFormData({...formData, operador: e.target.value})}>{['Claro','Bitel','Entel','Movistar'].map(o=><option key={o}>{o}</option>)}</select></InputGroup>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2 border-t pt-4">
          <Button variant="secondary" onClick={()=>setView('dashboard')}>Cancelar</Button>
          <Button variant="success" onClick={handleSave} disabled={loading}>{loading?<Loader2 className="animate-spin"/>:'Guardar'}</Button>
        </div>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <Card className="max-w-xl mx-auto p-8 pb-20">
      <h2 className="text-xl font-bold mb-4">Configuración</h2>
      
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase">Precios Base</h3>
        {Object.entries(prices).map(([k,v])=><div key={k} className="mb-2 uppercase font-bold text-xs flex justify-between items-center">{k} <input type="number" className="border p-1 rounded w-20" value={v} onChange={e=>handleUpdatePrice(k, e.target.value)}/></div>)}
      </div>

      {sessionUser === '44062206' && (
        <div className="border-t pt-4">
          <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase flex items-center gap-2"><Users size={16}/> Gestión de Usuarios</h3>
          <div className="flex gap-2 mb-4">
            <input 
              className="border p-2 rounded flex-1" 
              placeholder="Nuevo código de usuario" 
              value={newUserCode} 
              onChange={e => setNewUserCode(e.target.value)}
            />
            <Button onClick={handleAddUser} variant="magic"><UserPlus size={16}/> Agregar</Button>
          </div>
          <div className="space-y-2">
            {authorizedUsers.map(u => (
              <div key={u} className="flex justify-between items-center p-2 bg-slate-50 rounded border">
                <span>{u} {u === '44062206' && '(Admin)'}</span>
                {u !== '44062206' && (
                  <button onClick={() => handleRemoveUser(u)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={16}/>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20 relative notranslate">
      <LoadExternalLibs />
      {activeScanMode && renderCameraModal()}
      {notification && <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow-lg text-white ${notification.type==='error'?'bg-red-500':'bg-emerald-600'}`}>{notification.msg}</div>}
      <nav className="bg-slate-900 text-white p-4 sticky top-0 z-40 flex justify-between items-center shadow-lg">
        <div className="font-bold flex gap-2 text-lg"><Smartphone className="text-blue-400"/> COMUNIC@TE</div>
        <div className="flex gap-2">
          <button onClick={()=>setView('dashboard')} className={`p-2 rounded hover:bg-slate-800 ${view==='dashboard'?'bg-blue-600':''}`}><LayoutDashboard size={20}/></button>
          <button onClick={()=>setView('settings')} className={`p-2 rounded hover:bg-slate-800 ${view==='settings'?'bg-slate-700':''}`}><Settings size={20}/></button>
          <button onClick={handleLogout} className="p-2 rounded hover:bg-red-600 bg-slate-800"><LogOut size={20}/></button>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {view==='dashboard' && renderDashboard()}
        {view==='form' && renderForm()}
        {view==='settings' && renderSettings()}
      </main>

      {/* PIE DE PÁGINA DISCRETO */}
      <footer className="fixed bottom-0 left-0 w-full bg-slate-100 p-2 border-t text-center text-xs text-slate-500">
        <p>
          <span className="font-bold">v1.0.0</span> &bull; Esta página fue creada por Brand Daniel Peralta Rodriguez
        </p>
        <p>SOPORTE +51 946 007 646 - <a href="mailto:brand050103@gmail.com" className="text-blue-500 hover:underline">brand050103@gmail.com</a></p>
      </footer>
    </div>
  );
}