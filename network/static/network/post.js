

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
    const likes_container = document.createElement('div');
    const likes_icon = document.createElement('img');
    const likes = document.createElement('div');


    likes_icon.classList.add("likes_icon");
    likes_container.classList.add("likes_container");
    likes_icon.setAttribute("src", "/static/network/likes.png");
    likes_icon.addEventListener("click", () => like_post(post.id, likes));
    
    timestamp.classList.add('timestamp');

    post_user.classList.add('button-81');

    post_user.innerHTML = `@${post.owner}:`;
    post_content.innerText = post.content;
    timestamp.innerHTML = post.timestamp;
    likes.innerText = post.likes + " ";


    if(post.owner == document.getElementById('user_username').innerText){
        const edit_button = document.createElement('button');
        edit_button.innerText = "Edit";
        edit_button.classList.add('button-30');
        post_container.appendChild(edit_button);

        edit_button.addEventListener('click', () =>{

            edit_button.style.display="none";
            const text_area = document.createElement("textarea");
            text_area.innerText = post_content.innerText;
            post_content.innerText = "";
            post_content.appendChild(text_area);

            const save_changes = document.createElement("button");
            save_changes.classList.add("button-30");
            save_changes.innerText = "Save";
            post_content.appendChild(save_changes);

            save_changes.addEventListener("click", ()=>{
                post_content.innerText = text_area.value;
                text_area.remove();
                edit_button.style.display="block";

                edit_post(post.id, post_content.innerText);

            })
            
        } )
    }

    post_container.appendChild(post_user);
    post_container.appendChild(post_content);
    post_container.appendChild(timestamp);
    post_container.appendChild(likes_container);

    likes_container.appendChild(likes_icon);
    likes_container.appendChild(likes);
    
    
    document.querySelector('#all_posts-view').prepend(post_container);

    post_user.addEventListener('click', () => load_profile(post.owner));

}

function edit_post(post_id, new_content){

    const csrftoken = getCookie('csrftoken');
    
    fetch('/edit_post', {

        method: 'POST',
        headers: {
                "X-CSRFToken": csrftoken,
            },
        body: JSON.stringify({
            post_id: post_id,
            new_content: new_content
        })
        
    })
    .then(response => response.json())
    .then(response =>{

        console.log(response);
    });

}


function load_posts(){

    fetch("/all_posts")
    .then( response => response.json())
    .then(posts => {

        posts.forEach(post => {
            show_post(post);
        });
        
    })

}

function load_follows_posts(){

    document.querySelector('#profile-view').innerHTML = "";
    document.querySelector('#new_post').innerHTML = "";
    document.querySelector('#all_posts-view').innerHTML = "";
    
    fetch("/follows_posts")
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
    profile.classList.add("twelve");

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


function like_post(post_id, likes_count){

    const csrftoken = getCookie('csrftoken');
    
    fetch(`/like_post`, {

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

        if ( response.success == "post liked"){
            var liked = true;
        } else {
            var liked = false;
        }

        change_post_like_count(likes_count, liked);
    });

    return false;
}

function change_post_like_count(likes_count, liked){

    current_likes = parseInt(likes_count.innerText);
    likes_count.innerText = "";

    if(liked){
        likes_count.innerText = current_likes + 1;
    } else{
        likes_count.innerText = current_likes - 1 ;
    }
    
}


document.addEventListener('DOMContentLoaded', ()=>{

    if(document.querySelector('#new_post')){
        document.querySelector('#new_post').onsubmit = post;
    }

    if (document.querySelector("#following")){
        document.querySelector("#following").onclick = load_follows_posts;
    }
    
    load_posts();

});