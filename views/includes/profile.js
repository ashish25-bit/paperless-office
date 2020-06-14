const profile_pic_display = document.querySelector('.profile_pic_display')

{
        get_details()
}

function get_details(){

        $.ajax({
                url : '/api/get_details',
                method : 'GET',
                success : (response) => {
                if(response[0]['DP'] == null)
                        profile_pic_display.src = 'uploads/download.png'
                else 
                        profile_pic_display.src = 'uploads/' + response[0]['DP']
                $('.p').html(response[0]['Position'])
                $('.c').html(response[0]['Company'])
                }
        })
}