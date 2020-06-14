let connect_status = []

{
    // to get the notification of the connections
    getconn()

    // to get the people you may know
    id = []
    $.ajax({
        url : '/api/people_you_may_know',
        method : 'GET',
        success : (response) => {
            p = '<p style="text-align:center;background:white;padding:5px 0;">People you may know</p>'
            response.forEach(element => {
                p += '<div class="people_con">'
                img = ''
                img = element.DP == null ? 'uploads/download.png' : `uploads/${element.DP}`
                p += `<div class="p_name_img">
                <img src="${img}" width="40px">
                <span>${element.Name}</span></div>`
                p += `<p class="p_comp">${element.Company}</p>`
                p += '<button class="connect_btn">Connect</button>'
                p += '</div>'
                id.push(element.id)
                connect_status.push(0)
            })

            $('.people_you_may_know_con').html(p)
            

            connect_btn = document.querySelectorAll('.connect_btn')

            $.ajax({
                url : `/api/get_connections/${id_logged_user}`,
                method : 'GET',
                success : (response) => {
                    response.forEach(element => {
                        i = id.indexOf(element.master)
                        connect_btn[i].innerHTML = 'Connected'
                        connect_btn[i].classList.add('connected')
                        connect_status[i] = 1
                    })
                }
            })

            connect_btn.forEach((element,index) => {
                element.addEventListener('click' , () => {
                    
                    ids = {master : id[index]}

                    if(!connect_status[index]){
                        $.ajax({
                            url : '/api/connect',
                            method : 'POST',
                            data : ids,
                            success : (response) => {
                                connect_btn[index].innerHTML = 'Connected'
                                connect_btn[index].classList.add('connected')
                            }
                        })
                    }

                    else{
                        $.ajax({
                            url : '/api/disconnect',
                            method : 'GET',
                            data : ids,
                            success : (response) => {
                                connect_btn[index].innerHTML = 'Connect'
                                connect_btn[index].classList.remove('connected')
                            }
                        })
                    }

                })
            })
            
            profile = document.querySelectorAll('.p_name_img')

            profile.forEach((element,index) => {
                element.addEventListener('click' , () => {
                    location.replace('/profile/' + id[index])
                })
            })
        }
    })
}

function getconn() {
    res = ''
    conid = []
    $.ajax({
        url : '/api/get_conn_noti',
        method : 'GET',
        success : (response) => {
            if(response.length) {
                response.forEach(element => {
                    res += `<p class="conName"><b class="c_name">${element.Name}</b> is now connected with you..</p>`    
                    conid.push(element.id)
                })
            }
            else 
                res += '<p>No Connections made..</p>'
            $('.notification').html(res)
            cid = document.querySelectorAll('.c_name')

            cid.forEach((element,index) => element.addEventListener('click', () => location.replace('/profile/' + conid[index])) )

        }
    })
}