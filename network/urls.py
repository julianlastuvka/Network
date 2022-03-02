
from unicodedata import name
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("post", views.post, name="post"),
    path("all_posts/<int:page_number>", views.all_posts, name="all_posts"),
    path("follow/<str:username>", views.follow, name="follow"),
    path("user_info/<str:username>/", views.user_info, name="user_info"),
    path("user_posts/<str:username>/<int:page_number>", views.user_posts, name="user_posts"),
    path("follows_posts/<int:page_number>", views.follows_posts, name="follows_posts"),
    path("like_post", views.like_post, name="like_post"),
    path("edit_post", views.edit_post, name="edit_post")
]
