let chats
let input_box = '<div class="msg_input_box_con"><textarea type="text" name="message" class="msg_input" placeholder="Your message..." ></textarea><button class="msg_send_btn">Send</button></div>'
let menu_options = document.querySelector('.menu_options')
const chat_con = document.querySelector('.chats') 
const msg_con = document.querySelector('.message')
const group_con = document.querySelector('.groups')
const add_mem_con = document.querySelector('.add_member_names_con')
let add_member_button = document.querySelector('.add_mem_con')
const group_info = document.querySelector('.group_info')
const messages = document.querySelector('.messages')
chats_available = [] // name of the users which the logged in user is connected with
let newMembers 
selected_id = [] //  the selected ids for making the group
acfg = '' // allowed connections for groups (only these chats are allowed to be added in the groups as other people may not follow the user)
group_member = [] // this will contain the ids of the group
group_details = [] // this will contain the group details of a group i.e. Name and type
let gid // this will contain the group id of the current opened group
let b_members = [] // this will contain the ids of the users who are bidirectionally connected the logged in user
const socket = io() 
let loggedIn // this will contain the id of the user who is currently logged in 
sm = [] // this the contain the messages which will be displayed in the msg_con

{
    menu_options.style.display = 'none'
    display_none()
    msg_con.style.display = 'block'
    get_chats()
}

// to get the recent messages this includes the personal chats and group chats order by the time.
function get_message() {
    socket.emit('showRoom')
    roomids = []
    names = []
    b_members.forEach((id,index) => {
        roomids.push(id>loggedIn ? `${loggedIn}+${id}` : `${id}+${loggedIn}`)
        names.push(chats_available[index])
    })
    group_member.forEach((id,index) => {
        roomids.push(id.toString())
        names.push(group_details[index].Name)
    })
    roomids.forEach((room,index) => {
        $.ajax({
            url : '/get_messages',
            method : 'GET',
            async : false,
            data : {room : room},
            success : response => {
                if(response.length){
                    response[0].name = names[index]
                    sm.push(response)                    
                }
            }
        })
    })
    display_messages()
}

/*  *************************************************
    for the personal chats
    ************************************************* */

// to get the chat names
function get_chats() {
    // get the id of the logged in user
    $.ajax({
        url : '/getid',
        method : 'GET',
        success : response => loggedIn = parseInt(response) 
    })
    
    $.ajax({
        url : '/get_everything',
        method : 'GET',
        success : (response) => {

            if(response[0].length) {
                response[0].forEach(id => b_members.push(id))
            }
            
            if(response[1].length) {
                response[1].forEach(element => {
                    group_member.push(element.gid)
                    det = {Name : element.Name, type : element.type}
                    group_details.push(det)
                })
            }
        }
    }).then(joinUserToRoom).then(getChatName)
}

function getChatName() {
    b_members.forEach(id => {
        $.ajax({
            url : '/get_names',
            method : 'GET', 
            async : false,
            data : {id : id},
            success : (response) => {
                chats_available.push(response[0].Name)
                acfg += `<p class="chat_name chat_for_group">${name}</p>`
            }
        })
    })
    get_message()
}

function joinUserToRoom() {
    // this is to join the user to all rooms of the groups he is part of.
    socket.emit('joinGroupRoom' , {rooms : group_member , id : loggedIn})
    socket.emit('joinRoom' , {id1 : b_members, id : loggedIn})
}

// the chat container which will contain the names of the poeple who the logged in user is connected with
document.querySelector('.chats_con_display').addEventListener('click' , () => {
    groupInfoView()
    display_none()
    chat_con.style.display = 'block'
    res = ''
    if(chats_available.length > 0) {
        chats_available.forEach(element => res += `<p class="chat_name">${element}</p>`)
        $('.chats').html(res)

        chats = document.querySelectorAll('.chat_name')
        chats.forEach((element,index) => {
            element.addEventListener('click' ,() => {
                dd = document.createElement('div')
                dd.classList.add('chat_name_msg')
                res  = `<p class="chat_name_display">${chats_available[index]}</p>`
                res += `<div class="chat_message"></div>`
                res += input_box
                dd.innerHTML = res
                if(messages.childNodes.length > 1) 
                    messages.removeChild(messages.childNodes[1])
                messages.appendChild(dd)
                getChatMessages(b_members[index])
                chatting(b_members[index])
            })
        })
    }
    
    else
        $('.chats').html('You are not connected to anyone')    
})

// getting the messages of the logged with a specific person 
function getChatMessages(id) {
    console.log('Get the messages of a specific chat')
}

// this function is to send the messages between the users 
function chatting(id) {
    roomid = id>loggedIn ? `${loggedIn}+${id}` : `${id}+${loggedIn}`
    i = document.querySelector('.msg_input')
    send = document.querySelector('.msg_send_btn')
    send.addEventListener('click', () => {
        if(i.value != ''){
            appendMsg(i.value , 'ques')
            socket.emit('sendmsg' , {msg : i.value , room : roomid})
            messageToDatabase(roomid,i.value,loggedIn,'text')
        }
        i.value = ''
        i.focus()
    })

    i.addEventListener('keyup' , e => {
        if(e.keyCode == 13){
            if(i.value != ''){
                appendMsg(i.value,'ques')
                socket.emit('sendmsg' , {msg : i.value , room : roomid})
                messageToDatabase(roomid,i.value,loggedIn,'text')
                i.value = ''
            }
        }
    })
}

/*  ********************************************
    for group chats
    ********************************************    */

document.querySelector('.group_con_display').addEventListener('click' , () =>  getGroups() , false )

// this function will get all the groups in which the user are joined
function getGroups() {
    display_none()
    group_con.style.display = 'block'
    g = ''
    if(group_details.length)
        group_details.forEach(element => {g += `<p class="group">${element.Name}</p>`})
    else g = 'No groups found'

    group_con.innerHTML = g
    // adding the event listener for each group
    groupChatWindow() 
}

// for creating groups
document.querySelector('.create_group_chat').addEventListener('click' , () => {

    document.querySelector('.container_msg_chats').style.display = 'none'

    gcc  = '<div class="select_group_chat_member">'
    gcc += '<input class="group_name" placeholder="Enter group name">'
    gcc += '<div class="con_can_con">'
    gcc += '<button class="confirm_create_group">Create Group</button>'
    gcc += '<button class="cancel_group">Cancel</button>'
    gcc += '</div>'

    gcc += acfg

    gcc += '</div>'
    $('.group_select').html(gcc)
    menu_chat()
    
    cg = document.querySelectorAll('.chat_for_group')
    cg.forEach((element,index) => element.addEventListener('click' , () => initialize(index) , false) )  
    
    document.querySelector('.cancel_group').addEventListener('click' , () => {
        document.querySelector('.container_msg_chats').style.display = 'block'
        $('.group_select').html('')
        $('.pop_up_msg').html('')
    })

    document.querySelector('.confirm_create_group').addEventListener('click' , () => create_group() , false)
})

    // makes the array which contains the ids of the users who will be added in the group
function initialize(index){
    event.target.classList.add('chat_for_group_selected')
    i = b_members[index]
    if(!selected_id.includes(i))
        selected_id.push(i)
}

// for creating the group 
function create_group() {
    g_name = document.querySelector('.group_name')
    if(g_name.value == '')
        $('.pop_up_msg').html('Enter name of the group')
    else if(selected_id.length == 0)
        $('.pop_up_msg').html('Select atleast one recepient')
    else {
        selected_id.sort(function(a,b) {return a-b})
        s = ''
        selected_id.forEach(element =>  s += element + ',' )
        info = {
            name : g_name.value,
            members : s
        }
        $.ajax({
            url : '/create_group',
            method : 'POST',
            data : info,
            success : (response) => {
                console.log(response)
            }
        })

        $('.group_select').html('')
        $('.pop_up_msg').html('')
        document.querySelector('.container_msg_chats').style.display = 'block' 
        getGroups()
    }
}

// for getting the group chat window
function groupChatWindow() {
    const gg = document.querySelectorAll('.group')
    gg.forEach((element,index) => {
        element.addEventListener('click' , () => {
            add_member_button.style.display = 'none'
            groupInfoView()
            // group id 
            gid = group_member[index]
            $('.g_name').html(element.innerHTML)
            let dd = document.createElement('div')
            dd.classList.add('chat_name_msg') 
            res  = `<div class="group_chat_header"><div class="chat_name_display">${element.innerHTML}</div><button class="group_info_btn">Group Info</button></div>`
            res += `<div class="chat_message"></div>`
            res += input_box
            dd.innerHTML = res
            if(messages.childNodes.length > 1) 
                messages.removeChild(messages.childNodes[1])
            messages.appendChild(dd)
            send = document.querySelector('.msg_send_btn')
            i = document.querySelector('.msg_input')

            send.addEventListener('click', () => {
                if(i.value != '') {
                    appendMsg(i.value , 'ques')
                    socket.emit('sendmsg' , {room : gid , msg : i.value})
                    messageToDatabase(gid,i.value,loggedIn,'text')
                    i.value = ''
                    i.focus()
                }
            })

            // send message when enter is pressed 
            i.addEventListener('keyup' , e => {
                if(e.keyCode == 13){
                    if(i.value != ''){
                        appendMsg(i.value,'ques')
                        socket.emit('sendmsg' , {room : gid , msg : i.value})
                        messageToDatabase(gid,i.value,loggedIn,'text')
                        i.value = ''
                    }
                }
            })

            // for getting the group info con
            document.querySelector('.group_info_btn').addEventListener('click', () => {
                group_info.classList.toggle('groupInfoReveal')
                group_info.classList.contains('groupInfoReveal') ? group_info.classList.remove('groupInfoHide') : group_info.classList.add('groupInfoHide')
                // to get the group members as soon as the group info container is revealed
                getGroupMembers(gid)
            })
        })
    })
} 

// to get the group members when the member button is clicked
$('.show_members').on('click' , () => getGroupMembers(gid))
// to get the shared documents when the document button is clicked
$('.show_docs').on('click' , () => {
    $('.docs_media').html('No documents yet')
})
// to get the media shared in the group 
$('.show_media').on('click' , () => {
    $('.docs_media').html('No media yet')
})

function getGroupMembers(id) {
    $.ajax({
        url : '/group_members',
        method : 'GET',
        data : {id : id},
        success : response => {
            let gm = ''
            let makeAdmin = false
            response.forEach(element => {
                if(element.id == loggedIn) {
                    gm += `<div class="gm-name"><p data-profile-id='${element.id}'><a href="/profile">${element.Name}</a></p>`
                    if(element.type == 'admin'){
                        gm += `<span>Admin</span>`
                        add_member_button.style.display = 'block'
                        makeAdmin = true
                    }
                }
                else if(element.type == 'admin') {
                    gm += `<div class="gm-name"><p data-profile-id='${element.id}'><a href="/profile:${element.id}">${element.Name}</a></p>`
                    gm += `<span>Admin</span>`
                }
                else {
                    gm += `<div class="gm-name"><p data-profile-id='${element.id}'><a href="/profile:${element.id}">${element.Name}</a></p>`
                    if(makeAdmin)
                        gm += `<button class='make_admin_btn' data-profile-id='${element.id}'>Make Admin</button>`
                }
                gm += '</div>'
            })

            $('.docs_media').html(gm)
            // checking whether the make admin button exists
            let ma = document.querySelectorAll('.make_admin_btn')
            // if btn exists the event listener will be added
            if(ma.length) {
                ma.forEach(element => {
                    element.addEventListener('click' , () => {
                        mid = parseInt(element.getAttribute('data-profile-id'))
                        info = {gid : id , mid : mid}
                        parent = element.parentElement
                        span = document.createElement('span')
                        // making the request to make a user admin of the group
                        $.ajax({
                            url : '/make_admin',
                            method : 'POST',
                            data : info,
                            success : response => {
                                if(response != 'Error in making admin') {
                                    element.style.display = 'none'
                                    span.innerText = 'Admin'
                                }
                                else 
                                    span.innerText = response
                                parent.appendChild(span)
                            }
                        })
                    })
                })
            }
        }
    })
}

// for viewing the group info
function groupInfoView() {
    group_info.classList.remove('groupInfoReveal')
    if(group_info.classList.contains('groupInfoHide'))
        group_info.classList.add('groupInfoHide')
}

// event listener for adding members to the group
document.querySelector('.add_mem_btn').addEventListener('click' , () => {
    add_mem_con.style.display = 'flex'
    mids = [] // this will contain the ids of the members who are currently in the group
    document.querySelectorAll('.gm-name p').forEach(element => {
        id = parseInt(element.getAttribute('data-profile-id'))
        if(id != loggedIn)
            mids.push(id)
    })
    new_add_mem = b_members.filter(n => { return mids.indexOf(n) == -1} ) // this will contain the ids of the members who can be joined in the group
    mmm = ''
    new_add_mem.forEach(n => {
        i = b_members.indexOf(n)
        mmm += `<div class='checkbox_con'><input data-id='${n}' type='checkbox' class='checkbox'> ${chats_available[i]}</div>`
    })
    $('.new_members_names').html(mmm)
    newMembers = []
    const checbox = document.querySelectorAll('.checkbox')
    checbox.forEach(element => {
        element.addEventListener('click' , () => {
            namid = parseInt(element.getAttribute('data-id'))
            if(element.checked) 
                newMembers.push(namid)
            else {
                ir = newMembers.indexOf(namid) // ir (immediately remove) 
                newMembers.splice(ir,1)
            }
        })
    })
})

// for canceling the addtion of a new member
document.querySelector('.cancel_add_mem').addEventListener('click' , () => add_mem_con.style.display = 'none' )

// add the selected members to the group
document.querySelector('.add_members').addEventListener('click' , () => {
    if(!newMembers.length) {
        document.querySelector('.empty_selections').classList.add('addemptyclass')
        setTimeout(() => document.querySelector('.empty_selections').classList.remove('addemptyclass') , 2000)
    }
    else {
        info = {
            gid : gid,
            members : newMembers.toString()
        }
        $.ajax({
            url : '/add_members',
            method : 'POST',
            data : info,
            success : response => console.log(response)
        })
        add_mem_con.style.display = 'none'
        getGroupMembers(gid)
    }
})

// socket functions
// getting the message from the user
socket.on('message' , msg => appendMsg(msg,'ans'))

/*  ***********************************************
    some random stuff
    *********************************************** */

// appending the send and received messages to the chat container
function appendMsg(msg,cls) {
    time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' , hour12 : 'false'})
    let div = document.createElement('div')
    div.classList.add(cls)
    m = `<p class="cm">${msg}</p><br/><p class="ct">${time}</p>`
    div.innerHTML = m
    let msg_con = document.querySelector(".chat_message")
    msg_con.appendChild(div)
    msg_con.scrollTop = msg_con.scrollHeight
}

document.querySelector('.msg_con_display').addEventListener('click' , () => {
    groupInfoView()
    display_none()
    msg_con.style.display = 'block'
})

// the menu button which will contain the options such as -> create group
document.querySelector('.menu_chat_btn').addEventListener('click' , () => menu_chat() , false)

function menu_chat() {
    menu_options.style.display == 'block' ? menu_options.style.display = 'none' : menu_options.style.display = 'block' 
}
// remove all the containers
function display_none() {
    chat_con.style.display  = 'none'
    msg_con.style.display   = 'none'
    group_con.style.display = 'none'
}

function messageToDatabase(room,msg,sent,type) {
    msg = msg.trim()
    info = {room,msg,sent,type}
    $.ajax({
        url : '/put_message',
        method : 'POST',
        data : info
    })
}

function display_messages() {
    ss = ''
    sm.forEach(e => ss += `<div class="msg_recent_con"><p class="msg_recent_name">${e[0].name}</p><p class="msg_recent_date">${e[0].Date}</p><p class="msg_recent_msg">${e[0].message}</p><p class="msg_recent_time">${e[0].Time}</p></div>`)
    $('.message').html(ss)
}