<template>
  <view
    class="pressable-root"
    :class="{ 'pressable--pressing': isPressing, 'pressable--completed': longPressCompleted }"
    :style="rootTransformStyle"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchCancel"
  >
    <!-- 内容插槽 -->
    <slot></slot>

    <!-- Ripple 波纹 -->
    <view
      v-if="enableRipple && showRipple"
      class="pressable-ripple"
      :style="rippleStyle"
    ></view>

    <!-- 长按进度圈 -->
    <!-- H5 使用 conic-gradient -->
    <!-- #ifdef H5 -->
    <view
      v-if="showProgress"
      class="pressable-progress-circle-h5"
      :style="h5ProgressStyle"
    ></view>
    <!-- #endif -->

    <!-- 小程序等非 H5 平台：两个半圆实现 -->
    <!-- #ifndef H5 -->
    <view
      v-if="showProgress"
      class="pressable-progress-circle-mp"
    >
      <view class="circle-half circle-half--left">
        <view
          class="circle-half-inner"
          :style="mpLeftStyle"
        ></view>
      </view>
      <view class="circle-half circle-half--right">
        <view
          class="circle-half-inner"
          :style="mpRightStyle"
        ></view>
      </view>
    </view>
    <!-- #endif -->
  </view>
</template>

<script>
export default {
  name: 'Pressable',
  props: {
    // 长按阈值（ms）
    longPressThreshold: {
      type: Number,
      default: 450
    },
    // 长按进度从 0→100% 所需时间（ms）
    longPressDuration: {
      type: Number,
      default: 900
    },
    // 是否启用 ripple
    enableRipple: {
      type: Boolean,
      default: true
    },
    // 进度圈主色
    progressColor: {
      type: String,
      default: '#4B9CFF'
    },
    // 按下缩放
    pressScale: {
      type: Number,
      default: 0.96
    },
    // 回弹高点
    overshootScale: {
      type: Number,
      default: 1.02
    }
  },
  data() {
    return {
      isPressing: false,
      isLongPressing: false,
      longPressCompleted: false,
      longPressProgress: 0, // 0~1

      longPressTimer: null,
      progressTimer: null,
      pressStartTime: 0,

      // ripple
      showRipple: false,
      rippleX: '50%',
      rippleY: '50%',
      rippleScale: 0,
      rippleOpacity: 0,

      // scale 动画阶段
      scalePhase: 'idle' // idle | pressing | overshoot | settle
    };
  },
  computed: {
    rootTransformStyle() {
      let scale = 1;
      if (this.scalePhase === 'pressing') {
        scale = this.pressScale;
      } else if (this.scalePhase === 'overshoot') {
        scale = this.overshootScale;
      } else if (this.scalePhase === 'settle') {
        scale = 1.0;
      }
      return {
        transform: `scale(${scale})`,
        transition: 'transform 120ms ease-out'
      };
    },

    showProgress() {
      return this.isLongPressing && !this.longPressCompleted;
    },

    // H5 进度圈样式（conic-gradient）
    h5ProgressStyle() {
      const angle = this.longPressProgress * 360;
      return {
        backgroundImage: `conic-gradient(${this.progressColor} ${angle}deg, rgba(255,255,255,0.08) 0deg)`
      };
    },

    // 小程序两个半圆旋转样式
    mpLeftStyle() {
      const p = this.longPressProgress;
      let angle = 0;
      if (p > 0.5) {
        angle = (p - 0.5) * 360;
      }
      return {
        transform: `rotate(${angle}deg)`,
        backgroundColor: this.progressColor
      };
    },
    mpRightStyle() {
      const p = this.longPressProgress;
      let angle = 0;
      if (p <= 0.5) {
        angle = p * 360;
      } else {
        angle = 180;
      }
      return {
        transform: `rotate(${angle}deg)`,
        backgroundColor: this.progressColor
      };
    },

    rippleStyle() {
      return {
        left: this.rippleX,
        top: this.rippleY,
        transform: `translate(-50%, -50%) scale(${this.rippleScale})`,
        opacity: this.rippleOpacity
      };
    }
  },
  methods: {
    handleTouchStart(e) {
      // 立即进入按下态 & ripple
      this.isPressing = true;
      this.scalePhase = 'pressing';
      this.longPressCompleted = false;
      this.isLongPressing = false;
      this.longPressProgress = 0;

      // ripple 起点：H5 尝试用触点坐标，其他平台退化为中心
      this.initRipple(e);

      this.pressStartTime = Date.now();

      // 启动长按判定
      this.clearTimers();
      this.longPressTimer = setTimeout(() => {
        this.startLongPress();
      }, this.longPressThreshold);
    },

    handleTouchEnd() {
      const now = Date.now();
      const pressDuration = now - this.pressStartTime;

      // 没达到长按阈值：短按
      if (!this.isLongPressing && !this.longPressCompleted) {
        if (pressDuration < this.longPressThreshold) {
          this.emitTap();
        }
        this.finishPress(false);
        return;
      }

      // 已进入长按，但未完成：取消长按
      if (this.isLongPressing && !this.longPressCompleted) {
        this.$emit('longpresscancel');
        this.finishPress(false);
        return;
      }

      // 已完成长按：做回弹动画
      if (this.longPressCompleted) {
        this.finishPress(true);
      }
    },

    handleTouchCancel() {
      if (this.isLongPressing && !this.longPressCompleted) {
        this.$emit('longpresscancel');
      }
      this.finishPress(false);
    },

    startLongPress() {
      this.isLongPressing = true;
      this.$emit('longpressstart');
      const start = Date.now();

      this.progressTimer = setInterval(() => {
        const elapsed = Date.now() - start;
        let p = elapsed / this.longPressDuration;
        if (p >= 1) {
          p = 1;
        }
        this.longPressProgress = p;

        if (p >= 1 && !this.longPressCompleted) {
          this.longPressCompleted = true;
          this.isLongPressing = false;
          this.$emit('longpresscomplete'); // 只触发一次
          this.clearTimers();
        }
      }, 16);
    },

    emitTap() {
      // 对外只暴露 tap 事件
      this.$emit('tap');
    },

    finishPress(completed) {
      this.isPressing = false;
      this.clearTimers();

      // ripple 渐隐
      this.rippleOpacity = 0;
      // scale 回弹动画：0.96 → 1.02 → 1.0
      if (completed) {
        this.scalePhase = 'overshoot';
        setTimeout(() => {
          this.scalePhase = 'settle';
        }, 90);
      } else {
        this.scalePhase = 'settle';
      }

      // 重置进度圈
      this.isLongPressing = false;
      if (!completed) {
        this.longPressProgress = 0;
      }

      // 稍后隐藏 ripple
      setTimeout(() => {
        this.showRipple = false;
      }, 200);
    },

    initRipple(e) {
      if (!this.enableRipple) return;

      this.showRipple = true;
      this.rippleScale = 0.4;
      this.rippleOpacity = 0.4;

      // 默认中心
      let x = '50%';
      let y = '50%';

      try {
        const touch = (e && e.touches && e.touches[0]) || null;

        // H5 情况下尝试计算相对坐标
        // 小程序中没有 offsetLeft/Top，这里退化为中心
        // #ifdef H5
        if (touch && e.currentTarget && e.currentTarget.getBoundingClientRect) {
          const rect = e.currentTarget.getBoundingClientRect();
          const offsetX = touch.clientX - rect.left;
          const offsetY = touch.clientY - rect.top;
          x = offsetX + 'px';
          y = offsetY + 'px';
        }
        // #endif
      } catch (err) {
        // ignore，退化为中心
      }

      this.rippleX = x;
      this.rippleY = y;

      // 扩散动画
      setTimeout(() => {
        this.rippleScale = 1.8;
        this.rippleOpacity = 0;
      }, 20);
    },

    clearTimers() {
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
      if (this.progressTimer) {
        clearInterval(this.progressTimer);
        this.progressTimer = null;
      }
    }
  },
  beforeDestroy() {
    this.clearTimers();
  }
};
</script>

<style scoped>
.pressable-root {
  position: relative;
  overflow: hidden;
  /* 不要 box-shadow/filter，性能仅用 transform/opacity */
}

.pressable-ripple {
  position: absolute;
  width: 220%;
  height: 220%;
  border-radius: 9999px;
  background-color: rgba(0, 0, 0, 0.4);
  pointer-events: none;
  transition: transform 300ms ease-out, opacity 300ms ease-out;
}

/* H5 conic-gradient 圆环 */
.pressable-progress-circle-h5 {
  position: absolute;
  right: 12rpx;
  top: 50%;
  width: 56rpx;
  height: 56rpx;
  transform: translateY(-50%);
  border-radius: 9999px;
  background-color: rgba(255, 255, 255, 0.08);
  pointer-events: none;
}

/* 小程序圆环（两个半圆） */
.pressable-progress-circle-mp {
  position: absolute;
  right: 12rpx;
  top: 50%;
  width: 56rpx;
  height: 56rpx;
  transform: translateY(-50%);
  pointer-events: none;
}

.circle-half {
  position: absolute;
  width: 50%;
  height: 100%;
  overflow: hidden;
}

.circle-half--left {
  left: 0;
}

.circle-half--right {
  right: 0;
}

.circle-half-inner {
  position: absolute;
  width: 200%;
  height: 100%;
  border-radius: 9999px;
  transform-origin: center center;
  background-color: transparent;
}

/* 左半圆真正可见部分 */
.circle-half--left .circle-half-inner {
  left: 0;
}

/* 右半圆真正可见部分 */
.circle-half--right .circle-half-inner {
  right: 0;
}

/* 你可以根据设计再加一个背景轨道圈 */
</style>