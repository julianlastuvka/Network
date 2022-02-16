from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.base import Model
from django.db.models.deletion import CASCADE
from django.db.models.fields import CharField
from django.db.models.fields.related import ForeignKey


class User(AbstractUser):
    pass


class Post(models.Model):

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_posts")
    content = models.CharField(max_length=500)
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "owner": self.owner.username,
            "likes": len(self.likes.all()),
            "content": self.content,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p")
        }


class UserFollowing(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="follows")
    followed_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followers") 
    created = models.DateTimeField(auto_now_add=True)


class PostLike(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_liked_posts")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    created = models.DateTimeField(auto_now_add=True)