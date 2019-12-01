const request = require('supertest');
const app     = require('../server');
const agent   = request.agent(app);
const assert  = require('assert');

describe('Lang', () => {


    it.only('should return the correct key/value in English as default language', async () => {
        const res = await request(app).get('/');
        assert.equal(res.__('home'), 'Home');
    });

    it('should return the correct key/value in Arabic', async () => {
        const res = await request(app)
        .post('/lang')
        .send({
            'lang': 'ar'
        })
        .expect(302)
        .expect('Location', '/');
        assert.equal(res.__('home'), 'الرئيسية');
    });

    it('should return the correct key/value in French', async () => {
        const res = await request(app)
        .post('/lang')
        .send({
            'lang': 'fr'
        })
        .expect(302)
        .expect('Location', '/');
        assert.equal(res.__('home'), 'Accueil');
    });
});