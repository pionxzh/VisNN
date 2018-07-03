<template lang='pug'>
</template>

<script>
import SVG from 'svg.js'

export default {
    name: 'App',
    data: () => ({
        drawer: true,
        graph: null
    }),
    // computed: {},
    mounted () {
        this.checkSVGSupport()
    },
    methods: {
        checkSVGSupport () {
            if (SVG.supported) {
                console.log('go')
                this.init()
            } else {
                alert('SVG not supported, Please use the latest version of Chrome or Firefox')
            }
        },

        init () {
            this.graph = SVG('drawing')
            this.graph.reck(110, 100)
        }
    }
}
</script>
