<template>
  <view>
    <BarcodeGenerator :content="'1234567890'" />
  </view>
</template>

<script>
import BarcodeGenerator from '@/components/BarcodeGenerator/BarcodeGenerator.vue'
export default {
  components: { BarcodeGenerator }
}
</script>
