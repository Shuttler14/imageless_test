/**
 * MNWeather — OpenWeatherMap Integration Singleton
 * Caches results in localStorage (30min TTL)
 */
(function(){
'use strict';
var MW=window.MNWeather={};
var CACHE_KEY='mn_weather_cache';
var CACHE_TTL=30*60*1000;
var API_KEY=null;

MW.init=function(key){API_KEY=key;};
MW.fetch=function(city,cb){
  if(!API_KEY){cb({temp:28,desc:'Clear Sky',icon:'☀️',city:city});return;}
  var cached=getCache(city);
  if(cached){cb(cached);return;}
  fetch('https://api.openweathermap.org/data/2.5/weather?q='+encodeURIComponent(city)+'&units=metric&appid='+API_KEY)
    .then(function(r){return r.json();})
    .then(function(d){
      if(d.cod!==200){cb({temp:28,desc:'Clear Sky',icon:'☀️',city:city});return;}
      var data={
        temp:Math.round(d.main.temp),
        desc:d.weather[0].description,
        icon:weatherIcon(d.weather[0].main),
        city:city,
        humidity:d.main.humidity,
        wind:d.wind.speed
      };
      setCache(city,data);
      cb(data);
    })
    .catch(function(){cb({temp:28,desc:'Clear Sky',icon:'☀️',city:city});});
};
function weatherIcon(main){
  var map={Clear:'☀️',Clouds:'☁️',Rain:'🌧️',Drizzle:'🌦️',Thunderstorm:'⛈️',Snow:'❄️',Mist:'🌫️',Haze:'🌫️',Fog:'🌫️'};
  return map[main]||'🌤️';
}
function getCache(city){
  try{var c=JSON.parse(localStorage.getItem(CACHE_KEY)||'{}');
    if(c[city]&&Date.now()-c[city].ts<CACHE_TTL)return c[city].data;
  }catch(e){}return null;
}
function setCache(city,data){
  try{var c=JSON.parse(localStorage.getItem(CACHE_KEY)||'{}');
    c[city]={data:data,ts:Date.now()};
    localStorage.setItem(CACHE_KEY,JSON.stringify(c));
  }catch(e){}
}
})();
