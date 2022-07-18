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
  watch: {
    rectList: function (newVal, oldVal) {
      console.log('rectList: ', newVal)
    }
  },
  data() {
    return {
      selectId: null,
      width: 854,
      height: 512,
      //维护绘画状态的数组
      paintType: 'rect',
      // 选框
      rectList: [
        { height: 126, id: 0, width: 166, x: 95, y: 120 },
        { height: 26, id: 1, width: 66, x: 195, y: 320 }
      ],
      activeCtx: null,
      currentCursor: null,
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
    this.initDraw()
  },
  methods: {
    initDraw() {
      const container = document.getElementById('canvas')
      const scene = new Scene({
        container,
        width: this.width,
        height: this.height
      })
      const layer = scene.layer()
      // let ox, oy, dragging, s
      // let width = 0
      // let height = 0
      // 初始化矩形rectList
      this.drawRect(layer)
    },
    filterObject(type) {
      this.paintType = type
    },
    /**
     * @desc:
     * @author: majun
     * @param {*} s
     * @param {*} width
     * @param {*} height
     * @param {*} ox
     * @param {*} oy
     */
    setSpirit(s, width, height, ox, oy) {
      //   painting: false,
      // erase: false,
      // line: false,
      // arrows: false,
      // rect: false,
      // circle: false,
      // text: false
      switch (this.paintType) {
        case 'rect':
          this.setRect(s, width, height, ox, oy)
          break
        case 'line':
          s.attr({
            points: [ox, oy, width, height],
            fillColor: '#37c',
            lineWidth: 3,
            close: true,
            smooth: true
          })
        default:
          break
      }
    },
    setRect(s, width, height, ox, oy) {
      s.attr({
        x: ox,
        y: oy,
        width,
        height,
        bgcolor: 'black',
        borderWidth: 2,
        borderRadius: 0
      })
    },
    /**
     * @desc:画选框操做
     * @author: majun
     */
    drawRect(layer) {
      this.initDrawRect(layer)
      let [moveIn, moved, mouseInit, mouse, move, s] = [
        false,
        false,
        {},
        {},
        {},
        {}
      ]
      layer.addEventListener('mousedown', e => {
        mouseInit = { x: e.x, y: e.y }
        this.selectId = this.rectList.length
        moveIn = true
        moved = this.getSelectRect(mouseInit)
        s = new Sprite()
        layer.append(s)
      })

      layer.addEventListener('mouseup', e => {
        moveIn = false
        moved = false
        this.currentCursor = null
        // this.reShowRect(0, 0, moved, this.selectId, 'revise')
      })
      layer.addEventListener('mousemove', e => {
        mouse = { x: e.x, y: e.y }
        move = { x: mouse.x - mouseInit.x, y: mouse.y - mouseInit.y }
        // 新建拖拉选框
        if (moveIn && !moved) {
          this.rectList[this.selectId] = {
            x: mouseInit.x,
            y: mouseInit.y,
            width: move.x,
            height: move.y,
            id: this.selectId
          }
          this.setSpirit(s, move.x, move.y, mouseInit.x, mouseInit.y)
        }
        // 移动编辑操做
        // mouseInit = { x: mouse.x, y: mouse.y }
        // this.dragRect(moved, mouse.x, mouse.y, move.x, move.y, this.selectId)
      })
    },
    /**
     * @desc: 初始化矩形rectList
     * @author: majun
     */
    initDrawRect(layer) {
      this.rectList.map(item => {
        const s = new Sprite()
        const { width, height, x, y } = item
        this.setRect(s, width, height, x, y)
        layer.append(s)
      })
    },
    /**
     * @desc: 判断是否激活选择框
     * @author: majun
     * @param {*} mouse
     */
    getSelectRect(mouse) {
      let selectList = this.rectList.filter(item => {
        const xFlag =
          mouse.x > item.x - this.circlsRadius &&
          mouse.x < item.x + item.width + this.circlsRadius
        const yFlag =
          mouse.y > item.y - this.circlsRadius &&
          mouse.y < item.y + item.height + this.circlsRadius
        return xFlag && yFlag
      })
      if (selectList.length) {
        this.selectId =
          selectList[selectList.length - 1] &&
          selectList[selectList.length - 1].id
        this.drawRectBorder(this.baseInstance, this.selectId)
        return true
      }
      return false
    },
    /**
     * @desc: 拖拽矩形本体及边
     * @author: majun
     * @param {*} moved
     * @param {*} x
     * @param {*} y
     * @param {*} moveX
     * @param {*} moveY
     * @param {*} id
     */
    dragRect(moved, x, y, moveX, moveY, id) {
      if (id === null) return
      this.rectList.map(item => {
        if (item.id === id) {
          const getPoint = (a, b, step) => [
            a - step,
            a + step,
            a + b - step,
            a + b + step
          ]
          const xLine = getPoint(item.x, item.width, this.lineWidth),
            yLine = getPoint(item.y, item.height, this.lineWidth),
            xCircle = getPoint(item.x, item.width, this.circlsRadius),
            yCircle = getPoint(item.y, item.height, this.circlsRadius)
          const move =
              x > xLine[1] && x < xLine[2] && y > yLine[1] && y < yLine[2],
            lLine = x > xLine[0] && x < xLine[1],
            rLine = x > xLine[2] && x < xLine[3],
            tLine = y > yLine[0] && y < yLine[1],
            bLine = y > yLine[2] && y < yLine[3],
            ltCircle =
              x > xCircle[0] &&
              x < xCircle[1] &&
              y > yCircle[0] &&
              y < yCircle[1],
            lbCircle =
              x > xCircle[0] &&
              x < xCircle[1] &&
              y > yCircle[2] &&
              y < yCircle[3],
            rtCircle =
              x > xCircle[2] &&
              x < xCircle[3] &&
              y > yCircle[0] &&
              y < yCircle[1],
            rbCircle =
              x > xCircle[2] &&
              x < xCircle[3] &&
              y > yCircle[2] &&
              y < yCircle[3]

          // 使用当前 cursor 状态
          if (this.currentCursor) {
            return this.throttle(this.reShowRect)(
              moveX,
              moveY,
              moved,
              id,
              this.currentCursor
            )
          }

          if (ltCircle) {
            this.throttle(this.reShowRect)(moveX, moveY, moved, id, 'ltCircle')
          } else if (lbCircle) {
            this.throttle(this.reShowRect)(moveX, moveY, moved, id, 'lbCircle')
          } else if (rtCircle) {
            this.throttle(this.reShowRect)(moveX, moveY, moved, id, 'rtCircle')
          } else if (rbCircle) {
            this.throttle(this.reShowRect)(moveX, moveY, moved, id, 'rbCircle')
          } else if (lLine) {
            this.throttle(this.reShowRect)(moveX, moveY, moved, id, 'lLine')
          } else if (rLine) {
            this.throttle(this.reShowRect)(moveX, moveY, moved, id, 'rLine')
          } else if (tLine) {
            this.throttle(this.reShowRect)(moveX, moveY, moved, id, 'tLine')
          } else if (bLine) {
            this.throttle(this.reShowRect)(moveX, moveY, moved, id, 'bLine')
          } else if (move) {
            this.throttle(this.reShowRect)(moveX, moveY, moved, id, 'move')
          } else {
            this.baseTarget.style.cursor = 'default'
          }
        }
      })
    },
    /**
     * @desc:
     * @author: majun
     * @param {*} fn
     * @param {*} time
     */
    throttle(fn, time = 10) {
      let timer = null
      return (...args) => {
        if (!timer) {
          timer = setTimeout(() => {
            fn.apply(null, args)
            timer = null
          }, time)
        }
      }
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
