import Navbar from "../components/Navbar.js";
import CampaignCard from "../components/CampaignCard.js";

const AdminCampaigns = {
    template: `
    <div>
        <Navbar></Navbar>
        <div class="card mt-4"><div class="card-body">
            <div class="d-flex flex-column align-items-center justify-content-between">
                <h1>Campaigns</h1>
                <p>You can monitor and all public, private and flagged campaigns in this section.</p>

                <div class="d-flex mt-4">                    
                    <button @click="setViewMode(0)" class="btn btn-outline-primary me-4" :class="{ active: viewMode == 0 }">Public Campaigns</button>
                    <button @click="setViewMode(-1)" class="btn btn-outline-primary me-4" :class="{ active: viewMode == -1 }">Private Campaigns</button>
                    <button @click="setViewMode(1)" class="btn btn-outline-danger me-4" :class="{ active: viewMode == 1 }">Flagged Campaigns</button>
                </div>
            </div>

            <div class="card mt-4"><div class="card-body">

                <div v-if="viewMode == 0">
                    <div v-if="publicCampaigns.length > 0">
                        <h2><u>Public Campaigns</u></h2>
                        <CampaignCard v-for="campaign in publicCampaigns" :key="campaign.campaign_id" :campaign="campaign"></CampaignCard>
                    </div>
                    <div v-else class="mt-2">
                        <h2><u>Public Campaigns</u></h2>
                        <p>No public campaigns exist at the moment.</p>
                    </div>
                </div>

                <div v-if="viewMode == -1">
                    <div v-if="privateCampaigns.length > 0">
                        <h2><u>Private Campaigns</u></h2>
                        <CampaignCard v-for="campaign in privateCampaigns" :key="campaign.id" :campaign="campaign"></CampaignCard>
                    </div>
                    <div v-else class="mt-2">
                        <h2><u>Private Campaigns</u></h2>
                        <p>No private campaigns exist at the moment.</p>
                    </div>
                </div>

                <div v-if="viewMode == 1">
                    <div v-if="flaggedCampaigns.length > 0">
                        <h2><u>Flagged Campaigns</u></h2>
                        <CampaignCard v-for="campaign in flaggedCampaigns" :key="campaign.id" :campaign="campaign"></CampaignCard>
                    </div>
                    <div v-else class="mt-2">
                        <h2><u>Flagged Campaigns</u></h2>
                        <p>No flagged campaigns exist at the moment.</p>
                    </div>
                </div>
            </div></div>
            <button @click="goBack" class="btn btn-outline-dark mt-4">Go Back</button>
        </div></div>
    </div>
    `,
    data() {
        return {
            privateCampaigns: [],
            publicCampaigns: [],
            flaggedCampaigns: [],
            viewMode: 0, // Default to Public Campaigns
        };
    },
    methods: {
        goBack() {
            this.$router.go(-1); 
        },
        setViewMode(mode) {
            this.viewMode = mode; // Set the current view mode (-1, 0, or 1)
        },
        async getCampaigns() {
            const res = await fetch(`/api/admin/campaigns`, {
                headers: { "Authentication-Token": this.$store.state.authen_token },
            });
            if (res.ok) {
                const campaigns = await res.json();
                this.categorizeCampaigns(campaigns);
            } else {
                alert("Something went wrong while fetching campaigns.");
            }
        },
        categorizeCampaigns(campaigns) {
            this.privateCampaigns = campaigns.filter(campaign => campaign.visibility === "Private");
            this.publicCampaigns = campaigns.filter(campaign => campaign.visibility === "Public");
            this.flaggedCampaigns = campaigns.filter(campaign => campaign.flag === "Yes");
        },
    },
    async mounted() {
        await this.getCampaigns(); 
    },
    components: {
        Navbar,
        CampaignCard,
    },
};

export default AdminCampaigns;
