import request from 'request';
import crypto from 'crypto';


export const getToken = async () => {
    var clientID = '11b20ec4acf74c28bbed53a6cc338961'
    var clientSecret = '5db765b3cd9e43249df8629a03b738e8'


    var options = {
        method: 'POST',
        url: 'https://oauth.fatsecret.com/connect/token',
        auth: {
            user: clientID,
            password: clientSecret
        },
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        form: {
            'grant_type': 'client_credentials',
            'scope': 'basic'
        },
        json: true
    };

    request('', options, function (error, response, body) {
        if (error) throw new Error(error);

        const a = crypto.createHmac('sha1', clientSecret)
            .update(clientID)
            .digest('base64url')

        if (body) {
            request('', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + body['access_token']
                },
                url: `https://platform.fatsecret.com/rest/server.api?oauth_consumer_key=11b20ec4acf74c28bbed53a6cc338961&oauth_nonce=dmj&oauth_timestamp=${Date.now()}&oauth_signature=${a}&oauth_signature_method=HMAC-SHA1&method=foods.search&search_expression=cheeze&format=json&region=RU&language=ru`,
            }, (error, response, body) => {
                console.log(body);
            })
        }
    });
}
