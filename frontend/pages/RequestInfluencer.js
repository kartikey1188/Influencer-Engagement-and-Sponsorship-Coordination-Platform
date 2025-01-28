import Navbar from "../components/Navbar.js"

const RequestInfluencer = {
    props : ['influencer_id'],
    template: `<div>
    <div>
    <Navbar></Navbar>
      <div class="container mt-4 mb-4">
        <div class="card mb-4">
          <div class="card-body">
            <h1><u>Make Request</u></h1>
            <h3>To: {{ influencer.username }}</h3>
            <p class="mt-3">(* : Required)</p>
            <form @submit.prevent="handleSubmit" id="make_request">
              <h4 class="mt-2">Proposed Payment*</h4>
              <input type="number" v-model="formData.payment" placeholder="Enter Payment Amount" class="form-control" required>
              
              <h4 class="mt-2">Proposed Deadline*</h4>
              <input type="date" v-model="formData.deadline" class="form-control" required>
              
              <h4 class="mt-2">Additional Info</h4>
              <input type="text" v-model="formData.additional_info" placeholder="Enter Additional Info" class="form-control">

              <h4 class="mt-4">Select a Public Campaign:*</h4>
              <p>(Only Non-Fagged Campaigns are eligble to be selected and displayed here.)</p>
                <div v-if="campaigns.length > 0">
                    <div v-for="campaign in campaigns" :key="campaign.campaign_name">
                        <input 
                        type="radio" 
                        v-model="formData.associated_campaign" 
                        :value="campaign.campaign_name" 
                        :id="campaign.campaign_name" 
                        name="associated_campaign" 
                        required>
                        <label :for="campaign.campaign_name">{{ campaign.campaign_name }}</label>
                    </div>
                    <button type="submit" class="btn btn-outline-success mt-3">Make Request</button>
                </div>
                <div v-else>
                    <p> You've either got no public campaigns right now, or all your public campaigns are flagged. Create more campaigns to send requests to influencers. </p>
                </div>

            </form>
            <br>
            <button @click="goBack" class="btn btn-outline-dark mt-1">Go Back</button>
          </div>
        </div>
      </div>
      </div>
      </div>
    `,
  
    data() {
      return {
        campaigns : [],
        formData: {
          payment: '',
          deadline: '',
          additional_info: '',
          initiator: '',
          associated_campaign: ''
        },
        influencer : {},
        sponsor : {},
        contract_exists: false,
        ad_exists: false
      };
    },
  
    methods: {
      goBack (){
        this.$router.go(-1);
      },
      async handleSubmit() {
        const res4 = await fetch(`/api/doescontractexist/${encodeURIComponent(this.formData.associated_campaign)}/${encodeURIComponent(this.influencer.username)}`, {
            headers : {
              'Authentication-Token' : this.$store.state.authen_token
            }
        })
        if (res4.ok){
            const obj4 = await res4.json();
            const answer = obj4.Answer;
            if (answer == 'Yes'){
              this.contract_exists = true;
              alert('A Contract between this campaign and this influencer already exists.')
              return;
            }
        } else {
            alert('Something went wrong while checking if contract exists.')
        }
        const res5 = await fetch(`/api/doesadexist/${encodeURIComponent(this.formData.associated_campaign)}/${encodeURIComponent(this.influencer.username)}`, {
            headers : {
              'Authentication-Token' : this.$store.state.authen_token
            }
        })
        if (res5.ok){
            const obj5 = await res5.json();
            const answer = obj5.Answer;
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
        sendData.append("initiator", "sponsor");
        sendData.append("associated_campaign", this.formData.associated_campaign);
        sendData.append("associated_influencer", this.influencer.username);
        sendData.append("associated_sponsor", this.sponsor.username);
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
      const id = this.$store.state.userID;
      const res = await fetch(`/api/request_influencer_help/${id}`,{
        headers : {
          'Authentication-Token' : this.$store.state.authen_token
        },
        method : 'GET'
      });
      if (res.ok){
        const obj = await res.json();
        this.campaigns = obj;
      } else { 
        alert('Something went wrong while fetching campaigns.')
      }
      const in_id = this.influencer_id
      const res2 = await fetch(`/api/influencer/${in_id}`,{
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
      const res3 = await fetch(`/api/sponsor/${id}`,{
        headers : {
          'Authentication-Token' : this.$store.state.authen_token
          },
          method : 'GET'
      })
      if (res3.ok){
        const obj3 = await res3.json();
        this.sponsor = obj3
      } else {
        alert ('Something went wrong while fetching sponsor.')
      }
  
    },
    components : {
      Navbar
    },
  };
  
  export default RequestInfluencer;
  