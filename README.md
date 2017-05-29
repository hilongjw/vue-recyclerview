# vue-recyclerview

Mastering Large Lists with the vue-recyclerview

## Demo

[https://hilongjw.github.io/vue-recyclerview/](https://hilongjw.github.io/vue-recyclerview/)

## Requirements

Vue 2.0 +

## Install

```bash
npm i vue-recyclerview

```

```html
<script src="https://unpkg.com/vue-recyclerview"></script>>
```


## Usage

```html
<template>
  <div id="app">
    <RecyclerView
      :prerender="30" 
      key="mi" 
      class="recyclerview mi-list" 
      :fetch="MiFetch" 
      :item="MiItem" 
      :tombstone="MiTomstone"
    ></RecyclerView>
  </div>
</template>

<script>
import Vue from 'vue'
import RecyclerView from 'vue-recyclerview'
import MiItem from './components/MiItem.vue'
import MiTomstone from './components/MiTombstone.vue'

const totalCount = 1000
const MiFetch =  function fetch (count, items) {
  count = Math.max(30, count)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve([ ... mockData])
    }, 200)
  })
  .then(list => {
    return {
      list: list,
      count: totalCount
    }
  })
}

export default {
  name: 'app',
  data () {
    return {
      MiFetch: MiFetch,
      MiItem,
      MiTomstone
    }
  },
  components: {
    RecyclerView: RecyclerView(Vue)
  }
</script>

```

### item

```html
<template>
    <li class="mi-item">
        <a class="version-item">
            <div class="version-item-img">
                <img class="lazy" :src="data.img_url">
            </div>
            <div class="version-item-intro">
                <div class="version-item-name">
                    <p>{{data.name}}</p>
                </div>
                <div class="version-item-brief">
                    <p>{{ data.product_comment }}</p>
                </div>
                <div class="version-item-intro-price">
                    <span>{{ data.price_min }}</span>
                </div>
            </div>
        </a>
    </li>
</template>

<script>
export default {
  props: {
    data: Object
  }
}
</script>

```

### tombstone

```html
<template>
    <li class="mi-item tombstone">
        <a class="version-item">
            <div class="version-item-img">
                <img class="lazy" src="//i8.mifile.cn/v1/a1/76f98ed9-86c5-dcda-0ba2-b79f62b0f195.webp?width=360&height=360">
            </div>
            <div class="version-item-intro">
                <div class="version-item-name">
                    <p></p>
                </div>
                <div class="version-item-brief">
                    <p></p>
                </div>
                <div class="version-item-intro-price">
                    <span>00.00</span>
                </div>
            </div>
        </a>
    </li>
</template>
```

## License

[MIT](https://github.com/hilongjw/vue-recyclerview/blob/master/License)

the project inspired by [infinite-scroller](https://github.com/GoogleChrome/ui-element-samples/tree/gh-pages/infinite-scroller)


