var ground = require('ground');
var papi = ground.api('papi');

var express = require('express');
var exphbs = require('express-handlebars');
var app = express();

app.use(express.static('public'));

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
    papi.get({type: 'playlist', id: 100000003641597, full: false})
        .then(function (data) {
            var list = data.result.regions.handRankedVideos.modules[0].modules;
            var main_id = "";
            for(var v in list) {
                if( list[v].rank == 1 ) {
                    main_id = list[v].data_id;
                    delete list[v];
                }
            }
            // var first_video = data.result.regions.handRankedVideos.modules[0].modules.splice(0,1);
            res.render('index', {
                'videos': data.result.regions.handRankedVideos.modules[0].modules,
                'main_id': main_id
            });
        });
});

/**
 *  Takes a duration in seconds and formats it as a string
 *  HH:MM:SS
 *  (taken from VHS)
 */
function formatDuration(duration) {
    var sec_num = parseInt(duration, 10);
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);
    var time = '';

    if (hours) {
        time = hours + ':';
        time += ("0" + minutes).slice(-2) + ':';
    } else if (minutes) {
        time += minutes + ':';
    } else {
        time = '00:';
    }

    time += ("0" + seconds).slice(-2);

    return time;
}

app.get('/video/:id', function(req, res){
    papi.get({type: 'video', id: req.params.id, full: true})
        .then(function(data){
            if (!data.result ||
                !data.result.promotional_media) {
                res.status(404).send('Video Not Found');
            };
            res.send({
                title: data.result.headline,
                description: data.result.summary,
                duration: formatDuration(data.result.video.duration/1000),
                thumb: data.result.promotional_media.image.image_crops.videoSixteenByNine540.url,
                cover: data.result.promotional_media.image.image_crops.jumbo.url
            });
        });
})

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
