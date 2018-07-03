<template lang='pug'>
    v-app
        v-navigation-drawer.pb-0(app clipped fixed v-model='drawer' :mobile-break-point=800 :width=450 enable-resize-watcher)
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
                v-card(width=369 v-if='tab==="Layers"')
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
                                            v-text-field(label='Name' type='text' v-model='item.name' outline)
                                        v-flex(xs12 sm4)
                                            v-tooltip(top)
                                                swatches(v-model='item.color' slot='activator' colors='text-advanced' popover-to='right' swatch-size='25')
                                                span Fill-Color
                                            v-tooltip(top)
                                                swatches(v-model='item.bgColor' slot='activator' colors='text-advanced' popover-to='right' swatch-size='25')
                                                span Backgrond-Color
                                            v-tooltip(top)
                                                swatches(v-model='item.borderColor' slot='activator' colors='text-advanced' popover-to='right')
                                                span Border-Color
                                        v-flex(xs12 sm8)
                                            v-slider(v-model='item.spacing' min=20 max=100 step=5 label='Spacing')
                            v-btn(block color='primary' @click='addLayer')
                                v-icon add

                v-card(width=369 v-if='tab==="Styles"')
                    v-card-title
                        div.px-3(style='width: 100%')
                            h3.headline.mb-4 Style
                            v-divider

                            v-form(ref='form' v-model='valid' lazy-validation)
                                p.mt-3(style='font-size: 18px;') Edge
                                v-divider.pl-3.mt-3

                                v-slider(v-model='options.edge.width' label='Edge Width' min=0.5 max=5 step=0.1 thumb-label)
                                v-slider(v-model='options.edge.opacity' label='Edge Opacity' min=0.1 max=1 step=0.1 thumb-label)
                                // v-text-field(v-model='name' label='Name' required)
                                v-checkbox(color='primary' v-model='options.edge.widthProportional' label='Edge width proportional to edge weights')
                                v-checkbox(color='primary' v-model='options.edge.opacityProportional' label='Edge opacity proportional to edge weights')

                                p(style='font-size: 18px;') Node
                                v-divider
                                v-slider(v-model='options.node.diamiter' max=70 label='Node Diamiter' thumb-label)
                                v-slider(v-model='options.node.borderWidth' min=0.5 max=10 step=0.5 label='Node BorderWidth' thumb-label)

                                p(style='font-size: 18px;') Layer
                                v-divider
                                v-slider(v-model='options.layer.spacing' min=75 max=300 step=5 label='Spacing' thumb-label='always')

        v-toolbar(app clipped-left)
            v-toolbar-side-icon(@click.stop='miniVariant = !miniVariant')

            v-toolbar-title VisNN
            v-spacer

            v-btn(icon)
                v-icon home

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

function parseFromID (id) {
    return id.split('_').map(x => parseInt(x))
}

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
                borderWidth: 1
            },
            layer: {
                spacing: 190,
                direction: 0,
                biasUnits: false
            }
        },
        architecture: [{
            name: 'Input Layer',
            amount: 4,
            spacing: 50,
            color: '#FFF',
            bgColor: 'rgb(234, 153, 153)',
            borderColor: '#000'
        }, {
            name: 'Hidden Layer #1',
            amount: 8,
            spacing: 50,
            color: '#FFF',
            bgColor: 'rgb(164, 194, 244)',
            borderColor: '#000'
        }, {
            name: 'Hidden Layer #2',
            amount: 12,
            spacing: 50,
            color: '#FFF',
            bgColor: 'rgb(164, 194, 244)',
            borderColor: '#000'
        }, {
            name: 'Output Layer',
            amount: 3,
            spacing: 50,
            color: '#FFF',
            bgColor: 'rgb(182, 215, 168)',
            borderColor: '#000'
        }]
    }),
    // computed: {},
    mounted () {
        this.checkSVGSupport()
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
        checkSVGSupport () {
            if (SVG.supported) {
                this.init()
            } else {
                alert('SVG is not supported, Please use the latest version of Chrome or Firefox')
            }
        },

        init () {
            this.graph = SVG('drawing')
            this.addMouseAction()
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

                // this.graph.line(this.w / 2, 0, 0, this.h / 2).stroke({ width: this.options.edge.width })
                // this.graph.line(this.w / 2, 0, this.w / 2, this.h / 2).stroke({ width: this.options.edge.width })
            }
        },

        addMouseAction () {
            this.graph.on('mousewheel', e => this.zoom(e))

            this.graph.on('mousedown', function (event) {
                this.remember('start', { x: event.pageX, y: event.pageY, viewbox: this.viewbox() })
            })

            this.graph.on('mousemove', function (event) {
                if (this.remember('start')) {
                    let box = this.remember('start').viewbox
                    let x = box.x - (event.pageX - this.remember('start').x)
                    let y = box.y - (event.pageY - this.remember('start').y)

                    this.viewbox(x, y, box.width, box.height)
                }
            })

            this.graph.on('mouseup', function (event) {
                this.forget('start')
            })
        },

        zoom (e) {
            e.stopPropagation()
            let min = 200
            let max = 3000
            let step = 50
            let box = this.graph.viewbox()
            let newWidth = e.wheelDelta > 0 ? (box.width > min ? box.width - step : min) : (box.width < max ? box.width + step : max)
            this.graph.viewbox(box.x, box.y, newWidth, box.height / box.width * (newWidth))
        },

        addLayer () {
            this.layers.push({
                node: this.graph.set(),
                link: this.graph.set()
            })
            if (this.architecture[this.architecture.length - 1].name.indexOf('Output Layer') !== -1) {
                this.architecture[this.architecture.length - 1].name = `Hidden Layer #${this.architecture.length - 1}`
            }
            this.architecture.push({
                name: 'Output Layer',
                amount: 0,
                spacing: 50,
                color: '#FFF',
                bgColor: 'rgba(0, 0, 0, 0)',
                borderColor: '#000'
            })
        },

        removeLayer (index) {
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

        buildMap () {
            let layerNum = this.architecture.length
            this.layers = this.architecture.map(index => {
                return {
                    node: this.graph.set(),
                    link: this.graph.set()
                }
            })

            let centerLayerIndex = ~~(this.architecture.filter(item => item.amount > 0).length / 2)
            let centerX = this.w / 2
            let centerY = this.h / 2
            let offsetX = this.options.layer.spacing

            this.nodes = this.architecture.filter(item => item.amount > 0).map((item, layer) => {
                let centerNodeIndex = item.amount === 1 ? 0 : item.amount % 2 ? ~~(item.amount / 2) : item.amount / 2 - 0.5
                let itemX = centerX + (layer - centerLayerIndex) * offsetX
                return range(item.amount).map(index => ({
                    id: `${layer}_${index}`,
                    layer: layer,
                    node: index,
                    x: itemX,
                    y: centerY + (index - centerNodeIndex) * item.spacing
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
            parseFromID('1_2')
            this.nodes.forEach((layer, index) => {
                let sizeY = layer[layer.length - 1].y - layer[0].y + this.architecture[index].spacing + this.options.node.diamiter
                let centerY = layer.length % 2 ? layer[~~(layer.length / 2)].y : (layer[layer.length / 2 - 1].y + layer[layer.length / 2].y) / 2
                this.drawRect(70, sizeY, layer[0].x, centerY, this.architecture[index].bgColor)
            })

            this.links.forEach((layer, index) => {
                layer.forEach(link => {
                    let line = this.drawLine(link)
                    this.layers[index].link.add(line)
                })
            })

            this.nodes.forEach(layer => {
                layer.forEach(item => {
                    let circle = this.drawNode(item.x, item.y)
                    this.layers[item.layer].node.add(circle)
                })
            })

            this.layers.forEach((item, index) => {
                item.link.addClass('line')
                    .stroke({ color: this.architecture[index].borderColor, width: this.options.edge.width })
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
