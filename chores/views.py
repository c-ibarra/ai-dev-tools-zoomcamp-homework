from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.http import require_POST
from .models import Chore, HouseholdMember
from .forms import ChoreForm, HouseholdMemberForm


def dashboard_view(request):
    """Renders the central chores dashboard and handles chore creation."""
    if request.method == 'POST' and 'add_chore' in request.POST:
        chore_form = ChoreForm(request.POST)
        if chore_form.is_valid():
            chore_form.save()
            return redirect('dashboard')
    else:
        chore_form = ChoreForm()

    member_form = HouseholdMemberForm()
    pending_chores = Chore.objects.filter(is_completed=False).select_related('assigned_to')
    completed_chores = Chore.objects.filter(is_completed=True).select_related('assigned_to')
    members = HouseholdMember.objects.all()

    context = {
        'chore_form': chore_form,
        'member_form': member_form,
        'pending_chores': pending_chores,
        'completed_chores': completed_chores,
        'members': members,
    }
    return render(request, 'chores/dashboard.html', context)


@require_POST
def toggle_chore_view(request, chore_id):
    """Toggles a chore's status between pending and completed."""
    chore = get_object_or_404(Chore, id=chore_id)
    chore.is_completed = not chore.is_completed
    chore.save()
    return redirect('dashboard')


@require_POST
def add_member_view(request):
    """Quickly adds a new roommate to the household."""
    form = HouseholdMemberForm(request.POST)
    if form.is_valid():
        form.save()
    return redirect('dashboard')
