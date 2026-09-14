from django.test import TestCase
from django.urls import reverse
from .models import HouseholdMember, Chore


class HouseholdMemberModelTest(TestCase):
    def setUp(self):
        self.member = HouseholdMember.objects.create(name="Alex")

    def test_member_string_representation(self):
        """String representation of HouseholdMember should match the name."""
        self.assertEqual(str(self.member), "Alex")


class ChoreModelTest(TestCase):
    def setUp(self):
        self.member = HouseholdMember.objects.create(name="Sam")
        self.chore = Chore.objects.create(
            title="Clean Kitchen",
            description="Wipe counters and mop floor",
            assigned_to=self.member,
            is_completed=False,
        )

    def test_chore_default_status(self):
        """A new chore should have is_completed=False by default."""
        new_chore = Chore.objects.create(title="Take out trash")
        self.assertFalse(new_chore.is_completed)

    def test_chore_string_representation(self):
        """String representation reflects title and completion status."""
        self.assertEqual(str(self.chore), "Clean Kitchen (Pending)")
        self.chore.is_completed = True
        self.chore.save()
        self.assertEqual(str(self.chore), "Clean Kitchen (Done)")


class ChoreDashboardViewTest(TestCase):
    def setUp(self):
        self.member = HouseholdMember.objects.create(name="Jordan")
        self.pending_chore = Chore.objects.create(
            title="Do Laundry",
            assigned_to=self.member,
            is_completed=False,
        )
        self.completed_chore = Chore.objects.create(
            title="Water Plants",
            assigned_to=self.member,
            is_completed=True,
        )

    def test_dashboard_renders_successfully(self):
        """Dashboard view responds with HTTP 200 and uses correct template."""
        response = self.client.get(reverse('dashboard'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'chores/dashboard.html')
        self.assertContains(response, "Do Laundry")
        self.assertContains(response, "Water Plants")

    def test_create_chore_via_dashboard(self):
        """Submitting the chore form creates a new chore and redirects."""
        post_data = {
            'add_chore': '1',
            'title': 'Vacuum living room',
            'description': 'Under the sofa too',
            'assigned_to': self.member.id,
        }
        response = self.client.post(reverse('dashboard'), post_data)
        self.assertRedirects(response, reverse('dashboard'))
        self.assertTrue(Chore.objects.filter(title="Vacuum living room").exists())

    def test_toggle_chore_status(self):
        """Toggling a chore flips its is_completed boolean flag."""
        toggle_url = reverse('toggle_chore', args=[self.pending_chore.id])
        response = self.client.post(toggle_url)
        self.assertRedirects(response, reverse('dashboard'))
        self.pending_chore.refresh_from_db()
        self.assertTrue(self.pending_chore.is_completed)

        # Toggle back to pending
        response = self.client.post(toggle_url)
        self.assertRedirects(response, reverse('dashboard'))
        self.pending_chore.refresh_from_db()
        self.assertFalse(self.pending_chore.is_completed)

    def test_add_household_member(self):
        """Submitting member form adds a new roommate."""
        add_member_url = reverse('add_member')
        response = self.client.post(add_member_url, {'name': 'Taylor'})
        self.assertRedirects(response, reverse('dashboard'))
        self.assertTrue(HouseholdMember.objects.filter(name="Taylor").exists())
