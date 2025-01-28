export default {
    props : ['influencer'],
    template : `
    <div>
            <div class="mt-2">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h4><u>Influencer Name</u>: {{ influencer.username }}</h4>
                                <p><b>Niche:</b> {{ influencer.niche }}</p>
                                <p><b>Combined Followers:</b> {{ influencer.combined_followers }}</p>
                                <button @click="viewInfluencer" class="btn btn-outline-primary">View Influencer</button>
                            </div>
                            <div>
                                <img v-bind:src="imageUrl" alt="Profile Picture" style="max-width: 250px; height: auto;" class="shadow p-1 rounded bg-success mb-2">
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
            imageUrl: 'https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg' 
        }
    },
    methods : {
        viewInfluencer(){
            this.$router.push(`/view/stuff/${this.influencer.id}`);
        },
        flagInfluencer(){
            
        },
        async getImageUrl(){
            const filename = this.influencer.user.image;
            const res = await fetch(`/serve_image/${filename}`)
            if (res.ok){
              this.imageUrl = res.url;
            }
          }
    },
    async mounted() {
        this.type = this.$store.state.role
        this.getImageUrl();
    }
}