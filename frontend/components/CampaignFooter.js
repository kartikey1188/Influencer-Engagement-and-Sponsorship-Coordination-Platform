export default {
    props: ['campaign'],
    template : `
    <div>

        <div v-if = "type=='influencer'">
            <div class="d-flex justify-content-center mt-2">
                <router-link :to="'/request_campaign/' + campaign.campaign_id" class="btn btn-outline-primary">Request Campaign</router-link>
            </div>
        </div>

        <div v-if = "type=='sponsor'">
            <div class="d-flex mt-2">
                <router-link :to="'/contracts/' + campaign.campaign_id" class="btn btn-outline-primary">View Contracts</router-link>
                <router-link :to="'/campaign/update/' + campaign.campaign_id" class="btn btn-outline-dark ms-5">Update Campaign</router-link>
                <button @click="deleteCampaign" class="btn btn-outline-danger ms-5">Delete Campaign</button>
            </div>
        </div>

        <div v-if = "type=='admin'">
            <div class=" justify-content-center mt-2">
             
                <div v-if = "campaign.flag=='No'">
                    <button @click="flagCampaign" class="btn btn-outline-danger ms-3">Flag Campaign</button>
                </div>
                <div v-if = "campaign.flag=='Yes'">
                    <button @click="unflagCampaign" class="btn btn-outline-success ms-3">Un-Flag Campaign</button>
                </div>
                
            </div>
        </div>
        </div>
    
    </div>
    `,
    data(){
        return {
            type: ''
        }
    },
    async mounted() {
        this.type = this.$store.state.role
    },
    methods : { 
        goBack(){
            this.$router.go(-1)
        },
        async flagCampaign(){
            const res = await fetch(`/api/flag/campaign/${this.campaign.campaign_id}`,{
                method : 'PUT',
                headers : {
                    'Authentication-Token' : this.$store.state.authen_token
                }
            })
            if (res.ok){
                alert('Campaign Flagged Successfully.')
                this.campaign.flag = 'Yes';
            } else { 
                alert('Could Not Flag Campaign.')
            }
        },
        async unflagCampaign(){
            const res = await fetch(`/api/unflag/campaign/${this.campaign.campaign_id}`,{
                method : 'PUT',
                headers : {
                    'Authentication-Token' : this.$store.state.authen_token
                }
            })
            if (res.ok){
                alert('Campaign Un-Flagged Successfully.')
                this.campaign.flag = 'No';
            } else { 
                alert('Could Not Un-Flag Campaign.')
            }
    
        },
        async deleteCampaign() {
            const res = await fetch(`/api/campaign/${this.campaign.campaign_id}`, { 
                method: 'DELETE',
                headers: {
                    'Authentication-Token' : this.$store.state.authen_token
                }
             });
            if (res.ok){
                this.goBack();
                alert('Campaign Deleted Successfully');
            } else {
                alert('Could Not Delete Campaign.');
            }
        }
    }
}