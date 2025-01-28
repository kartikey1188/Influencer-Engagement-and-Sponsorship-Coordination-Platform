import Navbar from "../components/Navbar.js"

const InfluencerDashboard = {

    template: `
    <div>
        <Navbar></Navbar>
        <div class="container mt-3">
        <div class= "card">
        <div class = "card-body">
            <h1 class = "text-center"> ADMINISTRATOR </h1>
                    <div class="d-flex justify-content-center">
                    <img src="https://img.freepik.com/premium-vector/authority-icon-government-senator-universal-interface-element-sign-symbol-vector_883533-486.jpg" style="max-width: 200px; height: auto;" class="align-center">
                    </div>
                <div class="d-flex justify-content-center align-items-center mt-5">
                    <router-link to="/admin/sponsors" class="btn btn-outline-success">Sponsors </router-link>
                    <router-link to="/admin/influencers" class="btn btn-outline-success ms-5">Influencers </router-link>
                    <router-link to="/admin/campaigns" class="btn btn-outline-success ms-5">Campaigns </router-link>
                    <router-link to="/admin/requests" class="btn btn-outline-success ms-5">Ad Requests </router-link>
                </div>
        </div>
        </div>
        </div>
    </div>
    `,
    components : {
        Navbar
    }
  
    
  }  
  
  export default InfluencerDashboard;