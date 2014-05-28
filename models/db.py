# -*- coding: utf-8 -*-

#########################################################################
## This scaffolding model makes your app work on Google App Engine too
## File is released under public domain and you can use without limitations
#########################################################################

## if SSL/HTTPS is properly configured and you want all HTTP requests to
## be redirected to HTTPS, uncomment the line below:
# request.requires_https()

if not request.env.web2py_runtime_gae:
    ## if NOT running on Google App Engine use SQLite or other DB
    db = DAL('sqlite://storage.sqlite',pool_size=1,check_reserved=['all'])
else:
    ## connect to Google BigTable (optional 'google:datastore://namespace')
    db = DAL('google:datastore')
    ## store sessions and tickets there
    session.connect(request, response, db=db)
    ## or store session in Memcache, Redis, etc.
    ## from gluon.contrib.memdb import MEMDB
    ## from google.appengine.api.memcache import Client
    ## session.connect(request, response, db = MEMDB(Client()))

## by default give a view/generic.extension to all actions from localhost
## none otherwise. a pattern can be 'controller/function.extension'
response.generic_patterns = ['*'] if request.is_local else []
## (optional) optimize handling of static files
# response.optimize_css = 'concat,minify,inline'
# response.optimize_js = 'concat,minify,inline'
## (optional) static assets folder versioning
# response.static_version = '0.0.0'
#########################################################################
## Here is sample code if you need for
## - email capabilities
## - authentication (registration, login, logout, ... )
## - authorization (role based authorization)
## - services (xml, csv, json, xmlrpc, jsonrpc, amf, rss)
## - old style crud actions
## (more options discussed in gluon/tools.py)
#########################################################################
TYPE=[ T('Carer'), T('Care Seeker') ]
gender=[ T('Male'), T('Female') ]

from gluon.tools import Auth, Crud, Service, PluginManager, prettydate
auth = Auth(db)
crud, service, plugins = Crud(db), Service(), PluginManager()

auth.settings.extra_fields['auth_user']= [
    Field('Phone', 'integer', requires=IS_NOT_EMPTY()),
    Field('Age', 'integer'),
    Field('Gender', 'string', requires=IS_IN_SET(gender, zero=T('--Please select--'))),
    Field('User_Type', 'string', requires=IS_IN_SET(TYPE, labels = ['Looking for a Care Seeker', 'Looking for a Carer'], zero = T('-- Why are you using this site? --'))),
    Field('MyPict', 'upload'),
    Field('AboutMe', 'text')]
## create all tables needed by auth if not custom tables
auth.define_tables(username=True, signature=False)

## configure email
mail = auth.settings.mailer
mail.settings.server = 'logging' or 'smtp.gmail.com:587'
mail.settings.sender = 'nhimbong94@gmail.com'
mail.settings.login = 'username:password'

## configure auth policy
auth.settings.registration_requires_verification = False
auth.settings.registration_requires_approval = False
auth.settings.reset_password_requires_verification = True
## if you need to use OpenID, Facebook, MySpace, Twitter, Linkedin, etc.
## register with janrain.com, write your domain:api_key in private/janrain.key
from gluon.contrib.login_methods.rpx_account import use_janrain
use_janrain(auth, filename='private/janrain.key')

#########################################################################
## Define your tables below (or better in another model file) for example
##
## >>> db.define_table('mytable',Field('myfield','string'))
##
## Fields can be 'string','text','password','integer','double','boolean'
##       'date','time','datetime','blob','upload', 'reference TABLENAME'
## There is an implicit 'id integer autoincrement' field
## Consult manual for more options, validators, etc.
##
## More API examples for controllers:
##
## >>> db.mytable.insert(myfield='value')
## >>> rows=db(db.mytable.myfield=='value').select(db.mytable.ALL)
## >>> for row in rows: print row.id, row.myfield
#########################################################################
db.define_table('WorkWith',
    Field('Carer', 'integer'),
    Field('CareSeeker', 'integer')
    )
## use this table for both requirements and experience => easier to search
db.define_table('ExperienceRequirementType',
    Field('ExperienceType', 'string')# we can use this as dropdown box options
    )

db.define_table('Experience',
    Field('ExperienceType', 'reference ExperienceRequirementType'),
    Field('UserID', 'reference auth_user'),
    Field('Qualification', 'string'),
    Field('Period', 'integer'), # in months
    Field('Details','text')
    )

db.define_table('Requirement',
    Field('RequirementType', 'reference ExperienceRequirementType'),
    Field('MyUserID', 'reference auth_user'),
    Field('Gender', 'string'),
    Field('Qualification', 'string'),
    Field('Period', 'integer'),# in months
    Field('Availability', 'integer')# in hours
    )
db.define_table('MyMessage',
    Field('FromUser', 'reference auth_user'),
    Field('ToUser', 'reference auth_user'),
    Field('MessageDate', 'datetime', default=request.now),
    Field('Detail', 'text')
    )
# db.define_table('Address',
#     Field('MyUserID', 'reference auth_user'),
#     Field('StreetNumber', 'integer'),
#     Field('Street', 'string'),
#     Field('Postcode', 'integer'),
#     Field('Area', 'string'),
#     Field('City', 'string')
#     )

db.define_table('Schedule',
    Field('MyUserID', 'reference auth_user'),
    Field('Days', 'string'),# we can hard code the days
    Field('HourFrom', 'integer'), # we can hard code these too
    Field('HourTo', 'integer')
    )
db.define_table('Bookings',
    Field('ScheduleID', 'reference Schedule'),
    Field('CareSeeker', 'reference auth_user'),
    Field('HourFrom', 'integer'),# we don't need day as it is defined in Schedule already
    Field('HourTo', 'integer')
    )
db.define_table('userCriteria',
    Field('fromUser', 'reference auth_user'),
    Field('toUser', 'reference auth_user'),
    Field('Overall', 'integer'),
    Field('Reliability', 'integer'),
    Field('Punctuality', 'integer'),
    Field('Personality', 'integer'),
    Field('Opinions', 'text')
    )
# db.define_table('Settings',
#     Field('MyUserID', 'reference auth_user'),
#     Field('StreetNumber', 'integer'),
#     Field('Street', 'string'),
#     Field('Postcode', 'integer'),
#     Field('Area', 'string'),
#     Field('City', 'string')
#     )

db.define_table('CareSeeker',
    Field("UserId", 'reference auth_user'),
	Field("Requirements", "reference Requirement"),
	Field("Interests", "list:string"),
)

db.define_table('Carer',
    Field("UserId", 'reference auth_user'),
	Field("Experience", "reference Experience"),
	Field("Interests", "list:string"),
    Field('CV', 'upload')
)

#db.WorkWith.Carer.requires = IS_IN_DB(db, db.auth_user.id)
#db.WorkWith.CareSeeker.requires = IS_IN_DB(db, db.auth_user.id)

#enable auditing
auth.enable_record_versioning(db)
def find_rating(subscribe, other_d):
    other=db(db.auth_user.id==other_d).select().first()
    if subscribe and other.User_Type=="Carer":
        return db((db.userCriteria.fromUser==auth.user.id)&((db.userCriteria.toUser==other_d))).count()
    if  other.User_Type=="Care Seeker": 
        return 1
    else:
        return 0
def rated(userif):
    avg=db.executesql('SELECT AVG("Overall") FROM userCriteria WHERE toUser={id};'.format(id=userif))
    avg_re=db.executesql('SELECT AVG("Overall") FROM userCriteria WHERE toUser={id};'.format(id=userif))
    avg_pu=db.executesql('SELECT AVG("Overall") FROM userCriteria WHERE toUser={id};'.format(id=userif))
    avg_per=db.executesql('SELECT AVG("Overall") FROM userCriteria WHERE toUser={id};'.format(id=userif))
    list_r=db(db.userCriteria.toUser==userif).select()
    return avg, avg_re, avg_pu, avg_per, list_r
