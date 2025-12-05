import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  pipe?: string;
  pipeArgs?: any;
  customTemplate?: any;
}

export interface TableAction {
  icon: string;
  label: string;
  color?: string;
  handler: (row: any) => void;
  permission?: string;
  showCondition?: (row: any) => boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnInit {

  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() actions: TableAction[] = [];
  @Input() loading: boolean = false;
  @Input() paginated: boolean = true;
  @Input() pageSize: number = 10;
  @Input() totalRecords: number = 0;
  @Input() currentPage: number = 0;
  @Input() selectable: boolean = false;
  @Input() exportable: boolean = true;

  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{ field: string, order: string }>();
  @Output() filterChange = new EventEmitter<{ field: string, value: string }>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() exportData = new EventEmitter<string>();

  selectedRows: any[] = [];
  sortField: string = '';
  sortOrder: string = 'asc';
  filters: { [key: string]: string } = {};
  searchGlobal: string = '';

  // Exponer Math al template
  Math = Math;

  ngOnInit(): void {
  }

  onSort(field: string): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }
    this.sortChange.emit({ field: this.sortField, order: this.sortOrder });
  }

  onFilter(field: string, value: string): void {
    this.filters[field] = value;
    this.filterChange.emit({ field, value });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.pageChange.emit(page);
  }

  onSelectRow(row: any, event: any): void {
    if (event.target.checked) {
      this.selectedRows.push(row);
    } else {
      this.selectedRows = this.selectedRows.filter(r => r !== row);
    }
    this.selectionChange.emit(this.selectedRows);
  }

  onSelectAll(event: any): void {
    if (event.target.checked) {
      this.selectedRows = [...this.data];
    } else {
      this.selectedRows = [];
    }
    this.selectionChange.emit(this.selectedRows);
  }

  isSelected(row: any): boolean {
    return this.selectedRows.includes(row);
  }

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  get pages(): number[] {
    const pages = [];
    for (let i = 0; i < this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  onExport(format: string): void {
    this.exportData.emit(format);
  }

  getFieldValue(row: any, field: string): any {
    const fields = field.split('.');
    let value = row;
    for (const f of fields) {
      value = value?.[f];
    }
    return value;
  }

  canShowAction(action: TableAction, row: any): boolean {
    if (action.showCondition) {
      return action.showCondition(row);
    }
    return true;
  }
}

