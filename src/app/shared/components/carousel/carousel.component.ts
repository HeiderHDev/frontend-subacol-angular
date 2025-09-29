import {
  Component,
  input,
  output,
  signal,
  computed,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="carousel">
      <div class="carousel__header">
        <h3 class="carousel__title">{{ title() }}</h3>
        <div class="carousel__controls">
          <button
            mat-icon-button
            (click)="scrollLeft()"
            [disabled]="!canScrollLeft()"
            class="carousel__control carousel__control--prev"
            aria-label="Anterior"
          >
            <mat-icon>chevron_left</mat-icon>
          </button>
          <button
            mat-icon-button
            (click)="scrollRight()"
            [disabled]="!canScrollRight()"
            class="carousel__control carousel__control--next"
            aria-label="Siguiente"
          >
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
      </div>

      <div class="carousel__container" #container>
        <div
          class="carousel__track"
          #track
          [style.transform]="'translateX(' + translateX() + 'px)'"
        >
          <ng-content></ng-content>
        </div>
      </div>

      @if (showDots() && totalItems() > itemsToShow()) {
      <div class="carousel__dots">
        @for (dot of dots(); track $index) {
        <button
          class="carousel__dot"
          [class.carousel__dot--active]="$index === currentDot()"
          (click)="goToSlide($index)"
          [attr.aria-label]="'Ir a página ' + ($index + 1)"
        ></button>
        }
      </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      .carousel {
        width: 100%;
        position: relative;
        --carousel-gap: 16px;
        --carousel-radius: 12px;
        --carousel-transition: 350ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }

      .carousel__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding: 0 4px;
      }

      .carousel__title {
        margin: 0;
        font-size: 1.375rem;
        font-weight: 600;
        color: var(--sys-on-surface);
        letter-spacing: -0.01em;
      }

      .carousel__controls {
        display: flex;
        gap: 4px;
        opacity: 0.8;
        transition: opacity 200ms ease;
      }

      .carousel__controls:hover {
        opacity: 1;
      }

      .carousel__control {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--sys-surface-container-high);
        color: var(--sys-on-surface);
        border: 1px solid var(--sys-outline-variant);
        transition: all 200ms ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

        &:hover:not(:disabled) {
          background: var(--sys-primary-container);
          color: var(--sys-on-primary-container);
          border-color: var(--sys-primary);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        &:disabled {
          opacity: 0.3;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }

      .carousel__container {
        overflow: hidden;
        width: 100%;
        border-radius: var(--carousel-radius);
        position: relative;
      }

      .carousel__track {
        display: flex;
        gap: var(--carousel-gap);
        transition: transform var(--carousel-transition);
        will-change: transform;
      }

      .carousel__dots {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-top: 20px;
        padding: 0 4px;
      }

      .carousel__dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        border: none;
        background: var(--sys-outline-variant);
        cursor: pointer;
        transition: all 200ms ease;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          border-radius: 50%;
          background: transparent;
          transition: background 200ms ease;
        }

        &:hover::after {
          background: rgba(0, 0, 0, 0.1);
        }

        &--active {
          background: var(--sys-primary);
          transform: scale(1.2);
        }

        &:hover:not(&--active) {
          background: var(--sys-on-surface-variant);
          transform: scale(1.1);
        }
      }

      @media (max-width: 768px) {
        .carousel__header {
          margin-bottom: 16px;
        }

        .carousel__title {
          font-size: 1.25rem;
        }

        .carousel__control {
          width: 36px;
          height: 36px;

          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
        }

        .carousel__track {
          gap: 12px;
        }

        .carousel {
          --carousel-gap: 12px;
        }
      }
    `,
  ],
})
export class CarouselComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container', { static: false })
  container!: ElementRef<HTMLElement>;
  @ViewChild('track', { static: false }) track!: ElementRef<HTMLElement>;

  public readonly title = input<string>('');
  public readonly itemWidth = input<number>(280);
  public readonly itemsToShow = input<number>(4);
  public readonly showDots = input<boolean>(false);
  public readonly autoPlay = input<boolean>(false);
  public readonly autoPlayInterval = input<number>(3000);

  public readonly slideEvent = output<number>();

  private readonly currentIndex = signal(0);
  public readonly translateX = signal(0);
  public readonly totalItems = signal(0);

  private resizeObserver?: ResizeObserver;
  private autoPlayTimer?: number;

  public readonly canScrollLeft = computed(() => this.currentIndex() > 0);
  public readonly canScrollRight = computed(() => {
    const maxIndex = Math.max(0, this.totalItems() - this.itemsToShow());
    return this.currentIndex() < maxIndex;
  });

  public readonly currentDot = computed(() =>
    Math.floor(this.currentIndex() / this.itemsToShow())
  );

  public readonly dots = computed(() => {
    const totalDots = Math.ceil(this.totalItems() / this.itemsToShow());
    return Array(Math.max(0, totalDots)).fill(0);
  });

  ngAfterViewInit(): void {
    this.updateItemCount();
    this.setupResizeObserver();
    if (this.autoPlay()) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
    }
  }

  private setupResizeObserver(): void {
    if (!this.container?.nativeElement) return;

    this.resizeObserver = new ResizeObserver(() => {
      this.updateItemCount();
    });

    this.resizeObserver.observe(this.container.nativeElement);
  }

  private updateItemCount(): void {
    if (!this.track?.nativeElement) return;

    const items = this.track.nativeElement.children.length;
    this.totalItems.set(items);

    const maxIndex = Math.max(0, items - this.itemsToShow());
    if (this.currentIndex() > maxIndex) {
      this.goToIndex(maxIndex);
    }
  }

  private startAutoPlay(): void {
    this.autoPlayTimer = window.setInterval(() => {
      if (this.canScrollRight()) {
        this.scrollRight();
      } else {
        this.goToIndex(0);
      }
    }, this.autoPlayInterval());
  }

  public scrollLeft(): void {
    if (!this.canScrollLeft()) return;

    const newIndex = Math.max(0, this.currentIndex() - this.itemsToShow());
    this.goToIndex(newIndex);
  }

  public scrollRight(): void {
    if (!this.canScrollRight()) return;

    const maxIndex = Math.max(0, this.totalItems() - this.itemsToShow());
    const newIndex = Math.min(
      maxIndex,
      this.currentIndex() + this.itemsToShow()
    );
    this.goToIndex(newIndex);
  }

  public goToSlide(dotIndex: number): void {
    const newIndex = dotIndex * this.itemsToShow();
    const maxIndex = Math.max(0, this.totalItems() - this.itemsToShow());
    const clampedIndex = Math.min(newIndex, maxIndex);
    this.goToIndex(clampedIndex);
  }

  private goToIndex(index: number): void {
    this.currentIndex.set(index);
    const gap = 16;
    const translateValue = -(index * (this.itemWidth() + gap));
    this.translateX.set(translateValue);
    this.slideEvent.emit(index);
  }
}
