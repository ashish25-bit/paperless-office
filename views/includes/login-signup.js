const login_option = document.querySelector('.login_option')
const signup_option = document.querySelector('.signup_option')
const login_form = document.querySelector('.login_form')
const signup_form = document.querySelector('.signup_form')
const login_email = document.querySelector('.login_email')
const login_pwd = document.querySelector('.login_pwd')
const login_btn = document.querySelector('.login_btn')
const username = document.querySelector('.username')
const signup_email = document.querySelector('.signup_email')
const signup_pwd = document.querySelector('.signup_pwd')
const signup_btn = document.querySelector('.signup_btn')
let error_msg = document.querySelector('.error')

{
    if(error_msg.innerHTML === 'User Already Exists'){
        console.log('yes')
        login_form.style.display = 'none'
        signup_form.style.display = 'block'
        login_option.classList.remove('active_option')
        signup_option.classList.add('active_option')
    }
}

signup_option.addEventListener('click' , () => {
    login_form.style.display = 'none'
    signup_form.style.display = 'block'
    login_option.classList.remove('active_option')
    signup_option.classList.add('active_option')
    error_msg.innerHTML = ''
})

login_option.addEventListener('click' , () => {
    login_form.style.display = 'block'
    signup_form.style.display = 'none'
    login_option.classList.add('active_option')
    signup_option.classList.remove('active_option')
    error_msg.innerHTML = ''
})

login_btn.addEventListener('click' , (event) => {
    if(login_email.value == '' || login_pwd.value == ''){
        event.preventDefault()
        alert('Enter all fields')
    }
    else
        document.querySelector('.login').setAttribute('action' , '/')
})

signup_btn.addEventListener('click' , (event) => {
    if(username.value == '' || signup_email.value == '' || signup_pwd.value == ''){
        event.preventDefault()
        alert('Enter all fields')
    }
    else
        document.querySelector('.signup').setAttribute('action' , '/signup')
})