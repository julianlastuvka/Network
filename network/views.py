import email
from re import X
from tracemalloc import start
from urllib import response
from urllib.request import Request
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
from math import ceil

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

        if data.get("content"):

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



def all_posts(request, page_number):

    if request.method == "GET":
        posts = Post.objects.all()

        p_per_page = 10
        max_pages = ceil(len(posts) / p_per_page)
        end = len(posts) - ((page_number-1)*p_per_page)
        start = end - p_per_page if end >= p_per_page else 0
                                                    
        posts = [post.serialize() for post in posts][start:end] 
        
        response = {
            "max_pages": max_pages,
            "posts": posts
        }

        return JsonResponse(response, safe=False)

    else:
        return JsonResponse({"error": "GET request required."}, status=400)


def follows_posts(request, page_number):

    if request.method == "GET":

            p_per_page = 10

            user = User.objects.get(pk=request.user.id)
            follows  = [object.followed_user for object in user.follows.all()]
            posts = Post.objects.filter(owner__in = follows).order_by("pk")

            max_pages = ceil(len(posts) / p_per_page)
            end = len(posts) - ((page_number-1)*p_per_page)
            start = end - p_per_page if end >= p_per_page else 0

            posts = [post.serialize() for post in posts][start : end] 

            response = {
                "max_pages": max_pages,
                "posts": posts
            }

            return JsonResponse(response, safe=False)

    else:
        return JsonResponse({"error": "GET request required."}, status=400)



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

        user_info = {
            "username": user.username,
            "follows": [object.followed_user.username for object in user.follows.all()],
            "followers": [object.user.username for object in user.followers.all()],
        }

        return  JsonResponse(user_info, safe=False)



def user_posts(request, username, page_number):

    if request.method == "GET":

        user = User.objects.get(username= username)
        posts = Post.objects.filter(owner = user)

        p_per_page = 10
        max_pages = ceil(len(posts) / p_per_page)
        end = len(posts) - ((page_number-1)*p_per_page)
        start = end - p_per_page if end >= p_per_page else 0

        posts = [post.serialize() for post in posts][start : end]

        user_posts = {
            "posts": posts,
            "max_pages": max_pages
        }

        return  JsonResponse(user_posts, safe=False)


def like_post(request):

    if request.method == "POST":

        data = json.loads(request.body)

        post_id = data["post_id"]

        user = User.objects.get(pk=request.user.id)
        post = Post.objects.get(pk=post_id)
        post_like = PostLike.objects.filter(post=post_id, user=user)

        # if the user already liked the post, dislike it.
        if post_like:
            post_like.delete()

            return JsonResponse({"success": "post unliked"}, status=201)

        else:
            post_like = PostLike(
                user=user,
                post = post      
            )

            post_like.save()

            return JsonResponse({"success": "post liked"}, status=201)



def edit_post(request):

    if request.method == "POST":

        data = json.loads(request.body)

        post_id = data["post_id"]
        new_content =  data["new_content"]

        post = Post.objects.get(pk=post_id)

        if post.owner.id != request.user.id:
            return JsonResponse({"failure": "this post doesn't belong to the logged user."}, status=400)

        post.content = new_content
        post.save()

        return JsonResponse({"success": "post updated"}, status=201)


    return JsonResponse({"error": "POST request required."}, status=400)