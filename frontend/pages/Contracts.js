import ContractCard from "../components/ContractCard.js";
import Navbar from "../components/Navbar.js";

export default {
    props : ['id'], // here this is to be used only in case the current user is a sponsor - which means this is campaign_id, passed from CampaignFooter.js (this must not be used in case current user is influencer, because from Footer.js, this id was passed as 888888 just as a placeholder; get influencer's id from this.$store.state.userID)
    template: `<div>
    <Navbar></Navbar>
    <div class="container mt-4 mb-4"><div class="card"><div class="card-body">
        <div v-if="type=='influencer'" class="mt-2 mb-2">
            <h1>My Contracts</h1>
        </div>
        <div v-if="type=='campaign'" class="mt-2 mb-2">
            <h1>Contracts For Campaign: {{campaign.campaign_name}}</h1>
        </div>
        
        <div class="card mt-4"><div class="card-body">
        <div class="d-flex justify-content-center">
            <button @click="setNature('Ongoing')" class="btn btn-outline-primary me-4" :class="{ active: nature == 'Ongoing' }">Ongoing Contracts</button>
            <button @click="setNature('Completed')" class="btn btn-outline-success me-4" :class="{ active: nature == 'Completed' }">Completed Contracts</button>
            <button @click="setNature('Cancelled')" class="btn btn-outline-danger" :class="{ active: nature == 'Cancelled' }">Cancelled Contracts</button>
        </div>
        </div></div>

        <div class="card mt-4">
            <div class="card-body">
                <div v-if="nature == 'Ongoing'">
                    <h3><u>Ongoing Contracts:</u></h3>
                    <div v-if="ongoingContracts.length > 0">
                        <div v-for="contract in ongoingContracts" :key="contract.id">
                            <ContractCard :contract="contract"></ContractCard>
                        </div>
                    </div>
                    <p v-else class="mt-4">No ongoing contracts at the moment.</p>
                </div>

                <div v-if="nature == 'Completed'">
                    <h3><u>Completed Contracts:</u></h3>
                    <div v-if="completedContracts.length > 0">
                        <div v-for="contract in completedContracts" :key="contract.id">
                            <ContractCard :contract="contract"></ContractCard>
                        </div>
                    </div>
                    <p v-else class="mt-4">No completed contracts yet.</p>
                </div>

                <div v-if="nature == 'Cancelled'">
                    <h3><u>Cancelled Contracts:</u></h3>
                    <div v-if="cancelledContracts.length > 0">
                        <div v-for="contract in cancelledContracts" :key="contract.id">
                            <ContractCard :contract="contract"></ContractCard>
                        </div>
                    </div>
                    <p v-else class="mt-4">No cancelled contracts yet.</p>
                </div>
            </div>
        </div>
    </div></div>
    </div>
    </div>
    `,
    data() {
        return {
            contracts: [],
            ongoingContracts: [],
            completedContracts: [],
            cancelledContracts: [],
            type: '',
            i_d: '',
            campaign: {},
            nature: 'Ongoing' // Default to Ongoing Contracts
        };
    },
    methods: {
        async fetchContracts() {
            const res = await fetch(`/api/fetch_contracts/${this.type}/${this.i_d}`,{
                method : 'GET',
                headers : {
                    'Authentication-Token' : this.$store.state.authen_token
                }
            })
            if (res.ok){
                this.contracts = await res.json();
                this.categorizeContracts();
            } else {
                alert('Could Not Fetch Contracts.');
            }
        },
        categorizeContracts() {
            this.ongoingContracts = this.contracts.filter(contract => contract.status === 'Ongoing');
            this.completedContracts = this.contracts.filter(contract => contract.status === 'Completed');
            this.cancelledContracts = this.contracts.filter(contract => contract.status === 'Cancelled');
        },
        async getCampaign(){
            const res = await fetch(`/api/campaign/${this.id}`,{
                headers : {
                    'Authentication-Token' : this.$store.state.authen_token
                }
            })
            if (res.ok){
                this.campaign = await res.json();
            } else { 
                alert('Could Not Fetch Campaign.')
            }
        },
        setNature(nature) {
            this.nature = nature; // Toggling between "Ongoing," "Completed," and "Cancelled"
        }
    },
    async mounted() {
        this.type = this.$store.state.role; 
        if (this.type=='sponsor'){
            await this.getCampaign();
        }
        if (this.type=='sponsor'){
            this.type='campaign';
            this.i_d=this.id;
        }
        if (this.type=='influencer'){
            this.i_d=this.$store.state.userID;
        }
        await this.fetchContracts();
    },
    components: {
        ContractCard,
        Navbar
    }
};
