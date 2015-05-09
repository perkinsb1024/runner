var prod = false;
var map = {};
var paths;
var urlArgs;

// Set maps
if(prod) {
    map['*'] = { 'jquery': 'jquery-no-conflict' };
    map['jquery-no-conflict'] = { 'jquery': 'jquery' };  
}

// Set paths
paths = {
    'jquery': 'node_modules/jquery/dist/jquery.min',
    'jquery-no-conflict': 'utilities/jquery-no-conflict',
    'eventemitter2': 'node_modules/eventemitter2/lib/eventemitter2'
};

// Set packages
packages = [
    {
        'name': 'mout',
        'location': 'node_modules/mout/src',
        'main': 'index'
    }
];

if(!prod) {
    urlArgs = "bust=" + (new Date()).getTime()
}

require.config({
    'baseUrl': 'scripts',
    'map': map,
    'paths': paths,
    'packages': packages,
    'urlArgs': urlArgs
});

