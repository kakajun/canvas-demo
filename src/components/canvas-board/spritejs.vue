<template>
  <div>
    <div :style="picStyle" id="canvas"></div>
    <div class="tool-container">
      <!-- <div class="icon-div icon" @click="isShowDrawPane = !isShowDrawPane">
        <icon name="draw" scale="4"></icon>
      </div> -->
      <div class="icon-div icon" @click="filterObject('erase')">
        <svg-icon name="erase" scale="4"></svg-icon>
      </div>
      <div class="icon-div icon" @click="filterObject('line')">
        <svg-icon name="line" scale="4"></svg-icon>
      </div>
      <div class="icon-div icon" @click="filterObject('arrows')">
        <svg-icon name="arrows" scale="4"></svg-icon>
      </div>
      <div class="icon-div icon" @click="filterObject('rect')">
        <svg-icon name="rect" scale="4"></svg-icon>
      </div>
      <div class="icon-div icon" @click="filterObject('circle')">
        <svg-icon name="circle" scale="4"></svg-icon>
      </div>
      <div class="icon-div icon" @click="filterObject('text')">
        <svg-icon name="text" scale="4"></svg-icon>
      </div>
      <div class="icon-div icon" @click="clearCanvas()">
        <svg-icon name="clear" scale="4"></svg-icon>
      </div>
      <div class="icon-div icon" @click="redo()">
        <svg-icon
          :name="historyImageData.length > 0 ? 'redo' : 'grey-redo'"
          scale="4"
        ></svg-icon>
      </div>
      <div class="icon-div icon" @click="cancelRedo()">
        <svg-icon
          :name="
            newHistoryImageData.length > 0 ? 'cancelRedo' : 'grey-cancelRedo'
          "
          scale="4"
        ></svg-icon>
      </div>
      <div class="icon-div icon">
        <svg-icon name="download" scale="4"></svg-icon>
      </div>
    </div>
  </div>
</template>

<script>
import { Scene, Group, Sprite } from 'spritejs'
export default {
  name: '',
  components: {},
  data() {
    return {
      width: 454,
      height: 512,
      //维护绘画状态的数组
      paintType: {
        painting: false,
        erase: false,
        line: false,
        arrows: false,
        rect: false,
        circle: false,
        text: false
      },
      activeCtx: null,
      //保存画布图片历史的数据
      historyImageData: [],
      //保存已被撤销的历史画布图片数据
      newHistoryImageData: []
    }
  },
  computed: {
    picStyle() {
      return {
        width: this.width + 'px',
        height: this.height + 'px'
      }
    }
  },
  mounted() {
    this.setBox()
  },
  methods: {
    setBox() {
      const container = document.getElementById('canvas')
      const scene = new Scene({
        container,
        width: this.width,
        height: this.height
      })
      const layer = scene.layer()
      let ox, oy, gx, gy, dragging, s
      let width = 0
      let height = 0
      layer.addEventListener('mousedown', e => {
        dragging = true
        ox = e.x
        oy = e.y
        s = new Sprite()
        layer.append(s)
      })
      let moveFun = e => {
        if (dragging) {
          width = e.x - ox
          height = e.y - oy
          console.log(width, height, '666')
          s.attr({
            x: ox,
            y: oy,
            width,
            height,
            opacity: 0.5,
            bgcolor: 'black',
            borderWidth: 2,
            borderRadius: 0
          })
        }
      }
      // 注意这里需要绑在group上面, 否则会卡
      layer.addEventListener('mousemove', moveFun)
      layer.addEventListener('mouseup', e => {
        if (dragging) {
          s.addEventListener('mousedown', e => {
            console.log('点击了精灵')
          })
        }
        dragging = false
      })
    },
    filterObject(type) {
      this.paintType = type
    }
  }
}
</script>

<style lang="scss" scoped>
.tool-container {
  position: fixed;
  bottom: 20px;
  left: 70%;
  transform: translateX(-50%);
  border: 2px solid orange;
  border-radius: 10px;
  display: flex;
  justify-content: center;
}

.icon-div {
  margin: 10px 12px;
}

.icon :hover {
  cursor: pointer;
}
</style>
