import shlex
import re
# -*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

#########################################################################
## This is a sample controller
## - index is the default action of any application
## - user is required for authentication and authorization
## - download is for downloading files uploaded in the db (does streaming)
## - call exposes all registered services (none by default)
#########################################################################
def index():
    return dict()

@auth.requires_login()
def subscribe():
    check=check_type(request.args(0))
    if check==1:
        db.WorkWith.insert(Carer=int(auth.user.id), CareSeeker=int(request.args(0)))
    if check==2:
        db.WorkWith.insert(CareSeeker=int(auth.user.id), Carer=int(request.args(0)))
    redirect(URL('default', 'myProfile', args=request.args(0)))
    return dict()

def about():
	return dict()

@auth.requires_login()
def test():
    users=db(db.auth_user.id>0).select()
    return dict(users=users)

@auth.requires_login()
def searchDB():
	minAge = request.vars.searchMinAge
	maxAge = request.vars.searchMaxAge
	interests = request.vars.searchInterests
	name = request.vars.searchName
	gender = request.vars.searchGender
	if(gender != 'Select prefered Gender...'):
		query = db.auth_user.User_Type == "Carer" and db.auth_user.Gender == gender
	#do the search
	row = db(query).select()
	print row
	return dict(people=row)

@auth.requires_login()
def settings():
	#check to see if profile is in database, create one if not - quick and dirty method for linking auth_user to Carer and Careseeker
	if auth.user.User_Type == "Carer":
		row = db(db.Carer.UserId==auth.user.id).select().first()
		if row == None:
			db.Carer.insert(UserId=auth.user.id, Interests='Add some interests!')
			db.commit()
	elif auth.user.User_Type == "Care Seeker":
		row = db(db.CareSeeker.UserId==auth.user.id).select().first()
		if row == None:
			db.CareSeeker.insert(UserId=auth.user.id, Interests='Add some interests!')
			db.commit()
	user = db(db.auth_user.id == auth.user.id).select().first()
	#Get the type of user for view logic
	if(auth.user.User_Type == "Carer"):
		type = db(db.Carer.UserId == auth.user.id).select().first()
		cvUrl = URL('download', args=type.CV)
	elif(auth.user.User_Type == "Care Seeker"):
		type = db(db.CareSeeker.UserId == auth.user.id).select().first()
		cvUrl = ''
	return dict(user=user, cvUrl=cvUrl, role=type)

def contact():
    return dict()

# return 1 if current user is carer, other is care seeker or return 2 
def check_type(other):
    other_one=db(db.auth_user.id==other).select()
    if (auth.user.User_Type=="Carer") and (other_one[0].User_Type=="Care Seeker"):
        return 1
    if (auth.user.User_Type=="Care Seeker") and (other_one[0].User_Type=="Carer"):
        return 2
    return 0

#add sanitising checks using XML()
def updateEmail():
	row = db(db.auth_user.id==auth.user.id).select().first()
	new = request.vars.newEmail
	row.email = new
	row.update_record()
	return

def updatePass():
	return

def updateInterest():
	value = ''
	if(auth.user.User_Type == "Carer"):
		row = db(db.Carer.UserId==auth.user.id).select().first()
	elif(auth.user.User_Type == "Care Seeker"):
		row = db(db.CareSeeker.UserId==auth.user.id).select().first()
	newInterests = XML(request.vars.newInterests, sanitize=True)
	for i in newInterests:
		if(i != "'"):
			value+=i
	row.Interests = value
	row.update_record()
	return

def getInterests():
	value = ''
	row = None
	if(auth.user.User_Type == "Carer"):
		row = db(db.Carer.UserId==auth.user.id).select().first()
	elif(auth.user.User_Type == "Care Seeker"):
		row = db(db.CareSeeker.UserId==auth.user.id).select().first()
	if row != None:
		for i in row.Interests:
			if(i != "'"):
				value+= i
	return value

def updatePhone():
	row = db(db.auth_user.id==auth.user.id).select().first()
	newPhone = request.vars.newPhoneInput
	row.Phone = newPhone
	row.update_record()
	return

def updateDesc():
	row = db(db.auth_user.id==auth.user.id).select().first()
	newAboutMe = request.vars.newAboutMe
	row.AboutMe = newAboutMe
	row.update_record()
	return

def updateCV():
	pass

def updatePic():
	pass

def find_connection(userID):
    my_list=None
    userID=int(userID)
    if db(db.auth_user.id==userID).select()[0].User_Type=="Care Seeker":
        my_list=db.executesql('SELECT first_name, last_name, id, MyPict FROM auth_user WHERE id IN (SELECT Carer FROM WorkWith WHERE CareSeeker={arg1});'.format(arg1=userID))
        #my_list=db(db.WorkWith.CareSeeker==userID).select(db.WorkWith.Carer)
    else:
        #my_list=db(db.WorkWith.Carer==userID).select(db.WorkWith.CareSeeker)
        my_list=db.executesql('SELECT first_name, last_name, id, MyPict FROM auth_user WHERE id IN (SELECT CareSeeker FROM WorkWith WHERE Carer={arg1});'.format(arg1=userID))
    return my_list
    
@auth.requires_login()
def dashboard():
    # find in the workwith table to see if they already have a connection or not
	# return list of forged link here
	return dict()

def feedback():
    return dict()

def find_relations(user_id):
    check=check_type(user_id)
    subscribe=None
    co_worker="Co-Worker"
    same=True
    my_clients=find_connection(user_id)
    if check==1:
        same=False
        subscribe=db((db.WorkWith.Carer==auth.user.id) & (db.WorkWith.CareSeeker==user_id)).select()
    if check==2:
        same=False
        subscribe=db((db.WorkWith.CareSeeker==auth.user.id) & (db.WorkWith.Carer==user_id)).select()
    return subscribe, same, my_clients, co_worker

def rated(userif):
    avg=db.executesql('SELECT AVG("Overall") FROM userCriteria WHERE toUser={id};'.format(id=userif))
    avg_re=db.executesql('SELECT AVG("Reliability") FROM userCriteria WHERE toUser={id};'.format(id=userif))
    avg_pu=db.executesql('SELECT AVG("Punctuality") FROM userCriteria WHERE toUser={id};'.format(id=userif))
    avg_per=db.executesql('SELECT AVG("Personality") FROM userCriteria WHERE toUser={id};'.format(id=userif))
    list_r=db(db.userCriteria.toUser==userif).select()
    return avg, avg_re, avg_pu, avg_per, list_r

@auth.requires_login()
def myProfile():
	value = ""
	user = db(db.auth_user.id == request.args(0)).select().first()
	subscribe, same, my_clients, co_worker=find_relations(request.args(0))
	overall, re, pu, per, comment=rated(user.id)
	if(user.User_Type == "Carer"):
		#change to user.id, but first we need a way to link auth_user and carer/careseeker tables together so that when a user is made, a carer/seeker is also made
		carer = db(db.Carer.UserId == user.id).select().first()
		url = URL('download', args=carer.CV)
		interests = carer.Interests
	elif(user.User_Type == "Care Seeker"):
		#change to user.id, but first we need a way to link auth_user and carer/careseeker tables together so that when a user is made, a carer/seeker is also made
		careseeker = db(db.CareSeeker.UserId == user.id).select().first()
		interests = careseeker.Interests
		url = ''
	return dict(user=user, cvUrl=url, interests = interests, subscribe=subscribe, same=same, my_clients=my_clients, co_worker=co_worker,overall=overall, re=re, pu=pu, per=per, comment=comment)

def mySchedule():
    return dict()
def help():
    return dict()
def search():
    return dict()
def legal():
    return dict()
def privacy():
    return dict()
@auth.requires_login()

def rating():
    form = SQLFORM(db.userCriteria)
    if form.process(session=None, formname='rating').accepted:
        response.flash = 'form accepted'
        redirect(URL("default", "myProfile", args=request.args(0)))
    elif form.errors:
        response.flash = 'form has errors'
    else:
        response.flash = 'please fill the form'
    # Note: no form instance is passed to the view
    return dict(to=request.args(0))
def user():
    
    """
    exposes:
    http://..../[app]/default/user/login
    http://..../[app]/default/user/logout
    http://..../[app]/default/user/register
    http://..../[app]/default/user/profile
    http://..../[app]/default/user/retrieve_password
    http://..../[app]/default/user/change_password
    http://..../[app]/default/user/manage_users (requires membership in
    use @auth.requires_login()
        @auth.requires_membership('group name')
        @auth.requires_permission('read','table name',record_id)
    to decorate functions that need access control
    """
    auth.settings.formstyle = 'bootstrap'
    auth.settings.register_next = URL('settings')
    auth.settings.logged_url = URL('dashboard')

    auth.settings.login_next = URL('dashboard')
    return dict(form=auth())
@cache.action()
def download():
    """
    allows downloading of uploaded files
    http://..../[app]/default/download/[filename]
    """
    return response.download(request, db)


def call():
    """
    exposes services. for example:
    http://..../[app]/default/call/jsonrpc
    decorate with @services.jsonrpc the functions to expose
    supports xml, json, xmlrpc, jsonrpc, amfrpc, rss, csv
    """
    return service()


@auth.requires_signature()
def data():
    """
    http://..../[app]/default/data/tables
    http://..../[app]/default/data/create/[table]
    http://..../[app]/default/data/read/[table]/[id]
    http://..../[app]/default/data/update/[table]/[id]
    http://..../[app]/default/data/delete/[table]/[id]
    http://..../[app]/default/data/select/[table]
    http://..../[app]/default/data/search/[table]
    but URLs must be signed, i.e. linked with
      A('table',_href=URL('data/tables',user_signature=True))
    or with the signed load operator
      LOAD('default','data.load',args='tables',ajax=True,user_signature=True)
    """
    return dict(form=crud())
