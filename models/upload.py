from gluon.tools import Mail
mail = Mail()

def upload(): 
    mail.settings.server = 'logging'
    mail.settings.sender = 'help@careseek.com'
    mail.settings.login = 'help@careseek.com:secret'

    form = SQLFORM.factory(
        Field('name', requires=IS_NOT_EMPTY()),
        Field('email', requires =[ IS_EMAIL(error_message='Invalid email!'), IS_NOT_EMPTY() ]),
        Field('subject', requires=IS_NOT_EMPTY()),
        Field('message', requires=IS_NOT_EMPTY(), type='text')
    )
    if form.process().accepted:
        session.name = XML(form.vars.name, sanitize=True)
        session.email =  form.vars.email
        session.subject =  form.vars.subject
        session.message =  XML(form.vars.message, sanitize=True)
        if mail:
            if mail.send('help@careseek.com', session.subject, "Message from: " + session.name + "\n" + "Message: " + session.message, reply_to=session.email, sender=session.email):
                response.flash = 'Your email has been sent sucessfully.'
            else:
                response.flash = 'failed to send email!'
        else:
            response.flash = 'Unable to send the email'
    elif form.errors:
        response.flash='Please fill out all fields'

    return dict(form=form)
