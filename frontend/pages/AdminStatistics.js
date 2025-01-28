import Navbar from "../components/Navbar.js";

const AdminStatistics = {
    template : `<div>
    <Navbar></Navbar>
    <div class="container mt-4 mb-4"><div class="card"><div class="card-body">
    <div class="text-center mt-1"> <h1 class="text-success"> <u>STATISTICS </u> </h1> </div>
        <div class = "d-flex flex-column align-items-center">
            <div class = "d-flex justify-content-center align-items-center mt-4">
                <div>
                    <div class="card"><div class="card-body">
                        <h4><u>Influencers</u></h4>
                        <ul>
                            <li><b>Number of Influencers:</b> {{ statistics.all_influencers }}</li>
                            <li><b>Number of Flagged Influencers:</b> {{ statistics.flagged_influencers }}</li>
                        </ul>
                    </div></div>
                </div>
                    
                <div>
                    <div class="card ms-4"><div class="card-body">
                        <h4><u>Sponsors</u></h4>
                        <ul>
                            <li><b>Number of Registered Sponsors:</b> {{ statistics.all_sponsors }}</li>
                            <li><b>Number of Flagged Sponsors:</b> {{ statistics.flagged_sponsors }}</li>
                            <li><b>Number of Pending Sponsor Approvals:</b> {{ statistics.pending_approvals }}</li>
                        </ul>
                    </div></div>
                </div>

                <div>
                    <div class="card ms-4"><div class="card-body">
                        <h4><u>Campaigns</u></h4>
                        <ul>
                            <li><b>Number of Campaigns:</b> {{ statistics.all_campaigns }}</li>
                            <li><b>Number of Flagged Campaigns:</b> {{ statistics.flagged_campaigns }}</li>
                        </ul>
                    </div></div>
                </div>
            </div>
            <div class = "d-flex justify-content-center align-items-center mt-4">
                <div>
                    <div class="card"><div class="card-body">
                        <h4><u>Ad Requests</u></h4>
                        <ul>
                            <li><b>Number of Ad Requests:</b> {{ statistics.all_requests }}</li>
                            <li><b>Number of Pending Ad Requests:</b> {{ statistics.pending_requests }}</li>
                            <li><b>Number of Accepted Ad Requests:</b> {{ statistics.accepted_requests }}</li>
                            <li><b>Number of Rejected Ad Requests:</b> {{ statistics.rejected_requests }}</li>
                        </ul>
                    </div></div>
                </div>
                    
                <div>
                    <div class="card ms-4"><div class="card-body">
                        <h4><u>Contracts</u></h4>
                        <ul>
                            <li><b>Number of Contracts:</b> {{ statistics.all_contracts }}</li>
                            <li><b>Number of Ongoing Contracts:</b> {{ statistics.ongoing_contracts }}</li>
                            <li><b>Number of Completed Contracts:</b> {{ statistics.completed_contracts }}</li>
                            <li><b>Number of Cancelled Contracts:</b> {{ statistics.cancelled_contracts }}</li>
                        </ul>
                    </div></div>
                </div>
            </div>
        </div>
        <div class="card mb-4 mt-4"><div class="card-body">

        <div class="d-flex flex-column align-items-center">
                <img v-for="graph in graphs_obtained" :src="graph" :alt="graph" style="max-width: 800px; height: auto;" class="shadow p-1 rounded bg-success mb-2">
        </div>

        </div></div>
</div></div></div>
</div>
    `,

    data () {
        return {
            statistics: {},
            graphs_obtained: []
        }
    },

    methods: {
        async getImageUrl(filename){
            const res = await fetch(`/serve_graph/${filename}`)
            if (res.ok){
              this.graphs_obtained.push(res.url);
            } else {
                console.log(`Unable to fetch image for ${filename}`)
            }
          },
        async fetchAllImageUrls() {
            for (const filename of this.statistics.graphs) {
                await this.getImageUrl(filename);
            }
        },
        async getStatistics(){
            const res = await fetch (`/api/admin/statistics`,{
                method : 'GET',
                headers : {
                    'Authentication-Token' : this.$store.state.authen_token
                }
            }) 
            if (res.ok){
                this.statistics = await res.json();
            } else { 
                alert('Unable to fetch statistics.')
            }
        }
    },
    async mounted() {
        await this.getStatistics();
        await this.fetchAllImageUrls();
    },

    components: {
        Navbar
    }
}

export default AdminStatistics;
