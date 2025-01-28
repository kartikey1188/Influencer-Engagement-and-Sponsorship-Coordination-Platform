import Navbar from "./components/Navbar.js"
import router from "./utils/router.js"
import store from "./utils/store.js"

const app = new Vue({
    el : '#app',
    template : `
        <div> 

        <div class="container mt-1">
        <div class="card">
        <h4 class="text-success text-center">Influencer Engagement and Sponsorship Coordination Platform</h4>
        </div>
        </div>

   
        <router-view> </router-view>
        
        </div>
    `,
    components : {
        Navbar
    },
    router,
    store
})

console.log('The app is on :)')
