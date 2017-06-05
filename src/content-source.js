export default class ContentSource {
  constructor (fetch, itemRender, TombstoneRender, Vue, options) {
    this.itemRender = itemRender
    this.TombstoneRender = TombstoneRender
    this.fetch = fetch
    this.Vue = Vue
    this.options = options
    this.itemCache = {
      data: {},
      length: 0,
      get (key) {
        return this.data[key]
      },
      set (key, vm) {
        this.length++
        this.data[key] = vm
        if (this.length > options.cacheVM && options.cacheVM > 50) {
          this.recycle(10, key)
        }
      },
      recycle (count, except) {
        let key
        let keys = Object.keys(this.data)
        let len = keys.length
        while (count) {
          count--
          key = keys[Math.floor(Math.random() * len)]
          this.data[key] && this.length-- && this.data[key].$destroy()
          this.data[key] = null
        }
      }
    }
  }

  createTombstone (el) {
    const vm = new this.Vue({
      el: el,
      render: h => h(this.TombstoneRender)
    })
    return vm.$el
  }

  render (data, el, item) {
    let vm
    if (this.options.cacheVM) {
      vm = this.itemCache.get(data.id)
      if (vm) {
        item.vm = vm
        return vm.$el
      }
      vm = new this.Vue({
        el: el,
        render: h => h(this.itemRender, {
          props: {
            data: data
          }
        })
      })
      this.itemCache.set(data.id, vm)
      item.vm = vm
      return vm.$el
    }
    vm = new this.Vue({
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
