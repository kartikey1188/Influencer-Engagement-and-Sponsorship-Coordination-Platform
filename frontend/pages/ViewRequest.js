import Navbar from "../components/Navbar.js";
import ViewRequestFooter from "../components/ViewRequestFooter.js";

const ViewRequest = {
  props: ["adrequest_id"],

  template: `<div>
  <Navbar></Navbar>
  <div class="container mt-4 mb-4">
    <div class="card">
      <div class="card-body">
      <div class="d-flex flex-column align-items-center">
        <h1 class="mb-4"><u>Ad Request Details</u></h1>
        <div class="d-flex align-items-center">
          <div>
            <div class="card"><div class="card-body">
              <p><b>Associated Influencer:</b> <router-link :to="'/view/stuff/' + influencer.id" class="btn btn-outline-primary">{{ request.associated_influencer }}</router-link></p>
              <p><b>Associated Sponsor:</b> <router-link :to="'/view/stuff/' + sponsor.id" class="btn btn-outline-primary">{{ request.associated_sponsor }}</router-link></p>
              <p><b>Parent Campaign: </b><router-link :to="'/campaign/view/' + campaign.campaign_id" class="btn btn-outline-primary">{{ request.associated_campaign }}</router-link></p>
            </div></div>
          </div>
          <div class="ms-5">
            <div class="card"><div class="card-body">
              <p><b>Initiator:</b> {{ request.initiator }}</p>
              <p><b>Proposed Payment:</b> {{ request.payment }}</p>
              <p><b>Proposed Deadline:</b> {{ request.deadline }}</p>
              <p><b>Status:</b> {{ request.status }}</p>
            </div></div>
          </div>
        </div>
      </div>

        <div class="card mt-3">
          <div class="card-body">
            <div><b>>> Additional Info:</b></div>
            <p>{{ request.info }}</p>
          </div>
        </div>

        <div v-if="type!='admin'">
          <ViewRequestFooter :request="request"></ViewRequestFooter>
        </div>

        <router-link to="/ad_requests" class="btn btn-outline-dark mt-4">Go Back</router-link>
      </div>
    </div>
  </div>
  </div>`,

  data() {
    return {
      request: {},
      campaign: {},
      sponsor: {},
      influencer: {},
      type:''
    };
  },

  methods: {
    goBack() {
      this.$router.go(-1);
    },
  async begin1(){
    const res = await fetch(`/api/ad_request/function/${this.adrequest_id}`, {
      method: "GET",
      headers: {
        "Authentication-Token": this.$store.state.authen_token,
      },
    });

    if (res.ok) {
      this.request = await res.json();
    } else {
      alert("Ad Request not found.");
    }
  },
  async begin2(){
    
    const res2 = await fetch(`/api/request_card_help/${'campaign'}/${encodeURIComponent(this.request.associated_campaign)}`,{
        headers : {
            'Authentication-Token' : this.$store.state.authen_token
        }
    })
    if (res2.ok){
        this.campaign = await res2.json()
    } else{
        alert('Something went wrong while fetching associated campaign.')
    }
    const res3 = await fetch(`/api/request_card_help/${'sponsor'}/${encodeURIComponent(this.request.associated_sponsor)}`,{
        headers : {
            'Authentication-Token' : this.$store.state.authen_token
        }
    })
    if (res3.ok){
        this.sponsor = await res3.json()
    } else{
        alert('Something went wrong while fetching associated sponsor.')
    }
    const res4 = await fetch(`/api/request_card_help/${'influencer'}/${encodeURIComponent(this.request.associated_influencer)}`,{
        headers : {
            'Authentication-Token' : this.$store.state.authen_token
        }
    })
    if (res4.ok){
        this.influencer = await res4.json()
    } else{
        alert('Something went wrong while fetching associated influencer.')
    }
  },
  },
  async mounted() {
    this.type=this.$store.state.role;
   await this.begin1();
   await this.begin2();
  },

  components: {
    Navbar,
    ViewRequestFooter,
  },
};

export default ViewRequest;
