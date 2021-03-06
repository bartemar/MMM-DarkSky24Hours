// AngularJS Weather App using Dark Sky Data

var weatherCtrlDef = function($scope, $http, getWeather) {
	
	var darkSkyApiKey = getParamValue('darkSkyApiKey');
	var latitudeLongitude = getParamValue('latitudeLongitude');
	
	// init using global variables
	getWeather.initWeather(darkSkyApiKey, latitudeLongitude);
	
	// wrap load function to be called repeatedly
	var load = function(){
		getWeather.load(function (data){
			$scope.weather = data;
		});
	}
	
	load();
	
	// refresh data every 15 minutes
	setInterval(load, 15 * 60 * 1000);

};

function getParamValue(paramName) {
    var url = window.location.search.substring(1); //get rid of "?" in querystring
    var qArray = url.split('&'); //get key-value pairs
    for (var i = 0; i < qArray.length; i++) 
    {
        var pArr = qArray[i].split('='); //split key and value
        if (pArr[0] == paramName) 
            return pArr[1]; //return value
    }
}

var getWeather = function ($http) {

	// view model
	var weatherService = {
		"darkSkyApiKey" : "",
		"latitudeLongitude" : "",
		"weather" : {
			"now" : { "temp" : "N/A", "icon" : "N/A" },
			"today" : { "min" : "N/A", "max" : "N/A" }, 
			"tomorrow" : { "min" : "N/A", "max" : "N/A" }
		}
	};
	
	weatherService.initWeather = function (darkSkyApiKey, latitudeLongitude) {
	
		weatherService.darkSkyApiKey = darkSkyApiKey;
		weatherService.latitudeLongitude = latitudeLongitude;
		
	};
	
	parseCurrentData = function (now, weatherService){
	
		if(typeof now !== 'undefined' && typeof now.temperature !== 'undefined' && typeof now.icon !== 'undefined'){
			weatherService.weather.now.temp = Math.round(now.temperature);
			weatherService.weather.now.icon = 'img/VCloudsWeatherIcons/' + now.icon + '.png';
		} else {
			console.log('Cannot parse current data as variable "now" is not defined:');
			console.log(now);
		}

	}
	
	parseForecastData = function (today, tomorrow, weatherService){
	
		weatherService.weather.today.min = Math.round(today.temperatureLow);
		weatherService.weather.today.max = Math.round(today.temperatureHigh);
		weatherService.weather.tomorrow.min = Math.round(tomorrow.temperatureLow);
		weatherService.weather.tomorrow.max = Math.round(tomorrow.temperatureHigh);

	}
	
	plot24HourForecast = function (data){
	
		var colorLightGrey = "rgba(220,220,220,0.2)";
		// var colorGrey = "#dcdcdc";
		var colorGrey = "#fff";
		var colorBlueGrey = "rgba(151,187,205,0.2)";
		var colorWhite = "#fff";
		var colorBlue = "#97bbcd";
		
		// internal forecast structure
		var forecastData = {};

		// extract only relevant information
		for (var i in data) {
		
			var forecast = data[i];
			
			forecastData[i] = {
				'hour': new Date(forecast.time*1000).getHours(),
				'temp': forecast.temperature,
				'pop': forecast.precipProbability*100,
				'qpf': forecast.precipIntensity
			};
			
		}
		
		// data sets for graphs per hour (temp, POP, QPF)
		var hours = [];
		var temps = []
		var pops = [];
		var qpfs = [];
		
		var maxTempForecast = -100;
		var minTempForecast = 100;
		
		var maxQpfForecast = -100;

		// iterate through next 24 hours, extra data sets per graph and dynamic scale information
		for (var i = 0; i < 24; i++) {
		
			var forecast = forecastData[i];
		
			hours[i] = forecast.hour;
			temps[i] = forecast.temp;
			pops[i] = forecast.pop;
			qpfs[i] = forecast.qpf;
			
			// get max forecast temp value
			if (forecast.temp > maxTempForecast){
				maxTempForecast = forecast.temp;
			}
			
			// get min forecast temp value
			if (forecast.temp < minTempForecast){
				minTempForecast = forecast.temp;
			}
			
			// get max forecast qpf value
			if (forecast.qpf > maxQpfForecast){
				maxQpfForecast = forecast.qpf;
			}
			
		}
				
		// graphs' data, labels and colors
		
		// temp
		var dataTemp = {
			labels: hours,
			datasets: [
				{
					fillColor: colorLightGrey,
					strokeColor: colorGrey,
					pointColor: colorGrey,
					pointStrokeColor: colorWhite,
					pointHighlightFill: colorWhite,
					pointHighlightStroke: colorGrey,
					data: temps
				}
			]
		};
		
		// POP
		var dataPop = {
			labels: hours,
			datasets: [
				{
					fillColor: colorBlueGrey,
					strokeColor: colorBlue,
					pointColor: colorBlue,
					pointStrokeColor: colorWhite,
					pointHighlightFill: colorWhite,
					pointHighlightStroke: colorBlue,
					data: pops
				}
			]
		};
		
		// QPF
		var dataQpf = {
			labels: hours,
			datasets: [
				{
					fillColor: colorBlueGrey,
					strokeColor: colorBlue,
					pointColor: colorBlue,
					pointStrokeColor: colorWhite,
					pointHighlightFill: colorWhite,
					pointHighlightStroke: colorBlue,
					data: qpfs
				}
			]
		};
		
		// graphs' scale and line options
		
		Chart.defaults.global.animation = false;
		Chart.defaults.global.scaleFontColor= "#fff";

		// temp		
		var stepTemp  = (parseInt(maxTempForecast) - parseInt(minTempForecast)) > 6 ? 2 : 1;
		var maxTemp   = parseInt(maxTempForecast) + 2;
		var startTemp = parseInt(minTempForecast) - 2;
							
		var optionsTemp = {
			bezierCurve : false,
			pointDot : false,				
			scaleOverride: true,
			scaleSteps: Math.ceil((maxTemp-startTemp)/stepTemp),
			scaleStepWidth: stepTemp,
			scaleStartValue: startTemp
			
		};
		
		// POP
		var stepPop  = 20;
		var maxPop   = 100;
		var startPop = 0;
		
		var optionsPop = {
			bezierCurve : false,
			pointDot : false,
			scaleOverride: true,
			scaleSteps: Math.ceil((maxPop-startPop)/stepPop),
			scaleStepWidth: stepPop,
			scaleStartValue: startPop

		};
		
		// QPF
		var stepQpf = 0.5;
		var maxQpf = maxQpfForecast + 1;
		var startQpf = 0;
		
		var optionsQpf = {
			bezierCurve : false,
			pointDot : false,
			scaleOverride: true,
			scaleSteps: Math.ceil((maxQpf-startQpf)/stepQpf),
			scaleStepWidth: stepQpf,
			scaleStartValue: startQpf

		};
		
		// canvas HTML elements to plot graphs
		var ctxTemp = $("#hourlyForecastTemp").get(0).getContext("2d");
		var ctxPop = $("#hourlyForecastPop").get(0).getContext("2d");
		var ctxQpf = $("#hourlyForecastQpf").get(0).getContext("2d");

		// plot graphs
		var chartTemp = new Chart(ctxTemp).Line(dataTemp, optionsTemp);
		var chartPop = new Chart(ctxPop).Line(dataPop, optionsPop);
		var chartQpf = new Chart(ctxQpf).Line(dataQpf, optionsQpf);
		
	}
	
	
	// get weather data from Dark Sky service
	weatherService.load = function (callback) {
		
		var weatherRequest = function() {
			
			var request = {
				method: 'GET',
				url: 'https://api.darksky.net/forecast/' + weatherService.darkSkyApiKey + 
					'/' + weatherService.latitudeLongitude + '?exclude=alerts,flags&lang=de&units=auto'
			}
		
			return request;
		}
		
		var weatherRequestSuccess = function(data, status, headers, config){
		
			// current weather
			var now = data.currently;
			parseCurrentData(now, weatherService);
			
			// weather forecast today and tomorrow
			var today = data.daily.data[0];
			var tomorrow = data.daily.data[1];
			parseForecastData(today, tomorrow, weatherService);
			
			// update user interface
			callback(weatherService.weather);
			
			// plot 24 hour forecast directly
			// 3 graphs (temperature, percentage of rain - pop, amount of rain - qpfs)
			plot24HourForecast(data.hourly.data);
				
		};
		
		var weatherRequestError = function(data, status, headers, config){
		
			weatherService.weather = { 
				"today" : { "min" : "N/A", "max" : "N/A" }, 
				"tomorrow" : { "min" : "N/A", "max" : "N/A" }
			};
			console.log(status);
			console.log(data);
			
		}
	
		$http(weatherRequest()).success(weatherRequestSuccess).error(weatherRequestError);
		
	};
		
	return weatherService;
	
};

angular.module('weather', []).controller('weatherCtrl', weatherCtrlDef).factory('getWeather', getWeather);
