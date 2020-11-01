const request = require('request');
const apiOptions = {
    server: 'http://localhost:3000'
}
if (process.env.NODE_ENV === 'production') {
    apiOptions.server = 'https://glacial-bayou-57015.herokuapp.com';
}

const showError = (req, res, status) => {
    let title = '';
    let content = '';
    if (status === 404) {
        title = '404, page not found';
        content = 'We can\'t find this page. Sorry.';
    } else {
        title = `${status}, something's gone wrong`;
        content = 'Oops, something has gone wrong.';
    }
    res.status(status);
    res.render('generic-text', {
        title,
        content
    });
}

const formatDistance = (distance) => {
    let thisDistance = 0;
    let unit = ' m';
    if (distance > 1000) {
        thisDistance = parseFloat(distance / 1000).toFixed(1);
        unit = ' km';
    } else {
        thisDistance = Math.floor(distance);
    }
    return thisDistance + unit;
};

const getLocationInfo = (req, res, callback) => {
    const path = `/api/locations/${req.params.locationid}`;
    const requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'GET',
        json: {}
    };
    request(
        requestOptions,
        (err, {statusCode}, body) => {
            const data = body;
            if (statusCode === 200) {
                data.coords = {
                    lng: body.coords[1],
                    lat: body.coords[0],
                };
                callback(req, res, data);
            } else {
                showError(req, res, statusCode);
            }
        }
    );
};

const renderHomepage = (req, res, responseBody) => {
    let message = null;
    if (!(responseBody instanceof Array)) {
        message = "API lookup error";
        responseBody = [];
    } else {
        if (!responseBody.length) {
            message = "No places found nearby";
        }
    }
    res.render('locations-list', {
        title: 'Locator - find a place to work with wifi',
        pageHeader: {
            title: 'Locator',
            strapline: 'Find places to work with wifi near you!'
        },
        sidebar: `Looking for wifi and a seat? Loc8r helps you find places to work when out and about.
            Perhaps with coffee, cake or a pint?
            Let Loc8r help you find the place you're looking for.`,
        locations: responseBody,
        message
    });
};

const hasValidationError = (body) => {
    let result = false;
    if (body.errors) {
        for (const errorKey in body.errors) {
            const error = body.errors[errorKey];
            if (error.name && error.name === 'ValidatorError') {
                result = true;
            }
        }
    }
    return result;
}

/* GET 'home' page */
const homelist = (req, res) => {
    const path = '/api/locations';
    const requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'GET',
        json: {},
        qs: {
            lng: -0.7992599,
            lat: 51.378091,
            maxDistance: 20
        }
    };
    request(requestOptions, (err, {statusCode}, body) => {
        let data = [];
        if (statusCode === 200 && body.length) {
            data = body.map(item => {
                item.distance = formatDistance(item.distance);
                return item;
            });
        } else if (statusCode === 404) {
            data = null;
        }
        renderHomepage(req, res, data);
    })
};

const renderDetailPage = (req, res, location) => {
    res.render('location-info', {
            title: location.name,
            pageHeader: {
                title: location.name,
            },
            sidebar: {
                context: 'is on Locator because it has accessible wifi and space to sit down with your laptop and get some work done.',
                callToAction: 'If you\'ve been and you like it - or if you don\'t - please leave a review to help other people just like you.'
            },
            location
        }
    );
}

/* GET 'Location info' page */
const locationInfo = (req, res) => {
    getLocationInfo(req, res,
        (req, res, data) => renderDetailPage(req, res, data));
};

const renderReviewForm = (req, res, {name}) => {
    console.log(req.query);
    res.render('location-review-form', {
        title: `Review ${name} on Loc8r`,
        pageHeader: { title: `Review ${name}` },
        error: req.query.err
    });
};

/* GET 'Add review' page */
const addReview = (req, res) => {
    getLocationInfo(req, res,
        (req, res, data) => renderReviewForm(req, res, data));
}



const doAddReview = (req, res) => {
    const locationid = req.params.locationid;
    const path = `/api/locations/${locationid}/reviews`;
    const postdata = {
        author: req.body.name,
        rating: parseInt(req.body.rating, 10),
        reviewText: req.body.review
    };
    const requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'POST',
        json: postdata
    };
    if (!postdata.author || !postdata.rating || !postdata.reviewText) {
        res.redirect(`/location/${locationid}/review/new?err=val`);
    } else {
        request(
            requestOptions,
            (err, {statusCode}, body) => {
                const name = body.name;
                if (statusCode === 201) {
                    res.redirect(`/location/${locationid}`);
                } else if (statusCode === 400 && hasValidationError(body)) {
                    res.redirect(`/location/${locationid}/review/new?err=val`);
                } else {
                    showError(req, res, statusCode);
                }
            }
        );
    }
}

module.exports = {
    homelist,
    locationInfo,
    addReview,
    doAddReview,
}
