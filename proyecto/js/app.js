import { state } from './config.js';
import { initAuth, logout, deletePet, updateOrderStatus, deleteRegistro, deletePrecioConfig } from './api.js';
import { render } from './render.js';

// Exponer funciones en la ventana global para que los atributos HTML onclick="" funcionen
window.state = state;
window.render = render;
window.logout = logout;
window.deletePet = deletePet;
window.updateOrderStatus = updateOrderStatus;
window.deleteRegistro = deleteRegistro;
window.deletePrecioConfig = deletePrecioConfig;

// Iniciar aplicación
console.log('🚀 Iniciando aplicación AnimalPet...');
initAuth();