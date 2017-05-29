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
</style>

<template>
  <div id="app">
    <RecyclerView
      :prerender="30"
      key="mi" 
      class="mi-list" 
      :fetch="MiFetch" 
      :item="MiItem" 
      :tombstone="MiTomstone"
    ></RecyclerView>
  </div>
</template>

<script>
import RecyclerView from 'vue-recyclerview'
import MiItem from './MiItem.vue'
import MiTomstone from './MiTombstone.vue'
import MiFetch from './mi-fetch'

export default {
  name: 'app',
  data () {
    return {
      MiFetch: MiFetch,
      MiItem,
      MiTomstone
    }
  },
  components: {
    RecyclerView
  }
}
</script>
