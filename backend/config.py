import os

class Config(): # This is a base class that other configuration classes can inherit from.
    DEBUG = False
    SQL_ALCHEMY_TRACK_MODIFICATIONS = False
    # SQLAlchemy can track changes to objects and emit signals. Setting SQLALCHEMY_TRACK_MODIFICATIONS to False disables this feature.
    # This reduces memory overhead because the application doesn't have to track modifications.


class LocalDevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///databasebasedata.sqlite3"
    DEBUG = True # When DEBUG is True, Flask provides detailed error messages when something goes wrong.
    SECURITY_PASSWORD_HASH = 'bcrypt' # Specifies the hashing algorithm for passwords.
    SECURITY_PASSWORD_SALT = 'housecatboatcar' # Salt used in password hashing.
    SECRET_KEY = "catkittycatdogmousecat" # Used for session management and security features.
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authentication-Token' # Header name for token-based authentication.

    # cache specific
    CACHE_TYPE =  "RedisCache"
    CACHE_DEFAULT_TIMEOUT = 30 # 30 seconds
    CACHE_REDIS_PORT = 6379

    WTF_CSRF_ENABLED = False #  CSRF = Cross-Site Request Forgery

    # image specific
    IMAGE_FOLDER = os.path.abspath('./backend/pictures/images')
    GRAPH_FOLDER = os.path.abspath('./backend/pictures/graphs')
    JOB_GRAPH_FOLDER = os.path.abspath('./backend/pictures/job_graphs')
    ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png']