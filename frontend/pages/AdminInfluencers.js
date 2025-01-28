import Navbar from "../components/Navbar.js";
import InfluencerCard from "../components/InfluencerCard.js";

const AdminInfluencers = {
    template: `
    <div>
        <Navbar></Navbar>
        <div class="card mt-4"><div class="card-body">
            <div class="d-flex flex-column align-items-center justify-content-between">
                <h1>Influencers</h1>
                <p>Monitor all influencers and flagged influencers in this section.</p>

                <div class="d-flex mt-4">
                    <button @click="changeNature" class="btn btn-outline-primary me-4" :class="{ active: nature == -1 }">All Influencers</button>
                    <button @click="changeNature" class="btn btn-outline-danger ms-4" :class="{ active: nature == 1 }">Flagged Influencers</button>
                </div>
            </div>
            
            <div class="card mt-4"><div class="card-body">

                <div v-if="nature == -1">
                    <div v-if="allInfluencers.length > 0">
                        <h2><u>All Influencers</u></h2>
                        <InfluencerCard v-for="influencer in allInfluencers" :key="influencer.id" :influencer="influencer"></InfluencerCard>
                    </div>
                    <div v-else class="mt-2">
                        <h2><u>All Influencers</u></h2>
                        <p>No influencers exist at the moment.</p>
                    </div>
                </div>

                <div v-if="nature == 1">
                    <div v-if="flaggedInfluencers.length > 0">
                        <h2><u>Flagged Influencers</u></h2>
                        <InfluencerCard v-for="influencer in flaggedInfluencers" :key="influencer.id" :influencer="influencer"></InfluencerCard>
                    </div>
                    <div v-else class="mt-2">
                        <h2><u>Flagged Influencers</u></h2>
                        <p>No influencers have been flagged yet.</p>
                    </div>
                </div>
            </div></div>
            <button @click="goBack" class="btn btn-outline-dark mt-4">Go Back</button>
        </div></div>
    </div>
    `,
    data() {
        return {
            allInfluencers: [],
            flaggedInfluencers: [],
            nature: -1, // Default to "All Influencers"
        };
    },
    methods: {
        goBack() {
            this.$router.go(-1); 
        },
        changeNature() {
            this.nature = -this.nature; 
        },
        async getAllInfluencers() {
            const res = await fetch(`/api/admin/influencers`, {
                headers: { "Authentication-Token": this.$store.state.authen_token },
            });
            if (res.ok) {
                const influencers = await res.json();
                this.allInfluencers = influencers;
                this.flaggedInfluencers = influencers.filter(influencer => influencer.flag === "Yes");
            } else {
                alert("Something went wrong while fetching influencers.");
            }
        },
    },
    async mounted() {
        await this.getAllInfluencers(); 
    },
    components: {
        Navbar,
        InfluencerCard,
    },
};

export default AdminInfluencers;
