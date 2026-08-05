
let activeNetworkId = null;
let networkModalMode = 'create';
const MAX_NETWORKS = 5;
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



window.selectNetwork = selectNetwork;
window.openCreateNetworkModal = openCreateNetworkModal;
window.renameActiveNetwork = renameActiveNetwork;
window.saveNetworkModal = saveNetworkModal;
window.deleteActiveNetwork = deleteActiveNetwork;
window.openAddMemberModal = openAddMemberModal;
window.addToNetwork = addToNetwork;
window.removeFromNetwork = removeFromNetwork;
window.renderMemberPicker = renderMemberPicker;
window.renderNetworkTabs = renderNetworkTabs;

// Networks addon — requires app.js state, saveData, uid, toast, roleLabel, closeModal
if (typeof state !== 'undefined' && state.data && !state.data.userNetworks) state.data.userNetworks = {};
document.getElementById('member-search')?.addEventListener('input', () => { if (typeof renderMemberPicker === 'function') renderMemberPicker(); });
document.getElementById('dir-search')?.addEventListener('input', () => { if (typeof renderDirectory === 'function') renderDirectory(); });
