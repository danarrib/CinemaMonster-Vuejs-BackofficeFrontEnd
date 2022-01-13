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

import { mdiFormatListBulleted, mdiInformation  } from '@mdi/js';

export default {
  name: 'App',

  components: {
  },

  data: () => ({
    // Menu items
    items: [
      { icon: mdiFormatListBulleted, title: 'Home', to: '/' },
      { icon: mdiInformation, title: 'About', to: '/about' },
    ],
  }),
};
</script>
