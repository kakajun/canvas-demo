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
import { Scene, Group, Sprite, Polyline, Ring, Path } from 'spritejs'
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
      color1: 'blue',
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
      minSelectArea: 5, // 选区最小距离
      layer: null,
      activeCtx: null,
      currentCursor: null,
      baseInstance: null, // 实例
      tempGroup: null, // 临时实例
      circlsRadius: 4,
      lineWidth: 2, // 宽的宽度
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
      this.scene = new Scene({
        container,
        width: this.width,
        height: this.height
      })
      this.layer = this.scene.layer()
      this.baseInstance = new Group()
      this.tempGroup = this.baseInstance.cloneNode()
      this.layer.append(this.baseInstance)
      this.layer.append(this.tempGroup)
      // 初始化矩形rectList
      this.drawRect(this.baseInstance)
    },
    filterObject(type) {
      this.paintType = type
    },

    /**
     * @desc: 画矩形
     * @author: majun
     * @param {*} s
     * @param {*} obj
     */
    setRect(s, obj) {
      s.attr({
        ...obj,
        program: obj,
        opacity: 0.3,
        bgcolor: 'black',
        borderWidth: 2,
        borderRadius: 0
      })
    },
    /**
     * @desc:画选框操做
     * @author: majun
     */
    drawRect(group) {
      this.initDrawRect(group)
      let [moveIn, moved, mouseInit, mouse, move, s] = [
        false,
        false,
        {},
        {},
        {},
        {}
      ]
      this.layer.addEventListener('mousedown', e => {
        mouseInit = { x: e.x, y: e.y }
        this.selectId = this.rectList.length
        moveIn = true
        moved = this.getSelectRect(mouseInit)
        console.log(moved, 'moved')
        s = new Sprite()
        group.append(s)
      })

      this.layer.addEventListener('mouseup', e => {
        moveIn = false
        moved = false
        this.currentCursor = null
        this.reShowRect(0, 0, moved, this.selectId, 'revise')
      })
      this.layer.addEventListener('mousemove', e => {
        mouse = { x: e.x, y: e.y }
        move = { x: mouse.x - mouseInit.x, y: mouse.y - mouseInit.y }
        // 新建拖拉选框
        if (moveIn && !moved) {
          const item = {
            x: mouseInit.x,
            y: mouseInit.y,
            width: move.x,
            height: move.y,
            id: this.selectId
          }
          this.rectList[this.selectId] = item
          // 画矩形
          this.setRect(s, item)
        } else {
          // 移动编辑操做
          mouseInit = { x: mouse.x, y: mouse.y }
          this.dragRect(moved, mouse.x, mouse.y, move.x, move.y, this.selectId)
        }
      })
    },
    /**
     * @desc: 初始化矩形rectList
     * @author: majun
     */
    initDrawRect(group) {
      this.rectList.map(item => {
        const s = new Sprite()
        this.setRect(s, item)
        group.append(s)
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
        this.drawRectBorder(this.selectId)
        return true // 要移动
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
            this.layer.canvas.style.cursor = 'default'
          }
        }
      })
    },
    /**
     * @desc: 画外边框和四点
     * @author: majun
     * @param {*} instance
     * @param {*} id
     */
    drawRectBorder(id) {
      // 先清空所有
      this.tempGroup.removeAllChildren()
      this.rectList.map(item => {
        if (item.id === id) {
          const [startAngle, endAngle, pointList] = [
            0,
            360,
            [
              { x: item.x + item.width, y: item.y },
              { x: item.x + item.width, y: item.y + item.height },
              { x: item.x, y: item.y + item.height },
              { x: item.x, y: item.y }
            ]
          ]
          // 画边框
          const linePoints = []
          pointList.forEach(obj => {
            linePoints.push(obj.x)
            linePoints.push(obj.y)
          })
          const line = new Polyline({
            points: [item.x, item.y, ...linePoints],
            strokeColor: this.color1,
            lineWidth: this.lineWidth
          })
          this.tempGroup.append(line)
          const ring = new Ring({
            outerRadius: this.circlsRadius,
            startAngle,
            endAngle,
            strokeColor: this.color1,
            fillColor: '#fff'
          })
          // 画四角圆
          pointList.map(item => {
            const ring2 = ring.cloneNode()
            ring2.attr({
              pos: [item.x, item.y]
            })
            this.tempGroup.append(ring2)
          })
        }
      })
    },
    /**
     * @desc: 鼠标抬起后操作集合
     * @author: majun
     * @param {*} moveX
     * @param {*} moveY
     * @param {*} moved
     * @param {*} id
     * @param {*} cursorStr
     */
    reShowRect(moveX, moveY, moved, id, cursorStr) {
      this.layer.canvas.style.cursor = cursorStr
      this.currentCursor = moved ? cursorStr : null
      // 先清掉所有
      this.tempGroup.removeAllChildren()
      switch (cursorStr) {
        case 'move':
          console.log('move')
          this.layer.canvas.style.cursor = 'move'
          moved &&
            this.rectList.map(item => {
              if (item.id === id) {
                item.x += moveX
                item.y += moveY
              }
            })
          break
        case 'lLine':
          console.log('lLine')
          this.layer.canvas.style.cursor = 'e-resize'
          moved &&
            this.rectList.map(item => {
              if (item.id === id) {
                item.x += moveX
                item.width -= moveX
              }
            })
          break
        case 'rLine':
          this.layer.canvas.style.cursor = 'e-resize'
          moved &&
            this.rectList.map(item => {
              if (item.id === id) {
                item.width += moveX
              }
            })
          break
        case 'tLine':
          this.layer.canvas.style.cursor = 'n-resize'
          moved &&
            this.rectList.map(item => {
              if (item.id === id) {
                item.y += moveY
                item.height -= moveY
              }
            })
          break
        case 'bLine':
          this.layer.canvas.style.cursor = 'n-resize'
          moved &&
            this.rectList.map(item => {
              if (item.id === id) {
                item.height += moveY
              }
            })
          break
        case 'ltCircle':
          this.layer.canvas.style.cursor = 'nw-resize'
          moved &&
            this.rectList.map(item => {
              if (item.id === id) {
                item.x += moveX
                item.y += moveY
                item.width -= moveX
                item.height -= moveY
              }
            })
          break
        case 'lbCircle':
          this.layer.canvas.style.cursor = 'ne-resize'
          moved &&
            this.rectList.map(item => {
              if (item.id === id) {
                item.x += moveX
                item.width -= moveX
                item.height += moveY
              }
            })
          break
        case 'rtCircle':
          this.layer.canvas.style.cursor = 'ne-resize'
          moved &&
            this.rectList.map(item => {
              if (item.id === id) {
                item.y += moveY
                item.height -= moveY
                item.width += moveX
              }
            })
          break
        case 'rbCircle':
          this.layer.canvas.style.cursor = 'nw-resize'
          moved &&
            this.rectList.map(item => {
              if (item.id === id) {
                item.width += moveX
                item.height += moveY
              }
            })
          break
        case 'revise':
          this.rectList = this.rectList.filter(item => item)
          this.rectList.map((item, index, arr) => {
            if (item.id === id) {
              if (
                Math.abs(item.width) < this.minSelectArea ||
                Math.abs(item.height) < this.minSelectArea
              ) {
                this.$message.error('框选区太小，请从新框选!')
                arr.splice(index, 1)
                this.layer.canvas.style.cursor = 'default'
              }
            }
          })
          this.rectList.map((item, index, arr) => {
            if (item.id === id) {
              if (item.width < 0) {
                item.x += item.width
                item.width = Math.abs(item.width)
              }
              if (item.height < 0) {
                item.y += item.height
                item.height = Math.abs(item.height)
              }
            }
            item.id = index
          })
          break
      }
      this.drawRectBorder(id)
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
