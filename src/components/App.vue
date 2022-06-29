<template>
  <div id="app">
    <div :style="picStyle" id="adaptive"></div>
  </div>
</template>

<script>
import { Scene, Sprite, Label } from 'spritejs'
export default {
  name: '',
  components: {},
  data() {
    return {}
  },
  computed: {
    picStyle() {
      return {
        height: '500px',
        width: '100%'
      }
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      const container = document.getElementById('adaptive')
      const scene = new Scene({
        container,
        width: 1200,
        height: 600
        // contextType: '2d',
      })
      const layer = scene.layer()

      const robot = new Sprite(
        'http://192.168.31.66:30000/file/145510778325214412929832'
      )
      robot.attr({
        anchor: [0.5, 0.5],
        pos: [600, 300],
        scale: 0.5
      })

      layer.append(robot)

      const label = new Label(`图片大小： ${robot.contentSize}`)
      label.attr({
        anchor: [0.5, 0.5],
        pos: [600, 100],
        font: '36px Arial'
      })

      layer.append(label)
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
