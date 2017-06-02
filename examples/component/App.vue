<style>
html {
  background: #eeeeee;
}

html, body {
  min-height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-family: 'Roboto', sans-serif;
  -webkit-tap-highlight-color: rgba(0,0,0,0);
}
.recyclerview-container {
  height: calc(100vh - 50px);
}
</style>

<template>
  <div id="app">
    <RecyclerView 
      :prerender="30"
      :fetch="MiFetch" 
      :item="MiItem" 
      :tombstone="MiTomstone"
    ></RecyclerView>
  </div>
</template>

<script>
import MiItem from './Item.vue'
import MiTomstone from './Tombstone.vue'
import MiFetch from './mi-fetch.js'

export default {
  name: 'app',
  data () {
    return {
      MiFetch,
      MiItem,
      MiTomstone
    }
  }
}
</script>
