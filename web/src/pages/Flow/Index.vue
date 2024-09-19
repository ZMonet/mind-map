<template>
  <div class="diagram">
    <diagram-toolbar
      v-if="lf"
      :lf="lf"
      :activeEdges="activeEdges"
      @changeNodeFillColor="$_changeNodeFill"
      @saveGraph="$_saveGraph"
    />
    <div class="diagram-main">
      <diagram-sidebar class="diagram-sidebar" @dragInNode="$_dragInNode" />
      <div class="diagram-container" ref="container">
        <div class="diagram-wrapper">
          <div class="lf-diagram" ref="diagram"></div>
        </div>
      </div>
    </div>
    <!-- 右侧属性面板 -->
    <PropertyPanel
      class="diagram-panel"
      v-if="activeNodes.length>0 || activeEdges.length > 0"
      :onlyEdge="activeNodes.length === 0"
      :elementsStyle="properties"
      @setStyle="$_setStyle"
      @setZIndex="$_setZIndex"
    />
  </div>
</template>

<script>
import LogicFlow from '@logicflow/core'
import { SelectionSelect, Menu, MiniMap, Snapshot, InsertNodeInPolyline  } from '@logicflow/extension'
import '@logicflow/core/lib/style/index.css'
import '@logicflow/extension/lib/style/index.css'
import DiagramToolbar from './DiagramToolbar.vue'
import DiagramSidebar from './DiagramSidebar.vue'
import PropertyPanel from './PropertyPanel.vue'
import { registerCustomElement } from './node'
import {getRequest, postJsonRequest} from "@/api/api";


export default {
  name: 'Diagram',
  data () {
    return {
      sidebarWidth: 200,
      diagramWidth: 0,
      diagramHeight: 0,
      lf: '',
      filename: '',
      activeNodes: [],
      activeEdges: [],
      properties: {}
    }
  },
  async mounted () {
    let data = ''
    if (window.location.search) {
      const query = window.location.search.substring(1).split('&').reduce((map, kv) => {
        const [key, value] = kv.split('=')
        map[key] = value
        return map
      }, {})
      this.filename = query.filename
      const d = window.sessionStorage.getItem(this.filename)
      if (d) {
        data = JSON.parse(d)
      }
    }

    data = await this.loadFlowData(this.$route.query.articleId)
    this.initLogicFlow(data)
  },
  methods: {
    initLogicFlow (data) {
      // 引入框选插件
      LogicFlow.use(SelectionSelect)
      LogicFlow.use(Menu)
      LogicFlow.use(MiniMap)
      LogicFlow.use(Snapshot)
      //拖动图形到两个图形连接线上时，该图形自动变成两个图形的中间节点
      LogicFlow.use(InsertNodeInPolyline)

      // 浏览模式
      // const SilentConfig = {
      //   stopZoomGraph: false,
      //   stopScrollGraph: false,
      //   stopMoveGraph: false,
      //   adjustEdge: false,
      //   adjustEdgeStartAndEnd: false,
      //   adjustNodePosition: false,
      //   hideAnchors: true,
      //   nodeSelectedOutline: true,
      //   nodeTextEdit: false,
      //   edgeTextEdit: false,
      //   nodeTextDraggable: false,
      //   edgeTextDraggable: false,
      // };

      //编辑模式
      const editConfig = {
        //元素重合时堆叠模式
        //值为0: 默认模式，节点和边被选中，会被显示在最上面。当取消选中后，元素会恢复之前的层级。
        //值为1: 递增模式，节点和边被选中，会被显示在最上面。当取消选中后，元素会保持层级。
        // overlapMode: 1,
        //文字自动换行
        autoWrap: true,
        //TODO:连接线文字可拖拽,加了配置但不生效
        edgeTextDraggable: true,
        //节点缩放和旋转
        allowResize: true,
        allowRotate: true,
        //局部渲染
        partial: true,
        metaKeyMultipleSelected: true,
        keyboard: {
          enabled: true,
          shortcuts: [
            {
              // 自定义删除快捷键，默认的删除快捷键为 backspace
              keys: ["delete"],
              callback: () => {
                const elements = lf.getSelectElements(true);
                lf.clearSelectElements();
                elements.edges.forEach((edge) => lf.deleteEdge(edge.id));
                elements.nodes.forEach((node) => lf.deleteNode(node.id));
              },
            },{
              // 自定义移动快捷键
              keys: ["up"],
              callback: () => {
                const elements = lf.getSelectElements(true);
                lf.graphModel.moveNodes(elements.nodes.map(i=>i.id), 0, -1, true);
              },
            },{
              keys: ["down"],
              callback: () => {
                const elements = lf.getSelectElements(true);
                lf.graphModel.moveNodes(elements.nodes.map(i=>i.id), 0, 1, true);
              },
            },{
              keys: ["left"],
              callback: () => {
                const elements = lf.getSelectElements(true);
                lf.graphModel.moveNodes(elements.nodes.map(i=>i.id), -1, 0, true);
              },
            },{
              keys: ["right"],
              callback: () => {
                const elements = lf.getSelectElements(true);
                lf.graphModel.moveNodes(elements.nodes.map(i=>i.id), 1, 0, true);
              },
            }
          ],
        },
        grid: {
          visible: false,
          size: 5
        },
        background: {
          backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2QwZDBkMCIgb3BhY2l0eT0iMC4yIiBzdHJva2Utd2lkdGg9IjEiLz48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZDBkMGQwIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=")',
          backgroundRepeat: 'repeat'
        }
      };

      const lf = new LogicFlow({
        container: this.$refs.diagram,
        ...editConfig
      })

      lf.setTheme({
          baseEdge: { strokeWidth: 1 },
          baseNode: { strokeWidth: 1 },
          nodeText: { overflowMode: 'autoWrap', lineHeight: 1.5 },
          edgeText: { overflowMode: 'autoWrap', lineHeight: 1.5 }
        })
      // 注册自定义元素
      registerCustomElement(lf)
      lf.setDefaultEdgeType('pro-polyline')
      lf.render(data)
      this.lf = lf
      this.lf.on('selection:selected,node:click,blank:click,edge:click', () => {
        this.$nextTick(() => {
          const { nodes, edges } = this.lf.getSelectElements()
          this.$set(this, 'activeNodes', nodes)
          this.activeNodes = nodes
          this.activeEdges = edges
          this.$_getProperty()
        })
      })
    },

    loadFlowData(articleId){
      return new Promise((resolve) => {
        getRequest('/blog/content/detail?articleId=' + articleId).then(res => {
          let data = res.data
          if (data.code === 200) {
            this.$store.commit('setArticleInfo', {
              articleId: data.data.articleId,
              title: data.data.title,
              contentId: data.data.contentId
            })
            let content_data = data.data.content ? JSON.parse(data.data.content) : {}
            resolve(content_data)
          }else {
            resolve({})
          }
        })
      })
    },
    // 获取可以进行设置的属性
    $_getProperty () {
      let properties = {}
      const { nodes, edges } = this.lf.getSelectElements()
      nodes.forEach(node => {
        properties = { ...properties, ...node.properties }
      })
      edges.forEach(edge => {
        properties = { ...properties, ...edge.properties }
      })
      this.properties = properties
      return properties
    },
    $_dragInNode (type) {
      this.lf.dnd.startDrag({
        type
      })
    },
    $_changeNodeFill (color) {
      const { nodes } = this.lf.graphModel.getSelectElements()
      nodes.forEach(({ id }) => {
        this.lf.setProperties(id, {
          fill: color
        })
      })
    },
    $_setStyle (item) {
      this.activeNodes.forEach(({ id }) => {
        this.lf.setProperties(id, item)
      })
      this.activeEdges.forEach(({ id }) => {
        this.lf.setProperties(id, item)
      })
      this.$_getProperty()
    },
    $_setZIndex (type) {
      this.activeNodes.forEach(({ id }) => {
        this.lf.setElementZIndex(id, type)
      })
      this.activeEdges.forEach(({ id }) => {
        this.lf.setElementZIndex(id, type)
      })
    },

    $_saveGraph () {
      const data = {
        ...this.$store.state.articleInfo,
        content: JSON.stringify(this.lf.getGraphData())
      }
      postJsonRequest('/blog/content/save', data).then(res => {
        if (res.data.code === 200 ) {
          //新建第一次保存要刷新下contentId
          if(!this.$store.state.articleInfo.contentId){
            this.$store.commit('setArticleInfo', {
              contentId: res.data.data,
            })
          }
          this.$message({type: 'success', message: '保存成功'});
        }else {
          this.$message({type: 'error', message: '保存失败：'+res.data.message});
        }
      })
    },

    download (filename, text) {
      window.sessionStorage.setItem(filename, text)
      const element = document.createElement('a')
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
      element.setAttribute('download', filename)
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }
  },
  components: {
    DiagramToolbar,
    DiagramSidebar,
    PropertyPanel
  }
}
</script>

<style scoped>

.diagram {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}
.diagram * {
  box-sizing: border-box;
}

.diagram-main {
  display: flex;
  width: 100%;
  height: 100%;
}
.diagram-sidebar {
  width: 185px;
  height: calc(100% - 40px);
  border-right: 1px solid #dadce0;
  padding: 10px;
}
.diagram-panel {
  width: 300px;
  background: #fff;
  height: calc(100% - 10px);
  position: absolute;
  right: 0px;
  top: 5px;
  border-left: 1px solid #dadce0;
  z-index: 99;
}
.diagram-container {
  flex: 1;
}
/* 由于背景图和gird不对齐，需要css处理一下 */
.diagram /deep/ .lf-background {
  left: -9px;
}
.diagram-wrapper {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}
.lf-diagram {
  box-shadow: 0px 0px 4px #838284;
  width: 100%;
  height: 100%;
}
::-webkit-scrollbar {
  width: 9px;
  height: 9px;
  background: white;
  border-left: 1px solid #e8e8e8;
}
::-webkit-scrollbar-thumb {
  border-width: 1px;
  border-style: solid;
  border-color: #fff;
  border-radius: 6px;
  background: #c9c9c9;
}
::-webkit-scrollbar-thumb:hover {
  background: #b5b5b5;
}
</style>