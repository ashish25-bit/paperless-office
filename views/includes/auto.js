window.onerror = function() {
	console.log(arguments)
}

let delay = 400
const input = document.querySelector('.key')
const result = document.querySelector('.companies')
let ajax = new XMLHttpRequest()
let lastKeyUp = 0
let cb
let company

input.onkeyup = function(e) {
	lastKeyUp = e.timeStamp;
	if (e.timeStamp - lastKeyUp > delay) 
		doSearch()
	else 
		cb = setTimeout(doSearch, delay)
}

function doSearch() {
	ajax.open("GET", "https://autocomplete.clearbit.com/v1/companies/suggest?query=:" + input.value.trim(), true);
		ajax.onload = function() {
			var ans = ''
			JSON.parse(ajax.responseText).map(function(i) {
				ans += '<div class="company"><div class="company_logo">'
				console.log(i)
				if (!i.logo) {
					i.logo = 'http://dummyimage.com/128x128?text=No%20Logo'
				};
				ans += '<img src="' + i.logo + '" alt = ' + i.name +'/>'
				ans += '</div>'
				ans += '<div class="company_name">'
				ans += '<p>' + ((i.name) ? i.name : i.domain) + '</p>'
				ans += '</div></div>'
			})
			result.innerHTML = ans
			company = document.querySelectorAll('.company')

			company.forEach((element,index) => {
				element.addEventListener('click' , () => {
					input.value = document.querySelectorAll('.company_name p')[index].innerHTML
					result.innerHTML = ''
				})
			})

		}
		ajax.send()
}

doSearch();
