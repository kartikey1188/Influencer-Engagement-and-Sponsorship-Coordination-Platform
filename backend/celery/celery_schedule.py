from celery.schedules import crontab
from flask import current_app as app
from backend.celery.tasks import daily_influencer_reminder, generate_monthly_report

celery_app = app.extensions['celery']

@celery_app.on_after_configure.connect 
def setup_periodic_tasks(sender, **kwargs):   # this 'sender' instance here refers to the celery_app instance
    
    
    #sender.add_periodic_task(10.0, daily_influencer_reminder.s(), name="Ten second influencer reminder") # --> this will schedule the task to run every 10 seconds
 
    sender.add_periodic_task(crontab(hour=15, minute=0), daily_influencer_reminder.s(), name="Daily influencer reminder") # in Celery, task names must be unique; if you scheduled two tasks with the same name, the latter will overwrite the former in the scheduler's memory

    #sender.add_periodic_task(10.0, generate_monthly_report.s(), name="Monthly Sponsor Activity Report - sent every 10 seconds")

    sender.add_periodic_task(crontab(day_of_month=1, hour=0, minute=0), generate_monthly_report.s(), name="Monthly Sponsor Activity Report")
