import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Names from '../views/Names.vue'
import Name from '../views/Name.vue'
import Redeem from '../views/Redeem.vue'
import RedeemBadge from '../views/RedeemBadge.vue'
import Badges from '../views/Badges.vue'
import Manifesto from '../views/Manifesto.vue'
import Pgp from '../views/Pgp.vue'

Vue.use(VueRouter)

const routes = [{
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/names',
        name: 'Names',
        component: Names
    },
    {
        path: '/name/:searcher',
        name: 'Name',
        component: Name
    },
    {
        path: '/redeem',
        name: 'Redeem',
        component: Redeem
    },
    {
        path: '/pgp',
        name: 'Pgp',
        component: Pgp
    },
    {
        path: '/manifesto',
        name: 'Manifesto',
        component: Manifesto
    },
    {
        path: '/redeem/:tokenId',
        name: 'RedeemBadge',
        component: RedeemBadge
    },
    {
        path: '/badges',
        name: 'Badges',
        component: Badges
    },
]

const router = new VueRouter({
    routes
})

export default router