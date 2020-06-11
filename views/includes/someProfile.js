let id
let connect_status
const connect_btn = document.querySelector('.connect_btn')

getConnection()

function getConnection() {
    id_profile = document.querySelector('.profile_id')
    index = id_profile.innerHTML.lastIndexOf("/")
    id = parseInt(id_profile.innerHTML.substring(index + 1))
    ids = {master : id}

    $.ajax({
        url : '/get_connection',
        method : 'GET',
        data : ids,
        success : (response) => {
            if(response.length > 0) {
                connect_status = 1
                connect_btn.innerHTML = 'Connected'
                connect_btn.classList.add('connected')
            }
        }
    })
}

$('.connect_btn').on('click' , () => {
    if(!connect_status) {
        ids = {master : id}
        
        $.ajax({
            url : '/connect',
            method : 'POST',
            data : ids,
            success : (response) => {
                console.log(response)
                connect_btn.innerHTML = 'Connected'
                connect_btn.classList.add('connected')
            }
        })
    }

    else{
        ids = {
            master : id
        }

        $.ajax({
            url : '/disconnect',
            method : 'GET',
            data : ids,
            success : (response) => {
                console.log(response)
                connect_btn.innerHTML = 'Connect'
                connect_btn.classList.remove('connected')
            }
        })

    }
})