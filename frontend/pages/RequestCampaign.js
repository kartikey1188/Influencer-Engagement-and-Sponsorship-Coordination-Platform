import Navbar from "../components/Navbar.js"

const RequestCampaign = {
    props : ['campaign_id'],
    template: `<div>
      <Navbar></Navbar>
      <div class="container mt-4 mb-4">
        <div class="card mb-4">
          <div class="card-body">
            <h1><u>Make Request</u></h1>
            <h3>To: {{ campaign.parent }}</h3>
            <h3>For Campaign: {{ campaign.campaign_name }}</h3>
            <p class="mt-3">(* : Required)</p>
            <form @submit.prevent="handleSubmit" id="make_request">
              <h4 class="mt-2">Proposed Payment*</h4>
              <input type="number" v-model="formData.payment" placeholder="Enter Payment Amount" class="form-control" required>
              
              <h4 class="mt-2">Proposed Deadline*</h4>
              <input type="date" v-model="formData.deadline" class="form-control" required>
              
              <h4 class="mt-2">Additional Info</h4>
              <input type="text" v-model="formData.additional_info" placeholder="Enter Additional Info" class="form-control">
              
              <button type="submit" class="btn btn-outline-success mt-3">Make Request</button>

            </form>
            <br>
            <button @click="goBack" class="btn btn-outline-dark mt-2">Go Back</button>
          </div>
        </div>
      </div>
      </div>
    `,
  
    data() {
      return {
        campaign : {},
        formData: {
          payment: '',
          deadline: '',
          additional_info: '',
          initiator: '',
        },
        influencer : {},
        ad_exists : false,
        contract_exists : false
      };
    },
  
    methods: {
      goBack (){
        this.$router.go(-1);
      },
      async handleSubmit() {
        const res3 = await fetch(`/api/doescontractexist/${encodeURIComponent(this.campaign.campaign_name)}/${encodeURIComponent(this.influencer.username)}`, {
          headers : {
            'Authentication-Token' : this.$store.state.authen_token
          }
        })
        if (res3.ok){
          const obj3 = await res3.json();
          const answer = obj3.Answer;
          if (answer == 'Yes'){
            this.contract_exists = true;
            alert('A Contract between this campaign and this influencer already exists.')
            return;
          }
        } else {
          alert('Something went wrong while checking if contract exists.')
        }
        const res4 = await fetch(`/api/doesadexist/${encodeURIComponent(this.campaign.campaign_name)}/${encodeURIComponent(this.influencer.username)}`, {
          headers : {
            'Authentication-Token' : this.$store.state.authen_token
          }
        })
        if (res4.ok){
          const obj4 = await res4.json();
          const answer = obj4.Answer;
          if (answer == 'Yes'){
            this.ad_exists = true;
            alert('An Ad Request between this campaign and this influencer already exists.')
            return;
          }
        } else {
          alert('Something went wrong while checking if ad exists.')
        }

        if (this.contract_exists || this.ad_exists) { //Preventing submission if contract or ad already exists
          return; 
        }

        const sendData = new FormData();
        sendData.append("payment", this.formData.payment);
        sendData.append("deadline", this.formData.deadline);
        sendData.append("initiator", "influencer");
        sendData.append("associated_campaign", this.campaign.campaign_name);
        sendData.append("associated_influencer", this.influencer.username);
        sendData.append("associated_sponsor", this.campaign.parent);
        if (this.formData.additional_info) {
          sendData.append("info", this.formData.additional_info);
        }
  
        const res = await fetch('/api/make_ad_request', {
          method: "POST",
          body: sendData,
          headers : {
            'Authentication-Token': this.$store.state.authen_token
          }
        });
  
        if (res.ok) {
          alert("Request made successfully!");
          this.goBack();
        } else {
          alert("Failed to make the request.");
        }
      },
    },
    async mounted(){
      const id = this.campaign_id;
      const res = await fetch(`/api/campaign/${id}`,{
        headers : {
          'Authentication-Token' : this.$store.state.authen_token
        },
        method : 'GET'
      });
      if (res.ok){
        const obj = await res.json();
        this.campaign = obj;
      } else { 
        alert('Something went wrong while fetching campaign.')
      }
      const res2 = await fetch(`/api/influencer/${this.$store.state.userID}`,{
        headers : {
          'Authentication-Token' : this.$store.state.authen_token
        },
        method : 'GET'
      })
      if (res2.ok){
        const obj2 = await res2.json();
        this.influencer = obj2;
      } else {
        alert('Somethng went wrong while fetching influencer.')
      }

    },
    components : {
      Navbar
    },
  };
  
  export default RequestCampaign;
  