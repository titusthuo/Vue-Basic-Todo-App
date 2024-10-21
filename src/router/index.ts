import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue'; // Ensure this component exists
import HomePage from '../views/HomePage.vue'; // Ensure this component exists

const routes = [
  {
    path: '/',
    name: 'home', // Using lowercase for the route name
    component: HomeView, // HomeView component for the root path
  },
  {
    path: '/homepage',
    name: 'homepage', // Using lowercase for consistency
    component: HomePage, // Component for the homepage route
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'), // Lazy-loaded AboutView component
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // Using BASE_URL for history mode
  routes,
});

export default router;

