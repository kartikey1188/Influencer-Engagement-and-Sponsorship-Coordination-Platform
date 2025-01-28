import ViewCampaign from "../pages/ViewCampaign.js";
import ViewInfluencer from "./ViewInfluencer.js";

export default {
    props: ['contract'],
    template: `
    <div>
        <div v-if="type == 'sponsor'">
            <div class="card mt-2">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <button @click="viewInfluencer" class="btn btn-outline-dark"><p><u>With Influencer:</u></p><p class="mt-2">{{contract.influencer}}</p></button>
                        </div>
                        <div>
                            <p><b>Payment:</b> {{ contract.payment }}</p>
                            <p><b>Deadline:</b> {{ contract.deadline }}</p>
                            <p><b>Contract Status:</b> {{ contract.status }}</p>
                        </div>
                        <div>
                            <div v-if="contract.status=='Ongoing'">
                                <button @click="markCompleted" class="btn btn-outline-success">Mark Contract Completed</button>
                                <button @click="cancelContract" class="btn btn-outline-danger">Cancel Contract</button>
                            </div>
                            <div v-else>
                                <button @click="deleteContract" class="btn btn-outline-danger">Delete Contract</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="type == 'influencer'">
            <div class="card mt-2">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <button @click="viewCampaign" class="btn btn-outline-dark"><p><u>With Campaign:</u></p><p class="mt-2">{{contract.campaign}}</p></button>
                        </div>
                        <div>
                            <p><b>Payment:</b> {{ contract.payment }}</p>
                            <p><b>Deadline:</b> {{ contract.deadline }}</p>
                            <p><b>Contract Status:</b> {{ contract.status }}</p>
                        </div>
                        <div>
                            <div v-if="contract.status=='Ongoing'">
                                <button @click="cancelContract" class="btn btn-outline-danger">Cancel Contract</button>
                            </div>
                            <div v-else>
                                <button @click="deleteContract" class="btn btn-outline-danger">Delete Contract</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            type: '',
            influencer: {},
            campaign: {}
        };
    },
    methods: {
        reload(){
            this.$router.go(0);
        },
        async deleteContract(){
            const res = await fetch(`/api/contract/${this.contract.id}`,{
                method : 'DELETE',
                headers : {
                    'Authentication-Token' : this.$store.state.authen_token
                }
            })
            if (res.ok){
                alert('Contract Deleted Successfully.')
                this.reload();

            } else {
                alert('Could Not Delete Contract.')
            }
        },
        async cancelContract(){
            const res = await fetch(`/api/cancel_contract/${this.contract.id}`,{
                method : 'PUT',
                headers : {
                    'Authentication-Token' : this.$store.state.authen_token
                }
            })
            if (res.ok){
                alert('Contract Successfully Cancelled.')
                this.contract.status='Cancelled';
                this.reload();
            } else {
                alert('Could Not Cancel Contract')
            }
        },
        async markCompleted(){
            const res = await fetch(`/api/mark_contract_completed/${this.contract.id}`,{
                method : 'PUT',
                headers : {
                    'Authentication-Token' : this.$store.state.authen_token
                }
            })
            if (res.ok){
                alert('Contract Successfully Marked Completed.')
                this.contract.status='Completed'
                this.reload();
            } else {
                alert('Could Not Mark Contract Completed.')
            }
        },
        async viewCampaign(){
            this.$router.push(`/campaign/view/${this.campaign.campaign_id}`)
        },
        async viewInfluencer(){
            this.$router.push(`/view/stuff/${this.influencer.id}`)
        }
    },
    async mounted() {
        this.type = this.$store.state.role; 
        const res1 = await fetch(`/api/request_card_help/${'influencer'}/${encodeURIComponent(this.contract.influencer)}`,{
            headers : {
                'Authentication-Token' : this.$store.state.authen_token
            }
        })
        if (res1.ok){
            this.influencer = await res1.json();
        } else {
            alert("Something went wrong while fetching contract's influencer.");
        }
        const res2 = await fetch(`/api/request_card_help/${'campaign'}/${encodeURIComponent(this.contract.campaign)}`,{
            headers : {
                'Authentication-Token' : this.$store.state.authen_token
            }
        })
        if (res2.ok){
            this.campaign = await res2.json();
        } else {
            alert("Something went wrong while fetching contract's campaign.");
        }
    },
    components : {
        ViewCampaign,
        ViewInfluencer
    }
}
