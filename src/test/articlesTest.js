import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../index';

chai.use(chaiHttp);
chai.should();

let tokens = ' ';
const tokens1 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImZhdXN0aW5rYWdhYm8xMUBnbWFpbC5jb20iLCJpYXQiOjE1NjMxMDE5NTYsImV4cCI6MTU2MzI3NDc1Nn0.33LK5oq_7jD-aUbAvY6XTeWNZ-GgaFdibNivPNKQgvA';

describe('Article', () => {
  it('A new user who filled all required data should be registered in order to create an article', (done) => {
    const user = { username: 'ffff',
      password: 'Fofo1@hjsd',
      email: 'faustinkagabo1@gmail.com' };
    chai.request(app)
      .post('/api/users')
      .send(user)
      .end((req, res) => {
        res.should.have.status(201);
        res.body.should.be.an('object');
        res.body.user.should.have.property('username');
        res.body.user.should.have.property('email');
        res.body.user.should.have.property('token');
        tokens = res.body.user.token;
        done();
      });
  });

  it('it should create an article', (done) => {
    const article = { title: 'hello man, how was the night',
      body: 'hello man, how was the night',
      description: 'hello man, how was the night' };
    chai.request(app)
      .post('/api/articles')
      .set('token', tokens)
      .send(article)
      .end((req, res) => {
        res.should.have.status(201);
        res.body.should.be.an('object');
        res.body.should.have.property('message').eql('The article successfully created!');
        done();
      });
  });

  it('it should not create an article with a no title', (done) => {
    const article = { body: 'hello man, how was the night',
      description: 'hello man, how was the night' };
    chai.request(app)
      .post('/api/articles')
      .set('token', tokens)
      .send(article)
      .end((req, res) => {
        res.should.have.status(400);
        res.body.should.be.an('object');
        res.body.errors[0].should.have.property('title');
        done();
      });
  });

  it('it should not create an article with no body', (done) => {
    const article = { title: 'Hello how are u',
      description: 'Nzube is the best jhgwus wdajhb adsf' };
    chai.request(app)
      .post('/api/articles')
      .set('token', tokens)
      .send(article)
      .end((req, res) => {
        res.should.have.status(400);
        res.body.should.be.an('object');
        res.body.errors[0].should.have.property('body');
        done();
      });
  });

  it('it should not create an article with no description', (done) => {
    const article = { title: 'Hello how are u',
      body: 'hello man, how was the night', };
    chai.request(app)
      .post('/api/articles')
      .set('token', tokens)
      .send(article)
      .end((req, res) => {
        res.should.have.status(400);
        res.body.should.be.an('object');
        res.body.errors[0].should.have.property('description');
        done();
      });
  });

  it('it should not create an article with a bad token', (done) => {
    const article = { title: 'hello man, how was the night',
      body: 'hello man, how was the night',
      description: 'hello man, how was the night' };
    chai.request(app)
      .post('/api/articles')
      .set('token', 'tokens')
      .send(article)
      .end((req, res) => {
        res.should.have.status(401);
        res.body.should.be.an('object');
        res.body.should.have.property('message');
        done();
      });
  });

  it('it should not create an article with bad token', (done) => {
    const article = { title: 'hello man, how was the night',
      body: 'hello man, how was the night',
      description: 'hello man, how was the night' };
    chai.request(app)
      .post('/api/articles/')
      .set('token', tokens1)
      .send(article)
      .end((req, res) => {
        res.should.have.status(401);
        res.body.should.be.an('object');
        res.body.should.have.property('message');
        done();
      });
  });

  it('it should not update an article', (done) => {
    const article = { title: 'hello man, how was the night',
      body: 'hello man, how was the night',
      description: 'hello man, how was the night' };
    chai.request(app)
      .patch('/api/articles/1')
      .set('token', tokens)
      .send(article)
      .end((req, res) => {
        res.should.have.status(201);
        res.body.should.be.an('object');
        res.body.should.have.property('message').eql('The article successfully updated!');
        done();
      });
  });

  it('it should not update an article with no title, description or body', (done) => {
    const article = {};
    chai.request(app)
      .patch('/api/articles/1')
      .set('token', tokens)
      .send(article)
      .end((req, res) => {
        res.should.have.status(201);
        res.body.should.be.an('object');
        res.body.should.have.property('message').eql('The article successfully updated!');
        done();
      });
  });

  it('It should get all articles', (done) => {
    chai.request(app)
      .get('/api/articles')
      .set('token', tokens)
      .end((req, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.articles[0].should.have.property('title').eql('hello man, how was the night');
        done();
      });
  });

  it('It should get all articles', (done) => {
    chai.request(app)
      .get('/api/articles/1')
      .set('token', tokens)
      .end((req, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.article.should.have.property('title').eql('hello man, how was the night');
        done();
      });
  });

  it('It should delete an article', (done) => {
    chai.request(app)
      .delete('/api/articles/1')
      .set('token', tokens)
      .end((req, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('message').eql('Article Succesfully deleted!');
        done();
      });
  });

  it('It should not delete an article two times', (done) => {
    chai.request(app)
      .delete('/api/articles/1')
      .set('token', tokens)
      .end((req, res) => {
        res.should.have.status(404);
        res.body.should.be.an('object');
        res.body.should.have.property('message').eql('Article not found in the system!');
        done();
      });
  });

  it('It should not delete an article two times', (done) => {
    chai.request(app)
      .delete('/api/articles/f')
      .set('token', tokens)
      .end((req, res) => {
        res.should.have.status(500);
        res.body.should.be.an('object');
        res.body.should.have.property('error').eql('Internal server error!');
        done();
      });
  });
});