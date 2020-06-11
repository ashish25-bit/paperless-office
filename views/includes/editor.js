const add_sign = document.querySelector('.add_sign')
const pwd_con = document.querySelector('.pwd_con_sign')
const pwd = document.querySelector('.sign_pwd')
const content = document.querySelector('.doc_content')
const share = document.querySelector('.share_doc')
const edit = document.querySelector('.edit_dd')
const save = document.querySelector('.save_content')
let room
const socket = io()

{
    pwd_con.style.display = 'none'
    room = share.getAttribute('data-doc-id')
    socket.emit('joinDocRoom' , room)
    $.ajax({
        url : '/get/document/content',
        method : 'GET',
        data: { id: room },
        success : (response) => {
            content.innerHTML = response[0].Content
        }
    })
}

add_sign.addEventListener('click', () => pwd_con.style.display = 'block' )
document.querySelector('.cancel_sign').addEventListener('click' , () => {
    pwd_con.style.display = 'none' 
    $('.wrong_pwd').html('') 
})

save.addEventListener('click' , saveDoc)

function saveDoc() {
    det = {
        room : room,
        content : content.innerHTML
    }
    $.ajax({
        url : '/saveDoc',
        method : 'POST',
        data: det,
        success : (response) => {
            console.log(response)
        }
    })
}

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
                    var img = document.createElement("img")
                    img.src = img_src
                    img.setAttribute('contenteditable' , 'true')
                    img.classList.add('signed_img')
                    content.appendChild(img)
                }
            }
        })
    }
})

// edit document details
if(edit!= null) {
    edit.addEventListener('click' , () => {
        
    })
}

content.addEventListener('keyup' , event => {
    if(event.key == 'Escape') {
        event.preventDefault()
        preContent = document.createTextNode(content.innerHTML)
    }
    else 
        socket.emit('docContent',content.innerHTML) 
        
})

// get the message 
socket.on('message' , msg => content.innerHTML = msg)