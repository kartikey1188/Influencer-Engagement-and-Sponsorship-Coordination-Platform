import Navbar from "../components/Navbar.js";
import InfluencerCard from "../components/InfluencerCard.js";

const SearchInfluencers = {
  template: `
    <div>
      <Navbar></Navbar>
      <div class="container mt-4 mb-4">
        <div class="card mb-4">
          <div class="card-body">
            <form @submit.prevent="handleSubmit" id="search_influencers">
              <h1><u>Search Influencers</u></h1>
              
              <h4>Search by Name</h4>
              <input type="text" v-model="filters.name" placeholder="Type Influencer Name" class="form-control mb-3">

              <h4>Combined Followers More Than:</h4>
              <input type="number" v-model="filters.combined_followers" placeholder="Type a number" class="form-control mb-3">

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
          <div v-if="results.length > 0" class="mt-3 mb-2">
            <h2><u>Search Results:</u></h2>
            <InfluencerCard v-for="influencer in results" :key="influencer.id" :influencer="influencer"></InfluencerCard>
          </div>
          <div v-else-if="searchExecuted" class="mt-4">
            <h2><u>Search Results:</u></h2>
            <p>No influencers found matching the criteria.</p>
          </div>
          <div v-else class="mt-3">
            <p>Use the above fields to search for influencers!</p>
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
        combined_followers: '',
        niche: '',
      },
      niches: [
        'Music', 'Sports', 'Motivation', 'Comedy', 'Fashion', 'Fitness', 'Travel',
        'Business', 'Academics', 'Technology', 'General Content Creation',
      ],
      results: [],
      searchExecuted: false,
    };
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    clearSelect(){
      this.filters.niche = '';
      this.$refs.abc.value = ''; 
    },
    async handleSubmit() {
      const queryParams = new URLSearchParams(this.filters).toString();
      const res = await fetch(`/api/search/influencers?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authentication-Token': this.$store.state.authen_token,
        },
      });

      if (res.ok) {
        this.results = await res.json();
        this.searchExecuted = true;
      } else {
        alert('Failed to fetch influencers.');
      }
    },
  },
  components: {
    Navbar,
    InfluencerCard,
  },
};

export default SearchInfluencers;
