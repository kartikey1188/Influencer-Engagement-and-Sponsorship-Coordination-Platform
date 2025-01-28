export default {
    template : `
    <div>

        <div v-if = "type=='influencer'">
            <div class="d-flex justify-content-center mt-4">
                <router-link to="/influencer/update" class="btn btn-outline-warning">Update Profile</router-link>
                <router-link to="/dashboard/influencer" class="btn btn-outline-primary ms-5">Dashboard</router-link>
                <button @click="getOut" class="btn btn-outline-danger ms-5">Logout</button>
            </div>
        </div>

        <div v-if = "type=='sponsor'">
            <div class="d-flex justify-content-center mt-4">
                <router-link to="/sponsor/update" class="btn btn-outline-warning">Update Profile</router-link>
                <router-link to="/dashboard/sponsor" class="btn btn-outline-primary ms-5">Dashboard</router-link>
                <button @click="getOut" class="btn btn-outline-danger ms-5">Logout</button>
            </div>
        </div>

        <div v-if = "type=='admin'">
            <div class="d-flex justify-content-center mt-4">
                <router-link to="/admin/statistics" class="btn btn-outline-success">Statistics</router-link>
                <router-link to="/dashboard/admin" class="btn btn-outline-primary ms-5">Dashboard</router-link>
                <button @click="getOut" class="btn btn-outline-danger ms-5">Logout</button>
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
        this.type = this.$store.state.role;
    },
    methods : {
        getOut (){
            this.$store.commit('logOut');
            this.$router.push('/');
        }
    }
}