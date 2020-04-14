const image_input = document.querySelector('.image_input_sign')

document.querySelector('.btn').addEventListener('click' , (event) => {
    if(image_input.value == ''){
        event.preventDefault()
        alert('Select a image')
    }
    else 
        document.querySelector('.setup_form').setAttribute('action' , '/remove_bg')
})