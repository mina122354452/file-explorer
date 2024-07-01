import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      name: 'home',
      path: '/',
      component: () => import('../views/mainView.vue')
    },
    {
      name: 'part',
      path: '/:id',
      component: () => import('../views/partView.vue')
    },
    {
      name: 'task',
      path: '/taskManager',
      component: () => import('../views/taskView.vue')
    }
  ]
})

export default router
