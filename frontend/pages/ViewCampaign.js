import Navbar from "../components/Navbar.js"
import CampaignFooter from "../components/CampaignFooter.js"

const ViewCampaign = {
  props : ['campaign_id'], 
  template: `<div>
  <Navbar></Navbar>
  <div class="container mt-4 mb-4">
  <div class="card">
  <div class="card-body">
  <div class="d-flex flex-column align-items-center justify-content-between">

    <h1 class="mb-4">Campaign: {{ campaign.campaign_name }}</h1>

    <img v-bind:src="imageUrl" alt="Profile Picture" style="max-width: 250px; height: auto;" class="shadow p-1 rounded bg-success mb-2">

    <p class="mb-4"><h3 class="text-primary"><u>Campaign Details:</u></h3></p>

    <div class="card mb-4"><div class="card-body">
    <p><u><b>Description:</b></u>  {{ campaign.description }} </p>
    </div></div>

    <div class="d-flex justify-content-between">

      <div>
        <p><u><b>Parent Sponsor:</b></u>  
        <button @click='getParent' class="btn btn-outline-success">{{campaign.parent}}</button>
        </p>
        <p><u><b>Niche:</b></u>  {{ campaign.niche }} </p>
        <p><u><b>Visibility:</b></u>  {{ campaign.visibility }} </p>
        <p><u><b>Minimum Payment:</b></u>  {{ campaign.minimum_payment }} </p>
      </div>

      <div class="ms-5">
        <p><u><b>Stard Date:</b></u>  {{ campaign.start_date }} </p>
        <p><u><b>End Date:</b></u>  {{ campaign.end_date }} </p>
        <p><u><b>Status:</b></u>  {{ campaign.status }} </p>
      </div>

    </div>

    <div v-if="campaign.flag=='Yes'">
      <h5 class ='text-danger mt-3'>This campaign has been flagged for inappropriate behaviour and its activity has been restricted.</h5>
      <div v-if="type=='sponsor'">
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
    </div>

    
    </div>

    <div class="d-flex justify-content-center">

        <div v-if="campaign.flag=='No'" class="mt-3 me-3">
            <CampaignFooter :campaign="campaign"></CampaignFooter>
        </div>
        <div class="d-flex flex-column align-items-center">
        <div v-if="campaign.flag=='Yes' && type=='admin'"><div class="d-flex flex-column align-items-center">
            <div class="card mb-2"><div class="card-body"><div class="d-flex flex-column align-items-center">
              <u><b>{{campaign.campaign_name}}'s Appeal against the Flag:</b></u> {{ campaign.appeal }}
            </div></div></div>
            <button @click="unflagCampaign" class="btn btn-outline-success">Un-Flag Campaign</button></div>
        </div>
        <div>
            <button @click="goBack" class="btn btn-outline-dark mt-4">Go Back</button>
        </div>
        </div>
    
    </div>
   
  </div></div></div></div>
  </div>
  `,

  data() {
    return {
      campaign : {},
      imageUrl: '',
      type:'',
      appeal: '',
      appeal_hinge: -1
    }
  },
  
  methods : {
    async getParent(){
      const res = await fetch (`/api/view_campaign_help/${encodeURIComponent(this.campaign.parent)}`, {   //encodeURIComponent handles the case where this.campaign.parent has a special character like a space, for example in "Christopher Nolan"; without encodeURIComponent I was facing a 404 error
        headers : {
          'Authentication-Token' : this.$store.state.authen_token
        }
      })
      if (res.ok){
        const data = await res.json();
        const parent_id = data.sponsor_id
        this.$router.push(`/view/stuff/${parent_id}`);
      } else { 
        alert ('Something went wrong')
      }
    },
    goBack(){
        this.$router.go(-1);
    },
    async getImageUrl(){
      const filename = this.campaign.image;
      if (filename){
      const res = await fetch(`/serve_image/${filename}`)
      if (res.ok){
        this.imageUrl = res.url;
      }
      } else {
        this.imageUrl = 'https://thelyst.com/wp-content/uploads/2015/07/campaign-blog-graphic-01-1080x675.jpg'; 
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
  changeAppealHinge(){
    this.appeal_hinge = - this.appeal_hinge;
   },
   async sendAppeal(){
      const sendData = new FormData();
      sendData.append('appeal', this.appeal);

      const res = await fetch(`/api/appeal/campaign/${this.campaign.campaign_id}`,{
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
    this.type = this.$store.state.role;
    const res = await fetch(`/api/campaign/${this.campaign_id}`,{
        method : "GET",
        headers : {
          'Authentication-Token' : this.$store.state.authen_token
        }
    });
    if (res.ok){
      this.campaign = await res.json()
      this.getImageUrl();
    } else {
        alert('This Campaign Does Not Exist.')
    }
  },
  components : { 
    Navbar,
    CampaignFooter
  }
}  

export default ViewCampaign;