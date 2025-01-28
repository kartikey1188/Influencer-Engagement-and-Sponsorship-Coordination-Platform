from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin

db = SQLAlchemy()

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    password = db.Column(db.String, nullable=False)
    email = db.Column(db.String, unique = True, nullable = False)
    image = db.Column(db.Text, unique = True)
    # flask-security specific columns:
    fs_uniquifier = db.Column(db.String, unique=True, nullable=False) # Unique identifier used by Flask-Security to handle token invalidation after password changes.
    active = db.Column(db.Boolean, default=True) # Boolean value indicating if the user's account is active.
    roles = db.relationship('Role', backref='rbacmagic', secondary='user_roles') # Many-to-many relationship with the Role model via the user_roles association table.

    influencer = db.relationship('Influencer', uselist=False, back_populates='user', cascade="all, delete, delete-orphan")
    sponsor = db.relationship('Sponsor', uselist=False, back_populates='user', cascade="all, delete, delete-orphan")

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    description = db.Column(db.String, nullable=False)

class UserRoles(db.Model): # Implements the many-to-many relationship between User and Role.
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))


class Sponsor(db.Model):
    __tablename__ = 'sponsor'
    id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    user = db.relationship('User', back_populates='sponsor')
    username = db.Column(db.String(50), nullable=False, unique=True)
    industry = db.Column(db.String(50), nullable=False)
    expenditure = db.Column(db.Integer, nullable=False, default=0)
    ad_requests = db.relationship('Ad_Request', backref='sponsor', cascade="delete, delete-orphan")
    campaigns = db.relationship('Campaign', backref='sponsor', cascade="delete, delete-orphan")
    flag = db.Column(db.String(20), default='Pending')
    appeal = db.Column(db.Text, default='No appeal made yet.')


class Influencer(db.Model):
    __tablename__ = 'influencer'
    id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    user = db.relationship('User', back_populates='influencer')
    username = db.Column(db.String(50), nullable=False, unique=True)
    platforms = db.Column(db.String)
    combined_followers = db.Column(db.Integer, nullable=False)
    niche = db.Column(db.String(50), nullable=False)
    earnings = db.Column(db.Integer, nullable=False, default=0)
    ad_requests = db.relationship('Ad_Request', backref='influencer', cascade="delete, delete-orphan")
    contracts = db.relationship('Contract', backref='c_influencer', cascade="delete, delete-orphan")
    flag = db.Column(db.String(20), default='No')
    appeal = db.Column(db.Text, default='No appeal made yet.')

class Campaign(db.Model): # Represents advertising campaigns created by sponsors.
    campaign_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    campaign_name = db.Column(db.Text, nullable=False, unique=True)
    parent = db.Column(db.String(50), db.ForeignKey('sponsor.username'))
    description = db.Column(db.Text)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    visibility = db.Column(db.String(50), nullable=False) # visibility can be either 'Public' or 'Private'
    goal = db.Column(db.Text, nullable=False)
    niche = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), nullable=False, default='Ongoing') # not really used this anywhere, purpose was fulfilled by contracts and their status 
    image = db.Column(db.Text)
    ad_requests = db.relationship('Ad_Request', backref='campaign', cascade="delete, delete-orphan")
    contracts = db.relationship('Contract', backref='c_campaign', cascade="delete, delete-orphan")
    minimum_payment = db.Column(db.Integer, nullable=False)
    flag = db.Column(db.String(20), default='No')
    appeal = db.Column(db.Text, default='No appeal made yet.')

class Ad_Request(db.Model):
    __tablename__ = 'ad_request'
    adrequest_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    associated_influencer = db.Column(db.String(50), db.ForeignKey('influencer.username'))
    associated_sponsor = db.Column(db.String(50), db.ForeignKey('sponsor.username'))
    associated_campaign = db.Column(db.Text, db.ForeignKey('campaign.campaign_name'))
    info = db.Column(db.Text, default='No additional information sent with the request')
    payment = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(50), nullable=False, default='Pending') # status can either be 'Pending' or 'Accepted' or 'Rejected'
    initiator = db.Column(db.String(50), nullable=False) # initiator could either be 'sponsor' or 'influencer'
    deadline = db.Column(db.Date, nullable=False)
    negotiation = db.relationship('Negotiation', backref='the_ad', cascade="delete, delete-orphan")

class Contract(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    campaign = db.Column(db.Text, db.ForeignKey('campaign.campaign_name')) 
    influencer = db.Column(db.String(50), db.ForeignKey('influencer.username')) 
    payment = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(50), nullable=False, default='Ongoing') # Status can either be 'Ongoing' or 'Completed' or 'Cancelled'
    deadline = db.Column(db.Date, nullable=False)
    info = db.Column(db.Text)

class Negotiation(db.Model):
    parent_request_id = db.Column(db.Integer, db.ForeignKey('ad_request.adrequest_id'), primary_key=True)
    payment = db.Column(db.Integer)
    deadline = db.Column(db.Date)
    additional_info = db.Column(db.Text)

