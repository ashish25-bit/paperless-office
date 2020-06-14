const update = document.querySelectorAll('.update')
const option_update = document.querySelectorAll('.option_update')
let previousIndex = 0
const comp = document.querySelector('.comp')
const pos = document.querySelector('.pos')
const old_pwd = document.querySelector('.update_pwd')
const new_pwd = document.querySelector('.new_pwd')
const con_new_pwd = document.querySelector('.confirm_new_pwd')
let img = document.querySelector('.update_profile_photo_con img')

let delay = 400
const input = document.querySelector('.key')
const result = document.querySelector('.companies_update')
let ajax = new XMLHttpRequest()
let lastKeyUp = 0
let cb
let company

{
    display_none()
    update[0].style.display = 'block'
    get_details()
}

window.onerror = function () {
    console.log(arguments)
}

option_update.forEach((element, index) => {
    element.addEventListener('click', () => {
        $('.det_update_msg').html('')
        $('.pwd_update_msg').html('')
        update[previousIndex].style.display = 'none'
        option_update[previousIndex].classList.remove('active_option_update')
        previousIndex = index
        update[index].style.display = 'block'
        option_update[index].classList.add('active_option_update')
    })
})


function display_none() {
    for (i = 0; i < update.length; i++)
        update[i].style.display = 'none'
}

input.onkeyup = function (e) {
    lastKeyUp = e.timeStamp
    if (e.timeStamp - lastKeyUp > delay)
        doSearch()
    else
        cb = setTimeout(doSearch, delay)
}

function doSearch() {
    ajax.open("GET", "https://autocomplete.clearbit.com/v1/companies/suggest?query=:" + input.value.trim(), true);
    ajax.onload = function () {
        var ans = ''
        JSON.parse(ajax.responseText).map(function (i) {
            ans += '<div class="company"><div class="company_logo">'
            if (!i.logo) {
                i.logo = 'http://dummyimage.com/128x128?text=No%20Logo'
            };
            ans += '<img src="' + i.logo + '"/>'
            ans += '</div>'
            ans += '<div class="company_name">'
            ans += '<p>' + ((i.name) ? i.name : i.domain) + '</p>'
            ans += '</div></div>'
        })
        result.innerHTML = ans
        company = document.querySelectorAll('.company')

        company.forEach((element, index) => {
            element.addEventListener('click', () => {
                input.value = document.querySelectorAll('.company_name p')[index].innerHTML
                result.innerHTML = ''
            })
        })

    }
    ajax.send()
}

// update the details
$('.update_det').on('click', () => {
    if (comp.value == '' || pos.value == '')
        alert('Enter All Fields')
    else {
        det = {
            name: name.value,
            company: input.value,
            position: pos.value
        }
        $.ajax({
            url: '/update_details',
            method: 'POST',
            data: det,
            success: (response) => {
                $('.det_update_msg').html(response)
            }
        })
    }
})

//password update 
$('.update_pwd_btn').on('click', e => {
    e.preventDefault()
    if (old_pwd.value == '' || new_pwd.value == '' || con_new_pwd.value == '')
        alert('Enter all fields')
    else {
        if (new_pwd.value == con_new_pwd.value) {
            pass = {
                old: old_pwd.value,
                pwd: new_pwd.value
            }
            $.ajax({
                url: '/api/update_pwd',
                method: 'POST',
                data: pass,
                success: (response) => {
                    $('.pwd_update_msg').html(response)
                    old_pwd.value = ''
                    new_pwd.value = ''
                    con_new_pwd.value = ''
                }
            })
        }
        else
            $('.pwd_update_msg').html("Password entered doesn't match")
    }
})

//get request 
function get_details() {
    $.ajax({
        url: '/api/get_details',
        method: 'GET',
        success: (response) => {
            comp.value = response[0]['Company']
            pos.value = response[0]['Position']
            if (response[0]['DP'] == null)
                img.src = 'uploads/download.png'
            else
                img.src = 'uploads/' + response[0]['DP']
        }
    })
}