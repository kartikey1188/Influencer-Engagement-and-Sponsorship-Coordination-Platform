import Navbar from "../components/Navbar.js";
import CampaignCard from "../components/CampaignCard.js";

export default {
  template: `
    <div>
      <Navbar></Navbar>
      <div class="container mt-4 mb-4">
        <div class="card">
        <div class="card-body">
            <div>
              <h1>{{ sponsor.username }}'s Campaigns</h1>
            </div>
            
            <div>
              <button v-if="campaigns.length > 0" @click="createCampaign" class="btn btn-outline-success mt-2">Add Another Campaign</button>
            </div>

            <div v-if="campaigns.length > 0">
              <div class="d-flex flex-column">
                <div class="d-flex justify-content-center mt-2">
                  <button @click="exportDetails" class="btn btn-warning">Click Here To Download All Campaign Details (Both Public & Private) as CSV</button>
                </div>
                
                <div class="container" style='width: 500px;'><div class="card mt-3" ><div class="card-body">
                  <div class="text-center">
                    <h3> <u>Sections:</u> </h3>
                  </div>
                  <div class="d-flex justify-content-center">
                    <button @click="setNature('Public')" class="btn btn-outline-primary me-3" :class="{ active: nature == 'Public' }">Public Campaigns</button>
                    <button @click="setNature('Private')" class="btn btn-outline-primary ms-3" :class="{ active: nature == 'Private' }">Private Campaigns</button>
                  </div>
                </div></div></div>
              </div>
                <div v-if="nature == 'Public'">
                  <h3 class="mt-4"><u>My Public Campaigns</u></h3>
                  <div v-if="publicCampaigns.length > 0">
                    <CampaignCard v-for="campaign in publicCampaigns" :key="campaign.campaign_id" :campaign="campaign"></CampaignCard>
                  </div>
                  <p v-else>You have no campaigns that are public.</p>
                </div>

                <div v-if="nature == 'Private'">
                  <h3 class="mt-4"><u>My Private Campaigns</u></h3>
                  <div v-if="privateCampaigns.length > 0">
                    <CampaignCard v-for="campaign in privateCampaigns" :key="campaign.campaign_id" :campaign="campaign"></CampaignCard>
                  </div>
                  <p v-else>You have no campaigns that are private.</p>
                </div>
            </div>
            
            <div v-else>
              <p class="mt-3">You have not created any campaigns yet.</p>
              <button @click="createCampaign" class="btn btn-outline-success mt-2">Add Campaign</button>
            </div>
        </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      sponsor: {}, 
      campaigns: [], 
      publicCampaigns: [], 
      privateCampaigns: [], 
      nature: 'Public' // Default to Public Campaigns
    };
  },

  methods: {
    async exportDetails(){
      const res = await fetch(`/create_campaigns_csv/${this.$store.state.userID}`, {
        headers : {
          'Authentication-Token' : this.$store.state.authen_token
        }
      })
      const task_id = (await res.json()).task_id

      const interval = setInterval(async() => {
          const res = await fetch(`/get_campaigns_csv/${task_id}`, {
            headers : {
              'Authentication-Token' : this.$store.state.authen_token
            }
          })
          if (res.ok){
              console.log('The CSV File has been created.')
              window.open(`/get_campaigns_csv/${task_id}`)
              clearInterval(interval) // this line stops the periodic execution of that fetch call
              alert('Campaign Details CSV File Downloaded Successfully.')
          }

      }, 100)  // polling (querying) every 100 milliseconds until res.ok is satisfied 
    },

    async fetchSponsorData() {
      const sponsorId = this.$store.state.userID;
      const res = await fetch(`/api/sponsor/${sponsorId}`, {
        method: "GET",
        headers: {
          "Authentication-Token": this.$store.state.authen_token
        }
      });
      if (res.ok) {
        this.sponsor = await res.json();
      } else {
        alert("Failed to fetch sponsor data.");
      }
    },
    async fetchCampaigns() {
      const res = await fetch(`/api/sponsor/campaign_list/${this.sponsor.id}`);
      if (res.ok) {
        const campaigns = await res.json();
        this.campaigns = campaigns;
        this.publicCampaigns = this.campaigns.filter(campaign => campaign.visibility == "Public");
        this.privateCampaigns = this.campaigns.filter(campaign => campaign.visibility == "Private");
      } else {
        alert("Failed to fetch campaigns.");
      }
    },
    createCampaign() {
      this.$router.push("/campaign/create");
    },
    setNature(nature) {
      this.nature = nature; // Toggling between "Public" and "Private"
    }
  },

  async mounted() {
    await this.fetchSponsorData();
    await this.fetchCampaigns();
  },

  components: {
    Navbar,
    CampaignCard
  }
};
