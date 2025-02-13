<script setup lang="ts">
</script>

<template>
  <div>
    <nav>
      <router-link to="/">Choose Template</router-link> |
      <router-link to="/builder">Template Builder</router-link>
    </nav>
    
    <router-view></router-view>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 0 2em #42b883aa);
}

nav {
  padding: 2rem;
}

nav a {
  margin: 0 1rem;
  text-decoration: none;
  color: #2c3e50;
}

nav a.router-link-active {
  color: #42b883;
  font-weight: bold;
}
</style>
