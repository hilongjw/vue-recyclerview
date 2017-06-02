import Vue from 'vue'
import App from './App.vue'
import RecyclerView from 'vue-recyclerview'

Vue.config.productionTip = false

Vue.use(RecyclerView)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
})

console.log('6666')
