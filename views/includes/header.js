const profile_photo = document.querySelectorAll('.profile_photo')
let id_logged_user

let username_logged = document.querySelector('.img_profile_con span').innerText
{
        getDP()
}

// get details
function getDP(){
        $.ajax({
            url : '/api/get_details',
            method : 'GET',
            success : (response) => {
                id_logged_user = response[0]['id']
                
                if(response[0]['DP'] == null) 
                        profile_photo[0].src = 'uploads/download.png'
                else 
                        profile_photo[0].src = 'uploads/' + response[0]['DP']
                        
            }
        })
}

// document.querySelector('.logout').addEventListener('click' , () => sessionStorage.clear())