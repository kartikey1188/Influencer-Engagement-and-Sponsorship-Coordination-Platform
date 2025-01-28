export default {
    props : ['bargain'],
    template : `<div>
    <div class="card mt-4">
        <div class="card-body">

            <div class="mb-3 mt-4">
                <b> Negotiated Payment :</b> {{ bargain.payment }} 
            </div>

            <div class="mb-3 mt-4">
                <b> Negotiated Deadline :</b> {{ bargain.deadline }} 
            </div>

            <div class="mb-3 mt-4">
                <b> Additional Info :</b> {{ bargain.additional_info }} 
            </div>
        </div>
    </div>
    </div>
    `
}