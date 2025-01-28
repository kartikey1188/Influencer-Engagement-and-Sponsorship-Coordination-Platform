import Navbar from "../components/Navbar.js";
const UpdateSponsor = {
    template: `
    <div>
    <Navbar></Navbar>
      <div class="container mt-4 mb-4">
        <div class="card mb-4">
          <div class="card-body">
            <form @submit.prevent="handleSubmit" id="sponsor_update">
              <h1><u>Sponsor Profile Update</u></h1>
              <div><u>Note:</u> No field is mandatory to fill out; only fill out the fields you want to update.</div>
              
              <h4 class="mt-2">Username</h4>
              <input type="text" v-model="formData.username" placeholder="Type Username" class="form-control">
              <div class="mb-2 mt-2"><h4>Email</h4>
              <input type="email" v-model="formData.email" placeholder="Type Email" class="form-control"></div>
              <h4 class="mt-2">Password</h4>
              <input type="password" v-model="formData.password" placeholder="Type Password" class="form-control">
              
              <h4 class="mt-2">Profile Picture (Allowed Types = ['.jpg', '.jpeg', '.png'])</h4>
              <div class="d-flex">
              <input type="file" ref='abc' @change="handleFileUpload" class="form-control" style="width: 500px;">
              <button class="btn btn-outline-secondary ms-2" type="button" @click="clearImage">C</button>
              </div>
              
              <div class="card mt-3">
                <div class="card-body">
                  <h4>Industry</h4>
                  <label for="industry" class="form-label">Select Industry</label>
                  <select id="industry" v-model="formData.industry" class="form-control" @change="checkOtherIndustry">
                    <option value="" disabled>Select</option>
                    <option v-for="industry in industries" :key="industry" :value="industry">{{ industry }}</option>
                    <option value="other">None of the above</option>
                  </select>
                  
                 
                </div>
              </div>
              
              <button type="submit" class="btn btn-outline-success mb-3 mt-3">Update</button>
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
          username: '',
          password: '',
          industry: '',
          email: '',
          image: null,
        },
        industries: [
          'Clothing', 'Sports', 'Entertainment', 'Manufacturing', 'Education',
          'Pharmaceutical', 'Fashion', 'Food', 'Space', 'Technology', 'Finance', 'Healthcare'
        ],
        showOtherIndustry: false,
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
        const formData = new FormData();
        if (this.formData.username) formData.append("username", this.formData.username);
        if (this.formData.password) formData.append("password", this.formData.password);
        if (this.formData.email) formData.append("email", this.formData.email);
        if (this.formData.industry) formData.append("industry", this.formData.industry);
        if (this.formData.image) formData.append("image", this.formData.image);
  
        const sponsor_id  = this.$store.state.userID;
        const res = await fetch(`${location.origin}/api/sponsor/${sponsor_id}`, {
          method: "PUT",
          body: formData,
          headers : {
            'Authentication-Token' : this.$store.state.authen_token
          }
        });
  
        if (res.ok) {
          alert("Profile updated successfully!");
          this.$router.push('/dashboard/sponsor'); 
        } else if (res.status==919){
          alert("Invalid File Type; Allowed Types = ['.jpg', '.jpeg', '.png']");
          this.clearImage();
        } else if (res.status==921){
          alert("A user with this email already exists.");
          this.formData.email='';
        } else if(res.status==920){
          alert("A sponsor with this username already exists.");
          this.formData.username='';
        } else {
          alert("Update failed.");
        }
      },
    },
    components : {
      Navbar
    }
  };
  
  export default UpdateSponsor;
  