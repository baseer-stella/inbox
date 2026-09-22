import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InboxComponent {
  readonly tickets = [
    ['John Doe', 'Updated reservation request', 'Guest Experience', 'Now', 'JD'],
    ['Megan Patel', 'Can I change my check-in time?', 'Reservation', '4m', 'MP'],
    ['Arianna Brooks', 'Need help with my booking', 'Sales', '12m', 'AB'],
    ['Emile Scott', 'Question about the apartment', 'Guest Experience', '32m', 'ES'],
    ['Maya Johnson', 'Airport pickup details', 'Reservation', '1h', 'MJ'],
    ['James Wilson', 'Invoice request', 'Sales', '2h', 'JW'],
    ['Olivia Martin', 'Early arrival request', 'Guest Experience', '3h', 'OM'],
  ];

  readonly teams = [
    ['Assigned to me', '8', '#00bba7'],
    ['Guest Experience', '21', '#00bba7'],
    ['Reservation', '10', '#7ccf00'],
    ['Sales', '12', '#f6339a'],
    ['Operations', '6', '#00a6f4'],
  ];
}
