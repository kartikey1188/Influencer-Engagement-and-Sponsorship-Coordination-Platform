
export default {
    props : ['request'],
    template : `
    <div>
        <div v-if = "type=='influencer'">
          
                <div class="card mt-2">
                    <div class="card-body">
                        <h4> <u>Campaign Name: {{campaign.campaign_name}}</u> </h4>
                        <p><u><b>Sponsor:</b></u> {{ request.associated_sponsor }}</p>
                        <p><u><b>Status:</b></u> {{ request.status }}</p>
                        <p><u><b>Initiator:</b></u> {{ request.initiator }}</p>
                        <div class="d-flex">
                            <router-link :to="'/campaign/view/' + campaign.campaign_id" class="btn btn-outline-primary">View Campaign</router-link>
                            <button @click="viewSponsor" class="btn btn-outline-primary ms-2">View Sponsor</button>
                            <router-link :to="'/request/view/' + request.adrequest_id" class="btn btn-outline-warning ms-2">View Request</router-link>
                        </div>
                    </div>
                </div>
          
        </div>
        <div v-if = "type=='sponsor'">
            
                
                <div class="card mt-2">
                    <div class="card-body">
                        <h4> <u>Campaign Name: {{campaign.campaign_name}}</u> </h4>
                        <p><u><b>Influencer:</b></u> {{ request.associated_influencer }}</p>
                        <p><u><b>Status:</b></u> {{ request.status }}</p>
                        <div class="d-flex">
                            <router-link :to="'/campaign/view/' + campaign.campaign_id" class="btn btn-outline-primary">View Campaign</router-link>
                            <button @click="viewInfluencer" class="btn btn-outline-primary ms-2">View Influencer</button>
                            <router-link :to="'/request/view/' + request.adrequest_id" class="btn btn-outline-warning ms-2">View Request</router-link>
                        </div>
                    </div>
                </div>
          
        </div>
        <div v-if = "type=='admin'">
            
                
                <div class="card mt-2">
                    <div class="card-body">
                    <h4> <u>Associated Campaign Name</u>: {{campaign.campaign_name}} </h4>
                    <div class="d-flex">
                        <div>
                            <p><u><b>Influencer:</b></u> {{ request.associated_influencer }}</p>
                            <p><u><b>Sponsor:</b></u> {{ request.associated_sponsor }}</p>
                            <p><u><b>Initiator:</b></u> {{ request.initiator }}</p>
                        </div>
                        <div class="ms-5">
                            <p><u><b>Proposed Payment:</b></u> {{ request.payment }}</p>
                            <p><u><b>Proposed Sponsor:</b></u> {{ request.deadline }}</p>
                            <p><u><b>Status:</b></u> {{ request.status }}</p>
                        </div>
                    </div>
                        <div class="d-flex">
                            <router-link :to="'/campaign/view/' + campaign.campaign_id" class="btn btn-outline-primary">View Campaign</router-link>
                            <button @click="viewInfluencer" class="btn btn-outline-primary ms-2">View Influencer</button>
                            <button @click="viewSponsor" class="btn btn-outline-primary ms-2">View Sponsor</button>
                        </div>
                    </div>
                </div>
          
        </div>
    </div>
    `,
    data(){
        return {
            influencer : {},
            sponsor : {},
            campaign : {},
            type: '',
        }
    },
    methods : {
        async viewSponsor(){
            const res = await fetch(`/api/request_card_help/${'sponsor'}/${encodeURIComponent(this.request.associated_sponsor)}`,
                {
                    headers : {
                        'Authentication-Token' : this.$store.state.authen_token
                    }
                }
            );
            this.sponsor = await res.json();
            this.$router.push(`/view/stuff/${this.sponsor.id}`);
        },
        async viewInfluencer(){
            const res = await fetch(`/api/request_card_help/${'influencer'}/${encodeURIComponent(this.request.associated_influencer)}`,
                {
                    headers : {
                        'Authentication-Token' : this.$store.state.authen_token
                    }
                }
            );
            this.influencer = await res.json();
            this.$router.push( `/view/stuff/${this.influencer.id}`);
        }
    },
    async mounted() {
        this.type = this.$store.state.role
        const res = await fetch(`/api/request_card_help/${'campaign'}/${encodeURIComponent(this.request.associated_campaign)}`,
            {
                headers : {
                    'Authentication-Token' : this.$store.state.authen_token
                }
            }
        )
        if (res.ok){
            this.campaign = await res.json()
        } else {
            alert('Could not fetch campaign.')
        }
    }
}