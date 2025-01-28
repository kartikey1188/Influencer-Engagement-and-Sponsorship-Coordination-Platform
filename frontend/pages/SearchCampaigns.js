import Navbar from "../components/Navbar.js";
import CampaignCard from "../components/CampaignCard.js";

const SearchCampaigns = {
  template: `
    <div>
      <Navbar></Navbar>
      <div class="container mt-4 mb-4">
        <div class="card mb-4">
          <div class="card-body">
            <form @submit.prevent="handleSubmit" id="search_campaigns">
              <h1><u>Search Public Campaigns</u></h1>
              
              <h4>Search by Name</h4>
              <input type="text" v-model="filters.name" placeholder="Type Campaign Name" class="form-control mb-3">

              <h4>Minimum Payment</h4>
              <input type="number" v-model="filters.minimum_payment" placeholder="Enter Minimum Payment" class="form-control mb-3">

              <h4>End Date Beyond:</h4>
              <input type="date" v-model="filters.end_date" class="form-control mb-3">

              <h4>Select Niche</h4>
              <div class="d-flex">
                <select v-model="filters.niche" class="form-control mb-3" style="width: 500px;" ref="abc">
                  <option value="" disabled>Select</option>
                  <option v-for="niche in niches" :key="niche" :value="niche">{{ niche }}</option>
                </select>
                <div>
                  <button class="btn btn-outline-secondary ms-2" type="button" @click="clearSelect">C</button>
                </div>
              </div>
              
              <button type="submit" class="btn btn-outline-primary">Search</button>
            </form>
          </div>
        </div>

        <div class="card mt-2"><div class="card-body">
            <div v-if="results.length > 0" class="mt-2">
                <h2><u>Search Results:</u></h2>
                <CampaignCard v-for="campaign in results" :key="campaign.campaign_id" :campaign="campaign"></CampaignCard>
            </div>
            <div v-else-if="searchExecuted" class="mt-4">
                <h2><u>Search Results:</u></h2>
                <p>No public campaigns found matching the criteria.</p>
            </div>
            <div v-else class="mt-4">
                <p>Use the above fields to search for public campaigns!</p>
            </div>
        </div></div>
        <button @click="goBack" class="btn btn-outline-dark mt-4"> Go Back </button> 
      </div>
    </div>
  `,
  data() {
    return {
      filters: {
        name: '',
        minimum_payment: '',
        end_date: '',
        niche: '',
      },
      niches: [
        'Music', 'Sports', 'Motivation', 'Comedy', 'Fashion', 'Business',
        'Academics', 'Fitness', 'Travel', 'Technology', 'Food', 'Health',
        'Finance', 'Beauty', 'Media',
      ],
      results: [],
      searchExecuted: false,
    };
  },
  methods: {
    goBack(){
      this.$router.go(-1);
    },
    clearSelect(){
      this.filters.niche = '';
      this.$refs.abc.value = ''; 
    },
    async handleSubmit() {
      const queryParams = new URLSearchParams(this.filters).toString(); // URLSearchParams is a JavaScript utility to easily create, parse, and manipulate query strings in URLs. (for GET requests, you can't send 'body' like in POST requests)
      const res = await fetch(`/api/search/campaigns?${queryParams}`,{
        method : 'GET',
        headers : {
          'Authentication-Token' : this.$store.state.authen_token
        }
      })

      if (res.ok) {
        this.results = await res.json();
        this.searchExecuted = true;
      } else {
        alert('Failed to fetch campaigns.');
      }
    },
  },
  components: {
    Navbar,
    CampaignCard
  },
};

export default SearchCampaigns;
