import Navbar from "../components/Navbar.js";
const ViewSponsor = {
  props: ['sponsor'],
  template: `<div>
  <div class="container mt-4 mb-4">
  <div class="card">
  <div class="card-body">
  <div class="d-flex flex-column align-items-center justify-content-between">

    <h1 class="mb-4"><u>Sponsor</u>: {{ sponsor.username }}</h1>

    <img v-bind:src="imageUrl || getImageUrl()" alt="Profile Picture" style="max-width: 250px; height: auto;" class="shadow p-1 rounded bg-success mb-2">

    <p class="mb-4"><h3 class="text-primary"><u>Profile Details:</u></h3></p>

    <div class="d-flex flex-column align-items-center justify-content-between">

      <div>
        <p><u><b>Username:</b></u> {{ sponsor.username }}</p>
        <p v-if="sponsor.user"><u><b>Email:</b></u> {{ sponsor.user.email }}</p>
        <p><u><b>Industry:</b></u> {{ sponsor.industry }}</p>
        <p><u><b>Total Expenditure:</b></u> {{ sponsor.expenditure }}</p>
      </div>

      <div class="ms-5">
        <div v-if="sponsor.flag == 'Yes'">
          <h5 class="text-danger mt-3">This sponsor has been flagged for inappropriate behavior and its activity has been restricted.</h5>
        </div>
      </div>
    </div>

        <div v-if = "type=='admin'">
            <div v-if="sponsor.flag=='No'">
               <button @click="flagSponsor" class="btn btn-outline-danger">Flag Sponsor</button>
            </div>
            <div v-if="sponsor.flag=='Yes'">
                  <div class="card mb-3"><div class="card-body"><div class = "d-flex flex-column align-items-center">
                      <u><b>{{sponsor.username}}'s Appeal against the Flag:</b></u> {{ sponsor.appeal }}
                  </div></div></div>
               <div class="ms-1"><button @click="unflagSponsor" class="btn btn-outline-success ms-5">Un-Flag Sponsor</button></div>
            </div>
            <div v-if="sponsor.flag=='Pending'" class="mt-3">
              <button @click="approveRegistration" class="btn btn-outline-success">Approve Registration</button>
              <button @click="rejectRegistration" class="btn btn-outline-danger ms-3">Reject Registration</button>
            </div>
        </div>
        

        <div>
            <button @click="goBack" class="btn btn-outline-dark mt-3">Go Back</button>
        </div>
    


  </div></div></div></div>
  </div>
  `,

  data() {
    return {
      imageUrl: '',
      type: ''
    };
  },

  methods: {
    goBack() {
      this.$router.go(-1);
    },
    async getImageUrl() {
      const filename = this.sponsor.user.image;
      if (filename) {
        const res = await fetch(`/serve_image/${filename}`);
        if (res.ok) {
          this.imageUrl = res.url;
        }
      } else {
        this.imageUrl = 'https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg';
      }
    },
    async flagSponsor(){
      const res = await fetch(`/api/flag/sponsor/${this.sponsor.id}`,{
          method : 'PUT',
          headers : {
              'Authentication-Token' : this.$store.state.authen_token
          }
      })
      if (res.ok){
          alert('Sponsor Flagged Successfully.')
          this.sponsor.flag = 'Yes';
      } else { 
          alert('Could Not Flag Sponsor.')
      }
  },
  async unflagSponsor(){
      const res = await fetch(`/api/unflag/sponsor/${this.sponsor.id}`,{
          method : 'PUT',
          headers : {
              'Authentication-Token' : this.$store.state.authen_token
          }
      })
      if (res.ok){
          alert('Sponsor Un-Flagged Successfully.')
          this.sponsor.flag = 'No';
      } else { 
          alert('Could Not Un-Flag Sponsor.')
      }
  },
  async approveRegistration(){
    const res = await fetch(`/api/approve_sponsor_registration/${this.sponsor.id}`,{
      method : 'PUT',
      headers : {
        'Authentication-Token' : this.$store.state.authen_token
      }
    }) 
    if (res.ok){
      alert('Sponsor Registration Approved Successfully');
      this.sponsor.flag = 'No';
    } else {
      alert('Could Not Approve Sponsor Registration')
    }
  },
  async rejectRegistration(){
    const res = await fetch(`/api/reject_sponsor_registration/${this.sponsor.id}`,{
      method : 'PUT',
      headers : {
        'Authentication-Token' : this.$store.state.authen_token
      }
    }) 
    if (res.ok){
      alert('Sponsor Registration Rejected Successfully');
      this.goBack();
    } else {
      alert('Could Not Reject Sponsor Registration')
    }
  }
  },

  mounted() {
    this.type = this.$store.state.role;
  },

  components: {
    Navbar,
  }
};

export default ViewSponsor;
