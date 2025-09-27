import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

class LoadingServiceTestBuilder {
  public build(): LoadingService {
    TestBed.configureTestingModule({
      providers: [LoadingService],
    });

    return TestBed.inject(LoadingService);
  }
}

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    // Arrange
    const builder = new LoadingServiceTestBuilder();
    service = builder.build();
  });

  it('should be created', () => {
    // Assert
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should initialize with isLoading$ as false', () => {
      // Arrange
      let currentValue: boolean;

      // Act
      service.isLoading().subscribe((value) => (currentValue = value));

      // Assert
      expect(currentValue!).toBe(false);
    });

    it('should have isLoading$ BehaviorSubject with initial false value', () => {
      // Arrange & Act
      const initialValue = service.isLoading$.value;

      // Assert
      expect(initialValue).toBe(false);
    });
  });

  describe('show()', () => {
    it('should set isLoading$ to true on first call', () => {
      // Arrange
      let currentValue: boolean;
      service.isLoading().subscribe((value) => (currentValue = value));

      // Act
      service.show();

      // Assert
      expect(currentValue!).toBe(true);
    });

    it('should keep isLoading$ true on multiple calls', () => {
      // Arrange
      let currentValue: boolean;
      service.isLoading().subscribe((value) => (currentValue = value));

      // Act
      service.show();
      service.show();
      service.show();

      // Assert
      expect(currentValue!).toBe(true);
    });
  });

  describe('hide()', () => {
    it('should set isLoading$ to false when no pending requests', () => {
      // Arrange
      service.show();
      let currentValue: boolean;
      service.isLoading().subscribe((value) => (currentValue = value));

      // Act
      service.hide();

      // Assert
      expect(currentValue!).toBe(false);
    });

    it('should keep isLoading$ true when there are pending requests', () => {
      // Arrange
      service.show();
      service.show();
      let currentValue: boolean;
      service.isLoading().subscribe((value) => (currentValue = value));

      // Act
      service.hide();

      // Assert
      expect(currentValue!).toBe(true);
    });

    it('should handle hide() calls when no show() was called', () => {
      // Arrange
      let currentValue: boolean;
      service.isLoading().subscribe((value) => (currentValue = value));

      // Act
      service.hide();

      // Assert
      expect(currentValue!).toBe(false);
    });

    it('should not go below zero requests', () => {
      // Arrange
      let currentValue: boolean;
      service.isLoading().subscribe((value) => (currentValue = value));

      // Act
      service.hide();
      service.hide();
      service.hide();

      // Assert
      expect(currentValue!).toBe(false);
    });
  });

  describe('isLoading()', () => {
    it('should return an Observable', () => {
      // Act
      const result = service.isLoading();

      // Assert
      expect(result).toBeDefined();
      expect(typeof result.subscribe).toBe('function');
    });

    it('should return different instance than BehaviorSubject', () => {
      // Act
      const observable = service.isLoading();

      // Assert
      expect(observable).not.toBe(service.isLoading$);
    });
  });

  describe('request counter behavior', () => {
    it('should handle balanced show/hide calls correctly', () => {
      // Arrange
      let currentValue: boolean;
      service.isLoading().subscribe((value) => (currentValue = value));

      // Act & Assert sequence
      service.show();
      expect(currentValue!).toBe(true);

      service.show();
      expect(currentValue!).toBe(true);

      service.hide();
      expect(currentValue!).toBe(true);

      service.hide();
      expect(currentValue!).toBe(false);
    });

    it('should handle complex show/hide sequence', () => {
      // Arrange
      let currentValue: boolean;
      service.isLoading().subscribe((value) => (currentValue = value));

      // Act & Assert
      // Start with 3 requests
      service.show();
      service.show();
      service.show();
      expect(currentValue!).toBe(true);

      // Hide 2, should still be loading
      service.hide();
      service.hide();
      expect(currentValue!).toBe(true);

      // Hide last one, should stop loading
      service.hide();
      expect(currentValue!).toBe(false);
    });
  });

  describe('observable emissions', () => {
    it('should emit true when first request starts', () => {
      // Arrange
      const emissions: boolean[] = [];
      service.isLoading().subscribe((value) => emissions.push(value));

      // Act
      service.show();

      // Assert
      expect(emissions).toEqual([false, true]);
    });

    it('should emit false when last request ends', () => {
      // Arrange
      const emissions: boolean[] = [];
      service.isLoading().subscribe((value) => emissions.push(value));

      // Act
      service.show();
      service.hide();

      // Assert
      expect(emissions).toEqual([false, true, false]);
    });

    it('should not emit duplicate values', () => {
      // Arrange
      const emissions: boolean[] = [];
      service.isLoading().subscribe((value) => emissions.push(value));

      // Act
      service.show();
      service.show(); // Should not emit again
      service.hide();
      service.hide(); // Should emit false

      // Assert
      expect(emissions).toEqual([false, true, false]);
    });
  });
});
