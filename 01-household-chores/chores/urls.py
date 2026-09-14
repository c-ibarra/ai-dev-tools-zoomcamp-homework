from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard_view, name='dashboard'),
    path('chores/<int:chore_id>/toggle/', views.toggle_chore_view, name='toggle_chore'),
    path('members/add/', views.add_member_view, name='add_member'),
]
