<template>
  <v-app>
    <v-navigation-drawer app>
      <v-list>
        <v-list-item
          value="true"
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
        >
          <v-list-item-action>
            <v-icon v-html="item.icon" />
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app>
      <v-app-bar-nav-icon></v-app-bar-nav-icon>
      <v-app-bar-title>Cinema Monster</v-app-bar-title>
      <v-spacer />
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
    <v-footer app></v-footer>
  </v-app>
</template>

<script>

import { 
  mdiHome,
  mdiCity,
  mdiHomeCity,
  mdiTheater,
  mdiFilmstrip,
  mdiSeat,
  mdiProjectorScreen,
  mdiMovie,
  mdiMovieCog,
  mdiCreditCardMultiple,
  mdiAccountMultiple,
  mdiReceipt,
} from '@mdi/js';

export default {
  name: 'App',

  components: {
  },

  data: () => ({
    // Menu items
    items: [
      { icon: mdiHome, title: 'Home', to: '/' },
      { icon: mdiCity, title: 'States', to: '/state' },
      { icon: mdiHomeCity, title: 'Cities', to: '/city' },
      { icon: mdiTheater, title: 'Cinemas', to: '/cinema' },
      { icon: mdiProjectorScreen, title: 'Auditorium Types', to: '/auditoriumtype' },
      { icon: mdiMovie, title: 'Movies', to: '/movie' },
      { icon: mdiMovieCog, title: 'Movie Genres', to: '/moviegenre' },
      { icon: mdiFilmstrip, title: 'Movie Sessions', to: '/mobiesession' },
      { icon: mdiCreditCardMultiple, title: 'Payment Methods', to: '/paymentmethod' },
      { icon: mdiSeat, title: 'Seat Types', to: '/seattype' },
      { icon: mdiAccountMultiple, title: 'Customers', to: '/customer' },
      { icon: mdiReceipt, title: 'Orders', to: '/order' },

      /*
Auditorium Types
Movies
Movie Genres
Movie Sessions
Orders
Customers
Payment Methods
Seat Types
       */
    ],
  }),
};
</script>
