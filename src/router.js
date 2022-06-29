import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "",
    redirect: "/aa",
  },
  {
    path: "/aa",
    name: "",
    component: () => import("./components/drawings-view.vue"),
  },
];

const createRouter = () =>
  new VueRouter({
    routes,
    mode: "history",
  });

const router = createRouter();
export default router;
