import InfiniteScroller from './infinite'
import {
  getEventPosition,
  requestAnimationFrame,
  preventDefaultException,
  assign
 } from './util'

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

const Tombstone = {
  render (h) {
    return h('div', {
      attrs: {
        class: 'recyclerview-item tombstone'
      },
      style: {
        height: '100px',
        width: '100%'
      }
    }, '')
  }
}

const options = {
  preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|IMG)$/ },
  distance: 50,
  animation_duration_ms: 200,
  tombstone_class: 'tombstone',
  invisible_class: 'invisible',
  prerender: 20,
  remain: 10,
  preventDefault: false
}

export default (Vue) => {
  return {
    name: 'RecyclerView',
    props: {
      fetch: Function,
      item: Object,
      loading: Object,
      tombstone: {
        type: Object,
        default: () => Tombstone
      },
      prerender: Number,
      remain: Number,
      preventDefault: Boolean,
      options: {
        type: Object,
        default: () => options
      },
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
            'touchstart': this._start,
            'touchmove': this._move,
            'touchend': this._end,
            'touchcancel': this._end,
            'mousedown': this._start,
            'mousemove': this._move,
            'mouseup': this._end
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
        const opt = assign({}, options, {
          prerender: this.prerender,
          remain: this.remain
        }, this.options)

        this.$list = this.$el.querySelector('.recyclerview')
        this.scroller = new InfiniteScroller(
          this.$list,
          this.contentSource,
          opt
        )
      },
      scrollTo (top) {
        top = top || 0
        this.$list.scrollTop = Number(top)
      },
      _renderListStyle () {
        this.$list.style.transform = 'translate3d(0, ' + this.distance + 'px, 0)'
      },
      _start (e) {
        if (this.$list.scrollTop > 0) return
        this.pulling = true
        this.startPointer = getEventPosition(e)
        this.$list.style.transition = 'transform .2s'
        if (this.preventDefault && !preventDefaultException(e.target, this.options.preventDefaultException)) {
          e.preventDefault()
        }
      },
      _move (e) {
        if (!this.pulling) return
        const pointer = getEventPosition(e)
        const distance = pointer.y - this.startPointer.y

        if (distance < 0) {
          this.scrollTo(-distance)
          return
        }

        if (this.preventDefault && !preventDefaultException(e.target, this.options.preventDefaultException)) {
          e.preventDefault()
        }

        this.distance = Math.floor(distance * 0.5)
        if (this.distance > this.options.distance) {
          this.distance = this.options.distance
        }
        requestAnimationFrame(this._renderListStyle.bind(this))
      },
      _end (e) {
        if (!this.pulling) return
        if (this.preventDefault && !preventDefaultException(e.target, this.options.preventDefaultException)) {
          e.preventDefault()
        }
        this.pulling = false
        this.$list.style.transition = 'transform .3s'
        this.$nextTick(() => {
          this.$list.style.transform = ''
        })
        if (this.distance >= this.options.distance) {
          this.distance = 0
          this.scroller.clear()
        }
      }
    }
  }
}
