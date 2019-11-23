
let Lang = require('../helpers/express-multilang'); // default should be english

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

describe('', () => {

    it('should return `en` as default language', () => {
        let lang = new Lang();
        const expected = 'en';
        console.log('lang.config: ', lang.config);
        const actual = lang.config.def;
        expect(expected).toBe(actual);
    });

    it('should return the correct key/value', () => {
        let lang = new Lang();
        lang.config.def = 'fr';
        lang.config.messages = messages;
        const expected = 'Salut';
        const actual = lang.translate('hello')
        expect(expected).toBe(actual);

    });

    it('should return the key for undefined translations', () => {
        let lang = new Lang();
        lang.config.def = 'ar';
        lang.config.messages = messages;
        const expected = 'this-key-does-not-exist';
        const actual = lang.translate('this-key-does-not-exist');
        expect(expected).toBe(actual);
    });
});