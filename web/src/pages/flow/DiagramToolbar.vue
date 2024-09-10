<template>
  <div class="diagram-toolbar-container">
    <div class="diagram-toolbar">
      <div>
        <button class="toolbar-item" :class="{'disabled': !redoAble}" @click="$_saveGraph">返回</button>
      </div>
      <div>
        <button class="toolbar-item" :class="{'disabled': !redoAble}" @click="$_saveGraph">保存</button>
      </div>
      <div>
        <el-input v-model="linetype"  @keydown.native.stop></el-input>
      </div>
    </div>
    <div class="diagram-toolbar">
      <div class="toolbar-item" :class="{'selection-active': selectionOpened}" @click="$_selectionSelect()">
        <area-select size="18" />
      </div>
      <!-- <div class="toolbar-item toolbar-color-picker">
        <el-popover
          placement="top-start"
          title="填充样式"
          width="220"
          trigger="click"
        >
          <sketch-picker :value="fillColor"  @input="$_changeFillColor"/>
          <color-fill size="24" slot="reference" />
        </el-popover>
      </div> -->
      <!-- <div class="toolbar-item">
        <color-text size="20" />
      </div>
      <div class="toolbar-item">
        <icon-font size="18" />
      </div>
      <div class="toolbar-item">
        <icon-blod size="18" />
      </div>
      <div class="toolbar-item">
        <icon-line size="18" />
      </div> -->
      <div class="toolbar-item" @click="$_zoomIn()">
        <zoom-in size="18" />
      </div>
      <div class="toolbar-item" @click="$_zoomOut()">
        <zoom-out size="18" />
      </div>
      <div class="toolbar-item" :class="{'disabled': !undoAble}" @click="$_undo()">
        <i class="el-icon-back"></i>
      </div>
      <div class="toolbar-item" :class="{'disabled': !redoAble}" @click="$_redo()">
        <i class="el-icon-right"></i>
      </div>
      <div>
        <el-select v-model="linetype" size="mini" @change="$_changeLineType">
          <el-option
              v-for="item in lineOptions"
              :key="item.value"
              :value="item.value"
              :label="item.label"
          ></el-option>
        </el-select>
      </div>
    </div>
    <div class="diagram-toolbar">
      <div>
        <button class="toolbar-item" :class="{'disabled': !redoAble}" @click="$_saveGraph">导入</button>
      </div>
      <div>
        <button class="toolbar-item" :class="{'disabled': !redoAble}" @click="$_saveGraph">导出</button>
      </div>
    </div>
  </div>
</template>

<script>
// import { Sketch } from 'vue-color'
// import ColorFill from './icon/ColorFill.vue'
// import ColorText from './icon/ColorText.vue'
// import IconFont from './icon/Font.vue'
// import IconBlod from './icon/Blod.vue'
// import IconLine from './icon/Line.vue'
import ZoomIn from './icon/ZoomIn.vue'
import ZoomOut from './icon/ZoomOut.vue'
import StepBack from './icon/StepBack.vue'
import StepFoward from './icon/StepFoward.vue'
import AreaSelect from './icon/AreaSelect.vue'

export default {
  props: {
    lf: null,
    activeEdges: Array,
    fillColor: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      selectionOpened: false,
      undoAble: false,
      redoAble: false,
      colors: '#345678',
      linetype: 'pro-polyline',
      lineOptions: [
        {
          value: 'pro-polyline',
          label: '折线'
        },
        {
          value: 'pro-line',
          label: '直线'
        },
        {
          value: 'pro-bezier',
          label: '曲线'
        }
      ]
    }
  },
  mounted () {
    this.$props.lf.on('history:change', ({ data: { undoAble, redoAble } }) => {
      this.$data.redoAble = redoAble
      this.$data.undoAble = undoAble
    })
  },
  methods: {
    $_changeFillColor (val) {
      this.$emit('changeNodeFillColor', val.hex)
    },
    $_saveGraph () {
      this.$emit('saveGraph')
    },
    $_zoomIn () {
      this.$props.lf.zoom(true)
    },
    $_zoomOut () {
      this.$props.lf.zoom(false)
    },
    $_undo () {
      if (this.$data.undoAble) {
        this.$props.lf.undo()
      }
    },
    $_redo () {
      if (this.$data.redoAble) {
        this.$props.lf.redo()
      }
    },
    $_selectionSelect () {
      this.selectionOpened = !this.selectionOpened
      if (this.selectionOpened) {
        this.lf.extension.selectionSelect.openSelectionSelect()
      } else {
        this.lf.extension.selectionSelect.closeSelectionSelect()
      }
    },
    $_changeLineType(value) {
      const {lf, activeEdges} = this.$props
      const {graphModel} = lf
      lf.setDefaultEdgeType(value)
      if(activeEdges && activeEdges.length > 0) {
        activeEdges.forEach(edge => {
          graphModel.changeEdgeType(edge.id, value)
        })
      }
    }
  },
  components: {
    // ColorFill,
    // ColorText,
    // IconFont,
    // IconBlod,
    // IconLine,
    ZoomIn,
    ZoomOut,
    StepBack,
    StepFoward,
    AreaSelect,
    // SketchPicker: Sketch
  }
}
</script>

<style scoped>

.diagram-toolbar-container {
  position: absolute;
  height: 60px;
  width: 85%;
  top: 10px;
  left: 185px;
  /*left: 50%;*/
  /*transform: translateX(-50%);*/
  display: flex;
  justify-content: space-between;
  z-index: 10;
}

.diagram-toolbar {
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid #e5e5e5;
  border-radius: 5px;
  /* 添加悬浮阴影 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background: #f9f7f7;
  padding: 5px;
  margin: 0 10px 0 10px;
}

.toolbar-item {
  width: 35px; /* 按钮的宽度 */
  height: 35px; /* 按钮的高度 */
  border: 1px solid #d2d2d2; /* 按钮边框 */
  border-radius: 5px; /* 可选：圆角 */
  margin: 12px 10px;
  transition: background-color 0.3s ease; /* 悬停效果 */
  display: flex;
  justify-content: center;
  align-items: center;
}


.toolbar-item i {
  font-size: 18px; /* 图标的大小 */
}

.toolbar-item.disabled i {
  color: #bcbcbc; /* 禁用时图标的颜色 */
  cursor: not-allowed; /* 禁用时鼠标样式 */
}

.toolbar-item:hover {
  background-color: #dbe2ef; /* 悬停时按钮背景色 */
}

.selection-active {
  background: #33a3dc;
}
</style>
