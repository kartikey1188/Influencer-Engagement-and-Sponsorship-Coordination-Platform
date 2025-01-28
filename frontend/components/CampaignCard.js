export default {
    props : ['campaign'],
    template : `
    <div>
        <div v-if="type=='influencer'">
            <div class="mt-2">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h4>Campaign Name: {{ campaign.campaign_name }}</h4>
                                <p><u><b>End Date:</b></u> {{ campaign.end_date }}</p>
                                <p><u><b>Minimum Payment:</b></u> {{ campaign.minimum_payment }}</p>
                                <p><u><b>Niche:</b></u> {{ campaign.niche }}</p>
                                <router-link :to="'/campaign/view/' + campaign.campaign_id" class="btn btn-outline-primary">View Campaign</router-link>
                            </div>
                            <div>
                                <img v-bind:src="imageUrl" alt="Campaign Picture" style="max-width: 200px; height: auto;" class="shadow p-1 rounded bg-success mb-2">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="type=='sponsor'">
            <div class="mt-2">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h4>Campaign Name: {{ campaign.campaign_name }}</h4>
                                <p><u><b>Goal:</b></u> {{ campaign.goal }}</p>
                                <router-link :to="'/campaign/view/' + campaign.campaign_id" class="btn btn-outline-primary">View Campaign</router-link>
                            </div>
                            <div>
                                <img v-bind:src="imageUrl" alt="Campaign Picture" style="max-width: 200px; height: auto;" class="shadow p-1 rounded bg-success mb-2">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="type=='admin'">
            <div class="mt-2">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h4>Campaign Name: {{ campaign.campaign_name }}</h4>
                                <p><u><b>Parent:</b></u> {{ campaign.parent }}</p>
                                <p><u><b>Minimum Payment:</b></u> {{ campaign.minimum_payment }}</p>
                                <p><u><b>Goal:</b></u> {{ campaign.goal }}</p>
                                <div class="d-flex">
                                <router-link :to="'/campaign/view/' + campaign.campaign_id" class="btn btn-outline-dark">View Campaign</router-link>
                                        
                                
                                
                                </div>
                            </div>
                            <div>
                                <img v-bind:src="imageUrl" alt="Campaign Picture" style="max-width: 250px; height: auto;" class="shadow p-1 rounded bg-success mb-2">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data(){
        return {
            type: '',
            imageUrl: ''
        }
    },
    methods : {
        
        async getImageUrl(){
            const filename = this.campaign.image;
            const res = await fetch(`/serve_image/${filename}`)
            if (res.ok){
              this.imageUrl = res.url;
            } else { 
              this.imageUrl = 'https://thelyst.com/wp-content/uploads/2015/07/campaign-blog-graphic-01-1080x675.jpg';
            }
        }
    },
    async mounted() {
        this.type = this.$store.state.role;
        this.getImageUrl();
    }
}
