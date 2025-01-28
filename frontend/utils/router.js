import MainLoginPage from "../pages/MainLoginPage.js";
import SponsorRegistration from "../pages/SponsorRegistration.js";
import InfluencerRegistration from "../pages/InfluencerRegistration.js";
import SponsorDashboard from "../pages/SponsorDashboard.js";
import InfluencerDashboard from "../pages/InfluencerDashboard.js";
import AdminDashboard from "../pages/AdminDashboard.js";
import UpdateSponsor from "../pages/UpdateSponsor.js";
import UpdateInfluencer from "../pages/UpdateInfluencer.js";
import CreateCampaign from "../pages/CreateCampaign.js";
import ViewCampaign from "../pages/ViewCampaign.js"
import UpdateCampaign from "../pages/UpdateCampaign.js";
import ViewStuff from "../pages/ViewStuff.js";
import SponsorCampaigns from "../pages/SponsorCampaigns.js";
import AdRequests from "../pages/AdRequests.js";
import SearchInfluencers from "../pages/SearchInfluencers.js";
import RequestCampaign from "../pages/RequestCampaign.js";
import SearchCampaigns from "../pages/SearchCampaigns.js";
import RequestInfluencer from "../pages/RequestInfluencer.js";
import EditRequest from "../pages/EditRequest.js";
import Contracts from "../pages/Contracts.js";
import AdminSponsors from "../pages/AdminSponsors.js";
import AdminInfluencers from "../pages/AdminInfluencers.js";
import AdminCampaigns from "../pages/AdminCampaigns.js";
import AdminRequests from "../pages/AdminRequests.js";
import ViewRequest from "../pages/ViewRequest.js";
import AdminStatistics from "../pages/AdminStatistics.js";

import store from './store.js'

const routes = [
    {path : '/', component : MainLoginPage},
    {path : '/admin/statistics', component : AdminStatistics, meta : {requiresLogin : true, role : "admin"}},
    {path : '/request/view/:adrequest_id', component : ViewRequest, props : true},
    {path : '/admin/sponsors', component : AdminSponsors, meta : {requiresLogin : true, role : "admin"}},
    {path : '/admin/influencers', component : AdminInfluencers, meta : {requiresLogin : true, role : "admin"}},
    {path : '/admin/campaigns', component : AdminCampaigns, meta : {requiresLogin : true, role : "admin"}},
    {path : '/admin/requests', component : AdminRequests, meta : {requiresLogin : true, role : "admin"}},
    {path : '/registration/sponsor', component : SponsorRegistration},
    {path : '/contracts/:id', component : Contracts, props:true},
    {path : '/edit_request/:adrequest_id', component : EditRequest, props: true},
    {path : '/request_campaign/:campaign_id', component : RequestCampaign, props: true, meta : {requiresLogin : true, role : "influencer"}},
    {path : '/request_influencer/:influencer_id', component : RequestInfluencer, props: true, meta : {requiresLogin : true, role : "sponsor"}},
    {path : '/search/influencers', component : SearchInfluencers, meta : {requiresLogin : true, role : "sponsor"}},
    {path : '/search/campaigns', component : SearchCampaigns, meta : {requiresLogin : true, role : "influencer"}},
    {path : '/ad_requests', component : AdRequests},
    {path : '/registration/influencer', component : InfluencerRegistration},
    {path : '/view/stuff/:id', component : ViewStuff, props : true},
    {path : '/campaign/view/:campaign_id', component: ViewCampaign, props : true},
    {path : '/dashboard/sponsor', component : SponsorDashboard, props: true, meta : {requiresLogin : true, role : "sponsor"}},
    {path : '/dashboard/influencer', component : InfluencerDashboard, props: true, meta : {requiresLogin : true, role : "influencer"}},
    {path : '/dashboard/admin', component : AdminDashboard, meta : {requiresLogin : true, role : "admin"}},
    {path : '/sponsor/update', component : UpdateSponsor, meta : {requiresLogin : true, role : "sponsor"}},
    {path : '/influencer/update', component : UpdateInfluencer, meta : {requiresLogin : true, role : "influencer"}},
    {path : '/campaign/create', component : CreateCampaign, meta : {requiresLogin : true, role : "sponsor"}},
    {path : '/campaign/update/:campaign_id', component : UpdateCampaign, props : true, meta : {requiresLogin : true, role : "sponsor"}},
    {path : '/sponsor/campaigns', component : SponsorCampaigns, meta : {requiresLogin : true, role : "sponsor"}},
]

const router = new VueRouter({
    routes
})

// navigation guards
router.beforeEach((to, from, next) => {
    if (to.matched.some((record) => record.meta.requiresLogin)){
        if (!store.state.logged_In_){
            next({path : '/'})
        } 
        else if (to.meta.role && to.meta.role != store.state.role){
            alert('Role not authorized.')
             next({path : '/'})
        } 
        else {
            next();
        }
    } 
    else {
        next();
    }
})

export default router;