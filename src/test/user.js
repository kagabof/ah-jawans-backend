/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-named-as-default-member */
/* eslint-disable import/no-named-as-default */
/* eslint-disable import/no-extraneous-dependencies */
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../index';
import models from '../models';
import Tokenizer from '../helpers/tokenGenerator';

const { User } = models;
const { generateToken } = Tokenizer;

chai.use(chaiHttp);
chai.should();

let tokenGen;
let userGen;

describe('users', () => {
  it('Get welcome message', (done) => {
    chai.request(app)
      .get('/')
      .end((req, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('message').eql('Welcome to Authors Haven');
        done();
      });
  });

  it('A new user who filled all required data should be registered', (done) => {
    const user = { username: 'Kagabo',
      email: 'kagabo@gmail.com',
      password: 'Kagabo1@', };
    chai.request(app)
      .post('/api/users')
      .send(user)
      .end((req, res) => {
        res.should.have.status(201);
        res.body.should.be.an('object');
        res.body.user.should.have.property('username');
        res.body.user.should.have.property('email');
        res.body.user.should.have.property('token');
        done();
      });
  });

  it('A new user who filled all required data with an email that exists in the system should not signup', (done) => {
    const user = { username: 'Kagabo',
      email: 'kagabo@gmail.com',
      password: 'Kagabo1@', };
    chai.request(app)
      .post('/api/users')
      .send(user)
      .end((req, res) => {
        res.should.have.status(409);
        res.body.should.be.an('object');
        res.body.should.have.property('message');
        done();
      });
  });

  it('User should be able to sign in', (done) => {
    const user = { email: 'kagabo@gmail.com',
      password: 'Kagabo1@' };
    chai.request(app)
      .post('/api/users/login')
      .send(user)
      .end((req, res) => {
        res.should.have.status(200);
        res.body.data.should.be.an('object');
        res.body.data.should.have.property('email');
        res.body.data.should.have.property('token');
        done();
      });
  });

  it('Invalid email', (done) => {
    const user = { email: 'kagabo1@gmail.com',
      password: 'Kagabo1@' };
    chai.request(app)
      .post('/api/users/login')
      .send(user)
      .end((req, res) => {
        res.should.have.status(403);
        done();
      });
  });

  it('Invalid Password', (done) => {
    const user = { email: 'kagabo@gmail.com',
      password: 'Kagabo1@3' };
    chai.request(app)
      .post('/api/users/login')
      .send(user)
      .end((req, res) => {
        res.should.have.status(403);
        done();
      });
  });

  it('should test when the email does not exist', (done) => {
    const data = { email: 'michfewael@andela.com' };
    chai.request(app)
      .post('/api/users/passwordreset')
      .send(data)
      .end((error, res) => {
        res.should.have.status(404);
        done();
      });
  });
  //
  it('should test the email that exists before sending link to reset password', (done) => {
    chai.request(app)
      .post('/api/users/passwordreset')
      .send({ email: 'kagabo@gmail.com' })
      .end((error, res) => {
        // eslint-disable-next-line prefer-destructuring
        tokenGen = res.body.token;
        res.should.have.status(200);
        done();
      });
  });

  it('should change the password', (done) => {
    chai.request(app)
      .post(`/api/users/passwordreset/${tokenGen}`)
      .send({ password: 'Dumnh@1425' })
      .end((error, res) => {
        res.should.have.status(200);
        res.body.should.have.property('message');
        done();
      });
  });

  it('should not change the password because of the wrong token', (done) => {
    chai.request(app)
      .post('/api/users/passwordreset/hgd')
      .send({ password: '12345678' })
      .end((req, res) => {
        res.should.have.status(500);
        res.body.should.have.property('error');
        done();
      });
  });

  it('should not signup with bad password', (done) => {
    const data = { username: 'kagabo',
      password: 'Fofo1',
      email: 'fofo@gmail.com' };
    chai.request(app)
      .post('/api/users')
      .send(data)
      .end((req, res) => {
        res.should.have.status(400);
        res.body.errors[0].password.should.have.be.eql('Password is required and should look like: Example1@');
        res.should.be.json;
        done();
      });
  });

  it('should no signup with bad email', (done) => {
    const data = { username: 'kagabo',
      password: 'Fofo1@',
      email: 'fofogmail.com' };
    chai.request(app)
      .post('/api/users')
      .send(data)
      .end((req, res) => {
        res.should.have.status(400);
        res.body.errors[0].email.should.be.eql('Email is required and should look like: example@example.com!');
        res.should.be.json;
        done();
      });
  });

  it('bad email and password on signup', (done) => {
    const data = { username: 'kagabo',
      password: 'Fofo1',
      email: 'fofogmail.com' };
    chai.request(app)
      .post('/api/users')
      .send(data)
      .end((req, res) => {
        res.should.have.status(400);
        res.body.errors[0].email.should.be.eql('Email is required and should look like: example@example.com!');
        res.body.errors[0].password.should.be.eql('Password is required and should look like: Example1@');
        res.should.be.json;
        done();
      });
  });
  it('should no signup with bad username', (done) => {
    const data = { username: '',
      password: 'Fofo1@',
      email: 'fofo@gmail.com' };
    chai.request(app)
      .post('/api/users')
      .send(data)
      .end((req, res) => {
        res.should.have.status(400);
        res.body.errors[0].should.have.property('username');
        res.should.be.json;
        done();
      });
  });

  it('should no signup with bad firstName', (done) => {
    const data = { username: '',
      password: 'Fofo1@',
      email: 'fofo@gmail.com',
      firstName: 'dfrh44' };
    chai.request(app)
      .post('/api/users')
      .send(data)
      .end((req, res) => {
        res.should.have.status(400);
        res.body.errors[0].should.have.property('firstName');
        res.should.be.json;
        done();
      });
  });

  it('should no signup with bad lastName', (done) => {
    const data = { username: 'heyefgs',
      password: 'Fofo1@',
      email: 'fofo@gmail.com',
      lastName: 'ghfd4' };
    chai.request(app)
      .post('/api/users')
      .send(data)
      .end((req, res) => {
        res.should.have.status(400);
        res.body.errors[0].should.have.property('lastName');
        res.should.be.json;
        done();
      });
  });
});

// user Profile
describe('User Profile view amend', () => {
  before('Before any test, Create A new user', async () => {
    await models.User.destroy({ where: { email: 'shaluchandwani@gmail.com' },
      truncate: false });
  });

  it('creating new user', (done) => {
    const user = { username: 'shaluchandwani',
      email: 'shaluchandwani@gmail.com',
      password: 'Shalu@1993', };
    chai.request(app)
      .post('/api/users')
      .send(user)
      .end((req, res) => {
        res.should.have.status(201);
        res.body.should.be.an('object');
        res.body.user.should.have.property('username');
        res.body.user.should.have.property('email');
        res.body.user.should.have.property('token');
        userGen = user.username;
        done();
      });
  });

  it('User should be able to sign in', (done) => {
    const user = { email: 'shaluchandwani@gmail.com',
      password: 'Shalu@1993' };
    chai.request(app)
      .post('/api/users/login')
      .send(user)
      .end((req, res) => {
        res.should.have.status(200);
        res.body.data.should.be.an('object');
        res.body.data.should.have.property('email');
        res.body.data.should.have.property('token');
        // eslint-disable-next-line prefer-destructuring
        tokenGen = res.body.data.token;
        done();
      });
  });

  it('should allow user to see his/her profile after creation', (done) => {
    chai.request(app)
      .get(`/api/user/${userGen}`)
      .end((req, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        done();
      });
  });

  it('should throw error if the username doesnot exists', (done) => {
    chai.request(app)
      .get(`/api/user/${userGen}iiiiii`)
      .end((req, res) => {
        res.should.have.status(404);
        res.body.should.be.an('object');
        done();
      });
  });

  it('should throw error if the username is not valid', (done) => {
    chai.request(app)
      .get('/api/user/!!!!!!!')
      .end((req, res) => {
        res.should.have.status(401);
        res.body.should.be.an('object');
        done();
      });
  });

  it('User should be able to update his/her profile', (done) => {
    chai.request(app)
      .patch(`/api/users/${userGen}`)
      .set('token', tokenGen)
      .send({ id: 5,
        username: 'shaluchandwani',
        firstName: 'Shalu',
        lastName: 'chandwani',
        email: 'shaluchandwani@gmail.com',
        bio: null,
        image: 'https://lh6.googleusercontent.com/-sZOpms2mUso/AAAAAAAAAAI/AAAAAAAAAgY/qI2F0nXUaU8/photo.jpg',
        following: null,
        socialId: null,
        password: 'Shalu@99999',
        createdAt: '2019-07-11T09:30:05.618Z',
        updatedAt: '2019-07-11T09:30:05.618Z',
        dateOfBirth: null,
        gender: null,
        provider: null,
        role: null })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        done();
      });
  });


  it('User should not be able to update his/her profile if token is not present', (done) => {
    chai.request(app)
      .patch(`/api/users/${userGen}`)
      .send({ username: 'changename',
        bio: 'changing bio' })
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.be.an('object');
        done();
      });
  });
});

describe('SignOut', () => {
  before(async () => {
    const user = { username: 'Joseph',
      email: 'joseph@gmail.com',
      password: 'joseph@123', };

    const newUser = await User.create(user);

    tokenGen = await generateToken({ id: newUser.id });
  });

  it('user should logout with a valid token', (done) => {
    chai
      .request(app)
      .post('/api/users/logout')
      .set('token', tokenGen)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.message.should.be.a('string');
        done();
      });
  });
  it('Token is missing', (done) => {
    chai
      .request(app)
      .post('/api/users/logout')
      .set('token', ' ')
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
});