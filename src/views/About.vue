<template>
  <div class="about">
    <h1>This is an about page</h1>
    {{ nome }}
  </div>
</template>

<script>
import Vue from 'vue'

export default {
  name: 'About',
  data() { 
    return {
      nome: Vue.prototype.$keycloak.idTokenParsed.preferred_username,
      }
    },
}
</script>