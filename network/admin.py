from django.contrib import admin

# Register your models here.
from .models import User, Post, UserFollowing, PostLike
admin.site.register(User)
admin.site.register(Post)
admin.site.register(UserFollowing)
admin.site.register(PostLike)