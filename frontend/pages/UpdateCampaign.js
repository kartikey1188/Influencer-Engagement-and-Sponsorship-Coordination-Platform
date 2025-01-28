import Navbar from "../components/Navbar.js";

const UpdateCampaign = {
  props : ['campaign_id'],
  template: `<div>
    <Navbar></Navbar>
    <div class="container mt-4 mb-4">
      <div class="card mb-4">
        <div class="card-body">
          <form @submit.prevent="handleSubmit" id="campaign_update">
            <h1><u>Update Campaign</u></h1>
            <div><u>Note:</u> No field is mandatory to fill out; only fill out the fields you want to update.</div>

            <h4 class="mt-2">Campaign Name</h4>
            <input type="text" v-model="formData.campaign_name" placeholder="Type Campaign Name" class="form-control">

            <h4 class="mt-2">Description</h4>
            <textarea v-model="formData.description" placeholder="Type Campaign Description" class="form-control"></textarea>

            <h4 class="mt-2">Start Date</h4>
            <input type="date" v-model="formData.start_date" class="form-control">

            <h4 class="mt-2">End Date</h4>
            <input type="date" v-model="formData.end_date" class="form-control">

            <h4 class="mt-2">Visibility</h4>
            <div>
              <input type="radio" id="public" value="Public" v-model="formData.visibility">
              <label for="public">Public</label>
            </div>
            <div>
              <input type="radio" id="private" value="Private" v-model="formData.visibility">
              <label for="private">Private</label>
            </div>

            <h4 class="mt-2">Goal</h4>
            <input type="text" v-model="formData.goal" placeholder="Type Goal" class="form-control">

            <h4 class="mt-2">Select Niche</h4>
            <select v-model="formData.niche" class="form-control">
              <option value="" disabled>Select</option>
              <option v-for="niche in niches" :key="niche" :value="niche">{{ niche }}</option>
            </select>

            <h4 class="mt-2">Status</h4>
            <input type="text" v-model="formData.status" placeholder="Type Status" class="form-control">

            <h4 class="mt-2">Image (Allowed Types = ['.jpg', '.jpeg', '.png'])</h4>
            <div class="d-flex">
              <input type="file" ref="imageInput" @change="handleFileUpload" class="form-control" style="width: 500px;">
              <button class="btn btn-outline-secondary ms-2" type="button" @click="clearImage">C</button>
            </div>

            <h4 class="mt-2">Minimum Payment</h4>
            <input type="number" v-model="formData.minimum_payment" placeholder="Type Minimum Payment" class="form-control">

            <button type="submit" class="btn btn-outline-success mb-3 mt-3">Update Campaign</button>
          </form>
          <button @click="goBack" class="btn btn-outline-dark">Go Back</button>
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
        status: '',
        image: null,
        minimum_payment: '',
      },
      niches: [
        'Music', 'Sports', 'Motivation', 'Comedy', 'Fashion', 'Business',
        'Academics', 'Fitness', 'Travel', 'Technology', 'Food', 'Health',
        'Finance', 'Beauty', 'Media',
      ],
    };
  },

  methods: {
    goBack(){
      this.$router.go(-1);
    },
    clearImage() {
      this.formData.image = null;
      this.$refs.imageInput.value = '';
    },
    handleFileUpload(event) {
      this.formData.image = event.target.files[0];
    },
    async handleSubmit() {
      const sendData = new FormData();
      if (this.formData.campaign_name) sendData.append("campaign_name", this.formData.campaign_name);
      if (this.formData.description) sendData.append("description", this.formData.description);
      if (this.formData.start_date) sendData.append("start_date", this.formData.start_date);
      if (this.formData.end_date) sendData.append("end_date", this.formData.end_date);
      if (this.formData.visibility) sendData.append("visibility", this.formData.visibility);
      if (this.formData.goal) sendData.append("goal", this.formData.goal);
      if (this.formData.niche) sendData.append("niche", this.formData.niche);
      if (this.formData.status) sendData.append("status", this.formData.status);
      if (this.formData.image) sendData.append("image", this.formData.image);
      if (this.formData.minimum_payment) sendData.append("minimum_payment", this.formData.minimum_payment);

      const campaign_id = this.campaign_id;
      const sponsor_id = this.$store.state.userID;
      const res = await fetch(`${location.origin}/api/campaign/${campaign_id}/${sponsor_id}`, {
        method: "PUT",
        body: sendData,
        headers: {
          'Authentication-Token': this.$store.state.authen_token,
        },
      });

      if (res.ok) {
        alert("Campaign updated successfully!");
        this.$router.push(`/campaign/view/${campaign_id}`);
      } else if (res.status == 919) {
        alert("Invalid File Type; Allowed Types = ['.jpg', '.jpeg', '.png']");
        this.clearImage();
      } else if (res.status == 920) {
        alert("A campaign with this name already exists.");
        this.formData.campaign_name = '';
      } else {
        alert("Update failed.");
      }
    },
  },
     components : {
      Navbar
     }

 
};

export default UpdateCampaign;
