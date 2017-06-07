import { find } from './util'

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

    this.reuseVM = {
      queue: [
      // {
      //   inuse: false,
      //   vm: vm
      // }
      ],
      generate: (data, el) => {
        let item = find(this.reuseVM.queue, item => !item.inuse)

        // this.reuseVM.queue.find(i => !i.inuse)

        if (!item) {
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
            data: vmOptions.props,
            render: h => h(this.itemRender, vmOptions)
          }
          item = {
            id: data.id,
            inuse: true,
            vm: new this.Vue(vmConfig)
          }
          this.reuseVM.queue.push(item)
        } else {
          item.vm.data = data
          // item.vm.$forceUpdate()
          item.inuse = true
          item.id = data.id
        }

        return item.vm
      },
      free (id) {
        let item = find(this.queue, i => i.id === id)
        item.inuse = false
      },
      destroy (id, all) {
        for (let i = 0, len = this.queue.length; i < len; i++) {
          if (this.queue[i].id === id || all) {
            this.queue.vm && this.queue.vm.$destroy()
            this.queue.splice(i, 1)
          }
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

  free (data) {
    this.reuseVM.free(data.id)
  }

  render (data, el, item) {
    if (this.options.reuseVM) {
      const vm = this.reuseVM.generate(data, el)
      item.vm = vm
      return vm.$el
    }

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

  destroy () {
    this.reuseVM.destroy(null, true)
    return this.reuseVM.queue
  }
}
