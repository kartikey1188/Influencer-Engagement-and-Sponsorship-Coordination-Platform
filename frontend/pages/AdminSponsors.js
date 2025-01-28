import Navbar from "../components/Navbar.js";
import SponsorCard from "../components/SponsorCard.js";

const AdminSponsors = {
    template: `
    <div>
        <Navbar></Navbar>
        <div class="card mt-4"><div class="card-body">
            <div class="d-flex flex-column align-items-center justify-content-between">
                <h1>Sponsors</h1>
                <p>Monitor all sponsors, flagged sponsors, and pending sponsor approvals in this section.</p>

                <div class="d-flex mt-4">
                    <button @click="changeNature(-1)" class="btn btn-outline-primary me-4" :class="{ active: nature == -1 }">All Sponsors</button>
                    <button @click="changeNature(1)" class="btn btn-outline-danger me-4" :class="{ active: nature == 1 }">Flagged Sponsors</button>
                    <button @click="changeNature(0)" class="btn btn-outline-success me-4" :class="{ active: nature == 0 }">Pending Sponsor Approvals</button>
                </div>
            </div>
            
            <div class="card mt-4"><div class="card-body">
                <div v-if="nature == -1">
                    <div v-if="allSponsors.length > 0">
                        <h2><u>All Sponsors</u></h2>
                        <SponsorCard v-for="sponsor in allSponsors" :key="sponsor.id" :sponsor="sponsor"></SponsorCard>
                    </div>
                    <div v-else class="mt-2">
                        <h2><u>All Sponsors</u></h2>
                        <p>No sponsors exist at the moment.</p>
                    </div>
                </div>

                <div v-if="nature == 1">
                    <div v-if="flaggedSponsors.length > 0">
                        <h2><u>Flagged Sponsors</u></h2>
                        <SponsorCard v-for="sponsor in flaggedSponsors" :key="sponsor.id" :sponsor="sponsor"></SponsorCard>
                    </div>
                    <div v-else class="mt-2">
                        <h2><u>Flagged Sponsors</u></h2>
                        <p>No sponsors have been flagged yet.</p>
                    </div>
                </div>

                <div v-if="nature == 0">
                    <div v-if="pendingSponsors.length > 0">
                        <h2><u>Pending Approvals</u></h2>
                        <SponsorCard v-for="sponsor in pendingSponsors" :key="sponsor.id" :sponsor="sponsor"></SponsorCard>
                    </div>
                    <div v-else class="mt-2">
                        <h2><u>Pending Approvals</u></h2>
                        <p>No pending sponsor approvals exist currently.</p>
                    </div>
                </div>
            </div></div>
            <button @click="goBack" class="btn btn-outline-dark mt-4">Go Back</button>
        </div></div>
    </div>
    `,
    data() {
        return {
            allSponsors: [],
            flaggedSponsors: [],
            pendingSponsors: [],
            nature: -1, // Default to All Sponsors
        };
    },
    methods: {
        goBack() {
            this.$router.go(-1); 
        },
        changeNature(mode) {
            this.nature = mode; // (-1: All, 1: Flagged, 0: Pending)
        },
        async getAllSponsors() {
            const res = await fetch(`/api/admin/sponsors`, {
                headers: { "Authentication-Token": this.$store.state.authen_token },
            });
            if (res.ok) {
                const sponsors = await res.json();
                this.allSponsors = sponsors.filter(sponsor => sponsor.flag != "Pending" && sponsor.flag != "Rejected"); 
                this.flaggedSponsors = sponsors.filter(sponsor => sponsor.flag == "Yes");
                this.pendingSponsors = sponsors.filter(sponsor => sponsor.flag == "Pending");
            } else {
                alert("Something went wrong while fetching sponsors.");
            }
        },
    },
    async mounted() {
        await this.getAllSponsors(); 
    },
    components: {
        Navbar,
        SponsorCard,
    },
};

export default AdminSponsors;
