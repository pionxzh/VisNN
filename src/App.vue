<template lang='pug'>
    v-app
        v-navigation-drawer.pb-0.fix-nav-drawer(app clipped fixed v-model='drawer' :mobile-break-point=800 :width=480 enable-resize-watcher)
            v-layout(fill-height)
                v-navigation-drawer(dark mini-variant stateless value='true' :mobile-break-point=800)
                    v-list.pt-0
                        v-tooltip(right v-for='(item, i) in listItems' :key='i')
                            v-list-tile(slot='activator' @click='tab = item.title')
                                v-list-tile-action
                                    v-icon {{ item.icon }}
                                v-list-tile-content
                                    v-list-tile-title {{ item.title }}
                            span(style='font-size: 16px;') {{ item.title }}
                v-card(width=389 v-if='tab==="Layers"')
                    v-card-title
                        div(style='width: 100%')
                            h3.headline.mb-4 Layers
                            v-divider

                            v-form(ref='form')
                                v-container
                                    v-layout.layer-box.elevation-4(row wrap v-for='(item, index) in architecture' :key='item.name')
                                        v-flex.pa-0(xs12 style='height: 24px;')
                                            v-btn.close-btn(color='red' dark icon @click='removeLayer(index)')
                                                v-icon close
                                        v-flex(xs12 sm4)
                                            v-text-field(label='Node' type='number' v-model.number='item.amount' outline)
                                        v-flex(xs12 sm8)
                                            v-text-field(label='Name' type='text' v-model='layerNames[index]' @blur='update' outline)
                                        v-flex(xs12 sm4)
                                            v-tooltip(top)
                                                swatches(v-model='item.color' slot='activator' :colors='colorTemplate' row-length='10' popover-to='right' swatch-size='25')
                                                span Fill Color
                                            v-tooltip(top)
                                                swatches(v-model='item.bgColor' slot='activator' :colors='colorTemplate' row-length='10' popover-to='right' swatch-size='25')
                                                span Backgrond Color
                                            v-tooltip(top)
                                                swatches(v-model='item.lineColor' slot='activator' :colors='colorTemplate' row-length='10' popover-to='right' swatch-size='25')
                                                span Line Color
                                        v-flex(xs12 sm8)
                                            v-slider(v-model='item.spacing' min=20 max=100 step=5 label='Spacing')
                                        //v-flex(xs12)
                                            v-btn-toggle.elevation-3
                                                v-btn(flat)
                                                    v-icon format_bold
                                                v-btn(flat)
                                                    v-icon format_italic
                                                v-btn(flat)
                                                    v-icon format_color_fill
                                                v-btn(flat)
                                                    v-icon format_align_left
                            v-btn(block color='primary' @click='addEmptyLayer')
                                v-icon add

                v-card(width=389 v-if='tab==="Styles"')
                    v-card-title
                        div.px-3(style='width: 100%')
                            h3.headline.mb-4 Style
                            v-divider

                            v-form(ref='form' v-model='valid' lazy-validation)
                                p.mt-3(style='font-size: 18px;') Edge
                                v-divider.pl-3.mt-3

                                v-slider(v-model='options.edge.width' label='Edge Width' min=0.5 max=5 step=0.1 thumb-label)
                                v-slider(v-model='options.edge.opacity' label='Edge Opacity' min=0.1 max=1 step=0.1 thumb-label)
                                v-checkbox(color='primary' v-model='options.edge.widthProportional' label='Edge width proportional to edge weights')
                                v-checkbox(color='primary' v-model='options.edge.opacityProportional' label='Edge opacity proportional to edge weights')

                                p(style='font-size: 18px;') Node
                                v-divider
                                v-slider(v-model='options.node.diamiter' max=80 label='Node Diamiter' thumb-label)
                                v-slider(v-model='options.node.borderWidth' min=0.5 max=10 step=0.5 label='Node BorderWidth' thumb-label)
                                v-slider(v-model='options.node.omitGap' min=1 max=15 step=1 label='Omit Dot Gap' thumb-label)

                                p(style='font-size: 18px;') Layer
                                v-divider
                                v-slider(v-model='options.layer.spacing' min=75 max=300 step=5 label='Spacing' thumb-label='always')

        v-toolbar(app clipped-left)
            v-toolbar-side-icon(@click.stop='drawer = !drawer')

            v-toolbar-title VisNN
            v-spacer

            a(href='https://github.com/pionxzh/VisNN' target='_blank' style='text-decoration: none;')
                v-btn(icon)
                    v-icon fab fa-github

        v-content
            v-container(fluid fill-height)
                v-slide-y-transition(mode='out-in')
                    v-layout(column align-center)
                        div#drawing
</template>

<style lang='stylus'>
    @import './stylus/main'
</style>

<script>
import SVG from 'svg.js'
import { parse } from 'babylon'
import Swatches from 'vue-swatches'
import 'vue-swatches/dist/vue-swatches.min.css'

let range = n => [...Array(n).keys()]

export default {
    name: 'App',
    components: { Swatches },
    data: () => ({
        w: 800,
        h: 800,
        tab: 'Layers',
        valid: true,
        drawer: true,
        miniVariant: false,
        graph: null,
        nodes: [],
        links: [],
        layers: [],
        omits: [],
        listItems: [{
            icon: 'reorder',
            title: 'Layers'
        }, {
            icon: 'color_lens',
            title: 'Styles'
        }, {
            icon: 'settings',
            title: 'Settings'
        }],
        options: {
            edge: {
                widthProportional: false,
                width: 1,
                colorPropotional: false,
                colorNavagative: '#FFF',
                colorPostive: '#1c1c1c',
                opacity: 0.5,
                opacityPropotional: false
            },
            node: {
                diamiter: 50,
                color: '#fff',
                borderColor: '#111',
                borderWidth: 1,
                omitGap: 8
            },
            layer: {
                spacing: 190,
                direction: 0,
                biasUnits: false
            }
        },
        layerNames: ['Input layer', 'Hidden Layer #1', 'Hidden Layer #2', 'Hidden Layer #3', 'Output Layer'],
        architecture: [{
            amount: 744,
            spacing: 50,
            color: '#FFF',
            bgColor: 'rgb(234, 153, 153)',
            lineColor: '#000'
        }, {
            amount: 16,
            spacing: 50,
            color: '#FFF',
            bgColor: 'rgb(164, 194, 244)',
            lineColor: '#000'
        }, {
            amount: 16,
            spacing: 50,
            color: '#FFF',
            bgColor: 'rgb(164, 194, 244)',
            lineColor: '#000'
        }, {
            amount: 16,
            spacing: 50,
            color: '#FFF',
            bgColor: 'rgb(164, 194, 244)',
            lineColor: '#000'
        }, {
            amount: 10,
            spacing: 50,
            color: '#FFF',
            bgColor: 'rgb(182, 215, 168)',
            lineColor: '#000'
        }],
        colorTemplate: [
            ['#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#fafafa', '#ffffff'],
            ['#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff'],
            ['#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc'],
            ['#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd'],
            ['#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0'],
            ['#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79'],
            ['#85200c', '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#1155cc', '#0b5394', '#351c75', '#741b47'],
            ['#5b0f00', '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#1c4587', '#073763', '#20124d', '#4c1130']
        ]
    }),
    // computed: {},
    mounted () {
        this.init()
        const preset = window.location.search
        if (!preset.length) return

        const layers = preset.split('layers=')[1].split(',').map(item => parseInt(item))
        if (!layers.length) return

        this.layerNames = []
        this.architecture = []
        layers.forEach((item, index) => {
            const name = index === 0 ? 'Input layer' : index === (layers.length - 1) ? 'Output layer' : `Hidden Layer #${index}`
            const bgColor = index === 0 ? 'rgb(234, 153, 153)' : index === (layers.length - 1) ? 'rgb(182, 215, 168)' : 'rgb(164, 194, 244)'
            this.layerNames.push(name)
            this.architecture.push({
                amount: item,
                spacing: 50,
                color: '#FFF',
                bgColor: bgColor,
                lineColor: '#000'
            })
        })
    },
    watch: {
        options: {
            handler () {
                this.update()
            },
            deep: true
        },

        architecture: {
            handler () {
                this.update()
            },
            deep: true
        }
    },
    methods: {
        init () {
            if (!SVG.supported) {
                return alert('SVG is not supported, Please use the latest version of Chrome or Firefox')
            }

            this.graph = SVG('drawing')
            this.addMouseEventBinding()
            window.addEventListener('resize', this.updateSVGSize)
            // window.onresize = this.updateSVGSize

            setTimeout(() => {
                this.updateSVGSize()
            }, 500)
        },

        update () {
            if (this.graph == null) return
            this.graph.clear()

            this.buildMap()
            this.drawMap()
            console.log('updated')
        },

        updateSVGSize () {
            if (!this.timer) {
                this.timer = true
                setTimeout(() => { this.timer = false }, 800)

                let nw = document.getElementById('drawing').offsetWidth
                let nh = document.getElementById('drawing').offsetHeight
                if (nw === this.w && nh === this.h) return

                this.w = nw
                this.h = nh

                console.log(`Svg size: (${this.w}, ${this.h})`)
                this.update()
            }
        },

        addMouseEventBinding () {
            this.graph.on('mousewheel', e => this.zoom(e))

            this.graph.on('mousedown', function (event) {
                this.remember('start', { x: event.pageX, y: event.pageY, viewbox: this.viewbox() })
            })

            this.graph.on('mousemove', function (event) {
                if (this.remember('start')) {
                    const box = this.remember('start').viewbox
                    const x = box.x - (event.pageX - this.remember('start').x)
                    const y = box.y - (event.pageY - this.remember('start').y)

                    this.viewbox(x, y, box.width, box.height)
                }
            })

            this.graph.on('mouseup', function (event) {
                this.forget('start')
            })
        },

        zoom (e) {
            e.stopPropagation()

            const min = 200
            const max = 3000
            const step = 50
            const box = this.graph.viewbox()
            const newWidth = e.wheelDelta > 0 ? (box.width > min ? box.width - step : min) : (box.width < max ? box.width + step : max)
            this.graph.viewbox(box.x, box.y, newWidth, box.height / box.width * (newWidth))
        },

        parseFromID (id) {
            return id.split('_').map(x => parseInt(x))
        },

        addEmptyLayer () {
            const last = this.layerNames.length - 1
            if (this.layerNames[last].indexOf('Output Layer') !== -1) {
                this.layerNames[last] = `Hidden Layer #${last}`
            }
            this.layerNames.push('Output Layer')
            this.architecture.push({
                amount: 0,
                spacing: 50,
                color: '#FFF',
                bgColor: 'rgba(0, 0, 0, 0)',
                lineColor: '#000'
            })
        },

        removeLayer (index) {
            this.layerNames.splice(index, 1)
            this.architecture.splice(index, 1)
        },

        drawNode (x, y) {
            return this.graph.circle(this.options.node.diamiter / 2).center(x, y)
        },

        drawLine (link) {
            return this.graph.line(...link)
        },

        drawRect (sizeX, sizeY, x, y, color) {
            return this.graph.rect(sizeX, sizeY).center(x, y).fill(color)
        },

        drawOmit (item) {
            this.graph.circle(7).center(item.x, item.y - this.options.node.omitGap)
            this.graph.circle(7).center(item.x, item.y + this.options.node.omitGap)
        },

        buildMap () {
            const centerX = this.w / 2
            const centerY = this.h / 2
            const layerNum = this.architecture.length
            const offsetX = this.options.layer.spacing
            const maxLayerNode = Math.max(...this.architecture.map(item => item.amount))
            const centerLayerIndex = ~~(this.architecture.filter(item => item.amount > 0).length / 2)

            this.layers = this.architecture.map(index => {
                return {
                    node: this.graph.set(),
                    link: this.graph.set()
                }
            })

            this.omits = []
            this.nodes = this.architecture.filter(item => item.amount > 0).map((item, layer) => {
                const spacing = item.amount > 13 ? 45 : item.spacing
                const itemX = centerX + (layer - centerLayerIndex) * offsetX

                let isOmit = false
                let isOmit2 = false
                let nodeAmount = item.amount
                let centerNodeIndex = item.amount % 2 ? ~~(item.amount / 2) : item.amount / 2 - 0.5

                // if there are more than 65 nodes, add two omit sign
                if (item.amount > 65) {
                    isOmit2 = true
                    nodeAmount = 14

                    centerNodeIndex = nodeAmount % 2 ? ~~(nodeAmount / 2) : nodeAmount / 2 - 0.5
                    this.omits.push({ x: itemX, y: centerY + (4.5 - centerNodeIndex) * spacing })
                    this.omits.push({ x: itemX, y: centerY + (8.5 - centerNodeIndex) * spacing })
                } else if (item.amount > 15) {
                    isOmit = true
                    nodeAmount = 12

                    centerNodeIndex = nodeAmount % 2 ? ~~(nodeAmount / 2) : nodeAmount / 2 - 0.5
                    this.omits.push({ x: itemX, y: centerY })
                }

                // remove the node occupyed by omit sign
                let temp = range(nodeAmount).filter(index => isOmit ? (index !== 5 && index !== 6) : isOmit2 ? (index !== 4 && index !== 5 && index !== 8 && index !== 9) : true)

                // omit will cause the node to be pushed away
                let omitMarginSize = (item.amount > 15 && item.amount < 64) ? (item.amount / maxLayerNode) * 50 : 0
                return temp.map(index => ({
                    id: `${layer}_${index}`,
                    layer: layer,
                    node: index,
                    x: itemX,
                    y: centerY + (index - centerNodeIndex) * spacing + (index > centerNodeIndex ? omitMarginSize : -omitMarginSize)
                }))
            })
            this.links = range(layerNum).map(index => [])
            this.nodes.filter((layer, layerIndex) => layerIndex < (layerNum - 1))
                .forEach((layer, layerIndex) => {
                    layer.forEach(left => {
                        if (!this.nodes[layerIndex + 1]) return
                        this.nodes[layerIndex + 1].forEach(right => {
                            this.links[layerIndex].push([left.x, left.y, right.x, right.y])
                        })
                    })
                })
        },

        drawMap () {
            this.parseFromID('1_2')

            let textCenterY = 0

            // draw outter box
            this.nodes.forEach((layer, index) => {
                let sizeY = layer[layer.length - 1].y - layer[0].y + this.architecture[index].spacing + this.options.node.diamiter
                let centerY = layer.length % 2 ? layer[~~(layer.length / 2)].y : (layer[layer.length / 2 - 1].y + layer[layer.length / 2].y) / 2
                if (centerY + sizeY / 2 > textCenterY) textCenterY = centerY + sizeY / 2 - 10
                this.drawRect(70, sizeY, layer[0].x, centerY, this.architecture[index].bgColor)
            })

            // draw layer name
            this.nodes.forEach((layer, index) => {
                this.graph.text(this.layerNames[index]).font({size: 18})
                    .center(layer[0].x, textCenterY + this.architecture[index].spacing)
                this.graph.text(`${this.architecture[index].amount} neurons`).font({size: 16})
                    .center(layer[0].x, textCenterY + this.architecture[index].spacing + 20)
            })

            // draw link between layer
            this.links.forEach((layer, index) => {
                layer.forEach(link => {
                    let line = this.drawLine(link)
                    this.layers[index].link.add(line)
                })
            })

            // draw node after drawing thte line to overlay on it
            this.nodes.forEach(layer => {
                layer.forEach(item => {
                    let circle = this.drawNode(item.x, item.y)
                    this.layers[item.layer].node.add(circle).fill('#000')
                })
            })

            // draw omit dot
            this.omits.forEach(item => {
                this.drawOmit(item)
            })

            // apply style on each item
            this.layers.forEach((item, index) => {
                item.link.addClass('line')
                    .stroke({ color: this.architecture[index].lineColor, width: this.options.edge.width })
                    .opacity(this.options.edge.opacity)

                item.node.addClass('node')
                    .fill(this.architecture[index].color)
                    .stroke({
                        color: this.options.node.borderColor,
                        width: this.options.node.borderWidth
                    })
            })
        }
    }
}
</script>
