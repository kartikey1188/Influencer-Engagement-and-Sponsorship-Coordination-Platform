import Navbar from "../components/Navbar.js";

const EditRequest = {
props: ['adrequest_id'],
template: `<div>
    <Navbar></Navbar>
  <div class="container mt-4 mb-4">
        <div class="card mb-4">
          <div class="card-body">
            <h1><u>Edit Request</u></h1>

            <div class="mt-2"><u>Note:</u> No field is mandatory to fill out; only fill out the fields you want to update.</div>

            <form @submit.prevent="handleSubmit" id="edit_request">
              <h4 class="mt-2">Payment*</h4>
              <input type="number" v-model="formData.payment" placeholder="Edit Payment Amount" class="form-control">
              
              <h4 class="mt-2">Proposed Deadline*</h4>
              <input type="date" v-model="formData.deadline" class="form-control">
              
              <h4 class="mt-2">Additional Info</h4>
              <input type="text" v-model="formData.additional_info" placeholder="Edit Additional Info" class="form-control">
              
              <button type="submit" class="btn btn-outline-success mt-3">Edit Request</button>
            </form>
            
            <br>
            <button @click="goBack" class="btn btn-outline-dark mt-2">Go Back</button>
          </div>
        </div>
      </div>
 </div>`,

data(){
    return{
        request: {},
        formData:{
            payment:'',
            deadline:'',
            additional_info:''
        }
    }
},
methods:{
    goBack(){
        this.$router.go(-1);
    },
    async handleSubmit(){
        const sendData = new FormData();
        if (this.formData.payment) sendData.append('payment', this.formData.payment);
        if (this.formData.deadline) sendData.append('deadline', this.formData.deadline);
        if (this.formData.additional_info) sendData.append('info', this.formData.additional_info);
        
        const res1 = await fetch(`/api/ad_request/function/${this.adrequest_id}`,{
            headers:{
                'Authentication-Token' : this.$store.state.authen_token
            },
            method : 'PUT',
            body : sendData
        })
        if (res1.ok){
            alert('Request Edited Successfully!');
            this.goBack();
        } else{
            alert('Could Not Edit Request.')
        }
    }
},
async mounted(){
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
components : {
    Navbar
}
}

export default EditRequest;