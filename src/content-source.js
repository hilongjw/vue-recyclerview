export default class ContentSource {
  constructor (fetch, itemRender, TombstoneRender, Vue) {
    this.itemRender = itemRender
    this.TombstoneRender = TombstoneRender
    this.fetch = fetch
    this.Vue = Vue
  }

  createTombstone (el) {
    const vm = new this.Vue({
      el: el,
      render: h => h(this.TombstoneRender)
    })
    return vm.$el
  }

  render (data, el, item) {
    const vm = new this.Vue({
      el: el,
      render: h => h(this.itemRender, {
        props: {
          data: data
        }
      })
    })
    item.vm = vm
    return vm.$el
  }
}
