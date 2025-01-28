from flask_restful import fields

marshal_user = {
    'password' : fields.String,
    'email' : fields.String,
    'image' : fields.String,
    'appeal' : fields.String,
    'active' : fields.Boolean
}


marshal_influencer = {
    'id': fields.Integer,
    'username': fields.String,
    'platforms': fields.String,  # platforms are stored as JSON strings
    'combined_followers': fields.Integer,
    'niche': fields.String,
    'earnings': fields.Integer,
    'flag': fields.String,
    'user' : fields.Nested(marshal_user),
    'appeal' : fields.String
}

marshal_sponsor = {
    'id': fields.Integer,
    'username': fields.String,
    'industry': fields.String,
    'expenditure': fields.Integer,
    'flag': fields.String,
    'user' : fields.Nested(marshal_user),
    'appeal' : fields.String
}



marshal_campaign = {
    'campaign_id': fields.Integer,
    'campaign_name': fields.String,
    'description': fields.String,
    'start_date': fields.String,  
    'end_date': fields.String,
    'visibility': fields.String,
    'goal': fields.String,
    'niche': fields.String,
    'status': fields.String,
    'image': fields.String,
    'minimum_payment': fields.Integer,
    'flag': fields.String,
    'parent' : fields.String, # parent sponsor username
    'appeal' : fields.String
}

marshal_ad_request = {
    'adrequest_id': fields.Integer,
    'associated_influencer': fields.String,
    'associated_sponsor': fields.String,
    'associated_campaign': fields.String,
    'info': fields.String,
    'payment': fields.Integer,
    'status': fields.String,
    'initiator': fields.String,
    'deadline': fields.String,  
}

marshal_negotiation = {
    'parent_request_id': fields.Integer,
    'payment': fields.Raw, # Earlier when it was set to fields.Integer, it was converting null to 0 for some reason. With fields.Raw, it doesn't convert null to 0. 
    'deadline': fields.String,  
    'additional_info': fields.String
}

marshal_contract = {
    'id': fields.Integer,
    'campaign': fields.String,  # Parent Campaign name
    'influencer': fields.String,  # Parent Influencer username
    'payment': fields.Integer,
    'status': fields.String,
    'deadline': fields.String,  # Formatting dates as strings
    'info': fields.String
}
