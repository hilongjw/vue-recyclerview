import InfiniteScroller from './infinite'

class ContentSource {
  constructor (fetch, itemRender, Tombstone, Vue) {
    this.itemRender = itemRender
    this.Tombstone = Tombstone
    this.fetch = fetch
    this.Vue = Vue
  }

  getVm (data, el, item) {
    if (!this.vmCache[data.id]) {
      this.vmCache[data.id] = new this.Vue({
        render: (h) => {
          return h(this.itemRender, {
            props: {
              data: data
            }
          })
        }
      })
    }
    return this.vmCache[data.id]
  }

  createTombstone (el) {
    const vm = new this.Vue({
      render: (h) => {
        return h(this.Tombstone)
      }
    })
    vm.$mount(el)
    return vm.$el
  }

  render (data, el, item) {
    const vm = new this.Vue({
      el: el,
      render: (h) => {
        return h(this.itemRender, {
          props: {
            data: data
          }
        })
      }
    })
    item.vm = vm
    return vm.$el
  }
}

export default (Vue) => {
  return {
    props: {
      fetch: Function,
      item: Object,
      tombstone: Object,
      prerender: Number,
      tag: {
        type: String,
        default: 'div'
      }
    },
    render (h) {
      return h(this.tag, null, this.$slots.default)
    },
    data () {
      return {
        contentSource: new ContentSource(this.fetch, this.item, this.tombstone, Vue),
        scroller: null
      }
    },
    mounted () {
      this.init()
    },
    beforeDestroy () {
      this.scroller.destroy()
    },
    methods: {
      init () {
        this.scroller = new InfiniteScroller(
          this.$el,
          this.contentSource,
          {
            RUNWAY_ITEMS: this.prerender
          }
        )
      }
    }
  }
}
