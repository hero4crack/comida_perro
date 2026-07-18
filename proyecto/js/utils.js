import { state } from './config.js';
import { render } from './render.js';

export function esc(s) { 
    if (s == null) return ''; 
    const d = document.createElement('div'); 
    d.textContent = String(s); 
    return d.innerHTML; 
}

export function toast(msg, type = 'success') {
    const el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

export function showLoading(show) {
    state.loading = show;
    render();
}