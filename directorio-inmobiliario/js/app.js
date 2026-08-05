// ============================================================
// DIRECTORIO INMOBILIARIO — Beta
// Semi-cerrado | Admin por empresa | Feed + Directorio + Chat
// ============================================================

const STORAGE_KEY = 'di_beta_v1';

// -------------------- SEED DATA --------------------
const SEED = {
  companies: [
    {
      id: 'c1',
      name: 'CHV Inmobiliaria',
      slug: 'chv-inmobiliaria',
      zone: 'Zona Sur',
      website: 'https://chv.ar',
      phone: '+54 11 4201-0000',
      verified: true
    },
    {
      id: 'c2',
      name: 'Inmo Norte SA',
      slug: 'inmo-norte',
      zone: 'Zona Norte',
      website: 'https://inmonorte.com',
      phone: '+54 11 4733-1122',
      verified: true
    }
  ],
  users: [
    {
      id: 'u1',
      email: 'admin@chv.ar',
      password: '123456',
      name: 'Carlos Hernández',
      role: 'INMOBILIARIA',
      isAdmin: true,
      companyId: 'c1',
      slug: 'carlos-hernandez',
      bio: 'Director de CHV Inmobiliaria. Más de 15 años en el mercado de Zona Sur.',
      phone: '+54 11 5555-1001',
      whatsapp: '+54 9 11 5555-1001',
      location: 'Avellaneda, Buenos Aires',
      specialties: ['venta', 'alquiler', 'comercial'],
      avatar: 'https://ui-avatars.com/api/?name=Carlos+Hernandez&background=0284c7&color=fff&size=128',
      cover: null,
      verified: true,
      enabled: true,
      createdAt: '2025-01-10'
    },
    {
      id: 'u2',
      email: 'maria@chv.ar',
      password: '123456',
      name: 'María López',
      role: 'PROFESIONAL',
      isAdmin: false,
      companyId: 'c1',
      slug: 'maria-lopez',
      bio: 'Corredora matriculada. Especialista en departamentos y PH en Avellaneda y Lanús.',
      phone: '+54 11 5555-1002',
      whatsapp: '+54 9 11 5555-1002',
      location: 'Avellaneda',
      specialties: ['venta', 'alquiler'],
      avatar: 'https://ui-avatars.com/api/?name=Maria+Lopez&background=0ea5e9&color=fff&size=128',
      verified: true,
      enabled: true,
      createdAt: '2025-02-15'
    },
    {
      id: 'u3',
      email: 'juan@inmo.com',
      password: '123456',
      name: 'Juan Pérez',
      role: 'INMOBILIARIA',
      isAdmin: true,
      companyId: 'c2',
      slug: 'juan-perez',
      bio: 'Fundador de Inmo Norte. Especialistas en Zona Norte y Nordelta.',
      phone: '+54 11 5555-2001',
      whatsapp: '+54 9 11 5555-2001',
      location: 'Vicente López',
      specialties: ['venta', 'alquiler', 'emprendimientos'],
      avatar: 'https://ui-avatars.com/api/?name=Juan+Perez&background=0369a1&color=fff&size=128',
      verified: true,
      enabled: true,
      createdAt: '2025-01-20'
    },
    {
      id: 'u4',
      email: 'ana@tasaciones.com',
      password: '123456',
      name: 'Ana Gómez',
      role: 'PROFESIONAL',
      isAdmin: false,
      companyId: null,
      slug: 'ana-gomez',
      bio: 'Tasadora oficial. Perito judicial. Cobertura CABA y GBA.',
      phone: '+54 11 5555-3001',
      whatsapp: '+54 9 11 5555-3001',
      location: 'CABA',
      specialties: ['tasaciones', 'pericias'],
      avatar: 'https://ui-avatars.com/api/?name=Ana+Gomez&background=7c3aed&color=fff&size=128',
      verified: true,
      enabled: true,
      createdAt: '2025-03-01'
    },
    {
      id: 'u5',
      email: 'pedro@constructora.com',
      password: '123456',
      name: 'Pedro Ruiz',
      role: 'COLABORADOR',
      isAdmin: false,
      companyId: null,
      slug: 'pedro-ruiz',
      bio: 'Constructor. Reformas y obra nueva. Trabajo con varias inmobiliarias de Zona Sur.',
      phone: '+54 11 5555-4001',
      whatsapp: '+54 9 11 5555-4001',
      location: 'Zona Sur',
      specialties: ['construccion', 'reformas'],
      avatar: 'https://ui-avatars.com/api/?name=Pedro+Ruiz&background=059669&color=fff&size=128',
      verified: false,
      enabled: true,
      createdAt: '2025-04-10'
    },
    {
      id: 'u6',
      email: 'lucia@chv.ar',
      password: '123456',
      name: 'Lucía Fernández',
      role: 'PROFESIONAL',
      isAdmin: false,
      companyId: 'c1',
      slug: 'lucia-fernandez',
      bio: 'Asesora comercial junior. Enfocada en alquileres temporales.',
      phone: '+54 11 5555-1003',
      whatsapp: '+54 9 11 5555-1003',
      location: 'Avellaneda',
      specialties: ['alquiler'],
      avatar: 'https://ui-avatars.com/api/?name=Lucia+Fernandez&background=db2777&color=fff&size=128',
      verified: false,
      enabled: true,
      createdAt: '2025-06-01'
    }
  ],
  posts: [
    {
      id: 'p1',
      authorId: 'u1',
      type: 'PROPERTY',
      content: '¡Nueva exclusividad! Departamento 3 ambientes en Avellaneda Centro. Excelente estado, luminoso, a 2 cuadras de la estación.',
      property: {
        title: 'Depto 3 amb — Avellaneda Centro',
        price: 185000,
        location: 'Avellaneda, Buenos Aires',
        type: 'venta'
      },
      likes: 12,
      comments: [
        { id: 'c1', userId: 'u3', text: 'Muy buen precio por la zona. ¿Aceptan permuta?', createdAt: '2026-07-28T10:00:00' }
      ],
      createdAt: '2026-07-28T09:30:00'
    },
    {
      id: 'p2',
      authorId: 'u3',
      type: 'OPPORTUNITY',
      content: 'Buscamos partner para desarrollar un emprendimiento de 24 unidades en Vicente López. Terreno ya adquirido. Interesados escribirme.',
      likes: 8,
      comments: [],
      createdAt: '2026-07-27T16:45:00'
    },
    {
      id: 'p3',
      authorId: 'u4',
      type: 'NEWS',
      content: 'Recordatorio: a partir de agosto cambian los requisitos de tasación para créditos UVA. Si necesitan actualización de valores, avísenme.',
      likes: 24,
      comments: [
        { id: 'c2', userId: 'u2', text: 'Gracias Ana! Justo teníamos una tasación pendiente.', createdAt: '2026-07-26T14:20:00' }
      ],
      createdAt: '2026-07-26T11:00:00'
    },
    {
      id: 'p4',
      authorId: 'u2',
      type: 'UPDATE',
      content: 'Cerramos otra operación esta semana 🎉 PH en Lanús Este. Cliente muy contento. Gracias al equipo!',
      likes: 31,
      comments: [],
      createdAt: '2026-07-25T18:10:00'
    },
    {
      id: 'p5',
      authorId: 'u5',
      type: 'OPPORTUNITY',
      content: 'Disponibilidad inmediata para reformas de departamentos a estrenar. Especialistas en terminaciones premium. Cotización en 48hs.',
      likes: 5,
      comments: [],
      createdAt: '2026-07-24T09:00:00'
    }
  ],
  connections: [
    { id: 'conn1', requesterId: 'u1', receiverId: 'u3', status: 'ACCEPTED', createdAt: '2026-06-01' },
    { id: 'conn2', requesterId: 'u1', receiverId: 'u4', status: 'ACCEPTED', createdAt: '2026-06-15' },
    { id: 'conn3', requesterId: 'u2', receiverId: 'u3', status: 'PENDING', createdAt: '2026-07-20' },
    { id: 'conn4', requesterId: 'u5', receiverId: 'u1', status: 'PENDING', createdAt: '2026-07-22' },
    { id: 'conn5', requesterId: 'u3', receiverId: 'u4', status: 'ACCEPTED', createdAt: '2026-05-10' }
  ],
  userNetworks: {}, // userId -> [{ id, name, members: [id,...] }] max 5
  messages: [
    {
      id: 'm1',
      fromId: 'u3',
      toId: 'u1',
      text: 'Hola Carlos, vi el depto de Avellaneda. ¿Todavía está disponible?',
      createdAt: '2026-07-28T11:00:00',
      read: true
    },
    {
      id: 'm2',
      fromId: 'u1',
      toId: 'u3',
      text: 'Sí, sigue disponible. ¿Querés coordinar una visita?',
      createdAt: '2026-07-28T11:15:00',
      read: true
    },
    {
      id: 'm3',
      fromId: 'u3',
      toId: 'u1',
      text: 'Perfecto, el jueves a la tarde me viene bien.',
      createdAt: '2026-07-28T11:20:00',
      read: false
    },
    {
      id: 'm4',
      fromId: 'u4',
      toId: 'u1',
      text: 'Carlos, te paso la nueva grilla de honorarios de tasación.',
      createdAt: '2026-07-27T09:00:00',
      read: true
    }
  ]
};

// -------------------- STATE --------------------
let state = {
  currentUser: null,
  currentView: 'feed',
  activeChatUserId: null,
  data: null
};

// -------------------- STORAGE --------------------
function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Corrupt storage, resetting');
    }
  }
  return JSON.parse(JSON.stringify(SEED));
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
}

function resetDemo() {
  localStorage.removeItem(STORAGE_KEY);
  state.data = loadData();
  toast('Demo reseteada');
  logout();
}

// -------------------- HELPERS --------------------
function uid() {
  return 'id_' + Math.random().toString(36).slice(2, 11);
}

function getUser(id) {
  return state.data.users.find(u => u.id === id);
}

function getCompany(id) {
  return state.data.companies.find(c => c.id === id);
}

function formatDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'ahora';
  if (diff < 3600) return Math.floor(diff / 60) + ' min';
  if (diff < 86400) return Math.floor(diff / 3600) + ' h';
  if (diff < 604800) return Math.floor(diff / 86400) + ' d';
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

function formatPrice(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 2800);
}

function roleLabel(role) {
  const map = {
    INMOBILIARIA: 'Inmobiliaria',
    PROFESIONAL: 'Profesional',
    COLABORADOR: 'Colaborador'
  };
  return map[role] || role;
}

function typeBadge(type) {
  const map = {
    PROPERTY: { label: 'Inmueble', color: 'bg-green-100 text-green-700' },
    OPPORTUNITY: { label: 'Oportunidad', color: 'bg-amber-100 text-amber-700' },
    NEWS: { label: 'Noticia', color: 'bg-blue-100 text-blue-700' },
    UPDATE: { label: 'Update', color: 'bg-slate-100 text-slate-600' }
  };
  const t = map[type] || map.UPDATE;
  return `<span class="text-[10px] font-medium px-2 py-0.5 rounded-full ${t.color}">${t.label}</span>`;
}

// -------------------- AUTH --------------------
function goToAuth() {
  document.getElementById('welcome-screen').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');
  showLogin();
}

function goToDirectorio() {
  // Directorio es semi-cerrado → requiere login
  goToAuth();
}

function backToWelcome() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('welcome-screen').classList.remove('hidden');
  showLogin();
}

function showLogin() {
  document.getElementById('login-box').classList.remove('hidden');
  document.getElementById('register-box').classList.add('hidden');
}

function showRegister() {
  document.getElementById('login-box').classList.add('hidden');
  document.getElementById('register-box').classList.remove('hidden');
}

document.getElementById('reg-type').addEventListener('change', (e) => {
  const fields = document.getElementById('company-fields');
  fields.classList.toggle('hidden', e.target.value !== 'INMOBILIARIA');
});

document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass = document.getElementById('login-password').value;

  const user = state.data.users.find(u => u.email === email && u.password === pass);
  if (!user) {
    toast('Email o contraseña incorrectos');
    return;
  }
  if (!user.enabled) {
    toast('Tu cuenta aún no fue habilitada por el administrador de la empresa');
    return;
  }
  login(user);
});

document.getElementById('register-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const type = document.getElementById('reg-type').value;
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const pass = document.getElementById('reg-password').value;
  const companyName = document.getElementById('reg-company').value.trim();

  if (state.data.users.some(u => u.email === email)) {
    toast('Ese email ya está registrado');
    return;
  }

  let companyId = null;
  let isAdmin = false;

  if (type === 'INMOBILIARIA') {
    isAdmin = true;
    const company = {
      id: uid(),
      name: companyName || name,
      slug: (companyName || name).toLowerCase().replace(/\s+/g, '-'),
      zone: 'GBA',
      website: '',
      phone: '',
      verified: false
    };
    state.data.companies.push(company);
    companyId = company.id;
  }

  const user = {
    id: uid(),
    email,
    password: pass,
    name,
    role: type,
    isAdmin,
    companyId,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    bio: '',
    phone: '',
    whatsapp: '',
    location: '',
    specialties: [],
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284c7&color=fff&size=128`,
    verified: false,
    enabled: true,
    createdAt: new Date().toISOString().slice(0, 10)
  };

  state.data.users.push(user);
  saveData();
  toast('Cuenta creada. ¡Bienvenido!');
  login(user);
});

function login(user) {
  state.currentUser = user;
  document.getElementById('welcome-screen').classList.add('hidden');
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  updateNav();
  navigate('feed');
}

function logout() {
  state.currentUser = null;
  state.activeChatUserId = null;
  document.getElementById('app').classList.add('hidden');
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('welcome-screen').classList.remove('hidden');
  showLogin();
  document.getElementById('user-menu').classList.add('hidden');
}

function updateNav() {
  const u = state.currentUser;
  document.getElementById('nav-avatar').src = u.avatar;
  document.getElementById('nav-name').textContent = u.name;
  document.getElementById('nav-role').textContent = roleLabel(u.role) + (u.isAdmin ? ' · Admin' : '');
  document.getElementById('sidebar-avatar').src = u.avatar;
  document.getElementById('sidebar-name').textContent = u.name;
  document.getElementById('post-avatar').src = u.avatar;

  const company = u.companyId ? getCompany(u.companyId) : null;
  document.getElementById('sidebar-company').textContent = company ? company.name : roleLabel(u.role);

  // Show team button only for company admins
  const btnTeam = document.getElementById('btn-team');
  if (u.isAdmin && u.companyId) {
    btnTeam.classList.remove('hidden');
  } else {
    btnTeam.classList.add('hidden');
  }

  updateMsgBadge();
}

function toggleUserMenu() {
  document.getElementById('user-menu').classList.toggle('hidden');
}

document.addEventListener('click', (e) => {
  const menu = document.getElementById('user-menu');
  if (!menu.contains(e.target) && !e.target.closest('[onclick="toggleUserMenu()"]')) {
    menu.classList.add('hidden');
  }
});

// -------------------- NAVIGATION --------------------
function navigate(view) {
  state.currentView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  const el = document.getElementById('view-' + view);
  if (el) el.classList.remove('hidden');

  document.getElementById('user-menu').classList.add('hidden');

  if (view === 'feed') renderFeed();
  if (view === 'directorio') { renderNetworkTabs(); renderDirectory(); }
  if (view === 'perfil') renderProfile(state.currentUser.id);
  if (view === 'conexiones') renderConnections();
  if (view === 'mensajes') renderMessages();
  if (view === 'equipo') renderTeam();
  if (view === 'publicar') {
    document.getElementById('post-type').value = 'UPDATE';
    document.getElementById('property-fields').classList.add('hidden');
  }
}

// -------------------- FEED --------------------
function renderFeed() {
  const container = document.getElementById('feed-posts');
  const posts = [...state.data.posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  container.innerHTML = posts.map(post => {
    const author = getUser(post.authorId);
    if (!author) return '';
    const company = author.companyId ? getCompany(author.companyId) : null;

    let propertyBlock = '';
    if (post.type === 'PROPERTY' && post.property) {
      propertyBlock = `
        <div class="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p class="font-medium text-sm">${post.property.title}</p>
          <p class="text-brand-600 font-semibold text-sm mt-1">${formatPrice(post.property.price)}</p>
          <p class="text-xs text-slate-500 mt-0.5"><i class="fas fa-map-marker-alt"></i> ${post.property.location}</p>
        </div>`;
    }

    const commentsHtml = (post.comments || []).map(c => {
      const cu = getUser(c.userId);
      return `
        <div class="flex gap-2 mt-2">
          <img src="${cu?.avatar}" class="w-7 h-7 rounded-full avatar" />
          <div class="bg-slate-100 rounded-xl px-3 py-1.5 text-sm flex-1">
            <span class="font-medium text-xs">${cu?.name}</span>
            <p class="text-slate-700">${c.text}</p>
          </div>
        </div>`;
    }).join('');

    return `
      <div class="feed-card bg-white rounded-xl border border-slate-200 p-4">
        <div class="flex items-start gap-3">
          <img src="${author.avatar}" class="w-11 h-11 rounded-full avatar cursor-pointer" onclick="renderProfile('${author.id}'); navigate('perfil')" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <button onclick="renderProfile('${author.id}'); navigate('perfil')" class="font-semibold text-sm hover:underline">${author.name}</button>
              ${author.verified ? '<i class="fas fa-check-circle text-brand-500 text-xs"></i>' : ''}
              ${typeBadge(post.type)}
            </div>
            <p class="text-xs text-slate-500">${company ? company.name + ' · ' : ''}${formatDate(post.createdAt)}</p>
          </div>
        </div>
        <p class="mt-3 text-sm text-slate-800 whitespace-pre-line">${post.content}</p>
        ${propertyBlock}
        <div class="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-sm text-slate-500">
          <button onclick="likePost('${post.id}')" class="flex items-center gap-1.5 hover:text-brand-600">
            <i class="far fa-heart"></i> ${post.likes || 0}
          </button>
          <button class="flex items-center gap-1.5 hover:text-brand-600">
            <i class="far fa-comment"></i> ${(post.comments || []).length}
          </button>
          <button onclick="startChat('${author.id}')" class="flex items-center gap-1.5 hover:text-brand-600 ml-auto">
            <i class="far fa-envelope"></i> Mensaje
          </button>
        </div>
        ${commentsHtml ? `<div class="mt-2">${commentsHtml}</div>` : ''}
      </div>`;
  }).join('');

  renderSuggestions();
}

function renderSuggestions() {
  const container = document.getElementById('suggestions');
  const me = state.currentUser;
  const connectedIds = new Set();
  state.data.connections.forEach(c => {
    if (c.status === 'ACCEPTED') {
      if (c.requesterId === me.id) connectedIds.add(c.receiverId);
      if (c.receiverId === me.id) connectedIds.add(c.requesterId);
    }
  });
  connectedIds.add(me.id);

  const candidates = state.data.users
    .filter(u => !connectedIds.has(u.id) && u.enabled)
    .slice(0, 4);

  container.innerHTML = candidates.map(u => {
    const company = u.companyId ? getCompany(u.companyId) : null;
    return `
      <div class="flex items-center gap-3">
        <img src="${u.avatar}" class="w-10 h-10 rounded-full avatar" />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate">${u.name}</p>
          <p class="text-xs text-slate-500 truncate">${company ? company.name : roleLabel(u.role)}</p>
        </div>
        <button onclick="sendConnection('${u.id}')" class="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full hover:bg-brand-100 font-medium">
          + Conectar
        </button>
      </div>`;
  }).join('') || '<p class="text-xs text-slate-400">No hay sugerencias por ahora</p>';
}

function likePost(postId) {
  const post = state.data.posts.find(p => p.id === postId);
  if (post) {
    post.likes = (post.likes || 0) + 1;
    saveData();
    renderFeed();
  }
}

function openCreatePost(type = 'UPDATE') {
  document.getElementById('modal-post-type').value = type;
  document.getElementById('modal-post-content').value = '';
  document.getElementById('modal-post').classList.remove('hidden');
  document.getElementById('modal-post').classList.add('flex');
}

document.getElementById('modal-post-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const type = document.getElementById('modal-post-type').value;
  const content = document.getElementById('modal-post-content').value.trim();
  if (!content) return;

  state.data.posts.unshift({
    id: uid(),
    authorId: state.currentUser.id,
    type,
    content,
    likes: 0,
    comments: [],
    createdAt: new Date().toISOString()
  });
  saveData();
  closeModal('modal-post');
  toast('Publicación creada');
  navigate('feed');
});

document.getElementById('post-type').addEventListener('change', (e) => {
  document.getElementById('property-fields').classList.toggle('hidden', e.target.value !== 'PROPERTY');
});

document.getElementById('create-post-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const type = document.getElementById('post-type').value;
  const content = document.getElementById('post-content').value.trim();
  if (!content) return;

  const post = {
    id: uid(),
    authorId: state.currentUser.id,
    type,
    content,
    likes: 0,
    comments: [],
    createdAt: new Date().toISOString()
  };

  if (type === 'PROPERTY') {
    post.property = {
      title: document.getElementById('prop-title').value || 'Inmueble sin título',
      price: Number(document.getElementById('prop-price').value) || 0,
      location: document.getElementById('prop-location').value || '',
      type: 'venta'
    };
  }

  state.data.posts.unshift(post);
  saveData();
  toast('Publicación creada');
  document.getElementById('create-post-form').reset();
  navigate('feed');
});


// -------------------- REDES PERSONALIZADAS (max 5) --------------------
const MAX_NETWORKS = 5;

function getMyNetworks() {
  if (!state.currentUser) return [];
  if (!state.data.userNetworks) state.data.userNetworks = {};
  const uid = state.currentUser.id;
  if (!state.data.userNetworks[uid]) state.data.userNetworks[uid] = [];
  return state.data.userNetworks[uid];
}

function saveNetworks() {
  saveData();
}

function renderNetworkTabs() {
  const tabs = document.getElementById('network-tabs');
  if (!tabs) return;
  const nets = getMyNetworks();
  const activeCls = 'px-3 py-2 text-sm font-medium border-b-2 border-brand-600 text-brand-700 whitespace-nowrap';
  const inactiveCls = 'px-3 py-2 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-700 whitespace-nowrap';

  let html = '<button type="button" onclick="selectNetwork(null)" class="' + (activeNetworkId === null ? activeCls : inactiveCls) + '">Todos</button>';
  nets.forEach(n => {
    const count = (n.members || []).length;
    html += '<button type="button" onclick="selectNetwork(\'' + n.id + '\')" class="' + (activeNetworkId === n.id ? activeCls : inactiveCls) + '">' +
      escapeNet(n.name) + ' <span class="text-[10px] text-slate-400">(' + count + ')</span></button>';
  });
  tabs.innerHTML = html;

  const hasActive = !!activeNetworkId;
  document.getElementById('btn-add-member')?.classList.toggle('hidden', !hasActive);
  document.getElementById('btn-rename-network')?.classList.toggle('hidden', !hasActive);
  document.getElementById('btn-delete-network')?.classList.toggle('hidden', !hasActive);
  const btnNew = document.getElementById('btn-new-network');
  if (btnNew) btnNew.classList.toggle('opacity-50', nets.length >= MAX_NETWORKS);
}

function escapeNet(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function selectNetwork(id) {
  activeNetworkId = id;
  renderNetworkTabs();
  renderDirectory();
}

function openCreateNetworkModal() {
  const nets = getMyNetworks();
  if (nets.length >= MAX_NETWORKS) {
    toast('Máximo ' + MAX_NETWORKS + ' redes');
    return;
  }
  networkModalMode = 'create';
  document.getElementById('modal-network-title').textContent = 'Nueva red';
  document.getElementById('network-name-input').value = '';
  const m = document.getElementById('modal-network');
  m.classList.remove('hidden');
  m.classList.add('flex');
  setTimeout(() => document.getElementById('network-name-input')?.focus(), 50);
}

function renameActiveNetwork() {
  if (!activeNetworkId) return;
  const n = getMyNetworks().find(x => x.id === activeNetworkId);
  if (!n) return;
  networkModalMode = 'rename';
  document.getElementById('modal-network-title').textContent = 'Renombrar red';
  document.getElementById('network-name-input').value = n.name;
  const m = document.getElementById('modal-network');
  m.classList.remove('hidden');
  m.classList.add('flex');
}

function saveNetworkModal() {
  const name = (document.getElementById('network-name-input')?.value || '').trim();
  if (!name) { toast('Escribí un nombre'); return; }
  const nets = getMyNetworks();
  if (networkModalMode === 'create') {
    if (nets.length >= MAX_NETWORKS) { toast('Máximo ' + MAX_NETWORKS + ' redes'); return; }
    const id = uid();
    nets.push({ id, name, members: [] });
    activeNetworkId = id;
    toast('Red "' + name + '" creada');
  } else {
    const n = nets.find(x => x.id === activeNetworkId);
    if (n) { n.name = name; toast('Red renombrada'); }
  }
  saveNetworks();
  closeModal('modal-network');
  renderNetworkTabs();
  renderDirectory();
}

function deleteActiveNetwork() {
  if (!activeNetworkId) return;
  const nets = getMyNetworks();
  const n = nets.find(x => x.id === activeNetworkId);
  if (!n) return;
  if (!confirm('¿Eliminar la red "' + n.name + '"?')) return;
  state.data.userNetworks[state.currentUser.id] = nets.filter(x => x.id !== activeNetworkId);
  activeNetworkId = null;
  saveNetworks();
  toast('Red eliminada');
  renderNetworkTabs();
  renderDirectory();
}

function openAddMemberModal() {
  if (!activeNetworkId) return;
  const m = document.getElementById('modal-add-member');
  m.classList.remove('hidden');
  m.classList.add('flex');
  document.getElementById('member-search').value = '';
  renderMemberPicker();
}

function renderMemberPicker() {
  const list = document.getElementById('member-picker-list');
  if (!list) return;
  const q = (document.getElementById('member-search')?.value || '').toLowerCase();
  const nets = getMyNetworks();
  const net = nets.find(x => x.id === activeNetworkId);
  const already = new Set(net?.members || []);

  // Candidates: platform users + matriculados + agencias
  let candidates = [];
  state.data.users.filter(u => u.enabled && u.id !== state.currentUser.id).forEach(u => {
    candidates.push({ id: u.id, name: u.name, sub: roleLabel(u.role), avatar: u.avatar, type: 'user' });
  });
  if (typeof MATRICULADOS !== 'undefined') {
    MATRICULADOS.forEach(u => {
      candidates.push({ id: u.id, name: u.name, sub: (u.razon_social || u.roleLabel || 'Matriculado') + (u.matricula ? ' · Mat. ' + u.matricula : ''), avatar: u.avatar, type: 'padron' });
    });
  }
  if (typeof AGENCIAS_MARKETPLACE !== 'undefined') {
    AGENCIAS_MARKETPLACE.forEach(u => {
      candidates.push({ id: u.id, name: u.name, sub: 'Inmobiliaria', avatar: u.logo || u.avatar, type: 'agencia' });
    });
  }
  // dedupe by id
  const seen = new Set();
  candidates = candidates.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; });
  if (q) candidates = candidates.filter(c => (c.name + ' ' + c.sub).toLowerCase().includes(q));
  candidates = candidates.slice(0, 40);

  list.innerHTML = candidates.map(c => {
    const inNet = already.has(c.id);
    return '<div class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">' +
      '<img src="' + (c.avatar || '') + '" class="w-9 h-9 rounded-full bg-slate-100" />' +
      '<div class="flex-1 min-w-0"><p class="text-sm font-medium truncate">' + escapeNet(c.name) + '</p>' +
      '<p class="text-[11px] text-slate-400 truncate">' + escapeNet(c.sub) + '</p></div>' +
      (inNet
        ? '<button type="button" onclick="removeFromNetwork(\'' + c.id + '\')" class="text-xs text-red-600 px-2 py-1 rounded hover:bg-red-50">Quitar</button>'
        : '<button type="button" onclick="addToNetwork(\'' + c.id + '\')" class="text-xs bg-brand-600 text-white px-2.5 py-1 rounded-lg">Agregar</button>') +
      '</div>';
  }).join('') || '<p class="text-sm text-slate-400 p-4 text-center">Sin resultados</p>';
}

function addToNetwork(memberId) {
  const nets = getMyNetworks();
  const net = nets.find(x => x.id === activeNetworkId);
  if (!net) return;
  if (!net.members) net.members = [];
  if (!net.members.includes(memberId)) net.members.push(memberId);
  saveNetworks();
  renderMemberPicker();
  renderNetworkTabs();
  renderDirectory();
  toast('Agregado a la red');
}

function removeFromNetwork(memberId) {
  const nets = getMyNetworks();
  const net = nets.find(x => x.id === activeNetworkId);
  if (!net) return;
  net.members = (net.members || []).filter(id => id !== memberId);
  saveNetworks();
  renderMemberPicker();
  renderNetworkTabs();
  renderDirectory();
}


// -------------------- DIRECTORIO --------------------
// -------------------- DIRECTORIO (Padrón + Agencias + Red) --------------------
let dirTab = 'network'; // 'network' | custom network id focus
let activeNetworkId = null; // null = 'Todos mis contactos'
let networkModalMode = 'create'; // create | rename

function setDirTab(tab) {
  dirTab = tab;
  const active = 'px-4 py-2.5 text-sm font-medium border-b-2 border-brand-600 text-brand-700 whitespace-nowrap';
  const inactive = 'px-4 py-2.5 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-700 whitespace-nowrap';
  const tabPadron = document.getElementById('tab-padron');
  const tabAgencias = document.getElementById('tab-agencias');
  const tabRed = document.getElementById('tab-red');
  if (tabPadron) tabPadron.className = tab === 'padron' ? active : inactive;
  if (tabAgencias) tabAgencias.className = tab === 'agencias' ? active : inactive;
  if (tabRed) tabRed.className = tab === 'red' ? active : inactive;
  renderDirectory();
}

function renderDirectory() {
  const search = (document.getElementById('dir-search')?.value || '').toLowerCase().trim();
  const role = document.getElementById('dir-role')?.value || '';
  const zone = document.getElementById('dir-zone')?.value || '';
  const estado = document.getElementById('dir-estado')?.value || '';

  // Update counts
  const matCount = (typeof MATRICULADOS !== 'undefined') ? MATRICULADOS.length : 0;
  const agCount = (typeof AGENCIAS_MARKETPLACE !== 'undefined') ? AGENCIAS_MARKETPLACE.length : 0;
  const redCount = state.data.users.filter(u => u.enabled).length;
  const elPadron = document.getElementById('count-padron');
  const elAgencias = document.getElementById('count-agencias');
  const elRed = document.getElementById('count-red');
  if (elPadron) elPadron.textContent = matCount;
  if (elAgencias) elAgencias.textContent = agCount;
  if (elRed) elRed.textContent = redCount;

  let list = [];

  // Redes personalizadas del usuario logueado
  if (state.currentUser && document.getElementById('network-tabs')) {
    const nets = getMyNetworks();
    if (activeNetworkId) {
      const net = nets.find(n => n.id === activeNetworkId);
      const ids = new Set(net?.members || []);
      // resolve members from users + matriculados + agencias
      const pool = [];
      state.data.users.forEach(u => pool.push(u));
      if (typeof MATRICULADOS !== 'undefined') MATRICULADOS.forEach(u => pool.push(u));
      if (typeof AGENCIAS_MARKETPLACE !== 'undefined') AGENCIAS_MARKETPLACE.forEach(u => pool.push({ ...u, role: u.role || 'INMOBILIARIA' }));
      const byId = new Map();
      pool.forEach(u => { if (!byId.has(u.id)) byId.set(u.id, u); });
      list = [...ids].map(id => byId.get(id)).filter(Boolean);
    } else {
      // Todos: conexiones + miembros de cualquier red + usuarios enabled
      const ids = new Set();
      state.data.users.filter(u => u.enabled).forEach(u => ids.add(u.id));
      nets.forEach(n => (n.members || []).forEach(id => ids.add(id)));
      const pool = [];
      state.data.users.forEach(u => pool.push(u));
      if (typeof MATRICULADOS !== 'undefined') MATRICULADOS.forEach(u => pool.push(u));
      if (typeof AGENCIAS_MARKETPLACE !== 'undefined') AGENCIAS_MARKETPLACE.forEach(u => pool.push({ ...u, role: u.role || 'INMOBILIARIA' }));
      const byId = new Map();
      pool.forEach(u => { if (!byId.has(u.id)) byId.set(u.id, u); });
      list = [...ids].map(id => byId.get(id)).filter(Boolean);
    }
  } else if (dirTab === 'padron') {
    list = (typeof MATRICULADOS !== 'undefined') ? [...MATRICULADOS] : [];
  } else if (dirTab === 'agencias') {
    list = (typeof AGENCIAS_MARKETPLACE !== 'undefined') ? [...AGENCIAS_MARKETPLACE] : [];
  } else {
    list = state.data.users.filter(u => u.enabled);
  }

  // Filters
  if (search) {
    list = list.filter(u => {
      const hay = [
        u.name, u.display_name, u.apellido, u.nombre, u.bio, u.location, u.matricula,
        u.razon_social, u.email, u.phone,
        ...(u.specialties || [])
      ].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(search);
    });
  }

  if (role && dirTab !== 'agencias') {
    if (role === 'Martillero' || role === 'Corredor') {
      list = list.filter(u => (u.specialties || []).includes(role) || (u.roleLabel || '').includes(role));
    } else {
      list = list.filter(u => u.role === role);
    }
  }

  if (zone) {
    list = list.filter(u => (u.location || '').toLowerCase().includes(zone.toLowerCase()));
  }

  if (estado && dirTab === 'padron') {
    list = list.filter(u => u.estado === estado);
  }

  // Stats
  const statsEl = document.getElementById('directory-stats');
  if (statsEl) {
    if (state.currentUser && document.getElementById('network-tabs')) {
      if (activeNetworkId) {
        const net = getMyNetworks().find(n => n.id === activeNetworkId);
        statsEl.textContent = `Red "${net?.name || ''}" · ${list.length} contactos`;
      } else {
        statsEl.textContent = `Todos tus contactos · ${list.length}`;
      }
    } else if (dirTab === 'padron') {
      statsEl.textContent = `Mostrando ${list.length} de ${matCount} matriculados (fuente: Padrón CPMCAL 24/08/2017)`;
    } else if (dirTab === 'agencias') {
      statsEl.textContent = `Mostrando ${list.length} inmobiliarias activas en el marketplace (${list.filter(a => a.from_padron).length} con matrícula verificada)`;
    } else {
      statsEl.textContent = `Mostrando ${list.length} usuarios de la red`;
    }
  }

  const grid = document.getElementById('directory-grid');
  if (!grid) return;

  if (!list.length) {
    grid.innerHTML = '<p class="col-span-full text-center text-slate-400 py-12">No se encontraron resultados</p>';
    return;
  }

  grid.innerHTML = list.map(u => {
    // Agencia del marketplace
    if (u.role === 'INMOBILIARIA' && (u.source === 'marketplace' || u.source === 'padron+marketplace' || u.property_count != null)) {
      const phone = u.phone;
      const email = u.email;
      const agencyUrl = `agency.html?id=${encodeURIComponent(u.id)}`;
      const mpUrl = `../marketplace-inmobiliario/index.html?agency=${encodeURIComponent(u.id)}`;
      const teamN = u.team_count || ((u.responsible ? 1 : 0) + ((u.collaborators || []).length));
      return `
        <div class="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition">
          <a href="${agencyUrl}" class="flex items-start gap-4">
            <img src="${u.logo || u.avatar}" class="w-14 h-14 rounded-xl avatar flex-shrink-0 border border-slate-100" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <h3 class="font-semibold text-sm truncate text-slate-900">${u.name}</h3>
                ${u.verified ? '<i class="fas fa-check-circle text-emerald-500 text-xs" title="Vinculada al padrón"></i>' : ''}
              </div>
              <p class="text-xs text-slate-500">Inmobiliaria${u.responsible ? ' · ' + String(u.responsible.name || '').split(',')[0] : ''}</p>
              <p class="text-xs text-slate-400 mt-1"><i class="fas fa-map-marker-alt"></i> ${u.location || 'Avellaneda'}</p>
              ${u.matricula ? `<p class="text-[11px] text-slate-400 mt-0.5">Mat. ${u.matricula}</p>` : '<p class="text-[11px] text-amber-600 mt-0.5">Sin matrícula en padrón local</p>'}
            </div>
          </a>
          <div class="mt-3 flex items-center justify-between gap-2 flex-wrap">
            <a href="${mpUrl}" class="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-medium hover:bg-brand-100">
              <i class="fas fa-home mr-1"></i>${u.property_count || 0} propiedades
            </a>
            ${teamN ? `<span class="text-[11px] text-slate-400"><i class="fas fa-users mr-1"></i>${teamN} en equipo</span>` : ''}
            <a href="${agencyUrl}" class="text-xs text-brand-600 hover:underline font-medium ml-auto">Ver perfil →</a>
          </div>
          <div class="flex items-center justify-end mt-3 pt-3 border-t border-slate-100 gap-1.5">
            ${phone ? `<a href="tel:${String(phone).replace(/\\s/g,'')}" class="text-xs bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-200"><i class="fas fa-phone"></i></a>` : ''}
            ${email ? `<a href="mailto:${email}" class="text-xs bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-200"><i class="fas fa-envelope"></i></a>` : ''}
            ${phone ? `<a href="https://wa.me/54${String(phone).replace(/\\D/g,'')}" target="_blank" class="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100"><i class="fab fa-whatsapp"></i></a>` : ''}
            ${u.instagram ? `<a href="https://instagram.com/${u.instagram}" target="_blank" class="text-xs bg-pink-50 text-pink-700 px-2.5 py-1.5 rounded-lg hover:bg-pink-100"><i class="fab fa-instagram"></i></a>` : ''}
          </div>
        </div>`;
    }

    // Matriculado (padrón)
    if (u.source === 'padron' || u.role === 'MATRICULADO') {
      const dir = u.direccion || {};
      const address = dir.full || [dir.calle, dir.numero].filter(Boolean).join(' ') || null;
      const phone = u.phone || u.whatsapp;
      const email = u.email;

      return `
        <div class="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition">
          <div class="flex items-start gap-4">
            <img src="${u.avatar}" class="w-14 h-14 rounded-full avatar flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <h3 class="font-semibold text-sm truncate">${u.name}</h3>
                ${u.verified ? '<i class="fas fa-check-circle text-emerald-500 text-xs" title="Matrícula activa"></i>' : '<span class="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Licencia</span>'}
              </div>
              <p class="text-xs text-slate-500">${u.roleLabel || 'Profesional'}</p>
              ${u.razon_social ? `<p class="text-xs text-brand-600 mt-0.5 truncate">${u.razon_social}</p>` : ''}
              <p class="text-xs text-slate-400 mt-1"><i class="fas fa-map-marker-alt"></i> ${u.location || '—'}</p>
              ${u.matricula ? `<p class="text-[11px] text-slate-400 mt-0.5">Mat. ${u.matricula}</p>` : ''}
            </div>
          </div>
          ${address ? `<p class="text-xs text-slate-500 mt-3 truncate"><i class="fas fa-building text-slate-300"></i> ${address}</p>` : ''}
          <div class="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 gap-2">
            <div class="flex flex-wrap gap-1">
              ${(u.specialties || []).map(s => `<span class="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded">${s}</span>`).join('')}
            </div>
            <div class="flex gap-1.5 flex-shrink-0">
              ${phone ? `<a href="tel:${phone.replace(/\s/g,'')}" class="text-xs bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-200" title="${phone}"><i class="fas fa-phone"></i></a>` : ''}
              ${email ? `<a href="mailto:${email}" class="text-xs bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-200" title="${email}"><i class="fas fa-envelope"></i></a>` : ''}
              ${phone ? `<a href="https://wa.me/54${phone.replace(/\D/g,'')}" target="_blank" class="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100"><i class="fab fa-whatsapp"></i></a>` : ''}
            </div>
          </div>
        </div>`;
    }

    // Usuario de la red (demo)
    const company = u.companyId ? getCompany(u.companyId) : null;
    const isMe = state.currentUser && u.id === state.currentUser.id;
    const connected = isConnected(u.id);
    const pending = hasPending(u.id);

    let actionBtn = '';
    if (isMe) {
      actionBtn = `<span class="text-xs text-slate-400">Vos</span>`;
    } else if (connected) {
      actionBtn = `<button onclick="startChat('${u.id}')" class="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200"><i class="fas fa-comment"></i> Mensaje</button>`;
    } else if (pending) {
      actionBtn = `<span class="text-xs text-amber-600 font-medium">Pendiente</span>`;
    } else {
      actionBtn = `<button onclick="sendConnection('${u.id}')" class="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-lg hover:bg-brand-700">Conectar</button>`;
    }

    return `
      <div class="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition cursor-pointer" onclick="renderProfile('${u.id}'); navigate('perfil')">
        <div class="flex items-start gap-4">
          <img src="${u.avatar}" class="w-14 h-14 rounded-full avatar" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5">
              <h3 class="font-semibold text-sm truncate">${u.name}</h3>
              ${u.verified ? '<i class="fas fa-check-circle text-brand-500 text-xs"></i>' : ''}
            </div>
            <p class="text-xs text-slate-500">${roleLabel(u.role)}${u.isAdmin ? ' · Admin' : ''}</p>
            ${company ? `<p class="text-xs text-brand-600 mt-0.5">${company.name}</p>` : ''}
            <p class="text-xs text-slate-400 mt-1 truncate"><i class="fas fa-map-marker-alt"></i> ${u.location || 'Sin ubicación'}</p>
          </div>
        </div>
        ${u.bio ? `<p class="text-xs text-slate-600 mt-3 line-clamp-2">${u.bio}</p>` : ''}
        <div class="flex items-center justify-between mt-4 pt-3 border-t border-slate-100" onclick="event.stopPropagation()">
          <div class="flex flex-wrap gap-1">
            ${(u.specialties || []).slice(0, 3).map(s => `<span class="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">${s}</span>`).join('')}
          </div>
          ${actionBtn}
        </div>
      </div>`;
  }).join('');
}

// Bind filters (safe if elements exist)
['dir-search', 'dir-role', 'dir-zone', 'dir-estado'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', renderDirectory);
    el.addEventListener('change', renderDirectory);
  }
});

// -------------------- PROFILE --------------------
function renderProfile(userId) {
  const u = getUser(userId);
  if (!u) return;
  const company = u.companyId ? getCompany(u.companyId) : null;
  const isMe = u.id === state.currentUser.id;
  const connected = isConnected(u.id);
  const pending = hasPending(u.id);

  let actionHtml = '';
  if (isMe) {
    actionHtml = `<button class="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">Editar perfil (próximamente)</button>`;
  } else if (connected) {
    actionHtml = `
      <button onclick="startChat('${u.id}')" class="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
        <i class="fas fa-comment"></i> Mensaje
      </button>`;
  } else if (pending) {
    actionHtml = `<span class="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium">Solicitud pendiente</span>`;
  } else {
    actionHtml = `
      <button onclick="sendConnection('${u.id}')" class="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
        + Conectar
      </button>`;
  }

  // Contact info only if connected or is me (semi-cerrado)
  let contactHtml = '';
  if (isMe || connected) {
    contactHtml = `
      <div class="mt-4 p-4 bg-slate-50 rounded-xl space-y-2 text-sm">
        <p class="font-medium text-slate-700 mb-2">Información de contacto</p>
        ${u.phone ? `<p><i class="fas fa-phone w-5 text-slate-400"></i> ${u.phone}</p>` : ''}
        ${u.whatsapp ? `<p><i class="fab fa-whatsapp w-5 text-green-500"></i> <a href="https://wa.me/${u.whatsapp.replace(/\D/g, '')}" target="_blank" class="text-brand-600 hover:underline">${u.whatsapp}</a></p>` : ''}
        ${u.email ? `<p><i class="fas fa-envelope w-5 text-slate-400"></i> ${u.email}</p>` : ''}
        ${company?.website ? `<p><i class="fas fa-globe w-5 text-slate-400"></i> <a href="${company.website}" target="_blank" class="text-brand-600 hover:underline">${company.website}</a></p>` : ''}
      </div>`;
  } else {
    contactHtml = `
      <div class="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <i class="fas fa-lock"></i> Conectate para ver la información de contacto completa.
      </div>`;
  }

  const userPosts = state.data.posts.filter(p => p.authorId === u.id).slice(0, 5);

  document.getElementById('profile-content').innerHTML = `
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div class="h-32 bg-gradient-to-r from-brand-700 to-brand-500"></div>
      <div class="px-6 pb-6">
        <div class="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
          <img src="${u.avatar}" class="w-24 h-24 rounded-full border-4 border-white avatar shadow" />
          <div class="flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-xl font-bold">${u.name}</h1>
              ${u.verified ? '<i class="fas fa-check-circle text-brand-500"></i>' : ''}
            </div>
            <p class="text-slate-500 text-sm">${roleLabel(u.role)}${u.isAdmin ? ' · Administrador' : ''}</p>
            ${company ? `<p class="text-brand-600 text-sm font-medium">${company.name}</p>` : ''}
            <p class="text-xs text-slate-400 mt-1"><i class="fas fa-map-marker-alt"></i> ${u.location || 'Sin ubicación'}</p>
          </div>
          <div class="flex gap-2">${actionHtml}</div>
        </div>

        ${u.bio ? `<p class="mt-4 text-sm text-slate-700">${u.bio}</p>` : ''}

        <div class="flex flex-wrap gap-2 mt-3">
          ${(u.specialties || []).map(s => `<span class="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full">${s}</span>`).join('')}
        </div>

        ${contactHtml}
      </div>
    </div>

    <div class="mt-6">
      <h2 class="font-semibold mb-3">Publicaciones recientes</h2>
      <div class="space-y-3">
        ${userPosts.length ? userPosts.map(p => `
          <div class="bg-white rounded-xl border border-slate-200 p-4">
            <div class="flex items-center gap-2 mb-2">
              ${typeBadge(p.type)}
              <span class="text-xs text-slate-400">${formatDate(p.createdAt)}</span>
            </div>
            <p class="text-sm">${p.content}</p>
            ${p.property ? `<p class="text-sm font-medium text-brand-600 mt-2">${p.property.title} — ${formatPrice(p.property.price)}</p>` : ''}
          </div>
        `).join('') : '<p class="text-sm text-slate-400">Sin publicaciones aún</p>'}
      </div>
    </div>
  `;
}

// -------------------- CONNECTIONS --------------------
function isConnected(userId) {
  const me = state.currentUser.id;
  return state.data.connections.some(c =>
    c.status === 'ACCEPTED' &&
    ((c.requesterId === me && c.receiverId === userId) || (c.requesterId === userId && c.receiverId === me))
  );
}

function hasPending(userId) {
  const me = state.currentUser.id;
  return state.data.connections.some(c =>
    c.status === 'PENDING' &&
    ((c.requesterId === me && c.receiverId === userId) || (c.requesterId === userId && c.receiverId === me))
  );
}

function sendConnection(userId) {
  if (isConnected(userId) || hasPending(userId)) return;
  state.data.connections.push({
    id: uid(),
    requesterId: state.currentUser.id,
    receiverId: userId,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  });
  saveData();
  toast('Solicitud de conexión enviada');
  if (state.currentView === 'directorio') renderDirectory();
  if (state.currentView === 'perfil') renderProfile(userId);
  renderSuggestions();
}

function acceptConnection(connId) {
  const c = state.data.connections.find(x => x.id === connId);
  if (c) {
    c.status = 'ACCEPTED';
    saveData();
    toast('Conexión aceptada');
    renderConnections();
  }
}

function rejectConnection(connId) {
  state.data.connections = state.data.connections.filter(x => x.id !== connId);
  saveData();
  toast('Solicitud rechazada');
  renderConnections();
}

function renderConnections() {
  const me = state.currentUser.id;
  const pending = state.data.connections.filter(c => c.status === 'PENDING' && c.receiverId === me);
  const accepted = state.data.connections.filter(c =>
    c.status === 'ACCEPTED' && (c.requesterId === me || c.receiverId === me)
  );

  document.getElementById('pending-count').textContent = pending.length;

  document.getElementById('pending-list').innerHTML = pending.length ? pending.map(c => {
    const u = getUser(c.requesterId);
    return `
      <div class="flex items-center gap-3">
        <img src="${u.avatar}" class="w-10 h-10 rounded-full avatar" />
        <div class="flex-1">
          <p class="text-sm font-medium">${u.name}</p>
          <p class="text-xs text-slate-500">${roleLabel(u.role)}</p>
        </div>
        <button onclick="acceptConnection('${c.id}')" class="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-lg">Aceptar</button>
        <button onclick="rejectConnection('${c.id}')" class="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg">Rechazar</button>
      </div>`;
  }).join('') : '<p class="text-sm text-slate-400">No hay solicitudes pendientes</p>';

  document.getElementById('accepted-list').innerHTML = accepted.length ? accepted.map(c => {
    const otherId = c.requesterId === me ? c.receiverId : c.requesterId;
    const u = getUser(otherId);
    return `
      <div class="flex items-center gap-3">
        <img src="${u.avatar}" class="w-10 h-10 rounded-full avatar cursor-pointer" onclick="renderProfile('${u.id}'); navigate('perfil')" />
        <div class="flex-1">
          <p class="text-sm font-medium">${u.name}</p>
          <p class="text-xs text-slate-500">${roleLabel(u.role)}</p>
        </div>
        <button onclick="startChat('${u.id}')" class="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200">
          <i class="fas fa-comment"></i>
        </button>
      </div>`;
  }).join('') : '<p class="text-sm text-slate-400">Todavía no tenés conexiones</p>';
}

// -------------------- MESSAGES --------------------
function updateMsgBadge() {
  const me = state.currentUser?.id;
  if (!me) return;
  const unread = state.data.messages.filter(m => m.toId === me && !m.read).length;
  const badge = document.getElementById('msg-badge');
  if (unread > 0) {
    badge.textContent = unread;
    badge.classList.remove('hidden');
    badge.classList.add('flex');
  } else {
    badge.classList.add('hidden');
    badge.classList.remove('flex');
  }
}

function getConversations() {
  const me = state.currentUser.id;
  const map = new Map();
  state.data.messages.forEach(m => {
    const other = m.fromId === me ? m.toId : m.fromId;
    if (!map.has(other)) map.set(other, []);
    map.get(other).push(m);
  });
  return Array.from(map.entries())
    .map(([userId, msgs]) => {
      msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      return { userId, messages: msgs, last: msgs[msgs.length - 1] };
    })
    .sort((a, b) => new Date(b.last.createdAt) - new Date(a.last.createdAt));
}

function renderMessages() {
  const convs = getConversations();
  const list = document.getElementById('chat-list');

  list.innerHTML = convs.length ? convs.map(c => {
    const u = getUser(c.userId);
    const unread = c.messages.filter(m => m.toId === state.currentUser.id && !m.read).length;
    return `
      <button onclick="openChat('${c.userId}')" class="w-full flex items-center gap-3 p-3 hover:bg-slate-50 text-left ${state.activeChatUserId === c.userId ? 'bg-brand-50' : ''}">
        <img src="${u.avatar}" class="w-11 h-11 rounded-full avatar" />
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium truncate">${u.name}</p>
            <span class="text-[10px] text-slate-400">${formatDate(c.last.createdAt)}</span>
          </div>
          <p class="text-xs text-slate-500 truncate">${c.last.text}</p>
        </div>
        ${unread ? `<span class="w-5 h-5 bg-brand-600 text-white text-[10px] rounded-full flex items-center justify-center">${unread}</span>` : ''}
      </button>`;
  }).join('') : '<p class="p-4 text-sm text-slate-400">No tenés mensajes aún. Conectate con alguien y empezá a chatear.</p>';

  if (state.activeChatUserId) {
    openChat(state.activeChatUserId);
  }
}

function openChat(userId) {
  state.activeChatUserId = userId;
  const u = getUser(userId);
  const me = state.currentUser.id;

  document.getElementById('chat-empty').classList.add('hidden');
  document.getElementById('chat-header').classList.remove('hidden');
  document.getElementById('chat-input-area').classList.remove('hidden');

  document.getElementById('chat-avatar').src = u.avatar;
  document.getElementById('chat-name').textContent = u.name;
  document.getElementById('chat-status').textContent = roleLabel(u.role);

  // Mark as read
  state.data.messages.forEach(m => {
    if (m.fromId === userId && m.toId === me) m.read = true;
  });
  saveData();
  updateMsgBadge();

  const msgs = state.data.messages
    .filter(m => (m.fromId === me && m.toId === userId) || (m.fromId === userId && m.toId === me))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const container = document.getElementById('chat-messages');
  container.innerHTML = msgs.map(m => {
    const isMine = m.fromId === me;
    return `
      <div class="flex ${isMine ? 'justify-end' : 'justify-start'}">
        <div class="max-w-[75%] px-4 py-2 rounded-2xl text-sm ${isMine ? 'bg-brand-600 text-white rounded-br-md' : 'bg-white border border-slate-200 rounded-bl-md'}">
          ${m.text}
          <p class="text-[10px] mt-1 ${isMine ? 'text-brand-200' : 'text-slate-400'}">${formatDate(m.createdAt)}</p>
        </div>
      </div>`;
  }).join('');
  container.scrollTop = container.scrollHeight;

  // Refresh list highlight
  renderMessages();
}

function startChat(userId) {
  navigate('mensajes');
  setTimeout(() => openChat(userId), 50);
}

document.getElementById('chat-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text || !state.activeChatUserId) return;

  state.data.messages.push({
    id: uid(),
    fromId: state.currentUser.id,
    toId: state.activeChatUserId,
    text,
    createdAt: new Date().toISOString(),
    read: false
  });
  saveData();
  input.value = '';
  openChat(state.activeChatUserId);
});

// -------------------- TEAM (Admin) --------------------
function renderTeam() {
  const me = state.currentUser;
  if (!me.isAdmin || !me.companyId) {
    document.getElementById('view-equipo').innerHTML = '<p class="text-slate-500">Solo los administradores de empresa pueden gestionar el equipo.</p>';
    return;
  }

  const members = state.data.users.filter(u => u.companyId === me.companyId);
  const tbody = document.getElementById('team-table');

  tbody.innerHTML = members.map(u => `
    <tr class="border-b border-slate-100">
      <td class="px-4 py-3">
        <div class="flex items-center gap-3">
          <img src="${u.avatar}" class="w-9 h-9 rounded-full avatar" />
          <span class="font-medium">${u.name}</span>
          ${u.id === me.id ? '<span class="text-[10px] bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded">Vos</span>' : ''}
        </div>
      </td>
      <td class="px-4 py-3 text-slate-500">${u.email}</td>
      <td class="px-4 py-3">
        <span class="text-xs ${u.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'} px-2 py-0.5 rounded-full">
          ${u.isAdmin ? 'Admin' : 'Miembro'}
        </span>
      </td>
      <td class="px-4 py-3">
        <span class="text-xs ${u.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} px-2 py-0.5 rounded-full">
          ${u.enabled ? 'Activo' : 'Deshabilitado'}
        </span>
      </td>
      <td class="px-4 py-3 text-right">
        ${u.id !== me.id ? `
          <button onclick="toggleMember('${u.id}')" class="text-xs ${u.enabled ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'} px-2 py-1 rounded">
            ${u.enabled ? 'Deshabilitar' : 'Habilitar'}
          </button>
        ` : '<span class="text-xs text-slate-400">—</span>'}
      </td>
    </tr>
  `).join('');
}

function openInviteModal() {
  document.getElementById('invite-name').value = '';
  document.getElementById('invite-email').value = '';
  document.getElementById('invite-password').value = '123456';
  document.getElementById('modal-invite').classList.remove('hidden');
  document.getElementById('modal-invite').classList.add('flex');
}

document.getElementById('invite-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const me = state.currentUser;
  const name = document.getElementById('invite-name').value.trim();
  const email = document.getElementById('invite-email').value.trim().toLowerCase();
  const pass = document.getElementById('invite-password').value;

  if (state.data.users.some(u => u.email === email)) {
    toast('Ese email ya existe');
    return;
  }

  const user = {
    id: uid(),
    email,
    password: pass,
    name,
    role: 'PROFESIONAL',
    isAdmin: false,
    companyId: me.companyId,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    bio: '',
    phone: '',
    whatsapp: '',
    location: me.location || '',
    specialties: [],
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff&size=128`,
    verified: false,
    enabled: true,
    createdAt: new Date().toISOString().slice(0, 10)
  };

  state.data.users.push(user);
  saveData();
  closeModal('modal-invite');
  toast(`${name} habilitado. Puede ingresar con ${email}`);
  renderTeam();
});

function toggleMember(userId) {
  const u = getUser(userId);
  if (!u) return;
  u.enabled = !u.enabled;
  saveData();
  toast(u.enabled ? 'Usuario habilitado' : 'Usuario deshabilitado');
  renderTeam();
}

// -------------------- MODALS --------------------
function closeModal(id) {
  const el = document.getElementById(id);
  el.classList.add('hidden');
  el.classList.remove('flex');
}

// -------------------- INIT --------------------
function init() {
  state.data = loadData();

  // Deep-link desde Marketplace: ?auth=login | ?auth=register
  const params = new URLSearchParams(window.location.search);
  const auth = params.get("auth");
  if (auth === "login" || auth === "register") {
    goToAuth();
    if (auth === "register") showRegister();
    else showLogin();
    // Limpiar query sin recargar
    const url = new URL(window.location);
    url.searchParams.delete("auth");
    history.replaceState(null, "", url.pathname + url.search + url.hash);
  }
}

init();

// Expose for onclick handlers
window.showLogin = showLogin;
window.showRegister = showRegister;
window.goToAuth = goToAuth;
window.goToDirectorio = goToDirectorio;
window.backToWelcome = backToWelcome;
window.navigate = navigate;
window.logout = logout;
window.toggleUserMenu = toggleUserMenu;
window.openCreatePost = openCreatePost;
window.closeModal = closeModal;
window.likePost = likePost;
window.renderProfile = renderProfile;
window.sendConnection = sendConnection;
window.acceptConnection = acceptConnection;
window.rejectConnection = rejectConnection;
window.startChat = startChat;
window.openChat = openChat;
window.openInviteModal = openInviteModal;
window.toggleMember = toggleMember;
window.resetDemo = resetDemo;
window.setDirTab = setDirTab;
window.selectNetwork = selectNetwork;
window.openCreateNetworkModal = openCreateNetworkModal;
window.renameActiveNetwork = renameActiveNetwork;
window.saveNetworkModal = saveNetworkModal;
window.deleteActiveNetwork = deleteActiveNetwork;
window.openAddMemberModal = openAddMemberModal;
window.addToNetwork = addToNetwork;
window.removeFromNetwork = removeFromNetwork;
window.renderMemberPicker = renderMemberPicker;

