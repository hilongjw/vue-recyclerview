import RecyclerView from './recyclerview.js'
import './recyclerview.css'

function install (Vue, options = {}) {
  const component = RecyclerView(Vue)
  if (options.plugin) {
    Vue.component('RecyclerView', component)
  }
  return component
}

export default install
