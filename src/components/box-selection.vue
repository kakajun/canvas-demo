<template>
  <div class="">
    <div id="controls">
      <input type="button" id="resetButton" value="Reset" />
    </div>
    <div :style="picStyle" id="canvas"></div>
    <!-- <canvas id="canvas" width="454" height="512"></canvas> -->
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
      height: 512
    }
  },
  mounted() {
    // this.init()
    this.setBox()
  },
  computed: {
    picStyle() {
      return {
        width: this.width + 'px',
        height: this.height + 'px'
      }
    }
  },
  methods: {
    setBox() {
      var mousedown = {}
      var rubberbandRectangle = {}
      var dragging = false
      var start_data
      const container = document.getElementById('canvas')
      const scene = new Scene({
        container,
        width: this.width,
        height: this.height
      })
      const layer = scene.layer()
      const group = new Group()
      const group2 = group.cloneNode()
      const group3 = group.cloneNode()
      layer.append(group)
      group.append(group2)
      group.append(group3)
      group2.attr({
        anchor: [0.5, 0.5],
        size: [150, 150],
        pos: [300, 180],
        bgcolor: 'white',
        borderWidth: 1,
        borderRadius: 20
      })
      group3.attr({
        size: [this.width, this.height]
      })

      /**
       * @desc: 获取鼠标点击在canvas的坐标
       * @author: majun
       * @param {*} canvas
       * @param {*} x
       * @param {*} y
       */
      function windowToCanvas(canvas, x, y) {
        var bbox = canvas.getBoundingClientRect()
        return {
          x: x - bbox.left,
          y: y - bbox.top
        }
      }
      /**
       * @desc:  //计算出选中的矩形坐标
       * @author: majun
       * @param {*} x
       * @param {*} y
       */
      function rubberbandStretch(x, y) {
        rubberbandRectangle.left = Math.min(x, mousedown.x)
        rubberbandRectangle.top = Math.min(y, mousedown.y)
        rubberbandRectangle.width = Math.abs(x - mousedown.x)
        rubberbandRectangle.height = Math.abs(y - mousedown.y)
        console.log(rubberbandRectangle, 'rubberbandRectangle')
        // group2.attr({
        //   anchor: [0.5, 0.5],
        //   size: [150, 150],
        //   pos: [300, 180],
        //   bgcolor: 'white',
        //   borderWidth: 1,
        //   borderRadius: 20
        // })
        // context.strokeRect(
        //   rubberbandRectangle.left + context.lineWidth,
        //   rubberbandRectangle.top + context.lineWidth,
        //   rubberbandRectangle.width - 2 * context.lineWidth,
        //   rubberbandRectangle.height - 2 * context.lineWidth
        // )
      }
      /**
       * @desc: 开始从离屏canvas复制数据
       * @author: majun
       * @param {*} x
       * @param {*} y
       */
      function rubberbandEnd(x, y) {
        if (x == rubberbandRectangle.left || y == rubberbandRectangle.top) {
          dragging = false
          return
        }
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.drawImage(
          offscreenCanvas,
          rubberbandRectangle.left + context.lineWidth * 2,
          rubberbandRectangle.top + context.lineWidth * 2,
          rubberbandRectangle.width - 4 * context.lineWidth,
          rubberbandRectangle.height - 4 * context.lineWidth,
          0,
          0,
          canvas.width,
          canvas.height
        )

        offscreenContext.drawImage(canvas, 0, 0, canvas.width, canvas.height)
        dragging = false
      }
      /**
       * @desc: canvas鼠标按下
       * @author: majun
       * @param {*} e
       */
      group3.addEventListener('mousedown', e => {
        var loc = windowToCanvas(group3, e.clientX, e.clientY) //获取鼠标点击在canvas的坐标
        console.log(loc, 'loc')
        e.preventDefault()
        mousedown.x = loc.x
        mousedown.y = loc.y
        rubberbandRectangle.left = mousedown.x
        rubberbandRectangle.top = mousedown.y
        dragging = true
      })
      /**
       * @desc: 拖动
       * @author: majun
       * @param {*} e
       */
      group3.addEventListener('mousemove', e => {
        var loc
        if (dragging) {
          context.clearRect(0, 0, canvas.width, canvas.height)
          context.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height) //把离屏canvas上的数据复制到当前canvas
          loc = windowToCanvas(canvas, e.clientX, e.clientY)
          rubberbandStretch(loc.x, loc.y) //计算出选中的矩形坐标
        }
      })

      /**
       * @desc: 抬起鼠标
       * @author: majun
       * @param {*} e
       */
      group2.addEventListener('mouseup', e => {
        var loc = windowToCanvas(group, e.clientY, e.clientY)
        // rubberbandEnd(loc.x, loc.y) //鼠标抬起 开始从离屏canvas复制数据
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
