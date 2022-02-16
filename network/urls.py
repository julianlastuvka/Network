
from unicodedata import name
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("post", views.post, name="post"),
    path("posts", views.load_posts, name="posts"),
    path("follow/<str:username>", views.follow, name="follow"),
    path("user_info/<str:username>", views.user_info, name="user_info"),
]
