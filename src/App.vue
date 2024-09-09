<template>
  <div id="app">
    <h1>DMN Webapp with Vue.js</h1>
    <DMNViewer />
  </div>
</template>

<script>
import DMNViewer from './components/DMNViewer.vue';

export default {
  name: 'App',
  components: {
    DMNViewer,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.dmn-drd-container {
  height: 100%;
  background-color: #0056b3;
}
</style>
