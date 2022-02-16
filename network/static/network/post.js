

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


function post(){

    const content = document.querySelector("#content");

    const csrftoken = getCookie('csrftoken');

    fetch('/post', {

        method: 'POST',
        headers: {
                "X-CSRFToken": csrftoken,
            },
        body: JSON.stringify({
            content: content.value,
        })
        
    })
    .then(response => response.json())
    .then(post =>{

        show_post(post);
        content.value = '';
    });

    return false;

}

function show_post(post){

    var imageURL = "{% static 'network/likes.png' %}";

    const post_container = document.createElement('div');
    post_container.classList.add("post_container");
    post_container.classList.add(`id_${post.id}`);

    const post_user = document.createElement('h5');
    const post_content = document.createElement('p');
    const timestamp = document.createElement('p');
    const likes = document.createElement('div');
    const likes_icon = document.createElement('img');
    

    likes_icon.setAttribute("src", "/static/network/likes.png");
    likes_icon.setAttribute("width", "20px");
    
    timestamp.classList.add('timestamp');

    post_user.innerHTML = `@${post.owner}:`;
    post_content.innerHTML = post.content;
    timestamp.innerHTML = post.timestamp;
    likes.innerHTML = post.likes + " ";
    

    post_container.appendChild(post_user);
    post_container.appendChild(post_content);
    post_container.appendChild(timestamp);
    post_container.appendChild(likes);
    
    likes.appendChild(likes_icon);

    
    document.querySelector('#all_posts-view').prepend(post_container);

    post_user.addEventListener('click', () => load_profile(post.owner));

}

function load_posts(){

    fetch("/posts")
    .then( response => response.json())
    .then(posts => {

        posts.forEach(post => {
            show_post(post);
        });
        
    })

}

function load_profile(username){

    const all_posts = document.querySelector('#all_posts-view');
    const new_post = document.querySelector('#new_post');
    const profile_view = document.querySelector('#profile-view');

    all_posts.innerHTML = "";

    if (new_post) {
        new_post.innerHTML = "";
    }
    
    profile_view.innerHTML = "";

    fetch(`user_info/${username}`)
    .then(response => response.json())
    .then( user_info =>{

        user_info[1].forEach(post =>{
            show_post(post);
        })
        show_profile(user_info[0]);
    })

}


function follow(username){

    fetch(`/follow/${username}`)
    .then(response => response.json())
    .then(response => {
        console.log(response);
    })

    f_button = document.querySelector(".follow");
    f_button.innerText = "Unfollow";

    f_button.addEventListener("click", function handler(){
        unfollow(username);
        this.removeEventListener('click', handler);
    });

    var current_followers = document.querySelector("#followers");
    var f = parseInt(current_followers.innerText.slice(11)) + 1

    current_followers.innerText = `Followers: ${f.toString()}`;

}

function unfollow(username){

    const csrftoken = getCookie('csrftoken');

    fetch(`/follow/${username}`, {
        method: "DELETE",
        headers: {
            "X-CSRFToken": csrftoken,
        },
    })
    .then(response => response.json())
    .then(response => {
        console.log(response);
    })

    f_button = document.querySelector(".follow");
    f_button.innerText = "Follow";

    f_button.addEventListener("click", function handler(){
        follow(username);
        this.removeEventListener('click', handler);
    });
    
    var current_followers = document.querySelector("#followers");
    var f = parseInt(current_followers.innerText.slice(11)) - 1

    current_followers.innerText = `Followers: ${f.toString()}`;
}


function show_profile(user_info){

    const profile_view = document.querySelector("#profile-view");

    profile = document.createElement("div");
    profile.classList.add("profile");

    const username = document.createElement('h3');
    const follows = document.createElement('div');
    const followers = document.createElement('div');
    const message = document.createElement('h5');
    const hr = document.createElement('hr');
    

    followers.id = 'followers';

    

    username.innerText = user_info.username;
    followers.innerText = `Followers: ${user_info.followers.length}`;
    follows.innerText =`Follows: ${user_info.follows.length}`;
    message.innerText = `${user_info.username} posts:`;

    const follow_button = document.createElement('button');
    follow_button.classList.add('follow');


    profile.appendChild(username);
    profile.appendChild(follows);
    profile.appendChild(followers);
    

    profile_view.appendChild(profile);
    profile_view.appendChild(hr);
    profile_view.appendChild(message);


    if (document.getElementById('user_username') && document.getElementById('user_username').innerText != user_info.username){
        const user_username = document.getElementById('user_username').innerText;

        profile.appendChild(follow_button);

        if( is_follower(user_username, user_info.followers) ){
            follow_button.innerText = "Unfollow";
            follow_button.addEventListener("click", function handler(){
                unfollow(user_info.username);
                this.removeEventListener('click', handler);
            });
            
        } else{
            follow_button.innerText = "Follow";
            follow_button.addEventListener("click", function handler(){
                follow(user_info.username);
                this.removeEventListener('click', handler);
                
            });
        }

    }
    
}


function is_follower(user, followers){

    for (var i = 0; i < followers.length; i++) {

        if(followers[i] === user){
            return true
        }
    }

    return false
}

document.addEventListener('DOMContentLoaded', ()=>{

    if(document.querySelector('#new_post')){
        document.querySelector('#new_post').onsubmit = post;
    }
   
    load_posts();

});


function like_post(post_id){

    
    fetch('/like_post', {

        method: 'POST',
        headers: {
                "X-CSRFToken": csrftoken,
            },
        body: JSON.stringify({
            post_id: post_id,
        })
        
    })
    .then(response => response.json())
    .then(response =>{

        console.log(response);
    });

    return false;


}