import Navbar from "../components/Navbar.js";
import Request_Card from "../components/Request_Card.js";

const AdminRequests = {
    template: `
    <div>
        <Navbar></Navbar>
        <div class="card mt-4"><div class="card-body">
            <div class="d-flex flex-column align-items-center justify-content-between">
                <h1>Requests</h1>
                <p>Monitor all pending, accepted, and rejected requests in this section.</p>

                <div class="d-flex mt-4">
                    <button @click="setViewMode(-1)" class="btn btn-outline-primary me-4" :class="{ active: viewMode === -1 }">Pending Requests</button>
                    <button @click="setViewMode(0)" class="btn btn-outline-success me-4" :class="{ active: viewMode === 0 }">Accepted Requests</button>
                    <button @click="setViewMode(1)" class="btn btn-outline-danger me-4" :class="{ active: viewMode === 1 }">Rejected Requests</button>
                </div>
            </div>
            
            <div class="card mt-4"><div class="card-body">

                <div v-if="viewMode === -1">
                    <div v-if="pendingRequests.length > 0">
                        <h2><u>Pending Requests</u></h2>
                        <Request_Card v-for="request in pendingRequests" :key="request.adrequest_id" :request="request"></Request_Card>
                    </div>
                    <div v-else class="mt-2">
                        <h2><u>Pending Requests</u></h2>
                        <p>No pending requests exist at the moment.</p>
                    </div>
                </div>

                <div v-if="viewMode === 0">
                    <div v-if="acceptedRequests.length > 0">
                        <h2><u>Accepted Requests</u></h2>
                        <Request_Card v-for="request in acceptedRequests" :key="request.adrequest_id" :request="request"></Request_Card>
                    </div>
                    <div v-else class="mt-2">
                        <h2><u>Accepted Requests</u></h2>
                        <p>No accepted requests exist at the moment.</p>
                    </div>
                </div>

                <div v-if="viewMode === 1">
                    <div v-if="rejectedRequests.length > 0">
                        <h2><u>Rejected Requests</u></h2>
                        <Request_Card v-for="request in rejectedRequests" :key="request.adrequest_id" :request="request"></Request_Card>
                    </div>
                    <div v-else class="mt-2">
                        <h2><u>Rejected Requests</u></h2>
                        <p>No rejected requests exist at the moment.</p>
                    </div>
                </div>
            </div></div>
            <button @click="goBack" class="btn btn-outline-dark mt-4">Go Back</button>
        </div></div>
    </div>
    `,
    data() {
        return {
            pendingRequests: [],
            acceptedRequests: [],
            rejectedRequests: [],
            viewMode: -1, // Default to Pending Requests
        };
    },
    methods: {
        goBack() {
            this.$router.go(-1); 
        },
        setViewMode(mode) {
            this.viewMode = mode; // (-1: Pending, 0: Accepted, 1: Rejected)
        },
        async getRequests() {
            const res = await fetch(`/api/admin/requests`, {
                headers: { "Authentication-Token": this.$store.state.authen_token },
            });
            if (res.ok) {
                const requests = await res.json();
                this.categorizeRequests(requests);
            } else {
                alert("Something went wrong while fetching requests.");
            }
        },
        categorizeRequests(requests) {
            this.pendingRequests = requests.filter(request => request.status === "Pending");
            this.acceptedRequests = requests.filter(request => request.status === "Accepted");
            this.rejectedRequests = requests.filter(request => request.status === "Rejected");
        },
    },
    async mounted() {
        await this.getRequests(); 
    },
    components: {
        Navbar,
        Request_Card,
    },
};

export default AdminRequests;
