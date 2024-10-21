// main.ts

import './assets/main.css'; // Import global styles
import { createApp } from 'vue'; // Import Vue
import { createPinia } from 'pinia'; // Import Pinia for state management
import App from './App.vue'; // Import the main App component
import router from './router'; // Import the router

// Create the Vue application instance
const app = createApp(App);

// Use Pinia for state management
app.use(createPinia());

// Use Vue Router
app.use(router);

// Mount the app to the DOM element with id 'app'
app.mount('#app');
