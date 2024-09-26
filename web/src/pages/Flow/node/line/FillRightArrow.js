import { h } from '@logicflow/core'
import RectNode from '../basic/RectNode'

// 自定义图形--大括号
class FillRightArrowModel extends RectNode.model {
  initNodeData(data) {
    super.initNodeData(data)
    this.width = 100
    this.height = 30
  }
}


class FillRightArrowNode extends RectNode.view {
  getResizeShape() {
    const { x, y, width, height } = this.props.model;
    const style = this.props.model.getNodeStyle();

    // 动态计算大括号的路径
    const bracePath = `
      M ${x - width / 2} ${y}
      H ${x + width / 2}
      L ${x + (width / 5) * 2} ${y - height / 4}
      V ${y + height / 4}
      L ${x + width / 2} ${y}
    `;

    const braceAttrs = {
      d: bracePath,
      fill: '#000',
      stroke: style.stroke || '#000',
      'stroke-width': 1,
    };

    return h('g', {}, [
      h('path', { ...braceAttrs })  // 绘制左大括号的路径
    ]);
  }
}

export default {
  type: 'fill-right-arrow',
  view: FillRightArrowNode,
  model: FillRightArrowModel
}