export default {
    template : `
    <div>

        <div v-if = "type=='influencer'">
            <div class="d-flex justify-content-center mt-2">
                <router-link to="/search/campaigns" class="btn btn-outline-primary">Search Campaigns</router-link>
                <router-link :to="'/contracts/'+888888" class="btn btn-outline-primary ms-5">My Contracts</router-link>
                <router-link to="/ad_requests" class="btn btn-outline-dark ms-5">Ad Requests</router-link>
            </div>
        </div>

        <div v-if = "type=='sponsor'">
            <div class="d-flex justify-content-center">
                <router-link to="/sponsor/campaigns" class="btn btn-outline-primary">My Campaigns</router-link>
                <router-link to="/search/influencers" class="btn btn-outline-success ms-5">Search & Request Influencers</router-link>
                <router-link to="/ad_requests" class="btn btn-outline-dark ms-5">Ad Requests</router-link>
            </div>
        </div>

        <div v-if = "type=='admin'">
            <div class="d-flex justify-content-center mt-2">
                <router-link to="/registration/influencer" class="btn btn-outline-warning">Statistics</router-link>
                <router-link to="/registration/influencer" class="btn btn-outline-danger ms-5">Logout</router-link>
            </div>
        </div>
    
    </div>
    `,
    data(){
        return {
            type: ''
        }
    },
    async mounted() {
        this.type = this.$store.state.role
    }
}