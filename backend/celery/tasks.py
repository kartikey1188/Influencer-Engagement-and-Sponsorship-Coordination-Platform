import flask_excel
from celery import shared_task
from backend.models import Campaign, Sponsor, Contract, Influencer, Ad_Request
import matplotlib.pyplot as plt
import os
from flask import current_app as app

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage


    
#................. for campaign details csv file export/download (user triggered async job): .................................................................................................................................................... 

@shared_task(ignore_result = False)
def campaigns_csv(sponsor_id):  # this campaigns_csv function will be called by createCampaignsCSV in routes.py

    sponsor = Sponsor.query.filter(Sponsor.id == sponsor_id).first()
    campaigns = Campaign.query.filter(Campaign.parent == sponsor.username).all()

    export_file_name = f'campaigns_{sponsor.username}.csv'
    column_names = [column.name for column in Campaign.__table__.columns]

    csv_output = flask_excel.make_response_from_query_sets(campaigns, column_names = column_names, file_type='csv')

    with open(f'./backend/celery/downloads/{export_file_name}', 'wb') as file:
        file.write(csv_output.data)
    
    return export_file_name

#.....................................................................................................................................................................................................................................

#................. setup for sending email: ..........................................................................................................................................................

SENDER_EMAIL = 'humbleandcompassionateadmin1@gmail.com'
SMTP_SERVER = "localhost"
SMTP_PORT = 1025
SENDER_PASSWORD = ''

def send_mail(to, subject, body_content):

    message = MIMEMultipart()
    message['From'] = SENDER_EMAIL
    message['To'] = to
    message['Subject'] = subject

    message.attach(MIMEText(body_content,'html'))

    with smtplib.SMTP(host=SMTP_SERVER, port=SMTP_PORT) as client:
        client.send_message(message)
        client.quit()


#....................................................................................................................................................................................

#................. scheduled jobs (using the setup for sending email created above): ....................................................................................................................................................................................................................................................................................................

@shared_task(ignore_result=True)
def daily_influencer_reminder():

    influencers = Influencer.query.all()
    
    for influencer in influencers:
        pending_ad_requests = Ad_Request.query.filter(Ad_Request.associated_influencer == influencer.username, Ad_Request.status =='Pending', Ad_Request.initiator == 'sponsor').count()

        if pending_ad_requests > 0:
            subject = "Daily Reminder: Pending Ad Requests"
            content = f"""
                <h1>Hello {influencer.username},</h1>
                <p>You have {pending_ad_requests} Pending Ad Request(s). Please log in to take action on them.</p>
            """
            send_mail(influencer.user.email, subject, content)
            print(f"Email sent to {influencer.username} with {pending_ad_requests} pending requests.") # logging for debugging; this is visible in the celery worker terminal, since celery worker is what executes tasks (like sending emails); celery Beat only schedules tasks—it doesn't execute them


#..............................................................................................................................................................................................................................................................................................................................................................................................

#................. Monthly Sponsor Activity Report: ...........................................................................................................................................................................................................................................................................................................................

@shared_task(ignore_result = True)
def generate_monthly_report():
    sponsors = Sponsor.query.all()

    for sponsor in sponsors:
        if sponsor.flag != 'Pending':
            public_campaigns = Campaign.query.filter(Campaign.parent==sponsor.username, Campaign.visibility=='Public').all()

            current_expenditure = sponsor.expenditure

            ongoing_contracts = 0
            completed_contracts = 0
            cancelled_contracts = 0

            ad_requests_count = Ad_Request.query.filter(Ad_Request.associated_sponsor == sponsor.username).count()
    
            campaign_names =[]
            for campaign in public_campaigns:
                campaign_names.append(campaign.campaign_name)

                for contract in campaign.contracts:
                    if contract.status=='Ongoing':
                        ongoing_contracts +=1
                    if contract.status=='Cancelled':
                        cancelled_contracts +=1
                    if contract.status=='Completed':
                        completed_contracts +=1
            
            
            if ad_requests_count > 0:
                pending_requests_received = Ad_Request.query.filter(Ad_Request.associated_sponsor == sponsor.username, Ad_Request.status == 'Pending', Ad_Request.initiator == 'influencer').count()
                pending_requests_sent = Ad_Request.query.filter(Ad_Request.associated_sponsor == sponsor.username, Ad_Request.status == 'Pending', Ad_Request.initiator == 'sponsor').count()
                accepted_requests = Ad_Request.query.filter(Ad_Request.associated_sponsor == sponsor.username, Ad_Request.status == 'Accepted', Ad_Request.initiator == 'sponsor').count()
                rejected_requests = Ad_Request.query.filter(Ad_Request.associated_sponsor == sponsor.username, Ad_Request.status == 'Rejected', Ad_Request.initiator == 'sponsor').count()

            graphs = []

            if ongoing_contracts > 0 or completed_contracts > 0 or cancelled_contracts > 0:
                plt.figure(figsize=(10, 6))
                plt.pie(
                    [ongoing_contracts, completed_contracts, cancelled_contracts],
                    labels=['Ongoing Contracts', 'Completed Contracts', 'Cancelled Contracts'],
                    autopct='%1.1f%%'
                )
                plt.title('Distribution of Ongoing, Completed and Cancelled Contracts')

                job_graph1_name = f'job_graph1_{sponsor.username}.png'
                save_path1 = os.path.join(app.config['JOB_GRAPH_FOLDER'], job_graph1_name)
                os.makedirs(os.path.dirname(save_path1), exist_ok=True)
                plt.savefig(save_path1)
                plt.close()
                graphs.append(job_graph1_name)

            if accepted_requests > 0 or rejected_requests > 0:
                plt.figure(figsize=(10, 6))
                plt.pie(
                    [accepted_requests, rejected_requests],
                    labels=['Accepted Requests', 'Rejected Requests'],
                    autopct='%1.1f%%'
                )
                plt.title('Distribution of Accepted and Rejected Requests (Sent Requests)')

                job_graph2_name = f'job_graph2_{sponsor.username}.png'
                save_path2 = os.path.join(app.config['JOB_GRAPH_FOLDER'], job_graph2_name)
                os.makedirs(os.path.dirname(save_path2), exist_ok=True)
                plt.savefig(save_path2)
                plt.close()
                graphs.append(job_graph2_name)

            
            subject = "Monthly Activity Report"
            content = f"""
            
            <h1> MONTHLY ACTIVITY REPORT </h1>
            <br>

            <h3> Hello {sponsor.username}! The following is your Monthly Activity Report. </h3>
            <br>

            <p><b><u>Current Total Expenditure:</u></b> {sponsor.expenditure} </p>
            <br>

            <p><b><u>Number of Ongoing Contracts:</u></b> {ongoing_contracts} </p>
            <p><b><u>Number of Completed Contracts:</u></b> {completed_contracts} </p>
            <p><b><u>Number of Cancelled Contracts:</u></b> {cancelled_contracts} </p>
            <br>

            <p><b><u>Number of Pending Requests (Received):</u></b> {pending_requests_received} </p>
            <p><b><u>Number of Pending Requests (Sent):</u></b> {pending_requests_sent} </p>
            <p><b><u>Number of Accepted Requests (Sent):</u></b> {accepted_requests} </p>
            <p><b><u>Number of Rejected Requests (Sent):</u></b> {rejected_requests} </p>
            <br>

            <img src="cid:job_graph1" alt="job_graph1" />
            <br>
            <img src="cid:job_graph2" alt="job_graph2" />
            <br>

            """

            send_mail_2(sponsor.user.email, subject, content, sponsor.username)
            print(f"Monthly Activity Report sent to {sponsor.username}.")





def send_mail_2(to, subject, body_content, sponsor_username):

    message = MIMEMultipart()
    message['From'] = SENDER_EMAIL
    message['To'] = to
    message['Subject'] = subject

    message.attach(MIMEText(body_content,'html'))

    graph1_path = f"{app.config['JOB_GRAPH_FOLDER']}/job_graph1_{sponsor_username}.png"
    if os.path.exists(graph1_path):
        with open(graph1_path, 'rb') as img:
            mime_img1 = MIMEImage(img.read(), name=f"job_graph1_{sponsor_username}.png")
            mime_img1.add_header('Content-ID', '<job_graph1>')
            message.attach(mime_img1)

    graph2_path = f"{app.config['JOB_GRAPH_FOLDER']}/job_graph2_{sponsor_username}.png"
    if os.path.exists(graph2_path):
        with open(graph2_path, 'rb') as img:
            mime_img2 = MIMEImage(img.read(), name=f"job_graph2_{sponsor_username}.png")
            mime_img2.add_header('Content-ID', '<job_graph2>')
            message.attach(mime_img2)

    with smtplib.SMTP(host=SMTP_SERVER, port=SMTP_PORT) as client:
        client.send_message(message)
        client.quit()





        


#..............................................................................................................................................................................................................................................................................................................................................................................................
