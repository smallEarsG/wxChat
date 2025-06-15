<template>
  <view class="barcode-container">
    <canvas canvas-id="barcodeCanvas" class="barcode-canvas" :style="{ width: canvasWidth + 'rpx', height: canvasHeight + 'rpx' }"></canvas>
    <view class="barcode-text">{{ barcodeValue }}</view>
  </view>
</template>

<script>
export default {
  name: 'Barcode',
  props: {
    value: {
      type: String,
      required: true
    },
    width: {
      type: Number,
      default: 600
    },
    height: {
      type: Number,
      default: 200
    },
    displayValue: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      canvasWidth: 0,
      canvasHeight: 0,
      barcodeValue: ''
    }
  },
  mounted() {
    this.initCanvas()
  },
  watch: {
    value: {
      handler() {
        this.initCanvas()
      },
      deep: true
    }
  },
  methods: {
    initCanvas() {
      // 转换rpx到px
      const sysInfo = uni.getSystemInfoSync()
      const scaleRatio = 750 / sysInfo.windowWidth
      this.canvasWidth = this.width
      this.canvasHeight = this.height
      this.barcodeValue = this.value
      
      // 延迟执行确保DOM已渲染
      setTimeout(() => {
        this.generateBarcode()
      }, 100)
    },
    generateBarcode() {
      // 获取Canvas上下文
      const ctx = uni.createCanvasContext('barcodeCanvas', this)
      
      // 使用完整CODE128B编码表
      const code128BTable = {
        ' ': '010100110110', '!': '010101100110', '"': '010101101100', '#': '010100100110',
        '$': '010100101100', '%': '010101100100', '&': '010101101000', '\'': '010010101100',
        '(': '010010110010', ')': '010010110100', '*': '010011001010', '+': '010011010010',
        ',': '010011010100', '-': '010100100100', '.': '010100101000', '/': '010101100100',
        '0': '011001010010', '1': '011001011000', '2': '011001100100', '3': '011001101000',
        '4': '011010010010', '5': '011010011000', '6': '011011001000', '7': '011011001000',
        '8': '011011010010', '9': '011011011000', ':': '010010010110', ';': '010010011010',
        '<': '010010110010', '=': '010010110100', '>': '010011001010', '?': '010011001100',
        '@': '010011010010', 'A': '010100100110', 'B': '010100101100', 'C': '010100110010',
        'D': '010100110100', 'E': '010101100100', 'F': '010101101000', 'G': '010101101100',
        'H': '010100100100', 'I': '010100101000', 'J': '010101100100', 'K': '010101101000',
        'L': '010101101100', 'M': '010010100110', 'N': '010010101100', 'O': '010010110010',
        'P': '010010110100', 'Q': '010011001010', 'R': '010011001100', 'S': '010011010010',
        'T': '010011010100', 'U': '010100100100', 'V': '010100101000', 'W': '010100110010',
        'X': '010100110100', 'Y': '010101100100', 'Z': '010101101000', '[': '010101101100',
        '\\': '010100100110', ']': '010100101100', '^': '010100110010', '_': '010100110100',
        '`': '010010010110', 'a': '010010011010', 'b': '010010110010', 'c': '010010110100',
        'd': '010011001010', 'e': '010011001100', 'f': '010011010010', 'g': '010011010100',
        'h': '010100100100', 'i': '010100101000', 'j': '010100110010', 'k': '010100110100',
        'l': '010101100100', 'm': '010101101000', 'n': '010101101100', 'o': '010010100110',
        'p': '010010101100', 'q': '010010110010', 'r': '010010110100', 's': '010011001010',
        't': '010011001100', 'u': '010011010010', 'v': '010011010100', 'w': '010100100110',
        'x': '010100101100', 'y': '010100110010', 'z': '010100110100', '{': '010101100110',
        '|': '010101101100', '}': '010010010110', '~': '010010011010', 'DEL': '011001010010'
      }
      
      // 完整CODE128编码实现
      const binaryString = this.convertToBinary(this.value, code128BTable)
      if (!binaryString) return
      
      // 计算每个条的宽度
      const barWidth = this.canvasWidth / binaryString.length
      
      // 清空画布
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
      
      // 绘制条形码
      let xPos = 0
      ctx.setFillStyle('#000000')
      
      for (let i = 0; i < binaryString.length; i++) {
        if (binaryString[i] === '1') {
          ctx.fillRect(xPos, 0, barWidth, this.canvasHeight * 0.8)
        }
        xPos += barWidth
      }
      
      // 绘制文本
      if (this.displayValue) {
        ctx.setFontSize(24)
        ctx.setTextAlign('center')
        ctx.fillText(this.value, this.canvasWidth / 2, this.canvasHeight * 0.95)
      }
      
      // 绘制到Canvas
      ctx.draw(false, () => {
        console.log('条形码绘制完成')
      })
    },
    convertToBinary(value, codeTable) {
      if (!value || value.length === 0) return ''
      
      // 检查所有字符是否都在CODE128B表中
      for (let i = 0; i < value.length; i++) {
        if (!codeTable[value[i]]) {
          uni.showToast({
            title: `字符 "${value[i]}" 不支持CODE128B编码`,
            icon: 'none'
          })
          return ''
        }
      }
      
      // 计算起始码 (CODE128B的起始码)
      let binary = '11010000100'
      
      // 计算编码数据
      let checksum = 104 // 起始码B的值
      
      for (let i = 0; i < value.length; i++) {
        const char = value[i]
        // 获取字符对应的二进制编码
        const charCode = Object.keys(codeTable).indexOf(char)
        binary += codeTable[char]
        
        // 计算校验和
        checksum += charCode * (i + 1)
      }
      
      // 计算校验位
      checksum = checksum % 103
      // 查找校验位对应的二进制编码
      const checksumChar = Object.keys(codeTable)[checksum]
      binary += codeTable[checksumChar]
      
      // 添加终止符
      binary += '1100011101011'
      
      return binary
    }
  }
}
</script>

<style scoped>
.barcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
}

.barcode-canvas {
  background-color: #ffffff;
  border: 1rpx solid #eeeeee;
  border-radius: 8rpx;
}

.barcode-text {
  margin-top: 10rpx;
  font-size: 28rpx;
  color: #333333;
}
</style>  