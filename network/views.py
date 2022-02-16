import email
from urllib.request import Request
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse

import json

from .models import User, Post, UserFollowing, PostLike



def index(request):

    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST.get('username')
        email = request.POST.get('email')

        # Ensure password matches confirmation
        password = request.POST.get('password')
        confirmation = request.POST.get('confirmation')
        
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user

        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")



def post(request):

    if request.method == "POST":

        data = json.loads(request.body)

        if data.get("content") is not None:

            new_post = Post(
            owner = request.user,
            content = data["content"]
        )
            new_post.save()
        else:
            return JsonResponse({
            "error": "There must be content to the post."
        }, status=400)

    
        return JsonResponse(new_post.serialize(), status=201)
    
    else:
        return JsonResponse({"error": "POST request required."}, status=400)



def load_posts(request):

    if request.method == "GET":
        posts = Post.objects.filter()
        return JsonResponse([post.serialize() for post in posts], safe=False)

    else:
        return JsonResponse({"error": "POST request required."}, status=400)


def follow(request, username):


    user = User.objects.get(pk=request.user.id)
    followed_user = User.objects.get(username=username)

    if user == followed_user:
        return JsonResponse({"failure": "user cannot follow himself"}, status=400)

    if request.method == "GET":

        current_f = followed_user.followers.all()

        for object in current_f:
            if object.user.username == user.username:
                return JsonResponse({"failure": "the user already follows this user"}, status=400)

        follow = UserFollowing(
            user = user,
            followed_user = followed_user
        )

        follow.save()

        return JsonResponse({"success": "follow request succesfully completed"}, status=201)

    if request.method == "DELETE":

        follow = UserFollowing.objects.get(user = user, followed_user = followed_user)
        follow.delete()

        return JsonResponse({"success": "unfollow request succesfully completed"}, status=201)

    

def user_info(request, username):

    if request.method == "GET":

        user = User.objects.get(username= username)

        user_posts = Post.objects.filter(owner = user)

        user_posts = [post.serialize() for post in user_posts]

        user_info = {
            "username": user.username,
            "follows": [object.followed_user.username for object in user.follows.all()],
            "followers": [object.user.username for object in user.followers.all()]
        }

        return  JsonResponse([user_info, user_posts], safe=False)



def like_post(request, username):

    if request.method == "POST":


        return False
