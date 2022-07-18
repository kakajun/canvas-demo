<template>
  <div class="edit-anchor-zone">
    <div class="edit-toolbar">
      <span class="toolbar-icon-wrap">
        <el-tooltip
          class="item"
          effect="light"
          content="框选锚点"
          placement="top"
        >
          <el-button @click="drawAnchor">框选锚点</el-button>
        </el-tooltip>
      </span>
    </div>
    <div class="edit-body">
      <div class="canvas-wrapper" ref="canvasWrapper">
        <canvas
          width="1000"
          height="700"
          ref="baseCanvas"
          class="canvas"
        ></canvas>
      </div>
    </div>

    <div style="margin-top: 20px">
      <el-button @click="mark">标记</el-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      wrapperTarget: null,
      baseTarget: null,
      baseInstance: null,
      selectId: null,
      currentCursor: null,
      centerLineIndex: null,
      centerLineShow: true,

      //base data
      drawWidth: 1000,
      drawHeight: 700,
      initScaleVal: 1,
      currentScaleVal: 1,
      circlsRadius: 2,
      step: 0.05,
      minSelectArea: 15,
      imgWidth: 0,
      imgHeight: 0,
      imgBase64Code: 0,
      movePoint: { x: null, y: null, width: null, height: null },

      // 选框
      rectList: [],
      color1: '#FF7782',
      opacity: 0.3,
      lineWidth: 2
    }
  },
  watch: {
    rectList: function (newVal, oldVal) {
      console.log('rectList: ', newVal)
    }
  },
  methods: {
    /**
     * @desc:
     * @author: majun
     */
    mark() {
      this.initDrawRect()
      this.drawAnchor()
    },
    /**
     * @desc:
     * @author: majun
     * @param {*} data
     */
    initDraw(data) {
      this.imgWidth = 1913
      this.imgHeight = 1122
      this.imgBase64Code = 'https://p5.ssl.qhimg.com/t01a2bd87890397464a.png'
      this.baseTarget = this.$refs.baseCanvas
      this.wrapperTarget = this.$refs.canvasWrapper
      this.baseInstance = this.baseTarget.getContext('2d')
      this.drawCanvas()
      this.drawAnchor()
    },

    /**
     * @desc:
     * @author: majun
     */
    drawAnchor() {
      this._drawRect()
    },
    /**
     * @desc:
     * @author: majun
     */
    setWrapper() {
      this.wrapperTarget.style.left = `${this.movePoint.x}px`
      this.wrapperTarget.style.top = `${this.movePoint.y}px`
      this.wrapperTarget.style.width = `${this.movePoint.width}px`
      this.wrapperTarget.style.height = `${this.movePoint.height}px`
    },
    /**
     * @desc:
     * @author: majun
     */
    setCanvas() {
      this.baseTarget.width = this.movePoint.width
      this.baseTarget.height = this.movePoint.height
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
    },
    /**
     * @desc:
     * @author: majun
     */
    clearHandle() {
      this.baseTarget.onmousedown = null
      this.baseTarget.onmousemove = null
      this.baseTarget.onmouseup = null

      this.wrapperTarget.onmousedown = null
      this.wrapperTarget.onmousemove = null
      this.wrapperTarget.onmouseup = null
    },

    // 画布操做
    /**
     * @desc:
     * @author: majun
     * @param {*} moveX
     * @param {*} moveY
     */
    drawCanvas(moveX = 0, moveY = 0) {
      const [width, height] = [
        this.imgWidth * this.currentScaleVal,
        this.imgHeight * this.currentScaleVal
      ]
      const img = new Image()
      img.onload = () => {
        ;[this.movePoint.x, this.movePoint.y] = [
          (this.drawWidth - width) / 2,
          (this.drawHeight - height) / 2
        ]
        ;[this.movePoint.width, this.movePoint.height] = [width, height]
        this.setWrapper()
        this.setCanvas()
        this.baseTarget.style.backgroundImage = `url(${img.src})`
        this.baseTarget.style.backgroundSize = `${width}px ${height}px`
        this.initDrawRect()
      }
      img.src = this.imgBase64Code
    },
    /**
     * @desc:
     * @author: majun
     */
    initDrawRect() {
      this.baseInstance.clearRect(
        0,
        0,
        this.movePoint.width,
        this.movePoint.height
      )

      this.rectList.map(item => {
        this.baseInstance.beginPath()
        this.baseInstance.fillStyle = this.color1
        this.baseInstance.globalAlpha = this.opacity
        this.baseInstance.fillRect(item.x, item.y, item.width, item.height)
        this.baseInstance.closePath()
      })
    },

    // 选框操做
    /**
     * @desc:
     * @author: majun
     */
    _drawRect() {
      let [moveIn, moved, mouseInit, mouse, move, selectList] = [
        false,
        false,
        {},
        {},
        {},
        []
      ]

      this.baseTarget.onmousedown = e => {
        mouseInit = { x: e.offsetX, y: e.offsetY }
        this.selectId = this.rectList.length
        moveIn = true
        moved = this.getSelectRect(mouseInit)
      }
      this.baseTarget.onmousemove = e => {
        mouse = { x: e.offsetX, y: e.offsetY }
        move = { x: mouse.x - mouseInit.x, y: mouse.y - mouseInit.y }

        // 新建拖拉选框
        if (moveIn && !moved) {
          return this.drawRectWithColor(
            this.baseInstance,
            mouseInit.x,
            mouseInit.y,
            move.x,
            move.y,
            this.selectId
          )
        }

        // 移动编辑操做
        mouseInit = { x: mouse.x, y: mouse.y }
        this.dragRect(moved, mouse.x, mouse.y, move.x, move.y, this.selectId)
      }

      this.baseTarget.onmouseup = e => {
        moveIn = false
        moved = false
        this.currentCursor = null
        this.reShowRect(0, 0, moved, this.selectId, 'revise')
      }
    },
    /**
     * @desc:
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
     * @desc:
     * @author: majun
     * @param {*} instance
     * @param {*} x
     * @param {*} y
     * @param {*} width
     * @param {*} height
     * @param {*} id
     */
    drawRectWithColor(instance, x, y, width, height, id) {
      instance.clearRect(0, 0, this.movePoint.width, this.movePoint.height)
      this.initDrawRect()
      this.rectList[id] = {
        x,
        y,
        width,
        height,
        id
      }
    },
    /**
     * @desc:
     * @author: majun
     * @param {*} instance
     * @param {*} id
     */
    drawRectBorder(instance, id) {
      instance.clearRect(0, 0, this.movePoint.width, this.movePoint.height)
      this.initDrawRect()
      this.rectList.map(item => {
        if (item.id === id) {
          const [startAngle, endAngle, pointList] = [
            0,
            2 * Math.PI,
            [
              { x: item.x + item.width, y: item.y },
              { x: item.x + item.width, y: item.y + item.height },
              { x: item.x, y: item.y + item.height },
              { x: item.x, y: item.y }
            ]
          ]

          // 画边框
          instance.beginPath()
          instance.moveTo(item.x, item.y)
          pointList.map(item => {
            instance.lineTo(item.x, item.y)
          })
          instance.strokeStyle = this.color1
          instance.lineWidth = this.lineWidth
          instance.globalAlpha = 1
          instance.stroke()
          instance.closePath()

          // 画四角圆
          pointList.map(item => {
            instance.beginPath()
            instance.arc(
              item.x,
              item.y,
              this.circlsRadius,
              startAngle,
              endAngle
            )
            instance.fillStyle = '#fff'
            instance.fill()
            instance.strokeStyle = this.color1

            instance.lineWidth = this.lineWidth
            instance.globalAlpha = 1
            instance.stroke()
            instance.closePath()
          })
        }
      })
    },
    /**
     * @desc:
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
          // r:right; l:left; t:top; b:bottom;
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
     * @param {*} moveX
     * @param {*} moveY
     * @param {*} moved
     * @param {*} id
     * @param {*} cursorStr
     */
    reShowRect(moveX, moveY, moved, id, cursorStr) {
      this.baseTarget.style.cursor = cursorStr
      this.currentCursor = moved ? cursorStr : null
      this.baseInstance.clearRect(
        0,
        0,
        this.movePoint.width,
        this.movePoint.height
      )
      switch (cursorStr) {
        case 'move':
          this.baseTarget.style.cursor = 'move'
          moved &&
            this.rectList.map(item => {
              if (item.id === id) {
                item.x += moveX
                item.y += moveY
              }
            })
          break
        case 'lLine':
          this.baseTarget.style.cursor = 'e-resize'
          moved &&
            this.rectList.map(item => {
              if (item.id === id) {
                item.x += moveX
                item.width -= moveX
              }
            })
          break
        case 'rLine':
          this.baseTarget.style.cursor = 'e-resize'
          moved &&
            this.rectList.map(item => {
              if (item.id === id) {
                item.width += moveX
              }
            })
          break
        case 'tLine':
          this.baseTarget.style.cursor = 'n-resize'
          moved &&
            this.rectList.map(item => {
              if (item.id === id) {
                item.y += moveY
                item.height -= moveY
              }
            })
          break
        case 'bLine':
          this.baseTarget.style.cursor = 'n-resize'
          moved &&
            this.rectList.map(item => {
              if (item.id === id) {
                item.height += moveY
              }
            })
          break
        case 'ltCircle':
          this.baseTarget.style.cursor = 'nw-resize'
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
          this.baseTarget.style.cursor = 'ne-resize'
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
          this.baseTarget.style.cursor = 'ne-resize'
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
          this.baseTarget.style.cursor = 'nw-resize'
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
                this.baseTarget.style.cursor = 'default'
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
      this.drawRectBorder(this.baseInstance, id)
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initDraw()
    })
  }
}
</script>

<style lang="scss" scoped>
.edit-anchor-zone {
  width: 1000px;
  .edit-toolbar {
    display: flex;
    height: 60px;
    background-color: #565559;
    justify-content: flex-end;
    align-items: center;
    .toolbar-icon-wrap {
      margin-right: 10px;
      .item {
        padding: 8px;
        font-size: 18px;
        color: #e5e5e5;
        background-color: transparent;
        border: 1px solid transparent;
        border-radius: 0;
      }
      &.icon_active {
        .item {
          color: rgb(248 244 244);
          background-color: rgb(236 213 213);
          border-color: rgb(92 90 90);
        }
      }
    }
  }
  .edit-body {
    position: relative;
    height: 720px;
    padding: 10px 0;
    overflow: hidden;
    background-color: rgb(243 237 237);
    box-sizing: border-box;
    .init-page-tip {
      position: absolute;
      top: 40%;
      left: 50%;
      color: #e5e5e5;
      text-align: center;
      transform: translate(-50%, -50%);
      .el-icon-loading {
        margin-bottom: 20px;
        font-size: 40px;
      }
    }
    .canvas-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 1000px;
      height: 700px;
      .canvas {
        position: absolute;
        top: 0;
        left: 0;
      }
    }
  }
}
</style>
