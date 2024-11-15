import { h } from '@logicflow/core'
import RectNode from '../basic/RectNode'

// 自定义图形--大括号
class BraceModel extends RectNode.model {
  initNodeData(data) {
    super.initNodeData(data)
    this.width = 30
    this.height = 120
  }
}


class BraceNode extends RectNode.view {
  getResizeShape() {
    const { x, y, width, height } = this.props.model;
    const style = this.props.model.getNodeStyle();

    // 动态计算大括号的路径
    const bracePath = `
      M ${x + width / 2} ${y - height / 2}
      A ${width / 4} ${width / 4} 0 0 0 ${x + width / 4} ${y - height / 2 + width / 4}
      V ${y - height / 12 + width / 4}
      L ${x + width / 6} ${y - height / 12 + width / 3}
      L ${x + width / 4} ${y - height / 12 + (width / 12) * 5}
      V ${y + height / 3 + (width / 12) * 5}
      A ${width / 4} ${width / 4} 0 0 0 ${x + width / 2} ${y + height / 3 + (width / 3) * 2}
    `;

    const braceAttrs = {
      d: bracePath,
      fill: 'none',
      stroke: style.stroke || '#000',
      'stroke-width': 1,
    };

    return h('g', {}, [
      h('path', { ...braceAttrs })  // 绘制左大括号的路径
    ]);
  }
}

export default {
  type: 'left-brace',
  view: BraceNode,
  model: BraceModel
}