from django.contrib import admin
from .models import HouseholdMember, Chore


@admin.register(HouseholdMember)
class HouseholdMemberAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_at')
    search_fields = ('name',)


@admin.register(Chore)
class ChoreAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'assigned_to', 'is_completed', 'created_at')
    list_filter = ('is_completed', 'assigned_to')
    search_fields = ('title', 'description')
