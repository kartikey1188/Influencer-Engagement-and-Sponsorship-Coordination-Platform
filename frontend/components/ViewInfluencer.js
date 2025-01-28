import Navbar from "../components/Navbar.js"
const ViewInfluencer = {
  props : ['influencer'],
  template: `<div>
  <div class="container mt-4 mb-4">
  <div class="card">
  <div class="card-body">
  <div class="d-flex flex-column align-items-center justify-content-between">

    <h1 class="mb-4"><u>Influencer</u>: {{ influencer.username }}</h1>

    <img v-bind:src="imageUrl || getImageUrl()" alt="Profile Picture" style="max-width: 250px; height: auto;" class="shadow p-1 rounded bg-success mb-2">

    <p class="mb-4"><h3 class="text-primary"><u>Profile Details:</u></h3></p>

    <div class="d-flex justify-content-between">

      <div>
        <p><u><b>Username:</b></u> {{ influencer.username }}</p>
        <p v-if="influencer.user"><u><b>Email:</b></u> {{ influencer.user.email }}</p>
        <p><u><b>Niche:</b></u> {{ influencer.niche }}</p>
        <p><u><b>Total Earnings:</b></u> {{ influencer.earnings }}</p>
      </div>

      <div class="ms-5">
        <p><u><b>Combined Followers:</b></u> {{ influencer.combined_followers }}</p>
        <u><b>Platforms active on:</b></u>
        <div v-if="JSON.parse(influencer.platforms).length > 0">
          <div v-for="platform in JSON.parse(influencer.platforms)" :key ="platform"> >> {{ platform }}</div>
        </div>
        <div v-else>
          <p class="text-muted">No platforms added yet.</p>
        </div>
      </div>

    </div>

    <div v-if="influencer.flag=='Yes'">
      <h5 class ='text-danger mt-3'>This influencer has been flagged for inappropriate behavior and its activity has been restricted.</h5>
    </div>

    <div class="d-flex mt-4">

        <div v-if = "type=='sponsor'">
            <div v-if="influencer.flag=='No'">
                <router-link :to="'/request_influencer/' + influencer.id" class="btn btn-outline-primary">Request Influencer</router-link>
            </div>
        </div>
        <div v-if = "type=='admin'">
            <div v-if="influencer.flag=='No'">
               <button @click="flagInfluencer" class="btn btn-outline-danger">Flag Influencer</button>
            </div>
            <div v-if="influencer.flag=='Yes'">
                <div class="card mb-3"><div class="card-body"><div class="d-flex flex-column align-items-center">
                    <u><b>{{influencer.username}}'s Appeal against the Flag:</b></u> {{ influencer.appeal }}
                </div></div></div>
               <button @click="unflagInfluencer" class="btn btn-outline-success ms-5">Un-Flag Influencer</button>
            </div>
        </div>

        <div>
            <button @click="goBack" class="btn btn-outline-dark ms-5">Go Back</button>
        </div>
    
    </div>

 
   
  </div></div></div></div>
  </div>
  `,

  data() {
    return {
      imageUrl: '',
      type : ''
    }
  },
  
  methods : {
    goBack(){
        this.$router.go(-1);
    },
    async getImageUrl(){
      const filename = this.influencer.user.image;
      if (filename){
      const res = await fetch(`/serve_image/${filename}`)
      if (res.ok){
        this.imageUrl = res.url;
      }
      } else {
        this.imageUrl = 'https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg'; 
      }
    },
    async flagInfluencer(){
      const res = await fetch(`/api/flag/influencer/${this.influencer.id}`,{
          method : 'PUT',
          headers : {
              'Authentication-Token' : this.$store.state.authen_token
          }
      })
      if (res.ok){
          alert('Influencer Flagged Successfully.')
          this.influencer.flag = 'Yes';
      } else { 
          alert('Could Not Flag Influencer.')
      }
  },
  async unflagInfluencer(){
      const res = await fetch(`/api/unflag/influencer/${this.influencer.id}`,{
          method : 'PUT',
          headers : {
              'Authentication-Token' : this.$store.state.authen_token
          }
      })
      if (res.ok){
          alert('Influencer Un-Flagged Successfully.')
          this.influencer.flag = 'No';
      } else { 
          alert('Could Not Un-Flag Influencer.')
      }

  }
  },
  mounted () {
    this.type = this.$store.state.role;
  },
  components : { 
    Navbar,
  }
}  

export default ViewInfluencer;