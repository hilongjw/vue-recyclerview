<style>
.mi-item {
  padding: 0 0 3px;
  position: absolute;
  background: #fff;
  width: 100%;
  list-style: none;
}
.mi-item::after {
  content: "";
  position: absolute;
  bottom: 1.5px;
  left: 150px;
  right: 0;
  border-bottom: 1px solid #e4e4e4;
}
.version-item {
  display: flex;
  display: -webkit-box;
  box-align: center;
  -webkit-box-align: center;
  width: 100%;
}
.version-item-img {
    width: 180px;
    height: 180px;
    position: relative;
}
.version-item-img img {
    width: 100%;
}
.version-item .version-item-intro {
  -webkit-box-flex: 1;
  box-flex: 1;
  display: block;
  padding: 0 15px 5px;
}
.version-item .version-item-intro .version-item-name {
  font-size: 14px;
  color: rgba(0,0,0,.87);
  margin-bottom: 8px;
}
.version-item .version-item-intro .version-item-brief {
  font-size: 12px;
  color: rgba(0,0,0,.54);
  margin-bottom: 8px;
  line-height: 15px;
  overflow: hidden;
}
.version-item-brief p {
    text-overflow: ellipsis;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    word-break: break-all;
}
.version-item .version-item-intro .version-item-intro-price {
  font-size: 15px;
  position: relative;
  margin-left: 10px;
}
.version-item .version-item-intro span {
    color: #ff6000;
}
</style>
<template>
    <li class="mi-item" @click="add">
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
  },
  methods: {
    add (e) {
      e.preventDefault()
      console.log(this.data.name += ' 233')
    }
  }
}
</script>
