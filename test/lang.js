const request = require('supertest');
const app     = require('../server');
const agent   = request.agent(app);
const assert  = require('assert');
let Lang      = require('../helpers/express-multilang'); // default should be english

const messages = {
    'en':{
        'hello': 'Hello',
        'good-morning': 'Good morning !',
    },
    'fr':{
        'hello': 'Salut',
        'good-morning': 'Bonjour !',
    },
    'ar':{
        'hello': 'مرحبا',
        'good-morning': 'صباح الخير',
    }
};

describe('Lang', () => {

    it('should return `en` as default language', () => {
        let lang = new Lang();
        const expected = 'en';
        const actual = lang.config.def;
        assert.equal(actual, expected);
    });

    it('should return the correct key/value', () => {
        let lang = new Lang();
        lang.config.def = 'fr';
        lang.config.messages = messages;
        const expected = 'Salut';
        const actual = lang.translate('hello')
        assert.equal(actual, expected);
    });

    it('should return the key for undefined translations', () => {
        let lang = new Lang();
        lang.config.def = 'ar';
        lang.config.messages = messages;
        const expected = 'this-key-does-not-exist';
        const actual = lang.translate('this-key-does-not-exist');
        assert.equal(actual, expected);
    });

    it('should change the language successfully', async () => {
        let lang = new Lang();
        await agent
        .post('/lang')
        .send({'lang': 'ar'})
        .expect(302)
        .expect('Location', '/');
    });
});