from flask import Flask
from backend.config import LocalDevelopmentConfig
from backend.models import db, User, Role
from flask_security import Security, SQLAlchemyUserDatastore, auth_required 
from backend.create_initial_data import initialize_data 
from datetime import datetime
import matplotlib.pyplot as plt
from flask_caching import Cache
from backend.celery.celery_setup import celery_init_app
import flask_excel as excel

def createApp(): # Defining a function that creates and configures the Flask app.

    app = Flask(__name__, template_folder = 'frontend', static_folder='frontend', static_url_path = '/static' ) # Creating the Flask application instance.

    app.config.from_object(LocalDevelopmentConfig) # Loading the configuration settings from the LocalDevelopmentConfig class.
    # This sets all the attributes defined in LocalDevelopmentConfig as configuration variables for the app.
    # For example : app.config['DEBUG'] will be set to True as per the configuration.
    
    db.init_app(app) # Binding the SQLAlchemy instance db to the Flask app. 

    cache = Cache(app) # initializing cache


    #flask security : 
    datastore = SQLAlchemyUserDatastore(db, User, Role) # Creating a datastore instance that tells Flask-Security how to interact with user and role data.
    # datastore is an object that Flask-Security uses to perform CRUD operations on users and roles.
    
    app.cache = cache

    app.security = Security(app, datastore=datastore, register_blueprint = False) # Initializing Flask-Security with the app and the datastore.
    app.app_context().push() # Entering the application context. Why is this necessary here? - Some operations require the application context to be active.

    initialize_data() # his will create the database tables and initial data.

    return app # This function returns the configured Flask app.

app = createApp()

celery_app = celery_init_app(app)

from backend.resources import api
api.init_app(app)    #initializing api from resources.py (only working at this spot)

import backend.create_initial_data
import backend.routes 

import backend.celery.celery_schedule

excel.init_excel(app) # initializing flask_excel


if (__name__ == '__main__'):
    app.run(debug=True, port = 5000)
    