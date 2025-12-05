import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

  @Input() title: string = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() showFooter: boolean = true;
  @Input() showHeader: boolean = true;
  @Input() closeOnBackdrop: boolean = true;
  @Input() confirmText: string = 'Guardar';
  @Input() cancelText: string = 'Cancelar';
  @Input() confirmColor: string = 'primary';
  @Input() loading: boolean = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  isOpen: boolean = false;

  ngOnInit(): void {
  }

  open(): void {
    this.isOpen = true;
    document.body.classList.add('modal-open');
  }

  closeModal(): void {
    this.isOpen = false;
    document.body.classList.remove('modal-open');
    this.close.emit();
  }

  onBackdropClick(): void {
    if (this.closeOnBackdrop) {
      this.closeModal();
    }
  }

  onConfirm(): void {
    if (!this.loading) {
      this.confirm.emit();
    }
  }

  onCancel(): void {
    if (!this.loading) {
      this.cancel.emit();
      this.closeModal();
    }
  }
}

