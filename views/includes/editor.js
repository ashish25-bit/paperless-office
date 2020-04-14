const add_sign = document.querySelector('.add_sign')
const pwd_con = document.querySelector('.pwd_con_sign')
const pwd = document.querySelector('.sign_pwd')
const  content = document.querySelector('.doc_content')
const share = document.querySelector('.share_doc')
const profile_photo = document.querySelectorAll('.profile_photo')
let id_logged_user

{
    pwd_con.style.display = 'none'
    getDP()
}

// get details
function getDP(){
    $.ajax({
        url : '/get_details',
        method : 'GET',
        success : (response) => {
            id_logged_user = response[0]['id']
            if(response[0]['DP'] == null)
                    profile_photo[0].src = '/uploads/download.png'
            else 
                    profile_photo[0].src = '/uploads/' + response[0]['DP']
        }
    })
}

add_sign.addEventListener('click', () => pwd_con.style.display = 'block' )
document.querySelector('.cancel_sign').addEventListener('click' , () => {
    pwd_con.style.display = 'none' 
    $('.wrong_pwd').html('') 
})


/*
share.addEventListener('click', () =>{
    preContent = document.createTextNode(content.innerHTML)
    pre = document.createElement('pre')
    content.innerHTML = ''
    pre.append(preContent)
    content.appendChild(pre)
    content.setAttribute('contenteditable' , 'false')
})
*/

document.querySelector('.fetch_sign').addEventListener('click' , () => {
    if(pwd.value == '')
        alert('Enter Password...')
    else {
        $.ajax({
            url : '/fetch_sign',
            method : 'GET',
            data : {pwd : pwd.value},
            success : (response) => {
                if(response == 'Password is wrong')
                    $('.wrong_pwd').html(response)
                else{
                    pwd_con.style.display = 'none'
                    img_src = `/signature/${response}`
                    var div = document.createElement('div')
                    var img = document.createElement("img")
                    img.src = img_src
                    img.classList.add('signed_img')
                    div.setAttribute('contenteditable' , 'false')
                    div.append(img)
                    content.appendChild(div)
                }
            }
        })
    }
})

const socket = io()