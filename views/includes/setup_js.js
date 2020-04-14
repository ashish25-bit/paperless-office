const img = document.querySelector('.image_input')
const preview = document.querySelector('.preview')
const comp = document.querySelector('.comp')
const pos = document.querySelector('.pos')

document.querySelector('.upload').addEventListener('click' , (event) =>{
    if(comp.value === "" || pos.value === ""){
        event.preventDefault()
        alert("Enter all fields")
    }
    else
        document.querySelector('.setup_form').setAttribute("action" , "/upload")
})

img.addEventListener('change' , (event) => {
    if(img.value != ""){
        let reader = new FileReader();
        reader.onload = () => {
            preview.src = reader.result
        }
        reader.readAsDataURL(event.target.files[0])
    }
})
/*
{
    element = document.querySelector('.comp')
    yPosition = 0
    while(element) {
        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }
    console.log(yPosition)
}
*/