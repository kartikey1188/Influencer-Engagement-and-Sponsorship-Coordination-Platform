import Bargain from "./Bargain.js";

export default {
    props: ["request"],
    template: `
    <div>
      <div v-if="request.initiator === type">
        <div v-if="request.status === 'Pending'">
            <div class="d-flex justify-content-center align-items-center mt-4">
                <router-link :to="'/edit_request/' + request.adrequest_id" class="btn btn-outline-warning mt-2">Edit Request</router-link>
                <button @click="deleteRequest" class="btn btn-outline-danger mt-2 ms-4">Delete Request</button>
                <div class="d-flex flex-column mt-2 ms-4">
                    <button @click="viewNegotiations" class="btn btn-outline-primary" :class="{active:hinge_view==1}">View Negotiation/Proposed Changed</button>
                    <div v-if="hinge_view==1" class="mt-2 mb-2">
                        <Bargain :bargain="bargain"></Bargain>
                    </div>
                </div>
            </div>
        </div>
        <div v-else-if="request.status === 'Accepted' || request.status === 'Rejected'">
            <button @click="deleteRequest" class="btn btn-outline-danger mt-2">Delete Request</button>
        </div>
      </div>
      <div v-else-if="request.initiator !== type">
        <div v-if="request.status === 'Pending'">
            <div class="d-flex  justify-content-center align-items-center mt-4">
                <button @click="acceptRequest" class="btn btn-outline-success mt-2 ms-5">Accept Request</button>
                <button @click="rejectRequest" class="btn btn-outline-danger mt-2 ms-5">Reject Request</button>
                <div class="d-flex flex-column ms-5">
                <button @click="startNegotiations" class="btn btn-outline-primary mt-2" :class="{active:hinge_make==1}">Negotiate/Propose Changes</button>

                        <div v-if="hinge_make==1" class="mt-2 mb-2">
                        <div class="card"><div class="card-body">
                        <form @submit.prevent="handleSubmitMake" id="make_negotiation">
                                <h4>Negotiate:</h4>
                                <div class="mb-3 mt-4">
                                    <label for="payment" class="form-label" >Negotiate New Payment</label>
                                    <input type="text" class="form-control" id="payment" name="payment"  v-model="negotiations.payment" ref="a" placeholder="Enter">
                                </div>
                                <div class="mb-3">
                                    <label for="deadline" class="form-label" >Negotiate New Deadline</label>
                                    <input type="date" class="form-control" id="deadline" name="deadline" v-model="negotiations.deadline" ref="b">
                                </div>
                                <div class="mb-3">
                                    <label for="additional_info" class="form-label">Additional Info</label>
                                    <input type="text" class="form-control" id="additional_info" name="additional_info" v-model="negotiations.additional_info" ref="c" placeholder = "Type">
                                </div>
                                <button type="submit" class="btn btn-outline-success">Send Negotation Terms</button>
                        </form>
                        </div></div>
                        </div>
                </div>
                <div class="d-flex flex-column ms-5">
                    <button @click="viewNegotiations" class="btn btn-outline-primary mt-2" :class="{active:hinge_view==1}">View Changes Proposed By You</button>
                        <div v-if="hinge_view==1" class="mt-2 mb-2">
                            <Bargain :bargain="bargain"></Bargain>
                        </div>
                </div>
            </div>
        </div>
        <div v-else-if="request.status === 'Accepted' || request.status === 'Rejected'">
            <button @click="deleteRequest" class="btn btn-outline-danger mt-2">Delete Request</button>
        </div>
      </div>
    </div>
    `,
    data() {
      return {
        type: '',
        hinge_view: -1,
        hinge_make: -1,
        negotiations:{
            payment: '',
            deadline: '',
            additional_info: ''
        },
        bargain: {}
      };
    },
    methods : {
        goBack(){
            this.$router.go(-1);
        },
        reload(){
            this.$router.go(0);
        },
        async deleteRequest(){
            const res = await fetch(`/api/ad_request/function/${this.request.adrequest_id}`,{
                method : 'DELETE',
                headers : {
                    'Authentication-Token' : this.$store.state.authen_token
                }
            })
            if (res.ok){
                alert('Request Successfully Deleted.');
                this.goBack();
            } else {
                alert('Could Not Delete Request.');
            }
        },
        async acceptRequest(){
            const res = await fetch(`/api/accept_request/${this.request.adrequest_id}`,{
                method : 'PUT',
                headers : {
                    'Authentication-Token' : this.$store.state.authen_token
                }
            })
            if (res.ok){
                alert('Request Accepted Successfully.');
                this.request.status='Accepted';
            } else {
                alert('Could Not Accept Request');
            }
        },
        async rejectRequest(){
            const sendData = new FormData();
            sendData.append('status', 'Rejected');
            const res = await fetch (`/api/reject_request/${this.request.adrequest_id}`,{
                method : 'PUT',
                headers:{
                    'Authentication-Token' : this.$store.state.authen_token
                }
            })
            if (res.ok){
                alert('Request Rejected Successfully.');
                this.request.status='Rejected';
            } else {
                alert('Could Not Reject Request');
            }

        }, 
        async viewNegotiations(){
            const res = await fetch (`/api/negotiation/${this.request.adrequest_id}`,{
                method : 'GET',
                headers : {
                    'Authentication-Token' : this.$store.state.authen_token
                }
                })
                if (res.ok){
                    this.bargain = await res.json();
                } else { 
                    alert('Could not get negotiations.')
                }
            this.hinge_view = -this.hinge_view;
        },
        async startNegotiations(){
            this.hinge_make = -this.hinge_make;
        },
        async handleSubmitMake(){
            const sendData = new FormData();
            if (this.negotiations.payment) sendData.append('payment', this.negotiations.payment);
            if (this.negotiations.deadline) sendData.append('deadline', this.negotiations.deadline);
            if (this.negotiations.additional_info) sendData.append('additional_info', this.negotiations.additional_info);

            const res = await fetch (`/api/negotiation/${this.request.adrequest_id}`,{
                method : 'PUT',
                headers : {
                    'Authentication-Token' : this.$store.state.authen_token
                },
                body : sendData
            })
            if (res.ok){
                alert('Negotiation Terms Sent Successfully');
                this.hinge_make=-1;
                this.hinge_view=-1;
                this.negotiations.payment = '';
                this.negotiations.deadline = '';
                this.negotiations.additional_info = '';
                this.$refs.a.value = '';
                this.$refs.b.value = '';
                this.$refs.c.value = '';
            } else{
                alert('Could not get negotiation terms.');
            }
        }
    },
    async mounted() {
      this.type = this.$store.state.role;
    },
    components:{
        Bargain
    }
  };
  