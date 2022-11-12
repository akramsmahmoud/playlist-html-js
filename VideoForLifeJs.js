// Get a handle to the player
var player = document.getElementById('gossVideo');
var btnPlayPause = document.getElementById('btnPlayPause');
var btnMute = document.getElementById('btnMute');
var topProgressBar = document.getElementById('top-progress-bar');
var bottomProgressBar = document.getElementById('bottom-progress-bar');
var PlayButton = document.getElementById("PlayButton");

if (!localStorage.getItem('pauseBtn')){
    localStorage.setItem('endBtn', `<span>&nbsp</span><span><i id="PlayButtonIcon" class="fas fa-redo-alt" aria-hidden="true"></i> &nbsp; Watch Again</span>`)
    localStorage.setItem('playBtn', `<span></span><span><i id="PlayButtonIcon" class="fas fa-pause" aria-hidden="true"></i> &nbsp; You're Watching</span>`)
    localStorage.setItem('initialBtn', `<span>&nbsp</span><span><i id="PlayButtonIcon" class="fas fa-play"></i> &nbsp;Play Video</span>`)
    localStorage.setItem('pauseBtn', `<span>&nbsp</span><span><i id="PlayButtonIcon" class="fas fa-play" aria-hidden="true"></i> keep Watching</span>`)
}

var canvas = document.getElementById('canvasId');
var context = canvas.getContext('2d');

window.addEventListener('load', function() {
    const lastPercentage = localStorage.getItem('lastPercentage');
    if (!lastPercentage || lastPercentage === 0) {
        PlayButton.innerHTML = localStorage.getItem("initialBtn")
    } else if (lastPercentage > 0 && lastPercentage <= 99) {
        updatePauseBtn()
        PlayButton.innerHTML = localStorage.getItem('pauseBtn')
    } else {
        PlayButton.innerHTML = localStorage.getItem('endBtn')        
    }

    // for canvas draw
    if (localStorage.getItem("image")) {
        canvas.style.display = 'inline-block';
        let img = new Image();
        img.src = localStorage.getItem("image");

        img.onload = function () {
            context.drawImage(img, 0, 0);
        };
    }

})


function updatePauseBtn() {
    const lastVideoWatched = JSON.parse(localStorage.getItem('lastVideoWatched'))
    const videoSeason = lastVideoWatched.currentSeason;
    const videoSeries = lastVideoWatched.currentSeries;
    localStorage.setItem('pauseBtn', `<span>Season ${videoSeason+1}</span> <span><i id="PlayButtonIcon" class="fas fa-play" aria-hidden="true"></i> keep Watching</span>`)
    localStorage.setItem('endBtn', `<span>Season ${videoSeason+1}</span><span><i id="PlayButtonIcon" class="fas fa-redo-alt" aria-hidden="true"></i> &nbsp; Watch Again</span>`)

    document.querySelectorAll('.playlist__item--active .playlist__series').forEach(($serie) => {
        const $seriesPreview = $serie.querySelector('.playlist__series-preview');
        if (+$seriesPreview.dataset.seasonIndex === videoSeason && +$seriesPreview.dataset.seriesIndex === videoSeries){
            $serie.classList.add('playlist__series--lastWatched')
        }else{
            $serie.classList.remove('playlist__series--lastWatched')
        }
    })
}



function playPauseVideo($currentVideo, currentSeason, currentSeries) {
    $currentVideo.addEventListener('timeupdate', () => updateProgressBar($currentVideo, currentSeason, currentSeries), false);
    $currentVideo.addEventListener('play', function() {
        PlayButton.innerHTML = localStorage.getItem("playBtn")
    },false)

    $currentVideo.addEventListener('pause', function() {
        updatePauseBtn()
        PlayButton.innerHTML = localStorage.getItem('pauseBtn')
    }, false);

    $currentVideo.addEventListener('ended', function() {
        PlayButton.innerHTML = localStorage.getItem('endBtn')
       // this.pause();
    }, false);


    var element = document.getElementById("PlayButtonIcon");
    if ($currentVideo.paused || $currentVideo.ended) {
        //debugger;
        var isClassExist = hasClass(element, "fa-play");
        if (isClassExist === true) {
            removeClass(element, "fa-play");
            addClass(element, "fa-pause");
            updatePauseBtn()
            PlayButton.innerHTML = localStorage.getItem('pauseBtn')

        }
        $currentVideo.play();
    } else {
        var isClassExist = hasClass(element, "fa-pause");
        if (isClassExist === true) {
            removeClass(element, "fa-pause");
            addClass(element, "fa-play");
            updatePauseBtn()
            PlayButton.innerHTML = localStorage.getItem('pauseBtn')
        }
        //player.pause();
    }
}


function updateProgressBar($currentVideo, currentSeason, currentSeries) {
    var percentage = Math.floor((100 / $currentVideo.duration) * $currentVideo.currentTime);
    const videoCurrentTime = $currentVideo.currentTime
    const currentTopProgressBar = document.querySelector('.modal-player__series--playing #top-progress-bar');
    if(currentTopProgressBar){
        currentTopProgressBar.value = percentage;
        currentTopProgressBar.innerHTML = percentage + '% played';
    }
    
    //Landing Progressbar
    $active_video = document.querySelector('.playlist__series__playing');
    $landingProgressBar = $active_video.querySelector('#top-progress-bar');
    video_title = $active_video.nextElementSibling.innerText;
    $landingProgressBar.value = percentage;
    $landingProgressBar.innerHTML = percentage + '% played';

    let last_registered_percentage = JSON.parse(localStorage.getItem("VideosWatchedPercentage"))
    let season_watched_data = last_registered_percentage ? last_registered_percentage[currentSeason] : {};
    season_watched_data = {
        ...season_watched_data,
        [currentSeries]: { percentage, videoCurrentTime}
    }
    if (last_registered_percentage && last_registered_percentage.hasOwnProperty(currentSeason)) {
        last_registered_percentage[currentSeason] = season_watched_data;
    }else{
        last_registered_percentage = {
            ...last_registered_percentage,
            [currentSeason]: season_watched_data
        }
    }
    localStorage.setItem("VideosWatchedPercentage", JSON.stringify(last_registered_percentage));
    localStorage.setItem("lastVideoWatched", JSON.stringify({ currentSeason, currentSeries, video_title}));
    localStorage.setItem("lastPercentage", percentage);

    canvas.style.display = 'inline-block';
    draw($currentVideo, canvas);
}






function pauseVid() {
    //debugger;
    var percentage = Math.floor((100 / player.duration) * player.currentTime);
    if (percentage > 0 && percentage < 100) {
        var element = document.getElementById("PlayButtonIcon");
        var isClassExist = hasClass(element, "fa-pause");
        if (isClassExist === true) {
            removeClass(element, "fa-pause");
            addClass(element, "fa-play");
            
            PlayButton.innerHTML = localStorage.getItem('playBtn')
        }
    }

    player.pause();
}

function exitFullScreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
}

function hasClass(el, className)
{
    if (el.classList)
        return el.classList.contains(className);
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
}

function addClass(el, className)
{
    if (el.classList)
        el.classList.add(className)
    else if (!hasClass(el, className))
        el.className += " " + className;
}

function removeClass(el, className)
{
    if (el.classList)
        el.classList.remove(className)
    else if (hasClass(el, className))
    {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
        el.className = el.className.replace(reg, ' ');
    }
}
function toggleFullScreen() {


    if (player.requestFullscreen)
        if (document.fullScreenElement) {
            document.cancelFullScreen();
        } else {
            player.requestFullscreen();
        }
    else if (player.msRequestFullscreen)
        if (document.msFullscreenElement) {
            document.msExitFullscreen();
        } else {
            player.msRequestFullscreen();
        }
    else if (player.mozRequestFullScreen)
        if (document.mozFullScreenElement) {
            document.mozCancelFullScreen();
        } else {
            player.mozRequestFullScreen();
        }
    else if (player.webkitRequestFullscreen)
        if (document.webkitFullscreenElement) {
            document.webkitCancelFullScreen();
        } else {
            player.webkitRequestFullscreen();
        }
    else {
        alert("Fullscreen API is not supported");

    }
}


updateVideo1TimeWithBar();

function updateVideo1TimeWithBar() {
    const watched_series_progress = JSON.parse(localStorage.getItem("VideosWatchedPercentage"))
    const link = document.querySelector('[data-link="1"]');
    /* var player = document.getElementById('gossVideo');
    topProgressBar.value = localStorage.getItem("VideoWatchPercentage");
    topProgressBar.innerHTML = localStorage.getItem("VideoWatchPercentage") + '% played';

    player.currentTime = parseFloat(localStorage.getItem("VideoEndedTime")); */

    videoThumbnails.forEach(($thumbnail) => {
        const season = +$thumbnail.dataset.seasonIndex;
        const series = +$thumbnail.dataset.seriesIndex;
        if (watched_series_progress && watched_series_progress[season]){
            if(watched_series_progress[season][series]){
                currentPercentage = watched_series_progress[season][series].percentage;
                $thumbnail.querySelector('#top-progress-bar').value = currentPercentage;
                $thumbnail.querySelector('#top-progress-bar').innerHTML = currentPercentage + '% played';
            }
        }
    });

    videoItems.forEach(($videoItem) => {
        $videoItem.querySelector('video').pause();
        $videoItem.querySelector('video').currentTime = 0;
        const season = +$videoItem.dataset.seasonIndex;
        const series = +$videoItem.dataset.seriesIndex;

        if (watched_series_progress && watched_series_progress[season]) {
            if (watched_series_progress[season][series] && $videoItem.querySelector('video')) {
                $videoItem.querySelector('video').currentTime = parseFloat(watched_series_progress[season][series].videoCurrentTime) || 0;
            }
        }
    });
}

document.getElementById('PlayButton').addEventListener('click', () =>{
    const lastWatchedVideo = JSON.parse(localStorage.getItem('lastVideoWatched'))
    currentSeason = lastWatchedVideo?.currentSeason;
    currentSeries = lastWatchedVideo?.currentSeries;

    if (!currentSeason && !currentSeries){
        playVideo(0,0)
        return;
    }
    playVideo(currentSeason, currentSeries)
})



//canvas
function draw(video, canvas) {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    localStorage.setItem("image", canvas.toDataURL("image/jpg"));
}