import InfiniteScroller from './infinite'
import { getEventPosition } from './util'

class ContentSource {
  constructor (fetch, itemRender, TombstoneRender, Vue) {
    this.itemRender = itemRender
    this.TombstoneRender = TombstoneRender
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
        return h(this.TombstoneRender)
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

const Loading = {
  render (h) {
    return h('div', {
      attrs: {
        class: 'recyclerview-loading'
      }
    }, 'Loading...')
  }
}

export default (Vue) => {
  return {
    name: 'RecyclerView',
    props: {
      fetch: Function,
      item: Object,
      loading: Object,
      tombstone: Object,
      prerender: Number,
      tag: {
        type: String,
        default: 'div'
      }
    },
    render (h) {
      return h(this.tag, {
        attrs: {
          class: 'recyclerview-container'
        }
      }, [
        h(this.loading || Loading),
        h(this.tag, {
          attrs: {
            class: 'recyclerview'
          },
          on: {
            touchstart: this.touchStart,
            touchmove: this.touchMove,
            touchend: this.touchEnd,
            mousedown: this.touchStart,
            mousemove: this.touchMove,
            mouseup: this.touchEnd
          }
        })]
      )
    },
    data () {
      return {
        startPointer: {
          x: 0,
          y: 0
        },
        distance: 0,
        pulling: false,
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
        this.$list = this.$el.querySelector('.recyclerview')
        this.scroller = new InfiniteScroller(
          this.$list,
          this.contentSource,
          {
            RUNWAY_ITEMS: this.prerender
          }
        )
      },
      scrollTo (top) {
        if (!top) top = 0
        this.$list.scrollTop = Number(top)
      },
      touchStart (e) {
        if (this.$list.scrollTop > 0) return
        this.pulling = true
        this.startPointer = getEventPosition(e)
        this.$list.style.transition = 'transform .5s'
      },
      touchMove (e) {
        if (!this.pulling) return
        const pointer = getEventPosition(e)

        this.distance = (pointer.y - this.startPointer.y) * 0.5

        if (this.distance > 50) {
          this.pulling = false
          this.distance = 50
        }

        this.$list.style.transform = 'translate3d(0, ' + this.distance + 'px, 0)'
      },
      touchEnd (e) {
        this.pulling = false
        this.$list.style.transform = ''
        if (this.distance >= 50) {
          this.distance = 0
          this.scroller.clear()
        }
      }
    }
  }
}
