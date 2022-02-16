# Generated by Django 4.0 on 2022-02-15 13:26

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0005_userfollowing'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='post',
            name='likes',
        ),
        migrations.CreateModel(
            name='PostLike',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('post', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='likes', to='network.post')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_liked_posts', to='network.user')),
            ],
        ),
    ]