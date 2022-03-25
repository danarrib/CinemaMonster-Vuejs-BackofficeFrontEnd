import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  { path: '/state', name: 'State', component: () => import('../views/State.vue') },
  { path: '/city', name: 'City', component: () => import('../views/City.vue') },
  { path: '/cinema', name: 'Cinema', component: () => import('../views/Cinema.vue') },
  { path: '/movie', name: 'Movie', component: () => import('../views/Movie.vue') },
  { path: '/auditorium/:cinemaId', name: 'Auditorium', component: () => import('../views/Auditorium.vue') },
  { path: '/seat/:auditoriumId', name: 'Seat', component: () => import('../views/Seat.vue') },
  { path: '/auditoriumtype', name: 'Auditorium Type', component: () => import('../views/AuditoriumType.vue') },
  { path: '/seattype', name: 'Seat Type', component: () => import('../views/SeatType.vue') },
  { path: '/moviegenre', name: 'Movie Genre', component: () => import('../views/MovieGenre.vue') },
  { path: '/paymentmethod', name: 'Payment Method', component: () => import('../views/PaymentMethod.vue') },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
