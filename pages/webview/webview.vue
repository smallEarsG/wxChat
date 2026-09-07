<template>
  <web-view v-if="url" :src="url" />
</template>

<script>
export default {
  data() {
    return {
      url: ''
    }
  },
  onLoad(options) {
    if (options.url) {
      this.url = decodeURIComponent(options.url)
    }
    if (options.title) {
      uni.setNavigationBarTitle({
        title: decodeURIComponent(options.title)
      })
    }
  }
}
</script>
