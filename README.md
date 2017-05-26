# vue-recyclerview

## usage

```html
<template>
  <div id="app">
    <CycleList 
      :prerender="30" 
      key="mi" 
      class="recyclerview mi-list" 
      :fetch="MiFetch" 
      :item="MiItem" 
      :tombstone="MiTomstone"
    ></CycleList>
  </div>
</template>

<script>
import CycleList from './components/CycleList'
import MiItem from './components/MiItem.vue'
import MiTomstone from './components/MiTombstone.vue'

const MiFetch =  function fetch (count, items) {
  count = Math.max(30, count)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve([ ... mockData])
    }, 200)
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
    CycleList
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


