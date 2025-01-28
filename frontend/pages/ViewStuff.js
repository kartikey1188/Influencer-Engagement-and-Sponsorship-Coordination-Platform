import Navbar from "../components/Navbar.js"
import ViewInfluencer from "../components/ViewInfluencer.js"
import ViewSponsor from "../components/ViewSponsor.js"



const ViewStuff = {
    props : ['id'],
    template : `
    <div>
    <Navbar></Navbar>
        <div v-if="nature=='sponsor'">
            <ViewSponsor :sponsor="person"></ViewSponsor>
        </div>

        <div v-if="nature=='influencer'">
            <ViewInfluencer :influencer="person"></ViewInfluencer>
        </div>
    </div>
    `,
    data (){
        return {
            person : {},
            nature : ''
        }
    },
    async mounted(){

        const res1 = await fetch(`/api/stuff/view/${this.id}`,{
            headers : {
                'Authentication-Token' : this.$store.state.authen_token
            }
        })
        if (res1.ok){
            const which = await res1.json();
            this.nature = which.nature
        }
        if (this.nature=='sponsor'){
            const res2 = await fetch(`/api/sponsor/${this.id}`, {
                headers : {
                    'Authentication-Token' : this.$store.state.authen_token
                }
            })
            if (res2.ok){
                this.person = await res2.json();
            }
        }
        if (this.nature=='influencer'){
            const res2 = await fetch(`/api/influencer/${this.id}`, {
                headers : {
                    'Authentication-Token' : this.$store.state.authen_token
                }
            })
            if (res2.ok){
                this.person = await res2.json();
            }
        }
    },
    components:{
        Navbar,
        ViewInfluencer,
        ViewSponsor
    }
    
}

export default ViewStuff;