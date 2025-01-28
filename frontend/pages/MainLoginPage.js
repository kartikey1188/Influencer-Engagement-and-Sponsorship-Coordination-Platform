const LoginPage = {
    template:`
<div class="container mt-4 mb-4">
  <div class="card">
    <div class="card-body">

      <form @submit.prevent="handleSubmit" id="login"> 
        <!-- @submit.prevent prevents the form's default page reload and lets Vue handle the submission logic. -->
        <div class="text-center mb-4">
          <h1><u>Login</u></h1>
          <h4>Unified Login Page for Influencers, Sponsors and the Admin</h4>
        </div>

        <div class="d-flex justify-content-between align-items-center">
          <div>
            <p>(* : Required)</p>

            <div class="mb-2">
              <h2>Email*</h2>
              <input type="email" v-model="email" placeholder="Type Email" class="form-control" style="width: 500px;" required>
            </div>

            <h2>Password*</h2>
            <input type="password" v-model="password" placeholder="Type Password" class="form-control" style="width: 500px;" required>

            <div class="mt-3">
              <button type="submit" class="btn btn-outline-success mb-3">Login</button>
            </div>
          </div>

          <div class="me-5">
            <div class="me-5">
              <img src="https://cdn-icons-png.flaticon.com/512/5044/5044729.png" style="max-width: 200px; height: auto;" class="align-center">
            </div>
          </div>
        </div>
      </form>

      <div class="card mt-1">
        <div class="card-body">
          <h5 class="card-title">
            In case you haven't registered as either a Sponsor or an Influencer, you may do so by clicking the appropriate link:
          </h5>

          <div class="d-flex justify-content-center">
            <span>
              <router-link to="/registration/sponsor" class="btn btn-outline-primary mt-2">Sponsor Registration</router-link>
            </span>
            <span>
              <router-link to="/registration/influencer" class="btn btn-outline-primary mt-2 ms-2">Influencer Registration</router-link>
            </span>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>
    `,
    
    data() {
      return {
        email: '',
        password: '',
      };
    },
  
    methods: {
      async handleSubmit() {

        const formData = {
          email: this.email,
          password: this.password,
        };

        const res = await fetch (location.origin + '/api/login',{
          method : 'POST',
          headers : {'Content-Type'  : 'application/json'},
          body : JSON.stringify(formData)
          });

        if (res.ok){
          console.log("Login Successful!!!!");
          console.log("done1");

          const data = await res.json();

          localStorage.setItem('user', JSON.stringify(data));
          console.log("done2");

          this.$store.commit('setUser');

          if (data.role == 'sponsor'){
          this.$router.push('/dashboard/sponsor/');
          }
          if (data.role == 'influencer'){
            this.$router.push('/dashboard/influencer');
          }
          console.log("done3");

          if (data.role == 'admin'){
            this.$router.push('/dashboard/admin');
          }
      }
      else {
        alert("Either your email is not registered, or it is but you are entering the wrong password.")
        this.email='';
        this.password='';
      }
      }
    }
  };
  
  export default LoginPage;
  