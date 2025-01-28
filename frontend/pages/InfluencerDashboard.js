import Navbar from "../components/Navbar.js"
import Footer from "../components/Footer.js"

const InfluencerDashboard = {

  template: `<div>
  <Navbar></Navbar>
  <div class="container mt-4 mb-4">
  <div class="card">
  <div class="card-body">
  <div class="d-flex flex-column align-items-center justify-content-between">

    <h1 class="mb-4">Welcome Back, {{ influencer.username }}!</h1>

    <img v-bind:src="imageUrl" alt="Profile Picture" style="max-width: 250px; height: auto;" class="shadow p-1 rounded bg-success mb-2">

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
        <u><b>Platforms you're active on:</b></u>
        <div v-if="platforms.length > 0">
          <div v-for="platform in platforms" :key ="platform"> >> {{ platform }}</div>
        </div>
        <div v-else>
          <p class="text-muted">No platforms added yet.</p>
        </div>
      </div>

    </div>

    <div v-if="influencer.flag=='Yes'">
      <h5 class ='text-danger mt-3'>You have been flagged for inappropriate behaviour and your activity has been restricted.</h5>
      <div class="d-flex justify-content-center"> <button @click="changeAppealHinge" class = 'btn btn-outline-danger mb-4 mt-2' :class="{active:appeal_hinge==1}"> Appeal to Admin </button> </div>
      <div v-if="appeal_hinge==1" class="mt-2 mb-2">
          <div class="card"><div class="card-body">
              <form @submit.prevent="sendAppeal" id="make_appeal">
                  <h4>Appeal against the Flag:</h4>
                    <div class="mb-3 mt-4">
                        <input type="text" class="form-control" id="appeal" name="appeal" ref="appealInput" v-model="appeal" placeholder="Type">
                    </div>
                  <button type="submit" class="btn btn-outline-success">Send Appeal</button>
              </form>
          </div></div>
      </div>
    </div>

    <div class="d-flex justify-content-beween">
      <div v-if="influencer.flag=='No'" class="mt-3">
        <Footer></Footer>
      </div>
      <div class="mt-4 me-5">
        <button @click="deleteUser" class="btn btn-outline-danger ms-5">Delete Account</button>
      </div>
    </div>
   
  </div></div></div></div>
  </div>
  `,

  data() {
    return {
      influencer : {},
      platforms : [],
      imageUrl: '',
      appeal_hinge : -1,
      appeal: ''
    }
  },
  
  methods : {
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
    async deleteUser() {
      const id = this.$store.state.userID;
      const res = await fetch(`/api/eradicate/${id}`, { 
          method: 'DELETE',
          headers: {
              'Authentication-Token' : this.$store.state.authen_token
          }
       });
      if (res.ok){
          this.$store.commit('logOut');
          this.$router.push('/')
          alert('Account Deleted Successfully');
      } else {
          alert('Could Not Delete Account.');
      }
  },
  changeAppealHinge(){
    this.appeal_hinge = - this.appeal_hinge;
   },
  async sendAppeal(){
    const sendData = new FormData();
    sendData.append('appeal', this.appeal);

    const res = await fetch(`/api/appeal/influencer/${this.influencer.id}`,{
      method : 'PUT',
      headers : {
        'Authentication-Token' : this.$store.state.authen_token
      },
      body : sendData
    })
    if (res.ok){
      alert('Appeal Sent To Admin Successfully.');
      this.appeal_hinge = -1;
      this.appeal = '';
      this.$refs.appealInput.value = '';
    } else {
      alert('Could Not Send Appeal');
    }
 }
  },

  async mounted () {
    const influencer_id  = this.$store.state.userID;
    const res = await fetch(`/api/influencer/${influencer_id}`,
      {
        headers : {
          'Authentication-Token' : this.$store.state.authen_token
        }
      });
    if (res.ok){
      this.influencer = await res.json()
      this.platforms = JSON.parse(this.influencer.platforms)
      this.getImageUrl();
    }
  },
  components : { 
    Navbar,
    Footer
  }
}  

export default InfluencerDashboard;