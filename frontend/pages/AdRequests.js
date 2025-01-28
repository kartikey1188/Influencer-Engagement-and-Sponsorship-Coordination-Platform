import Navbar from "../components/Navbar.js";
import Request_Card from "../components/Request_Card.js";

const AdRequests = {
    template: `
    <div>
        <Navbar></Navbar>
        <div class="card mt-4"><div class="card-body">
            <div class="d-flex flex-column align-items-center justify-content-between">
                <h1>Ad Requests</h1>
           
                <div v-if="type=='influencer'">
                    <div class="card mt-2"><div class="card-body"> 
                        <div class="d-flex justify-content-between align-items-center">
                            <b>Search some Campaigns and send requests to promote them:</b>
                            <router-link to="/search/campaigns" class="btn btn-outline-primary ms-3">Search Campaigns</router-link>
                        </div>
                    </div></div>
                </div>
                <div v-if="type=='sponsor'">
                    <div class="card"><div class="card-body"> 
                        <div class="d-flex justify-content-between align-items-center">
                            <b>Send requests to various influencers to get your Campaigns promoted:</b>
                            <router-link to="/sponsor/campaigns" class="btn btn-outline-primary ms-3">My Campaigns</router-link>
                        </div>
                    </div></div>
                </div>
               
                <div class="d-flex mt-4">
                    <button @click="setNature(-1)" class="btn btn-outline-primary me-4" :class="{ active: nature == -1 }">Ad Requests Received</button>
                    <button @click="setNature(1)" class="btn btn-outline-primary ms-4" :class="{ active: nature == 1 }">Ad Requests Sent</button>
                </div>
            </div>
            <div class="card mt-4"><div class="card-body">
                
                <!-- Requests Based on Nature and ViewMode -->
                <div v-if="nature == -1">
                    <div class="mt-2 d-flex flex-column align-items-center">
                        <h2><u>Ad Requests Received</u></h2>
                        <div class="d-flex justify-content-center mb-4 mt-2">
                            <button @click="setViewMode(-1)" class="btn btn-outline-warning" :class="{ active: viewMode == -1 }">Pending</button>
                            <button @click="setViewMode(0)" class="btn btn-outline-success ms-4" :class="{ active: viewMode == 0 }">Accepted</button>
                            <button @click="setViewMode(1)" class="btn btn-outline-danger ms-4" :class="{ active: viewMode == 1 }">Rejected</button>
                        </div>
                        <div v-if="filteredRequests.length > 0">
                            <Request_Card v-for="request in filteredRequests" :key="request.adrequest_id" :request="request"></Request_Card>
                        </div>
                        <div v-else>
                            <p>No {{ getStatusLabel() }} Received Ad Requests Available .</p>
                        </div>
                    </div>
                </div>

                <div v-if="nature == 1">
                    <div class="mt-2 d-flex flex-column align-items-center">
                        <h2><u>Ad Requests Sent</u></h2>
                        <div class="d-flex justify-content-center mb-4 mt-2">
                            <button @click="setViewMode(-1)" class="btn btn-outline-warning" :class="{ active: viewMode == -1 }">Pending</button>
                            <button @click="setViewMode(0)" class="btn btn-outline-success ms-4" :class="{ active: viewMode == 0 }">Accepted</button>
                            <button @click="setViewMode(1)" class="btn btn-outline-danger ms-4" :class="{ active: viewMode == 1 }">Rejected</button>
                        </div>
                        <div v-if="filteredRequests.length > 0">
                            <Request_Card v-for="request in filteredRequests" :key="request.adrequest_id" :request="request"></Request_Card>
                        </div>
                        <div v-else>
                            <p>No {{ getStatusLabel() }} Sent Ad Requests Available .</p>
                        </div>
                    </div>
                </div>
            </div></div>
            <button @click="goBack" class="btn btn-outline-dark mt-4">Go Back</button>
        </div></div>
    </div>
    `,
    data() {
        return {
            receivedRequests: [],
            sentRequests: [],
            viewMode: -1, // -1 = Pending, 0 = Accepted, 1 = Rejected
            nature: -1, // -1 = Received, 1 = Sent
            type: "",
            i_d: "",
        };
    },
    computed: {
        filteredRequests() {
            let requests;
            if (this.nature == -1) {
                requests = this.receivedRequests;
            } else {
                requests = this.sentRequests;
            }

            if (this.viewMode == -1) {
                return requests.filter(request => request.status == "Pending");
            } else if (this.viewMode == 0) {
                return requests.filter(request => request.status == "Accepted");
            } else if (this.viewMode == 1) {
                return requests.filter(request => request.status == "Rejected");
            } else {
                return requests;
            }
        },
    },
    methods: {
        goBack() {
            this.$router.go(-1);
        },
        setNature(nature) {
            this.nature = nature;
        },
        setViewMode(mode) {
            this.viewMode = mode;
        },
        async getSponsorRequests() {
            const res = await fetch("/api/" + this.type + "/request_list/" + this.i_d, {
                headers: { "Authentication-Token": this.$store.state.authen_token },
            });
            if (res.ok) {
                const sponsorRequests = await res.json();
                this.receivedRequests = sponsorRequests.filter(request => request.initiator == "influencer");
                this.sentRequests = sponsorRequests.filter(request => request.initiator == "sponsor");
            } else {
                alert("Something went wrong while retrieving sponsor requests.");
            }
        },
        async getInfluencerRequests() {
            const res = await fetch("/api/" + this.type + "/request_list/" + this.i_d, {
                headers: { "Authentication-Token": this.$store.state.authen_token },
            });
            if (res.ok) {
                const influencerRequests = await res.json();
                this.receivedRequests = influencerRequests.filter(request => request.initiator == "sponsor");
                this.sentRequests = influencerRequests.filter(request => request.initiator == "influencer");
            } else {
                alert("Something went wrong while retrieving influencer requests.");
            }
        },
        getStatusLabel() {
            if (this.viewMode == -1) {
                return "Pending";
            } else if (this.viewMode == 0) {
                return "Accepted";
            } else if (this.viewMode == 1) {
                return "Rejected";
            } else {
                return "";
            }
        },
    },
    async mounted() {
        this.type = this.$store.state.role;
        this.i_d = this.$store.state.userID;
        if (this.type == "sponsor") {
            this.getSponsorRequests();
        }
        if (this.type == "influencer") {
            this.getInfluencerRequests();
        }
    },
    components: {
        Navbar,
        Request_Card,
    },
};

export default AdRequests;
