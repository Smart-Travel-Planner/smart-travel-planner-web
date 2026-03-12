import { Component, OnInit, signal, inject, effect, Input } from '@angular/core';
import { CalendarOptions, EventInput, EventClickArg, EventDropArg } from '@fullcalendar/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
// import { EventsService } from '../../core/services/events.service';
import dayGridPlugin from '@fullcalendar/daygrid'
import enLocale from '@fullcalendar/core/locales/en-gb';
import esLocale from '@fullcalendar/core/locales/es'
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid'
// import { EventModel } from '../../core/modals/event-model';
import { Router } from '@angular/router';
// import { AuthService } from '../../core/services/auth.service';
import { TripsService } from '../../core/services/trips.service';
import { ActivitiesService } from '../../core/services/activities.service';
import { Trip } from '../../core/models/trip.model';
import { Activity } from '../../core/models/activity.model';
import { ACTIVITY_CATEGORY_COLORS } from '../../core/enums/activity-category-colors.enum';



@Component({
  selector: 'app-calendar',
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class CalendarComponent implements OnInit {
  private tripsService = inject(TripsService);
  private activitiesService = inject(ActivitiesService);
  private router = inject(Router);

  @Input() trip!: Trip;

  errorMessage = signal<string>('');

  calendarOptions = signal<CalendarOptions>({
      plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
      initialView: 'dayGridMonth',
      locale: esLocale,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: [],
      eventClick: (arg: EventClickArg) => this.onEventClick(arg),
      eventDrop: (arg: EventDropArg) => this.onEventDrop(arg),
      // height: 'auto',
      editable: true,
      droppable: true,
      eventColor: '#3788d8'
    })

  // constructor() {
  //   effect(() => {
  //     const currentEvents = this.events()
  //     if(currentEvents.length > 0) {
  //     this.formatEventsForCalendar(currentEvents)
  //   }
  //   })
  // }


  ngOnInit(): void {
     this.loadActivities();
  };

  private loadActivities(): void {
    this.activitiesService.getActivitiesByTrip(this.trip.id).subscribe({
      next: activities => this.buildCalendarEvents(activities),
      error: () => this.errorMessage.set('Error cargando viajes públicos'),
    });
  };

  private buildCalendarEvents(activities: Activity[]): void {
    const events: any[] = [];

    events.push({
      id: `trip-${this.trip.id}`,
      title: this.trip.title,
      start: this.trip.start_date,
      end: this.trip.end_date ?? undefined,
      display: 'background',
      color: '#E8F4FD',
      allDay: true,
    });

    activities.forEach(activity => {
      events.push({
        id: activity.id,
        title: activity.title,
        start: activity.start_time,
        end: activity.end_time ?? undefined,
        backgroundColor: ACTIVITY_CATEGORY_COLORS[activity.category],
        borderColor: ACTIVITY_CATEGORY_COLORS[activity.category],
        textColor: '#ffffff',
        extendedProps: {
          tripId: this.trip.id,
          category: activity.category,
        },
      });
    });
    this.calendarOptions.update(options => ({ ...options, events}));
  };

  private onEventClick(arg: EventClickArg): void {
    const { id, extendedProps } = arg.event;
    if (extendedProps['tripId']) {
      this.router.navigate(['/trips', extendedProps['tripId'], 'activities', id]);
    };
  };

  private onEventDrop(arg: EventDropArg): void {
    const { id, start, end, extendedProps } = arg.event;
    if (!start || !extendedProps['tripId']) return;

    this.activitiesService.updateActivity(id, {
      start_time: start.toISOString(),
      end_time: end ? end.toISOString() : undefined,
    }).subscribe({
      error: () => {
        arg.revert;
        this.errorMessage.set('Error actualizando la actividad');
      },
    });
  };
}
