/* eslint-disable*/
/**
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Author surma https://github.com/surma
 * Modified by Awe @hilongjw
 */
const MAX_COUNT = Infinity

/**
 * Construct an infinite scroller.
 * @param {Element} scroller The scrollable element to use as the infinite
 *     scroll region.
 * @param {InfiniteScrollerSource} source A provider of the content to be
 *     displayed in the infinite scroll region.
 */
export default function InfiniteScroller (scroller, source, options) {
  // Number of items to instantiate beyond current view in the opposite direction.
  this.RUNWAY_ITEMS = options.prerender
  // Number of items to instantiate beyond current view in the opposite direction.
  this.RUNWAY_ITEMS_OPPOSITE = options.remain
  // The number of pixels of additional length to allow scrolling to.
  // this.SCROLL_RUNWAY = options.SCROLL_RUNWAY || SCROLL_RUNWAY

  // The animation interval (in ms) for fading in content from tombstones.
  this.ANIMATION_DURATION_MS = options.animation_duration_ms
  this.TOMBSTONE_CLASS = options.tombstone_class
  this.INVISIBLE_CLASS = options.invisible_class
  this.MAX_COUNT = MAX_COUNT

  this.anchorItem = {
    index: 0,
    offset: 0
  }
  this.firstAttachedItem_ = 0
  this.lastAttachedItem_ = 0
  this.anchorScrollTop = 0
  this.tombstoneSize_ = 0
  this.tombstoneWidth_ = 0
  this.tombstones_ = []
  this.scroller_ = scroller
  this.source_ = source
  this.items_ = []
  this.loadedItems_ = 0
  this.requestInProgress_ = false

  this.curPos = 0
  this.unusedNodes = []
  this.baseNode = document.createElement('div')

  this.scroller_.addEventListener('scroll', this.onScroll_.bind(this))
  window.addEventListener('resize', this.onResize_.bind(this))
  window.addEventListener('orientationchange', this.onResize_.bind(this))
  
  // Create an element to force the scroller to allow scrolling to a certain
  // point.
  // this.scrollRunway_ = document.createElement('div')

  // // Internet explorer seems to require some text in this div in order to
  // // ensure that it can be scrolled to.
  // this.scrollRunway_.textContent = ' '
  // this.scrollRunwayEnd_ = 0
  // this.scrollRunway_.style.position = 'absolute'
  // this.scrollRunway_.style.height = '1px'
  // this.scrollRunway_.style.width = '1px'
  // this.scrollRunway_.style.transition = 'transform 0.2s'
  // this.scroller_.appendChild(this.scrollRunway_)
  this.onResize_()
}

InfiniteScroller.prototype = {

  /**
   * Called when the browser window resizes to adapt to new scroller bounds and
   * layout sizes of items within the scroller.
   */
  onResize_ () {
    // TODO: If we already have tombstones attached to the document, it would
    // probably be more efficient to use one of them rather than create a new
    // one to measure.
    var tombstone = this.source_.createTombstone(this.baseNode.cloneNode(true))
    tombstone.style.position = 'absolute'
    this.scroller_.appendChild(tombstone)
    tombstone.classList.remove(this.INVISIBLE_CLASS)
    this.tombstoneSize_ = tombstone.offsetHeight
    this.tombstoneWidth_ = tombstone.offsetWidth
    this.scroller_.removeChild(tombstone)

    // Reset the cached size of items in the scroller as they may no longer be
    // correct after the item content undergoes layout.
    for (var i = 0; i < this.items_.length; i++) {
      this.items_[i].height = this.items_[i].width = 0
    }
    this.onScroll_()
  },

  /**
   * Called when the scroller scrolls. This determines the newly anchored item
   * and offset and then updates the visible elements, requesting more items
   * from the source if we've scrolled past the end of the currently available
   * content.
   */
  onScroll_ () {
    const delta = this.scroller_.scrollTop - this.anchorScrollTop

    if (this.scroller_.scrollTop == 0) {
      this.anchorItem = {
        index: 0,
        offset: 0
      }
    } else {
      this.anchorItem = this.calculateAnchoredItem(this.anchorItem, delta)
    }

    this.anchorScrollTop = this.scroller_.scrollTop

    const lastScreenItem = this.calculateAnchoredItem(this.anchorItem, this.scroller_.offsetHeight)

    if (delta < 0) {
      this.fill(this.anchorItem.index - this.RUNWAY_ITEMS, lastScreenItem.index + this.RUNWAY_ITEMS_OPPOSITE)
    } else {
      this.fill(this.anchorItem.index - this.RUNWAY_ITEMS_OPPOSITE, lastScreenItem.index + this.RUNWAY_ITEMS)
    }
  },

  /**
   * Calculates the item that should be anchored after scrolling by delta from
   * the initial anchored item.
   * @param {{index: number, offset: number}} initialAnchor The initial position
   *     to scroll from before calculating the new anchor position.
   * @param {number} delta The offset from the initial item to scroll by.
   * @return {{index: number, offset: number}} Returns the new item and offset
   *     scroll should be anchored to.
   */
  calculateAnchoredItem (initialAnchor, delta) {
    if (delta == 0) return initialAnchor
    delta += initialAnchor.offset
    var i = initialAnchor.index
    var tombstones = 0
    if (delta < 0) {
      while (delta < 0 && i > 0 && this.items_[i - 1].height) {
        delta += this.items_[i - 1].height
        i--
      }
      tombstones = Math.max(-i, Math.ceil(Math.min(delta, 0) / this.tombstoneSize_))
    } else {
      while (delta > 0 && i < this.items_.length && this.items_[i].height && this.items_[i].height < delta) {
        delta -= this.items_[i].height
        i++
      }
      if (i >= this.items_.length || !this.items_[i].height)
        tombstones = Math.floor(Math.max(delta, 0) / this.tombstoneSize_)
    }
    i += tombstones
    delta -= tombstones * this.tombstoneSize_
    return {
      index: i,
      offset: delta
    }
  },

  /**
   * Sets the range of items which should be attached and attaches those items.
   * @param {number} start The first item which should be attached.
   * @param {number} end One past the last item which should be attached.
   */
  fill (start, end) {
    this.firstAttachedItem_ = Math.max(0, start)
    this.lastAttachedItem_ = end
    this.attachContent()
  },

  /**
   * Creates or returns an existing tombstone ready to be reused.
   * @return {Element} A tombstone element ready to be used.
   */
  getTombstone () {
    const tombstone = this.tombstones_.pop()
    if (tombstone) {
      tombstone.classList.remove(this.INVISIBLE_CLASS)
      tombstone.style.opacity = 1
      tombstone.style.transform = ''
      tombstone.style.transition = ''
      return tombstone
    }
    return this.source_.createTombstone(this.baseNode.cloneNode(true))
  },

  getUnUsedNodes () {
    for (let i = 0; i < this.items_.length; i++) {
      if (i == this.firstAttachedItem_) {
        i = this.lastAttachedItem_ - 1
        continue
      }
      if (this.items_[i].vm) {
        this.items_[i].vm.$destroy()
      }
      if (this.items_[i].node) {
        if (this.items_[i].node.classList.contains(this.TOMBSTONE_CLASS)) {
          this.tombstones_.push(this.items_[i].node)
          this.tombstones_[this.tombstones_.length - 1].classList.add(this.INVISIBLE_CLASS)
        } else {
          this.unusedNodes.push(this.items_[i].node)
        }
      }
      this.items_[i].vm = null
      this.items_[i].node = null
    }
  },

  clearUnUsedNodes () {
    while (this.unusedNodes.length) {
      this.scroller_.removeChild(this.unusedNodes.pop());
    }
  },

  getNodePosition () {
    // Fix scroll position in case we have realized the heights of elements
    // that we didn't used to know.
    // TODO: We should only need to do this when a height of an item becomes
    // known above.
    this.anchorScrollTop = 0
    for (let i = 0; i < this.anchorItem.index; i++) {
      this.anchorScrollTop += this.items_[i].height || this.tombstoneSize_
    }
    this.anchorScrollTop += this.anchorItem.offset

    this.curPos = this.anchorScrollTop - this.anchorItem.offset
    let i = this.anchorItem.index
    while (i > this.firstAttachedItem_) {
      this.curPos -= this.items_[i - 1].height || this.tombstoneSize_
      i--
    }
    while (i < this.firstAttachedItem_) {
      this.curPos += this.items_[i].height || this.tombstoneSize_
      i++
    }
  },

  tombstoneLayout (tombstoneAnimations) {
    let i
    let anim
    for (i in tombstoneAnimations) {
      anim = tombstoneAnimations[i]
      this.items_[i].node.style.transform = 'translateY(' + (this.anchorScrollTop + anim[1]) + 'px) scale(' + (this.tombstoneWidth_ / this.items_[i].width) + ', ' + (this.tombstoneSize_ / this.items_[i].height) + ')'
      // Call offsetTop on the nodes to be animated to force them to apply current transforms.
      this.items_[i].node.offsetTop
      anim[0].offsetTop
      this.items_[i].node.style.transition = 'transform ' + this.ANIMATION_DURATION_MS + 'ms'
    }
  },

  itemLayout (tombstoneAnimations) {
    let i
    let anim

    for (i = this.firstAttachedItem_; i < this.lastAttachedItem_; i++) {
      anim = tombstoneAnimations[i]
      if (anim) {
        anim[0].style.transition = 'transform ' + this.ANIMATION_DURATION_MS + 'ms, opacity ' + this.ANIMATION_DURATION_MS + 'ms'
        anim[0].style.transform = 'translateY(' + this.curPos + 'px) scale(' + (this.items_[i].width / this.tombstoneWidth_) + ', ' + (this.items_[i].height / this.tombstoneSize_) + ')'
        anim[0].style.opacity = 0
      }
      if (this.curPos !== this.items_[i].top) {
        if (!anim) this.items_[i].node.style.transition = ''
        this.items_[i].node.style.transform = 'translateY(' + this.curPos + 'px)'
      }
      this.items_[i].top = this.curPos
      this.curPos += this.items_[i].height || this.tombstoneSize_
    }
  },

  setAnimatePosition (tombstoneAnimations) {
    this.tombstoneLayout(tombstoneAnimations)
    this.itemLayout(tombstoneAnimations)
  },

  renderItems () {
    let tombstoneAnimations = {}
    let node
    let newNodes = []
    let i

    if (this.lastAttachedItem_ > this.MAX_COUNT) this.lastAttachedItem_ = this.MAX_COUNT - 1
    // Create DOM nodes.
    for (i = this.firstAttachedItem_; i < this.lastAttachedItem_; i++) {
      while (this.items_.length <= i) {
        this.addItem_()
      }
      if (this.items_[i].node) {
        // if it's a tombstone but we have data, replace it.
        if (this.items_[i].node.classList.contains(this.TOMBSTONE_CLASS) &&
            this.items_[i].data) {
          // TODO: Probably best to move items on top of tombstones and fade them in instead.
          if (this.ANIMATION_DURATION_MS) {
            this.items_[i].node.style.zIndex = 1;
            tombstoneAnimations[i] = [this.items_[i].node, this.items_[i].top - this.anchorScrollTop]
          } else {
            this.items_[i].node.classList.add(this.INVISIBLE_CLASS)
            this.tombstones_.push(this.items_[i].node)
          }
          this.items_[i].node = null
        } else {
          continue
        }
      }
      node = this.items_[i].data ? this.source_.render(this.items_[i].data, (this.unusedNodes.pop() || this.baseNode.cloneNode(true)), this.items_[i]) : this.getTombstone()
      // Maybe don't do this if it's already attached?
      node.style.position = 'absolute'
      this.items_[i].top = -1
      // this.scroller_.appendChild(node)
      this.items_[i].node = node
      newNodes.push(node)
    }

    let len = newNodes.length
    for (i = 0; i < len; i++) {
      this.scroller_.appendChild(newNodes[i])
    }
    return tombstoneAnimations
  },

  cacheItemHeight () {
    for (let i = this.firstAttachedItem_; i < this.lastAttachedItem_; i++) {
      // cacheItemsHeight
      if (this.items_[i].data && !this.items_[i].height) {
        this.items_[i].height = this.items_[i].node.offsetHeight
        this.items_[i].width = this.items_[i].node.offsetWidth
      }
    }
  },

  /**
   * Attaches content to the scroller and updates the scroll position if
   * necessary.
   */
  attachContent () {
    this.getUnUsedNodes()

    let tombstoneAnimations = this.renderItems()

    this.clearUnUsedNodes()

    this.cacheItemHeight()

    this.getNodePosition()

    this.setAnimatePosition(tombstoneAnimations)

    // this.setScrollRunway()

    if (this.ANIMATION_DURATION_MS) {
      // TODO: Should probably use transition end, but there are a lot of animations we could be listening to.
      setTimeout(() => {
        this.tombstoneAnimation(tombstoneAnimations)
      }, this.ANIMATION_DURATION_MS)
    }

    this.maybeRequestContent()
  },

  setScrollRunway () {
    this.scrollRunwayEnd_ = Math.max(this.scrollRunwayEnd_, this.curPos + this.SCROLL_RUNWAY)
    this.scrollRunway_.style.transform = 'translate(0, ' + this.scrollRunwayEnd_ + 'px)'
    this.scroller_.scrollTop = this.anchorScrollTop
  },

  tombstoneAnimation (tombstoneAnimations) {
    let anim
    for (var i in tombstoneAnimations) {
      anim = tombstoneAnimations[i]
      anim[0].classList.add(this.INVISIBLE_CLASS)
      this.tombstones_.push(anim[0])
    }
    tombstoneAnimations = null
  },

  /**
   * Requests additional content if we don't have enough currently.
   */
  maybeRequestContent () {
    // Don't issue another request if one is already in progress as we don't
    // know where to start the next request yet.
    if (this.requestInProgress_) return
    var itemsNeeded = this.lastAttachedItem_ - this.loadedItems_;
    if (itemsNeeded <= 0) return
    this.requestInProgress_ = true
    this.source_.fetch(itemsNeeded, this.items_.length).then(data => {
      this.MAX_COUNT = data.count
      this.addContent(data.list)
    })
  },

  /**
   * Adds an item to the items list.
   */
  addItem_ () {
    this.items_.push({
      vm: null,
      data: null,
      node: null,
      height: 0,
      width: 0,
      top: 0,
    })
  },

  /**
   * Adds the given array of items to the items list and then calls
   * attachContent to update the displayed content.
   * @param {Array<Object>} items The array of items to be added to the infinite
   *     scroller list.
   */
  addContent (items) {
    this.requestInProgress_ = false
    var startIndex = this.items_.length

    let index
    for (var i = 0; i < items.length; i++) {
      if (this.items_.length <= this.loadedItems_) {
        this.addItem_()
      }
      if (this.loadedItems_ <= this.MAX_COUNT) {
        index = this.loadedItems_++
        this.items_[index].data = items[i]
      }
      
    }

    this.attachContent()
  },

  clear () {
    this.loadedItems_ = 0
    this.requestInProgress_ = false

    this.firstAttachedItem_ = -1
    this.lastAttachedItem_ = -1

    this.getUnUsedNodes()
    this.clearUnUsedNodes()
    this.items_ = []

    this.onResize_()
  },

  destroy () {
    this.clear()
    this.scroller_.removeEventListener('scroll', this.onScroll_)
    window.removeEventListener('resize', this.onResize_)
    window.removeEventListener('orientationchange', this.onResize_)

    this.firstAttachedItem_ = 0
    this.lastAttachedItem_ = 0
    this.anchorScrollTop = 0
    this.tombstoneSize_ = 0
    this.tombstoneWidth_ = 0
    this.tombstones_ = []
    this.scroller_ = null
    this.source_ = null
    this.loadedItems_ = 0
    this.requestInProgress_ = false

    this.curPos = 0
    this.unusedNodes = []
    this.baseNode = null
  }
}
