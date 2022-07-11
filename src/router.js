import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/box-selection'
  },
  {
    path: '/area',
    name: '标记区域',
    component: () => import('./components/drawings-view.vue')
  },
  {
    path: '/box-selection',
    name: '框选',
    component: () => import('./components/box-selection.vue')
  },
  {
    path: '/canvas-board',
    name: '框选',
    component: () => import('./components/canvas-board/index.vue')
  }
]

const createRouter = () =>
  new VueRouter({
    routes,
    mode: "history",
  });

const router = createRouter();
export default router;
