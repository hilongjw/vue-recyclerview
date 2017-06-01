import InfiniteScroller from './infinite'

const defaultPosition = {
  x: 0,
  y: 0
}

const mouseEvent = /mouse/

export function getEventPosition (e) {
  if (!e) return defaultPosition
  if (e.type === 'touchmove') {
    let touch = e.touches[0]
    return {
      x: touch.clientX,
      y: touch.clientY
    }
  } else if (mouseEvent.test(e.type)) {
    return {
      x: e.clientX,
      y: e.clientY
    }
  }
  return defaultPosition
}

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

export default (Vue) => {
  return {
    name: 'RecyclerView',
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
      return h(this.tag, {
        on: {
          touchstart: this.touchStart,
          touchmove: this.touchMove,
          touchend: this.touchEnd,
          mousedown: this.touchStart,
          mousemove: this.touchMove,
          mouseup: this.touchEnd
        }
      }, this.$slots.default)
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
      setTimeout(() => {
        this.scrollTo()
      }, 5000)
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
      },
      scrollTo (top) {
        if (!top) top = 0
        this.$el.scrollTop = Number(top)
      },
      touchStart (e) {
        if (this.$el.scrollTop > 0) return
        this.pulling = true
        this.startPointer = getEventPosition(e)
        this.$el.style.transition = 'transform .5s'
      },
      touchMove (e) {
        if (!this.pulling) return
        const pointer = getEventPosition(e)

        this.distance = (pointer.y - this.startPointer.y) * 0.5

        if (this.distance > 50) {
          this.pulling = false
          this.distance = 50
        }

        this.$el.style.transform = 'translate3d(0, ' + this.distance + 'px, 0)'
      },
      touchEnd (e) {
        this.pulling = false
        this.$el.style.transform = ''
        if (this.distance >= 50) {
          this.distance = 0
          this.scroller.clear()
        }
      }
    }
  }
}
