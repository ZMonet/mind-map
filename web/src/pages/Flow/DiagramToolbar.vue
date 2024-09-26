<template>
  <div class="diagram-toolbar-container">
    <div class="diagram-toolbar">
      <div>
        <el-tooltip effect="dark" content="返回" placement="top-start">
          <i class="toolbar-item icon iconfont iconfanhui" :class="{'disabled': !redoAble}" @click="$router.push('/')"/>
        </el-tooltip>
      </div>
      <div>
        <el-tooltip effect="dark" content="保存" placement="top-start">
          <i class="toolbar-item icon iconfont iconbaocun" :class="{'disabled': !redoAble}" @click="$_saveGraph"/>
        </el-tooltip>
      </div>
      <div>
        <el-input v-model="$store.state.articleInfo.title" @change="editTitle"></el-input>
      </div>
    </div>
    <div class="diagram-toolbar">
      <div class="toolbar-item" :class="{'selection-active': selectionOpened}" @click="$_selectionSelect()">
        <el-tooltip effect="dark" content="框选" placement="top-start">
          <i class="icon iconfont iconkuangxuan" />
        </el-tooltip>
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
        <el-tooltip effect="dark" content="放大" placement="top-start">
          <i class="icon iconfont iconfangda" />
        </el-tooltip>
      </div>
      <div class="toolbar-item" @click="$_zoomOut()">
        <el-tooltip effect="dark" content="缩小" placement="top-start">
          <i class="icon iconfont iconsuoxiao" />
        </el-tooltip>
      </div>
      <div class="toolbar-item" :class="{'disabled': !undoAble}" @click="$_undo()">
        <el-tooltip effect="dark" content="撤销" placement="top-start">
          <i class="icon iconfont iconhoutui-shi"></i>
        </el-tooltip>
      </div>
      <div class="toolbar-item" :class="{'disabled': !redoAble}" @click="$_redo()">
        <el-tooltip effect="dark" content="重做" placement="top-start">
          <i class="icon iconfont iconqianjin1"></i>
        </el-tooltip>
      </div>
      <div class="toolbar-item-select">
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
      <div class="toolbar-item">
        <el-tooltip effect="dark" content="导入" placement="top-start">
          <i class="icon iconfont icondaoru"/>
        </el-tooltip>
      </div>
      <div class="toolbar-item">
        <el-tooltip effect="dark" content="导出" placement="top-start">
          <i class="icon iconfont icondaochu" @click="$_exportGraph()"/>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script>


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
    },
    $_exportGraph () {
      const exportOptions = {
        // fileType: 'png', //导出图片的格式，可选值为：png、webp、jpeg、svg，默认值为 png
        // width: 200,  //导出图片的宽度，通常无需设置，设置后可能会拉伸图形
        // height: 200,  //导出图片的宽度，通常无需设置，设置后可能会拉伸图形
        backgroundColor: '#fff',   //导出图片的背景色，默认为透明
        // quality: 0.92, //导出图片的质量。在指定图片格式为 jpeg 或 webp 的情况下，可以从 0 到 1 的区间内选择图片的质量，如果超出取值范围，将会使用默认值 0.92
        // padding: 40, //导出图片的内边距，即元素内容所在区域边界与图片边界的距离，单位为像素，默认为 40
        // partial: false //导出图片时是否开启局部渲染，false：将导出画布上所有的元素，true：只导出画面区域内的可见元素
      }
      this.$props.lf.getSnapshot(this.$store.state.articleInfo.title, exportOptions);
    },
    editTitle(title){
      this.$store.commit('setArticleInfo',{title:title})
    },
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

.toolbar-item-select {
  width: 80px; /* 按钮的宽度 */
  height: 35px; /* 按钮的高度 */
  text-align: center;
  display: flex;
  align-items: center;
  margin: 12px 10px;
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
