const SponsorRegistration = {
  template: `
    <div class="container mt-4 mb-4">
      <div class="card mb-4">
        <div class="card-body">
          <form @submit.prevent="handleSubmit" id="sponsor_registration">
            <h1 class="text-center"><u>Sponsor Registration</u></h1>
            <div>(* : Required)</div>
            <h4>Username*</h4>
            <input type="text" v-model="formData.username" placeholder="Type Username" class="form-control" required>
            <div class="mb-2 mt-2"><h4>Email*</h4>
            <input type="email" v-model="formData.email" placeholder="Type Email" class="form-control" required></div>
            
            <h4 class="mt-2">Password*</h4>
            <input type="password" v-model="formData.password" placeholder="Type Password" class="form-control" required>
            
            
            <h4 class="mt-2">Profile Picture (Allowed Types = ['.jpg', '.jpeg', '.png'])</h4>
            <div class="d-flex">
            <input type="file" ref='abc' @change="handleFileUpload" class="form-control" style="width: 500px;">
            <button class="btn btn-outline-secondary ms-2" type="button" @click="clearImage">C</button>
            </div>
            
            <div class="card mt-3">
              <div class="card-body">
                <h4 class="mt-2">Industry*</h4>
                <div class="card-title">What industry are you in?</div>
                <select id="industry" v-model="formData.industry" class="form-control" required>
                  <option value="" disabled>Select</option>
                  <option v-for="industry in industries" :key="industry" :value="industry">{{ industry }}</option>
                </select>
              </div>
            </div>
            
            <button type="submit" class="btn btn-outline-success mb-3 mt-3">Register</button>
          </form>
            <router-link to="/" class="btn btn-outline-primary mt-2">Go Back</router-link>
        </div>
      </div>
    </div>
  `,
  
  data() {
    return {
      formData: {
        username: '',
        password: '',
        email: '',
        industry: '',
        image: null
      },
      industries: [
        'Clothing', 'Sports', 'Entertainment', 'Manufacturing', 'Education',
        'Pharmaceutical', 'Fashion', 'Food', 'Space', 'Technology', 'Finance', 'Healthcare'
      ],
    };
  },
  
  methods: {
    clearImage(){
      this.formData.image = null;
      this.$refs.abc.value = ''; // A ref in Vue.js is a way to directly reference and manipulate a DOM element or child component instance programmatically through the $refs object.
    },
    handleFileUpload(event) {
      this.formData.image = event.target.files[0];
    },
    async handleSubmit() {
      const formData = new FormData();
      formData.append("username", this.formData.username);
      formData.append("password", this.formData.password);
      formData.append("email", this.formData.email);
      formData.append("industry", this.formData.industry);
      if (this.formData.image) {
        formData.append("image", this.formData.image);
      }

      const res = await fetch(`${location.origin}/api/sponsor/registration`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("Registration successful! You can log in now.");
        this.$router.push('/');
      } else if (res.status==919){
        alert("Invalid File Type; Allowed Types = ['.jpg', '.jpeg', '.png']");
        this.clearImage();
      } else if (res.status==400){
        alert("A user with this email already exists.");
        this.formData.email='';
      } else if(res.status==920){
        alert("A sponsor with this username already exists.");
        this.formData.username='';
      } else {
        alert("Registration failed.");
      }
    },
  },
};

export default SponsorRegistration;
