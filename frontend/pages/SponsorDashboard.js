import Navbar from "../components/Navbar.js"
import Footer from "../components/Footer.js"

const SponsorDashboard = {

  template: `<div>
  <div v-if="sponsor.flag=='Pending'">
        <div class="text-center mt-5">
          <h4>Dear {{sponsor.username}}, Your Registration Is Currently Pending Approval By The Admin. Kindly Wait.</h4>
          <button @click="getOut" class="btn btn-outline-danger mt-5">Logout</button>
        </div>
  </div>
  <div v-if="sponsor.flag=='Rejected'">
        <div class="text-center mt-5">
          <h4>Dear {{sponsor.username}}, Your Registration Has Been Rejected By The Admin. To Try Again, Delete This Attempt.</h4>
            <div class="mt-3">
              <button @click="deleteUser" class="btn btn-outline-danger mt-5">Delete Attempt</button> <!-- this deletes the corresponding sponsor object -->
              <button @click="getOut" class="btn btn-outline-danger mt-5 ms-5">Logout</button>
            </div>  
        </div>
  </div>
<div v-if="sponsor.flag != 'Pending' && sponsor.flag != 'Rejected'">
  <Navbar></Navbar>
  <div class="container mt-4 mb-4">
  <div class="card">
  <div class="card-body">
  <div class="d-flex flex-column align-items-center justify-content-between">

    <h1 class="mb-4">Welcome Back, {{ sponsor.username }}!</h1>

    <img v-bind:src="imageUrl" alt="Profile Picture" style="max-width: 250px; height: auto;" class="shadow p-1 rounded bg-success mb-2">

    <p class="mb-4"><h3 class="text-primary"><u>Profile Details:</u></h3></p>

    <div class="d-flex justify-content-between">

      <div>
        <p><u><b>Username:</b></u> {{ sponsor.username }}</p>
        <p v-if="sponsor.user"><u><b>Email:</b></u> {{ sponsor.user.email }}</p>
      </div>

      <div class="ms-5">
        <p><u><b>Industry:</b></u> {{ sponsor.industry }}</p>
        <p><u><b>Total Expenditure:</b></u> {{ sponsor.expenditure }}</p>
      </div>

    </div>

    <div v-if="sponsor.flag=='Yes'">
      <h5 class ='text-danger mt-3'>You have been flagged for inappropriate behaviour and your activity has been restricted.</h5>
      <div class="d-flex justify-content-center"> <button @click="changeAppealHinge" class = 'btn btn-outline-danger mb-4 mt-2' :class="{active:appeal_hinge==1}"> Appeal to Admin </button> </div>
      <div v-if="appeal_hinge==1" class="mt-2 mb-2">
          <div class="card"><div class="card-body">
              <form @submit.prevent="sendAppeal" id="make_appeal">
                  <h4>Appeal against the Flag:</h4>
                    <div class="mb-3 mt-4">
                        <input type="text" class="form-control" id="appeal" name="appeal" placeholder="Type" ref="appealInput" v-model="appeal">
                    </div>
                  <button type="submit" class="btn btn-outline-success">Send Appeal</button>
              </form>
          </div></div>
      </div>
    </div>

    <div class="d-flex justify-content-beween">
      <div v-if="sponsor.flag=='No'" class="mt-3">
        <Footer></Footer>
      </div>
      <div class="mt-3 me-5">
        <button @click="deleteUser" class="btn btn-outline-danger ms-5">Delete Account</button>
      </div>
    </div>

  </div></div></div></div>
  </div>
  </div>
  `,

  data() {
    return {
      sponsor : {},
      imageUrl: 'https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg',
      appeal_hinge: -1, 
      appeal:''
    }
  },
  
  methods : {
    async getImageUrl(){
      const filename = this.sponsor.user.image;
      const res = await fetch(`/serve_image/${filename}`)
      if (res.ok){
        this.imageUrl = res.url;
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
  getOut (){
    this.$store.commit('logOut');
    this.$router.push('/');
  },
   changeAppealHinge(){
    this.appeal_hinge = - this.appeal_hinge;
   },
   async sendAppeal(){
      const sendData = new FormData();
      sendData.append('appeal', this.appeal);

      const res = await fetch(`/api/appeal/sponsor/${this.sponsor.id}`,{
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
    const sponsor_id  = this.$store.state.userID;
    const res = await fetch(`/api/sponsor/${sponsor_id}`,
      {
        headers : {
          'Authentication-Token' : this.$store.state.authen_token
        }
      });
    if (res.ok){
      this.sponsor = await res.json()
      this.getImageUrl();
    }
  },
  components : {
    Navbar,
    Footer
  }
}  

export default SponsorDashboard;