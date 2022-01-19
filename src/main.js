import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'

import * as Keycloak from 'keycloak-js';

let initOptions = {
  url: 'http://localhost:8080/auth', 
  realm: 'CinemaBackoffice', 
  clientId: 'cinemabackoffice', 
  onLoad: 'login-required',
//  onLoad: 'check-sso',
}

let keycloak = Keycloak(initOptions);

Vue.config.productionTip = false
Vue.prototype.$keycloak = keycloak;

keycloak.init({ onLoad: initOptions.onLoad }).then((auth) => {
  if (!auth) {
    //window.location.reload();
    console.log("Not authenticated");
  } else {
    console.log("Authenticated");

    new Vue({
      vuetify,
      router,
      render: h => h(App)
    }).$mount('#app')
    
  }


//Token Refresh
  setInterval(() => {
    keycloak.updateToken(70).then((refreshed) => {
      if (refreshed) {
        console.log('Token refreshed: ' + refreshed);
      } else {
        console.log('Token not refreshed, valid for '
          + Math.round(keycloak.tokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000) + ' seconds');
      }
    }).catch(() => {
      console.log('Failed to refresh token');
    });
  }, 60000);

}).catch(() => {
  console.log("Authenticated Failed");
});




