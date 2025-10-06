import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center p-8">
      <div class="relative">
        <div class="w-12 h-12 rounded-full border-4 border-gray-200"></div>
        <div class="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin absolute top-0 left-0"></div>
      </div>
      <span class="ml-3 text-gray-600 animate-pulse">Chargement...</span>
    </div>
  `
})
export class LoadingComponent {}