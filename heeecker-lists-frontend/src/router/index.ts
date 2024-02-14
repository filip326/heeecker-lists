/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  routes: [
    {
      path: "/",
      component: () => import("../pages/createSpace.vue")
    },
    {
      path: "/space",
      component: () => import("../pages/space.vue")
    },
    {
      path: "/space/",
      component: () => import("../pages/space.vue")
    },
    {
      path: "/createSpace",
      component: () => import("../pages/createSpace.vue")
    },
    {
      path: "/legal",
      component: () => import("../pages/legal.vue")
    }
  ],
  history: createWebHistory(process.env.BASE_URL),
})

export default router
