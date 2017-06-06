export default class ContentSource {
  constructor (Vue, options) {
    this.itemRender = options.item
    this.TombstoneRender = options.tombstone
    this.fetch = options.fetch
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
    const vmOptions = {
      props: {
        data: data
      }
    }
    this.options.props.data = data
    if (this.options.props) {
      Object.keys(this.options.props).map(key => {
        vmOptions.props[key] = this.options.props[key]
      })
    }
    const vmConfig = {
      el: el,
      render: h => h(this.itemRender, vmOptions)
    }
    if (this.options.cacheVM) {
      vm = this.itemCache.get(data.id)
      if (vm) {
        item.vm = vm
        return vm.$el
      }
      vm = new this.Vue(vmConfig)
      this.itemCache.set(data.id, vm)
      item.vm = vm
      return vm.$el
    }
    vm = new this.Vue(vmConfig)
    item.vm = vm
    return vm.$el
  }
}
