from datetime import datetime
import traceback
from flask_restful import Api, Resource, marshal_with, marshal
from flask import request
from backend.models import db, Sponsor, Influencer, Campaign, User, Contract, Negotiation, Ad_Request
from flask_security import auth_required, current_user, hash_password, verify_password
import os
import matplotlib.pyplot as plt
from werkzeug.utils import secure_filename
import uuid # UUID = Universally Unique Identifier
from flask import current_app as app
from backend.marshal import (
    marshal_sponsor, marshal_influencer, marshal_campaign, marshal_ad_request,
    marshal_negotiation, marshal_contract, marshal_user
)

cache = app.cache

api = Api(prefix='/api')
userdatastore = app.security.datastore


def allowed_file(filename):
    return os.path.splitext(filename)[1].lower() in app.config['ALLOWED_EXTENSIONS']  


class Login(Resource):
    
    def post(self):
        
        data = request.get_json()
        
        email = data.get('email') # could have done data['email'] too but data.get('email') does not give an error if email is not found - that's why it's better to use data.get('email') instead of data['email'] here.
        password = data.get('password')

        user = userdatastore.find_user(email = email)

        if not user:
            return {"message" : "invalid email"}, 400
        
        if verify_password(password, user.password):
            return {"email" : user.email, 'role' :user.roles[0].name, 'id' : user.id, 'token' : user.get_auth_token()}, 200
        
        return {"wtf" : "man"}, 400


class Sponsor_Resource(Resource):
    @auth_required('token')
    @cache.memoize(timeout = 5) # memoize is used for functions which take an input, cached is used for functions which don't take an input
    @marshal_with(marshal_sponsor)
    def get(self, id):
        sponsor = Sponsor.query.filter(Sponsor.id == id).first()
        if not sponsor:
            return {'Error' : 'User with this ID does not exist'}, 404 # 404 = Not Found
        else:
            return sponsor, 200 # 200 = OK
            

    def post(self):
        data = request.form
        email = data.get('email')
        password = data.get('password')
        username = data.get('username')
        industry = data.get('industry')
        expenditure = data.get('expenditure', 0)

        def add_sponsor(image_path):
            try:
                checkname = Sponsor.query.filter(Sponsor.username==username).first()
                if checkname:
                    return {'Error': 'A sponsor with this username already exists.'}, 920
                else:
                    user = userdatastore.create_user(
                        email=email,
                        password=hash_password(password),
                        roles=[userdatastore.find_role('sponsor')],
                        fs_uniquifier=str(uuid.uuid4()),
                        image=image_path,
                    )
                    app.logger.info('check3')
                    db.session.commit()
                    app.logger.info('check2')
                    
                    sponsor = Sponsor(
                        id=user.id,
                        user=user,
                        username=username,
                        industry=industry,
                        expenditure=int(expenditure)
                    )
                    db.session.add(sponsor)
                    db.session.commit()
                    cache.delete('/admin/statistics')
                    return {'Message': 'Sponsor has been registered successfully.'}, 200

            except Exception as e:
                db.session.rollback()
                print(f"Exception occurred: {e}")
                app.logger.error(traceback.format_exc())
                return {'Error': 'Sponsor could not be registered.'}, 500

        if not userdatastore.find_user(email=email):
            file = request.files.get('image')
            if file:
                if allowed_file(file.filename):
                    app.logger.info('check0')
                    r = username + 'sponsor'
                    filename = r + secure_filename(file.filename)
                    save_path = os.path.join(app.config['IMAGE_FOLDER'], filename)
                    os.makedirs(os.path.dirname(save_path), exist_ok=True)  # Make the directory if it doesn't exist
                    file.save(save_path)
                    app.logger.info('check1')
                    return add_sponsor(filename)
                else:
                    return {'Error': 'Invalid File Type; Allowed Types = [".jpg", ".jpeg", ".png"]'}, 919
            else:
                return add_sponsor(None)
        else:
            return {'Error': 'A Sponsor with this email already exists.'}, 400

    @auth_required('token')
    def put(self, id):
        sponsor = Sponsor.query.filter(Sponsor.id == id).first()
        if not sponsor:
            return {"Error": "Sponsor with this ID does not exist"}, 404

        data = request.form

        if "username" in data and data["username"]:
            sponsor_campaigns = Campaign.query.filter(Campaign.parent==sponsor.username).all()
            count = Sponsor.query.filter(Sponsor.username == data["username"]).count()
            if count != 0:
                return {"Error": "Sponsor with this username already exists"}, 920
            
            old_username = sponsor.username
            
            sponsor.username = data["username"]


            for campaign in sponsor_campaigns:
                campaign.parent = data['username']

            ad_requests = Ad_Request.query.filter(Ad_Request.associated_sponsor==old_username).all()
            for request_ in ad_requests:
                request_.associated_sponsor = data['username']


        if "email" in data and data["email"]:
                user = User.query.filter(User.email==data["email"]).first()
                if not user:
                    sponsor_id = sponsor.id
                    parent_user = User.query.filter(User.id==sponsor_id).first()
                    parent_user.email = data["email"]
                else:
                    return {"Error":"User with this email already exists."}, 921

        if "password" in data and data["password"]:
            user = sponsor.user
            user.password = hash_password(data["password"])

        
        if "industry" in data and data["industry"]:
            industry = data["industry"]
            if industry == "other":
                undisclosed = data.get("undisclosed", "Undisclosed")
                sponsor.industry = undisclosed
            else:
                sponsor.industry = industry

        file = request.files.get("image")
        if file:
            if allowed_file(file.filename):
                filename = sponsor.username + "_sponsor_" + secure_filename(file.filename)
                save_path = os.path.join(app.config["IMAGE_FOLDER"], filename)
                os.makedirs(os.path.dirname(save_path), exist_ok=True)
                file.save(save_path)
                sponsor.user.image = filename
            else:
                return {"Error": "Invalid File Type; Allowed Types = ['.jpg', '.jpeg', '.png']"}, 919

        try:
            db.session.commit()
            cache.delete_memoized(Sponsor_Resource.get, self, id)
            cache.delete('/admin/statistics')
            return {"Message": "Sponsor successfully updated"}, 200
        except:
            db.session.rollback()
            return {"Error": "Failed to update sponsor"}, 500


        

class Influencer_Resource(Resource):
    @auth_required('token')
    @cache.memoize(timeout = 5)
    @marshal_with(marshal_influencer)
    def get(self, id):
        influencer = Influencer.query.filter(Influencer.id == id).first()
        if not influencer:
            return {'Error': 'User with this ID does not exist'}, 404  
        else:
            return influencer, 200  # 200 = OK

    def post(self):
        data = request.form
        email = data.get('email')
        password = data.get('password')
        username = data.get('username')
        platforms = data.get('platforms')
        combined_followers = data.get('combined_followers')
        niche = data.get('niche')
        email = data.get('email')

        def add_influencer(image_path):
            try:
                checkname = Influencer.query.filter(Influencer.username==username).first()
                if checkname:
                    return {'Error': 'Influencer with this username already exists.'}, 920
                else:
                    user = userdatastore.create_user(
                        email=email,
                        password=hash_password(password),
                        roles=[userdatastore.find_role('influencer')],
                        fs_uniquifier=str(uuid.uuid4()),
                        image=image_path,
                    )
                    app.logger.info('check3')
                    db.session.commit()
                    app.logger.info('check2')

                
                    influencer = Influencer(
                        id = user,
                        user = user,
                        username=username,
                        platforms=platforms,
                        combined_followers=int(combined_followers),
                        niche=niche
                    )
                    db.session.add(influencer)
                    db.session.commit()
                    cache.delete('/admin/statistics')
                    return {'Message': 'Influencer has been registered successfully.'}, 200
   
            except Exception as e:
                    db.session.rollback()
                    print(f"Exception occurred: {e}")
                    app.logger.error(traceback.format_exc())
                    return {'Error': 'Influencer could not be registered.'}, 500

        if not userdatastore.find_user(email=email):
            file = request.files.get('image')
            if file:
                if allowed_file(file.filename):
                    app.logger.info('check0')
                    r = username + 'influencer'
                    filename = r + secure_filename(file.filename)
                    save_path = os.path.join(app.config['IMAGE_FOLDER'], filename)
                    os.makedirs(os.path.dirname(save_path), exist_ok=True) # making the directory if it doesn't exist (not making if it does)
                    file.save(save_path)
                    app.logger.info('check1')
                    return add_influencer(filename)
                else:
                    return {'Error': 'Invalid File Type; Allowed Types = [".jpg", ".jpeg", ".png"]'}, 919
            else:
                return add_influencer(None)
        else:
            return {'Error': 'An Influencer with this email already exists.'}, 400

    @auth_required('token')
    def put(self, id):
        influencer = Influencer.query.filter(Influencer.id == id).first()
        if not influencer:
            return {"Error": "Influencer with this ID does not exist"}, 404

        data = request.form

        if "username" in data and data["username"]:
            count = Influencer.query.filter(Influencer.username == data["username"]).count()
            if count != 0:
                return {"Error": "Influencer with this username already exists"}, 920
            old_username = influencer.username
            influencer.username = data["username"]


            ad_requests = Ad_Request.query.filter(Ad_Request.associated_influencer==old_username).all()
            for request_ in ad_requests:
                request_.associated_influencer = data['username']

            contracts = Contract.query.filter(Contract.influencer == old_username).all()
            for contract in contracts:
                contract.influencer = data['username']

        if "email" in data and data["email"]:
            user = User.query.filter(User.email==data["email"]).first()
            if not user:
                influencer_id = influencer.id
                parent_user = User.query.filter(User.id==influencer_id).first()
                parent_user.email = data["email"]
            else:
                return {"Error":"User with this email already exists."}, 921

        if "password" in data and data["password"]:
            user = influencer.user
            user.password = hash_password(data["password"])

        if "platforms" in data and data["platforms"]:
            influencer.platforms = data["platforms"]

        if "combined_followers" in data and data["combined_followers"]:
            influencer.combined_followers = int(data["combined_followers"])

        if "niche" in data and data["niche"]:
            influencer.niche = data["niche"]

        file = request.files.get("image")
        if file:
            if allowed_file(file.filename):
                filename = influencer.username + "_influencer_" + secure_filename(file.filename)
                save_path = os.path.join(app.config["IMAGE_FOLDER"], filename)
                os.makedirs(os.path.dirname(save_path), exist_ok=True)
                file.save(save_path)
                influencer.user.image = filename
            else:
                return {"Error": "Invalid File Type; Allowed Types = ['.jpg', '.jpeg', '.png']"}, 919

        try:
            db.session.commit()
            cache.delete_memoized(Influencer_Resource.get, self, id)
            cache.delete('/admin/statistics')
            return {"Message": "Influencer successfully updated"}, 200
        except Exception as e:
            db.session.rollback()
            return {"Error": "Failed to update influencer"}, 500

class Campaign_Resource_One(Resource):
    @cache.memoize(timeout = 5)
    @marshal_with(marshal_campaign)
    def get(self, id):
        campaign = Campaign.query.filter(Campaign.campaign_id == id).first()
        if not campaign:
            return {"Error": "Campaign with this ID does not exist"}, 404
        return campaign, 200

    @auth_required('token')
    def delete(self, id):
        campaign = Campaign.query.filter(Campaign.campaign_id == id).first()
        if not campaign:
            return {"Error": "Campaign with this ID does not exist"}, 404
        try:
            db.session.delete(campaign)
            db.session.commit()
            parent_id = Sponsor.query.filter(Sponsor.username == campaign.parent).first().id
            cache.delete_memoized(SponsorCampaignList.get, self, parent_id)
            cache.delete('/admin/statistics')
            cache.delete_memoized(Campaign_Resource_One.get, self, id)
            cache.delete('/admin/campaigns')
            return {"Message": "Campaign successfully deleted"}, 200
        except:
            db.session.rollback()
            return {"Error": "Failed to delete campaign"}, 500

class Campaign_Resource_Two(Resource):

        
    @auth_required('token')
    def post(self, sponsor_id):
        sponsor = Sponsor.query.filter(Sponsor.id==sponsor_id).first()
        if not sponsor:
            return {"Error" : "Sponsor with this ID does not exist."}, 404

        data = request.form
        campaign_name = data.get('campaign_name')
        parent = sponsor.username
        description = data.get('description')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        visibility = data.get('visibility')
        goal = data.get('goal')
        niche = data.get('niche')
        minimum_payment = data.get('minimum_payment')

        if not parent:
            return {"Error": "Only sponsors can create campaigns"}, 400

        def add_campaign(image_path):
            try:
                checkname = Campaign.query.filter(Campaign.campaign_name==campaign_name).first()
                if checkname:
                    return {'Error': 'A campaign with this name already exists.'}, 920
                else:
                    campaign = Campaign(
                        campaign_name=campaign_name,
                        parent=parent,
                        description=description,
                        start_date=datetime.strptime(start_date, '%Y-%m-%d').date(),
                        end_date=datetime.strptime(end_date, '%Y-%m-%d').date(),
                        visibility=visibility,
                        goal=goal,
                        niche=niche,
                        minimum_payment=int(minimum_payment),
                        image=image_path,
                    )
                    db.session.add(campaign)
                    db.session.commit()
                    cache.delete_memoized(SponsorCampaignList.get, self, sponsor_id)
                    cache.delete('/admin/statistics')
                    return {"Message": "Campaign successfully created"}, 201
            except Exception as e:
                db.session.rollback()
                app.logger.error(f"Exception occurred: {e}")
                app.logger.error(traceback.format_exc())
                return {"Error": "Failed to create campaign"}, 500

        file = request.files.get('image')
        if file:
            if allowed_file(file.filename):
                filename = secure_filename(file.filename)
                save_path = os.path.join(app.config['IMAGE_FOLDER'], filename)
                os.makedirs(os.path.dirname(save_path), exist_ok=True)
                file.save(save_path)
                return add_campaign(filename)
            else:
                return {"Error": "Invalid File Type; Allowed Types = ['.jpg', '.jpeg', '.png']"}, 919
        else:
            return add_campaign(None)
        
class Campaign_Resource_Three(Resource):

    @auth_required('token')
    def put(self, id, sponsor_id):
      
        campaign = Campaign.query.filter(Campaign.campaign_id == id).first()
        sponsor = Sponsor.query.filter(Sponsor.id==sponsor_id).first()
        if not campaign:
            return {"Error": "Campaign with this ID does not exist"}, 404

        if campaign.parent != sponsor.username:
            return {"Error": "You do not have permission to update this campaign"}, 400

        data = request.form

        if "campaign_name" in data and data["campaign_name"]:
            count = Campaign.query.filter(Campaign.campaign_name == data["campaign_name"]).count()
            if count != 0:
                return {"Error": "Campaign with this name already exists"}, 920
            
            old_campaign_name = campaign.campaign_name
            campaign.campaign_name = data["campaign_name"]


            ad_requests = Ad_Request.query.filter(Ad_Request.associated_campaign==old_campaign_name).all()
            for request_ in ad_requests:
                request_.associated_campaign = data['campaign_name']

            contracts = Contract.query.filter(Contract.campaign == old_campaign_name).all()
            for contract in contracts:
                contract.campaign = data['campaign_name']

        if "description" in data and data["description"]:
            campaign.description = data["description"]

        if "start_date" in data and data["start_date"]:
            campaign.start_date = datetime.strptime(data["start_date"], '%Y-%m-%d').date()

        if "end_date" in data and data["end_date"]:
            campaign.end_date = datetime.strptime(data["end_date"], '%Y-%m-%d').date()

        if "visibility" in data and data["visibility"]:
            campaign.visibility = data["visibility"]

        if "goal" in data and data["goal"]:
            campaign.goal = data["goal"]

        if "niche" in data and data["niche"]:
            campaign.niche = data["niche"]

        if "status" in data and data["status"]:
            campaign.status = data["status"]

        if "minimum_payment" in data and data["minimum_payment"]:
            campaign.minimum_payment = int(data["minimum_payment"])

        file = request.files.get("image")
        if file:
            if allowed_file(file.filename):
                filename = secure_filename(file.filename)
                save_path = os.path.join(app.config["IMAGE_FOLDER"], filename)
                os.makedirs(os.path.dirname(save_path), exist_ok=True)
                file.save(save_path)
                campaign.image = filename
            else:
                return {"Error": "Invalid File Type; Allowed Types = ['.jpg', '.jpeg', '.png']"}, 919

        try:
            db.session.commit()
            cache.delete_memoized(Campaign_Resource_One.get, self, id)
            cache.delete('/admin/statistics')
            return {"Message": "Campaign successfully updated"}, 200
        except:
            db.session.rollback()
            return {"Error" : "Failed to update campaign"}, 500


        
class Contract_Resource(Resource):
    @auth_required('token')
    @cache.memoize(timeout = 5)
    @marshal_with(marshal_contract)
    def get(self, id):
        contract = Contract.query.filter(Contract.id == id).first()
        if not contract:
            return {"Error": "Contract with this ID does not exist"}, 404
        return contract, 200

    @auth_required('token')
    def delete(self, id):
        contract = Contract.query.filter(Contract.id == id).first()
        if not contract:
            return {"Error": "Contract with this ID does not exist"}, 404
        try:
            db.session.delete(contract)
            db.session.commit()
            cache.delete_memoized(Contract_Resource.get, self, id)
            cache.delete('/admin/statistics')
            return {"Message": "Contract successfully deleted"}, 200
        except Exception as e:
            db.session.rollback()
            app.logger.error(traceback.format_exc())
            return {"Error": "Failed to delete contract"}, 500


class Ad_Request_Resource(Resource):
    @auth_required('token')
    @cache.memoize(timeout=5)
    @marshal_with(marshal_ad_request)
    def get(self, id):
        ad_request = Ad_Request.query.filter(Ad_Request.adrequest_id == id).first()
        if not ad_request:
            return {"Error": "Ad Request with this ID does not exist"}, 404
        return ad_request, 200

    @auth_required('token')
    def delete(self, id):
        ad_request = Ad_Request.query.filter(Ad_Request.adrequest_id == id).first()
        if not ad_request:
            return {"Error": "Ad Request with this ID does not exist"}, 404
        try:
            db.session.delete(ad_request)
            db.session.commit() 

            sponsor_id = Sponsor.query.filter(Sponsor.username == ad_request.associated_sponsor).first().id
            influencer_id = Sponsor.query.filter(Influencer.username == ad_request.associated_influencer).first().id
            cache.delete_memoized(SponsorRequestList.get, self, sponsor_id)
            cache.delete_memoized(InfluencerRequestList.get, self, influencer_id)
            cache.delete_memoized(Ad_Request_Resource.get, self, id)
            cache.delete('/admin/requests')
            cache.delete('/admin/statistics')

            return {"Message": "Ad Request successfully deleted"}, 200
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Exception occurred: {e}")
            app.logger.error(traceback.format_exc())
            return {"Error": "Failed to delete Ad Request"}, 500
        
    @auth_required('token')
    def post(self):
        data = request.form
        associated_influencer = data.get('associated_influencer')
        associated_sponsor = data.get('associated_sponsor')
        associated_campaign = data.get('associated_campaign')
        info = data.get('info')
        payment = data.get('payment')
        initiator = data.get('initiator')
        deadline = data.get('deadline')

        def add_ad_request():
            try:
                ad_request = Ad_Request(
                    associated_influencer=associated_influencer,
                    associated_sponsor=associated_sponsor,
                    associated_campaign=associated_campaign,
                    info=info,
                    payment=int(payment),
                    initiator=initiator,
                    deadline=datetime.strptime(deadline, '%Y-%m-%d').date()
                )
                db.session.add(ad_request)
                db.session.commit()
             
                negotiation = Negotiation(parent_request_id=ad_request.adrequest_id)
                db.session.add(negotiation)
                db.session.commit()

                sponsor_id = Sponsor.query.filter(Sponsor.username == associated_sponsor).first().id
                influencer_id = Sponsor.query.filter(Influencer.username == associated_influencer).first().id
                cache.delete_memoized(SponsorRequestList.get, self, sponsor_id)
                cache.delete_memoized(InfluencerRequestList.get, self, influencer_id)

                return {"Message": "Ad Request successfully created"}, 201
            except Exception as e:
                db.session.rollback()
                app.logger.error(f"Exception occurred: {e}")
                app.logger.error(traceback.format_exc())
                return {"Error": "Failed to create Ad Request"}, 500

        return add_ad_request()

    @auth_required('token')
    def put(self, id):
        ad_request = Ad_Request.query.filter(Ad_Request.adrequest_id == id).first()
        if not ad_request:
            return {"Error": "Ad Request with this ID does not exist"}, 404

        data = request.form

        if "info" in data:
            ad_request.info = data["info"]
        if "payment" in data:
            ad_request.payment = int(data["payment"])
        if "status" in data:
            ad_request.status = data["status"]
        if "deadline" in data:
            ad_request.deadline = datetime.strptime(data["deadline"], '%Y-%m-%d').date()

        try:
            db.session.commit()
            cache.delete_memoized(Ad_Request_Resource.get, self, id)
            return {"Message": "Ad Request successfully updated"}, 200
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Exception occurred: {e}")
            app.logger.error(traceback.format_exc())
            return {"Error": "Failed to update Ad Request"}, 500

class Negotiation_Resource(Resource):
    @auth_required('token')
    @marshal_with(marshal_negotiation)
    def get(self, id):
        negotiation = Negotiation.query.filter(Negotiation.parent_request_id == id).first()
        if not negotiation:
            return {"Error": "Negotiation with this ID does not exist"}, 404
        return negotiation, 200

    @auth_required('token')
    def delete(self, id):
        negotiation = Negotiation.query.filter(Negotiation.parent_request_id == id).first()
        if not negotiation:
            return {"Error": "Negotiation with this ID does not exist"}, 404
        try:
            db.session.delete(negotiation)
            db.session.commit()
            return {"Message": "Negotiation successfully deleted"}, 200
        except Exception as e:
            db.session.rollback()
            app.logger.error(traceback.format_exc())
            return {"Error": "Failed to delete negotiation"}, 500
        
    @auth_required('token')
    def put(self, id):
        negotiation = Negotiation.query.filter(Negotiation.parent_request_id == id).first()
        if not negotiation:
            return {"Error": "Negotiation with this ID does not exist"}, 404

        data = request.form

        if "payment" in data and data["payment"]:
            negotiation.payment = int(data["payment"])

        if "deadline" in data and data["deadline"]:
            negotiation.deadline = datetime.strptime(data["deadline"], '%Y-%m-%d').date()

        if "additional_info" in data and data["additional_info"]:
            negotiation.additional_info = data["additional_info"]

        try:
            db.session.commit()
            return {"Message": "Negotiation updated successfully."}, 200
        except Exception as e:
            db.session.rollback()
            app.logger.error(traceback.format_exc())
            return {"Error": "Failed to update negotiation"}, 500

    # no post request for Negotiation_Resource because a Negotiation is created along with its parent Ad Request.

class Eradicate(Resource):
    @auth_required('token')
    def delete(self, id):
        user = User.query.filter(User.id == id).first()
        try:
            db.session.delete(user)
            db.session.commit()
            cache.delete('/admin/statistics')
            cache.delete('/admin/sponsors')
            cache.delete('/admin/influencers')
            cache.delete_memoized(Influencer_Resource.get, self, id)
            cache.delete_memoized(Sponsor_Resource.get, self, id)
            return {"Message" : "User Successfully Deleted."}, 200
        except:
            db.session.rollback()
            return {"Error" : "Failed To Delete User."}, 500
        
class StuffView(Resource):
    def get(self, id):
        user = User.query.filter(User.id==id).first()
        nature = user.roles[0].name
        return {"nature" : nature}, 200
    
class SponsorCampaignList(Resource):
    @cache.memoize(timeout = 5)
    @marshal_with(marshal_campaign)
    def get(self, sponsor_id):
        sponsor = Sponsor.query.filter(Sponsor.id==sponsor_id).first()
        campaign_list = Campaign.query.filter(Campaign.parent==sponsor.username).all()
        return campaign_list, 200

class SponsorRequestList(Resource):
    @auth_required('token')
    @cache.memoize(timeout = 5)
    @marshal_with(marshal_ad_request)
    def get(self, sponsor_id):
        sponsor = Sponsor.query.filter(Sponsor.id==sponsor_id).first()
        request_list = Ad_Request.query.filter(Ad_Request.associated_sponsor==sponsor.username).all()
        return request_list, 200
    
class InfluencerRequestList(Resource):
    @auth_required('token')
    @cache.memoize(timeout = 5)
    @marshal_with(marshal_ad_request)
    def get(self, influencer_id):
        influencer = Influencer.query.filter(Influencer.id==influencer_id).first()
        request_list = Ad_Request.query.filter(Ad_Request.associated_influencer==influencer.username).all()
        return request_list, 200
    
class RequestCardHelp(Resource):
    @auth_required('token')
    def get(self, type, name):
        if type == 'sponsor':
            sponsor = Sponsor.query.filter(Sponsor.username == name).first()
            if not sponsor:
                return {"Error": "Sponsor not found"}, 404
            return marshal(sponsor, marshal_sponsor), 200
        elif type == 'influencer':
            influencer = Influencer.query.filter(Influencer.username == name).first()  
            if not influencer:
                return {"Error": "Influencer not found"}, 404
            return marshal(influencer, marshal_influencer), 200
        elif type == 'campaign':
            campaign = Campaign.query.filter(Campaign.campaign_name == name).first()
            if not campaign:
                return {"Error": "Campaign not found"}, 404
            return marshal(campaign, marshal_campaign), 200
        else:
            return {"Error": "Invalid type provided"}, 400

class SearchCampaigns(Resource):
    @auth_required('token')
    @marshal_with(marshal_campaign)
    def get(self):
        data = request.args # request.form is for POST requests, request.args is for GET requests
        name = data.get('name')
        minimum_payment = data.get('minimum_payment')
        end_date = data.get('end_date')
        niche = data.get('niche')

        campaigns = Campaign.query.filter(Campaign.visibility == 'Public')

        
        if name:
            campaigns = campaigns.filter(Campaign.campaign_name == name)
        if minimum_payment:
            campaigns = campaigns.filter(Campaign.minimum_payment >= int(minimum_payment))
        if end_date:
            campaigns = campaigns.filter(Campaign.end_date >= datetime.strptime(end_date, '%Y-%m-%d').date())
        if niche:
            campaigns = campaigns.filter(Campaign.niche == niche)
            
        campaigns = campaigns.all() # converting the query to a list

        return campaigns, 200


class SearchInfluencers(Resource):
    @auth_required('token')
    @marshal_with(marshal_influencer)
    def get(self):
        data = request.args # request.form is for POST requests, request.args is for GET requests
        name = data.get('name')
        combined_followers = data.get('combined_followers') # converting the query to a list
        niche = data.get('niche')

        influencers = Influencer.query
        if name:
            influencers = influencers.filter(Influencer.username == name)
        if combined_followers:
            influencers = influencers.filter(Influencer.combined_followers >= int(combined_followers))
        if niche:
            influencers = influencers.filter(Influencer.niche == niche)

        influencers = influencers.all() # converting the query to a list
        
        return influencers, 200

class ViewCampaignHelp(Resource):
    @auth_required('token')
    def get(self, name):
        sponsor = Sponsor.query.filter(Sponsor.username==name).first()
        if not sponsor:
            return {"Error" : "Sponsor Not Found"}, 404
        return {"sponsor_id" : sponsor.id}, 200
    
class RequestInfluencerHelp(Resource):
    @auth_required('token')
    @marshal_with(marshal_campaign)
    def get(self, id):
        sponsor = Sponsor.query.filter(Sponsor.id==id).first()
        campaigns = Campaign.query.filter(Campaign.parent==sponsor.username, Campaign.visibility=='Public', Campaign.flag=='No').all()
        return campaigns, 200

class DoesContractExist(Resource):
    @auth_required('token')
    def get(self, campaign_name, influencer_name):
        contract = Contract.query.filter(Contract.campaign==campaign_name, Contract.influencer==influencer_name).first()
        if contract:
            return {"Answer" : "Yes"}, 200
        else:
            return {"Answer" : "No"}, 200


class DoesAdExist(Resource):
    @auth_required('token')
    def get(self, campaign_name, influencer_name):
        ad = Ad_Request.query.filter(Ad_Request.associated_campaign==campaign_name, Ad_Request.associated_influencer==influencer_name).first()
        if ad:
            return {"Answer" : "Yes"}, 200
        else:
            return {"Answer" : "No"}, 200
        
class AcceptRequest(Resource):
    @auth_required('token')
    def put(self, adrequest_id):
        ad_request = Ad_Request.query.filter(Ad_Request.adrequest_id==adrequest_id).first()
        sponsor = Sponsor.query.filter(Sponsor.username == ad_request.associated_sponsor).first()
        influencer = Influencer.query.filter(Influencer.username == ad_request.associated_influencer).first()
        ad_request.status = 'Accepted'
        sponsor.expenditure = int(sponsor.expenditure) + int(ad_request.payment)
        influencer.earnings = int(influencer.earnings) + int(ad_request.payment)
        new_contract = Contract(campaign = ad_request.associated_campaign, influencer = ad_request.associated_influencer,
                            payment = ad_request.payment, status = 'Ongoing', deadline = ad_request.deadline)
        try:
            db.session.add(new_contract)
            db.session.commit()
            cache.delete_memoized(Ad_Request_Resource.get, self, adrequest_id)
            cache.delete('/admin/statistics')
            return {"Message" : "Request Accepted Successfully."}, 200  
        except:
            return {"Error" : "Could Not Accept Request."}, 500
        
class RejectRequest(Resource):
    @auth_required('token')
    def put(self, adrequest_id):
        ad_request = Ad_Request.query.filter(Ad_Request.adrequest_id==adrequest_id).first()
        ad_request.status = 'Rejected'
        try:
            db.session.commit()
            cache.delete_memoized(Ad_Request_Resource.get, self, adrequest_id)
            cache.delete('/admin/statistics')
            return {"Message" : "Request Rejected Successfully."}, 200  
        except:
            return {"Error" : "Could Not Reject Request."}, 500
        
class FetchContracts(Resource):
    @auth_required('token')
    @cache.memoize(timeout = 5)
    def get(self, type, id):
        if type=='campaign':
            campaign = Campaign.query.filter(Campaign.campaign_id==id).first()
            contracts = Contract.query.filter(Contract.campaign==campaign.campaign_name).all()
            return marshal(contracts, marshal_contract), 200
        if type=='influencer':
            influencer = Influencer.query.filter(Influencer.id == id).first()
            contracts = Contract.query.filter(Contract.influencer==influencer.username).all()
            return marshal(contracts, marshal_contract), 200

class CancelContract(Resource):
    @auth_required('token')
    def put(self, id):
        contract = Contract.query.filter(Contract.id==id).first()
        contract.status = 'Cancelled'
        try:
            db.session.commit()
            cache.delete('/admin/statistics')
            cache.delete_memoized(Contract_Resource.get, self, id)
            return {"Message" : "Contract Successfully Cancelled."}, 200
        except:
            return {"Error" : "Could Not Cancel Contract"}, 500


class MarkContractCompleted(Resource):
    @auth_required('token')
    def put(self, id):
        contract = Contract.query.filter(Contract.id==id).first()
        contract.status = 'Completed'
        try:
            db.session.commit()
            cache.delete_memoized(Contract_Resource.get, self, id)
            cache.delete('/admin/statistics')
            return {"Message" : "Contract Successfully Marked Completed."}, 200
        except:
            return {"Error" : "Could Not Mark Contract Completed"}, 500

class AllCampaigns(Resource):
    @auth_required('token')
    @cache.cached(timeout = 5)
    @marshal_with(marshal_campaign)
    def get(self):
        campaigns = Campaign.query.all()
        return campaigns, 200

class AllSponsors(Resource):
    @auth_required('token')
    @cache.cached(timeout = 5)
    @marshal_with(marshal_sponsor)
    def get(self):
        sponsors = Sponsor.query.all()
        return sponsors, 200
    
class AllInfluencers(Resource):
    @auth_required('token')
    @cache.cached(timeout = 5)
    @marshal_with(marshal_influencer)
    def get(self):
        influencers = Influencer.query.all()
        return influencers, 200
    
class AllRequests(Resource):
    @auth_required('token')
    @cache.cached(timeout = 5)
    @marshal_with(marshal_ad_request)
    def get(self):
        requests = Ad_Request.query.all()
        return requests, 200
    
class FlagSponsor(Resource):
    @auth_required('token')
    def put(self, id):
        sponsor = Sponsor.query.filter(Sponsor.id == id).first()
        sponsor.flag = 'Yes'
        try:
            db.session.commit()
            cache.delete_memoized(Sponsor_Resource.get, self, id)
            cache.delete('/admin/statistics')
            return {"Message" : "Sponsor successfully Flagged"}, 200
        except:
            db.session.rollback()
            return {"Error" : "Could not flag sponsor."}, 500
        
class UnFlagSponsor(Resource):
    @auth_required('token')
    def put(self, id):
        sponsor = Sponsor.query.filter(Sponsor.id == id).first()
        sponsor.flag = 'No'
        sponsor.appeal = 'No appeal made yet.'
        try:
            db.session.commit()
            cache.delete_memoized(Sponsor_Resource.get, self, id)
            cache.delete('/admin/statistics')
            return {"Message" : "Sponsor successfully Un-Flagged"}, 200
        except:
            db.session.rollback()
            return {"Error" : "Could not unflag sponsor."}, 500

class FlagInfluencer(Resource):
    @auth_required('token')
    def put(self, id):
        influencer = Influencer.query.filter(Influencer.id == id).first()
        influencer.flag = 'Yes'
        try:
            db.session.commit()
            cache.delete_memoized(Influencer_Resource.get, self, id)
            cache.delete('/admin/statistics')
            return {"Message" : "Influencer successfully Flagged"}, 200
        except:
            db.session.rollback()
            return {"Error" : "Could not flag influencer."}, 500
        
class UnFlagInfluencer(Resource):
    @auth_required('token')
    def put(self, id):
        influencer = Influencer.query.filter(Influencer.id == id).first()
        influencer.flag = 'No'
        influencer.appeal = 'No appeal made yet.'
        try:
            db.session.commit()
            cache.delete_memoized(Influencer_Resource.get, self, id)
            cache.delete('/admin/statistics')
            return {"Message" : "Influencer successfully Un-Flagged"}, 200
        except:
            db.session.rollback()
            return {"Error" : "Could not unflag influencer."}, 500
        
class FlagCampaign(Resource):
    @auth_required('token')
    def put(self, id):
        campaign = Campaign.query.filter(Campaign.campaign_id == id).first()
        campaign.flag = 'Yes'
        try:
            db.session.commit()
            cache.delete_memoized(Campaign_Resource_One.get, self, id)
            cache.delete('/admin/statistics')
            return {"Message" : "Campaign successfully Flagged"}, 200
        except:
            db.session.rollback()
            return {"Error" : "Could not flag campaign."}, 500

class UnFlagCampaign(Resource):
    @auth_required('token')
    def put(self, id):
        campaign = Campaign.query.filter(Campaign.campaign_id == id).first()
        campaign.flag = 'No'
        campaign.appeal = 'No appeal made yet.'
        try:
            db.session.commit()
            cache.delete_memoized(Campaign_Resource_One.get, self, id)
            cache.delete('/admin/statistics')
            return {"Message" : "Campaign successfully Un-Flagged"}, 200
        except:
            db.session.rollback()
            return {"Error" : "Could not unflag campaign."}, 500
        
class SponsorAppeal(Resource):
    @auth_required('token')
    def put(self, id):
        appeal = request.form
        sponsor = Sponsor.query.filter(Sponsor.id==id).first()
        sponsor.appeal = appeal.get('appeal')
        try:
            db.session.commit()
            cache.delete_memoized(Sponsor_Resource.get, self, id)
            return {"Message" : "Appeal sent successfully."}, 200
        except:
            db.session.rollback()
            return {"Error" : "Could not send appeal."}, 500
        
class InfluencerAppeal(Resource):
    @auth_required('token')
    def put(self, id):
        appeal = request.form
        influencer = Influencer.query.filter(Influencer.id==id).first()
        influencer.appeal = appeal.get('appeal')
        try:
            db.session.commit()
            cache.delete_memoized(Influencer_Resource.get, self, id)
            return {"Message" : "Appeal sent successfully."}, 200
        except:
            db.session.rollback()
            return {"Error" : "Could not send appeal."}, 500
        
class CampaignAppeal(Resource):
    @auth_required('token')
    def put(self, id):
        appeal = request.form
        campaign = Campaign.query.filter(Campaign.campaign_id==id).first()
        campaign.appeal = appeal.get('appeal')
        try:
            db.session.commit()
            cache.delete_memoized(Campaign_Resource_One.get, self, id)
            return {"Message" : "Appeal sent successfully."}, 200
        except:
            db.session.rollback()
            return {"Error" : "Could not send appeal."}, 500
        
class ApproveSponsorRegistration(Resource):
    @auth_required('token')
    def put(self, id):
        sponsor = Sponsor.query.filter(Sponsor.id == id).first()
        sponsor.flag = 'No'
        try:
            db.session.commit()
            cache.delete_memoized(Sponsor_Resource.get, self, id)
            cache.delete('/admin/statistics')
            return {"Message" : "Sponsor Registration Approved Successfully."}, 200
        except:
            db.session.rollback()
            return {"Error" : "Could Not Approve Sponsor Registration."}, 500

class RejectSponsorRegistration(Resource):
    @auth_required('token')
    def put(self, id):
        sponsor = Sponsor.query.filter(Sponsor.id == id).first()
        sponsor.flag = 'Rejected'
        try:
            db.session.commit()
            cache.delete_memoized(Sponsor_Resource.get, self, id)
            cache.delete('/admin/statistics')
            return {"Message" : "Sponsor Registration Rejected Successfully."}, 200
        except:
            db.session.rollback()
            return {"Error" : "Could Not Reject Sponsor Registration."}, 500
  
class AdminStatistics(Resource):
    @auth_required('token')
    @cache.cached(timeout = 10) # a longer timeout because I've put cache.delete('/admin/statistics') at all places which could trigger any of the below statistics to get changed
    def get(self):
        
        all_sponsors = Sponsor.query.filter((Sponsor.flag == 'Yes') | (Sponsor.flag == 'No')).count()
        flagged_sponsors = Sponsor.query.filter(Sponsor.flag == 'Yes').count()
        pending_approvals = Sponsor.query.filter(Sponsor.flag == 'Pending').count()

        all_influencers = Influencer.query.count()
        flagged_influencers = Influencer.query.filter(Influencer.flag == 'Yes').count()

        all_requests = Ad_Request.query.count()
        pending_requests = Ad_Request.query.filter(Ad_Request.status == 'Pending').count()
        accepted_requests = Ad_Request.query.filter(Ad_Request.status == 'Accepted').count()
        rejected_requests = Ad_Request.query.filter(Ad_Request.status == 'Rejected').count()

        all_campaigns = Campaign.query.count()
        flagged_campaigns = Campaign.query.filter(Campaign.flag == 'Yes').count()

        all_contracts = Contract.query.count()
        ongoing_contracts = Contract.query.filter(Contract.status == 'Ongoing').count()
        completed_contracts = Contract.query.filter(Contract.status == 'Completed').count()
        cancelled_contracts = Contract.query.filter(Contract.status == 'Cancelled').count()

        graphs = []

        if all_sponsors > 0 or all_influencers > 0 or all_campaigns > 0:
            plt.figure(figsize=(10, 6))
            plt.bar(['Sponsors', 'Influencers', 'Campaigns'], [all_sponsors, all_influencers, all_campaigns])
            plt.title('Count of Sponsors, Influencers, and Campaigns')

            graph1_name = 'graph1.png'
            save_path1 = os.path.join(app.config['GRAPH_FOLDER'], graph1_name)
            os.makedirs(os.path.dirname(save_path1), exist_ok=True)
            plt.savefig(save_path1)
            plt.close()
            graphs.append(graph1_name)

        if ongoing_contracts > 0 or completed_contracts > 0 or cancelled_contracts > 0:
            plt.figure(figsize=(10, 6))
            plt.pie(
                [ongoing_contracts, completed_contracts, cancelled_contracts],
                labels=['Ongoing Contracts', 'Completed Contracts', 'Cancelled Contracts'],
                autopct='%1.1f%%'
            )
            plt.title('Distribution of Ongoing, Completed and Cancelled Contracts')

            graph2_name = 'graph2.png'
            save_path2 = os.path.join(app.config['GRAPH_FOLDER'], graph2_name)
            os.makedirs(os.path.dirname(save_path2), exist_ok=True)
            plt.savefig(save_path2)
            plt.close()
            graphs.append(graph2_name)

        if all_sponsors > 0 or all_influencers > 0:
            total_expenditure = 0
            for sponsor in Sponsor.query.all():
                total_expenditure += sponsor.expenditure

            total_earnings = 0
            for influencer in Influencer.query.all():
                total_earnings += influencer.earnings

            if all_sponsors > 0:
                avg_expenditure = total_expenditure / all_sponsors
            else:
                avg_expenditure = 0

            if all_influencers > 0:
                avg_earnings = total_earnings / all_influencers
            else:
                avg_earnings = 0

            plt.figure(figsize=(10, 6))
            plt.bar(['Avg Expenditure per Sponsor', 'Avg Earnings per Influencer'], [avg_expenditure, avg_earnings], color=['blue', 'green'])
            plt.title('Average Expenditure and Earnings')

            graph3_name = 'graph3.png'
            save_path3 = os.path.join(app.config['GRAPH_FOLDER'], graph3_name)
            os.makedirs(os.path.dirname(save_path3), exist_ok=True)
            plt.savefig(save_path3)
            plt.close()
            graphs.append(graph3_name)

        if all_influencers > 0:
            top_influencers = Influencer.query.order_by(Influencer.combined_followers.desc()).limit(5).all()

            top_follower_counts = []
            top_influencer_names = []

            for influencer in top_influencers:
                top_follower_counts.append(influencer.combined_followers)
                top_influencer_names.append(influencer.username)

            plt.figure(figsize=(10, 6))
            plt.bar(top_influencer_names, top_follower_counts, color='purple')
            plt.title('Top 5 Influencers by Followers')
            plt.xlabel('Influencer Names')
            plt.ylabel('Number of Followers')

            graph4_name = 'graph4.png'
            save_path4 = os.path.join(app.config['GRAPH_FOLDER'], graph4_name)
            os.makedirs(os.path.dirname(save_path4), exist_ok=True)
            plt.savefig(save_path4)
            plt.close()
            graphs.append(graph4_name)

        if all_sponsors > 0 or all_influencers > 0 or all_campaigns > 0:
            flagged_sponsor_percentage = 0
            if all_sponsors > 0:
                flagged_sponsor_percentage = (flagged_sponsors / all_sponsors) * 100

            flagged_influencer_percentage = 0
            if all_influencers > 0:
                flagged_influencer_percentage = (flagged_influencers / all_influencers) * 100

            flagged_campaign_percentage = 0
            if all_campaigns > 0:
                flagged_campaign_percentage = (flagged_campaigns / all_campaigns) * 100

            flagged_data = [flagged_sponsor_percentage, flagged_influencer_percentage, flagged_campaign_percentage]
            categories = ['Sponsors', 'Influencers', 'Campaigns']

            plt.figure(figsize=(10, 6))
            plt.bar(categories, flagged_data, color=['red', 'orange', 'blue'])
            plt.title('Proportion of Flagged vs. Non-Flagged Entities')
            plt.ylabel('Percentage Flagged (%)')

            graph5_name = 'graph5.png'
            save_path5 = os.path.join(app.config['GRAPH_FOLDER'], graph5_name)
            os.makedirs(os.path.dirname(save_path5), exist_ok=True)
            plt.savefig(save_path5)
            plt.close()
            graphs.append(graph5_name)

        return {
            'all_sponsors': all_sponsors,
            'flagged_sponsors': flagged_sponsors,
            'pending_approvals': pending_approvals,
            'all_influencers': all_influencers,
            'flagged_influencers': flagged_influencers,
            'all_requests': all_requests,
            'pending_requests': pending_requests,
            'accepted_requests': accepted_requests,
            'rejected_requests': rejected_requests,
            'all_campaigns': all_campaigns,
            'flagged_campaigns': flagged_campaigns,
            'all_contracts': all_contracts,
            'ongoing_contracts': ongoing_contracts,
            'completed_contracts': completed_contracts,
            'cancelled_contracts': cancelled_contracts,
            'graphs': graphs
        }, 200
    
# @cache.cached is for functions which don't take any inputs; for them you delete cache like this : cache.delete('/admin/statistics')
# @cache.memoized is for functions which do take inputs; for them you delete cache like this : 


api.add_resource(AdminStatistics, '/admin/statistics')        
api.add_resource(Login, '/login') 
api.add_resource(ApproveSponsorRegistration, '/approve_sponsor_registration/<int:id>' )
api.add_resource(RejectSponsorRegistration, '/reject_sponsor_registration/<int:id>')
api.add_resource(SponsorAppeal, '/appeal/sponsor/<int:id>')
api.add_resource(InfluencerAppeal, '/appeal/influencer/<int:id>')
api.add_resource(CampaignAppeal, '/appeal/campaign/<int:id>')
api.add_resource(FlagCampaign, '/flag/campaign/<int:id>')
api.add_resource(FlagSponsor, '/flag/sponsor/<int:id>')
api.add_resource(FlagInfluencer, '/flag/influencer/<int:id>')
api.add_resource(UnFlagCampaign, '/unflag/campaign/<int:id>')
api.add_resource(UnFlagInfluencer, '/unflag/influencer/<int:id>')
api.add_resource(UnFlagSponsor, '/unflag/sponsor/<int:id>')
api.add_resource(AllCampaigns, '/admin/campaigns')
api.add_resource(AllSponsors, '/admin/sponsors')
api.add_resource(AllInfluencers, '/admin/influencers')
api.add_resource(AllRequests, '/admin/requests')
api.add_resource(CancelContract, '/cancel_contract/<int:id>')
api.add_resource(MarkContractCompleted, '/mark_contract_completed/<int:id>')
api.add_resource(FetchContracts, '/fetch_contracts/<type>/<int:id>')
api.add_resource(AcceptRequest, '/accept_request/<int:adrequest_id>')
api.add_resource(RejectRequest, '/reject_request/<int:adrequest_id>')
api.add_resource(DoesAdExist, '/doesadexist/<campaign_name>/<influencer_name>')
api.add_resource(DoesContractExist, '/doescontractexist/<campaign_name>/<influencer_name>')
api.add_resource(RequestInfluencerHelp, '/request_influencer_help/<int:id>')
api.add_resource(ViewCampaignHelp, '/view_campaign_help/<name>')
api.add_resource(SearchCampaigns, '/search/campaigns')
api.add_resource(SearchInfluencers, '/search/influencers')
api.add_resource(Campaign_Resource_One, '/campaign/<int:id>')
api.add_resource(Campaign_Resource_Two, '/campaign/create/<int:sponsor_id>')
api.add_resource(Campaign_Resource_Three, '/campaign/<int:id>/<int:sponsor_id>')
api.add_resource(Influencer_Resource, '/influencer/<int:id>', '/influencer/registration')
api.add_resource(Sponsor_Resource, '/sponsor/<int:id>', '/sponsor/registration') 
api.add_resource(Eradicate, '/eradicate/<int:id>')
api.add_resource(Contract_Resource, '/contract/<int:id>')
api.add_resource(Ad_Request_Resource, '/ad_request/function/<int:id>', '/make_ad_request')
api.add_resource(Negotiation_Resource, '/negotiation/<int:id>')
api.add_resource(StuffView, '/stuff/view/<int:id>')
api.add_resource(SponsorCampaignList, '/sponsor/campaign_list/<int:sponsor_id>')
api.add_resource(SponsorRequestList, '/sponsor/request_list/<int:sponsor_id>')
api.add_resource(InfluencerRequestList, '/influencer/request_list/<int:influencer_id>')
api.add_resource(RequestCardHelp, '/request_card_help/<type>/<name>')




