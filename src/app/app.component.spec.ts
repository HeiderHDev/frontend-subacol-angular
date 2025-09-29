import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app.component';
import { LoadingService } from '@core/services/loading.service';

class LoadingServiceStub {
  private readonly subj = new BehaviorSubject<boolean>(false);
  isLoading() {
    return this.subj.asObservable();
  }

  setLoading(v: boolean) {
    this.subj.next(v);
  }
}

describe('AppComponent (AAA)', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let loadingStub: LoadingServiceStub;

  beforeEach(async () => {
    loadingStub = new LoadingServiceStub();

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: LoadingService, useValue: loadingStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to LoadingService and update `loading` to true', () => {
    // Arrange
    expect(component.loading).toBeFalse();

    // Act
    loadingStub.setLoading(true);

    // Assert
    fixture.detectChanges();
    expect(component.loading).toBeTrue();
  });

  it('should switch `loading` back to false when service emits false', () => {
    // Arrange
    loadingStub.setLoading(true);
    fixture.detectChanges();
    expect(component.loading).toBeTrue();

    // Act
    loadingStub.setLoading(false);

    // Assert
    fixture.detectChanges();
    expect(component.loading).toBeFalse();
  });
});
