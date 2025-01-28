import Navbar from "../components/Navbar.js"

const CreateCampaign = {
    template: `<div>
      <Navbar></Navbar>
      <div class="container mt-4 mb-4">
        <div class="card mb-4">
          <div class="card-body">
            <form @submit.prevent="handleSubmit" id="create_campaign">
              <h1><u>Create Campaign</u></h1>
              <div>(* : Required)</div>
              
              <h4 class="mt-2">Campaign Name*</h4>
              <input type="text" v-model="formData.campaign_name" placeholder="Type Campaign Name" class="form-control" required>
              
              <h4 class="mt-2">Description</h4>
              <textarea v-model="formData.description" placeholder="Type Description" class="form-control"></textarea>
              
              <h4 class="mt-2">Start Date*</h4>
              <input type="date" v-model="formData.start_date" class="form-control" required>
              
              <h4 class="mt-2">End Date*</h4>
              <input type="date" v-model="formData.end_date" class="form-control" required>
              
              <h4 class="mt-2">Visibility*</h4>
              <div>
                <input type="radio" id="public" value="Public" v-model="formData.visibility" required>
                <label for="public">Public</label>
              </div>
              <div>
                <input type="radio" id="private" value="Private" v-model="formData.visibility" required>
                <label for="private">Private</label>
              </div>
              
              <h4 class="mt-2">Goal*</h4>
              <input type="text" v-model="formData.goal" placeholder="Type Goal" class="form-control" required>
              
              <h4 class="mt-2">Select Niche*</h4>
              <select v-model="formData.niche" class="form-control" required>
                <option value="" disabled>Select</option>
                <option v-for="niche in niches" :key="niche" :value="niche">{{ niche }}</option>
              </select>
              
              <h4 class="mt-2">Image (Allowed Types = ['.jpg', '.jpeg', '.png'])</h4>
              <div class="d-flex">
              <input type="file" ref='abc' @change="handleFileUpload" class="form-control" style="width: 500px;">
              <button class="btn btn-outline-secondary ms-2" type="button" @click="clearImage">C</button>
              </div>

              <h4 class="mt-2">Minimum Payment*</h4>
              <input type="number" v-model="formData.minimum_payment" placeholder="Type Minimum Payment" class="form-control" required>
              
              <button type="submit" class="btn btn-outline-success mb-3 mt-3">Create Campaign</button>
            </form>
            <button @click="goBack" class="btn btn-outline-primary mt-2">Go Back</button>
          </div>
        </div>
      </div>
      </div>
    `,
  
    data() {
      return {
        formData: {
          campaign_name: '',
          description: '',
          start_date: '',
          end_date: '',
          visibility: '',
          goal: '',
          niche: '',
          image: null,
          minimum_payment: '',
        },
        niches: [
          'Music', 'Sports', 'Motivation', 'Comedy', 'Fashion', 'Business', 'Academics',
          'Fitness', 'Travel', 'Technology', 'Food', 'Health', 'Finance', 'Beauty', 'Media'
        ],
      };
    },
  
    methods: {
      goBack(){
        this.$router.go(-1)
      },
      clearImage(){
        this.formData.image = null;
        this.$refs.abc.value = ''; 
      },
      handleFileUpload(event) {
        this.formData.image = event.target.files[0];
      },
      async handleSubmit() {
        const sendData = new FormData();
        sendData.append("campaign_name", this.formData.campaign_name);
        sendData.append("description", this.formData.description);
        sendData.append("start_date", this.formData.start_date);
        sendData.append("end_date", this.formData.end_date);
        sendData.append("visibility", this.formData.visibility);
        sendData.append("goal", this.formData.goal);
        sendData.append("niche", this.formData.niche);
        sendData.append("minimum_payment", this.formData.minimum_payment);
        if (this.formData.image) {
          sendData.append("image", this.formData.image);
        }
        
        const sponsor_id = this.$store.state.userID
        const res = await fetch(`/api/campaign/create/${sponsor_id}`, {
          method: "POST",
          body: sendData,
          headers : {
            'Authentication-Token': this.$store.state.authen_token
          }
        });
  
        if (res.ok) {
          alert("Campaign created successfully!");
          this.$router.push('/sponsor/campaigns');
        } else if (res.status==919){
          alert("Invalid File Type; Allowed Types = ['.jpg', '.jpeg', '.png']")

        } else if (res.status==920){
          alert("A campaign with this name already exists.")
        }
        
        else {
          alert("Failed to create the campaign.");
        }
      },
    },
    components : {
      Navbar
    }
  };
  
  export default CreateCampaign;
  