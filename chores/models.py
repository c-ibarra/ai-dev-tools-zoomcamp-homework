from django.db import models


class HouseholdMember(models.Model):
    """Represents a roommate or household member available for chore assignment."""
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class Chore(models.Model):
    """Represents a shared household chore task."""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    assigned_to = models.ForeignKey(
        HouseholdMember,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='chores',
    )
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        status = "Done" if self.is_completed else "Pending"
        return f"{self.title} ({status})"

    class Meta:
        ordering = ['is_completed', '-created_at']
