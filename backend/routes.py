from flask import current_app as app, render_template, send_from_directory
from datetime import datetime
from celery.result import AsyncResult
from backend.celery.tasks import campaigns_csv
from flask_security import auth_required 


cache = app.cache

@app.get('/')
def begin():
    return render_template('index.html')

@app.route('/serve_image/<filename>', methods=['GET'])
def serve_image(filename):                         # for serving images from the 'pictures/images' folder
    return send_from_directory(app.config['IMAGE_FOLDER'], filename)

@app.route('/serve_graph/<filename>', methods=['GET'])
def serve_graph(filename):                         # for serving images from the 'pictures/graphs' folder
    return send_from_directory(app.config['GRAPH_FOLDER'], filename)



@app.get('/cache')    
@cache.cached(timeout = 5) 
def cache():   # to test if cache is working
    return {'time' : str(datetime.now())}


@auth_required('token')
@app.get('/create_campaigns_csv/<int:sponsor_id>')
def createCampaignsCSV(sponsor_id):
    task = campaigns_csv.delay(sponsor_id)
    return {'task_id' : task.id}, 200    # the task ID created here will be a string


@auth_required('token')
@app.get('/get_campaigns_csv/<id>')
def getCampaignsCSV(id):

    result = AsyncResult(id)
    
    if result.ready():
        directory = './backend/celery/downloads'
        filename = result.result
        return send_from_directory(directory, filename)
    else:
        return {'message': 'task not ready'}, 404


