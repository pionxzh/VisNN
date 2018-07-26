import Vue from 'vue'
import {
    Vuetify,
    VApp,
    VBtn,
    VBtnToggle,
    VCard,
    VCheckbox,
    VDivider,
    VTextField,
    VForm,
    VNavigationDrawer,
    VList,
    VIcon,
    VGrid,
    VSlider,
    VToolbar,
    VTooltip,
    VSubheader,
    transitions
} from 'vuetify'

import 'vuetify/src/stylus/app.styl'

Vue.use(Vuetify, {
    components: {
        VApp,
        VBtn,
        VBtnToggle,
        VCard,
        VCheckbox,
        VDivider,
        VTextField,
        VForm,
        VNavigationDrawer,
        VList,
        VIcon,
        VGrid,
        VSlider,
        VToolbar,
        VTooltip,
        VSubheader,
        transitions
    }
})
