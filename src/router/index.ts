import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '@/pages/HomeView.vue'
import FavouritesView from '@/pages/FavouritesView.vue'
import PreferencesView from '@/pages/PreferencesView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/favourites',
    name: 'favourites',
    component: FavouritesView,
  },
  {
    path: '/preferences',
    name: 'preferences',
    component: PreferencesView,
  },
]

if (import.meta.env.DEV) {
  routes.push({
    path: '/dev/ingredient-images',
    name: 'dev-ingredient-images',
    meta: { devOnly: true, wideLayout: true },
    component: () => import('@/pages/dev/IngredientImageReviewView.vue'),
  })
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
