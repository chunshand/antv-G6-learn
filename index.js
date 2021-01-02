let currentNodeID = '';
let graph = null;


function LoadGraph(data) {
    const container = document.getElementById('container');
    const width = container.scrollWidth;
    const height = container.scrollHeight || 500;
    // 注册节点-------------------------------------------------------------------------

    const minWidth = 60;
    // 基础的配置
    const BaseConfig = {
        // 
        nameFontSize: 12,
        // 子节点数量宽度
        childCountWidth: 22,
        // 距离左边
        countMarginLeft: 0,
        // padding
        itemPadding: 16,
        // 名称距离左边
        nameMarginLeft: 4,
        // 根节点padding
        rootPadding: 18,
    };
    G6.registerNode('treeNode', {
        draw: (cfg, group) => {
            // cfg 可以回去当前节点的一些主要信息
            const { id, label, collapsed, hoverd, selected, children, depth } = cfg;
            const rootNode = depth === 0;
            // 是否存在子节点
            const hasChildren = children && children.length !== 0;
            const {
                childCountWidth,
                countMarginLeft,
                itemPadding,
                selectedIconWidth,
                nameMarginLeft,
                rootPadding,
            } = BaseConfig;
            // 宽度
            let width = 0;
            const height = 32;
            const x = 0;
            const y = -height / 2;
            // 生成了一个不显示的text节点 为了得到宽度 高度
            // 最大宽度 换行
            const content = cfg.label.replace(/(.{19})/g, '$1\n');
            const text = group.addShape('text', {
                attrs: {
                    text: content,
                    x: 0,
                    y,
                    textAlign: 'left',
                    textBaseline: 'top'
                },
                cursor: 'pointer',
                name: 'name-text-shape',
            });
            // 获取文字的宽
            const textWidth = text.getBBox().width;
            // 宽度 = 文本宽度 
            width =
                textWidth +
                itemPadding +
                nameMarginLeft;

            width = width < minWidth ? minWidth : width;
            // 不是根节点并且不是 存在子节点 则增加
            if (!rootNode && hasChildren) {
                width += countMarginLeft;
                width += childCountWidth;
            }
            const keyShapeAttrs = {
                x,
                y,
                // 计算出来的 等于文本的宽度 加上 其他节点的宽度
                width,
                height,
                radius: 4,
            };

            if (rootNode && selected) {
                keyShapeAttrs.fill = '#e8f7ff';
                keyShapeAttrs.stroke = '#e8f7ff';
            }
            // 主要的节点
            const keyShape = group.addShape('rect', {
                attrs: {
                    ...keyShapeAttrs,
                    // stroke: 'green',
                    lineWidth: 0.5,
                    cursor: 'pointer',

                },
                name: 'root-key-shape-rect-shape',
            });

            if (!rootNode) {
                // 底部横线
                group.addShape('path', {
                    attrs: {
                        path: [
                            ['M', x - 1, 0],
                            ['L', width, 0],
                        ],
                        stroke: hoverd || selected ? '#03a9f4' : '#AAB7C4',
                        lineWidth: 1,
                    },
                    name: 'node-path-shape',
                });
            }

            const mainX = x;
            const mainY = -height + 15;
            // 跟节点多绘制一个框
            if (rootNode) {
                group.addShape('rect', {
                    attrs: {
                        x: mainX,
                        y: mainY,
                        width: width,
                        height,
                        radius: 14,
                        fill: '#03a9f4',
                        stroke: '#03a9f4',
                        cursor: 'pointer',
                    },
                    name: 'main-shape',
                });
            } else {
                group.addShape('rect', {
                    attrs: {
                        x: mainX,
                        y: y,
                        width: width,
                        height: height / 2,
                        fill: '#03a9f4',
                        stroke: '#03a9f4',
                        cursor: 'pointer',
                        fillOpacity: 0,
                        strokeOpacity: 0,

                    },
                    name: 'root-rect-shape',
                });
            }

            // 根节点
            if (rootNode) {
                group.addShape('text', {
                    attrs: {
                        text: content,
                        x: mainX + 12,
                        y: 0,
                        textAlign: 'left',
                        textBaseline: 'middle',
                        fill: '#ffffff',
                        fontSize: 12,
                        fontFamily: 'PingFangSC-Regular',
                        cursor: 'pointer',
                    },
                    name: 'root-text-shape',
                });

            } else {
                // 不是根节点
                group.addShape('text', {
                    attrs: {
                        text: content,
                        x: mainX,
                        y: 0,
                        textAlign: 'start',
                        textBaseline: 'bottom',
                        fill: hoverd || selected ? '#03a9f4' : '212121',
                        fontSize: 12,
                        fontFamily: 'PingFangSC-Regular',
                        cursor: 'pointer',
                    },
                    name: 'not-root-text-shape',
                });
            }

            // 子类数量
            if (hasChildren && !rootNode) {
                const childCountHeight = 12;
                const childCountX = width - childCountWidth;
                const childCountY = -childCountHeight / 2;
                // 	绘制子节点的显示框
                group.addShape('rect', {
                    attrs: {
                        width: childCountWidth,
                        height: 12,
                        // 边框
                        stroke: collapsed ? '#03a9f4' : '#5CDBD3',
                        // 填充
                        fill: collapsed ? '#03a9f4' : '#E6FFFB',
                        x: childCountX,
                        y: childCountY,
                        radius: 6,
                        cursor: 'pointer',
                    },
                    name: 'child-count-rect-shape',
                });
                group.addShape('text', {
                    attrs: {
                        text: `${children?.length}`,
                        // fill: collapsed ? '#E6FFFB' : '#ffffff',
                        fill: collapsed ? '#ffffff' : '#212121',
                        x: childCountX + childCountWidth / 2,
                        y: childCountY + 12,
                        fontSize: 10,
                        width: childCountWidth,
                        textAlign: 'center',
                        cursor: 'pointer',
                    },
                    name: 'child-count-text-shape',
                });
            }

            return keyShape;
        },
        getAnchorPoints(cfg) {
            return cfg.anchorPoints || [
                [0, 0.5],
                [1, 0.5],
            ];
        },
    });

    G6.registerEdge('smooth', {
        draw(cfg, group) {
            const { startPoint, endPoint } = cfg;
            const ydiff = endPoint.y - startPoint.y;
            const q = {
                x: startPoint.x,
                y: startPoint.y,
            }

            const hgap = Math.abs(endPoint.x - startPoint.x);

            const path = [
                ['M', startPoint.x, startPoint.y],
                [
                    'C',
                    startPoint.x + hgap / 4,
                    startPoint.y,
                    endPoint.x - hgap / 2,
                    endPoint.y,
                    endPoint.x,
                    endPoint.y,
                ],
            ];

            const shape = group.addShape('path', {
                attrs: {
                    stroke: '#AAB7C4',
                    path,
                },
                name: 'smooth-path-shape',
            });
            return shape;
        },
    });
    G6.registerEdge('smooth2', {
        draw(cfg, group) {
            const xOffset = 0;
            const yOffset = 10;
            const { startPoint, endPoint } = cfg;
            const Ydiff = endPoint.y - startPoint.y;
            // 开口方向
            const left = startPoint.x - endPoint.x > 0;
            const QPoint = {
                x: left ? startPoint.x - xOffset : startPoint.x + xOffset,
                y: endPoint.y,
            };
            const path = Ydiff === 0 ? [
                ['M', startPoint.x + xOffset, startPoint.y],
                ['L', endPoint.x, endPoint.y],
            ] : [
                ['M', startPoint.x, startPoint.y],
                ['L', QPoint.x, startPoint.y],
                ['L', QPoint.x, endPoint.y + (Ydiff > 0 ? -yOffset : yOffset)],
                ['Q', QPoint.x, QPoint.y, left ? QPoint.x - yOffset : QPoint.x + yOffset, endPoint.y],
                ['L', endPoint.x, endPoint.y],
            ];

            const shape = group.addShape('path', {
                attrs: {
                    path,
                    stroke: '#AAB7C4',
                    ...cfg,
                },
                name: 'right-tree-edge',
            });
            return shape;
        },
    });
    const menu = new G6.Menu({
        offsetY: -20,
        itemTypes: ['node'],
        getContent(e) {
            return `
            <p class="menu-item" command="edit-node">编辑文本</p>
            <p class="menu-item" command="add-node">新增节点</p>
            <p class="menu-item" command="delete-node">删除节点</p>
          `;
        },
        handleMenuClick(target, item) {
            const command = target.getAttribute('command');
            switch (command) {
                case 'edit-node':
                    editNode(item);
                    break;
                case 'add-node':
                    addNode(item);
                    break;
                case 'delete-node':
                    deleteNode(item);

                    break;
            }
        },
    });
    const minimap = new G6.Minimap({
        size: [100, 100],
        className: 'minimap',
        type: 'delegate',
    });
    const grid = new G6.Grid();
    const tooltip = new G6.Tooltip({
        offsetX: 10,
        offsetY: 20,
        getContent(e) {
            const outDiv = document.createElement('div');
            outDiv.style.width = '180px';
            outDiv.innerHTML = `
			<h4>自定义tooltip</h4>
			<ul>
			  <li>Label: ${e.item.getModel().label || e.item.getModel().id}</li>
			</ul>`
            return outDiv
        },
        itemTypes: ['node']
    });
    // 使用树状结构Graph

    graph = new G6.TreeGraph({
        container: 'container',
        width,
        height,
        minZoom: 0.7,
        // maxZoom: 2,
        plugins: [minimap, grid, menu, tooltip], // 将 minimap 实例配置到图上
        modes: {
            default: [
                // 可拖拽
                'drag-canvas',
                // 可缩放
                'zoom-canvas',
                'drag-node'
            ],
        },
        // 节点选择
        defaultNode: {
            type: 'treeNode',
            // size: 26,
            anchorPoints: [
                [0, 0.5],
                [1, 0.5],
            ],
        },
        // 线的选择
        defaultEdge: {
            type: 'smooth',
            // type: 'cubic-horizontal',
        },
        // 布局
        layout: {
            // 紧凑树 compactBox 生态树 dendrogram  脑图树 mindmap
            type: 'mindmap',
            // 左右布局
            direction: 'LR',
            // 主键
            getId: function getId(d) {
                return d.id;
            },
            getHeight: function getHeight() {
                return 16;
            },
            getWidth: function getWidth(d) {
                return 100;
            },
            getVGap: function getVGap() {
                return 16;
            },
            getHGap: function getHGap() {
                return 50;
            },
        },
    });
    graph.data(data);
    graph.render();
    graph.fitView();

    if (typeof window !== 'undefined') {
        window.onresize = () => {
            if (!graph || graph.get('destroyed')) return;
            if (!container || !container.scrollWidth || !container.scrollHeight) return;
            graph.changeSize(container.scrollWidth, container.clientHeight);
        };
    }
    graph.on('node:click', evt => {
        // 一些操作
        let target = evt.target;
        let node = evt.item;
        const model = node.getModel();
        if (target.cfg.name == 'child-count-rect-shape' || target.cfg.name == 'child-count-text-shape') {
            model.collapsed = !model.collapsed;
            graph.updateItem(node, model);
            graph.layout();
        } else {
            selectNode(model.id);
        }
        node.toFront();
    })
    graph.on('node:dblclick', evt => {
        editNode(evt.item);
    });
    graph.on('node:mouseenter', evt => {
        let node = evt.item;
        const model = node.getModel();
        model.hoverd = true;
        graph.updateItem(node, model);
    });
    graph.on('node:mouseleave', evt => {
        let node = evt.item;
        const model = node.getModel();
        model.hoverd = false;
        graph.updateItem(node, model);
    });
    graph.on('keydown', e => {
        if (selectd_arr.length > 0) {
            const node = graph.findById(selectd_arr[0]);
            if (e.key == 'Tab') {
                addNode(node);
                ClearSelect();
            } else if (e.key == 'Delete') {
                deleteNode(node);
                ClearSelect();
            }
        }

    });
    graph.on('canvas:click', evt => {
        ClearSelect();
    })

}


let data = {
    "id": "1",
    "label": "javascript",
    "children": [{
            "id": "1-1",
            "label": "基础语法基",
            "children": [
                { "id": "Logistic regression", "label": "数据结构", },
                { "id": "Linear discriminant analysis", "label": "数据结构", },

            ]
        },
        {
            "id": "1-2",
            "label": "基础语法",
            "children": [
                { "id": "Different initializations", "label": "循环", },
                { "id": "Different parameter choices", "label": "比较", }
            ]
        },
    ]
}

LoadGraph(data);

function editNode(item) {
    const model = item.getModel();
    const { cacheCanvasBBox } = item.get('group').cfg;
    // 显示
    currentNodeID = model.id;
    let Zoom = graph.getZoom();
    const isc = model.children;
    const countw = isc ? 24 * Zoom : 0
    $('#edit').show();
    $('#edit').css('left', cacheCanvasBBox.x);
    $('#edit').css('top', cacheCanvasBBox.y - 1);
    $('#edit').css('height', cacheCanvasBBox.height / 2);
    $('#edit').css('font-size', 12 * Zoom);
    $('#edit').css('width', cacheCanvasBBox.width - countw);
    $('#edit').val(model.label);
    $('#edit').focus();
    $('#edit').off().on('blur', function() {
        const item = graph.findById(currentNodeID);
        const model = item.getModel();
        model.label = $('#edit').val();
        // name-text-shape
        graph.updateItem(item, model);
        // graph.layout();
        $('#edit').hide();
    });
    $('#edit').keydown(function(e) {
        if (e.key == 'Enter') {
            const item = graph.findById(currentNodeID);
            const model = item.getModel();
            model.label = $('#edit').val();
            // name-text-shape
            graph.updateItem(item, model);
            // graph.layout();
            $('#edit').hide();
        }
    });
}

function addNode(item) {
    const id = item.get('id');
    graph.addChild({ id: String(Math.random() * 1000), 'label': '测试' }, id);
    const model = item.getModel();
    graph.updateItem(item, model);
}


function deleteNode(item) {
    const id = item.get('id');
    graph.removeChild(id);
    const parent = graph.findById(item._cfg.parent._cfg.model.id);
    parent.toFront();
    const model = parent.getModel();
    graph.updateItem(parent, model);
}
let selectd_arr = [];
let selectd_obj = [];

function selectNode(id) {

    const node = graph.findById(id);
    const model = node.getModel();
    ClearSelect();
    // 已选
    if (model.selected) {
        model.selected = false;
        graph.updateItem(node, model);
        graph.layout();
    } else {
        model.selected = true;
        graph.updateItem(node, model);
        graph.layout();
        selectd_arr.push(id);
    }
    console.log(selectd_arr);

}

function ClearSelect() {
    for (let i in selectd_arr) {
        let node, model;
        try {
            node = graph.findById(selectd_arr[i]);
            model = node.getModel();
        } catch (error) {
            selectd_arr.splice(i, 1);
            continue;
        }
        model.selected = false;
        graph.updateItem(node, model);
        selectd_arr.splice(i, 1);
    }

}