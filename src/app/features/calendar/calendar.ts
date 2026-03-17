import { Component, OnInit, signal, inject, Input } from '@angular/core';
import { CalendarOptions, EventClickArg, EventDropArg } from '@fullcalendar/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid'
import esLocale from '@fullcalendar/core/locales/es'
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid'
import { Router } from '@angular/router';
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

  @Input({ required: true }) trip!: Trip;

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
      eventColor: '#3788d8',
      nextDayThreshold: '09:00:00',
      eventContent: (arg) => {
        const time = arg.timeText;
        const title = arg.event.title;
        const color = arg.event.backgroundColor;
        const dot = `<span class="fc-custom-dot" style="background-color: ${color}"></span>`;

        if (time) {
          return {
            html: `<div class="fc-custom-event">
                    <span class="fc-custom-time">${dot}${time}</span>
                    <span class="fc-custom-title">${title}</span>
                  </div>`
          };
        }
        return {
          html: `<div class="fc-custom-event">
                  <span class="fc-custom-title">${dot}${title}</span>
                </div>`
        };
      },
    })

  ngOnInit(): void {
    if (this.trip?.id) {
      this.loadActivities();
    }
  };

  private loadActivities(): void {
    this.activitiesService.getActivitiesByTrip(this.trip.id).subscribe({
      next: activities => this.buildCalendarEvents(activities),
      error: () => this.errorMessage.set('Error cargando viajes públicos'),
    });
  };

  private buildCalendarEvents(activities: Activity[]): void {
    const events: any[] = [];

    if (this.trip) {
      let adjustedEndDate: string | undefined = undefined;

      if (this.trip.end_date) {
        const date = new Date(this.trip.end_date);
        date.setDate(date.getDate() + 1); // correción para fullcalendar coloree el día final
        date.setHours(0, 0, 0, 0);
        adjustedEndDate = date.toISOString();
      }
      events.push({
        id: `trip-${this.trip.id}`,
        title: this.trip.title,
        start: this.trip.start_date,
        end: adjustedEndDate,
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
    }

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

    const tripStart = new Date(this.trip.start_date);
    const tripEnd = this.trip.end_date ? new Date(this.trip.end_date) : null;

    const isBeforeStart = start < tripStart;
    const isAfterEnd = tripEnd && (end ? end > tripEnd : start > tripEnd);

    if (isBeforeStart || isAfterEnd) {
      arg.revert();
      this.errorMessage.set('La actividad no puede estar fuera de las fechas de viaje');
      return;
    };

    this.activitiesService.updateActivity(id, {
      start_time: start.toISOString(),
      end_time: end ? end.toISOString() : undefined,
    }).subscribe({
      next: () => this.errorMessage.set(''),
      error: () => {
        arg.revert();
        this.errorMessage.set('Error actualizando la actividad');
      },
    });
  };
}
